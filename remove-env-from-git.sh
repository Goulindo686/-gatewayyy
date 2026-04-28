#!/bin/bash

# Script para remover backend/.env do histórico do Git
# Este script reescreve o histórico removendo o arquivo sensível

echo "🔒 REMOVENDO backend/.env DO HISTÓRICO DO GIT"
echo "=============================================="
echo ""

# Verificar se estamos em um repositório Git
if [ ! -d .git ]; then
    echo "❌ ERRO: Não é um repositório Git!"
    exit 1
fi

echo "⚠️  ATENÇÃO: Este processo vai reescrever o histórico do Git"
echo "📦 Criando backup do repositório..."

# Criar backup
cd ..
if [ -d "GATEWAY DE PAGAMENTOS-BACKUP" ]; then
    rm -rf "GATEWAY DE PAGAMENTOS-BACKUP"
fi
cp -r "GATEWAY DE PAGAMENTOS" "GATEWAY DE PAGAMENTOS-BACKUP"
cd "GATEWAY DE PAGAMENTOS"

echo "✅ Backup criado em: ../GATEWAY DE PAGAMENTOS-BACKUP"
echo ""
echo "🔄 Removendo backend/.env do histórico..."

# Remover o arquivo do histórico
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/.env' \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "🧹 Limpando referências antigas..."

# Limpar referências
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ CONCLUÍDO!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Verifique se funcionou: git log --all --full-history -- backend/.env"
echo "2. Se não mostrar nada, está limpo! ✅"
echo "3. Force push: git push origin --force --all"
echo "4. Force push tags: git push origin --force --tags"
echo ""
echo "⚠️  IMPORTANTE: Todos que clonaram o repo precisam fazer:"
echo "   git fetch origin"
echo "   git reset --hard origin/main"
echo ""
