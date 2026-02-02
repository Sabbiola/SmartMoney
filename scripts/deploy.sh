#!/bin/bash

#############################################
# SmartMoney - Deploy Script
# Esegui dalla tua macchina locale per fare
# deploy sulla VPS
# Usage: bash deploy.sh user@vps-ip
#############################################

set -e

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configurazione
APP_NAME="smartmoney"
REMOTE_DIR="/var/www/$APP_NAME"
BRANCH="${2:-main}"

# Verifica argomenti
if [ -z "$1" ]; then
    echo "Usage: bash deploy.sh user@vps-ip [branch]"
    echo ""
    echo "Esempi:"
    echo "  bash deploy.sh root@123.45.67.89"
    echo "  bash deploy.sh root@123.45.67.89 develop"
    exit 1
fi

VPS_HOST="$1"

echo ""
echo "============================================"
echo "   SmartMoney Deploy"
echo "============================================"
echo "Target: $VPS_HOST"
echo "Branch: $BRANCH"
echo ""

# Verifica connessione
print_status "Verifica connessione SSH..."
if ! ssh -q -o BatchMode=yes -o ConnectTimeout=5 $VPS_HOST exit; then
    print_error "Impossibile connettersi a $VPS_HOST"
    print_error "Verifica che SSH sia configurato correttamente"
    exit 1
fi
print_success "Connessione OK"

# Build locale
print_status "Build del backend..."
cd "$(dirname "$0")/../apps/api"
npm ci
npm run build
print_success "Build completato"

# Crea archivio
print_status "Creazione archivio..."
cd "$(dirname "$0")/.."
tar -czf /tmp/smartmoney-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='.env.local' \
    apps/api/dist \
    apps/api/prisma \
    apps/api/package.json \
    apps/api/package-lock.json
print_success "Archivio creato"

# Upload
print_status "Upload su VPS..."
scp /tmp/smartmoney-deploy.tar.gz $VPS_HOST:/tmp/
print_success "Upload completato"

# Deploy remoto
print_status "Esecuzione deploy remoto..."
ssh $VPS_HOST << 'REMOTE_SCRIPT'
set -e
APP_DIR="/var/www/smartmoney"

echo "[INFO] Estrazione archivio..."
mkdir -p $APP_DIR/app
cd $APP_DIR/app
tar -xzf /tmp/smartmoney-deploy.tar.gz

echo "[INFO] Installazione dipendenze..."
cd $APP_DIR/app/apps/api
cp $APP_DIR/.env .env 2>/dev/null || echo "[WARN] File .env non trovato, usa quello esistente"
npm ci --production

echo "[INFO] Migrazione database..."
npx prisma generate
npx prisma db push --accept-data-loss

echo "[INFO] Riavvio servizio..."
pm2 restart smartmoney-api 2>/dev/null || pm2 start dist/index.js --name smartmoney-api
pm2 save

echo "[INFO] Pulizia..."
rm -f /tmp/smartmoney-deploy.tar.gz

echo ""
echo "[OK] Deploy completato!"
pm2 status
REMOTE_SCRIPT

# Pulizia locale
rm -f /tmp/smartmoney-deploy.tar.gz

echo ""
print_success "Deploy completato con successo!"
echo ""
echo "Verifica: curl https://$(echo $VPS_HOST | cut -d'@' -f2)/health"
