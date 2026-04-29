-- Tabela de cobranças
CREATE TABLE IF NOT EXISTS billings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- valor em centavos
    fee_amount INTEGER DEFAULT 0, -- taxa da plataforma em centavos
    net_amount INTEGER NOT NULL, -- valor líquido para o vendedor em centavos
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, expired, cancelled
    pagarme_order_id VARCHAR(255),
    pagarme_charge_id VARCHAR(255),
    pix_qr_code TEXT,
    pix_qr_code_url TEXT,
    pix_expires_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_billings_user_id ON billings(user_id);
CREATE INDEX IF NOT EXISTS idx_billings_status ON billings(status);
CREATE INDEX IF NOT EXISTS idx_billings_created_at ON billings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billings_pagarme_order_id ON billings(pagarme_order_id);

-- RLS (Row Level Security)
ALTER TABLE billings ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas suas próprias cobranças
CREATE POLICY "Users can view own billings"
    ON billings FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Usuários podem criar suas próprias cobranças
CREATE POLICY "Users can create own billings"
    ON billings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias cobranças
CREATE POLICY "Users can update own billings"
    ON billings FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Admins podem ver todas as cobranças
CREATE POLICY "Admins can view all billings"
    ON billings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_billings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_billings_updated_at
    BEFORE UPDATE ON billings
    FOR EACH ROW
    EXECUTE FUNCTION update_billings_updated_at();

-- Comentários
COMMENT ON TABLE billings IS 'Tabela de cobranças rápidas via PIX';
COMMENT ON COLUMN billings.amount IS 'Valor total da cobrança em centavos';
COMMENT ON COLUMN billings.fee_amount IS 'Taxa da plataforma em centavos (R$1,50 fixo para não-admins)';
COMMENT ON COLUMN billings.net_amount IS 'Valor líquido que o vendedor receberá em centavos';
COMMENT ON COLUMN billings.status IS 'Status da cobrança: pending, paid, expired, cancelled';
