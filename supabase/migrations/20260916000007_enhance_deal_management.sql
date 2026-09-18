-- Migration: 20260916000007_enhance_deal_management.sql
-- Description: Enhances the deals table with sequential numbering, status, priority, currency, closure tracking, and stage synchronization triggers.

-- 1. Create Deal Status and Priority Enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_status') THEN
        CREATE TYPE public.deal_status AS ENUM ('OPEN', 'WON', 'LOST');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_priority') THEN
        CREATE TYPE public.deal_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;
END $$;

-- 2. Extend deal_stage enum values if needed
DO $$
BEGIN
    ALTER TYPE public.deal_stage ADD VALUE IF NOT EXISTS 'NEW';
    ALTER TYPE public.deal_stage ADD VALUE IF NOT EXISTS 'QUALIFICATION';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create Sequence for Deal Number Generation
CREATE SEQUENCE IF NOT EXISTS public.deal_number_seq START WITH 1 INCREMENT BY 1;

-- 4. Function to generate sequential human-readable deal number (e.g. DEAL-000001)
CREATE OR REPLACE FUNCTION public.generate_deal_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_val BIGINT;
    formatted_num TEXT;
BEGIN
    next_val := nextval('public.deal_number_seq');
    formatted_num := 'DEAL-' || LPAD(next_val::TEXT, 6, '0');
    RETURN formatted_num;
END;
$$;

-- 5. Add columns to public.deals if missing
DO $$
BEGIN
    -- deal_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'deal_number') THEN
        ALTER TABLE public.deals ADD COLUMN deal_number VARCHAR(30) UNIQUE;
    END IF;

    -- description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'description') THEN
        ALTER TABLE public.deals ADD COLUMN description TEXT;
    END IF;

    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'status') THEN
        ALTER TABLE public.deals ADD COLUMN status public.deal_status NOT NULL DEFAULT 'OPEN';
    END IF;

    -- priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'priority') THEN
        ALTER TABLE public.deals ADD COLUMN priority public.deal_priority NOT NULL DEFAULT 'MEDIUM';
    END IF;

    -- value
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'value') THEN
        ALTER TABLE public.deals ADD COLUMN value NUMERIC(15, 2) NOT NULL DEFAULT 0.00;
    END IF;

    -- currency
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'currency') THEN
        ALTER TABLE public.deals ADD COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'USD';
    END IF;

    -- actual_close_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'actual_close_date') THEN
        ALTER TABLE public.deals ADD COLUMN actual_close_date DATE;
    END IF;

    -- lost_reason
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'lost_reason') THEN
        ALTER TABLE public.deals ADD COLUMN lost_reason TEXT;
    END IF;

    -- won_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'won_at') THEN
        ALTER TABLE public.deals ADD COLUMN won_at TIMESTAMPTZ;
    END IF;

    -- lost_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'lost_at') THEN
        ALTER TABLE public.deals ADD COLUMN lost_at TIMESTAMPTZ;
    END IF;
END $$;

-- 6. Trigger to automatically generate deal_number before insert if null
CREATE OR REPLACE FUNCTION public.set_deal_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.deal_number IS NULL OR NEW.deal_number = '' THEN
        NEW.deal_number := public.generate_deal_number();
    END IF;

    -- Sync value and amount
    IF (NEW.value IS NULL OR NEW.value = 0) AND NEW.amount IS NOT NULL AND NEW.amount > 0 THEN
        NEW.value := NEW.amount;
    ELSIF (NEW.amount IS NULL OR NEW.amount = 0) AND NEW.value IS NOT NULL AND NEW.value > 0 THEN
        NEW.amount := NEW.value;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_deal_number ON public.deals;
CREATE TRIGGER trg_set_deal_number
    BEFORE INSERT ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION public.set_deal_number();

-- 7. Trigger to automatically synchronize deal stage, status, and closure dates
CREATE OR REPLACE FUNCTION public.sync_deal_closure_state()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Handle closure to WON
    IF NEW.stage = 'CLOSED_WON' THEN
        NEW.status := 'WON';
        IF NEW.won_at IS NULL THEN
            NEW.won_at := timezone('utc'::text, now());
        END IF;
        IF NEW.actual_close_date IS NULL THEN
            NEW.actual_close_date := CURRENT_DATE;
        END IF;
        NEW.lost_at := NULL;
        NEW.lost_reason := NULL;
    -- Handle closure to LOST
    ELSIF NEW.stage = 'CLOSED_LOST' THEN
        NEW.status := 'LOST';
        IF NEW.lost_at IS NULL THEN
            NEW.lost_at := timezone('utc'::text, now());
        END IF;
        IF NEW.actual_close_date IS NULL THEN
            NEW.actual_close_date := CURRENT_DATE;
        END IF;
        NEW.won_at := NULL;
    -- Handle active/open stages
    ELSE
        NEW.status := 'OPEN';
        NEW.won_at := NULL;
        NEW.lost_at := NULL;
        NEW.actual_close_date := NULL;
        NEW.lost_reason := NULL;
    END IF;

    -- Keep value and amount in sync
    IF NEW.value IS NOT NULL THEN
        NEW.amount := NEW.value;
    ELSIF NEW.amount IS NOT NULL THEN
        NEW.value := NEW.amount;
    END IF;

    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_deal_closure_state ON public.deals;
CREATE TRIGGER trg_sync_deal_closure_state
    BEFORE INSERT OR UPDATE ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_deal_closure_state();

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_deals_deal_number ON public.deals(deal_number);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON public.deals(priority);
CREATE INDEX IF NOT EXISTS idx_deals_currency ON public.deals(currency);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON public.deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_deals_search ON public.deals(title, deal_number);
