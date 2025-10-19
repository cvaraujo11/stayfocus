# 📚 Migrações e Documentação do Banco de Dados - StayFocus

**Última atualização:** 19 de Outubro de 2025

## 📁 Estrutura de Diretórios

```
docs/migrations/
├── 01-applied/          # ✅ Migrações já aplicadas no banco
├── 02-rollbacks/        # 🔄 Scripts de rollback
├── 03-pending/          # ⏳ Migrações pendentes
├── 04-documentation/    # 📖 Documentação técnica completa
├── 05-queries/          # 🔍 Queries úteis e verificações
├── 06-scripts/          # ⚡ Scripts de otimização e manutenção
├── 07-seeds/            # 🌱 Dados iniciais (futuro)
└── 08-archives/         # 📦 Arquivos antigos
```

## 🚀 Início Rápido

### Para Desenvolvedores
1. Consulte `04-documentation/` para entender a estrutura
2. Use queries de `05-queries/` para análises
3. Execute scripts de `06-scripts/` para otimizações

### Para DBAs
1. Revise `01-applied/` para ver o histórico
2. Use `02-rollbacks/` se necessário reverter
3. Implemente otimizações de `06-scripts/`

### Para Gestores
1. Leia `04-documentation/infraestrutura.md` para visão geral
2. Acompanhe métricas e próximos passos

## 📖 Documentação Principal

- **[Infraestrutura](./04-documentation/infraestrutura.md)** - Visão geral executiva
- **[Estrutura Completa](./04-documentation/estrutura-completa-banco.md)** - Todas as tabelas
- **[Diagramas ER](./04-documentation/diagrama-er.md)** - Relacionamentos visuais
- **[Otimizações](./04-documentation/otimizacoes-recomendadas.md)** - Guia de performance

## 🔍 Queries Úteis

- **[Queries Gerais](./05-queries/queries-uteis.sql)** - Consultas por módulo
- **[Verificação Finanças](./05-queries/verificacao-financas.sql)** - Queries específicas

## ⚡ Scripts de Implementação

- **[Scripts Completos](./06-scripts/)** - Índices, auditoria, funções

## 📊 Status Atual

- **Migrações aplicadas:** 10
- **Tabelas criadas:** 28
- **Usuários ativos:** 2
- **RLS habilitado:** ✅ 100%

---

**Gerado automaticamente** | [Ver histórico completo](./01-applied/README.md)
