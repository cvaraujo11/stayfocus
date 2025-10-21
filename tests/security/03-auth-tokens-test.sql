-- ============================================
-- TESTE 3: Verificação de Tokens e Sessões
-- ============================================
-- Objetivo: Analisar estado de autenticação
-- Data: 2025-10-19

-- Verificar usuários ativos
SELECT 
    id,
    email,
    created_at,
    confirmed_at,
    last_sign_in_at,
    CASE 
        WHEN banned_until IS NOT NULL THEN 'BANNED'
        WHEN deleted_at IS NOT NULL THEN 'DELETED'
        WHEN confirmed_at IS NULL THEN 'UNCONFIRMED'
        ELSE 'ACTIVE'
    END as status
FROM auth.users
ORDER BY created_at DESC;

-- Verificar sessões ativas
SELECT 
    user_id,
    created_at,
    updated_at,
    NOT_AFTER as expires_at,
    CASE 
        WHEN NOT_AFTER < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as session_status
FROM auth.sessions
ORDER BY created_at DESC;

-- Verificar refresh tokens
SELECT 
    user_id,
    created_at,
    updated_at,
    revoked,
    CASE 
        WHEN revoked THEN 'REVOKED'
        ELSE 'ACTIVE'
    END as token_status
FROM auth.refresh_tokens
ORDER BY created_at DESC
LIMIT 10;

-- Estatísticas de autenticação
SELECT 
    'Total Usuários' as metrica,
    COUNT(*) as valor
FROM auth.users
UNION ALL
SELECT 
    'Sessões Ativas' as metrica,
    COUNT(*) as valor
FROM auth.sessions
WHERE NOT_AFTER > NOW()
UNION ALL
SELECT 
    'Tokens Revogados' as metrica,
    COUNT(*) as valor
FROM auth.refresh_tokens
WHERE revoked = true;
