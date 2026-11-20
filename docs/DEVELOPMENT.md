# LifeFlow Development & Contribution Guide

This guide covers setup instructions, development workflows, testing practices, and architecture guidelines for LifeFlow.

---

## 1. Prerequisites

Before setting up LifeFlow locally, ensure you have:
- **Operating System**: Windows 10 or Windows 11 (64-bit).
- **Node.js**: Version 22.x LTS or higher (required for native `node:sqlite`).
- **Package Manager**: `pnpm` (recommended) or `npm`.
- **Git**: Installed and configured.

---

## 2. Setup & Installation

Clone the repository and install project dependencies:

```bash
# Clone repository
git clone https://github.com/GiovanyGeorge/to_do_list.git
cd to_do_list

# Install packages
pnpm install
```

---

## 3. Available Scripts

All scripts are defined in `package.json`:

| Command | Action |
| :--- | :--- |
| `pnpm run dev` | Starts the Vite development server and launches Electron with live hot-reloading. |
| `pnpm run build` | Compiles TypeScript, bundles frontend assets with Vite, and runs `electron-builder` to produce the Windows NSIS installer and unpacked directory. |
| `pnpm run build:vite` | Compiles TypeScript and runs Vite production build (without running electron-builder). |
| `pnpm test` | Runs the full Vitest automated test suite once. |
| `pnpm run test:watch` | Runs Vitest in interactive watch mode for test-driven development. |
| `pnpm run lint` | Performs strict TypeScript type checks across the entire codebase (`tsc --noEmit`). |

---

## 4. Development Workflow

### Starting the Application
```bash
pnpm run dev
```
This starts:
1. A Vite HTTP development server on `http://localhost:5173`.
2. Electron main process pointing to the local dev server.

### State & Routing Architecture
- Always use `HashRouter` for routing. Standard web `BrowserRouter` is incompatible with production desktop environments running from local `file://` protocols.
- UI state is managed with Zustand in `src/store/`. When updating state that requires database persistence, invoke the typed `window.electronAPI` bridge methods.

---

## 5. Database & Migrations

The database resides in:
- **Development**: `.lifeflow-data/lifeflow.db` (in project root)
- **Production**: `%APPDATA%/lifeflow/data/lifeflow.db`

### Adding a New Migration
1. Create a sequentially numbered SQL file in `database/migrations/`:
   ```
   database/migrations/006_feature_name.sql
   ```
2. Write declarative `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE` statements.
3. Update the TypeScript interfaces in `shared/types/database.ts`.
4. Create or update the corresponding repository in `database/repositories/`.
5. Register IPC handlers in `electron/ipc/` and update `shared/types/ipc.ts` and `electron/preload.ts`.

---

## 6. Testing Strategy

LifeFlow uses **Vitest** for automated unit and integration tests. All 12 test suites are located in `tests/`:

```bash
pnpm test
```

### Writing Tests
- Use in-memory SQLite instances (`new Database(":memory:")`) so tests remain atomic, reproducible, and fast without leaving filesystem artifacts.
- Execute `runMigrations(db)` in `beforeEach` hooks to guarantee realistic schema states.

---

## 7. Building & Packaging

To create production executables:

```bash
pnpm run build
```

This generates:
- **NSIS Installer**: `release/LifeFlow Setup 1.0.0.exe` (installs the app and creates desktop & start menu shortcuts).
- **Portable Unpacked Folder**: `release/win-unpacked/` (contains `LifeFlow.exe` ready to execute directly).

### Packaging Configuration (`electron-builder.json`)
Important assets bundled into `extraResources`:
- `database/migrations` (SQL migration scripts).
- `database/svd.sqlite` (public domain Smith & Van Dyke 1865 translation).
- `database/psalmsSplit.json` (Psalm superscription separation mapping).

---

## 8. Code Guidelines & Standards

- **TypeScript**: Strict typechecking is enabled. Avoid `any` types; prefer explicit types in `shared/types/`.
- **Styling**: Adhere strictly to the Paper-Like Warm Cream design system tokens (`#FAF7F2` background, `#FFFFFF` cards, `#C2410C` terracotta accents, `#1C1917` text).
- **Localization**: Never hardcode user-facing strings. Add keys to both `src/locales/en/translation.json` and `src/locales/ar/translation.json`.
- **RTL Support**: Always use logical Tailwind utilities (e.g. `rtl:right-auto rtl:left-6`, `ps-4`, `pe-4`) to ensure natural bidirectional mirroring.
