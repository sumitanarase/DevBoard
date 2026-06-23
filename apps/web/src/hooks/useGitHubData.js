import { useEffect, useState } from 'react'
import { fetchAllCommits } from '../lib/github'
import { supabase } from '../lib/supabase'
import { getCurrentDbUserId } from '../lib/users'
import { calculateLevel, calculateStreak, calculateXP } from '../lib/xp'
import { useAuth } from './useAuth'

export function useGitHubData() {
  const { session, user, loading: authLoading } = useAuth()
  const [commits, setCommits] = useState([])
  const [totalXP, setTotalXP] = useState(0)
  const [streak, setStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (authLoading) {
        return
      }

      if (!session || !user) {
        setCommits([])
        setTotalXP(0)
        setStreak(0)
        setLevel(1)
        setLoading(false)
        return
      }

      const username = user.user_metadata?.user_name
      const githubId = user.user_metadata?.provider_id
      const token = session.provider_token
      console.log('[useGitHubData] session.provider_token:', token ?? null)
      if (!token) {
        console.warn('[useGitHubData] provider_token is null, using public GitHub endpoints.')
      }

      if (!username || !githubId) {
        setError('Missing GitHub session information.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const commitRows = await fetchAllCommits(username, token)
        const dbUserId = await getCurrentDbUserId(githubId)

        if (!dbUserId) {
          throw new Error('Unable to resolve user record in database.')
        }

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const sinceDate = thirtyDaysAgo.toISOString().slice(0, 10)

        const { error: deleteError } = await supabase
          .from('commits')
          .delete()
          .eq('user_id', dbUserId)
          .gte('date', sinceDate)

        if (deleteError) {
          throw deleteError
        }

        if (commitRows.length > 0) {
          const payload = commitRows.map((row) => ({
            user_id: dbUserId,
            repo_name: row.repo_name,
            commit_count: row.commit_count,
            date: row.date,
          }))

          const { error: insertError } = await supabase.from('commits').insert(payload)
          if (insertError) {
            throw insertError
          }
        }

        const totalCommits = commitRows.reduce(
          (sum, row) => sum + Number(row.commit_count || 0),
          0,
        )
        const commitDates = commitRows.flatMap((row) =>
          Array.from({ length: Number(row.commit_count || 0) }, () => row.date),
        )
        const currentStreak = calculateStreak(commitDates)
        const xp = calculateXP(totalCommits, currentStreak)
        const currentLevel = calculateLevel(xp)

        const { error: xpError } = await supabase.from('xp_stats').upsert(
          {
            user_id: dbUserId,
            total_xp: xp,
            streak: currentStreak,
            last_active: commitDates.length > 0 ? commitDates.sort().at(-1) : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )

        if (xpError) {
          throw xpError
        }

        setCommits(commitRows)
        setTotalXP(xp)
        setStreak(currentStreak)
        setLevel(currentLevel)
      } catch (err) {
        setError(err.message ?? 'Failed to load GitHub data.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [authLoading, session, user])

  return { commits, totalXP, streak, level, loading, error }
}
