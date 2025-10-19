# Estrutura Completa do Banco de Dados - StayFocus

**Data de Geração:** 19 de Outubro de 2025  
**Projeto:** StayFocus (llwcibvofptjyxxrcbvu)  
**Região:** us-east-2  
**Versão PostgreSQL:** 17.6.1.021

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Schemas](#schemas)
3. [Extensões Instaladas](#extensões-instaladas)
4. [Tabelas por Módulo](#tabelas-por-módulo)
5. [Relacionamentos](#relacionamentos)
6. [Políticas RLS](#políticas-rls)

---

## Visão Geral

O banco de dados StayFocus é estruturado para gerenciar múltiplos aspectos da vida de usuários com TDAH, incluindo:

- **Perfil e Preferências**: Configurações pessoais e visuais
- **Finanças**: Categorias, transações, envelopes e pagamentos recorrentes
- **Alimentação**: Refeições, planejamento, hidratação
- **Saúde**: Medicamentos, tomadas, registros de humor
- **Sono**: Registros de qualidade do sono
- **Estudos**: Concursos, questões, simulados
- **Hiperfocos**: Gerenciamento de períodos de hiperfoco e tarefas
- **Produtividade**: Pomodoro, prioridades, blocos de tempo
- **Lazer**: Atividades sociais e de lazer
- **Receitas**: Receitas culinárias e lista de compras

---

## Schemas

### 1. **auth** (Supabase Auth)
Gerencia autenticação e autorização de usuários.

**Tabelas principais:**
- `users` - 2 usuários cadastrados
- `sessions` - 7 sessões ativas
- `identities` - 2 identidades
- `refresh_tokens` - 7 tokens

### 2. **storage** (Supabase Storage)
Gerencia armazenamento de arquivos.

**Tabelas principais:**
- `buckets` - 1 bucket configurado
- `objects` - 0 objetos armazenados

### 3. **public** (Aplicação)
Schema principal da aplicação com todas as tabelas de negócio.

---

## Extensões Instaladas

| Extensão | Versão | Schema | Descrição |
|----------|--------|--------|-----------|
| `pg_graphql` | 1.5.11 | graphql | Suporte GraphQL |
| `supabase_vault` | 0.3.1 | vault | Vault do Supabase |
| `pgcrypto` | 1.3 | extensions | Funções criptográficas |
| `pg_stat_statements` | 1.11 | extensions | Estatísticas de queries |
| `uuid-ossp` | 1.1 | extensions | Geração de UUIDs |
| `plpgsql` | 1.0 | pg_catalog | Linguagem procedural |

**Extensões disponíveis mas não instaladas:** 68 extensões adicionais disponíveis para instalação.

---

## Tabelas por Módulo

### 📊 Módulo: Perfil e Configurações

#### `users_profile`
Perfil básico do usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users (UNIQUE) |
| nome | text | Nome do usuário (padrão: 'Usuário') |
| notificacoes_ativas | boolean | Notificações ativas (padrão: true) |
| pausas_ativas | boolean | Pausas ativas (padrão: true) |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Última atualização |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

#### `preferencias_visuais`
Preferências de acessibilidade visual.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users (UNIQUE) |
| alto_contraste | boolean | Alto contraste (padrão: false) |
| reducao_estimulos | boolean | Redução de estímulos (padrão: false) |
| texto_grande | boolean | Texto grande (padrão: false) |
| updated_at | timestamptz | Última atualização |

**RLS:** ✅ Habilitado  
**Registros:** 1

---

#### `metas_diarias`
Metas diárias personalizadas do usuário.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users (UNIQUE) | |
| horas_sono | integer | 1-24 (padrão: 8) | Meta de horas de sono |
| tarefas_prioritarias | integer | 1-20 (padrão: 3) | Meta de tarefas prioritárias |
| copos_agua | integer | 1-30 (padrão: 8) | Meta de copos de água |
| pausas_programadas | integer | 0-20 (padrão: 4) | Meta de pausas |
| updated_at | timestamptz | | Última atualização |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

### 💰 Módulo: Finanças

#### `financas_categorias`
Categorias personalizadas para transações financeiras.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| nome | text | Nome da categoria |
| cor | text | Cor em hexadecimal |
| icone | text | Nome do ícone |
| created_at | timestamptz | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 16

---

#### `financas_transacoes`
Registro de receitas e despesas.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| data | date | | Data da transação |
| valor | numeric | | Valor da transação |
| descricao | text | | Descrição |
| categoria_id | uuid | FK → financas_categorias (nullable) | |
| tipo | text | 'receita' ou 'despesa' | Tipo de transação |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 2

---

#### `financas_envelopes`
Sistema de envelopes para orçamento.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| nome | text | | Nome do envelope |
| cor | text | | Cor em hexadecimal |
| valor_alocado | numeric | >= 0 | Valor alocado |
| valor_utilizado | numeric | >= 0 (padrão: 0) | Valor já utilizado |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 1

---

#### `financas_pagamentos_recorrentes`
Pagamentos que se repetem mensalmente.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| descricao | text | Descrição do pagamento |
| valor | numeric | Valor |
| data_vencimento | text | Dia do vencimento |
| categoria_id | uuid | FK → financas_categorias (nullable) |
| proximo_pagamento | date | Data do próximo pagamento |
| pago | boolean | Status de pagamento (padrão: false) |
| created_at | timestamptz | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

### 🍽️ Módulo: Alimentação

#### `alimentacao_refeicoes`
Registro de refeições realizadas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| data | date | Data da refeição |
| hora | time | Hora da refeição |
| descricao | text | Descrição do que foi consumido |
| foto_url | text | URL da foto (nullable) |
| created_at | timestamptz | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 2

---

#### `alimentacao_planejamento`
Planejamento de refeições por dia da semana.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| horario | text | | Horário da refeição |
| descricao | text | | Descrição/nome da refeição |
| dia_semana | integer | 0-6 (nullable) | 0=Dom, 1=Seg... NULL=Todos |
| ativo | boolean | padrão: true | Se está ativo |
| ordem | integer | padrão: 0 | Ordem de exibição |
| created_at | timestamptz | | Data de criação |
| updated_at | timestamptz | | Última atualização |

**RLS:** ✅ Habilitado  
**Registros:** 1

---

#### `alimentacao_hidratacao`
Registro diário de consumo de água.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| data | date | padrão: CURRENT_DATE | Data do registro |
| copos_bebidos | integer | 0-50 (padrão: 0) | Copos bebidos |
| meta_diaria | integer | 1-20 (padrão: 8) | Meta do dia |
| ultimo_registro | timestamptz | nullable | Timestamp do último copo |
| notas | text | nullable | Observações |
| created_at | timestamptz | | Data de criação |
| updated_at | timestamptz | | Última atualização |

**RLS:** ✅ Habilitado  
**Registros:** 1

---

### 🏥 Módulo: Saúde

#### `saude_medicamentos`
Cadastro de medicamentos do usuário.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| nome | varchar | | Nome do medicamento |
| dosagem | varchar | nullable | Dosagem (ex: 10mg) |
| frequencia | varchar | padrão: 'Diária' | Diária/Semanal/Mensal/Conforme necessário |
| horarios | text[] | array_length > 0 | Array de horários (HH:MM) |
| observacoes | text | nullable | Observações |
| data_inicio | date | padrão: CURRENT_DATE | Data de início |
| intervalo_minutos | integer | > 0 (padrão: 240) | Intervalo mínimo entre doses |
| ativo | boolean | padrão: true | Se está em uso |
| created_at | timestamptz | | Data de criação |
| updated_at | timestamptz | | Última atualização |

**RLS:** ✅ Habilitado  
**Registros:** 1

---

#### `saude_tomadas_medicamentos`
Histórico de tomadas de medicamentos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| medicamento_id | uuid | FK → saude_medicamentos |
| user_id | uuid | FK → auth.users |
| data_hora | timestamptz | Quando foi tomado (padrão: now()) |
| horario_programado | time | Horário que estava programado (nullable) |
| observacoes | text | Observações (nullable) |
| created_at | timestamptz | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 3

---

#### `saude_registros_humor`
Monitoramento diário de humor.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| data | date | | Data do registro |
| nivel | integer | 1-5 | 1=muito ruim, 5=muito bom |
| fatores | text[] | padrão: '{}' | Fatores que influenciaram |
| notas | text | nullable | Observações |
| created_at | timestamptz | | Data de criação |
| updated_at | timestamptz | | Última atualização |

**RLS:** ✅ Habilitado  
**Registros:** 1

---

### 😴 Módulo: Sono

#### `sono_registros`
Registro de qualidade do sono.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| data | date | | Data do registro |
| hora_dormir | time | nullable | Hora que dormiu |
| hora_acordar | time | nullable | Hora que acordou |
| qualidade | integer | 1-5 (nullable) | Qualidade do sono |
| observacoes | text | nullable | Observações |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

### 📚 Módulo: Estudos

#### `estudos_concursos`
Concursos que o usuário está estudando.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| nome | text | | Nome do concurso |
| data_prova | date | nullable | Data da prova |
| instituicao | text | nullable | Instituição |
| cargo | text | nullable | Cargo |
| disciplinas | text[] | nullable | Disciplinas |
| status | text | padrão: 'em_andamento' | em_andamento/concluido/cancelado |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

#### `estudos_questoes`
Banco de questões para estudo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| concurso_id | uuid | FK → estudos_concursos (nullable) |
| disciplina | text | Disciplina |
| enunciado | text | Enunciado da questão |
| alternativas | jsonb | Alternativas em JSON |
| resposta_correta | text | Resposta correta |
| explicacao | text | Explicação (nullable) |
| tags | text[] | Tags (nullable) |
| created_at | timestamptz | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

#### `estudos_simulados`
Simulados realizados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| concurso_id | uuid | FK → estudos_concursos (nullable) |
| titulo | text | Título do simulado |
| questoes_ids | uuid[] | IDs das questões (nullable) |
| data_realizacao | timestamptz | Data de realização (nullable) |
| tempo_limite_minutos | integer | Tempo limite (nullable) |
| acertos | integer | Número de acertos (nullable) |
| total_questoes | integer | Total de questões (nullable) |
| created_at | timestamptz | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

#### `estudos_registros`
Registro de sessões de estudo.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| data | date | | Data do estudo |
| disciplina | text | | Disciplina estudada |
| duracao_minutos | integer | > 0 | Duração em minutos |
| topicos | text[] | nullable | Tópicos estudados |
| observacoes | text | nullable | Observações |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

### 🎯 Módulo: Hiperfocos

#### `hiperfocos`
Períodos de hiperfoco do usuário.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| titulo | text | | Título do hiperfoco |
| descricao | text | nullable | Descrição |
| data_inicio | date | | Data de início |
| data_fim | date | nullable | Data de fim |
| intensidade | integer | 1-5 (nullable) | Intensidade |
| status | text | padrão: 'ativo' | ativo/pausado/concluido |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 3

---

#### `hiperfoco_tarefas`
Tarefas e subtarefas de hiperfocos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| hiperfoco_id | uuid | FK → hiperfocos |
| user_id | uuid | FK → auth.users |
| texto | text | Texto da tarefa |
| concluida | boolean | Se está concluída (padrão: false) |
| tarefa_pai_id | uuid | FK → hiperfoco_tarefas (nullable, para subtarefas) |
| ordem | integer | Ordem de exibição (padrão: 0) |
| cor | text | Cor da tarefa (nullable) |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Última atualização |

**RLS:** ✅ Habilitado  
**Registros:** 2

---

### ⏱️ Módulo: Produtividade

#### `pomodoro_sessoes`
Sessões de Pomodoro.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| data | date | | Data da sessão |
| duracao_minutos | integer | | Duração |
| tipo | text | 'foco' ou 'pausa' | Tipo de sessão |
| tarefa | text | nullable | Tarefa relacionada |
| concluida | boolean | padrão: false | Se foi concluída |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

#### `prioridades`
Tarefas prioritárias diárias.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| data | date | | Data |
| titulo | text | | Título da tarefa |
| categoria | text | nullable | Categoria |
| nivel_prioridade | integer | 1-3 | Nível de prioridade |
| concluida | boolean | padrão: false | Se está concluída |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 2

---

#### `blocos_tempo`
Blocos de tempo do dia.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| hora | text | | Hora do bloco |
| atividade | text | | Atividade |
| categoria | text | | inicio/alimentacao/estudos/saude/lazer/nenhuma |
| data | date | padrão: CURRENT_DATE | Data |
| created_at | timestamptz | | Data de criação |
| updated_at | timestamptz | | Última atualização |

**RLS:** ✅ Habilitado  
**Registros:** 1

---

### 🎮 Módulo: Lazer e Autoconhecimento

#### `atividades`
Atividades de lazer, saúde e sociais.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| data | date | | Data da atividade |
| titulo | text | | Título |
| categoria | text | | lazer/saude/social |
| duracao_minutos | integer | nullable | Duração |
| observacoes | text | nullable | Observações |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

#### `autoconhecimento_registros`
Registros de humor, energia e ansiedade.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users | |
| data | date | | Data |
| tipo | text | | humor/energia/ansiedade |
| nivel | integer | 1-5 | Nível |
| gatilhos | text[] | nullable | Gatilhos identificados |
| observacoes | text | nullable | Observações |
| created_at | timestamptz | | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 0

---

### 🍳 Módulo: Receitas

#### `receitas`
Receitas culinárias do usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| titulo | text | Título da receita |
| ingredientes | jsonb | Ingredientes em JSON |
| modo_preparo | text | Modo de preparo |
| tempo_preparo_minutos | integer | Tempo de preparo (nullable) |
| porcoes | integer | Número de porções (nullable) |
| categoria | text | Categoria (nullable) |
| foto_url | text | URL da foto (nullable) |
| favorita | boolean | Se é favorita (padrão: false) |
| created_at | timestamptz | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 1

---

#### `lista_compras`
Lista de compras do usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| item | text | Nome do item |
| quantidade | text | Quantidade (nullable) |
| categoria | text | Categoria (nullable) |
| comprado | boolean | Se foi comprado (padrão: false) |
| created_at | timestamptz | Data de criação |

**RLS:** ✅ Habilitado  
**Registros:** 3

---

## Relacionamentos

### Diagrama de Relacionamentos Principais

```
auth.users (2 usuários)
    ├── users_profile (0)
    ├── preferencias_visuais (1)
    ├── metas_diarias (0)
    │
    ├── financas_categorias (16)
    │   ├── financas_transacoes (2)
    │   └── financas_pagamentos_recorrentes (0)
    ├── financas_envelopes (1)
    │
    ├── alimentacao_refeicoes (2)
    ├── alimentacao_planejamento (1)
    ├── alimentacao_hidratacao (1)
    │
    ├── saude_medicamentos (1)
    │   └── saude_tomadas_medicamentos (3)
    ├── saude_registros_humor (1)
    │
    ├── sono_registros (0)
    │
    ├── estudos_concursos (0)
    │   ├── estudos_questoes (0)
    │   └── estudos_simulados (0)
    ├── estudos_registros (0)
    │
    ├── hiperfocos (3)
    │   └── hiperfoco_tarefas (2)
    │       └── hiperfoco_tarefas (subtarefas)
    │
    ├── pomodoro_sessoes (0)
    ├── prioridades (2)
    ├── blocos_tempo (1)
    │
    ├── atividades (0)
    ├── autoconhecimento_registros (0)
    │
    ├── receitas (1)
    └── lista_compras (3)
```

---

## Políticas RLS

**Todas as tabelas do schema `public` têm RLS habilitado.**

Isso significa que:
- ✅ Cada usuário só pode acessar seus próprios dados
- ✅ Isolamento completo entre usuários
- ✅ Segurança em nível de linha

**Schemas com RLS:**
- ✅ `auth.*` - RLS habilitado
- ✅ `storage.*` - RLS habilitado  
- ✅ `public.*` - RLS habilitado

---

## Migrações Aplicadas

Total de migrações: **23**

1. `20251018154636` - create_users_profile_table
2. `20251018154645` - create_preferencias_visuais_table
3. `20251018154655` - create_metas_diarias_table
4. `20251018154705` - create_financas_categorias_table
5. `20251018154717` - create_financas_transacoes_table
6. `20251018154727` - create_financas_envelopes_table
7. `20251018154739` - create_financas_pagamentos_recorrentes_table
8. `20251018154751` - create_alimentacao_refeicoes_table
9. `20251018154801` - create_sono_registros_table
10. `20251018154811` - create_autoconhecimento_registros_table
11. `20251018154821` - create_estudos_registros_table
12. `20251018154831` - create_estudos_concursos_table
13. `20251018154841` - create_estudos_questoes_table
14. `20251018154852` - create_estudos_simulados_table
15. `20251018154902` - create_hiperfocos_table
16. `20251018154910` - create_atividades_table
17. `20251018154920` - create_pomodoro_sessoes_table
18. `20251018154931` - create_prioridades_table
19. `20251018154941` - create_receitas_table
20. `20251018154949` - create_lista_compras_table
21. `20251018154959` - create_updated_at_triggers
22. `20251018155257` - fix_function_search_path
23. `20251018181527` - create_blocos_tempo_table

---

## Estatísticas do Banco

- **Total de tabelas no schema public:** 28 tabelas
- **Total de registros:** ~40 registros distribuídos
- **Usuários cadastrados:** 2
- **Sessões ativas:** 7
- **Buckets de storage:** 1
- **Objetos armazenados:** 0

---

## Próximos Passos Sugeridos

1. ✅ Implementar políticas RLS específicas para cada tabela
2. ✅ Configurar triggers para updated_at (já implementado)
3. ⚠️ Adicionar índices para otimização de queries
4. ⚠️ Implementar soft delete onde necessário
5. ⚠️ Adicionar auditoria de mudanças críticas
6. ⚠️ Configurar backup automático
7. ⚠️ Implementar validações adicionais via triggers

---

**Documento gerado automaticamente via MCP Supabase**
