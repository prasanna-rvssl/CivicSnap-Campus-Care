# CivicSnap

**Report campus problems with a photo or voice note. Help facilities teams respond and show progress.**

CivicSnap is a mobile-first campus issue reporting app. A visitor captures or uploads a photo, adds a typed note or voice recording, reviews an AI-generated report draft, and receives a private tracking link. Campus staff can view submitted reports and move them through Received, Assigned, In progress, and Resolved.

## How AI is used

The server sends the required photo, the reporter's typed note, and an optional recorded voice note to Gemini. Gemini can transcribe the voice note and suggest a concise title, description, category, and priority grounded in the photo and the reporter's words. The visitor reviews and can edit the draft before submission. If AI is unavailable, the app keeps a usable manual draft from the typed note.

## Run locally

Requires Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

The Vite development server now serves the app's `/api/reports` and `/api/draft` handlers locally, so `npm run dev` supports the complete flow. Copy `.env.example` to `.env.local` and fill in the server-side values. Reports require `SUPABASE_URL` and `SUPABASE_SECRET_KEY`; AI drafting requires `GEMINI_API_KEY`.

## Set up the backend

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor.
2. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/api-keys). Keep the key private.
3. Put `GEMINI_API_KEY`, the Supabase project URL, and the Supabase secret key in `.env.local` for local development. For deployment, set `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SECRET_KEY` in Vercel's encrypted environment settings.
4. Deploy this folder to Vercel. Add `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SECRET_KEY` in Vercel's project settings. Use the Supabase secret key (`sb_secret_…`) on the server only. Never put those values in browser code, Git, screenshots, or this README.

Staff can choose one of three demo profiles. These names are for the hackathon walkthrough and are not authentication; add campus sign-in before real-world use. Report photos are stored in a private bucket and served with expiring signed links.

## Tech and services

- React 19, TypeScript, Vite, Tailwind CSS 4
- Gemini API (`gemini-3.8-flash`) for photo and optional voice-note analysis, transcription, and report drafts
- Supabase Postgres and Storage for report records and photos
- Vercel Edge Functions for server-side API routes
- Figma Make generated UI scaffold and Unsplash for the original prototype's sample image asset

## Test images

Three AI-generated sample photos are included for exercising the required photo upload and AI draft flow. They are fictional and contain no real people:

- `public/test-images/dirty-campus-hallway.png`
- `public/test-images/overflowing-campus-bin.png`
- `public/test-images/dirty-campus-bathroom.png`

Each file is below the app's 4 MB image upload limit. These are test assets, not evidence of real campus issues.
