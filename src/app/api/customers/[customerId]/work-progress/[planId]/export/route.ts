import { z } from "zod";
import { NextResponse } from "next/server";
import { withApiHandler, customerAccessGuard } from "@/infrastructure/http";
import { exportPlan } from "@/features/work-progress";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const GET = withApiHandler(
  { params: paramsSchema },
  async ({ params }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "read",
    );
    const { buffer, filename } = await exportPlan(ctx.customer.id, params.planId);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store",
      },
    });
  },
);
