# 🔐 GUIA: 2FA PARA ADMINS E BACKUP AUTOMÁTICO

## 📱 1. AUTENTICAÇÃO DE DOIS FATORES (2FA) PARA ADMINS

### **O QUE É 2FA?**

2FA (Two-Factor Authentication) adiciona uma **segunda camada de segurança** no login.

**Exemplo:**
1. Admin digita email + senha (1º fator)
2. Admin digita código do celular (2º fator)
3. Só então consegue acessar o painel

### **POR QUE É IMPORTANTE?**

Imagine este cenário:
- Um hacker descobre a senha do admin (phishing, vazamento, etc.)
- **SEM 2FA:** Ele entra no sistema e pode:
  - Roubar dinheiro dos vendedores
  - Alterar taxas da plataforma
  - Bloquear contas
  - Acessar dados de clientes

- **COM 2FA:** Mesmo com a senha, ele NÃO consegue entrar porque precisa do código do celular do admin!

### **COMO FUNCIONA?**

Existem 3 tipos principais:

#### **Tipo 1: SMS (Mais Simples)**
- Admin recebe código por SMS
- ✅ Fácil de implementar
- ⚠️ Menos seguro (SIM swap attack)

#### **Tipo 2: App Autenticador (Recomendado)**
- Admin usa Google Authenticator ou Authy
- Gera códigos a cada 30 segundos
- ✅ Mais seguro
- ✅ Funciona offline

#### **Tipo 3: Email (Backup)**
- Admin recebe código por email
- ✅ Simples
- ⚠️ Se o email for hackeado, perde a proteção

### **COMO IMPLEMENTAR NO SEU PROJETO**

Vou te mostrar como adicionar 2FA com Google Authenticator:

#### **Passo 1: Instalar Bibliotecas**

```bash
cd backend
npm install speakeasy qrcode
```

#### **Passo 2: Adicionar Campos no Banco de Dados**

```sql
-- Adicionar na tabela users
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
```

#### **Passo 3: Criar Rota para Ativar 2FA**

```javascript
// backend/src/controllers/auth.controller.js

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Gerar QR Code para o admin escanear
async enable2FA(req, res) {
    try {
        const userId = req.user.id;
        
        // Gerar secret único
        const secret = speakeasy.generateSecret({
            name: `PayGateway (${req.user.email})`,
            length: 32
        });
        
        // Salvar secret no banco (ainda não ativado)
        await supabase
            .from('users')
            .update({ two_factor_secret: secret.base32 })
            .eq('id', userId);
        
        // Gerar QR Code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        
        res.json({
            qrCode: qrCodeUrl,
            secret: secret.base32, // Para backup manual
            message: 'Escaneie o QR Code no Google Authenticator'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Verificar código e ativar 2FA
async verify2FA(req, res) {
    try {
        const { token } = req.body;
        const userId = req.user.id;
        
        // Buscar secret do usuário
        const { data: user } = await supabase
            .from('users')
            .select('two_factor_secret')
            .eq('id', userId)
            .single();
        
        // Verificar se o código está correto
        const verified = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token: token,
            window: 2 // Aceita códigos de até 1 minuto atrás/frente
        });
        
        if (!verified) {
            return res.status(400).json({ error: 'Código inválido' });
        }
        
        // Ativar 2FA
        await supabase
            .from('users')
            .update({ two_factor_enabled: true })
            .eq('id', userId);
        
        res.json({ message: '2FA ativado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
```

#### **Passo 4: Modificar o Login**

```javascript
// backend/src/controllers/auth.controller.js

async login(req, res) {
    try {
        const { email, password } = req.body;
        
        // 1. Verificar email e senha (como antes)
        const { data: users } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase());
        
        const user = users?.[0];
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // 2. NOVO: Verificar se tem 2FA ativado
        if (user.two_factor_enabled) {
            // Gerar token temporário (válido por 5 minutos)
            const tempToken = jwt.sign(
                { userId: user.id, temp: true },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );
            
            return res.json({
                requires2FA: true,
                tempToken: tempToken,
                message: 'Digite o código do Google Authenticator'
            });
        }
        
        // 3. Se não tem 2FA, login normal
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Nova rota: Verificar código 2FA no login
async verify2FALogin(req, res) {
    try {
        const { tempToken, token } = req.body;
        
        // Verificar token temporário
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded.temp) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        
        // Buscar usuário
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .single();
        
        // Verificar código 2FA
        const verified = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token: token,
            window: 2
        });
        
        if (!verified) {
            return res.status(400).json({ error: 'Código inválido' });
        }
        
        // Gerar token definitivo
        const finalToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token: finalToken, 
            user: { id: user.id, name: user.name, role: user.role } 
        });
    } catch (error) {
        res.status(401).json({ error: 'Token expirado ou inválido' });
    }
}
```

#### **Passo 5: Adicionar Rotas**

```javascript
// backend/src/routes/auth.routes.js

router.post('/2fa/enable', auth, adminOnly, authController.enable2FA);
router.post('/2fa/verify', auth, authController.verify2FA);
router.post('/2fa/login', authController.verify2FALogin);
```

#### **Passo 6: Frontend - Tela de 2FA**

```typescript
// frontend/src/app/admin/settings/page.tsx

'use client';
import { useState } from 'react';

export default function Settings2FA() {
    const [qrCode, setQrCode] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    
    // Ativar 2FA
    const handleEnable2FA = async () => {
        const res = await fetch('/api/auth/2fa/enable', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setQrCode(data.qrCode);
    };
    
    // Verificar código
    const handleVerify = async () => {
        const res = await fetch('/api/auth/2fa/verify', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: verifyCode })
        });
        
        if (res.ok) {
            alert('2FA ativado com sucesso!');
        } else {
            alert('Código inválido');
        }
    };
    
    return (
        <div>
            <h1>Autenticação de Dois Fatores</h1>
            
            {!qrCode ? (
                <button onClick={handleEnable2FA}>
                    Ativar 2FA
                </button>
            ) : (
                <div>
                    <p>1. Instale o Google Authenticator no celular</p>
                    <p>2. Escaneie este QR Code:</p>
                    <img src={qrCode} alt="QR Code" />
                    
                    <p>3. Digite o código de 6 dígitos:</p>
                    <input 
                        type="text" 
                        maxLength={6}
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                    />
                    <button onClick={handleVerify}>Verificar</button>
                </div>
            )}
        </div>
    );
}
```

### **FLUXO COMPLETO**

```
1. Admin vai em Configurações > Segurança
2. Clica em "Ativar 2FA"
3. Sistema gera QR Code
4. Admin escaneia com Google Authenticator
5. App gera código de 6 dígitos
6. Admin digita código para confirmar
7. 2FA ativado! ✅

Próximo login:
1. Admin digita email + senha
2. Sistema pede código 2FA
3. Admin abre Google Authenticator
4. Digita código de 6 dígitos
5. Login concluído! ✅
```

---

## 💾 2. BACKUP AUTOMÁTICO DO BANCO DE DADOS

### **O QUE É BACKUP AUTOMÁTICO?**

É uma cópia do banco de dados feita **automaticamente** todos os dias, sem você precisar lembrar.

### **POR QUE É IMPORTANTE?**

Imagine estes cenários:

**Cenário 1: Bug no Código**
- Você faz um deploy com bug
- Bug deleta dados de clientes
- **SEM BACKUP:** Dados perdidos para sempre 😱
- **COM BACKUP:** Restaura backup de ontem ✅

**Cenário 2: Ataque Hacker**
- Hacker invade e deleta tudo
- **SEM BACKUP:** Negócio destruído 😱
- **COM BACKUP:** Restaura e continua funcionando ✅

**Cenário 3: Erro Humano**
- Você roda comando SQL errado
- Deleta tabela inteira por engano
- **SEM BACKUP:** Pânico total 😱
- **COM BACKUP:** Restaura em minutos ✅

### **COMO FUNCIONA?**

```
Todo dia às 3h da manhã:
1. Script conecta no banco
2. Faz dump (cópia) de todas as tabelas
3. Compacta em arquivo .sql.gz
4. Envia para armazenamento seguro
5. Mantém últimos 30 dias
6. Deleta backups antigos
```

### **OPÇÕES DE BACKUP**

#### **Opção 1: Backup Nativo do Supabase (Mais Fácil)**

O Supabase já faz backup automático! Você só precisa ativar:

1. Acesse: https://supabase.com/dashboard
2. Vá em: Settings > Database > Backups
3. Ative: "Point-in-Time Recovery" (PITR)

**Vantagens:**
- ✅ Automático
- ✅ Restauração fácil
- ✅ Backup a cada minuto
- ⚠️ Pago (plano Pro: $25/mês)

**Como Restaurar:**
```
1. Vá em Database > Backups
2. Escolha data/hora
3. Clique em "Restore"
4. Pronto! ✅
```

#### **Opção 2: Script Próprio (Grátis)**

Se você quer economizar, pode fazer seu próprio script:

**Passo 1: Criar Script de Backup**

```javascript
// backend/scripts/backup-database.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurações
const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 30; // Manter últimos 30 dias

// Criar pasta de backups se não existir
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function createBackup() {
    try {
        const timestamp = new Date().toISOString().split('T')[0]; // 2026-04-28
        const filename = `backup-${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);
        
        console.log(`🔄 Iniciando backup: ${filename}`);
        
        // Extrair dados da URL do Supabase
        const dbUrl = process.env.SUPABASE_URL;
        const dbPassword = process.env.SUPABASE_SERVICE_KEY;
        
        // Comando pg_dump (PostgreSQL)
        const command = `pg_dump "${dbUrl}" > "${filepath}"`;
        
        // Executar backup
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Erro no backup: ${error.message}`);
                return;
            }
            
            console.log(`✅ Backup criado: ${filename}`);
            
            // Compactar arquivo
            exec(`gzip "${filepath}"`, (gzipError) => {
                if (gzipError) {
                    console.error(`⚠️ Erro ao compactar: ${gzipError.message}`);
                } else {
                    console.log(`📦 Backup compactado: ${filename}.gz`);
                }
                
                // Limpar backups antigos
                cleanOldBackups();
            });
        });
        
    } catch (error) {
        console.error(`❌ Erro geral: ${error.message}`);
    }
}

function cleanOldBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('backup-') && f.endsWith('.gz'))
            .sort()
            .reverse();
        
        // Manter apenas os últimos MAX_BACKUPS
        if (files.length > MAX_BACKUPS) {
            const toDelete = files.slice(MAX_BACKUPS);
            toDelete.forEach(file => {
                fs.unlinkSync(path.join(BACKUP_DIR, file));
                console.log(`🗑️ Backup antigo removido: ${file}`);
            });
        }
        
        console.log(`📊 Total de backups: ${Math.min(files.length, MAX_BACKUPS)}`);
    } catch (error) {
        console.error(`❌ Erro ao limpar backups: ${error.message}`);
    }
}

// Executar backup
createBackup();
```

**Passo 2: Adicionar no package.json**

```json
{
  "scripts": {
    "backup": "node scripts/backup-database.js"
  }
}
```

**Passo 3: Testar Manualmente**

```bash
npm run backup
```

**Passo 4: Automatizar com Cron (Linux/Mac)**

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup todo dia às 3h)
0 3 * * * cd /caminho/do/projeto/backend && npm run backup
```

**Passo 4 (Windows): Automatizar com Task Scheduler**

1. Abra "Agendador de Tarefas"
2. Criar Tarefa Básica
3. Nome: "Backup Banco de Dados"
4. Gatilho: Diariamente às 3h
5. Ação: Iniciar programa
6. Programa: `node`
7. Argumentos: `scripts/backup-database.js`
8. Iniciar em: `D:\GATEWAY\GATEWAY\GATEWAY DE PAGAMENTOS\backend`

#### **Opção 3: Backup na Nuvem (Recomendado)**

Para segurança máxima, envie backups para a nuvem:

**Usando AWS S3:**

```javascript
// backend/scripts/backup-to-s3.js

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-1'
});

async function uploadToS3(filepath) {
    const filename = path.basename(filepath);
    const fileContent = fs.readFileSync(filepath);
    
    const params = {
        Bucket: 'meu-bucket-backups',
        Key: `database-backups/${filename}`,
        Body: fileContent,
        ServerSideEncryption: 'AES256' // Criptografar
    };
    
    try {
        await s3.upload(params).promise();
        console.log(`☁️ Backup enviado para S3: ${filename}`);
    } catch (error) {
        console.error(`❌ Erro ao enviar para S3: ${error.message}`);
    }
}
```

### **COMO RESTAURAR UM BACKUP**

**Restaurar do arquivo local:**

```bash
# Descompactar
gunzip backup-2026-04-28.sql.gz

# Restaurar no banco
psql "sua-connection-string" < backup-2026-04-28.sql
```

**Restaurar do Supabase:**

1. Vá em Database > Backups
2. Escolha o backup
3. Clique em "Restore"
4. Confirme

### **CHECKLIST DE BACKUP**

- [ ] Backup automático configurado
- [ ] Testou fazer backup manualmente
- [ ] Testou restaurar um backup
- [ ] Backups sendo salvos em local seguro
- [ ] Backups antigos sendo deletados automaticamente
- [ ] Notificação se backup falhar (email/Telegram)

---

## 📊 COMPARAÇÃO: 2FA vs BACKUP

| Recurso | 2FA | Backup |
|---------|-----|--------|
| **Protege contra** | Roubo de senha | Perda de dados |
| **Quando usar** | Login de admins | Sempre |
| **Custo** | Grátis | Grátis ou $25/mês |
| **Dificuldade** | Média | Fácil |
| **Impacto** | Previne invasão | Recupera desastres |
| **Prioridade** | Alta | CRÍTICA |

---

## 🎯 RECOMENDAÇÃO FINAL

### **Faça AGORA (Crítico):**
1. ✅ Ative backup automático do Supabase (ou crie script)
2. ✅ Teste restaurar um backup

### **Faça em 1 Semana (Importante):**
3. ✅ Implemente 2FA para admins
4. ✅ Force todos os admins a ativarem

### **Faça em 1 Mês (Recomendado):**
5. ✅ Configure backup na nuvem (S3, Google Cloud, etc.)
6. ✅ Configure alertas se backup falhar

---

## 🆘 PRECISA DE AJUDA?

Posso te ajudar a implementar qualquer uma dessas funcionalidades!

Basta me dizer:
- "Quero implementar 2FA agora"
- "Quero configurar backup automático"
- "Quero as duas coisas"

E eu crio o código completo para você! 🚀
