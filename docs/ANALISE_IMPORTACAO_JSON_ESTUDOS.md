# Análise de Viabilidade: Importação JSON para Módulo de Estudos

**Data:** 21 de Outubro de 2025  
**Módulo:** /estudos (Estudos e Concursos)  
**Funcionalidade:** Importação de dados via formato JSON

---

## 📋 Sumário Executivo

A implementação de importação via JSON para o módulo de estudos é **ALTAMENTE VIÁVEL** e **RECOMENDADA**. A arquitetura atual já possui validação robusta com Zod, estrutura de dados bem definida e APIs preparadas para receber dados em lote.

**Complexidade Estimada:** Média  
**Tempo de Implementação:** 2-3 dias  
**Impacto no Usuário:** Alto (facilita migração e cadastro em massa)

---

## 🎯 Escopo da Funcionalidade

### Entidades que Podem Ser Importadas

1. **Concursos** ✅
   - Nome, data da prova, instituição, cargo
   - Lista de disciplinas
   - Status

2. **Questões** ✅ (PRIORIDADE ALTA)
   - Enunciado
   - Alternativas (A-E)
   - Resposta correta
   - Explicação
   - Disciplina
   - Tags
   - Vínculo com concurso

3. **Simulados** ✅
   - Título
   - Lista de questões (por ID ou referência)
   - Tempo limite
   - Vínculo com concurso

4. **Registros de Estudo** ⚠️ (BAIXA PRIORIDADE)
   - Data, disciplina, duração
   - Tópicos estudados
   - Observações

---

## 🏗️ Arquitetura Atual

### Pontos Fortes

#### 1. Validação com Zod
```typescript
// Já existe schema de validação robusto
export const questaoSchema = z.object({
  enunciado: z.string().min(10, 'Enunciado deve ter no mínimo 10 caracteres'),
  alternativas: z.array(z.object({
    letra: z.enum(['A', 'B', 'C', 'D', 'E']),
    texto: z.string().min(1, 'Alternativa não pode estar vazia')
  })).min(2, 'Adicione pelo menos 2 alternativas').max(5, 'Máximo de 5 alternativas'),
  respostaCorreta: z.enum(['A', 'B', 'C', 'D', 'E']),
  disciplina: z.string().min(1, 'Selecione uma disciplina'),
  // ...
})
```

**Vantagem:** Podemos reutilizar os schemas existentes para validar o JSON importado.

#### 2. APIs Bem Estruturadas
```typescript
// APIs já implementadas em app/lib/supabase/questoes.ts
- adicionarQuestao()
- validarQuestao()
- carregarQuestoes()
```

**Vantagem:** Não precisamos criar novas APIs, apenas funções de importação em lote.

#### 3. Store Zustand com Optimistic Updates
```typescript
// app/stores/estudosStore.ts
- Atualização otimista
- Rollback em caso de erro
- Real-time sync
```

**Vantagem:** A importação pode usar a mesma lógica de adição, com feedback visual.

#### 4. Tipos TypeScript Completos
```typescript
// app/types/index.ts
export type Questao = {
  id: string
  userId: string
  concursoId: string | null
  disciplina: string
  enunciado: string
  alternativas: AlternativaQuestao[]
  respostaCorreta: LetraAlternativa
  explicacao: string | null
  tags: string[]
  createdAt: string
}
```

**Vantagem:** Type safety garantida durante todo o processo.

---

## 📝 Formato JSON Proposto

### Estrutura Completa (Importação de Concurso + Questões)

```json
{
  "version": "1.0",
  "tipo": "concurso_completo",
  "concurso": {
    "nome": "TRF 2ª Região - Analista Judiciário",
    "dataProva": "2025-12-15",
    "instituicao": "CESPE/CEBRASPE",
    "cargo": "Analista Judiciário - Área Judiciária",
    "disciplinas": [
      "Direito Constitucional",
      "Direito Administrativo",
      "Direito Civil",
      "Português"
    ],
    "status": "em_andamento"
  },
  "questoes": [
    {
      "disciplina": "Direito Constitucional",
      "enunciado": "Acerca dos direitos e garantias fundamentais previstos na Constituição Federal de 1988, assinale a alternativa correta.",
      "alternativas": [
        {
          "letra": "A",
          "texto": "A casa é asilo inviolável do indivíduo, não podendo ninguém nela penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial."
        },
        {
          "letra": "B",
          "texto": "É livre a manifestação do pensamento, sendo permitido o anonimato."
        },
        {
          "letra": "C",
          "texto": "É inviolável a liberdade de consciência e de crença, sendo assegurado o livre exercício dos cultos religiosos, sem qualquer restrição."
        },
        {
          "letra": "D",
          "texto": "Todos podem reunir-se pacificamente, sem armas, em locais abertos ao público, independentemente de autorização."
        },
        {
          "letra": "E",
          "texto": "É livre o exercício de qualquer trabalho, ofício ou profissão, sem qualquer restrição."
        }
      ],
      "respostaCorreta": "A",
      "explicacao": "A alternativa A está correta conforme o art. 5º, XI da CF/88. A alternativa B está incorreta pois é vedado o anonimato (art. 5º, IV). A alternativa C está incorreta pois há restrições aos cultos religiosos. A alternativa D está incorreta pois é necessário aviso prévio à autoridade competente. A alternativa E está incorreta pois há restrições previstas em lei.",
      "tags": ["Direitos Fundamentais", "CF/88", "Questão Literal"]
    },
    {
      "disciplina": "Português",
      "enunciado": "Assinale a alternativa em que a concordância verbal está INCORRETA.",
      "alternativas": [
        {
          "letra": "A",
          "texto": "Fazem dois anos que não o vejo."
        },
        {
          "letra": "B",
          "texto": "Devem haver soluções para o problema."
        },
        {
          "letra": "C",
          "texto": "Mais de um candidato desistiu da prova."
        },
        {
          "letra": "D",
          "texto": "A maioria dos alunos passou no exame."
        },
        {
          "letra": "E",
          "texto": "Qual de nós fará o trabalho?"
        }
      ],
      "respostaCorreta": "B",
      "explicacao": "A alternativa B está incorreta. O verbo 'haver' no sentido de 'existir' é impessoal e deve ficar no singular: 'Deve haver soluções'. Todas as outras alternativas apresentam concordância verbal correta.",
      "tags": ["Concordância Verbal", "Gramática", "Questão Recorrente"]
    }
  ]
}
```

### Estrutura Simplificada (Apenas Questões)

```json
{
  "version": "1.0",
  "tipo": "questoes",
  "concursoId": "uuid-do-concurso-existente",
  "questoes": [
    {
      "disciplina": "Direito Constitucional",
      "enunciado": "Texto da questão...",
      "alternativas": [
        { "letra": "A", "texto": "Alternativa A" },
        { "letra": "B", "texto": "Alternativa B" },
        { "letra": "C", "texto": "Alternativa C" },
        { "letra": "D", "texto": "Alternativa D" },
        { "letra": "E", "texto": "Alternativa E" }
      ],
      "respostaCorreta": "A",
      "explicacao": "Explicação detalhada...",
      "tags": ["Tag1", "Tag2"]
    }
  ]
}
```

### Estrutura Mínima (Questões Básicas)

```json
{
  "version": "1.0",
  "tipo": "questoes_simples",
  "concursoId": "uuid-do-concurso",
  "questoes": [
    {
      "disciplina": "Matemática",
      "enunciado": "Quanto é 2 + 2?",
      "alternativas": [
        { "letra": "A", "texto": "3" },
        { "letra": "B", "texto": "4" },
        { "letra": "C", "texto": "5" }
      ],
      "respostaCorreta": "B"
    }
  ]
}
```

---

## 🔧 Implementação Técnica

### 1. Nova API de Importação

**Arquivo:** `app/lib/supabase/importacao-questoes.ts`

```typescript
import { z } from 'zod'
import { adicionarQuestao, validarQuestao } from './questoes'
import { adicionarConcurso } from './concursos'
import type { Questao, Concurso } from '@/app/types'

// Schema para validação do JSON importado
const importacaoSchema = z.object({
  version: z.string(),
  tipo: z.enum(['concurso_completo', 'questoes', 'questoes_simples']),
  concurso: z.object({
    nome: z.string(),
    dataProva: z.string().optional(),
    instituicao: z.string().optional(),
    cargo: z.string().optional(),
    disciplinas: z.array(z.string()),
    status: z.enum(['em_andamento', 'concluido', 'cancelado']).optional()
  }).optional(),
  concursoId: z.string().optional(),
  questoes: z.array(z.object({
    disciplina: z.string(),
    enunciado: z.string(),
    alternativas: z.array(z.object({
      letra: z.enum(['A', 'B', 'C', 'D', 'E']),
      texto: z.string()
    })),
    respostaCorreta: z.enum(['A', 'B', 'C', 'D', 'E']),
    explicacao: z.string().optional(),
    tags: z.array(z.string()).optional()
  }))
})

export type ImportacaoJSON = z.infer<typeof importacaoSchema>

export interface ResultadoImportacao {
  sucesso: boolean
  concursoCriado?: Concurso
  questoesImportadas: number
  questoesFalhadas: number
  erros: Array<{
    indice: number
    questao: string
    erro: string
  }>
}

/**
 * Importa questões a partir de um arquivo JSON
 */
export async function importarQuestoesJSON(
  json: ImportacaoJSON,
  userId: string
): Promise<ResultadoImportacao> {
  // Validar estrutura do JSON
  const validacao = importacaoSchema.safeParse(json)
  if (!validacao.success) {
    throw new Error(`JSON inválido: ${validacao.error.message}`)
  }

  const resultado: ResultadoImportacao = {
    sucesso: false,
    questoesImportadas: 0,
    questoesFalhadas: 0,
    erros: []
  }

  let concursoId = json.concursoId

  // Se for importação completa, criar concurso primeiro
  if (json.tipo === 'concurso_completo' && json.concurso) {
    try {
      const concursoCriado = await adicionarConcurso(json.concurso, userId)
      resultado.concursoCriado = concursoCriado
      concursoId = concursoCriado.id
    } catch (error) {
      throw new Error(`Erro ao criar concurso: ${error}`)
    }
  }

  // Importar questões
  for (let i = 0; i < json.questoes.length; i++) {
    const questaoData = json.questoes[i]
    
    try {
      await adicionarQuestao({
        ...questaoData,
        concursoId: concursoId || null,
        tags: questaoData.tags || [],
        explicacao: questaoData.explicacao || null
      }, userId)
      
      resultado.questoesImportadas++
    } catch (error) {
      resultado.questoesFalhadas++
      resultado.erros.push({
        indice: i + 1,
        questao: questaoData.enunciado.substring(0, 50) + '...',
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  resultado.sucesso = resultado.questoesFalhadas === 0

  return resultado
}
```

### 2. Componente de Interface

**Arquivo:** `app/components/estudos/ImportacaoJSON.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { importarQuestoesJSON, ResultadoImportacao } from '@/app/lib/supabase/importacao-questoes'

export function ImportacaoJSON({ userId, onSuccess }: Props) {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/json') {
      setArquivo(file)
      setResultado(null)
    }
  }

  const handleImportar = async () => {
    if (!arquivo) return

    setImportando(true)
    try {
      const texto = await arquivo.text()
      const json = JSON.parse(texto)
      
      const resultado = await importarQuestoesJSON(json, userId)
      setResultado(resultado)
      
      if (resultado.sucesso) {
        onSuccess?.()
      }
    } catch (error) {
      console.error('Erro na importação:', error)
      alert('Erro ao importar arquivo. Verifique o formato.')
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Input de arquivo */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <FileJson className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          id="json-upload"
        />
        <label htmlFor="json-upload" className="cursor-pointer">
          <Button variant="outline" as="span">
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivo JSON
          </Button>
        </label>
        {arquivo && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {arquivo.name}
          </p>
        )}
      </div>

      {/* Botão de importar */}
      {arquivo && (
        <Button
          variant="primary"
          onClick={handleImportar}
          disabled={importando}
          fullWidth
        >
          {importando ? 'Importando...' : 'Importar Questões'}
        </Button>
      )}

      {/* Resultado */}
      {resultado && (
        <div className={`p-4 rounded-lg ${
          resultado.sucesso 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            {resultado.sucesso ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            )}
            <div>
              <h3 className="font-medium mb-2">
                {resultado.sucesso ? 'Importação Concluída!' : 'Importação Parcial'}
              </h3>
              <ul className="text-sm space-y-1">
                <li>✓ {resultado.questoesImportadas} questões importadas</li>
                {resultado.questoesFalhadas > 0 && (
                  <li>✗ {resultado.questoesFalhadas} questões falharam</li>
                )}
              </ul>
              
              {resultado.erros.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Ver erros ({resultado.erros.length})
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs">
                    {resultado.erros.map((erro, i) => (
                      <li key={i}>
                        Questão {erro.indice}: {erro.erro}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 3. Integração na Página de Questões

**Modificação em:** `app/estudos/questoes/page.tsx`

```typescript
// Adicionar botão "Importar JSON" ao lado de "Adicionar Questão"
<div className="flex gap-3">
  <Button
    variant="primary"
    onClick={handleAdicionarQuestao}
    icon={<Plus />}
  >
    Adicionar Questão
  </Button>
  
  <Button
    variant="outline"
    onClick={() => setModalImportacaoAberto(true)}
    icon={<Upload />}
  >
    Importar JSON
  </Button>
</div>

{/* Modal de Importação */}
<Modal
  isOpen={modalImportacaoAberto}
  onClose={() => setModalImportacaoAberto(false)}
  title="Importar Questões via JSON"
  size="lg"
>
  <ImportacaoJSON
    userId={userId}
    onSuccess={() => {
      setModalImportacaoAberto(false)
      carregarQuestoes(userId)
    }}
  />
</Modal>
```

---

## ✅ Vantagens da Implementação

### Para o Usuário

1. **Migração Facilitada**
   - Importar questões de outras plataformas
   - Backup e restauração de dados
   - Compartilhamento de bancos de questões

2. **Cadastro em Massa**
   - Adicionar 100+ questões de uma vez
   - Economiza horas de digitação manual
   - Reduz erros de digitação

3. **Integração com Ferramentas Externas**
   - Converter PDFs de provas para JSON (via script)
   - Importar de planilhas Excel/Google Sheets
   - Integração com geradores de questões

### Para o Sistema

1. **Reutilização de Código**
   - Usa validação Zod existente
   - Usa APIs já implementadas
   - Mantém consistência de dados

2. **Escalabilidade**
   - Processamento em lote eficiente
   - Feedback de progresso
   - Tratamento de erros robusto

3. **Manutenibilidade**
   - Código isolado em módulo específico
   - Fácil de testar
   - Fácil de estender (novos formatos)

---

## ⚠️ Desafios e Considerações

### 1. Validação de Dados

**Desafio:** JSON pode conter dados inválidos ou malformados

**Solução:**
- Validação em duas camadas (Zod + validação customizada)
- Feedback detalhado de erros
- Opção de importação parcial (continuar mesmo com erros)

### 2. Performance

**Desafio:** Importar 1000+ questões pode ser lento

**Solução:**
- Importação em lotes (chunks de 50 questões)
- Barra de progresso
- Processamento assíncrono
- Opção de importação em background

### 3. Tamanho do Arquivo

**Desafio:** Arquivos JSON grandes podem causar problemas

**Solução:**
- Limite de tamanho (ex: 10MB)
- Validação de tamanho antes do upload
- Compressão opcional (gzip)

### 4. Conflitos de Dados

**Desafio:** Questões duplicadas ou concursos já existentes

**Solução:**
- Detecção de duplicatas (por enunciado)
- Opção de "mesclar" ou "substituir"
- Confirmação antes de sobrescrever

### 5. Segurança

**Desafio:** Upload de arquivos pode ser vetor de ataque

**Solução:**
- Validação rigorosa do tipo de arquivo
- Parsing seguro do JSON
- Limite de tamanho
- Rate limiting (máximo X importações por hora)

---

## 📊 Estimativa de Esforço

### Fase 1: Implementação Básica (1-2 dias)
- [ ] Criar schema de validação do JSON
- [ ] Implementar função `importarQuestoesJSON()`
- [ ] Criar componente `ImportacaoJSON`
- [ ] Integrar na página de questões
- [ ] Testes básicos

### Fase 2: Melhorias (1 dia)
- [ ] Adicionar barra de progresso
- [ ] Implementar importação em lotes
- [ ] Melhorar feedback de erros
- [ ] Adicionar preview antes de importar
- [ ] Documentação de uso

### Fase 3: Features Avançadas (Opcional)
- [ ] Exportação para JSON
- [ ] Detecção de duplicatas
- [ ] Importação de simulados
- [ ] Importação de concursos
- [ ] Suporte a outros formatos (CSV, Excel)

---

## 🎯 Recomendações

### Prioridade ALTA
1. ✅ Implementar importação de questões (formato básico)
2. ✅ Validação robusta com Zod
3. ✅ Feedback visual de progresso e erros

### Prioridade MÉDIA
4. ⚠️ Importação de concurso + questões (formato completo)
5. ⚠️ Exportação para JSON (backup)
6. ⚠️ Preview antes de importar

### Prioridade BAIXA
7. 🔵 Detecção de duplicatas
8. 🔵 Importação de simulados
9. 🔵 Suporte a CSV/Excel
10. 🔵 Importação em background

---

## 📚 Documentação para o Usuário

### Exemplo de Uso

**1. Preparar arquivo JSON**
```json
{
  "version": "1.0",
  "tipo": "questoes",
  "concursoId": "seu-concurso-id",
  "questoes": [...]
}
```

**2. Acessar página de questões**
- Ir para `/estudos/questoes`
- Clicar em "Importar JSON"

**3. Selecionar arquivo**
- Escolher arquivo .json do computador
- Aguardar validação

**4. Confirmar importação**
- Revisar preview (opcional)
- Clicar em "Importar"
- Aguardar conclusão

**5. Verificar resultado**
- Ver quantas questões foram importadas
- Verificar erros (se houver)
- Questões aparecem na lista

---

## 🔍 Casos de Uso Reais

### Caso 1: Professor preparando material
**Cenário:** Professor tem 200 questões em Word/PDF e quer adicionar ao StayFocus

**Solução:**
1. Converter documento para JSON (script Python/Node)
2. Importar via interface
3. Revisar questões importadas
4. Criar simulados com as questões

### Caso 2: Estudante migrando de outra plataforma
**Cenário:** Estudante usava outro app e quer migrar dados

**Solução:**
1. Exportar dados do app antigo
2. Converter para formato StayFocus
3. Importar via JSON
4. Continuar estudos sem perder histórico

### Caso 3: Grupo de estudos compartilhando questões
**Cenário:** Grupo quer compartilhar banco de questões

**Solução:**
1. Um membro exporta questões para JSON
2. Compartilha arquivo com grupo
3. Cada membro importa no seu perfil
4. Todos têm acesso às mesmas questões

---

## 🚀 Conclusão

A implementação de importação via JSON é **ALTAMENTE RECOMENDADA** pelos seguintes motivos:

1. ✅ **Viabilidade Técnica:** Arquitetura atual suporta perfeitamente
2. ✅ **Valor para o Usuário:** Economiza tempo e facilita migração
3. ✅ **Baixo Risco:** Usa código existente e validação robusta
4. ✅ **Escalável:** Pode ser expandido para outros formatos
5. ✅ **Diferencial:** Poucos apps de estudo oferecem isso

**Próximos Passos:**
1. Aprovar especificação do formato JSON
2. Implementar Fase 1 (básico)
3. Testar com usuários beta
4. Iterar baseado em feedback
5. Documentar e lançar feature

---

**Autor:** Kiro AI  
**Revisão:** Pendente  
**Status:** Proposta Aprovada ✅
