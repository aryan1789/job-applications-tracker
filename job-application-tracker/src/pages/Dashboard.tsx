import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import AddApplicationModal from "../components/AddApplicationModal";
import { STATUS, type JobStatus, type Job } from "../lib/types";
import Card from 'react-bootstrap/Card';
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";
import { useTheme } from "../utils/useTheme";
import { STATUS_LABELS, STATUS_BADGE_LIGHT, STATUS_BADGE_DARK, STATUS_BORDER } from "../utils/statuses";


function fromRow(row: Record<string, unknown>): Job {
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

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedJob, setExpandedJob] = useState<Job | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [panelStatus, setPanelStatus] = useState<JobStatus>("applied");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [editForm, setEditForm] = useState({ role: "", company: "", jobDescription: "", notes: "" });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs from Supabase
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setJobs((data ?? []).map(fromRow));
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (expandedJob) {
      setPanelStatus(expandedJob.status);
      setEditForm({
        role: expandedJob.role,
        company: expandedJob.company,
        jobDescription: expandedJob.jobDescription,
        notes: expandedJob.notes,
      });
      setEditMode(false);
      setDeleteConfirm(false);
      setStatusDropdownOpen(false);
      setDiscardConfirm(false);
    }
  }, [expandedJob?.id]);

  async function updateJob(id: string, patch: Partial<Job>) {
    const dbPatch: Record<string, unknown> = {};
    if (patch.company !== undefined) dbPatch.company_name = patch.company;
    if (patch.role !== undefined) dbPatch.role_name = patch.role;
    if (patch.jobDescription !== undefined) dbPatch.description = patch.jobDescription;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    if (patch.status !== undefined) dbPatch.status = patch.status;

    const { error } = await supabase.from("applications").update(dbPatch).eq("id", id);
    if (error) { setError(error.message); return; }

    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
    setExpandedJob(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  }

  async function deleteJob(id: string) {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    setJobs(prev => prev.filter(j => j.id !== id));
    setExpandedJob(null);
  }

  async function handleAdd(payload: {
    company: string; role: string; jobDescription: string;
    notes: string; status: JobStatus;
  }) {
    if (!user) return;
    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        company_name: payload.company.trim(),
        role_name: payload.role.trim(),
        description: payload.jobDescription.trim(),
        notes: payload.notes.trim(),
        status: payload.status,
      })
      .select()
      .single();

    if (error) { setError(error.message); return; }
    setJobs(prev => [fromRow(data), ...prev]);
    setModalOpen(false);
  }

  function tryClosePanel() {
    if (expandedJob && panelStatus !== expandedJob.status) {
      setDiscardConfirm(true);
    } else {
      setExpandedJob(null);
    }
  }

  function saveStatus() {
    if (!expandedJob) return;
    updateJob(expandedJob.id, { status: panelStatus });
  }

  function saveEdit() {
    if (!expandedJob) return;
    updateJob(expandedJob.id, {
      role: editForm.role.trim(),
      company: editForm.company.trim(),
      jobDescription: editForm.jobDescription.trim(),
      notes: editForm.notes.trim(),
    });
    setEditMode(false);
  }

  const cardBg = isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-white border-slate-200";
  const cardHover = isDark ? "hover:bg-slate-800 hover:border-slate-600 hover:shadow-lg" : "hover:border-slate-300 hover:shadow-md";
  const field = isDark ? "bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400";
  const panelBorder = isDark ? "border-slate-700" : "border-slate-200";

  return (
    <div className={`px-6 py-4 text-left ${isDark ? "text-slate-100" : "text-slate-950"}`}>
      <header className="flex items-center gap-3 mb-6">
        <h1 className={`!m-0 text-2xl font-semibold tracking-tight !leading-tight ${isDark ? "!text-slate-100" : "!text-slate-950"}`}>
          Applications
        </h1>
      </header>

      {error && (
        <div className="mb-4 text-sm text-red-500">{error}</div>
      )}

      {loading ? (
        <div className={isDark ? "text-slate-400" : "text-slate-500"}>Loading…</div>
      ) : jobs.length === 0 ? (
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
            );
          })}
        </div>
      )}

      {/* Backdrop */}
      {expandedJob && (
        <div className="fixed inset-0 z-40" style={{ backgroundColor: "rgba(0,0,0,0.2)" }} onClick={tryClosePanel} />
      )}

      {/* Side panel */}
      <div className={`fixed top-0 right-0 h-full z-50 w-96 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isDark ? "bg-slate-900 border-l border-slate-700" : "bg-white border-l border-slate-200"} ${expandedJob ? "translate-x-0" : "translate-x-full"}`}>
        {expandedJob && (
          <>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${panelBorder}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Application Detail
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditMode(v => !v); setDeleteConfirm(false); }}
                  className={`p-1.5 rounded-md transition-colors ${editMode ? "text-indigo-400" : isDark ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  onClick={() => { setDeleteConfirm(v => !v); setEditMode(false); }}
                  className={`p-1.5 rounded-md transition-colors ${deleteConfirm ? "text-red-400" : isDark ? "text-slate-400 hover:text-red-400 hover:bg-slate-800" : "text-slate-400 hover:text-red-500 hover:bg-slate-100"}`}
                >
                  <FiTrash2 size={15} />
                </button>
                <button
                  onClick={tryClosePanel}
                  className={`p-1.5 rounded-md transition-colors ${isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Delete confirmation */}
            {deleteConfirm && (
              <div className={`px-6 py-4 border-b ${panelBorder} ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                <p className={`text-sm font-medium !m-0 mb-3 ${isDark ? "text-red-300" : "text-red-700"}`}>
                  Delete this application?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteJob(expandedJob.id)}
                    className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
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

            {/* Discard unsaved status confirmation */}
            {discardConfirm && (
              <div className={`px-6 py-4 border-b ${panelBorder} ${isDark ? "bg-amber-900/20" : "bg-amber-50"}`}>
                <p className={`text-sm font-medium !m-0 mb-3 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                  You have an unsaved status change. Discard it?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDiscardConfirm(false); setExpandedJob(null); }}
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

            {/* Content */}
            <div className="flex flex-col gap-5 p-6 overflow-y-auto flex-1">
              {editMode ? (
                <>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Role", key: "role", type: "text" },
                      { label: "Company", key: "company", type: "text" },
                    ].map(({ label, key, type }) => (
                      <div key={key}>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</label>
                        <input
                          type={type}
                          value={editForm[key as keyof typeof editForm]}
                          onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                          className={`w-full border rounded-md px-3 py-2 text-sm ${field}`}
                        />
                      </div>
                    ))}
                    {[
                      { label: "Job Description", key: "jobDescription" },
                      { label: "Notes", key: "notes" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</label>
                        <textarea
                          rows={4}
                          value={editForm[key as keyof typeof editForm]}
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
                      {expandedJob.role || "-"}
                    </h2>
                    <p className={`text-base !m-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {expandedJob.company || "-"}
                    </p>
                    {expandedJob.createdAt && (
                      <p className={`text-xs !m-0 mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        Added {new Date(expandedJob.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>

                  <hr className={`border-0 border-t !m-0 ${panelBorder}`} />

                  {/* Status */}
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
                            onClick={() => { setPanelStatus(s); setStatusDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${panelStatus === s ? (isDark ? "bg-slate-700" : "bg-slate-100") : (isDark ? "hover:bg-slate-700" : "hover:bg-slate-50")}`}
                          >
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${isDark ? STATUS_BADGE_DARK[s] : STATUS_BADGE_LIGHT[s]}`}>
                              {STATUS_LABELS[s]}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <hr className={`border-0 border-t !m-0 ${panelBorder}`} />

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
                </>
              )}
            </div>

            {/* Save status button — only in view mode when status has changed */}
            {!editMode && panelStatus !== expandedJob.status && (
              <div className={`px-6 py-4 border-t ${panelBorder}`}>
                <button onClick={saveStatus} className="w-full py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                  Save status
                </button>
              </div>
            )}
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
      />
    </div>
  );
}
