-- ==========================================
-- Storage: Configurar políticas de acesso para bucket user-photos
-- Data: 19 de outubro de 2025
-- Descrição: Implementar RLS no Storage para proteger fotos dos usuários
-- ==========================================

-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;

-- Policy para INSERT (upload)
CREATE POLICY "Users can upload their own photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy para SELECT (visualizar)
CREATE POLICY "Users can view their own photos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy para DELETE (remover)
CREATE POLICY "Users can delete their own photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy para UPDATE (sobrescrever)
CREATE POLICY "Users can update their own photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Configurar bucket settings
UPDATE storage.buckets
SET 
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
WHERE id = 'user-photos';
