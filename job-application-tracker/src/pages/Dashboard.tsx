import { useEffect, useState } from "react";
import AddApplicationModal from "../components/AddApplicationModal";
import ApplicationPanel from "../components/ApplicationPanel";
import JobCard from "../components/JobCard";
import { type JobStatus, type Job } from "../lib/types";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";
import { useTheme } from "../utils/useTheme";


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

// JobCard extracted to src/components/JobCard.tsx

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedJob, setExpandedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // card styling handled inside JobCard component

  return (
    <div className={`px-6 py-4 text-left ${isDark ? "text-slate-100" : "text-slate-950"}`}>
      <header className="flex items-center gap-3 mb-6">
        <h1 className={`!m-0 text-2xl font-semibold tracking-tight !leading-tight ${isDark ? "!text-slate-100" : "!text-slate-950"}`}>
          Applications
        </h1>
      </header>

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      {loading ? (
        <div className={isDark ? "text-slate-400" : "text-slate-500"}>Loading…</div>
      ) : jobs.length === 0 ? (
        <div className={isDark ? "text-slate-400" : "text-slate-500"}>
          No applications yet. Add using the + button.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map(job => (
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
