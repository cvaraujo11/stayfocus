# 🔍 Queries Úteis

Coleção de queries para consulta, análise e verificação do banco de dados.

## 📋 Arquivos Disponíveis

### Queries Gerais

- **[queries-uteis.sql](./queries-uteis.sql)**
  - Estatísticas gerais
  - Consultas por módulo (Finanças, Saúde, Hiperfocos, etc.)
  - Queries de manutenção
  - Queries de auditoria
  - Monitoramento de performance

### Queries Específicas

- **[verificacao-financas.sql](./verificacao-financas.sql)**
  - Verificações do módulo de finanças
  - Validação de categorias
  - Análise de transações

## 🚀 Como Usar

### No psql
```bash
psql -h host -U user -d database -f queries-uteis.sql
```

### No Supabase Dashboard
1. Vá em SQL Editor
2. Copie e cole a query desejada
3. Execute

### Programaticamente
```javascript
const { data, error } = await supabase.rpc('nome_da_funcao');
```

## 📊 Categorias de Queries

### 1. Estatísticas Gerais
- Contagem de registros por tabela
- Tamanho das tabelas
- Usuários cadastrados

### 2. Consultas por Módulo
- Finanças: balanço, transações, envelopes
- Saúde: medicamentos, tomadas, humor
- Hiperfocos: progresso, tarefas
- Alimentação: refeições, hidratação
- Estudos: concursos, questões, simulados

### 3. Manutenção
- Verificar índices não utilizados
- Tabelas que precisam de VACUUM
- Queries lentas

### 4. Auditoria
- Políticas RLS ativas
- Últimas atividades de autenticação
- Verificação de segurança
