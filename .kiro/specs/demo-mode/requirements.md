# Requirements Document

## Introduction

Este documento define os requisitos para implementar um Modo Demo na aplicação StayFocus. O Modo Demo permite que visitantes explorem a aplicação com dados simulados armazenados no Local Storage do navegador, sem necessidade de cadastro ou autenticação. O objetivo é reduzir a fricção inicial e permitir que usuários experimentem as funcionalidades antes de se comprometerem com o cadastro.

## Glossary

- **Sistema**: A aplicação web StayFocus
- **Modo Demo**: Estado da aplicação onde o usuário navega com dados simulados armazenados localmente
- **Local Storage**: Armazenamento persistente no navegador do usuário
- **Usuário Demo**: Visitante que acessa a aplicação através do Modo Demo
- **Dados Simulados**: Conjunto de dados pré-definidos que representam uso típico da aplicação
- **Página de Login**: Rota /login da aplicação
- **Anúncio Demo**: Banner informativo na página de login sobre o Modo Demo
- **Botão Demo**: Elemento clicável que ativa o Modo Demo
- **Sessão Demo**: Período durante o qual o usuário está utilizando o Modo Demo
- **Migração de Dados**: Processo de transferir dados do Local Storage para conta autenticada

## Requirements

### Requirement 1

**User Story:** Como visitante da aplicação, quero acessar um modo demo sem precisar me cadastrar, para que eu possa explorar as funcionalidades antes de criar uma conta.

#### Acceptance Criteria

1. WHEN o Usuário Demo acessa a Página de Login, THE Sistema SHALL exibir um Anúncio Demo visível destacando a opção de experimentar sem cadastro
2. WHEN o Usuário Demo clica no Botão Demo, THE Sistema SHALL inicializar o Modo Demo com Dados Simulados no Local Storage
3. WHEN o Modo Demo é inicializado, THE Sistema SHALL redirecionar o Usuário Demo para a página principal da aplicação
4. WHILE o Usuário Demo está no Modo Demo, THE Sistema SHALL permitir navegação completa em todas as funcionalidades da aplicação
5. WHEN o Usuário Demo fecha o navegador e retorna posteriormente, THE Sistema SHALL manter os Dados Simulados e modificações no Local Storage

### Requirement 2

**User Story:** Como visitante, quero ver dados realistas no modo demo, para que eu possa entender como a aplicação funciona no dia a dia.

#### Acceptance Criteria

1. WHEN o Modo Demo é inicializado, THE Sistema SHALL popular o Local Storage com Dados Simulados representando pelo menos 7 dias de uso
2. THE Sistema SHALL incluir Dados Simulados para todas as categorias principais (alimentação, sono, saúde, estudos, finanças, lazer, hiperfocos, autoconhecimento)
3. WHEN o Usuário Demo visualiza gráficos e estatísticas, THE Sistema SHALL exibir dados baseados nos Dados Simulados do Local Storage
4. THE Sistema SHALL garantir que os Dados Simulados sejam coerentes e representem padrões realistas de uso
5. WHEN o Usuário Demo adiciona novos registros no Modo Demo, THE Sistema SHALL armazenar essas modificações no Local Storage

### Requirement 3

**User Story:** Como usuário no modo demo, quero poder criar uma conta e manter meus dados, para que eu não perca as informações que adicionei durante a exploração.

#### Acceptance Criteria

1. WHILE o Usuário Demo está no Modo Demo, THE Sistema SHALL exibir um indicador visual informando que está em Modo Demo
2. WHEN o Usuário Demo decide criar uma conta, THE Sistema SHALL oferecer opção de Migração de Dados do Local Storage para a conta
3. IF o Usuário Demo aceita a Migração de Dados, THEN THE Sistema SHALL transferir todos os dados do Local Storage para o banco de dados associado à nova conta
4. WHEN a Migração de Dados é concluída, THE Sistema SHALL limpar os dados demo do Local Storage
5. IF o Usuário Demo recusa a Migração de Dados, THEN THE Sistema SHALL criar a conta sem transferir dados e limpar o Local Storage

### Requirement 4

**User Story:** Como desenvolvedor, quero que o modo demo seja claramente identificável, para que eu possa implementar lógica específica quando necessário.

#### Acceptance Criteria

1. WHEN o Modo Demo é ativado, THE Sistema SHALL armazenar um flag identificador no Local Storage indicando estado demo
2. THE Sistema SHALL fornecer uma função utilitária que retorna verdadeiro quando o usuário está no Modo Demo
3. WHEN o Sistema detecta Modo Demo ativo, THE Sistema SHALL desabilitar chamadas para APIs de autenticação do Supabase
4. WHILE no Modo Demo, THE Sistema SHALL utilizar operações de leitura e escrita exclusivamente no Local Storage
5. WHEN o usuário sai do Modo Demo através de autenticação, THE Sistema SHALL remover o flag identificador do Local Storage

### Requirement 5

**User Story:** Como visitante na página de login, quero entender claramente o que é o modo demo, para que eu possa tomar uma decisão informada sobre experimentá-lo.

#### Acceptance Criteria

1. THE Sistema SHALL exibir o Anúncio Demo na Página de Login acima do formulário de login
2. THE Anúncio Demo SHALL conter texto explicativo sobre o Modo Demo em português
3. THE Anúncio Demo SHALL incluir o Botão Demo com texto claro como "Experimentar Demo"
4. THE Sistema SHALL permitir que o Anúncio Demo seja fechado pelo usuário através de um botão de fechar
5. WHEN o usuário fecha o Anúncio Demo, THE Sistema SHALL armazenar preferência no Local Storage para não exibir novamente na mesma sessão de navegador
