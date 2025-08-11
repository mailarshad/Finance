import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subDays } from "date-fns";
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch last 30 days expenses only for the user
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        createdAt: {
          gte: subDays(new Date(), 30),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        category: true, // optional, if you want category info
      },
    });

    // Prepare prompt for AI
    const prompt = `
You are a helpful and friendly personal finance assistant.
Analyze the last 30 days of user expenses and provide 3 actionable savings tips based on the data.

Expenses: ${JSON.stringify(expenses)}
Please list the tips clearly, numbered 1, 2, and 3.
`;

    // Call Groq AI chat completions
    const chat = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const tips = chat.choices?.[0]?.message?.content || "No tips available.";

    return NextResponse.json({ tips });
  } catch (error) {
    console.error("Error generating savings tips:", error);
    return NextResponse.json(
      { error: "Failed to generate savings tips" },
      { status: 500 }
    );
  }
}
