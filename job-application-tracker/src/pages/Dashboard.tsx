import React, { useEffect, useState } from "react";

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Applications</h1>
        <button
          onClick={addJob}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          + New
        </button>
      </header>

      {jobs.length === 0 ? (
        <div className="text-gray-500">No applications yet — add one.</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow-sm rounded p-4 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  aria-label="Company"
                  value={job.company}
                  onChange={(e) => updateJob(job.id, { company: e.target.value })}
                  placeholder="Company"
                  className="border px-2 py-1 rounded"
                />
                <input
                  aria-label="Role"
                  value={job.role}
                  onChange={(e) => updateJob(job.id, { role: e.target.value })}
                  placeholder="Role"
                  className="border px-2 py-1 rounded"
                />
                <select
                  value={job.status}
                  onChange={(e) =>
                    updateJob(job.id, { status: e.target.value as Job["status"] })
                  }
                  className="border px-2 py-1 rounded"
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex-1">
                <textarea
                  value={job.notes}
                  onChange={(e) => updateJob(job.id, { notes: e.target.value })}
                  placeholder="Notes"
                  className="w-full border rounded px-2 py-1 min-h-[56px]"
                />
              </div>

              <div className="flex items-start gap-2">
                <button
                  onClick={() => deleteJob(job.id)}
                  className="text-sm text-red-600 hover:underline"
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
