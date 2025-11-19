import { z } from "zod";

// Zod schema for clerk user data tool
export const clerkUserSchema = {};

// Tool to get Clerk user data
export async function getClerkUserData(
  _args: Record<string, unknown>,
  { authInfo }: { authInfo?: { extra?: { userId?: string } } }
) {
  if (!authInfo?.extra?.userId) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: "No authenticated user found",
          }),
        },
      ],
    };
  }

  const userId = authInfo.extra.userId as string;

  // Note: This requires clerkClient to be passed in from the route handler
  // For now, return a placeholder that shows the userId
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          userId,
          message: "Clerk user data tool - requires clerkClient integration",
        }),
      },
    ],
  };
}

// Tool definition for MCP handler
export const clerkUserTool = {
  name: "get-clerk-user-data",
  description: "Gets data about the Clerk user that authorized this request",
  inputSchema: clerkUserSchema,
} as const;
