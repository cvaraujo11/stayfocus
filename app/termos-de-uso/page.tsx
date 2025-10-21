import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso - StayFocus',
  description: 'Termos de Uso da plataforma StayFocus - Gerenciamento de vida para pessoas com TDAH',
}

export default function TermosDeUsoPage() {
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
            Termos de Uso
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Última atualização: 20 de Outubro de 2025
          </p>
        </div>

        <div className="prose prose-blue dark:prose-invert max-w-none space-y-6">
          {/* 1. Introdução */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introdução e Aceitação dos Termos
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Bem-vindo ao <strong>StayFocus</strong>, uma plataforma completa de gerenciamento de vida desenvolvida 
              especificamente para pessoas com TDAH (Transtorno do Déficit de Atenção com Hiperatividade).
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Ao criar uma conta, acessar ou utilizar nossos serviços, você concorda em estar vinculado a estes 
              Termos de Uso. Se você não concorda com qualquer parte destes termos, não utilize nossa plataforma.
            </p>
          </section>

          {/* 2. Descrição do Serviço */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Descrição do Serviço
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              O StayFocus oferece uma plataforma integrada que inclui, mas não se limita a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Gestão Financeira:</strong> Controle de transações, sistema de envelopes (budgeting), categorias personalizadas e pagamentos recorrentes</li>
              <li><strong>Alimentação:</strong> Registro de refeições, planejamento semanal e controle de hidratação com meta diária personalizável</li>
              <li><strong>Saúde:</strong> Gerenciamento de medicamentos com múltiplos horários, histórico de tomadas e monitoramento de humor com escala de 1 a 5</li>
              <li><strong>Sono:</strong> Registro de qualidade do sono, cálculo automático de duração e análises de padrões</li>
              <li><strong>Estudos:</strong> Gestão de concursos, banco de questões com revisão espaçada, criação de simulados e registro de sessões de estudo</li>
              <li><strong>Hiperfocos:</strong> Gerenciamento de períodos de hiperfoco com sistema de tarefas e subtarefas ilimitadas</li>
              <li><strong>Produtividade:</strong> Técnica Pomodoro, tarefas prioritárias (limite de 3 diárias) e blocos de tempo (time blocking)</li>
              <li><strong>Lazer:</strong> Registro de atividades de lazer, saúde e sociais com acompanhamento de duração</li>
              <li><strong>Autoconhecimento:</strong> Registros de humor, energia e ansiedade com identificação de gatilhos</li>
              <li><strong>Receitas:</strong> Banco de receitas com ingredientes estruturados, modo de preparo e lista de compras integrada</li>
            </ul>
          </section>

          {/* 3. Elegibilidade */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Elegibilidade
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Você deve ter pelo menos <strong>18 anos de idade</strong> para usar o StayFocus. Se você tem entre 
              13 e 17 anos, pode usar o serviço apenas com o consentimento e supervisão de um responsável legal.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Ao criar uma conta, você declara que:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Possui idade legal para formar um contrato vinculativo</li>
              <li>Todas as informações fornecidas são verdadeiras e precisas</li>
              <li>Manterá suas informações de conta atualizadas</li>
            </ul>
          </section>

          {/* 4. Conta de Usuário */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Conta de Usuário e Segurança
            </h2>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">4.1 Criação de Conta</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Você pode criar uma conta usando:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Email e senha (mínimo 6 caracteres)</li>
              <li>Google OAuth (autenticação via Google)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">4.2 Responsabilidades</h3>
            <p className="text-gray-700 dark:text-gray-300">Você é responsável por:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Manter a confidencialidade de sua senha</li>
              <li>Todas as atividades realizadas em sua conta</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              <li>Garantir que suas informações de contato estejam sempre atualizadas</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">4.3 Isolamento de Dados</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Implementamos <strong>Row Level Security (RLS)</strong> garantindo que seus dados são completamente 
              isolados e visíveis apenas para você. Nenhum outro usuário tem acesso aos seus registros pessoais.
            </p>
          </section>

          {/* 5. Uso Aceitável */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Regras de Conduta e Uso Aceitável
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">Você concorda em NÃO:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Usar o serviço para fins ilegais ou não autorizados</li>
              <li>Tentar obter acesso não autorizado a qualquer parte do serviço</li>
              <li>Interferir ou interromper o funcionamento do serviço</li>
              <li>Fazer engenharia reversa, descompilar ou desmontar qualquer parte da plataforma</li>
              <li>Usar scripts automatizados (bots) para acessar o serviço sem permissão</li>
              <li>Transmitir vírus, malware ou qualquer código malicioso</li>
              <li>Coletar informações de outros usuários</li>
              <li>Criar múltiplas contas para fins fraudulentos</li>
            </ul>
          </section>

          {/* 6. Natureza Informativa */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Natureza Informativa do Serviço
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                ⚠️ AVISO IMPORTANTE
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              O StayFocus é uma <strong>ferramenta de organização e gerenciamento pessoal</strong>, NÃO um 
              serviço médico, terapêutico ou de saúde mental.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Não substitui diagnóstico médico:</strong> A plataforma não diagnostica TDAH ou qualquer outra condição</li>
              <li><strong>Não substitui tratamento profissional:</strong> Não somos substitutos para psicólogos, psiquiatras ou outros profissionais de saúde</li>
              <li><strong>Lembretes de medicação:</strong> São apenas auxiliares organizacionais. Sempre siga as orientações do seu médico</li>
              <li><strong>Monitoramento de humor:</strong> É uma ferramenta de autoconhecimento, não uma avaliação clínica</li>
              <li><strong>Em caso de emergência:</strong> Entre em contato com serviços de emergência (192 - SAMU, 188 - CVV) imediatamente</li>
            </ul>
          </section>

          {/* 7. Propriedade Intelectual */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Propriedade Intelectual
            </h2>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">7.1 Nossos Direitos</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Todo o conteúdo, design, código, marcas e logos do StayFocus são de nossa propriedade ou 
              licenciados para nós. Isso inclui:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Interface do usuário e design visual</li>
              <li>Algoritmos e funcionalidades (Pomodoro, revisão espaçada, etc.)</li>
              <li>Textos, gráficos e ícones</li>
              <li>Nome "StayFocus" e identidade visual</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">7.2 Seus Direitos</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Você mantém todos os direitos sobre o conteúdo que cria na plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Suas receitas, registros e anotações</li>
              <li>Seus dados pessoais e registros</li>
              <li>Questões de estudo que você adiciona</li>
              <li>Observações e notas pessoais</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Você nos concede uma licença não exclusiva para armazenar e processar esse conteúdo 
              apenas para fornecer o serviço a você.
            </p>
          </section>

          {/* 8. Planos e Pagamentos */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Planos e Pagamentos
            </h2>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">8.1 Plano Gratuito</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Atualmente, o StayFocus oferece acesso <strong>gratuito</strong> a todas as funcionalidades 
              documentadas, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Registro ilimitado de transações financeiras</li>
              <li>Envelopes e categorias ilimitadas</li>
              <li>Banco de receitas e lista de compras</li>
              <li>Gerenciamento completo de medicamentos</li>
              <li>Banco de questões e simulados</li>
              <li>Sistema completo de hiperfocos com subtarefas ilimitadas</li>
              <li>Todas as ferramentas de produtividade (Pomodoro, time blocking)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">8.2 Planos Futuros</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Reservamo-nos o direito de introduzir planos pagos no futuro. Caso isso ocorra:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Usuários existentes serão notificados com <strong>30 dias de antecedência</strong></li>
              <li>Funcionalidades básicas permanecerão gratuitas</li>
              <li>Preços e termos serão claramente comunicados</li>
            </ul>
          </section>

          {/* 9. Cancelamento */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Cancelamento e Exclusão de Conta
            </h2>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">9.1 Por Você</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Você pode cancelar sua conta a qualquer momento através das configurações de perfil. Ao excluir sua conta:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Todos os seus dados serão permanentemente deletados</li>
              <li>A exclusão é irreversível - não podemos recuperar dados deletados</li>
              <li>Você pode exportar seus dados antes da exclusão</li>
              <li>O processo de exclusão é concluído em até 30 dias</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4">9.2 Por Nós</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Podemos suspender ou encerrar sua conta se:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Você violar estes Termos de Uso</li>
              <li>Detectarmos atividade fraudulenta ou abusiva</li>
              <li>Formos obrigados por lei</li>
              <li>A conta ficar inativa por mais de 2 anos</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Tentaremos notificá-lo com antecedência quando possível.
            </p>
          </section>

          {/* 10. Limitação de Responsabilidade */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Limitação de Responsabilidade
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              O StayFocus é fornecido "como está" e "conforme disponível". NÃO GARANTIMOS:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Disponibilidade contínua:</strong> O serviço pode ter períodos de manutenção ou interrupções</li>
              <li><strong>Precisão absoluta:</strong> Cálculos automáticos (horas de sono, duração de estudos) são baseados nos dados que você fornece</li>
              <li><strong>Backup de dados:</strong> Recomendamos exportar dados importantes regularmente</li>
              <li><strong>Adequação médica:</strong> Lembretes de medicação não substituem alarmes médicos profissionais</li>
              <li><strong>Decisões financeiras:</strong> O sistema de envelopes é uma ferramenta auxiliar, não consultoria financeira</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              <strong>Em nenhuma circunstância seremos responsáveis por:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Danos indiretos, incidentais ou consequenciais</li>
              <li>Perda de dados devido a falhas técnicas</li>
              <li>Decisões tomadas com base nas informações da plataforma</li>
              <li>Problemas de saúde relacionados ao uso ou não uso da plataforma</li>
            </ul>
          </section>

          {/* 11. Modificações */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 mb-4">
              11. Modificações do Serviço e dos Termos
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Podemos modificar ou descontinuar qualquer parte do serviço a qualquer momento. 
              Nos reservamos o direito de:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Adicionar ou remover funcionalidades</li>
              <li>Alterar a interface do usuário</li>
              <li>Modificar limites de armazenamento ou uso</li>
              <li>Atualizar estes Termos de Uso</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Mudanças significativas serão comunicadas via email ou notificação na plataforma com 
              <strong> 15 dias de antecedência</strong>.
            </p>
          </section>

          {/* 12. Lei Aplicável */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Lei Aplicável e Foro
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Estes Termos de Uso são regidos pelas leis da <strong>República Federativa do Brasil</strong>, 
              especialmente:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Lei Geral de Proteção de Dados (LGPD)</strong> - Lei nº 13.709/2018</li>
              <li><strong>Marco Civil da Internet</strong> - Lei nº 12.965/2014</li>
              <li><strong>Código de Defesa do Consumidor</strong> - Lei nº 8.078/1990</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Fica eleito o foro da comarca de <strong>[Sua Cidade/Estado]</strong> para dirimir 
              quaisquer controvérsias decorrentes destes Termos.
            </p>
          </section>

          {/* 13. Contato */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Contato e Suporte
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Para dúvidas, sugestões ou problemas relacionados a estes Termos de Uso, entre em contato:
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> suporte@stayfocus.app<br />
                <strong>Seção de Ajuda:</strong> <Link href="/perfil/ajuda" className="text-blue-600 hover:underline">stayfocus.app/perfil/ajuda</Link>
              </p>
            </div>
          </section>

          {/* Aceitação */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ao usar o StayFocus, você reconhece que leu, compreendeu e concorda em estar vinculado 
              a estes Termos de Uso e à nossa <Link href="/politica-de-privacidade" className="text-blue-600 hover:underline">Política de Privacidade</Link>.
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
            href="/politica-de-privacidade"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}
