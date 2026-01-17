# UI_DESIGN Phase Template

**Version:** 1.0.0

> Transform AC Use Cases into UI component mapping and token usage.

---

## Phase Overview

| Property | Value |
|----------|-------|
| **Phase ID** | UI_DESIGN |
| **Position** | After AC_delta, Before PLAN_FINALIZE |
| **Approval** | Required (UI/UX review) |
| **Artifact** | UI_DESIGN_delta_{feature}.md |

## Precondition Validators

| Validator | Severity | Description |
|-----------|----------|-------------|
| `ac_delta_exists` | error | AC_delta artifact must exist |
| `ac_has_use_cases` | error | AC must define Use Cases |

## Postcondition Validators

| Validator | Severity | Description |
|-----------|----------|-------------|
| `components_exist` | error | All listed components exist in DSP |
| `ac_traceability` | error | Each component maps to AC Use Case |
| `states_defined` | warning | Default, loading, error states defined |

---

## Artifact Template

```markdown
---
context_id: UI_DESIGN_delta_v{X}_{Y}_{Z}_{feature_name}
type: ui_design_delta
version: "1.0.0"
based_on:
  - AC_delta_v{X}_{Y}_{Z}_{feature_name}: "1.0.0"
figma_source:                    # Optional - only if using Figma provider
  file_id: "{figma_file_id}"
  frame_id: "{node_id}"
  last_sync: "{ISO_timestamp}"
---

# UI Design: {Feature Name}

## Overview

Brief description of the UI being designed and its purpose.

## Mockup

<!-- If Figma provider -->
**Figma Link:** [Frame Name](https://figma.com/file/{file_id}?node-id={frame_id})

<!-- If shadcn provider (manual) -->
**Reference:** Describe the layout or link to wireframe.

## Page Layout Pattern (v1.50.0)

> **Note:** Select layout pattern BEFORE mapping components. This ensures consistent page structure.

### Layout Selection

| Property | Value |
|----------|-------|
| **Page Type** | [CardList / ListDetail / Tabbed / Dashboard / Form / Custom] |
| **Layout Component** | [CardListLayout / ListDetailLayout / None] |
| **Justification** | [Link to AC Use Case that drives this choice] |

### Layout Configuration

| Option | Value |
|--------|-------|
| layout | list / grid |
| gridCols | 1-4 (if grid) |
| sidebarWidth | sm / md / lg / xl (if ListDetail) |
| filterBar | yes / no |
| headerActions | yes / no |

### Selection Guidelines

Choose layout based on Use Case pattern:

| UC Pattern | Suggested Layout |
|------------|------------------|
| "View list of entities" | CardListLayout (list) |
| "Browse and filter items" | CardListLayout + filterBar |
| "Select item to view details" | ListDetailLayout |
| "Compare items side by side" | CardListLayout (grid) |
| "Navigate between independent data" | TabbedLayout (custom) |
| "Create/Edit entity" | FormLayout (custom) |

> **Reference:** See [PA_DESIGN_SYSTEM_LAYOUTS](../../domains/PA_DESIGN_SYSTEM_LAYOUTS.md) for component details.

## Components

| Component | Code Path | Variants | Props | Use Case |
|-----------|-----------|----------|-------|----------|
| Button | @/components/ui/button | variant="default" | onClick | UC01 |
| Input | @/components/ui/input | type="email" | value, onChange | UC01 |
| Card | @/components/ui/card | - | - | UC02 |
| Badge | @/components/ui/badge | variant="secondary" | - | UC02 |

## Tokens Used

| Category | Token | Value | Usage |
|----------|-------|-------|-------|
| Color | color.primary | hsl(222.2 47.4% 11.2%) | Submit button bg |
| Color | color.destructive | hsl(0 84.2% 60.2%) | Delete button bg |
| Spacing | spacing.md | 16px | Card padding |
| Typography | typography.heading.lg | 24px/600 | Page title |

## States

### Default State
- [ ] All interactive elements visible
- [ ] Initial data loaded
- [ ] Actions available

### Loading State
- [ ] Skeleton or spinner shown
- [ ] Actions disabled
- [ ] Progress indication

### Empty State
- [ ] Placeholder message
- [ ] Action to add first item
- [ ] Helpful illustration

### Error State
- [ ] Error message displayed
- [ ] Retry action available
- [ ] Clear error indication

## Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| < 768px | Stack layout, full-width cards |
| >= 768px | Side-by-side layout |
| >= 1024px | Three-column grid |

## Accessibility Notes

- All interactive elements keyboard accessible
- ARIA labels on icon-only buttons
- Color contrast meets WCAG AA
- Focus indicators visible

## Traceability

| AC Use Case | Components | Notes |
|-------------|------------|-------|
| UC01: {Name} | Button, Input | Primary flow |
| UC02: {Name} | Card, Badge | List display |
| UC03: {Name} | Modal, Button | Confirmation |
```

---

## LLM Instructions

### Creating UI_DESIGN Artifact

1. **Read AC_delta** to extract Use Cases
2. **Select Page Layout Pattern (v1.50.0):**
   - Analyze UC phrases (view list, select to view, filter items, etc.)
   - Match to Selection Guidelines table
   - Choose CardListLayout / ListDetailLayout / Custom
   - Fill Layout Selection and Configuration tables
3. **Call `pcc_ds_list_components()`** to see available components
4. **Map Use Cases to components:**
   - Each UC should have at least one component
   - Note which variants/props needed
5. **Identify tokens:**
   - Call `pcc_ds_get_tokens("colors")`, `pcc_ds_get_tokens("spacing")`
   - Match to component usage
6. **Define states:**
   - Default, loading, empty, error at minimum
7. **Create artifact** with `pcc_create_artifact({ artifact_type: "UI_DESIGN" })`

### With Figma Provider

1. **Get Figma frame** from user or AC
2. **Call Figma MCP** to extract components and tokens
3. **Auto-populate** component and token tables
4. **Add traceability** to AC Use Cases

### With shadcn Provider

1. **Manually select** components from PA_DESIGN_SYSTEM_SHADCN.md
2. **Reference** shadcn docs for variants and props
3. **Create** component and token tables manually

---

## Transition Rules

### Entry (from AC_DELTA)

```yaml
preconditions:
  - ac_delta_exists: error
  - ac_has_use_cases: error
```

### Exit (to PLAN_FINALIZE)

```yaml
postconditions:
  - components_exist: error
  - ac_traceability: error
  - states_defined: warning
approval:
  required: true
  approver: UI/UX Lead
```

---

## Examples

### Minimal UI_DESIGN

```markdown
---
context_id: UI_DESIGN_delta_v1_40_0_user_profile
type: ui_design_delta
version: "1.0.0"
based_on:
  - AC_delta_v1_40_0_user_profile: "1.0.0"
---

# UI Design: User Profile Page

## Components

| Component | Code Path | Use Case |
|-----------|-----------|----------|
| Card | @/components/ui/card | UC01: View profile |
| Button | @/components/ui/button | UC02: Edit profile |
| Input | @/components/ui/input | UC02: Edit fields |

## Tokens Used

| Category | Token | Usage |
|----------|-------|-------|
| Spacing | spacing.lg | Card padding |

## States

- [x] Default state
- [x] Loading state
- [x] Error state

## Traceability

| AC Use Case | Components |
|-------------|------------|
| UC01: View profile | Card |
| UC02: Edit profile | Button, Input |
```

---

## Related

- [DESIGN_SYSTEM_LLM_GUIDE](../../guides/methodology/DESIGN_SYSTEM_LLM_GUIDE.md)
- [AC_DELTA_TEMPLATE](./AC_DELTA_TEMPLATE.md)
- [PLAN_FINALIZE_TEMPLATE](./PLAN_FINALIZE_TEMPLATE.md)
