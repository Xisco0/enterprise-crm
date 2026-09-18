-- ============================================================================
-- Enterprise CRM: Comprehensive Seed Data Script
-- Safe for execution via Supabase SQL Editor or CLI (`npx supabase db reset`)
-- ============================================================================

-- Ensure pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    admin_uuid UUID := '00000000-0000-0000-0000-000000000001';
    staff1_uuid UUID := '00000000-0000-0000-0000-000000000002';
    staff2_uuid UUID := '00000000-0000-0000-0000-000000000003';

    cust1_id UUID := '11111111-1111-1111-1111-111111111101';
    cust2_id UUID := '11111111-1111-1111-1111-111111111102';
    cust3_id UUID := '11111111-1111-1111-1111-111111111103';
    cust4_id UUID := '11111111-1111-1111-1111-111111111104';

    lead1_id UUID := '22222222-2222-2222-2222-222222222201';
    lead2_id UUID := '22222222-2222-2222-2222-222222222202';
    lead3_id UUID := '22222222-2222-2222-2222-222222222203';
    lead4_id UUID := '22222222-2222-2222-2222-222222222204';
    lead5_id UUID := '22222222-2222-2222-2222-222222222205';

    deal1_id UUID := '33333333-3333-3333-3333-333333333301';
    deal2_id UUID := '33333333-3333-3333-3333-333333333302';
    deal3_id UUID := '33333333-3333-3333-3333-333333333303';
    deal4_id UUID := '33333333-3333-3333-3333-333333333304';
    deal5_id UUID := '33333333-3333-3333-3333-333333333305';
BEGIN
    -- ------------------------------------------------------------------------
    -- 1. AUTH USERS (Default password for all accounts: Password123!)
    -- ------------------------------------------------------------------------
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES 
    (
        '00000000-0000-0000-0000-000000000000', admin_uuid, 'authenticated', 'authenticated',
        'admin@enterprise.com', crypt('Password123!', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"first_name":"Sarah","last_name":"Chen","role":"ADMIN"}',
        now() - INTERVAL '180 days', now()
    ),
    (
        '00000000-0000-0000-0000-000000000000', staff1_uuid, 'authenticated', 'authenticated',
        'marcus.vance@enterprise.com', crypt('Password123!', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"first_name":"Marcus","last_name":"Vance","role":"STAFF"}',
        now() - INTERVAL '90 days', now()
    ),
    (
        '00000000-0000-0000-0000-000000000000', staff2_uuid, 'authenticated', 'authenticated',
        'elena.rostova@enterprise.com', crypt('Password123!', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"first_name":"Elena","last_name":"Rostova","role":"STAFF"}',
        now() - INTERVAL '30 days', now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 2. USER PROFILES
    -- ------------------------------------------------------------------------
    INSERT INTO public.profiles (user_id, first_name, last_name, email, phone, role, status, department, job_title)
    VALUES
        (admin_uuid, 'Sarah', 'Chen', 'admin@enterprise.com', '+1 (555) 100-2001', 'ADMIN', 'ACTIVE', 'Executive Leadership', 'Head of Revenue Operations'),
        (staff1_uuid, 'Marcus', 'Vance', 'marcus.vance@enterprise.com', '+1 (555) 200-3002', 'STAFF', 'ACTIVE', 'Enterprise Sales', 'Senior Account Executive'),
        (staff2_uuid, 'Elena', 'Rostova', 'elena.rostova@enterprise.com', '+1 (555) 300-4003', 'STAFF', 'ACTIVE', 'Mid-Market Sales', 'Sales Representative')
    ON CONFLICT (user_id) DO UPDATE 
    SET role = EXCLUDED.role, status = EXCLUDED.status, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

    -- ------------------------------------------------------------------------
    -- 3. CUSTOMERS
    -- ------------------------------------------------------------------------
    INSERT INTO public.customers (id, customer_number, customer_type, first_name, last_name, name, company_name, email, phone, website, industry, status, lifetime_value, address_street, address_city, address_state, address_zip, address_country, assigned_to, created_by, notes, created_at)
    VALUES
        (cust1_id, 'CUS-000001', 'BUSINESS', 'David', 'Miller', 'David Miller', 'Apex Logistics Global', 'dmiller@apexlogistics.io', '+1 (415) 890-1122', 'https://apexlogistics.io', 'Supply Chain', 'ACTIVE', 128500.00, '450 Mission St', 'San Francisco', 'CA', '94105', 'United States', staff1_uuid, admin_uuid, 'Key enterprise logistics customer. 3-year contract active.', now() - INTERVAL '45 days'),
        (cust2_id, 'CUS-000002', 'BUSINESS', 'Katherine', 'Ward', 'Katherine Ward', 'Vanguard Health Systems', 'kward@vanguardhealth.org', '+1 (617) 450-8899', 'https://vanguardhealth.org', 'Healthcare & Life Sciences', 'ACTIVE', 74200.00, '100 Longwood Ave', 'Boston', 'MA', '02115', 'United States', staff1_uuid, staff1_uuid, 'HIPAA compliant deployment. Quarterly review scheduled next month.', now() - INTERVAL '30 days'),
        (cust3_id, 'CUS-000003', 'BUSINESS', 'Siddharth', 'Patel', 'Siddharth Patel', 'NovaFin Technologies', 'spatel@novafin.com', '+1 (212) 670-3400', 'https://novafin.com', 'Financial Services', 'ACTIVE', 45000.00, '1 Wall St', 'New York', 'NY', '10005', 'United States', staff2_uuid, staff2_uuid, 'FinTech compliance tier. Considering expansion to 50 additional seats.', now() - INTERVAL '15 days'),
        (cust4_id, 'CUS-000004', 'INDIVIDUAL', 'Dr. Alistair', 'Vane', 'Dr. Alistair Vane', NULL, 'alistair.vane@consultancy.org', '+44 20 7946 0912', 'https://vane-advisory.co.uk', 'Management Consulting', 'ACTIVE', 18500.00, '221B Baker Street', 'London', 'Greater London', 'NW1 6XE', 'United Kingdom', staff1_uuid, admin_uuid, 'Strategic advisor on cloud migration. Billed quarterly.', now() - INTERVAL '5 days')
    ON CONFLICT (id) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 4. LEADS
    -- ------------------------------------------------------------------------
    INSERT INTO public.leads (id, lead_number, lead_type, priority, first_name, last_name, company, company_name, job_title, email, phone, status, source, estimated_value, confidence_score, assigned_to, created_by, notes, created_at)
    VALUES
        (lead1_id, 'LEAD-000001', 'BUSINESS', 'HIGH', 'Rachel', 'Adams', 'Beacon Robotics', 'Beacon Robotics', 'VP of Engineering', 'radams@beaconrobotics.com', '+1 (408) 555-7120', 'QUALIFIED', 'WEBSITE', 65000.00, 85, staff1_uuid, admin_uuid, 'Inbound demo request. Evaluated technical requirements on Sept 12.', now() - INTERVAL '20 days'),
        (lead2_id, 'LEAD-000002', 'BUSINESS', 'MEDIUM', 'James', 'Thornton', 'Strata Retail Group', 'Strata Retail Group', 'Director of Operations', 'jthornton@strataretail.com', '+1 (312) 555-9011', 'PROPOSAL', 'REFERRAL', 42000.00, 70, staff2_uuid, staff2_uuid, 'Introduced via Vanguard Health. Formal RFP delivered.', now() - INTERVAL '14 days'),
        (lead3_id, 'LEAD-000003', 'BUSINESS', 'HIGH', 'Hannah', 'Lin', 'Skyline Cloud Solutions', 'Skyline Cloud Solutions', 'Chief Technology Officer', 'hlin@skylinecloud.net', '+1 (206) 555-4433', 'NEW', 'LINKEDIN', 95000.00, 50, staff1_uuid, staff1_uuid, 'Engaged with whitepaper download. Follow-up email sent.', now() - INTERVAL '8 days'),
        (lead4_id, 'LEAD-000004', 'BUSINESS', 'LOW', 'Carlos', 'Mendoza', 'Orion Media Lab', 'Orion Media Lab', 'Head of Growth', 'cmendoza@orionmedia.co', '+1 (305) 555-8812', 'CONTACTED', 'CAMPAIGN', 28000.00, 40, staff2_uuid, admin_uuid, 'Marketing campaign response. Initial discovery scheduled.', now() - INTERVAL '3 days'),
        (lead5_id, 'LEAD-000005', 'INDIVIDUAL', 'MEDIUM', 'Tariq', 'Al-Mansoor', NULL, NULL, 'Principal Security Consultant', 'tariq@almansoor-sec.io', '+971 4 312 4500', 'NEW', 'EVENT', 35000.00, 60, staff1_uuid, staff1_uuid, 'Met at CyberSec Summit Dubai. Interested in enterprise authorization layer.', now() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 5. DEALS & PIPELINE
    -- ------------------------------------------------------------------------
    INSERT INTO public.deals (id, deal_number, title, customer_id, lead_id, stage, status, priority, currency, value, amount, probability, expected_close_date, won_at, assigned_to, created_by, notes, created_at)
    VALUES
        (deal1_id, 'DEAL-000001', 'Apex Logistics - Fleet Platform Expansion', cust1_id, NULL, 'NEGOTIATION', 'OPEN', 'HIGH', 'USD', 85000.00, 85000.00, 80, (CURRENT_DATE + INTERVAL '14 days'), NULL, staff1_uuid, staff1_uuid, 'Contract revisions in legal review. Anticipate signing before end of month.', now() - INTERVAL '25 days'),
        (deal2_id, 'DEAL-000002', 'Strata Retail - Omnichannel Rollout', NULL, lead2_id, 'PROPOSAL', 'OPEN', 'MEDIUM', 'USD', 42000.00, 42000.00, 60, (CURRENT_DATE + INTERVAL '30 days'), NULL, staff2_uuid, staff2_uuid, 'Proposal reviewed by COO. Security questionnaire pending.', now() - INTERVAL '12 days'),
        (deal3_id, 'DEAL-000003', 'Vanguard Health - Telehealth Module Add-on', cust2_id, NULL, 'DISCOVERY', 'OPEN', 'MEDIUM', 'USD', 35000.00, 35000.00, 30, (CURRENT_DATE + INTERVAL '45 days'), NULL, staff1_uuid, staff1_uuid, 'Initial requirements session held. Drafting scope of work.', now() - INTERVAL '7 days'),
        (deal4_id, 'DEAL-000004', 'NovaFin - Compliance Gateway 2026', cust3_id, NULL, 'CLOSED_WON', 'WON', 'HIGH', 'USD', 120000.00, 120000.00, 100, CURRENT_DATE, now() - INTERVAL '4 days', staff2_uuid, staff2_uuid, 'Contract fully executed by CEO. Onboarding scheduled for next week.', now() - INTERVAL '35 days'),
        (deal5_id, 'DEAL-000005', 'Lagos Freight Terminal System', cust1_id, NULL, 'PROPOSAL', 'OPEN', 'HIGH', 'NGN', 45000000.00, 45000000.00, 50, (CURRENT_DATE + INTERVAL '60 days'), NULL, staff1_uuid, staff1_uuid, 'West Africa logistics hub upgrade proposal.', now() - INTERVAL '2 days')
    ON CONFLICT (id) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 6. TASKS & AGENDA
    -- ------------------------------------------------------------------------
    INSERT INTO public.tasks (task_number, title, description, task_type, priority, status, due_date, customer_id, lead_id, deal_id, assigned_to, created_by, completed_at, created_at)
    VALUES
        ('TASK-000001', 'Legal Contract Review Follow-up', 'Check in with Apex Logistics legal counsel regarding indemnification clause.', 'FOLLOW_UP', 'URGENT', 'PENDING', (now() + INTERVAL '1 day'), cust1_id, NULL, deal1_id, staff1_uuid, staff1_uuid, NULL, now() - INTERVAL '3 days'),
        ('TASK-000002', 'Security Questionnaire Response', 'Send SOC2 compliance package to Strata Retail security team.', 'TODO', 'HIGH', 'IN_PROGRESS', (now() + INTERVAL '2 days'), NULL, lead2_id, deal2_id, staff2_uuid, staff2_uuid, NULL, now() - INTERVAL '2 days'),
        ('TASK-000003', 'Discovery Call Preparation', 'Prepare slide deck tailored for Skyline Cloud Solutions infrastructure.', 'MEETING', 'MEDIUM', 'PENDING', (now() + INTERVAL '3 days'), NULL, lead3_id, NULL, staff1_uuid, staff1_uuid, NULL, now() - INTERVAL '1 day'),
        ('TASK-000004', 'Quarterly Account Check-in', 'Schedule Q4 executive sync with Katherine Ward at Vanguard Health.', 'CALL', 'LOW', 'PENDING', (now() + INTERVAL '5 days'), cust2_id, NULL, NULL, staff1_uuid, admin_uuid, NULL, now() - INTERVAL '4 days'),
        ('TASK-000005', 'Send Onboarding Welcome Kit', 'Email welcome onboarding packet and developer API keys to NovaFin.', 'EMAIL', 'HIGH', 'COMPLETED', (now() - INTERVAL '1 day'), cust3_id, NULL, deal4_id, staff2_uuid, staff2_uuid, now() - INTERVAL '1 day', now() - INTERVAL '4 days');

    -- ------------------------------------------------------------------------
    -- 7. INTERACTIONS & TIMELINE
    -- ------------------------------------------------------------------------
    INSERT INTO public.interactions (interaction_number, customer_id, lead_id, deal_id, type, subject, description, notes, performed_by, interaction_at, performed_at, duration_minutes, outcome)
    VALUES
        ('INT-000001', cust1_id, NULL, deal1_id, 'MEETING', 'Executive Alignment Sync', 'Discussed rollout timeline and implementation milestones with David Miller. All stakeholders agreed on Q4 deployment.', 'Discussed rollout timeline and implementation milestones with David Miller. All stakeholders agreed on Q4 deployment.', staff1_uuid, now() - INTERVAL '2 days', now() - INTERVAL '2 days', 45, 'Aligned on SLA requirements; legal review underway.'),
        ('INT-000002', NULL, lead1_id, NULL, 'CALL', 'Technical Architecture Review', '30-minute call with Rachel Adams. Confirmed API compatibility and SSO integration requirements.', '30-minute call with Rachel Adams. Confirmed API compatibility and SSO integration requirements.', staff1_uuid, now() - INTERVAL '3 days', now() - INTERVAL '3 days', 30, 'Lead qualified; scheduling formal product demo.'),
        ('INT-000003', NULL, lead2_id, deal2_id, 'EMAIL', 'Proposal Document Delivered', 'Sent updated proposal PDF including custom SLA terms as requested by James Thornton.', 'Sent updated proposal PDF including custom SLA terms as requested by James Thornton.', staff2_uuid, now() - INTERVAL '1 day', now() - INTERVAL '1 day', 10, 'Awaiting response by Friday.'),
        ('INT-000004', cust3_id, NULL, deal4_id, 'MEETING', 'Contract Signing & Kickoff Meeting', 'Executive signing ceremony with NovaFin CFO and IT directors.', 'Executive signing ceremony with NovaFin CFO and IT directors.', staff2_uuid, now() - INTERVAL '4 days', now() - INTERVAL '4 days', 60, 'Deal closed won; passed to customer success.'),
        ('INT-000005', cust2_id, NULL, deal3_id, 'NOTE', 'HIPAA Requirements Note', 'Client requested dedicated encryption keys per compliance mandate.', 'Client requested dedicated encryption keys per compliance mandate.', staff1_uuid, now() - INTERVAL '5 days', now() - INTERVAL '5 days', NULL, 'Noted in deal record.');

    -- ------------------------------------------------------------------------
    -- 8. NOTIFICATIONS
    -- ------------------------------------------------------------------------
    INSERT INTO public.notifications (user_id, title, message, type, is_read, link_url)
    VALUES
        (staff1_uuid, 'New High-Value Lead Assigned', 'Rachel Adams (Beacon Robotics - $65,000 est.) was assigned to you by Sarah Chen.', 'ASSIGNMENT', FALSE, '/staff/leads'),
        (staff1_uuid, 'Contract Review Pending', 'Apex Logistics deal is nearing expected close date.', 'DEAL_UPDATE', FALSE, '/staff/deals'),
        (staff2_uuid, 'Security Review Action Item', 'Task "Security Questionnaire Response" is due in 2 days.', 'TASK_DUE', FALSE, '/staff/tasks');

END $$;

