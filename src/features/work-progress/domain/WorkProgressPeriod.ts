export interface WorkProgressPeriod {
  id: string;
  planId: string;
  seq: number;
  label: string;
  startDate: Date | null;
  endDate: Date | null;
}
