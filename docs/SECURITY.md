# StyleCart Fashion — Security Architecture & Guidelines

## Security Controls Implemented

### 1. Authentication & Authorization
- **JWT Signatures**: User authentication uses signed JSON Web Tokens (`jsonwebtoken`) with configurable expiration (`JWT_EXPIRES_IN`).
- **Strict Role Enforcement**: User signup endpoints (`POST /api/auth/signup`) strictly assign `role: "user"`, preventing role injection via client request bodies.
- **Admin Middleware**: Protected admin routes require valid JWT tokens with `role === "admin"`.
- **Password Hashing**: User passwords are hashed using `bcryptjs` with salt rounds = 10 prior to database storage.

### 2. Input Validation & XSS Defense
- **Backend Sanitization**: String inputs are sanitized to strip script tags and dangerous HTML characters.
- **Frontend Escaping**: Utility functions (`escapeHTML()`) escape dynamic user strings rendered into innerHTML blocks.

### 3. Rate Limiting & Abuse Prevention
- **IP Rate Limiting**: Requests are monitored via in-memory token bucket rate limiters:
  - General API endpoints: 200 requests / 15 mins
  - Authentication endpoints: 20 requests / 15 mins
  - AI endpoints: 30 requests / 1 min

### 4. AI Security Boundaries
- **Prompt Injection Defense**: AI prompts enforce strict JSON formatting and ground recommendations in the checked catalog.
- **No Direct Execution**: The AI engine cannot execute raw database queries directly. It communicates through validated backend services.

### 5. Production Protections
- **Environment Isolation**: JWT secrets must be explicitly set in production mode (`NODE_ENV=production`).
- **Safe Error Responses**: Stack traces and raw internal error details are suppressed in production environments.
