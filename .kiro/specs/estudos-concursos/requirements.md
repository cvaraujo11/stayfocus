# Requirements Document - Módulo de Estudos e Concursos

## Introduction

O módulo de Estudos e Concursos do StayFocus é projetado para auxiliar usuários com TDAH na organização e acompanhamento de seus estudos para concursos públicos. O sistema oferece gestão de concursos, banco de questões, simulados e registro de sessões de estudo, com foco em facilitar a concentração e o acompanhamento do progresso através de interfaces claras e funcionalidades adaptadas às necessidades de pessoas com TDAH.

## Glossary

- **Sistema**: O módulo de Estudos e Concursos do aplicativo StayFocus
- **Usuário**: Pessoa com TDAH que utiliza o sistema para organizar seus estudos
- **Concurso**: Processo seletivo público que o usuário está estudando
- **Questão**: Item de prova cadastrado no banco de questões
- **Simulado**: Conjunto de questões organizadas para prática
- **Sessão de Estudo**: Período de tempo dedicado ao estudo de uma disciplina
- **Disciplina**: Matéria ou área de conhecimento do concurso
- **Banco de Questões**: Repositório de questões cadastradas pelo usuário
- **RLS**: Row Level Security - política de segurança em nível de linha do Supabase
- **Real-time Sync**: Sincronização em tempo real com o banco de dados

## Requirements

### Requirement 1: Gestão de Concursos

**User Story:** Como usuário, quero cadastrar e gerenciar os concursos que estou estudando, para que eu possa organizar meus objetivos e acompanhar prazos.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de estudos, THE Sistema SHALL exibir a lista de concursos cadastrados ordenados por data da prova
2. WHEN o usuário clica em "Adicionar Concurso", THE Sistema SHALL exibir um formulário com os campos: nome, instituição, cargo, data da prova, disciplinas e status
3. WHEN o usuário submete o formulário de concurso com dados válidos, THE Sistema SHALL salvar o concurso no banco de dados e atualizar a lista
4. WHEN o usuário edita um concurso existente, THE Sistema SHALL atualizar os dados no banco de dados e refletir as mudanças na interface
5. WHEN o usuário remove um concurso, THE Sistema SHALL solicitar confirmação e, após confirmação, remover o concurso e todas as questões e simulados vinculados
6. THE Sistema SHALL permitir filtrar concursos por status (em andamento, concluído, cancelado)
7. THE Sistema SHALL exibir um contador de dias até a prova para concursos com data definida

### Requirement 2: Banco de Questões

**User Story:** Como usuário, quero cadastrar questões de provas anteriores, para que eu possa praticar e revisar conteúdos de forma organizada.

#### Acceptance Criteria

1. WHEN o usuário acessa o banco de questões, THE Sistema SHALL exibir a lista de questões cadastradas com filtros por concurso, disciplina e tags
2. WHEN o usuário clica em "Adicionar Questão", THE Sistema SHALL exibir um formulário com os campos: enunciado, alternativas (A-E), resposta correta, explicação, disciplina, concurso vinculado e tags
3. WHEN o usuário submete uma questão com dados válidos, THE Sistema SHALL salvar a questão no formato JSON no banco de dados
4. THE Sistema SHALL validar que a resposta correta corresponde a uma das alternativas cadastradas
5. WHEN o usuário visualiza uma questão, THE Sistema SHALL exibir o enunciado, alternativas e, opcionalmente, a explicação da resposta
6. WHEN o usuário edita uma questão, THE Sistema SHALL atualizar os dados mantendo o histórico de criação
7. WHEN o usuário remove uma questão, THE Sistema SHALL verificar se ela está vinculada a algum simulado e alertar o usuário antes da remoção
8. THE Sistema SHALL permitir busca de questões por texto no enunciado ou tags
9. THE Sistema SHALL permitir marcar questões como favoritas para revisão

### Requirement 3: Sistema de Simulados

**User Story:** Como usuário, quero criar e realizar simulados personalizados, para que eu possa testar meus conhecimentos e identificar pontos fracos.

#### Acceptance Criteria

1. WHEN o usuário acessa a área de simulados, THE Sistema SHALL exibir a lista de simulados criados e realizados
2. WHEN o usuário cria um novo simulado, THE Sistema SHALL permitir selecionar questões do banco ou gerar aleatoriamente por disciplina
3. WHEN o usuário inicia um simulado, THE Sistema SHALL exibir as questões uma por vez com cronômetro opcional
4. WHEN o usuário responde uma questão no simulado, THE Sistema SHALL registrar a resposta sem exibir se está correta ou incorreta
5. WHEN o usuário finaliza um simulado, THE Sistema SHALL calcular e exibir o número de acertos, percentual de aproveitamento e tempo total
6. THE Sistema SHALL exibir a correção detalhada com explicações após a finalização do simulado
7. THE Sistema SHALL gerar estatísticas por disciplina mostrando percentual de acertos em cada área
8. WHEN o usuário configura tempo limite para o simulado, THE Sistema SHALL alertar quando faltarem 5 minutos e finalizar automaticamente ao término
9. THE Sistema SHALL permitir pausar e retomar simulados em andamento
10. THE Sistema SHALL salvar o histórico de simulados realizados com data, pontuação e tempo

### Requirement 4: Registro de Sessões de Estudo

**User Story:** Como usuário, quero registrar minhas sessões de estudo, para que eu possa acompanhar minha dedicação e identificar padrões de produtividade.

#### Acceptance Criteria

1. WHEN o usuário acessa o registro de estudos, THE Sistema SHALL exibir um calendário com as sessões registradas
2. WHEN o usuário registra uma nova sessão, THE Sistema SHALL solicitar: data, disciplina, duração em minutos, tópicos estudados e observações
3. WHEN o usuário submete um registro de estudo válido, THE Sistema SHALL salvar no banco de dados e atualizar o calendário
4. THE Sistema SHALL validar que a duração é maior que zero
5. THE Sistema SHALL permitir editar e remover registros de estudo
6. THE Sistema SHALL exibir estatísticas semanais e mensais de horas estudadas por disciplina
7. THE Sistema SHALL gerar gráficos de evolução mostrando tendências de estudo ao longo do tempo
8. WHEN o usuário visualiza estatísticas, THE Sistema SHALL destacar disciplinas com menos horas de estudo
9. THE Sistema SHALL permitir exportar relatórios de estudo em formato PDF ou CSV

### Requirement 5: Integração e Sincronização

**User Story:** Como usuário, quero que meus dados sejam sincronizados em tempo real e protegidos, para que eu possa acessar de qualquer dispositivo com segurança.

#### Acceptance Criteria

1. THE Sistema SHALL implementar RLS (Row Level Security) em todas as tabelas garantindo que cada usuário acesse apenas seus próprios dados
2. WHEN um dado é criado, atualizado ou removido, THE Sistema SHALL sincronizar automaticamente via Supabase Realtime
3. THE Sistema SHALL exibir indicador de carregamento durante operações assíncronas
4. WHEN ocorre um erro de conexão, THE Sistema SHALL exibir mensagem clara e permitir retry
5. THE Sistema SHALL validar autenticação do usuário antes de qualquer operação no banco de dados
6. THE Sistema SHALL implementar cache local para melhorar performance em listagens
7. WHEN múltiplos dispositivos estão conectados, THE Sistema SHALL sincronizar mudanças em tempo real entre eles

### Requirement 6: Interface e Acessibilidade

**User Story:** Como usuário com TDAH, quero uma interface clara e organizada, para que eu possa navegar facilmente sem distrações.

#### Acceptance Criteria

1. THE Sistema SHALL utilizar componentes UI consistentes com o restante do aplicativo StayFocus
2. THE Sistema SHALL exibir estados vazios informativos quando não houver dados cadastrados
3. THE Sistema SHALL implementar feedback visual para todas as ações do usuário (sucesso, erro, carregamento)
4. THE Sistema SHALL respeitar as preferências visuais do usuário (alto contraste, texto grande, redução de estímulos)
5. WHEN o usuário interage com formulários, THE Sistema SHALL validar campos em tempo real e exibir mensagens de erro claras
6. THE Sistema SHALL implementar navegação por teclado em todos os componentes interativos
7. THE Sistema SHALL utilizar cores e ícones para facilitar identificação visual de categorias e status
8. THE Sistema SHALL limitar a quantidade de informações exibidas simultaneamente para evitar sobrecarga cognitiva

### Requirement 7: Performance e Otimização

**User Story:** Como usuário, quero que o sistema seja rápido e responsivo, para que eu não perca o foco durante o uso.

#### Acceptance Criteria

1. WHEN o usuário carrega uma lista de dados, THE Sistema SHALL exibir os primeiros resultados em menos de 2 segundos
2. THE Sistema SHALL implementar paginação ou scroll infinito para listas com mais de 50 itens
3. THE Sistema SHALL utilizar lazy loading para componentes pesados
4. THE Sistema SHALL implementar debounce em campos de busca para reduzir requisições ao banco
5. WHEN o usuário realiza um simulado, THE Sistema SHALL carregar todas as questões antecipadamente para evitar delays
6. THE Sistema SHALL comprimir e otimizar imagens antes do upload
7. THE Sistema SHALL implementar índices no banco de dados para queries frequentes

### Requirement 8: Validações e Regras de Negócio

**User Story:** Como usuário, quero que o sistema valide meus dados, para que eu não cometa erros ao cadastrar informações.

#### Acceptance Criteria

1. WHEN o usuário cadastra um concurso, THE Sistema SHALL validar que o nome não está vazio e tem no máximo 200 caracteres
2. WHEN o usuário cadastra uma questão, THE Sistema SHALL validar que há pelo menos 2 alternativas e no máximo 5
3. WHEN o usuário cria um simulado, THE Sistema SHALL validar que há pelo menos 1 questão selecionada
4. WHEN o usuário registra uma sessão de estudo, THE Sistema SHALL validar que a duração está entre 1 e 1440 minutos (24 horas)
5. THE Sistema SHALL validar que datas de prova não estão no passado ao criar novos concursos
6. THE Sistema SHALL validar que a resposta correta de uma questão corresponde a uma alternativa existente
7. WHEN o usuário tenta remover um concurso com questões vinculadas, THE Sistema SHALL exibir alerta informando quantas questões serão afetadas
8. THE Sistema SHALL prevenir duplicação de registros de estudo para a mesma data, hora e disciplina

---

**Última atualização:** 20 de Outubro de 2025
