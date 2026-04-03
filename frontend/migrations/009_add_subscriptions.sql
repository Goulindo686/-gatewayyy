-- Planos de assinatura criados pelos vendedores
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL, -- em centavos
    interval TEXT NOT NULL DEFAULT 'monthly', -- monthly, weekly, yearly
    interval_count INTEGER NOT NULL DEFAULT 1,
    pagarme_plan_id TEXT, -- ID do plano no Pagar.me
    status TEXT NOT NULL DEFAULT 'active', -- active, inactive
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assinaturas dos clientes
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id),
    subscription_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    pagarme_subscription_id TEXT UNIQUE,
    pagarme_plan_id TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_cpf TEXT,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, canceled, past_due
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_user_id ON subscription_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_seller_id ON subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_pagarme_id ON subscriptions(pagarme_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(customer_email);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_plans_own" ON subscription_plans FOR ALL
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "subscription_plans_public_read" ON subscription_plans FOR SELECT
USING (status = 'active');

CREATE POLICY "subscriptions_own" ON subscriptions FOR ALL
USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());
