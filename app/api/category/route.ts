import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();

  if (typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Invalid category name" }, { status: 400 });
  }

  // Prevent duplicate category names for same user
  const existing = await prisma.category.findFirst({
    where: { userId, name: name.trim() },
  });

  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: {
      userId,
      name: name.trim(),
    },
  });

  return NextResponse.json(category);
}
