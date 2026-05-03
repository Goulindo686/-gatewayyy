# 🚀 Como Iniciar o Backend

## ⚠️ IMPORTANTE: O backend precisa estar rodando para salvar páginas!

### Passo 1: Abrir Terminal no Backend

```bash
cd "GATEWAY/GATEWAY DE PAGAMENTOS/backend"
```

### Passo 2: Instalar Dependências (primeira vez)

```bash
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

Certifique-se que o arquivo `.env` existe em `backend/.env` com:

```env
PORT=3001
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_KEY=sua_chave_do_supabase
FRONTEND_URL=http://localhost:3000
```

### Passo 4: Iniciar o Backend

```bash
npm run dev
```

Você deve ver:
```
🚀 PayGateway API running on port 3001
📡 Health check: http://localhost:3001/api/health
🌍 Environment: development
```

### Passo 5: Verificar se Está Funcionando

Abra no navegador: http://localhost:3001/api/health

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "version": "1.0.0"
}
```

## ✅ Pronto!

Agora você pode salvar páginas no gerador!

## 🔧 Problemas Comuns

### Erro: "Port 3001 already in use"
**Solução**: Outra aplicação está usando a porta 3001
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <numero_do_pid> /F

# Ou mude a porta no .env
PORT=3002
```

### Erro: "Cannot find module"
**Solução**: Instale as dependências
```bash
npm install
```

### Erro: "Supabase connection failed"
**Solução**: Verifique as credenciais no arquivo `.env`

## 📝 Comandos Úteis

```bash
# Iniciar em modo desenvolvimento (com auto-reload)
npm run dev

# Iniciar em modo produção
npm start

# Ver logs
# Os logs aparecem no terminal onde você rodou npm run dev
```

## 🎯 Dica

Mantenha o terminal do backend aberto enquanto usa o gerador!
