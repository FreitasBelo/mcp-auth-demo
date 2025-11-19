# MCP Authentication Demo

A production-ready **Model Context Protocol (MCP)** server with **Clerk OAuth authentication** built using Next.js 15.

## 🎯 Status: Production Ready ✅

**Clerk OAuth Integration** - Fully implements MCP server authentication using Clerk's OAuth provider.

### Key Features
- ✅ **Clerk OAuth Authentication** - Secure authentication with Clerk
- ✅ **Dynamic Client Registration** - MCP client auto-registration support
- ✅ **Standards Compliant** - OAuth Protected Resource Metadata (RFC 9728)
- ✅ **Multiple Tools** - Includes user data retrieval and greeting tools
- ✅ **VS Code Integration** - Seamless MCP authentication in VS Code

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Clerk account with OAuth application configured ([Setup Guide](https://clerk.com/docs))
- Enable **Dynamic client registration** in Clerk Dashboard

### Installation
```bash
# Clone and install
git clone <repository-url>
cd mcp-auth-demo
pnpm install
```

### Configuration
Create `.env.local`:
```env
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
```

### Development
```bash
pnpm dev
# Server runs at http://localhost:3000
```

## 🔧 Usage

### VS Code Integration
1. **Configure MCP** in `.vscode/mcp.json`:
   ```json
   {
     "servers": {
       "hello-mcp": {
         "type": "http",
         "url": "http://localhost:3000/api/mcp"
       }
     }
   }
   ```

2. **Start MCP Server** in VS Code - Click the "Start" button and complete OAuth in browser

### Command Line Testing
```bash
# Test with mcp-remote (handles OAuth automatically)
npx mcp-remote http://localhost:3000/api/mcp

# Works with remote servers too! (including Vercel deployments)
npx mcp-remote https://mcp-auth-demo-rust.vercel.app/api/mcp
```

## 📁 Project Structure

### Core Application Files

#### **`app/api/[transport]/route.ts`**
Main MCP endpoint with Clerk OAuth authentication. Uses `@vercel/mcp-adapter` and `@clerk/mcp-tools` for secure MCP protocol handling.

#### **`lib/hello.ts`**
MCP tool implementation with Clerk authentication context. Demonstrates how to build authenticated MCP tools with user information.

#### **`lib/clerk-user.ts`**
Clerk user data retrieval tool. Fetches authenticated user information from Clerk.

### Clerk OAuth Metadata Endpoints

#### **`app/.well-known/oauth-authorization-server/route.ts`**
OAuth Authorization Server Metadata endpoint using `authServerMetadataHandlerClerk` from `@clerk/mcp-tools`.

#### **`app/.well-known/oauth-protected-resource/mcp/route.ts`**
OAuth Protected Resource Metadata endpoint using `protectedResourceHandlerClerk` from `@clerk/mcp-tools`. Declares required OAuth scopes.

### Middleware

#### **`proxy.ts`**
Clerk middleware configuration that allows public access to `.well-known` endpoints while protecting all other routes.

### Frontend Components

#### **`app/layout.tsx`**
Next.js root layout with metadata and font configuration.

#### **`app/page.tsx`**
Demo homepage with MCP server information and integration examples.

#### **`app/globals.css`**
Global CSS styles using Tailwind CSS.

### Configuration Files

#### **`package.json`**
Project dependencies and scripts:
- `mcp-handler` - Official MCP server framework
- `google-auth-library` - Google OAuth token verification
- `next` - React framework
- `zod` - Schema validation

#### **`next.config.ts`**
Next.js configuration for the MCP server application.

#### **`tsconfig.json`**
TypeScript configuration with strict type checking.

#### **`biome.json`**
Code formatting and linting configuration using Biome.

#### **`postcss.config.mjs`**
PostCSS configuration for Tailwind CSS processing.

#### **`.vscode/mcp.json`**
VS Code MCP extension configuration for local development.

#### **`.gitignore`**
Git ignore patterns for Node.js, Next.js, and development files.

### Test Files

#### **`test-vscode-oauth.html`**
OAuth 2.1 testing utility for debugging authentication flows. Validates query parameter patterns and compliance.

### Documentation

#### **`docs/authentication-url-patterns.md`**
Detailed analysis of OAuth URL patterns and authentication flows. [View Documentation](./docs/authentication-url-patterns.md)

#### **`docs/oauth-2.1-compliance-plan.md`**
Complete implementation plan for OAuth 2.1 compliance, including removal of deprecated patterns. [View Plan](./docs/oauth-2.1-compliance-plan.md)

#### **`agents.md`**
Development guidelines and architectural patterns for building MCP servers. [View Guidelines](./agents.md)

## 🛠️ Available MCP Tools

### `get-clerk-user-data`
Retrieves data about the authenticated Clerk user.

**Parameters:** None

**Example:**
```bash
# Via MCP client
> call get-clerk-user-data {}
```

**Response:**
Returns complete Clerk user object including ID, email, and profile information.

### `say_hello`
Authenticated greeting tool that returns user context.

**Parameters:**
- `name` (string, optional): Name to greet (default: "World")

**Example:**
```bash
# Via MCP client
> call say_hello {"name": "Alice"}
```

**Response:**
```
👋 Hello, Alice!

Authenticated Clerk User:
- User ID: user_xxx
- Email: user@example.com

This is an authenticated MCP tool powered by Clerk!
```

## 🔒 Security Features

- **Clerk OAuth** - Enterprise-grade authentication
- **Dynamic Client Registration** - Automatic MCP client registration
- **Token Verification** - Cryptographic validation via Clerk
- **OAuth Metadata** - Standards-compliant discovery endpoints
- **Protected Routes** - Middleware-based route protection

## 📖 Documentation

For complete MCP server implementation guide with Clerk, see:
[Clerk MCP Documentation](https://clerk.com/docs/nextjs/guides/development/mcp/build-mcp-server)

## 🧪 Testing

### Testing with MCP Clients
```bash
# Connect with MCP Inspector or compatible client
# Configure your MCP client to use:
# URL: http://localhost:3000/api/mcp
# Authentication: OAuth (Clerk)
```

## 🚀 Deployment

This implementation is production-ready with:

- Clerk-managed authentication
- Dynamic client registration
- Horizontal scaling support
- Comprehensive error handling
- Security best practices

### Environment Variables

```env
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
```

### Clerk Dashboard Setup

1. Create a Clerk application
2. Enable **OAuth Applications** in the dashboard
3. Toggle on **Dynamic client registration**
4. Configure your application domains

---

Built with ❤️ using Next.js 15, @vercel/mcp-adapter, and Clerk
