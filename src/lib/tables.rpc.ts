// AUTO-GENERATED — DO NOT EDIT. Run npm run rpcmap

import type { Database, Json } from './database.types';

export type TableRpcMap = {
  accounts_payable: {
    delete_accounts_payable: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_accounts_payable: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        amount_due: number | null
        created_at: string
        deleted_at: string | null
        due_date: string | null
        id: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_accounts_payable: {
      Args: {
        _input: Json
      }
      Returns: {
        amount_due: number | null
        created_at: string
        deleted_at: string | null
        due_date: string | null
        id: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    update_accounts_payable: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        amount_due: number | null
        created_at: string
        deleted_at: string | null
        due_date: string | null
        id: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  accounts_receivable: {
    delete_accounts_receivable: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_accounts_receivable: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        amount_due: number | null
        created_at: string
        deleted_at: string | null
        due_date: string | null
        id: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_accounts_receivable: {
      Args: {
        _input: Json
      }
      Returns: {
        amount_due: number | null
        created_at: string
        deleted_at: string | null
        due_date: string | null
        id: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    update_accounts_receivable: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        amount_due: number | null
        created_at: string
        deleted_at: string | null
        due_date: string | null
        id: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  activity_logs: {
    delete_activity_logs: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_activity_logs: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        activity_at: string | null
        activity_type: string | null
        created_at: string
        deleted_at: string | null
        id: string
        profile_id: string | null
        updated_at: string
      }[]
    },
    insert_activity_logs: {
      Args: {
        _input: Json
      }
      Returns: {
        activity_at: string | null
        activity_type: string | null
        created_at: string
        deleted_at: string | null
        id: string
        profile_id: string | null
        updated_at: string
      }[]
    },
    update_activity_logs: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        activity_at: string | null
        activity_type: string | null
        created_at: string
        deleted_at: string | null
        id: string
        profile_id: string | null
        updated_at: string
      }[]
    },
  },
  asphalt_types: {
    delete_asphalt_types: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_asphalt_types: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        name: string
        updated_at: string
      }[]
    },
    insert_asphalt_types: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        name: string
        updated_at: string
      }[]
    },
    update_asphalt_types: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        name: string
        updated_at: string
      }[]
    },
  },
  audit_log: {
    delete_audit_log: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_audit_log: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        action: string
        after_data: Json | null
        before_data: Json | null
        changed_at: string | null
        changed_by: string | null
        deleted_at: string | null
        id: string
        row_id: string | null
        table_name: string
      }[]
    },
    insert_audit_log: {
      Args: {
        _input: Json
      }
      Returns: {
        action: string
        after_data: Json | null
        before_data: Json | null
        changed_at: string | null
        changed_by: string | null
        deleted_at: string | null
        id: string
        row_id: string | null
        table_name: string
      }[]
    },
    update_audit_log: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        action: string
        after_data: Json | null
        before_data: Json | null
        changed_at: string | null
        changed_by: string | null
        deleted_at: string | null
        id: string
        row_id: string | null
        table_name: string
      }[]
    },
  },
  audit_logs: {
    delete_audit_logs: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_audit_logs: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        action: string | null
        created_at: string
        deleted_at: string | null
        id: string
        performed_at: string | null
        performed_by: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    insert_audit_logs: {
      Args: {
        _input: Json
      }
      Returns: {
        action: string | null
        created_at: string
        deleted_at: string | null
        id: string
        performed_at: string | null
        performed_by: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    update_audit_logs: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        action: string | null
        created_at: string
        deleted_at: string | null
        id: string
        performed_at: string | null
        performed_by: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
  },
  avatars: {
    delete_avatars: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_avatars: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        is_preset: boolean
        updated_at: string
        url: string
      }[]
    },
    get_preset_avatars_public: {
      Args: never
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        is_preset: boolean
        updated_at: string
        url: string
      }[]
    },
    insert_avatars: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        is_preset: boolean
        updated_at: string
        url: string
      }[]
    },
    purge_orphaned_avatars: {
      Args: never
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        is_preset: boolean
        updated_at: string
        url: string
      }[]
    },
    update_avatars: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        is_preset: boolean
        updated_at: string
        url: string
      }[]
    },
  },
  bid_packages: {
    delete_bid_packages: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_vendor_bid_packages: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_bid_packages: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    filter_vendor_bid_packages: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        bid_package_id: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_bid_packages: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_vendor_bid_packages: {
      Args: {
        _input: Json
      }
      Returns: {
        bid_package_id: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_bid_packages: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    update_vendor_bid_packages: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        bid_package_id: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  bid_vendors: {
    delete_bid_vendors: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_bid_vendors: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        bid_package_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        invited_at: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_bid_vendors: {
      Args: {
        _input: Json
      }
      Returns: {
        bid_package_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        invited_at: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_bid_vendors: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        bid_package_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        invited_at: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  bids: {
    delete_bids: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_bids: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        amount: number | null
        bid_package_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        status: Database["public"]["Enums"]["general_status"] | null
        submitted_at: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_bids: {
      Args: {
        _input: Json
      }
      Returns: {
        amount: number | null
        bid_package_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        status: Database["public"]["Enums"]["general_status"] | null
        submitted_at: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_bids: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        amount: number | null
        bid_package_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        status: Database["public"]["Enums"]["general_status"] | null
        submitted_at: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  bim_models: {
    delete_bim_models: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_bim_models: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string | null
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    insert_bim_models: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string | null
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    update_bim_models: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string | null
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
  },
  certifications: {
    delete_certifications: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_certifications: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        certification_type: string | null
        created_at: string
        deleted_at: string | null
        employee_id: string | null
        expiry_date: string | null
        id: string
        issue_date: string | null
        updated_at: string
      }[]
    },
    insert_certifications: {
      Args: {
        _input: Json
      }
      Returns: {
        certification_type: string | null
        created_at: string
        deleted_at: string | null
        employee_id: string | null
        expiry_date: string | null
        id: string
        issue_date: string | null
        updated_at: string
      }[]
    },
    update_certifications: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        certification_type: string | null
        created_at: string
        deleted_at: string | null
        employee_id: string | null
        expiry_date: string | null
        id: string
        issue_date: string | null
        updated_at: string
      }[]
    },
  },
  change_orders: {
    delete_change_orders: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_change_orders: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        amount: number | null
        created_at: string | null
        deleted_at: string | null
        description: string | null
        id: string
        number: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_change_orders: {
      Args: {
        _input: Json
      }
      Returns: {
        amount: number | null
        created_at: string | null
        deleted_at: string | null
        description: string | null
        id: string
        number: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    update_change_orders: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        amount: number | null
        created_at: string | null
        deleted_at: string | null
        description: string | null
        id: string
        number: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  commitments: {
    delete_commitments: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_commitments: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        amount: number | null
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        status: string | null
        type: Database["public"]["Enums"]["commitment_type"] | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_commitments: {
      Args: {
        _input: Json
      }
      Returns: {
        amount: number | null
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        status: string | null
        type: Database["public"]["Enums"]["commitment_type"] | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_commitments: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        amount: number | null
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        status: string | null
        type: Database["public"]["Enums"]["commitment_type"] | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  compliance_checks: {
    delete_compliance_checks: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_compliance_checks: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        check_date: string | null
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        project_id: string | null
        result: string | null
        updated_at: string
      }[]
    },
    insert_compliance_checks: {
      Args: {
        _input: Json
      }
      Returns: {
        check_date: string | null
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        project_id: string | null
        result: string | null
        updated_at: string
      }[]
    },
    update_compliance_checks: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        check_date: string | null
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        project_id: string | null
        result: string | null
        updated_at: string
      }[]
    },
  },
  compliance_tracking: {
    delete_compliance_tracking: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_compliance_tracking: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        notes: string | null
        project_id: string | null
        status: string | null
        tracking_type: string | null
        updated_at: string
      }[]
    },
    insert_compliance_tracking: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        notes: string | null
        project_id: string | null
        status: string | null
        tracking_type: string | null
        updated_at: string
      }[]
    },
    update_compliance_tracking: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        notes: string | null
        project_id: string | null
        status: string | null
        tracking_type: string | null
        updated_at: string
      }[]
    },
  },
  cost_codes: {
    delete_cost_codes: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_cost_codes: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        code: string
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        updated_at: string
      }[]
    },
    fn_top5_cost_codes: {
      Args: {
        p_project_id: string
      }
      Returns: {
        cost_code_id: string
        rank: number
        total_spend: number
      }[]
    },
    insert_cost_codes: {
      Args: {
        _input: Json
      }
      Returns: {
        code: string
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        updated_at: string
      }[]
    },
    update_cost_codes: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        code: string
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        updated_at: string
      }[]
    },
  },
  crew_assignments: {
    delete_crew_assignments: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_crew_assignments: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        assigned_date: string | null
        created_at: string | null
        crew_id: string | null
        deleted_at: string | null
        id: string
        profile_id: string | null
        updated_at: string
      }[]
    },
    insert_crew_assignments: {
      Args: {
        _input: Json
      }
      Returns: {
        assigned_date: string | null
        created_at: string | null
        crew_id: string | null
        deleted_at: string | null
        id: string
        profile_id: string | null
        updated_at: string
      }[]
    },
    update_crew_assignments: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        assigned_date: string | null
        created_at: string | null
        crew_id: string | null
        deleted_at: string | null
        id: string
        profile_id: string | null
        updated_at: string
      }[]
    },
  },
  crew_members: {
    delete_crew_members: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_crew_members: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        crew_id: string | null
        deleted_at: string | null
        end_date: string | null
        id: string
        profile_id: string | null
        role: string | null
        start_date: string | null
        updated_at: string
      }[]
    },
    insert_crew_members: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        crew_id: string | null
        deleted_at: string | null
        end_date: string | null
        id: string
        profile_id: string | null
        role: string | null
        start_date: string | null
        updated_at: string
      }[]
    },
    update_crew_members: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        crew_id: string | null
        deleted_at: string | null
        end_date: string | null
        id: string
        profile_id: string | null
        role: string | null
        start_date: string | null
        updated_at: string
      }[]
    },
  },
  crews: {
    delete_crews: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_crews: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        updated_at: string
      }[]
    },
    fn_worst10_crews_by_incidents: {
      Args: never
      Returns: {
        crew_id: string
        incident_count: number
        rank: number
      }[]
    },
    insert_crews: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        updated_at: string
      }[]
    },
    update_crews: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        updated_at: string
      }[]
    },
  },
  daily_logs: {
    delete_daily_logs: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_daily_logs: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        id: string
        notes: string | null
        project_id: string | null
        updated_at: string
        weather: Json | null
      }[]
    },
    insert_daily_logs: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        id: string
        notes: string | null
        project_id: string | null
        updated_at: string
        weather: Json | null
      }[]
    },
    update_daily_logs: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        id: string
        notes: string | null
        project_id: string | null
        updated_at: string
        weather: Json | null
      }[]
    },
  },
  dashboard_configs: {
    delete_dashboard_configs: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_dashboard_configs: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        config: Json | null
        created_at: string | null
        deleted_at: string | null
        id: string
        profile_id: string | null
        updated_at: string
      }[]
    },
    insert_dashboard_configs: {
      Args: {
        _input: Json
      }
      Returns: {
        config: Json | null
        created_at: string | null
        deleted_at: string | null
        id: string
        profile_id: string | null
        updated_at: string
      }[]
    },
    update_dashboard_configs: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        config: Json | null
        created_at: string | null
        deleted_at: string | null
        id: string
        profile_id: string | null
        updated_at: string
      }[]
    },
  },
  document_references: {
    delete_document_references: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_document_references: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        document_id: string | null
        id: string
        reference_id: string | null
        reference_type: string | null
        updated_at: string
      }[]
    },
    insert_document_references: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        document_id: string | null
        id: string
        reference_id: string | null
        reference_type: string | null
        updated_at: string
      }[]
    },
    update_document_references: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        document_id: string | null
        id: string
        reference_id: string | null
        reference_type: string | null
        updated_at: string
      }[]
    },
  },
  documents: {
    delete_documents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_financial_documents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_hr_documents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_regulatory_documents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_vendor_documents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_documents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        type: string | null
        updated_at: string
        uploaded_at: string | null
        uploaded_by: string | null
        url: string | null
      }[]
    },
    filter_financial_documents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    filter_hr_documents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        employee_id: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    filter_regulatory_documents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    filter_vendor_documents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
        vendor_id: string | null
      }[]
    },
    insert_documents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        type: string | null
        updated_at: string
        uploaded_at: string | null
        uploaded_by: string | null
        url: string | null
      }[]
    },
    insert_financial_documents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    insert_hr_documents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        employee_id: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    insert_regulatory_documents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    insert_vendor_documents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
        vendor_id: string | null
      }[]
    },
    update_documents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        type: string | null
        updated_at: string
        uploaded_at: string | null
        uploaded_by: string | null
        url: string | null
      }[]
    },
    update_financial_documents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    update_hr_documents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        employee_id: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    update_regulatory_documents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    update_vendor_documents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
        vendor_id: string | null
      }[]
    },
  },
  drawing_versions: {
    delete_drawing_versions: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_drawing_versions: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_id: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        uploaded_by: string | null
        version: string | null
      }[]
    },
    insert_drawing_versions: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_id: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        uploaded_by: string | null
        version: string | null
      }[]
    },
    update_drawing_versions: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_id: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        uploaded_by: string | null
        version: string | null
      }[]
    },
  },
  dump_trucks: {
    delete_dump_trucks: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_dump_trucks: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        capacity: number | null
        created_at: string
        deleted_at: string | null
        id: string
        make: string | null
        model: string | null
        organization_id: string | null
        updated_at: string
      }[]
    },
    insert_dump_trucks: {
      Args: {
        _input: Json
      }
      Returns: {
        capacity: number | null
        created_at: string
        deleted_at: string | null
        id: string
        make: string | null
        model: string | null
        organization_id: string | null
        updated_at: string
      }[]
    },
    update_dump_trucks: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        capacity: number | null
        created_at: string
        deleted_at: string | null
        id: string
        make: string | null
        model: string | null
        organization_id: string | null
        updated_at: string
      }[]
    },
  },
  employees: {
    delete_employees: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_employees: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        hire_date: string | null
        id: string
        organization_id: string | null
        profile_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_employees: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        hire_date: string | null
        id: string
        organization_id: string | null
        profile_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    update_employees: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        hire_date: string | null
        id: string
        organization_id: string | null
        profile_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  equipment: {
    delete_equipment: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_equipment_assignments: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_equipment_maintenance: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_equipment_usage: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_equipment: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        model: string | null
        name: string
        organization_id: string | null
        serial_number: string | null
        status: string | null
        type: Database["public"]["Enums"]["equipment_type"] | null
        updated_at: string
      }[]
    },
    filter_equipment_assignments: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        assigned_date: string | null
        assigned_to: string | null
        created_at: string | null
        deleted_at: string | null
        equipment_id: string | null
        id: string
        notes: string | null
        project_id: string | null
        released_date: string | null
        updated_at: string
      }[]
    },
    filter_equipment_maintenance: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        equipment_id: string | null
        id: string
        maintenance_date: string | null
        performed_by: string | null
        type: string | null
        updated_at: string
      }[]
    },
    filter_equipment_usage: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        equipment_id: string | null
        hours_used: number | null
        id: string
        notes: string | null
        quantity: number | null
        updated_at: string
      }[]
    },
    insert_equipment: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        model: string | null
        name: string
        organization_id: string | null
        serial_number: string | null
        status: string | null
        type: Database["public"]["Enums"]["equipment_type"] | null
        updated_at: string
      }[]
    },
    insert_equipment_assignments: {
      Args: {
        _input: Json
      }
      Returns: {
        assigned_date: string | null
        assigned_to: string | null
        created_at: string | null
        deleted_at: string | null
        equipment_id: string | null
        id: string
        notes: string | null
        project_id: string | null
        released_date: string | null
        updated_at: string
      }[]
    },
    insert_equipment_maintenance: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        equipment_id: string | null
        id: string
        maintenance_date: string | null
        performed_by: string | null
        type: string | null
        updated_at: string
      }[]
    },
    insert_equipment_usage: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        equipment_id: string | null
        hours_used: number | null
        id: string
        notes: string | null
        quantity: number | null
        updated_at: string
      }[]
    },
    rank_equipment_usage: {
      Args: {
        p_project_id: string
      }
      Returns: {
        equipment_id: string
        total_hours: number
        usage_rank: number
      }[]
    },
    rpc_equipment_log_payload: {
      Args: never
      Returns: Json
    },
    rpc_equipment_maintenance_payload: {
      Args: never
      Returns: Json
    },
    update_equipment: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        model: string | null
        name: string
        organization_id: string | null
        serial_number: string | null
        status: string | null
        type: Database["public"]["Enums"]["equipment_type"] | null
        updated_at: string
      }[]
    },
    update_equipment_assignments: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        assigned_date: string | null
        assigned_to: string | null
        created_at: string | null
        deleted_at: string | null
        equipment_id: string | null
        id: string
        notes: string | null
        project_id: string | null
        released_date: string | null
        updated_at: string
      }[]
    },
    update_equipment_maintenance: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        equipment_id: string | null
        id: string
        maintenance_date: string | null
        performed_by: string | null
        type: string | null
        updated_at: string
      }[]
    },
    update_equipment_usage: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        equipment_id: string | null
        hours_used: number | null
        id: string
        notes: string | null
        quantity: number | null
        updated_at: string
      }[]
    },
  },
  equipment_assignments: {
    delete_equipment_assignments: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_equipment_assignments: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        assigned_date: string | null
        assigned_to: string | null
        created_at: string | null
        deleted_at: string | null
        equipment_id: string | null
        id: string
        notes: string | null
        project_id: string | null
        released_date: string | null
        updated_at: string
      }[]
    },
    insert_equipment_assignments: {
      Args: {
        _input: Json
      }
      Returns: {
        assigned_date: string | null
        assigned_to: string | null
        created_at: string | null
        deleted_at: string | null
        equipment_id: string | null
        id: string
        notes: string | null
        project_id: string | null
        released_date: string | null
        updated_at: string
      }[]
    },
    update_equipment_assignments: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        assigned_date: string | null
        assigned_to: string | null
        created_at: string | null
        deleted_at: string | null
        equipment_id: string | null
        id: string
        notes: string | null
        project_id: string | null
        released_date: string | null
        updated_at: string
      }[]
    },
  },
  equipment_maintenance: {
    delete_equipment_maintenance: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_equipment_maintenance: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        equipment_id: string | null
        id: string
        maintenance_date: string | null
        performed_by: string | null
        type: string | null
        updated_at: string
      }[]
    },
    insert_equipment_maintenance: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        equipment_id: string | null
        id: string
        maintenance_date: string | null
        performed_by: string | null
        type: string | null
        updated_at: string
      }[]
    },
    rpc_equipment_maintenance_payload: {
      Args: never
      Returns: Json
    },
    update_equipment_maintenance: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        equipment_id: string | null
        id: string
        maintenance_date: string | null
        performed_by: string | null
        type: string | null
        updated_at: string
      }[]
    },
  },
  equipment_usage: {
    delete_equipment_usage: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_equipment_usage: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        equipment_id: string | null
        hours_used: number | null
        id: string
        notes: string | null
        quantity: number | null
        updated_at: string
      }[]
    },
    insert_equipment_usage: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        equipment_id: string | null
        hours_used: number | null
        id: string
        notes: string | null
        quantity: number | null
        updated_at: string
      }[]
    },
    rank_equipment_usage: {
      Args: {
        p_project_id: string
      }
      Returns: {
        equipment_id: string
        total_hours: number
        usage_rank: number
      }[]
    },
    update_equipment_usage: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        equipment_id: string | null
        hours_used: number | null
        id: string
        notes: string | null
        quantity: number | null
        updated_at: string
      }[]
    },
  },
  estimate_line_items: {
    delete_estimate_line_items: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_estimate_line_items: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        cost_code_id: string | null
        created_at: string | null
        deleted_at: string | null
        estimate_id: string | null
        id: string
        name: string | null
        quantity: number | null
        total_cost: number | null
        unit_measure: string | null
        unit_price: number | null
        updated_at: string
      }[]
    },
    insert_estimate_line_items: {
      Args: {
        _input: Json
      }
      Returns: {
        cost_code_id: string | null
        created_at: string | null
        deleted_at: string | null
        estimate_id: string | null
        id: string
        name: string | null
        quantity: number | null
        total_cost: number | null
        unit_measure: string | null
        unit_price: number | null
        updated_at: string
      }[]
    },
    update_estimate_line_items: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        cost_code_id: string | null
        created_at: string | null
        deleted_at: string | null
        estimate_id: string | null
        id: string
        name: string | null
        quantity: number | null
        total_cost: number | null
        unit_measure: string | null
        unit_price: number | null
        updated_at: string
      }[]
    },
  },
  estimates: {
    delete_estimates: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_estimates: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_estimates: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    rpc_estimates_payload: {
      Args: never
      Returns: Json
    },
    update_estimates: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        id: string
        name: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  financial_documents: {
    delete_financial_documents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_financial_documents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    insert_financial_documents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    update_financial_documents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
  },
  general_ledger: {
    delete_general_ledger: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_general_ledger: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        balance: number | null
        created_at: string
        credit: number | null
        debit: number | null
        deleted_at: string | null
        description: string | null
        entry_date: string | null
        id: string
        project_id: string | null
        updated_at: string
      }[]
    },
    insert_general_ledger: {
      Args: {
        _input: Json
      }
      Returns: {
        balance: number | null
        created_at: string
        credit: number | null
        debit: number | null
        deleted_at: string | null
        description: string | null
        entry_date: string | null
        id: string
        project_id: string | null
        updated_at: string
      }[]
    },
    update_general_ledger: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        balance: number | null
        created_at: string
        credit: number | null
        debit: number | null
        deleted_at: string | null
        description: string | null
        entry_date: string | null
        id: string
        project_id: string | null
        updated_at: string
      }[]
    },
  },
  hr_documents: {
    delete_hr_documents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_hr_documents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        employee_id: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    insert_hr_documents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        employee_id: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    update_hr_documents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        employee_id: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
  },
  inspections: {
    delete_inspections: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_inspections: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        date: string | null
        deleted_at: string | null
        id: string
        inspection_type: string | null
        name: string
        notes: string | null
        project_id: string | null
        result: Json | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_inspections: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string | null
        deleted_at: string | null
        id: string
        inspection_type: string | null
        name: string
        notes: string | null
        project_id: string | null
        result: Json | null
        status: string | null
        updated_at: string
      }[]
    },
    rpc_inspections_payload: {
      Args: {
        p_map_id?: string
        p_project_id?: string
        p_wbs_id?: string
      }
      Returns: Json
    },
    update_inspections: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string | null
        deleted_at: string | null
        id: string
        inspection_type: string | null
        name: string
        notes: string | null
        project_id: string | null
        result: Json | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  integration_tokens: {
    delete_integration_tokens: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_integration_tokens: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        profile_id: string | null
        service_name: string | null
        token: string | null
        updated_at: string
      }[]
    },
    insert_integration_tokens: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        profile_id: string | null
        service_name: string | null
        token: string | null
        updated_at: string
      }[]
    },
    update_integration_tokens: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        profile_id: string | null
        service_name: string | null
        token: string | null
        updated_at: string
      }[]
    },
  },
  inventory_transactions: {
    delete_inventory_transactions: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_inventory_transactions: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_id: string | null
        notes: string | null
        quantity: number | null
        transaction_date: string | null
        transaction_type: string | null
        updated_at: string
      }[]
    },
    insert_inventory_transactions: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_id: string | null
        notes: string | null
        quantity: number | null
        transaction_date: string | null
        transaction_type: string | null
        updated_at: string
      }[]
    },
    update_inventory_transactions: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_id: string | null
        notes: string | null
        quantity: number | null
        transaction_date: string | null
        transaction_type: string | null
        updated_at: string
      }[]
    },
  },
  issues: {
    delete_issues: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_issues: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
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
    },
    insert_issues: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
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
    },
    rpc_issues_payload: {
      Args: {
        p_project_id: string
      }
      Returns: Json
    },
    update_issues: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
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
    },
  },
  job_titles: {
    delete_job_titles: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_job_titles: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string
        updated_at: string
      }[]
    },
    get_job_titles_public: {
      Args: never
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string
        updated_at: string
      }[]
    },
    insert_job_titles: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string
        updated_at: string
      }[]
    },
    update_job_titles: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        name: string
        updated_at: string
      }[]
    },
  },
  labor_records: {
    delete_labor_records: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_labor_records: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        hours_worked: number | null
        id: string
        line_item_id: string | null
        notes: string | null
        updated_at: string
        work_date: string | null
        work_type: string | null
        worker_count: number | null
      }[]
    },
    insert_labor_records: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        hours_worked: number | null
        id: string
        line_item_id: string | null
        notes: string | null
        updated_at: string
        work_date: string | null
        work_type: string | null
        worker_count: number | null
      }[]
    },
    update_labor_records: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        hours_worked: number | null
        id: string
        line_item_id: string | null
        notes: string | null
        updated_at: string
        work_date: string | null
        work_type: string | null
        worker_count: number | null
      }[]
    },
  },
  line_item_entries: {
    delete_line_item_entries: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_line_item_entries: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        id: string
        line_item_id: string | null
        notes: string | null
        quantity_completed: number | null
        updated_at: string
      }[]
    },
    insert_line_item_entries: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        id: string
        line_item_id: string | null
        notes: string | null
        quantity_completed: number | null
        updated_at: string
      }[]
    },
    update_line_item_entries: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        date: string
        deleted_at: string | null
        id: string
        line_item_id: string | null
        notes: string | null
        quantity_completed: number | null
        updated_at: string
      }[]
    },
  },
  line_item_templates: {
    delete_line_item_templates: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_line_item_templates: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        formula: Json | null
        id: string
        name: string
        updated_at: string
        variables: Json | null
      }[]
    },
    insert_line_item_templates: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        formula: Json | null
        id: string
        name: string
        updated_at: string
        variables: Json | null
      }[]
    },
    update_line_item_templates: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        formula: Json | null
        id: string
        name: string
        updated_at: string
        variables: Json | null
      }[]
    },
  },
  line_items: {
    delete_estimate_line_items: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_line_items: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_estimate_line_items: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        cost_code_id: string | null
        created_at: string | null
        deleted_at: string | null
        estimate_id: string | null
        id: string
        name: string | null
        quantity: number | null
        total_cost: number | null
        unit_measure: string | null
        unit_price: number | null
        updated_at: string
      }[]
    },
    filter_line_items: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        cost_code_id: string | null
        created_at: string | null
        deleted_at: string | null
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
    },
    insert_estimate_line_items: {
      Args: {
        _input: Json
      }
      Returns: {
        cost_code_id: string | null
        created_at: string | null
        deleted_at: string | null
        estimate_id: string | null
        id: string
        name: string | null
        quantity: number | null
        total_cost: number | null
        unit_measure: string | null
        unit_price: number | null
        updated_at: string
      }[]
    },
    insert_line_items: {
      Args: {
        _input: Json
      }
      Returns: {
        cost_code_id: string | null
        created_at: string | null
        deleted_at: string | null
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
    },
    update_estimate_line_items: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        cost_code_id: string | null
        created_at: string | null
        deleted_at: string | null
        estimate_id: string | null
        id: string
        name: string | null
        quantity: number | null
        total_cost: number | null
        unit_measure: string | null
        unit_price: number | null
        updated_at: string
      }[]
    },
    update_line_items: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        cost_code_id: string | null
        created_at: string | null
        deleted_at: string | null
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
    },
  },
  maps: {
    delete_maps: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_maps: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        coordinates: string | null
        created_at: string | null
        deleted_at: string | null
        description: string | null
        id: string
        name: string
        order_num: number | null
        project_id: string | null
        scope: string | null
        updated_at: string
        wbs_id: string | null
      }[]
    },
    insert_maps: {
      Args: {
        _input: Json
      }
      Returns: {
        coordinates: string | null
        created_at: string | null
        deleted_at: string | null
        description: string | null
        id: string
        name: string
        order_num: number | null
        project_id: string | null
        scope: string | null
        updated_at: string
        wbs_id: string | null
      }[]
    },
    update_maps: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        coordinates: string | null
        created_at: string | null
        deleted_at: string | null
        description: string | null
        id: string
        name: string
        order_num: number | null
        project_id: string | null
        scope: string | null
        updated_at: string
        wbs_id: string | null
      }[]
    },
  },
  material_inventory: {
    delete_material_inventory: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_material_inventory: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        last_updated: string | null
        material_id: string | null
        organization_id: string | null
        quantity: number | null
        updated_at: string
      }[]
    },
    insert_material_inventory: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        last_updated: string | null
        material_id: string | null
        organization_id: string | null
        quantity: number | null
        updated_at: string
      }[]
    },
    update_material_inventory: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        last_updated: string | null
        material_id: string | null
        organization_id: string | null
        quantity: number | null
        updated_at: string
      }[]
    },
  },
  material_orders: {
    delete_material_orders: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_material_orders: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_id: string | null
        order_date: string | null
        project_id: string | null
        quantity: number | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_material_orders: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_id: string | null
        order_date: string | null
        project_id: string | null
        quantity: number | null
        status: string | null
        updated_at: string
      }[]
    },
    update_material_orders: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_id: string | null
        order_date: string | null
        project_id: string | null
        quantity: number | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  material_receipts: {
    delete_material_receipts: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_material_receipts: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_order_id: string | null
        quantity: number | null
        received_by: string | null
        received_date: string | null
        updated_at: string
      }[]
    },
    insert_material_receipts: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_order_id: string | null
        quantity: number | null
        received_by: string | null
        received_date: string | null
        updated_at: string
      }[]
    },
    update_material_receipts: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_order_id: string | null
        quantity: number | null
        received_by: string | null
        received_date: string | null
        updated_at: string
      }[]
    },
  },
  materials: {
    delete_materials: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_materials: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        id: string
        name: string
        organization_id: string | null
        unit: string | null
        updated_at: string
      }[]
    },
    fn_materials_on_hand: {
      Args: {
        p_material_id: string
      }
      Returns: {
        on_hand: number
        trans_date: string
      }[]
    },
    insert_materials: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        id: string
        name: string
        organization_id: string | null
        unit: string | null
        updated_at: string
      }[]
    },
    update_materials: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        id: string
        name: string
        organization_id: string | null
        unit: string | null
        updated_at: string
      }[]
    },
  },
  meeting_minutes: {
    delete_meeting_minutes: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_meeting_minutes: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        id: string
        meeting_date: string | null
        notes: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    insert_meeting_minutes: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        id: string
        meeting_date: string | null
        notes: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    update_meeting_minutes: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        created_by: string | null
        deleted_at: string | null
        id: string
        meeting_date: string | null
        notes: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
  },
  notifications: {
    count_unread_notifications: {
      Args: never
      Returns: number
    },
    delete_notifications: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_notifications: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        category: Database["public"]["Enums"]["notification_category"]
        created_at: string
        deleted_at: string | null
        id: string
        is_read: boolean
        message: string
        payload: Json | null
        updated_at: string
        user_id: string
      }[]
    },
    insert_notifications: {
      Args: {
        _input: Json
      }
      Returns: {
        category: Database["public"]["Enums"]["notification_category"]
        created_at: string
        deleted_at: string | null
        id: string
        is_read: boolean
        message: string
        payload: Json | null
        updated_at: string
        user_id: string
      }[]
    },
    update_notifications: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        category: Database["public"]["Enums"]["notification_category"]
        created_at: string
        deleted_at: string | null
        id: string
        is_read: boolean
        message: string
        payload: Json | null
        updated_at: string
        user_id: string
      }[]
    },
  },
  organization_invites: {
    delete_organization_invites: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_organization_invites: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        comment: string | null
        created_at: string
        id: string
        invited_by_profile_id: string
        invited_profile_id: string
        organization_id: string
        requested_job_title_id: string | null
        requested_permission_role:
        | Database["public"]["Enums"]["org_role"]
        | null
        responded_at: string | null
        reviewed_job_title_id: string | null
        reviewed_permission_role:
        | Database["public"]["Enums"]["org_role"]
        | null
        role: string | null
        status: string
      }[]
    },
    get_pending_organization_invites_with_profiles: {
      Args: {
        p_organization_id: string
      }
      Returns: {
        comment: string
        created_at: string
        id: string
        invited_by_profile_id: string
        invited_profile_id: string
        organization_id: string
        requested_job_title_id: string
        requested_job_title_name: string
        requested_permission_role: Database["public"]["Enums"]["org_role"]
        requester_avatar_id: string
        requester_avatar_url: string
        requester_email: string
        requester_full_name: string
        requester_location: string
        requester_phone: string
        responded_at: string
        reviewed_job_title_id: string
        reviewed_permission_role: Database["public"]["Enums"]["org_role"]
        role: string
        status: string
      }[]
    },
    insert_organization_invites: {
      Args: {
        _input: Json
      }
      Returns: {
        comment: string | null
        created_at: string
        id: string
        invited_by_profile_id: string
        invited_profile_id: string
        organization_id: string
        requested_job_title_id: string | null
        requested_permission_role:
        | Database["public"]["Enums"]["org_role"]
        | null
        responded_at: string | null
        reviewed_job_title_id: string | null
        reviewed_permission_role:
        | Database["public"]["Enums"]["org_role"]
        | null
        role: string | null
        status: string
      }[]
    },
    update_organization_invites: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        comment: string | null
        created_at: string
        id: string
        invited_by_profile_id: string
        invited_profile_id: string
        organization_id: string
        requested_job_title_id: string | null
        requested_permission_role:
        | Database["public"]["Enums"]["org_role"]
        | null
        responded_at: string | null
        reviewed_job_title_id: string | null
        reviewed_permission_role:
        | Database["public"]["Enums"]["org_role"]
        | null
        role: string | null
        status: string
      }[]
    },
  },
  organization_member_rates: {
    delete_organization_member_rates: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_organization_member_rates: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        effective_end: string | null
        effective_start: string
        id: string
        membership_id: string
        rate_amount: number
        rate_type: string
        updated_at: string
      }[]
    },
    insert_organization_member_rates: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        effective_end: string | null
        effective_start: string
        id: string
        membership_id: string
        rate_amount: number
        rate_type: string
        updated_at: string
      }[]
    },
    update_organization_member_rates: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        effective_end: string | null
        effective_start: string
        id: string
        membership_id: string
        rate_amount: number
        rate_type: string
        updated_at: string
      }[]
    },
  },
  organization_members: {
    delete_organization_members: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_organization_members: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        job_title_id: string | null
        organization_id: string | null
        permission_role: Database["public"]["Enums"]["org_role"] | null
        profile_id: string | null
        role: string | null
        updated_at: string
      }[]
    },
    insert_organization_members: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        job_title_id: string | null
        organization_id: string | null
        permission_role: Database["public"]["Enums"]["org_role"] | null
        profile_id: string | null
        role: string | null
        updated_at: string
      }[]
    },
    update_organization_members: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        job_title_id: string | null
        organization_id: string | null
        permission_role: Database["public"]["Enums"]["org_role"] | null
        profile_id: string | null
        role: string | null
        updated_at: string
      }[]
    },
  },
  organization_projects: {
    delete_organization_projects: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_organization_projects: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        organization_id: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    insert_organization_projects: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        organization_id: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    update_organization_projects: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        organization_id: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
  },
  organization_service_areas: {
    delete_organization_service_areas: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_organization_service_areas: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        id: string
        organization_id: string
        service_area_text: string
        updated_at: string
      }[]
    },
    insert_organization_service_areas: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        id: string
        organization_id: string
        service_area_text: string
        updated_at: string
      }[]
    },
    update_organization_service_areas: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        id: string
        organization_id: string
        service_area_text: string
        updated_at: string
      }[]
    },
  },
  organizations: {
    delete_organizations: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_organizations: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        headquarters: string | null
        id: string
        logo_url: string | null
        mission_statement: string | null
        name: string
        updated_at: string
      }[]
    },
    get_my_member_organizations: {
      Args: never
      Returns: {
        id: string
        name: string
        role: string
      }[]
    },
    get_organizations_public: {
      Args: {
        p_query: string
      }
      Returns: {
        id: string
        name: string
      }[]
    },
    insert_organizations: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        headquarters: string | null
        id: string
        logo_url: string | null
        mission_statement: string | null
        name: string
        updated_at: string
      }[]
    },
    update_organizations: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        headquarters: string | null
        id: string
        logo_url: string | null
        mission_statement: string | null
        name: string
        updated_at: string
      }[]
    },
  },
  payments: {
    delete_payments: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_payments: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        amount: number | null
        commitment_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        paid_at: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    insert_payments: {
      Args: {
        _input: Json
      }
      Returns: {
        amount: number | null
        commitment_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        paid_at: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    update_payments: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        amount: number | null
        commitment_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        paid_at: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
  },
  payroll: {
    delete_payroll: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_payroll: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        employee_id: string | null
        gross_pay: number | null
        id: string
        net_pay: number | null
        pay_period_end: string | null
        pay_period_start: string | null
        updated_at: string
      }[]
    },
    insert_payroll: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        employee_id: string | null
        gross_pay: number | null
        id: string
        net_pay: number | null
        pay_period_end: string | null
        pay_period_start: string | null
        updated_at: string
      }[]
    },
    update_payroll: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        employee_id: string | null
        gross_pay: number | null
        id: string
        net_pay: number | null
        pay_period_end: string | null
        pay_period_start: string | null
        updated_at: string
      }[]
    },
  },
  photos: {
    delete_photos: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_photos: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        caption: string | null
        created_at: string
        deleted_at: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        uploaded_by: string | null
        url: string
      }[]
    },
    insert_photos: {
      Args: {
        _input: Json
      }
      Returns: {
        caption: string | null
        created_at: string
        deleted_at: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        uploaded_by: string | null
        url: string
      }[]
    },
    update_photos: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        caption: string | null
        created_at: string
        deleted_at: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        uploaded_by: string | null
        url: string
      }[]
    },
  },
  prequalifications: {
    delete_prequalifications: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_prequalifications: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        reviewed_at: string | null
        reviewed_by: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_prequalifications: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        reviewed_at: string | null
        reviewed_by: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_prequalifications: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        reviewed_at: string | null
        reviewed_by: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  procurement_workflows: {
    delete_procurement_workflows: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_procurement_workflows: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string | null
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_procurement_workflows: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string | null
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    update_procurement_workflows: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string | null
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  profiles: {
    delete_profiles: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_profiles: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        avatar_id: string | null
        created_at: string | null
        deleted_at: string | null
        email: string
        full_name: string | null
        id: string
        location: string | null
        organization_id: string | null
        phone: string | null
        profile_completed_at: string | null
        role: Database["public"]["Enums"]["user_role_type"] | null
        updated_at: string
      }[]
    },
    get_my_org_profiles_minimal: {
      Args: never
      Returns: {
        avatar_id: string
        email: string
        full_name: string
        id: string
      }[]
    },
    get_pending_organization_invites_with_profiles: {
      Args: {
        p_organization_id: string
      }
      Returns: {
        comment: string
        created_at: string
        id: string
        invited_by_profile_id: string
        invited_profile_id: string
        organization_id: string
        requested_job_title_id: string
        requested_job_title_name: string
        requested_permission_role: Database["public"]["Enums"]["org_role"]
        requester_avatar_id: string
        requester_avatar_url: string
        requester_email: string
        requester_full_name: string
        requester_location: string
        requester_phone: string
        responded_at: string
        reviewed_job_title_id: string
        reviewed_permission_role: Database["public"]["Enums"]["org_role"]
        role: string
        status: string
      }[]
    },
    get_profiles_by_contract: {
      Args: {
        p_contract_id: string
      }
      Returns: {
        assigned_at: string
        contract_role: string
        email: string
        full_name: string
        id: string
        role: Database["public"]["Enums"]["user_role_type"]
      }[]
    },
    insert_profiles: {
      Args: {
        _input: Json
      }
      Returns: {
        avatar_id: string | null
        created_at: string | null
        deleted_at: string | null
        email: string
        full_name: string | null
        id: string
        location: string | null
        organization_id: string | null
        phone: string | null
        profile_completed_at: string | null
        role: Database["public"]["Enums"]["user_role_type"] | null
        updated_at: string
      }[]
    },
    update_profiles: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        avatar_id: string | null
        created_at: string | null
        deleted_at: string | null
        email: string
        full_name: string | null
        id: string
        location: string | null
        organization_id: string | null
        phone: string | null
        profile_completed_at: string | null
        role: Database["public"]["Enums"]["user_role_type"] | null
        updated_at: string
      }[]
    },
  },
  progress_billings: {
    delete_progress_billings: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_progress_billings: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        amount: number | null
        billing_number: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_progress_billings: {
      Args: {
        _input: Json
      }
      Returns: {
        amount: number | null
        billing_number: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    update_progress_billings: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        amount: number | null
        billing_number: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  project_inspectors: {
    delete_project_inspectors: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_project_inspectors: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        assigned_at: string | null
        assigned_by: string | null
        deleted_at: string | null
        profile_id: string
        project_id: string
      }[]
    },
    insert_project_inspectors: {
      Args: {
        _input: Json
      }
      Returns: {
        assigned_at: string | null
        assigned_by: string | null
        deleted_at: string | null
        profile_id: string
        project_id: string
      }[]
    },
    update_project_inspectors: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        assigned_at: string | null
        assigned_by: string | null
        deleted_at: string | null
        profile_id: string
        project_id: string
      }[]
    },
  },
  project_invites: {
    delete_project_invites: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_project_invites: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        comment: string | null
        created_at: string
        id: string
        invited_by_profile_id: string
        invited_profile_id: string
        project_id: string
        responded_at: string | null
        status: string
      }[]
    },
    insert_project_invites: {
      Args: {
        _input: Json
      }
      Returns: {
        comment: string | null
        created_at: string
        id: string
        invited_by_profile_id: string
        invited_profile_id: string
        project_id: string
        responded_at: string | null
        status: string
      }[]
    },
    update_project_invites: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        comment: string | null
        created_at: string
        id: string
        invited_by_profile_id: string
        invited_profile_id: string
        project_id: string
        responded_at: string | null
        status: string
      }[]
    },
  },
  project_service_areas: {
    delete_project_service_areas: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_project_service_areas: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        id: string
        project_id: string
        service_area_id: string
        updated_at: string
      }[]
    },
    insert_project_service_areas: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        id: string
        project_id: string
        service_area_id: string
        updated_at: string
      }[]
    },
    update_project_service_areas: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        id: string
        project_id: string
        service_area_id: string
        updated_at: string
      }[]
    },
  },
  projects: {
    delete_organization_projects: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_projects: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_user_projects: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_organization_projects: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        organization_id: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    filter_projects: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        end_date: string | null
        id: string
        name: string
        organization_id: string | null
        start_date: string | null
        status: Database["public"]["Enums"]["project_status"] | null
        updated_at: string
      }[]
    },
    filter_user_projects: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        role: string | null
        updated_at: string
        user_id: string | null
      }[]
    },
    insert_organization_projects: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        organization_id: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    insert_projects: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        end_date: string | null
        id: string
        name: string
        organization_id: string | null
        start_date: string | null
        status: Database["public"]["Enums"]["project_status"] | null
        updated_at: string
      }[]
    },
    insert_user_projects: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        role: string | null
        updated_at: string
        user_id: string | null
      }[]
    },
    update_organization_projects: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        organization_id: string | null
        project_id: string | null
        updated_at: string
      }[]
    },
    update_projects: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        description: string | null
        end_date: string | null
        id: string
        name: string
        organization_id: string | null
        start_date: string | null
        status: Database["public"]["Enums"]["project_status"] | null
        updated_at: string
      }[]
    },
    update_user_projects: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        role: string | null
        updated_at: string
        user_id: string | null
      }[]
    },
  },
  punch_lists: {
    delete_punch_lists: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_punch_lists: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        assigned_to: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        item: string | null
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_punch_lists: {
      Args: {
        _input: Json
      }
      Returns: {
        assigned_to: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        item: string | null
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    update_punch_lists: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        assigned_to: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        item: string | null
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
  },
  purchase_orders: {
    delete_purchase_orders: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_purchase_orders: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        amount: number | null
        created_at: string
        deleted_at: string | null
        id: string
        order_date: string | null
        order_number: string | null
        project_id: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_purchase_orders: {
      Args: {
        _input: Json
      }
      Returns: {
        amount: number | null
        created_at: string
        deleted_at: string | null
        id: string
        order_date: string | null
        order_number: string | null
        project_id: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_purchase_orders: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        amount: number | null
        created_at: string
        deleted_at: string | null
        id: string
        order_date: string | null
        order_number: string | null
        project_id: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  quality_reviews: {
    delete_quality_reviews: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_quality_reviews: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        findings: Json | null
        id: string
        project_id: string | null
        review_date: string | null
        reviewer: string | null
        updated_at: string
      }[]
    },
    insert_quality_reviews: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        findings: Json | null
        id: string
        project_id: string | null
        review_date: string | null
        reviewer: string | null
        updated_at: string
      }[]
    },
    update_quality_reviews: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        findings: Json | null
        id: string
        project_id: string | null
        review_date: string | null
        reviewer: string | null
        updated_at: string
      }[]
    },
  },
  regulatory_documents: {
    delete_regulatory_documents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_regulatory_documents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    insert_regulatory_documents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
    update_regulatory_documents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        project_id: string | null
        updated_at: string
        uploaded_at: string | null
        url: string | null
      }[]
    },
  },
  reports: {
    delete_reports: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_reports: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        generated_at: string | null
        id: string
        project_id: string | null
        report_type: string | null
        updated_at: string
      }[]
    },
    insert_reports: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        generated_at: string | null
        id: string
        project_id: string | null
        report_type: string | null
        updated_at: string
      }[]
    },
    update_reports: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        generated_at: string | null
        id: string
        project_id: string | null
        report_type: string | null
        updated_at: string
      }[]
    },
  },
  rfis: {
    delete_rfis: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_rfis: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        answer: string | null
        created_at: string
        deleted_at: string | null
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
    },
    insert_rfis: {
      Args: {
        _input: Json
      }
      Returns: {
        answer: string | null
        created_at: string
        deleted_at: string | null
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
    },
    update_rfis: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        answer: string | null
        created_at: string
        deleted_at: string | null
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
    },
  },
  safety_incidents: {
    delete_safety_incidents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_safety_incidents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        incident_date: string | null
        project_id: string | null
        reported_by: string | null
        resolved: boolean | null
        severity: string | null
        updated_at: string
      }[]
    },
    insert_safety_incidents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        incident_date: string | null
        project_id: string | null
        reported_by: string | null
        resolved: boolean | null
        severity: string | null
        updated_at: string
      }[]
    },
    update_safety_incidents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        description: string | null
        id: string
        incident_date: string | null
        project_id: string | null
        reported_by: string | null
        resolved: boolean | null
        severity: string | null
        updated_at: string
      }[]
    },
  },
  sensor_data: {
    delete_sensor_data: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_sensor_data: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        collected_at: string | null
        created_at: string
        data: Json | null
        deleted_at: string | null
        id: string
        project_id: string | null
        updated_at: string
      }[]
    },
    insert_sensor_data: {
      Args: {
        _input: Json
      }
      Returns: {
        collected_at: string | null
        created_at: string
        data: Json | null
        deleted_at: string | null
        id: string
        project_id: string | null
        updated_at: string
      }[]
    },
    update_sensor_data: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        collected_at: string | null
        created_at: string
        data: Json | null
        deleted_at: string | null
        id: string
        project_id: string | null
        updated_at: string
      }[]
    },
  },
  subcontractor_agreements: {
    delete_subcontractor_agreements: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_subcontractor_agreements: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        agreement_url: string | null
        created_at: string
        deleted_at: string | null
        id: string
        signed_at: string | null
        subcontract_id: string | null
        updated_at: string
      }[]
    },
    insert_subcontractor_agreements: {
      Args: {
        _input: Json
      }
      Returns: {
        agreement_url: string | null
        created_at: string
        deleted_at: string | null
        id: string
        signed_at: string | null
        subcontract_id: string | null
        updated_at: string
      }[]
    },
    update_subcontractor_agreements: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        agreement_url: string | null
        created_at: string
        deleted_at: string | null
        id: string
        signed_at: string | null
        subcontract_id: string | null
        updated_at: string
      }[]
    },
  },
  subcontracts: {
    delete_subcontracts: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_subcontracts: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        amount: number | null
        created_at: string
        deleted_at: string | null
        id: string
        project_id: string | null
        signed_at: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_subcontracts: {
      Args: {
        _input: Json
      }
      Returns: {
        amount: number | null
        created_at: string
        deleted_at: string | null
        id: string
        project_id: string | null
        signed_at: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_subcontracts: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        amount: number | null
        created_at: string
        deleted_at: string | null
        id: string
        project_id: string | null
        signed_at: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  submittals: {
    delete_submittals: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_submittals: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
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
    },
    insert_submittals: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
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
    },
    update_submittals: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
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
    },
  },
  tack_rates: {
    delete_tack_rates: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_tack_rates: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_type: string | null
        project_id: string | null
        rate: number | null
        updated_at: string
      }[]
    },
    insert_tack_rates: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_type: string | null
        project_id: string | null
        rate: number | null
        updated_at: string
      }[]
    },
    update_tack_rates: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        material_type: string | null
        project_id: string | null
        rate: number | null
        updated_at: string
      }[]
    },
  },
  task_dependencies: {
    delete_task_dependencies: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_task_dependencies: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        depends_on_task_id: string
        id: string
        task_id: string
      }[]
    },
    insert_task_dependencies: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        depends_on_task_id: string
        id: string
        task_id: string
      }[]
    },
    update_task_dependencies: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        depends_on_task_id: string
        id: string
        task_id: string
      }[]
    },
  },
  task_status_logs: {
    delete_task_status_logs: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_task_status_logs: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        changed_at: string
        deleted_at: string | null
        id: string
        status: Database["public"]["Enums"]["task_status"]
        task_id: string
      }[]
    },
    insert_task_status_logs: {
      Args: {
        _input: Json
      }
      Returns: {
        changed_at: string
        deleted_at: string | null
        id: string
        status: Database["public"]["Enums"]["task_status"]
        task_id: string
      }[]
    },
    update_task_status_logs: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        changed_at: string
        deleted_at: string | null
        id: string
        status: Database["public"]["Enums"]["task_status"]
        task_id: string
      }[]
    },
  },
  tasks: {
    delete_tasks: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_tasks: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        description: string | null
        end_date: string | null
        id: string
        name: string
        project_id: string
        start_date: string | null
        status: Database["public"]["Enums"]["task_status"]
        updated_at: string
      }[]
    },
    insert_tasks: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        description: string | null
        end_date: string | null
        id: string
        name: string
        project_id: string
        start_date: string | null
        status: Database["public"]["Enums"]["task_status"]
        updated_at: string
      }[]
    },
    update_tasks: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        description: string | null
        end_date: string | null
        id: string
        name: string
        project_id: string
        start_date: string | null
        status: Database["public"]["Enums"]["task_status"]
        updated_at: string
      }[]
    },
  },
  training_records: {
    delete_training_records: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_training_records: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        completion_date: string | null
        created_at: string
        deleted_at: string | null
        employee_id: string | null
        id: string
        training_type: string | null
        updated_at: string
      }[]
    },
    insert_training_records: {
      Args: {
        _input: Json
      }
      Returns: {
        completion_date: string | null
        created_at: string
        deleted_at: string | null
        employee_id: string | null
        id: string
        training_type: string | null
        updated_at: string
      }[]
    },
    update_training_records: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        completion_date: string | null
        created_at: string
        deleted_at: string | null
        employee_id: string | null
        id: string
        training_type: string | null
        updated_at: string
      }[]
    },
  },
  user_projects: {
    delete_user_projects: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_user_projects: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        role: string | null
        updated_at: string
        user_id: string | null
      }[]
    },
    insert_user_projects: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        role: string | null
        updated_at: string
        user_id: string | null
      }[]
    },
    update_user_projects: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        project_id: string | null
        role: string | null
        updated_at: string
        user_id: string | null
      }[]
    },
  },
  vendor_bid_packages: {
    delete_vendor_bid_packages: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_vendor_bid_packages: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        bid_package_id: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_vendor_bid_packages: {
      Args: {
        _input: Json
      }
      Returns: {
        bid_package_id: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_vendor_bid_packages: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        bid_package_id: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  vendor_contacts: {
    delete_vendor_contacts: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_vendor_contacts: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        email: string | null
        id: string
        name: string | null
        phone: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_vendor_contacts: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        email: string | null
        id: string
        name: string | null
        phone: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_vendor_contacts: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        email: string | null
        id: string
        name: string | null
        phone: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  vendor_documents: {
    delete_vendor_documents: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_vendor_documents: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
        vendor_id: string | null
      }[]
    },
    insert_vendor_documents: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
        vendor_id: string | null
      }[]
    },
    update_vendor_documents: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        document_type: string | null
        id: string
        updated_at: string
        uploaded_at: string | null
        url: string | null
        vendor_id: string | null
      }[]
    },
  },
  vendor_qualifications: {
    delete_vendor_qualifications: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_vendor_qualifications: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        qualification_type: string | null
        reviewed_at: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_vendor_qualifications: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        qualification_type: string | null
        reviewed_at: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_vendor_qualifications: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        deleted_at: string | null
        id: string
        qualification_type: string | null
        reviewed_at: string | null
        status: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
  },
  vendors: {
    delete_bid_vendors: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_vendors: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_bid_vendors: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        bid_package_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        invited_at: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    filter_vendors: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        contact_email: string | null
        contact_phone: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string
        organization_id: string | null
        status: Database["public"]["Enums"]["general_status"] | null
        updated_at: string
      }[]
    },
    insert_bid_vendors: {
      Args: {
        _input: Json
      }
      Returns: {
        bid_package_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        invited_at: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    insert_vendors: {
      Args: {
        _input: Json
      }
      Returns: {
        contact_email: string | null
        contact_phone: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string
        organization_id: string | null
        status: Database["public"]["Enums"]["general_status"] | null
        updated_at: string
      }[]
    },
    update_bid_vendors: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        bid_package_id: string | null
        created_at: string
        deleted_at: string | null
        id: string
        invited_at: string | null
        updated_at: string
        vendor_id: string | null
      }[]
    },
    update_vendors: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        contact_email: string | null
        contact_phone: string | null
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string
        organization_id: string | null
        status: Database["public"]["Enums"]["general_status"] | null
        updated_at: string
      }[]
    },
  },
  wbs: {
    delete_wbs: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_wbs: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        location: string | null
        name: string
        order_num: number | null
        project_id: string | null
        updated_at: string
      }[]
    },
    insert_wbs: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        location: string | null
        name: string
        order_num: number | null
        project_id: string | null
        updated_at: string
      }[]
    },
    update_wbs: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        location: string | null
        name: string
        order_num: number | null
        project_id: string | null
        updated_at: string
      }[]
    },
  },
  workflows: {
    delete_procurement_workflows: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    delete_workflows: {
      Args: {
        _id: string
      }
      Returns: undefined
    },
    filter_procurement_workflows: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string | null
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    filter_workflows: {
      Args: {
        _direction?: string
        _filters?: Json
        _limit?: number
        _offset?: number
        _order_by?: string
        _select_cols?: string[]
      }
      Returns: {
        created_at: string
        current_state: string
        deleted_at: string | null
        entity_id: string
        entity_schema: string
        entity_table: string
        id: string
        updated_at: string
        workflow_name: Database["public"]["Enums"]["workflow_name"]
      }[]
    },
    insert_procurement_workflows: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string | null
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    insert_workflows: {
      Args: {
        _input: Json
      }
      Returns: {
        created_at: string
        current_state: string
        deleted_at: string | null
        entity_id: string
        entity_schema: string
        entity_table: string
        id: string
        updated_at: string
        workflow_name: Database["public"]["Enums"]["workflow_name"]
      }[]
    },
    update_procurement_workflows: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string | null
        deleted_at: string | null
        id: string
        name: string | null
        project_id: string | null
        status: string | null
        updated_at: string
      }[]
    },
    update_workflows: {
      Args: {
        _id: string
        _input: Json
      }
      Returns: {
        created_at: string
        current_state: string
        deleted_at: string | null
        entity_id: string
        entity_schema: string
        entity_table: string
        id: string
        updated_at: string
        workflow_name: Database["public"]["Enums"]["workflow_name"]
      }[]
    },
  },
};
