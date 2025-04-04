export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'Admin' | 'Contractor' | 'Engineer' | 'Project Manager' | 'Inspector';
          full_name: string;
          email: string;
          username: string | null;
          phone: string | null;
          location: string | null;
          organization_id: string | null;
          job_title_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          role?: 'Admin' | 'Contractor' | 'Engineer' | 'Project Manager' | 'Inspector';
          full_name: string;
          email: string;
          username?: string | null;
          phone?: string | null;
          location?: string | null;
          organization_id?: string | null;
          job_title_id?: string | null;
        };
        Update: {
          id?: string;
          role?: 'Admin' | 'Contractor' | 'Engineer' | 'Project Manager' | 'Inspector';
          full_name?: string;
          email?: string;
          username?: string | null;
          phone?: string | null;
          location?: string | null;
          organization_id?: string | null;
          job_title_id?: string | null;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          website: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          created_by?: string;
        };
      };
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
    };
  };
}