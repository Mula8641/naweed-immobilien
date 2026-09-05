# Decision Log

All architectural and technical decisions made during the build of this project, with reasoning.

---

## D-001 — PostgreSQL over SQLite

**Decision:** Use PostgreSQL (hosted on Supabase free tier) instead of SQLite.

**Reason:** SQLite is file-based. Free hosting platforms like Render use ephemeral filesystems — meaning the database file would be wiped on every redeploy. PostgreSQL on Supabase is persistent, free, and designed for this use case. SQLite would have been fine for local-only development but fails the moment we deploy.

**Trade-off:** Slightly more setup (connection string vs. file path), but worth it for data persistence.

---

## D-002 — Services layer between routes and DB

**Decision:** Business logic lives in `server/services/`, not in route handlers.

**Reason:** Route handlers that mix input parsing, DB queries, and response formatting become unmaintainable fast. By keeping routes thin (parse → call service → respond) and services focused (pure business logic), each file has one job. This also makes services independently testable.

---

## D-003 — Centralized API layer on the client

**Decision:** All `fetch()` calls live in `client/src/api/` — one file per domain (e.g. `invoices.js`, `auth.js`).

**Reason:** Scattering fetch calls across components means changing a single endpoint requires hunting through the entire codebase. A central `api/` layer means one place to update base URLs, headers, and error handling.

---

## D-004 — Custom hooks for data fetching

**Decision:** Components use custom hooks (e.g. `useInvoices()`) instead of calling `api/` directly.

**Reason:** Hooks encapsulate loading state, error state, and the data itself. Components stay clean — they only deal with rendering. Reusing data-fetching logic across multiple components becomes trivial.

---

## D-005 — JWT stored in httpOnly cookie (not localStorage)

**Decision:** JWT tokens are stored in httpOnly cookies, not localStorage.

**Reason:** localStorage is accessible from JavaScript, making it vulnerable to XSS attacks. An httpOnly cookie cannot be read by JS at all — only sent automatically by the browser on each request. For a property management app with sensitive invoice and contract data, this is the correct choice.

---

## D-006 — Vite over Create React App

**Decision:** Use Vite as the React build tool.

**Reason:** Create React App is no longer actively maintained. Vite is the current standard — faster dev server (HMR in milliseconds), smaller builds, and better plugin ecosystem. No practical downside.

---

## D-007 — Tailwind CSS for styling

**Decision:** Use Tailwind CSS, not a component library like MUI or Ant Design.

**Reason:** Component libraries add significant bundle weight and impose their own design language, making customization hard. Tailwind gives full control over the design with utility classes, resulting in a leaner, unique-looking UI. The learning curve is low once familiar with the class names.

---

## D-008 — react-i18next for EN/DE language support

**Decision:** Use `react-i18next` with `en.json` and `de.json` translation files.

**Reason:** Mature, well-documented library. Simple `t('key')` API, automatic language detection from browser, and supports switching at runtime without page reload. Translation files are plain JSON — easy for a non-developer to update.

---

## D-009 — pdfkit for server-side PDF generation

**Decision:** Generate invoice PDFs on the server using `pdfkit`, not in the browser.

**Reason:** Server-side generation means the PDF is consistent regardless of the user's browser or OS. It also keeps invoice formatting logic in one place. The client simply downloads a binary file via a protected endpoint.

---

## D-010 — multer for contract PDF uploads

**Decision:** Use `multer` middleware for handling contract PDF file uploads.

**Reason:** Standard, well-maintained Node.js library for multipart form data. Files are stored in the `server/uploads/` directory with UUIDs as filenames to avoid collisions and prevent filename-based attacks.

---

## D-011 — Numbered SQL migration files

**Decision:** Database schema changes are tracked as numbered files in `server/db/migrations/` (e.g. `001_initial_schema.sql`).

**Reason:** A single `schema.sql` that gets re-run would wipe data every time. Numbered migrations apply incrementally and are a standard industry pattern for managing schema evolution safely.

---

## D-012 — Global error handler middleware

**Decision:** A single `errorHandler.js` middleware catches all errors and returns a consistent `{ error: "message" }` JSON response.

**Reason:** Without a global handler, each route needs its own try/catch with its own response format. One handler means consistent error responses, easier client-side error handling, and no duplicated code.

---
