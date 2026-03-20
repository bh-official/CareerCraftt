import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analysis(.*)",
  "/career(.*)",
  "/cover-letter(.*)",
  "/interview(.*)",
  "/optimization(.*)",
  "/api/analyze(.*)",
  "/api/career(.*)",
  "/api/cover-letter(.*)",
  "/api/interview(.*)",
  "/api/optimization(.*)",
  "/api/session(.*)",
  "/api/sessions(.*)",
  "/api/upload(.*)",
]);

// Define which routes are public (don't require auth)
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/api/session(.*)", // Allow session check without auth for now
]);

export default clerkMiddleware(async (auth, req) => {
  // For protected routes, require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // For public routes, allow unauthenticated access
  if (isPublicRoute(req)) {
    return;
  }

  // Default: protect everything else
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
