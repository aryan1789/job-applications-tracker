import type { JobStatus } from '../lib/types'

export const STATUS_LABELS: Record<JobStatus, string> = {
  applied: 'Applied',
  tech_test: 'Tech test',
  psychometric_test: 'Psychometric test',
  call_screening: 'Call screening',
  one_way: 'One way',
  interview: 'Interview',
  rejected: 'Rejected',
}

export const STATUS_BADGE_LIGHT: Record<JobStatus, string> = {
  applied: 'bg-blue-100 text-blue-800',
  tech_test: 'bg-purple-100 text-purple-800',
  psychometric_test: 'bg-violet-100 text-violet-800',
  call_screening: 'bg-yellow-100 text-yellow-800',
  one_way: 'bg-orange-100 text-orange-800',
  interview: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export const STATUS_BADGE_DARK: Record<JobStatus, string> = {
  applied: 'bg-blue-900/60 text-blue-300',
  tech_test: 'bg-purple-900/60 text-purple-300',
  psychometric_test: 'bg-violet-900/60 text-violet-300',
  call_screening: 'bg-yellow-900/60 text-yellow-300',
  one_way: 'bg-orange-900/60 text-orange-300',
  interview: 'bg-green-900/60 text-green-300',
  rejected: 'bg-red-900/60 text-red-300',
}

export const STATUS_BORDER: Record<JobStatus, string> = {
  applied: 'border-l-blue-400',
  tech_test: 'border-l-purple-400',
  psychometric_test: 'border-l-violet-400',
  call_screening: 'border-l-yellow-400',
  one_way: 'border-l-orange-400',
  interview: 'border-l-green-400',
  rejected: 'border-l-red-400',
}

export const STATUS_COLORS: Record<JobStatus, string> = {
  applied: '#60a5fa',
  tech_test: '#c084fc',
  psychometric_test: '#a78bfa',
  call_screening: '#fbbf24',
  one_way: '#fb923c',
  interview: '#4ade80',
  rejected: '#f87171',
}
