// lib/ensureUser.ts

import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function ensureUser(userId: string) {
  // IMPORTANT: clerkClient is a function! Must await to get the object
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("User has no email address in Clerk");

  return prisma.user.upsert({
    where: { id: userId },
    update: { email },  // keep updated email
    create: { id: userId, email },
  });
}
