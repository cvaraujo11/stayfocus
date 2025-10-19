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
      alimentacao_planejamento: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          dia_semana: number | null
          horario: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao: string
          dia_semana?: number | null
          horario: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          dia_semana?: number | null
          horario?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      alimentacao_hidratacao: {
        Row: {
          copos_bebidos: number
          created_at: string
          data: string
          id: string
          meta_diaria: number
          ultimo_registro: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          copos_bebidos?: number
          created_at?: string
          data?: string
          id?: string
          meta_diaria?: number
          ultimo_registro?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          copos_bebidos?: number
          created_at?: string
          data?: string
          id?: string
          meta_diaria?: number
          ultimo_registro?: string | null
          updated_at?: string
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
          data_fim?: string | null
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
      hiperfoco_tarefas: {
        Row: {
          id: string
          hiperfoco_id: string
          user_id: string
          texto: string
          concluida: boolean
          tarefa_pai_id: string | null
          ordem: number
          cor: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hiperfoco_id: string
          user_id: string
          texto: string
          concluida?: boolean
          tarefa_pai_id?: string | null
          ordem?: number
          cor?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hiperfoco_id?: string
          user_id?: string
          texto?: string
          concluida?: boolean
          tarefa_pai_id?: string | null
          ordem?: number
          cor?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hiperfoco_tarefas_hiperfoco_id_fkey"
            columns: ["hiperfoco_id"]
            isOneToOne: false
            referencedRelation: "hiperfocos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hiperfoco_tarefas_tarefa_pai_id_fkey"
            columns: ["tarefa_pai_id"]
            isOneToOne: false
            referencedRelation: "hiperfoco_tarefas"
            referencedColumns: ["id"]
          }
        ]
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
      saude_medicamentos: {
        Row: {
          ativo: boolean
          created_at: string
          data_inicio: string
          dosagem: string | null
          frequencia: string
          horarios: string[]
          id: string
          intervalo_minutos: number
          nome: string
          observacoes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_inicio?: string
          dosagem?: string | null
          frequencia?: string
          horarios: string[]
          id?: string
          intervalo_minutos?: number
          nome: string
          observacoes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_inicio?: string
          dosagem?: string | null
          frequencia?: string
          horarios?: string[]
          id?: string
          intervalo_minutos?: number
          nome?: string
          observacoes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saude_tomadas_medicamentos: {
        Row: {
          created_at: string
          data_hora: string
          horario_programado: string | null
          id: string
          medicamento_id: string
          observacoes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data_hora?: string
          horario_programado?: string | null
          id?: string
          medicamento_id: string
          observacoes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data_hora?: string
          horario_programado?: string | null
          id?: string
          medicamento_id?: string
          observacoes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saude_tomadas_medicamentos_medicamento_id_fkey"
            columns: ["medicamento_id"]
            isOneToOne: false
            referencedRelation: "saude_medicamentos"
            referencedColumns: ["id"]
          }
        ]
      }
      saude_registros_humor: {
        Row: {
          created_at: string
          data: string
          fatores: string[]
          id: string
          nivel: number
          notas: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          fatores?: string[]
          id?: string
          nivel: number
          notas?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          fatores?: string[]
          id?: string
          nivel?: number
          notas?: string | null
          updated_at?: string
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
    Enums: {},
  },
} as const
