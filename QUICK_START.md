# Quick Start Guide - Clerk MCP Server

## ✅ Implementation Complete

The MCP server has been successfully updated to use Clerk authentication following the official Clerk documentation.

## 📦 What Was Installed

```bash
pnpm add @vercel/mcp-adapter @clerk/mcp-tools @clerk/nextjs
```

## 🔑 Required Environment Variables

Create `.env.local` in the root directory:

```env
CLERK_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

## 🚀 Quick Setup

### 1. Get Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use an existing one
3. Copy the API keys from the dashboard
4. Add them to `.env.local`

### 2. Enable Dynamic Client Registration

⚠️ **CRITICAL**: This is required for MCP clients to work!

1. In Clerk Dashboard, go to **OAuth Applications**
2. Toggle on **Dynamic client registration**
3. Save changes

### 3. Start Development Server

```bash
pnpm dev
```

Server runs at: `http://localhost:3000`

## 🛠️ Available Tools

### 1. `get-clerk-user-data`
Fetches complete user data from Clerk for the authenticated user.

```json
// Call example
{
  "name": "get-clerk-user-data",
  "arguments": {}
}
```

### 2. `say_hello`
Greeting with authenticated user context.

```json
// Call example
{
  "name": "say_hello",
  "arguments": {
    "name": "Alice"
  }
}
```

## 🧪 Testing

### Option 1: VS Code MCP Extension

1. Create `.vscode/mcp.json`:
   ```json
   {
     "servers": {
       "clerk-mcp": {
         "type": "http",
         "url": "http://localhost:3000/api/mcp"
       }
     }
   }
   ```

2. Open MCP panel in VS Code
3. Click "Start" next to your server
4. Complete OAuth flow in browser
5. Test tools!

### Option 2: Claude Desktop

Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "clerk-demo": {
      "type": "http",
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/api/[transport]/route.ts` | Main MCP endpoint with Clerk auth |
| `lib/hello.ts` | Example tool with user context |
| `lib/clerk-user.ts` | User data retrieval tool |
| `app/.well-known/oauth-authorization-server/route.ts` | OAuth server metadata |
| `app/.well-known/oauth-protected-resource/mcp/route.ts` | Protected resource metadata |
| `proxy.ts` | Clerk middleware (allows .well-known access) |

## 🔒 How Authentication Works

1. **MCP Client Connects** → Discovers OAuth metadata at `.well-known` endpoints
2. **Client Registers** → Uses dynamic registration (if not already registered)
3. **User Authenticates** → OAuth flow redirects to Clerk
4. **Token Issued** → Clerk issues OAuth token to client
5. **Tool Calls** → Client includes token in requests
6. **Token Verified** → `withMcpAuth` + `verifyClerkToken` validates
7. **User Context** → Tools receive `authInfo.extra.userId`

## 📚 Documentation References

- [Clerk MCP Guide](https://clerk.com/docs/nextjs/guides/development/mcp/build-mcp-server)
- [MCP Specification](https://modelcontextprotocol.io/)
- [@vercel/mcp-adapter](https://github.com/vercel/mcp-adapter)
- [@clerk/mcp-tools](https://github.com/clerk/mcp-tools)

## 🚨 Common Issues

### Issue: "Dynamic client registration failed"
**Solution**: Enable it in Clerk Dashboard → OAuth Applications

### Issue: "Unauthorized" errors
**Solution**: Check that `.well-known` routes are public in `proxy.ts`

### Issue: Can't fetch user data
**Solution**: Verify `CLERK_SECRET_KEY` is set correctly

## ✨ Next Steps

1. Add more MCP tools in `lib/` directory
2. Register tools in `app/api/[transport]/route.ts`
3. Access user data via `authInfo.extra.userId`
4. Deploy to Vercel or your preferred platform

## 🎉 You're Ready!

Your MCP server is now secured with Clerk OAuth and ready for development!
