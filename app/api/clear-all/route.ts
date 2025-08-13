import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma"; // adjust path to your prisma instance

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Delete related records for this user
    await prisma.expense.deleteMany({ where: { userId } });
    await prisma.income.deleteMany({ where: { userId } });
    await prisma.category.deleteMany({ where: { userId } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error clearing data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
