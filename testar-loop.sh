#!/bin/bash

echo "🔍 Verificando correções do loop infinito..."
echo ""

echo "✅ Verificando TemporizadorPomodoro.tsx..."
if grep -q "// Carregar sessões do dia atual" app/components/estudos/TemporizadorPomodoro.tsx && \
   grep -q "// Configurar sincronização em tempo real (separado para evitar loops)" app/components/estudos/TemporizadorPomodoro.tsx; then
    echo "   ✓ useEffect separados corretamente"
else
    echo "   ✗ useEffect não estão separados"
fi

echo ""
echo "✅ Verificando sync.ts..."
if grep -q "Returning existing subscription" app/lib/supabase/sync.ts; then
    echo "   ✓ Prevenção de recriação implementada"
else
    echo "   ✗ Prevenção de recriação não encontrada"
fi

echo ""
echo "✅ Verificando RegistroEstudos.tsx..."
if grep -A 5 "// Load data on mount" app/components/estudos/RegistroEstudos.tsx | grep -q "carregarRegistros" && \
   grep -A 5 "// Setup real-time sync" app/components/estudos/RegistroEstudos.tsx | grep -q "setupRealtimeSync"; then
    echo "   ✓ useEffect separados corretamente"
else
    echo "   ✗ useEffect não estão separados"
fi

echo ""
echo "📊 Resumo das correções:"
echo "   1. TemporizadorPomodoro: useEffect separados"
echo "   2. sync.ts: Prevenção de recriação de subscrições"
echo "   3. RegistroEstudos: Já estava correto"
echo ""
echo "🎯 Próximo passo: Teste no navegador"
echo "   1. Limpe o cache (Ctrl+Shift+Delete)"
echo "   2. Recarregue a página /estudos"
echo "   3. Verifique o console - não deve haver loops"
