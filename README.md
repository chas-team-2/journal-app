# Journal App - Student Assignment Starter

A minimalist journaling application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. This project serves as a starting point for students to practice debugging, adding features, and improving existing code.


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

- All database data is typed with manually defined TypeScript interfaces in src/types/database.types.ts.
- No any types or unnecessary null values are used.
- All API functions are fully typed to ensure safe data flow between frontend and backend.

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url> # eller forka
cd cloud-examinerande-uppgift-2-grupp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Skapa nytt projekt på supabase
2. Kör allt som finns i `supabase/schema.sql` i SQL-editorn
3. Hitta API-nycklar på Supabase och ersätt i .env.example

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Test Account for Demo / Review

The app is deployed publicly (e.g., on Vercel) with “Allow new users” disabled in Supabase to prevent unauthorized sign-ups. Only existing users can log in.

We have created one or more test accounts for instructors or examiners, shared separately via email or private channels.

In README, these accounts are referenced **without revealing credentials**:

```bash
# Test Account
Use the provided test account credentials to log in.  
Set environment variables according to `.env.example`.
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

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

## Fyll på med era reflektioner nedan!
