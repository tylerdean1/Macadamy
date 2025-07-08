export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      asphalt_types: {
        Row: {
          compaction_min: number | null
          created_at: string | null
          id: string
          jmf_temp_max: number | null
          jmf_temp_min: number | null
          lift_depth_inches: number | null
          name: string
          notes: string | null
          target_spread_rate_lbs_per_sy: number | null
        }
        Insert: {
          compaction_min?: number | null
          created_at?: string | null
          id?: string
          jmf_temp_max?: number | null
          jmf_temp_min?: number | null
          lift_depth_inches?: number | null
          name: string
          notes?: string | null
          target_spread_rate_lbs_per_sy?: number | null
        }
        Update: {
          compaction_min?: number | null
          created_at?: string | null
          id?: string
          jmf_temp_max?: number | null
          jmf_temp_min?: number | null
          lift_depth_inches?: number | null
          name?: string
          notes?: string | null
          target_spread_rate_lbs_per_sy?: number | null
        }
        Relationships: []
      }
      avatars: {
        Row: {
          created_at: string | null
          id: string
          is_preset: boolean
          name: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_preset?: boolean
          name: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_preset?: boolean
          name?: string
          url?: string
        }
        Relationships: []
      }
      change_orders: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          attachments: string[] | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          line_item_id: string | null
          new_quantity: number
          new_unit_price: number | null
          status: Database["public"]["Enums"]["change_order_status"]
          submitted_date: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          attachments?: string[] | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          line_item_id?: string | null
          new_quantity: number
          new_unit_price?: number | null
          status?: Database["public"]["Enums"]["change_order_status"]
          submitted_date?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          attachments?: string[] | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          line_item_id?: string | null
          new_quantity?: number
          new_unit_price?: number | null
          status?: Database["public"]["Enums"]["change_order_status"]
          submitted_date?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_organizations: {
        Row: {
          contract_id: string
          created_at: string | null
          created_by: string
          id: string
          notes: string | null
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"] | null
          updated_at: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          created_by: string
          id?: string
          notes?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"] | null
          updated_at?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          created_by?: string
          id?: string
          notes?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_organizations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          budget: number | null
          coordinates: unknown | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          location: string
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          coordinates?: unknown | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          location: string
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          coordinates?: unknown | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          location?: string
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          created_by: string
          crew_id: string
          id: string
          location_notes: string | null
          map_location_id: string | null
          organization_id: string | null
          profile_id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          created_by: string
          crew_id: string
          id?: string
          location_notes?: string | null
          map_location_id?: string | null
          organization_id?: string | null
          profile_id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          created_by?: string
          crew_id?: string
          id?: string
          location_notes?: string | null
          map_location_id?: string | null
          organization_id?: string | null
          profile_id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_map_location_id_fkey"
            columns: ["map_location_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_profile_id_fkey"
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
          created_by: string
          description: string | null
          foreman_id: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          foreman_id?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          foreman_id?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crews_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crews_foreman_id_fkey"
            columns: ["foreman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          contract_id: string
          created_at: string
          created_by: string | null
          delays_encountered: string | null
          id: string
          log_date: string
          safety_incidents: string | null
          temperature: number | null
          updated_at: string | null
          updated_by: string | null
          visitors: string | null
          weather_conditions: string | null
          work_performed: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          created_by?: string | null
          delays_encountered?: string | null
          id?: string
          log_date?: string
          safety_incidents?: string | null
          temperature?: number | null
          updated_at?: string | null
          updated_by?: string | null
          visitors?: string | null
          weather_conditions?: string | null
          work_performed?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          created_by?: string | null
          delays_encountered?: string | null
          id?: string
          log_date?: string
          safety_incidents?: string | null
          temperature?: number | null
          updated_at?: string | null
          updated_by?: string | null
          visitors?: string | null
          weather_conditions?: string | null
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
        Row: {
          created_at: string | null
          new_change_order_ids: string[] | null
          new_contract_ids: string[] | null
          new_contract_org_ids: string[] | null
          new_crew_ids: string[] | null
          new_crew_member_ids: string[] | null
          new_daily_log_ids: string[] | null
          new_entry_ids: string[] | null
          new_equipment_assignment_ids: string[] | null
          new_equipment_ids: string[] | null
          new_inspection_ids: string[] | null
          new_issue_ids: string[] | null
          new_li_crew_ids: string[] | null
          new_li_equipment_ids: string[] | null
          new_line_item_ids: string[] | null
          new_map_ids: string[] | null
          new_organization_ids: string[] | null
          new_profile_id: string | null
          new_template_ids: string[] | null
          new_wbs_ids: string[] | null
          old_change_order_ids: string[] | null
          old_contract_ids: string[] | null
          old_contract_org_ids: string[] | null
          old_crew_ids: string[] | null
          old_crew_member_ids: string[] | null
          old_daily_log_ids: string[] | null
          old_entry_ids: string[] | null
          old_equipment_assignment_ids: string[] | null
          old_equipment_ids: string[] | null
          old_inspection_ids: string[] | null
          old_issue_ids: string[] | null
          old_li_crew_ids: string[] | null
          old_li_equipment_ids: string[] | null
          old_line_item_ids: string[] | null
          old_map_ids: string[] | null
          old_organization_ids: string[] | null
          old_profile_id: string | null
          old_template_ids: string[] | null
          old_wbs_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          new_change_order_ids?: string[] | null
          new_contract_ids?: string[] | null
          new_contract_org_ids?: string[] | null
          new_crew_ids?: string[] | null
          new_crew_member_ids?: string[] | null
          new_daily_log_ids?: string[] | null
          new_entry_ids?: string[] | null
          new_equipment_assignment_ids?: string[] | null
          new_equipment_ids?: string[] | null
          new_inspection_ids?: string[] | null
          new_issue_ids?: string[] | null
          new_li_crew_ids?: string[] | null
          new_li_equipment_ids?: string[] | null
          new_line_item_ids?: string[] | null
          new_map_ids?: string[] | null
          new_organization_ids?: string[] | null
          new_profile_id?: string | null
          new_template_ids?: string[] | null
          new_wbs_ids?: string[] | null
          old_change_order_ids?: string[] | null
          old_contract_ids?: string[] | null
          old_contract_org_ids?: string[] | null
          old_crew_ids?: string[] | null
          old_crew_member_ids?: string[] | null
          old_daily_log_ids?: string[] | null
          old_entry_ids?: string[] | null
          old_equipment_assignment_ids?: string[] | null
          old_equipment_ids?: string[] | null
          old_inspection_ids?: string[] | null
          old_issue_ids?: string[] | null
          old_li_crew_ids?: string[] | null
          old_li_equipment_ids?: string[] | null
          old_line_item_ids?: string[] | null
          old_map_ids?: string[] | null
          old_organization_ids?: string[] | null
          old_profile_id?: string | null
          old_template_ids?: string[] | null
          old_wbs_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          new_change_order_ids?: string[] | null
          new_contract_ids?: string[] | null
          new_contract_org_ids?: string[] | null
          new_crew_ids?: string[] | null
          new_crew_member_ids?: string[] | null
          new_daily_log_ids?: string[] | null
          new_entry_ids?: string[] | null
          new_equipment_assignment_ids?: string[] | null
          new_equipment_ids?: string[] | null
          new_inspection_ids?: string[] | null
          new_issue_ids?: string[] | null
          new_li_crew_ids?: string[] | null
          new_li_equipment_ids?: string[] | null
          new_line_item_ids?: string[] | null
          new_map_ids?: string[] | null
          new_organization_ids?: string[] | null
          new_profile_id?: string | null
          new_template_ids?: string[] | null
          new_wbs_ids?: string[] | null
          old_change_order_ids?: string[] | null
          old_contract_ids?: string[] | null
          old_contract_org_ids?: string[] | null
          old_crew_ids?: string[] | null
          old_crew_member_ids?: string[] | null
          old_daily_log_ids?: string[] | null
          old_entry_ids?: string[] | null
          old_equipment_assignment_ids?: string[] | null
          old_equipment_ids?: string[] | null
          old_inspection_ids?: string[] | null
          old_issue_ids?: string[] | null
          old_li_crew_ids?: string[] | null
          old_li_equipment_ids?: string[] | null
          old_line_item_ids?: string[] | null
          old_map_ids?: string[] | null
          old_organization_ids?: string[] | null
          old_profile_id?: string | null
          old_template_ids?: string[] | null
          old_wbs_ids?: string[] | null
        }
        Relationships: []
      }
      dump_trucks: {
        Row: {
          axle_count: number | null
          bed_height: number | null
          bed_length: number | null
          bed_volume: number | null
          bed_width: number | null
          contract_id: string | null
          created_at: string | null
          equipment_id: string | null
          hoist_bottom: number | null
          hoist_top: number | null
          hoist_width: number | null
          id: string
          notes: string | null
          payload_capacity_tons: number
          truck_identifier: string
        }
        Insert: {
          axle_count?: number | null
          bed_height?: number | null
          bed_length?: number | null
          bed_volume?: number | null
          bed_width?: number | null
          contract_id?: string | null
          created_at?: string | null
          equipment_id?: string | null
          hoist_bottom?: number | null
          hoist_top?: number | null
          hoist_width?: number | null
          id?: string
          notes?: string | null
          payload_capacity_tons: number
          truck_identifier: string
        }
        Update: {
          axle_count?: number | null
          bed_height?: number | null
          bed_length?: number | null
          bed_volume?: number | null
          bed_width?: number | null
          contract_id?: string | null
          created_at?: string | null
          equipment_id?: string | null
          hoist_bottom?: number | null
          hoist_top?: number | null
          hoist_width?: number | null
          id?: string
          notes?: string | null
          payload_capacity_tons?: number
          truck_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "dump_trucks_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          operator_id: string | null
          organization_id: string | null
          standard_pay_rate: number | null
          standard_pay_unit: Database["public"]["Enums"]["pay_rate_unit"] | null
          user_defined_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          operator_id?: string | null
          organization_id?: string | null
          standard_pay_rate?: number | null
          standard_pay_unit?:
            | Database["public"]["Enums"]["pay_rate_unit"]
            | null
          user_defined_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          operator_id?: string | null
          organization_id?: string | null
          standard_pay_rate?: number | null
          standard_pay_unit?:
            | Database["public"]["Enums"]["pay_rate_unit"]
            | null
          user_defined_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assignments: {
        Row: {
          bid_rate: number | null
          contract_id: string
          created_at: string | null
          created_by: string
          end_date: string | null
          equipment_id: string
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          wbs_id: string | null
        }
        Insert: {
          bid_rate?: number | null
          contract_id: string
          created_at?: string | null
          created_by: string
          end_date?: string | null
          equipment_id: string
          id?: string
          line_item_id?: string | null
          map_id?: string | null
          notes?: string | null
          operator_id?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          wbs_id?: string | null
        }
        Update: {
          bid_rate?: number | null
          contract_id?: string
          created_at?: string | null
          created_by?: string
          end_date?: string | null
          equipment_id?: string
          id?: string
          line_item_id?: string | null
          map_id?: string | null
          notes?: string | null
          operator_id?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          wbs_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assignments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_wbs_id_fkey"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_usage: {
        Row: {
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          equipment_id: string | null
          hours_used: number
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          updated_at: string | null
          updated_by: string | null
          usage_date: string
          wbs_id: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          equipment_id?: string | null
          hours_used: number
          id?: string
          line_item_id?: string | null
          map_id?: string | null
          notes?: string | null
          operator_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_date?: string
          wbs_id?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          equipment_id?: string | null
          hours_used?: number
          id?: string
          line_item_id?: string | null
          map_id?: string | null
          notes?: string | null
          operator_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_date?: string
          wbs_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_usage_contract_fk"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_usage_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_usage_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_usage_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_usage_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_usage_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_usage_wbs_id_fkey"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          contract_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          name: string
          pdf_url: string | null
          photo_urls: string[] | null
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          line_item_id?: string | null
          map_id?: string | null
          name: string
          pdf_url?: string | null
          photo_urls?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          wbs_id?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          line_item_id?: string | null
          map_id?: string | null
          name?: string
          pdf_url?: string | null
          photo_urls?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          wbs_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_wbs_id_fkey"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assigned_to: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string | null
          equipment_id: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          photo_urls: string[] | null
          priority: Database["public"]["Enums"]["priority"] | null
          resolution: string | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          due_date?: string | null
          equipment_id?: string | null
          id?: string
          line_item_id?: string | null
          map_id?: string | null
          photo_urls?: string[] | null
          priority?: Database["public"]["Enums"]["priority"] | null
          resolution?: string | null
          status: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
          wbs_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          due_date?: string | null
          equipment_id?: string | null
          id?: string
          line_item_id?: string | null
          map_id?: string | null
          photo_urls?: string[] | null
          priority?: Database["public"]["Enums"]["priority"] | null
          resolution?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          wbs_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_wbs_id_fkey"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_titles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_custom: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_custom?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_custom?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_titles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_records: {
        Row: {
          id: string
          line_item_id: string
          worker_count: number
          hours_worked: number
          work_date: string
          work_type: string
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          line_item_id: string
          worker_count?: number
          hours_worked?: number
          work_date?: string
          work_type?: string
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          line_item_id?: string
          worker_count?: number
          hours_worked?: number
          work_date?: string
          work_type?: string
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labor_records_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_entries: {
        Row: {
          computed_output: number | null
          contract_id: string
          created_at: string | null
          entered_by: string | null
          id: string
          input_variables: Json
          line_item_id: string
          map_id: string
          notes: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
          wbs_id: string
        }
        Insert: {
          computed_output?: number | null
          contract_id: string
          created_at?: string | null
          entered_by?: string | null
          id?: string
          input_variables: Json
          line_item_id: string
          map_id: string
          notes?: string | null
          output_unit?: Database["public"]["Enums"]["unit_measure_type"] | null
          wbs_id: string
        }
        Update: {
          computed_output?: number | null
          contract_id?: string
          created_at?: string | null
          entered_by?: string | null
          id?: string
          input_variables?: Json
          line_item_id?: string
          map_id?: string
          notes?: string | null
          output_unit?: Database["public"]["Enums"]["unit_measure_type"] | null
          wbs_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_item_entries_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_entries_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_entries_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_entries_wbs_id_fkey"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          formula: Json | null
          id: string
          instructions: string | null
          name: string | null
          organization_id: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          formula?: Json | null
          id: string
          instructions?: string | null
          name?: string | null
          organization_id?: string | null
          output_unit?: Database["public"]["Enums"]["unit_measure_type"] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          formula?: Json | null
          id?: string
          instructions?: string | null
          name?: string | null
          organization_id?: string | null
          output_unit?: Database["public"]["Enums"]["unit_measure_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "line_item_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          contract_id: string | null
          coordinates: unknown | null
          created_at: string | null
          description: string
          id: string
          line_code: string
          map_id: string | null
          quantity: number
          reference_doc: string | null
          template_id: string | null
          unit_measure: Database["public"]["Enums"]["unit_measure_type"]
          unit_price: number
          updated_at: string | null
          wbs_id: string
        }
        Insert: {
          contract_id?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          description: string
          id?: string
          line_code: string
          map_id?: string | null
          quantity: number
          reference_doc?: string | null
          template_id?: string | null
          unit_measure: Database["public"]["Enums"]["unit_measure_type"]
          unit_price: number
          updated_at?: string | null
          wbs_id: string
        }
        Update: {
          contract_id?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          description?: string
          id?: string
          line_code?: string
          map_id?: string | null
          quantity?: number
          reference_doc?: string | null
          template_id?: string | null
          unit_measure?: Database["public"]["Enums"]["unit_measure_type"]
          unit_price?: number
          updated_at?: string | null
          wbs_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_items_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_items_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "line_item_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_items_wbs_id_fkey"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
        ]
      }
      maps: {
        Row: {
          budget: number | null
          contract_id: string | null
          coordinates: unknown | null
          created_at: string | null
          id: string
          location: string | null
          map_number: string
          scope: string | null
          updated_at: string | null
          wbs_id: string
        }
        Insert: {
          budget?: number | null
          contract_id?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          location?: string | null
          map_number: string
          scope?: string | null
          updated_at?: string | null
          wbs_id: string
        }
        Update: {
          budget?: number | null
          contract_id?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          location?: string | null
          map_number?: string
          scope?: string | null
          updated_at?: string | null
          wbs_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "map_locations_wbs_id_fkey"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maps_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          job_title_id: string | null
          location: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          job_title_id?: string | null
          location?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          job_title_id?: string | null
          location?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      tack_rates: {
        Row: {
          application_rate: number
          created_at: string | null
          id: string
          notes: string | null
          surface_type: string
        }
        Insert: {
          application_rate: number
          created_at?: string | null
          id?: string
          notes?: string | null
          surface_type: string
        }
        Update: {
          application_rate?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          surface_type?: string
        }
        Relationships: []
      }
      user_contracts: {
        Row: {
          contract_id: string
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }
        Insert: {
          contract_id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }
        Update: {
          contract_id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_contracts_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wbs: {
        Row: {
          budget: number | null
          contract_id: string
          coordinates: unknown | null
          created_at: string | null
          id: string
          location: string | null
          scope: string | null
          updated_at: string | null
          wbs_number: string
        }
        Insert: {
          budget?: number | null
          contract_id: string
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          location?: string | null
          scope?: string | null
          updated_at?: string | null
          wbs_number: string
        }
        Update: {
          budget?: number | null
          contract_id?: string
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          location?: string | null
          scope?: string | null
          updated_at?: string | null
          wbs_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "wbs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
        Returns: string
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_cy: {
        Args: { length: number; width: number; depth: number }
        Returns: number
      }
      calculate_sy: {
        Args: { length: number; width: number }
        Returns: number
      }
      calculate_tons: {
        Args: { volume: number; density: number }
        Returns: number
      }
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
        Returns: undefined
      }
        Returns: undefined
      }
        Returns: undefined
      }
        Returns: undefined
      }
        Returns: undefined
      }
        Returns: undefined
      }
        Returns: undefined
      }
        Returns: undefined
      }
        Args: { base_profile_email: string }
        Returns: Json
      }
      custom_access_token_hook: {
        Args: { claims: Json }
        Returns: Json
      }
      delete_asphalt_type: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_avatars: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_change_order: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_contract: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_contract_organization: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_crew: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_crew_member: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_crews: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_daily_log: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_dump_truck: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_equipment: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_equipment_assignment: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_equipment_usage: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_inspection: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_issue: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_issues: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_job_title: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_labor_record: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_line_item: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_line_item_entry: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_line_item_template: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_map: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_organization: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_profile: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_tack_rates: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_user_contract: {
        Args: { _user_id: string; _contract_id: string }
        Returns: undefined
      }
      delete_wbs: {
        Args: { _id: string }
        Returns: undefined
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      filtered_by_axle_count_dump_trucks: {
        Args: { _axle_count: number }
        Returns: {
          axle_count: number | null
          bed_height: number | null
          bed_length: number | null
          bed_volume: number | null
          bed_width: number | null
          contract_id: string | null
          created_at: string | null
          equipment_id: string | null
          hoist_bottom: number | null
          hoist_top: number | null
          hoist_width: number | null
          id: string
          notes: string | null
          payload_capacity_tons: number
          truck_identifier: string
        }[]
      }
      filtered_by_contract_daily_logs: {
        Args: { _contract_id: string }
        Returns: {
          contract_id: string
          created_at: string
          created_by: string | null
          delays_encountered: string | null
          id: string
          log_date: string
          safety_incidents: string | null
          temperature: number | null
          updated_at: string | null
          updated_by: string | null
          visitors: string | null
          weather_conditions: string | null
          work_performed: string | null
        }[]
      }
      filtered_by_contract_dump_trucks: {
        Args: { _contract_id: string }
        Returns: {
          axle_count: number | null
          bed_height: number | null
          bed_length: number | null
          bed_volume: number | null
          bed_width: number | null
          contract_id: string | null
          created_at: string | null
          equipment_id: string | null
          hoist_bottom: number | null
          hoist_top: number | null
          hoist_width: number | null
          id: string
          notes: string | null
          payload_capacity_tons: number
          truck_identifier: string
        }[]
      }
      filtered_by_contract_equipment_assignments: {
        Args: { _contract_id: string }
        Returns: {
          bid_rate: number | null
          contract_id: string
          created_at: string | null
          created_by: string
          end_date: string | null
          equipment_id: string
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_contract_equipment_usage: {
        Args: { _contract_id: string }
        Returns: {
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          equipment_id: string | null
          hours_used: number
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          updated_at: string | null
          updated_by: string | null
          usage_date: string
          wbs_id: string | null
        }[]
      }
      filtered_by_contract_inspections: {
        Args: { _contract_id: string }
        Returns: {
          contract_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          name: string
          pdf_url: string | null
          photo_urls: string[] | null
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_contract_issues: {
        Args: { _contract_id: string }
        Returns: {
          assigned_to: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string | null
          equipment_id: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          photo_urls: string[] | null
          priority: Database["public"]["Enums"]["priority"] | null
          resolution: string | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_contract_line_item_entries: {
        Args: { _contract_id: string }
        Returns: {
          computed_output: number | null
          contract_id: string
          created_at: string | null
          entered_by: string | null
          id: string
          input_variables: Json
          line_item_id: string
          map_id: string
          notes: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
          wbs_id: string
        }[]
      }
      filtered_by_contract_line_items: {
        Args: { _contract_id: string }
        Returns: {
          id: string
          contract_id: string
          wbs_id: string
          map_id: string
          description: string
          line_code: string
          quantity: number
          reference_doc: string
          template_id: string
          unit_measure: Database["public"]["Enums"]["unit_measure_type"]
          unit_price: number
          created_at: string
          updated_at: string
          coordinates_wkt: string
        }[]
      }
      filtered_by_contract_maps: {
        Args: { _contract_id: string }
        Returns: {
          id: string
          contract_id: string
          wbs_id: string
          map_number: string
          location: string
          scope: string
          budget: number
          created_at: string
          updated_at: string
          coordinates_wkt: string
        }[]
      }
      filtered_by_contract_user_contracts: {
        Args: { _contract_id: string }
        Returns: {
          contract_id: string
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }[]
      }
      filtered_by_contract_wbs: {
        Args: { _contract_id: string }
        Returns: {
          id: string
          contract_id: string
          wbs_number: string
          location: string
          budget: number
          scope: string
          created_at: string
          updated_at: string
          coordinates_wkt: string
        }[]
      }
      filtered_by_crew_crew_members: {
        Args: { _crew_id: string }
        Returns: {
          assigned_at: string | null
          created_at: string | null
          created_by: string
          crew_id: string
          id: string
          location_notes: string | null
          map_location_id: string | null
          organization_id: string | null
          profile_id: string
          role: string | null
          updated_at: string | null
        }[]
      }
      filtered_by_entered_by_line_item_entries: {
        Args: { _entered_by: string }
        Returns: {
          computed_output: number | null
          contract_id: string
          created_at: string | null
          entered_by: string | null
          id: string
          input_variables: Json
          line_item_id: string
          map_id: string
          notes: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
          wbs_id: string
        }[]
      }
      filtered_by_equipment_equipment_assignments: {
        Args: { _equipment_id: string }
        Returns: {
          bid_rate: number | null
          contract_id: string
          created_at: string | null
          created_by: string
          end_date: string | null
          equipment_id: string
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_equipment_equipment_usage: {
        Args: { _equipment_id: string }
        Returns: {
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          equipment_id: string | null
          hours_used: number
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          updated_at: string | null
          updated_by: string | null
          usage_date: string
          wbs_id: string | null
        }[]
      }
      filtered_by_equipment_issues: {
        Args: { _equipment_id: string }
        Returns: {
          assigned_to: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string | null
          equipment_id: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          photo_urls: string[] | null
          priority: Database["public"]["Enums"]["priority"] | null
          resolution: string | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_line_code_line_items: {
        Args: { _line_code: string }
        Returns: {
          contract_id: string | null
          coordinates: unknown | null
          created_at: string | null
          description: string
          id: string
          line_code: string
          map_id: string | null
          quantity: number
          reference_doc: string | null
          template_id: string | null
          unit_measure: Database["public"]["Enums"]["unit_measure_type"]
          unit_price: number
          updated_at: string | null
          wbs_id: string
        }[]
      }
      filtered_by_line_item_equipment_assignments: {
        Args: { _line_item_id: string }
        Returns: {
          bid_rate: number | null
          contract_id: string
          created_at: string | null
          created_by: string
          end_date: string | null
          equipment_id: string
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_line_item_equipment_usage: {
        Args: { _line_item_id: string }
        Returns: {
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          equipment_id: string | null
          hours_used: number
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          updated_at: string | null
          updated_by: string | null
          usage_date: string
          wbs_id: string | null
        }[]
      }
      filtered_by_line_item_inspections: {
        Args: { _line_item_id: string }
        Returns: {
          contract_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          name: string
          pdf_url: string | null
          photo_urls: string[] | null
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_line_item_issues: {
        Args: { _line_item_id: string }
        Returns: {
          assigned_to: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string | null
          equipment_id: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          photo_urls: string[] | null
          priority: Database["public"]["Enums"]["priority"] | null
          resolution: string | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_line_item_line_item_entries: {
        Args: { _line_item_id: string }
        Returns: {
          computed_output: number | null
          contract_id: string
          created_at: string | null
          entered_by: string | null
          id: string
          input_variables: Json
          line_item_id: string
          map_id: string
          notes: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
          wbs_id: string
        }[]
      }
      filtered_by_map_equipment_assignments: {
        Args: { _map_id: string }
        Returns: {
          bid_rate: number | null
          contract_id: string
          created_at: string | null
          created_by: string
          end_date: string | null
          equipment_id: string
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_map_equipment_usage: {
        Args: { _map_id: string }
        Returns: {
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          equipment_id: string | null
          hours_used: number
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          updated_at: string | null
          updated_by: string | null
          usage_date: string
          wbs_id: string | null
        }[]
      }
      filtered_by_map_inspections: {
        Args: { _map_id: string }
        Returns: {
          contract_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          name: string
          pdf_url: string | null
          photo_urls: string[] | null
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_map_issues: {
        Args: { _map_id: string }
        Returns: {
          assigned_to: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string | null
          equipment_id: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          photo_urls: string[] | null
          priority: Database["public"]["Enums"]["priority"] | null
          resolution: string | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_map_line_item_entries: {
        Args: { _map_id: string }
        Returns: {
          computed_output: number | null
          contract_id: string
          created_at: string | null
          entered_by: string | null
          id: string
          input_variables: Json
          line_item_id: string
          map_id: string
          notes: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
          wbs_id: string
        }[]
      }
      filtered_by_map_line_items: {
        Args: { _map_id: string }
        Returns: {
          id: string
          contract_id: string
          wbs_id: string
          map_id: string
          description: string
          line_code: string
          quantity: number
          reference_doc: string
          template_id: string
          unit_measure: Database["public"]["Enums"]["unit_measure_type"]
          unit_price: number
          created_at: string
          updated_at: string
          coordinates_wkt: string
        }[]
      }
      filtered_by_max_volume_dump_trucks: {
        Args: { _max_volume: number }
        Returns: {
          axle_count: number | null
          bed_height: number | null
          bed_length: number | null
          bed_volume: number | null
          bed_width: number | null
          contract_id: string | null
          created_at: string | null
          equipment_id: string | null
          hoist_bottom: number | null
          hoist_top: number | null
          hoist_width: number | null
          id: string
          notes: string | null
          payload_capacity_tons: number
          truck_identifier: string
        }[]
      }
      filtered_by_operator_equipment_assignments: {
        Args: { _operator_id: string }
        Returns: {
          bid_rate: number | null
          contract_id: string
          created_at: string | null
          created_by: string
          end_date: string | null
          equipment_id: string
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_operator_equipment_usage: {
        Args: { _operator_id: string }
        Returns: {
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          equipment_id: string | null
          hours_used: number
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          updated_at: string | null
          updated_by: string | null
          usage_date: string
          wbs_id: string | null
        }[]
      }
      filtered_by_organization_contracts: {
        Args: { _organization_id: string }
        Returns: {
          budget: number | null
          coordinates: unknown | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          location: string
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at: string | null
        }[]
      }
      filtered_by_organization_crews: {
        Args: { _organization_id: string }
        Returns: {
          created_at: string | null
          created_by: string
          description: string | null
          foreman_id: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }[]
      }
      filtered_by_organization_equipment: {
        Args: { _organization_id: string }
        Returns: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          operator_id: string | null
          organization_id: string | null
          standard_pay_rate: number | null
          standard_pay_unit: Database["public"]["Enums"]["pay_rate_unit"] | null
          user_defined_id: string | null
        }[]
      }
      filtered_by_organization_line_item_templates: {
        Args: { _organization_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          description: string | null
          formula: Json | null
          id: string
          instructions: string | null
          name: string | null
          organization_id: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
        }[]
      }
      filtered_by_organization_profiles: {
        Args: { _organization_id: string }
        Returns: {
          avatar_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          job_title_id: string | null
          location: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string | null
        }[]
      }
      filtered_by_output_unit_line_item_templates: {
        Args: { _output_unit: Database["public"]["Enums"]["unit_measure_type"] }
        Returns: {
          created_at: string
          created_by: string | null
          description: string | null
          formula: Json | null
          id: string
          instructions: string | null
          name: string | null
          organization_id: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
        }[]
      }
      filtered_by_payload_capacity_dump_trucks: {
        Args: { _payload_capacity_tons: number }
        Returns: {
          axle_count: number | null
          bed_height: number | null
          bed_length: number | null
          bed_volume: number | null
          bed_width: number | null
          contract_id: string | null
          created_at: string | null
          equipment_id: string | null
          hoist_bottom: number | null
          hoist_top: number | null
          hoist_width: number | null
          id: string
          notes: string | null
          payload_capacity_tons: number
          truck_identifier: string
        }[]
      }
      filtered_by_priority_issues: {
        Args: { _priority: Database["public"]["Enums"]["priority"] }
        Returns: {
          assigned_to: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string | null
          equipment_id: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          photo_urls: string[] | null
          priority: Database["public"]["Enums"]["priority"] | null
          resolution: string | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_role_profiles: {
        Args: { _role: Database["public"]["Enums"]["user_role"] }
        Returns: {
          avatar_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          job_title_id: string | null
          location: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string | null
        }[]
      }
      filtered_by_role_user_contracts: {
        Args: { _role: Database["public"]["Enums"]["user_role"] }
        Returns: {
          contract_id: string
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }[]
      }
        Returns: {
          created_at: string | null
          new_change_order_ids: string[] | null
          new_contract_ids: string[] | null
          new_contract_org_ids: string[] | null
          new_crew_ids: string[] | null
          new_crew_member_ids: string[] | null
          new_daily_log_ids: string[] | null
          new_entry_ids: string[] | null
          new_equipment_assignment_ids: string[] | null
          new_equipment_ids: string[] | null
          new_inspection_ids: string[] | null
          new_issue_ids: string[] | null
          new_li_crew_ids: string[] | null
          new_li_equipment_ids: string[] | null
          new_line_item_ids: string[] | null
          new_map_ids: string[] | null
          new_organization_ids: string[] | null
          new_profile_id: string | null
          new_template_ids: string[] | null
          new_wbs_ids: string[] | null
          old_change_order_ids: string[] | null
          old_contract_ids: string[] | null
          old_contract_org_ids: string[] | null
          old_crew_ids: string[] | null
          old_crew_member_ids: string[] | null
          old_daily_log_ids: string[] | null
          old_entry_ids: string[] | null
          old_equipment_assignment_ids: string[] | null
          old_equipment_ids: string[] | null
          old_inspection_ids: string[] | null
          old_issue_ids: string[] | null
          old_li_crew_ids: string[] | null
          old_li_equipment_ids: string[] | null
          old_line_item_ids: string[] | null
          old_map_ids: string[] | null
          old_organization_ids: string[] | null
          old_profile_id: string | null
          old_template_ids: string[] | null
          old_wbs_ids: string[] | null
        }[]
      }
      filtered_by_status_contracts: {
        Args: { _status: Database["public"]["Enums"]["contract_status"] }
        Returns: {
          budget: number | null
          coordinates: unknown | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          location: string
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at: string | null
        }[]
      }
      filtered_by_unit_measure_line_items: {
        Args: {
          _unit_measure: Database["public"]["Enums"]["unit_measure_type"]
        }
        Returns: {
          contract_id: string | null
          coordinates: unknown | null
          created_at: string | null
          description: string
          id: string
          line_code: string
          map_id: string | null
          quantity: number
          reference_doc: string | null
          template_id: string | null
          unit_measure: Database["public"]["Enums"]["unit_measure_type"]
          unit_price: number
          updated_at: string | null
          wbs_id: string
        }[]
      }
      filtered_by_user_user_contracts: {
        Args: { _user_id: string }
        Returns: {
          contract_id: string
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }[]
      }
      filtered_by_wbs_equipment_assignments: {
        Args: { _wbs_id: string }
        Returns: {
          bid_rate: number | null
          contract_id: string
          created_at: string | null
          created_by: string
          end_date: string | null
          equipment_id: string
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_wbs_equipment_usage: {
        Args: { _wbs_id: string }
        Returns: {
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          equipment_id: string | null
          hours_used: number
          id: string
          line_item_id: string | null
          map_id: string | null
          notes: string | null
          operator_id: string | null
          updated_at: string | null
          updated_by: string | null
          usage_date: string
          wbs_id: string | null
        }[]
      }
      filtered_by_wbs_inspections: {
        Args: { _wbs_id: string }
        Returns: {
          contract_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          name: string
          pdf_url: string | null
          photo_urls: string[] | null
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_wbs_issues: {
        Args: { _wbs_id: string }
        Returns: {
          assigned_to: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string | null
          equipment_id: string | null
          id: string
          line_item_id: string | null
          map_id: string | null
          photo_urls: string[] | null
          priority: Database["public"]["Enums"]["priority"] | null
          resolution: string | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
          wbs_id: string | null
        }[]
      }
      filtered_by_wbs_line_item_entries: {
        Args: { _wbs_id: string }
        Returns: {
          computed_output: number | null
          contract_id: string
          created_at: string | null
          entered_by: string | null
          id: string
          input_variables: Json
          line_item_id: string
          map_id: string
          notes: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
          wbs_id: string
        }[]
      }
      filtered_by_wbs_line_items: {
        Args: { _wbs_id: string }
        Returns: {
          id: string
          contract_id: string
          wbs_id: string
          map_id: string
          description: string
          line_code: string
          quantity: number
          reference_doc: string
          template_id: string
          unit_measure: Database["public"]["Enums"]["unit_measure_type"]
          unit_price: number
          created_at: string
          updated_at: string
          coordinates_wkt: string
        }[]
      }
      filtered_by_wbs_maps: {
        Args: { _wbs_id: string }
        Returns: {
          id: string
          contract_id: string
          wbs_id: string
          map_number: string
          location: string
          scope: string
          budget: number
          created_at: string
          updated_at: string
          coordinates_wkt: string
        }[]
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_all_line_item_templates: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          unit_type: Database["public"]["Enums"]["unit_measure_type"]
          formula: Json
          instructions: string
        }[]
      }
      get_all_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          username: string
          email: string
          phone: string
          location: string
          role: Database["public"]["Enums"]["user_role"]
          job_title_id: string
          organization_id: string
          avatar_id: string
          avatar_url: string
        }[]
      }
      get_asphalt_types: {
        Args: Record<PropertyKey, never>
        Returns: {
          compaction_min: number | null
          created_at: string | null
          id: string
          jmf_temp_max: number | null
          jmf_temp_min: number | null
          lift_depth_inches: number | null
          name: string
          notes: string | null
          target_spread_rate_lbs_per_sy: number | null
        }[]
      }
      get_avatars_for_profile: {
        Args: { _profile_id: string }
        Returns: {
          id: string
          url: string
          is_preset: boolean
        }[]
      }
      get_change_orders: {
        Args:
          | {
              _contract_id?: string
              _line_item_id?: string
            }
          | { contract_id: string }
        Returns: {
          approved_by: string | null
          approved_date: string | null
          attachments: string[] | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          line_item_id: string | null
          new_quantity: number
          new_unit_price: number | null
          status: Database["public"]["Enums"]["change_order_status"]
          submitted_date: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }[]
      }
      get_change_orders_count_for_contract: {
        Args: { contract_id_param: string }
        Returns: number
      }
      get_contract_organizations: {
        Args: { contract_id: string }
        Returns: {
          organization_id: string
          notes: string
          role: Database["public"]["Enums"]["organization_role"]
        }[]
      }
      get_contract_with_wkt: {
        Args: { contract_id: string }
        Returns: {
          id: string
          title: string
          description: string
          location: string
          start_date: string
          end_date: string
          budget: number
          status: Database["public"]["Enums"]["contract_status"]
          coordinates_wkt: string
        }[]
      }
      get_crew_members_by_organization: {
        Args: { _organization_id: string }
        Returns: {
          crew_id: string
          profile_id: string
          role: string
          assigned_at: string
          created_by: string
          map_location_id: string
          location_notes: string
        }[]
      }
      get_crews_by_organization: {
        Args: { _organization_id: string }
        Returns: {
          id: string
          name: string
          description: string
          foreman_id: string
          created_by: string
        }[]
      }
      get_daily_logs: {
        Args: { _contract_id: string }
        Returns: {
          id: string
          log_date: string
          weather_conditions: string
          temperature: string
          work_performed: string
          delays_encountered: string
          visitors: string
          safety_incidents: string
          created_by: string
        }[]
      }
      get_dashboard_metrics: {
        Args: { _user_id: string }
        Returns: {
          active_contracts: number
          total_issues: number
          total_inspections: number
        }[]
      }
      get_enriched_profile: {
        Args: { _user_id: string }
        Returns: {
          id: string
          full_name: string
          username: string
          email: string
          phone: string
          location: string
          role: Database["public"]["Enums"]["user_role"]
          job_title_id: string
          organization_id: string
          avatar_id: string
          avatar_url: string
          job_title: string
          organization_name: string
        }[]
      }
      get_enriched_profile_by_username: {
        Args: { _username: string }
        Returns: {
          id: string
          full_name: string
          username: string
          email: string
          phone: string
          location: string
          role: Database["public"]["Enums"]["user_role"]
          job_title_id: string
          organization_id: string
          avatar_id: string
          avatar_url: string
          job_title: string
          organization_name: string
        }[]
      }
      get_enriched_user_contracts: {
        Args: { _user_id: string }
        Returns: {
          id: string
          title: string
          description: string
          location: string
          start_date: string
          end_date: string
          created_by: string
          created_at: string
          updated_at: string
          budget: number
          status: Database["public"]["Enums"]["contract_status"]
          coordinates_wkt: string
          user_contract_role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_enum_values: {
        Args: { enum_type: string }
        Returns: {
          value: string
        }[]
      }
      get_equipment_assignments: {
        Args: { _contract_id: string }
        Returns: {
          id: string
          equipment_id: string
          operator_id: string
          start_date: string
          end_date: string
          status: string
          notes: string
        }[]
      }
      get_equipment_by_organization: {
        Args: { _organization_id: string }
        Returns: {
          id: string
          user_defined_id: string
          name: string
          description: string
          operator_id: string
        }[]
      }
      get_equipment_usage: {
        Args: { _contract_id: string }
        Returns: {
          equipment_id: string
          wbs_id: string
          map_id: string
          line_item_id: string
          usage_date: string
          hours_used: number
          operator_id: string
        }[]
      }
      get_inspections_count_for_contract: {
        Args: { contract_id_param: string }
        Returns: number
      }
      get_issues: {
        Args: { _contract_id: string }
        Returns: {
          id: string
          wbs_id: string
          map_id: string
          line_item_id: string
          equipment_id: string
          title: string
          description: string
          priority: string
          status: string
          due_date: string
          resolution: string
          assigned_to: string
          created_by: string
          photo_urls: string[]
        }[]
      }
      get_issues_count_for_contract: {
        Args: { contract_id_param: string }
        Returns: number
      }
      get_job_titles: {
        Args: Record<PropertyKey, never>
        Returns: {
          title: string
          is_custom: boolean
        }[]
      }
      get_labor_records: {
        Args: { _line_item_id: string }
        Returns: {
          id: string
          line_item_id: string
          worker_count: number
          hours_worked: number
          work_date: string
          work_type: string
          notes: string | null
          created_at: string | null
        }[]
      }
      get_line_item_entries: {
        Args: { _contract_id: string }
        Returns: {
          id: string
          wbs_id: string
          map_id: string
          line_item_id: string
          entered_by: string
          input_variables: Json
          computed_output: number
          notes: string
          output_unit: Database["public"]["Enums"]["unit_measure_type"]
        }[]
      }
      get_line_item_templates_by_organization: {
        Args: { _organization_id: string }
        Returns: {
          id: string
          name: string
          description: string
          unit_type: Database["public"]["Enums"]["unit_measure_type"]
          formula: Json
          instructions: string
        }[]
      }
      get_line_items_with_wkt: {
        Args:
          | { contract_id_param: string }
        Returns: {
          id: string
          contract_id: string
          wbs_id: string
          description: string
          quantity: number
          unit: Database["public"]["Enums"]["unit_measure_type"]
          unit_price: number
          total_price: number
          notes: string
          status: string
          start_date: string
          end_date: string
          actual_quantity: number
          actual_cost: number
          created_at: string
          updated_at: string
          coordinates_wkt: string
          line_code: string
          map_id: string
          unit_measure: string
          reference_doc: string
          template_id: string
        }[]
      }
      get_maps_with_wkt: {
        Args:
          | { contract_id: string }
        Returns: {
          id: string
          contract_id: string
          wbs_id: string
          map_number: string
          location: string
          scope: string
          budget: number
          created_at: string
          updated_at: string
          coordinates_wkt: string
        }[]
      }
      get_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          address: string
          phone: string
          website: string
        }[]
      }
      get_profiles_by_contract: {
        Args: { _contract_id: string }
        Returns: {
          id: string
          full_name: string
          username: string
          email: string
          phone: string
          location: string
          role: Database["public"]["Enums"]["user_role"]
          job_title_id: string
          organization_id: string
          avatar_id: string
          avatar_url: string
        }[]
      }
      get_profiles_by_organization: {
        Args: { _organization_id: string }
        Returns: {
          id: string
          full_name: string
          username: string
          email: string
          phone: string
          location: string
          role: Database["public"]["Enums"]["user_role"]
          job_title_id: string
          organization_id: string
          avatar_id: string
          avatar_url: string
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_user_contracts: {
        Args: { _user_id: string }
        Returns: {
          contract_id: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_wbs_with_wkt: {
        Args:
          | { contract_id_param: string }
        Returns: {
          id: string
          contract_id: string
          wbs_number: string
          location: string
          budget: number
          scope: string
          created_at: string
          updated_at: string
          coordinates_wkt: string
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      insert_asphalt_type: {
        Args: {
          _name: string
          _compaction_min?: number
          _jmf_temp_max?: number
          _jmf_temp_min?: number
          _lift_depth_inches?: number
          _notes?: string
          _target_spread_rate_lbs_per_sy?: number
        }
        Returns: string
      }
      insert_avatar: {
        Args: {
          _id: string
          _name: string
          _url: string
          _is_preset?: boolean
        }
        Returns: string
      }
      insert_change_order: {
        Args: {
          _contract_id: string
          _line_item_id?: string
          _title?: string
          _description?: string
          _attachments?: string[]
          _new_quantity?: number
          _new_unit_price?: number
          _status?: Database["public"]["Enums"]["change_order_status"]
          _submitted_date?: string
          _created_by?: string
        }
        Returns: string
      }
      insert_contract: {
        Args: {
          _title: string
          _location: string
          _start_date: string
          _end_date: string
          _status?: Database["public"]["Enums"]["contract_status"]
          _budget?: number
          _description?: string
          _coordinates?: Json
          _created_by?: string
        }
        Returns: string
      }
      insert_contract_organization: {
        Args: {
          _contract_id: string
          _organization_id: string
          _created_by: string
          _role?: Database["public"]["Enums"]["organization_role"]
          _notes?: string
        }
        Returns: string
      }
      insert_crew: {
        Args: {
          _name: string
          _organization_id: string
          _created_by: string
          _description?: string
          _foreman_id?: string
        }
        Returns: string
      }
      insert_crew_member: {
        Args: {
          _created_by: string
          _crew_id: string
          _profile_id: string
          _role?: string
          _location_notes?: string
          _organization_id?: string
          _map_location_id?: string
          _assigned_at?: string
        }
        Returns: string
      }
      insert_daily_log: {
        Args: {
          _contract_id: string
          _log_date: string
          _created_by?: string
          _work_performed?: string
          _weather_conditions?: string
          _temperature?: number
          _delays_encountered?: string
          _safety_incidents?: string
          _visitors?: string
        }
        Returns: string
      }
      insert_dump_truck: {
        Args: {
            _payload_capacity_tons: number
            _truck_identifier: string
            _axle_count?: number
            _bed_height?: number
            _bed_length?: number
              _bed_volume?: number
              _bed_width?: number
              _contract_id?: string
              _equipment_id?: string
            _hoist_bottom?: number
            _hoist_top?: number
            _hoist_width?: number
            _notes?: string
        }
        Returns: string
      }
      insert_equipment: {
        Args: {
          _name: string
          _created_by?: string
          _operator_id?: string
          _organization_id?: string
          _standard_pay_rate?: number
          _standard_pay_unit?: Database["public"]["Enums"]["pay_rate_unit"]
          _description?: string
          _user_defined_id?: string
        }
        Returns: string
      }
      insert_equipment_usage: {
        Args: {
          _hours_used: number
          _contract_id?: string
          _created_by?: string
          _equipment_id?: string
          _line_item_id?: string
          _map_id?: string
          _operator_id?: string
          _notes?: string
          _updated_by?: string
          _usage_date?: string
          _wbs_id?: string
        }
        Returns: string
      }
      insert_inspection: {
        Args: {
          _contract_id: string
          _name: string
          _description?: string
          _created_by?: string
          _line_item_id?: string
          _map_id?: string
          _pdf_url?: string
          _photo_urls?: string[]
          _wbs_id?: string
        }
        Returns: string
      }
      insert_issue: {
        Args: {
          _title: string
          _description: string
          _status: string
          _priority?: Database["public"]["Enums"]["priority"]
          _assigned_to?: string
          _contract_id?: string
          _created_by?: string
          _equipment_id?: string
          _line_item_id?: string
          _map_id?: string
          _photo_urls?: string[]
          _resolution?: string
          _due_date?: string
          _updated_at?: string
          _updated_by?: string
          _wbs_id?: string
        }
        Returns: string
      }
      insert_job_title: {
        Args: {
          _title: string
          _created_by?: string
          _is_custom?: boolean
        }
        Returns: string
      }
      insert_labor_record: {
        Args: {
          _line_item_id: string
          _worker_count: number
          _hours_worked: number
          _work_date: string
          _work_type: string
          _notes?: string
        }
        Returns: string
      }
      insert_line_item: {
        Args: {
          _description: string
          _line_code: string
          _wbs_id: string
          _unit_measure: Database["public"]["Enums"]["unit_measure_type"]
          _quantity: number
          _unit_price: number
          _contract_id?: string
          _map_id?: string
          _reference_doc?: string
          _template_id?: string
          _coordinates?: string
        }
        Returns: string
      }
      insert_line_item_entry: {
        Args: {
          _contract_id: string
          _line_item_id: string
          _map_id: string
          _input_variables: Json
          _wbs_id: string
          _computed_output?: number
          _notes?: string
          _output_unit?: Database["public"]["Enums"]["unit_measure_type"]
          _entered_by?: string
        }
        Returns: string
      }
      insert_line_item_template: {
        Args: {
          _id: string
          _name?: string
          _description?: string
          _formula?: Json
          _instructions?: string
          _created_by?: string
          _organization_id?: string
          _output_unit?: Database["public"]["Enums"]["unit_measure_type"]
        }
        Returns: string
      }
      insert_map: {
        Args: {
          _map_number: string
          _wbs_id: string
          _location?: string
          _budget?: number
          _scope?: string
          _coordinates?: string
          _contract_id?: string
        }
        Returns: string
      }
      insert_organization: {
        Args: {
          _name: string
          _created_by: string
          _address?: string
          _phone?: string
          _website?: string
        }
        Returns: string
      }
      insert_profile: {
        Args: {
          _id: string
          _full_name: string
          _email?: string
          _username?: string
          _phone?: string
          _avatar_id?: string
          _job_title_id?: string
          _location?: string
          _role?: Database["public"]["Enums"]["user_role"]
          _organization_id?: string
        }
        Returns: string
      }
      insert_profile_full: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _full_name: string
          _email: string
          _username: string
          _id?: string
          _phone?: string
          _location?: string
          _job_title_id?: string
          _custom_job_title?: string
          _organization_id?: string
          _custom_organization_name?: string
          _avatar_id?: string
        }
        Returns: string
      }
      insert_user_contract: {
        Args: {
          _user_id: string
          _contract_id: string
          _role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      insert_wbs: {
        Args: {
          _wbs_number: string
          _contract_id: string
          _location?: string
          _budget?: number
          _scope?: string
          _coordinates?: string
        }
        Returns: string
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: number
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { geom: unknown; format?: string }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { letters: string; font?: Json }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_asphalt_type: {
        Args: {
          _id: string
          _name?: string
          _compaction_min?: number
          _jmf_temp_max?: number
          _jmf_temp_min?: number
          _lift_depth_inches?: number
          _notes?: string
          _target_spread_rate_lbs_per_sy?: number
        }
        Returns: undefined
      }
      update_avatar: {
        Args: {
          _id: string
          _name?: string
          _url?: string
          _is_preset?: boolean
        }
        Returns: undefined
      }
      update_change_order: {
        Args: {
          _id: string
          _title?: string
          _description?: string
          _attachments?: string[]
          _new_quantity?: number
          _new_unit_price?: number
          _status?: Database["public"]["Enums"]["change_order_status"]
          _approved_by?: string
          _approved_date?: string
          _updated_by?: string
        }
        Returns: undefined
      }
      update_contract: {
        Args: {
          _id: string
          _title?: string
          _location?: string
          _start_date?: string
          _end_date?: string
          _status?: Database["public"]["Enums"]["contract_status"]
          _budget?: number
          _description?: string
          _coordinates?: Json
        }
        Returns: undefined
      }
      update_contract_organization: {
        Args: {
          _id: string
          _role?: Database["public"]["Enums"]["organization_role"]
          _notes?: string
          _updated_at?: string
        }
        Returns: undefined
      }
      update_crew: {
        Args: {
          _id: string
          _name?: string
          _description?: string
          _foreman_id?: string
          _updated_at?: string
        }
        Returns: undefined
      }
      update_crew_member: {
        Args: {
          _id: string
          _role?: string
          _location_notes?: string
          _organization_id?: string
          _map_location_id?: string
          _assigned_at?: string
          _updated_at?: string
        }
        Returns: undefined
      }
      update_daily_log: {
        Args: {
          _id: string
          _work_performed?: string
          _weather_conditions?: string
          _temperature?: number
          _delays_encountered?: string
          _safety_incidents?: string
          _visitors?: string
          _updated_by?: string
          _updated_at?: string
        }
        Returns: undefined
      }
      update_dump_truck: {
        Args: {
          _id: string
          _payload_capacity_tons?: number
          _truck_identifier?: string
          _axle_count?: number
          _bed_height?: number
          _bed_length?: number
          _bed_volume?: number
          _bed_width?: number
          _contract_id?: string
          _equipment_id?: string
          _hoist_bottom?: number
          _hoist_top?: number
          _hoist_width?: number
          _notes?: string
        }
        Returns: undefined
      }
      update_equipment: {
        Args: {
          _id: string
          _name?: string
          _created_by?: string
          _operator_id?: string
          _organization_id?: string
          _standard_pay_rate?: number
          _standard_pay_unit?: Database["public"]["Enums"]["pay_rate_unit"]
          _description?: string
          _user_defined_id?: string
        }
        Returns: undefined
      }
      update_equipment_assignment: {
        Args: {
          _id: string
          _bid_rate?: number
          _contract_id?: string
          _created_by?: string
          _start_date?: string
          _end_date?: string
          _equipment_id?: string
          _line_item_id?: string
          _map_id?: string
          _notes?: string
          _operator_id?: string
          _status?: string
          _updated_at?: string
          _wbs_id?: string
        }
        Returns: undefined
      }
      update_equipment_usage: {
        Args: {
          _id: string
          _contract_id?: string
          _created_by?: string
          _equipment_id?: string
          _line_item_id?: string
          _hours_used?: number
          _map_id?: string
          _operator_id?: string
          _notes?: string
          _updated_by?: string
          _usage_date?: string
          _wbs_id?: string
        }
        Returns: undefined
      }
      update_inspection: {
        Args: {
          _id: string
          _contract_id?: string
          _name?: string
          _description?: string
          _created_by?: string
          _line_item_id?: string
          _map_id?: string
          _pdf_url?: string
          _photo_urls?: string[]
          _wbs_id?: string
        }
        Returns: undefined
      }
      update_issue: {
        Args: {
          _id: string
          _title?: string
          _description?: string
          _priority?: Database["public"]["Enums"]["priority"]
          _status?: string
          _assigned_to?: string
          _contract_id?: string
          _created_by?: string
          _equipment_id?: string
          _line_item_id?: string
          _map_id?: string
          _photo_urls?: string[]
          _resolution?: string
          _due_date?: string
          _updated_at?: string
          _updated_by?: string
          _wbs_id?: string
        }
        Returns: undefined
      }
      update_job_title: {
        Args: {
          _id: string
          _title?: string
          _created_by?: string
          _is_custom?: boolean
        }
        Returns: undefined
      }
      update_labor_record: {
        Args: {
          _id: string
          _worker_count?: number
          _hours_worked?: number
          _work_date?: string
          _work_type?: string
          _notes?: string
        }
        Returns: undefined
      }
      update_line_item: {
        Args: {
          _id: string
          _description?: string
          _line_code?: string
          _wbs_id?: string
          _contract_id?: string
          _map_id?: string
          _reference_doc?: string
          _template_id?: string
          _unit_measure?: Database["public"]["Enums"]["unit_measure_type"]
          _quantity?: number
          _unit_price?: number
          _coordinates?: string
        }
        Returns: undefined
      }
      update_line_item_entry: {
        Args: {
          _id: string
          _computed_output?: number
          _contract_id?: string
          _line_item_id?: string
          _map_id?: string
          _input_variables?: Json
          _notes?: string
          _output_unit?: Database["public"]["Enums"]["unit_measure_type"]
          _entered_by?: string
          _wbs_id?: string
        }
        Returns: undefined
      }
      update_line_item_template: {
        Args: {
          _id: string
          _name?: string
          _description?: string
          _formula?: Json
          _instructions?: string
          _created_by?: string
          _organization_id?: string
          _output_unit?: Database["public"]["Enums"]["unit_measure_type"]
        }
        Returns: undefined
      }
      update_map: {
        Args: {
          _id: string
          _map_number?: string
          _wbs_id?: string
          _location?: string
          _budget?: number
          _scope?: string
          _coordinates?: string
          _contract_id?: string
        }
        Returns: undefined
      }
      update_organization: {
        Args: {
          _id: string
          _name?: string
          _created_by?: string
          _address?: string
          _phone?: string
          _website?: string
        }
        Returns: undefined
      }
      update_profile: {
        Args: {
          _id: string
          _full_name?: string
          _email?: string
          _username?: string
          _phone?: string
          _avatar_id?: string
          _job_title_id?: string
          _location?: string
          _role?: Database["public"]["Enums"]["user_role"]
          _organization_id?: string
        }
        Returns: undefined
      }
      update_user_contract: {
        Args: {
          _user_id: string
          _contract_id: string
          _role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      update_wbs: {
        Args: {
          _id: string
          _wbs_number?: string
          _contract_id?: string
          _location?: string
          _budget?: number
          _scope?: string
          _coordinates?: string
        }
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
    }
    Enums: {
      asphalt_type:
        | "SA-1"
        | "S4.75A"
        | "SF9.5A"
        | "S9.5B"
        | "S9.5C"
        | "S9.5D"
        | "S12.5C"
        | "S12.5D"
        | "I19.0B"
        | "I19.0C"
        | "I19.0D"
        | "B25.0B"
        | "B25.0C"
      change_order_status: "draft" | "pending" | "approved" | "rejected"
      contract_status:
        | "Draft"
        | "Awaiting Assignment"
        | "Active"
        | "On Hold"
        | "Final Review"
        | "Closed"
        | "Bidding Solicitation"
        | "Assigned(Partial)"
        | "Assigned(Full)"
        | "Completed"
        | "Cancelled"
      existing_surface:
        | "New Asphalt"
        | "Oxidized Asphalt"
        | "Milled Asphalt"
        | "Concrete"
        | "Dirt/Soil"
        | "Gravel"
      organization_role:
        | "Prime Contractor"
        | "Subcontractor"
        | "Auditor"
        | "Engineering"
        | "Inspection"
        | "Other"
      patch_status: "Proposed" | "Marked" | "Milled" | "Patched" | "Deleted"
      pay_rate_unit: "day" | "hour"
      priority: "High" | "Medium" | "Low" | "Note"
      road_side: "Left" | "Right"
      unit_measure_type:
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
      user_role:
        | "Admin"
        | "Contractor"
        | "Engineer"
        | "Project Manager"
        | "Inspector"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      asphalt_type: [
        "SA-1",
        "S4.75A",
        "SF9.5A",
        "S9.5B",
        "S9.5C",
        "S9.5D",
        "S12.5C",
        "S12.5D",
        "I19.0B",
        "I19.0C",
        "I19.0D",
        "B25.0B",
        "B25.0C",
      ],
      change_order_status: ["draft", "pending", "approved", "rejected"],
      contract_status: [
        "Draft",
        "Awaiting Assignment",
        "Active",
        "On Hold",
        "Final Review",
        "Closed",
        "Bidding Solicitation",
        "Assigned(Partial)",
        "Assigned(Full)",
        "Completed",
        "Cancelled",
      ],
      existing_surface: [
        "New Asphalt",
        "Oxidized Asphalt",
        "Milled Asphalt",
        "Concrete",
        "Dirt/Soil",
        "Gravel",
      ],
      organization_role: [
        "Prime Contractor",
        "Subcontractor",
        "Auditor",
        "Engineering",
        "Inspection",
        "Other",
      ],
      patch_status: ["Proposed", "Marked", "Milled", "Patched", "Deleted"],
      pay_rate_unit: ["day", "hour"],
      priority: ["High", "Medium", "Low", "Note"],
      road_side: ["Left", "Right"],
      unit_measure_type: [
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
      user_role: [
        "Admin",
        "Contractor",
        "Engineer",
        "Project Manager",
        "Inspector",
      ],
    },
  },
} as const
