# [1.3.0](https://github.com/The-Stoical-Developers/cerebro_design_system/compare/v1.2.0...v1.3.0) (2026-10-13)


### Features

* **synapse:** clickable agents in 3D NeuralClusters (neighbourhood highlight, glass panel, keyboard list) ([34a94fc](https://github.com/The-Stoical-Developers/cerebro_design_system/commit/34a94fc97912507d3d94c3dd6e12a720774056e8))

# [1.2.0](https://github.com/The-Stoical-Developers/cerebro_design_system/compare/v1.1.2...v1.2.0) (2026-10-13)


### Features

* **synapse:** 3D NeuralClusters (r3f + bloom) with one ring per real hierarchy level ([424eaa1](https://github.com/The-Stoical-Developers/cerebro_design_system/commit/424eaa11026d9888b9c4dc2c9abf8de97bd5f0f5))

## [1.1.2](https://github.com/The-Stoical-Developers/cerebro_design_system/compare/v1.1.1...v1.1.2) (2026-10-13)


### Bug Fixes

* **synapse:** hover highlights (brightness/glow, no fades) on Button; Cerebro shell CSS (topbar flush with sidebar top, centred search, no overlap) exported as cerebro-shell.css; require ds-glass ^5.1.1 ([458d771](https://github.com/The-Stoical-Developers/cerebro_design_system/commit/458d7712fb8f8a58a1a9c92edb4b3dbf339de879))

## [1.1.1](https://github.com/The-Stoical-Developers/cerebro_design_system/compare/v1.1.0...v1.1.1) (2026-10-13)


### Bug Fixes

* **synapse:** NeuralClusters roomier tool/MCP/connection clusters, precomputed halos/rings and gradient-free nodes for 60fps, mini shows only the root label ([1c7aafc](https://github.com/The-Stoical-Developers/cerebro_design_system/commit/1c7aafcda6c34a56b5cbebc3a139c7d1e916f52c))

# [1.1.0](https://github.com/The-Stoical-Developers/cerebro_design_system/compare/v1.0.2...v1.1.0) (2026-10-13)


### Features

* **synapse:** NeuralClusters — five talking clusters (agents hierarchy, read/write tools, MCP, connections with offline brand logos), real-event pulses, active-only fading labels ([33a6ce6](https://github.com/The-Stoical-Developers/cerebro_design_system/commit/33a6ce647629e404253a04f0648fb4122b93d52e))

## [1.0.2](https://github.com/The-Stoical-Developers/cerebro_design_system/compare/v1.0.1...v1.0.2) (2026-10-13)


### Bug Fixes

* **synapse:** emit explicit .js extensions in ESM dist so the package loads under plain Node/vitest ([2b143fa](https://github.com/The-Stoical-Developers/cerebro_design_system/commit/2b143face829a92b07ba448e60ee408fcabcaaae))

# Changelog

## [1.0.1](https://github.com/The-Stoical-Developers/cerebro_design_system/compare/v1.0.0...v1.0.1) (2026-10-13)

### Bug Fixes

* **synapse:** mark Cerebro components as client components so Next server pages can import the barrel (#3)

## 1.0.0 (2026-10-13)

### Features

* **synapse:** Cerebro Glass Pro components on top of @the-stoical-developers/ds-glass — Mascot, NeuralNet rings, Eisenhower, AgentCard, timelines, approvals, KPI odometers, activity feed (#2)
* **ci:** semantic-release + Artifact Registry publish for @cerebro/synapse

> First release cut manually following .releaserc.json (no self-hosted runner attached to this repo yet).
