import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ✅ In Clerk v5, auth() is synchronous
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Ensure user exists in DB
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;

    if (email) {
      await prisma.user.upsert({
        where: { id: userId },
        update: { email },
        create: { id: userId, email },
      });
    }

    // ✅ Fetch last income
    const lastIncomeRecord = await prisma.income.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Fetch total expenses
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
