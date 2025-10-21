
-- Passo 1: Habilitar a extensão pgsodium no Supabase
-- Vá em: Database > Extensions > Procure por "pgsodium" e habilite

-- Passo 2: Criar uma chave de criptografia
SELECT pgsodium.create_key(name := '020630@Cva');

-- Passo 3: Criar tabela com campo criptografado
CREATE TABLE usuarios_sensiveis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  cpf_encrypted BYTEA,  -- Campo para dados criptografados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passo 4: Criar funções para criptografar/descriptografar
CREATE OR REPLACE FUNCTION encrypt_cpf(cpf TEXT)
RETURNS BYTEA AS $$
  SELECT pgsodium.crypto_aead_det_encrypt(
    cpf::BYTEA,
    NULL::BYTEA,
    (SELECT key FROM pgsodium.valid_key WHERE name = '020630@Cva')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_cpf(cpf_encrypted BYTEA)
RETURNS TEXT AS $$
  SELECT convert_from(
    pgsodium.crypto_aead_det_decrypt(
      cpf_encrypted,
      NULL::BYTEA,
      (SELECT key FROM pgsodium.valid_key WHERE name = '020630@Cva')
    ),
    'UTF8'
  );
$$ LANGUAGE SQL SECURITY DEFINER