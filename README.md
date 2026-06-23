# DevBoard

A pnpm + Turborepo monorepo for building a developer dashboard with React, Vite, Tailwind CSS, and Supabase.

## Stack

- **pnpm** workspaces
- **Turborepo**
- **React** (JavaScript)
- **Vite**
- **Tailwind CSS**
- **Supabase** (GitHub OAuth)
- **React Router**

## Project structure

```
devboard/
  apps/
    web/              # Vite + React application
  packages/
    ui/               # Shared UI components
    utils/            # Shared utilities
  turbo.json
  pnpm-workspace.yaml
  package.json
```

## Routes (`apps/web`)

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | GitHub OAuth sign-in |
| `/dashboard` | Protected dashboard (requires auth) |

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example env file in the web app and fill in your Supabase credentials:

```bash
cp apps/web/.env.example apps/web/.env
```

Required variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Find these values in your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api).

### 3. Enable GitHub OAuth in Supabase

1. Open **Authentication → Providers** in the Supabase dashboard.
2. Enable **GitHub** and add your GitHub OAuth app credentials.
3. Add your local redirect URL under **Authentication → URL Configuration**:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/dashboard`

### 4. Run the development server

From the repository root:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers (web app) |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages and apps |
| `pnpm preview` | Preview the web production build |

## License

MIT
