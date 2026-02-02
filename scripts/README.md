# SmartMoney - Script di Deploy

## Opzione 1: Setup Manuale VPS

### Primo Setup (esegui sulla VPS)

```bash
# 1. Connettiti alla VPS
ssh root@tua-vps-ip

# 2. Scarica lo script
curl -O https://raw.githubusercontent.com/TUO_USER/SmartMoney/main/scripts/setup-vps.sh

# 3. Esegui setup
chmod +x setup-vps.sh
sudo bash setup-vps.sh
```

Lo script ti chiederà:
- Dominio o IP della VPS
- Se vuoi HTTPS (consigliato)
- Email per certificati SSL

### Deploy successivi (esegui dal tuo PC)

```bash
# Dalla cartella del progetto
bash scripts/deploy.sh root@tua-vps-ip
```

---

## Opzione 2: Docker Compose

### Requisiti
- Docker
- Docker Compose

### Avvio

```bash
# 1. Crea file .env
cp .env.example .env
nano .env  # modifica le variabili

# 2. Avvia tutto
docker-compose up -d

# 3. Verifica
docker-compose ps
docker-compose logs -f api
```

### Comandi utili

```bash
docker-compose down          # Ferma tutto
docker-compose restart api   # Riavvia solo API
docker-compose logs -f       # Vedi logs
docker-compose exec db psql -U smartmoney  # Accedi al DB
```

---

## Opzione 3: GitHub Actions (CI/CD Automatico)

### Setup

1. Vai su GitHub → Repository → Settings → Secrets

2. Aggiungi questi secrets:
   - `VPS_HOST`: IP o dominio della VPS
   - `VPS_USER`: utente SSH (es: root)
   - `VPS_SSH_KEY`: chiave privata SSH

3. Ogni push su `main` farà deploy automatico

### Generare chiave SSH

```bash
# Sul tuo PC
ssh-keygen -t ed25519 -C "github-actions"

# Copia la chiave pubblica sulla VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@tua-vps-ip

# Copia la chiave privata come secret su GitHub
cat ~/.ssh/id_ed25519
```

---

## Struttura VPS dopo il deploy

```
/var/www/smartmoney/
├── .env                 # Configurazione
├── CREDENTIALS.txt      # Credenziali (elimina!)
├── deploy.sh            # Script deploy
├── logs/                # Log nginx
└── app/
    └── apps/
        └── api/
            ├── dist/    # Codice compilato
            ├── prisma/  # Schema DB
            └── node_modules/
```

---

## Comandi utili sulla VPS

```bash
# Stato servizi
pm2 status
pm2 logs smartmoney-api

# Riavvia
pm2 restart smartmoney-api

# Database
sudo -u postgres psql smartmoney

# Nginx
sudo systemctl status nginx
sudo nginx -t
sudo systemctl reload nginx

# Certificati SSL
sudo certbot renew --dry-run
```

---

## Troubleshooting

### API non risponde
```bash
pm2 logs smartmoney-api --lines 50
```

### Errore database
```bash
cd /var/www/smartmoney/app/apps/api
npx prisma db push --accept-data-loss
```

### Errore Nginx
```bash
sudo nginx -t
sudo tail -f /var/www/smartmoney/logs/nginx_error.log
```

### Rinnovo certificati SSL fallito
```bash
sudo certbot renew --force-renewal
```
