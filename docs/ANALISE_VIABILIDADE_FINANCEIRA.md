# StayFocus - Análise de Viabilidade Financeira

**Data:** 20 de Outubro de 2025  
**Versão:** 1.0

---

## 🎯 Resumo Executivo

**Tempo no Free Tier:** 6-12 meses (até ~500 usuários)  
**Custo Inicial:** R$ 125/mês (Supabase Pro)  
**Conversão Necessária:** 3% (15 usuários premium)  
**Viabilidade:** ✅ **ALTAMENTE VIÁVEL** sem funcionalidade de imagens

> **DECISÃO ARQUITETURAL:** A aplicação NÃO terá funcionalidade de upload de imagens, eliminando o maior gargalo de infraestrutura e simplificando a arquitetura.

---

## 📊 Limites dos Planos Gratuitos

### Supabase (Free Tier)
| Recurso | Limite | Gargalo? |
|---------|--------|----------|
| Database | 500 MB | ⚠️ Moderado |
| Storage | 1 GB | 🔴 **CRÍTICO** |
| Bandwidth | 5 GB/mês | ⚠️ Moderado |
| Auth Users | Ilimitado | ✅ OK |
| Realtime | 200 conexões | ✅ OK |

### Vercel (Hobby/Free)
| Recurso | Limite | Gargalo? |
|---------|--------|----------|
| Bandwidth | 100 GB/mês | ✅ OK |
| Build Time | 6000 min/mês | ✅ OK |
| Serverless | 100 GB-Hrs/mês | ✅ OK |

### Cloudinary (Free Tier) - Recomendado para imagens
| Recurso | Limite | Gargalo? |
|---------|--------|----------|
| Storage | 25 GB | ✅ OK |
| Bandwidth | 25 GB/mês | ✅ OK |
| Transformações | 25,000/mês | ✅ OK |

---

## 💾 Consumo Estimado por Usuário

### Database (Supabase)
```
Perfil e configurações:        2 KB
Categorias financeiras (10):   5 KB
Transações (100/mês):         50 KB
Envelopes (5):                 3 KB
Medicamentos (5):              5 KB
Histórico tomadas (300/mês):  30 KB
Registros de humor (30/mês):  15 KB
Registros de sono (30/mês):   10 KB
Tarefas e subtarefas (50):    25 KB
Hiperfocos (5):               10 KB
Receitas (20):                40 KB
Questões concurso (100):     200 KB
Registros estudo (30/mês):    15 KB
Pomodoros (60/mês):           20 KB
Refeições planejadas (50):    25 KB
Hidratação (30/mês):           5 KB
─────────────────────────────────
TOTAL/MÊS:                   ~460 KB
TOTAL/6 MESES:               ~2.5 MB
```

**Capacidade:** 500 MB / 2.5 MB = **~200 usuários** (6 meses de dados)

### Storage - SEM Otimização (Supabase)
```
Foto de perfil:                500 KB
Fotos de refeições (30/mês):    15 MB
Fotos de receitas (20):         10 MB
Anexos diversos:                 5 MB
─────────────────────────────────
TOTAL/6 MESES:                ~180 MB
```

**Capacidade:** 1 GB / 180 MB = **~5 usuários** 🔴 **GARGALO CRÍTICO!**

### Storage - COM Otimização (Cloudinary)
```
Foto de perfil (WebP):         100 KB
Fotos refeições (5 últimas):   500 KB (100 KB cada)
Fotos receitas (3):            300 KB (100 KB cada)
─────────────────────────────────
TOTAL/USUÁRIO:                ~900 KB
```

**Capacidade Cloudinary:** 25 GB / 0.9 MB = **~27,777 usuários** ✅

### Bandwidth (Supabase)
```
Login/Auth:                    1.5 MB/mês
Carregamento de dados:          15 MB/mês
Sincronização realtime:          6 MB/mês
Upload de dados:                 3 MB/mês
Download de imagens:            60 MB/mês
API calls diversos:              5 MB/mês
─────────────────────────────────
TOTAL/MÊS:                     ~90 MB

COM OTIMIZAÇÃO (cache, lazy loading):
TOTAL/MÊS:                     ~54 MB
```

**Capacidade:** 5 GB / 54 MB = **~92 usuários/mês**

### Bandwidth (Vercel)
```
Carregamento inicial:           2 MB (primeira visita)
Carregamento com cache:       0.2 MB/visita
Visitas médias:                20/mês
─────────────────────────────────
TOTAL/MÊS:                    ~5.8 MB
```

**Capacidade:** 100 GB / 5.8 MB = **~17,241 usuários** ✅

---

## 🚦 Gargalos Identificados

### Sem Otimização
1. 🔴 **Storage (Supabase):** ~5 usuários - **BLOQUEADOR**
2. ⚠️ **Bandwidth (Supabase):** ~55 usuários
3. ✅ **Database (Supabase):** ~200 usuários
4. ✅ **Vercel:** ~17,000 usuários

### Com Otimizações Implementadas
1. ⚠️ **Bandwidth (Supabase):** ~92 usuários - **NOVO GARGALO**
2. ✅ **Database (Supabase):** ~200 usuários
3. ✅ **Storage (Cloudinary):** ~27,000 usuários
4. ✅ **Vercel:** ~17,000 usuários

### Com Otimização Máxima + Limpeza de Dados
1. ✅ **Database (Supabase):** ~300 usuários - **LIMITE REAL**
2. ✅ **Bandwidth (Supabase):** ~150 usuários
3. ✅ **Storage (Cloudinary):** ~27,000 usuários
4. ✅ **Vercel:** ~17,000 usuários

**Capacidade Final no Free Tier:** **~150-300 usuários ativos**

---

## ⚙️ Otimizações Críticas (OBRIGATÓRIAS)

### 1. Migrar Imagens para Cloudinary
```javascript
// Ao invés de Supabase Storage
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'stayfocus');
  
  const response = await fetch(
    'https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload',
    { method: 'POST', body: formData }
  );
  
  return response.json();
};
```

**Economia:** De 5 usuários para 27,000+ usuários

### 2. Comprimir Imagens Agressivamente
```javascript
// Antes do upload
const compressImage = async (file) => {
  return await imageCompression(file, {
    maxSizeMB: 0.1,           // 100 KB máximo
    maxWidthOrHeight: 800,     // 800x600 max
    useWebWorker: true,
    fileType: 'image/webp'     // WebP é 30% menor
  });
};
```

**Economia:** 80-90% de redução no tamanho

### 3. Limitar Fotos no Plano Gratuito
```typescript
// Regras de negócio
const FREE_TIER_LIMITS = {
  mealPhotos: 5,        // Últimas 5 fotos de refeições
  recipePhotos: 3,      // Máximo 3 receitas com foto
  profilePhoto: false,  // Usar Gravatar ou inicial
};

// Auto-deletar fotos antigas
const cleanupOldPhotos = async (userId) => {
  const photos = await getMealPhotos(userId);
  if (photos.length > FREE_TIER_LIMITS.mealPhotos) {
    const toDelete = photos.slice(FREE_TIER_LIMITS.mealPhotos);
    await deletePhotos(toDelete);
  }
};
```

### 4. Implementar Cache Agressivo
```typescript
// React Query com cache longo
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutos
      cacheTime: 30 * 60 * 1000,     // 30 minutos
      refetchOnWindowFocus: false,
    },
  },
});
```

**Economia:** 40-50% de redução em bandwidth

### 5. Lazy Loading de Imagens
```typescript
// Carregar imagens sob demanda
<img 
  src={thumbnail} 
  loading="lazy"
  onClick={() => loadFullImage(imageId)}
/>
```

### 6. Limpeza de Dados Antigos (Plano Gratuito)
```sql
-- Deletar dados > 6 meses para usuários gratuitos
DELETE FROM mood_logs 
WHERE user_id IN (SELECT id FROM users WHERE plan = 'free')
  AND created_at < NOW() - INTERVAL '6 months';

DELETE FROM sleep_logs 
WHERE user_id IN (SELECT id FROM users WHERE plan = 'free')
  AND created_at < NOW() - INTERVAL '6 months';

-- Manter apenas dados essenciais
```

**Economia:** 50% de redução em database

---

## 📅 Cenários de Crescimento

### Cenário 1: Crescimento Lento (5 usuários/semana)
```
Semana 30: 150 usuários
Semana 40: 200 usuários ← Limite do free tier
Semana 60: 300 usuários

Tempo no free tier: ~8-10 meses
```

### Cenário 2: Crescimento Moderado (10 usuários/semana)
```
Semana 15: 150 usuários
Semana 20: 200 usuários ← Limite do free tier
Semana 30: 300 usuários

Tempo no free tier: ~4-5 meses ⭐ MAIS PROVÁVEL
```

### Cenário 3: Crescimento Rápido (20 usuários/semana)
```
Semana 8: 160 usuários
Semana 10: 200 usuários ← Limite do free tier
Semana 15: 300 usuários

Tempo no free tier: ~2-3 meses
```

### Cenário 4: Crescimento Viral (50 usuários/semana)
```
Semana 3: 150 usuários
Semana 4: 200 usuários ← Limite do free tier
Semana 6: 300 usuários

Tempo no free tier: ~1 mês
Necessita plano de contingência!
```

---

## 💰 Custos Quando Ultrapassar Free Tier

### Ao atingir ~200 usuários

#### Supabase Pro
- **Custo:** $25/mês ≈ **R$ 125/mês**
- **Inclui:**
  - Database: 8 GB (16x mais)
  - Storage: 100 GB (100x mais)
  - Bandwidth: 250 GB/mês (50x mais)
- **Suporta:** ~1,600 usuários

#### Vercel
- **Custo:** R$ 0 (continua no free tier)
- **Necessário apenas com:** ~17,000 usuários

#### Cloudinary
- **Custo:** R$ 0 até 25 GB
- **Depois:** $0.10/GB ≈ R$ 0.50/GB
- **Para 500 usuários:** ~30 GB = R$ 2.50/mês

#### Notificações Push (OneSignal ou similar)
- **Custo:** R$ 0 até 10,000 notificações/mês
- **Depois:** ~R$ 50/mês

### Custo Total Mensal (200-500 usuários)
```
Supabase Pro:        R$ 125,00
Vercel:              R$   0,00
Cloudinary:          R$   2,50
Notificações:        R$  50,00
─────────────────────────────
TOTAL:               R$ 177,50/mês
```

**Custo por usuário:** R$ 177,50 / 400 = **R$ 0,44/usuário/mês**

---

## 📈 Projeções de Receita vs Custos

### Com 200 usuários (momento de migrar para pago)

#### Cenário Pessimista (5% conversão)
```
Usuários premium:     10
Receita mensal:       10 × R$ 16,90 = R$ 169,00
Custos:               R$ 125,00
─────────────────────────────────────────
LUCRO:                R$ 44,00/mês ✅
Margem:               26%
```

#### Cenário Realista (10% conversão)
```
Usuários premium:     20
Receita mensal:       20 × R$ 16,90 = R$ 338,00
Custos:               R$ 125,00
─────────────────────────────────────────
LUCRO:                R$ 213,00/mês ✅
Margem:               63%
```

#### Cenário Otimista (20% conversão)
```
Usuários premium:     40
Receita mensal:       40 × R$ 16,90 = R$ 676,00
Custos:               R$ 125,00
─────────────────────────────────────────
LUCRO:                R$ 551,00/mês ✅
Margem:               81%
```

### Com 500 usuários (após 6-8 meses)

#### Cenário Realista (10% conversão)
```
Usuários premium:     50
Receita mensal:       50 × R$ 16,90 = R$ 845,00
Custos:               R$ 177,50
─────────────────────────────────────────
LUCRO:                R$ 667,50/mês ✅
Margem:               79%
```

### Com 1000 usuários (após 1 ano)

#### Cenário Realista (10% conversão)
```
Usuários premium:     100
Receita mensal:       100 × R$ 16,90 = R$ 1.690,00
Custos:               R$ 185,00
─────────────────────────────────────────
LUCRO:                R$ 1.505,00/mês ✅
LUCRO ANUAL:          R$ 18.060,00
Margem:               89%
```

#### Cenário Otimista (20% conversão)
```
Usuários premium:     200
Receita mensal:       200 × R$ 16,90 = R$ 3.380,00
Custos:               R$ 185,00
─────────────────────────────────────────
LUCRO:                R$ 3.195,00/mês ✅
LUCRO ANUAL:          R$ 38.340,00
Margem:               95%
```

---

## 🎯 Estratégia de Monetização Recomendada

### Timeline de Lançamento

#### Fase 1: Beta Fechado (Mês 1-2)
- **Usuários:** 50 selecionados
- **Plano:** Tudo gratuito
- **Foco:** Feedback intenso, iteração rápida
- **Custos:** R$ 0 (free tier confortável)
- **Objetivo:** Validar product-market fit

#### Fase 2: Beta Aberto (Mês 3-4)
- **Usuários:** 150-200
- **Plano:** Ainda gratuito
- **Foco:** Escalar, testar mensagens de valor
- **Custos:** R$ 0 (próximo do limite)
- **Objetivo:** Preparar lançamento comercial

#### Fase 3: Lançamento Freemium (Mês 5)
- **Usuários:** 200-300
- **Plano:** Introduzir premium
- **Oferta:** Early bird 50% off (3 meses)
- **Custos:** R$ 125/mês (Supabase Pro)
- **Meta conversão:** 10-15%
- **Objetivo:** Sustentabilidade financeira

#### Fase 4: Crescimento (Mês 6-12)
- **Usuários:** 500-1000
- **Plano:** Preço normal
- **Foco:** Escalar, adicionar features premium
- **Custos:** R$ 177-185/mês
- **Meta conversão:** 10-20%
- **Objetivo:** Lucratividade

### Planos e Preços

#### Plano Gratuito (sempre disponível)
```
✅ Perfil e personalização completa
✅ 3 tarefas prioritárias/dia
✅ Pomodoro básico (sem histórico)
✅ Até 3 medicamentos
✅ Registro de humor (7 dias)
✅ Até 5 categorias financeiras
✅ Hidratação básica
✅ Máximo 5 fotos de refeições
✅ Máximo 3 receitas com foto
✅ Dados mantidos por 6 meses
```

#### Trial Premium (60 dias)
```
🎁 Acesso completo a tudo
🎁 Sem cartão necessário
🎁 Tempo para criar hábito
```

#### Plano Premium
```
💎 R$ 16,90/mês ou R$ 149,90/ano (26% off)

✨ Tudo ilimitado
✨ Gestão financeira completa
✨ Banco de questões ilimitado
✨ Hiperfocos com subtarefas ilimitadas
✨ Receitas ilimitadas
✨ Fotos ilimitadas
✨ Relatórios avançados
✨ Histórico completo (sem limite)
✨ Backup automático
✨ Exportação de dados
✨ Suporte prioritário
```

#### Plano Lifetime
```
♾️ R$ 399,90 (pagamento único)

✨ Acesso vitalício
✨ Todas as futuras funcionalidades
✨ Sem mensalidades
```

### Programa de Impacto Social

#### Descontos
- 🎓 **Estudantes:** 50% off (R$ 8,45/mês)
- 💙 **Baixa renda:** Bolsas mediante comprovação
- 🎁 **Modelo 1:1:** Cada premium subsidia 1 gratuito

---

## ⚠️ Riscos e Mitigações

### Risco 1: Crescimento Viral Inesperado
**Problema:** Ultrapassar 200 usuários em 1-2 semanas

**Mitigação:**
- Ter cartão de crédito cadastrado no Supabase (upgrade automático)
- Reserva de emergência de R$ 500
- Limitar cadastros temporariamente (waitlist)
- Acelerar lançamento do plano premium

### Risco 2: Conversão Baixa (<5%)
**Problema:** Receita insuficiente para cobrir custos

**Mitigação:**
- Buscar investimento/financiamento
- Crowdfunding (Catarse, Kickante)
- Parcerias com instituições de saúde
- Ajustar preços ou features do plano gratuito
- Implementar fontes de receita alternativas

### Risco 3: Custos Maiores que Estimado
**Problema:** Consumo real > estimativas

**Mitigação:**
- Monitorar métricas diariamente
- Implementar alertas de uso (80% do limite)
- Otimizações adicionais (CDN, compressão)
- Limites mais restritivos no plano gratuito

### Risco 4: Churn Alto
**Problema:** Usuários cancelam assinatura

**Mitigação:**
- Pesquisas de satisfação
- Onboarding melhorado
- Features que criam hábito
- Programa de fidelidade
- Desconto anual (reduz churn)

---

## ✅ Checklist de Implementação

### Antes do Lançamento
- [ ] Implementar upload para Cloudinary
- [ ] Adicionar compressão de imagens (WebP)
- [ ] Limitar fotos no plano gratuito
- [ ] Implementar cache com React Query
- [ ] Lazy loading de imagens
- [ ] Monitoramento de uso (Supabase dashboard)
- [ ] Alertas de limite (80% de uso)
- [ ] Documentar custos e projeções

### Ao Atingir 100 Usuários
- [ ] Revisar métricas de uso real
- [ ] Ajustar estimativas se necessário
- [ ] Preparar migração para Supabase Pro
- [ ] Testar fluxo de pagamento
- [ ] Preparar comunicação de lançamento premium

### Ao Atingir 180 Usuários (90% do limite)
- [ ] Cadastrar cartão no Supabase
- [ ] Lançar plano premium
- [ ] Ativar oferta early bird
- [ ] Comunicar valor aos usuários
- [ ] Monitorar conversão diariamente

### Ao Migrar para Supabase Pro
- [ ] Upgrade no painel Supabase
- [ ] Verificar funcionamento
- [ ] Monitorar custos
- [ ] Ajustar limites se necessário
- [ ] Comemorar! 🎉

---

## 📊 Métricas para Monitorar

### Diariamente
- Novos cadastros
- Usuários ativos (DAU)
- Uso de database (MB)
- Uso de storage (MB)
- Uso de bandwidth (MB)

### Semanalmente
- Usuários ativos (WAU)
- Taxa de retenção
- Features mais usadas
- Conversão para premium
- Churn rate

### Mensalmente
- Usuários ativos (MAU)
- MRR (Monthly Recurring Revenue)
- Custos de infraestrutura
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
- Margem de lucro

---

## 🎯 Conclusão

### Resposta Direta: Quando Precisará de Dinheiro?

**3-5 meses** após o lançamento, ao atingir ~200 usuários ativos.

### Viabilidade

✅ **TOTALMENTE VIÁVEL** com as seguintes condições:

1. **Implementar otimizações obrigatórias** (especialmente Cloudinary)
2. **Lançar plano premium antes de atingir 200 usuários**
3. **Atingir pelo menos 5% de conversão** (10 usuários pagantes)
4. **Monitorar métricas constantemente**

### Investimento Inicial Necessário

**R$ 0** - Pode começar sem investimento!

O projeto pode rodar completamente no free tier por 3-5 meses, tempo suficiente para:
- Validar o produto
- Construir audiência
- Gerar receita com planos premium
- Cobrir custos de infraestrutura

### Próximos Passos

1. Implementar otimizações técnicas
2. Lançar beta fechado (50 usuários)
3. Coletar feedback e iterar
4. Lançar beta aberto (200 usuários)
5. Preparar planos premium
6. Lançar comercialmente
7. Escalar com sustentabilidade

---

**O StayFocus é financeiramente viável e pode começar sem investimento inicial!** 🚀
