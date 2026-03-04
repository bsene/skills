---
name: pnpm
description: >
  Use pnpm as the package manager in Node.js projects. Trigger this skill whenever the
  user mentions pnpm, asks how to install/add/remove packages with pnpm, wants to set up
  a pnpm workspace or monorepo, needs to configure pnpm-workspace.yaml, asks about
  pnpm-lock.yaml, wants to run scripts with pnpm, or is migrating from npm/yarn to pnpm.
  Also trigger when the user asks about fast installs, disk-efficient dependency management,
  strict package resolution, or monorepo tooling with shared dependencies (catalogs/workspaces).
---

# pnpm — Node.js Package Manager Skill

pnpm is a fast, disk-efficient package manager for Node.js. It uses a content-addressable
store so packages are never duplicated on disk. It is strict (packages can only access
declared dependencies), deterministic (lockfile: `pnpm-lock.yaml`), and has first-class
monorepo/workspace support.

---

## Installation

```bash
# Via npm (quickest way)
npm install -g pnpm

# Via standalone script (no Node.js required)
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Via Corepack (Node.js >= 16.13)
corepack enable
corepack prepare pnpm@latest --activate

# Via Homebrew (macOS/Linux)
brew install pnpm

# Via winget (Windows)
winget install -e --id pnpm.pnpm

# Verify installation
pnpm --version
```

Pin pnpm version per project (Corepack):
```bash
corepack use pnpm@latest    # writes "packageManager" field to package.json
```

---

## Core Commands

### Project initialization
```bash
pnpm init                   # create package.json (non-interactive)
```

### Installing dependencies
```bash
pnpm install                # install all deps from package.json / lockfile
pnpm install --frozen-lockfile   # CI: fail if lockfile would change
pnpm install --prod         # skip devDependencies
```

### Adding packages
```bash
pnpm add <pkg>              # add to dependencies
pnpm add -D <pkg>           # add to devDependencies
pnpm add -O <pkg>           # add to optionalDependencies
pnpm add -g <pkg>           # install globally
pnpm add <pkg>@<version>    # add specific version
pnpm add <pkg>@latest       # add latest version
```

### Removing packages
```bash
pnpm remove <pkg>           # remove from project
pnpm remove -g <pkg>        # remove global package
```

### Updating packages
```bash
pnpm update                 # update within declared version range
pnpm update --latest        # update to latest ignoring ranges
pnpm update <pkg>           # update specific package
```

### Running scripts
```bash
pnpm run <script>           # run a script from package.json
pnpm <script>               # shorthand (if no conflict with built-in)
pnpm run build
pnpm run dev
pnpm test                   # shorthand for pnpm run test
```

### Executing binaries
```bash
pnpm exec <bin>             # run a local bin (node_modules/.bin)
pnpm exec tsc --init

pnpm dlx <pkg> [args]       # like npx: fetch & run without installing
pnpm dlx create-react-app my-app
```

### Inspecting
```bash
pnpm list                   # list installed packages
pnpm list --depth=0         # top-level only
pnpm why <pkg>              # explain why a package is installed
pnpm outdated               # check for outdated packages
```

### Store management
```bash
pnpm store path             # show path to content-addressable store
pnpm store status           # check store integrity
pnpm store prune            # remove unreferenced packages from store
```

---

## Configuration — `.npmrc`

Project-level config lives in `.npmrc` at the repo root.

```ini
# .npmrc examples
auto-install-peers=true
strict-peer-dependencies=false
node-linker=hoisted          # use flat node_modules (npm-like, less strict)
shamefully-hoist=true        # hoist all packages (not recommended, last resort)
```

Key settings:
- `auto-install-peers` — automatically install peer dependencies (default: `true` in pnpm 8+)
- `strict-peer-dependencies` — error on unmet peer deps (default: `false`)
- `node-linker` — `isolated` (default, strict symlinks), `hoisted`, or `pnp`
- `public-hoist-pattern` — glob patterns of packages to hoist to root `node_modules`

---

## Workspaces (Monorepo)

A workspace requires `pnpm-workspace.yaml` at the repo root.

### `pnpm-workspace.yaml`
```yaml
packages:
  - 'packages/*'       # all direct subdirs of packages/
  - 'apps/*'           # all direct subdirs of apps/
  - 'components/**'    # nested subdirs
  - '!**/test/**'      # exclude test dirs
```

### workspace: protocol
Reference workspace packages in `package.json`:
```json
{
  "dependencies": {
    "@my/ui": "workspace:*",
    "@my/utils": "workspace:^1.0.0"
  }
}
```
`workspace:*` always uses the local version. On publish, pnpm converts it to the real version.

### Filtering (run commands in specific packages)
```bash
pnpm --filter <pkg-name> <command>
pnpm --filter @my/app build
pnpm --filter "./packages/**" test   # glob
pnpm --filter ...<pkg>               # pkg and its dependents
pnpm --filter <pkg>...               # pkg and its dependencies
```

### Recursive commands
```bash
pnpm -r install          # install in all workspace packages
pnpm -r run build        # build all packages
pnpm -r exec -- rm -rf dist   # run shell command in each package
```

### Adding workspace dependency
```bash
pnpm add @my/utils --filter @my/app
pnpm add @my/utils --workspace --filter @my/app  # force workspace resolution
```

---

## Catalogs (Shared Versions in Monorepo)

Catalogs let you define dependency versions once in `pnpm-workspace.yaml` and reuse them across all workspace packages — avoiding version drift.

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'

catalog:              # default catalog
  react: ^18.2.0
  typescript: ^5.4.0

catalogs:
  react17:
    react: ^17.0.2
    react-dom: ^17.0.2
  react18:
    react: ^18.3.0
    react-dom: ^18.3.0
```

Reference in `package.json`:
```json
{
  "dependencies": {
    "react": "catalog:",          // uses default catalog
    "react-dom": "catalog:react18"  // uses named catalog
  }
}
```

Add to catalog:
```bash
pnpm add react --save-catalog     # adds to default catalog
```

---

## Docker Best Practices

Use `pnpm fetch` to cache dependencies separately from source code:

```dockerfile
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
# Copy only lockfile first — layer cache valid until deps change
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch --prod

FROM deps AS build
COPY . .
RUN pnpm install -r --offline --prod

EXPOSE 3000
CMD ["node", "server.js"]
```

Key flags:
- `pnpm fetch` — populate virtual store from lockfile only (no `package.json` needed)
- `--offline` — install from store without network
- `--frozen-lockfile` — fail if lockfile is outdated (use in CI)

---

## Node.js Version Management

pnpm can manage Node.js versions (like `nvm`):

```bash
pnpm env use --global lts          # install and activate LTS
pnpm env use --global 20.0.0       # specific version
pnpm env use --global nightly
pnpm env list                      # list installed Node.js versions
pnpm env list --remote             # list available remote versions
pnpm env remove --global 18.0.0    # remove a version
```

Pin Node version per project via `.npmrc`:
```ini
# .npmrc
node-version=20.11.0
```
Or in `pnpm-workspace.yaml`:
```yaml
nodeVersion: '20.11.0'
```

---

## CI/CD

```bash
# Recommended CI install command — fails if lockfile is outdated
pnpm install --frozen-lockfile

# GitHub Actions setup
# uses: pnpm/action-setup@v4
# with:
#   version: 10
```

Example GitHub Actions step:
```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 10
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'
- run: pnpm install --frozen-lockfile
```

---

## Common Migration from npm/Yarn

| npm / Yarn | pnpm equivalent |
|---|---|
| `npm install` | `pnpm install` |
| `npm install <pkg>` | `pnpm add <pkg>` |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| `npm run <script>` | `pnpm run <script>` or `pnpm <script>` |
| `npx <cmd>` | `pnpm dlx <cmd>` |
| `npm ci` | `pnpm install --frozen-lockfile` |
| `yarn workspaces` | `pnpm --filter` / `pnpm -r` |

---

## Troubleshooting

**Phantom dependencies** — if code imports a package not listed in its own `package.json`, pnpm will correctly error. Fix: add the missing dep explicitly.

**Peer dependency errors** — set `auto-install-peers=true` in `.npmrc` or install peers manually with `pnpm add <peer-pkg>`.

**Need flat node_modules** (e.g., some tools require it):
```ini
# .npmrc
node-linker=hoisted
```

**Clear and rebuild**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm store prune
pnpm install
```

**pnpm broken after Node.js upgrade**:
```bash
npm install -g pnpm   # reinstall pnpm
```
