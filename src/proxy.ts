import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/features(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/api/upload(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/analysis(.*)",
  "/dashboard(.*)",
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

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
    return;
  }

  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?:on)?|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
