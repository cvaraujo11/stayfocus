#!/bin/bash

echo "=== VERIFICAÇÃO DE LOOPS INFINITOS ==="
echo ""
echo "Procurando por useEffect com funções do store nas dependências..."
echo ""

# Procurar por padrões problemáticos
grep -rn "useEffect" app --include="*.tsx" --include="*.ts" | \
  grep -E "\[(user|.*),.*\b(carregar|setup|get|obter|adicionar|editar|remover|toggle|marcar|incrementar|resetar|atualizar|registrar)\w+" | \
  grep -v "eslint-disable-next-line" | \
  head -50

echo ""
echo "=== FIM DA VERIFICAÇÃO ==="
