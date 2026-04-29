import { NextResponse } from "next/server";
import {
  enforceCustomerReadAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { customerService } from "@/services/CustomerService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const access = await getCustomerAccessByUserId(customerId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerReadAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    // CUSTOMER (canManage=false) เห็นเฉพาะ row ที่ admin เปิดให้
    // ADMIN/SEO_DEV (canManage=true) เห็นทั้งหมด — รวม row ที่ซ่อนเพื่อจัดการ visibility
    const history = await customerService.getMetricsHistory(
      access.context.customer.id,
      { onlyVisible: !access.context.canManage },
    );
    return NextResponse.json(history);
  } catch (error) {
    return toErrorResponse(error);
  }
}
