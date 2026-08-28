# Nyay Sahayak (न्याय सहायक — "Justice Assistant")

Nyay Sahayak is a legal-aid triage platform for citizens in India. It accepts legal descriptions in plain language (via text or Web Speech API voice intake), classifies issues, checks eligibility for free legal aid under the *Legal Services Authorities Act, 1987* (Article 39A), locates the nearest DLSA office on an interactive map directory, and auto-generates downloadable, digitally signed complaints.

---

## Core Capabilities

1. **Multilingual Voice/Text Triage**:
   - Supports English, Hindi, and Hinglish statement entries.
   - Built-in microphone toggle for hands-free voice description with live recording visualizers.
2. **Legal Aid Eligibility Calculator**:
   - Checks demographic and income criteria dynamically against the National Legal Services Authority (NALSA) eligibility directives.
3. **Nearest DLSA Office Locator**:
   - Leaflet-based interactive map displaying nearest DLSA helpdesks with distance lookup, telephone hotlines, and browser geolocation support.
4. **Complaint Draft Generator & Live Preview**:
   - Stitches statements and details into structured templates dynamically.
   - Includes an **interactive digital signature drawing pad** (native HTML5 Canvas) supporting touch gestures (mobile) and mouse actions (desktop) to sign complaints electronically.
   - Renders a real-time digital signature badge inside the Live Preview panel.
5. **A4 PDF Downloader**:
   - Formats, pages, and downloads complaints as formal A4 PDF sheets via `jspdf`, embedding the digital signature image inline.
6. **Robust Crash Safety & Accessibility**:
   - Global Next.js boundaries (`not-found.js` and `error.js`) preserve Navigation menus and the Pulsing Emergency SOS alert button during errors.
   - Strict WCAG AA contrast values and reduced-motion animation accessibility checks.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion (animations)
- **Database**: PostgreSQL with Prisma ORM (Supabase hosted)
- **PDF Generation**: jsPDF
- **Maps**: Leaflet.js with OpenStreetMap (no API key required)
- **Icons**: Lucide React
- **State Management**: React Context API

---

## Getting Started

### 1. Installation
Install all required project dependencies:
```bash
npm install
```

### 2. Database Migration
Configure your PostgreSQL connection string in `.env`. To apply migrations:
```bash
npx prisma migrate dev
```

To run Prisma Client generation manually:
```bash
npx prisma generate
```

To seed the categories, templates, and DLSA coordinates:
```bash
node prisma/seed.js
```

### 3. Running the App
Start the Next.js local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Vercel Deployment
To deploy this project to Vercel:
1. **Push to GitHub**: Push your local repository to a remote GitHub repository.
2. **Import to Vercel**: Sign in to the [Vercel Dashboard](https://vercel.com), select **Add New Project**, and import your repository.
3. **Environment Variables**: Add your hosted PostgreSQL connection details under Project Settings -> Environment Variables:
   - `DATABASE_URL`: Set this to your connection pooler URL (e.g., from Supabase or Neon).
4. **Automatic Build Hooks**: Vercel automatically detects Next.js. The configured `"postinstall": "prisma generate"` script inside `package.json` guarantees that the Prisma Client compiles successfully in Vercel's build container.

---

## Folder Structure
- `app/` - Next.js 14 App Router roots
  - `(routes)/` - UI Pages/Layouts (e.g. main dashboard, SOS mode, triage wizard)
  - `api/` - Backend API Route Handlers
- `components/` - Reusable shared UI components
- `lib/` - Service wrappers and Prisma client singleton (`lib/prisma.js`)
- `context/` - Global React contexts (e.g. triage state, SOS alert state)
- `prisma/` - Database schema (`schema.prisma`) and migrations

---

## Developer Guidelines

### 1. Client vs Server Components ("use client")
Every component in Next.js is a Server Component by default. If your file uses interactivity, React state, browser Web APIs (microphone, location, canvas), Leaflet maps, or Framer Motion animations, you **MUST** write `"use client"` as the very first line of the file.

### 2. Design System Colors
Always use the tailwind theme variables instead of hardcoding raw color hexes:
- **Primary Saffron/Orange**: `text-primary`, `bg-primary`, `hover:bg-primary-hover` (`#D85A30`)
- **Secondary Teal/Green**: `text-secondary`, `bg-secondary`, `hover:bg-secondary-hover` (`#0F6E56`)
- **Danger/SOS Red**: `text-danger`, `bg-danger`, `hover:bg-danger-hover` (`#A32D2D`)
- **Base Background**: `bg-base` (`#FAF9F6`)
- **Default Text**: `text-base-dark` (`#1A1A1A`)

---

## Verifying Connectivity
Hit the local health check API to verify database status:
`GET http://localhost:3000/api/health`
