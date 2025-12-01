// app/api/[transport]/route.ts - MCP with Clerk Authentication

import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { createMcpHandler, withMcpAuth } from "@vercel/mcp-adapter";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { helloTool, sayHello } from "@/lib/hello";
import { protectRequest } from "@/lib/arcjet";

const clerk = await clerkClient();

console.log("🚀 Initializing MCP Server with Clerk Authentication");

// Create the MCP handler with Clerk-authenticated tools
const handler = createMcpHandler((server) => {
  console.log("📋 Registering MCP tools with Clerk authentication");

  // Register the get-clerk-user-data tool
  server.tool(
    "get-clerk-user-data",
    "Gets data about the Clerk user that authorized this request",
    {},
    async (_, { authInfo }) => {
      const userId = authInfo!.extra!.userId! as string;
      const userData = await clerk.users.getUser(userId);

      return {
        content: [{ type: "text", text: JSON.stringify(userData) }],
      };
    }
  );

  // Register the hello tool
  server.tool(
    helloTool.name,
    helloTool.description,
    helloTool.inputSchema,
    sayHello
  );
});

// Secure the MCP handler with Clerk OAuth
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

// Wrap the authHandler with Arcjet protection where possible. If Arcjet
// is disabled (no ARCJET_KEY), protectRequest will be a no-op.
async function arcjetWrap(handler: (req: Request) => Promise<Response>) {
  return async function (req: Request) {
    try {
      const check = await protectRequest(req);
      if (!check.allowed) {
        console.warn("Request blocked by Arcjet", check.decision || check);
        return new Response("Blocked by Arcjet", { status: 403 });
      }
    } catch (err) {
      console.error("Arcjet wrapper error:", err);
    }

    return handler(req);
  };
}

const _exportGET = await arcjetWrap(authHandler as any);
const _exportPOST = await arcjetWrap(authHandler as any);

export { _exportGET as GET, _exportPOST as POST };

