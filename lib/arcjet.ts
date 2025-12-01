import arcjetPkg from "@arcjet/next";

type ProtectResult = { allowed: boolean; decision?: any; reason?: string; error?: string };

let _aj: any = (globalThis as any).__arcjet_instance;

function initArcjet() {
  if (_aj) return _aj;
  const key = process.env.ARCJET_KEY || "";
  if (!key) {
    console.warn("Arcjet: ARCJET_KEY not set — protection disabled");
    return null;
  }

  try {
    // `@arcjet/next` requires a `rules` array in the options type — pass an empty
    // array when you don't have custom rules yet.
    _aj = arcjetPkg({ key, rules: [] as any });
    (globalThis as any).__arcjet_instance = _aj;
    return _aj;
  } catch (err) {
    console.error("Arcjet init error:", err);
    return null;
  }
}

export async function protectRequest(
  request: Request,
  opts?: { userId?: string }
): Promise<ProtectResult> {
  const aj = initArcjet();
  if (!aj || typeof aj.protect !== "function") {
    return { allowed: true, reason: "arcjet-unavailable" };
  }

  try {
    const decision = await aj.protect(request, {
      user: opts?.userId ? { id: opts.userId } : undefined,
    });

    // Arcjet decision shapes can vary; normalize common cases
    if (!decision) return { allowed: true, decision };
    if (decision.action === "allow" || decision.allowed === true) {
      return { allowed: true, decision };
    }
    if (decision.action === "block" || decision.allowed === false) {
      return { allowed: false, decision };
    }

    // Default to allow when in doubt
    return { allowed: true, decision };
  } catch (err: any) {
    console.error("Arcjet protect error:", err);
    return { allowed: true, error: String(err) };
  }
}

export default initArcjet;
