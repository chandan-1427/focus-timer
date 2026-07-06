export function formatDuration(totalMs: number) {
  const pad = (n: number, len = 2) => n.toString().padStart(len, '0')
  const totalSeconds = Math.floor(totalMs / 1000)
  const ms = totalMs % 1000

  const years = Math.floor(totalSeconds / (365 * 24 * 3600))
  let rem = totalSeconds % (365 * 24 * 3600)
  const days = Math.floor(rem / (24 * 3600))
  rem %= 24 * 3600
  const hours = Math.floor(rem / 3600)
  rem %= 3600
  const minutes = Math.floor(rem / 60)
  const seconds = rem % 60

  const parts: string[] = []
  if (years) parts.push(`${years}y`)
  if (years || days) parts.push(`${days}d`)
  parts.push(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`)

  return { main: parts.join(' '), ms: pad(ms, 3) }
}