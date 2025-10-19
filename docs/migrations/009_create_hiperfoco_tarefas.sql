-- Migration: Create hiperfoco_tarefas table
-- Description: Creates table to store tasks and subtasks for hiperfocos
-- Date: 2025-10-19

-- Create hiperfoco_tarefas table
CREATE TABLE IF NOT EXISTS public.hiperfoco_tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hiperfoco_id UUID NOT NULL REFERENCES public.hiperfocos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    texto TEXT NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    tarefa_pai_id UUID NULL REFERENCES public.hiperfoco_tarefas(id) ON DELETE CASCADE,
    ordem INTEGER DEFAULT 0,
    cor TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hiperfoco_tarefas_hiperfoco_id ON public.hiperfoco_tarefas(hiperfoco_id);
CREATE INDEX IF NOT EXISTS idx_hiperfoco_tarefas_user_id ON public.hiperfoco_tarefas(user_id);
CREATE INDEX IF NOT EXISTS idx_hiperfoco_tarefas_tarefa_pai_id ON public.hiperfoco_tarefas(tarefa_pai_id);

-- Enable Row Level Security
ALTER TABLE public.hiperfoco_tarefas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view their own tasks
CREATE POLICY "Users can view their own hiperfoco tasks"
    ON public.hiperfoco_tarefas
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own hiperfoco tasks"
    ON public.hiperfoco_tarefas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tasks
CREATE POLICY "Users can update their own hiperfoco tasks"
    ON public.hiperfoco_tarefas
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own hiperfoco tasks"
    ON public.hiperfoco_tarefas
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_hiperfoco_tarefas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_hiperfoco_tarefas_updated_at
    BEFORE UPDATE ON public.hiperfoco_tarefas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_hiperfoco_tarefas_updated_at();

-- Grant permissions
GRANT ALL ON public.hiperfoco_tarefas TO authenticated;
GRANT ALL ON public.hiperfoco_tarefas TO service_role;

-- Add comment to table
COMMENT ON TABLE public.hiperfoco_tarefas IS 'Stores tasks and subtasks for hiperfocos. Subtasks reference a parent task via tarefa_pai_id.';
