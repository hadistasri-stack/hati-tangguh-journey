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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_progress: {
        Row: {
          belajar: boolean
          child_id: string
          created_at: string
          day_index: number
          game_used_minutes: number
          id: string
          log_date: string
          panic_taps: number
          sholat: boolean
          sosial: boolean
          updated_at: string
        }
        Insert: {
          belajar?: boolean
          child_id: string
          created_at?: string
          day_index: number
          game_used_minutes?: number
          id?: string
          log_date?: string
          panic_taps?: number
          sholat?: boolean
          sosial?: boolean
          updated_at?: string
        }
        Update: {
          belajar?: boolean
          child_id?: string
          created_at?: string
          day_index?: number
          game_used_minutes?: number
          id?: string
          log_date?: string
          panic_taps?: number
          sholat?: boolean
          sosial?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      emotion_logs: {
        Row: {
          child_id: string
          created_at: string
          entries: Json
          id: string
          kind: string
        }
        Insert: {
          child_id: string
          created_at?: string
          entries: Json
          id?: string
          kind?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          entries?: Json
          id?: string
          kind?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted_at: string | null
          child_id: string
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          invitee_role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invite_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          child_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email: string
          invitee_role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          child_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string
          invitee_role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
        }
        Relationships: []
      }
      muhasabah_entries: {
        Row: {
          answers: Json
          child_id: string
          created_at: string
          id: string
          log_date: string
        }
        Insert: {
          answers: Json
          child_id: string
          created_at?: string
          id?: string
          log_date?: string
        }
        Update: {
          answers?: Json
          child_id?: string
          created_at?: string
          id?: string
          log_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string
          created_at: string
          email: string | null
          id: string
          nickname: string
          updated_at: string
        }
        Insert: {
          avatar?: string
          created_at?: string
          email?: string | null
          id: string
          nickname?: string
          updated_at?: string
        }
        Update: {
          avatar?: string
          created_at?: string
          email?: string | null
          id?: string
          nickname?: string
          updated_at?: string
        }
        Relationships: []
      }
      relationships: {
        Row: {
          child_id: string
          created_at: string
          id: string
          parent_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          parent_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          parent_id?: string
        }
        Relationships: []
      }
      student_daily_logs: {
        Row: {
          belajar: boolean
          created_at: string
          id: string
          log_date: string
          panic_taps: number
          session_id: string
          sholat: boolean
          sosial: boolean
          tree_level: number
        }
        Insert: {
          belajar?: boolean
          created_at?: string
          id?: string
          log_date: string
          panic_taps?: number
          session_id: string
          sholat?: boolean
          sosial?: boolean
          tree_level?: number
        }
        Update: {
          belajar?: boolean
          created_at?: string
          id?: string
          log_date?: string
          panic_taps?: number
          session_id?: string
          sholat?: boolean
          sosial?: boolean
          tree_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_daily_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "student_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_sessions: {
        Row: {
          avatar: string
          created_at: string
          id: string
          kelas: string
          last_muhasabah_at: string | null
          muhasabah_count: number
          nickname: string
          panic_taps: number
          pretest: Json | null
          today_belajar: boolean
          today_date: string | null
          today_sholat: boolean
          today_sosial: boolean
          tree_level: number
          updated_at: string
        }
        Insert: {
          avatar?: string
          created_at?: string
          id?: string
          kelas?: string
          last_muhasabah_at?: string | null
          muhasabah_count?: number
          nickname: string
          panic_taps?: number
          pretest?: Json | null
          today_belajar?: boolean
          today_date?: string | null
          today_sholat?: boolean
          today_sosial?: boolean
          tree_level?: number
          updated_at?: string
        }
        Update: {
          avatar?: string
          created_at?: string
          id?: string
          kelas?: string
          last_muhasabah_at?: string | null
          muhasabah_count?: number
          nickname?: string
          panic_taps?: number
          pretest?: Json | null
          today_belajar?: boolean
          today_date?: string | null
          today_sholat?: boolean
          today_sosial?: boolean
          tree_level?: number
          updated_at?: string
        }
        Relationships: []
      }
      tree_state: {
        Row: {
          child_id: string
          level: number
          updated_at: string
        }
        Insert: {
          child_id: string
          level?: number
          updated_at?: string
        }
        Update: {
          child_id?: string
          level?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_pendamping_of: {
        Args: { _child_id: string; _parent_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "child" | "parent" | "counselor"
      emotion_key: "takut" | "marah" | "sedih" | "bingung" | "tenang"
      invite_status: "pending" | "accepted" | "revoked" | "expired"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["child", "parent", "counselor"],
      emotion_key: ["takut", "marah", "sedih", "bingung", "tenang"],
      invite_status: ["pending", "accepted", "revoked", "expired"],
    },
  },
} as const
