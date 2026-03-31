import { useEffect, useState } from "react";
import { isDark as themeIsDark } from "../lib/theme";

type Job = {
  id: string;
  company: string;
  role: string;
  status: "applied" | "interview" | "offer" | "rejected" | "other";
  notes: string;
};

const STORAGE_KEY = "applications";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 9);
}

export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => themeIsDark());
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Job[];
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
      } catch (err) {
        setIsDark(themeIsDark());
      }
    }
    window.addEventListener("themechange", onTheme as EventListener);
    return () => window.removeEventListener("themechange", onTheme as EventListener);
  }, []);

  function addJob() {
    const newJob: Job = {
      id: uid(),
      company: "",
      role: "",
      status: "applied",
      notes: "",
    };
    setJobs((s) => [newJob, ...s]);
  }

  function updateJob(id: string, patch: Partial<Job>) {
    setJobs((s) => s.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }

  function deleteJob(id: string) {
    setJobs((s) => s.filter((j) => j.id !== id));
  }

  const fieldLight =
    "bg-slate-50 border-slate-400 text-slate-950 placeholder:text-slate-600";
  const fieldDark =
    "bg-slate-700 text-slate-100 border-slate-600 placeholder:text-slate-400";
  const optionClass = isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-950";

  return (
    <div
      className={`max-w-4xl mx-auto p-6 text-left ${
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
          No applications yet — add one.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`shadow-sm rounded p-4 flex flex-col sm:flex-row sm:items-start gap-4 border ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-slate-200 border-slate-300"
              }`}
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  aria-label="Company"
                  value={job.company}
                  onChange={(e) => updateJob(job.id, { company: e.target.value })}
                  placeholder="Company"
                  className={`w-full min-w-0 border px-2 py-1.5 rounded ${
                    isDark ? fieldDark : fieldLight
                  }`}
                />
                <input
                  aria-label="Role"
                  value={job.role}
                  onChange={(e) => updateJob(job.id, { role: e.target.value })}
                  placeholder="Role"
                  className={`w-full min-w-0 border px-2 py-1.5 rounded ${
                    isDark ? fieldDark : fieldLight
                  }`}
                />
                <select
                  value={job.status}
                  onChange={(e) =>
                    updateJob(job.id, { status: e.target.value as Job["status"] })
                  }
                  className={`w-full min-w-0 border px-2 py-1.5 rounded ${
                    isDark ? fieldDark : fieldLight
                  }`}
                >
                  <option className={optionClass} value="applied">
                    Applied
                  </option>
                  <option className={optionClass} value="interview">
                    Interview
                  </option>
                  <option className={optionClass} value="offer">
                    Offer
                  </option>
                  <option className={optionClass} value="rejected">
                    Rejected
                  </option>
                  <option className={optionClass} value="other">
                    Other
                  </option>
                </select>
              </div>

              <div className="flex-1">
                <textarea
                  value={job.notes}
                  onChange={(e) => updateJob(job.id, { notes: e.target.value })}
                  placeholder="Notes"
                  className={`w-full border rounded px-2 py-1.5 min-h-[56px] ${
                    isDark ? fieldDark : fieldLight
                  }`}
                />
              </div>

              <div className="flex items-start gap-2">
                <button
                  onClick={() => deleteJob(job.id)}
                  className={`text-sm hover:underline ${isDark ? "text-red-400" : "text-red-600"}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        aria-label="Add application"
        onClick={addJob}
        className="fixed right-6 bottom-6 bg-indigo-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700"
      >
        +
      </button>
    </div>
  );
}
