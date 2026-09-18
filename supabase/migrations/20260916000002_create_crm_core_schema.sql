-- Migration: 20260916000002_create_crm_core_schema.sql
-- Description: Core CRM Entities (Customers, Leads, Deals, Interactions, Tasks, Notifications, Audit Logs).

-- 1. Create Additional Enums
CREATE TYPE public.customer_type AS ENUM ('INDIVIDUAL', 'BUSINESS');
CREATE TYPE public.customer_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'CHURNED', 'PROSPECT');
CREATE TYPE public.lead_type AS ENUM ('INDIVIDUAL', 'BUSINESS');
CREATE TYPE public.lead_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE public.lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'PROPOSAL', 'LOST', 'CONVERTED');
CREATE TYPE public.lead_source AS ENUM ('WEBSITE', 'REFERRAL', 'COLD_CALL', 'LINKEDIN', 'CAMPAIGN', 'EVENT', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'PHONE_CALL', 'WALK_IN', 'OTHER');
CREATE TYPE public.deal_stage AS ENUM ('NEW', 'QUALIFICATION', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');
CREATE TYPE public.deal_status AS ENUM ('OPEN', 'WON', 'LOST');
CREATE TYPE public.deal_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE public.deal_currency AS ENUM ('USD', 'NGN', 'EUR', 'GBP');
CREATE TYPE public.interaction_type AS ENUM ('CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER', 'TASK_UPDATE');
CREATE TYPE public.task_type AS ENUM ('CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'TODO', 'OTHER');
CREATE TYPE public.task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE public.task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE public.notification_type AS ENUM ('ASSIGNMENT', 'TASK_DUE', 'DEAL_UPDATE', 'LEAD_NEW', 'SYSTEM');

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    industry VARCHAR(100),
    status public.customer_status NOT NULL DEFAULT 'ACTIVE',
    lifetime_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_country VARCHAR(100) DEFAULT 'United States',
    address_zip VARCHAR(20),
    notes TEXT,
    assigned_to UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    job_title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    status public.lead_status NOT NULL DEFAULT 'NEW',
    source public.lead_source NOT NULL DEFAULT 'WEBSITE',
    estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100) DEFAULT 50,
    notes TEXT,
    assigned_to UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    converted_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Deals / Pipeline Table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    stage public.deal_stage NOT NULL DEFAULT 'DISCOVERY',
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    probability INTEGER CHECK (probability >= 0 AND probability <= 100) DEFAULT 20,
    expected_close_date DATE,
    closed_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Interactions / Activity Log Table
CREATE TABLE IF NOT EXISTS public.interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    type public.interaction_type NOT NULL DEFAULT 'NOTE',
    subject VARCHAR(255) NOT NULL,
    notes TEXT NOT NULL,
    performed_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tasks / Follow-ups Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority public.task_priority NOT NULL DEFAULT 'MEDIUM',
    status public.task_status NOT NULL DEFAULT 'PENDING',
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    assigned_to UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type public.notification_type NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Audit Logs Table (Compliance & Activity Auditing)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_customers_assigned_to ON public.customers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON public.deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_customer_id ON public.deals(customer_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_interactions_customer_id ON public.interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON public.interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_performed_by ON public.interactions(performed_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = FALSE;

-- 10. Enable Updated At Triggers
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
