-- Migration: 202609160000041_extend_all_enums.sql
-- Description: Extends all database enums in a dedicated transaction so that new enum values
--              are fully committed before subsequent tables, indexes, and triggers reference them.

-- 1. Customer Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_type') THEN
        CREATE TYPE public.customer_type AS ENUM ('INDIVIDUAL', 'BUSINESS');
    END IF;
END $$;

DO $$ BEGIN
    ALTER TYPE public.customer_status ADD VALUE IF NOT EXISTS 'ARCHIVED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Lead Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_type') THEN
        CREATE TYPE public.lead_type AS ENUM ('INDIVIDUAL', 'BUSINESS');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_priority') THEN
        CREATE TYPE public.lead_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;
END $$;

DO $$ BEGIN
    ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'UNQUALIFIED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'SOCIAL_MEDIA';
    ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'ADVERTISEMENT';
    ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'PHONE_CALL';
    ALTER TYPE public.lead_source ADD VALUE IF NOT EXISTS 'WALK_IN';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Deal Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_status') THEN
        CREATE TYPE public.deal_status AS ENUM ('OPEN', 'WON', 'LOST');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_priority') THEN
        CREATE TYPE public.deal_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_currency') THEN
        CREATE TYPE public.deal_currency AS ENUM ('USD', 'NGN', 'EUR', 'GBP');
    END IF;
END $$;

DO $$ BEGIN
    ALTER TYPE public.deal_stage ADD VALUE IF NOT EXISTS 'NEW';
    ALTER TYPE public.deal_stage ADD VALUE IF NOT EXISTS 'QUALIFICATION';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Interaction Enums
DO $$ BEGIN
    ALTER TYPE public.interaction_type ADD VALUE IF NOT EXISTS 'OTHER';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Task Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type') THEN
        CREATE TYPE public.task_type AS ENUM ('CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'TODO', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE public.task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE public.task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    END IF;
END $$;
