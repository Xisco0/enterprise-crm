-- Migration: 20260916000006_enhance_lead_management.sql
-- Description: Enhances the leads entity with sequential lead numbering, lead types, priorities, atomic conversion RPC, and transition triggers.

-- 1. Create Lead Type and Priority Enums if not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_type') THEN
        CREATE TYPE public.lead_type AS ENUM ('INDIVIDUAL', 'BUSINESS');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_priority') THEN
        CREATE TYPE public.lead_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;
END $$;

-- 2. Extend lead_status and lead_source enums if needed
DO $$
BEGIN
    ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'UNQUALIFIED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'SOCIAL_MEDIA';
    ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'ADVERTISEMENT';
    ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'PHONE_CALL';
    ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'WALK_IN';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create Sequence for Lead Number Generation
CREATE SEQUENCE IF NOT EXISTS public.lead_number_seq START WITH 1 INCREMENT BY 1;

-- 4. Function to generate sequential human-readable lead number (e.g. LEAD-000001)
CREATE OR REPLACE FUNCTION public.generate_lead_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_val BIGINT;
    formatted_num TEXT;
BEGIN
    next_val := nextval('public.lead_number_seq');
    formatted_num := 'LEAD-' || LPAD(next_val::TEXT, 6, '0');
    RETURN formatted_num;
END;
$$;

-- 5. Add columns to public.leads if missing
DO $$
BEGIN
    -- lead_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_number') THEN
        ALTER TABLE public.leads ADD COLUMN lead_number VARCHAR(30) UNIQUE;
    END IF;

    -- lead_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_type') THEN
        ALTER TABLE public.leads ADD COLUMN lead_type public.lead_type NOT NULL DEFAULT 'BUSINESS';
    END IF;

    -- priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'priority') THEN
        ALTER TABLE public.leads ADD COLUMN priority public.lead_priority NOT NULL DEFAULT 'MEDIUM';
    END IF;

    -- company_name (standardization with company)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'company_name') THEN
        ALTER TABLE public.leads ADD COLUMN company_name VARCHAR(255);
    END IF;
END $$;

-- 6. Trigger to automatically generate lead_number before insert if null
CREATE OR REPLACE FUNCTION public.set_lead_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.lead_number IS NULL OR NEW.lead_number = '' THEN
        NEW.lead_number := public.generate_lead_number();
    END IF;

    IF NEW.company_name IS NULL AND NEW.company IS NOT NULL THEN
        NEW.company_name := NEW.company;
    ELSIF NEW.company IS NULL AND NEW.company_name IS NOT NULL THEN
        NEW.company := NEW.company_name;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_lead_number ON public.leads;
CREATE TRIGGER trg_set_lead_number
    BEFORE INSERT ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.set_lead_number();

-- 7. Trigger to prevent invalid transitions on converted leads
CREATE OR REPLACE FUNCTION public.prevent_invalid_lead_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status = 'CONVERTED' AND NEW.status != 'CONVERTED' THEN
        RAISE EXCEPTION 'Invalid Transition: Converted leads cannot be reopened as active leads.'
            USING ERRCODE = '22023';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_invalid_lead_transition ON public.leads;
CREATE TRIGGER trg_prevent_invalid_lead_transition
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_invalid_lead_transition();

-- 8. Atomic Conversion Engine: convert_lead_to_customer
CREATE OR REPLACE FUNCTION public.convert_lead_to_customer(
    p_lead_id UUID,
    p_caller_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lead RECORD;
    v_customer_id UUID;
    v_customer_number TEXT;
    v_is_existing BOOLEAN := FALSE;
BEGIN
    -- 1. Fetch and lock lead record
    SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead not found with ID %', p_lead_id;
    END IF;

    IF v_lead.status = 'CONVERTED' THEN
        RAISE EXCEPTION 'This lead has already been converted to a customer (Customer ID: %)', v_lead.converted_customer_id;
    END IF;

    -- 2. Check if an active matching customer already exists by email
    IF v_lead.email IS NOT NULL AND v_lead.email != '' THEN
        SELECT id, customer_number INTO v_customer_id, v_customer_number
        FROM public.customers
        WHERE LOWER(email) = LOWER(v_lead.email) AND status != 'ARCHIVED'
        LIMIT 1;

        IF FOUND THEN
            v_is_existing := TRUE;
        END IF;
    END IF;

    -- 3. If no matching customer found, create a new customer record
    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (
            customer_number,
            customer_type,
            first_name,
            last_name,
            name,
            company_name,
            job_title,
            email,
            phone,
            status,
            lifetime_value,
            assigned_to,
            created_by,
            notes
        ) VALUES (
            public.generate_customer_number(),
            v_lead.lead_type::TEXT::public.customer_type,
            v_lead.first_name,
            v_lead.last_name,
            TRIM(v_lead.first_name || ' ' || v_lead.last_name),
            COALESCE(v_lead.company_name, v_lead.company),
            v_lead.job_title,
            v_lead.email,
            v_lead.phone,
            'ACTIVE',
            COALESCE(v_lead.estimated_value, 0.00),
            COALESCE(v_lead.assigned_to, p_caller_id),
            p_caller_id,
            'Converted from ' || v_lead.lead_number || CASE WHEN v_lead.notes IS NOT NULL THEN E'\n\nLead Notes: ' || v_lead.notes ELSE '' END
        )
        RETURNING id, customer_number INTO v_customer_id, v_customer_number;
    END IF;

    -- 4. Mark the lead as CONVERTED and link the customer
    UPDATE public.leads
    SET status = 'CONVERTED',
        converted_at = timezone('utc'::text, now()),
        converted_customer_id = v_customer_id,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_lead_id;

    -- 5. Return success payload
    RETURN jsonb_build_object(
        'success', true,
        'customer_id', v_customer_id,
        'customer_number', v_customer_number,
        'is_existing_customer', v_is_existing,
        'message', CASE WHEN v_is_existing THEN 'Lead linked to existing customer account ' || v_customer_number ELSE 'Successfully converted lead into new customer ' || v_customer_number END
    );
END;
$$;

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_leads_lead_number ON public.leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON public.leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_search ON public.leads(first_name, last_name, company_name, email, phone);
