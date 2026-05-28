/** Parse comma/semicolon/newline-separated tokens (skills, industries, etc.). */
export function parseTokenCsv(csv: string): string[] {
  return (csv || "")
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function mergeTokensUnique(existing: string[], additions: string[]): string[] {
  const lower = new Set(existing.map((s) => s.toLowerCase()))
  const out = [...existing]
  for (const a of additions) {
    const t = a.trim()
    if (!t) continue
    const lk = t.toLowerCase()
    if (!lower.has(lk)) {
      lower.add(lk)
      out.push(t)
    }
  }
  return out
}

export function tokensToCsv(tokens: string[]): string {
  return tokens.join(", ")
}
