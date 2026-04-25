import { useEffect, useState } from "react"
import { FiEdit2, FiTrash2 } from "react-icons/fi"
import { supabase } from "../lib/supabase"
import { STATUS, type Job, type JobStatus } from "../lib/types"
import { STATUS_LABELS, STATUS_BADGE_LIGHT, STATUS_BADGE_DARK, STATUS_COLORS } from "../utils/statuses"
import { useApplicationSteps } from "../hooks/useApplicationSteps"
import type { ApplicationPanelProps } from '../lib/types'

export default function ApplicationPanel({ job, isDark, onClose, onJobPatched, onJobDeleted }: ApplicationPanelProps) {
  const [editMode, setEditMode] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [panelStatus, setPanelStatus] = useState<JobStatus>("applied")
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [discardConfirm, setDiscardConfirm] = useState(false)
  const [editForm, setEditForm] = useState({ role: "", company: "", jobDescription: "", notes: "" })
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editingStepDate, setEditingStepDate] = useState("")
  const [stepMenuOpen, setStepMenuOpen] = useState<string | null>(null)
  const [editingStepNameId, setEditingStepNameId] = useState<string | null>(null)

  useEffect(() => {
    if (!job) {
      setEditingStepId(null)
      return
    }
    setPanelStatus(job.status)
    setEditForm({ role: job.role, company: job.company, jobDescription: job.jobDescription, notes: job.notes })
    setEditMode(false)
    setDeleteConfirm(false)
    setStatusDropdownOpen(false)
    setDiscardConfirm(false)
    setEditingStepId(null)
  }, [job?.id])

  useEffect(() => {
    if (!stepMenuOpen) return
    function close() { setStepMenuOpen(null) }
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [stepMenuOpen])

  const { steps, insertStep, updateStepDate, updateStepName, removeStep: removeStepHook } = useApplicationSteps(job?.id ?? undefined, job?.createdAt ?? undefined)

  async function patchJob(patch: Partial<Job>) {
    if (!job) return
    const dbPatch: Record<string, unknown> = {}
    if (patch.company !== undefined) dbPatch.company_name = patch.company
    if (patch.role !== undefined) dbPatch.role_name = patch.role
    if (patch.jobDescription !== undefined) dbPatch.description = patch.jobDescription
    if (patch.notes !== undefined) dbPatch.notes = patch.notes
    if (patch.status !== undefined) dbPatch.status = patch.status
    const { error } = await supabase.from("applications").update(dbPatch).eq("id", job.id)
    if (!error) onJobPatched(job.id, patch)
  }

  async function deleteJob() {
    if (!job) return
    const { error } = await supabase.from("applications").delete().eq("id", job.id)
    if (!error) onJobDeleted(job.id)
  }

  function tryClose() {
    if (job && panelStatus !== job.status) {
      setDiscardConfirm(true)
    } else {
      onClose()
    }
  }

  async function saveStatus() {
    if (!job) return
    if (steps.some(s => s.stepName === "rejected")) return
    if (steps.some(s => s.stepName === panelStatus)) return
    await patchJob({ status: panelStatus })
    await insertStep(panelStatus)
  }

  function saveEdit() {
    patchJob({
      role: editForm.role.trim(),
      company: editForm.company.trim(),
      jobDescription: editForm.jobDescription.trim(),
      notes: editForm.notes.trim(),
    })
    setEditMode(false)
  }

  async function saveStepDate(stepId: string) {
    if (!editingStepDate) { setEditingStepId(null); return }
    const newDate = new Date(`${editingStepDate}T12:00:00`).toISOString()
    await updateStepDate(stepId, newDate)
    setEditingStepId(null)
  }

  async function handleRemoveStep(stepId: string) {
    await removeStepHook(stepId)
    setStepMenuOpen(null)
  }

  async function saveStepName(stepId: string, newName: JobStatus) {
    const isFirstStep = steps[0]?.id === stepId
    const isLastStep = steps[steps.length - 1]?.id === stepId
    if (isFirstStep && newName !== "applied") { setEditingStepNameId(null); return }
    if (!isFirstStep && newName === "applied") { setEditingStepNameId(null); return }
    if (steps.some(s => s.id !== stepId && s.stepName === newName)) { setEditingStepNameId(null); return }
    await updateStepName(stepId, newName)
    if (isLastStep) { await patchJob({ status: newName }); setPanelStatus(newName) }
    setEditingStepNameId(null)
  }

  const panelBorder = isDark ? "border-slate-700" : "border-slate-200"
  const field = isDark
    ? "bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500"
    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"

  return (
    <>
      {job && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          onClick={tryClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-96 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
          ${isDark ? "bg-slate-900 border-l border-slate-700" : "bg-white border-l border-slate-200"}
          ${job ? "translate-x-0" : "translate-x-full"}`}
      >
        {job && (
          <>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${panelBorder}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Application Detail
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditMode(v => !v); setDeleteConfirm(false) }}
                  className={`p-1.5 rounded-md transition-colors ${editMode ? "text-indigo-400" : isDark ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  onClick={() => { setDeleteConfirm(v => !v); setEditMode(false) }}
                  className={`p-1.5 rounded-md transition-colors ${deleteConfirm ? "text-red-400" : isDark ? "text-slate-400 hover:text-red-400 hover:bg-slate-800" : "text-slate-400 hover:text-red-500 hover:bg-slate-100"}`}
                >
                  <FiTrash2 size={15} />
                </button>
                <button
                  onClick={tryClose}
                  className={`p-1.5 rounded-md transition-colors ${isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
                >
                  ✕
                </button>
              </div>
            </div>

            {deleteConfirm && (
              <div className={`px-6 py-4 border-b ${panelBorder} ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                <p className={`text-sm font-medium !m-0 mb-3 ${isDark ? "text-red-300" : "text-red-700"}`}>
                  Delete this application?
                </p>
                <div className="flex gap-2">
                  <button onClick={deleteJob} className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700">
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className={`px-3 py-1.5 text-sm rounded-md ${isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {discardConfirm && (
              <div className={`px-6 py-4 border-b ${panelBorder} ${isDark ? "bg-amber-900/20" : "bg-amber-50"}`}>
                <p className={`text-sm font-medium !m-0 mb-3 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                  You have an unsaved status change. Discard it?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDiscardConfirm(false); onClose() }}
                    className="px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => setDiscardConfirm(false)}
                    className={`px-3 py-1.5 text-sm rounded-md ${isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"}`}
                  >
                    Keep editing
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5 p-6 overflow-y-auto flex-1">
              {editMode ? (
                <>
                  <div className="flex flex-col gap-3">
                    {(["role", "company"] as const).map(key => (
                      <div key={key}>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {key === "role" ? "Role" : "Company"}
                        </label>
                        <input
                          type="text"
                          value={editForm[key]}
                          onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                          className={`w-full border rounded-md px-3 py-2 text-sm ${field}`}
                        />
                      </div>
                    ))}
                    {(["jobDescription", "notes"] as const).map(key => (
                      <div key={key}>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {key === "jobDescription" ? "Job Description" : "Notes"}
                        </label>
                        <textarea
                          rows={4}
                          value={editForm[key]}
                          onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                          className={`w-full border rounded-md px-3 py-2 text-sm resize-none ${field}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
                    <button onClick={() => setEditMode(false)} className={`px-4 py-2 text-sm rounded-md ${isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"}`}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <h2 className={`text-xl font-bold leading-snug !m-0 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {job.role || "-"}
                    </h2>
                    <p className={`text-base !m-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {job.company || "-"}
                    </p>
                    {job.createdAt && (
                      <p className={`text-xs !m-0 mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        Added {new Date(job.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>

                  <hr className={`border-0 border-t !m-0 ${panelBorder}`} />

                  <div className="relative">
                    <button
                      onClick={() => setStatusDropdownOpen(v => !v)}
                      className={`text-xs font-semibold px-3 py-1 rounded-md ${isDark ? STATUS_BADGE_DARK[panelStatus] : STATUS_BADGE_LIGHT[panelStatus]}`}
                    >
                      {STATUS_LABELS[panelStatus]}
                    </button>
                    {statusDropdownOpen && (
                      <div className={`absolute left-0 mt-1 w-48 rounded-lg border shadow-lg overflow-hidden z-10 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                        {STATUS.map(s => (
                          <button
                            key={s}
                            onClick={() => { setPanelStatus(s); setStatusDropdownOpen(false) }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors
                              ${panelStatus === s ? (isDark ? "bg-slate-700" : "bg-slate-100") : (isDark ? "hover:bg-slate-700" : "hover:bg-slate-50")}`}
                          >
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${isDark ? STATUS_BADGE_DARK[s] : STATUS_BADGE_LIGHT[s]}`}>
                              {STATUS_LABELS[s]}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {steps.length > 0 && (
                    <>
                      <hr className={`border-0 border-t !m-0 ${panelBorder}`} />
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider !m-0 mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          Progress
                        </p>
                        <div className="flex flex-col">
                          {steps.map((step, i) => (
                            <div key={step.id} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: STATUS_COLORS[step.stepName] }} />
                                {i < steps.length - 1 && (
                                  <div className={`w-px flex-1 my-1 ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
                                )}
                              </div>
                              <div className={`flex flex-col flex-1 min-w-0 ${i < steps.length - 1 ? "pb-3" : ""}`}>
                                <div className="flex items-start justify-between gap-1">
                                  {editingStepNameId === step.id ? (
                                    <select
                                      autoFocus
                                      value={step.stepName}
                                      onChange={e => saveStepName(step.id, e.target.value as JobStatus)}
                                      onBlur={() => setEditingStepNameId(null)}
                                      className={`text-sm font-medium border rounded px-1.5 py-0.5 ${isDark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-slate-300 text-slate-800"}`}
                                    >
                                      {STATUS.map(s => (
                                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className={`text-sm font-medium leading-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                      {STATUS_LABELS[step.stepName]}
                                    </span>
                                  )}
                                  <div className="relative shrink-0">
                                    <button
                                      onClick={e => { e.stopPropagation(); setStepMenuOpen(prev => prev === step.id ? null : step.id) }}
                                      className={`px-1 py-0.5 rounded text-sm leading-none ${isDark ? "text-slate-600 hover:text-slate-300 hover:bg-slate-700" : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"}`}
                                    >
                                      ···
                                    </button>
                                    {stepMenuOpen === step.id && (
                                      <div
                                        onClick={e => e.stopPropagation()}
                                        className={`absolute right-0 top-full mt-1 rounded-lg border shadow-lg overflow-hidden z-20 w-32 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
                                      >
                                        <button
                                          onClick={() => { setEditingStepNameId(step.id); setStepMenuOpen(null) }}
                                          className={`w-full text-left px-3 py-2 text-xs ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-50 text-slate-700"}`}
                                        >
                                          Edit status
                                        </button>
                                        <button
                                          onClick={() => { setEditingStepId(step.id); setEditingStepDate(new Date(step.stepDate).toLocaleDateString("en-CA")); setStepMenuOpen(null) }}
                                          className={`w-full text-left px-3 py-2 text-xs ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-50 text-slate-700"}`}
                                        >
                                          Edit date
                                        </button>
                                        <div className={`border-t ${isDark ? "border-slate-700" : "border-slate-200"}`} />
                                        <button
                                          onClick={() => handleRemoveStep(step.id)}
                                          className={`w-full text-left px-3 py-2 text-xs ${isDark ? "hover:bg-slate-700 text-red-400" : "hover:bg-slate-50 text-red-500"}`}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {editingStepId === step.id ? (
                                  <input
                                    type="date"
                                    autoFocus
                                    value={editingStepDate}
                                    onChange={e => setEditingStepDate(e.target.value)}
                                    onBlur={() => saveStepDate(step.id)}
                                    onKeyDown={e => {
                                      if (e.key === "Enter") saveStepDate(step.id)
                                      if (e.key === "Escape") setEditingStepId(null)
                                    }}
                                    className={`mt-0.5 text-xs border rounded px-1.5 py-0.5 w-32 ${isDark ? "bg-slate-700 border-slate-600 text-slate-300" : "bg-white border-slate-300 text-slate-600"}`}
                                  />
                                ) : (
                                  <button
                                    onClick={() => { setEditingStepId(step.id); setEditingStepDate(new Date(step.stepDate).toLocaleDateString("en-CA")) }}
                                    className={`mt-0.5 text-xs text-left hover:underline ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                                  >
                                    {new Date(step.stepDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <hr className={`border-0 border-t !m-0 ${panelBorder}`} />

                  <div className="flex flex-col gap-2">
                    <p className={`text-xs font-semibold uppercase tracking-wider !m-0 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Job Description</p>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap !m-0 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {job.jobDescription.trim() || "-"}
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-2">
                    <p className={`text-xs font-semibold uppercase tracking-wider !m-0 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Notes</p>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap !m-0 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {job.notes.trim() || "-"}
                    </p>
                  </div>
                </>
              )}
            </div>

            {!editMode && panelStatus !== job.status && !steps.some(s => s.stepName === "rejected") && !steps.some(s => s.stepName === panelStatus) && (
              <div className={`px-6 py-4 border-t ${panelBorder}`}>
                <button onClick={saveStatus} className="w-full py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                  Save status
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
