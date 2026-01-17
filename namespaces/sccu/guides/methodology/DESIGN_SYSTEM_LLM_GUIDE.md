# Design System + LLM Integration Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-08

> This guide describes how to integrate design systems (public like shadcn/ui or private like Figma)
> with LLM workflows for consistent, high-quality UI code generation.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Design System Provider Architecture](#design-system-provider-architecture)
3. [W3C Design Tokens](#w3c-design-tokens)
4. [UI_DESIGN Phase](#ui_design-phase)
5. [shadcn Provider](#shadcn-provider)
6. [Figma Provider](#figma-provider-roadmap)
7. [MCP Handlers](#mcp-handlers)
8. [LLM Usage Rules](#llm-usage-rules)
9. [Page Layout Pattern Selection](#page-layout-pattern-selection-v1500) (v1.50.0)
10. [Nodes Validation](#nodes-validation)
11. [Migration Path](#migration-path)

---

## Introduction

### Why Design System + LLM?

When LLM generates UI code without design system context:
- Inconsistent styling (different colors, spacing, typography)
- Non-standard components (custom buttons instead of library components)
- Accessibility issues (missing ARIA, keyboard navigation)
- Technical debt (hard to maintain generated code)

**With Design System Integration:**
- LLM knows available components and their APIs
- Consistent use of design tokens
- Follows established patterns
- Code matches team standards

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Design System Provider (DSP)** | Abstraction layer over design system sources |
| **Provider** | Specific source: shadcn, Figma, custom |
| **Design Tokens** | Primitive values: colors, spacing, typography |
| **Component Spec** | API definition: props, variants, usage rules |
| **UI_DESIGN Phase** | Workflow phase for UI requirements |

---

## Design System Provider Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Design System Provider (DSP)                │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │  shadcn Provider│              │  Figma Provider │       │
│  │  (active)       │              │  (roadmap)      │       │
│  └────────┬────────┘              └────────┬────────┘       │
│           │                                │                │
│           └────────────┬───────────────────┘                │
│                        ▼                                    │
│              ┌─────────────────┐                            │
│              │  Unified API    │                            │
│              │  - getComponent │                            │
│              │  - getTokens    │                            │
│              │  - listComponents│                           │
│              └─────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────┐
              │   LLM / PCC     │
              │   Workflow      │
              └─────────────────┘
```

### Configuration

**File:** `design-system/config.json`

```json
{
  "provider": "shadcn",
  "providers": {
    "shadcn": {
      "components_path": "src/components/ui",
      "tokens_path": "design-system/tokens/shadcn-tokens.json",
      "docs_path": "docs/domains/PA_DESIGN_SYSTEM_SHADCN.md"
    },
    "figma": {
      "mcp_endpoint": "https://mcp.figma.com/mcp",
      "file_id": "your-figma-file-id",
      "tokens_path": "design-system/tokens/figma-tokens.json",
      "docs_path": "docs/domains/PA_DESIGN_SYSTEM_FIGMA.md",
      "code_connect_path": "design-system/code-connect/"
    }
  }
}
```

### Switching Providers

```bash
# Edit config.json
{
  "provider": "figma"  # Changed from "shadcn"
}

# LLM automatically uses new provider
# Same MCP calls, different source
```

---

## W3C Design Tokens

### Format (2025.10 Stable)

Design tokens follow [W3C Design Tokens Specification](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/).

**File:** `design-system/tokens/shadcn-tokens.json`

```json
{
  "color": {
    "primary": {
      "$value": "hsl(222.2 47.4% 11.2%)",
      "$type": "color",
      "$description": "Primary brand color",
      "$extensions": {
        "ai": {
          "when_to_use": "Primary buttons, active states, links",
          "avoid_when": "Destructive actions, disabled states",
          "semantic_role": "brand-primary"
        }
      }
    },
    "destructive": {
      "$value": "hsl(0 84.2% 60.2%)",
      "$type": "color",
      "$extensions": {
        "ai": {
          "when_to_use": "Delete buttons, error states, warnings",
          "avoid_when": "Success states, informational UI",
          "semantic_role": "danger"
        }
      }
    }
  },
  "spacing": {
    "sm": {
      "$value": "8px",
      "$type": "dimension",
      "$extensions": {
        "ai": {
          "when_to_use": "Tight spacing, icon gaps, small padding",
          "semantic_role": "spacing-small"
        }
      }
    },
    "md": {
      "$value": "16px",
      "$type": "dimension",
      "$extensions": {
        "ai": {
          "when_to_use": "Default padding, card spacing, section gaps",
          "semantic_role": "spacing-medium"
        }
      }
    }
  },
  "typography": {
    "heading": {
      "lg": {
        "$value": {
          "fontFamily": "Inter, sans-serif",
          "fontSize": "24px",
          "fontWeight": 600,
          "lineHeight": 1.2
        },
        "$type": "typography",
        "$extensions": {
          "ai": {
            "when_to_use": "Page titles, section headers",
            "semantic_role": "heading-large"
          }
        }
      }
    }
  }
}
```

### AI Metadata Extensions

The `$extensions.ai` object provides LLM-specific guidance:

| Field | Purpose | Example |
|-------|---------|---------|
| `when_to_use` | Positive use cases | "Primary buttons, CTAs" |
| `avoid_when` | Anti-patterns | "Destructive actions" |
| `semantic_role` | Semantic meaning | "brand-primary" |

---

## UI_DESIGN Phase

### Place in Workflow

```
AC_delta → UI_DESIGN → PLAN_FINALIZE → PC
(approval)  (approval)   (approval)
```

### Purpose

Transform AC Use Cases into:
1. **Component map** - which UI components needed
2. **Token usage** - which design tokens applied
3. **Screen states** - default, loading, error, empty

### Artifact: UI_DESIGN_delta.md

```markdown
---
context_id: UI_DESIGN_delta_v1_40_0_feature_name
type: ui_design_delta
version: "1.0.0"
based_on:
  - AC_delta_v1_40_0_feature_name: "1.0.0"
figma_source:                    # Optional, for Figma provider
  file_id: "abc123"
  frame_id: "456:789"
---

## Components

| Component | Code Path | Variants | Use Case |
|-----------|-----------|----------|----------|
| Button | @/components/ui/button | variant="default" | UC01: Submit form |
| Input | @/components/ui/input | type="email" | UC01: Email input |
| Card | @/components/ui/card | - | UC02: Display item |

## Tokens

| Category | Token | Usage |
|----------|-------|-------|
| Color | color.primary | Submit button background |
| Spacing | spacing.md | Card padding |
| Typography | typography.heading.lg | Page title |

## States

- [x] Default state
- [x] Loading state
- [x] Empty state
- [x] Error state

## Traceability

| AC Use Case | Components |
|-------------|------------|
| UC01: Submit form | Button, Input |
| UC02: Display item | Card |
```

### Validators

| Validator | Severity | Description |
|-----------|----------|-------------|
| `components_exist` | error | All components in DSP |
| `ac_traceability` | error | Each component maps to UC |

---

## shadcn Provider

### Overview

[shadcn/ui](https://ui.shadcn.com/) is "AI-Ready" design system:
- Open code (copy-paste, not npm package)
- Radix UI primitives + Tailwind CSS
- Predictable structure LLM understands

### Setup

```bash
# 1. Initialize shadcn/ui
npx shadcn@latest init

# 2. Add components
npx shadcn@latest add button input card

# 3. Create DSP config
cat > design-system/config.json << 'EOF'
{
  "provider": "shadcn",
  "providers": {
    "shadcn": {
      "components_path": "src/components/ui",
      "tokens_path": "design-system/tokens/shadcn-tokens.json",
      "docs_path": "docs/domains/PA_DESIGN_SYSTEM_SHADCN.md"
    }
  }
}
EOF
```

### PA Documentation

**File:** `docs/domains/PA_DESIGN_SYSTEM_SHADCN.md`

```markdown
---
domain_id: PA_DESIGN_SYSTEM_SHADCN
type: project_asset
version: "1.0.0"
---

# Project Asset: shadcn/ui Design System

## Source
- **Library:** shadcn/ui
- **Docs:** https://ui.shadcn.com/docs
- **Provider:** shadcn

## Components

### Button
- **Code:** `@/components/ui/button`
- **Variants:** default, destructive, outline, secondary, ghost, link
- **Sizes:** default, sm, lg, icon
- **When to use:**
  - Primary actions (Submit, Save, Confirm)
  - Form submissions
  - Call-to-action buttons
- **Avoid when:**
  - Navigation (use Link component)
  - Toggle states (use Toggle component)
  - Menu triggers (use DropdownMenuTrigger)

### Input
- **Code:** `@/components/ui/input`
- **Types:** text, email, password, number, search
- **When to use:**
  - Form fields
  - Search inputs
  - Single-line text entry
- **Avoid when:**
  - Multi-line text (use Textarea)
  - Rich text (use Editor)

### Card
- **Code:** `@/components/ui/card`
- **Sub-components:** CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **When to use:**
  - Grouping related content
  - List items with actions
  - Dashboard widgets
```

---

## Figma Provider (Roadmap)

### Overview

[Figma MCP Server](https://www.figma.com/blog/introducing-figma-mcp-server/) enables:
- Direct access to Figma designs from LLM
- Token export in W3C format
- Code Connect mapping

### Setup (Future)

```bash
# 1. Configure Figma MCP
cat >> .claude/mcp.json << 'EOF'
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["@anthropic-ai/figma-mcp-server"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_TOKEN}"
      }
    }
  }
}
EOF

# 2. Update DSP config
{
  "provider": "figma",
  "providers": {
    "figma": {
      "mcp_endpoint": "https://mcp.figma.com/mcp",
      "file_id": "your-file-id"
    }
  }
}
```

### Code Connect

Maps Figma components to code:

```typescript
// design-system/code-connect/button.figma.tsx
import { figma } from '@figma/code-connect';
import { Button } from '@/components/ui/button';

figma.connect(Button, 'https://figma.com/file/.../Button', {
  props: {
    variant: figma.enum('Variant', {
      Primary: 'default',
      Secondary: 'secondary',
      Destructive: 'destructive'
    })
  },
  example: (props) => <Button variant={props.variant}>Click me</Button>
});
```

---

## MCP Handlers

### pcc_ds_get_component

Get detailed component specification.

**Request:**
```json
{
  "component_name": "Button",
  "variant": "primary"
}
```

**Response:**
```json
{
  "success": true,
  "component": {
    "name": "Button",
    "code_path": "@/components/ui/button",
    "variants": ["default", "destructive", "outline"],
    "props": [
      { "name": "variant", "type": "string", "default": "default" }
    ],
    "usage_rules": {
      "when_to_use": ["Primary actions", "Form submissions"],
      "avoid_when": ["Navigation", "Toggle states"]
    }
  }
}
```

### pcc_ds_get_tokens

Get design tokens by category.

**Request:**
```json
{
  "category": "colors"
}
```

**Response:**
```json
{
  "success": true,
  "tokens": {
    "primary": {
      "$value": "hsl(222.2 47.4% 11.2%)",
      "$type": "color",
      "$extensions": {
        "ai": {
          "when_to_use": "Primary buttons, active states"
        }
      }
    }
  }
}
```

### pcc_ds_list_components

List all available components.

**Response:**
```json
{
  "success": true,
  "components": [
    { "name": "Button", "description": "Interactive button" },
    { "name": "Input", "description": "Text input field" }
  ]
}
```

---

## LLM Usage Rules

### P0 Rules (Blocking)

```markdown
## UI Component Rules

### ALWAYS use design system components
- Button: `import { Button } from "@/components/ui/button"`
- Input: `import { Input } from "@/components/ui/input"`
- Card: `import { Card } from "@/components/ui/card"`

### NEVER use raw HTML for these elements
- ❌ `<button>` → ✅ `<Button>`
- ❌ `<input>` → ✅ `<Input>`
- ❌ Custom div with border → ✅ `<Card>`

### Check PA_DESIGN_SYSTEM before generating
1. Read PA_DESIGN_SYSTEM_*.md for component rules
2. Follow `when_to_use` guidelines
3. Apply correct variants for context
```

### Workflow Integration

```
1. UI_DESIGN phase:
   - Select Page Layout Pattern (v1.50.0)
   - Call pcc_ds_list_components()
   - Map Use Cases to components
   - Generate UI_DESIGN_delta.md

2. PC phase:
   - Import layout from @/components/layouts
   - Call pcc_ds_get_component() for each component
   - Generate code with correct imports
   - Apply tokens from pcc_ds_get_tokens()
```

---

## Page Layout Pattern Selection (v1.50.0)

> Before mapping components to Use Cases, determine the page layout pattern.

### Step 1: Analyze Use Cases

Look for these patterns in AC Use Cases:

| UC Phrase | Suggests Layout |
|-----------|-----------------|
| "View list of...", "Browse..." | CardListLayout |
| "Select X to view details" | ListDetailLayout |
| "Filter/search items" | CardListLayout + filterBar |
| "Sidebar navigation" | ListDetailLayout |
| "Switch between tabs" | TabbedLayout (custom) |
| "Create/Edit entity" | FormLayout (custom) |

### Step 2: Select Layout Component

Import from `@/components/layouts`:

| Component | When to Use |
|-----------|-------------|
| **CardListLayout** | Entity lists (releases, nodes, skills), card grids with filtering |
| **ListDetailLayout** | Master-detail views (tree → content), document browsers |
| **Custom** | Use atomic components (PageHeader, LoadingState, EmptyState, ErrorBanner) |

### Step 3: Document in UI_DESIGN

Include "Page Layout Pattern" section with:
1. **Layout Selection** table (Page Type, Layout Component, Justification)
2. **Layout Configuration** table (layout, gridCols, sidebarWidth, etc.)
3. Link justification to AC Use Case

### Example

**AC Use Case:**
```
UC025: View Node Details
Actor: Developer
Flow: User clicks node in list → System shows node details in panel
```

**UI_DESIGN Layout Section:**
```markdown
## Page Layout Pattern

### Layout Selection

| Property | Value |
|----------|-------|
| **Page Type** | ListDetail |
| **Layout Component** | ListDetailLayout |
| **Justification** | UC025 requires click-to-view pattern with detail panel |

### Layout Configuration

| Option | Value |
|--------|-------|
| sidebarWidth | md |
| cardTitle | Node Details |
| contentEmpty | yes (initial state) |
```

### Reference

See [PA_DESIGN_SYSTEM_LAYOUTS](../../../docs/domains/PA_DESIGN_SYSTEM_LAYOUTS.md) for full component documentation.

---

## Nodes Validation

### Node: design-system

**File:** `tools/node-validators/nodes.yaml`

```yaml
design-system:
  name: Design System
  description: Design tokens, components, provider config
  coupling: structural
  ssot: design-system/config.json
  components:
    auto:
      - design-system/tokens/*.json
      - design-system/providers/**/*.json
    explicit:
      - design-system/config.json
  dependencies:
    - workflow-engine
    - phase-templates
    - mcp-tooling
  rules:
    - id: provider-config-valid
      description: config.json must have valid provider
      severity: error
    - id: tokens-w3c-format
      description: Tokens must follow W3C spec
      severity: error
    - id: components-documented
      description: Components must have PA docs
      severity: warning
    - id: provider-paths-exist
      description: Config paths must exist
      severity: error
```

### Running Validation

```bash
# Validate design-system node
pcc nodes design-system

# Validate all nodes
pcc nodes --validate
```

---

## Migration Path

### Phase 1: shadcn Provider (Current)

1. Setup React + Tailwind + shadcn/ui
2. Create DSP config with shadcn provider
3. Document components in PA_DESIGN_SYSTEM_SHADCN.md
4. Export tokens to W3C format

### Phase 2: Figma Provider (Future)

1. Configure Figma MCP Server
2. Setup Code Connect mappings
3. Export tokens from Figma
4. Switch provider in config.json

### Hybrid Approach

```json
{
  "provider": "figma",
  "providers": {
    "shadcn": { ... },
    "figma": {
      "tokens_path": "design-system/tokens/figma-tokens.json",
      "components": "shadcn"  // Use shadcn components with Figma tokens
    }
  }
}
```

---

## References

### External
- [shadcn/ui](https://ui.shadcn.com/) - AI-Ready design system
- [Figma MCP Server](https://www.figma.com/blog/introducing-figma-mcp-server/)
- [W3C Design Tokens 2025.10](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)

### Internal
- [WORKFLOW.md](../../WORKFLOW.md) - Phase definitions
- [SYSTEM_PROMPT.md](../../SYSTEM_PROMPT.md) - LLM instructions
