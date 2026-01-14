---
context_id: IC_security_input_sanitization
version: "1.0.0"
type: infrastructure
category: security
applies_to:
  - PC_*  # All programmatic contexts
enforcement: mandatory
health:
  documentation_coverage: 100
  last_updated: 2025-12-10
  staleness_days: 0
related_contexts:
  - IC_security_xss_prevention
  - IC_security_api_communication
migration:
  breaking_changes: []
  deprecations: []
  migration_guide: null
---

# Infrastructure Context: Input Sanitization

## Purpose

Defines mandatory rules for sanitizing all user-generated content and external data to prevent XSS (Cross-Site Scripting) attacks and code injection vulnerabilities.

---

## Requirements

### Mandatory (P0 - Blocks Deployment)

1. **[P0] ALL user-generated content MUST be sanitized before rendering to HTML**
   - **Priority:** P0 (Critical - XSS vulnerability if violated)
   - **Impact:** Security breach, user data compromise
   - Use DOMPurify library for HTML sanitization
   - Configure allowed tags and attributes explicitly
   - Never trust user input

2. **[P0] NO use of `dangerouslySetInnerHTML` without explicit sanitization**
   - **Priority:** P0 (Critical - XSS vulnerability if violated)
   - **Impact:** Direct XSS attack vector
   - Every instance MUST include DOMPurify.sanitize()
   - Document why HTML rendering is necessary
   - Consider alternatives (Markdown, plain text)

3. **[P0] ALL form inputs MUST have validation**
   - **Priority:** P0 (Critical - Data integrity & security)
   - **Impact:** Invalid data in database, potential injection attacks
   - Client-side validation (UX)
   - Server-side validation (Security)
   - Use schema validation (Zod, Yup)

4. **[P0] ALL external data sources MUST be validated**
   - **Priority:** P0 (Critical - External data untrusted)
   - **Impact:** Data corruption, security vulnerabilities
   - API responses
   - File uploads
   - URL parameters
   - LocalStorage/SessionStorage data

### Recommended (P1 - Should Fix in Sprint)

1. **[P1] Use TypeScript strict mode for type safety**
   - **Priority:** P1 (High - Prevents type-related bugs)
   - **Impact:** Runtime errors, type confusion

2. **[P1] Implement Content Security Policy (CSP) headers**
   - **Priority:** P1 (High - Defense in depth)
   - **Impact:** Additional XSS protection layer

3. **[P1] Use React's default escaping whenever possible**
   - **Priority:** P1 (High - Safest approach)
   - **Impact:** Reduced attack surface
   - Prefer `{userInput}` over innerHTML

4. **[P1] Sanitize on output, not on input**
   - **Priority:** P1 (High - Data preservation)
   - **Impact:** Data loss, analysis difficulties
   - Preserve original data for logging/analysis

### Optional (P2 - Nice to Have)

1. **[P2] Implement Trusted Types API for additional protection**
   - **Priority:** P2 (Low - Modern browser feature)
   - **Impact:** Enhanced XSS prevention (browser-dependent)

2. **[P2] Use automated security scanning tools**
   - **Priority:** P2 (Low - Additional validation)
   - **Impact:** Early vulnerability detection
   - Tools: Snyk, OWASP ZAP

---

## Validation Rules

### Automated Checks

- **ESLint rule:** `react/no-danger` (warns on `dangerouslySetInnerHTML`)
- **Type check:** All inputs must have explicit types
- **Test requirement:** Unit test for each sanitization point

### Manual Review

- [ ] Every `dangerouslySetInnerHTML` usage has DOMPurify
- [ ] Sanitization configuration is appropriate for context
- [ ] Alternative rendering methods were considered
- [ ] User input validation is present

### Tools

- **DOMPurify:** `npm install dompurify @types/dompurify`
- **Zod:** `npm install zod` (schema validation)
- **ESLint:** `.eslintrc` includes `react/no-danger: "warn"`

---

## Implementation Guide

### Step 1: Install Dependencies

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

### Step 2: Create Sanitization Utility

```typescript
// src/utils/sanitize.ts
import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty: string, allowedTags?: string[]): string => {
  const config = allowedTags
    ? { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: ['href', 'target', 'rel'] }
    : { ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'] };

  return DOMPurify.sanitize(dirty, config);
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#';
    }
    return url;
  } catch {
    return '#';
  }
};
```

### Step 3: Use in Components

```typescript
import { sanitizeHtml } from '@/utils/sanitize';

const MyComponent = ({ userContent }: { userContent: string }) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(userContent)
      }}
    />
  );
};
```

---

## Examples

### ✅ Good Examples

#### Example 1: Sanitizing Rich Text Content

```typescript
import { sanitizeHtml } from '@/utils/sanitize';

const ArticleContent = ({ content }: { content: string }) => {
  // ✅ GOOD: Content is sanitized before rendering
  const cleanHtml = sanitizeHtml(content, [
    'p', 'h1', 'h2', 'h3', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'code', 'pre'
  ]);

  return (
    <div
      className="article-content"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};
```

#### Example 2: Form Input Validation

```typescript
import { z } from 'zod';

const userInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  bio: z.string().max(500)
});

const handleSubmit = (formData: FormData) => {
  // ✅ GOOD: Validate before processing
  try {
    const validated = userInputSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      bio: formData.get('bio')
    });
    // Safe to use validated data
  } catch (error) {
    showError('Invalid input');
  }
};
```

#### Example 3: URL Sanitization

```typescript
import { sanitizeUrl } from '@/utils/sanitize';

const ExternalLink = ({ url, label }: { url: string; label: string }) => {
  // ✅ GOOD: URL validated before rendering
  const safeUrl = sanitizeUrl(url);

  return (
    <a href={safeUrl} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
};
```

### ❌ Anti-Patterns

#### Bad Example 1: Unsanitized HTML

```typescript
const DangerousComponent = ({ userHtml }: { userHtml: string }) => {
  // ❌ CRITICAL VIOLATION: XSS vulnerability!
  // User can inject <script>alert('XSS')</script>
  return <div dangerouslySetInnerHTML={{ __html: userHtml }} />;
};
```

#### Bad Example 2: No Input Validation

```typescript
const InsecureForm = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // ❌ VIOLATION: No validation, trusts user input
    fetch('/api/subscribe', {
      body: JSON.stringify({ email }) // Could be malicious
    });
  };
};
```

#### Bad Example 3: Unsafe URL Rendering

```typescript
// ❌ VIOLATION: javascript: URLs can execute code
<a href={userProvidedUrl}>Click here</a>

// Malicious user provides: javascript:alert('XSS')
```

---

## Exceptions

### Requesting an Exception

If sanitization is impossible (e.g., trusted admin-only content editor), document in `context.md`:

```yaml
compliance_exceptions:
  - rule: "IC_security_input_sanitization"
    reason: "Admin-only content editor, users are pre-authenticated with admin role"
    approved_by: "Security Lead"
    approved_date: "2025-12-10"
    expires: "2026-06-10"
    mitigation: "Admin access requires 2FA, all actions are logged, regular security audits"
```

### Valid Exception Reasons

- **Admin-only interface:** Strict access control + audit logging
- **Trusted content source:** Content from verified CMS with built-in sanitization
- **Legacy migration:** Temporary exception with migration plan and deadline

**Note:** User-facing features CANNOT have exceptions.

---

## Metrics & Monitoring

### Compliance Metrics

- **Target:** 100% of user-facing components compliant
- **Current:** Track via ESLint reports
- **Blockers:** Any HIGH severity violations

### Tracking

- **Dashboard:** ESLint report in CI/CD
- **Alert threshold:** >0 dangerouslySetInnerHTML without DOMPurify
- **Review frequency:** Every PR + Monthly audit

---

## Related Documents

- **Parent Spec:** [SECURITY_GUIDELINES.md](../../architect/specifications/reference/non-functional/SECURITY_GUIDELINES.md)
- **Related ICs:**
  - `IC_security_xss_prevention` - Broader XSS protection strategies
  - `IC_security_api_communication` - API data validation
- **Reference Standards:**
  - [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
  - [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

---

## Change Log

### v1.0.0 (2025-12-10)

- Initial version
- Defined mandatory sanitization rules
- Added DOMPurify integration guide
- Created validation checklist

---

## Enforcement

**Enforcement Level:** Mandatory

**Violations BLOCK deployment.** Any PC component with unsanitized user input must be fixed immediately.

### Review Process

1. **Automated:** ESLint checks on every commit
2. **PR Review:** Manual verification of all `dangerouslySetInnerHTML`
3. **Security Audit:** Quarterly penetration testing
4. **IC Update:** Annual review and refinement

---

## FAQ

### Q: Can I use `innerHTML` instead of `dangerouslySetInnerHTML`?

**A:** No. Direct DOM manipulation bypasses React's safety. Always use React's rendering with sanitization.

### Q: What if I need to render Markdown?

**A:** Use a Markdown library (e.g., `react-markdown`) instead of converting to HTML and using `dangerouslySetInnerHTML`. Markdown libraries handle sanitization internally.

### Q: Is sanitization needed for API responses from our own backend?

**A:** Yes! Even trusted sources can be compromised. Validate all external data.

### Q: Can I sanitize on input instead of output?

**A:** Not recommended. Sanitize on output to preserve original data for logging/analysis. Validate on input for UX feedback.

---

**Last Review:** 2025-12-10
**Next Review:** 2026-06-10
**Owner:** Security Team
