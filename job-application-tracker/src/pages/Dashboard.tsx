import { useEffect, useState } from "react";
import { isDark as themeIsDark } from "../lib/theme";
import AddApplicationModal from "../components/AddApplicationModal";
import { STATUS } from "../lib/types";
import type { JobStatus } from "../lib/types";
import Card from 'react-bootstrap/Card';

type Job = {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  notes: string;
  status: JobStatus;
  appliedDate: string;
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

const STATUS_BADGE_LIGHT: Record<JobStatus, string> = {
  applied: "bg-blue-100 text-blue-800",
  tech_test: "bg-purple-100 text-purple-800",
  psychometric_test: "bg-violet-100 text-violet-800",
  call_screening: "bg-yellow-100 text-yellow-800",
  one_way: "bg-orange-100 text-orange-800",
  interview: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const STATUS_BADGE_DARK: Record<JobStatus, string> = {
  applied: "bg-blue-900/60 text-blue-300",
  tech_test: "bg-purple-900/60 text-purple-300",
  psychometric_test: "bg-violet-900/60 text-violet-300",
  call_screening: "bg-yellow-900/60 text-yellow-300",
  one_way: "bg-orange-900/60 text-orange-300",
  interview: "bg-green-900/60 text-green-300",
  rejected: "bg-red-900/60 text-red-300",
};

const STATUS_BORDER: Record<JobStatus, string> = {
  applied: "border-l-blue-400",
  tech_test: "border-l-purple-400",
  psychometric_test: "border-l-violet-400",
  call_screening: "border-l-yellow-400",
  one_way: "border-l-orange-400",
  interview: "border-l-green-400",
  rejected: "border-l-red-400",
};

function uid() {
  const n = Math.floor(Math.random() * 10000) + 1;
  return String(n);
}

function truncate(text: string, max: number) {
  const t = text.trim();
  if (t.length === 0) return "-";
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => themeIsDark());
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedJob, setExpandedJob] = useState<Job | null>(null);

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
    // eslint-disable-next-line no-console
    console.log("Dashboard jobs:", jobs.length, jobs);
  }, [jobs]);

  useEffect(() => {
    function onTheme(e: Event) {
      try {
        setIsDark(!!(e as CustomEvent).detail);
      } catch {
        setIsDark(themeIsDark());
      }
    }
    window.addEventListener("themechange", onTheme as EventListener);
    return () => window.removeEventListener("themechange", onTheme as EventListener);
  }, []);

  const cardBg = isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-white border-slate-200";
  const cardHover = isDark ? "hover:bg-slate-800 hover:border-slate-600 hover:shadow-lg" : "hover:border-slate-300 hover:shadow-md";

  function handleAdd(payload: {
    company: string;
    role: string;
    jobDescription: string;
    notes: string;
    status: JobStatus;
    appliedDate: string;
  }) {
    const company = payload.company.trim();
    const role = payload.role.trim();
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
      appliedDate: payload.appliedDate,
    };
    setJobs((prev) => [newJob, ...prev]);
    setModalOpen(false);
  }

  return (
    <div className={`px-6 py-4 text-left ${isDark ? "text-slate-100" : "text-slate-950"}`}>
      <header className="flex items-center gap-3 mb-6">
        <h1 className={`!m-0 text-2xl font-semibold tracking-tight !leading-tight ${isDark ? "!text-slate-100" : "!text-slate-950"}`}>
          Applications
        </h1>
        <div className="text-sm text-slate-500 mt-1">Jobs: {jobs.length}</div>
      </header>

      {jobs.length === 0 ? (
        <div className={isDark ? "text-slate-400" : "text-slate-500"}>
          No applications yet — use the + button to add one.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => {
            const badge = isDark ? STATUS_BADGE_DARK[job.status] : STATUS_BADGE_LIGHT[job.status];
            const border = STATUS_BORDER[job.status];
            return (
              <Card
                key={job.id}
                onClick={() => setExpandedJob(job)}
                className={`rounded-xl border-l-4 shadow-sm transition-all duration-200 cursor-pointer ${cardBg} ${cardHover} ${border}`}
              >
                <Card.Body className="px-6 py-5 flex flex-row items-center justify-between gap-6">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3
                      className={`text-base font-semibold leading-snug !m-0 truncate ${isDark ? "text-slate-100" : "text-slate-900"}`}
                    >
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
            );
          })}
        </div>
      )}

      {/* Side panel backdrop */}
      {expandedJob && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          onClick={() => setExpandedJob(null)}
        />
      )}

      {/* Slide-out side panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-96 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isDark ? "bg-slate-900 border-l border-slate-700" : "bg-white border-l border-slate-200"
        } ${expandedJob ? "translate-x-0" : "translate-x-full"}`}
      >
        {expandedJob && (
          <>
            {/* Panel header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Application Detail
              </span>
              <button
                type="button"
                onClick={() => setExpandedJob(null)}
                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors ${isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
              >
                ✕
              </button>
            </div>

            {/* Panel content */}
            <div className="flex flex-col gap-6 p-6 overflow-y-auto flex-1">
              <div className="flex flex-col gap-1">
                <h2 className={`text-xl font-bold leading-snug !m-0 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {expandedJob.role || "-"}
                </h2>
                <p className={`text-base !m-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {expandedJob.company || "-"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`self-start text-xs font-semibold px-3 py-1 rounded-md ${isDark ? STATUS_BADGE_DARK[expandedJob.status] : STATUS_BADGE_LIGHT[expandedJob.status]}`}>
                  {STATUS_LABELS[expandedJob.status]}
                </span>
                {expandedJob.appliedDate && (
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Applied {new Date(expandedJob.appliedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>

              <hr className={`border-0 border-t !m-0 ${isDark ? "border-slate-700" : "border-slate-200"}`} />

              <div className="flex flex-col gap-2">
                <p className={`text-xs font-semibold uppercase tracking-wider !m-0 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Job Description</p>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap !m-0 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {expandedJob.jobDescription.trim() || "-"}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className={`text-xs font-semibold uppercase tracking-wider !m-0 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Notes</p>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap !m-0 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {expandedJob.notes.trim() || "-"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

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
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        isDark={isDark}
        STATUS={STATUS}
        STATUS_LABELS={STATUS_LABELS}
      />
    </div>
  );
}
