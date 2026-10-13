// Post-build: add explicit .js / /index.js to relative ESM specifiers in dist
// so the package works under plain Node ESM / vitest, not only bundlers.
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
const root = resolve(process.argv[2] ?? "dist");
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const re = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']+)\2/g;
let n = 0;
for (const file of walk(root).filter((f) => /\.(js|d\.ts)$/.test(f))) {
  const src = readFileSync(file, "utf8");
  const out = src.replace(re, (m, pre, q, spec) => {
    if (/\.(m?js|json|css)$/.test(spec)) return m;
    const base = resolve(dirname(file), spec);
    let fixed = null;
    if (existsSync(base + ".js")) fixed = spec + ".js";
    else if (existsSync(join(base, "index.js"))) fixed = spec + "/index.js";
    if (!fixed) return m;
    n++;
    return pre + q + fixed + q;
  });
  if (out !== src) writeFileSync(file, out);
}
console.log(`fix-esm-extensions: rewrote ${n} specifiers in ${root}`);
