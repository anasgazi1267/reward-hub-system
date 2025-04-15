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
      completed_tasks: {
        Row: {
          completed_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          available: boolean
          category: string
          coin_cost: number
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
        }
        Insert: {
          available?: boolean
          category: string
          coin_cost: number
          created_at?: string
          description: string
          id?: string
          image_url: string
          name: string
        }
        Update: {
          available?: boolean
          category?: string
          coin_cost?: number
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      "Rewardshube database": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          inviter_reward: number
          min_referrals_for_withdrawal: number
          min_withdrawal_coins: number
          referral_reward: number
        }
        Insert: {
          id?: string
          inviter_reward?: number
          min_referrals_for_withdrawal?: number
          min_withdrawal_coins?: number
          referral_reward?: number
        }
        Update: {
          id?: string
          inviter_reward?: number
          min_referrals_for_withdrawal?: number
          min_withdrawal_coins?: number
          referral_reward?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          coin_reward: number
          created_at: string
          description: string
          frequency: string | null
          id: string
          image_url: string | null
          requirements: string | null
          target_url: string
          title: string
          type: string
        }
        Insert: {
          coin_reward: number
          created_at?: string
          description: string
          frequency?: string | null
          id?: string
          image_url?: string | null
          requirements?: string | null
          target_url: string
          title: string
          type: string
        }
        Update: {
          coin_reward?: number
          created_at?: string
          description?: string
          frequency?: string | null
          id?: string
          image_url?: string | null
          requirements?: string | null
          target_url?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          coins: number
          created_at: string
          email: string
          id: string
          is_admin: boolean
          referral_code: string
          referral_count: number
          referred_by: string | null
          username: string
        }
        Insert: {
          coins?: number
          created_at?: string
          email: string
          id: string
          is_admin?: boolean
          referral_code: string
          referral_count?: number
          referred_by?: string | null
          username: string
        }
        Update: {
          coins?: number
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          referral_code?: string
          referral_count?: number
          referred_by?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          category: string
          coin_amount: number
          created_at: string
          email: string | null
          id: string
          phone_number: string | null
          player_id: string | null
          player_username: string | null
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          category: string
          coin_amount: number
          created_at?: string
          email?: string | null
          id?: string
          phone_number?: string | null
          player_id?: string | null
          player_username?: string | null
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          category?: string
          coin_amount?: number
          created_at?: string
          email?: string | null
          id?: string
          phone_number?: string | null
          player_id?: string | null
          player_username?: string | null
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
