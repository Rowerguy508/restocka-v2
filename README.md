# Restocka V2

**Consolidated Restaurant Inventory SaaS**

## Overview

Restocka V2 combines the beautiful UI from Lovable with the complete features from the main Restocka repository.

- **UI:** Lovable-generated React components (shadcn-style)
- **Features:** Full owner/manager dashboards, AI reorder, integrations
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Deploy:** Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_PUBLISHABLE_KEY | Supabase anonymous key |

## Project Structure

```
src/
├── components/
│   ├── ui/           # Beautiful Lovable UI components
│   ├── charts/       # Chart components
│   ├── layout/       # Layout components
│   └── auth/         # Authentication
├── pages/
│   ├── owner/        # Owner dashboard pages
│   └── manager/      # Manager dashboard pages
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── lib/             # Utilities
└── integrations/    # Third-party integrations
```

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

## Lovable Integration

To make UI changes:
1. Visit https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID
2. Make changes
3. Copy updated components back to this repo

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router
- Supabase
- shadcn/ui components
- Tailwind CSS
