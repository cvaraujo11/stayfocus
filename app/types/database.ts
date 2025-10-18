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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alimentacao_refeicoes: {
        Row: {
          created_at: string
          data: string
          descricao: string
          foto_url: string | null
          hora: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          descricao: string
          foto_url?: string | null
          hora: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          foto_url?: string | null
          hora?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      atividades: {
        Row: {
          categoria: string
          created_at: string
          data: string
          duracao_minutos: number | null
          id: string
          observacoes: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data: string
          duracao_minutos?: number | null
          id?: string
          observacoes?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          duracao_minutos?: number | null
          id?: string
          observacoes?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      autoconhecimento_registros: {
        Row: {
          created_at: string
          data: string
          gatilhos: string[] | null
          id: string
          nivel: number
          observacoes: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          gatilhos?: string[] | null
          id?: string
          nivel: number
          observacoes?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          gatilhos?: string[] | null
          id?: string
          nivel?: number
          observacoes?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      blocos_tempo: {
        Row: {
          atividade: string
          categoria: string
          created_at: string | null
          data: string
          hora: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          atividade: string
          categoria: string
          created_at?: string | null
          data?: string
          hora: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          atividade?: string
          categoria?: string
          created_at?: string | null
          data?: string
          hora?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      estudos_concursos: {
        Row: {
          cargo: string | null
          created_at: string
          data_prova: string | null
          disciplinas: string[] | null
          id: string
          instituicao: string | null
          nome: string
          status: string
          user_id: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          data_prova?: string | null
          disciplinas?: string[] | null
          id?: string
          instituicao?: string | null
          nome: string
          status?: string
          user_id: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          data_prova?: string | null
          disciplinas?: string[] | null
          id?: string
          instituicao?: string | null
          nome?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      estudos_questoes: {
        Row: {
          alternativas: Json
          concurso_id: string | null
          created_at: string
          disciplina: string
          enunciado: string
          explicacao: string | null
          id: string
          resposta_correta: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          alternativas: Json
          concurso_id?: string | null
          created_at?: string
          disciplina: string
          enunciado: string
          explicacao?: string | null
          id?: string
          resposta_correta: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          alternativas?: Json
          concurso_id?: string | null
          created_at?: string
          disciplina?: string
          enunciado?: string
          explicacao?: string | null
          id?: string
          resposta_correta?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudos_questoes_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "estudos_concursos"
            referencedColumns: ["id"]
          },
        ]
      }
      estudos_registros: {
        Row: {
          created_at: string
          data: string
          disciplina: string
          duracao_minutos: number
          id: string
          observacoes: string | null
          topicos: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          disciplina: string
          duracao_minutos: number
          id?: string
          observacoes?: string | null
          topicos?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          disciplina?: string
          duracao_minutos?: number
          id?: string
          observacoes?: string | null
          topicos?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      estudos_simulados: {
        Row: {
          acertos: number | null
          concurso_id: string | null
          created_at: string
          data_realizacao: string | null
          id: string
          questoes_ids: string[] | null
          tempo_limite_minutos: number | null
          titulo: string
          total_questoes: number | null
          user_id: string
        }
        Insert: {
          acertos?: number | null
          concurso_id?: string | null
          created_at?: string
          data_realizacao?: string | null
          id?: string
          questoes_ids?: string[] | null
          tempo_limite_minutos?: number | null
          titulo: string
          total_questoes?: number | null
          user_id: string
        }
        Update: {
          acertos?: number | null
          concurso_id?: string | null
          created_at?: string
          data_realizacao?: string | null
          id?: string
          questoes_ids?: string[] | null
          tempo_limite_minutos?: number | null
          titulo?: string
          total_questoes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudos_simulados_concurso_id_fkey"
            columns: ["concurso_id"]
            isOneToOne: false
            referencedRelation: "estudos_concursos"
            referencedColumns: ["id"]
          },
        ]
      }
      financas_categorias: {
        Row: {
          cor: string
          created_at: string
          icone: string
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          cor: string
          created_at?: string
          icone: string
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          cor?: string
          created_at?: string
          icone?: string
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      financas_envelopes: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          user_id: string
          valor_alocado: number
          valor_utilizado: number
        }
        Insert: {
          cor: string
          created_at?: string
          id?: string
          nome: string
          user_id: string
          valor_alocado: number
          valor_utilizado?: number
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          user_id?: string
          valor_alocado?: number
          valor_utilizado?: number
        }
        Relationships: []
      }
      financas_pagamentos_recorrentes: {
        Row: {
          categoria_id: string | null
          created_at: string
          data_vencimento: string
          descricao: string
          id: string
          pago: boolean
          proximo_pagamento: string | null
          user_id: string
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          data_vencimento: string
          descricao: string
          id?: string
          pago?: boolean
          proximo_pagamento?: string | null
          user_id: string
          valor: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          data_vencimento?: string
          descricao?: string
          id?: string
          pago?: boolean
          proximo_pagamento?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financas_pagamentos_recorrentes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financas_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      financas_transacoes: {
        Row: {
          categoria_id: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          data: string
          descricao: string
          id?: string
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financas_transacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financas_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      hiperfocos: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          id: string
          intensidade: number | null
          status: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_fim?: string |
          data_inicio: string
          descricao?: string | null
          id?: string
          intensidade?: number | null
          status?: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          id?: string
          intensidade?: number | null
          status?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      lista_compras: {
        Row: {
          categoria: string | null
          comprado: boolean
          created_at: string
          id: string
          item: string
          quantidade: string | null
          user_id: string
        }
        Insert: {
          categoria?: string | null
          comprado?: boolean
          created_at?: string
          id?: string
          item: string
          quantidade?: string | null
          user_id: string
        }
        Update: {
          categoria?: string | null
          comprado?: boolean
          created_at?: string
          id?: string
          item?: string
          quantidade?: string | null
          user_id?: string
        }
        Relationships: []
      }
      metas_diarias: {
        Row: {
          copos_agua: number
          horas_sono: number
          id: string
          pausas_programadas: number
          tarefas_prioritarias: number
          updated_at: string
          user_id: string
        }
        Insert: {
          copos_agua?: number
          horas_sono?: number
          id?: string
          pausas_programadas?: number
          tarefas_prioritarias?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          copos_agua?: number
          horas_sono?: number
          id?: string
          pausas_programadas?: number
          tarefas_prioritarias?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pomodoro_sessoes: {
        Row: {
          concluida: boolean
          created_at: string
          data: string
          duracao_minutos: number
          id: string
          tarefa: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          data: string
          duracao_minutos: number
          id?: string
          tarefa?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          concluida?: boolean
          created_at?: string
          data?: string
          duracao_minutos?: number
          id?: string
          tarefa?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      preferencias_visuais: {
        Row: {
          alto_contraste: boolean
          id: string
          reducao_estimulos: boolean
          texto_grande: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          alto_contraste?: boolean
          id?: string
          reducao_estimulos?: boolean
          texto_grande?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          alto_contraste?: boolean
          id?: string
          reducao_estimulos?: boolean
          texto_grande?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prioridades: {
        Row: {
          categoria: string | null
          concluida: boolean
          created_at: string
          data: string
          id: string
          nivel_prioridade: number
          titulo: string
          user_id: string
        }
        Insert: {
          categoria?: string | null
          concluida?: boolean
          created_at?: string
          data: string
          id?: string
          nivel_prioridade: number
          titulo: string
          user_id: string
        }
        Update: {
          categoria?: string | null
          concluida?: boolean
          created_at?: string
          data?: string
          id?: string
          nivel_prioridade?: number
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      receitas: {
        Row: {
          categoria: string | null
          created_at: string
          favorita: boolean
          foto_url: string | null
          id: string
          ingredientes: Json
          modo_preparo: string
          porcoes: number | null
          tempo_preparo_minutos: number | null
          titulo: string
          user_id: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          favorita?: boolean
          foto_url?: string | null
          id?: string
          ingredientes: Json
          modo_preparo: string
          porcoes?: number | null
          tempo_preparo_minutos?: number | null
          titulo: string
          user_id: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          favorita?: boolean
          foto_url?: string | null
          id?: string
          ingredientes?: Json
          modo_preparo?: string
          porcoes?: number | null
          tempo_preparo_minutos?: number | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      sono_registros: {
        Row: {
          created_at: string
          data: string
          hora_acordar: string | null
          hora_dormir: string | null
          id: string
          observacoes: string | null
          qualidade: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          hora_acordar?: string | null
          hora_dormir?: string | null
          id?: string
          observacoes?: string | null
          qualidade?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          hora_acordar?: string | null
          hora_dormir?: string | null
          id?: string
          observacoes?: string | null
          qualidade?: number | null
          user_id?: string
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          created_at: string
          id: string
          nome: string
          notificacoes_ativas: boolean
          pausas_ativas: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string
          notificacoes_ativas?: boolean
          pausas_ativas?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          notificacoes_ativas?: boolean
          pausas_ativas?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["View
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : nev
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["View
    ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer
      }
  ? R
  : nver
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals 
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables]
    : never = neve
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer
    }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infI
   
     
      : n
    : never

export type TablesUpdate<
      DefaultSchemaTableNameOrOptions extends
      | keyof DefaultSchema["Tables"]
      | { schema: keyof DatabaseWithoutInternals,
  TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
      }
    ?keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ?DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
  Update: infer

    ?
    : nev
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: inf U


    : never
    : never

    export type Enums<
      DefaultSchemaEnumNameOrOptions extends
      | keyof DefaultSchema["Enums
      | { schema: keyof DatabaseWithoutInternals },
      EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
      }
      ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums
    : never = neve
    > = DefaultSchemaEnumNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
    }
      ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
      : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never

    export type CompositeTypes<
      PublicCompositeTypeNameOrOptions extends
      | keyof DefaultSchema["CompositeTypes]
      | { schema: keyof DatabaseWithoutInternals 
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
      ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOption
    : never

    export const Constants = {
      public: {
        Enums: {},
      },
    } as const
]s
  }, "r,"]
}
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ?DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
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
    Enums: {},
  },
} as const
