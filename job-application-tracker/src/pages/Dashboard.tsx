import { useEffect, useState } from "react";
import { isDark as themeIsDark } from "../lib/theme";
import AddApplicationModal from "../components/AddApplicationModal";
import { STATUS } from "../lib/types";
import type { JobStatus } from "../lib/types";

type Job = {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  notes: string;
  status: JobStatus;
};

const STORAGE_KEY = "applications";



const STATUS_LABELS: Record<JobStatus, string> = {
  applied: "Applied",
  tech_test: "Tech test",
  psychometric_test: "Psychometric test",
  call_screening: "Call screening",
  one_way: "One way",
  interview: "Interview",
  rejected: "Rejected",
};

function uid() {
  const n = Math.floor(Math.random() * 10000) + 1;
  return String(n);
}

function truncate(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max && t.length>0) return t ;
  else if (t.length === 0) return "-";
  return `${t.slice(0, max)}…`;
}


export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => themeIsDark());
  const [modalOpen, setModalOpen] = useState(false);

  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed as Job[];
    } catch {
      return [];
    }
  });
 useEffect(() => {
  try {
     localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch {}
 }, [jobs]);

  useEffect(() => {
    function onTheme(e: Event) {
      try {
        // @ts-ignore - custom event detail is boolean
        setIsDark(!!(e as CustomEvent).detail);
      } catch {
        setIsDark(themeIsDark());
      }
    }
    window.addEventListener("themechange", onTheme as EventListener);
    return () => window.removeEventListener("themechange", onTheme as EventListener);
  }, []);

 

  const fieldLight =
    "bg-slate-50 border-slate-400 text-slate-950 placeholder:text-slate-600";
  const fieldDark =
    "bg-slate-700 text-slate-100 border-slate-600 placeholder:text-slate-400";
  const optionClass = isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-950";

  const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-slate-200 border-slate-300";
  const rowHover = isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-300/60";
  const thClass = isDark
    ? "text-left text-xs font-semibold uppercase tracking-wide text-slate-400 px-3 py-2"
    : "text-left text-xs font-semibold uppercase tracking-wide text-slate-600 px-3 py-2";
  const tdClass = "px-3 py-2 align-top text-sm";
  

  function closeModal() {
    setModalOpen(false);
  }
  function handleAdd(payload: {
    company: string;
    role: string;
    jobDescription: string;
    notes: string;
    status: JobStatus;
  }) {
    const company = payload.company.trim();
    const role = payload.role.trim();
    // ensure generated id does not collide with existing jobs
    let id = uid();
    while (jobs.some((j) => j.id === id)) {
      id = uid();
    }
    const newJob: Job = {
      id,
      company,
      role,
      jobDescription: payload.jobDescription.trim(),
      notes: payload.notes.trim(),
      status: payload.status,
    };
    setJobs((s) => [newJob, ...s]);
    setModalOpen(false);
  }

  function updateJob(id: string, patch: Partial<Job>) {
    setJobs((s) => s.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }

  function deleteJob(id: string) {
    setJobs((s) => s.filter((j) => j.id !== id));
  }

  const tableSelect =
    `min-w-[11rem] max-w-[14rem] text-sm border rounded px-2 py-1.5 ${isDark ? fieldDark : fieldLight}`;

  return (
    <div
      className={`max-w-6xl mx-auto p-6 text-left ${
        isDark ? "text-slate-100" : "text-slate-950"
      }`}
    >
      <header className="flex items-center justify-between mb-6">
        <h1
          className={`!m-0 !mb-0 text-2xl font-semibold tracking-tight !leading-tight ${
            isDark ? "!text-slate-100" : "!text-slate-950"
          }`}
        >
          Applications
        </h1>
      </header>

      {jobs.length === 0 ? (
        <div className={isDark ? "text-slate-400" : "text-slate-700"}>
          No applications yet — use the + button to add one.
        </div>
      ) : (
        <div
          className={`rounded-lg border overflow-x-auto shadow-sm ${cardBg}`}
        >
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr
                className={
                  isDark ? "border-b border-slate-600" : "border-b border-slate-400"
                }
              >
                <th className={thClass}>Role</th>
                <th className={thClass}>Company</th>
                <th className={thClass}>Description</th>
                <th className={thClass}>Notes</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} w-28`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className={`border-b last:border-b-0 ${isDark ? "border-slate-600" : "border-slate-400"} ${rowHover}`}>
                  <td className={`${tdClass} font-medium`}>{truncate(job.role, 30)}</td>
                  <td className={tdClass}>{job.company}</td>
                  <td className={`${tdClass} max-w-[200px]`}>
                    {truncate(job.jobDescription, 80)}
                  </td>
                  <td className={`${tdClass} max-w-[180px]`}>
                    {truncate(job.notes, 64)}
                  </td>
                  <td className={tdClass}>
                    <label className="sr-only" htmlFor={`status-${job.id}`}>
                      Status for {job.role} at {job.company}
                    </label>
                    <select
                      id={`status-${job.id}`}
                      value={job.status}
                      onChange={(e) => {
                        updateJob(job.id, { status: e.target.value as JobStatus });
                      }}
                      className={tableSelect}
                    >
                      {STATUS.map((s) => (
                        <option key={s} className={optionClass} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      onClick={() => deleteJob(job.id)}
                      className={`text-sm hover:underline ${isDark ? "text-red-400" : "text-red-700"}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        aria-label="Add application"
        onClick={() => setModalOpen(true)}
        className="fixed right-6 bottom-6 z-30 bg-indigo-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 text-2xl font-light leading-none"
      >
        +
      </button>

      <AddApplicationModal
        open={modalOpen}
        onClose={closeModal}
        onAdd={handleAdd}
        isDark={isDark}
        STATUS={STATUS}
        STATUS_LABELS={STATUS_LABELS}
      />
    </div>
  );
}
