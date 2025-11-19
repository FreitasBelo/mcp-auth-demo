# Agent Instructions for MCP Clerk Demo

## Project Type
Next.js 15 + MCP Server with Clerk Authentication

## Key Architecture
- **MCP Endpoint**: `app/api/[transport]/route.ts` (Clerk OAuth authentication)
- **Tools**: Located in `lib/` directory with Zod schemas
- **Authentication**: Clerk OAuth with `@vercel/mcp-adapter` and `@clerk/mcp-tools`

## Core Patterns

### MCP Tool Creation with Clerk
1. Define tool in `lib/toolname.ts` with Zod schema
2. Register in `app/api/[transport]/route.ts` using `createMcpHandler()`
3. Wrap handler with `withMcpAuth()` for Clerk authentication
4. Access user info via `authInfo.extra.userId` in tool functions

### Clerk MCP Flow
- All MCP requests require Clerk OAuth token
- Use `withMcpAuth` from `@vercel/mcp-adapter`
- Use `verifyClerkToken` from `@clerk/mcp-tools/next`
- Tools receive `authInfo` with user context

### File Structure Requirements
```
app/api/[transport]/route.ts              # Main MCP endpoint with Clerk auth
lib/*.ts                                  # Tool implementations
app/.well-known/oauth-authorization-server/route.ts
app/.well-known/oauth-protected-resource/mcp/route.ts
proxy.ts                                  # Clerk middleware
```

## Environment Variables
```env
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Testing

- **MCP Clients**: Use VS Code MCP extension or Claude Desktop
- **Authentication**: OAuth flow with Clerk
- **Dev Server**: `pnpm dev` (uses Turbopack)

## Critical Rules

1. Clerk OAuth authentication required for all MCP endpoints
2. Use TypeScript strictly
3. Follow Zod schema validation
4. Use `@vercel/mcp-adapter` pattern with `withMcpAuth`
5. Test via MCP clients with OAuth
6. Enable dynamic client registration in Clerk Dashboard
7. Always use pnpm
8. Dev on port 3000, if occupied, kill server on 3000
9. Use PowerShell commands instead of curl
10. Access user data via `authInfo.extra.userId` in tools
