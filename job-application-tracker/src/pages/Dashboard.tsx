import { useEffect, useState, type FormEvent } from "react";
import { isDark as themeIsDark } from "../lib/theme";

type JobStatus =
  | "applied"
  | "tech_test"
  | "psychometric_test"
  | "call_screening"
  | "one_way"
  | "interview"
  | "rejected";

type Job = {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  notes: string;
  status: JobStatus;
};

const STORAGE_KEY = "applications";

const STATUS_ORDER: JobStatus[] = [
  "applied",
  "tech_test",
  "psychometric_test",
  "call_screening",
  "one_way",
  "interview",
  "rejected",
];

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
  if (t.length <= max) return t || "—";
  return `${t.slice(0, max)}…`;
}

const emptyForm = {
  company: "",
  role: "",
  jobDescription: "",
  notes: "",
  status: "applied" as JobStatus,
};

export default function Dashboard() {
  const [isDark, setIsDark] = useState(() => themeIsDark());
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

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
  const modalPanel = isDark
    ? "bg-slate-800 border border-slate-600 text-slate-100"
    : "bg-slate-100 border border-slate-400 text-slate-950";

  function openModal() {
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setFormError(null);
  }

  function submitForm(e: FormEvent) {
    e.preventDefault();
    const company = form.company.trim();
    const role = form.role.trim();
    if (!company || !role) {
      setFormError("Company and role are required.");
      return;
    }
    // ensure generated id does not collide with existing jobs
    let id = uid();
    while (jobs.some((j) => j.id === id)) {
      id = uid();
    }
    const newJob: Job = {
      id,
      company,
      role,
      jobDescription: form.jobDescription.trim(),
      notes: form.notes.trim(),
      status: form.status,
    };
    setJobs((s) => [newJob, ...s]);
    closeModal();
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
                  <td className={`${tdClass} font-medium`}>{job.role}</td>
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
                      {STATUS_ORDER.map((s) => (
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
        onClick={openModal}
        className="fixed right-6 bottom-6 z-30 bg-indigo-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 text-2xl font-light leading-none"
      >
        +
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-application-title"
            className={`relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6 ${modalPanel}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="add-application-title"
              className={`!m-0 !mb-4 !text-lg !font-semibold !leading-tight tracking-tight ${
                isDark ? "!text-slate-100" : "!text-slate-950"
              }`}
            >
              New application
            </h2>

            <form onSubmit={submitForm} className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor="app-role"
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Role
                </label>
                <input
                  id="app-role"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className={`w-full border rounded px-3 py-2 ${isDark ? fieldDark : fieldLight}`}
                  placeholder="e.g. Software engineer"
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="app-company"
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Company
                </label>
                <input
                  id="app-company"
                  value={form.company}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, company: e.target.value }))
                  }
                  className={`w-full border rounded px-3 py-2 ${isDark ? fieldDark : fieldLight}`}
                  placeholder="Company name"
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="app-desc"
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Job description
                </label>
                <textarea
                  id="app-desc"
                  value={form.jobDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jobDescription: e.target.value }))
                  }
                  rows={4}
                  className={`w-full border rounded px-3 py-2 resize-y min-h-[96px] ${isDark ? fieldDark : fieldLight}`}
                  placeholder="Paste or summarise the role…"
                />
              </div>

              <div>
                <label
                  htmlFor="app-notes"
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Notes
                </label>
                <textarea
                  id="app-notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className={`w-full border rounded px-3 py-2 resize-y min-h-[72px] ${isDark ? fieldDark : fieldLight}`}
                  placeholder="Your notes…"
                />
              </div>

              <div>
                <label
                  htmlFor="app-status"
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Application status
                </label>
                <select
                  id="app-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as JobStatus,
                    }))
                  }
                  className={`w-full border rounded px-3 py-2 ${isDark ? fieldDark : fieldLight}`}
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} className={optionClass} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p
                  className={`text-sm ${isDark ? "text-red-400" : "text-red-700"}`}
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                    isDark
                      ? "border-slate-600 hover:bg-slate-700"
                      : "border-slate-400 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Add application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
