import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureUser(userId);

  const expenses = await prisma.expense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureUser(userId);

  const { amount, categoryId } = await req.json();
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: { userId, amount, categoryId },
  });

  return NextResponse.json(expense);
}
