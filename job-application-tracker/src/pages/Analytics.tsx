import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthProvider'
import { useTheme } from '../utils/useTheme'
import type { JobStatus, Job } from '../lib/types'
import {  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,} from 'recharts'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/statuses'

function buildPieData(jobs: Job[]) {
  const counts: Partial<Record<JobStatus, number>> = {}
  for (const job of jobs) {
    counts[job.status] = (counts[job.status] ?? 0) + 1
  }
  return (Object.entries(counts) as [JobStatus, number][]).map(([status, value]) => ({
    name: STATUS_LABELS[status],
    value,
    color: STATUS_COLORS[status],
  }))
}

function buildTimelineData(jobs: Job[]) {
  const applications: Record<string, number> = {}
  for (const job of jobs) {
    const d = new Date(job.createdAt)
    d.setHours(12, 0, 0, 0)
    const timestamp = String(d.getTime())
    applications[timestamp] = (applications[timestamp] ?? 0) + 1
  }

  return Object.keys(applications)
    .map(k => Number(k))
    .sort((a, b) => a - b)
    .map(ts => ({
      day: new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      count: applications[String(ts)],
    }))
}

export default function Analytics() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('applications')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) { setError(error.message); setLoading(false); return }
        setJobs(
          (data ?? []).map(row => ({
            id: row.id as string,
            status: row.status as JobStatus,
            createdAt: row.created_at as string,
            company: '',
            role: '',
            jobDescription: '',
            notes: '',
          }))
        )
        setLoading(false)
      })
  }, [user])

  const total = jobs.length
  const active = jobs.filter(j => j.status !== 'rejected').length
  const interviews = jobs.filter(j => j.status === 'interview').length
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0

  const pieData = buildPieData(jobs)
  const timelineData = buildTimelineData(jobs)

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-slate-100' : 'text-slate-900'
  const tooltipStyle = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }
    : { backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#0f172a' }
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const axisColor = isDark ? '#64748b' : '#94a3b8'

  if (loading) return <div className={`px-6 py-4 ${muted}`}>Loading…</div>
  if (error) return <div className="px-6 py-4 text-sm text-red-500">{error}</div>

  return (
    <div className={`px-6 py-4 ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
      <h1 className={`text-2xl font-semibold tracking-tight mb-6 ${heading}`}>Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total applications', value: total },
          { label: 'Active applications', value: active },
          { label: 'Interview rate', value: `${interviewRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className={`rounded-xl border p-5 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${muted}`}>{label}</p>
            <p className={`text-3xl font-bold ${heading}`}>{value}</p>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <p className={muted}>No applications yet.</p>
      ) : (
        <div className="flex flex-col gap-8">

          <div className={`rounded-xl border p-6 ${card}`}>

            <p className={`text-sm font-semibold mb-4 ${heading}`}>Status distribution</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={`rounded-xl border p-6 ${card}`}>
            <p className={`text-sm font-semibold mb-4 ${heading}`}>Applications timeline</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={timelineData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Applications"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

          </div>
        </div>
      )}
    </div>
  )
}
