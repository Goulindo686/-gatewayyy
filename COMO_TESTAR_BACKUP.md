# 🧪 COMO TESTAR O BACKUP

## ⚠️ O ERRO "NÃO AUTORIZADO" É NORMAL!

Você viu esse erro porque a API precisa da senha (`CRON_SECRET`) para funcionar.

Isso é **SEGURANÇA** - impede que qualquer pessoa rode o backup! ✅

---

## 🔧 COMO TESTAR CORRETAMENTE

### **OPÇÃO 1: Usar cURL (Mais Rápido)**

Abra o terminal e execute:

```bash
curl -X POST https://seu-dominio.vercel.app/api/cron/backup \
  -H "Authorization: Bearer SUA_SENHA_DO_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Substitua:**
- `seu-dominio.vercel.app` → Seu domínio real
- `SUA_SENHA_DO_CRON_SECRET` → A senha que você configurou na Vercel

---

### **OPÇÃO 2: Usar Postman/Insomnia**

1. Abra Postman ou Insomnia
2. Crie nova requisição POST
3. URL: `https://seu-dominio.vercel.app/api/cron/backup`
4. Headers:
   - `Authorization`: `Bearer SUA_SENHA_DO_CRON_SECRET`
   - `Content-Type`: `application/json`
5. Clique em "Send"

---

### **OPÇÃO 3: Usar Script Node.js (Mais Fácil)**

Eu criei um script para você! Execute:

```bash
# 1. Adicionar CRON_SECRET no .env
echo "CRON_SECRET=sua-senha-aqui" >> backend/.env

# 2. Adicionar URL da Vercel no .env
echo "VERCEL_URL=https://seu-dominio.vercel.app" >> backend/.env

# 3. Rodar script de teste
node testar-backup.js
```

---

## 📋 PASSO A PASSO COMPLETO

### **1. Descobrir sua senha CRON_SECRET**

Vá na Vercel:
1. Dashboard > Seu Projeto
2. Settings > Environment Variables
3. Procure por `CRON_SECRET`
4. Copie o valor

### **2. Descobrir seu domínio**

Na Vercel:
1. Dashboard > Seu Projeto
2. Veja o domínio em "Domains"
3. Exemplo: `meu-projeto.vercel.app`

### **3. Testar com cURL**

```bash
curl -X POST https://meu-projeto.vercel.app/api/cron/backup \
  -H "Authorization: Bearer minha-senha-123" \
  -H "Content-Type: application/json"
```

### **4. Resposta Esperada**

```json
{
  "success": true,
  "filename": "backup-2026-04-28.sql",
  "tables": 11,
  "records": 1523,
  "duration": "2.45s",
  "timestamp": "2026-04-28T06:00:00.000Z"
}
```

---

## ✅ VERIFICAR SE FUNCIONOU

1. Vá em: https://supabase.com/dashboard
2. Seu Projeto > Storage > backups
3. Deve aparecer: `backup-2026-04-28.sql`
4. Clique para baixar e verificar

---

## 🔍 SE DER ERRO

### **Erro: "Não autorizado"**
→ CRON_SECRET está errado ou não foi enviado

### **Erro: "Bucket not found"**
→ Você não criou o bucket 'backups' no Supabase

### **Erro: "Storage quota exceeded"**
→ Passou de 1 GB (improvável no início)

### **Erro: "Nenhuma tabela foi copiada"**
→ Problema de conexão com Supabase

---

## 💡 DICA RÁPIDA

Se você não quer usar cURL, pode testar direto na Vercel:

1. Vá em: https://vercel.com/dashboard
2. Seu Projeto > Functions
3. Procure por: `/api/cron/backup`
4. Clique em "Test"
5. Adicione header: `Authorization: Bearer sua-senha`
6. Clique em "Run"

---

## 🎯 PRÓXIMO PASSO

Depois que testar e funcionar:

✅ Aguarde até amanhã às 3h  
✅ Verifique se o backup rodou automaticamente  
✅ Confira novo arquivo no Supabase Storage

---

**Precisa de ajuda para testar?** Me avise! 😊
