# Technology Stack

**Analysis Date:** 2026-08-16

## Languages

**Primary:**
- Python 3 (version not pinned) - asynchronous REST backend in `backend/app/`.
- JavaScript (ES modules, version not pinned) - React single-page application in `src/` and Vite configuration at `vite.config.js`.
- Rust (edition/version defined by the nested Codex workspace, not inspected exhaustively) - the separately maintained Codex CLI fork under `codex/codex-rs/`, intended to wrap backend functions as tool handlers according to `backend/docs/PRD.md`.

**Secondary:**
- JSON - frontend dependencies and i18n resources in `package.json`, `src/i18n/en.json`, and `src/i18n/hi.json`.
- CSS - global frontend styles in `src/index.css`, with Tailwind CSS compiled through `vite.config.js`.

## Runtime

**Environment:**
- Node.js version not constrained by the application manifest; frontend lockfile is npm lockfile v3 at `package-lock.json`.
- Python version not constrained by `backend/requirements.txt`; the backend is served with Uvicorn.
- The nested Codex fork requires Node `>=22` and pnpm `>=10.33.0` in `codex/package.json`; it is a separate monorepo from the Vite application.

**Package Manager:**
- npm - frontend package manager, evidenced by `package-lock.json` (present).
- pip-compatible requirements installation - backend dependencies pinned in `backend/requirements.txt` (no Python lockfile detected).
- pnpm 10.33.0 - nested Codex workspace only, with `codex/pnpm-lock.yaml` present.

## Frameworks

**Core:**
- React 19.2.8 - browser UI, bootstrapped by `src/main.jsx` and composed in `src/App.jsx`.
- React Router DOM 7.18.2 - frontend routing in `src/routes/index.jsx`.
- FastAPI 0.141.1 - async REST API in `backend/app/main.py`.
- Beanie 2.0.0 - asynchronous MongoDB ODM used by document models in `backend/app/models/`.
- Motor 3.7.1 / PyMongo 4.17.0 - MongoDB driver stack initialized in `backend/app/core/database.py`.
- Pydantic 2.13.4 / pydantic-settings 2.15.0 - API schemas in `backend/app/schemas/` and configuration in `backend/app/core/config.py`.

**Testing:**
- Not detected. No frontend or backend test runner configuration or test files are present outside the embedded `codex/` repository.

**Build/Dev:**
- Vite 8.2.1 (locked) - frontend development server and production build through `package.json` scripts and `vite.config.js`.
- `@vitejs/plugin-react` 6.0.4 - React transform support in `vite.config.js`.
- Tailwind CSS 4.3.3 and `@tailwindcss/vite` 4.3.3 - utility CSS integration configured in `vite.config.js`.
- ESLint 10.8.0 - JavaScript/JSX linting configured in `eslint.config.js`.
- Uvicorn 0.52.3 - ASGI server dependency for `backend/app/main.py`; no committed backend launch script or deployment manifest is present.

## Key Dependencies

**Critical:**
- `fastapi==0.141.1` - exposes the central reference-data REST interface from `backend/app/main.py` and `backend/app/routers/`.
- `beanie==2.0.0` - maps central-reference collections in `backend/app/models/` to MongoDB.
- `motor==3.7.1` - async Mongo client used by `backend/app/core/database.py`.
- `pydantic-settings==2.15.0` - loads the backend Mongo configuration from `.env` via `backend/app/core/config.py`.
- `react==19.2.8` and `react-dom==19.2.8` - render the web client from `src/main.jsx`.
- `i18next==26.3.6` and `react-i18next==17.0.11` - localization runtime configured in `src/i18n/index.js`.

**Infrastructure:**
- `fastapi.middleware.cors.CORSMiddleware` - development cross-origin access in `backend/app/main.py`.
- `framer-motion==13.1.0`, `lucide-react==1.31.0`, and `recharts==3.10.1` - UI motion, icons, and charts used by files in `src/`.
- `python-dotenv==1.2.2` - installed backend environment-file support; settings loading is performed by `pydantic-settings` in `backend/app/core/config.py`.

## Configuration

**Environment:**
- Backend settings are defined in `backend/app/core/config.py`; set `MONGODB_URL` and `DATABASE_NAME` in `backend/.env` (or the process environment). Both have development defaults of `mongodb://localhost:27017` and `kisansathi`.
- `.env` is ignored by `.gitignore`; no environment file is committed or read during this audit.
- No frontend `VITE_*` runtime configuration, backend API base URL, external-service credential, or actor/webhook configuration is currently declared in tracked application files.

**Build:**
- Frontend configuration: `vite.config.js` and `eslint.config.js`.
- Frontend commands in `package.json`: `npm run dev`, `npm run build`, `npm run lint`, and `npm run preview`.
- Backend dependencies: `backend/requirements.txt`; launch and deployment configuration are not committed.
- Nested Codex workspace configuration: `codex/package.json`, `codex/pnpm-lock.yaml`, and `codex/codex-rs/Cargo.toml`.

## Platform Requirements

**Development:**
- Node.js with npm to run the Vite client from the repository root.
- Python with packages from `backend/requirements.txt`, plus a reachable MongoDB instance to start `backend/app/main.py` successfully.
- Rust/Cargo plus Node.js 22+ and pnpm 10.33.0+ are required only when modifying or building the embedded Codex CLI fork in `codex/`.

**Production:**
- Hosting target: Not detected. The backend requires an ASGI host and MongoDB; the frontend requires static hosting for Vite build output.
- The PRD specifies later internal REST-to-Rust tool wrapping between `backend/` and `codex/`, but no custom KisanSathi handler exists under `codex/codex-rs/` at present.

---

*Stack analysis: 2026-08-16*
