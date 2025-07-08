export interface ScheduleTask {
  id: string;
  externalId: string;
  contractId: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  percentComplete: number | null;
}
