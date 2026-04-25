import Card from "react-bootstrap/Card"
import { type Job } from "../lib/types"
import { STATUS_LABELS, STATUS_BADGE_LIGHT, STATUS_BADGE_DARK, STATUS_BORDER } from "../utils/statuses"

export default function JobCard({ job, onClick, isDark }: { job: Job; onClick: () => void; isDark: boolean }) {
  const badge = isDark ? STATUS_BADGE_DARK[job.status] : STATUS_BADGE_LIGHT[job.status]
  const border = STATUS_BORDER[job.status]
  const cardBg = isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-white border-slate-200"
  const cardHover = isDark ? "hover:bg-slate-800 hover:border-slate-600 hover:shadow-lg" : "hover:border-slate-300 hover:shadow-md"

  return (
    <Card
      onClick={onClick}
      className={`rounded-xl border-l-4 shadow-sm transition-all duration-200 cursor-pointer ${cardBg} ${cardHover} ${border}`}
    >
      <Card.Body className="px-6 py-5 flex flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className={`text-base font-semibold leading-snug !m-0 truncate ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            {job.role || "-"}
          </h3>
          <p className={`text-sm !m-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {job.company || "-"}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-md ${badge}`}>
          {STATUS_LABELS[job.status]}
        </span>
      </Card.Body>
    </Card>
  )
}
