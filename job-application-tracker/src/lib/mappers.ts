import type { ApplicationStep } from './types'

export function stepFromRow(row: Record<string, unknown>): ApplicationStep {
  return {
    id: row.id as string,
    stepName: row.step_name as ApplicationStep["stepName"],
    stepDate: (row.step_date as string | null) ?? null,
    notes: (row.notes ?? '') as string,
  }
}
