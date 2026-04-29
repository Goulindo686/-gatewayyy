# 🚀 Guia Rápido - Sistema de Cobranças

## 📦 Instalação (3 passos)

### 1️⃣ Executar Migração do Banco de Dados

Acesse o **Supabase SQL Editor** e execute:

```sql
-- Copie e cole todo o conteúdo do arquivo:
EXECUTAR_MIGRACAO_COBRANCAS.sql
```

### 2️⃣ Reiniciar o Backend

```bash
cd "GATEWAY/GATEWAY DE PAGAMENTOS/backend"
npm run dev
```

### 3️⃣ Reiniciar o Frontend

```bash
cd "GATEWAY/GATEWAY DE PAGAMENTOS/frontend"
npm run dev
```

## ✅ Pronto! O sistema já está funcionando!

---

## 💡 Como Usar

### Para Criar uma Cobrança:

1. Acesse o dashboard
2. Clique em **"Cobranças"** no menu lateral
3. Clique no botão **"Nova Cobrança"**
4. Digite o valor (ex: 50.00)
5. Adicione uma descrição (opcional)
6. Clique em **"Gerar Cobrança"**
7. O QR Code PIX será gerado automaticamente!

### Para Compartilhar com Cliente:

1. Copie o **PIX Copia e Cola** (botão de copiar)
2. Envie para seu cliente via WhatsApp, Email, etc.
3. Ou mostre o **QR Code** para o cliente escanear

### Para Verificar Pagamento:

1. Clique em **"Ver QR Code"** na cobrança pendente
2. Clique em **"Verificar Pagamento"**
3. Quando o cliente pagar, o status mudará para **"Pago"** automaticamente!

---

## 💰 Taxas

| Tipo de Usuário | Taxa por Cobrança Paga |
|-----------------|------------------------|
| **Usuário Normal** | R$ 1,50 fixo |
| **Administrador** | R$ 0,00 (sem taxa) |

---

## 📊 Estatísticas Disponíveis

- ✅ Total de cobranças criadas
- ✅ Cobranças pendentes
- ✅ Cobranças pagas
- ✅ Total recebido (em R$)

---

## 🎯 Status das Cobranças

| Status | Descrição |
|--------|-----------|
| 🟡 **Pendente** | Aguardando pagamento do cliente |
| 🟢 **Pago** | Pagamento confirmado! |
| 🔴 **Expirado** | PIX expirou (24h) |
| ⚫ **Cancelado** | Cobrança cancelada manualmente |

---

## 🔔 Notificações

Você receberá notificação via **Telegram** quando uma cobrança for paga!

---

## ❓ Perguntas Frequentes

### Quanto tempo o PIX fica válido?
**24 horas** (1 dia)

### Posso cancelar uma cobrança?
Sim, mas apenas cobranças **pendentes**

### O cliente precisa ter conta?
Não! Qualquer pessoa pode pagar via PIX

### Quando recebo o dinheiro?
Imediatamente após a confirmação do pagamento pelo Pagar.me

### Posso criar cobranças ilimitadas?
Sim! Não há limite de cobranças

---

## 🆘 Suporte

Se tiver problemas:
1. Verifique se o webhook do Pagar.me está configurado
2. Confirme que você tem um recipient ativo
3. Verifique os logs do backend para erros

---

## 🎉 Aproveite o Sistema de Cobranças!

Agora você pode receber pagamentos de forma rápida e fácil! 🚀
