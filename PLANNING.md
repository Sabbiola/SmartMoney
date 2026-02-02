# SmartMoney - App di Gestione Risparmi

## Panoramica del Progetto

**SmartMoney** è un'applicazione mobile cross-platform per la gestione intelligente dei risparmi personali. L'app permette agli utenti di tracciare entrate, spese, impostare obiettivi di risparmio e visualizzare report dettagliati sulla propria situazione finanziaria.

---

## Stack Tecnologico Consigliato

### Frontend Mobile
- **Framework**: React Native con Expo
- **State Management**: Redux Toolkit / Zustand
- **UI Library**: React Native Paper / NativeBase
- **Navigazione**: React Navigation v6
- **Charts**: Victory Native / React Native Chart Kit

### Backend
- **Runtime**: Node.js con Express.js / Fastify
- **Database**: PostgreSQL (dati strutturati) + Redis (caching)
- **ORM**: Prisma
- **Autenticazione**: JWT + OAuth2 (Google, Apple)

### Infrastruttura
- **Cloud**: AWS / Firebase
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry

---

## Architettura dell'App

```
┌─────────────────────────────────────────────────────────────┐
│                      MOBILE APP                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Screens   │  │ Components  │  │   State Management  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    REST     │  │   GraphQL   │  │    WebSocket        │  │
│  │    API      │  │  (optional) │  │  (notifications)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  PostgreSQL │  │    Redis    │  │   Cloud Storage     │  │
│  │  (primary)  │  │   (cache)   │  │   (backups/media)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Features Dettagliate

### 1. Autenticazione e Profilo Utente

#### 1.1 Registrazione e Login
- [ ] Registrazione con email/password
- [ ] Login con email/password
- [ ] Login sociale (Google, Apple, Facebook)
- [ ] Verifica email
- [ ] Reset password
- [ ] Autenticazione biometrica (Face ID / Fingerprint)
- [ ] PIN di sicurezza per accesso rapido

#### 1.2 Profilo Utente
- [ ] Gestione dati personali (nome, foto profilo)
- [ ] Impostazione valuta predefinita
- [ ] Preferenze di notifica
- [ ] Tema (chiaro/scuro/sistema)
- [ ] Lingua dell'app
- [ ] Export dati personali (GDPR compliance)
- [ ] Eliminazione account

---

### 2. Dashboard Principale

#### 2.1 Overview Finanziaria
- [ ] Saldo totale disponibile
- [ ] Totale risparmi accumulati
- [ ] Spese del mese corrente
- [ ] Entrate del mese corrente
- [ ] Trend rispetto al mese precedente (%)
- [ ] Grafico andamento ultimi 6 mesi

#### 2.2 Widget Rapidi
- [ ] Aggiunta rapida spesa
- [ ] Aggiunta rapida entrata
- [ ] Obiettivo risparmio principale con progress bar
- [ ] Prossime scadenze/pagamenti ricorrenti

---

### 3. Gestione Transazioni

#### 3.1 Registrazione Transazioni
- [ ] Aggiunta manuale spesa/entrata
- [ ] Categorie predefinite (cibo, trasporti, bollette, etc.)
- [ ] Categorie personalizzate
- [ ] Sottocategorie
- [ ] Note e descrizioni
- [ ] Allegati (foto scontrini, documenti)
- [ ] Tag personalizzati
- [ ] Geolocalizzazione (opzionale)
- [ ] Data e ora transazione

#### 3.2 Transazioni Ricorrenti
- [ ] Impostazione spese ricorrenti (affitto, abbonamenti, etc.)
- [ ] Impostazione entrate ricorrenti (stipendio, etc.)
- [ ] Frequenza personalizzabile (giornaliera, settimanale, mensile, annuale)
- [ ] Notifiche promemoria
- [ ] Modifica/eliminazione ricorrenze

#### 3.3 Storico Transazioni
- [ ] Lista cronologica transazioni
- [ ] Filtri avanzati (data, categoria, importo, tipo)
- [ ] Ricerca testuale
- [ ] Modifica transazioni esistenti
- [ ] Eliminazione transazioni
- [ ] Duplicazione transazioni

---

### 4. Budget e Pianificazione

#### 4.1 Gestione Budget
- [ ] Budget mensile globale
- [ ] Budget per categoria
- [ ] Visualizzazione spesa vs budget
- [ ] Avvisi al raggiungimento soglie (50%, 80%, 100%)
- [ ] Storico budget mesi precedenti
- [ ] Suggerimenti automatici basati su storico

#### 4.2 Pianificazione Finanziaria
- [ ] Previsione spese future
- [ ] Simulazione scenari "what-if"
- [ ] Calendario pagamenti
- [ ] Piano di rientro debiti

---

### 5. Obiettivi di Risparmio

#### 5.1 Creazione Obiettivi
- [ ] Nome obiettivo (es. "Vacanza", "Auto nuova", "Fondo emergenza")
- [ ] Importo target
- [ ] Data obiettivo
- [ ] Immagine/icona personalizzata
- [ ] Priorità obiettivo

#### 5.2 Tracking Obiettivi
- [ ] Progress bar visuale
- [ ] Contributi manuali all'obiettivo
- [ ] Contributi automatici programmati
- [ ] Storico versamenti
- [ ] Proiezione raggiungimento obiettivo
- [ ] Notifiche milestone (25%, 50%, 75%, 100%)

#### 5.3 Gamification
- [ ] Badge e achievement
- [ ] Streak di risparmio giornaliero
- [ ] Sfide settimanali/mensili
- [ ] Classifica (opzionale, con amici)

---

### 6. Report e Analisi

#### 6.1 Report Spese
- [ ] Grafico a torta per categoria
- [ ] Grafico a barre comparativo mensile
- [ ] Trend spese nel tempo (line chart)
- [ ] Top 5 categorie di spesa
- [ ] Confronto mese su mese
- [ ] Confronto anno su anno

#### 6.2 Report Entrate
- [ ] Breakdown fonti di reddito
- [ ] Trend entrate nel tempo
- [ ] Rapporto entrate/spese

#### 6.3 Report Risparmi
- [ ] Tasso di risparmio mensile
- [ ] Patrimonio netto nel tempo
- [ ] Proiezione risparmi futuri

#### 6.4 Export Report
- [ ] Export PDF
- [ ] Export Excel/CSV
- [ ] Condivisione report via email
- [ ] Report programmati automatici

---

### 7. Conti e Metodi di Pagamento

#### 7.1 Gestione Conti
- [ ] Aggiunta conti bancari (manuale)
- [ ] Aggiunta carte di credito/debito
- [ ] Aggiunta contanti
- [ ] Aggiunta investimenti
- [ ] Saldo per ogni conto
- [ ] Trasferimenti tra conti

#### 7.2 Integrazione Bancaria (Fase 2)
- [ ] Open Banking API integration
- [ ] Sincronizzazione automatica transazioni
- [ ] Categorizzazione automatica con AI

---

### 8. Notifiche e Promemoria

#### 8.1 Tipi di Notifiche
- [ ] Promemoria pagamenti ricorrenti
- [ ] Avviso superamento budget
- [ ] Obiettivo raggiunto
- [ ] Riepilogo settimanale
- [ ] Riepilogo mensile
- [ ] Transazioni insolite (anti-frode)

#### 8.2 Personalizzazione
- [ ] Orari preferiti notifiche
- [ ] Canali (push, email, SMS)
- [ ] Frequenza notifiche
- [ ] Do not disturb

---

### 9. Sicurezza e Privacy

#### 9.1 Sicurezza Dati
- [ ] Crittografia end-to-end
- [ ] Backup automatico cloud criptato
- [ ] Autenticazione a due fattori (2FA)
- [ ] Logout automatico per inattività
- [ ] Blocco screenshot (opzionale)

#### 9.2 Privacy
- [ ] Dati archiviati localmente (opzione offline)
- [ ] Nessuna vendita dati a terzi
- [ ] Conformità GDPR
- [ ] Politica privacy trasparente

---

### 10. Features Avanzate (Fase 2)

#### 10.1 Intelligenza Artificiale
- [ ] Categorizzazione automatica spese
- [ ] Suggerimenti risparmio personalizzati
- [ ] Previsione spese future
- [ ] Rilevamento spese anomale
- [ ] Chatbot assistente finanziario

#### 10.2 Funzionalità Social
- [ ] Condivisione obiettivi con partner/famiglia
- [ ] Gestione spese condivise (roommates)
- [ ] Split expenses con amici

#### 10.3 Integrazioni
- [ ] Import da altre app (Mint, YNAB, etc.)
- [ ] Integrazione con Google Sheets
- [ ] Widget home screen
- [ ] Apple Watch / Wear OS app
- [ ] Siri/Google Assistant shortcuts

---

## Struttura delle Schermate

```
App
├── 🔐 Auth Flow
│   ├── Welcome Screen
│   ├── Login Screen
│   ├── Register Screen
│   └── Forgot Password Screen
│
├── 📊 Main Tab Navigator
│   ├── Home (Dashboard)
│   ├── Transactions
│   ├── ➕ Add Transaction (FAB)
│   ├── Budget
│   └── Profile
│
├── 💰 Transactions Stack
│   ├── Transaction List
│   ├── Transaction Detail
│   ├── Add/Edit Transaction
│   └── Transaction Filters
│
├── 🎯 Goals Stack
│   ├── Goals List
│   ├── Goal Detail
│   ├── Add/Edit Goal
│   └── Add Contribution
│
├── 📈 Reports Stack
│   ├── Reports Overview
│   ├── Expense Report
│   ├── Income Report
│   └── Savings Report
│
├── 💳 Accounts Stack
│   ├── Accounts List
│   ├── Account Detail
│   └── Add/Edit Account
│
└── ⚙️ Settings Stack
    ├── Settings Main
    ├── Notifications
    ├── Security
    ├── Categories Management
    ├── Data Export
    └── About
```

---

## Modello Dati (Database Schema)

### Tabelle Principali

```sql
-- Utenti
Users
├── id (UUID, PK)
├── email (unique)
├── password_hash
├── name
├── avatar_url
├── currency (default: EUR)
├── language (default: it)
├── theme (light/dark/system)
├── created_at
└── updated_at

-- Conti
Accounts
├── id (UUID, PK)
├── user_id (FK -> Users)
├── name
├── type (bank/cash/card/investment)
├── balance
├── currency
├── color
├── icon
├── is_active
├── created_at
└── updated_at

-- Categorie
Categories
├── id (UUID, PK)
├── user_id (FK -> Users, nullable for defaults)
├── name
├── type (income/expense)
├── icon
├── color
├── parent_id (FK -> Categories, for subcategories)
├── is_default
├── created_at
└── updated_at

-- Transazioni
Transactions
├── id (UUID, PK)
├── user_id (FK -> Users)
├── account_id (FK -> Accounts)
├── category_id (FK -> Categories)
├── type (income/expense/transfer)
├── amount
├── currency
├── description
├── notes
├── date
├── location (JSON: lat, lng, address)
├── attachments (JSON array)
├── tags (JSON array)
├── is_recurring
├── recurring_id (FK -> RecurringTransactions)
├── created_at
└── updated_at

-- Transazioni Ricorrenti
RecurringTransactions
├── id (UUID, PK)
├── user_id (FK -> Users)
├── account_id (FK -> Accounts)
├── category_id (FK -> Categories)
├── type (income/expense)
├── amount
├── description
├── frequency (daily/weekly/monthly/yearly)
├── frequency_value (1, 2, etc.)
├── start_date
├── end_date (nullable)
├── next_occurrence
├── is_active
├── created_at
└── updated_at

-- Budget
Budgets
├── id (UUID, PK)
├── user_id (FK -> Users)
├── category_id (FK -> Categories, nullable for global)
├── amount
├── period (monthly/weekly)
├── start_date
├── end_date
├── created_at
└── updated_at

-- Obiettivi di Risparmio
SavingsGoals
├── id (UUID, PK)
├── user_id (FK -> Users)
├── name
├── target_amount
├── current_amount
├── target_date
├── image_url
├── color
├── priority
├── is_completed
├── completed_at
├── created_at
└── updated_at

-- Contributi agli Obiettivi
GoalContributions
├── id (UUID, PK)
├── goal_id (FK -> SavingsGoals)
├── amount
├── date
├── notes
├── created_at
└── updated_at

-- Notifiche
Notifications
├── id (UUID, PK)
├── user_id (FK -> Users)
├── type
├── title
├── body
├── data (JSON)
├── is_read
├── created_at
└── read_at
```

---

## API Endpoints (REST)

### Autenticazione
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
```

### Utenti
```
GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me
PUT    /api/users/me/password
PUT    /api/users/me/preferences
```

### Conti
```
GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/:id
PUT    /api/accounts/:id
DELETE /api/accounts/:id
POST   /api/accounts/transfer
```

### Transazioni
```
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/recurring
POST   /api/transactions/recurring
PUT    /api/transactions/recurring/:id
DELETE /api/transactions/recurring/:id
```

### Categorie
```
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Budget
```
GET    /api/budgets
POST   /api/budgets
GET    /api/budgets/:id
PUT    /api/budgets/:id
DELETE /api/budgets/:id
GET    /api/budgets/current
```

### Obiettivi
```
GET    /api/goals
POST   /api/goals
GET    /api/goals/:id
PUT    /api/goals/:id
DELETE /api/goals/:id
POST   /api/goals/:id/contribute
GET    /api/goals/:id/contributions
```

### Report
```
GET    /api/reports/summary
GET    /api/reports/expenses
GET    /api/reports/income
GET    /api/reports/savings
GET    /api/reports/export
```

---

## Piano di Sviluppo (Roadmap)

### Fase 1 - MVP (4-6 settimane)
**Obiettivo**: App funzionante con features core

| Settimana | Attività |
|-----------|----------|
| 1 | Setup progetto, autenticazione, struttura navigazione |
| 2 | Dashboard, gestione conti |
| 3 | Transazioni (CRUD, categorie) |
| 4 | Budget base, report semplici |
| 5 | Obiettivi di risparmio |
| 6 | Testing, bug fixing, polish UI |

**Features MVP**:
- [x] Autenticazione email/password
- [x] Dashboard con saldo e overview
- [x] Gestione transazioni manuali
- [x] Categorie predefinite
- [x] Budget mensile globale
- [x] Un obiettivo di risparmio
- [x] Report spese base

### Fase 2 - Enhancements (4 settimane)
- [ ] Transazioni ricorrenti
- [ ] Categorie personalizzate
- [ ] Budget per categoria
- [ ] Obiettivi multipli con gamification
- [ ] Report avanzati con grafici
- [ ] Notifiche push
- [ ] Tema scuro

### Fase 3 - Advanced (4 settimane)
- [ ] Login sociale
- [ ] Biometria
- [ ] Multi-account
- [ ] Export dati
- [ ] Allegati foto
- [ ] Widget home screen

### Fase 4 - AI & Integrations (ongoing)
- [ ] Categorizzazione AI
- [ ] Open Banking
- [ ] Suggerimenti personalizzati
- [ ] Apple Watch app

---

## Struttura Cartelle Progetto

```
SmartMoney/
├── apps/
│   ├── mobile/                 # React Native App
│   │   ├── src/
│   │   │   ├── components/     # Componenti riutilizzabili
│   │   │   ├── screens/        # Schermate dell'app
│   │   │   ├── navigation/     # Configurazione navigazione
│   │   │   ├── store/          # State management
│   │   │   ├── services/       # API calls, utilities
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── theme/          # Stili e temi
│   │   │   ├── utils/          # Funzioni utility
│   │   │   ├── types/          # TypeScript types
│   │   │   └── constants/      # Costanti app
│   │   ├── assets/             # Immagini, font
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── api/                    # Backend Node.js
│       ├── src/
│       │   ├── controllers/    # Route handlers
│       │   ├── models/         # Database models
│       │   ├── routes/         # API routes
│       │   ├── middleware/     # Auth, validation, etc.
│       │   ├── services/       # Business logic
│       │   ├── utils/          # Utilities
│       │   └── config/         # Configuration
│       ├── prisma/             # Database schema
│       └── package.json
│
├── packages/
│   └── shared/                 # Codice condiviso
│       ├── types/              # TypeScript interfaces
│       ├── constants/          # Shared constants
│       └── utils/              # Shared utilities
│
├── docs/                       # Documentazione
├── .github/                    # GitHub Actions
├── docker-compose.yml          # Docker setup
├── package.json                # Root package.json (monorepo)
├── turbo.json                  # Turborepo config
└── README.md
```

---

## Considerazioni UX/UI

### Principi di Design
1. **Semplicità**: Interfaccia pulita, non sovraccarica
2. **Velocità**: Azioni rapide per operazioni frequenti
3. **Feedback visivo**: Animazioni e conferme per ogni azione
4. **Accessibilità**: Supporto screen reader, contrasto adeguato
5. **Consistenza**: Pattern di design uniformi in tutta l'app

### Palette Colori Suggerita
- **Primary**: #4CAF50 (Verde - crescita, denaro)
- **Secondary**: #2196F3 (Blu - fiducia, stabilità)
- **Accent**: #FF9800 (Arancione - attenzione, warning)
- **Error**: #F44336 (Rosso - spese, alert)
- **Success**: #8BC34A (Verde chiaro - risparmi, obiettivi)
- **Background Light**: #FAFAFA
- **Background Dark**: #121212

### Tipografia
- **Font principale**: Inter / Roboto
- **Font numeri**: Roboto Mono (per allineamento cifre)

---

## Metriche di Successo (KPIs)

### Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration media
- Transazioni registrate per utente/settimana

### Retention
- Retention Day 1, Day 7, Day 30
- Churn rate mensile
- Lifetime Value (LTV)

### Business
- Tasso di conversione free -> premium (se applicabile)
- NPS (Net Promoter Score)
- App Store rating

---

## Note Finali

Questo planning rappresenta una visione completa dell'app SmartMoney. Si consiglia di:

1. **Iniziare con l'MVP** - Validare l'idea con le features core
2. **Iterare velocemente** - Rilasciare spesso, raccogliere feedback
3. **Prioritizzare la UX** - Un'app finanziaria deve essere semplice e affidabile
4. **Sicurezza first** - I dati finanziari sono sensibili, investire in sicurezza

---

*Documento creato: Febbraio 2026*
*Versione: 1.0*
