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
