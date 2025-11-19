import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { z } from "zod";

// Zod schema for hello message validation
export const helloSchema = {
  name: z
    .string()
    .optional()
    .default("World")
    .describe("The name of the person to greet"),
};

// Enhanced hello function with Clerk authentication support
export function sayHello(
  { name }: { name?: string },
  extra?: { authInfo?: AuthInfo }
) {
  // Validate and get the name
  const validatedName = name || "World";

  // Basic greeting
  const greeting = `👋 Hello, ${validatedName}!`;

  // Add Clerk authentication info if available
  const authInfo = extra?.authInfo;
  let userInfo = "";

  if (authInfo?.extra?.userId) {
    const userId = authInfo.extra.userId as string;
    const email = authInfo.extra.email as string | undefined;
    userInfo = `\n\nAuthenticated Clerk User:\n- User ID: ${userId}${email ? `\n- Email: ${email}` : ""}`;
  }

  // Generate message with auth context
  const message = authInfo
    ? `${greeting}${userInfo}\n\nThis is an authenticated MCP tool powered by Clerk!`
    : `${greeting}\n\nThis is a public MCP tool!`;

  // Return MCP-compatible result format
  return {
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
  };
}

// Tool definition for MCP handler
export const helloTool = {
  name: "say_hello",
  description: "Says hello to someone with Clerk authentication info",
  inputSchema: helloSchema,
} as const;

