import { useEffect, useRef, useState } from "react";
import { BiSortUp, BiSortDown } from "react-icons/bi";
import AddApplicationModal from "../components/AddApplicationModal";
import ApplicationPanel from "../components/ApplicationPanel";
import JobCard from "../components/JobCard";
import { STATUS, type JobStatus, type Job } from "../lib/types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";
import { useTheme } from "../utils/useTheme";
import { STATUS_LABELS, STATUS_BADGE_LIGHT, STATUS_BADGE_DARK } from "../utils/statuses";


function supabaseDBToJob(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    company: row.company_name as string,
    role: row.role_name as string,
    jobDescription: row.description as string,
    notes: row.notes as string,
    status: row.status as JobStatus,
    createdAt: row.created_at as string,
  };
}

type StatusFilter = JobStatus | "all";

function filterJobs(jobs: Job[], query: string, status: StatusFilter): Job[] {
  const q = query.trim().toLowerCase();
  return jobs.filter(job => {
    const matchesStatus = status === "all" || job.status === status;
    const matchesQuery = !q
      || job.role.toLowerCase().includes(q)
      || job.company.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });
}

type SortBy = "date" | "alpha" | "status";
type SortDir = "asc" | "desc";

const SORT_LABELS: Record<SortBy, string> = {
  date: "Date added",
  alpha: "Alphabetical",
  status: "Status",
};

function sortJobs(jobs: Job[], by: SortBy, dir: SortDir): Job[] {
  return [...jobs].sort((a, b) => {
    let cmp = 0;
    if (by === "date")   cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (by === "alpha")  cmp = a.role.localeCompare(b.role);
    if (by === "status") cmp = STATUS_LABELS[a.status].localeCompare(STATUS_LABELS[b.status]);
    return dir === "asc" ? cmp : -cmp;
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedJob, setExpandedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const filteredJobs = sortJobs(filterJobs(jobs, searchQuery, statusFilter), sortBy, sortDir);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setJobs((data ?? []).map(supabaseDBToJob));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
    }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  async function handleAdd({company, role, jobDescription, notes, status}: {
    company: string; 
    role: string; 
    jobDescription: string;
    notes: string; 
    status: JobStatus;
  }) {
    if (!user) return;
    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        company_name: company.trim(),
        role_name: role.trim(),
        description: jobDescription.trim(),
        notes: notes.trim(),
        status: status,
      })
      .select()
      .single();

    if (error) { setError(error.message); return; }
    const newJob = supabaseDBToJob(data);
    setJobs(prev => [newJob, ...prev]);

    const now = new Date().toISOString();
    const stepRows: object[] = [{ application_id: newJob.id, step_name: "applied", step_date: now, notes: "" }];
    if (status !== "applied") {
      stepRows.push({ application_id: newJob.id, step_name: status, step_date: now, notes: "" });
    }
    await supabase.from("application_process").insert(stepRows);

    setModalOpen(false);
  }

  function handleJobPatched(id: string, patch: Partial<Job>) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
    setExpandedJob(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  }

  function handleJobDeleted(id: string) {
    setJobs(prev => prev.filter(j => j.id !== id));
    setExpandedJob(null);
  }

  return (
    <div className={`px-6 py-4 text-left ${isDark ? "text-slate-100" : "text-slate-950"}`}>
      <header className="flex items-center gap-3 mb-6">
        <h1 className={`!m-0 text-2xl font-semibold tracking-tight !leading-tight ${isDark ? "!text-slate-100" : "!text-slate-950"}`}>
          Applications
        </h1>
      </header>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      {!loading && jobs.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by role or company…"
              className={`flex-1 border rounded-lg px-3 py-2 text-sm ${isDark ? "bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"}`}
            />
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setSortOpen(v => !v)}
                className={`h-full flex items-center gap-1.5 border rounded-lg px-3 text-sm font-medium transition-colors ${sortOpen ? (isDark ? "bg-slate-700 border-slate-500 text-slate-100" : "bg-slate-100 border-slate-400 text-slate-800") : (isDark ? "bg-slate-800 border-slate-600 text-slate-400 hover:text-slate-100 hover:bg-slate-700" : "bg-white border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-50")}`}
              >
                {sortDir === "asc" ? <BiSortUp size={18} /> : <BiSortDown size={18} />}
                <span>{SORT_LABELS[sortBy]}</span>
              </button>
              {sortOpen && (
                <div className={`absolute right-0 top-full mt-1 rounded-lg border shadow-lg overflow-hidden z-20 w-44 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                  {(["date", "alpha", "status"] as SortBy[]).map(opt => {
                    const isActive = sortBy === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          if (isActive) setSortDir(d => d === "asc" ? "desc" : "asc");
                          else { setSortBy(opt); setSortDir("asc"); }
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${isActive ? (isDark ? "bg-slate-700 text-slate-100" : "bg-slate-100 text-slate-900") : (isDark ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-50")}`}
                      >
                        {SORT_LABELS[opt]}
                        {isActive && (sortDir === "asc" ? <BiSortUp size={15} className="text-indigo-400" /> : <BiSortDown size={15} className="text-indigo-400" />)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`text-xs font-semibold px-3 py-1 rounded-md border transition-colors ${statusFilter === "all" ? (isDark ? "bg-slate-600 border-slate-500 text-slate-100" : "bg-slate-800 border-slate-800 text-white") : (isDark ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-slate-300 text-slate-500 hover:bg-slate-100")}`}
            >
              All
            </button>
            {STATUS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors ${statusFilter === s ? (isDark ? STATUS_BADGE_DARK[s] : STATUS_BADGE_LIGHT[s]) : (isDark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100")}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className={isDark ? "text-slate-400" : "text-slate-500"}>Loading…</div>
      ) : jobs.length === 0 ? (
        <div className={isDark ? "text-slate-400" : "text-slate-500"}>
          No applications yet. Add using the + button.
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className={isDark ? "text-slate-400" : "text-slate-500"}>
          No applications match your filters.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onClick={() => setExpandedJob(job)} isDark={isDark} />
          ))}
        </div>
      )}

      <ApplicationPanel
        job={expandedJob}
        isDark={isDark}
        onClose={() => setExpandedJob(null)}
        onJobPatched={handleJobPatched}
        onJobDeleted={handleJobDeleted}
      />

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
      />
    </div>
  );
}
