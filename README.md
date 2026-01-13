# ref101-methodology

Monorepo for development methodologies. Currently contains SCCU (Self-Contained Context Unit).

## Structure

```
ref101-methodology/
├── manifest.yaml           # SSOT: namespaces, versions, bundles
├── CLAUDE.md               # Instructions for Claude Code
├── core/                   # Essential specs (always needed)
├── namespaces/
│   └── sccu/               # SCCU methodology
│       ├── templates/      # Phase and domain templates
│       ├── processes/      # Workflow process definitions
│       ├── skills/         # Claude Code skills
│       └── bundles/        # Pre-configured node sets
├── guides/                 # Optional learning materials
└── tools/                  # CLI utilities
```

## Usage

### As Git Submodule

```bash
git submodule add ../ref101-methodology methodology/ref101-methodology
```

### Initialize New Project

```bash
npx @ref101/init --methodology sccu --bundle enterprise
```

## Namespaces

| Namespace | Description | Status |
|-----------|-------------|--------|
| sccu | Self-Contained Context Unit | Active |

## License

MIT
