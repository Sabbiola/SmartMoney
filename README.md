# SmartMoney

App mobile per la gestione intelligente dei risparmi personali.

## Caratteristiche

- Dashboard con panoramica finanziaria
- Gestione transazioni (entrate/spese/trasferimenti)
- Categorie personalizzabili
- Budget mensili e settimanali
- Obiettivi di risparmio con tracking
- Report e grafici dettagliati
- Multi-account (conti bancari, contanti, carte)
- Tema chiaro/scuro

## Tech Stack

### Mobile App
- React Native + Expo
- TypeScript
- Zustand (state management)
- Expo Router (navigation)

### Backend API
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Struttura Progetto

```
SmartMoney/
├── apps/
│   ├── mobile/          # App React Native
│   │   ├── app/         # Schermate (expo-router)
│   │   └── src/
│   │       ├── components/
│   │       ├── store/
│   │       ├── services/
│   │       ├── theme/
│   │       └── types/
│   │
│   └── api/             # Backend Express
│       ├── prisma/      # Schema database
│       └── src/
│           ├── routes/
│           ├── middleware/
│           └── config/
│
└── packages/
    └── shared/          # Codice condiviso
```

## Setup

### Prerequisiti

- Node.js >= 18
- PostgreSQL
- Expo CLI (`npm install -g expo-cli`)

### Installazione

```bash
# Installa dipendenze
npm install

# Configura variabili ambiente
cp apps/api/.env.example apps/api/.env
# Modifica DATABASE_URL e JWT_SECRET

# Setup database
cd apps/api
npx prisma generate
npx prisma db push

# Avvia development
npm run dev
```

### Avvio Singole App

```bash
# Solo mobile
npm run mobile

# Solo API
npm run api
```

## API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Transazioni
- `GET /api/transactions` - Lista transazioni
- `POST /api/transactions` - Crea transazione
- `PUT /api/transactions/:id` - Modifica
- `DELETE /api/transactions/:id` - Elimina

### Budget
- `GET /api/budgets` - Lista budget
- `POST /api/budgets` - Crea budget
- `GET /api/budgets/current` - Budget attivi

### Obiettivi
- `GET /api/goals` - Lista obiettivi
- `POST /api/goals` - Crea obiettivo
- `POST /api/goals/:id/contribute` - Aggiungi contributo

### Report
- `GET /api/reports/summary` - Riepilogo dashboard
- `GET /api/reports/expenses` - Spese per categoria
- `GET /api/reports/trend` - Trend mensile

## License

MIT
