# Journal App - Student Assignment Starter

A minimalist journaling application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. This project serves as a starting point for students to practice debugging, adding features, and improving existing code.


👥 Team: [Fares Elloumi](https://github.com/Fares-elloumi), [Cristian Pencheff](https://github.com/cribepencheff), [Aleksa Solevic](https://github.com/AleksaSolevic), [Ephraim Valladares](https://github.com/EphraimVC)


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

1. Create a new project on Supabase
2. Run all SQL commands from `src/supabase/schema.sql` in the SQL Editor
3. Copy the API keys from Supabase to your `.env` file

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
- **Dark/Light Theme:** Supports both light and dark modes, respecting user system preferences


## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## ⚙️ Utvecklingsprocess, Projekthantering och Reflektioner

### Branching-strategi

Vi använder trunk-based development där `main` alltid innehåller stabil, produktionsklar kod och `develop` är vår integrationsbranch. Feature branches skapas från `develop` med namnmönster som `feature/edit-entry`, `fix/delete-bug`, eller `chore/docker-optimize`.

Alla ändringar mergas tillbaka till `develop` via pull requests med minst en code review. När vi är redo för release skapas en `release/<version>-<datum>` branch från `develop` som mergas till `main` efter godkänd testning.

**Deploy-flöde:**
- Push till `develop` → Vercel preview deploy (staging)
- Merge till `main` → Docker Hub build → Render + Vercel production deploy

Detaljerade riktlinjer finns i vårt gemensamma Google Doc (låst).

### Commit-historik

Vi följer Conventional Commits-format med prefix för att hålla historiken tydlig och strukturerad:

**Prefix vi använder:**  
- `chore:` – underhåll och konfiguration (docker, dependencies)  
- `ci:` – CI/CD workflow-ändringar  
- `fix:` / `bugfix:` – bugfixar  
- `feature:` – nya funktioner  
- `test:` – testfiler  
- `readme:` / `docs:` – dokumentation  

Commit-meddelanden är korta, beskrivande och skrivna i imperativ form (t.ex. `fix: resolve login validation error`). De kopplas till issues i vårt GitHub Projects board när det är relevant.

### Projektplanering

Vi använder [GitHub Projects](https://github.com/orgs/chas-team-2/projects/1) för att organisera uppgifter och spåra progress. Alla issues och tasks kopplas till projektet och uppdateras kontinuerligt under utvecklingen. Detta ger oss en gemensam överblick av vad som är klart, pågår, eller väntar.

### CI/CD Pipeline

Vi har implementerat en automatiserad CI/CD-pipeline med GitHub Actions som säkerställer kodkvalitet och effektiv deployment. Pipelinen består av tre workflows som arbetar tillsammans:

#### 1. CI Workflow (`.github/workflows/ci.yml`)
**Trigger:** Push eller Pull Request till `develop`  
**Syfte:** Kvalitetskontroll innan kod mergas

**Steg:**
- Checkar ut koden
- Installerar Node.js 22 och dependencies (`npm ci`)
- Kör ESLint för att hitta kodproblem
- Kör Jest-tester för att verifiera funktionalitet

**Varför:** Detta fångar upp buggar och kodproblem tidigt i utvecklingsprocessen, innan de når `main`. Alla förändringar till `develop` måste passera dessa kontroller.

#### 2. Docker Publish Workflow (`.github/workflows/docker-publish.yml`)
**Trigger:** Push till `main` (vanligtvis via release branch merge)  
**Syfte:** Bygga och publicera produktionsklar Docker-image

**Steg:**
- Checkar ut koden från `main`
- Loggar in på Docker Hub med secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`)
- Bygger Docker-imagen med Supabase environment variables som build-args
- Taggar imagen som `chasteam2/journal-app:latest`
- Pushar imagen till Docker Hub

**Varför:** Detta automatiserar byggprocessen och säkerställer att varje production-release får en konsistent, reproducerbar Docker-image. Build-args används för att baka in `NEXT_PUBLIC_*` variabler i byggtiden (Next.js kräver detta för client-side access).

#### 3. Render Deploy Workflow (`.github/workflows/render-deploy.yml`)
**Trigger:** När "Docker Publish" workflow slutförs framgångsrikt  
**Syfte:** Automatisk deploy till Render

**Steg:**
- Väntar på att Docker Publish ska bli klar
- Kontrollerar att föregående workflow lyckades
- Triggar Render's deploy webhook via `curl POST`

**Varför:** Detta skapar en seamless deployment-kedja: `main` → Docker Hub → Render. Vi använder `workflow_run` istället för att trigga direkt på `main` för att säkerställa att Docker-imagen verkligen är pushad och redo innan Render börjar dra ner den.

#### Secrets som används
Alla känsliga värden lagras som GitHub Secrets:
- `DOCKER_USERNAME` / `DOCKER_PASSWORD` - Docker Hub credentials
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase config (public, men hanteras som secrets för konsistens)
- `RENDER_DEPLOY_HOOK_URL` - Webhook för att trigga Render deploy

#### Flödesdiagram
```
**develop branch** → CI (lint + test) ✅ → PR merge OK  
  ↓  
**main branch** ← release merge ← develop (testad)  
  ↓  
Docker Publish → Build image → Push to Docker Hub 🐳  
  ↓  
Render Deploy → Trigger webhook → Render pulls latest image → Production live 🚀
```

#### Fördelar med vår pipeline
- **Automatisering:** Ingen manuell deploy behövs efter merge till `main`
- **Kvalitetssäkring:** CI körs på varje förändring till `develop`
- **Reproducerbarhet:** Samma Docker-image används i alla miljöer
- **Säkerhet:** Secrets hanteras centralt i GitHub
- **Transparens:** Alla deployments syns i Actions-loggen

#### Vår avancerade CI/CD-pipeline  

**Workflow chaining med `workflow_run`:**  
Istället för att trigga alla workflows samtidigt använder vi `workflow_run` för att kedja Render Deploy efter Docker Publish. Detta säkerställer att Docker-imagen är helt pushad och tillgänglig innan Render försöker dra ner den. Utan detta kunde vi få race conditions där Render börjar deploy innan imagen finns på Docker Hub.

**Separata deploy-målgrupper:**  
Vi kör dubbel deployment för olika use cases:  
- **Vercel:** Snabb, serverless deploy för development/staging (från `develop` branch) och även **main** för att testa produktion i Vercel-miljön ⚡  
- **Render:** Containeriserad production deploy med vår egna Docker-image (från `main`)  

Detta ger oss flexibilitet att testa i Vercel's miljö samtidigt som vi har full kontroll över container-baserad production.

**Multi-stage Docker builds i CI:**  
Vår Dockerfile använder multi-stage builds som skapar en minimal 217 MB image. Detta kräver korrekt hantering av build-args i CI-pipelinen för att baka in miljövariabler vid byggtiden. Alternativet (single-stage eller runtime env vars only) hade gett en större image eller inte fungerat med Next.js public environment variables.

**Branch-baserad triggering:**  
CI körs på `develop` för att fånga buggar tidigt, medan Docker build/deploy endast triggas från `main`. Detta separerar testing-fasen från production-deployment och minskar risken för att otestade ändringar når produktion.

**Secrets management:**  
All känslig data (Docker Hub credentials, deploy webhooks, API keys) hanteras som GitHub Secrets istället för att hardkodas eller committas. Detta är kritiskt för säkerhet och gör det enkelt att rotera credentials utan att ändra kod.

Sammanfattningsvis ger vår setup en robust, säker och automatiserad pipeline som hanterar flera deployment-targets, säkerställer kodkvalitet och minimerar manuellt arbete – allt medan vi behåller full kontroll och transparens över processen.


---

## Docker Setup

Vi har containeriserat applikationen med fokus på säkerhet, optimering och enkel deployment. Docker-imagen är optimerad till **217MB** genom att använda Next.js standalone build och multi-stage builds.

### Snabbstart för teammedlemmar

**Rekommendation:** Installera [Docker Desktop](https://www.docker.com/products/docker-desktop/) för enklast setup.

Kör sedan direkt med vårt development script:
```bash
npm run docker:dev
```

Detta script läser automatiskt din `.env`-fil, bygger imagen och startar containern på `http://localhost:3000`.

### Manuell Docker-användning

**Bygga imagen:**
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -t journal-app:latest .
```

**Köra containern:**
```bash
docker run -p 3000:3000 --env-file .env journal-app:latest
```

### Optimeringar vi implementerat

**Dockerfile (multi-stage build):**
- **Builder stage:** Node.js 22 Alpine (minimal base image), installerar dependencies och bygger Next.js standalone output
- **Runner stage:** Kopierar endast nödvändiga filer (.next/standalone, static assets, public), kör som non-root user (`nextjs`) för säkerhet, och startar med minimal `server.js`

**`.dockerignore`:**
Exkluderar allt som inte behövs i runtime: `node_modules`, `.git`, `.github`, test-filer, CI/CD-configs, dokumentation, och development tools. Detta minskar build context och final image size drastiskt.

**Next.js Standalone Output:**
Aktiverat i `next.config.ts` med `output: 'standalone'`. Next.js analyserar dependencies och paketerar bara vad som faktiskt används, vilket reducerar storleken till 217MB.

**Obs:** Standalone-inställningen används endast i Docker/Render-deploy. Vercel-deploy hanterar filer med sin egna optimeringsprocess och ignorerar denna inställning.

### Deployment

Imagen pushas automatiskt till Docker Hub (`chasteam2/journal-app:latest`) via GitHub Actions vid merge till `main`. Render pullar sedan denna image för production deploy.

---

## AI-användning i projektet

AI-verktyg (främst GitHub Copilot och ChatGPT) har använts som stöd i utvecklingen på följande områden:

**Testing:**
- Generering av Jest-testfiler för API-layer och komponenter
- Hjälp med teststruktur och mock-data för Supabase

**Docker & Deployment:**
- Rekommendationer för optimering av Docker-image till 217MB.
- Implementering av Next.js standalone output
- Strategi för miljövariabler i Docker Hub och Render
- Setup-instruktioner för Docker Hub och Render (manuella steg)
- GitHub Actions workflows för Docker build och deploy
- `docker:dev` script för förenklad lokal utveckling

**Code Reviews:**
- GitHub Copilot har använts för att granska Pull Requests
- AI-assisterad identifiering av potentiella buggar och förbättringsområden
- Förslag på kodförbättringar och best practices i PR-kommentarer

**Övrig utveckling:**
- Kodgranskningar och förslag på best practices
- Felsökning och problemlösning

All AI-genererad kod har granskats, testats och anpassats av teamet innan merge till `develop` eller `main`.

