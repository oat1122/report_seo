import type {
  WorkProgressActivity,
  WorkProgressActivityAction,
  WorkProgressActivityEntity,
  WorkProgressActivityDiff,
} from "../../domain/WorkProgressActivity";

export interface ActivityLogInput {
  planId: string;
  actorId: string | null;
  action: WorkProgressActivityAction;
  entity: WorkProgressActivityEntity;
  entityId?: string | null;
  diff?: WorkProgressActivityDiff | null;
}

export interface ActivityListQuery {
  planId: string;
  limit: number;
  cursor?: string;
  entity?: WorkProgressActivityEntity;
  action?: WorkProgressActivityAction;
}

export interface ActivityListResult {
  items: WorkProgressActivity[];
  nextCursor: string | null;
}

export interface WorkProgressActivityRepository {
  log(input: ActivityLogInput): Promise<void>;
  list(query: ActivityListQuery): Promise<ActivityListResult>;
  listRecentForCustomer(
    customerId: string,
    limit: number,
  ): Promise<WorkProgressActivity[]>;
}
