-- Rollback Migration: Drop hiperfoco_tarefas table
-- Description: Removes the hiperfoco_tarefas table and related objects
-- Date: 2025-10-19

-- Drop trigger
DROP TRIGGER IF EXISTS update_hiperfoco_tarefas_updated_at ON public.hiperfoco_tarefas;

-- Drop function
DROP FUNCTION IF EXISTS public.update_hiperfoco_tarefas_updated_at();

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own hiperfoco tasks" ON public.hiperfoco_tarefas;
DROP POLICY IF EXISTS "Users can insert their own hiperfoco tasks" ON public.hiperfoco_tarefas;
DROP POLICY IF EXISTS "Users can update their own hiperfoco tasks" ON public.hiperfoco_tarefas;
DROP POLICY IF EXISTS "Users can delete their own hiperfoco tasks" ON public.hiperfoco_tarefas;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_hiperfoco_tarefas_hiperfoco_id;
DROP INDEX IF EXISTS public.idx_hiperfoco_tarefas_user_id;
DROP INDEX IF EXISTS public.idx_hiperfoco_tarefas_tarefa_pai_id;

-- Drop table
DROP TABLE IF EXISTS public.hiperfoco_tarefas CASCADE;
