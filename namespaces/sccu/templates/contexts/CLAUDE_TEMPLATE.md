# CLAUDE.md Template

**Version:** 1.0.0

Template for integrating ref101-specs into new projects.

---

## Setup Instructions

### Step 1: Create directory structure

```bash
mkdir -p .claude docs/business docs/analytics
```

### Step 2: Link specifications

**Option A: Symlink (recommended for development)**
```bash
ln -s /absolute/path/to/ref101-specs/specifications .claude/ref101
```

**Option B: Copy (for production/isolation)**
```bash
cp -r /path/to/ref101-specs/specifications .claude/ref101
```

### Step 3: Copy this template

```bash
cp /path/to/ref101-specs/specifications/templates/contexts/CLAUDE_TEMPLATE.md ./CLAUDE.md
```

### Step 4: Customize Project Configuration section below

---

# Project Instructions for Claude Code

> **First:** Read `.claude/ref101/SYSTEM_PROMPT.md` before any work.

---

## P0 Rules (Deployment Blockers)

### Workflow Order

**BC → AC → PC → IC** (mandatory sequence)

- Cannot create AC without approved BC
- Cannot create PC without approved AC
- Cannot deploy without IC compliance
- Ask user approval after each phase

### Security

- ✅ Sanitize ALL user input (DOMPurify)
- ❌ NO `dangerouslySetInnerHTML` without sanitization
- ❌ NO hardcoded secrets (use env vars)
- ✅ HTTPS in production

### Context.md Validation

- `version: "1.0.0"` — QUOTED string!
- `compliance:` — 5 mandatory ICs for PC
- `context_id: BC_domain_name` — underscores, not hyphens

### On P0 Violation

1. **STOP** immediately
2. Report violation to user
3. Suggest fix based on IC context
4. **DO NOT** proceed until fixed

---

## References

| Document | Purpose |
|----------|---------|
| [SYSTEM_PROMPT](.claude/ref101/SYSTEM_PROMPT.md) | Full rules, layers, workflow |
| [QUICK_REFERENCE](.claude/ref101/QUICK_REFERENCE.md) | Cheatsheet, P0 checklist |
| [TECH_STACK](.claude/ref101/TECH_STACK.md) | Technologies, libraries |
| [GLOSSARY](.claude/ref101/GLOSSARY.md) | Terms: BC, AC, PC, IC, PA |

---

## Project Configuration

### Project Name

<!-- Replace with your project name -->
**[Your Project Name]**

### Tech Stack

<!-- Customize for your project. Default stack: -->
- **Framework:** React 19, TypeScript
- **Styling:** Tailwind CSS
- **Build:** Vite
- **Testing:** Vitest + RTL

<!-- Override example:
- **Framework:** Next.js 14
- **Database:** PostgreSQL
- **Cloud:** AWS
-->

### Project Structure

```
{project}/
├── docs/
│   ├── business/        # BC contexts
│   └── analytics/       # AC contexts
├── src/
│   ├── components/      # PC contexts (context.md next to code)
│   ├── hooks/           # Business logic
│   └── services/        # API integration
└── .claude/
    └── ref101/          # Specifications (symlink or copy)
```

### Project-Specific Rules

<!-- Add any project-specific rules here -->

---

**Specifications Version:** 2.1.0
**Project Version:** 1.0.0
