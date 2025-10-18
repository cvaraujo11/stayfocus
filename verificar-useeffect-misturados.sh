#!/bin/bash

echo "🔍 Procurando useEffect com carregamento e sync misturados..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

problemas=0

# Função para verificar um arquivo
verificar_arquivo() {
    local arquivo=$1
    local conteudo=$(cat "$arquivo")
    
    # Procurar por useEffect que tem tanto carregar quanto setupRealtimeSync
    if echo "$conteudo" | grep -Pzo '(?s)useEffect\(\(\) => \{[^}]*if \(user\) \{[^}]*carregar[^}]*setupRealtimeSync[^}]*return cleanup[^}]*\}[^}]*\}, \[user\]\)' > /dev/null 2>&1; then
        echo -e "${RED}✗${NC} $arquivo - useEffect misturado (carregar + sync)"
        ((problemas++))
        return 1
    fi
    
    return 0
}

# Verificar arquivos específicos que foram corrigidos
echo "Verificando arquivos corrigidos:"
echo ""

arquivos_corrigidos=(
    "app/components/estudos/TemporizadorPomodoro.tsx"
    "app/hiperfocos/page.tsx"
    "app/receitas/page.tsx"
)

for arquivo in "${arquivos_corrigidos[@]}"; do
    if [ -f "$arquivo" ]; then
        if verificar_arquivo "$arquivo"; then
            echo -e "${GREEN}✓${NC} $arquivo - OK"
        fi
    fi
done

echo ""
echo "Verificando outros arquivos que podem ter o problema:"
echo ""

# Procurar em todos os arquivos .tsx
while IFS= read -r arquivo; do
    # Pular arquivos já verificados
    skip=false
    for corrigido in "${arquivos_corrigidos[@]}"; do
        if [ "$arquivo" = "$corrigido" ]; then
            skip=true
            break
        fi
    done
    
    if [ "$skip" = false ]; then
        # Verificar se o arquivo tem setupRealtimeSync
        if grep -q "setupRealtimeSync" "$arquivo"; then
            # Verificar se tem padrão problemático
            if grep -Pzo '(?s)useEffect.*\{.*if.*user.*\{.*carregar.*setupRealtimeSync.*return cleanup' "$arquivo" > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠${NC}  $arquivo - Possível problema (verificar manualmente)"
                ((problemas++))
            fi
        fi
    fi
done < <(find app -name "*.tsx" -type f)

echo ""
if [ $problemas -eq 0 ]; then
    echo -e "${GREEN}✓ Nenhum problema encontrado!${NC}"
else
    echo -e "${YELLOW}⚠ $problemas arquivo(s) com possíveis problemas${NC}"
fi
