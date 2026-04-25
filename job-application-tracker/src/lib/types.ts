export const STATUS = [
  "applied",
  "tech_test",
  "psychometric_test",
  "call_screening",
  "one_way",
  "interview",
  "rejected",
] as const;

export type JobStatus = typeof STATUS[number];

export type Job = {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  notes: string;
  status: JobStatus;
  createdAt: string;
};

export type ApplicationPanelProps = {
  job: Job | null
  isDark: boolean
  onClose: () => void
  onJobPatched: (id: string, patch: Partial<Job>) => void
  onJobDeleted: (id: string) => void
}