---
context_id: IC_security_api_communication
version: "1.0.0"
type: infrastructure
category: security
applies_to:
  - PC_*_api
  - services/*
  - hooks/use*Api*
enforcement: mandatory
health:
  documentation_coverage: 100
  last_updated: 2025-12-10
  staleness_days: 0
related_contexts:
  - IC_security_input_sanitization
  - IC_security_secrets_management
migration:
  breaking_changes: []
  deprecations: []
  migration_guide: null
---

# Infrastructure Context: API Communication Security

## Purpose

Defines mandatory security requirements for all API communications, including HTTPS enforcement, API key management, secure data transmission, and safe error handling.

---

## Requirements

### Mandatory

1. **ALL API calls MUST use HTTPS in production**
   - No HTTP endpoints allowed
   - Enforce HTTPS redirects
   - Validate SSL certificates

2. **API keys and secrets MUST be stored in environment variables**
   - NO hardcoded keys in source code
   - Use `.env` files (never committed)
   - Provide `.env.example` template

3. **Sensitive data MUST NOT be logged**
   - No tokens, passwords, or PII in console logs
   - Redact sensitive fields in error logs
   - Implement structured logging with redaction

4. **ALL API responses MUST be validated**
   - Verify response structure
   - Check HTTP status codes
   - Handle errors gracefully

5. **Authentication tokens MUST be transmitted securely**
   - Use httpOnly cookies (preferred)
   - OR Authorization header with Bearer token
   - Never use localStorage for sensitive tokens

### Recommended

1. Implement request timeout handling (prevent hanging requests)
2. Use retry logic with exponential backoff
3. Implement rate limiting on client side
4. Add request/response interceptors for monitoring
5. Use CORS properly (don't use `*` in production)

### Optional

1. Implement certificate pinning for mobile apps
2. Use request signing (HMAC) for critical operations
3. Implement request/response encryption beyond HTTPS

---

## Validation Rules

### Automated Checks

- **Environment validation:** Fail startup if required env vars missing
- **HTTPS enforcement:** Check URLs don't start with `http://` in production
- **Type checking:** All API responses have TypeScript interfaces
- **Test requirement:** Mock API calls in unit tests

### Manual Review

- [ ] No hardcoded API keys or secrets
- [ ] `.env.example` exists with all required variables
- [ ] `.env` is in `.gitignore`
- [ ] API errors are handled gracefully
- [ ] Sensitive data is redacted from logs

### Tools

- **Environment validation:** Custom startup script
- **Type safety:** TypeScript with strict mode
- **API mocking:** MSW (Mock Service Worker)

---

## Implementation Guide

### Step 1: Environment Setup

Create `.env.example`:

```bash
# .env.example (commit this)
VITE_API_URL=https://api.example.com
VITE_GEMINI_API_KEY=your_api_key_here
VITE_ANALYTICS_ID=your_analytics_id
```

Create `.env` (NEVER commit):

```bash
# .env (in .gitignore)
VITE_API_URL=https://prod-api.example.com
VITE_GEMINI_API_KEY=sk_live_actual_key_12345
VITE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Step 2: Create Config Module

```typescript
// src/config.ts
const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_GEMINI_API_KEY'
] as const;

// Validate environment on startup
requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Ensure HTTPS in production
if (import.meta.env.MODE === 'production') {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && !apiUrl.startsWith('https://')) {
    throw new Error('API_URL must use HTTPS in production');
  }
}

export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  isDevelopment: import.meta.env.MODE === 'development'
} as const;
```

### Step 3: Create Secure API Client

```typescript
// src/services/apiClient.ts
import { config } from '@/config';

// Redact sensitive fields from logs
const redactSensitive = (data: any): any => {
  if (!data) return data;
  const redacted = { ...data };
  const sensitiveKeys = ['token', 'password', 'apiKey', 'secret', 'authorization'];

  sensitiveKeys.forEach(key => {
    if (key in redacted) {
      redacted[key] = '[REDACTED]';
    }
  });
  return redacted;
};

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${config.apiUrl}${endpoint}`;

    // Log request (redacted)
    if (config.isDevelopment) {
      console.log('[API Request]', {
        url,
        method: options.method || 'GET',
        headers: redactSensitive(options.headers)
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // Log error (redacted)
      console.error('[API Error]', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
};
```

---

## Examples

### ✅ Good Examples

#### Example 1: Secure API Call with Environment Variables

```typescript
import { config } from '@/config';

// ✅ GOOD: API key from environment
const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
  headers: {
    'Authorization': `Bearer ${config.geminiApiKey}`,
    'Content-Type': 'application/json'
  }
});
```

#### Example 2: HTTPS Enforcement

```typescript
// ✅ GOOD: Validate HTTPS in production
const buildApiUrl = (endpoint: string): string => {
  const baseUrl = config.apiUrl;

  if (import.meta.env.MODE === 'production' && !baseUrl.startsWith('https://')) {
    throw new Error('HTTPS required in production');
  }

  return `${baseUrl}${endpoint}`;
};
```

#### Example 3: Safe Error Logging

```typescript
// ✅ GOOD: Redact sensitive data
const logApiError = (error: unknown, context: Record<string, any>) => {
  const safe = {
    ...context,
    token: '[REDACTED]',
    apiKey: '[REDACTED]'
  };

  console.error('[API_ERROR]', {
    message: error instanceof Error ? error.message : 'Unknown',
    context: safe
  });
};
```

#### Example 4: Response Validation

```typescript
import { z } from 'zod';

// ✅ GOOD: Validate API response structure
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string()
});

const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  // Validate before using
  const user = UserSchema.parse(data);
  return user;
};
```

### ❌ Anti-Patterns

#### Bad Example 1: Hardcoded API Key

```typescript
// ❌ CRITICAL VIOLATION: Hardcoded secret!
const API_KEY = "sk_live_12345abcdef";

fetch('https://api.example.com/data', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});
```

#### Bad Example 2: HTTP in Production

```typescript
// ❌ VIOLATION: Insecure HTTP
const API_URL = 'http://api.example.com';  // Man-in-the-middle attack!
```

#### Bad Example 3: Logging Sensitive Data

```typescript
// ❌ VIOLATION: Logs password and token
const loginUser = async (email: string, password: string) => {
  console.log('Login attempt:', { email, password }); // LEAK!

  const response = await fetch('/api/login', {
    body: JSON.stringify({ email, password })
  });

  const { token } = await response.json();
  console.log('Received token:', token); // LEAK!
};
```

#### Bad Example 4: No Response Validation

```typescript
// ❌ VIOLATION: Trusts API response structure
const user = await fetch('/api/user').then(r => r.json());
// What if response is { error: "Not found" } instead of user object?
// Code will crash accessing user.name
```

---

## Exceptions

### Requesting an Exception

```yaml
compliance_exceptions:
  - rule: "IC_security_api_communication"
    reason: "Development environment only, using localhost HTTP for debugging"
    approved_by: "Tech Lead"
    approved_date: "2025-12-10"
    expires: "2025-12-31"
    mitigation: "Strict environment checks prevent production use"
```

### Valid Exception Reasons

- **Localhost development:** HTTP allowed for `localhost` only, with env checks
- **Legacy API transition:** Temporary HTTP support with HTTPS migration plan
- **Internal network:** Secured VPN/intranet (document network topology)

---

## Metrics & Monitoring

### Compliance Metrics

- **Target:** 100% HTTPS, 0 hardcoded secrets
- **Tracking:** ESLint + env validation on startup
- **Alerts:** Secret detection in commits (pre-commit hook)

### Monitoring

```typescript
// Track API errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('API Error')) {
    // Send to monitoring service (not console in prod)
    logToMonitoring(event.reason);
  }
});
```

---

## Related Documents

- **Parent Spec:** [SECURITY_GUIDELINES.md](../../architect/specifications/reference/non-functional/SECURITY_GUIDELINES.md)
- **Related ICs:**
  - `IC_security_secrets_management` - Key rotation and storage
  - `IC_security_input_sanitization` - Validate API responses
- **Reference:**
  - [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

---

## Change Log

### v1.0.0 (2025-12-10)

- Initial version
- HTTPS enforcement rules
- Environment variable requirements
- Safe logging guidelines

---

## Enforcement

**Enforcement Level:** Mandatory

Violations block deployment. Automated checks run on every commit.

### Review Process

1. **Pre-commit:** Secret scanner (detect hardcoded keys)
2. **CI/CD:** Environment validation, HTTPS check
3. **PR Review:** Manual review of API calls
4. **Quarterly:** Security audit of all API integrations

---

## FAQ

### Q: Can I use HTTP for localhost development?

**A:** Yes, but add environment checks:

```typescript
if (import.meta.env.MODE === 'production' && url.startsWith('http://')) {
  throw new Error('HTTPS required');
}
```

### Q: Where should I store API keys in production?

**A:** Use platform-specific secret management:

- **Vercel:** Environment Variables in dashboard
- **Netlify:** Build environment variables
- **AWS:** Secrets Manager
- **Local:** `.env` file (gitignored)

### Q: Should I validate every API response?

**A:** Yes. Use Zod or TypeScript interfaces. APIs can change or return errors.

---

**Last Review:** 2025-12-10
**Next Review:** 2026-06-10
**Owner:** Backend Team + Security Team
