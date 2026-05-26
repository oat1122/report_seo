import { withApiHandler, noContent } from "@/infrastructure/http";
import {
  deleteNotification,
  notificationIdParamSchema,
} from "@/features/notifications";

export const DELETE = withApiHandler(
  { params: notificationIdParamSchema },
  async ({ session, params }) => {
    await deleteNotification(session.user.id, params.id);
    return noContent();
  },
);
