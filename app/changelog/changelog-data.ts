export interface ChangelogEntry {
    version: string
    date: string
    changes: {
        type: 'feature' | 'improvement' | 'fix' | 'info'
        description: string
    }[]
    modules?: {
        name: string
        icon: string
        features: string[]
    }[]
}

/**
 * Dados do Changelog do StayFocus
 * 
 * Como adicionar uma nova versão:
 * 1. Adicione um novo objeto no início do array (versões mais recentes primeiro)
 * 2. Use o formato de data: 'YYYY-MM-DD'
 * 3. Tipos disponíveis:
 *    - 'feature': Novas funcionalidades
 *    - 'improvement': Melhorias em funcionalidades existentes
 *    - 'fix': Correções de bugs
 *    - 'info': Informações gerais ou anúncios
 */
export const changelogData: ChangelogEntry[] = [
    {
        version: '0.1.0',
        date: '2025-10-20',
        changes: [
            {
                type: 'info',
                description: 'Lançamento do StayFocus! 🎉 Plataforma completa de gerenciamento de vida para pessoas com TDAH'
            }
        ],
        modules: [
            {
                name: 'Perfil e Personalização',
                icon: '👤',
                features: [
                    'Sistema de autenticação seguro com Google OAuth e Email/Senha',
                    'Perfil personalizável com nome e controle de notificações',
                    'Preferências de acessibilidade: Alto Contraste, Redução de Estímulos e Texto Grande',
                    'Metas diárias personalizadas: Horas de Sono, Tarefas Prioritárias, Copos de Água e Pausas'
                ]
            },
            {
                name: 'Gestão Financeira',
                icon: '💰',
                features: [
                    'Categorias financeiras personalizadas com cores e ícones',
                    'Controle completo de receitas e despesas com histórico',
                    'Sistema de Envelopes (Budgeting) para controle financeiro inteligente',
                    'Gestão de pagamentos recorrentes com alertas de vencimento'
                ]
            },
            {
                name: 'Alimentação e Hidratação',
                icon: '🍽️',
                features: [
                    'Registro de refeições com diário alimentar completo',
                    'Planejamento semanal de refeições com horários definidos',
                    'Controle de hidratação com contador de copos e lembretes inteligentes'
                ]
            },
            {
                name: 'Saúde e Bem-estar',
                icon: '🏥',
                features: [
                    'Gerenciamento de medicamentos com múltiplos horários e intervalo de segurança',
                    'Histórico de tomadas de medicamentos com registro de adesão',
                    'Monitoramento de humor com escala de 1 a 5 e fatores influenciadores'
                ]
            },
            {
                name: 'Qualidade do Sono',
                icon: '😴',
                features: [
                    'Registro de sono com cálculo automático de duração e qualidade',
                    'Análises e insights sobre padrões de sono'
                ]
            },
            {
                name: 'Estudos e Concursos',
                icon: '📚',
                features: [
                    'Gestão de múltiplos concursos com disciplinas organizadas',
                    'Banco de questões com sistema de tags e revisão espaçada',
                    'Criação de simulados personalizados com correção automática',
                    'Registro de sessões de estudo com estatísticas por disciplina'
                ]
            },
            {
                name: 'Gerenciamento de Hiperfocos',
                icon: '🎯',
                features: [
                    'Períodos de hiperfoco com controle de intensidade e status',
                    'Sistema de tarefas e subtarefas ilimitadas com hierarquia visual',
                    'Cores personalizadas e ordenação para organização de projetos'
                ]
            },
            {
                name: 'Produtividade',
                icon: '⏱️',
                features: [
                    'Técnica Pomodoro integrada com vinculação a tarefas',
                    'Sistema de tarefas prioritárias com limite de 3 por dia',
                    'Blocos de Tempo (Time Blocking) para estruturar seu dia hora a hora'
                ]
            },
            {
                name: 'Lazer e Autoconhecimento',
                icon: '🎮',
                features: [
                    'Registro de atividades de lazer, saúde e sociais',
                    'Sistema de autoconhecimento com registro de humor, energia e ansiedade',
                    'Identificação de gatilhos e padrões emocionais'
                ]
            },
            {
                name: 'Receitas e Compras',
                icon: '🍳',
                features: [
                    'Banco de receitas com ingredientes, modo de preparo e favoritos',
                    'Lista de compras inteligente com importação automática de ingredientes'
                ]
            },
            {
                name: 'Sistema Geral',
                icon: '📊',
                features: [
                    'Dashboard personalizado com visão geral de todas as áreas da vida',
                    'Relatórios e gráficos de evolução em todas as funcionalidades',
                    'Sistema de notificações inteligentes para lembretes',
                    'Modo escuro e claro com alternância automática',
                    'Segurança com RLS (Row Level Security) e criptografia de dados',
                    'Interface responsiva otimizada para mobile e desktop'
                ]
            }
        ]
    }
]
