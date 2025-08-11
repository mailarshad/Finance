import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, categoryId } = await req.json();

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const data: any = { userId, amount };

  if (categoryId) {
    data.categoryId = categoryId;
  }

  const expense = await prisma.expense.create({ data });

  return NextResponse.json(expense);
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.expense.deleteMany({ where: { userId } });

  return NextResponse.json({ message: "All expenses cleared" });
}
