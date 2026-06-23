import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGitHubData } from '../hooks/useGitHubData'
import { supabase } from '../lib/supabase'

function getLevelBounds(currentLevel) {
  const bounds = {
    1: { min: 0, max: 99, next: 100 },
    2: { min: 100, max: 299, next: 300 },
    3: { min: 300, max: 599, next: 600 },
    4: { min: 600, max: 999, next: 1000 },
    5: { min: 1000, max: null, next: null },
  }

  return bounds[currentLevel] ?? bounds[1]
}

export default function Dashboard() {
  const { user } = useAuth()
  const { commits, totalXP, streak, level, loading, error } = useGitHubData()
  const navigate = useNavigate()

  const username = user?.user_metadata?.user_name ?? user?.user_metadata?.username ?? 'developer'
  const avatarUrl = user?.user_metadata?.avatar_url
  const bio = user?.user_metadata?.bio

  const totalCommits = commits.reduce(
    (sum, item) => sum + Number(item.commit_count ?? 0),
    0,
  )

  const recentEntries = [...commits]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  const levelBounds = getLevelBounds(level)
  const nextLevel = level < 5 ? level + 1 : 5
  const progressPercent = levelBounds.next
    ? Math.min(
        100,
        Math.max(
          0,
          ((totalXP - levelBounds.min) / (levelBounds.next - levelBounds.min)) * 100,
        ),
      )
    : 100

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-300">
        Syncing your GitHub data...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-lg font-semibold tracking-tight">DevBoard</p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="h-9 w-9 rounded-full border border-slate-700"
                />
              ) : (
                <div className="h-9 w-9 rounded-full border border-slate-700 bg-slate-800" />
              )}
              <span className="text-sm text-slate-300">@{username}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        {error ? (
          <p className="mb-6 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col items-center text-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="h-28 w-28 rounded-full border border-slate-700"
              />
            ) : (
              <div className="h-28 w-28 rounded-full border border-slate-700 bg-slate-800" />
            )}
            <h1 className="mt-5 text-3xl font-bold tracking-tight">@{username}</h1>
            {bio ? <p className="mt-2 max-w-xl text-sm text-slate-400">{bio}</p> : null}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">⚡ Total XP</p>
            <p className="mt-2 text-2xl font-semibold">{totalXP}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">⭐ Current Level</p>
            <p className="mt-2 text-2xl font-semibold">{level}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">🔥 Streak</p>
            <p className="mt-2 text-2xl font-semibold">{streak} days</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">💻 Total Commits</p>
            <p className="mt-2 text-2xl font-semibold">{totalCommits}</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-300">
            {level < 5
              ? `Level ${level} → Level ${nextLevel} | ${totalXP}/${levelBounds.next} XP`
              : `Level 5 | ${totalXP} XP`}
          </p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="px-3 py-3 font-medium">Repository</th>
                  <th className="px-3 py-3 font-medium">Commits</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={3}>
                      No commit activity found in the last 30 days.
                    </td>
                  </tr>
                ) : (
                  recentEntries.map((entry, index) => (
                    <tr key={`${entry.repo_name}-${entry.date}-${index}`} className="border-b border-slate-800/70">
                      <td className="px-3 py-3 text-slate-200">{entry.repo_name}</td>
                      <td className="px-3 py-3 text-slate-300">{entry.commit_count}</td>
                      <td className="px-3 py-3 text-slate-400">{entry.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
