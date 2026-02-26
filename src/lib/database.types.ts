export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      custom_oauth_providers: {
        Row: {
          acceptable_client_ids: string[]
          attribute_mapping: Json
          authorization_params: Json
          authorization_url: string | null
          cached_discovery: Json | null
          client_id: string
          client_secret: string
          created_at: string
          discovery_cached_at: string | null
          discovery_url: string | null
          email_optional: boolean
          enabled: boolean
          id: string
          identifier: string
          issuer: string | null
          jwks_uri: string | null
          name: string
          pkce_enabled: boolean
          provider_type: string
          scopes: string[]
          skip_nonce_check: boolean
          token_url: string | null
          updated_at: string
          userinfo_url: string | null
        }
        Insert: {
          acceptable_client_ids?: string[]
          attribute_mapping?: Json
          authorization_params?: Json
          authorization_url?: string | null
          cached_discovery?: Json | null
          client_id: string
          client_secret: string
          created_at?: string
          discovery_cached_at?: string | null
          discovery_url?: string | null
          email_optional?: boolean
          enabled?: boolean
          id?: string
          identifier: string
          issuer?: string | null
          jwks_uri?: string | null
          name: string
          pkce_enabled?: boolean
          provider_type: string
          scopes?: string[]
          skip_nonce_check?: boolean
          token_url?: string | null
          updated_at?: string
          userinfo_url?: string | null
        }
        Update: {
          acceptable_client_ids?: string[]
          attribute_mapping?: Json
          authorization_params?: Json
          authorization_url?: string | null
          cached_discovery?: Json | null
          client_id?: string
          client_secret?: string
          created_at?: string
          discovery_cached_at?: string | null
          discovery_url?: string | null
          email_optional?: boolean
          enabled?: boolean
          id?: string
          identifier?: string
          issuer?: string | null
          jwks_uri?: string | null
          name?: string
          pkce_enabled?: boolean
          provider_type?: string
          scopes?: string[]
          skip_nonce_check?: boolean
          token_url?: string | null
          updated_at?: string
          userinfo_url?: string | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string | null
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string | null
          code_challenge_method:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at: string | null
          email_optional: boolean
          id: string
          invite_token: string | null
          linking_target_id: string | null
          oauth_client_state_id: string | null
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          referrer: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code?: string | null
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string | null
          email_optional?: boolean
          id: string
          invite_token?: string | null
          linking_target_id?: string | null
          oauth_client_state_id?: string | null
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string | null
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string | null
          email_optional?: boolean
          id?: string
          invite_token?: string | null
          linking_target_id?: string | null
          oauth_client_state_id?: string | null
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          last_webauthn_challenge_data: Json | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_authorizations: {
        Row: {
          approved_at: string | null
          authorization_code: string | null
          authorization_id: string
          client_id: string
          code_challenge: string | null
          code_challenge_method:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at: string
          expires_at: string
          id: string
          nonce: string | null
          redirect_uri: string
          resource: string | null
          response_type: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state: string | null
          status: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id: string
          client_id: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id: string
          nonce?: string | null
          redirect_uri: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id?: string
          client_id?: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id?: string
          nonce?: string | null
          redirect_uri?: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope?: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_authorizations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_authorizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_client_states: {
        Row: {
          code_verifier: string | null
          created_at: string
          id: string
          provider_type: string
        }
        Insert: {
          code_verifier?: string | null
          created_at: string
          id: string
          provider_type: string
        }
        Update: {
          code_verifier?: string | null
          created_at?: string
          id?: string
          provider_type?: string
        }
        Relationships: []
      }
      oauth_clients: {
        Row: {
          client_name: string | null
          client_secret_hash: string | null
          client_type: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri: string | null
          created_at: string
          deleted_at: string | null
          grant_types: string
          id: string
          logo_uri: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          token_endpoint_auth_method: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types: string
          id: string
          logo_uri?: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          token_endpoint_auth_method: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types?: string
          id?: string
          logo_uri?: string | null
          redirect_uris?: string
          registration_type?: Database["auth"]["Enums"]["oauth_registration_type"]
          token_endpoint_auth_method?: string
          updated_at?: string
        }
        Relationships: []
      }
      oauth_consents: {
        Row: {
          client_id: string
          granted_at: string
          id: string
          revoked_at: string | null
          scopes: string
          user_id: string
        }
        Insert: {
          client_id: string
          granted_at?: string
          id: string
          revoked_at?: string | null
          scopes: string
          user_id: string
        }
        Update: {
          client_id?: string
          granted_at?: string
          id?: string
          revoked_at?: string | null
          scopes?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            isOneToOne: false
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown
          not_after: string | null
          oauth_client_id: string | null
          refresh_token_counter: number | null
          refresh_token_hmac_key: string | null
          refreshed_at: string | null
          scopes: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          scopes?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          scopes?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          disabled: boolean | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disabled?: boolean | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disabled?: boolean | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: { Args: never; Returns: string }
      jwt: { Args: never; Returns: Json }
      role: { Args: never; Returns: string }
      uid: { Args: never; Returns: string }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      oauth_authorization_status: "pending" | "approved" | "denied" | "expired"
      oauth_client_type: "public" | "confidential"
      oauth_registration_type: "dynamic" | "manual"
      oauth_response_type: "code"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          amount_due: number | null
          created_at: string
          deleted_at: string | null
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount_due?: number | null
          created_at?: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount_due?: number | null
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_ap_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount_due: number | null
          created_at: string
          deleted_at: string | null
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount_due?: number | null
          created_at?: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount_due?: number | null
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_ar_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          activity_at: string | null
          activity_type: string | null
          created_at: string
          deleted_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          activity_at?: string | null
          activity_type?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          activity_at?: string | null
          activity_type?: string | null
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_activity_logs_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      asphalt_types: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          changed_at: string | null
          changed_by: string | null
          deleted_at: string | null
          id: string
          row_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          changed_at?: string | null
          changed_by?: string | null
          deleted_at?: string | null
          id?: string
          row_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          changed_at?: string | null
          changed_by?: string | null
          deleted_at?: string | null
          id?: string
          row_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string | null
          created_at: string
          deleted_at: string | null
          id: string
          performed_at: string | null
          performed_by: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          action?: string | null
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "fk_audit_logs_performed_by"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_audit_logs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      avatars: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_preset: boolean
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_preset?: boolean
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_preset?: boolean
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      bid_packages: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "fk_bid_packages_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_bid_packages_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_vendors: {
        Row: {
          bid_package_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          invited_at: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          bid_package_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          invited_at?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          bid_package_id?: string | null
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "fk_bid_vendors_bid_package"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bid_vendors_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bid_vendors_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number | null
          bid_package_id: string | null
          created_at: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_bids_bid_package"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bids_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bids_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      bim_models: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string | null
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_bim_models_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          certification_type: string | null
          created_at: string
          deleted_at: string | null
          employee_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          updated_at: string
        }
        Insert: {
          certification_type?: string | null
          created_at?: string
          deleted_at?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          updated_at?: string
        }
        Update: {
          certification_type?: string | null
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_certifications_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_active"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          amount: number | null
          created_at: string | null
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_change_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          amount: number | null
          created_at: string | null
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_commitments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_commitments_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_commitments_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          check_date: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          project_id: string | null
          result: string | null
          updated_at: string
        }
        Insert: {
          check_date?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          result?: string | null
          updated_at?: string
        }
        Update: {
          check_date?: string | null
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_compliance_checks_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_tracking: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          project_id: string | null
          status: string | null
          tracking_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: string | null
          tracking_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_compliance_tracking_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_codes: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
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
          deleted_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          crew_id?: string | null
          deleted_at?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          crew_id?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "fk_crew_assignments_crew"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_assignments_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_assignments_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          created_at: string | null
          crew_id: string | null
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_crew_members_crew"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_crews_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          created_at: string | null
          date: string
          deleted_at: string | null
          id: string
          notes: string | null
          project_id: string | null
          updated_at: string
          weather: Json | null
        }
        Insert: {
          created_at?: string | null
          date: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string
          weather?: Json | null
        }
        Update: {
          created_at?: string | null
          date?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_daily_logs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_configs: {
        Row: {
          config: Json | null
          created_at: string | null
          deleted_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_dashboard_configs_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      document_references: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          document_id: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_document_references_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents_active"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
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
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documents_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documents_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      drawing_versions: {
        Row: {
          created_at: string
          deleted_at: string | null
          document_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "fk_drawing_versions_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_drawing_versions_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_drawing_versions_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      dump_trucks: {
        Row: {
          capacity: number | null
          created_at: string
          deleted_at: string | null
          id: string
          make: string | null
          model: string | null
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          make?: string | null
          model?: string | null
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_dump_trucks_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          deleted_at: string | null
          hire_date: string | null
          id: string
          organization_id: string | null
          profile_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          hire_date?: string | null
          id?: string
          organization_id?: string | null
          profile_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "fk_employees_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employees_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employees_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
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
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_equipment_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assignments: {
        Row: {
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
        }
        Insert: {
          assigned_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_equipment_assignments_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "crews_active"
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
            foreignKeyName: "fk_equipment_assignments_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_active"
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
          {
            foreignKeyName: "fk_equipment_assignments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_maintenance: {
        Row: {
          created_at: string | null
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_equipment_maintenance_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_maintenance_performed_by"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_maintenance_performed_by"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_usage: {
        Row: {
          created_at: string | null
          date: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_equipment_usage_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_active"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
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
        }
        Insert: {
          cost_code_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_estimate_line_items_cost_code"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estimate_line_items_estimate"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estimate_line_items_estimate"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates_active"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "fk_estimates_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_estimates_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_documents: {
        Row: {
          created_at: string
          deleted_at: string | null
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document_type?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_financial_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
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
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_gl_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_documents: {
        Row: {
          created_at: string
          deleted_at: string | null
          document_type: string | null
          employee_id: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document_type?: string | null
          employee_id?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_hr_documents_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_active"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
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
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_inspections_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_tokens: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          profile_id: string | null
          service_name: string | null
          token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          profile_id?: string | null
          service_name?: string | null
          token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_integration_tokens_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_inventory_transactions_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_active"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
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
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_issues_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      job_titles: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      labor_records: {
        Row: {
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
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_labor_records_line_item"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items_active"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_entries: {
        Row: {
          created_at: string | null
          date: string
          deleted_at: string | null
          id: string
          line_item_id: string | null
          notes: string | null
          quantity_completed: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          date: string
          deleted_at?: string | null
          id?: string
          line_item_id?: string | null
          notes?: string | null
          quantity_completed?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          date?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_line_item_entries_line_item"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items_active"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          formula: Json | null
          id: string
          name: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          formula?: Json | null
          id?: string
          name: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_line_item_templates_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
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
        }
        Insert: {
          cost_code_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_line_items_cost_code"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes_active"
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
            foreignKeyName: "fk_line_items_map"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps_active"
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
            foreignKeyName: "fk_line_items_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
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
            foreignKeyName: "fk_line_items_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "line_item_templates_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_line_items_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_line_items_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs_active"
            referencedColumns: ["id"]
          },
        ]
      }
      maps: {
        Row: {
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
        }
        Insert: {
          coordinates?: string | null
          created_at?: string | null
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_maps_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_maps_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_maps_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs_active"
            referencedColumns: ["id"]
          },
        ]
      }
      material_inventory: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          last_updated: string | null
          material_id: string | null
          organization_id: string | null
          quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_updated?: string | null
          material_id?: string | null
          organization_id?: string | null
          quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "fk_material_inventory_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_inventory_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_inventory_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      material_orders: {
        Row: {
          created_at: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_material_orders_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_active"
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
          {
            foreignKeyName: "fk_material_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      material_receipts: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          material_order_id: string | null
          quantity: number | null
          received_by: string | null
          received_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          material_order_id?: string | null
          quantity?: number | null
          received_by?: string | null
          received_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "fk_material_receipts_material_order"
            columns: ["material_order_id"]
            isOneToOne: false
            referencedRelation: "material_orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_receipts_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_receipts_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_materials_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_minutes: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          meeting_date: string | null
          notes: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          meeting_date?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "fk_meeting_minutes_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_meeting_minutes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          payload?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_invites: {
        Row: {
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
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          invited_by_profile_id: string
          invited_profile_id: string
          organization_id: string
          requested_job_title_id?: string | null
          requested_permission_role?:
            | Database["public"]["Enums"]["org_role"]
            | null
          responded_at?: string | null
          reviewed_job_title_id?: string | null
          reviewed_permission_role?:
            | Database["public"]["Enums"]["org_role"]
            | null
          role?: string | null
          status: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          invited_by_profile_id?: string
          invited_profile_id?: string
          organization_id?: string
          requested_job_title_id?: string | null
          requested_permission_role?:
            | Database["public"]["Enums"]["org_role"]
            | null
          responded_at?: string | null
          reviewed_job_title_id?: string | null
          reviewed_permission_role?:
            | Database["public"]["Enums"]["org_role"]
            | null
          role?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_requested_job_title_id_fkey"
            columns: ["requested_job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_requested_job_title_id_fkey"
            columns: ["requested_job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_reviewed_job_title_id_fkey"
            columns: ["reviewed_job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_reviewed_job_title_id_fkey"
            columns: ["reviewed_job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "job_titles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_member_rates: {
        Row: {
          created_at: string
          effective_end: string | null
          effective_start: string
          id: string
          membership_id: string
          rate_amount: number
          rate_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effective_end?: string | null
          effective_start: string
          id?: string
          membership_id: string
          rate_amount: number
          rate_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effective_end?: string | null
          effective_start?: string
          id?: string
          membership_id?: string
          rate_amount?: number
          rate_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_member_rates_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_member_rates_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "organization_members_active"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          job_title_id: string | null
          organization_id: string | null
          permission_role: Database["public"]["Enums"]["org_role"] | null
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          job_title_id?: string | null
          organization_id?: string | null
          permission_role?: Database["public"]["Enums"]["org_role"] | null
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          job_title_id?: string | null
          organization_id?: string | null
          permission_role?: Database["public"]["Enums"]["org_role"] | null
          profile_id?: string | null
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
            foreignKeyName: "fk_org_members_org"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_org_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_org_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_notification_settings: {
        Row: {
          created_at: string
          enabled_categories: Database["public"]["Enums"]["notification_category"][]
          enabled_events: string[]
          organization_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          enabled_categories?: Database["public"]["Enums"]["notification_category"][]
          enabled_events?: string[]
          organization_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          enabled_categories?: Database["public"]["Enums"]["notification_category"][]
          enabled_events?: string[]
          organization_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_notification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_notification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_notification_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_notification_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_projects: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          organization_id: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          organization_id?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "fk_org_projects_org"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
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
          {
            foreignKeyName: "fk_org_projects_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_service_areas: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          service_area_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          service_area_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          service_area_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_service_areas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_service_areas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          headquarters: string | null
          id: string
          logo_url: string | null
          mission_statement: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          headquarters?: string | null
          id?: string
          logo_url?: string | null
          mission_statement?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          headquarters?: string | null
          id?: string
          logo_url?: string | null
          mission_statement?: string | null
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
          deleted_at: string | null
          id: string
          paid_at: string | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          commitment_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          paid_at?: string | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          commitment_id?: string | null
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "fk_payments_commitment"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments_active"
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
          {
            foreignKeyName: "fk_payments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          created_at: string | null
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_payroll_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_active"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_photos_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photos_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photos_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      prequalifications: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "fk_prequalifications_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_prequalifications_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_prequalifications_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_workflows: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_procurement_workflows_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
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
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          organization_id?: string | null
          phone?: string | null
          profile_completed_at?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          updated_at?: string
        }
        Update: {
          avatar_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          organization_id?: string | null
          phone?: string | null
          profile_completed_at?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_avatar_id"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_avatar_id"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_billings: {
        Row: {
          amount: number | null
          billing_number: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          billing_number?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          billing_number?: string | null
          created_at?: string | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_progress_billings_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      project_inspectors: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          deleted_at: string | null
          profile_id: string
          project_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          deleted_at?: string | null
          profile_id: string
          project_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "project_inspectors_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
            foreignKeyName: "project_inspectors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "project_inspectors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invites: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          invited_by_profile_id: string
          invited_profile_id: string
          project_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          invited_by_profile_id: string
          invited_profile_id: string
          project_id: string
          responded_at?: string | null
          status: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          invited_by_profile_id?: string
          invited_profile_id?: string
          project_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invites_invited_by_profile_id_fkey"
            columns: ["invited_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_invited_by_profile_id_fkey"
            columns: ["invited_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_invited_profile_id_fkey"
            columns: ["invited_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_invited_profile_id_fkey"
            columns: ["invited_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      project_service_areas: {
        Row: {
          created_at: string
          id: string
          project_id: string
          service_area_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          service_area_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          service_area_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_service_areas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_cost_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_service_areas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_service_areas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_service_areas_service_area_id_fkey"
            columns: ["service_area_id"]
            isOneToOne: false
            referencedRelation: "organization_service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
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
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_projects_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      punch_lists: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          item: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          item?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "fk_punch_lists_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_punch_lists_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
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
        }
        Insert: {
          amount?: number | null
          created_at?: string
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_purchase_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_orders_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_orders_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_reviews: {
        Row: {
          created_at: string
          deleted_at: string | null
          findings: Json | null
          id: string
          project_id: string | null
          review_date: string | null
          reviewer: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          findings?: Json | null
          id?: string
          project_id?: string | null
          review_date?: string | null
          reviewer?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "fk_quality_reviews_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quality_reviews_reviewer"
            columns: ["reviewer"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quality_reviews_reviewer"
            columns: ["reviewer"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_documents: {
        Row: {
          created_at: string
          deleted_at: string | null
          document_type: string | null
          id: string
          project_id: string | null
          updated_at: string
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document_type?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_regulatory_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          deleted_at: string | null
          generated_at: string | null
          id: string
          project_id: string | null
          report_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          generated_at?: string | null
          id?: string
          project_id?: string | null
          report_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_reports_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      rfis: {
        Row: {
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
        }
        Insert: {
          answer?: string | null
          created_at?: string
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_rfis_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
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
            foreignKeyName: "fk_rfis_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rfis_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rfis_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      rpc_error_debug: {
        Row: {
          auth_user_id: string | null
          created_at: string
          error_detail: string | null
          error_hint: string | null
          error_message: string
          id: number
          operation: string | null
          request_context: Json
          rpc_name: string
          sqlstate: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          error_detail?: string | null
          error_hint?: string | null
          error_message: string
          id?: never
          operation?: string | null
          request_context?: Json
          rpc_name: string
          sqlstate?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          error_detail?: string | null
          error_hint?: string | null
          error_message?: string
          id?: never
          operation?: string | null
          request_context?: Json
          rpc_name?: string
          sqlstate?: string | null
        }
        Relationships: []
      }
      safety_incidents: {
        Row: {
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
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_safety_incidents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_safety_incidents_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_safety_incidents_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_data: {
        Row: {
          collected_at: string | null
          created_at: string
          data: Json | null
          deleted_at: string | null
          id: string
          project_id: string | null
          updated_at: string
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_sensor_data_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractor_agreements: {
        Row: {
          agreement_url: string | null
          created_at: string
          deleted_at: string | null
          id: string
          signed_at: string | null
          subcontract_id: string | null
          updated_at: string
        }
        Insert: {
          agreement_url?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          signed_at?: string | null
          subcontract_id?: string | null
          updated_at?: string
        }
        Update: {
          agreement_url?: string | null
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_subcontractor_agreements_subcontract"
            columns: ["subcontract_id"]
            isOneToOne: false
            referencedRelation: "subcontracts_active"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontracts: {
        Row: {
          amount: number | null
          created_at: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_subcontracts_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subcontracts_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subcontracts_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      submittals: {
        Row: {
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
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "fk_submittals_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
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
            foreignKeyName: "fk_submittals_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_submittals_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_submittals_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      tack_rates: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          material_type: string | null
          project_id: string | null
          rate: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          material_type?: string | null
          project_id?: string | null
          rate?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_tack_rates_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          deleted_at: string | null
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks_active"
            referencedColumns: ["id"]
          },
        ]
      }
      task_status_logs: {
        Row: {
          changed_at: string
          deleted_at: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
        }
        Insert: {
          changed_at?: string
          deleted_at?: string | null
          id?: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
        }
        Update: {
          changed_at?: string
          deleted_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
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
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      training_records: {
        Row: {
          completion_date: string | null
          created_at: string
          deleted_at: string | null
          employee_id: string | null
          id: string
          training_type: string | null
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          deleted_at?: string | null
          employee_id?: string | null
          id?: string
          training_type?: string | null
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_training_records_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_active"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          created_at: string
          silenced_categories: Database["public"]["Enums"]["notification_category"][]
          silenced_events: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          silenced_categories?: Database["public"]["Enums"]["notification_category"][]
          silenced_events?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          silenced_categories?: Database["public"]["Enums"]["notification_category"][]
          silenced_events?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          project_id: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          project_id?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "fk_user_projects_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_projects_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_projects_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_bid_packages: {
        Row: {
          bid_package_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          bid_package_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          bid_package_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "fk_vendor_bid_packages_bid_package"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vendor_bid_packages_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vendor_bid_packages_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contacts: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_vendor_contacts_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_documents: {
        Row: {
          created_at: string
          deleted_at: string | null
          document_type: string | null
          id: string
          updated_at: string
          uploaded_at: string | null
          url: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document_type?: string | null
          id?: string
          updated_at?: string
          uploaded_at?: string | null
          url?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_vendor_documents_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_qualifications: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          qualification_type: string | null
          reviewed_at: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          qualification_type?: string | null
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_vendor_qualifications_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_vendors_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      wbs: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          location: string | null
          name: string
          order_num: number | null
          project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          location?: string | null
          name: string
          order_num?: number | null
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
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
          {
            foreignKeyName: "fk_wbs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          current_state: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
      accounts_payable_active: {
        Row: {
          amount_due: number | null
          created_at: string | null
          deleted_at: string | null
          due_date: string | null
          id: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_due?: number | null
          created_at?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_due?: number | null
          created_at?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_ap_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable_active: {
        Row: {
          amount_due: number | null
          created_at: string | null
          deleted_at: string | null
          due_date: string | null
          id: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_due?: number | null
          created_at?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_due?: number | null
          created_at?: string | null
          deleted_at?: string | null
          due_date?: string | null
          id?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_ar_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs_active: {
        Row: {
          activity_at: string | null
          activity_type: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          activity_at?: string | null
          activity_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_at?: string | null
          activity_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_logs_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_activity_logs_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      asphalt_types_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log_active: {
        Row: {
          action: string | null
          after_data: Json | null
          before_data: Json | null
          changed_at: string | null
          changed_by: string | null
          deleted_at: string | null
          id: string | null
          row_id: string | null
          table_name: string | null
        }
        Insert: {
          action?: string | null
          after_data?: Json | null
          before_data?: Json | null
          changed_at?: string | null
          changed_by?: string | null
          deleted_at?: string | null
          id?: string | null
          row_id?: string | null
          table_name?: string | null
        }
        Update: {
          action?: string | null
          after_data?: Json | null
          before_data?: Json | null
          changed_at?: string | null
          changed_by?: string | null
          deleted_at?: string | null
          id?: string | null
          row_id?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      audit_logs_active: {
        Row: {
          action: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          performed_at: string | null
          performed_by: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          performed_at?: string | null
          performed_by?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          performed_at?: string | null
          performed_by?: string | null
          project_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_audit_logs_performed_by"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_audit_logs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      avatars_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      bid_packages_active: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_bid_packages_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_bid_packages_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_vendors_active: {
        Row: {
          bid_package_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          invited_at: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          bid_package_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          invited_at?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          bid_package_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          invited_at?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_bid_vendors_bid_package"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bid_vendors_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bid_vendors_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      bids_active: {
        Row: {
          amount: number | null
          bid_package_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          bid_package_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          bid_package_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_bids_bid_package"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bids_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bids_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      bim_models_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
          project_id: string | null
          updated_at: string | null
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_bim_models_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications_active: {
        Row: {
          certification_type: string | null
          created_at: string | null
          deleted_at: string | null
          employee_id: string | null
          expiry_date: string | null
          id: string | null
          issue_date: string | null
          updated_at: string | null
        }
        Insert: {
          certification_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          id?: string | null
          issue_date?: string | null
          updated_at?: string | null
        }
        Update: {
          certification_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          id?: string | null
          issue_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_certifications_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_certifications_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_active"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders_active: {
        Row: {
          amount: number | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          number: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          number?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          number?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_change_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments_active: {
        Row: {
          amount: number | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          project_id: string | null
          status: string | null
          type: Database["public"]["Enums"]["commitment_type"] | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["commitment_type"] | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["commitment_type"] | null
          updated_at?: string | null
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
            foreignKeyName: "fk_commitments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_commitments_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_commitments_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks_active: {
        Row: {
          check_date: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          project_id: string | null
          result: string | null
          updated_at: string | null
        }
        Insert: {
          check_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          project_id?: string | null
          result?: string | null
          updated_at?: string | null
        }
        Update: {
          check_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          project_id?: string | null
          result?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_compliance_checks_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_tracking_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          notes: string | null
          project_id: string | null
          status: string | null
          tracking_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          notes?: string | null
          project_id?: string | null
          status?: string | null
          tracking_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          notes?: string | null
          project_id?: string | null
          status?: string | null
          tracking_type?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_compliance_tracking_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_codes_active: {
        Row: {
          code: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crew_assignments_active: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          crew_id: string | null
          deleted_at: string | null
          id: string | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          crew_id?: string | null
          deleted_at?: string | null
          id?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          crew_id?: string | null
          deleted_at?: string | null
          id?: string | null
          profile_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_crew_assignments_crew"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_assignments_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_assignments_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members_active: {
        Row: {
          created_at: string | null
          crew_id: string | null
          deleted_at: string | null
          end_date: string | null
          id: string | null
          profile_id: string | null
          role: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crew_id?: string | null
          deleted_at?: string | null
          end_date?: string | null
          id?: string | null
          profile_id?: string | null
          role?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crew_id?: string | null
          deleted_at?: string | null
          end_date?: string | null
          id?: string | null
          profile_id?: string | null
          role?: string | null
          start_date?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_crew_members_crew"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crew_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      crews_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_crews_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs_active: {
        Row: {
          created_at: string | null
          date: string | null
          deleted_at: string | null
          id: string | null
          notes: string | null
          project_id: string | null
          updated_at: string | null
          weather: Json | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          id?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string | null
          weather?: Json | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          id?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_daily_logs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_configs_active: {
        Row: {
          config: Json | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_dashboard_configs_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dashboard_configs_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      document_references_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          document_id: string | null
          id: string | null
          reference_id: string | null
          reference_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          document_id?: string | null
          id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          document_id?: string | null
          id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_document_references_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_document_references_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents_active"
            referencedColumns: ["id"]
          },
        ]
      }
      documents_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
          project_id: string | null
          type: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          type?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          type?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documents_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documents_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      drawing_versions_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          document_id: string | null
          id: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          document_id?: string | null
          id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          document_id?: string | null
          id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_drawing_versions_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_drawing_versions_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_drawing_versions_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      dump_trucks_active: {
        Row: {
          capacity: number | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          make: string | null
          model: string | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          make?: string | null
          model?: string | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          make?: string | null
          model?: string | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_dump_trucks_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dump_trucks_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      employees_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          hire_date: string | null
          id: string | null
          organization_id: string | null
          profile_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          hire_date?: string | null
          id?: string | null
          organization_id?: string | null
          profile_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          hire_date?: string | null
          id?: string | null
          organization_id?: string | null
          profile_id?: string | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_employees_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employees_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employees_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          model: string | null
          name: string | null
          organization_id: string | null
          serial_number: string | null
          status: string | null
          type: Database["public"]["Enums"]["equipment_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          model?: string | null
          name?: string | null
          organization_id?: string | null
          serial_number?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["equipment_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          model?: string | null
          name?: string | null
          organization_id?: string | null
          serial_number?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["equipment_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_equipment_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assignments_active: {
        Row: {
          assigned_date: string | null
          assigned_to: string | null
          created_at: string | null
          deleted_at: string | null
          equipment_id: string | null
          id: string | null
          notes: string | null
          project_id: string | null
          released_date: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          deleted_at?: string | null
          equipment_id?: string | null
          id?: string | null
          notes?: string | null
          project_id?: string | null
          released_date?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          deleted_at?: string | null
          equipment_id?: string | null
          id?: string | null
          notes?: string | null
          project_id?: string | null
          released_date?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_equipment_assignments_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "crews_active"
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
            foreignKeyName: "fk_equipment_assignments_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_active"
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
          {
            foreignKeyName: "fk_equipment_assignments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_maintenance_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          equipment_id: string | null
          id: string | null
          maintenance_date: string | null
          performed_by: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          equipment_id?: string | null
          id?: string | null
          maintenance_date?: string | null
          performed_by?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          equipment_id?: string | null
          id?: string | null
          maintenance_date?: string | null
          performed_by?: string | null
          type?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_equipment_maintenance_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_maintenance_performed_by"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_maintenance_performed_by"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_usage_active: {
        Row: {
          created_at: string | null
          date: string | null
          deleted_at: string | null
          equipment_id: string | null
          hours_used: number | null
          id: string | null
          notes: string | null
          quantity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          equipment_id?: string | null
          hours_used?: number | null
          id?: string | null
          notes?: string | null
          quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          equipment_id?: string | null
          hours_used?: number | null
          id?: string | null
          notes?: string | null
          quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_equipment_usage_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_equipment_usage_equipment"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_active"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items_active: {
        Row: {
          cost_code_id: string | null
          created_at: string | null
          deleted_at: string | null
          estimate_id: string | null
          id: string | null
          name: string | null
          quantity: number | null
          total_cost: number | null
          unit_measure: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          cost_code_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estimate_id?: string | null
          id?: string | null
          name?: string | null
          quantity?: number | null
          total_cost?: number | null
          unit_measure?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          cost_code_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estimate_id?: string | null
          id?: string | null
          name?: string | null
          quantity?: number | null
          total_cost?: number | null
          unit_measure?: string | null
          unit_price?: number | null
          updated_at?: string | null
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
            foreignKeyName: "fk_estimate_line_items_cost_code"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estimate_line_items_estimate"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_estimate_line_items_estimate"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates_active"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates_active: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_estimates_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_estimates_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_documents_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          document_type: string | null
          id: string | null
          project_id: string | null
          updated_at: string | null
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_financial_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      general_ledger_active: {
        Row: {
          balance: number | null
          created_at: string | null
          credit: number | null
          debit: number | null
          deleted_at: string | null
          description: string | null
          entry_date: string | null
          id: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          deleted_at?: string | null
          description?: string | null
          entry_date?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          deleted_at?: string | null
          description?: string | null
          entry_date?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_gl_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_documents_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          document_type: string | null
          employee_id: string | null
          id: string | null
          updated_at: string | null
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          employee_id?: string | null
          id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          employee_id?: string | null
          id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_hr_documents_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_active"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections_active: {
        Row: {
          created_at: string | null
          date: string | null
          deleted_at: string | null
          id: string | null
          inspection_type: string | null
          name: string | null
          notes: string | null
          project_id: string | null
          result: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          id?: string | null
          inspection_type?: string | null
          name?: string | null
          notes?: string | null
          project_id?: string | null
          result?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          id?: string | null
          inspection_type?: string | null
          name?: string | null
          notes?: string | null
          project_id?: string | null
          result?: Json | null
          status?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_inspections_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_tokens_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          profile_id: string | null
          service_name: string | null
          token: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          profile_id?: string | null
          service_name?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          profile_id?: string | null
          service_name?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_integration_tokens_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_integration_tokens_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          material_id: string | null
          notes: string | null
          quantity: number | null
          transaction_date: string | null
          transaction_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          material_id?: string | null
          notes?: string | null
          quantity?: number | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          material_id?: string | null
          notes?: string | null
          quantity?: number | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_transactions_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inventory_transactions_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_active"
            referencedColumns: ["id"]
          },
        ]
      }
      issues_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          name: string | null
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          reported_by?: string | null
          resolved?: boolean | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          reported_by?: string | null
          resolved?: boolean | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_issues_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_issues_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      job_titles_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      labor_records_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          hours_worked: number | null
          id: string | null
          line_item_id: string | null
          notes: string | null
          updated_at: string | null
          work_date: string | null
          work_type: string | null
          worker_count: number | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          hours_worked?: number | null
          id?: string | null
          line_item_id?: string | null
          notes?: string | null
          updated_at?: string | null
          work_date?: string | null
          work_type?: string | null
          worker_count?: number | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          hours_worked?: number | null
          id?: string | null
          line_item_id?: string | null
          notes?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_labor_records_line_item"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items_active"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_entries_active: {
        Row: {
          created_at: string | null
          date: string | null
          deleted_at: string | null
          id: string | null
          line_item_id: string | null
          notes: string | null
          quantity_completed: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          id?: string | null
          line_item_id?: string | null
          notes?: string | null
          quantity_completed?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          deleted_at?: string | null
          id?: string | null
          line_item_id?: string | null
          notes?: string | null
          quantity_completed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_line_item_entries_line_item"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_line_item_entries_line_item"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items_active"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_templates_active: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          formula: Json | null
          id: string | null
          name: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          formula?: Json | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          formula?: Json | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_line_item_templates_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items_active: {
        Row: {
          cost_code_id: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          map_id: string | null
          name: string | null
          project_id: string | null
          quantity: number | null
          template_id: string | null
          unit_measure: string | null
          unit_price: number | null
          updated_at: string | null
          wbs_id: string | null
        }
        Insert: {
          cost_code_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          map_id?: string | null
          name?: string | null
          project_id?: string | null
          quantity?: number | null
          template_id?: string | null
          unit_measure?: string | null
          unit_price?: number | null
          updated_at?: string | null
          wbs_id?: string | null
        }
        Update: {
          cost_code_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          map_id?: string | null
          name?: string | null
          project_id?: string | null
          quantity?: number | null
          template_id?: string | null
          unit_measure?: string | null
          unit_price?: number | null
          updated_at?: string | null
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
            foreignKeyName: "fk_line_items_cost_code"
            columns: ["cost_code_id"]
            isOneToOne: false
            referencedRelation: "cost_codes_active"
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
            foreignKeyName: "fk_line_items_map"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps_active"
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
            foreignKeyName: "fk_line_items_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
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
            foreignKeyName: "fk_line_items_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "line_item_templates_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_line_items_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_line_items_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs_active"
            referencedColumns: ["id"]
          },
        ]
      }
      maps_active: {
        Row: {
          coordinates: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          name: string | null
          order_num: number | null
          project_id: string | null
          scope: string | null
          updated_at: string | null
          wbs_id: string | null
        }
        Insert: {
          coordinates?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          order_num?: number | null
          project_id?: string | null
          scope?: string | null
          updated_at?: string | null
          wbs_id?: string | null
        }
        Update: {
          coordinates?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          order_num?: number | null
          project_id?: string | null
          scope?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_maps_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_maps_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_maps_wbs"
            columns: ["wbs_id"]
            isOneToOne: false
            referencedRelation: "wbs_active"
            referencedColumns: ["id"]
          },
        ]
      }
      material_inventory_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          last_updated: string | null
          material_id: string | null
          organization_id: string | null
          quantity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          last_updated?: string | null
          material_id?: string | null
          organization_id?: string | null
          quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          last_updated?: string | null
          material_id?: string | null
          organization_id?: string | null
          quantity?: number | null
          updated_at?: string | null
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
            foreignKeyName: "fk_material_inventory_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_inventory_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_inventory_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      material_orders_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          material_id: string | null
          order_date: string | null
          project_id: string | null
          quantity: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          material_id?: string | null
          order_date?: string | null
          project_id?: string | null
          quantity?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          material_id?: string | null
          order_date?: string | null
          project_id?: string | null
          quantity?: number | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_material_orders_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_active"
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
          {
            foreignKeyName: "fk_material_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      material_receipts_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          material_order_id: string | null
          quantity: number | null
          received_by: string | null
          received_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          material_order_id?: string | null
          quantity?: number | null
          received_by?: string | null
          received_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          material_order_id?: string | null
          quantity?: number | null
          received_by?: string | null
          received_date?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_material_receipts_material_order"
            columns: ["material_order_id"]
            isOneToOne: false
            referencedRelation: "material_orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_receipts_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_receipts_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      materials_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          name: string | null
          organization_id: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_materials_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_materials_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_minutes_active: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string | null
          meeting_date: string | null
          notes: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string | null
          meeting_date?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string | null
          meeting_date?: string | null
          notes?: string | null
          project_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_meeting_minutes_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_meeting_minutes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_active: {
        Row: {
          category: Database["public"]["Enums"]["notification_category"] | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          is_read: boolean | null
          message: string | null
          payload: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["notification_category"] | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          is_read?: boolean | null
          message?: string | null
          payload?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["notification_category"] | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          is_read?: boolean | null
          message?: string | null
          payload?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organization_members_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          job_title_id: string | null
          organization_id: string | null
          permission_role: Database["public"]["Enums"]["org_role"] | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          job_title_id?: string | null
          organization_id?: string | null
          permission_role?: Database["public"]["Enums"]["org_role"] | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          job_title_id?: string | null
          organization_id?: string | null
          permission_role?: Database["public"]["Enums"]["org_role"] | null
          profile_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_org_members_org"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_org_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_org_members_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_projects_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          organization_id: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          organization_id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          organization_id?: string | null
          project_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_org_projects_org"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
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
          {
            foreignKeyName: "fk_org_projects_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments_active: {
        Row: {
          amount: number | null
          commitment_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          paid_at: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          commitment_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          paid_at?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          commitment_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          paid_at?: string | null
          project_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_payments_commitment"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "commitments_active"
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
          {
            foreignKeyName: "fk_payments_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          employee_id: string | null
          gross_pay: number | null
          id: string | null
          net_pay: number | null
          pay_period_end: string | null
          pay_period_start: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          gross_pay?: number | null
          id?: string | null
          net_pay?: number | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          gross_pay?: number | null
          id?: string | null
          net_pay?: number | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payroll_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payroll_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_active"
            referencedColumns: ["id"]
          },
        ]
      }
      photos_active: {
        Row: {
          caption: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          project_id: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string | null
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
            foreignKeyName: "fk_photos_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photos_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_photos_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      prequalifications_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_prequalifications_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_prequalifications_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_prequalifications_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_workflows_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_procurement_workflows_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_active: {
        Row: {
          avatar_id: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          organization_id: string | null
          phone: string | null
          profile_completed_at: string | null
          role: Database["public"]["Enums"]["user_role_type"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          organization_id?: string | null
          phone?: string | null
          profile_completed_at?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          organization_id?: string | null
          phone?: string | null
          profile_completed_at?: string | null
          role?: Database["public"]["Enums"]["user_role_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_avatar_id"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_avatar_id"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatars_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profiles_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_billings_active: {
        Row: {
          amount: number | null
          billing_number: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          billing_number?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          billing_number?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_progress_billings_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
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
      project_inspectors_active: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          deleted_at: string | null
          profile_id: string | null
          project_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          deleted_at?: string | null
          profile_id?: string | null
          project_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          deleted_at?: string | null
          profile_id?: string | null
          project_id?: string | null
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
            foreignKeyName: "project_inspectors_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
            foreignKeyName: "project_inspectors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "project_inspectors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          id: string | null
          name: string | null
          organization_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projects_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      punch_lists_active: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          item: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          item?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          item?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_punch_lists_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles_active"
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
          {
            foreignKeyName: "fk_punch_lists_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders_active: {
        Row: {
          amount: number | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          order_date: string | null
          order_number: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          order_date?: string | null
          order_number?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          order_date?: string | null
          order_number?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_purchase_orders_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_orders_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_orders_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_reviews_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          findings: Json | null
          id: string | null
          project_id: string | null
          review_date: string | null
          reviewer: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          findings?: Json | null
          id?: string | null
          project_id?: string | null
          review_date?: string | null
          reviewer?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          findings?: Json | null
          id?: string | null
          project_id?: string | null
          review_date?: string | null
          reviewer?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_quality_reviews_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quality_reviews_reviewer"
            columns: ["reviewer"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quality_reviews_reviewer"
            columns: ["reviewer"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_documents_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          document_type: string | null
          id: string | null
          project_id: string | null
          updated_at: string | null
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_regulatory_documents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          generated_at: string | null
          id: string | null
          project_id: string | null
          report_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          generated_at?: string | null
          id?: string | null
          project_id?: string | null
          report_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          generated_at?: string | null
          id?: string | null
          project_id?: string | null
          report_type?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_reports_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      rfis_active: {
        Row: {
          answer: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          project_id: string | null
          question: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          subject: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          question?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          subject?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          question?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          subject?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_rfis_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
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
            foreignKeyName: "fk_rfis_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rfis_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rfis_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string | null
          incident_date: string | null
          project_id: string | null
          reported_by: string | null
          resolved: boolean | null
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          incident_date?: string | null
          project_id?: string | null
          reported_by?: string | null
          resolved?: boolean | null
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          incident_date?: string | null
          project_id?: string | null
          reported_by?: string | null
          resolved?: boolean | null
          severity?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_safety_incidents_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_safety_incidents_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_safety_incidents_reported_by"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_data_active: {
        Row: {
          collected_at: string | null
          created_at: string | null
          data: Json | null
          deleted_at: string | null
          id: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          collected_at?: string | null
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          collected_at?: string | null
          created_at?: string | null
          data?: Json | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_sensor_data_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractor_agreements_active: {
        Row: {
          agreement_url: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          signed_at: string | null
          subcontract_id: string | null
          updated_at: string | null
        }
        Insert: {
          agreement_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          signed_at?: string | null
          subcontract_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agreement_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          signed_at?: string | null
          subcontract_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_subcontractor_agreements_subcontract"
            columns: ["subcontract_id"]
            isOneToOne: false
            referencedRelation: "subcontracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subcontractor_agreements_subcontract"
            columns: ["subcontract_id"]
            isOneToOne: false
            referencedRelation: "subcontracts_active"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontracts_active: {
        Row: {
          amount: number | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          project_id: string | null
          signed_at: string | null
          status: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          signed_at?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          signed_at?: string | null
          status?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_subcontracts_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subcontracts_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subcontracts_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      submittals_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
          project_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_submittals_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
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
            foreignKeyName: "fk_submittals_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_submittals_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_submittals_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      tack_rates_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          material_type: string | null
          project_id: string | null
          rate: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          material_type?: string | null
          project_id?: string | null
          rate?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          material_type?: string | null
          project_id?: string | null
          rate?: number | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_tack_rates_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          depends_on_task_id: string | null
          id: string | null
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          depends_on_task_id?: string | null
          id?: string | null
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          depends_on_task_id?: string | null
          id?: string | null
          task_id?: string | null
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
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks_active"
            referencedColumns: ["id"]
          },
        ]
      }
      task_status_logs_active: {
        Row: {
          changed_at: string | null
          deleted_at: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_id: string | null
        }
        Insert: {
          changed_at?: string | null
          deleted_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_id?: string | null
        }
        Update: {
          changed_at?: string | null
          deleted_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_id?: string | null
        }
        Relationships: []
      }
      tasks_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          id: string | null
          name: string | null
          project_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          name?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string | null
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
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      training_records_active: {
        Row: {
          completion_date: string | null
          created_at: string | null
          deleted_at: string | null
          employee_id: string | null
          id: string | null
          training_type: string | null
          updated_at: string | null
        }
        Insert: {
          completion_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          id?: string | null
          training_type?: string | null
          updated_at?: string | null
        }
        Update: {
          completion_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          id?: string | null
          training_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_training_records_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_training_records_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_active"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          project_id: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          project_id?: string | null
          role?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_user_projects_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_projects_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_projects_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_bid_packages_active: {
        Row: {
          bid_package_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          bid_package_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          bid_package_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "fk_vendor_bid_packages_bid_package"
            columns: ["bid_package_id"]
            isOneToOne: false
            referencedRelation: "bid_packages_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vendor_bid_packages_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vendor_bid_packages_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contacts_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string | null
          name: string | null
          phone: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_vendor_contacts_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_documents_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          document_type: string | null
          id: string | null
          updated_at: string | null
          uploaded_at: string | null
          url: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          url?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_vendor_documents_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_qualifications_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          qualification_type: string | null
          reviewed_at: string | null
          status: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          qualification_type?: string | null
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          qualification_type?: string | null
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_vendor_qualifications_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors_active: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          name: string | null
          organization_id: string | null
          status: Database["public"]["Enums"]["general_status"] | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["general_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendors_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vendors_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_active"
            referencedColumns: ["id"]
          },
        ]
      }
      wbs_active: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          location: string | null
          name: string | null
          order_num: number | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          location?: string | null
          name?: string | null
          order_num?: number | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          location?: string | null
          name?: string | null
          order_num?: number | null
          project_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "fk_wbs_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_active"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows_active: {
        Row: {
          created_at: string | null
          current_state: string | null
          deleted_at: string | null
          entity_id: string | null
          entity_schema: string | null
          entity_table: string | null
          id: string | null
          updated_at: string | null
          workflow_name: Database["public"]["Enums"]["workflow_name"] | null
        }
        Insert: {
          created_at?: string | null
          current_state?: string | null
          deleted_at?: string | null
          entity_id?: string | null
          entity_schema?: string | null
          entity_table?: string | null
          id?: string | null
          updated_at?: string | null
          workflow_name?: Database["public"]["Enums"]["workflow_name"] | null
        }
        Update: {
          created_at?: string | null
          current_state?: string | null
          deleted_at?: string | null
          entity_id?: string | null
          entity_schema?: string | null
          entity_table?: string | null
          id?: string | null
          updated_at?: string | null
          workflow_name?: Database["public"]["Enums"]["workflow_name"] | null
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
          deleted_at: string | null
          entity_id: string
          entity_schema: string
          entity_table: string
          id: string
          updated_at: string
          workflow_name: Database["public"]["Enums"]["workflow_name"]
        }
        SetofOptions: {
          from: "*"
          to: "workflows"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      can_edit_org_notification_settings: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      change_org_member_job_title_with_reason: {
        Args: {
          p_job_title_id: string
          p_org_id: string
          p_profile_id: string
          p_reason: string
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
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      check_access: {
        Args: {
          _action: string
          _organization_id?: string
          _project_id?: string
          _resource: string
        }
        Returns: undefined
      }
      check_access_bool: {
        Args: { _action: string; _org: string; _proj: string; _table: string }
        Returns: boolean
      }
      complete_my_profile: {
        Args: {
          p_avatar_id?: string
          p_full_name: string
          p_location?: string
          p_organization_id?: string
          p_phone?: string
          p_role?: Database["public"]["Enums"]["user_role_type"]
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
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      count_unread_notifications: { Args: never; Returns: number }
      create_my_organization: {
        Args: {
          p_description?: string
          p_headquarters?: string
          p_logo_url?: string
          p_mission_statement?: string
          p_name: string
        }
        Returns: string
      }
      create_project_with_owner: {
        Args: { _input: Json; _role?: string }
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
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      delete_accounts_payable: { Args: { _id: string }; Returns: undefined }
      delete_accounts_receivable: { Args: { _id: string }; Returns: undefined }
      delete_activity_logs: { Args: { _id: string }; Returns: undefined }
      delete_asphalt_types: { Args: { _id: string }; Returns: undefined }
      delete_audit_log: { Args: { _id: string }; Returns: undefined }
      delete_audit_logs: { Args: { _id: string }; Returns: undefined }
      delete_avatars: { Args: { _id: string }; Returns: undefined }
      delete_bid_packages: { Args: { _id: string }; Returns: undefined }
      delete_bid_vendors: { Args: { _id: string }; Returns: undefined }
      delete_bids: { Args: { _id: string }; Returns: undefined }
      delete_bim_models: { Args: { _id: string }; Returns: undefined }
      delete_certifications: { Args: { _id: string }; Returns: undefined }
      delete_change_orders: { Args: { _id: string }; Returns: undefined }
      delete_commitments: { Args: { _id: string }; Returns: undefined }
      delete_compliance_checks: { Args: { _id: string }; Returns: undefined }
      delete_compliance_tracking: { Args: { _id: string }; Returns: undefined }
      delete_cost_codes: { Args: { _id: string }; Returns: undefined }
      delete_crew_assignments: { Args: { _id: string }; Returns: undefined }
      delete_crew_members: { Args: { _id: string }; Returns: undefined }
      delete_crews: { Args: { _id: string }; Returns: undefined }
      delete_daily_logs: { Args: { _id: string }; Returns: undefined }
      delete_dashboard_configs: { Args: { _id: string }; Returns: undefined }
      delete_document_references: { Args: { _id: string }; Returns: undefined }
      delete_documents: { Args: { _id: string }; Returns: undefined }
      delete_drawing_versions: { Args: { _id: string }; Returns: undefined }
      delete_dump_trucks: { Args: { _id: string }; Returns: undefined }
      delete_employees: { Args: { _id: string }; Returns: undefined }
      delete_equipment: { Args: { _id: string }; Returns: undefined }
      delete_equipment_assignments: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_equipment_maintenance: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_equipment_usage: { Args: { _id: string }; Returns: undefined }
      delete_estimate_line_items: { Args: { _id: string }; Returns: undefined }
      delete_estimates: { Args: { _id: string }; Returns: undefined }
      delete_financial_documents: { Args: { _id: string }; Returns: undefined }
      delete_general_ledger: { Args: { _id: string }; Returns: undefined }
      delete_hr_documents: { Args: { _id: string }; Returns: undefined }
      delete_inspections: { Args: { _id: string }; Returns: undefined }
      delete_integration_tokens: { Args: { _id: string }; Returns: undefined }
      delete_inventory_transactions: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_issues: { Args: { _id: string }; Returns: undefined }
      delete_job_titles: { Args: { _id: string }; Returns: undefined }
      delete_labor_records: { Args: { _id: string }; Returns: undefined }
      delete_line_item_entries: { Args: { _id: string }; Returns: undefined }
      delete_line_item_templates: { Args: { _id: string }; Returns: undefined }
      delete_line_items: { Args: { _id: string }; Returns: undefined }
      delete_maps: { Args: { _id: string }; Returns: undefined }
      delete_material_inventory: { Args: { _id: string }; Returns: undefined }
      delete_material_orders: { Args: { _id: string }; Returns: undefined }
      delete_material_receipts: { Args: { _id: string }; Returns: undefined }
      delete_materials: { Args: { _id: string }; Returns: undefined }
      delete_meeting_minutes: { Args: { _id: string }; Returns: undefined }
      delete_notifications: { Args: { _id: string }; Returns: undefined }
      delete_organization_invites: { Args: { _id: string }; Returns: undefined }
      delete_organization_member_rates: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_organization_members: { Args: { _id: string }; Returns: undefined }
      delete_organization_notification_settings: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_organization_projects: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_organization_service_areas: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_organizations: { Args: { _id: string }; Returns: undefined }
      delete_payments: { Args: { _id: string }; Returns: undefined }
      delete_payroll: { Args: { _id: string }; Returns: undefined }
      delete_photos: { Args: { _id: string }; Returns: undefined }
      delete_prequalifications: { Args: { _id: string }; Returns: undefined }
      delete_procurement_workflows: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_profiles: { Args: { _id: string }; Returns: undefined }
      delete_progress_billings: { Args: { _id: string }; Returns: undefined }
      delete_project_inspectors: { Args: { _id: string }; Returns: undefined }
      delete_project_invites: { Args: { _id: string }; Returns: undefined }
      delete_project_service_areas: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_projects: { Args: { _id: string }; Returns: undefined }
      delete_punch_lists: { Args: { _id: string }; Returns: undefined }
      delete_purchase_orders: { Args: { _id: string }; Returns: undefined }
      delete_quality_reviews: { Args: { _id: string }; Returns: undefined }
      delete_regulatory_documents: { Args: { _id: string }; Returns: undefined }
      delete_reports: { Args: { _id: string }; Returns: undefined }
      delete_rfis: { Args: { _id: string }; Returns: undefined }
      delete_safety_incidents: { Args: { _id: string }; Returns: undefined }
      delete_sensor_data: { Args: { _id: string }; Returns: undefined }
      delete_subcontractor_agreements: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_subcontracts: { Args: { _id: string }; Returns: undefined }
      delete_submittals: { Args: { _id: string }; Returns: undefined }
      delete_tack_rates: { Args: { _id: string }; Returns: undefined }
      delete_task_dependencies: { Args: { _id: string }; Returns: undefined }
      delete_task_status_logs: { Args: { _id: string }; Returns: undefined }
      delete_tasks: { Args: { _id: string }; Returns: undefined }
      delete_training_records: { Args: { _id: string }; Returns: undefined }
      delete_user_notification_settings: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_user_projects: { Args: { _id: string }; Returns: undefined }
      delete_vendor_bid_packages: { Args: { _id: string }; Returns: undefined }
      delete_vendor_contacts: { Args: { _id: string }; Returns: undefined }
      delete_vendor_documents: { Args: { _id: string }; Returns: undefined }
      delete_vendor_qualifications: {
        Args: { _id: string }
        Returns: undefined
      }
      delete_vendors: { Args: { _id: string }; Returns: undefined }
      delete_wbs: { Args: { _id: string }; Returns: undefined }
      delete_workflows: { Args: { _id: string }; Returns: undefined }
      emit_org_notification: {
        Args: {
          p_category: Database["public"]["Enums"]["notification_category"]
          p_message: string
          p_organization_id: string
          p_payload?: Json
        }
        Returns: undefined
      }
      ensure_fk_indexes_for_schema: {
        Args: { _schema?: string }
        Returns: undefined
      }
      ensure_soft_delete_cols: { Args: { _tbl: unknown }; Returns: undefined }
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
        SetofOptions: {
          from: "*"
          to: "accounts_payable"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "accounts_receivable"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "activity_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "asphalt_types"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "audit_log"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "audit_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "avatars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "bid_packages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "bid_vendors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "bids"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "bim_models"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "certifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "change_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "commitments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "compliance_checks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "compliance_tracking"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "cost_codes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "crew_assignments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "crew_members"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "crews"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "daily_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "dashboard_configs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "document_references"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "drawing_versions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "dump_trucks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "employees"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "equipment"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "equipment_assignments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "equipment_maintenance"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "equipment_usage"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "estimate_line_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "estimates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "financial_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "general_ledger"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "hr_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "inspections"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "integration_tokens"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "inventory_transactions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "job_titles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "labor_records"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "line_item_entries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "line_item_templates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "line_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "maps"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "material_inventory"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "material_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "material_receipts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "materials"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "meeting_minutes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "organization_invites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "organization_member_rates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_members"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      filter_organization_notification_settings: {
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
          enabled_categories: Database["public"]["Enums"]["notification_category"][]
          enabled_events: string[]
          organization_id: string
          updated_at: string
          updated_by: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_notification_settings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "organization_projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "organization_service_areas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "payroll"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "photos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "prequalifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "procurement_workflows"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "progress_billings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "project_inspectors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "project_invites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "project_service_areas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "punch_lists"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "purchase_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "quality_reviews"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "regulatory_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "reports"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "rfis"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "safety_incidents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "sensor_data"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "subcontractor_agreements"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "subcontracts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "submittals"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "tack_rates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "task_dependencies"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "task_status_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "training_records"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      filter_user_notification_settings: {
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
          silenced_categories: Database["public"]["Enums"]["notification_category"][]
          silenced_events: string[]
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "user_notification_settings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "user_projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "vendor_bid_packages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "vendor_contacts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "vendor_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "vendor_qualifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "vendors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "wbs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "workflows"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      fn_cashflow_curve: {
        Args: { p_project_id: string }
        Returns: {
          billed: number
          cost: number
          cur_date: string
        }[]
      }
      fn_eqp_7d_avg_hours: {
        Args: { p_equipment_id: string }
        Returns: {
          avg_hours: number
          day: string
        }[]
      }
      fn_find_rpc_dupes: {
        Args: never
        Returns: {
          args: string
          cnt: number
          fname: string
        }[]
      }
      fn_inventory_balance: {
        Args: { _material_id: string }
        Returns: {
          balance: number
          day: string
        }[]
      }
      fn_list_tables_and_columns: {
        Args: never
        Returns: {
          column_name: string
          table_name: string
        }[]
      }
      fn_materials_on_hand: {
        Args: { p_material_id: string }
        Returns: {
          on_hand: number
          trans_date: string
        }[]
      }
      fn_task_cycle_time: {
        Args: { p_task_id: string }
        Returns: {
          days_in_phase: number
          status: string
        }[]
      }
      fn_top5_cost_codes: {
        Args: { p_project_id: string }
        Returns: {
          cost_code_id: string
          rank: number
          total_spend: number
        }[]
      }
      fn_weekly_receipt_perf: {
        Args: { p_project_id: string }
        Returns: {
          late_count: number
          on_time_count: number
          week_start: string
        }[]
      }
      fn_worst10_crews_by_incidents: {
        Args: never
        Returns: {
          crew_id: string
          incident_count: number
          rank: number
        }[]
      }
      get_avatar_by_id_public: {
        Args: { p_avatar_id: string }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_preset: boolean
          updated_at: string
          url: string
        }
        SetofOptions: {
          from: "*"
          to: "avatars"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_avatar_storage_paths: { Args: never; Returns: string[] }
      get_contract_with_wkt: {
        Args: { p_contract_id: string }
        Returns: {
          budget: number
          contract_number: string
          coordinates_wkt: string
          created_at: string
          description: string
          end_date: string
          id: string
          project_id: string
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }[]
      }
      get_job_titles_public: {
        Args: never
        Returns: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "job_titles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_inactive_member_organizations: {
        Args: never
        Returns: {
          membership_deleted_at: string
          organization_id: string
          organization_name: string
          role_last_known: string
        }[]
      }
      get_my_member_organizations: {
        Args: never
        Returns: {
          id: string
          name: string
          role: string
        }[]
      }
      get_my_notification_settings: {
        Args: never
        Returns: {
          silenced_categories: Database["public"]["Enums"]["notification_category"][]
          silenced_events: string[]
          updated_at: string
        }[]
      }
      get_my_org_profiles_minimal: {
        Args: never
        Returns: {
          avatar_id: string
          email: string
          full_name: string
          id: string
        }[]
      }
      get_my_profile: {
        Args: never
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
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_org_notification_settings: {
        Args: { p_organization_id: string }
        Returns: {
          enabled_categories: Database["public"]["Enums"]["notification_category"][]
          enabled_events: string[]
          updated_at: string
        }[]
      }
      get_organization_by_id: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_organizations_public: {
        Args: { p_query: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      get_pending_organization_invites_with_profiles: {
        Args: { p_organization_id: string }
        Returns: {
          comment: string
          created_at: string
          id: string
          invited_by_profile_id: string
          invited_profile_id: string
          is_rejoin: boolean
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
      }
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
        SetofOptions: {
          from: "*"
          to: "avatars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_profiles_by_contract: {
        Args: { p_contract_id: string }
        Returns: {
          assigned_at: string
          contract_role: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role_type"]
        }[]
      }
      get_rpc_error_debug: {
        Args: { p_limit?: number }
        Returns: {
          auth_user_id: string
          created_at: string
          error_detail: string
          error_hint: string
          error_message: string
          id: number
          operation: string
          request_context: Json
          rpc_name: string
          sqlstate: string
        }[]
      }
      insert_accounts_payable: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "accounts_payable"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_accounts_receivable: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "accounts_receivable"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_activity_logs: {
        Args: { _input: Json }
        Returns: {
          activity_at: string | null
          activity_type: string | null
          created_at: string
          deleted_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "activity_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_asphalt_types: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "asphalt_types"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_audit_log: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "audit_log"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_audit_logs: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "audit_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_avatars: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_preset: boolean
          updated_at: string
          url: string
        }[]
        SetofOptions: {
          from: "*"
          to: "avatars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_bid_packages: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "bid_packages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_bid_vendors: {
        Args: { _input: Json }
        Returns: {
          bid_package_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          invited_at: string | null
          updated_at: string
          vendor_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "bid_vendors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_bids: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "bids"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_bim_models: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "bim_models"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_certifications: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "certifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_change_orders: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "change_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_commitments: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "commitments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_compliance_checks: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "compliance_checks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_compliance_tracking: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "compliance_tracking"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_cost_codes: {
        Args: { _input: Json }
        Returns: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "cost_codes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_crew_assignments: {
        Args: { _input: Json }
        Returns: {
          assigned_date: string | null
          created_at: string | null
          crew_id: string | null
          deleted_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "crew_assignments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_crew_members: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "crew_members"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_crews: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "crews"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_daily_logs: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "daily_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_dashboard_configs: {
        Args: { _input: Json }
        Returns: {
          config: Json | null
          created_at: string | null
          deleted_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "dashboard_configs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_document_references: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          document_id: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "document_references"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_documents: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_drawing_versions: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "drawing_versions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_dump_trucks: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "dump_trucks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_employees: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "employees"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_equipment: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "equipment"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_equipment_assignments: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "equipment_assignments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_equipment_maintenance: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "equipment_maintenance"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_equipment_usage: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "equipment_usage"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_estimate_line_items: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "estimate_line_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_estimates: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "estimates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_financial_documents: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "financial_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_general_ledger: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "general_ledger"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_hr_documents: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "hr_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_inspections: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "inspections"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_integration_tokens: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          profile_id: string | null
          service_name: string | null
          token: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "integration_tokens"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_inventory_transactions: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "inventory_transactions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_issues: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_job_title_public: {
        Args: { p_name: string }
        Returns: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "job_titles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      insert_job_titles: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "job_titles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_labor_records: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "labor_records"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_line_item_entries: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "line_item_entries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_line_item_templates: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "line_item_templates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_line_items: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "line_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_maps: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "maps"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_material_inventory: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "material_inventory"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_material_orders: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "material_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_material_receipts: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "material_receipts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_materials: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "materials"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_meeting_minutes: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "meeting_minutes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_notifications: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_organization_invites: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "organization_invites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_organization_member_rates: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "organization_member_rates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_organization_members: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          job_title_id: string | null
          organization_id: string | null
          permission_role: Database["public"]["Enums"]["org_role"] | null
          profile_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_members"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_organization_notification_settings: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          enabled_categories: Database["public"]["Enums"]["notification_category"][]
          enabled_events: string[]
          organization_id: string
          updated_at: string
          updated_by: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_notification_settings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_organization_projects: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          organization_id: string | null
          project_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_organization_service_areas: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          organization_id: string
          service_area_text: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_service_areas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_organizations: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_payments: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_payroll: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "payroll"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_photos: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "photos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_prequalifications: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "prequalifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_procurement_workflows: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "procurement_workflows"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_profiles: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_progress_billings: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "progress_billings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_project_inspectors: {
        Args: { _input: Json }
        Returns: {
          assigned_at: string | null
          assigned_by: string | null
          deleted_at: string | null
          profile_id: string
          project_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "project_inspectors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_project_invites: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "project_invites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_project_service_areas: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          id: string
          project_id: string
          service_area_id: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "project_service_areas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_projects: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_punch_lists: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "punch_lists"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_purchase_orders: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "purchase_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_quality_reviews: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "quality_reviews"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_regulatory_documents: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "regulatory_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_reports: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          generated_at: string | null
          id: string
          project_id: string | null
          report_type: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "reports"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_rfis: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "rfis"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_safety_incidents: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "safety_incidents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_sensor_data: {
        Args: { _input: Json }
        Returns: {
          collected_at: string | null
          created_at: string
          data: Json | null
          deleted_at: string | null
          id: string
          project_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "sensor_data"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_subcontractor_agreements: {
        Args: { _input: Json }
        Returns: {
          agreement_url: string | null
          created_at: string
          deleted_at: string | null
          id: string
          signed_at: string | null
          subcontract_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "subcontractor_agreements"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_subcontracts: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "subcontracts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_submittals: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "submittals"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_tack_rates: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          id: string
          material_type: string | null
          project_id: string | null
          rate: number | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "tack_rates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_task_dependencies: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          depends_on_task_id: string
          id: string
          task_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "task_dependencies"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_task_status_logs: {
        Args: { _input: Json }
        Returns: {
          changed_at: string
          deleted_at: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "task_status_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_tasks: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_training_records: {
        Args: { _input: Json }
        Returns: {
          completion_date: string | null
          created_at: string
          deleted_at: string | null
          employee_id: string | null
          id: string
          training_type: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "training_records"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_user_notification_settings: {
        Args: { _input: Json }
        Returns: {
          created_at: string
          silenced_categories: Database["public"]["Enums"]["notification_category"][]
          silenced_events: string[]
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "user_notification_settings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_user_projects: {
        Args: { _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          project_id: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_vendor_bid_packages: {
        Args: { _input: Json }
        Returns: {
          bid_package_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          updated_at: string
          vendor_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vendor_bid_packages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_vendor_contacts: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "vendor_contacts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_vendor_documents: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "vendor_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_vendor_qualifications: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "vendor_qualifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_vendors: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "vendors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_wbs: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "wbs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_workflows: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "workflows"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      leave_my_organization: {
        Args: { p_org_id: string; p_reason: string }
        Returns: undefined
      }
      log_rpc_error: {
        Args: {
          p_operation?: string
          p_request_context?: Json
          p_rpc_name: string
        }
        Returns: undefined
      }
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
        SetofOptions: {
          from: "*"
          to: "avatars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      rank_equipment_usage: {
        Args: { p_project_id: string }
        Returns: {
          equipment_id: string
          total_hours: number
          usage_rank: number
        }[]
      }
      refresh_project_cost_summary: { Args: never; Returns: undefined }
      remove_org_member_with_reason: {
        Args: { p_org_id: string; p_profile_id: string; p_reason: string }
        Returns: undefined
      }
      remove_profile_from_contract: {
        Args: { p_contract_id: string; p_profile_id: string }
        Returns: undefined
      }
      request_my_organization_membership: {
        Args: { p_comment?: string; p_organization_id: string }
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
        SetofOptions: {
          from: "*"
          to: "organization_invites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      review_organization_invite: {
        Args: {
          p_decision: string
          p_invite_id: string
          p_responded_at?: string
          p_selected_job_title_id?: string
          p_selected_permission_role?: Database["public"]["Enums"]["org_role"]
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
        SetofOptions: {
          from: "*"
          to: "organization_invites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      rpc_calculator_template_payload: {
        Args: { p_template_id: string }
        Returns: Json
      }
      rpc_calculators_payload: { Args: never; Returns: Json }
      rpc_equipment_log_payload: { Args: never; Returns: Json }
      rpc_equipment_maintenance_payload: { Args: never; Returns: Json }
      rpc_estimates_payload: { Args: never; Returns: Json }
      rpc_inspections_payload: {
        Args: { p_map_id?: string; p_project_id?: string; p_wbs_id?: string }
        Returns: Json
      }
      rpc_issues_payload: { Args: { p_project_id: string }; Returns: Json }
      rpc_org_dashboard_payload: {
        Args: {
          p_members_page?: number
          p_organization_id: string
          p_page_size?: number
        }
        Returns: Json
      }
      rpc_profile_dashboard_payload: {
        Args: { p_page_size?: number; p_projects_page?: number }
        Returns: Json
      }
      rpc_project_dashboard_payload: {
        Args: {
          p_line_items_page?: number
          p_page_size?: number
          p_project_id: string
        }
        Returns: Json
      }
      set_my_notification_settings: {
        Args: {
          p_silenced_categories?: Database["public"]["Enums"]["notification_category"][]
          p_silenced_events?: string[]
        }
        Returns: {
          created_at: string
          silenced_categories: Database["public"]["Enums"]["notification_category"][]
          silenced_events: string[]
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "user_notification_settings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_my_primary_organization: {
        Args: { p_organization_id: string }
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
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_org_member_job_title: {
        Args: { p_job_title_id: string; p_org_id: string; p_profile_id: string }
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
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_org_member_role: {
        Args: {
          p_org_id: string
          p_profile_id: string
          p_role: Database["public"]["Enums"]["org_role"]
        }
        Returns: undefined
      }
      set_org_notification_settings: {
        Args: {
          p_enabled_categories?: Database["public"]["Enums"]["notification_category"][]
          p_enabled_events?: string[]
          p_organization_id: string
        }
        Returns: {
          created_at: string
          enabled_categories: Database["public"]["Enums"]["notification_category"][]
          enabled_events: string[]
          organization_id: string
          updated_at: string
          updated_by: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_notification_settings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      try_parse_uuid: { Args: { p_text: string }; Returns: string }
      update_accounts_payable: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "accounts_payable"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_accounts_receivable: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "accounts_receivable"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_activity_logs: {
        Args: { _id: string; _input: Json }
        Returns: {
          activity_at: string | null
          activity_type: string | null
          created_at: string
          deleted_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "activity_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_asphalt_types: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "asphalt_types"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_audit_log: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "audit_log"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_audit_logs: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "audit_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_avatars: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_preset: boolean
          updated_at: string
          url: string
        }[]
        SetofOptions: {
          from: "*"
          to: "avatars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_bid_packages: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "bid_packages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_bid_vendors: {
        Args: { _id: string; _input: Json }
        Returns: {
          bid_package_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          invited_at: string | null
          updated_at: string
          vendor_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "bid_vendors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_bids: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "bids"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_bim_models: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "bim_models"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_certifications: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "certifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_change_orders: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "change_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_commitments: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "commitments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_compliance_checks: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "compliance_checks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_compliance_tracking: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "compliance_tracking"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_cost_codes: {
        Args: { _id: string; _input: Json }
        Returns: {
          code: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "cost_codes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_crew_assignments: {
        Args: { _id: string; _input: Json }
        Returns: {
          assigned_date: string | null
          created_at: string | null
          crew_id: string | null
          deleted_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "crew_assignments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_crew_members: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "crew_members"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_crews: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "crews"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_daily_logs: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "daily_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_dashboard_configs: {
        Args: { _id: string; _input: Json }
        Returns: {
          config: Json | null
          created_at: string | null
          deleted_at: string | null
          id: string
          profile_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "dashboard_configs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_document_references: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          document_id: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "document_references"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_documents: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_drawing_versions: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "drawing_versions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_dump_trucks: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "dump_trucks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_employees: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "employees"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_equipment: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "equipment"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_equipment_assignments: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "equipment_assignments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_equipment_maintenance: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "equipment_maintenance"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_equipment_usage: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "equipment_usage"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_estimate_line_items: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "estimate_line_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_estimates: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "estimates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_financial_documents: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "financial_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_general_ledger: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "general_ledger"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_hr_documents: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "hr_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_inspections: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "inspections"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_integration_tokens: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          profile_id: string | null
          service_name: string | null
          token: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "integration_tokens"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_inventory_transactions: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "inventory_transactions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_issues: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_job_titles: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "job_titles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_labor_records: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "labor_records"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_line_item_entries: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "line_item_entries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_line_item_templates: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "line_item_templates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_line_items: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "line_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_maps: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "maps"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_material_inventory: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "material_inventory"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_material_orders: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "material_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_material_receipts: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "material_receipts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_materials: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "materials"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_meeting_minutes: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "meeting_minutes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_my_organization: {
        Args: { _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_my_profile: {
        Args: {
          p_avatar_id?: string
          p_full_name?: string
          p_phone?: string
          p_role?: Database["public"]["Enums"]["user_role_type"]
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
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_notifications: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_organization_invites: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "organization_invites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_organization_member_rates: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "organization_member_rates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_organization_members: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          job_title_id: string | null
          organization_id: string | null
          permission_role: Database["public"]["Enums"]["org_role"] | null
          profile_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_members"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_organization_notification_settings: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string
          enabled_categories: Database["public"]["Enums"]["notification_category"][]
          enabled_events: string[]
          organization_id: string
          updated_at: string
          updated_by: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_notification_settings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_organization_projects: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          organization_id: string | null
          project_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_organization_service_areas: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string
          id: string
          organization_id: string
          service_area_text: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_service_areas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_organizations: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_payments: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_payroll: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "payroll"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_photos: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "photos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_prequalifications: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "prequalifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_procurement_workflows: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "procurement_workflows"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_profile_contract_role: {
        Args: { p_contract_id: string; p_profile_id: string; p_role: string }
        Returns: undefined
      }
      update_profiles: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_progress_billings: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "progress_billings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_project_inspectors: {
        Args: { _id: string; _input: Json }
        Returns: {
          assigned_at: string | null
          assigned_by: string | null
          deleted_at: string | null
          profile_id: string
          project_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "project_inspectors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_project_invites: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "project_invites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_project_service_areas: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string
          id: string
          project_id: string
          service_area_id: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "project_service_areas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_projects: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_punch_lists: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "punch_lists"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_purchase_orders: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "purchase_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_quality_reviews: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "quality_reviews"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_regulatory_documents: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "regulatory_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_reports: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          generated_at: string | null
          id: string
          project_id: string | null
          report_type: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "reports"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_rfis: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "rfis"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_safety_incidents: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "safety_incidents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_sensor_data: {
        Args: { _id: string; _input: Json }
        Returns: {
          collected_at: string | null
          created_at: string
          data: Json | null
          deleted_at: string | null
          id: string
          project_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "sensor_data"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_subcontractor_agreements: {
        Args: { _id: string; _input: Json }
        Returns: {
          agreement_url: string | null
          created_at: string
          deleted_at: string | null
          id: string
          signed_at: string | null
          subcontract_id: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "subcontractor_agreements"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_subcontracts: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "subcontracts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_submittals: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "submittals"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_tack_rates: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          id: string
          material_type: string | null
          project_id: string | null
          rate: number | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "tack_rates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_task_dependencies: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string
          deleted_at: string | null
          depends_on_task_id: string
          id: string
          task_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "task_dependencies"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_task_status_logs: {
        Args: { _id: string; _input: Json }
        Returns: {
          changed_at: string
          deleted_at: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "task_status_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_tasks: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "tasks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_training_records: {
        Args: { _id: string; _input: Json }
        Returns: {
          completion_date: string | null
          created_at: string
          deleted_at: string | null
          employee_id: string | null
          id: string
          training_type: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "training_records"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_user_notification_settings: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string
          silenced_categories: Database["public"]["Enums"]["notification_category"][]
          silenced_events: string[]
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "user_notification_settings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_user_projects: {
        Args: { _id: string; _input: Json }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          project_id: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_projects"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_vendor_bid_packages: {
        Args: { _id: string; _input: Json }
        Returns: {
          bid_package_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          updated_at: string
          vendor_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vendor_bid_packages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_vendor_contacts: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "vendor_contacts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_vendor_documents: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "vendor_documents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_vendor_qualifications: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "vendor_qualifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_vendors: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "vendors"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_wbs: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "wbs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_workflows: {
        Args: { _id: string; _input: Json }
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
        SetofOptions: {
          from: "*"
          to: "workflows"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      upsert_my_avatar: {
        Args: { p_is_preset?: boolean; p_url: string }
        Returns: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_preset: boolean
          updated_at: string
          url: string
        }[]
        SetofOptions: {
          from: "*"
          to: "avatars"
          isOneToOne: false
          isSetofReturn: true
        }
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
        | "owner"
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
  auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      oauth_authorization_status: ["pending", "approved", "denied", "expired"],
      oauth_client_type: ["public", "confidential"],
      oauth_registration_type: ["dynamic", "manual"],
      oauth_response_type: ["code"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
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
        "owner",
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
