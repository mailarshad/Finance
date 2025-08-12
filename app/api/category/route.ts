import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureUser(userId);

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureUser(userId);

  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid category name" }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({
      data: { userId, name },
    });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json({ error: "Category already exists" }, { status: 400 });
  }
}
