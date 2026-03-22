import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/analysis(.*)",
  "/career(.*)",
  "/cover-letter(.*)",
  "/interview-prep(.*)",
  "/optimization(.*)",
  "/sessions(.*)",
  "/api/session(.*)",
  "/api/sessions(.*)",
  "/api/analysis-results(.*)",
  "/api/cover-letters(.*)",
]);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/api/upload(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    auth().protect();
  }

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return;
  }

  // Default: protect everything else
  auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?:on)?|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run on API routes
    "/(api|trpc)(.*)",
  ],
};
