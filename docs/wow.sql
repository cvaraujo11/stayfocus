-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alimentacao_hidratacao (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  copos_bebidos integer NOT NULL DEFAULT 0 CHECK (copos_bebidos >= 0 AND copos_bebidos <= 50),
  meta_diaria integer NOT NULL DEFAULT 8 CHECK (meta_diaria > 0 AND meta_diaria <= 20),
  ultimo_registro timestamp with time zone,
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alimentacao_hidratacao_pkey PRIMARY KEY (id),
  CONSTRAINT alimentacao_hidratacao_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.alimentacao_planejamento (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  horario text NOT NULL,
  descricao text NOT NULL,
  dia_semana integer CHECK (dia_semana >= 0 AND dia_semana <= 6),
  ativo boolean DEFAULT true,
  ordem integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT alimentacao_planejamento_pkey PRIMARY KEY (id),
  CONSTRAINT alimentacao_planejamento_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.alimentacao_refeicoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  hora time without time zone NOT NULL,
  descricao text NOT NULL,
  foto_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT alimentacao_refeicoes_pkey PRIMARY KEY (id),
  CONSTRAINT alimentacao_refeicoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.atividades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  titulo text NOT NULL,
  categoria text NOT NULL CHECK (categoria = ANY (ARRAY['lazer'::text, 'saude'::text, 'social'::text])),
  duracao_minutos integer,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT atividades_pkey PRIMARY KEY (id),
  CONSTRAINT atividades_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])),
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_log_pkey PRIMARY KEY (id)
);
CREATE TABLE public.autoconhecimento_registros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['humor'::text, 'energia'::text, 'ansiedade'::text])),
  nivel integer NOT NULL CHECK (nivel >= 1 AND nivel <= 5),
  gatilhos ARRAY,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT autoconhecimento_registros_pkey PRIMARY KEY (id),
  CONSTRAINT autoconhecimento_registros_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.blocos_tempo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hora text NOT NULL,
  atividade text NOT NULL,
  categoria text NOT NULL CHECK (categoria = ANY (ARRAY['inicio'::text, 'alimentacao'::text, 'estudos'::text, 'saude'::text, 'lazer'::text, 'nenhuma'::text])),
  data date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blocos_tempo_pkey PRIMARY KEY (id),
  CONSTRAINT blocos_tempo_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.estudos_concursos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  data_prova date,
  instituicao text,
  cargo text,
  disciplinas ARRAY,
  status text NOT NULL DEFAULT 'em_andamento'::text CHECK (status = ANY (ARRAY['em_andamento'::text, 'concluido'::text, 'cancelado'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT estudos_concursos_pkey PRIMARY KEY (id),
  CONSTRAINT estudos_concursos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.estudos_questoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  concurso_id uuid,
  disciplina text NOT NULL,
  enunciado text NOT NULL,
  alternativas jsonb NOT NULL,
  resposta_correta text NOT NULL,
  explicacao text,
  tags ARRAY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT estudos_questoes_pkey PRIMARY KEY (id),
  CONSTRAINT estudos_questoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT estudos_questoes_concurso_id_fkey FOREIGN KEY (concurso_id) REFERENCES public.estudos_concursos(id)
);
CREATE TABLE public.estudos_registros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  disciplina text NOT NULL,
  duracao_minutos integer NOT NULL CHECK (duracao_minutos > 0),
  topicos ARRAY,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT estudos_registros_pkey PRIMARY KEY (id),
  CONSTRAINT estudos_registros_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.estudos_simulados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  concurso_id uuid,
  titulo text NOT NULL,
  questoes_ids ARRAY,
  data_realizacao timestamp with time zone,
  tempo_limite_minutos integer,
  acertos integer,
  total_questoes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT estudos_simulados_pkey PRIMARY KEY (id),
  CONSTRAINT estudos_simulados_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT estudos_simulados_concurso_id_fkey FOREIGN KEY (concurso_id) REFERENCES public.estudos_concursos(id)
);
CREATE TABLE public.financas_categorias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  cor text NOT NULL,
  icone text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT financas_categorias_pkey PRIMARY KEY (id),
  CONSTRAINT financas_categorias_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.financas_envelopes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  cor text NOT NULL,
  valor_alocado numeric NOT NULL CHECK (valor_alocado >= 0::numeric),
  valor_utilizado numeric NOT NULL DEFAULT 0 CHECK (valor_utilizado >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT financas_envelopes_pkey PRIMARY KEY (id),
  CONSTRAINT financas_envelopes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.financas_pagamentos_recorrentes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  data_vencimento text NOT NULL,
  categoria_id uuid,
  proximo_pagamento date,
  pago boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT financas_pagamentos_recorrentes_pkey PRIMARY KEY (id),
  CONSTRAINT financas_pagamentos_recorrentes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT financas_pagamentos_recorrentes_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.financas_categorias(id)
);
CREATE TABLE public.financas_transacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  valor numeric NOT NULL,
  descricao text NOT NULL,
  categoria_id uuid,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['receita'::text, 'despesa'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT financas_transacoes_pkey PRIMARY KEY (id),
  CONSTRAINT financas_transacoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT financas_transacoes_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.financas_categorias(id)
);
CREATE TABLE public.hiperfoco_tarefas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hiperfoco_id uuid NOT NULL,
  user_id uuid NOT NULL,
  texto text NOT NULL,
  concluida boolean DEFAULT false,
  tarefa_pai_id uuid,
  ordem integer DEFAULT 0,
  cor text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hiperfoco_tarefas_pkey PRIMARY KEY (id),
  CONSTRAINT hiperfoco_tarefas_hiperfoco_id_fkey FOREIGN KEY (hiperfoco_id) REFERENCES public.hiperfocos(id),
  CONSTRAINT hiperfoco_tarefas_tarefa_pai_id_fkey FOREIGN KEY (tarefa_pai_id) REFERENCES public.hiperfoco_tarefas(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.hiperfocos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  data_inicio date NOT NULL,
  data_fim date,
  intensidade integer CHECK (intensidade >= 1 AND intensidade <= 5),
  status text NOT NULL DEFAULT 'ativo'::text CHECK (status = ANY (ARRAY['ativo'::text, 'pausado'::text, 'concluido'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hiperfocos_pkey PRIMARY KEY (id),
  CONSTRAINT hiperfocos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.lista_compras (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item text NOT NULL,
  quantidade text,
  categoria text,
  comprado boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lista_compras_pkey PRIMARY KEY (id),
  CONSTRAINT lista_compras_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.metas_diarias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  horas_sono integer NOT NULL DEFAULT 8 CHECK (horas_sono >= 1 AND horas_sono <= 24),
  tarefas_prioritarias integer NOT NULL DEFAULT 3 CHECK (tarefas_prioritarias >= 1 AND tarefas_prioritarias <= 20),
  copos_agua integer NOT NULL DEFAULT 8 CHECK (copos_agua >= 1 AND copos_agua <= 30),
  pausas_programadas integer NOT NULL DEFAULT 4 CHECK (pausas_programadas >= 0 AND pausas_programadas <= 20),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT metas_diarias_pkey PRIMARY KEY (id),
  CONSTRAINT metas_diarias_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.pomodoro_sessoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  duracao_minutos integer NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['foco'::text, 'pausa'::text])),
  tarefa text,
  concluida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pomodoro_sessoes_pkey PRIMARY KEY (id),
  CONSTRAINT pomodoro_sessoes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.preferencias_visuais (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  alto_contraste boolean NOT NULL DEFAULT false,
  reducao_estimulos boolean NOT NULL DEFAULT false,
  texto_grande boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT preferencias_visuais_pkey PRIMARY KEY (id),
  CONSTRAINT preferencias_visuais_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.prioridades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  titulo text NOT NULL,
  categoria text,
  nivel_prioridade integer NOT NULL CHECK (nivel_prioridade >= 1 AND nivel_prioridade <= 3),
  concluida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT prioridades_pkey PRIMARY KEY (id),
  CONSTRAINT prioridades_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.receitas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  ingredientes jsonb NOT NULL,
  modo_preparo text NOT NULL,
  tempo_preparo_minutos integer,
  porcoes integer,
  categoria text,
  foto_url text,
  favorita boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT receitas_pkey PRIMARY KEY (id),
  CONSTRAINT receitas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.saude_medicamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome character varying NOT NULL,
  dosagem character varying,
  frequencia character varying NOT NULL DEFAULT 'Diária'::character varying CHECK (frequencia::text = ANY (ARRAY['Diária'::character varying, 'Semanal'::character varying, 'Mensal'::character varying, 'Conforme necessário'::character varying]::text[])),
  horarios ARRAY NOT NULL DEFAULT '{}'::text[] CHECK (array_length(horarios, 1) > 0),
  observacoes text,
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  intervalo_minutos integer DEFAULT 240 CHECK (intervalo_minutos > 0),
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saude_medicamentos_pkey PRIMARY KEY (id),
  CONSTRAINT saude_medicamentos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.saude_registros_humor (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  nivel integer NOT NULL CHECK (nivel >= 1 AND nivel <= 5),
  fatores ARRAY DEFAULT '{}'::text[],
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saude_registros_humor_pkey PRIMARY KEY (id),
  CONSTRAINT saude_registros_humor_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.saude_tomadas_medicamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  medicamento_id uuid NOT NULL,
  user_id uuid NOT NULL,
  data_hora timestamp with time zone NOT NULL DEFAULT now(),
  horario_programado time without time zone,
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saude_tomadas_medicamentos_pkey PRIMARY KEY (id),
  CONSTRAINT saude_tomadas_medicamentos_medicamento_id_fkey FOREIGN KEY (medicamento_id) REFERENCES public.saude_medicamentos(id),
  CONSTRAINT saude_tomadas_medicamentos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.sono_registros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  hora_dormir time without time zone,
  hora_acordar time without time zone,
  qualidade integer CHECK (qualidade >= 1 AND qualidade <= 5),
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sono_registros_pkey PRIMARY KEY (id),
  CONSTRAINT sono_registros_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users_profile (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  nome text NOT NULL DEFAULT 'Usuário'::text,
  notificacoes_ativas boolean NOT NULL DEFAULT true,
  pausas_ativas boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_profile_pkey PRIMARY KEY (id),
  CONSTRAINT users_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);