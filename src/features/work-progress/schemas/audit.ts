import { z } from "zod";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITIES,
  type WorkProgressActivityAction,
  type WorkProgressActivityEntity,
} from "../domain/WorkProgressActivity";

// spread readonly → mutable พร้อมคง literal union (z.enum ต้องการ mutable tuple)
const actionEnum = z.enum([...ACTIVITY_ACTIONS] as [
  WorkProgressActivityAction,
  ...WorkProgressActivityAction[],
]);
const entityEnum = z.enum([...ACTIVITY_ENTITIES] as [
  WorkProgressActivityEntity,
  ...WorkProgressActivityEntity[],
]);

export const activityLogQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().uuid().optional(),
  entity: entityEnum.optional(),
  action: actionEnum.optional(),
});

export type ActivityLogQuery = z.infer<typeof activityLogQuerySchema>;

export const recentChangesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type RecentChangesQuery = z.infer<typeof recentChangesQuerySchema>;
