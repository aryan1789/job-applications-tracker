import React, { useEffect, useState } from "react";
import type { JobStatus } from "../lib/types";
import { STATUS } from "../lib/types";
import { STATUS_LABELS } from "../utils/statuses";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (payload: {
    company: string;
    role: string;
    jobDescription: string;
    notes: string;
    status: JobStatus;
  }) => void;
  isDark: boolean;
}

export default function AddApplicationModal({
  open,
  onClose,
  onAdd,
  isDark,
}: Props) {
  const emptyForm = {
    company: "",
    role: "",
    jobDescription: "",
    notes: "",
    status: (STATUS && STATUS[0]) as JobStatus,
  };

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setFormError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const fieldLight = "bg-slate-50 border-slate-400 text-slate-950 placeholder:text-slate-600";
  const fieldDark = "bg-slate-700 text-slate-100 border-slate-600 placeholder:text-slate-400";
  const optionClass = isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-950";
  const modalPanel = isDark
    ? "bg-slate-800 border border-slate-600 text-slate-100"
    : "bg-slate-100 border border-slate-400 text-slate-950";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const company = form.company.trim();
    const role = form.role.trim();
    if (!company || !role) {
      setFormError("Company and role are required.");
      return;
    }
    onAdd({ ...form, company, role });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
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

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="app-role" className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
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
            <label htmlFor="app-company" className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Company
            </label>
            <input
              id="app-company"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className={`w-full border rounded px-3 py-2 ${isDark ? fieldDark : fieldLight}`}
              placeholder="Company name"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="app-desc" className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Job description
            </label>
            <textarea
              id="app-desc"
              value={form.jobDescription}
              onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))}
              rows={4}
              className={`w-full border rounded px-3 py-2 resize-y min-h-[96px] ${isDark ? fieldDark : fieldLight}`}
              placeholder="Paste or summarise the role…"
            />
          </div>

          <div>
            <label htmlFor="app-notes" className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
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
            <label htmlFor="app-status" className={`block text-sm font-medium mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Application status
            </label>
            <select
              id="app-status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as JobStatus }))}
              className={`w-full border rounded px-3 py-2 ${isDark ? fieldDark : fieldLight}`}
            >
              {STATUS.map((s) => (
                <option key={s} className={optionClass} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {formError && (
            <p className={`text-sm ${isDark ? "text-red-400" : "text-red-700"}`} role="alert">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                isDark
                  ? "border-slate-600 hover:bg-slate-700"
                  : "border-slate-400 hover:bg-slate-200"
              }`}
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
              Add application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
