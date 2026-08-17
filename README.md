# NexMind

An AI-powered productivity workspace built with Next.js — notes, boards, calendar, whiteboards, and pages in one place, with AI assistance throughout.

## Features

- **Notes** — rich text editor (Tiptap) with slash commands and AI refinement
- **Boards** — kanban with columns, priorities, labels, due dates, and live comments
- **Calendar** — schedule tasks and reminders, drag unscheduled drafts onto a date
- **Whiteboard** — infinite canvas (Excalidraw) with AI-generated first drafts
- **Pages & Spaces** — organise documents by space, with sharing and linked tasks
- **AI Assistant** — plan, summarise, and prepare actions with confirmation before saving
- **AI Template Builder** — generate small apps from a prompt
- **Realtime collaboration** — presence and comments powered by Liveblocks

## Tech Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn-style UI components |
| Database | Neon serverless Postgres + Drizzle ORM |
| Auth | Clerk |
| AI | Google Gemini (`@google/genai`) |
| Realtime | Liveblocks |
| Editors | Tiptap (notes), Excalidraw (whiteboard) |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database
- Accounts for [Clerk](https://clerk.com), [Liveblocks](https://liveblocks.io), and [Google AI Studio](https://aistudio.google.com)

### Setup

```bash
git clone <repo-url>
cd nexmind-ai-productivity-app-prod
npm install
```

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env
```

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Neon Postgres
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_PRO_PLAN_KEY=

# Liveblocks
LIVEBLOCKS_SECRET_KEY=

# Google Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
```

Push the schema to your database, then start the dev server:

```bash
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push the schema to the database |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
app/                  Routes, pages, and server actions
  ai-assistant/       AI chat assistant
  ai-template-builder/ AI app generation
  calendar/           Calendar board
  dashboard/          Workspace overview
  kanban/             Kanban boards
  notes/              Rich text notes
  settings/           User preferences
  spaces/             Pages and spaces
  whiteboard/         Excalidraw canvas
  api/                Liveblocks auth and user routes
components/           Shared UI and app shell
db/                   Drizzle schema and client
drizzle/              Generated migrations
lib/                  Utilities, Liveblocks helpers, user sync
```

## License

[MIT](LICENSE)
