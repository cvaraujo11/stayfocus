# Implementation Plan - Modo Demo

- [ ] 1. Criar infraestrutura base do Local Storage
  - Implementar LocalStorageProvider com operações CRUD genéricas
  - Criar funções para gerenciar coleções (similar a tabelas Supabase)
  - Implementar validação e tratamento de erros (quota exceeded, data corruption)
  - _Requirements: 1.5, 4.3, 4.4_

- [ ] 2. Implementar gerador de dados demo
  - Criar DemoDataGenerator com métodos para cada categoria
  - Gerar dados realistas para 7 dias de histórico
  - Garantir coerência entre dados de diferentes categorias
  - Incluir variação natural nos dados (humor oscilante, prioridades mistas)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Criar DemoContext e provider
  - Implementar DemoContext com estado isDemoMode
  - Criar funções activateDemoMode e deactivateDemoMode
  - Gerenciar flag demo_mode_config no Local Storage
  - Integrar DemoProvider na árvore de componentes (providers.tsx)
  - _Requirements: 1.2, 4.1, 4.2, 4.5_

- [ ] 4. Adicionar banner demo na página de login
  - Criar componente DemoBanner com design especificado
  - Implementar lógica de exibição/ocultação baseada em Local Storage
  - Adicionar botão "Experimentar Demo" que ativa modo demo
  - Implementar botão fechar (X) que persiste preferência
  - Integrar banner na página /login acima do formulário
  - _Requirements: 1.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5. Criar adaptador de dados para Zustand stores
  - Implementar função utilitária isDemoMode()
  - Criar data provider adapter que escolhe entre Supabase e LocalStorage
  - Definir interface comum para operações de dados
  - _Requirements: 4.3, 4.4_

- [ ] 6. Modificar stores existentes para suportar modo demo
- [ ] 6.1 Atualizar saudeStore
  - Integrar data provider adapter
  - Modificar operações CRUD para usar provider abstrato
  - Manter interface pública inalterada
  - _Requirements: 1.4, 2.5, 4.3, 4.4_

- [ ] 6.2 Atualizar alimentacaoStore
  - Integrar data provider adapter
  - Modificar operações CRUD para usar provider abstrato
  - _Requirements: 1.4, 2.5, 4.3, 4.4_

- [ ] 6.3 Atualizar prioridadesStore
  - Integrar data provider adapter
  - Modificar operações CRUD para usar provider abstrato
  - _Requirements: 1.4, 2.5, 4.3, 4.4_

- [ ] 6.4 Atualizar demais stores (sono, estudos, financas, hiperfocos, lazer, autoconhecimento)
  - Integrar data provider adapter em cada store
  - Modificar operações CRUD para usar provider abstrato
  - _Requirements: 1.4, 2.5, 4.3, 4.4_

- [ ] 7. Atualizar AuthContext para modo demo
  - Adicionar estado isDemoMode
  - Implementar método activateDemoMode que redireciona para home
  - Modificar lógica de autenticação para reconhecer modo demo
  - Desabilitar chamadas Supabase quando em modo demo
  - _Requirements: 1.2, 1.3, 4.3_

- [ ] 8. Atualizar middleware para permitir acesso em modo demo
  - Detectar flag demo_mode no Local Storage ou cookie
  - Permitir acesso a rotas protegidas quando em modo demo
  - Manter proteção para usuários não autenticados e não-demo
  - _Requirements: 1.3, 1.4_

- [ ] 9. Criar indicador visual de modo demo
  - Implementar componente DemoIndicator
  - Exibir badge fixo no topo quando em modo demo
  - Adicionar texto informativo e link para criar conta
  - Integrar no layout principal da aplicação
  - _Requirements: 3.1_

- [ ] 10. Implementar funcionalidade de migração de dados
- [ ] 10.1 Criar DemoMigrationDialog component
  - Implementar dialog com opções de manter ou descartar dados
  - Adicionar botões de ação claros
  - Implementar acessibilidade (keyboard navigation, ARIA)
  - _Requirements: 3.2_

- [ ] 10.2 Implementar lógica de migração
  - Criar função migrateDemoData no DemoContext
  - Implementar transferência de dados do LocalStorage para Supabase
  - Usar batch inserts para performance
  - Implementar transação atômica (tudo ou nada)
  - Adicionar tratamento de erros e rollback
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 10.3 Integrar migração no fluxo de registro
  - Modificar página de registro para detectar modo demo
  - Exibir DemoMigrationDialog antes de criar conta
  - Executar migração após criação de conta se usuário aceitar
  - Limpar dados demo após migração bem-sucedida
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 11. Implementar inicialização de dados demo
  - Criar função seedDemoData que popula LocalStorage
  - Chamar seedDemoData ao ativar modo demo pela primeira vez
  - Verificar se dados já existem antes de gerar novos
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4_

- [ ] 12. Adicionar limpeza de dados demo
  - Implementar função clearDemoData
  - Chamar ao sair do modo demo (login ou registro)
  - Chamar após migração bem-sucedida
  - Remover flag demo_mode_config
  - _Requirements: 3.4, 4.5_

- [ ] 13. Implementar persistência de dados demo
  - Garantir que modificações do usuário sejam salvas no LocalStorage
  - Implementar debounce para operações de escrita
  - Validar dados antes de salvar
  - _Requirements: 1.5, 2.5_

- [ ]* 14. Adicionar tratamento de erros e feedback ao usuário
  - Implementar mensagens de erro amigáveis
  - Adicionar toast notifications para operações importantes
  - Tratar erro de quota exceeded com mensagem específica
  - Adicionar loading states durante migração
  - _Requirements: 3.2, 3.3_

- [ ]* 15. Melhorar acessibilidade dos componentes demo
  - Adicionar ARIA labels apropriados
  - Garantir navegação por teclado
  - Testar com screen readers
  - Implementar focus management no dialog
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
