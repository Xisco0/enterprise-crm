export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'ADMIN' | 'STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type CustomerType = 'INDIVIDUAL' | 'BUSINESS';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'CHURNED' | 'PROSPECT';
export type LeadType = 'INDIVIDUAL' | 'BUSINESS';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'PROPOSAL' | 'LOST' | 'CONVERTED';
export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'COLD_CALL' | 'LINKEDIN' | 'CAMPAIGN' | 'EVENT' | 'SOCIAL_MEDIA' | 'ADVERTISEMENT' | 'PHONE_CALL' | 'WALK_IN' | 'OTHER';
export type DealStage = 'NEW' | 'QUALIFICATION' | 'DISCOVERY' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
export type DealStatus = 'OPEN' | 'WON' | 'LOST';
export type DealPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type DealCurrency = 'USD' | 'NGN' | 'EUR' | 'GBP';
export type InteractionType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'OTHER' | 'TASK_UPDATE';
export type TaskType = 'CALL' | 'EMAIL' | 'MEETING' | 'FOLLOW_UP' | 'TODO' | 'OTHER';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type NotificationType = 'ASSIGNMENT' | 'TASK_DUE' | 'DEAL_UPDATE' | 'LEAD_NEW' | 'SYSTEM';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          role: UserRole
          status: UserStatus
          department: string | null
          job_title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          status?: UserStatus
          department?: string | null
          job_title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          status?: UserStatus
          department?: string | null
          job_title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          customer_number: string
          customer_type: CustomerType
          first_name: string | null
          last_name: string | null
          name: string
          company_name: string | null
          job_title: string | null
          email: string | null
          phone: string | null
          website: string | null
          industry: string | null
          status: CustomerStatus
          lifetime_value: number
          address_street: string | null
          address_city: string | null
          address_state: string | null
          address_country: string | null
          address_zip: string | null
          notes: string | null
          assigned_to: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_number?: string
          customer_type?: CustomerType
          first_name?: string | null
          last_name?: string | null
          name?: string
          company_name?: string | null
          job_title?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          industry?: string | null
          status?: CustomerStatus
          lifetime_value?: number
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_country?: string | null
          address_zip?: string | null
          notes?: string | null
          assigned_to?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_number?: string
          customer_type?: CustomerType
          first_name?: string | null
          last_name?: string | null
          name?: string
          company_name?: string | null
          job_title?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          industry?: string | null
          status?: CustomerStatus
          lifetime_value?: number
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_country?: string | null
          address_zip?: string | null
          notes?: string | null
          assigned_to?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          lead_number: string
          lead_type: LeadType
          priority: LeadPriority
          first_name: string
          last_name: string
          company: string | null
          company_name: string | null
          job_title: string | null
          email: string | null
          phone: string | null
          status: LeadStatus
          source: LeadSource
          estimated_value: number
          confidence_score: number
          notes: string | null
          assigned_to: string | null
          converted_customer_id: string | null
          converted_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_number?: string
          lead_type?: LeadType
          priority?: LeadPriority
          first_name: string
          last_name: string
          company?: string | null
          company_name?: string | null
          job_title?: string | null
          email?: string | null
          phone?: string | null
          status?: LeadStatus
          source?: LeadSource
          estimated_value?: number
          confidence_score?: number
          notes?: string | null
          assigned_to?: string | null
          converted_customer_id?: string | null
          converted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_number?: string
          lead_type?: LeadType
          priority?: LeadPriority
          first_name?: string
          last_name?: string
          company?: string | null
          company_name?: string | null
          job_title?: string | null
          email?: string | null
          phone?: string | null
          status?: LeadStatus
          source?: LeadSource
          estimated_value?: number
          confidence_score?: number
          notes?: string | null
          assigned_to?: string | null
          converted_customer_id?: string | null
          converted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          deal_number: string
          title: string
          description: string | null
          customer_id: string | null
          lead_id: string | null
          stage: DealStage
          status: DealStatus
          priority: DealPriority
          value: number
          amount: number
          currency: string
          probability: number
          expected_close_date: string | null
          actual_close_date: string | null
          lost_reason: string | null
          won_at: string | null
          lost_at: string | null
          closed_at: string | null
          assigned_to: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_number?: string
          title: string
          description?: string | null
          customer_id?: string | null
          lead_id?: string | null
          stage?: DealStage
          status?: DealStatus
          priority?: DealPriority
          value?: number
          amount?: number
          currency?: string
          probability?: number
          expected_close_date?: string | null
          actual_close_date?: string | null
          lost_reason?: string | null
          won_at?: string | null
          lost_at?: string | null
          closed_at?: string | null
          assigned_to?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_number?: string
          title?: string
          description?: string | null
          customer_id?: string | null
          lead_id?: string | null
          stage?: DealStage
          status?: DealStatus
          priority?: DealPriority
          value?: number
          amount?: number
          currency?: string
          probability?: number
          expected_close_date?: string | null
          actual_close_date?: string | null
          lost_reason?: string | null
          won_at?: string | null
          lost_at?: string | null
          closed_at?: string | null
          assigned_to?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          interaction_number: string
          customer_id: string | null
          lead_id: string | null
          deal_id: string | null
          type: InteractionType
          subject: string
          description: string | null
          notes: string
          duration_minutes: number | null
          outcome: string | null
          performed_by: string
          interaction_at: string
          performed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          interaction_number?: string
          customer_id?: string | null
          lead_id?: string | null
          deal_id?: string | null
          type?: InteractionType
          subject: string
          description?: string | null
          notes?: string
          duration_minutes?: number | null
          outcome?: string | null
          performed_by: string
          interaction_at?: string
          performed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          interaction_number?: string
          customer_id?: string | null
          lead_id?: string | null
          deal_id?: string | null
          type?: InteractionType
          subject?: string
          description?: string | null
          notes?: string
          duration_minutes?: number | null
          outcome?: string | null
          performed_by?: string
          interaction_at?: string
          performed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          task_number: string
          title: string
          description: string | null
          task_type: TaskType
          status: TaskStatus
          priority: TaskPriority
          assigned_to: string | null
          created_by: string | null
          customer_id: string | null
          lead_id: string | null
          deal_id: string | null
          due_date: string | null
          due_time: string | null
          due_at: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_number?: string
          title: string
          description?: string | null
          task_type?: TaskType
          status?: TaskStatus
          priority?: TaskPriority
          assigned_to?: string | null
          created_by?: string | null
          customer_id?: string | null
          lead_id?: string | null
          deal_id?: string | null
          due_date?: string | null
          due_time?: string | null
          due_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_number?: string
          title?: string
          description?: string | null
          task_type?: TaskType
          status?: TaskStatus
          priority?: TaskPriority
          assigned_to?: string | null
          created_by?: string | null
          customer_id?: string | null
          lead_id?: string | null
          deal_id?: string | null
          due_date?: string | null
          due_time?: string | null
          due_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          link_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: NotificationType
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: NotificationType
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
  }
}
