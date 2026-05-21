import { NextResponse } from "next/server";
import {
  enforceReadAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import { getCustomerHistoryReport } from "@/features/customer-report";
import { toErrorResponse } from "@/lib/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceReadAccess(ctx);
    // CUSTOMER (canManage=false) เห็นเฉพาะ row ที่ admin เปิดให้
    // ADMIN/SEO_DEV (canManage=true) เห็นทั้งหมด — รวม row ที่ซ่อนเพื่อจัดการ visibility
    const history = await getCustomerHistoryReport(ctx.customer.id, {
      onlyVisible: !ctx.canManage,
    });
    return NextResponse.json(history);
  } catch (error) {
    return toErrorResponse(error);
  }
}
