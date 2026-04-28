# 🔒 GUIA DE CORREÇÃO DE SEGURANÇA - CREDENCIAIS EXPOSTAS

## ⚠️ SITUAÇÃO ATUAL
O arquivo `backend/.env` foi commitado no Git e está no histórico.
Isso significa que suas credenciais podem estar expostas.

---

## 📋 CHECKLIST DE AÇÕES (SIGA ESTA ORDEM)

### ✅ PASSO 1: BACKUP DAS CREDENCIAIS ATUAIS (5 minutos)

1. Abra o arquivo `backend/.env` local
2. Copie TODO o conteúdo para um arquivo FORA do projeto (ex: Desktop/backup-env.txt)
3. ✅ Confirme que salvou

---

### ✅ PASSO 2: GERAR NOVAS CREDENCIAIS (10 minutos)

#### 2.1 - Novo JWT_SECRET
Execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copie o resultado e guarde.

#### 2.2 - Novo PAGARME_WEBHOOK_SECRET
Execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copie o resultado e guarde.

#### 2.3 - Novo TELEGRAM_WEBHOOK_SECRET
Execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copie o resultado e guarde.

#### 2.4 - Supabase (IMPORTANTE!)
- Acesse: https://supabase.com/dashboard
- Vá em Settings > API
- Clique em "Reset service_role key" (⚠️ CUIDADO: isso vai invalidar a chave antiga)
- Copie a nova chave

#### 2.5 - Pagar.me (CRÍTICO!)
- Acesse: https://dashboard.pagar.me
- Vá em Configurações > API Keys
- Gere uma NOVA chave de API
- ⚠️ A chave antiga continuará funcionando até você desativá-la
- Copie a nova chave

---

### ✅ PASSO 3: ATUALIZAR VERCEL (15 minutos)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em: Settings > Environment Variables
4. Atualize TODAS as variáveis com os novos valores:
   - `JWT_SECRET` → novo valor gerado
   - `SUPABASE_SERVICE_KEY` → nova chave do Supabase
   - `PAGARME_API_KEY` → nova chave do Pagar.me
   - `PAGARME_WEBHOOK_SECRET` → novo valor gerado
   - `TELEGRAM_WEBHOOK_SECRET` → novo valor gerado

5. ⚠️ **IMPORTANTE:** Marque para aplicar em:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. Clique em "Save"

---

### ✅ PASSO 4: ATUALIZAR .ENV LOCAL (2 minutos)

1. Abra `backend/.env`
2. Substitua pelos MESMOS valores que colocou na Vercel
3. Salve o arquivo

---

### ✅ PASSO 5: FAZER REDEPLOY NA VERCEL (5 minutos)

**Opção A - Pelo Dashboard:**
1. Vá em Deployments
2. Clique nos 3 pontinhos do último deploy
3. Clique em "Redeploy"

**Opção B - Pelo Git:**
```bash
git commit --allow-empty -m "chore: trigger redeploy with new credentials"
git push
```

⏱️ Aguarde 2-3 minutos para o deploy completar.

---

### ✅ PASSO 6: TESTAR O SITE (5 minutos)

1. Acesse seu site em produção
2. Teste:
   - ✅ Login funciona?
   - ✅ Checkout funciona?
   - ✅ Dashboard carrega?

3. Se algo não funcionar:
   - Verifique os logs na Vercel (Runtime Logs)
   - Confirme que as variáveis foram salvas corretamente

---

### ✅ PASSO 7: ATUALIZAR WEBHOOK DO PAGAR.ME (5 minutos)

1. Acesse: https://dashboard.pagar.me
2. Vá em: Configurações > Webhooks
3. Edite o webhook existente
4. Atualize o "Secret" com o novo `PAGARME_WEBHOOK_SECRET`
5. Salve

---

### ✅ PASSO 8: DESATIVAR CREDENCIAIS ANTIGAS (CRÍTICO!)

⚠️ **SÓ FAÇA ISSO DEPOIS DE CONFIRMAR QUE TUDO ESTÁ FUNCIONANDO!**

#### Pagar.me:
1. Acesse: https://dashboard.pagar.me
2. Vá em: Configurações > API Keys
3. Encontre a chave ANTIGA
4. Clique em "Desativar" ou "Revogar"

#### Supabase:
- A chave antiga já foi invalidada quando você resetou

---

### ✅ PASSO 9: LIMPAR O HISTÓRICO DO GIT (10 minutos)

⚠️ **ATENÇÃO:** Isso vai reescrever o histórico do Git!

```bash
# 1. Fazer backup do repositório
cd "D:\GATEWAY\GATEWAY\GATEWAY DE PAGAMENTOS"
cd ..
cp -r "GATEWAY DE PAGAMENTOS" "GATEWAY DE PAGAMENTOS-BACKUP"

# 2. Voltar para o projeto
cd "GATEWAY DE PAGAMENTOS"

# 3. Remover .env do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# 4. Limpar referências antigas
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Forçar push (⚠️ CUIDADO!)
git push origin --force --all
git push origin --force --tags
```

---

### ✅ PASSO 10: VERIFICAR SE FUNCIONOU (2 minutos)

```bash
# Verificar se .env ainda aparece no histórico
git log --all --full-history -- "backend/.env"

# Se não mostrar nada = SUCESSO! ✅
```

---

## 🎯 TEMPO TOTAL ESTIMADO: 60 minutos

## ⚠️ AVISOS IMPORTANTES

1. **Não pule etapas!** A ordem é importante.
2. **Teste antes de desativar as credenciais antigas.**
3. **Mantenha o backup até confirmar que tudo funciona.**
4. **Se o repositório for público no GitHub, considere torná-lo privado.**

---

## 🆘 SE ALGO DER ERRADO

1. **Site parou de funcionar?**
   - Volte as variáveis antigas na Vercel temporariamente
   - Faça redeploy
   - Investigue o erro nos logs

2. **Git deu erro?**
   - Restaure do backup: `GATEWAY DE PAGAMENTOS-BACKUP`
   - Peça ajuda antes de tentar novamente

3. **Webhooks pararam?**
   - Verifique se o secret está correto no Pagar.me
   - Teste enviando um webhook de teste

---

## ✅ APÓS CONCLUIR TUDO

- [ ] Site funcionando em produção
- [ ] Credenciais antigas desativadas
- [ ] .env removido do histórico do Git
- [ ] Backup das novas credenciais salvo em local seguro
- [ ] Este guia pode ser deletado

---

**Criado em:** $(date)
**Status:** 🔴 PENDENTE
