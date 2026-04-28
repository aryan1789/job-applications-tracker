import { useRef, useState } from "react"
import * as XLSX from "xlsx"
import { supabase } from "../lib/supabase"
import { STATUS_LABELS, type JobStatus, type ImportRow, type ImportResult, type ImportStage } from "../lib/types"

const COLUMN_ALIASES = {
  role:        ["job name", "role", "position", "title"],
  company:     ["company", "employer", "organisation", "organization"],
  status:      ["status"],
  appliedDate: ["applied date", "date applied", "date", "applied"],
}

function findColumn(headers: string[], aliases: string[]): string | null {
  return headers.find(h =>
    aliases.some(a => h.toLowerCase().trim().includes(a.toLowerCase()))
  ) ?? null
}

function normaliseStatus(raw: string): JobStatus {
  const s = raw.toLowerCase().trim()
  if (s.includes("reject") || s.includes("declin") || s.includes("unsuccessful")) return "rejected"
  if (s.includes("interview"))                                                      return "interview"
  if (s.includes("tech") || s.includes("coding") || s.includes("assessment"))      return "tech_test"
  if (s.includes("psycho") || s.includes("psych"))                                 return "psychometric_test"
  if (s.includes("screen") || s.includes("call") || s.includes("phone"))           return "call_screening"
  if (s.includes("one way") || s.includes("one-way") || s.includes("recorded"))    return "one_way"
  return "applied"
}

function parseRows(raw: Record<string, unknown>[]): { rows: ImportRow[], skipped: string[] } {
  if (raw.length === 0) return { rows: [], skipped: [] }

  const headers = Object.keys(raw[0])

  const roleCol        = findColumn(headers, COLUMN_ALIASES.role)
  const companyCol     = findColumn(headers, COLUMN_ALIASES.company)
  const statusCol      = findColumn(headers, COLUMN_ALIASES.status)
  const appliedDateCol = findColumn(headers, COLUMN_ALIASES.appliedDate)

  const rows: ImportRow[] = []
  const skipped: string[] = []

  raw.forEach((row, i) => {
    const role    = roleCol    ? String(row[roleCol] ?? "").trim()    : ""
    const company = companyCol ? String(row[companyCol] ?? "").trim() : ""

    if (!role || !company) {
      skipped.push(`Row ${i + 2}: missing ${!role ? "role" : "company"}`)
      return
    }

    const status: JobStatus = statusCol && row[statusCol]
      ? normaliseStatus(String(row[statusCol]))
      : "applied"

    let appliedDate: string | null = null
    if (appliedDateCol && row[appliedDateCol]) {
      const raw = row[appliedDateCol]
      if (raw instanceof Date && !isNaN(raw.getTime())) {
        appliedDate = raw.toISOString()
      } else if (typeof raw === "string" || typeof raw === "number") {
        const parsed = new Date(raw)
        if (!isNaN(parsed.getTime())) appliedDate = parsed.toISOString()
      }
    }

    rows.push({ role, company, status, appliedDate })
  })

  return { rows, skipped }
}

type Props = {
  open: boolean
  onClose: () => void
  onImported: (count: number) => void
  userId: string
  isDark: boolean
}

export default function ImportModal({ open, onClose, onImported, userId, isDark }: Props) {
  const [stage, setStage] = useState<ImportStage>("idle")
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [skipped, setSkipped] = useState<string[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleClose() {
    setStage("idle")
    setPreview([])
    setSkipped([])
    setResult(null)
    setError(null)
    onClose()
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { cellDates: true })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]

      const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]
      const allAliases = [
        ...COLUMN_ALIASES.role,
        ...COLUMN_ALIASES.company,
        ...COLUMN_ALIASES.status,
        ...COLUMN_ALIASES.appliedDate,
      ]
      const headerRowIdx = allRows.findIndex(row =>
        row.some(cell =>
          typeof cell === "string" &&
          allAliases.some(alias => cell.toLowerCase().trim().includes(alias.toLowerCase()))
        )
      )

      if (headerRowIdx === -1) {
        setError("Couldn't find a header row. Make sure your file has Role/Job Name and Company columns.")
        return
      }

      const raw = XLSX.utils.sheet_to_json(sheet, {
        range: headerRowIdx,
      }) as Record<string, unknown>[]

      if (raw.length === 0) {
        setError("The file appears to be empty.")
        return
      }

      const { rows, skipped } = parseRows(raw)

      if (rows.length === 0) {
        setError("No valid rows found. Make sure your file has Role/Job Name and Company columns.")
        return
      }

      setPreview(rows)
      setSkipped(skipped)
      setStage("preview")
    } catch {
      setError("Couldn't read the file. Make sure it's a valid Excel or CSV file.")
    } finally {
      e.target.value = ""
    }
  }

  async function handleImport() {
    setStage("importing")

    let imported = 0
    const skippedReasons: string[] = []

    for (const row of preview) {
      const { data, error } = await supabase
        .from("applications")
        .insert({
          user_id:      userId,
          company_name: row.company,
          role_name:    row.role,
          description:  "",
          notes:        "",
          status:       row.status,
          ...(row.appliedDate ? { created_at: row.appliedDate } : {}),
        })
        .select()
        .single()

      if (error || !data) {
        skippedReasons.push(`${row.role} at ${row.company}: failed to insert`)
        continue
      }

      const stepDate = row.appliedDate ?? new Date().toISOString()
      const steps: object[] = [
        { application_id: data.id, step_name: "applied", step_date: stepDate, notes: "" },
      ]
      if (row.status !== "applied") {
        steps.push({ application_id: data.id, step_name: row.status, step_date: null, notes: "" })
      }
      await supabase.from("application_process").insert(steps)

      imported++
    }

    setResult({ imported, skipped: skippedReasons.length, skippedReasons })
    onImported(imported)
    setStage("done")
  }

  if (!open) return null

  const overlay = "fixed inset-0 z-40 flex items-center justify-center p-4"
  const panel = `relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6 ${isDark ? "bg-slate-800 border border-slate-600 text-slate-100" : "bg-white border border-slate-200 text-slate-900"}`
  const muted = isDark ? "text-slate-400" : "text-slate-500"

  return (
    <div className={overlay} role="presentation">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={handleClose}
      />

      <div role="dialog" aria-modal="true" className={panel} onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Import applications from spreadsheet</h2>

        {stage === "idle" && (
          <div className="flex flex-col gap-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFile}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-8 border-2 border-dashed rounded-xl text-sm font-medium transition-colors cursor-pointer
                ${isDark ? "border-slate-600 hover:border-indigo-400 hover:text-indigo-400" : "border-slate-300 hover:border-indigo-400 hover:text-indigo-500"}`}
            >
              Upload file
            </button>
          </div>
        )}

        {stage === "preview" && (
          <div className="flex flex-col gap-4">
            <p className={`text-sm ${muted}`}>
              Found <span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{preview.length}</span> valid row{preview.length !== 1 ? "s" : ""}.
              {skipped.length > 0 && ` ${skipped.length} will be skipped (missing role or company).`}
            </p>
            <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <table className="w-full text-xs">
                <thead>
                  <tr className={isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}>
                    <th className="text-left px-3 py-2 font-semibold">Role</th>
                    <th className="text-left px-3 py-2 font-semibold">Company</th>
                    <th className="text-left px-3 py-2 font-semibold">Status</th>
                    <th className="text-left px-3 py-2 font-semibold">Applied date</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((row, i) => (
                    <tr key={i} className={`border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                      <td className="px-3 py-2">{row.role}</td>
                      <td className="px-3 py-2">{row.company}</td>
                      <td className="px-3 py-2">{STATUS_LABELS[row.status]}</td>
                      <td className={`px-3 py-2 ${muted}`}>
                        {row.appliedDate
                          ? new Date(row.appliedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 5 && (
              <p className={`text-xs ${muted}`}>Showing first 5 of {preview.length} rows.</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setStage("idle")}
                className={`px-4 py-2 text-sm rounded-lg ${isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200"}`}
              >
                Back
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Import {preview.length} application{preview.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {stage === "importing" && (
          <p className={`text-sm ${muted}`}>Importing…</p>
        )}

=        {stage === "done" && result && (
          <div className="flex flex-col gap-4">
            <p className="text-sm">
              <span className="text-green-400 font-semibold">{result.imported} imported</span>
              {result.skipped > 0 && (
                <span className={`ml-2 ${muted}`}>{result.skipped} skipped</span>
              )}
            </p>
            {result.skippedReasons.length > 0 && (
              <ul className={`text-xs list-disc list-inside ${muted}`}>
                {result.skippedReasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 self-end"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
