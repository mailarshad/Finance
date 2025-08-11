import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const lastIncomeRecord = await prisma.income.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const totalExpensesResult = await prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const lastIncome = lastIncomeRecord?.amount ?? 0;
    const totalExpenses = totalExpensesResult._sum.amount ?? 0;

    return NextResponse.json({ lastIncome, totalExpenses });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Error fetching history" },
      { status: 500 }
    );
  }
}
