import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { username: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { amount } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Record payment
    await prisma.paymentRecord.create({
      data: {
        userId: params.id,
        amount: parseFloat(amount),
        type: "payment",
        notes: "Admin marked as paid",
      },
    });

    // Update balance
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        balanceDue: Math.max(0, targetUser.balanceDue - parseFloat(amount)),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error marking user as paid:", error);
    return NextResponse.json(
      { error: "Failed to mark as paid" },
      { status: 500 }
    );
  }
}
