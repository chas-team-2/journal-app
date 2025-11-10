# Journal App - Student Assignment Starter

A minimalist journaling application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. This project serves as a starting point for students to practice debugging, adding features, and improving existing code.


👥 Team:  [Fares Elloumi](https://github.com/Fares-elloumi), [Cristian Pencheff](https://github.com/cribepencheff), [Aleksa Solevic](https://github.com/AleksaSolevic), [Ephraim Valladares](https://github.com/EphraimVC)


🔗 Deploy on Vercel (main): https://journal-app-chasteam2.vercel.app/  
🔄 Deploy on Vercel (develop, staging): https://journal-app-staging-chasteam2.vercel.app/  
🐳 Deploy on Render via Docker Hub (main): https://journal-app-latest-3g4c.onrender.com/  
✅ Task board: https://github.com/orgs/chas-team-2/projects/1  


## Tech Stack

- **Frontend Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes (Route Handlers)
- **Database & Auth:** Supabase (Authentication + PostgreSQL)

## Architecture

The application uses a **backend API layer** with Next.js Route Handlers instead of direct client-side Supabase calls. This provides:

- Better security (sensitive operations happen server-side)
- Separation of concerns
- Easier testing and maintenance
- Centralized error handling

## Architecture

The application uses a backend API layer with Next.js Route Handlers instead of direct client-side Supabase calls. This provides:

- Better security (sensitive operations happen server-side)
- Separation of concerns
- Easier testing and maintenance
- Centralized error handling

## Type Safety

- TypeScript types are automatically generated from the Supabase database schema in `src/types/supabase.ts`.
- Types use Supabase's official type generation which ensures they stay in sync with the database.
- All API functions are fully typed to ensure safe data flow between frontend and backend.
- To regenerate types after schema changes, run: `npm run types:generate`

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Skapa nytt projekt på supabase
2. Kör allt som finns i `src/supabase/schema.sql` i SQL-editorn
3. Kopiera API-nycklarna från Supabase till .env

```env
# Required for runtime
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Only for regenerating types locally (not needed for deployment)
SUPABASE_PROJECT_ID=your-project-id-here
```

**Optional:** Regenerate TypeScript types from Supabase after schema changes:
```bash
npm run types:generate
```

### 3. Test Account for Demo / Review

The app is deployed publicly on Vercel and Render with "Allow new users" disabled in Supabase to prevent unauthorized sign-ups. Only existing users can log in.

Test account credentials have been provided separately via email or private channels.


## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run Jest tests
- `npm run types:generate` - Regenerate TypeScript types from Supabase database schema
- `npm run docker:dev` - Start Docker development environment with auto-loaded .env variables

## Design Philosophy

This app follows a minimalist, editorial design approach:

- **Typography:** Serif fonts for headings, sans-serif for body text
- **Color Palette:** Cream backgrounds with dark brown text and warm gray accents
- **Spacing:** Generous whitespace for readability
- **Layout:** Clean, centered layouts with maximum content width
- **Interaction:** Subtle hover states and transitions


## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## ⚙️ Utvecklingsprocess och Projekthantering

### Branching-strategi

Vi använder trunk-based development där `main` alltid innehåller stabil, produktionsklar kod och `develop` är vår integrationsbranch. Feature branches skapas från `develop` med namnmönster som `feature/edit-entry`, `fix/delete-bug`, eller `chore/docker-optimize`.

Alla ändringar mergas tillbaka till `develop` via pull requests med minst en code review. När vi är redo för release skapas en `release/<version>-<datum>` branch från `develop` som mergas till `main` efter godkänd testning.

**Deploy-flöde:**
- Push till `develop` → Vercel preview deploy (staging)
- Merge till `main` → Docker Hub build → Render + Vercel production deploy

Detaljerade riktlinjer finns i vårt gemensamma Google Doc (låst).

---

## Reflektioner
