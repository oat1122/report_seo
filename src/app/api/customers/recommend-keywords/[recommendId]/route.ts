import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { Role } from "@/types/auth";
import { customerService } from "@/services/CustomerService";

const authorizeRecommendKeyword = async (recommendId: string) => {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      existingRecommend: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const existingRecommend = await prisma.keywordRecommend.findUnique({
    where: { id: recommendId },
    include: {
      customer: {
        select: { userId: true },
      },
    },
  });

  if (!existingRecommend) {
    return {
      session,
      existingRecommend: null,
      response: NextResponse.json(
        { error: "Recommend keyword not found" },
        { status: 404 },
      ),
    };
  }

  const isOwner = session.user.id === existingRecommend.customer.userId;
  const isAdmin = session.user.role === Role.ADMIN;
  const isSeoDev = session.user.role === Role.SEO_DEV;

  if (!isOwner && !isAdmin && !isSeoDev) {
    return {
      session,
      existingRecommend,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    session,
    existingRecommend,
    response: null,
  };
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ recommendId: string }> },
) {
  try {
    const { recommendId } = await params;
    const auth = await authorizeRecommendKeyword(recommendId);
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const body = await req.json();
    const updatedRecommend = await customerService.updateRecommendKeyword(
      recommendId,
      auth.existingRecommend!.customer.userId,
      body,
    );

    return NextResponse.json(updatedRecommend);
  } catch (error) {
    console.error("Error updating recommend keyword:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ recommendId: string }> },
) {
  try {
    const { recommendId } = await params;
    const auth = await authorizeRecommendKeyword(recommendId);
    if (auth.response || !auth.session) {
      return auth.response;
    }

    await prisma.keywordRecommend.delete({
      where: { id: recommendId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting recommend keyword:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
