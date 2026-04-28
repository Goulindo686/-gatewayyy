#!/usr/bin/env node

/**
 * 🔐 GERADOR DE SECRETS SEGUROS
 * 
 * Execute: node generate-secrets.js
 * 
 * Este script gera novos secrets criptograficamente seguros
 * para substituir os que foram expostos no Git.
 */

const crypto = require('crypto');

console.log('\n🔐 GERANDO NOVOS SECRETS SEGUROS\n');
console.log('=' .repeat(60));

// JWT Secret (64 bytes = 128 caracteres hex)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_SECRET (copie e cole no .env e na Vercel):');
console.log(jwtSecret);

// Pagar.me Webhook Secret (32 bytes = 64 caracteres hex)
const pagarmeWebhookSecret = crypto.randomBytes(32).toString('hex');
console.log('\n💳 PAGARME_WEBHOOK_SECRET (copie e cole no .env e na Vercel):');
console.log(pagarmeWebhookSecret);

// Telegram Webhook Secret (32 bytes = 64 caracteres hex)
const telegramWebhookSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📱 TELEGRAM_WEBHOOK_SECRET (copie e cole no .env e na Vercel):');
console.log(telegramWebhookSecret);

console.log('\n' + '='.repeat(60));
console.log('\n✅ SECRETS GERADOS COM SUCESSO!\n');
console.log('⚠️  PRÓXIMOS PASSOS:');
console.log('1. Copie estes valores para um local seguro');
console.log('2. Atualize o arquivo backend/.env');
console.log('3. Atualize as variáveis na Vercel');
console.log('4. Gere novas chaves no Supabase e Pagar.me');
console.log('5. Faça redeploy na Vercel');
console.log('6. Teste o site');
console.log('7. Desative as credenciais antigas');
console.log('8. Limpe o histórico do Git\n');
