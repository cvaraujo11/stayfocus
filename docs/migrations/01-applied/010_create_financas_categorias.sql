-- =====================================================
-- Migration: 010 - Criar Categorias de Finanças
-- Descrição: Cria a tabela de categorias e insere categorias padrão
-- Data: 19/10/2025
-- =====================================================

-- ======================================
-- 1. CRIAR TABELA financas_categorias
-- ======================================

-- Verificar se a tabela já existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'financas_categorias'
    ) THEN
        CREATE TABLE public.financas_categorias (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            nome TEXT NOT NULL,
            cor TEXT NOT NULL,
            icone TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            
            -- Constraints
            CONSTRAINT nome_minimo CHECK (char_length(nome) >= 1),
            CONSTRAINT nome_maximo CHECK (char_length(nome) <= 50)
        );

        -- Índices para performance
        CREATE INDEX idx_financas_categorias_user_id ON public.financas_categorias(user_id);
        CREATE INDEX idx_financas_categorias_created_at ON public.financas_categorias(created_at);

        -- Comentários
        COMMENT ON TABLE public.financas_categorias IS 'Categorias de despesas e receitas para controle financeiro';
        COMMENT ON COLUMN public.financas_categorias.id IS 'Identificador único da categoria';
        COMMENT ON COLUMN public.financas_categorias.user_id IS 'Referência ao usuário proprietário da categoria';
        COMMENT ON COLUMN public.financas_categorias.nome IS 'Nome da categoria (ex: Alimentação, Transporte)';
        COMMENT ON COLUMN public.financas_categorias.cor IS 'Cor em hexadecimal para identificação visual (ex: #FF5733)';
        COMMENT ON COLUMN public.financas_categorias.icone IS 'Identificador do ícone da categoria (ex: shopping-cart, home)';
        
        RAISE NOTICE 'Tabela financas_categorias criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela financas_categorias já existe, pulando criação.';
    END IF;
END $$;

-- ======================================
-- 2. CONFIGURAR RLS (Row Level Security)
-- ======================================

-- Habilitar RLS
ALTER TABLE public.financas_categorias ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem visualizar apenas suas próprias categorias
DROP POLICY IF EXISTS "Usuários podem visualizar suas categorias" ON public.financas_categorias;
CREATE POLICY "Usuários podem visualizar suas categorias"
    ON public.financas_categorias
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias categorias
DROP POLICY IF EXISTS "Usuários podem inserir suas categorias" ON public.financas_categorias;
CREATE POLICY "Usuários podem inserir suas categorias"
    ON public.financas_categorias
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias categorias
DROP POLICY IF EXISTS "Usuários podem atualizar suas categorias" ON public.financas_categorias;
CREATE POLICY "Usuários podem atualizar suas categorias"
    ON public.financas_categorias
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias categorias
DROP POLICY IF EXISTS "Usuários podem deletar suas categorias" ON public.financas_categorias;
CREATE POLICY "Usuários podem deletar suas categorias"
    ON public.financas_categorias
    FOR DELETE
    USING (auth.uid() = user_id);

-- ======================================
-- 3. FUNÇÃO PARA CRIAR CATEGORIAS PADRÃO
-- ======================================

-- Criar função que insere categorias padrão para um novo usuário
CREATE OR REPLACE FUNCTION public.criar_categorias_financas_padrao(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o usuário já tem categorias
    IF NOT EXISTS (
        SELECT 1 FROM public.financas_categorias 
        WHERE user_id = p_user_id
    ) THEN
        -- Inserir categorias padrão
        INSERT INTO public.financas_categorias (user_id, nome, cor, icone) VALUES
            (p_user_id, 'Alimentação', '#FF6B6B', 'utensils'),
            (p_user_id, 'Transporte', '#4ECDC4', 'car'),
            (p_user_id, 'Moradia', '#45B7D1', 'home'),
            (p_user_id, 'Saúde', '#96CEB4', 'heart'),
            (p_user_id, 'Lazer', '#FFEAA7', 'music'),
            (p_user_id, 'Compras', '#DFE6E9', 'shopping-cart'),
            (p_user_id, 'Educação', '#74B9FF', 'book'),
            (p_user_id, 'Outros', '#B2BEC3', 'more-horizontal');
        
        RAISE NOTICE 'Categorias padrão criadas para o usuário: %', p_user_id;
    ELSE
        RAISE NOTICE 'Usuário % já possui categorias', p_user_id;
    END IF;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.criar_categorias_financas_padrao IS 'Cria categorias financeiras padrão para um novo usuário';

-- ======================================
-- 4. TRIGGER PARA CRIAR CATEGORIAS AUTOMATICAMENTE
-- ======================================

-- Função de trigger que cria categorias quando um novo usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user_financas_categorias()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Criar categorias padrão para o novo usuário
    PERFORM public.criar_categorias_financas_padrao(NEW.id);
    RETURN NEW;
END;
$$;

-- Criar o trigger (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created_financas_categorias ON auth.users;
CREATE TRIGGER on_auth_user_created_financas_categorias
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_financas_categorias();

-- ======================================
-- 5. CRIAR CATEGORIAS PARA USUÁRIOS EXISTENTES
-- ======================================

-- Criar categorias para todos os usuários existentes que ainda não têm categorias
DO $$
DECLARE
    user_record RECORD;
    contador INTEGER := 0;
BEGIN
    FOR user_record IN 
        SELECT id 
        FROM auth.users 
        WHERE id NOT IN (
            SELECT DISTINCT user_id 
            FROM public.financas_categorias
        )
    LOOP
        PERFORM public.criar_categorias_financas_padrao(user_record.id);
        contador := contador + 1;
    END LOOP;
    
    RAISE NOTICE 'Categorias criadas para % usuários existentes', contador;
END $$;

-- ======================================
-- 6. GRANTS DE PERMISSÃO
-- ======================================

-- Conceder permissões necessárias
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financas_categorias TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

-- Verificação final
DO $$
DECLARE
    total_categorias INTEGER;
    total_usuarios_com_categorias INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_categorias FROM public.financas_categorias;
    SELECT COUNT(DISTINCT user_id) INTO total_usuarios_com_categorias FROM public.financas_categorias;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 010 executada com sucesso!';
    RAISE NOTICE 'Total de categorias criadas: %', total_categorias;
    RAISE NOTICE 'Total de usuários com categorias: %', total_usuarios_com_categorias;
    RAISE NOTICE '========================================';
END $$;
