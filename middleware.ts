import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = createRouteMatcher([
  "/sign-in",
  "/sign-up",
  "/",
]);

const isDashboardRoute = (req:any) => {
  const url = new URL(req.url);
  return url.pathname === "/";
};

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  const url = new URL(req.url);
  const pathname = url.pathname;

  if (userId) {
    if (publicRoutes(req) && !isDashboardRoute(req)) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  } else {
    if (!publicRoutes(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
