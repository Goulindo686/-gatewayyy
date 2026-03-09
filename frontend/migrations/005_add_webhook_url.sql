-- Adiciona coluna webhook_url na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Adiciona comentário explicativo
COMMENT ON COLUMN users.webhook_url IS 'URL do Webhook para notificar o usuário sobre vendas (aprovadas/recusadas)';
