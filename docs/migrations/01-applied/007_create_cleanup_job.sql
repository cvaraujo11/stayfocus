-- ==========================================
-- Job: Limpeza automática de fotos órfãs no Storage
-- Data: 19 de outubro de 2025
-- Descrição: Remove fotos do Storage que não têm registro correspondente no banco
-- ==========================================

-- Criar função para limpar fotos órfãs
CREATE OR REPLACE FUNCTION cleanup_orphaned_photos()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  photo_record RECORD;
BEGIN
  -- Iterar sobre todas as fotos no bucket user-photos
  FOR photo_record IN 
    SELECT name 
    FROM storage.objects 
    WHERE bucket_id = 'user-photos'
  LOOP
    -- Verificar se existe registro correspondente
    IF NOT EXISTS (
      SELECT 1 
      FROM alimentacao_refeicoes 
      WHERE foto_url LIKE '%' || photo_record.name || '%'
    ) THEN
      -- Deletar foto órfã
      DELETE FROM storage.objects 
      WHERE bucket_id = 'user-photos' 
      AND name = photo_record.name;
      
      deleted_count := deleted_count + 1;
    END IF;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar extensão pg_cron se não existir (necessário para jobs agendados)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar job para rodar semanalmente (todo domingo às 3h da manhã)
-- Nota: Descomentar a linha abaixo após verificar se pg_cron está disponível
-- SELECT cron.schedule('cleanup-orphaned-photos', '0 3 * * 0', 'SELECT cleanup_orphaned_photos();');

-- Comentário sobre o job
COMMENT ON FUNCTION cleanup_orphaned_photos() IS 'Remove fotos do Storage sem registro correspondente no banco de dados';

-- Para executar manualmente:
-- SELECT cleanup_orphaned_photos();
