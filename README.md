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

## Glass Pro (2026-10) — built on TSD

`@cerebro/synapse` now builds on **`@the-stoical-developers/ds-glass`** (TSD generic Glass Pro language: tokens, themes `glasspro`/`glass`/`aurora`, motion primitives).
Cerebro-specific components live in `synapse/ts/src/react/cerebro` (exported from `@cerebro/synapse/react` and `@cerebro/synapse/cerebro`):

| Component | Purpose |
|---|---|
| `Mascot` | three.js glass nucleus + orbiting electrons; mood from bus events (optional peer `three`) |
| `NeuralNet` | hierarchy rings (core → business cases → use cases → agents → tools) with action-potential cascades |
| `EisenhowerMatrix` | 4-quadrant task matrix with layout transitions |
| `AgentCard` / `ProgressRing` / `LogStream` | agent tiles with progress and live logs |
| `RunTimeline` / `SchedulerTimeline` | run gantt + 24h schedule strip |
| `ApprovalsList` | HITL approve/reject |
| `KpiCard` / `Sparkline` | odometer KPIs |
| `ActivityFeed` | live feed |
| `cerebroBus` / `createCerebroBus` | real backend events → motion |

CSS: `import '@cerebro/synapse/glass-pro.css'` (re-exports ds-glass). Set `data-glass-theme` on `<html>`.

### Release / publish (same pattern as wedded_design_system)
semantic-release on `main` (`.releaserc.json`) → tag `vX.Y.Z` + GitHub release → `publish-synapse.yml` publishes to Artifact Registry `europe-southwest1-npm.pkg.dev/wedded-prod/tsd-npm/`.
Installing requires registry auth: `npx google-artifactregistry-auth@3 --repo-config=.npmrc` (uses gcloud ADC).
