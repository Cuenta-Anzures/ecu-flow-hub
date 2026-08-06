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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          created_by: string | null
          direccion: string | null
          email: string | null
          empresa: string | null
          fecha_alta: string
          id: string
          municipio: string | null
          nombre: string
          numero_cliente: string
          observaciones: string | null
          telefono: string
          updated_at: string
        }
        Insert: {
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          empresa?: string | null
          fecha_alta?: string
          id?: string
          municipio?: string | null
          nombre: string
          numero_cliente?: string
          observaciones?: string | null
          telefono: string
          updated_at?: string
        }
        Update: {
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          empresa?: string | null
          fecha_alta?: string
          id?: string
          municipio?: string | null
          nombre?: string
          numero_cliente?: string
          observaciones?: string | null
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      diagnosticos: {
        Row: {
          created_at: string
          diagnostico: string | null
          id: string
          motivo_falla: string | null
          observaciones: string | null
          recomendaciones: string | null
          registro_id: string
          reparaciones_realizadas: string | null
          resultado: string | null
          tecnico_id: string | null
          tiempo_minutos: number | null
        }
        Insert: {
          created_at?: string
          diagnostico?: string | null
          id?: string
          motivo_falla?: string | null
          observaciones?: string | null
          recomendaciones?: string | null
          registro_id: string
          reparaciones_realizadas?: string | null
          resultado?: string | null
          tecnico_id?: string | null
          tiempo_minutos?: number | null
        }
        Update: {
          created_at?: string
          diagnostico?: string | null
          id?: string
          motivo_falla?: string | null
          observaciones?: string | null
          recomendaciones?: string | null
          registro_id?: string
          reparaciones_realizadas?: string | null
          resultado?: string | null
          tecnico_id?: string | null
          tiempo_minutos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnosticos_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros_ecu"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_estados: {
        Row: {
          created_at: string
          estado_anterior: Database["public"]["Enums"]["estado_ecu"] | null
          estado_nuevo: Database["public"]["Enums"]["estado_ecu"]
          id: string
          motivo: string | null
          observaciones: string | null
          registro_id: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          estado_anterior?: Database["public"]["Enums"]["estado_ecu"] | null
          estado_nuevo: Database["public"]["Enums"]["estado_ecu"]
          id?: string
          motivo?: string | null
          observaciones?: string | null
          registro_id: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          estado_anterior?: Database["public"]["Enums"]["estado_ecu"] | null
          estado_nuevo?: Database["public"]["Enums"]["estado_ecu"]
          id?: string
          motivo?: string | null
          observaciones?: string | null
          registro_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_estados_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros_ecu"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_ecu: {
        Row: {
          created_at: string
          id: string
          marca: string | null
          nombre: string
        }
        Insert: {
          created_at?: string
          id?: string
          marca?: string | null
          nombre: string
        }
        Update: {
          created_at?: string
          id?: string
          marca?: string | null
          nombre?: string
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          canal: string
          cliente_id: string | null
          created_at: string
          estado: string
          id: string
          mensaje: string | null
          registro_id: string | null
          tipo: string
        }
        Insert: {
          canal?: string
          cliente_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          mensaje?: string | null
          registro_id?: string | null
          tipo: string
        }
        Update: {
          canal?: string
          cliente_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          mensaje?: string | null
          registro_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros_ecu"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          activo: boolean
          created_at: string
          email: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email?: string | null
          id: string
          nombre?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      registros_ecu: {
        Row: {
          anio: number | null
          anio_vehiculo: number | null
          cliente_id: string | null
          estado: Database["public"]["Enums"]["estado_ecu"]
          falla_reportada: string | null
          fecha_asignacion: string | null
          fecha_entrega: string | null
          fecha_ingreso: string
          folio: string
          id: string
          marca_vehiculo: string | null
          modelo: string
          modelo_vehiculo: string | null
          motivo_falla: string | null
          motivo_visita: string | null
          numero_parte: string | null
          observaciones: string | null
          para_venta: boolean
          recibido_por: string | null
          tecnico_id: string | null
          updated_at: string
        }
        Insert: {
          anio?: number | null
          anio_vehiculo?: number | null
          cliente_id?: string | null
          estado?: Database["public"]["Enums"]["estado_ecu"]
          falla_reportada?: string | null
          fecha_asignacion?: string | null
          fecha_entrega?: string | null
          fecha_ingreso?: string
          folio?: string
          id?: string
          marca_vehiculo?: string | null
          modelo: string
          modelo_vehiculo?: string | null
          motivo_falla?: string | null
          motivo_visita?: string | null
          numero_parte?: string | null
          observaciones?: string | null
          para_venta?: boolean
          recibido_por?: string | null
          tecnico_id?: string | null
          updated_at?: string
        }
        Update: {
          anio?: number | null
          anio_vehiculo?: number | null
          cliente_id?: string | null
          estado?: Database["public"]["Enums"]["estado_ecu"]
          falla_reportada?: string | null
          fecha_asignacion?: string | null
          fecha_entrega?: string | null
          fecha_ingreso?: string
          folio?: string
          id?: string
          marca_vehiculo?: string | null
          modelo?: string
          modelo_vehiculo?: string | null
          motivo_falla?: string | null
          motivo_visita?: string | null
          numero_parte?: string | null
          observaciones?: string | null
          para_venta?: boolean
          recibido_por?: string | null
          tecnico_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_ecu_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      roles_usuario: {
        Row: {
          created_at: string
          id: string
          rol: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rol: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rol?: Database["public"]["Enums"]["app_role"]
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
          _rol: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "administrador" | "recepcion" | "tecnico" | "ventas"
      estado_ecu:
        | "recibida"
        | "en_prueba_simulador"
        | "pendiente_asignacion"
        | "asignada_tecnico"
        | "en_revision"
        | "reparada"
        | "no_reparada"
        | "no_reparable"
        | "pendiente_entrega"
        | "completada"
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
      app_role: ["administrador", "recepcion", "tecnico", "ventas"],
      estado_ecu: [
        "recibida",
        "en_prueba_simulador",
        "pendiente_asignacion",
        "asignada_tecnico",
        "en_revision",
        "reparada",
        "no_reparada",
        "no_reparable",
        "pendiente_entrega",
        "completada",
      ],
    },
  },
} as const
