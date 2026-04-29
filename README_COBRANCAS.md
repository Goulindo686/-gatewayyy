# 💳 Sistema de Cobranças - Gateway de Pagamentos

## 🎯 O que foi implementado?

Um sistema completo de **cobranças rápidas via PIX** onde usuários podem:

- ✅ Criar cobranças em segundos
- ✅ Gerar QR Code PIX automaticamente
- ✅ Compartilhar PIX Copia e Cola com clientes
- ✅ Receber pagamentos com split automático de taxas
- ✅ Acompanhar estatísticas e histórico completo

---

## 🖼️ Interface

### 📊 Dashboard de Cobranças
```
┌─────────────────────────────────────────────────────────┐
│  Cobranças                                              │
│  Crie cobranças rápidas via PIX                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Total: 15]  [Pendentes: 3]  [Pagas: 12]  [R$ 1.250] │
│                                                         │
│  [+ Nova Cobrança]                                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Descrição    │ Valor  │ Taxa  │ Status │ Ações │  │
│  ├─────────────────────────────────────────────────┤  │
│  │ Serviço X    │ R$ 100 │ R$ 2  │ 🟢 Pago │      │  │
│  │ Consultoria  │ R$ 250 │ R$ 2  │ 🟡 Pend │ [QR] │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 📱 Modal de Criação
```
┌──────────────────────────┐
│  Nova Cobrança          │
├──────────────────────────┤
│                          │
│  Valor (R$)             │
│  [_________]            │
│                          │
│  Descrição (opcional)   │
│  [_________]            │
│                          │
│  ℹ️ Taxa: R$ 1,50       │
│                          │
│  [Cancelar] [Gerar]     │
└──────────────────────────┘
```

### 📲 Modal de Pagamento
```
┌──────────────────────────┐
│  Pagamento via PIX      │
├──────────────────────────┤
│                          │
│     R$ 100,00           │
│                          │
│   ┌──────────────┐      │
│   │  QR CODE     │      │
│   │  ████████    │      │
│   │  ████████    │      │
│   └──────────────┘      │
│                          │
│  PIX Copia e Cola       │
│  [código...] [Copiar]   │
│                          │
│  [Verificar Pagamento]  │
└──────────────────────────┘
```

---

## 🚀 Instalação Rápida

### Passo 1: Banco de Dados
```bash
# Acesse Supabase SQL Editor e execute:
EXECUTAR_MIGRACAO_COBRANCAS.sql
```

### Passo 2: Backend
```bash
cd "GATEWAY/GATEWAY DE PAGAMENTOS/backend"
npm run dev
```

### Passo 3: Frontend
```bash
cd "GATEWAY/GATEWAY DE PAGAMENTOS/frontend"
npm run dev
```

---

## 📋 Fluxo de Uso

```
1. Usuário cria cobrança
   ↓
2. Sistema gera QR Code PIX
   ↓
3. Usuário compartilha com cliente
   ↓
4. Cliente paga via PIX
   ↓
5. Webhook confirma pagamento
   ↓
6. Status atualiza para "Pago"
   ↓
7. Notificação enviada (Telegram)
```

---

## 💰 Sistema de Taxas

### Usuário Normal
```
Cobrança: R$ 100,00
Taxa:     R$   1,50  (fixo)
─────────────────────
Líquido:  R$  98,50
```

### Administrador
```
Cobrança: R$ 100,00
Taxa:     R$   0,00  (sem taxa)
─────────────────────
Líquido:  R$ 100,00
```

---

## 🗂️ Estrutura de Arquivos

```
backend/
├── src/
│   ├── controllers/
│   │   ├── billing.controller.js      ← NOVO
│   │   └── webhook.controller.js      ← MODIFICADO
│   ├── routes/
│   │   └── billing.routes.js          ← NOVO
│   ├── config/
│   │   └── billings_schema.sql        ← NOVO
│   └── server.js                      ← MODIFICADO

frontend/
├── src/
│   └── app/
│       ├── dashboard/
│       │   ├── billings/
│       │   │   └── page.tsx           ← NOVO
│       │   └── layout.tsx             ← MODIFICADO
│       └── admin/
│           └── layout.tsx             ← MODIFICADO
```

---

## 🔌 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/billing/charges` | Criar cobrança |
| GET | `/api/billing/charges` | Listar cobranças |
| GET | `/api/billing/stats` | Estatísticas |
| GET | `/api/billing/charges/:id` | Buscar cobrança |
| PATCH | `/api/billing/charges/:id/cancel` | Cancelar |

---

## 🎨 Recursos Visuais

- ✅ Cards de estatísticas com gradientes
- ✅ Badges coloridos por status
- ✅ QR Code visual integrado
- ✅ Modais responsivos
- ✅ Tabela com histórico completo
- ✅ Botões de ação contextuais
- ✅ Feedback visual (toasts)

---

## 🔒 Segurança

- ✅ Autenticação JWT obrigatória
- ✅ RLS (Row Level Security) no Supabase
- ✅ Validação de valores no backend
- ✅ Políticas de acesso por usuário
- ✅ Webhook com verificação de assinatura

---

## 📊 Banco de Dados

### Tabela: `billings`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| user_id | UUID | Dono da cobrança |
| amount | INTEGER | Valor em centavos |
| fee_amount | INTEGER | Taxa em centavos |
| net_amount | INTEGER | Líquido em centavos |
| description | TEXT | Descrição |
| status | VARCHAR | pending/paid/expired/cancelled |
| pix_qr_code | TEXT | Código PIX |
| pix_qr_code_url | TEXT | URL do QR Code |
| created_at | TIMESTAMP | Data de criação |

---

## 🧪 Testes

### Teste 1: Criar Cobrança
```
1. Login como usuário normal
2. Ir em "Cobranças"
3. Clicar "Nova Cobrança"
4. Digitar R$ 50,00
5. Clicar "Gerar Cobrança"
✅ Deve gerar QR Code
✅ Taxa deve ser R$ 1,50
```

### Teste 2: Criar Cobrança (Admin)
```
1. Login como admin
2. Ir em "Cobranças"
3. Clicar "Nova Cobrança"
4. Digitar R$ 50,00
5. Clicar "Gerar Cobrança"
✅ Deve gerar QR Code
✅ Taxa deve ser R$ 0,00
```

### Teste 3: Pagar Cobrança
```
1. Copiar PIX Copia e Cola
2. Pagar via app bancário (teste)
3. Aguardar webhook
✅ Status deve mudar para "Pago"
✅ Notificação Telegram enviada
```

---

## 📞 Suporte

### Problemas Comuns

**Erro: "Você precisa configurar sua conta de recebimento"**
- Solução: Configure seu recipient no Pagar.me primeiro

**QR Code não aparece**
- Solução: Verifique se o Pagar.me está configurado corretamente

**Pagamento não confirma**
- Solução: Verifique se o webhook está ativo no Pagar.me

---

## 📚 Documentação Completa

- 📄 `SISTEMA_COBRANCAS_IMPLEMENTADO.md` - Documentação técnica completa
- 📄 `GUIA_RAPIDO_COBRANCAS.md` - Guia rápido de uso
- 📄 `EXECUTAR_MIGRACAO_COBRANCAS.sql` - Script de migração

---

## ✅ Status

**🎉 SISTEMA 100% FUNCIONAL E PRONTO PARA USO!**

---

## 🙏 Créditos

Desenvolvido para o Gateway de Pagamentos GouPay
Sistema de cobranças rápidas via PIX com split automático

---

**Versão:** 1.0.0  
**Data:** 2026  
**Licença:** Proprietária
