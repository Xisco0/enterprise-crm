# Apex CRM — Enterprise Relationship & Operations Platform

Production-grade, human-designed Customer Relationship Management (CRM) platform engineered with **Next.js (App Router, TypeScript, Tailwind CSS)** and **Supabase (PostgreSQL, Supabase Auth, Row-Level Security)**.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────┐
                               │       Next.js App Router       │
                               │   (TypeScript + Tailwind CSS)  │
                               └──────────────┬─────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       ┌────────────────────────┐                          ┌────────────────────────┐
       │      Admin Portal      │                          │      Staff Portal      │
       │    (/admin/dashboard)  │                          │    (/staff/dashboard)  │
       │  • Pipeline Analytics  │                          │  • My Action Agenda    │
       │  • All Accounts & Reps │                          │  • My Leads & Deals    │
       │  • RLS Policy Controls │                          │  • Interaction Logger  │
       │  • Team Roster & Roles │                          │  • Task Follow-ups     │
       └────────────┬───────────┘                          └────────────┬───────────┘
                    │                                                   │
                    └─────────────────────────┬─────────────────────────┘
                                              ▼
                               ┌────────────────────────────────┐
                               │   Next.js Middleware & SSR     │
                               │   (@supabase/ssr Cookie Auth)  │
                               └──────────────┬─────────────────┘
                                              ▼
                    ┌───────────────────────────────────────────────────┐
                    │               Supabase PostgreSQL                 │
                    │   ┌───────────────────────────────────────────┐   │
                    │   │        Row Level Security (RLS)           │   │
                    │   │  • ADMIN: Org-wide read/write             │   │
                    │   │  • STAFF: Scoped to assigned records      │   │
                    │   └───────────────────────────────────────────┘   │
                    │   ┌───────────────────────────────────────────┐   │
                    │   │       Security Definer Functions          │   │
                    │   │  • auth.is_admin()                        │   │
                    │   │  • auth.is_staff()                        │   │
                    │   │  • auth.get_current_user_role()           │   │
                    │   └───────────────────────────────────────────┘   │
                    │   ┌───────────────────────────────────────────┐   │
                    │   │    Core Entities & Triggers               │   │
                    │   │  • Profiles, Customers, Leads, Deals      │   │
                    │   │  • Tasks, Interactions, Audit Logs        │   │
                    │   └───────────────────────────────────────────┘   │
                    └───────────────────────────────────────────────────┘
```

---

## 🔐 Security & Row-Level Security (RLS) Matrix

| Entity | `ADMIN` Role Permissions | `STAFF` Role Permissions | RLS Policy Rule |
| :--- | :--- | :--- | :--- |
| **`public.profiles`** | Full Read / Write / Role Admin | Read Active Staff / Edit Own Profile | `is_admin()`, self `user_id = auth.uid()` |
| **`public.customers`** | Full Read / Write / Assign | Read/Write Assigned & Created Only | `assigned_to = auth.uid() OR created_by = auth.uid()` |
| **`public.leads`** | Full Read / Write / Qualify | Read/Write Assigned & Created Only | `assigned_to = auth.uid() OR created_by = auth.uid()` |
| **`public.deals`** | Full Read / Write / Reassign | Read/Write Assigned & Created Only | `assigned_to = auth.uid() OR created_by = auth.uid()` |
| **`public.tasks`** | Full Read / Write / Delegate | Read/Write Assigned & Created Only | `assigned_to = auth.uid() OR created_by = auth.uid()` |
| **`public.interactions`** | Full Read / Audit | Read on Authorized Entities / Insert Own | `performed_by = auth.uid() OR entity owner` |
| **`public.audit_logs`** | Full Audit Read Access | No Access (403) | `is_admin()` |

---

## 📁 Database Migrations (`supabase/migrations/`)

1. `20260916000001_create_enums_and_profiles.sql`
   - Custom enums (`user_role`, `user_status`).
   - `profiles` table extending `auth.users`.
   - Security Definer helper functions preventing circular RLS dependencies (`is_admin()`, `get_current_user_role()`).
   - Auto-provisioning trigger `handle_new_user()` on `auth.users` signup.
2. `20260916000002_create_crm_core_schema.sql`
   - Relational entities: `customers`, `leads`, `deals`, `interactions`, `tasks`, `notifications`, `audit_logs`.
   - Performance B-Tree indexes and updated_at triggers.
3. `20260916000003_create_rls_policies.sql`
   - Strict Row Level Security policies across all tables.
4. `supabase/seed.sql`
   - Enterprise demo dataset with realistic pipelines, lead conversions, interaction logs, and accounts.

---

## 🚀 Quickstart & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Apply Supabase Migrations
Execute the SQL scripts in `supabase/migrations/` in your Supabase SQL Editor or run:
```bash
supabase db push
supabase db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 👥 Demo Authentication Credentials

The login interface (`/login`) automatically inspects the user role from `public.profiles` on the server and redirects accordingly:

- **Admin Account**: `admin@enterprise.com` / `AdminPass123!` ➔ Redirects to `/admin/dashboard`
- **Staff Account**: `marcus.vance@enterprise.com` / `StaffPass123!` ➔ Redirects to `/staff/dashboard`
