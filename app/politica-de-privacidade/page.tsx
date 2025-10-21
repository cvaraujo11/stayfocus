import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade - StayFocus',
  description: 'Política de Privacidade da plataforma StayFocus - Como protegemos e tratamos seus dados pessoais',
}

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/login" 
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-4 inline-block"
          >
            ← Voltar para Login
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Política de Privacidade
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Última atualização: 20 de Outubro de 2025
          </p>
        </div>

        <div className="prose prose-blue dark:prose-invert max-w-none space-y-6">
          {/* Introdução */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Compromisso com sua Privacidade
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              No <strong>StayFocus</strong>, levamos sua privacidade muito a sério. Esta Política de Privacidade 
              explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você 
              utiliza nossa plataforma de gerenciamento de vida para pessoas com TDAH.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Esta política está em conformidade com:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>LGPD</strong> (Lei Geral de Proteção de Dados - Lei nº 13.709/2018) - Brasil</li>
              <li><strong>Marco Civil da Internet</strong> (Lei nº 12.965/2014)</li>
              <li><strong>GDPR</strong> (General Data Protection Regulation) - Para usuários da União Europeia</li>
            </ul>
          </section>

          {/* 1. Dados Coletados */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Quais Dados Coletamos
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">1.1 Dados de Cadastro e Autenticação</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Quando você cria uma conta, coletamos:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Email:</strong> Para identificação, login e comunicações importantes</li>
              <li><strong>Senha criptografada:</strong> Armazenada com hash seguro (nunca em texto puro)</li>
              <li><strong>Nome (opcional):</strong> Para personalização da experiência</li>
              <li><strong>Foto de perfil (Google OAuth):</strong> Se você fizer login via Google</li>
              <li><strong>Data de criação da conta:</strong> Para gerenciamento interno</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">1.2 Dados de Preferências e Configurações</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Preferências visuais:</strong> Alto contraste, redução de estímulos, texto grande</li>
              <li><strong>Configurações de notificações:</strong> Status ativado/desativado</li>
              <li><strong>Metas diárias personalizadas:</strong> Horas de sono, copos de água, tarefas prioritárias, pausas</li>
              <li><strong>Tema preferido:</strong> Claro ou escuro</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">1.3 Dados de Gestão Financeira</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Transações financeiras:</strong> Valor, data, descrição, tipo (receita/despesa)</li>
              <li><strong>Categorias personalizadas:</strong> Nome, cor, ícone</li>
              <li><strong>Envelopes (budgeting):</strong> Nome, valor alocado, valor utilizado</li>
              <li><strong>Pagamentos recorrentes:</strong> Descrição, valor, data de vencimento, categoria</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              ⚠️ <strong>Importante:</strong> NÃO coletamos informações bancárias reais, números de cartão ou dados de pagamento. 
              Você apenas registra transações manualmente para fins de organização pessoal.
            </p>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">1.4 Dados de Alimentação e Hidratação</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Registros de refeições:</strong> Data, hora, descrição do que comeu</li>
              <li><strong>Planejamento semanal:</strong> Refeições programadas por dia da semana</li>
              <li><strong>Controle de hidratação:</strong> Número de copos bebidos, horários, meta diária</li>
              <li><strong>Receitas:</strong> Título, ingredientes, modo de preparo, tempo, porções</li>
              <li><strong>Lista de compras:</strong> Itens, quantidades, categorias, status de compra</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">1.5 Dados de Saúde (Sensíveis conforme LGPD)</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-3">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                ⚠️ DADOS SENSÍVEIS - Tratamento Especial
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Medicamentos:</strong> Nome, dosagem, frequência, horários, intervalo de segurança, observações</li>
              <li><strong>Histórico de tomadas:</strong> Horário programado, horário real, status, observações</li>
              <li><strong>Monitoramento de humor:</strong> Escala 1-5, fatores influenciadores (sono, alimentação, medicação, exercício, estresse, social, trabalho), notas</li>
              <li><strong>Registros de sono:</strong> Hora de dormir, hora de acordar, duração, qualidade (1-5), observações</li>
              <li><strong>Registros de energia:</strong> Nível de disposição física (1-5), contexto</li>
              <li><strong>Registros de ansiedade:</strong> Nível (1-5), gatilhos identificados, notas</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              📋 <strong>Base Legal LGPD:</strong> Consentimento explícito (Art. 11, II, §1º) - você fornece essas informações 
              voluntariamente para fins de organização pessoal.
            </p>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">1.6 Dados de Estudos</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Concursos:</strong> Nome, instituição, cargo, data da prova, disciplinas, status</li>
              <li><strong>Questões:</strong> Enunciado, alternativas, resposta correta, explicação, disciplina, tags</li>
              <li><strong>Simulados:</strong> Nome, questões selecionadas, tempo limite, resultados, estatísticas</li>
              <li><strong>Registros de estudo:</strong> Data, duração, disciplina, tópicos, observações</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">1.7 Dados de Produtividade</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Hiperfocos:</strong> Título, descrição, data início/fim, intensidade (1-5), status</li>
              <li><strong>Tarefas e subtarefas:</strong> Nome, cor, ordenação, hierarquia, status de conclusão</li>
              <li><strong>Sessões Pomodoro:</strong> Duração, pausas, tarefa associada, data/hora</li>
              <li><strong>Tarefas prioritárias:</strong> Título, prioridade, categoria, data, status</li>
              <li><strong>Blocos de tempo:</strong> Hora, categoria (início do dia, alimentação, estudos, saúde, lazer), descrição</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">1.8 Dados de Atividades</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Atividades de lazer, saúde e sociais:</strong> Nome, categoria, data, duração, observações</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">1.9 Dados Técnicos e de Uso</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Endereço IP:</strong> Para segurança e prevenção de fraudes</li>
              <li><strong>Tipo de navegador e dispositivo:</strong> Para otimização da experiência</li>
              <li><strong>Logs de acesso:</strong> Data/hora de login, páginas visitadas</li>
              <li><strong>Cookies essenciais:</strong> Para manter sua sessão ativa</li>
            </ul>
          </section>

          {/* 2. Como Usamos seus Dados */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Como Usamos seus Dados
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Utilizamos suas informações exclusivamente para:
            </p>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">2.1 Fornecimento do Serviço</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Permitir acesso e uso de todas as funcionalidades da plataforma</li>
              <li>Processar e armazenar seus registros (refeições, medicamentos, estudos, etc.)</li>
              <li>Calcular estatísticas e gerar relatórios personalizados</li>
              <li>Sincronizar dados em tempo real entre suas sessões</li>
              <li>Gerar lembretes e notificações configurados por você</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">2.2 Personalização</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Adaptar a interface conforme suas preferências visuais</li>
              <li>Exibir metas personalizadas no painel</li>
              <li>Ordenar e priorizar conteúdo conforme seu uso</li>
              <li>Aplicar tema preferido (claro/escuro)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">2.3 Segurança e Integridade</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Prevenir acessos não autorizados</li>
              <li>Detectar e prevenir fraudes ou uso abusivo</li>
              <li>Manter logs de segurança por tempo limitado</li>
              <li>Cumprir obrigações legais quando necessário</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">2.4 Comunicação</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Enviar emails transacionais (confirmação de cadastro, redefinição de senha)</li>
              <li>Notificar sobre atualizações importantes nos Termos ou Política</li>
              <li>Responder a solicitações de suporte</li>
            </ul>

            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 mt-4">
              <p className="text-green-800 dark:text-green-200">
                ✅ <strong>Nós NÃO usamos seus dados para:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1 text-green-700 dark:text-green-300 mt-2">
                <li>Vender ou compartilhar com terceiros para fins comerciais</li>
                <li>Exibir publicidade direcionada</li>
                <li>Criar perfis para marketing</li>
                <li>Treinar modelos de IA ou machine learning</li>
                <li>Compartilhar com seguradoras, empregadores ou instituições financeiras</li>
              </ul>
            </div>
          </section>

          {/* 3. Compartilhamento de Dados */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Com Quem Compartilhamos seus Dados
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">3.1 Provedores de Infraestrutura</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Para fornecer o serviço, compartilhamos dados técnicos com:
            </p>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
              <p className="font-semibold text-gray-900 dark:text-white">🔹 Supabase (Infraestrutura Backend)</p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300 mt-2">
                <li><strong>O que é:</strong> Plataforma de banco de dados e autenticação</li>
                <li><strong>Dados compartilhados:</strong> Todos os dados armazenados (isolados por RLS)</li>
                <li><strong>Localização:</strong> Servidores nos EUA (certificados SOC 2)</li>
                <li><strong>Finalidade:</strong> Armazenamento, autenticação e sincronização em tempo real</li>
                <li><strong>Política:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com/privacy</a></li>
              </ul>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
              <p className="font-semibold text-gray-900 dark:text-white">🔹 Vercel (Hospedagem Frontend)</p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300 mt-2">
                <li><strong>O que é:</strong> Plataforma de hospedagem web</li>
                <li><strong>Dados compartilhados:</strong> Logs de acesso (IP, navegador, páginas visitadas)</li>
                <li><strong>Localização:</strong> Edge Network global</li>
                <li><strong>Finalidade:</strong> Entregar a aplicação web de forma rápida e segura</li>
                <li><strong>Política:</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vercel.com/legal/privacy-policy</a></li>
              </ul>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="font-semibold text-gray-900 dark:text-white">🔹 Google (Autenticação OAuth)</p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300 mt-2">
                <li><strong>O que é:</strong> Serviço de login via conta Google</li>
                <li><strong>Dados compartilhados:</strong> Email, nome e foto de perfil (apenas se você usar login Google)</li>
                <li><strong>Finalidade:</strong> Autenticação simplificada</li>
                <li><strong>Política:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">policies.google.com/privacy</a></li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">3.2 Requisições Legais</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Podemos divulgar dados se:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Exigido por lei (ordem judicial, intimação)</li>
              <li>Necessário para proteção de direitos legais</li>
              <li>Para prevenir atividade ilegal ou prejudicial</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Sempre que possível e legalmente permitido, notificaremos você sobre tais solicitações.
            </p>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">3.3 Nunca Compartilhamos</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>❌ Dados de saúde com seguradoras</li>
              <li>❌ Dados financeiros com bancos ou instituições</li>
              <li>❌ Informações pessoais para marketing</li>
              <li>❌ Registros de humor ou medicação com terceiros</li>
            </ul>
          </section>

          {/* 4. Armazenamento */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Por Quanto Tempo Armazenamos seus Dados
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">4.1 Durante o Uso Ativo</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Mantemos todos os seus dados enquanto sua conta estiver ativa para que você possa acessar 
              históricos completos e análises de longo prazo.
            </p>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">4.2 Após Exclusão da Conta</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>30 dias:</strong> Período de retenção para possível recuperação (se você mudar de ideia)</li>
              <li><strong>Após 30 dias:</strong> Exclusão permanente e irreversível de todos os dados pessoais</li>
              <li><strong>Logs de segurança:</strong> Mantidos por até 90 dias para auditoria</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">4.3 Inatividade</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Se sua conta ficar inativa por <strong>mais de 2 anos</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Enviaremos avisos por email (90, 60 e 30 dias antes)</li>
              <li>Você terá oportunidade de reativar a conta</li>
              <li>Caso não haja resposta, a conta será arquivada e posteriormente excluída</li>
            </ul>
          </section>

          {/* 5. Segurança */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Como Protegemos seus Dados
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">5.1 Medidas Técnicas</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Criptografia em trânsito:</strong> HTTPS/TLS 1.3 para todas as comunicações</li>
              <li><strong>Criptografia em repouso:</strong> Dados armazenados com criptografia AES-256</li>
              <li><strong>Senhas:</strong> Hash com bcrypt (nunca armazenamos senhas em texto puro)</li>
              <li><strong>Row Level Security (RLS):</strong> Isolamento absoluto entre contas de usuários</li>
              <li><strong>Tokens de sessão:</strong> JWT com expiração automática</li>
              <li><strong>Autenticação de dois fatores (2FA):</strong> Em desenvolvimento</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">5.2 Medidas Organizacionais</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Acesso restrito aos dados apenas para manutenção essencial</li>
              <li>Logs de acesso auditáveis</li>
              <li>Backups automáticos criptografados</li>
              <li>Políticas de resposta a incidentes</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">5.3 Suas Responsabilidades</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Manter sua senha segura e confidencial</li>
              <li>Não compartilhar credenciais de acesso</li>
              <li>Fazer logout em dispositivos compartilhados</li>
              <li>Reportar atividades suspeitas imediatamente</li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mt-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Importante:</strong> Nenhum sistema é 100% seguro. Embora implementemos as melhores 
                práticas de segurança, você deve tomar precauções adicionais com dados sensíveis.
              </p>
            </div>
          </section>

          {/* 6. Seus Direitos (LGPD) */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Seus Direitos sobre seus Dados (LGPD)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              De acordo com a LGPD (Lei nº 13.709/2018), você tem os seguintes direitos:
            </p>

            <div className="space-y-3">
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">📋 Acesso (Art. 18, II)</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Confirmar se processamos seus dados e solicitar acesso completo
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">✏️ Correção (Art. 18, III)</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Corrigir dados incompletos, inexatos ou desatualizados
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">🗑️ Exclusão (Art. 18, VI)</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Solicitar exclusão de dados tratados com seu consentimento
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">📤 Portabilidade (Art. 18, V)</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Exportar seus dados em formato JSON estruturado
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">🚫 Revogação de Consentimento (Art. 18, IX)</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Retirar consentimento a qualquer momento (pode limitar funcionalidades)
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">ℹ️ Informação (Art. 18, I e VIII)</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Obter informações sobre entidades com as quais compartilhamos dados
                </p>
              </div>
            </div>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">Como Exercer seus Direitos</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Você pode exercer seus direitos:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Pelo painel de configurações:</strong> Acesse <Link href="/perfil" className="text-blue-600 hover:underline">/perfil</Link> para editar dados e excluir conta</li>
              <li><strong>Por email:</strong> Envie solicitação para <strong>privacidade@stayfocus.app</strong></li>
              <li><strong>Prazo de resposta:</strong> Até 15 dias úteis</li>
            </ul>
          </section>

          {/* 7. Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Cookies e Tecnologias Similares
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">7.1 Cookies Essenciais (Necessários)</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Usamos cookies estritamente necessários para o funcionamento da plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Token de sessão:</strong> Mantém você logado entre páginas</li>
              <li><strong>Preferências de tema:</strong> Lembra se você usa tema claro ou escuro</li>
              <li><strong>CSRF token:</strong> Proteção contra ataques de falsificação</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Esses cookies não podem ser desativados pois são essenciais para o serviço funcionar.
            </p>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">7.2 Cookies Opcionais</h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Atualmente não usamos:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>❌ Cookies de analytics (Google Analytics, etc.)</li>
              <li>❌ Cookies de publicidade</li>
              <li>❌ Cookies de rastreamento de terceiros</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Se implementarmos analytics no futuro, pediremos seu consentimento explícito.
            </p>
          </section>

          {/* 8. Menores de Idade */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Privacidade de Menores de Idade
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              O StayFocus é destinado a pessoas com <strong>18 anos ou mais</strong>.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Para usuários entre <strong>13 e 17 anos</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Requer consentimento e supervisão de um responsável legal</li>
              <li>O responsável deve estar ciente dos dados coletados</li>
              <li>O responsável pode solicitar exclusão da conta a qualquer momento</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Não coletamos intencionalmente dados de menores de 13 anos. Se descobrirmos que coletamos 
              dados de uma criança menor de 13 anos, excluiremos imediatamente.
            </p>
          </section>

          {/* 9. Transferência Internacional */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Transferência Internacional de Dados
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Seus dados podem ser armazenados e processados em servidores localizados fora do Brasil, 
              especificamente nos <strong>Estados Unidos</strong> (Supabase).
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Garantias de proteção:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Supabase é certificado SOC 2 Type II</li>
              <li>Cumpre práticas equivalentes ao GDPR</li>
              <li>Cláusulas contratuais padrão para proteção de dados</li>
              <li>Mesmos padrões de segurança e privacidade</li>
            </ul>
          </section>

          {/* 10. Alterações */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Alterações nesta Política
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Podemos atualizar esta Política de Privacidade ocasionalmente para refletir:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Mudanças em nossas práticas de dados</li>
              <li>Novas funcionalidades da plataforma</li>
              <li>Requisitos legais</li>
              <li>Feedback de usuários</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              <strong>Como notificamos:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Alterações menores: Aviso na plataforma</li>
              <li>Alterações significativas: Email + notificação in-app com 30 dias de antecedência</li>
              <li>Sempre atualizaremos a "Data da última atualização" no topo</li>
            </ul>
          </section>

          {/* 11. Contato */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Contato e Encarregado de Dados (DPO)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Para questões sobre privacidade, exercício de direitos ou reclamações:
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                📧 Encarregado de Proteção de Dados (DPO)
              </p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>Email:</strong> privacidade@stayfocus.app</li>
                <li><strong>Email alternativo:</strong> dpo@stayfocus.app</li>
                <li><strong>Suporte geral:</strong> suporte@stayfocus.app</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Responderemos em até <strong>15 dias úteis</strong> conforme LGPD (Art. 18, §3º)
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">Autoridade Nacional de Proteção de Dados (ANPD)</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Se não estiver satisfeito com nossa resposta, você pode contatar a ANPD:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Site: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.gov.br/anpd</a></li>
              <li>Email: atendimento@anpd.gov.br</li>
            </ul>
          </section>

          {/* Aceitação */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ao usar o StayFocus, você reconhece que leu, compreendeu e concorda com esta Política de Privacidade 
              e nossos <Link href="/termos-de-uso" className="text-blue-600 hover:underline">Termos de Uso</Link>.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              <strong>Data de vigência:</strong> 20 de Outubro de 2025<br />
              <strong>Versão:</strong> 1.0
            </p>
          </section>
        </div>

        {/* Footer com botões */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Voltar para Login
          </Link>
          <Link
            href="/termos-de-uso"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Termos de Uso
          </Link>
        </div>
      </div>
    </div>
  )
}
