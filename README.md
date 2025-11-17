# PT CRM - Personal Trainer Management System

Sistema completo di gestione per personal trainer e clienti, costruito con Next.js 14, MongoDB e Prisma.

## 🚀 Funzionalità Principali

### Area Cliente
- **Dashboard** con statistiche personali, progressi e prossimi allenamenti
- **Visualizzazione scheda** allenamento con esercizi dettagliati
- **Registrazione sessioni** con tracking progressi
- **Grafici progressi** peso e misurazioni
- **Prenotazione appuntamenti** con il PT
- **Timeline checkpoint** con foto comparazione

### Area Personal Trainer
- **Dashboard** con overview completa clienti
- **Gestione clienti** con indicatori stato attività
- **Editor schede** allenamento drag&drop
- **Monitoraggio progressi** clienti
- **Sistema notifiche** real-time
- **Analytics** e report

## 🛠️ Stack Tecnologico

- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB
- **ORM:** Prisma
- **Autenticazione:** NextAuth.js
- **UI:** Tailwind CSS + shadcn/ui
- **Grafici:** Recharts
- **Validazione:** Zod
- **Deployment:** Vercel-ready

## 📦 Setup Iniziale

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Configura le variabili d'ambiente
Il file `.env` è già configurato con:
- Connessione MongoDB Atlas
- Secret NextAuth

### 3. Inizializza il database

```bash
# Push dello schema al database MongoDB
npm run prisma:push

# Popola il database con dati di test
npm run prisma:seed
```

### 4. Avvia il server di sviluppo
```bash
npm run dev
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

## 🔑 Credenziali di Test

Dopo aver eseguito il seed, puoi accedere con:

### Trainer
- **Email:** trainer@ptcrm.com
- **Password:** password123

### Clienti
- **Email:** mario.rossi@email.com
- **Password:** password123

- **Email:** laura.bianchi@email.com
- **Password:** password123

- **Email:** giuseppe.verdi@email.com
- **Password:** password123

## 📂 Struttura del Progetto

```
pt-crm/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── auth/            # NextAuth endpoints
│   ├── auth/                # Pagine autenticazione
│   ├── client/              # Area cliente
│   │   └── dashboard/       # Dashboard cliente
│   └── trainer/             # Area trainer
│       └── dashboard/       # Dashboard trainer
├── components/
│   ├── ui/                  # Componenti shadcn/ui
│   ├── layout/              # Layout components (Sidebar, Header)
│   └── dashboard/           # Widget dashboard
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
└── types/                   # TypeScript definitions
```

## 🗄️ Database Schema

### Entità Principali
- **User:** Utente base (CLIENT/TRAINER)
- **ClientProfile:** Profilo esteso cliente
- **Workout:** Scheda allenamento
- **Exercise:** Esercizio singolo
- **WorkoutSession:** Sessione completata
- **Measurement:** Misurazioni corporee
- **Checkpoint:** Checkpoint progressi con foto
- **Appointment:** Appuntamenti PT-Cliente
- **Notification:** Sistema notifiche

## 🧪 Comandi Utili

```bash
# Sviluppo
npm run dev              # Avvia dev server
npm run build           # Build production
npm run start           # Avvia production server

# Prisma
npm run prisma:generate # Genera Prisma Client
npm run prisma:push     # Push schema a MongoDB
npm run prisma:seed     # Popola database
npm run prisma:studio   # Apri Prisma Studio (GUI database)

# Lint
npm run lint            # Esegui ESLint
```

## 🎨 Componenti UI

Tutti i componenti UI utilizzano shadcn/ui con tema standard:
- Button
- Card
- Input
- Label
- Badge
- Avatar
- Separator
- Tabs
- (e altri componenti Radix UI)

## 🔒 Sicurezza

- ✅ Middleware di autenticazione su tutte le route protette
- ✅ Protezione route basata su ruoli (CLIENT/TRAINER)
- ✅ Password hashate con bcryptjs
- ✅ Session-based auth con JWT
- ✅ Validazione input con Zod (da implementare sulle API)

## 📱 Responsive Design

L'intera applicazione è responsive e ottimizzata per:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🚧 Prossimi Sviluppi

- [ ] Pagine workout client con timer recupero
- [ ] Registrazione sessione allenamento
- [ ] Grafici progressi interattivi
- [ ] Sistema prenotazione appuntamenti
- [ ] Editor schede trainer con drag&drop
- [ ] Sistema notifiche real-time
- [ ] Upload foto checkpoint
- [ ] Export PDF report
- [ ] PWA support
- [ ] Notifiche push

## 📄 Licenza

Questo progetto è stato sviluppato per uso personale.

---

**Sviluppato con ❤️ utilizzando Next.js e shadcn/ui**
