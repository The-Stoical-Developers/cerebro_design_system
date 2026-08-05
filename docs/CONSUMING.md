# Consuming `@cerebro/synapse`

`Cerebro_frontend` already consumes this package (see `package.json`). This document
describes the current integration mechanism.

## Install

The package is consumed via a local `file:` dependency, not the npm registry and not a
git submodule. This **requires `cerebro_design_system` to be checked out as a sibling
directory** next to the consuming repo (both under the same parent folder), e.g.:

```
Repos/
├── Cerebro_frontend/
└── cerebro_design_system/
```

Add it to the consumer's `package.json`:

```json
{
  "dependencies": {
    "@cerebro/synapse": "file:../cerebro_design_system/synapse/ts"
  }
}
```

Then run `npm install`. The `prepare` script (`npm run build`, which runs
`tsc --project tsconfig.build.json`) executes automatically during install and
builds `dist/`.

> **Not yet implemented:** installing directly from GitHub with the
> `github:<org>/cerebro_design_system#<tag>&path:synapse/ts` syntax. No consumer in
> this codebase uses that mechanism today; do not rely on it until it is set up.

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

Because the dependency is a local `file:` reference to a sibling directory, the
`cerebro_design_system` checkout must be present in the Docker build context (or
otherwise copied in) alongside the consumer's source before `npm install` runs.
There is no GitHub fetch involved.

## Flutter

Cerebro's design system is web-only; there is no Flutter package in this repo.
See `PeonIA/peonia_design_system` for the equivalent Flutter architecture.
