# 📡 Exemplos de Uso - API de Cobranças

## 🔑 Autenticação

Todas as requisições precisam do token JWT no header:

```bash
Authorization: Bearer SEU_TOKEN_JWT_AQUI
```

---

## 1️⃣ Criar Nova Cobrança

### Request
```bash
POST http://localhost:3001/api/billing/charges
Content-Type: application/json
Authorization: Bearer SEU_TOKEN

{
  "amount": 50.00,
  "description": "Pagamento de consultoria"
}
```

### Response (201 Created)
```json
{
  "billing": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 5000,
    "amount_display": "50.00",
    "fee_amount": 150,
    "fee_display": "1.50",
    "net_amount": 4850,
    "net_display": "48.50",
    "description": "Pagamento de consultoria",
    "status": "pending",
    "pix_qr_code": "00020126580014br.gov.bcb.pix...",
    "pix_qr_code_url": "https://api.pagar.me/...",
    "pix_expires_at": "2026-04-30T12:00:00Z",
    "created_at": "2026-04-29T12:00:00Z"
  }
}
```

### Exemplo com cURL
```bash
curl -X POST http://localhost:3001/api/billing/charges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "amount": 50.00,
    "description": "Pagamento de consultoria"
  }'
```

### Exemplo com JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:3001/api/billing/charges', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 50.00,
    description: 'Pagamento de consultoria'
  })
});

const data = await response.json();
console.log('QR Code:', data.billing.pix_qr_code);
```

---

## 2️⃣ Listar Cobranças

### Request
```bash
GET http://localhost:3001/api/billing/charges
Authorization: Bearer SEU_TOKEN
```

### Com Filtros
```bash
GET http://localhost:3001/api/billing/charges?status=pending&limit=10&offset=0
Authorization: Bearer SEU_TOKEN
```

### Response (200 OK)
```json
{
  "billings": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "amount": 5000,
      "amount_display": "50.00",
      "fee_amount": 150,
      "fee_display": "1.50",
      "net_amount": 4850,
      "net_display": "48.50",
      "description": "Pagamento de consultoria",
      "status": "pending",
      "pix_qr_code": "00020126580014br.gov.bcb.pix...",
      "pix_qr_code_url": "https://api.pagar.me/...",
      "created_at": "2026-04-29T12:00:00Z"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

### Exemplo com cURL
```bash
curl -X GET "http://localhost:3001/api/billing/charges?status=pending" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 3️⃣ Buscar Estatísticas

### Request
```bash
GET http://localhost:3001/api/billing/stats
Authorization: Bearer SEU_TOKEN
```

### Response (200 OK)
```json
{
  "stats": {
    "total_billings": 15,
    "pending": 3,
    "paid": 10,
    "expired": 1,
    "cancelled": 1,
    "total_amount": 150000,
    "total_paid": 100000,
    "total_fees": 1500,
    "total_net": 98500,
    "total_amount_display": "1500.00",
    "total_paid_display": "1000.00",
    "total_fees_display": "15.00",
    "total_net_display": "985.00"
  }
}
```

### Exemplo com cURL
```bash
curl -X GET http://localhost:3001/api/billing/stats \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 4️⃣ Buscar Cobrança Específica

### Request
```bash
GET http://localhost:3001/api/billing/charges/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer SEU_TOKEN
```

### Response (200 OK)
```json
{
  "billing": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-uuid",
    "amount": 5000,
    "amount_display": "50.00",
    "fee_amount": 150,
    "fee_display": "1.50",
    "net_amount": 4850,
    "net_display": "48.50",
    "description": "Pagamento de consultoria",
    "status": "pending",
    "pix_qr_code": "00020126580014br.gov.bcb.pix...",
    "pix_qr_code_url": "https://api.pagar.me/...",
    "pix_expires_at": "2026-04-30T12:00:00Z",
    "paid_at": null,
    "created_at": "2026-04-29T12:00:00Z",
    "updated_at": "2026-04-29T12:00:00Z"
  }
}
```

### Exemplo com cURL
```bash
curl -X GET http://localhost:3001/api/billing/charges/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 5️⃣ Cancelar Cobrança

### Request
```bash
PATCH http://localhost:3001/api/billing/charges/123e4567-e89b-12d3-a456-426614174000/cancel
Authorization: Bearer SEU_TOKEN
```

### Response (200 OK)
```json
{
  "message": "Cobrança cancelada com sucesso."
}
```

### Response (400 Bad Request) - Se já foi paga
```json
{
  "error": "Apenas cobranças pendentes podem ser canceladas."
}
```

### Exemplo com cURL
```bash
curl -X PATCH http://localhost:3001/api/billing/charges/123e4567-e89b-12d3-a456-426614174000/cancel \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🔴 Erros Comuns

### 401 Unauthorized
```json
{
  "error": "Token inválido ou expirado."
}
```
**Solução:** Fazer login novamente e obter novo token

### 400 Bad Request - Valor Inválido
```json
{
  "error": "Valor inválido."
}
```
**Solução:** Enviar valor maior que 0

### 400 Bad Request - Sem Recipient
```json
{
  "error": "Você precisa configurar sua conta de recebimento primeiro."
}
```
**Solução:** Configurar recipient no Pagar.me

### 403 Forbidden - Conta Bloqueada
```json
{
  "error": "Sua conta está bloqueada."
}
```
**Solução:** Contatar administrador

### 404 Not Found
```json
{
  "error": "Cobrança não encontrada."
}
```
**Solução:** Verificar ID da cobrança

---

## 📊 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Cobrança criada |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Não encontrado |
| 500 | Internal Server Error - Erro no servidor |

---

## 🧪 Testando com Postman

### 1. Criar Collection
```
Nome: Gateway - Cobranças
Base URL: http://localhost:3001/api/billing
```

### 2. Configurar Variáveis
```
token: SEU_TOKEN_JWT
baseUrl: http://localhost:3001/api/billing
```

### 3. Criar Requests

**Criar Cobrança:**
- Method: POST
- URL: {{baseUrl}}/charges
- Headers: Authorization: Bearer {{token}}
- Body (JSON):
```json
{
  "amount": 50.00,
  "description": "Teste Postman"
}
```

**Listar Cobranças:**
- Method: GET
- URL: {{baseUrl}}/charges
- Headers: Authorization: Bearer {{token}}

**Estatísticas:**
- Method: GET
- URL: {{baseUrl}}/stats
- Headers: Authorization: Bearer {{token}}

---

## 🔄 Webhook (Pagar.me → Backend)

### Endpoint
```
POST https://seu-dominio.com/api/webhooks/pagarme
```

### Payload (Cobrança Paga)
```json
{
  "type": "charge.paid",
  "data": {
    "id": "ch_abc123",
    "status": "paid",
    "amount": 5000,
    "customer": {
      "name": "Cliente Teste"
    },
    "last_transaction": {
      "qr_code": "00020126580014br.gov.bcb.pix...",
      "qr_code_url": "https://..."
    }
  }
}
```

### Processamento
1. Backend recebe webhook
2. Busca cobrança pelo `pagarme_charge_id`
3. Atualiza status para "paid"
4. Cria transações
5. Envia notificação

---

## 💡 Dicas de Integração

### React/Next.js
```typescript
// lib/billing.ts
export const billingAPI = {
  async create(amount: number, description?: string) {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/billing/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount, description })
    });
    return response.json();
  },

  async list(status?: string) {
    const token = localStorage.getItem('token');
    const url = status 
      ? `/api/billing/charges?status=${status}`
      : '/api/billing/charges';
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async stats() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/billing/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

### Node.js
```javascript
const axios = require('axios');

const billingAPI = axios.create({
  baseURL: 'http://localhost:3001/api/billing',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Criar cobrança
const { data } = await billingAPI.post('/charges', {
  amount: 50.00,
  description: 'Teste'
});

// Listar cobranças
const { data: billings } = await billingAPI.get('/charges');

// Estatísticas
const { data: stats } = await billingAPI.get('/stats');
```

---

## 🎯 Fluxo Completo de Integração

```javascript
// 1. Criar cobrança
const billing = await billingAPI.create(100.00, 'Serviço X');

// 2. Exibir QR Code para cliente
showQRCode(billing.pix_qr_code_url);
showPixCode(billing.pix_qr_code);

// 3. Polling para verificar pagamento (opcional)
const checkPayment = setInterval(async () => {
  const { billing: updated } = await billingAPI.get(billing.id);
  if (updated.status === 'paid') {
    clearInterval(checkPayment);
    showSuccess('Pagamento confirmado!');
  }
}, 5000); // Verifica a cada 5 segundos

// 4. Ou aguardar webhook (recomendado)
// O webhook atualiza automaticamente
```

---

## 📚 Referências

- [Documentação Pagar.me](https://docs.pagar.me/)
- [Documentação PIX](https://www.bcb.gov.br/estabilidadefinanceira/pix)
- [JWT Authentication](https://jwt.io/)

---

**Versão da API:** 1.0.0  
**Última Atualização:** Abril 2026
