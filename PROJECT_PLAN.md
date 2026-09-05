# Property Management Website — Implementation Plan

## Context

Build a full-stack property management web app for a real-estate owner managing two building complexes. The site serves two audiences: the public (browse properties, FAQs) and authenticated users. Tenants get a personal dashboard with invoices and contracts. The admin manages everything — properties, tenants, invoices, and contracts — from a central dashboard. The goal is to replace hours of manual admin work.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Fast dev, clean component model |
| Routing | React Router v6 | SPA with protected routes |
| Styling | Tailwind CSS | Utility-first, fast to build |
| i18n | react-i18next | EN/DE language switcher |
| Backend | Node.js + Express | Familiar, lightweight |
| Database | SQLite (via `better-sqlite3`) | File-based, zero config, perfect for this scale |
| Auth | JWT + bcrypt | Stateless tokens, secure password hashing |
| PDF generation | `pdfkit` | Invoice PDFs generated server-side |
| File uploads | `multer` | Contract PDF uploads |

---

## Project Structure

```
naweed-proj/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── i18n/               # EN + DE translation files
│   │   ├── components/         # Shared UI (Navbar, LanguageSwitcher, etc.)
│   │   ├── pages/
│   │   │   ├── public/         # Home, Properties, FAQ, Login
│   │   │   ├── tenant/         # Dashboard, Invoices, Contract
│   │   │   └── admin/          # Dashboard, Users, Properties, Invoices
│   │   ├── context/            # AuthContext (JWT storage + role)
│   │   └── App.jsx             # Routes + protected route wrappers
│   └── vite.config.js
├── server/
│   ├── db/
│   │   ├── schema.sql          # Table definitions
│   │   └── db.js               # better-sqlite3 connection
│   ├── routes/
│   │   ├── auth.js             # POST /login
│   │   ├── properties.js       # GET buildings/units (public + admin CRUD)
│   │   ├── invoices.js         # GET/POST/PATCH invoices + PDF download
│   │   ├── contracts.js        # GET/POST contract upload + download
│   │   ├── users.js            # Admin: list/create/delete tenants
│   │   └── faq.js              # GET/POST/DELETE FAQs
│   ├── middleware/
│   │   ├── auth.js             # JWT verify middleware
│   │   └── requireAdmin.js     # Role check middleware
│   ├── pdf/
│   │   └── generateInvoice.js  # pdfkit invoice builder
│   └── index.js                # Express entry point
├── uploads/                    # Contract PDFs stored here (git-ignored)
└── package.json
```

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tenant',   -- 'tenant' | 'admin'
  unit_id INTEGER REFERENCES units(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Buildings
CREATE TABLE buildings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT
);

-- Units (apartments within a building)
CREATE TABLE units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_id INTEGER NOT NULL REFERENCES buildings(id),
  unit_number TEXT NOT NULL,
  floor INTEGER,
  rent_amount REAL NOT NULL,
  is_available INTEGER NOT NULL DEFAULT 1,  -- 0 = occupied
  description TEXT
);

-- Invoices (Rechnungen)
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES users(id),
  month INTEGER NOT NULL,   -- 1-12
  year INTEGER NOT NULL,
  rent_amount REAL NOT NULL,
  extras TEXT,              -- JSON: [{label, amount}] for Nebenkosten etc.
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',  -- 'paid' | 'unpaid'
  generated_at TEXT DEFAULT (datetime('now')),
  paid_at TEXT
);

-- Contracts
CREATE TABLE contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES users(id),
  filename TEXT NOT NULL,   -- stored filename in /uploads
  uploaded_at TEXT DEFAULT (datetime('now'))
);

-- FAQs
CREATE TABLE faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_en TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  question_de TEXT NOT NULL,
  answer_de TEXT NOT NULL
);
```

---

## Pages & Features

### Public (no login)
| Page | Content |
|---|---|
| `/` Home | Hero, overview, call-to-action to browse |
| `/properties` | Two buildings; units listed with rent, floor, availability badge |
| `/faq` | Accordion FAQ list (EN/DE) |
| `/login` | Email + password form; redirects to tenant or admin dashboard |

### Tenant Dashboard (role: tenant)
| Page | Content |
|---|---|
| `/dashboard` | Welcome, unit info, payment status summary |
| `/dashboard/invoices` | List of all Rechnungen; download PDF button per invoice |
| `/dashboard/contract` | Download their contract PDF |

### Admin Dashboard (role: admin)
| Page | Content |
|---|---|
| `/admin` | Stats: total tenants, outstanding invoices, occupancy |
| `/admin/users` | Table of tenants; create new (name, email, temp password, assign unit); delete |
| `/admin/properties` | Add/edit/remove buildings and units; set rent, availability |
| `/admin/invoices` | Generate invoice for a tenant (month, rent, extras); mark paid/unpaid; download PDF |
| `/admin/contracts` | Upload contract PDF per tenant; view existing |
| `/admin/faq` | Add/edit/delete FAQ entries (EN + DE fields) |

---

## API Endpoints

```
POST   /api/auth/login

GET    /api/properties/buildings          # public
GET    /api/properties/units/:buildingId  # public
POST   /api/properties/buildings          # admin
POST   /api/properties/units             # admin
PATCH  /api/properties/units/:id         # admin
DELETE /api/properties/units/:id         # admin

GET    /api/invoices/my                  # tenant: own invoices
GET    /api/invoices/my/:id/pdf          # tenant: download invoice PDF
GET    /api/invoices                     # admin: all invoices
POST   /api/invoices                     # admin: generate new invoice
PATCH  /api/invoices/:id/status          # admin: mark paid/unpaid
GET    /api/invoices/:id/pdf             # admin: download any invoice PDF

GET    /api/contracts/my                 # tenant: their contract
GET    /api/contracts/my/download        # tenant: download contract PDF
GET    /api/contracts                    # admin: all contracts
POST   /api/contracts/:tenantId          # admin: upload contract (multer)

GET    /api/users                        # admin: all tenants
POST   /api/users                        # admin: create tenant
DELETE /api/users/:id                    # admin: delete tenant

GET    /api/faq                          # public
POST   /api/faq                          # admin
DELETE /api/faq/:id                      # admin
```

---

## Implementation Order

1. **Server setup** — Express, SQLite, schema, seed one admin user
2. **Auth** — login endpoint, JWT middleware, requireAdmin middleware
3. **Properties API + public pages** — buildings/units CRUD + React Properties page
4. **FAQ API + page** — simple CRUD + accordion UI
5. **User management** — admin create/delete tenant, assign unit
6. **Invoice system** — generate invoice, pdfkit PDF, status toggle
7. **Contract upload** — multer upload, tenant download
8. **Tenant dashboard** — invoices list, contract download, unit info
9. **Admin dashboard** — stats overview, all management pages
10. **i18n (EN/DE)** — wrap all UI strings in `t()`, add translation files
11. **Polish** — responsive layout, error states, loading spinners

---

## Verification

- Start server (`node server/index.js`) and client (`vite`) side by side
- Log in as admin → create a tenant, assign a unit
- Log in as that tenant → see correct unit, no admin routes accessible
- Admin generates an invoice → tenant sees it and can download the PDF
- Admin uploads contract → tenant can download it
- Toggle language switcher → all text switches EN ↔ DE
- Public property page shows availability correctly after admin edits a unit
