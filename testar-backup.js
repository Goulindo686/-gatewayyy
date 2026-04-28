#!/usr/bin/env node

/**
 * 🧪 SCRIPT PARA TESTAR BACKUP MANUALMENTE
 * 
 * Como usar:
 * node testar-backup.js
 */

require('dotenv').config();

const VERCEL_URL = process.env.VERCEL_URL || 'https://seu-dominio.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
    console.error('❌ ERRO: CRON_SECRET não encontrado no .env');
    console.log('\nAdicione no arquivo .env:');
    console.log('CRON_SECRET=sua-senha-aqui');
    process.exit(1);
}

console.log('🧪 TESTANDO BACKUP AUTOMÁTICO\n');
console.log('URL:', VERCEL_URL + '/api/cron/backup');
console.log('Secret:', CRON_SECRET.substring(0, 10) + '...\n');

async function testBackup() {
    try {
        console.log('🔄 Chamando API de backup...\n');
        
        const response = await fetch(VERCEL_URL + '/api/cron/backup', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ BACKUP REALIZADO COM SUCESSO!\n');
            console.log('📊 Resultado:');
            console.log('  - Arquivo:', data.filename);
            console.log('  - Tabelas:', data.tables);
            console.log('  - Registros:', data.records);
            console.log('  - Duração:', data.duration);
            console.log('  - Timestamp:', data.timestamp);
            console.log('\n📍 Verifique no Supabase: Storage > backups');
        } else {
            console.error('❌ ERRO NO BACKUP:\n');
            console.error(data);
        }
        
    } catch (error) {
        console.error('❌ ERRO AO CHAMAR API:', error.message);
    }
}

testBackup();
