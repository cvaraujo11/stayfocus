#!/bin/bash

# Security Check Script
# Run this before deploying to production

echo "🔒 Running Security Checks..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Environment variables
echo "1️⃣  Checking environment variables..."
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env.local file exists${NC}"
    
    # Check for required variables
    required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SESSION_SECRET")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env.local; then
            echo -e "${RED}❌ Missing required variable: ${var}${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
    
    # Check SESSION_SECRET length
    if grep -q "^SESSION_SECRET=" .env.local; then
        secret_length=$(grep "^SESSION_SECRET=" .env.local | cut -d'=' -f2 | tr -d '\n' | wc -c)
        if [ "$secret_length" -lt 32 ]; then
            echo -e "${YELLOW}⚠️  SESSION_SECRET should be at least 32 characters${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
fi
echo ""

# Check 2: Dependencies vulnerabilities
echo "2️⃣  Checking for vulnerable dependencies..."
if command -v npm &> /dev/null; then
    npm audit --audit-level=high > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ No high-severity vulnerabilities found${NC}"
    else
        echo -e "${RED}❌ Vulnerabilities found. Run 'npm audit' for details${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  npm not found, skipping dependency check${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 3: Sensitive files in Git
echo "3️⃣  Checking for sensitive files in Git..."
sensitive_files=(".env.local" ".env" "*.pem" "*.key")
found_sensitive=false
for pattern in "${sensitive_files[@]}"; do
    if git ls-files | grep -q "$pattern"; then
        echo -e "${RED}❌ Sensitive file found in Git: ${pattern}${NC}"
        ERRORS=$((ERRORS + 1))
        found_sensitive=true
    fi
done
if [ "$found_sensitive" = false ]; then
    echo -e "${GREEN}✅ No sensitive files in Git${NC}"
fi
echo ""

# Check 4: TypeScript errors
echo "4️⃣  Checking TypeScript..."
if command -v npm &> /dev/null; then
    npm run typecheck > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ No TypeScript errors${NC}"
    else
        echo -e "${RED}❌ TypeScript errors found. Run 'npm run typecheck'${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  npm not found, skipping TypeScript check${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 5: Security headers in next.config.js
echo "5️⃣  Checking security headers..."
if [ -f next.config.js ]; then
    if grep -q "X-Frame-Options" next.config.js && \
       grep -q "X-Content-Type-Options" next.config.js && \
       grep -q "Strict-Transport-Security" next.config.js; then
        echo -e "${GREEN}✅ Security headers configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Some security headers may be missing${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌ next.config.js not found${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 6: HTTPS in production
echo "6️⃣  Checking production URL..."
if [ -f .env.local ]; then
    base_url=$(grep "^NEXT_PUBLIC_BASE_URL=" .env.local | cut -d'=' -f2)
    if [[ $base_url == https://* ]]; then
        echo -e "${GREEN}✅ Production URL uses HTTPS${NC}"
    else
        echo -e "${YELLOW}⚠️  Production URL should use HTTPS${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Security Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} warning(s) found${NC}"
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} error(s) and ${WARNINGS} warning(s) found${NC}"
    echo ""
    echo "Please fix the errors before deploying to production."
    exit 1
fi
