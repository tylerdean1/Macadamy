export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
          profile_id: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_preset?: boolean
          name: string
          profile_id?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_preset?: boolean
          name?: string
          profile_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "avatars_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calculator_functions: {
        Row: {
          created_at: string | null
          description: string | null
          function_name: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          function_name: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          function_name?: string
          id?: string
          name?: string
        }
        Relationships: []
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
          created_at: string | null
          created_by: string
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
          created_at?: string | null
          created_by: string
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
          created_at?: string | null
          created_by?: string
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
          weight_capacity_tons: number | null
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
          weight_capacity_tons?: number | null
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
          weight_capacity_tons?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dump_trucks_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dump_trucks_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          last_maintenance_date: string | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          notes: string | null
          organization_id: string
          purchase_date: string | null
          serial_number: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          last_maintenance_date?: string | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          organization_id: string
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          last_maintenance_date?: string | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          organization_id?: string
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
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
          contract_id: string
          created_at: string | null
          created_by: string
          end_date: string | null
          equipment_id: string
          id: string
          notes: string | null
          operator_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          created_by: string
          end_date?: string | null
          equipment_id: string
          id?: string
          notes?: string | null
          operator_id?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          created_by?: string
          end_date?: string | null
          equipment_id?: string
          id?: string
          notes?: string | null
          operator_id?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assigned_to: string | null
          contract_id: string
          created_at: string | null
          created_by: string
          description: string
          due_date: string | null
          id: string
          priority: string
          resolution: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          contract_id: string
          created_at?: string | null
          created_by: string
          description: string
          due_date?: string | null
          id?: string
          priority: string
          resolution?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          contract_id?: string
          created_at?: string | null
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          resolution?: string | null
          status?: string
          title?: string
          updated_at?: string | null
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
      line_item_crew_assignments: {
        Row: {
          created_at: string | null
          created_by: string
          crew_id: string
          end_date: string | null
          id: string
          line_item_id: string
          notes: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          crew_id: string
          end_date?: string | null
          id?: string
          line_item_id: string
          notes?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          crew_id?: string
          end_date?: string | null
          id?: string
          line_item_id?: string
          notes?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "line_item_crew_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_crew_assignments_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_crew_assignments_line_item_id_fkey"
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
          line_item_template_id: string
          map_id: string
          notes: string | null
          raw_inputs: Json
          wbs_id: string
        }
        Insert: {
          computed_output?: number | null
          contract_id: string
          created_at?: string | null
          entered_by?: string | null
          id?: string
          line_item_template_id: string
          map_id: string
          notes?: string | null
          raw_inputs: Json
          wbs_id: string
        }
        Update: {
          computed_output?: number | null
          contract_id?: string
          created_at?: string | null
          entered_by?: string | null
          id?: string
          line_item_template_id?: string
          map_id?: string
          notes?: string | null
          raw_inputs?: Json
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
            foreignKeyName: "line_item_entries_line_item_template_id_fkey"
            columns: ["line_item_template_id"]
            isOneToOne: false
            referencedRelation: "line_item_templates"
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
      line_item_equipment_assignments: {
        Row: {
          created_at: string | null
          created_by: string
          end_date: string | null
          equipment_id: string
          id: string
          line_item_id: string
          notes: string | null
          operator_id: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          end_date?: string | null
          equipment_id: string
          id?: string
          line_item_id: string
          notes?: string | null
          operator_id?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          end_date?: string | null
          equipment_id?: string
          id?: string
          line_item_id?: string
          notes?: string | null
          operator_id?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "line_item_equipment_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_equipment_assignments_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_equipment_assignments_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_templates: {
        Row: {
          calculator_function_id: string | null
          created_at: string
          description: string | null
          formula: Json | null
          id: string
          instructions: string | null
          name: string | null
          output_unit: Database["public"]["Enums"]["unit_measure_type"] | null
          unit_type: Database["public"]["Enums"]["unit_measure_type"] | null
        }
        Insert: {
          calculator_function_id?: string | null
          created_at?: string
          description?: string | null
          formula?: Json | null
          id: string
          instructions?: string | null
          name?: string | null
          output_unit?: Database["public"]["Enums"]["unit_measure_type"] | null
          unit_type?: Database["public"]["Enums"]["unit_measure_type"] | null
        }
        Update: {
          calculator_function_id?: string | null
          created_at?: string
          description?: string | null
          formula?: Json | null
          id?: string
          instructions?: string | null
          name?: string | null
          output_unit?: Database["public"]["Enums"]["unit_measure_type"] | null
          unit_type?: Database["public"]["Enums"]["unit_measure_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "line_item_templates_calculator_function_id_fkey"
            columns: ["calculator_function_id"]
            isOneToOne: false
            referencedRelation: "calculator_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          contract_id: string | null
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
          location_description: string | null
          map_number: string
          updated_at: string | null
          wbs_id: string
        }
        Insert: {
          budget?: number | null
          contract_id?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          location_description?: string | null
          map_number: string
          updated_at?: string | null
          wbs_id: string
        }
        Update: {
          budget?: number | null
          contract_id?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          location_description?: string | null
          map_number?: string
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
          avatar_url: string | null
          created_at: string | null
          email: string
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
          avatar_url?: string | null
          created_at?: string | null
          email: string
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
          avatar_url?: string | null
          created_at?: string | null
          email?: string
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
          created_at: string | null
          description: string | null
          id: string
          scope: string | null
          updated_at: string | null
          wbs_number: string
        }
        Insert: {
          budget?: number | null
          contract_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          scope?: string | null
          updated_at?: string | null
          wbs_number: string
        }
        Update: {
          budget?: number | null
          contract_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
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
      [_ in never]: never
    }
    Functions: {
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
      create_clone_for_test_user: {
        Args: { session_id: string; user_id: string } | { session_id: string }
        Returns: undefined
      }
      ensure_test_user_organization: {
        Args: Record<PropertyKey, never>
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
      contract_status:
        | "Draft"
        | "Awaiting Assignment"
        | "Active"
        | "On Hold"
        | "Final Review"
        | "Closed"
      existing_surface:
        | "New Asphalt"
        | "Oxidized Asphalt"
        | "Milled Asphalt"
        | "Concrete"
        | "Dirt/Soil"
        | "Gravel"
      organization_role: "Prime Contractor" | "Subcontractor"
      patch_status: "Proposed" | "Marked" | "Milled" | "Patched" | "Deleted"
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
      [_ in never]: never
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
      contract_status: [
        "Draft",
        "Awaiting Assignment",
        "Active",
        "On Hold",
        "Final Review",
        "Closed",
      ],
      existing_surface: [
        "New Asphalt",
        "Oxidized Asphalt",
        "Milled Asphalt",
        "Concrete",
        "Dirt/Soil",
        "Gravel",
      ],
      organization_role: ["Prime Contractor", "Subcontractor"],
      patch_status: ["Proposed", "Marked", "Milled", "Patched", "Deleted"],
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
