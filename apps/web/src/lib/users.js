import { supabase } from './supabase'

export async function syncUserProfile(user) {
  const meta = user.user_metadata ?? {}
  const githubId = meta.provider_id

  if (!githubId) {
    console.warn('No GitHub provider_id in user metadata; skipping profile sync.')
    return
  }

  const { error } = await supabase.from('users').upsert(
    {
      github_id: String(githubId),
      username: meta.user_name ?? 'unknown',
      avatar_url: meta.avatar_url ?? null,
      bio: meta.bio ?? null,
    },
    { onConflict: 'github_id' },
  )

  if (error) {
    console.error('Failed to sync user profile:', error.message)
  }
}

export async function getCurrentDbUserId(githubId) {
  if (!githubId) {
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('github_id', String(githubId))
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch current db user:', error.message)
    return null
  }

  return data?.id ?? null
}
