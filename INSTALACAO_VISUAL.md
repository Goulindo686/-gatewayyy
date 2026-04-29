# 🎨 Guia Visual de Instalação - Sistema de Cobranças

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:
- ✅ Node.js instalado
- ✅ Acesso ao Supabase
- ✅ Conta no Pagar.me configurada
- ✅ Backend e Frontend já funcionando

---

## 🚀 Instalação em 3 Passos

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  PASSO 1: Banco de Dados (Supabase)                   │
│  ⏱️  Tempo: 2 minutos                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1️⃣ Acessar Supabase SQL Editor

1. Abra o navegador
2. Acesse: https://app.supabase.com
3. Selecione seu projeto
4. Clique em **"SQL Editor"** no menu lateral

```
┌──────────────────────────────────────┐
│  Supabase Dashboard                  │
├──────────────────────────────────────┤
│  > Home                              │
│  > Table Editor                      │
│  > SQL Editor  ← CLIQUE AQUI        │
│  > Database                          │
│  > Authentication                    │
└──────────────────────────────────────┘
```

### 2️⃣ Executar Script SQL

1. Clique em **"+ New query"**
2. Abra o arquivo: `EXECUTAR_MIGRACAO_COBRANCAS.sql`
3. Copie TODO o conteúdo
4. Cole no editor SQL
5. Clique em **"Run"** (ou pressione Ctrl+Enter)

```
┌──────────────────────────────────────────────┐
│  SQL Editor                                  │
├──────────────────────────────────────────────┤
│  [+ New query]  [Run ▶]  [Format]           │
├──────────────────────────────────────────────┤
│                                              │
│  -- Cole o script aqui                      │
│  CREATE TABLE IF NOT EXISTS billings (      │
│    id UUID PRIMARY KEY...                   │
│                                              │
└──────────────────────────────────────────────┘
```

### 3️⃣ Verificar Sucesso

Você deve ver:
```
✅ Success. No rows returned
```

Ou execute para confirmar:
```sql
SELECT * FROM billings LIMIT 1;
```

---

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  PASSO 2: Backend (Reiniciar Servidor)                │
│  ⏱️  Tempo: 30 segundos                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1️⃣ Abrir Terminal

Windows: `Win + R` → digite `cmd` → Enter  
Mac/Linux: `Cmd + Space` → digite `terminal` → Enter

### 2️⃣ Navegar até o Backend

```bash
cd "GATEWAY/GATEWAY DE PAGAMENTOS/backend"
```

### 3️⃣ Parar Servidor Atual

Se o servidor estiver rodando:
- Pressione `Ctrl + C` no terminal

### 4️⃣ Reiniciar Servidor

```bash
npm run dev
```

### 5️⃣ Verificar Sucesso

Você deve ver:
```
🚀 PayGateway API running on port 3001
📡 Health check: http://localhost:3001/api/health
🌍 Environment: development
```

---

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  PASSO 3: Frontend (Reiniciar Servidor)               │
│  ⏱️  Tempo: 30 segundos                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 1️⃣ Abrir Novo Terminal

Mantenha o terminal do backend aberto!  
Abra um **NOVO** terminal.

### 2️⃣ Navegar até o Frontend

```bash
cd "GATEWAY/GATEWAY DE PAGAMENTOS/frontend"
```

### 3️⃣ Parar Servidor Atual

Se o servidor estiver rodando:
- Pressione `Ctrl + C` no terminal

### 4️⃣ Reiniciar Servidor

```bash
npm run dev
```

### 5️⃣ Verificar Sucesso

Você deve ver:
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

## ✅ Validação da Instalação

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  TESTE 1: Acessar a Página                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

1. Abra o navegador
2. Acesse: http://localhost:3000
3. Faça login
4. Procure no menu lateral: **"Cobranças"**

```
┌──────────────────────────┐
│  Dashboard               │
├──────────────────────────┤
│  🏠 Dashboard            │
│  📦 Produtos             │
│  🛒 Vendas               │
│  💳 Cobranças  ← AQUI!  │
│  🔄 Assinaturas          │
│  💰 Saques               │
└──────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  TESTE 2: Criar Primeira Cobrança                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Passo a Passo Visual:

**1. Clique em "Cobranças"**
```
┌────────────────────────────────────┐
│  Cobranças                         │
│  Crie cobranças rápidas via PIX   │
├────────────────────────────────────┤
│  [+ Nova Cobrança]  ← CLIQUE      │
└────────────────────────────────────┘
```

**2. Preencha o Formulário**
```
┌──────────────────────────┐
│  Nova Cobrança          │
├──────────────────────────┤
│  Valor (R$)             │
│  [50.00]  ← DIGITE      │
│                          │
│  Descrição (opcional)   │
│  [Teste]  ← DIGITE      │
│                          │
│  ℹ️ Taxa: R$ 1,50       │
│                          │
│  [Gerar Cobrança]       │
└──────────────────────────┘
```

**3. QR Code Gerado!**
```
┌──────────────────────────┐
│  Pagamento via PIX      │
├──────────────────────────┤
│     R$ 50,00            │
│                          │
│   ┌──────────────┐      │
│   │  ████████    │      │
│   │  ████████    │      │
│   │  QR CODE     │      │
│   └──────────────┘      │
│                          │
│  PIX Copia e Cola       │
│  [00020126...] [Copiar] │
└──────────────────────────┘
```

**4. Sucesso! ✅**

Se você chegou até aqui, o sistema está funcionando perfeitamente!

---

## 🎯 Checklist Visual

Marque conforme avança:

```
┌─────────────────────────────────────────────┐
│  BANCO DE DADOS                             │
├─────────────────────────────────────────────┤
│  [ ] Acessei Supabase                       │
│  [ ] Abri SQL Editor                        │
│  [ ] Executei script SQL                    │
│  [ ] Vi mensagem de sucesso                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  BACKEND                                    │
├─────────────────────────────────────────────┤
│  [ ] Abri terminal                          │
│  [ ] Naveguei até pasta backend             │
│  [ ] Executei npm run dev                   │
│  [ ] Vi mensagem "running on port 3001"     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  FRONTEND                                   │
├─────────────────────────────────────────────┤
│  [ ] Abri novo terminal                     │
│  [ ] Naveguei até pasta frontend            │
│  [ ] Executei npm run dev                   │
│  [ ] Vi mensagem "Ready in X.Xs"            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  VALIDAÇÃO                                  │
├─────────────────────────────────────────────┤
│  [ ] Acessei http://localhost:3000          │
│  [ ] Fiz login                              │
│  [ ] Vi aba "Cobranças" no menu             │
│  [ ] Cliquei em "Cobranças"                 │
│  [ ] Página carregou sem erros              │
│  [ ] Criei uma cobrança de teste            │
│  [ ] QR Code foi gerado                     │
│  [ ] PIX Copia e Cola apareceu              │
└─────────────────────────────────────────────┘
```

---

## 🆘 Problemas Comuns

### ❌ Erro: "Table billings does not exist"

**Solução:**
```
1. Volte ao Supabase SQL Editor
2. Execute novamente o script SQL
3. Verifique se não há erros em vermelho
```

---

### ❌ Erro: "Cannot find module 'billing.routes'"

**Solução:**
```
1. Verifique se o arquivo existe:
   backend/src/routes/billing.routes.js
   
2. Se não existir, copie novamente os arquivos
3. Reinicie o backend
```

---

### ❌ Aba "Cobranças" não aparece

**Solução:**
```
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Faça logout e login novamente
3. Verifique se o frontend foi reiniciado
4. Abra DevTools (F12) e veja se há erros
```

---

### ❌ QR Code não é gerado

**Solução:**
```
1. Verifique se você tem recipient configurado
2. Vá em Configurações → Dados Bancários
3. Configure seus dados bancários
4. Tente criar cobrança novamente
```

---

## 📞 Ainda com Problemas?

### Verificar Logs

**Backend:**
```bash
# No terminal do backend, procure por erros em vermelho
# Exemplo de erro:
Error: Cannot connect to database
```

**Frontend:**
```bash
# Abra DevTools (F12)
# Vá em Console
# Procure por erros em vermelho
```

### Testar API Manualmente

```bash
# Teste se o backend está respondendo:
curl http://localhost:3001/api/health

# Deve retornar:
{"status":"ok","timestamp":"...","version":"1.0.0"}
```

---

## 🎉 Parabéns!

Se você completou todos os passos, o sistema de cobranças está **100% funcional**!

```
┌─────────────────────────────────────────────┐
│                                             │
│         🎉 INSTALAÇÃO CONCLUÍDA! 🎉        │
│                                             │
│  ✅ Banco de dados migrado                 │
│  ✅ Backend funcionando                    │
│  ✅ Frontend funcionando                   │
│  ✅ Sistema de cobranças ativo             │
│                                             │
│  Agora você pode:                          │
│  • Criar cobranças                         │
│  • Gerar QR Codes PIX                      │
│  • Receber pagamentos                      │
│  • Acompanhar estatísticas                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📚 Próximos Passos

1. ✅ Leia o **GUIA_RAPIDO_COBRANCAS.md**
2. ✅ Teste criar algumas cobranças
3. ✅ Configure notificações Telegram (opcional)
4. ✅ Compartilhe com sua equipe

---

## 🎯 Dica Final

**Salve este guia!** Você pode precisar dele para:
- Instalar em outro ambiente
- Treinar novos membros da equipe
- Resolver problemas futuros

---

**Versão:** 1.0.0  
**Última Atualização:** Abril 2026  
**Tempo Total de Instalação:** ~3 minutos
