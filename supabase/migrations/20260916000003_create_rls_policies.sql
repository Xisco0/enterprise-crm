-- Migration: 20260916000003_create_rls_policies.sql
-- Description: Comprehensive Row Level Security (RLS) policies for all CRM tables.

-- 1. Enable RLS on all CRM tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- PROFILES POLICIES
-- ==============================================================================

-- Admins have full access to all profiles
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Staff can view all active profiles (required for assigning/collaborating)
CREATE POLICY "Staff can view active profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        status = 'ACTIVE' 
        AND auth.uid() IS NOT NULL
    );

-- Staff can update only their own profile details (excluding role/status elevation)
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid() 
        AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
        AND status = (SELECT status FROM public.profiles WHERE user_id = auth.uid())
    );

-- ==============================================================================
-- CUSTOMERS POLICIES
-- ==============================================================================

-- Admin full access on customers
CREATE POLICY "Admin full access on customers"
    ON public.customers
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Staff can view assigned or created customers
CREATE POLICY "Staff can view assigned or created customers"
    ON public.customers
    FOR SELECT
    TO authenticated
    USING (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    );

-- Staff can insert customers
CREATE POLICY "Staff can insert customers"
    ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_staff() AND (created_by = auth.uid() OR created_by IS NULL)
    );

-- Staff can update assigned or created customers
CREATE POLICY "Staff can update assigned or created customers"
    ON public.customers
    FOR UPDATE
    TO authenticated
    USING (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    )
    WITH CHECK (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    );

-- ==============================================================================
-- LEADS POLICIES
-- ==============================================================================

-- Admin full access on leads
CREATE POLICY "Admin full access on leads"
    ON public.leads
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Staff can view assigned or created leads
CREATE POLICY "Staff can view assigned or created leads"
    ON public.leads
    FOR SELECT
    TO authenticated
    USING (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    );

-- Staff can insert leads
CREATE POLICY "Staff can insert leads"
    ON public.leads
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_staff() AND (created_by = auth.uid() OR created_by IS NULL)
    );

-- Staff can update assigned or created leads
CREATE POLICY "Staff can update assigned or created leads"
    ON public.leads
    FOR UPDATE
    TO authenticated
    USING (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    )
    WITH CHECK (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    );

-- ==============================================================================
-- DEALS POLICIES
-- ==============================================================================

-- Admin full access on deals
CREATE POLICY "Admin full access on deals"
    ON public.deals
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Staff can view assigned or created deals
CREATE POLICY "Staff can view assigned or created deals"
    ON public.deals
    FOR SELECT
    TO authenticated
    USING (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    );

-- Staff can insert deals
CREATE POLICY "Staff can insert deals"
    ON public.deals
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_staff() AND (created_by = auth.uid() OR created_by IS NULL)
    );

-- Staff can update assigned or created deals
CREATE POLICY "Staff can update assigned or created deals"
    ON public.deals
    FOR UPDATE
    TO authenticated
    USING (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    )
    WITH CHECK (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    );

-- ==============================================================================
-- INTERACTIONS POLICIES
-- ==============================================================================

-- Admin full access on interactions
CREATE POLICY "Admin full access on interactions"
    ON public.interactions
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Staff can view their own interactions or interactions on their records
CREATE POLICY "Staff can view relevant interactions"
    ON public.interactions
    FOR SELECT
    TO authenticated
    USING (
        public.is_staff() AND (
            performed_by = auth.uid()
            OR customer_id IN (SELECT id FROM public.customers WHERE assigned_to = auth.uid())
            OR lead_id IN (SELECT id FROM public.leads WHERE assigned_to = auth.uid())
            OR deal_id IN (SELECT id FROM public.deals WHERE assigned_to = auth.uid())
        )
    );

-- Staff can insert interactions
CREATE POLICY "Staff can insert interactions"
    ON public.interactions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_staff() AND performed_by = auth.uid()
    );

-- ==============================================================================
-- TASKS POLICIES
-- ==============================================================================

-- Admin full access on tasks
CREATE POLICY "Admin full access on tasks"
    ON public.tasks
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Staff can view tasks assigned to or created by them
CREATE POLICY "Staff can view assigned or created tasks"
    ON public.tasks
    FOR SELECT
    TO authenticated
    USING (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    );

-- Staff can insert tasks
CREATE POLICY "Staff can insert tasks"
    ON public.tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_staff() AND (created_by = auth.uid() OR created_by IS NULL)
    );

-- Staff can update tasks assigned to them
CREATE POLICY "Staff can update assigned tasks"
    ON public.tasks
    FOR UPDATE
    TO authenticated
    USING (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    )
    WITH CHECK (
        public.is_staff() AND (assigned_to = auth.uid() OR created_by = auth.uid())
    );

-- ==============================================================================
-- NOTIFICATIONS POLICIES
-- ==============================================================================

-- Users can only see and update their own notifications
CREATE POLICY "Users can manage own notifications"
    ON public.notifications
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ==============================================================================
-- AUDIT LOGS POLICIES
-- ==============================================================================

-- Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (public.is_admin());
