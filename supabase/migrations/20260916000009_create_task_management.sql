-- ============================================================================
-- Migration: 20260916000009_create_task_management.sql
-- Description: Task & Follow-up Management System with sequential numbering,
--              status synchronization triggers, and Row Level Security (RLS).
-- ============================================================================

-- 1. Create Enums if they do not exist
DO $$ BEGIN
    CREATE TYPE public.task_type AS ENUM ('CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'TODO', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Sequence for Task Numbers
CREATE SEQUENCE IF NOT EXISTS public.task_number_seq START WITH 1 INCREMENT BY 1;

-- 3. Function to generate sequential task reference numbers
CREATE OR REPLACE FUNCTION public.generate_task_number()
RETURNS text AS $$
BEGIN
    RETURN 'TASK-' || LPAD(nextval('public.task_number_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Create Tasks Table (or alter if exists)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_number VARCHAR(32) NOT NULL UNIQUE DEFAULT public.generate_task_number(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type public.task_type NOT NULL DEFAULT 'TODO',
    status public.task_status NOT NULL DEFAULT 'PENDING',
    priority public.task_priority NOT NULL DEFAULT 'MEDIUM',
    assigned_to UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    due_date DATE,
    due_time TIME,
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was already created in earlier base migrations
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_number VARCHAR(32) UNIQUE DEFAULT public.generate_task_number();
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_type public.task_type DEFAULT 'TODO';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_time TIME;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 5. Trigger Function: Task Defaults & Sequential Numbering
CREATE OR REPLACE FUNCTION public.trg_set_task_defaults()
RETURNS trigger AS $$
BEGIN
    IF NEW.task_number IS NULL OR NEW.task_number = '' THEN
        NEW.task_number := public.generate_task_number();
    END IF;

    -- Compute due_at timestamp if due_date is provided
    IF NEW.due_date IS NOT NULL THEN
        IF NEW.due_time IS NOT NULL THEN
            NEW.due_at := ((NEW.due_date::date)::text || ' ' || NEW.due_time::text)::timestamptz;
        ELSE
            NEW.due_at := ((NEW.due_date::date)::text || ' 23:59:59')::timestamptz;
        END IF;
    ELSE
        NEW.due_at := NULL;
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_task_defaults ON public.tasks;
CREATE TRIGGER trg_task_defaults
    BEFORE INSERT OR UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_set_task_defaults();

-- 6. Trigger Function: Status Transitions & Completion Sync
CREATE OR REPLACE FUNCTION public.trg_sync_task_status()
RETURNS trigger AS $$
BEGIN
    -- Transition to COMPLETED
    IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
        IF NEW.completed_at IS NULL THEN
            NEW.completed_at := now();
        END IF;
    -- Transition away from COMPLETED
    ELSIF NEW.status != 'COMPLETED' AND (OLD.status = 'COMPLETED') THEN
        NEW.completed_at := NULL;
        NEW.completed_by := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_task_status ON public.tasks;
CREATE TRIGGER trg_sync_task_status
    BEFORE INSERT OR UPDATE OF status ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_sync_task_status();

-- 7. Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_tasks_number ON public.tasks(task_number);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON public.tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON public.tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON public.tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON public.tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON public.tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- 8. Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_full_access_tasks" ON public.tasks;
DROP POLICY IF EXISTS "staff_select_tasks" ON public.tasks;
DROP POLICY IF EXISTS "staff_insert_tasks" ON public.tasks;
DROP POLICY IF EXISTS "staff_update_tasks" ON public.tasks;
DROP POLICY IF EXISTS "staff_delete_tasks" ON public.tasks;

-- ADMIN: full visibility and control
CREATE POLICY "admin_full_access_tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
);

-- STAFF: select tasks assigned to them, created by them, or linked to accessible records
CREATE POLICY "staff_select_tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR customer_id IN (
        SELECT id FROM public.customers
        WHERE assigned_to = auth.uid() OR created_by = auth.uid()
    )
    OR lead_id IN (
        SELECT id FROM public.leads
        WHERE assigned_to = auth.uid() OR created_by = auth.uid()
    )
    OR deal_id IN (
        SELECT id FROM public.deals
        WHERE assigned_to = auth.uid() OR created_by = auth.uid()
    )
);

-- STAFF: create tasks with self as creator or assignee
CREATE POLICY "staff_insert_tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
);

-- STAFF: update tasks assigned to them or created by them
CREATE POLICY "staff_update_tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
)
WITH CHECK (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
);

-- STAFF: delete tasks only if created by them
CREATE POLICY "staff_delete_tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
    created_by = auth.uid()
);
