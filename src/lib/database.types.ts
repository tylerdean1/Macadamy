export interface Database {
  public: {
    Tables: {
      contracts: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          location: string;
          status: 'Draft' | 'Awaiting Assignment' | 'Active' | 'On Hold' | 'Final Review' | 'Closed';
          budget: number;
          start_date: string;
          end_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          location?: string;
          status?: 'Draft' | 'Awaiting Assignment' | 'Active' | 'On Hold' | 'Final Review' | 'Closed';
          budget?: number;
          start_date?: string;
          end_date?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          location?: string;
          status?: 'Draft' | 'Awaiting Assignment' | 'Active' | 'On Hold' | 'Final Review' | 'Closed';
          budget?: number;
          start_date?: string;
          end_date?: string;
          created_by?: string;
        };
      };
      asphalt_types: {
        Row: {
          id: string;
          name: string;
          lift_depth_inches: number;
          target_spread_rate_lbs_per_sy: number;
          jmf_temp_min: number;
        };
        Insert: {
          id?: string;
          name: string;
          lift_depth_inches: number;
          target_spread_rate_lbs_per_sy: number;
          jmf_temp_min: number;
        };
        Update: {
          id?: string;
          name?: string;
          lift_depth_inches?: number;
          target_spread_rate_lbs_per_sy?: number;
          jmf_temp_min?: number;
        };
      };
      tack_rates: {
        Row: {
          id: string;
          surface_type: string;
          rate_gal_per_sy: number;
        };
        Insert: {
          id?: string;
          surface_type: string;
          rate_gal_per_sy: number;
        };
        Update: {
          id?: string;
          surface_type?: string;
          rate_gal_per_sy?: number;
        };
      };
      wbs: {
        Row: {
          id: string;
          contract_id: string;
          wbs_number: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          wbs_number: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          contract_id?: string;
          wbs_number?: string;
          description?: string | null;
        };
      };
      map_locations: {
        Row: {
          id: string;
          wbs_id: string;
          map_number: string;
          location_description: string | null;
          coordinates: [number, number] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wbs_id: string;
          map_number: string;
          location_description?: string | null;
          coordinates?: [number, number] | null;
        };
        Update: {
          id?: string;
          wbs_id?: string;
          map_number?: string;
          location_description?: string | null;
          coordinates?: [number, number] | null;
        };
      };
      line_items: {
        Row: {
          id: string;
          wbs_id: string;
          map_id: string;
          line_code: string;
          description: string;
          unit_measure: string;
          quantity: number;
          unit_price: number;
          total_cost: number;
          reference_doc: string | null;
          quantity_completed: number;
          amount_paid: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wbs_id: string;
          map_id: string;
          line_code: string;
          description: string;
          unit_measure: string;
          quantity: number;
          unit_price: number;
          reference_doc?: string | null;
          quantity_completed?: number;
          amount_paid?: number;
        };
        Update: {
          id?: string;
          wbs_id?: string;
          map_id?: string;
          line_code?: string;
          description?: string;
          unit_measure?: string;
          quantity?: number;
          unit_price?: number;
          reference_doc?: string | null;
          quantity_completed?: number;
          amount_paid?: number;
        };
      };
      map_line_item_allotments: {
        Row: {
          id: string;
          map_id: string;
          line_item_id: string;
          quantity_allotted: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          map_id: string;
          line_item_id: string;
          quantity_allotted: number;
        };
        Update: {
          id?: string;
          map_id?: string;
          line_item_id?: string;
          quantity_allotted?: number;
        };
      };
      calculator_templates: {
        Row: {
          id: string;
          line_code: string;
          name: string;
          description: string | null;
          variables: {
            name: string;
            label: string;
            type: string;
            unit: string;
            defaultValue: number;
          }[];
          formulas: {
            name: string;
            expression: string;
            description: string;
          }[];
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          line_code: string;
          name: string;
          description?: string | null;
          variables: {
            name: string;
            label: string;
            type: string;
            unit: string;
            defaultValue: number;
          }[];
          formulas: {
            name: string;
            expression: string;
            description: string;
          }[];
          created_by: string;
        };
        Update: {
          id?: string;
          line_code?: string;
          name?: string;
          description?: string | null;
          variables?: {
            name: string;
            label: string;
            type: string;
            unit: string;
            defaultValue: number;
          }[];
          formulas?: {
            name: string;
            expression: string;
            description: string;
          }[];
          created_by?: string;
        };
      };
      line_item_calculations: {
        Row: {
          id: string;
          line_item_id: string;
          template_id: string;
          station_number: string | null;
          values: Record<string, number>;
          results: Record<string, number>;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          line_item_id: string;
          template_id: string;
          station_number?: string | null;
          values: Record<string, number>;
          results: Record<string, number>;
          notes?: string | null;
          created_by: string;
        };
        Update: {
          id?: string;
          line_item_id?: string;
          template_id?: string;
          station_number?: string | null;
          values?: Record<string, number>;
          results?: Record<string, number>;
          notes?: string | null;
          created_by?: string;
        };
      };
      truck_catalog: {
        Row: {
          id: string;
          truck_number: string;
          hoist_top: number;
          hoist_bottom: number;
          hoist_width: number;
          capacity_cy: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          truck_number: string;
          hoist_top: number;
          hoist_bottom: number;
          hoist_width: number;
          capacity_cy: number;
        };
        Update: {
          id?: string;
          truck_number?: string;
          hoist_top?: number;
          hoist_bottom?: number;
          hoist_width?: number;
          capacity_cy?: number;
        };
      };
      truck_loads: {
        Row: {
          id: string;
          truck_id: string;
          map_id: string;
          timestamp: string;
          station: string;
          cy_with_shrinkage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          truck_id: string;
          map_id: string;
          timestamp: string;
          station: string;
          cy_with_shrinkage: number;
        };
        Update: {
          id?: string;
          truck_id?: string;
          map_id?: string;
          timestamp?: string;
          station?: string;
          cy_with_shrinkage?: number;
        };
      };
      materials_delivered: {
        Row: {
          id: string;
          map_id: string;
          date: string;
          time: string;
          station: string;
          quantity: number;
          unit: string;
          material_description: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          map_id: string;
          date: string;
          time: string;
          station: string;
          quantity: number;
          unit: string;
          material_description: string;
          created_by: string;
        };
        Update: {
          id?: string;
          map_id?: string;
          date?: string;
          time?: string;
          station?: string;
          quantity?: number;
          unit?: string;
          material_description?: string;
          created_by?: string;
        };
      };
      materials_used: {
        Row: {
          id: string;
          map_id: string;
          date: string;
          time: string;
          station: string;
          quantity: number;
          unit: string;
          material_description: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          map_id: string;
          date: string;
          time: string;
          station: string;
          quantity: number;
          unit: string;
          material_description: string;
          created_by: string;
        };
        Update: {
          id?: string;
          map_id?: string;
          date?: string;
          time?: string;
          station?: string;
          quantity?: number;
          unit?: string;
          material_description?: string;
          created_by?: string;
        };
      };
    };
  };
}
