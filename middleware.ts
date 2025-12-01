import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Keep middleware small: avoid importing heavy SDKs here (Arcjet SDK can
// significantly increase the Edge bundle size). Implement a minimal
// in-memory rate limiter for Edge to block obvious abusive traffic. More
// sophisticated Arcjet checks are performed in server routes where the full
// SDK can be used without inflating the middleware bundle.

const isPublicRoute = createRouteMatcher([
  "/.well-known/oauth-authorization-server(.*)",
  "/.well-known/oauth-protected-resource(.*)",
]);

// Minimal in-memory limiter for Edge middleware. This is intentionally small
// to avoid bundling large dependencies. It will reset when the Edge instance
// restarts; use a central store (Redis) for production if needed.
const RL_WINDOW_SECONDS = Number(process.env.ARCJET_RATE_LIMIT_WINDOW || "60");
const RL_MAX = Number(process.env.ARCJET_RATE_LIMIT_MAX || "60");
const rlWindowMs = RL_WINDOW_SECONDS * 1000;
const rlMap: Map<string, { count: number; start: number }> = (globalThis as any).__edge_rl_map || new Map();
(globalThis as any).__edge_rl_map = rlMap;

function getEdgeKey(req: any) {
  try {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return `ip:${fwd.split(",")[0].trim()}`;
    const rip = req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip");
    if (rip) return `ip:${rip}`;
  } catch (_) {}
  return "ip:unknown";
}

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    // Allow discovery endpoints without rate-limiting here
    return;
  }

  try {
    const key = getEdgeKey(req as any);
    const now = Date.now();
    const rec = rlMap.get(key);
    if (!rec || now > rec.start + rlWindowMs) {
      rlMap.set(key, { count: 1, start: now });
    } else {
      rec.count += 1;
      rlMap.set(key, rec);
      if (rec.count > RL_MAX) {
        return new Response("Blocked by rate limiter", { status: 429 });
      }
    }
  } catch (e) {
    // Keep middleware resilient — on failure, fall through to Clerk auth
    console.error("Edge rate limiter error:", e);
  }

  // Continue with Clerk protection for all non-public routes
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
