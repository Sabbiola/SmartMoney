#!/bin/bash

#############################################
# SmartMoney - VPS Setup Script
# Esegui questo script sulla VPS come root
# Usage: sudo bash setup-vps.sh
#############################################

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configurazione
APP_NAME="smartmoney"
APP_DIR="/var/www/$APP_NAME"
DB_NAME="smartmoney"
DB_USER="smartmoney_user"
DB_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
JWT_SECRET=$(openssl rand -base64 64 | tr -dc 'a-zA-Z0-9' | head -c 64)
NODE_VERSION="18"

echo ""
echo "============================================"
echo "   SmartMoney VPS Setup Script"
echo "============================================"
echo ""

# Verifica root
if [ "$EUID" -ne 0 ]; then
    print_error "Esegui questo script come root (sudo bash setup-vps.sh)"
    exit 1
fi

# Input dominio
read -p "Inserisci il dominio o IP della VPS (es: smartmoney.com o 123.45.67.89): " DOMAIN
if [ -z "$DOMAIN" ]; then
    print_error "Dominio/IP richiesto"
    exit 1
fi

read -p "Vuoi configurare HTTPS con Let's Encrypt? (s/n): " SETUP_SSL
read -p "Inserisci la tua email (per Let's Encrypt e notifiche): " ADMIN_EMAIL

echo ""
print_status "Inizio setup..."

#############################################
# 1. Aggiorna sistema
#############################################
print_status "Aggiornamento sistema..."
apt update && apt upgrade -y
print_success "Sistema aggiornato"

#############################################
# 2. Installa dipendenze base
#############################################
print_status "Installazione dipendenze..."
apt install -y curl wget git build-essential ufw fail2ban
print_success "Dipendenze installate"

#############################################
# 3. Configura Firewall
#############################################
print_status "Configurazione firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
print_success "Firewall configurato"

#############################################
# 4. Installa Node.js
#############################################
print_status "Installazione Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs
print_success "Node.js $(node -v) installato"

#############################################
# 5. Installa PM2
#############################################
print_status "Installazione PM2..."
npm install -g pm2
print_success "PM2 installato"

#############################################
# 6. Installa PostgreSQL
#############################################
print_status "Installazione PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Avvia PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Crea database e utente
print_status "Configurazione database..."
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
EOF
print_success "Database configurato"

#############################################
# 7. Installa Nginx
#############################################
print_status "Installazione Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx installato"

#############################################
# 8. Crea struttura directory
#############################################
print_status "Creazione directory app..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs
print_success "Directory create"

#############################################
# 9. Configura Nginx
#############################################
print_status "Configurazione Nginx..."

cat > /etc/nginx/sites-available/$APP_NAME <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Logs
    access_log /var/www/$APP_NAME/logs/nginx_access.log;
    error_log /var/www/$APP_NAME/logs/nginx_error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    # Root
    location / {
        return 200 '{"status":"ok","app":"SmartMoney API","docs":"/api"}';
        add_header Content-Type application/json;
    }
}
EOF

# Attiva sito
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test e riavvia Nginx
nginx -t
systemctl restart nginx
print_success "Nginx configurato"

#############################################
# 10. SSL con Let's Encrypt (opzionale)
#############################################
if [ "$SETUP_SSL" = "s" ] || [ "$SETUP_SSL" = "S" ]; then
    print_status "Configurazione SSL..."
    apt install -y certbot python3-certbot-nginx

    if [ -n "$ADMIN_EMAIL" ]; then
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $ADMIN_EMAIL
    else
        certbot --nginx -d $DOMAIN
    fi

    # Auto-rinnovo
    systemctl enable certbot.timer
    print_success "SSL configurato"
fi

#############################################
# 11. Crea file environment
#############################################
print_status "Creazione file .env..."

cat > $APP_DIR/.env <<EOF
# SmartMoney Production Environment
# Generato automaticamente il $(date)

# Database
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# JWT
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=production

# App
APP_NAME=SmartMoney
APP_URL=https://${DOMAIN}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EOF

chmod 600 $APP_DIR/.env
print_success "File .env creato"

#############################################
# 12. Crea script di deploy
#############################################
print_status "Creazione script deploy..."

cat > $APP_DIR/deploy.sh <<'DEPLOY_SCRIPT'
#!/bin/bash
set -e

APP_DIR="/var/www/smartmoney"
REPO_URL="$1"
BRANCH="${2:-main}"

echo "=== SmartMoney Deploy ==="
echo "Repository: $REPO_URL"
echo "Branch: $BRANCH"
echo ""

cd $APP_DIR

# Pull o clone
if [ -d "$APP_DIR/app/.git" ]; then
    echo "[INFO] Aggiornamento repository..."
    cd $APP_DIR/app
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    echo "[INFO] Clonazione repository..."
    git clone -b $BRANCH $REPO_URL $APP_DIR/app
    cd $APP_DIR/app
fi

# Backend
echo "[INFO] Build backend..."
cd $APP_DIR/app/apps/api
cp $APP_DIR/.env .env
npm ci --production=false
npm run build
npx prisma generate
npx prisma db push --accept-data-loss

# Riavvia servizio
echo "[INFO] Riavvio servizio..."
pm2 restart smartmoney-api || pm2 start dist/index.js --name smartmoney-api

echo ""
echo "[OK] Deploy completato!"
pm2 status
DEPLOY_SCRIPT

chmod +x $APP_DIR/deploy.sh
print_success "Script deploy creato"

#############################################
# 13. Configura PM2 startup
#############################################
print_status "Configurazione PM2 startup..."
pm2 startup systemd -u root --hp /root
print_success "PM2 startup configurato"

#############################################
# 14. Crea utente app (sicurezza)
#############################################
print_status "Creazione utente app..."
if ! id "smartmoney" &>/dev/null; then
    useradd -r -s /bin/false smartmoney
fi
chown -R smartmoney:smartmoney $APP_DIR
print_success "Utente creato"

#############################################
# Riepilogo finale
#############################################
echo ""
echo "============================================"
echo -e "${GREEN}   SETUP COMPLETATO CON SUCCESSO!${NC}"
echo "============================================"
echo ""
echo "CREDENZIALI DATABASE (salvale in un posto sicuro!):"
echo "-------------------------------------------"
echo "Host:     localhost"
echo "Database: $DB_NAME"
echo "Username: $DB_USER"
echo "Password: $DB_PASS"
echo ""
echo "FILE CONFIGURAZIONE:"
echo "-------------------------------------------"
echo "Environment: $APP_DIR/.env"
echo "Nginx:       /etc/nginx/sites-available/$APP_NAME"
echo ""
echo "PROSSIMI PASSI:"
echo "-------------------------------------------"
echo "1. Carica il codice sulla VPS:"
echo "   $APP_DIR/deploy.sh <URL_REPOSITORY_GIT> main"
echo ""
echo "2. Configura l'app mobile con l'URL:"
if [ "$SETUP_SSL" = "s" ] || [ "$SETUP_SSL" = "S" ]; then
echo "   https://$DOMAIN/api"
else
echo "   http://$DOMAIN/api"
fi
echo ""
echo "COMANDI UTILI:"
echo "-------------------------------------------"
echo "pm2 status          # Stato servizi"
echo "pm2 logs            # Visualizza logs"
echo "pm2 restart all     # Riavvia servizi"
echo "systemctl status nginx"
echo ""
echo "============================================"

# Salva credenziali
cat > $APP_DIR/CREDENTIALS.txt <<EOF
SmartMoney - Credenziali VPS
Generato: $(date)
============================

DATABASE
--------
Host: localhost
Port: 5432
Database: $DB_NAME
Username: $DB_USER
Password: $DB_PASS

JWT SECRET
----------
$JWT_SECRET

API URL
-------
http://$DOMAIN/api

IMPORTANTE: Elimina questo file dopo aver salvato le credenziali!
EOF

chmod 600 $APP_DIR/CREDENTIALS.txt
print_warning "Credenziali salvate in: $APP_DIR/CREDENTIALS.txt"
print_warning "ELIMINA questo file dopo averlo letto!"
