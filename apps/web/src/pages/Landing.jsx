import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">devboard</span>
        <nav className="flex gap-4 text-sm">
          <Link
            to="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white transition hover:bg-indigo-400"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-indigo-400">
          Developer dashboard
        </p>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Track your work in one place.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-slate-400">
          DevBoard is a React + Supabase starter with GitHub authentication,
          protected routes, and Tailwind CSS ready to extend.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/login"
            className="rounded-lg bg-indigo-500 px-6 py-3 font-medium text-white transition hover:bg-indigo-400"
          >
            Get started with GitHub
          </Link>
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-700 px-6 py-3 text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Supabase docs
          </a>
        </div>
      </main>
    </div>
  )
}
