import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY = "'Playfair Display', Georgia, serif"
const BODY = "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY,
  fontBody: BODY,
  bg: '#f3e3d0',
  surface: '#ffffff',
  raised: '#eef4f7',
  text: '#4e6173',
  muted: '#71879b',
  line: '#d5e3eb',
  accent: '#81A6C6',
  accentSoft: '#AACDDC',
  onAccent: '#ffffff',
  glow: 'rgba(129,166,198,0.22)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Articles', note: 'Feature reads and practical pieces with a cleaner browse path.' },
  listing: { ...base, kicker: 'Listings', note: 'A directory-first layout for discovery, comparison, and quick contact.' },
  classified: { ...base, kicker: 'Classifieds', note: 'Short-form offers with visible prices, tags, and action buttons.' },
  image: { ...base, kicker: 'Visuals', note: 'Media-led posts with room for image grids and related discovery.' },
  sbm: { ...base, kicker: 'Resources', note: 'Curated links and references presented in a lighter library style.' },
  pdf: { ...base, kicker: 'Documents', note: 'Public files and downloadable resources in a clean archive surface.' },
  profile: { ...base, kicker: 'Profiles', note: 'Identity-first cards and detail pages for people and public profiles.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
