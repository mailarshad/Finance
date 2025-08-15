import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If user is not logged in and tries to access a protected route → redirect to sign-in
  if (!userId && !publicRoutes(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // If user is logged in and tries to access sign-in or sign-up → redirect to dashboard
  if (userId && ["/sign-in", "/sign-up"].includes(new URL(req.url).pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
