# Cerebro Design System

Monorepo for Cerebro's design systems (TypeScript tokens + React components).

## Structure

```
cerebro_design_system/
  tokens/                # Design token source of truth (DTCG W3C format)
    primitives/          # Color, spacing, radius, typography, shadow, motion, glass
    brand/synapse/       # Synapse brand semantic tokens (light + dark)
    components/          # Component-level tokens (tones)
  build/                 # Style Dictionary build workspace (@cerebro/design-system-build)
  synapse/               # Synapse design system
    ts/                  # TypeScript package — @cerebro/synapse (npm compatible)
```

## Design Systems

| System    | Status | Description                                        |
|-----------|--------|----------------------------------------------------|
| `synapse` | Active | Cerebro operations console — dark-first ops UI     |

## Development

### Build tokens (Style Dictionary → TypeScript + CSS)

```bash
npm install
npm run build
```

Generates `synapse/ts/src/generated/tokens/*.ts` and
`synapse/ts/src/generated/css/synapse_theme.css` (light `:root` vars +
`.dark` overrides + `.glass` utility class).

### Tests (all workspaces)

```bash
npm test
```

### Storybook (per system)

```bash
cd synapse/ts
npm install
npm run storybook
```
