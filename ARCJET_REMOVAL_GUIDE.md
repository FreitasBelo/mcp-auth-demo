# How to Remove Arcjet and Restore Previous State

## Quick Restore (Option 1)

Restore from the backup file:

```powershell
# Restore the backup
Copy-Item "app/api/[transport]/route.ts.backup" "app/api/[transport]/route.ts" -Force

# Remove Arcjet key from .env.local (optional)
# Edit .env.local and remove the ARCJET_KEY line
```

## Manual Removal (Option 2)

If you need to manually remove Arcjet:

### Step 1: Remove Arcjet from route.ts

Edit `app/api/[transport]/route.ts` and change:

**FROM (With Arcjet):**
```typescript
// app/api/[transport]/route.ts - MCP with Clerk Authentication + Arcjet Protection

import arcjet, { shield, tokenBucket, detectBot } from "@arcjet/next";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { createMcpHandler, withMcpAuth } from "@vercel/mcp-adapter";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { helloTool, sayHello } from "@/lib/hello";
import { NextRequest } from "next/server";

const clerk = await clerkClient();

// Initialize Arcjet with protection rules
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId", "ip"],
      refillRate: 10,
      interval: 60,
      capacity: 20,
    }),
    detectBot({ mode: "LIVE", allow: [] }),
  ],
});

// ... rest of code

// Wrap with Arcjet protection
async function protectedHandler(request: NextRequest) {
  const decision = await aj.protect(request, {
    userId: "anonymous",
    requested: 1,
  });
  
  if (decision.isDenied()) {
    // ... error handling
  }
  
  return authHandler(request);
}

export { protectedHandler as GET, protectedHandler as POST };
```

**TO (Without Arcjet):**
```typescript
// app/api/[transport]/route.ts - MCP with Clerk Authentication

import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { createMcpHandler, withMcpAuth } from "@vercel/mcp-adapter";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { helloTool, sayHello } from "@/lib/hello";

const clerk = await clerkClient();

console.log("🚀 Initializing MCP Server with Clerk Authentication");

// ... handler code stays the same

const authHandler = withMcpAuth(
  handler,
  async (_, token) => {
    const clerkAuth = await auth({ acceptsToken: "oauth_token" });
    return verifyClerkToken(clerkAuth, token);
  },
  {
    required: true,
    resourceMetadataPath: "/.well-known/oauth-protected-resource/mcp",
  }
);

console.log("✅ MCP Server initialized with Clerk OAuth authentication");

export { authHandler as GET, authHandler as POST };
```

### Step 2: Remove Arcjet from .env.local

Remove this line from `.env.local`:
```env
ARCJET_KEY=ajkey_your_arcjet_key_here
```

### Step 3: (Optional) Uninstall Arcjet Package

If you want to completely remove Arcjet:

```powershell
pnpm remove @arcjet/next
```

## Verify Restoration

After restoring, test the server:

```powershell
# Start the server
pnpm dev

# The console should show:
# 🚀 Initializing MCP Server with Clerk Authentication
# ✅ MCP Server initialized with Clerk OAuth authentication
# (No mention of Arcjet)
```

## What Changed with Arcjet

### Added:
- Rate limiting (20 requests per minute)
- Bot detection and blocking
- Shield protection against common attacks
- Additional error responses for rate limits and bots

### Security Features:
- Prevents brute force attacks
- Blocks automated bot requests
- Rate limits per user/IP
- Protection against common web attacks

## When to Use Arcjet

Keep Arcjet if you need:
- ✅ Production-grade rate limiting
- ✅ Bot protection
- ✅ Attack prevention (XSS, SQL injection detection)
- ✅ Detailed security analytics

Remove Arcjet if you want:
- ✅ Simpler setup without additional dependencies
- ✅ No external service dependencies
- ✅ Testing without rate limits
- ✅ Development-only environment

## Quick Commands Reference

```powershell
# Restore from backup
Copy-Item "app/api/[transport]/route.ts.backup" "app/api/[transport]/route.ts" -Force

# Test server
pnpm dev

# Check differences
git diff app/api/[transport]/route.ts

# Uninstall Arcjet (optional)
pnpm remove @arcjet/next
```
