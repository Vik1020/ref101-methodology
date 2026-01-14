---
context_id: IC_a11y_standards
version: "1.0.0"
type: infrastructure
category: accessibility
applies_to:
  - PC_*  # All programmatic contexts (UI components)
enforcement: mandatory
health:
  documentation_coverage: 100
  last_updated: 2025-12-21
  staleness_days: 0
related_contexts:
  - IC_security_input_sanitization
migration:
  breaking_changes: []
  deprecations: []
  migration_guide: null
---

# Infrastructure Context: Accessibility Standards

## Purpose

Defines mandatory accessibility (a11y) requirements to ensure all UI components comply with WCAG 2.1 Level AA standards and are usable by people with disabilities, including screen reader users, keyboard-only users, and users with visual impairments.

---

## Requirements

### Mandatory

1. **ALL interactive elements MUST be keyboard accessible**
   - Focus management with visible focus indicators
   - Tab order follows logical reading flow
   - All actions achievable without mouse
   - Escape key closes modals/dropdowns
   - Enter/Space activate buttons and links

2. **ALL components MUST have proper ARIA attributes**
   - `aria-label` or `aria-labelledby` for screen readers
   - `role` attribute when semantic HTML insufficient
   - `aria-live` regions for dynamic content updates
   - `aria-expanded`, `aria-controls` for interactive widgets
   - `aria-hidden="true"` for decorative elements

3. **ALL text MUST meet color contrast requirements**
   - Normal text: minimum 4.5:1 contrast ratio
   - Large text (18pt+): minimum 3:1 contrast ratio
   - Interactive elements: minimum 3:1 against background
   - Color MUST NOT be the sole indicator of state

4. **ALL images MUST have meaningful alt text**
   - Descriptive alt text for informative images
   - Empty alt="" for decorative images
   - Complex images described in adjacent text
   - Icons paired with text labels

5. **ALL forms MUST have accessible labels**
   - `<label>` element associated with input (via `for` attribute)
   - Placeholder text NOT used as sole label
   - Error messages announced to screen readers
   - Required fields clearly indicated

6. **ALL semantic HTML MUST be used correctly**
   - `<button>` for buttons (NOT `<div onClick>`)
   - `<a>` for links (with valid href)
   - `<nav>`, `<main>`, `<header>`, `<footer>` for landmarks
   - Headings (`<h1>` - `<h6>`) in logical hierarchy

### Recommended

1. Use skip links for keyboard navigation
2. Provide text alternatives for audio/video content
3. Support browser zoom up to 200% without horizontal scroll
4. Use ARIA landmarks for major page sections
5. Test with screen readers (NVDA, JAWS, VoiceOver)

### Optional

1. Support high contrast mode (Windows High Contrast)
2. Provide keyboard shortcuts for common actions
3. Implement focus trapping in modals
4. Add live region announcements for async updates

---

## Validation Rules

### Automated Checks

- **ESLint:** `eslint-plugin-jsx-a11y` with recommended rules
- **Type check:** TypeScript ensures ARIA attributes are valid
- **Lighthouse:** Accessibility score ≥ 100 (target)
- **axe-core:** No violations in automated tests

### Manual Review

- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical and intuitive
- [ ] Focus indicators visible (not removed with `outline: none`)
- [ ] Color contrast checked with browser DevTools
- [ ] ARIA attributes semantically correct
- [ ] Component tested with screen reader
- [ ] Component works at 200% browser zoom

### Tools

- **axe DevTools:** Browser extension for a11y testing
- **Lighthouse:** `npx lighthouse https://localhost:5173 --only-categories=accessibility`
- **WAVE:** Web accessibility evaluation tool
- **Screen readers:** NVDA (Windows), VoiceOver (macOS), JAWS

---

## Implementation Guide

### Step 1: Install Dependencies

```bash
npm install --save-dev eslint-plugin-jsx-a11y
npm install --save-dev @axe-core/react
```

### Step 2: Configure ESLint

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:jsx-a11y/recommended'
  ],
  plugins: ['jsx-a11y'],
  rules: {
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error'
  }
};
```

### Step 3: Use Semantic HTML

```typescript
// ✅ GOOD: Semantic button
<button onClick={handleClick} aria-label="Close dialog">
  <XIcon />
</button>

// ❌ BAD: Non-semantic div
<div onClick={handleClick}>
  <XIcon />
</div>
```

### Step 4: Add ARIA Attributes

```typescript
// ✅ GOOD: Proper ARIA for expandable section
<button
  onClick={toggleExpanded}
  aria-expanded={isExpanded}
  aria-controls="details-panel"
>
  Show Details
</button>
<div id="details-panel" hidden={!isExpanded}>
  {/* Content */}
</div>
```

### Step 5: Keyboard Navigation

```typescript
// ✅ GOOD: Keyboard support
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
  if (e.key === 'Escape') {
    handleClose();
  }
};

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleAction}
>
  Custom Button
</div>
```

---

## Examples

### ✅ Good Examples

#### Example 1: Accessible Button Component

```typescript
// src/components/ui/Button.tsx
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

// ✅ GOOD: Semantic button with proper ARIA
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', isLoading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        className={`btn btn-${variant}`}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            <span className="sr-only">Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### Example 2: Accessible Form Input

```typescript
// src/components/ui/Input.tsx
interface InputProps {
  label: string;
  error?: string;
  required?: boolean;
  id: string;
}

// ✅ GOOD: Proper label association and error handling
export const Input = ({ label, error, required, id, ...props }: InputProps) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="input-wrapper">
      <label htmlFor={id} className="input-label">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      <input
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <span id={errorId} role="alert" className="input-error">
          {error}
        </span>
      )}
    </div>
  );
};
```

#### Example 3: Accessible Modal Dialog

```typescript
// src/components/ui/Modal.tsx
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// ✅ GOOD: Modal with focus management
export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Trap focus in modal
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="modal-overlay"
    >
      <div className="modal-content">
        <h2 id="modal-title">{title}</h2>
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close dialog"
          className="modal-close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};
```

#### Example 4: Accessible Icon Button

```typescript
// ✅ GOOD: Icon button with text label for screen readers
import { TrashIcon } from 'lucide-react';

<button
  onClick={handleDelete}
  aria-label="Delete item"
  className="icon-button"
>
  <TrashIcon aria-hidden="true" />
</button>
```

#### Example 5: Live Region for Dynamic Updates

```typescript
// ✅ GOOD: Announce status changes to screen readers
const [status, setStatus] = useState<string>('');

<div aria-live="polite" aria-atomic="true" className="sr-only">
  {status}
</div>

// Somewhere in code:
setStatus('Item added to cart');
```

### ❌ Anti-Patterns

#### Bad Example 1: Non-Semantic Clickable Div

```typescript
// ❌ CRITICAL VIOLATION: Not keyboard accessible, no screen reader support
<div onClick={handleClick} className="fake-button">
  Click me
</div>

// ✅ CORRECT: Use semantic button
<button onClick={handleClick} className="btn">
  Click me
</button>
```

#### Bad Example 2: Missing Alt Text

```typescript
// ❌ VIOLATION: Image without alt text
<img src="/product.jpg" />

// ✅ CORRECT: Descriptive alt text
<img src="/product.jpg" alt="Blue wireless headphones with noise cancellation" />

// ✅ CORRECT: Decorative image (empty alt)
<img src="/divider.svg" alt="" role="presentation" />
```

#### Bad Example 3: Poor Color Contrast

```css
/* ❌ VIOLATION: Insufficient contrast (2.1:1) */
.text {
  color: #999999; /* Light gray */
  background: #ffffff; /* White */
}

/* ✅ CORRECT: Meets WCAG AA (7.0:1) */
.text {
  color: #333333; /* Dark gray */
  background: #ffffff; /* White */
}
```

#### Bad Example 4: Placeholder as Label

```typescript
// ❌ VIOLATION: Placeholder disappears when typing
<input type="email" placeholder="Enter email" />

// ✅ CORRECT: Visible label + placeholder as hint
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="example@domain.com" />
```

#### Bad Example 5: Focus Outline Removed

```css
/* ❌ CRITICAL VIOLATION: Keyboard users can't see focus */
button:focus {
  outline: none;
}

/* ✅ CORRECT: Custom focus indicator */
button:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

---

## Exceptions

### Requesting an Exception

Accessibility is a legal requirement (ADA, Section 508). Exceptions are RARELY granted and require C-level approval.

```yaml
compliance_exceptions:
  - rule: "IC_a11y_standards"
    reason: "Third-party embedded widget (Google Maps) - vendor responsible for a11y"
    approved_by: "CTO + Legal"
    approved_date: "2025-12-21"
    expires: "2026-06-21"
    mitigation: "Provide text alternative with address and directions link"
```

### Valid Exception Reasons

- **Third-party widgets:** Vendor controls implementation (document mitigation)
- **Legacy migration:** Temporary exception with deadline and migration plan
- **Experimental feature:** Feature flag for opt-in beta users only

**Note:** User-facing production features CANNOT have exceptions without legal review.

---

## Metrics & Monitoring

### Compliance Metrics

- **Target:** 100% of components pass Lighthouse a11y audit
- **Current:** Track via automated tests
- **Blockers:** Any Lighthouse score < 100

### Tracking

- **Dashboard:** Lighthouse CI reports
- **Alert threshold:** Component scores < 90
- **Review frequency:** Every PR + Weekly audit

---

## Related Documents

- **Parent Spec:** [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/)
- **Related ICs:**
  - `IC_security_input_sanitization` - Form validation overlaps with a11y
- **Reference Standards:**
  - [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)
  - [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
  - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Change Log

### v1.0.0 (2025-12-21)

- Initial version
- Defined mandatory WCAG 2.1 Level AA requirements
- Added keyboard navigation requirements
- Created validation checklist
- Included axe-core and Lighthouse integration

---

## Enforcement

**Enforcement Level:** Mandatory

**Violations BLOCK deployment.** Any PC component failing Lighthouse a11y audit must be fixed immediately.

### Review Process

1. **Automated:** ESLint + axe-core checks on every commit
2. **PR Review:** Manual keyboard navigation test
3. **Accessibility Audit:** Quarterly testing with real users + screen readers
4. **IC Update:** Annual review and refinement

---

## FAQ

### Q: Can I use `<div role="button">` instead of `<button>`?

**A:** Only if absolutely necessary (e.g., complex styling impossible with button). You MUST add:
- `tabIndex={0}` for keyboard focus
- `onKeyDown` handler for Enter/Space keys
- Proper ARIA attributes

Prefer semantic `<button>` whenever possible.

### Q: How do I test with a screen reader?

**A:**
- **Windows:** Download NVDA (free) or JAWS (paid)
- **macOS:** VoiceOver built-in (Cmd+F5)
- **Mobile:** VoiceOver (iOS) or TalkBack (Android)

Navigate your component with keyboard only, listen to announcements.

### Q: What about decorative icons?

**A:** Use `aria-hidden="true"` to hide from screen readers. Ensure adjacent text provides context.

```typescript
<button>
  <TrashIcon aria-hidden="true" />
  Delete
</button>
```

### Q: Can I use color to indicate errors?

**A:** Color alone is insufficient (color blind users). Combine with:
- Icons (✓ or ✗)
- Text labels ("Success" / "Error")
- ARIA attributes (`aria-invalid="true"`)

---

**Last Review:** 2025-12-21
**Next Review:** 2026-06-21
**Owner:** Frontend Team + Accessibility Lead
