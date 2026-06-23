const XP_PER_COMMIT = 10

export function calculateStreak(commitDates) {
  if (!Array.isArray(commitDates) || commitDates.length === 0) {
    return 0
  }

  const uniqueDates = new Set(
    commitDates
      .filter(Boolean)
      .map((value) => new Date(value).toISOString().slice(0, 10)),
  )

  const day = new Date()
  day.setHours(0, 0, 0, 0)

  let streak = 0
  while (true) {
    const key = day.toISOString().slice(0, 10)
    if (!uniqueDates.has(key)) {
      break
    }
    streak += 1
    day.setDate(day.getDate() - 1)
  }

  return streak
}

export function calculateXP(totalCommits, streak = 0) {
  const baseXP = Number(totalCommits || 0) * XP_PER_COMMIT
  const multiplier = streak >= 7 ? 1.5 : 1
  return Math.floor(baseXP * multiplier)
}

export function calculateLevel(totalXP) {
  if (totalXP >= 1000) {
    return 5
  }
  if (totalXP >= 600) {
    return 4
  }
  if (totalXP >= 300) {
    return 3
  }
  if (totalXP >= 100) {
    return 2
  }
  return 1
}
