const GITHUB_API_BASE = 'https://api.github.com'

function buildHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function githubGet(url, token) {
  const response = await fetch(url, {
    headers: buildHeaders(token),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`GitHub API error ${response.status}: ${message}`)
  }

  const data = await response.json()
  console.log(`[GitHub] Raw response from ${url}:`, data)
  return data
}

export async function fetchUserRepos(username, token) {
  if (!username) {
    throw new Error('Missing GitHub username for repos fetch.')
  }

  return githubGet(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100`, token)
}

export async function fetchRepoCommits(owner, repo, token, since, username) {
  const qs = new URLSearchParams({ per_page: '100' })
  if (since) {
    qs.set('since', since)
  }
  if (username) {
    qs.set('author', username)
  }

  const commits = await githubGet(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${qs.toString()}`,
    token,
  )

  return commits.filter((item) => {
    const authorLogin = item?.author?.login ?? item?.committer?.login
    return authorLogin === username
  })
}

export async function fetchAllCommits(username, token) {
  if (!username) {
    throw new Error('Missing GitHub username.')
  }

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - 30)
  const since = sinceDate.toISOString()

  const repos = await fetchUserRepos(username, token)
  const allRecords = []

  for (const repo of repos) {
    const owner = repo?.owner?.login
    const repoName = repo?.name

    if (!owner || !repoName) {
      continue
    }

    const commits = await fetchRepoCommits(owner, repoName, token, since, username)
    const countByDate = commits.reduce((acc, commit) => {
      const date = commit?.commit?.author?.date?.slice(0, 10)
      if (!date) {
        return acc
      }
      acc[date] = (acc[date] ?? 0) + 1
      return acc
    }, {})

    for (const [date, commitCount] of Object.entries(countByDate)) {
      allRecords.push({
        repo_name: repoName,
        commit_count: commitCount,
        date,
      })
    }
  }

  return allRecords
}
