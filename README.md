# SpartanBet NG

Sports tipster platform — Nigeria market.

## Setup

### 1. Clone and install
  git clone https://github.com/Aurelesieg/SpartanBetNG.git
  cd SpartanBetNG
  npm install

### 2. Environment variables
Create a .env.local file at the project root:
  VITE_SUPABASE_URL=https://pgnugkoxuhsyslhcgchy.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key_here
  VITE_API_FOOTBALL_KEY=

### 3. Run locally
  npm run dev

## Vercel Deployment
In Vercel → Project → Settings → Environment Variables, add:
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
Select all environments (Production, Preview, Development).
After adding variables, redeploy manually.

## Tech Stack
React 18 + TypeScript + Vite + Tailwind CSS v4
Supabase (Auth + Database + Realtime)
React Router v7
Framer Motion