# Script PowerShell para remover backend/.env do histórico do Git
# Este script reescreve o histórico removendo o arquivo sensível

Write-Host "🔒 REMOVENDO backend/.env DO HISTÓRICO DO GIT" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos em um repositório Git
if (-not (Test-Path .git)) {
    Write-Host "❌ ERRO: Não é um repositório Git!" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️  ATENÇÃO: Este processo vai reescrever o histórico do Git" -ForegroundColor Yellow
Write-Host "📦 Criando backup do repositório..." -ForegroundColor Yellow
Write-Host ""

# Criar backup
$currentPath = Get-Location
$parentPath = Split-Path $currentPath -Parent
$backupPath = Join-Path $parentPath "GATEWAY DE PAGAMENTOS-BACKUP"

if (Test-Path $backupPath) {
    Remove-Item $backupPath -Recurse -Force
}

Copy-Item -Path $currentPath -Destination $backupPath -Recurse -Force

Write-Host "✅ Backup criado em: $backupPath" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Removendo backend/.env do histórico..." -ForegroundColor Yellow
Write-Host ""

# Remover o arquivo do histórico usando git filter-branch
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty --tag-name-filter cat -- --all

Write-Host ""
Write-Host "🧹 Limpando referências antigas..." -ForegroundColor Yellow

# Limpar referências
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host ""
Write-Host "✅ CONCLUÍDO!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Verifique se funcionou: git log --all --full-history -- backend/.env"
Write-Host "2. Se não mostrar nada, está limpo! ✅"
Write-Host "3. Force push: git push origin --force --all"
Write-Host "4. Force push tags: git push origin --force --tags"
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Todos que clonaram o repo precisam fazer:" -ForegroundColor Yellow
Write-Host "   git fetch origin"
Write-Host "   git reset --hard origin/main"
Write-Host ""
