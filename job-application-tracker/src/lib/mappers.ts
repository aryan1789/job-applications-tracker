import type { JobStatus } from './types'

export type ApplicationStep = {
  id: string
  stepName: JobStatus
  stepDate: string
  notes: string
}

export function stepFromRow(row: Record<string, unknown>): ApplicationStep {
  return {
    id: row.id as string,
    stepName: row.step_name as JobStatus,
    stepDate: row.step_date as string,
    notes: (row.notes ?? '') as string,
  }
}
