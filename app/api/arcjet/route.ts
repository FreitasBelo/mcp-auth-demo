import { NextResponse } from "next/server";
import initArcjet, { protectRequest } from "@/lib/arcjet";

// Unprotected test endpoint to inspect Arcjet SDK and local limiter state.
// This is intentionally public to make local testing easy. Remove or protect
// it before production.
export async function GET(request: Request) {
  const aj = initArcjet();
  let status: any = { arcjetInitialized: !!aj };

  try {
    const rl = await protectRequest(request as Request).catch((e) => ({ allowed: true, error: String(e) }));
    status.protect = rl;
  } catch (e) {
    status.protect = { allowed: true, error: String(e) };
  }

  // Include environment hints (non-secret) for debugging
  status.env = {
    hasArcjetKey: !!process.env.ARCJET_KEY,
    rulesConfigured: !!process.env.ARCJET_RULES,
    rateLimitWindow: process.env.ARCJET_RATE_LIMIT_WINDOW || null,
    rateLimitMax: process.env.ARCJET_RATE_LIMIT_MAX || null,
  };

  return NextResponse.json(status);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
