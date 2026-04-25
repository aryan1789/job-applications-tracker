import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { stepFromRow, type ApplicationStep } from '../lib/mappers'
import type { JobStatus } from '../lib/types'

export function useApplicationSteps(jobId?: string, createdAt?: string) {
  const [steps, setSteps] = useState<ApplicationStep[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!jobId) {
      setSteps([])
      return
    }
    setLoading(true)
    ;(async () => {
      const { data } = await supabase
        .from('application_process')
        .select('*')
        .eq('application_id', jobId)
        .order('step_date', { ascending: true })

      const fetched = (data ?? []).map(stepFromRow)

      if (createdAt) {
        const createdMs = new Date(createdAt).getTime()
        const hasInitialStep = fetched.some(
          s => Math.abs(new Date(s.stepDate).getTime() - createdMs) < 5 * 60 * 1000
        )
        if (!hasInitialStep) {
          const { data: seeded } = await supabase
            .from('application_process')
            .insert({ application_id: jobId, step_name: 'applied', step_date: createdAt, notes: '' })
            .select()
            .single()
          setSteps(seeded ? [stepFromRow(seeded), ...fetched] : fetched)
        } else {
          setSteps(fetched)
        }
      } else {
        setSteps(fetched)
      }
      setLoading(false)
    })().catch(() => setLoading(false))
  }, [jobId, createdAt])

  async function insertStep(stepName: JobStatus) {
    if (!jobId) return
    const { data } = await supabase
      .from('application_process')
      .insert({ application_id: jobId, step_name: stepName, step_date: new Date().toISOString(), notes: '' })
      .select()
      .single()
    if (data) setSteps(prev => [...prev, stepFromRow(data)])
  }

  async function updateStepDate(stepId: string, isoDate: string) {
    const { error } = await supabase.from('application_process').update({ step_date: isoDate }).eq('id', stepId)
    if (!error) setSteps(prev => prev.map(s => (s.id === stepId ? { ...s, stepDate: isoDate } : s)))
  }

  async function updateStepName(stepId: string, newName: JobStatus) {
    const { error } = await supabase.from('application_process').update({ step_name: newName }).eq('id', stepId)
    if (!error) setSteps(prev => prev.map(s => (s.id === stepId ? { ...s, stepName: newName } : s)))
  }

  async function removeStep(stepId: string) {
    const { error } = await supabase.from('application_process').delete().eq('id', stepId)
    if (!error) setSteps(prev => prev.filter(s => s.id !== stepId))
  }

  return { steps, loading, insertStep, updateStepDate, updateStepName, removeStep }
}
