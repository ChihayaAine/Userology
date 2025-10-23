import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/interview(.*)",
  "/call(.*)",
  "/api/register-call(.*)",
  "/api/get-call(.*)",
  "/api/generate-interview-questions(.*)",
  "/api/create-interviewer(.*)",
  "/api/analyze-communication(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // For protected routes without authentication, redirect to sign-in
  if (isProtectedRoute(req) && !auth().userId) {
    // 使用正确的域名构建 URL
    const host = req.headers.get('host') || 'userology.xin';
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const fullUrl = `${protocol}://${host}${req.nextUrl.pathname}${req.nextUrl.search}`;
    
    const signInUrl = new URL('/sign-in', `${protocol}://${host}`);
    signInUrl.searchParams.set('redirect_url', fullUrl);
    return NextResponse.redirect(signInUrl);
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

