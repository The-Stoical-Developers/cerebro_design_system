# Consuming `@cerebro/synapse`

> **Note:** integration with `Cerebro_frontend` is a follow-up phase. This document
> describes how a consumer (Next.js, Vite, etc.) will use the package once it is wired.

## Install

Install from the git monorepo using the `path:` sub-package syntax. Replace
`<tag>` with the desired release tag or commit SHA.

```bash
npm install 'github:The-Stoical-Developers/cerebro_design_system#<tag>&path:synapse/ts'
# or with pnpm
pnpm add 'github:The-Stoical-Developers/cerebro_design_system#<tag>&path:synapse/ts'
```

The `prepare` script runs `tsc` and builds `dist/` automatically on install.

## Tailwind setup

The consumer must already use **Tailwind CSS v3**. Add the Synapse preset to
`tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  presets: [require("@cerebro/synapse/tailwind.preset")],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
```

Import the theme CSS at the top of the global stylesheet (before Tailwind):

```css
@import "@cerebro/synapse/synapse_theme.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Dark mode

Toggle the `.dark` class on `<html>` (or any wrapper). The CSS variables defined in
`synapse_theme.css` switch automatically.

## Use components

```tsx
import { SynButton, SynCard, SynCardContent } from "@cerebro/synapse/react";

export default function Page() {
  return (
    <SynCard>
      <SynCardContent>
        <SynButton>Action</SynButton>
      </SynCardContent>
    </SynCard>
  );
}
```

## Use tokens

```ts
import { SynapseColors } from "@cerebro/synapse";

console.log(SynapseColors.primary); // #3C50E0
```

## Docker / CI builds

The package is fetched from GitHub, so the build stage needs `git` and a token if
the repository is private. Example Dockerfile fragment:

```dockerfile
RUN apk add --no-cache git
RUN --mount=type=secret,id=gh_token \
    git config --global url."https://x-access-token:$(cat /run/secrets/gh_token)@github.com/".insteadOf "git@github.com:" && \
    npm install --legacy-peer-deps
```

Build with: `docker build --secret id=gh_token,src=<(echo $GH_TOKEN) .`

## Flutter

Cerebro's design system is web-only; there is no Flutter package in this repo.
See `PeonIA/peonia_design_system` for the equivalent Flutter architecture.
