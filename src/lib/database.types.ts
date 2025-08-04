export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount_due?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount_due?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ap_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_ap_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount_due?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount_due?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ar_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_ar_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          activity_at: string | null
          activity_type: string | null
          created_at: string
          id: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          activity_at?: string | null
          activity_type?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          activity_at?: string | null
          activity_type?: string | null
          created_at?: string
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_logs_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      asphalt_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string | null
          created_at: string
          id: string
          performed_at: string | null
          performed_by: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          id?: string
          performed_at?: string | null
          performed_by?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          action?: string | null
          created_at?: string
          id?: string
          performed_at?: string | null
          performed_by?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_audit_logs_performed_by"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_audit_logs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_audit_logs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      avatars: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      bid_packages: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_bid_packages_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bid_packages_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_bid_packages_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_vendors: {
        Row: {
          bid_package_id: string | null
          created_at: string
          id: string
          invited_at: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          bid_package_id?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          bid_package_id?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_bid_vendors_bid_package"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bid_vendors_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number | null
          bid_package_id: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          bid_package_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["general_status"] | null
          submitted_at?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          bid_package_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["general_status"] | null
          submitted_at?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_bids_bid_package"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bids_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      bim_models: {
        Row: {
          created_at: string
          id: string
          name: string | null
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_bim_models_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_bim_models_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          certification_type: string | null
          created_at: string
          employee_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          updated_at: string
        }
        Insert: {
          certification_type?: string | null
          created_at?: string
          employee_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          updated_at?: string
        }
        Update: {
          certification_type?: string | null
          created_at?: string
          employee_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_certifications_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          number: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          number: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          number?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_change_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_change_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          project_id: string | null
          status: string | null
          type: Database["public"]["Enums"]["commitment_type"] | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["commitment_type"] | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["commitment_type"] | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_commitments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_commitments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_commitments_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          check_date: string | null
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          result: string | null
          updated_at: string
        }
        Insert: {
          check_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          result?: string | null
          updated_at?: string
        }
        Update: {
          check_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          result?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_compliance_checks_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_compliance_checks_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_tracking: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          project_id: string | null
          status: string | null
          tracking_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: string | null
          tracking_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: string | null
          tracking_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_compliance_tracking_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_compliance_tracking_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      crew_assignments: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          crew_id: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          crew_id?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          crew_id?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_crew_assignments_crew"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_assignments_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          created_at: string | null
          crew_id: string | null
          end_date: string | null
          id: string
          profile_id: string | null
          role: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          crew_id?: string | null
          end_date?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          crew_id?: string | null
          end_date?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_crew_members_crew"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          created_at: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_crews_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_crews_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          project_id: string | null
          updated_at: string
          weather: Json | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string
          weather?: Json | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string
          weather?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_daily_logs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_daily_logs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_configs: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dashboard_configs_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_references: {
        Row: {
          created_at: string | null
          document_id: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_document_references_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string | null
          type: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id?: string | null
          type?: string | null
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string | null
          type?: string | null
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documents_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drawing_versions: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_drawing_versions_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_drawing_versions_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dump_trucks: {
        Row: {
          capacity: number | null
          created_at: string
          id: string
          make: string | null
          model: string | null
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          make?: string | null
          model?: string | null
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          make?: string | null
          model?: string | null
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_dump_trucks_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          hire_date: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hire_date?: string | null
          id?: string
          organization_id?: string | null
          profile_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hire_date?: string | null
          id?: string
          organization_id?: string | null
          profile_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_employees_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employees_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string | null
          id: string
          model: string | null
          name: string
          organization_id: string | null
          serial_number: string | null
          status: string | null
          type: Database["public"]["Enums"]["equipment_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          model?: string | null
          name: string
          organization_id?: string | null
          serial_number?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["equipment_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          model?: string | null
          name?: string
          organization_id?: string | null
          serial_number?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["equipment_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_equipment_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assignments: {
        Row: {
          assigned_date: string | null
          assigned_to: string | null
          created_at: string | null
          equipment_id: string | null
          id: string
          notes: string | null
          project_id: string | null
          released_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          equipment_id?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          released_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          equipment_id?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          released_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_equipment_assignments_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_assignments_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_assignments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_equipment_assignments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_maintenance: {
        Row: {
          created_at: string | null
          description: string | null
          equipment_id: string | null
          id: string
          maintenance_date: string | null
          performed_by: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          equipment_id?: string | null
          id?: string
          maintenance_date?: string | null
          performed_by?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          equipment_id?: string | null
          id?: string
          maintenance_date?: string | null
          performed_by?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_equipment_maintenance_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_maintenance_performed_by"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_usage: {
        Row: {
          created_at: string | null
          date: string
          equipment_id: string | null
          hours_used: number | null
          id: string
          notes: string | null
          quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          date: string
          equipment_id?: string | null
          hours_used?: number | null
          id?: string
          notes?: string | null
          quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          date?: string
          equipment_id?: string | null
          hours_used?: number | null
          id?: string
          notes?: string | null
          quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_equipment_usage_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          cost_code_id: string | null
          created_at: string | null
          estimate_id: string | null
          id: string
          name: string | null
          quantity: number | null
          total_cost: number | null
          unit_measure: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          cost_code_id?: string | null
          created_at?: string | null
          estimate_id?: string | null
          id?: string
          name?: string | null
          quantity?: number | null
          total_cost?: number | null
          unit_measure?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          cost_code_id?: string | null
          created_at?: string | null
          estimate_id?: string | null
          id?: string
          name?: string | null
          quantity?: number | null
          total_cost?: number | null
          unit_measure?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_estimate_line_items_cost_code"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estimate_line_items_estimate"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_estimates_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estimates_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_estimates_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_documents: {
        Row: {
          created_at: string
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_financial_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_financial_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      general_ledger: {
        Row: {
          balance: number | null
          created_at: string
          credit: number | null
          debit: number | null
          description: string | null
          entry_date: string | null
          id: string
          project_id: string | null
          updated_at: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          credit?: number | null
          debit?: number | null
          description?: string | null
          entry_date?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          credit?: number | null
          debit?: number | null
          description?: string | null
          entry_date?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_gl_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_gl_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_documents: {
        Row: {
          created_at: string
          document_type: string | null
          employee_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          employee_id?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string | null
          employee_id?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_hr_documents_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          inspection_type: string | null
          name: string
          notes: string | null
          project_id: string | null
          result: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          inspection_type?: string | null
          name: string
          notes?: string | null
          project_id?: string | null
          result?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          inspection_type?: string | null
          name?: string
          notes?: string | null
          project_id?: string | null
          result?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inspections_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_inspections_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_tokens: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          service_name: string | null
          token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          service_name?: string | null
          token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          service_name?: string | null
          token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_integration_tokens_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          id: string
          material_id: string | null
          notes: string | null
          quantity: number | null
          transaction_date: string | null
          transaction_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id?: string | null
          notes?: string | null
          quantity?: number | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string | null
          notes?: string | null
          quantity?: number | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_transactions_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          status: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          reported_by?: string | null
          resolved?: boolean | null
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          reported_by?: string | null
          resolved?: boolean | null
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_issues_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_issues_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_titles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      labor_records: {
        Row: {
          created_at: string | null
          hours_worked: number | null
          id: string
          line_item_id: string | null
          notes: string | null
          updated_at: string
          work_date: string | null
          work_type: string | null
          worker_count: number | null
        }
        Insert: {
          created_at?: string | null
          hours_worked?: number | null
          id?: string
          line_item_id?: string | null
          notes?: string | null
          updated_at?: string
          work_date?: string | null
          work_type?: string | null
          worker_count?: number | null
        }
        Update: {
          created_at?: string | null
          hours_worked?: number | null
          id?: string
          line_item_id?: string | null
          notes?: string | null
          updated_at?: string
          work_date?: string | null
          work_type?: string | null
          worker_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_labor_records_line_item"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_entries: {
        Row: {
          created_at: string | null
          date: string
          id: string
          line_item_id: string | null
          notes: string | null
          quantity_completed: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          line_item_id?: string | null
          notes?: string | null
          quantity_completed?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          line_item_id?: string | null
          notes?: string | null
          quantity_completed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_line_item_entries_line_item"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          formula: Json | null
          id: string
          name: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          formula?: Json | null
          id?: string
          name: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          formula?: Json | null
          id?: string
          name?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_line_item_templates_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          cost_code_id: string | null
          created_at: string | null
          description: string | null
          id: string
          map_id: string | null
          name: string
          project_id: string | null
          quantity: number | null
          template_id: string | null
          unit_measure: string
          unit_price: number | null
          updated_at: string
          wbs_id: string | null
        }
        Insert: {
          cost_code_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          map_id?: string | null
          name: string
          project_id?: string | null
          quantity?: number | null
          template_id?: string | null
          unit_measure: string
          unit_price?: number | null
          updated_at?: string
          wbs_id?: string | null
        }
        Update: {
          cost_code_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          map_id?: string | null
          name?: string
          project_id?: string | null
          quantity?: number | null
          template_id?: string | null
          unit_measure?: string
          unit_price?: number | null
          updated_at?: string
          wbs_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_line_items_cost_code"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_line_items_map"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_line_items_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_line_items_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_line_items_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "line_item_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_line_items_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
        ]
      }
      maps: {
        Row: {
          coordinates: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_num: number | null
          project_id: string | null
          scope: string | null
          updated_at: string
          wbs_id: string | null
        }
        Insert: {
          coordinates?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_num?: number | null
          project_id?: string | null
          scope?: string | null
          updated_at?: string
          wbs_id?: string | null
        }
        Update: {
          coordinates?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_num?: number | null
          project_id?: string | null
          scope?: string | null
          updated_at?: string
          wbs_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_maps_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_maps_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_maps_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
        ]
      }
      material_inventory: {
        Row: {
          created_at: string
          id: string
          last_updated: string | null
          material_id: string | null
          organization_id: string | null
          quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated?: string | null
          material_id?: string | null
          organization_id?: string | null
          quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_updated?: string | null
          material_id?: string | null
          organization_id?: string | null
          quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_material_inventory_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_inventory_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      material_orders: {
        Row: {
          created_at: string
          id: string
          material_id: string | null
          order_date: string | null
          project_id: string | null
          quantity: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id?: string | null
          order_date?: string | null
          project_id?: string | null
          quantity?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string | null
          order_date?: string | null
          project_id?: string | null
          quantity?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_material_orders_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_material_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      material_receipts: {
        Row: {
          created_at: string
          id: string
          material_order_id: string | null
          quantity: number | null
          received_by: string | null
          received_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_order_id?: string | null
          quantity?: number | null
          received_by?: string | null
          received_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          material_order_id?: string | null
          quantity?: number | null
          received_by?: string | null
          received_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_material_receipts_material_order"
            columns: ["material_order_id"]
            isOneToOne: false
            referencedRelation: "material_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_receipts_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_materials_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_minutes: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          meeting_date: string | null
          notes: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_date?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_date?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_meeting_minutes_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_meeting_minutes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_meeting_minutes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          is_read: boolean
          message: string
          payload: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          payload?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          payload?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          profile_id?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          profile_id?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_org_members_org"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_org_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_projects: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_org_projects_org"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_org_projects_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_org_projects_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          commitment_id: string | null
          created_at: string
          id: string
          paid_at: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          commitment_id?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          commitment_id?: string | null
          created_at?: string
          id?: string
          paid_at?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_commitment"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_payments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          created_at: string | null
          employee_id: string | null
          gross_pay: number | null
          id: string
          net_pay: number | null
          pay_period_end: string | null
          pay_period_start: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payroll_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_photos_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_photos_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photos_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prequalifications: {
        Row: {
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_prequalifications_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_prequalifications_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_workflows: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_procurement_workflows_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_procurement_workflows_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          job_title_id: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role_type"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          job_title_id?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          job_title_id?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_job_titles"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_billings: {
        Row: {
          amount: number | null
          billing_number: string | null
          created_at: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          billing_number?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          billing_number?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_progress_billings_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_progress_billings_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_inspectors: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          profile_id: string
          project_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          profile_id: string
          project_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          profile_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_inspectors_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_inspectors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_inspectors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_inspectors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      punch_lists: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          item: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          item?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          item?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_punch_lists_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_punch_lists_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_punch_lists_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          order_date: string | null
          order_number: string | null
          project_id: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          order_date?: string | null
          order_number?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          order_date?: string | null
          order_number?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_purchase_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_orders_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_reviews: {
        Row: {
          created_at: string
          findings: Json | null
          id: string
          project_id: string | null
          review_date: string | null
          reviewer: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          findings?: Json | null
          id?: string
          project_id?: string | null
          review_date?: string | null
          reviewer?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          findings?: Json | null
          id?: string
          project_id?: string | null
          review_date?: string | null
          reviewer?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quality_reviews_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_quality_reviews_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quality_reviews_reviewer"
            columns: ["reviewer"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_documents: {
        Row: {
          created_at: string
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_regulatory_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_regulatory_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          generated_at: string | null
          id: string
          project_id: string | null
          report_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          generated_at?: string | null
          id?: string
          project_id?: string | null
          report_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          generated_at?: string | null
          id?: string
          project_id?: string | null
          report_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reports_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_reports_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rfis: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          project_id: string | null
          question: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          subject: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          question?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          subject?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          question?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          subject?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_rfis_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_rfis_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rfis_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rfis_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          incident_date: string | null
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          severity: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string | null
          project_id?: string | null
          reported_by?: string | null
          resolved?: boolean | null
          severity?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string | null
          project_id?: string | null
          reported_by?: string | null
          resolved?: boolean | null
          severity?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_safety_incidents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_safety_incidents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_safety_incidents_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_data: {
        Row: {
          collected_at: string | null
          created_at: string
          data: Json | null
          id: string
          project_id: string | null
          updated_at: string
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sensor_data_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_sensor_data_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractor_agreements: {
        Row: {
          agreement_url: string | null
          created_at: string
          id: string
          signed_at: string | null
          subcontract_id: string | null
          updated_at: string
        }
        Insert: {
          agreement_url?: string | null
          created_at?: string
          id?: string
          signed_at?: string | null
          subcontract_id?: string | null
          updated_at?: string
        }
        Update: {
          agreement_url?: string | null
          created_at?: string
          id?: string
          signed_at?: string | null
          subcontract_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_subcontractor_agreements_subcontract"
            columns: ["subcontract_id"]
            isOneToOne: false
            referencedRelation: "subcontracts"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontracts: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          project_id: string | null
          signed_at: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          project_id?: string | null
          signed_at?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          project_id?: string | null
          signed_at?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_subcontracts_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_subcontracts_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subcontracts_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      submittals: {
        Row: {
          created_at: string
          id: string
          name: string | null
          project_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_submittals_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_submittals_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_submittals_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_submittals_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tack_rates: {
        Row: {
          created_at: string
          id: string
          material_type: string | null
          project_id: string | null
          rate: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_type?: string | null
          project_id?: string | null
          rate?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          material_type?: string | null
          project_id?: string | null
          rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tack_rates_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_tack_rates_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          depends_on_task_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_status_logs: {
        Row: {
          changed_at: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
        }
        Insert: {
          changed_at?: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
        }
        Update: {
          changed_at?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          project_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          project_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      training_records: {
        Row: {
          completion_date: string | null
          created_at: string
          employee_id: string | null
          id: string
          training_type: string | null
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          training_type?: string | null
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          training_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_training_records_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_projects_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_user_projects_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_projects_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_bid_packages: {
        Row: {
          bid_package_id: string | null
          created_at: string | null
          id: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          bid_package_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          bid_package_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendor_bid_packages_bid_package"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vendor_bid_packages_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendor_contacts_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_documents: {
        Row: {
          created_at: string
          document_type: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendor_documents_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_qualifications: {
        Row: {
          created_at: string
          id: string
          qualification_type: string | null
          reviewed_at: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          qualification_type?: string | null
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          qualification_type?: string | null
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendor_qualifications_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendors_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wbs: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          order_num: number | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          order_num?: number | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          order_num?: number | null
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wbs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_wbs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          current_state: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id: string
          updated_at: string
          workflow_name: Database["public"]["Enums"]["workflow_name"]
        }
        Insert: {
          created_at?: string
          current_state: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id?: string
          updated_at?: string
          workflow_name?: Database["public"]["Enums"]["workflow_name"]
        }
        Update: {
          created_at?: string
          current_state?: string
          entity_id?: string
          entity_schema?: string
          entity_table?: string
          id?: string
          updated_at?: string
          workflow_name?: Database["public"]["Enums"]["workflow_name"]
        }
        Relationships: []
      }
    }
    Views: {
      project_cost_summary: {
        Row: {
          project_id: string | null
          project_name: string | null
          total_billed_amount: number | null
          total_commitment_amount: number | null
          total_estimated_cost: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      advance_workflow: {
        Args: { _id: string; _new_state: string }
        Returns: {
          created_at: string
          current_state: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id: string
          updated_at: string
          workflow_name: Database["public"]["Enums"]["workflow_name"]
        }
      }
      check_access: {
        Args: {
          _action: string
          _resource: string
          _project_id?: string
          _organization_id?: string
        }
        Returns: undefined
      }
      count_unread_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      delete_accounts_payable: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_accounts_receivable: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_activity_logs: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_asphalt_types: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_audit_logs: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_avatars: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_bid_packages: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_bid_vendors: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_bids: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_bim_models: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_certifications: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_change_orders: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_commitments: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_compliance_checks: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_compliance_tracking: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_cost_codes: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_crew_assignments: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_crew_members: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_crews: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_daily_logs: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_dashboard_configs: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_document_references: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_documents: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_drawing_versions: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_dump_trucks: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_employees: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_equipment: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_equipment_assignments: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_equipment_maintenance: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_equipment_usage: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_estimate_line_items: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_estimates: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_financial_documents: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_general_ledger: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_hr_documents: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_inspections: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_integration_tokens: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_inventory_transactions: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_issues: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_job_titles: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_labor_records: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_line_item_entries: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_line_item_templates: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_line_items: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_maps: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_material_inventory: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_material_orders: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_material_receipts: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_materials: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_meeting_minutes: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_notifications: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_organization_members: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_organization_projects: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_organizations: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_payments: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_payroll: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_photos: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_prequalifications: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_procurement_workflows: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_profiles: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_progress_billings: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_project_inspectors: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_projects: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_punch_lists: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_purchase_orders: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_quality_reviews: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_regulatory_documents: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_reports: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_rfis: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_safety_incidents: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_sensor_data: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_subcontractor_agreements: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_subcontracts: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_submittals: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_tack_rates: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_task_dependencies: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_task_status_logs: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_tasks: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_training_records: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_user_projects: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_vendor_bid_packages: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_vendor_contacts: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_vendor_documents: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_vendor_qualifications: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_vendors: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_wbs: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_workflows: {
        Args: { _id: string }
        Returns: undefined
      }
      fn_cashflow_curve: {
        Args: { p_project_id: string }
        Returns: {
          cur_date: string
          billed: number
          cost: number
        }[]
      }
      fn_eqp_7d_avg_hours: {
        Args: { p_equipment_id: string }
        Returns: {
          day: string
          avg_hours: number
        }[]
      }
      fn_find_rpc_dupes: {
        Args: Record<PropertyKey, never>
        Returns: {
          fname: string
          args: string
          cnt: number
        }[]
      }
      fn_inventory_balance: {
        Args: { _material_id: string }
        Returns: {
          day: string
          balance: number
        }[]
      }
      fn_list_tables_and_columns: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          column_name: string
        }[]
      }
      fn_materials_on_hand: {
        Args: { p_material_id: string }
        Returns: {
          trans_date: string
          on_hand: number
        }[]
      }
      fn_task_cycle_time: {
        Args: { p_task_id: string }
        Returns: {
          status: string
          days_in_phase: number
        }[]
      }
      fn_top5_cost_codes: {
        Args: { p_project_id: string }
        Returns: {
          cost_code_id: string
          total_spend: number
          rank: number
        }[]
      }
      fn_weekly_receipt_perf: {
        Args: { p_project_id: string }
        Returns: {
          week_start: string
          on_time_count: number
          late_count: number
        }[]
      }
      fn_worst10_crews_by_incidents: {
        Args: Record<PropertyKey, never>
        Returns: {
          crew_id: string
          incident_count: number
          rank: number
        }[]
      }
      get_accounts_payable: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      get_accounts_receivable: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      get_activity_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          activity_at: string | null
          activity_type: string | null
          created_at: string
          id: string
          profile_id: string | null
          updated_at: string
        }[]
      }
      get_asphalt_types: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }[]
      }
      get_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string | null
          created_at: string
          id: string
          performed_at: string | null
          performed_by: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      get_avatars: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          updated_at: string
          url: string
        }[]
      }
      get_bid_packages: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      get_bid_vendors: {
        Args: Record<PropertyKey, never>
        Returns: {
          bid_package_id: string | null
          created_at: string
          id: string
          invited_at: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      get_bids: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number | null
          bid_package_id: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      get_bim_models: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          name: string | null
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      get_certifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          certification_type: string | null
          created_at: string
          employee_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          updated_at: string
        }[]
      }
      get_change_orders: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          number: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      get_commitments: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number | null
          created_at: string | null
          id: string
          project_id: string | null
          status: string | null
          type: Database["public"]["Enums"]["commitment_type"] | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      get_compliance_checks: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_date: string | null
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          result: string | null
          updated_at: string
        }[]
      }
      get_compliance_tracking: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          notes: string | null
          project_id: string | null
          status: string | null
          tracking_type: string | null
          updated_at: string
        }[]
      }
      get_cost_codes: {
        Args: Record<PropertyKey, never>
        Returns: {
          code: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }[]
      }
      get_crew_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          assigned_date: string | null
          created_at: string | null
          crew_id: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
      }
      get_crew_members: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          crew_id: string | null
          end_date: string | null
          id: string
          profile_id: string | null
          role: string | null
          start_date: string | null
          updated_at: string
        }[]
      }
      get_crews: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string
        }[]
      }
      get_daily_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          project_id: string | null
          updated_at: string
          weather: Json | null
        }[]
      }
      get_dashboard_configs: {
        Args: Record<PropertyKey, never>
        Returns: {
          config: Json | null
          created_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
      }
      get_document_references: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          document_id: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          updated_at: string
        }[]
      }
      get_documents: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          name: string
          project_id: string | null
          type: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string | null
        }[]
      }
      get_drawing_versions: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          document_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          version: string | null
        }[]
      }
      get_dump_trucks: {
        Args: Record<PropertyKey, never>
        Returns: {
          capacity: number | null
          created_at: string
          id: string
          make: string | null
          model: string | null
          organization_id: string | null
          updated_at: string
        }[]
      }
      get_employees: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          hire_date: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      get_equipment: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          model: string | null
          name: string
          organization_id: string | null
          serial_number: string | null
          status: string | null
          type: Database["public"]["Enums"]["equipment_type"] | null
          updated_at: string
        }[]
      }
      get_equipment_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          assigned_date: string | null
          assigned_to: string | null
          created_at: string | null
          equipment_id: string | null
          id: string
          notes: string | null
          project_id: string | null
          released_date: string | null
          updated_at: string
        }[]
      }
      get_equipment_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          description: string | null
          equipment_id: string | null
          id: string
          maintenance_date: string | null
          performed_by: string | null
          type: string | null
          updated_at: string
        }[]
      }
      get_equipment_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          date: string
          equipment_id: string | null
          hours_used: number | null
          id: string
          notes: string | null
          quantity: number | null
          updated_at: string
        }[]
      }
      get_estimate_line_items: {
        Args: Record<PropertyKey, never>
        Returns: {
          cost_code_id: string | null
          created_at: string | null
          estimate_id: string | null
          id: string
          name: string | null
          quantity: number | null
          total_cost: number | null
          unit_measure: string | null
          unit_price: number | null
          updated_at: string
        }[]
      }
      get_estimates: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      get_financial_documents: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      get_general_ledger: {
        Args: Record<PropertyKey, never>
        Returns: {
          balance: number | null
          created_at: string
          credit: number | null
          debit: number | null
          description: string | null
          entry_date: string | null
          id: string
          project_id: string | null
          updated_at: string
        }[]
      }
      get_hr_documents: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          document_type: string | null
          employee_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      get_inspections: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          date: string | null
          id: string
          inspection_type: string | null
          name: string
          notes: string | null
          project_id: string | null
          result: Json | null
          status: string | null
          updated_at: string
        }[]
      }
      get_integration_tokens: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          profile_id: string | null
          service_name: string | null
          token: string | null
          updated_at: string
        }[]
      }
      get_inventory_transactions: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          material_id: string | null
          notes: string | null
          quantity: number | null
          transaction_date: string | null
          transaction_type: string | null
          updated_at: string
        }[]
      }
      get_issues: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          status: string | null
          type: string | null
          updated_at: string
        }[]
      }
      get_job_titles: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }[]
      }
      get_labor_records: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          hours_worked: number | null
          id: string
          line_item_id: string | null
          notes: string | null
          updated_at: string
          work_date: string | null
          work_type: string | null
          worker_count: number | null
        }[]
      }
      get_line_item_entries: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          date: string
          id: string
          line_item_id: string | null
          notes: string | null
          quantity_completed: number | null
          updated_at: string
        }[]
      }
      get_line_item_templates: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          created_by: string | null
          formula: Json | null
          id: string
          name: string
          updated_at: string
          variables: Json | null
        }[]
      }
      get_line_items: {
        Args: Record<PropertyKey, never>
        Returns: {
          cost_code_id: string | null
          created_at: string | null
          description: string | null
          id: string
          map_id: string | null
          name: string
          project_id: string | null
          quantity: number | null
          template_id: string | null
          unit_measure: string
          unit_price: number | null
          updated_at: string
          wbs_id: string | null
        }[]
      }
      get_maps: {
        Args: Record<PropertyKey, never>
        Returns: {
          coordinates: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_num: number | null
          project_id: string | null
          scope: string | null
          updated_at: string
          wbs_id: string | null
        }[]
      }
      get_material_inventory: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          last_updated: string | null
          material_id: string | null
          organization_id: string | null
          quantity: number | null
          updated_at: string
        }[]
      }
      get_material_orders: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          material_id: string | null
          order_date: string | null
          project_id: string | null
          quantity: number | null
          status: string | null
          updated_at: string
        }[]
      }
      get_material_receipts: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          material_order_id: string | null
          quantity: number | null
          received_by: string | null
          received_date: string | null
          updated_at: string
        }[]
      }
      get_materials: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          unit: string | null
          updated_at: string
        }[]
      }
      get_meeting_minutes: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          created_by: string | null
          id: string
          meeting_date: string | null
          notes: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      get_notifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          is_read: boolean
          message: string
          payload: Json | null
          updated_at: string
          user_id: string
        }[]
      }
      get_organization_members: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
          role: string | null
          updated_at: string
        }[]
      }
      get_organization_projects: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          organization_id: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      get_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }[]
      }
      get_payments: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number | null
          commitment_id: string | null
          created_at: string
          id: string
          paid_at: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      get_payroll: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          employee_id: string | null
          gross_pay: number | null
          id: string
          net_pay: number | null
          pay_period_end: string | null
          pay_period_start: string | null
          updated_at: string
        }[]
      }
      get_photos: {
        Args: Record<PropertyKey, never>
        Returns: {
          caption: string | null
          created_at: string
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string
        }[]
      }
      get_prequalifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      get_procurement_workflows: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      get_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          job_title_id: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role_type"] | null
          updated_at: string
        }[]
      }
      get_progress_billings: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number | null
          billing_number: string | null
          created_at: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      get_project_cost_summary: {
        Args: { _project_id: string; _organisation_id: string }
        Returns: unknown[]
      }
      get_project_inspectors: {
        Args: Record<PropertyKey, never>
        Returns: {
          assigned_at: string | null
          assigned_by: string | null
          profile_id: string
          project_id: string
        }[]
      }
      get_projects: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string
        }[]
      }
      get_punch_lists: {
        Args: Record<PropertyKey, never>
        Returns: {
          assigned_to: string | null
          created_at: string | null
          id: string
          item: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      get_purchase_orders: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number | null
          created_at: string
          id: string
          order_date: string | null
          order_number: string | null
          project_id: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      get_quality_reviews: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          findings: Json | null
          id: string
          project_id: string | null
          review_date: string | null
          reviewer: string | null
          updated_at: string
        }[]
      }
      get_regulatory_documents: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      get_reports: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          generated_at: string | null
          id: string
          project_id: string | null
          report_type: string | null
          updated_at: string
        }[]
      }
      get_rfis: {
        Args: Record<PropertyKey, never>
        Returns: {
          answer: string | null
          created_at: string
          id: string
          project_id: string | null
          question: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          subject: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }[]
      }
      get_safety_incidents: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string | null
          id: string
          incident_date: string | null
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          severity: string | null
          updated_at: string
        }[]
      }
      get_sensor_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          collected_at: string | null
          created_at: string
          data: Json | null
          id: string
          project_id: string | null
          updated_at: string
        }[]
      }
      get_subcontractor_agreements: {
        Args: Record<PropertyKey, never>
        Returns: {
          agreement_url: string | null
          created_at: string
          id: string
          signed_at: string | null
          subcontract_id: string | null
          updated_at: string
        }[]
      }
      get_subcontracts: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number | null
          created_at: string
          id: string
          project_id: string | null
          signed_at: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      get_submittals: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          name: string | null
          project_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }[]
      }
      get_tack_rates: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          material_type: string | null
          project_id: string | null
          rate: number | null
          updated_at: string
        }[]
      }
      get_task_dependencies: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          depends_on_task_id: string
          id: string
          task_id: string
        }[]
      }
      get_task_status_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          changed_at: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
        }[]
      }
      get_tasks: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }[]
      }
      get_training_records: {
        Args: Record<PropertyKey, never>
        Returns: {
          completion_date: string | null
          created_at: string
          employee_id: string | null
          id: string
          training_type: string | null
          updated_at: string
        }[]
      }
      get_user_projects: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          project_id: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }[]
      }
      get_vendor_bid_packages: {
        Args: Record<PropertyKey, never>
        Returns: {
          bid_package_id: string | null
          created_at: string | null
          id: string
          updated_at: string
          vendor_id: string | null
        }[]
      }
      get_vendor_contacts: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      get_vendor_documents: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          document_type: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
          vendor_id: string | null
        }[]
      }
      get_vendor_qualifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          qualification_type: string | null
          reviewed_at: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      get_vendors: {
        Args: Record<PropertyKey, never>
        Returns: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          updated_at: string
        }[]
      }
      get_wbs: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          order_num: number | null
          project_id: string | null
          updated_at: string
        }[]
      }
      get_workflows: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          current_state: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id: string
          updated_at: string
          workflow_name: Database["public"]["Enums"]["workflow_name"]
        }[]
      }
      insert_accounts_payable: {
        Args: { _input: Json }
        Returns: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_accounts_receivable: {
        Args: { _input: Json }
        Returns: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_activity_logs: {
        Args: { _input: Json }
        Returns: {
          activity_at: string | null
          activity_type: string | null
          created_at: string
          id: string
          profile_id: string | null
          updated_at: string
        }[]
      }
      insert_asphalt_types: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }[]
      }
      insert_audit_logs: {
        Args: { _input: Json }
        Returns: {
          action: string | null
          created_at: string
          id: string
          performed_at: string | null
          performed_by: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      insert_avatars: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          id: string
          updated_at: string
          url: string
        }[]
      }
      insert_bid_packages: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_bid_vendors: {
        Args: { _input: Json }
        Returns: {
          bid_package_id: string | null
          created_at: string
          id: string
          invited_at: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      insert_bids: {
        Args: { _input: Json }
        Returns: {
          amount: number | null
          bid_package_id: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      insert_bim_models: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          name: string | null
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      insert_certifications: {
        Args: { _input: Json }
        Returns: {
          certification_type: string | null
          created_at: string
          employee_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          updated_at: string
        }[]
      }
      insert_change_orders: {
        Args: { _input: Json }
        Returns: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          number: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_commitments: {
        Args: { _input: Json }
        Returns: {
          amount: number | null
          created_at: string | null
          id: string
          project_id: string | null
          status: string | null
          type: Database["public"]["Enums"]["commitment_type"] | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      insert_compliance_checks: {
        Args: { _input: Json }
        Returns: {
          check_date: string | null
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          result: string | null
          updated_at: string
        }[]
      }
      insert_compliance_tracking: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          notes: string | null
          project_id: string | null
          status: string | null
          tracking_type: string | null
          updated_at: string
        }[]
      }
      insert_cost_codes: {
        Args: { _input: Json }
        Returns: {
          code: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }[]
      }
      insert_crew_assignments: {
        Args: { _input: Json }
        Returns: {
          assigned_date: string | null
          created_at: string | null
          crew_id: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
      }
      insert_crew_members: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          crew_id: string | null
          end_date: string | null
          id: string
          profile_id: string | null
          role: string | null
          start_date: string | null
          updated_at: string
        }[]
      }
      insert_crews: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string
        }[]
      }
      insert_daily_logs: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          project_id: string | null
          updated_at: string
          weather: Json | null
        }[]
      }
      insert_dashboard_configs: {
        Args: { _input: Json }
        Returns: {
          config: Json | null
          created_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
      }
      insert_document_references: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          document_id: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          updated_at: string
        }[]
      }
      insert_documents: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          name: string
          project_id: string | null
          type: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string | null
        }[]
      }
      insert_drawing_versions: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          document_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          version: string | null
        }[]
      }
      insert_dump_trucks: {
        Args: { _input: Json }
        Returns: {
          capacity: number | null
          created_at: string
          id: string
          make: string | null
          model: string | null
          organization_id: string | null
          updated_at: string
        }[]
      }
      insert_employees: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          hire_date: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_equipment: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          id: string
          model: string | null
          name: string
          organization_id: string | null
          serial_number: string | null
          status: string | null
          type: Database["public"]["Enums"]["equipment_type"] | null
          updated_at: string
        }[]
      }
      insert_equipment_assignments: {
        Args: { _input: Json }
        Returns: {
          assigned_date: string | null
          assigned_to: string | null
          created_at: string | null
          equipment_id: string | null
          id: string
          notes: string | null
          project_id: string | null
          released_date: string | null
          updated_at: string
        }[]
      }
      insert_equipment_maintenance: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          description: string | null
          equipment_id: string | null
          id: string
          maintenance_date: string | null
          performed_by: string | null
          type: string | null
          updated_at: string
        }[]
      }
      insert_equipment_usage: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          date: string
          equipment_id: string | null
          hours_used: number | null
          id: string
          notes: string | null
          quantity: number | null
          updated_at: string
        }[]
      }
      insert_estimate_line_items: {
        Args: { _input: Json }
        Returns: {
          cost_code_id: string | null
          created_at: string | null
          estimate_id: string | null
          id: string
          name: string | null
          quantity: number | null
          total_cost: number | null
          unit_measure: string | null
          unit_price: number | null
          updated_at: string
        }[]
      }
      insert_estimates: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_financial_documents: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      insert_general_ledger: {
        Args: { _input: Json }
        Returns: {
          balance: number | null
          created_at: string
          credit: number | null
          debit: number | null
          description: string | null
          entry_date: string | null
          id: string
          project_id: string | null
          updated_at: string
        }[]
      }
      insert_hr_documents: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          document_type: string | null
          employee_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      insert_inspections: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          date: string | null
          id: string
          inspection_type: string | null
          name: string
          notes: string | null
          project_id: string | null
          result: Json | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_integration_tokens: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          id: string
          profile_id: string | null
          service_name: string | null
          token: string | null
          updated_at: string
        }[]
      }
      insert_inventory_transactions: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          material_id: string | null
          notes: string | null
          quantity: number | null
          transaction_date: string | null
          transaction_type: string | null
          updated_at: string
        }[]
      }
      insert_issues: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          status: string | null
          type: string | null
          updated_at: string
        }[]
      }
      insert_job_titles: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }[]
      }
      insert_labor_records: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          hours_worked: number | null
          id: string
          line_item_id: string | null
          notes: string | null
          updated_at: string
          work_date: string | null
          work_type: string | null
          worker_count: number | null
        }[]
      }
      insert_line_item_entries: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          date: string
          id: string
          line_item_id: string | null
          notes: string | null
          quantity_completed: number | null
          updated_at: string
        }[]
      }
      insert_line_item_templates: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          created_by: string | null
          formula: Json | null
          id: string
          name: string
          updated_at: string
          variables: Json | null
        }[]
      }
      insert_line_items: {
        Args: { _input: Json }
        Returns: {
          cost_code_id: string | null
          created_at: string | null
          description: string | null
          id: string
          map_id: string | null
          name: string
          project_id: string | null
          quantity: number | null
          template_id: string | null
          unit_measure: string
          unit_price: number | null
          updated_at: string
          wbs_id: string | null
        }[]
      }
      insert_maps: {
        Args: { _input: Json }
        Returns: {
          coordinates: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_num: number | null
          project_id: string | null
          scope: string | null
          updated_at: string
          wbs_id: string | null
        }[]
      }
      insert_material_inventory: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          last_updated: string | null
          material_id: string | null
          organization_id: string | null
          quantity: number | null
          updated_at: string
        }[]
      }
      insert_material_orders: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          material_id: string | null
          order_date: string | null
          project_id: string | null
          quantity: number | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_material_receipts: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          material_order_id: string | null
          quantity: number | null
          received_by: string | null
          received_date: string | null
          updated_at: string
        }[]
      }
      insert_materials: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          unit: string | null
          updated_at: string
        }[]
      }
      insert_meeting_minutes: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          created_by: string | null
          id: string
          meeting_date: string | null
          notes: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      insert_notifications: {
        Args: { _input: Json }
        Returns: {
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          is_read: boolean
          message: string
          payload: Json | null
          updated_at: string
          user_id: string
        }[]
      }
      insert_organization_members: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
          role: string | null
          updated_at: string
        }[]
      }
      insert_organization_projects: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          id: string
          organization_id: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      insert_organizations: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }[]
      }
      insert_payments: {
        Args: { _input: Json }
        Returns: {
          amount: number | null
          commitment_id: string | null
          created_at: string
          id: string
          paid_at: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      insert_payroll: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          employee_id: string | null
          gross_pay: number | null
          id: string
          net_pay: number | null
          pay_period_end: string | null
          pay_period_start: string | null
          updated_at: string
        }[]
      }
      insert_photos: {
        Args: { _input: Json }
        Returns: {
          caption: string | null
          created_at: string
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string
        }[]
      }
      insert_prequalifications: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      insert_procurement_workflows: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_profiles: {
        Args: { _input: Json }
        Returns: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          job_title_id: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role_type"] | null
          updated_at: string
        }[]
      }
      insert_progress_billings: {
        Args: { _input: Json }
        Returns: {
          amount: number | null
          billing_number: string | null
          created_at: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_project_inspectors: {
        Args: { _input: Json }
        Returns: {
          assigned_at: string | null
          assigned_by: string | null
          profile_id: string
          project_id: string
        }[]
      }
      insert_projects: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string
        }[]
      }
      insert_punch_lists: {
        Args: { _input: Json }
        Returns: {
          assigned_to: string | null
          created_at: string | null
          id: string
          item: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      insert_purchase_orders: {
        Args: { _input: Json }
        Returns: {
          amount: number | null
          created_at: string
          id: string
          order_date: string | null
          order_number: string | null
          project_id: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      insert_quality_reviews: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          findings: Json | null
          id: string
          project_id: string | null
          review_date: string | null
          reviewer: string | null
          updated_at: string
        }[]
      }
      insert_regulatory_documents: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      insert_reports: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          generated_at: string | null
          id: string
          project_id: string | null
          report_type: string | null
          updated_at: string
        }[]
      }
      insert_rfis: {
        Args: { _input: Json }
        Returns: {
          answer: string | null
          created_at: string
          id: string
          project_id: string | null
          question: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          subject: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }[]
      }
      insert_safety_incidents: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          description: string | null
          id: string
          incident_date: string | null
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          severity: string | null
          updated_at: string
        }[]
      }
      insert_sensor_data: {
        Args: { _input: Json }
        Returns: {
          collected_at: string | null
          created_at: string
          data: Json | null
          id: string
          project_id: string | null
          updated_at: string
        }[]
      }
      insert_subcontractor_agreements: {
        Args: { _input: Json }
        Returns: {
          agreement_url: string | null
          created_at: string
          id: string
          signed_at: string | null
          subcontract_id: string | null
          updated_at: string
        }[]
      }
      insert_subcontracts: {
        Args: { _input: Json }
        Returns: {
          amount: number | null
          created_at: string
          id: string
          project_id: string | null
          signed_at: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      insert_submittals: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          name: string | null
          project_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }[]
      }
      insert_tack_rates: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          material_type: string | null
          project_id: string | null
          rate: number | null
          updated_at: string
        }[]
      }
      insert_task_dependencies: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          depends_on_task_id: string
          id: string
          task_id: string
        }[]
      }
      insert_task_status_logs: {
        Args: { _input: Json }
        Returns: {
          changed_at: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
        }[]
      }
      insert_tasks: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }[]
      }
      insert_training_records: {
        Args: { _input: Json }
        Returns: {
          completion_date: string | null
          created_at: string
          employee_id: string | null
          id: string
          training_type: string | null
          updated_at: string
        }[]
      }
      insert_user_projects: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          id: string
          project_id: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }[]
      }
      insert_vendor_bid_packages: {
        Args: { _input: Json }
        Returns: {
          bid_package_id: string | null
          created_at: string | null
          id: string
          updated_at: string
          vendor_id: string | null
        }[]
      }
      insert_vendor_contacts: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      insert_vendor_documents: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          document_type: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
          vendor_id: string | null
        }[]
      }
      insert_vendor_qualifications: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          qualification_type: string | null
          reviewed_at: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      insert_vendors: {
        Args: { _input: Json }
        Returns: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          updated_at: string
        }[]
      }
      insert_wbs: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          order_num: number | null
          project_id: string | null
          updated_at: string
        }[]
      }
      insert_workflows: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          current_state: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id: string
          updated_at: string
          workflow_name: Database["public"]["Enums"]["workflow_name"]
        }[]
      }
      rank_equipment_usage: {
        Args: { p_project_id: string }
        Returns: {
          equipment_id: string
          total_hours: number
          usage_rank: number
        }[]
      }
      refresh_project_cost_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_accounts_payable: {
        Args: {
          _id: string
          _project_id?: string
          _amount_due?: number
          _due_date?: string
          _status?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      update_accounts_receivable: {
        Args: {
          _id: string
          _project_id?: string
          _amount_due?: number
          _due_date?: string
          _status?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          amount_due: number | null
          created_at: string
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      update_activity_logs: {
        Args: {
          _id: string
          _profile_id?: string
          _activity_type?: string
          _activity_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          activity_at: string | null
          activity_type: string | null
          created_at: string
          id: string
          profile_id: string | null
          updated_at: string
        }[]
      }
      update_asphalt_types: {
        Args: {
          _id: string
          _name?: string
          _description?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }[]
      }
      update_audit_logs: {
        Args: {
          _id: string
          _project_id?: string
          _action?: string
          _performed_by?: string
          _performed_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          action: string | null
          created_at: string
          id: string
          performed_at: string | null
          performed_by: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      update_avatars: {
        Args: {
          _id: string
          _url?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          id: string
          updated_at: string
          url: string
        }[]
      }
      update_bid_packages: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _status?: string
          _created_by?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      update_bid_vendors: {
        Args: {
          _id: string
          _bid_package_id?: string
          _vendor_id?: string
          _invited_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          bid_package_id: string | null
          created_at: string
          id: string
          invited_at: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      update_bids: {
        Args: {
          _id: string
          _bid_package_id?: string
          _vendor_id?: string
          _amount?: number
          _submitted_at?: string
          _status?: Database["public"]["Enums"]["general_status"]
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          amount: number | null
          bid_package_id: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      update_bim_models: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _url?: string
          _uploaded_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          name: string | null
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      update_certifications: {
        Args: {
          _id: string
          _employee_id?: string
          _certification_type?: string
          _issue_date?: string
          _expiry_date?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          certification_type: string | null
          created_at: string
          employee_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          updated_at: string
        }[]
      }
      update_change_orders: {
        Args: {
          _id: string
          _project_id?: string
          _number?: string
          _description?: string
          _status?: string
          _amount?: number
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          number: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      update_commitments: {
        Args: {
          _id: string
          _project_id?: string
          _vendor_id?: string
          _type?: Database["public"]["Enums"]["commitment_type"]
          _amount?: number
          _status?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          amount: number | null
          created_at: string | null
          id: string
          project_id: string | null
          status: string | null
          type: Database["public"]["Enums"]["commitment_type"] | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      update_compliance_checks: {
        Args: {
          _id: string
          _project_id?: string
          _check_date?: string
          _description?: string
          _result?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          check_date: string | null
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          result: string | null
          updated_at: string
        }[]
      }
      update_compliance_tracking: {
        Args: {
          _id: string
          _project_id?: string
          _tracking_type?: string
          _status?: string
          _notes?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          notes: string | null
          project_id: string | null
          status: string | null
          tracking_type: string | null
          updated_at: string
        }[]
      }
      update_cost_codes: {
        Args: {
          _id: string
          _code?: string
          _description?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          code: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }[]
      }
      update_crew_assignments: {
        Args: {
          _id: string
          _crew_id?: string
          _profile_id?: string
          _assigned_date?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          assigned_date: string | null
          created_at: string | null
          crew_id: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
      }
      update_crew_members: {
        Args: {
          _id: string
          _crew_id?: string
          _profile_id?: string
          _role?: string
          _start_date?: string
          _end_date?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          crew_id: string | null
          end_date: string | null
          id: string
          profile_id: string | null
          role: string | null
          start_date: string | null
          updated_at: string
        }[]
      }
      update_crews: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string
        }[]
      }
      update_daily_logs: {
        Args: {
          _id: string
          _project_id?: string
          _date?: string
          _weather?: Json
          _notes?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          project_id: string | null
          updated_at: string
          weather: Json | null
        }[]
      }
      update_dashboard_configs: {
        Args: {
          _id: string
          _profile_id?: string
          _config?: Json
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          config: Json | null
          created_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
      }
      update_document_references: {
        Args: {
          _id: string
          _document_id?: string
          _reference_type?: string
          _reference_id?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          document_id: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          updated_at: string
        }[]
      }
      update_documents: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _type?: string
          _url?: string
          _uploaded_by?: string
          _uploaded_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          name: string
          project_id: string | null
          type: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string | null
        }[]
      }
      update_drawing_versions: {
        Args: {
          _id: string
          _document_id?: string
          _version?: string
          _uploaded_by?: string
          _uploaded_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          document_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          version: string | null
        }[]
      }
      update_dump_trucks: {
        Args: {
          _id: string
          _organization_id?: string
          _make?: string
          _model?: string
          _capacity?: number
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          capacity: number | null
          created_at: string
          id: string
          make: string | null
          model: string | null
          organization_id: string | null
          updated_at: string
        }[]
      }
      update_employees: {
        Args: {
          _id: string
          _organization_id?: string
          _profile_id?: string
          _hire_date?: string
          _status?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          hire_date: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      update_equipment: {
        Args: {
          _id: string
          _organization_id?: string
          _name?: string
          _type?: Database["public"]["Enums"]["equipment_type"]
          _model?: string
          _serial_number?: string
          _status?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          id: string
          model: string | null
          name: string
          organization_id: string | null
          serial_number: string | null
          status: string | null
          type: Database["public"]["Enums"]["equipment_type"] | null
          updated_at: string
        }[]
      }
      update_equipment_assignments: {
        Args: {
          _id: string
          _equipment_id?: string
          _project_id?: string
          _assigned_to?: string
          _assigned_date?: string
          _released_date?: string
          _notes?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          assigned_date: string | null
          assigned_to: string | null
          created_at: string | null
          equipment_id: string | null
          id: string
          notes: string | null
          project_id: string | null
          released_date: string | null
          updated_at: string
        }[]
      }
      update_equipment_maintenance: {
        Args: {
          _id: string
          _equipment_id?: string
          _maintenance_date?: string
          _type?: string
          _description?: string
          _performed_by?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          description: string | null
          equipment_id: string | null
          id: string
          maintenance_date: string | null
          performed_by: string | null
          type: string | null
          updated_at: string
        }[]
      }
      update_equipment_usage: {
        Args: {
          _id: string
          _equipment_id?: string
          _date?: string
          _hours_used?: number
          _quantity?: number
          _notes?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          date: string
          equipment_id: string | null
          hours_used: number | null
          id: string
          notes: string | null
          quantity: number | null
          updated_at: string
        }[]
      }
      update_estimate_line_items: {
        Args: {
          _id: string
          _estimate_id?: string
          _cost_code_id?: string
          _name?: string
          _unit_measure?: string
          _quantity?: number
          _unit_price?: number
          _total_cost?: number
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          cost_code_id: string | null
          created_at: string | null
          estimate_id: string | null
          id: string
          name: string | null
          quantity: number | null
          total_cost: number | null
          unit_measure: string | null
          unit_price: number | null
          updated_at: string
        }[]
      }
      update_estimates: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _status?: string
          _created_by?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      update_financial_documents: {
        Args: {
          _id: string
          _project_id?: string
          _document_type?: string
          _url?: string
          _uploaded_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      update_general_ledger: {
        Args: {
          _id: string
          _project_id?: string
          _entry_date?: string
          _description?: string
          _debit?: number
          _credit?: number
          _balance?: number
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          balance: number | null
          created_at: string
          credit: number | null
          debit: number | null
          description: string | null
          entry_date: string | null
          id: string
          project_id: string | null
          updated_at: string
        }[]
      }
      update_hr_documents: {
        Args: {
          _id: string
          _employee_id?: string
          _document_type?: string
          _url?: string
          _uploaded_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          document_type: string | null
          employee_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      update_inspections: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _inspection_type?: string
          _date?: string
          _status?: string
          _result?: Json
          _notes?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          date: string | null
          id: string
          inspection_type: string | null
          name: string
          notes: string | null
          project_id: string | null
          result: Json | null
          status: string | null
          updated_at: string
        }[]
      }
      update_integration_tokens: {
        Args: {
          _id: string
          _profile_id?: string
          _service_name?: string
          _token?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          id: string
          profile_id: string | null
          service_name: string | null
          token: string | null
          updated_at: string
        }[]
      }
      update_inventory_transactions: {
        Args: {
          _id: string
          _material_id?: string
          _transaction_type?: string
          _quantity?: number
          _transaction_date?: string
          _notes?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          material_id: string | null
          notes: string | null
          quantity: number | null
          transaction_date: string | null
          transaction_type: string | null
          updated_at: string
        }[]
      }
      update_issues: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _type?: string
          _status?: string
          _reported_by?: string
          _description?: string
          _resolved?: boolean
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          status: string | null
          type: string | null
          updated_at: string
        }[]
      }
      update_job_titles: {
        Args: {
          _id: string
          _name?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }[]
      }
      update_labor_records: {
        Args: {
          _id: string
          _line_item_id?: string
          _worker_count?: number
          _hours_worked?: number
          _work_date?: string
          _work_type?: string
          _notes?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          hours_worked: number | null
          id: string
          line_item_id: string | null
          notes: string | null
          updated_at: string
          work_date: string | null
          work_type: string | null
          worker_count: number | null
        }[]
      }
      update_line_item_entries: {
        Args: {
          _id: string
          _line_item_id?: string
          _date?: string
          _quantity_completed?: number
          _notes?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          date: string
          id: string
          line_item_id: string | null
          notes: string | null
          quantity_completed: number | null
          updated_at: string
        }[]
      }
      update_line_item_templates: {
        Args: {
          _id: string
          _name?: string
          _formula?: Json
          _variables?: Json
          _created_by?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          created_by: string | null
          formula: Json | null
          id: string
          name: string
          updated_at: string
          variables: Json | null
        }[]
      }
      update_line_items: {
        Args: {
          _id: string
          _map_id?: string
          _wbs_id?: string
          _project_id?: string
          _cost_code_id?: string
          _template_id?: string
          _name?: string
          _description?: string
          _unit_measure?: string
          _quantity?: number
          _unit_price?: number
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          cost_code_id: string | null
          created_at: string | null
          description: string | null
          id: string
          map_id: string | null
          name: string
          project_id: string | null
          quantity: number | null
          template_id: string | null
          unit_measure: string
          unit_price: number | null
          updated_at: string
          wbs_id: string | null
        }[]
      }
      update_maps: {
        Args: {
          _id: string
          _wbs_id?: string
          _project_id?: string
          _name?: string
          _description?: string
          _coordinates?: string
          _scope?: string
          _order_num?: number
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          coordinates: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_num: number | null
          project_id: string | null
          scope: string | null
          updated_at: string
          wbs_id: string | null
        }[]
      }
      update_material_inventory: {
        Args: {
          _id: string
          _material_id?: string
          _organization_id?: string
          _quantity?: number
          _last_updated?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          last_updated: string | null
          material_id: string | null
          organization_id: string | null
          quantity: number | null
          updated_at: string
        }[]
      }
      update_material_orders: {
        Args: {
          _id: string
          _material_id?: string
          _project_id?: string
          _order_date?: string
          _quantity?: number
          _status?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          material_id: string | null
          order_date: string | null
          project_id: string | null
          quantity: number | null
          status: string | null
          updated_at: string
        }[]
      }
      update_material_receipts: {
        Args: {
          _id: string
          _material_order_id?: string
          _received_date?: string
          _quantity?: number
          _received_by?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          material_order_id: string | null
          quantity: number | null
          received_by: string | null
          received_date: string | null
          updated_at: string
        }[]
      }
      update_materials: {
        Args: {
          _id: string
          _organization_id?: string
          _name?: string
          _description?: string
          _unit?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          unit: string | null
          updated_at: string
        }[]
      }
      update_meeting_minutes: {
        Args: {
          _id: string
          _project_id?: string
          _meeting_date?: string
          _notes?: string
          _created_by?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          created_by: string | null
          id: string
          meeting_date: string | null
          notes: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      update_notifications: {
        Args: {
          _id: string
          _user_id?: string
          _category?: Database["public"]["Enums"]["notification_category"]
          _message?: string
          _payload?: Json
          _is_read?: boolean
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          is_read: boolean
          message: string
          payload: Json | null
          updated_at: string
          user_id: string
        }[]
      }
      update_organization_members: {
        Args: {
          _id: string
          _profile_id?: string
          _organization_id?: string
          _role?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
          role: string | null
          updated_at: string
        }[]
      }
      update_organization_projects: {
        Args: {
          _id: string
          _organization_id?: string
          _project_id?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          id: string
          organization_id: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      update_organizations: {
        Args: {
          _id: string
          _name?: string
          _description?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }[]
      }
      update_payments: {
        Args: {
          _id: string
          _project_id?: string
          _commitment_id?: string
          _amount?: number
          _paid_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          amount: number | null
          commitment_id: string | null
          created_at: string
          id: string
          paid_at: string | null
          project_id: string | null
          updated_at: string
        }[]
      }
      update_payroll: {
        Args: {
          _id: string
          _employee_id?: string
          _pay_period_start?: string
          _pay_period_end?: string
          _gross_pay?: number
          _net_pay?: number
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          employee_id: string | null
          gross_pay: number | null
          id: string
          net_pay: number | null
          pay_period_end: string | null
          pay_period_start: string | null
          updated_at: string
        }[]
      }
      update_photos: {
        Args: {
          _id: string
          _project_id?: string
          _url?: string
          _caption?: string
          _uploaded_by?: string
          _uploaded_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          caption: string | null
          created_at: string
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          url: string
        }[]
      }
      update_prequalifications: {
        Args: {
          _id: string
          _vendor_id?: string
          _status?: string
          _reviewed_by?: string
          _reviewed_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      update_procurement_workflows: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _status?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      update_profiles: {
        Args: {
          _id: string
          _email?: string
          _full_name?: string
          _phone?: string
          _job_title_id?: string
          _organization_id?: string
          _avatar_url?: string
          _created_at?: string
          _updated_at?: string
          _role?: Database["public"]["Enums"]["user_role_type"]
        }
        Returns: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          job_title_id: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role_type"] | null
          updated_at: string
        }[]
      }
      update_progress_billings: {
        Args: {
          _id: string
          _project_id?: string
          _billing_number?: string
          _amount?: number
          _status?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          amount: number | null
          billing_number: string | null
          created_at: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      update_project_inspectors: {
        Args: {
          _id: string
          _project_id?: string
          _profile_id?: string
          _assigned_by?: string
          _assigned_at?: string
        }
        Returns: {
          assigned_at: string | null
          assigned_by: string | null
          profile_id: string
          project_id: string
        }[]
      }
      update_projects: {
        Args: {
          _id: string
          _organization_id?: string
          _name?: string
          _description?: string
          _status?: Database["public"]["Enums"]["project_status"]
          _start_date?: string
          _end_date?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string
        }[]
      }
      update_punch_lists: {
        Args: {
          _id: string
          _project_id?: string
          _item?: string
          _status?: string
          _assigned_to?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          assigned_to: string | null
          created_at: string | null
          id: string
          item: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
      }
      update_purchase_orders: {
        Args: {
          _id: string
          _project_id?: string
          _vendor_id?: string
          _order_number?: string
          _order_date?: string
          _amount?: number
          _status?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          amount: number | null
          created_at: string
          id: string
          order_date: string | null
          order_number: string | null
          project_id: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      update_quality_reviews: {
        Args: {
          _id: string
          _project_id?: string
          _review_date?: string
          _reviewer?: string
          _findings?: Json
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          findings: Json | null
          id: string
          project_id: string | null
          review_date: string | null
          reviewer: string | null
          updated_at: string
        }[]
      }
      update_regulatory_documents: {
        Args: {
          _id: string
          _project_id?: string
          _document_type?: string
          _url?: string
          _uploaded_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }[]
      }
      update_reports: {
        Args: {
          _id: string
          _project_id?: string
          _report_type?: string
          _generated_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          generated_at: string | null
          id: string
          project_id: string | null
          report_type: string | null
          updated_at: string
        }[]
      }
      update_rfis: {
        Args: {
          _id: string
          _project_id?: string
          _subject?: string
          _status?: string
          _question?: string
          _answer?: string
          _submitted_by?: string
          _reviewed_by?: string
          _submitted_at?: string
          _reviewed_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          answer: string | null
          created_at: string
          id: string
          project_id: string | null
          question: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          subject: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }[]
      }
      update_safety_incidents: {
        Args: {
          _id: string
          _project_id?: string
          _incident_date?: string
          _description?: string
          _reported_by?: string
          _severity?: string
          _resolved?: boolean
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          description: string | null
          id: string
          incident_date: string | null
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          severity: string | null
          updated_at: string
        }[]
      }
      update_sensor_data: {
        Args: {
          _id: string
          _project_id?: string
          _data?: Json
          _collected_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          collected_at: string | null
          created_at: string
          data: Json | null
          id: string
          project_id: string | null
          updated_at: string
        }[]
      }
      update_subcontractor_agreements: {
        Args: {
          _id: string
          _subcontract_id?: string
          _agreement_url?: string
          _signed_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          agreement_url: string | null
          created_at: string
          id: string
          signed_at: string | null
          subcontract_id: string | null
          updated_at: string
        }[]
      }
      update_subcontracts: {
        Args: {
          _id: string
          _project_id?: string
          _vendor_id?: string
          _amount?: number
          _status?: string
          _signed_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          amount: number | null
          created_at: string
          id: string
          project_id: string | null
          signed_at: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      update_submittals: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _status?: Database["public"]["Enums"]["general_status"]
          _submitted_by?: string
          _reviewed_by?: string
          _submitted_at?: string
          _reviewed_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          name: string | null
          project_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }[]
      }
      update_tack_rates: {
        Args: {
          _id: string
          _project_id?: string
          _rate?: number
          _material_type?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          material_type: string | null
          project_id: string | null
          rate: number | null
          updated_at: string
        }[]
      }
      update_task_dependencies: {
        Args: {
          _id: string
          _task_id?: string
          _depends_on_task_id?: string
          _created_at?: string
        }
        Returns: {
          created_at: string
          depends_on_task_id: string
          id: string
          task_id: string
        }[]
      }
      update_task_status_logs: {
        Args: {
          _id: string
          _task_id?: string
          _status?: Database["public"]["Enums"]["task_status"]
          _changed_at?: string
        }
        Returns: {
          changed_at: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
        }[]
      }
      update_tasks: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _description?: string
          _start_date?: string
          _end_date?: string
          _status?: Database["public"]["Enums"]["task_status"]
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }[]
      }
      update_training_records: {
        Args: {
          _id: string
          _employee_id?: string
          _training_type?: string
          _completion_date?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          completion_date: string | null
          created_at: string
          employee_id: string | null
          id: string
          training_type: string | null
          updated_at: string
        }[]
      }
      update_user_projects: {
        Args: {
          _id: string
          _user_id?: string
          _project_id?: string
          _role?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          id: string
          project_id: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }[]
      }
      update_vendor_bid_packages: {
        Args: {
          _id: string
          _bid_package_id?: string
          _vendor_id?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          bid_package_id: string | null
          created_at: string | null
          id: string
          updated_at: string
          vendor_id: string | null
        }[]
      }
      update_vendor_contacts: {
        Args: {
          _id: string
          _vendor_id?: string
          _name?: string
          _email?: string
          _phone?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      update_vendor_documents: {
        Args: {
          _id: string
          _vendor_id?: string
          _document_type?: string
          _url?: string
          _uploaded_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          document_type: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
          vendor_id: string | null
        }[]
      }
      update_vendor_qualifications: {
        Args: {
          _id: string
          _vendor_id?: string
          _qualification_type?: string
          _status?: string
          _reviewed_at?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          id: string
          qualification_type: string | null
          reviewed_at: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }[]
      }
      update_vendors: {
        Args: {
          _id: string
          _organization_id?: string
          _name?: string
          _status?: Database["public"]["Enums"]["general_status"]
          _contact_email?: string
          _contact_phone?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          updated_at: string
        }[]
      }
      update_wbs: {
        Args: {
          _id: string
          _project_id?: string
          _name?: string
          _location?: string
          _order_num?: number
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          order_num: number | null
          project_id: string | null
          updated_at: string
        }[]
      }
      update_workflows: {
        Args: {
          _id: string
          _entity_schema?: string
          _entity_table?: string
          _entity_id?: string
          _workflow_name?: Database["public"]["Enums"]["workflow_name"]
          _current_state?: string
          _created_at?: string
          _updated_at?: string
        }
        Returns: {
          created_at: string
          current_state: string
          entity_id: string
          entity_schema: string
          entity_table: string
          id: string
          updated_at: string
          workflow_name: Database["public"]["Enums"]["workflow_name"]
        }[]
      }
    }
    Enums: {
      certification_type:
        | "osha_10"
        | "osha_30"
        | "cpr"
        | "first_aid"
        | "equipment_card"
        | "other"
      commitment_type: "subcontract" | "purchase_order" | "change_order"
      document_type:
        | "drawing"
        | "spec"
        | "rfi"
        | "submittal"
        | "change_order"
        | "other"
      equipment_type:
        | "truck"
        | "excavator"
        | "grader"
        | "roller"
        | "loader"
        | "misc"
      general_status:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "active"
        | "inactive"
        | "complete"
        | "closed"
      issue_type: "safety" | "quality" | "field" | "equipment" | "other"
      notification_category:
        | "bid_received"
        | "approval_needed"
        | "deadline_reminder"
        | "task_assigned"
        | "workflow_update"
        | "general"
      org_role:
        | "admin"
        | "manager"
        | "superintendent"
        | "foreman"
        | "worker"
        | "viewer"
        | "accountant"
        | "hr"
        | "estimator"
        | "guest"
      project_status:
        | "planned"
        | "active"
        | "complete"
        | "archived"
        | "on_hold"
        | "canceled"
      task_status: "not_started" | "in_progress" | "completed" | "blocked"
      unit_measure:
        | "Feet (FT)"
        | "Inches (IN)"
        | "Linear Feet (LF)"
        | "Mile (MI)"
        | "Shoulder Mile (SMI)"
        | "Square Feet (SF)"
        | "Square Yard (SY)"
        | "Acre (AC)"
        | "Cubic Foot (CF)"
        | "Cubic Yard (CY)"
        | "Gallon (GAL)"
        | "Pounds (LBS)"
        | "TON"
        | "Each (EA)"
        | "Lump Sum (LS)"
        | "Hour (HR)"
        | "DAY"
        | "Station (STA)"
        | "MSF (1000SF)"
        | "MLF (1000LF)"
        | "Cubic Feet per Second (CFS)"
        | "Pounds per Square Inch (PSI)"
        | "Percent (%)"
        | "Degrees (*)"
      user_role_type:
        | "system_admin"
        | "org_admin"
        | "org_supervisor"
        | "org_user"
        | "org_viewer"
        | "inspector"
        | "auditor"
      workflow_name:
        | "estimate_submission"
        | "bid_submission"
        | "bid_review"
        | "contract_award"
        | "task_execution"
        | "inspection"
        | "project_closeout"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      certification_type: [
        "osha_10",
        "osha_30",
        "cpr",
        "first_aid",
        "equipment_card",
        "other",
      ],
      commitment_type: ["subcontract", "purchase_order", "change_order"],
      document_type: [
        "drawing",
        "spec",
        "rfi",
        "submittal",
        "change_order",
        "other",
      ],
      equipment_type: [
        "truck",
        "excavator",
        "grader",
        "roller",
        "loader",
        "misc",
      ],
      general_status: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "active",
        "inactive",
        "complete",
        "closed",
      ],
      issue_type: ["safety", "quality", "field", "equipment", "other"],
      notification_category: [
        "bid_received",
        "approval_needed",
        "deadline_reminder",
        "task_assigned",
        "workflow_update",
        "general",
      ],
      org_role: [
        "admin",
        "manager",
        "superintendent",
        "foreman",
        "worker",
        "viewer",
        "accountant",
        "hr",
        "estimator",
        "guest",
      ],
      project_status: [
        "planned",
        "active",
        "complete",
        "archived",
        "on_hold",
        "canceled",
      ],
      task_status: ["not_started", "in_progress", "completed", "blocked"],
      unit_measure: [
        "Feet (FT)",
        "Inches (IN)",
        "Linear Feet (LF)",
        "Mile (MI)",
        "Shoulder Mile (SMI)",
        "Square Feet (SF)",
        "Square Yard (SY)",
        "Acre (AC)",
        "Cubic Foot (CF)",
        "Cubic Yard (CY)",
        "Gallon (GAL)",
        "Pounds (LBS)",
        "TON",
        "Each (EA)",
        "Lump Sum (LS)",
        "Hour (HR)",
        "DAY",
        "Station (STA)",
        "MSF (1000SF)",
        "MLF (1000LF)",
        "Cubic Feet per Second (CFS)",
        "Pounds per Square Inch (PSI)",
        "Percent (%)",
        "Degrees (*)",
      ],
      user_role_type: [
        "system_admin",
        "org_admin",
        "org_supervisor",
        "org_user",
        "org_viewer",
        "inspector",
        "auditor",
      ],
      workflow_name: [
        "estimate_submission",
        "bid_submission",
        "bid_review",
        "contract_award",
        "task_execution",
        "inspection",
        "project_closeout",
      ],
    },
  },
} as const
