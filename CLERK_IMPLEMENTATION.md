# Clerk MCP Server Implementation

This document summarizes the implementation of the Clerk-based MCP server following the official Clerk documentation.

## Implementation Summary

### Packages Installed

- `@vercel/mcp-adapter` - MCP protocol handler with authentication support
- `@clerk/mcp-tools` - Clerk-specific helpers for MCP integration
- `@clerk/nextjs` - Clerk authentication for Next.js

### Files Created/Modified

#### 1. **app/api/[transport]/route.ts**
- Replaced custom OAuth implementation with Clerk OAuth
- Uses `createMcpHandler` from `@vercel/mcp-adapter`
- Wrapped with `withMcpAuth` for authentication
- Implements `verifyClerkToken` for token validation
- Includes two tools:
  - `get-clerk-user-data` - Fetches authenticated user from Clerk
  - `say_hello` - Greeting with user context

#### 2. **lib/clerk-user.ts** (New)
- Defines the `get-clerk-user-data` tool structure
- Placeholder for Clerk user data retrieval

#### 3. **lib/hello.ts**
- Updated to work with Clerk's authInfo structure
- Extracts userId and email from Clerk tokens
- Provides authenticated greeting with user details

#### 4. **app/.well-known/oauth-protected-resource/mcp/route.ts** (New)
- OAuth Protected Resource Metadata endpoint
- Uses `protectedResourceHandlerClerk` from `@clerk/mcp-tools`
- Declares supported OAuth scopes: profile, email
- Includes CORS handler for preflight requests

#### 5. **app/.well-known/oauth-authorization-server/route.ts**
- Replaced custom implementation with Clerk helper
- Uses `authServerMetadataHandlerClerk` from `@clerk/mcp-tools`
- Provides OAuth server discovery metadata
- Includes CORS handler

#### 6. **proxy.ts** (New)
- Clerk middleware configuration for Next.js 15
- Allows public access to `.well-known` endpoints
- Protects all other routes with Clerk authentication

#### 7. **README.md**
- Updated to reflect Clerk implementation
- Removed Google OAuth references
- Added Clerk setup instructions
- Updated tool documentation
- Added deployment guidance

## Key Differences from Previous Implementation

### Before (Custom Google OAuth)
- Manual OAuth flow implementation
- Custom token verification with `google-auth-library`
- Custom authorization, token, and callback endpoints
- Manual redirect URI management
- Custom protected resource metadata

### After (Clerk)
- Clerk-managed OAuth flow
- Built-in token verification via `@clerk/mcp-tools`
- Clerk handles authorization server
- Automatic dynamic client registration
- Helper-based metadata endpoints
- Simplified authentication wrapper

## Environment Variables Required

```env
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Clerk Dashboard Configuration

1. Create a Clerk application at https://dashboard.clerk.com
2. Navigate to **OAuth Applications**
3. Enable **Dynamic client registration** (required for MCP)
4. Configure allowed domains

## MCP Tools Available

### 1. get-clerk-user-data
- **Description**: Gets data about the Clerk user that authorized the request
- **Parameters**: None
- **Returns**: Complete Clerk user object (ID, email, profile, etc.)

### 2. say_hello
- **Description**: Says hello with Clerk authentication info
- **Parameters**: 
  - `name` (optional): Name to greet
- **Returns**: Greeting message with authenticated user details

## Testing

### Development Server
```bash
pnpm dev
```

### MCP Client Configuration
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

## Benefits of Clerk Implementation

1. **Simplified Code**: Reduced from ~500 lines to ~40 lines in main route
2. **Enterprise Features**: Built-in user management, session handling
3. **Dynamic Registration**: Automatic MCP client registration
4. **Standards Compliant**: OAuth metadata endpoints handled automatically
5. **Better DX**: Less boilerplate, more focus on business logic
6. **Production Ready**: Clerk handles security, scaling, and compliance

## Next Steps

1. Set up Clerk account and configure application
2. Add environment variables to `.env.local`
3. Test with MCP clients (VS Code, Claude Desktop, etc.)
4. Deploy to Vercel or preferred hosting platform
5. Extend with additional MCP tools as needed

## Reference

- [Clerk MCP Documentation](https://clerk.com/docs/nextjs/guides/development/mcp/build-mcp-server)
- [MCP Specification](https://modelcontextprotocol.io/)
- [@vercel/mcp-adapter](https://github.com/vercel/mcp-adapter)
- [@clerk/mcp-tools](https://github.com/clerk/mcp-tools)
