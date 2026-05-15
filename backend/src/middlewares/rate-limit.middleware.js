const rateLimit = require('express-rate-limit');

/**
 * Extrai o IP real do cliente de forma segura.
 * Funciona atrás de proxies confiáveis (Vercel, Railway, Render, Cloudflare).
 * Não permite que o cliente forje o IP via header.
 */
const getRealIp = (req) => {
    // Em produção com proxy confiável, o Express já resolve req.ip corretamente
    // desde que app.set('trust proxy', 1) esteja configurado no server.js.
    // Aqui usamos req.ip como fonte primária e x-forwarded-for apenas como fallback.
    return req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
};

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

/**
 * Login: 8 tentativas / 15 min por IP
 * Reduzido de 10 para dificultar brute-force com rotação lenta de senhas.
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRealIp,
});

/**
 * Registro: 5 contas / hora por IP
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Limite de criação de contas excedido. Tente novamente em 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRealIp,
});

/**
 * Forgot password: 3 pedidos / hora por IP
 * Evita enumeração de emails via timing e abuso de envio de email.
 */
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { error: 'Muitos pedidos de recuperação. Tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRealIp,
});

/**
 * Reset password: 5 tentativas / hora por IP
 * Evita brute-force de tokens de reset.
 */
const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Muitas tentativas de redefinição de senha. Tente novamente em 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRealIp,
});

// ─────────────────────────────────────────────
// CHECKOUT (público — maior risco de abuso)
// ─────────────────────────────────────────────

/**
 * Checkout por IP: 10 tentativas / hora
 * Anti-carding e abuso de processamento de pagamento.
 */
const checkoutLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Muitas tentativas de pagamento. Tente novamente em 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRealIp,
});

/**
 * Checkout por email do comprador: 5 tentativas / hora
 * Mesmo email não pode tentar pagar mais de 5x por hora.
 */
const checkoutEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Muitas tentativas de pagamento para este email. Tente novamente em 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = req.body?.buyer?.email?.toLowerCase().trim() || 'unknown';
        return `email:${email}`;
    },
    skip: (req) => !req.body?.buyer?.email,
});

// ─────────────────────────────────────────────
// BILLING (autenticado — mas ainda precisa de limite)
// ─────────────────────────────────────────────

/**
 * Criação de cobranças PIX: 30 cobranças / hora por usuário autenticado.
 * Usa o ID do usuário como chave (mais preciso que IP para rotas autenticadas).
 * Evita abuso de geração em massa de cobranças.
 */
const billingCreateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: { error: 'Limite de criação de cobranças atingido. Tente novamente em 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Usa ID do usuário autenticado; fallback para IP
        return req.user?.id ? `user:${req.user.id}` : getRealIp(req);
    },
});

// ─────────────────────────────────────────────
// SAQUES (autenticado — operação financeira crítica)
// ─────────────────────────────────────────────

/**
 * Solicitação de saque: 5 saques / hora por usuário.
 * Operação financeira sensível — limite conservador intencional.
 */
const withdrawalLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Limite de solicitações de saque atingido. Tente novamente em 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.id ? `user:${req.user.id}` : getRealIp(req);
    },
});

// ─────────────────────────────────────────────
// LEITURA DE DADOS (dashboard, stats, listagens)
// ─────────────────────────────────────────────

/**
 * Endpoints de leitura autenticados: 120 req / 15 min por usuário.
 * Evita scraping e polling agressivo de dados.
 */
const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    message: { error: 'Muitas requisições. Aguarde alguns minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.id ? `user:${req.user.id}` : getRealIp(req);
    },
});

// ─────────────────────────────────────────────
// ROTAS PÚBLICAS (store, produto público)
// ─────────────────────────────────────────────

/**
 * Rotas públicas de loja/produto: 60 req / 10 min por IP.
 * Evita scraping de catálogo e enumeração de produtos/lojas.
 */
const publicReadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60,
    message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRealIp,
});

module.exports = {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    checkoutLimiter,
    checkoutEmailLimiter,
    billingCreateLimiter,
    withdrawalLimiter,
    readLimiter,
    publicReadLimiter,
};
