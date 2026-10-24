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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          section: Database["public"]["Enums"]["shop_section"]
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          section: Database["public"]["Enums"]["shop_section"]
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          section?: Database["public"]["Enums"]["shop_section"]
          sort_order?: number
        }
        Relationships: []
      }
      offers: {
        Row: {
          buy_qty: number
          conditions: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          get_qty: number
          id: string
          image_path: string | null
          is_active: boolean
          offer_type: string
          product_ids: string[]
          starts_at: string | null
          title: string
          value: number
        }
        Insert: {
          buy_qty?: number
          conditions?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          get_qty?: number
          id?: string
          image_path?: string | null
          is_active?: boolean
          offer_type: string
          product_ids?: string[]
          starts_at?: string | null
          title: string
          value?: number
        }
        Update: {
          buy_qty?: number
          conditions?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          get_qty?: number
          id?: string
          image_path?: string | null
          is_active?: boolean
          offer_type?: string
          product_ids?: string[]
          starts_at?: string | null
          title?: string
          value?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          applied_offers: Json
          created_at: string
          customer_name: string
          discount: number
          email: string | null
          fulfilment: string
          id: string
          items: Json
          notes: string | null
          phone: string
          status: string
          subtotal: number
          total: number
        }
        Insert: {
          address?: string | null
          applied_offers?: Json
          created_at?: string
          customer_name: string
          discount?: number
          email?: string | null
          fulfilment: string
          id?: string
          items: Json
          notes?: string | null
          phone: string
          status?: string
          subtotal: number
          total: number
        }
        Update: {
          address?: string | null
          applied_offers?: Json
          created_at?: string
          customer_name?: string
          discount?: number
          email?: string | null
          fulfilment?: string
          id?: string
          items?: Json
          notes?: string | null
          phone?: string
          status?: string
          subtotal?: number
          total?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          age_info: string | null
          category_id: string | null
          created_at: string
          customization: string | null
          description: string | null
          id: string
          image_path: string | null
          is_available: boolean
          mrp: number | null
          name: string
          price: number
          rental_terms: string | null
          section: Database["public"]["Enums"]["shop_section"]
          size_info: string | null
          sort_order: number
          stock: number | null
        }
        Insert: {
          age_info?: string | null
          category_id?: string | null
          created_at?: string
          customization?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          is_available?: boolean
          mrp?: number | null
          name: string
          price: number
          rental_terms?: string | null
          section: Database["public"]["Enums"]["shop_section"]
          size_info?: string | null
          sort_order?: number
          stock?: number | null
        }
        Update: {
          age_info?: string | null
          category_id?: string | null
          created_at?: string
          customization?: string | null
          description?: string | null
          id?: string
          image_path?: string | null
          is_available?: boolean
          mrp?: number | null
          name?: string
          price?: number
          rental_terms?: string | null
          section?: Database["public"]["Enums"]["shop_section"]
          size_info?: string | null
          sort_order?: number
          stock?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          about: string | null
          address: string | null
          delivery_info: string | null
          deposit_info: string | null
          frame_instructions: string | null
          hero_alt: string | null
          hero_image_path: string | null
          id: number
          maps_link: string | null
          rental_terms: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          address?: string | null
          delivery_info?: string | null
          deposit_info?: string | null
          frame_instructions?: string | null
          hero_alt?: string | null
          hero_image_path?: string | null
          id?: number
          maps_link?: string | null
          rental_terms?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          address?: string | null
          delivery_info?: string | null
          deposit_info?: string | null
          frame_instructions?: string | null
          hero_alt?: string | null
          hero_image_path?: string | null
          id?: number
          maps_link?: string | null
          rental_terms?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
    }
    Enums: {
      app_role: "admin" | "user"
      shop_section: "costumes" | "frames" | "gifts"
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
      app_role: ["admin", "user"],
      shop_section: ["costumes", "frames", "gifts"],
    },
  },
} as const
