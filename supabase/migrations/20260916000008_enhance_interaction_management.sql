-- Migration: 20260916000008_enhance_interaction_management.sql
-- Description: Enhances the interactions table with sequential numbering, description, duration, outcome, constraints, triggers, and RLS policies.

-- 1. Extend interaction_type enum if needed
DO $$
BEGIN
    ALTER TYPE public.interaction_type ADD VALUE IF NOT EXISTS 'OTHER';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create Sequence for Interaction Number Generation
CREATE SEQUENCE IF NOT EXISTS public.interaction_number_seq START WITH 1 INCREMENT BY 1;

-- 3. Function to generate sequential human-readable interaction number (e.g. INT-000001)
CREATE OR REPLACE FUNCTION public.generate_interaction_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_val BIGINT;
    formatted_num TEXT;
BEGIN
    next_val := nextval('public.interaction_number_seq');
    formatted_num := 'INT-' || LPAD(next_val::TEXT, 6, '0');
    RETURN formatted_num;
END;
$$;

-- 4. Add columns to public.interactions if missing
DO $$
BEGIN
    -- interaction_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interactions' AND column_name = 'interaction_number') THEN
        ALTER TABLE public.interactions ADD COLUMN interaction_number VARCHAR(30) UNIQUE;
    END IF;

    -- description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interactions' AND column_name = 'description') THEN
        ALTER TABLE public.interactions ADD COLUMN description TEXT;
    END IF;

    -- interaction_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interactions' AND column_name = 'interaction_at') THEN
        ALTER TABLE public.interactions ADD COLUMN interaction_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
    END IF;

    -- duration_minutes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interactions' AND column_name = 'duration_minutes') THEN
        ALTER TABLE public.interactions ADD COLUMN duration_minutes INTEGER CHECK (duration_minutes >= 0);
    END IF;

    -- outcome
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interactions' AND column_name = 'outcome') THEN
        ALTER TABLE public.interactions ADD COLUMN outcome VARCHAR(255);
    END IF;

    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interactions' AND column_name = 'updated_at') THEN
        ALTER TABLE public.interactions ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- 5. Trigger to automatically generate interaction_number and sync description/notes
CREATE OR REPLACE FUNCTION public.set_interaction_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.interaction_number IS NULL OR NEW.interaction_number = '' THEN
        NEW.interaction_number := public.generate_interaction_number();
    END IF;

    -- Sync description and notes
    IF (NEW.description IS NULL OR NEW.description = '') AND NEW.notes IS NOT NULL THEN
        NEW.description := NEW.notes;
    ELSIF (NEW.notes IS NULL OR NEW.notes = '') AND NEW.description IS NOT NULL THEN
        NEW.notes := NEW.description;
    END IF;

    -- Sync interaction_at and performed_at
    IF NEW.interaction_at IS NULL AND NEW.performed_at IS NOT NULL THEN
        NEW.interaction_at := NEW.performed_at;
    ELSIF NEW.performed_at IS NULL AND NEW.interaction_at IS NOT NULL THEN
        NEW.performed_at := NEW.interaction_at;
    END IF;

    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_interaction_defaults ON public.interactions;
CREATE TRIGGER trg_set_interaction_defaults
    BEFORE INSERT OR UPDATE ON public.interactions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_interaction_defaults();

-- 6. Add non-orphan constraint (must have at least one relational entity)
DO $$
BEGIN
    ALTER TABLE public.interactions DROP CONSTRAINT IF EXISTS chk_interaction_has_relation;
    ALTER TABLE public.interactions ADD CONSTRAINT chk_interaction_has_relation
        CHECK (customer_id IS NOT NULL OR lead_id IS NOT NULL OR deal_id IS NOT NULL);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_interactions_number ON public.interactions(interaction_number);
CREATE INDEX IF NOT EXISTS idx_interactions_customer_id ON public.interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON public.interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_deal_id ON public.interactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_interactions_performed_by ON public.interactions(performed_by);
CREATE INDEX IF NOT EXISTS idx_interactions_interaction_at ON public.interactions(interaction_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON public.interactions(type);

-- 8. Enhanced Row Level Security (RLS) Policies
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to interactions" ON public.interactions;
CREATE POLICY "Admins have full access to interactions"
    ON public.interactions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'ADMIN'
            AND profiles.status = 'ACTIVE'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'ADMIN'
            AND profiles.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Staff can view interactions of accessible records" ON public.interactions;
CREATE POLICY "Staff can view interactions of accessible records"
    ON public.interactions
    FOR SELECT
    TO authenticated
    USING (
        performed_by = auth.uid()
        OR customer_id IN (SELECT id FROM public.customers WHERE assigned_to = auth.uid() OR created_by = auth.uid())
        OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid() OR created_by = auth.uid())
        OR deal_id IN (SELECT id FROM public.deals WHERE assigned_to = auth.uid() OR created_by = auth.uid())
    );

DROP POLICY IF EXISTS "Staff can insert interactions for accessible records" ON public.interactions;
CREATE POLICY "Staff can insert interactions for accessible records"
    ON public.interactions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        performed_by = auth.uid()
        AND (
            customer_id IS NULL OR customer_id IN (SELECT id FROM public.customers WHERE assigned_to = auth.uid() OR created_by = auth.uid())
        )
        AND (
            lead_id IS NULL OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid() OR created_by = auth.uid())
        )
        AND (
            deal_id IS NULL OR deal_id IN (SELECT id FROM public.deals WHERE assigned_to = auth.uid() OR created_by = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Staff can update own interactions" ON public.interactions;
CREATE POLICY "Staff can update own interactions"
    ON public.interactions
    FOR UPDATE
    TO authenticated
    USING (performed_by = auth.uid())
    WITH CHECK (performed_by = auth.uid());
