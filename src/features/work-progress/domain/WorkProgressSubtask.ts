export interface WorkProgressSubtask {
  id: string;
  itemId: string;
  title: string;
  isDone: boolean;
  orderIndex: number;
  assignedToId: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
