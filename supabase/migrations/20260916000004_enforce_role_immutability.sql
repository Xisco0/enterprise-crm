-- Migration: 20260916000004_enforce_role_immutability.sql
-- Description: Database-level trigger to strictly prevent role escalation and status manipulation by non-admins.

-- 1. Trigger function to enforce that only ADMIN can modify role or status
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If role or status is being changed
    IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.status IS DISTINCT FROM OLD.status) THEN
        -- Verify if the caller is an active ADMIN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Unauthorized: Only CRM administrators can modify user roles or account statuses.'
                USING ERRCODE = '42501';
        END IF;
    END IF;

    -- Prevent modifying the user_id foreign key linkage
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Immutable: The user_id linkage cannot be modified once established.'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;

-- 2. Attach trigger before update on public.profiles
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_escalation();
