import arcjetPkg from "@arcjet/next";

type ProtectResult = { allowed: boolean; decision?: any; reason?: string; error?: string };

let _aj: any = (globalThis as any).__arcjet_instance;

/**
 * Initialize Arcjet SDK. Rules can be provided via `ARCJET_RULES` env (JSON array),
 * otherwise an empty rules array is used so the SDK initializes with sensible typing.
 */
function initArcjet() {
  if (_aj) return _aj;
  const key = process.env.ARCJET_KEY || "";
  if (!key) {
    console.warn("Arcjet: ARCJET_KEY not set — protection disabled");
    return null;
  }

  try {
    let rules: any[] = [];
    if (process.env.ARCJET_RULES) {
      try {
        rules = JSON.parse(process.env.ARCJET_RULES || "[]");
      } catch (e) {
        console.warn("ARCJET_RULES is not valid JSON — falling back to empty rules", e);
      }
    }

    _aj = arcjetPkg({ key, rules: rules as any });
    (globalThis as any).__arcjet_instance = _aj;
    return _aj;
  } catch (err) {
    console.error("Arcjet init error:", err);
    return null;
  }
}

// --- In-memory local rate limiter ---
type RLRecord = { count: number; windowStart: number };
const _rlMap: Map<string, RLRecord> = (globalThis as any).__arcjet_rl_map || new Map();
(globalThis as any).__arcjet_rl_map = _rlMap;

function getClientKey(request: Request, opts?: { userId?: string }) {
  if (opts?.userId) return `user:${opts.userId}`;
  const fwd = (request as any).headers?.get?.("x-forwarded-for");
  if (fwd) return `ip:${fwd.split(",")[0].trim()}`;
  const rip = (request as any).headers?.get?.("x-real-ip") || (request as any).headers?.get?.("cf-connecting-ip");
  if (rip) return `ip:${rip}`;
  return `ip:unknown`;
}

function checkLocalRateLimit(request: Request, opts?: { userId?: string }) {
  const windowSeconds = Number(process.env.ARCJET_RATE_LIMIT_WINDOW || "60");
  const max = Number(process.env.ARCJET_RATE_LIMIT_MAX || "60");
  const windowMs = windowSeconds * 1000;
  const key = getClientKey(request, opts);
  const now = Date.now();
  const rec = _rlMap.get(key);
  if (!rec || now > rec.windowStart + windowMs) {
    _rlMap.set(key, { count: 1, windowStart: now });
    return { allowed: true, count: 1, remaining: Math.max(0, max - 1), resetAt: now + windowMs };
  }

  rec.count += 1;
  _rlMap.set(key, rec);

  if (rec.count > max) {
    return { allowed: false, count: rec.count, remaining: 0, resetAt: rec.windowStart + windowMs };
  }

  return { allowed: true, count: rec.count, remaining: Math.max(0, max - rec.count), resetAt: rec.windowStart + windowMs };
}

export async function protectRequest(
  request: Request,
  opts?: { userId?: string }
): Promise<ProtectResult> {
  const aj = initArcjet();
  // Apply local rate limiting first to avoid unnecessary SDK calls
  const local = checkLocalRateLimit(request, opts);
  if (!local.allowed) return { allowed: false, reason: "local-rate-limit", decision: local };

  if (!aj || typeof aj.protect !== "function") {
    return { allowed: true, reason: "arcjet-unavailable" };
  }

  try {
    const decision = await aj.protect(request, {
      user: opts?.userId ? { id: opts.userId } : undefined,
    });

    if (!decision) return { allowed: true, decision };
    if (decision.action === "allow" || decision.allowed === true) {
      return { allowed: true, decision };
    }
    if (decision.action === "block" || decision.allowed === false) {
      return { allowed: false, decision };
    }

    return { allowed: true, decision };
  } catch (err: any) {
    console.error("Arcjet protect error:", err);
    return { allowed: true, error: String(err) };
  }
}

export default initArcjet;
