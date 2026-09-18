-- Migration: 20260916000005_enhance_customer_management.sql
-- Description: Enhances the customer entity with human-readable sequential customer numbers, customer types, and duplicate prevention.

-- 1. Create Customer Type Enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_type') THEN
        CREATE TYPE public.customer_type AS ENUM ('INDIVIDUAL', 'BUSINESS');
    END IF;
END $$;

-- 2. Alter customer_status enum if needed to ensure ARCHIVED is supported
DO $$
BEGIN
    ALTER TYPE public.customer_status ADD VALUE IF NOT EXISTS 'ARCHIVED';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create Sequence for Customer Number Generation
CREATE SEQUENCE IF NOT EXISTS public.customer_number_seq START WITH 1 INCREMENT BY 1;

-- 4. Function to generate sequential human-readable customer number (e.g. CUS-000001)
CREATE OR REPLACE FUNCTION public.generate_customer_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_val BIGINT;
    formatted_num TEXT;
BEGIN
    next_val := nextval('public.customer_number_seq');
    formatted_num := 'CUS-' || LPAD(next_val::TEXT, 6, '0');
    RETURN formatted_num;
END;
$$;

-- 5. Add columns to public.customers if missing
DO $$
BEGIN
    -- customer_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'customer_number') THEN
        ALTER TABLE public.customers ADD COLUMN customer_number VARCHAR(30) UNIQUE;
    END IF;

    -- customer_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'customer_type') THEN
        ALTER TABLE public.customers ADD COLUMN customer_type public.customer_type NOT NULL DEFAULT 'BUSINESS';
    END IF;

    -- first_name & last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'first_name') THEN
        ALTER TABLE public.customers ADD COLUMN first_name VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_name') THEN
        ALTER TABLE public.customers ADD COLUMN last_name VARCHAR(100);
    END IF;

    -- job_title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'job_title') THEN
        ALTER TABLE public.customers ADD COLUMN job_title VARCHAR(100);
    END IF;
END $$;

-- 6. Trigger to automatically generate customer_number before insert if null
CREATE OR REPLACE FUNCTION public.set_customer_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        NEW.customer_number := public.generate_customer_number();
    END IF;

    -- If first_name / last_name provided, populate name field automatically if empty
    IF (NEW.name IS NULL OR NEW.name = '') AND (NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL) THEN
        NEW.name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_customer_number ON public.customers;
CREATE TRIGGER trg_set_customer_number
    BEFORE INSERT ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.set_customer_number();

-- 7. Case-insensitive duplicate email prevention index on active customers
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_unique_active_email
    ON public.customers (LOWER(email))
    WHERE email IS NOT NULL AND status != 'ARCHIVED';

-- 8. Performance indexes for customer search, filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON public.customers (customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON public.customers (customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_name_search ON public.customers (name, company_name);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers (created_at DESC);
