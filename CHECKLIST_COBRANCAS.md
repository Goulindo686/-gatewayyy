# ✅ Checklist - Sistema de Cobranças

## 📋 Antes de Começar

- [ ] Supabase configurado e funcionando
- [ ] Pagar.me configurado com API keys
- [ ] Webhook do Pagar.me apontando para sua API
- [ ] Backend rodando (porta 3001)
- [ ] Frontend rodando (porta 3000)

---

## 🗄️ Banco de Dados

- [ ] Executar `EXECUTAR_MIGRACAO_COBRANCAS.sql` no Supabase
- [ ] Verificar se tabela `billings` foi criada
- [ ] Verificar se índices foram criados
- [ ] Verificar se RLS está habilitado
- [ ] Verificar se políticas foram criadas
- [ ] Verificar se trigger foi criado

### Como Verificar:
```sql
-- No Supabase SQL Editor:
SELECT * FROM billings LIMIT 1;
-- Deve retornar estrutura da tabela (mesmo vazia)
```

---

## 🔧 Backend

- [ ] Arquivo `billing.controller.js` criado
- [ ] Arquivo `billing.routes.js` criado
- [ ] Rotas importadas no `server.js`
- [ ] Webhook atualizado para processar cobranças
- [ ] Backend reiniciado

### Como Verificar:
```bash
# Testar endpoint de health
curl http://localhost:3001/api/health

# Deve retornar: {"status":"ok",...}
```

---

## 🎨 Frontend

- [ ] Página `dashboard/billings/page.tsx` criada
- [ ] Aba "Cobranças" adicionada no menu do dashboard
- [ ] Aba "Cobranças" adicionada no menu do admin
- [ ] Ícone `FiCreditCard` importado
- [ ] Frontend reiniciado

### Como Verificar:
1. Abrir http://localhost:3000/dashboard
2. Verificar se aba "Cobranças" aparece no menu lateral
3. Clicar na aba
4. Deve carregar a página de cobranças

---

## 🧪 Testes Funcionais

### Teste 1: Acesso à Página
- [ ] Login no sistema
- [ ] Clicar em "Cobranças" no menu
- [ ] Página carrega sem erros
- [ ] Cards de estatísticas aparecem (mesmo com valores zerados)

### Teste 2: Criar Cobrança (Usuário Normal)
- [ ] Clicar em "Nova Cobrança"
- [ ] Modal abre corretamente
- [ ] Digitar valor: 50.00
- [ ] Digitar descrição: "Teste"
- [ ] Verificar aviso de taxa (R$ 1,50)
- [ ] Clicar em "Gerar Cobrança"
- [ ] Modal de pagamento abre
- [ ] QR Code aparece
- [ ] PIX Copia e Cola aparece
- [ ] Botão "Copiar" funciona
- [ ] Cobrança aparece na lista como "Pendente"

### Teste 3: Criar Cobrança (Admin)
- [ ] Login como admin
- [ ] Ir em "Cobranças"
- [ ] Clicar em "Nova Cobrança"
- [ ] Digitar valor: 100.00
- [ ] Verificar que NÃO há aviso de taxa (ou taxa = R$ 0,00)
- [ ] Gerar cobrança
- [ ] Verificar que fee_amount = 0

### Teste 4: Verificar Estatísticas
- [ ] Após criar cobranças, verificar cards:
  - [ ] Total de cobranças aumentou
  - [ ] Pendentes aumentou
  - [ ] Valores estão corretos

### Teste 5: Visualizar QR Code
- [ ] Clicar em "Ver QR Code" em cobrança pendente
- [ ] Modal abre
- [ ] QR Code visível
- [ ] Copiar PIX funciona
- [ ] Botão "Verificar Pagamento" funciona

### Teste 6: Pagar Cobrança (Ambiente de Teste)
- [ ] Copiar PIX Copia e Cola
- [ ] Usar ferramenta de teste do Pagar.me
- [ ] Simular pagamento
- [ ] Webhook recebe notificação
- [ ] Status muda para "Pago"
- [ ] Estatísticas atualizam
- [ ] Notificação Telegram enviada (se configurado)

### Teste 7: Cancelar Cobrança
- [ ] Criar nova cobrança
- [ ] Tentar cancelar (deve funcionar)
- [ ] Status muda para "Cancelado"
- [ ] Tentar cancelar cobrança paga (deve falhar)

---

## 🔍 Verificações de Segurança

- [ ] Usuário não autenticado não acessa `/api/billing/*`
- [ ] Usuário só vê suas próprias cobranças
- [ ] Admin pode ver todas as cobranças
- [ ] Não é possível criar cobrança com valor negativo
- [ ] Não é possível cancelar cobrança já paga

### Como Testar:
```bash
# Sem token (deve retornar 401)
curl http://localhost:3001/api/billing/charges

# Com token inválido (deve retornar 401)
curl -H "Authorization: Bearer token_invalido" \
  http://localhost:3001/api/billing/charges
```

---

## 📊 Verificações de Dados

### No Supabase:
```sql
-- Verificar cobranças criadas
SELECT * FROM billings ORDER BY created_at DESC LIMIT 10;

-- Verificar transações geradas
SELECT * FROM transactions 
WHERE description LIKE '%Cobrança%' 
ORDER BY created_at DESC LIMIT 10;

-- Verificar estatísticas
SELECT 
  status,
  COUNT(*) as total,
  SUM(amount) as total_amount,
  SUM(fee_amount) as total_fees
FROM billings
GROUP BY status;
```

---

## 🔔 Notificações

- [ ] Telegram configurado (opcional)
- [ ] Notificação enviada quando cobrança é paga
- [ ] Toast de sucesso aparece no frontend

---

## 📱 Responsividade

- [ ] Página funciona em desktop
- [ ] Página funciona em tablet
- [ ] Página funciona em mobile
- [ ] Modais são responsivos
- [ ] Tabela tem scroll horizontal em mobile

---

## 🐛 Logs e Debugging

### Backend:
```bash
# Verificar logs do backend
# Deve mostrar:
[WEBHOOK] Marking billing {id} as paid...
Billing {id} paid. Net: R$XX.XX, Fee: R$X.XX
```

### Frontend:
```javascript
// Abrir DevTools Console
// Não deve ter erros em vermelho
// Verificar chamadas à API em Network tab
```

---

## 📈 Performance

- [ ] Página carrega em menos de 2 segundos
- [ ] Criação de cobrança é instantânea
- [ ] Listagem de cobranças é rápida (mesmo com 100+ registros)
- [ ] QR Code renderiza rapidamente

---

## 🎯 Checklist Final

- [ ] ✅ Banco de dados migrado
- [ ] ✅ Backend funcionando
- [ ] ✅ Frontend funcionando
- [ ] ✅ Aba "Cobranças" visível
- [ ] ✅ Criar cobrança funciona
- [ ] ✅ QR Code gerado corretamente
- [ ] ✅ PIX Copia e Cola funciona
- [ ] ✅ Webhook processa pagamentos
- [ ] ✅ Estatísticas corretas
- [ ] ✅ Taxas aplicadas corretamente
- [ ] ✅ Segurança implementada
- [ ] ✅ Responsivo em todos os dispositivos

---

## 🎉 Sistema Pronto!

Se todos os itens acima estão marcados, o sistema de cobranças está **100% funcional** e pronto para uso em produção!

---

## 📞 Problemas?

Se algum item falhou, verifique:

1. **Logs do backend** - `npm run dev` no terminal
2. **Console do navegador** - F12 → Console
3. **Network tab** - F12 → Network (verificar chamadas à API)
4. **Supabase logs** - Verificar erros no Supabase Dashboard

---

## 📚 Documentação

- `README_COBRANCAS.md` - Visão geral
- `SISTEMA_COBRANCAS_IMPLEMENTADO.md` - Documentação técnica
- `GUIA_RAPIDO_COBRANCAS.md` - Guia de uso
- `EXECUTAR_MIGRACAO_COBRANCAS.sql` - Script SQL

---

**Data do Checklist:** ___/___/______  
**Responsável:** _________________  
**Status:** [ ] Pendente [ ] Em Progresso [ ] Concluído
