import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { protectRequest } from "@/lib/arcjet";

const isPublicRoute = createRouteMatcher([
  "/.well-known/oauth-authorization-server(.*)",
  "/.well-known/oauth-protected-resource(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Run Arcjet protection first so abusive traffic can be blocked before
  // hitting Clerk auth. If Arcjet is disabled this is a no-op.
  try {
    if (!isPublicRoute(req)) {
      const check = await protectRequest(req as unknown as Request);
      if (!check.allowed) return new Response("Blocked by Arcjet", { status: 403 });
    }
  } catch (e) {
    console.error("Arcjet middleware check failed:", e);
    // Fall through to Clerk auth if Arcjet fails
  }

  if (isPublicRoute(req)) return; // Allow public access to .well-known endpoints
  await auth.protect(); // Protect all other routes
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
