# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PT CRM is a Personal Trainer management system built with Next.js 14 (App Router), MongoDB, Prisma ORM, NextAuth.js, and shadcn/ui components. The application provides separate interfaces for clients (tracking workouts, progress, appointments) and trainers (managing multiple clients, creating workout programs, viewing analytics).

## Development Commands

### Essential Commands
```bash
npm run dev              # Start development server (localhost:3000)
npm run build           # Build for production (includes prisma generate)
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Prisma Database Commands
```bash
npm run prisma:generate # Generate Prisma Client (required after schema changes)
npm run prisma:push     # Push schema changes to MongoDB (no migrations)
npm run prisma:seed     # Populate database with test data
npm run prisma:studio   # Open Prisma Studio GUI for database inspection
```

**Important**: Always run `prisma:generate` after modifying `prisma/schema.prisma`, then `prisma:push` to apply schema changes to MongoDB.

## Architecture

### Authentication & Authorization

- **NextAuth.js v4** with JWT session strategy
- Credentials provider with bcryptjs password hashing (salt 10)
- Role-based access control (CLIENT vs TRAINER)
- Custom middleware (`middleware.ts`) enforces role-based route protection:
  - `/client/*` routes → CLIENT role only
  - `/trainer/*` routes → TRAINER role only
  - Redirects authenticated users away from login page to their dashboard
- Session data includes: `id`, `role`, `nome`, `cognome`, `email`
- Auth configuration in `lib/auth.ts`

### Database Architecture (MongoDB + Prisma)

The schema uses MongoDB's ObjectId for relationships. Key entities:

**User Model** - Base model for both CLIENT and TRAINER roles
- Relations: clientProfile (1:1), workoutSessions (1:N), measurements (1:N), notifications (1:N)

**ClientProfile Model** - Extended data for clients only
- Relations: workouts (1:N)
- Includes: obiettivi, note, scadenzaScheda

**Workout Model** - Workout programs/cards
- Relations: exercises (1:N), workoutSessions (1:N)
- Has `isActive` flag to track current program

**Exercise Model** - Individual exercises within a workout
- Fields use strings for flexibility: ripetizioni ("12", "10-12", "AMRAP"), peso ("20kg", "Corpo libero")
- `ordine` field maintains exercise sequence

**WorkoutSession Model** - Completed workout records
- `exerciseData` field (Json) stores detailed per-exercise data: sets completed, weights used, notes
- Includes rating (1-5 stars) and feedback text
- Creates WORKOUT_COMPLETED notification for trainer on creation

**Measurement Model** - Body measurements tracking
- Tracks: peso, circonferenze (petto, vita, fianchi, braccia, gambe), percentualeGrasso

**Notification Model** - System notifications with types:
- WORKOUT_COMPLETED, WORKOUT_REMINDER, APPOINTMENT_SCHEDULED, MEASUREMENT_ADDED, CHECKPOINT_DUE, FEEDBACK_RECEIVED, INACTIVITY_WARNING

### Application Structure

**Route Organization**:
- `/auth/signin` - Login page
- `/client/*` - Client dashboard, workout viewer, session recorder, progress charts, appointments
- `/trainer/*` - Trainer dashboard, client management, workout editor, analytics, notifications
- `/api/sessions` - Main API for workout session CRUD operations
- `/api/auth/[...nextauth]` - NextAuth endpoints

**Layout Hierarchy**:
- Root `app/layout.tsx` - Base HTML, global providers
- `app/client/layout.tsx` - Client sidebar navigation
- `app/trainer/layout.tsx` - Trainer sidebar navigation

### Component Organization

**Reusable Dashboard Components** (`components/dashboard/`):
- `StatsCard` - Stat display with icon, value, label, and trend indicator
- `ProgressChart` - Single-line chart (Recharts)
- `MultiLineChart` - Multi-line comparison chart
- `ActivityFeed` - Timeline-style activity list

**Workout Components** (`components/workout/`):
- `ExerciseCard` - Displays exercise details (serie, ripetizioni, peso, recupero)
- `RestTimer` - Interactive countdown timer with play/pause/reset
- `SessionRecorder` - Multi-step form for recording workout sessions with progress bar

**Client Components** (`components/client/`):
- `ClientCard` - Client card with status indicators (🟢 active, 🟡 warning, 🔴 inactive)

**UI Components** (`components/ui/`):
- All components from shadcn/ui using default theme
- To add new components: `npx shadcn-ui@latest add [component-name]`

### Client Status Logic (Important for Trainer Features)

Client status is calculated dynamically based on:
- **🟢 Active**: Last workout within 3 days
- **🟡 Warning**: Last workout 3-7 days ago OR workout card expires ≤7 days
- **🔴 Inactive**: Last workout >7 days ago

This logic is implemented in trainer dashboard and client list pages.

## API Patterns

All API routes follow this structure:
```typescript
// GET /api/sessions?clientId=xxx
// POST /api/sessions with body: { clientId, workoutId, exerciseData, rating, feedback, completato }

export async function GET/POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  // Role-based authorization
  if (session.user.role === "CLIENT" && clientId !== session.user.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  // Prisma operations
  // ...
}
```

**Important**: Always verify user identity matches resource ownership for CLIENT role. TRAINER role typically has broader access.

## Test Credentials (After Seeding)

```bash
# Trainer
trainer@ptcrm.com / password123

# Clients (all use password123)
mario.rossi@email.com
laura.bianchi@email.com
giuseppe.verdi@email.com
```

## Date Handling

- All dates use `date-fns` library with Italian locale
- Common formats: `dd/MM/yyyy`, `HH:mm`
- Import from: `import { format } from 'date-fns';`

## Styling Guidelines

- Tailwind CSS with shadcn/ui default theme
- Mobile-first responsive design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Desktop: sidebar fixed, tablet: collapsible, mobile: hidden with hamburger menu

## Environment Variables

Required in `.env`:
```
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000" # or production URL
```

## Common Development Patterns

### Creating a New API Endpoint
1. Create `app/api/[endpoint]/route.ts`
2. Export `GET`, `POST`, `PUT`, or `DELETE` async functions
3. Always validate session with `getServerSession(authOptions)`
4. Check role-based permissions
5. Use Prisma client from `@/lib/prisma`

### Adding a New Page
1. Create page in appropriate directory: `app/client/[page]/page.tsx` or `app/trainer/[page]/page.tsx`
2. Use `getServerSession(authOptions)` for server-side auth
3. Fetch data server-side when possible (Next.js 14 Server Components)
4. Import components from `@/components/`

### Modifying Database Schema
1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:push` (MongoDB doesn't use migrations)
3. Run `npm run prisma:generate` to update TypeScript types
4. Update seed file (`prisma/seed.ts`) if needed
5. Run `npm run prisma:seed` to recreate test data

## Important Notes

- This is a single-tenant system (one trainer, multiple clients) - adjust queries if multi-trainer support is needed
- MongoDB uses ObjectId strings, not integers - always use `@db.ObjectId` type in schema
- Exercise data flexibility: ripetizioni and peso fields are strings to support various formats
- WorkoutSession.exerciseData is Json type - structure is flexible for different tracking needs
- Notifications are created automatically (e.g., when client completes workout)
- No test suite currently - manual testing via Prisma Studio and dev server
