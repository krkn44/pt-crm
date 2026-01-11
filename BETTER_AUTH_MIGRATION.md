# Migrazione a Better-Auth e Integrazione Resend

## 📝 Panoramica

L'applicazione PT CRM è stata migrata da NextAuth.js a **Better-Auth** per una gestione dell'autenticazione più moderna e flessibile. È stata aggiunta l'integrazione con **Resend** per l'invio di email (verifica account, reset password, notifiche).

## ✅ Modifiche Implementate

### 1. **Better-Auth Setup**

#### Installazione Pacchetti
```bash
npm install better-auth resend
```

#### File Creati
- `lib/auth-better.ts` - Configurazione Better-Auth server-side
- `lib/auth-client.ts` - Client Better-Auth per componenti React
- `app/api/auth/[...all]/route.ts` - API route unificata Better-Auth

#### Schema Prisma Aggiornato
Aggiunti modelli necessari per Better-Auth:
- `Session` - Gestione sessioni utente
- `Account` - Supporto OAuth providers (futuro)
- `Verification` - Token verifica email

Campi aggiunti al model `User`:
- `name` - Nome completo (compatibilità Better-Auth)
- `emailVerified` - Stato verifica email
- `image` - Avatar utente (opzionale)

### 2. **Resend Email Integration**

#### Funzionalità Email
Better-Auth è configurato per inviare email tramite Resend per:
- ✅ **Verifica Email** - Email di benvenuto con link verifica
- ✅ **Reset Password** - Email con link per reimpostare la password
- ✅ **Notifiche** (futuro) - Email per eventi importanti

#### Template Email
Template HTML responsive inclusi in `lib/auth-better.ts`:
- Design moderno e mobile-friendly
- Branding PT CRM
- Call-to-action chiare

### 3. **Pagine Autenticazione**

#### Migrate/Aggiornate
- ✅ `/auth/signin` - Login aggiornato per Better-Auth
- ✅ `/auth/forgot-password` - Nuova pagina reset password
- ✅ Middleware aggiornato per Better-Auth sessions

#### Componenti Aggiornati
- ✅ `Sidebar` - Logout aggiornato per Better-Auth
- ✅ Layouts - Rimozione dipendenze NextAuth

## 🔧 Configurazione Ambiente

### Variabili d'Ambiente Richieste

Aggiungi al tuo file `.env`:

```env
# Database (già presente)
DATABASE_URL="mongodb+srv://..."

# Better-Auth
BETTER_AUTH_SECRET="your-super-secret-key-min-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Resend (Email Service)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="PT CRM <noreply@yourdomain.com>"
```

### Ottenere le API Keys

#### 1. **Better-Auth Secret**
Genera un secret sicuro:
```bash
openssl rand -base64 32
```

#### 2. **Resend API Key**

1. Vai su [https://resend.com](https://resend.com)
2. Crea un account gratuito
3. Verifica il tuo dominio (o usa il sandbox per test)
4. Naviga a **API Keys** nel dashboard
5. Crea una nuova API key
6. Copia la key (inizia con `re_...`)

**Piano Gratuito Resend:**
- 100 email/giorno
- 3,000 email/mese
- Tutti i template email
- Ottimo per testing e piccole applicazioni

#### 3. **Domini Email**

**Per Testing (Sandbox):**
```env
EMAIL_FROM="PT CRM <onboarding@resend.dev>"
```
- Emails vengono inviate solo a email verificate nel tuo account

**Per Produzione:**
```env
EMAIL_FROM="PT CRM <noreply@tuodominio.com>"
```
- Richiede verifica dominio in Resend
- Segui le istruzioni per aggiungere record DNS

## 📦 Setup Database

### 1. Genera Prisma Client
```bash
npm run prisma:generate
```

### 2. Aggiorna Database Schema
```bash
npm run prisma:push
```

Questo creerà le nuove tabelle:
- `sessions`
- `accounts`
- `verifications`

E aggiornerà la tabella `users` con i nuovi campi.

### 3. Migrazione Dati Esistenti (Opzionale)

Se hai già utenti nel database, esegui questo script per popolare il campo `name`:

```javascript
// scripts/migrate-users.js
const { prisma } = require('./lib/prisma');

async function migrateUsers() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    if (!user.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: `${user.nome} ${user.cognome}`,
        },
      });
    }
  }

  console.log(`Migrated ${users.length} users`);
}

migrateUsers();
```

## 🚀 Testing

### Test Login
1. Avvia l'app: `npm run dev`
2. Vai su `http://localhost:3000/auth/signin`
3. Usa le credenziali di test dal seed

### Test Email (con Resend configurato)

#### Test Forgot Password
1. Vai su `/auth/forgot-password`
2. Inserisci un'email registrata
3. Controlla la casella email
4. Clicca sul link di reset

#### Test Verifica Email (futuro)
Quando abiliterai la verifica email:
1. Imposta `requireEmailVerification: true` in `lib/auth-better.ts`
2. Le nuove registrazioni richiederanno verifica
3. Email di verifica inviata automaticamente

## 🔄 Differenze da NextAuth

| Feature | NextAuth | Better-Auth |
|---------|----------|-------------|
| API Routes | Multiple routes | Single `/api/auth/[...all]` |
| Session | JWT or Database | Database sessions |
| Client Hooks | `useSession()` | `useSession()` (compatibile) |
| Sign Out | `signOut()` | `signOut()` (async) |
| Middleware | `withAuth()` | Custom middleware |
| Email | Richiede adapter | Integrato con Resend |

## 📧 Personalizzazione Email

### Modifica Template

Edita i template in `lib/auth-better.ts`:

```typescript
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@ptcrm.app",
      to: user.email,
      subject: "Il tuo subject personalizzato",
      html: `
        <div style="...">
          <!-- Il tuo HTML qui -->
        </div>
      `,
    });
  },
}
```

### Usa React Email (Opzionale)

Per template più complessi:

```bash
npm install @react-email/components
```

Crea template in `emails/`:
```tsx
// emails/welcome.tsx
import { Html, Button } from '@react-email/components';

export default function Welcome({ url }) {
  return (
    <Html>
      <Button href={url}>Verifica Account</Button>
    </Html>
  );
}
```

## 🛡️ Sicurezza

### Session Management
- Sessioni memorizzate in MongoDB
- Token sicuri auto-generati
- Scadenza automatica dopo 7 giorni
- Aggiornamento automatico ogni 24 ore

### Password Security
- Hash bcrypt (già implementato)
- Password reset con token temporanei
- Token scadono dopo 1 ora

### Email Security
- Link verifica con token unici
- Anti-CSRF protection
- Rate limiting (configurabile)

## 🐛 Troubleshooting

### Errore: "Resend not configured"
- Verifica che `RESEND_API_KEY` sia nel file `.env`
- Riavvia il server dopo aver aggiunto variabili

### Email non arrivano
- Controlla spam/promozioni
- Verifica che l'email FROM sia corretta
- Se usi sandbox, verifica che destinatario sia verificato in Resend
- Controlla i logs Resend dashboard

### Sessioni non persistono
- Verifica che le tabelle `sessions` esistano
- Controlla i cookie nel browser (deve esserci `better-auth.session_token`)
- Verifica `BETTER_AUTH_URL` sia corretto

### Errori Prisma Generate
Se hai problemi con i binari Prisma:
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

## 📚 Risorse

- [Better-Auth Docs](https://www.better-auth.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)

## ✨ Prossimi Step (Opzionale)

Funzionalità aggiuntive che puoi implementare:

- [ ] OAuth Providers (Google, GitHub)
- [ ] Two-Factor Authentication (2FA)
- [ ] Email notifications per eventi app
- [ ] Admin panel per gestire utenti
- [ ] Audit log per attività utenti
- [ ] Session management (vedi sessioni attive)

## 🎯 Conclusione

Better-Auth + Resend offrono:
- ✅ Autenticazione moderna e sicura
- ✅ Email transazionali professionali
- ✅ Facile da configurare e mantenere
- ✅ Scalabile per produzione
- ✅ Ottima developer experience

La migrazione è completa e l'app è pronta per l'uso in produzione dopo aver configurato le API keys!
