# PT CRM - Personal Trainer Management System

Sistema completo di gestione per personal trainer e clienti, costruito con Next.js 14, MongoDB e Prisma.

## 🚀 Funzionalità Implementate

### 🏃 Area Cliente

#### 1. Dashboard (`/client/dashboard`)
- Statistiche personali (allenamenti, streak, peso, appuntamenti)
- Grafico progressi peso ultimi 30 giorni
- Activity feed con attività recenti
- Widget prossimo allenamento con scadenza scheda
- Indicatori trend con percentuali

#### 2. Il Mio Allenamento (`/client/workout`)
- Visualizzazione scheda attiva con tutti gli esercizi
- Card esercizi con serie, ripetizioni, peso e recupero
- Timer recupero interattivo con play/pause/reset
- Indicatore giorni alla scadenza scheda
- Consigli per l'allenamento in sidebar
- Pulsante "Inizia Allenamento" per registrazione sessione
- Design responsive mobile-friendly

#### 3. Registrazione Sessione (`/client/session/new`)
- Form guidato esercizio per esercizio
- Progress bar avanzamento
- Registrazione peso utilizzato e serie completate
- Note personalizzate per ogni esercizio
- Sistema rating stelle (1-5) per feedback finale
- Riepilogo completo prima del salvataggio
- Navigazione avanti/indietro tra esercizi

#### 4. Progressi (`/client/progress`)
- **Tabs organizzati:**
  - Peso: grafico andamento peso corporeo
  - Circonferenze: petto, vita, fianchi
  - % Grasso: percentuale grasso corporeo
  - Misurazioni: storico completo
  - Allenamenti: sessioni completate con rating
- Statistiche con confronto misurazioni precedenti
- Grafici interattivi multi-linea con Recharts
- Badge indicatori trend (↑ / ↓)
- Export dati (da implementare)

#### 5. Appuntamenti (`/client/appointments`)
- Visualizzazione appuntamenti futuri e passati
- Stati: PENDING, CONFIRMED, COMPLETED, CANCELLED
- Dettagli data, ora e tipo appuntamento
- Pulsante prenotazione (UI ready, logica da completare)

---

### 👨‍🏫 Area Personal Trainer

#### 1. Dashboard (`/trainer/dashboard`)
- Overview clienti con statistiche aggregate
- Lista clienti con indicatori stato:
  - 🟢 **Attivo**: allenamento negli ultimi 3 giorni
  - 🟡 **Attenzione**: 3-7 giorni dall'ultimo allenamento o scheda in scadenza ≤7 giorni
  - 🔴 **Inattivo**: oltre 7 giorni dall'ultimo allenamento
- Card notifiche in tempo reale
- Scadenze schede in evidenza
- Statistiche: clienti totali, attivi, sessioni settimanali

#### 2. Gestione Clienti (`/trainer/clients`)
- Lista completa clienti con filtri
- **Tabs per categoria:**
  - Tutti
  - Attivi
  - Richiedono Attenzione
  - Inattivi
- Search bar per ricerca (UI ready)
- Card clienti con:
  - Avatar con indicatore stato
  - Ultimo allenamento
  - Numero sessioni totali
  - Giorni alla scadenza scheda
- Contatori statistiche per categoria
- Click card per dettaglio cliente

#### 3. Dettaglio Cliente (`/trainer/clients/[id]`)
- **Header completo:**
  - Avatar e info contatto (email, telefono)
  - Data iscrizione
  - Quick stats (allenamenti, misurazioni, schede, feedback positivi)
  - Obiettivi cliente in evidenza

- **Tabs organizzati:**

  **Scheda:**
  - Visualizzazione scheda attiva
  - Lista completa esercizi con ExerciseCard
  - Statistiche scheda (data creazione, scadenza, sessioni)
  - Pulsante modifica scheda

  **Progressi:**
  - Grafici peso e misurazioni
  - Storico ultime 5 misurazioni
  - Trend con valori

  **Feedback:**
  - Tutti i feedback sessioni con rating
  - Commenti completi cliente
  - Data e ora allenamento

  **Note:**
  - Note private trainer (solo visibili al PT)
  - Textarea per annotazioni
  - Salvataggio note (da implementare)

#### 4. Notifiche (`/trainer/notifications`)
- Lista notifiche con filtro letto/non letto
- Tipi notifiche:
  - Allenamento completato
  - Promemoria allenamento
  - Appuntamento programmato
  - Misurazione aggiunta
  - Checkpoint in scadenza
  - Feedback ricevuto
  - Inattività cliente
- Badge colore per tipo notifica
- Contatore non lette
- Pulsante "Segna tutte come lette"

#### 5. Gestione Schede (`/trainer/workouts`)
- Pagina placeholder per editor schede
- Da implementare: template riutilizzabili

#### 6. Analytics (`/trainer/analytics`)
- Pagina placeholder per analytics avanzate
- Da implementare: report mensili, grafici aggregati

---

## 🛠️ Stack Tecnologico

- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB Atlas
- **ORM:** Prisma 6
- **Autenticazione:** NextAuth.js v4
- **UI:** Tailwind CSS + shadcn/ui (tema standard)
- **Grafici:** Recharts
- **Date:** date-fns (localizzazione italiana)
- **Icons:** Lucide React
- **TypeScript:** Full type-safety
- **Deployment:** Vercel-ready

---

## 📦 Setup e Installazione

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Configura le variabili d'ambiente
Il file `.env` è già configurato con:
- Connessione MongoDB Atlas
- Secret NextAuth

**Per produzione, aggiorna:**
```env
NEXTAUTH_SECRET="genera-una-chiave-sicura"
NEXTAUTH_URL="https://tuo-dominio.com"
```

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

---

## 🔑 Credenziali di Test

Dopo aver eseguito il seed (`npm run prisma:seed`):

### Trainer
- **Email:** `trainer@ptcrm.com`
- **Password:** `password123`

### Clienti
- **Email:** `mario.rossi@email.com` (con scheda attiva e dati)
- **Email:** `laura.bianchi@email.com`
- **Email:** `giuseppe.verdi@email.com`
- **Password:** `password123` (per tutti)

---

## 📂 Struttura del Progetto

```
pt-crm/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/[nextauth]/     # NextAuth API
│   │   └── sessions/            # API sessioni allenamento
│   ├── auth/signin/             # Pagina login
│   ├── client/                  # Area Cliente
│   │   ├── dashboard/           # Dashboard cliente
│   │   ├── workout/             # Visualizzazione scheda
│   │   ├── session/new/         # Registrazione sessione
│   │   ├── progress/            # Progressi e grafici
│   │   └── appointments/        # Appuntamenti
│   └── trainer/                 # Area Trainer
│       ├── dashboard/           # Dashboard trainer
│       ├── clients/             # Gestione clienti
│       │   └── [id]/           # Dettaglio cliente
│       ├── workouts/            # Editor schede
│       ├── analytics/           # Analytics
│       └── notifications/       # Notifiche
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── layout/                  # Sidebar, Header
│   ├── dashboard/               # StatsCard, Charts, ActivityFeed
│   ├── workout/                 # ExerciseCard, Timer, SessionRecorder
│   └── client/                  # ClientCard
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # NextAuth configuration
│   └── utils.ts                # Utility functions (cn)
├── prisma/
│   ├── schema.prisma           # Database schema completo
│   └── seed.ts                 # Seed dati test
├── types/
│   └── next-auth.d.ts          # Type extensions NextAuth
└── middleware.ts                # Route protection
```

---

## 🗄️ Database Schema

### Entità Principali

- **User**: Utente base (CLIENT/TRAINER)
- **ClientProfile**: Profilo esteso cliente con obiettivi
- **Workout**: Scheda allenamento
- **Exercise**: Singolo esercizio (serie, ripetizioni, peso, recupero)
- **WorkoutSession**: Sessione allenamento completata con rating e feedback
- **Measurement**: Misurazioni corporee (peso, circonferenze, % grasso)
- **Checkpoint**: Checkpoint progressi con foto
- **AppointmentClient/AppointmentTrainer**: Appuntamenti
- **Notification**: Sistema notifiche con tipi multipli

### Relazioni Principali
- User → ClientProfile (1:1)
- ClientProfile → Workouts (1:N)
- Workout → Exercises (1:N)
- User → WorkoutSessions (1:N)
- User → Measurements (1:N)
- User → Notifications (1:N)

---

## 🧪 Comandi Utili

```bash
# Sviluppo
npm run dev              # Avvia dev server (localhost:3000)
npm run build           # Build production
npm run start           # Avvia production server

# Prisma
npm run prisma:generate # Genera Prisma Client
npm run prisma:push     # Push schema a MongoDB
npm run prisma:seed     # Popola database con dati test
npm run prisma:studio   # Apri Prisma Studio (GUI database)

# Lint
npm run lint            # Esegui ESLint
```

---

## 🎨 Componenti UI

Tutti i componenti utilizzano **shadcn/ui** con tema standard:

### Base Components
- `Button`, `Card`, `Input`, `Label`
- `Badge`, `Avatar`, `Separator`, `Tabs`

### Custom Components
- **StatsCard**: Card statistica con icona e trend
- **ProgressChart**: Grafico linea singola
- **MultiLineChart**: Grafico multi-linea per confronti
- **ActivityFeed**: Feed attività con timeline
- **ExerciseCard**: Card esercizio con dettagli completi
- **RestTimer**: Timer recupero interattivo
- **SessionRecorder**: Form registrazione sessione guidato
- **ClientCard**: Card cliente con stati e indicatori

---

## 🔒 Sicurezza

- ✅ Middleware di autenticazione su route protette
- ✅ Protezione route role-based (CLIENT/TRAINER)
- ✅ Password hashate con bcryptjs (salt 10)
- ✅ Session JWT con NextAuth
- ✅ Validazione permessi nelle API
- ✅ MongoDB connection string sicura in .env
- ⚠️ Validazione input con Zod (da completare API)
- ⚠️ Rate limiting (da implementare)
- ⚠️ HTTPS obbligatorio in produzione

---

## 📱 Responsive Design

L'applicazione è completamente responsive:

- **Desktop** (1024px+): Layout sidebar fisso, grafici full-width
- **Tablet** (768px-1023px): Sidebar collassabile
- **Mobile** (<768px): Sidebar nascosta, menu hamburger, cards stack

### Breakpoints Tailwind
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## 🚀 Features Avanzate

### Già Implementate
- ✅ Calcolo automatico stato cliente (active/warning/inactive)
- ✅ Notifiche trainer quando cliente completa allenamento
- ✅ Grafici interattivi con Recharts
- ✅ Timer recupero con notifiche browser
- ✅ Formattazione date italiana (date-fns)
- ✅ Session recording con JSON exerciseData
- ✅ Sistema rating stelle per feedback
- ✅ Indicatori scadenza scheda dinamici
- ✅ Protezione route con middleware NextAuth

### In Roadmap
- [ ] Editor schede drag&drop
- [ ] Template schede riutilizzabili
- [ ] Upload foto checkpoint (Uploadthing)
- [ ] Export PDF report progressi
- [ ] Sistema prenotazione appuntamenti real-time
- [ ] Notifiche push (PWA)
- [ ] Chat in-app PT-Cliente
- [ ] Integrazione Google Calendar
- [ ] Gamification (badge, streak, obiettivi)
- [ ] Analytics avanzate trainer
- [ ] Dark mode
- [ ] Multi-lingua (i18n)

---

## 🐛 Troubleshooting

### Prisma Client non generato
```bash
npm run prisma:generate
```

### Errore connessione MongoDB
Verifica la stringa DATABASE_URL in `.env` e la whitelist IP su MongoDB Atlas.

### Errore NextAuth
Assicurati che `NEXTAUTH_SECRET` sia impostato. Genera uno con:
```bash
openssl rand -base64 32
```

### Hot reload non funziona
Riavvia il dev server:
```bash
npm run dev
```

---

## 📖 Guide Utili

### Aggiungere un nuovo componente shadcn/ui
```bash
npx shadcn-ui@latest add [component-name]
```

### Modificare lo schema Prisma
1. Modifica `prisma/schema.prisma`
2. Esegui `npm run prisma:push`
3. Rigenera client: `npm run prisma:generate`

### Creare una nuova API route
Crea file in `app/api/[nome]/route.ts` con handler GET/POST:
```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ data: "example" });
}
```

---

## 📄 Licenza

Questo progetto è stato sviluppato per uso personale.

---

## 🙏 Credits

- **Next.js**: Framework React
- **shadcn/ui**: Component library
- **Prisma**: ORM
- **NextAuth**: Authentication
- **Recharts**: Charting library
- **Lucide**: Icon library
- **Vercel**: Hosting platform

---

**Sviluppato con ❤️ utilizzando Next.js 14 e shadcn/ui**

Per domande o supporto, contatta il team di sviluppo.
