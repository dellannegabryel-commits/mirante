import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const themesDir = join(root, 'src/renderer/src/styles/themes')

const REQUIRED = [
  '--surface-base', '--surface-1', '--surface-2', '--surface-3', '--surface-4',
  '--surface-input', '--surface-stage',
  '--text-primary', '--text-secondary', '--text-tertiary', '--text-muted',
  '--accent', '--accent-bright', '--accent-deep', '--accent-ink',
  '--accent-wash', '--accent-edge', '--accent-glow',
  '--tally', '--tally-wash', '--tally-edge',
  '--signal-good', '--signal-fair', '--signal-poor', '--signal-dead',
  '--rule-faint', '--rule', '--rule-strong', '--rule-accent', '--focus-ring',
  '--scroll-thumb', '--scroll-thumb-hover',
  '--shadow-plate', '--shadow-pop',
  '--danger'
]

const PAIRS = [
  ['--text-primary', '--surface-1', 4.5],
  ['--text-secondary', '--surface-1', 4.5],
  ['--accent', '--surface-1', 3],
  ['--accent-ink', '--accent', 4.5],
  ['--tally', '--surface-1', 3]
]

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const HSL = /^hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)$/i

function toRgb(value) {
  const text = String(value).trim()
  const hex = text.match(HEX)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = [...h].map((c) => c + c).join('')
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  }
  const hsl = text.match(HSL)
  if (!hsl) return null
  const h = Number(hsl[1]) / 360
  const s = Number(hsl[2]) / 100
  const l = Number(hsl[3]) / 100
  const k = (n) => (n + h * 12) % 12
  const a = s * Math.min(l, 1 - l)
  const channel = (n) => 255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))
  return [channel(0), channel(8), channel(4)].map((v) => Math.round(v))
}

function luminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function tokensOf(css) {
  const map = new Map()
  for (const [, name, value] of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi)) {
    map.set(`--${name}`, value.trim())
  }
  return map
}

const failures = []
const files = readdirSync(themesDir).filter((f) => f.endsWith('.css') && f !== 'index.css')
const metadata = readFileSync(join(root, 'src/renderer/src/lib/themes.ts'), 'utf8')

for (const file of files) {
  const css = readFileSync(join(themesDir, file), 'utf8')
  const id = file.replace(/\.css$/, '')
  if (!css.includes(`html[data-theme='${id}']`)) {
    failures.push(`${file}: seletor html[data-theme='${id}'] ausente`)
  }
  const tokens = tokensOf(css)
  for (const token of REQUIRED) {
    if (!tokens.has(token)) failures.push(`${file}: falta ${token}`)
  }
  for (const [fg, bg, min] of PAIRS) {
    const a = toRgb(tokens.get(fg) ?? '')
    const b = toRgb(tokens.get(bg) ?? '')
    if (!a || !b) {
      failures.push(`${file}: ${fg} sobre ${bg} não é valor literal (${tokens.get(fg)} / ${tokens.get(bg)})`)
      continue
    }
    const ratio = contrast(a, b)
    if (ratio < min) {
      failures.push(
        `${file}: ${fg} sobre ${bg} = ${ratio.toFixed(2)}:1, mínimo ${min.toFixed(1)}:1`
      )
    }
  }
  const entry = metadata.match(new RegExp(`id: '${id}'[\\s\\S]*?chips: \\[([^\\]]+)\\]`))
  if (!entry) {
    failures.push(`lib/themes.ts: sem entrada com chips pra ${id}`)
  } else {
    for (const [, chip] of entry[1].matchAll(/'([^']+)'/g)) {
      if (!css.includes(chip)) failures.push(`${file}: chip ${chip} não aparece no tema`)
    }
  }
}

const declared = [...metadata.matchAll(/id: '([^']+)'/g)].map((m) => m[1])
for (const id of declared) {
  if (id !== 'rack' && !files.includes(`${id}.css`)) {
    failures.push(`lib/themes.ts: ${id} não tem arquivo de tema`)
  }
}

if (failures.length) {
  console.error(`theme-check: ${failures.length} problema(s)`)
  for (const line of failures) console.error(`  ${line}`)
  process.exit(1)
}
console.log(`theme-check: ok (${files.length} temas, ${REQUIRED.length} tokens cada, contraste conferido)`)
