import { Session } from "next-auth";
import { NextResponse } from "next/server";
import { Role } from "@/types/auth";
import { getSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

type AuthFailure = {
  response: NextResponse;
  session: null;
};

type AuthSuccess = {
  response: null;
  session: Session;
};

type CustomerRecord = {
  id: string;
  userId: string;
  seoDevId: string | null;
};

export type CustomerAccessContext = {
  session: Session;
  customer: CustomerRecord;
  isAdmin: boolean;
  isOwner: boolean;
  isAssignedSeoDev: boolean;
  canRead: boolean;
  canManage: boolean;
};

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const forbidden = () =>
  NextResponse.json({ error: "Forbidden" }, { status: 403 });

const notFound = (message: string) =>
  NextResponse.json({ error: message }, { status: 404 });

export async function requireSession(): Promise<AuthFailure | AuthSuccess> {
  const session = await getSession();

  if (!session?.user) {
    return {
      response: unauthorized(),
      session: null,
    };
  }

  return {
    response: null,
    session,
  };
}

export function requireRole(
  session: Session,
  allowedRoles: Role[],
): NextResponse | null {
  if (!allowedRoles.includes(session.user.role)) {
    return forbidden();
  }

  return null;
}

export function requireAdminOnly(session: Session): NextResponse | null {
  return requireRole(session, [Role.ADMIN]);
}

function buildCustomerAccessContext(
  session: Session,
  customer: CustomerRecord,
): CustomerAccessContext {
  const isAdmin = session.user.role === Role.ADMIN;
  const isOwner = session.user.id === customer.userId;
  const isAssignedSeoDev =
    session.user.role === Role.SEO_DEV && customer.seoDevId === session.user.id;

  return {
    session,
    customer,
    isAdmin,
    isOwner,
    isAssignedSeoDev,
    canRead: isAdmin || isOwner || isAssignedSeoDev,
    canManage: isAdmin || isAssignedSeoDev,
  };
}

export async function getCustomerAccessByUserId(
  customerUserId: string,
): Promise<
  | {
      response: NextResponse;
      context: null;
    }
  | {
      response: null;
      context: CustomerAccessContext;
    }
> {
  const auth = await requireSession();
  if (auth.response || !auth.session) {
    return { response: auth.response, context: null };
  }

  const customer = await prisma.customer.findUnique({
    where: { userId: customerUserId },
    select: {
      id: true,
      userId: true,
      seoDevId: true,
    },
  });

  if (!customer) {
    return { response: notFound("Customer not found"), context: null };
  }

  return {
    response: null,
    context: buildCustomerAccessContext(auth.session, customer),
  };
}

export async function getCustomerAccessByCustomerId(
  customerId: string,
): Promise<
  | {
      response: NextResponse;
      context: null;
    }
  | {
      response: null;
      context: CustomerAccessContext;
    }
> {
  const auth = await requireSession();
  if (auth.response || !auth.session) {
    return { response: auth.response, context: null };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      userId: true,
      seoDevId: true,
    },
  });

  if (!customer) {
    return { response: notFound("Customer not found"), context: null };
  }

  return {
    response: null,
    context: buildCustomerAccessContext(auth.session, customer),
  };
}

export async function getKeywordAccessContext(keywordId: string): Promise<
  | {
      response: NextResponse;
      context: null;
    }
  | {
      response: null;
      context: CustomerAccessContext;
    }
> {
  const auth = await requireSession();
  if (auth.response || !auth.session) {
    return { response: auth.response, context: null };
  }

  const keyword = await prisma.keywordReport.findUnique({
    where: { id: keywordId },
    select: {
      customer: {
        select: {
          id: true,
          userId: true,
          seoDevId: true,
        },
      },
    },
  });

  if (!keyword) {
    return { response: notFound("Keyword not found"), context: null };
  }

  return {
    response: null,
    context: buildCustomerAccessContext(auth.session, keyword.customer),
  };
}

export async function getRecommendAccessContext(recommendId: string): Promise<
  | {
      response: NextResponse;
      context: null;
    }
  | {
      response: null;
      context: CustomerAccessContext;
    }
> {
  const auth = await requireSession();
  if (auth.response || !auth.session) {
    return { response: auth.response, context: null };
  }

  const recommend = await prisma.keywordRecommend.findUnique({
    where: { id: recommendId },
    select: {
      customer: {
        select: {
          id: true,
          userId: true,
          seoDevId: true,
        },
      },
    },
  });

  if (!recommend) {
    return {
      response: notFound("Recommend keyword not found"),
      context: null,
    };
  }

  return {
    response: null,
    context: buildCustomerAccessContext(auth.session, recommend.customer),
  };
}

export async function getAiOverviewAccessContext(aiOverviewId: string): Promise<
  | {
      response: NextResponse;
      context: null;
    }
  | {
      response: null;
      context: CustomerAccessContext;
    }
> {
  const auth = await requireSession();
  if (auth.response || !auth.session) {
    return { response: auth.response, context: null };
  }

  const aiOverview = await prisma.aiOverview.findUnique({
    where: { id: aiOverviewId },
    select: {
      customer: {
        select: {
          id: true,
          userId: true,
          seoDevId: true,
        },
      },
    },
  });

  if (!aiOverview) {
    return {
      response: notFound("AI Overview not found"),
      context: null,
    };
  }

  return {
    response: null,
    context: buildCustomerAccessContext(auth.session, aiOverview.customer),
  };
}

export function enforceCustomerReadAccess(
  context: CustomerAccessContext,
): NextResponse | null {
  if (!context.canRead) {
    return forbidden();
  }

  return null;
}

export function enforceCustomerManageAccess(
  context: CustomerAccessContext,
): NextResponse | null {
  if (!context.canManage) {
    return forbidden();
  }

  return null;
}
