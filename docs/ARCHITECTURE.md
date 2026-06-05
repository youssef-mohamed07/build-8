# Build8 Architecture

## Overview

Build8 is a single-tenant internal business management system built with clean architecture principles and feature-based modules. It is designed exclusively for Build8 founders and team members — not as a SaaS product.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + Shadcn UI |
| Animation | Framer Motion |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | Auth.js (NextAuth v5) |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Charts | Recharts |

## Folder Structure

```
build8/
├── docs/                          # Architecture & deployment docs
├── prisma/
│   ├── schema.prisma              # Complete database schema
│   ├── seed.ts                    # RBAC + founder seed data
│   └── migrations/                # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/                # Public auth routes
│   │   │   ├── login/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/           # Protected app routes
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── leads/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── people/
│   │   │   ├── talent-pool/
│   │   │   ├── finance/
│   │   │   ├── quotations/
│   │   │   ├── invoices/
│   │   │   ├── reports/
│   │   │   ├── documents/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/  # Auth.js handlers
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # Shadcn primitives
│   │   ├── layout/                # Sidebar, Header, PageHeader
│   │   ├── dashboard/             # Dashboard widgets
│   │   ├── shared/                # DataTable, EmptyState
│   │   └── providers/             # ThemeProvider
│   ├── features/                  # Feature modules (domain logic + UI)
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── leads/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── people/
│   │   ├── candidates/
│   │   ├── finance/
│   │   ├── quotations/
│   │   ├── invoices/
│   │   ├── documents/
│   │   ├── reports/
│   │   └── settings/
│   ├── lib/
│   │   ├── auth.ts                # Auth.js config
│   │   ├── prisma.ts              # Prisma singleton
│   │   ├── utils.ts               # Utilities
│   │   ├── rbac/                  # Permissions & checks
│   │   └── validations/           # Zod schemas
│   ├── server/
│   │   ├── actions/               # Server Actions (API layer)
│   │   ├── services/              # Business logic
│   │   └── repositories/          # Data access (optional)
│   ├── stores/                    # Zustand stores
│   ├── types/                     # TypeScript types
│   └── middleware.ts              # Auth middleware
└── .env.example
```

## Clean Architecture Layers

```
┌─────────────────────────────────────────────┐
│  Presentation (app/, components/, features/) │
├─────────────────────────────────────────────┤
│  Application (server/actions/, stores/)      │
├─────────────────────────────────────────────┤
│  Domain (server/services/, lib/validations/) │
├─────────────────────────────────────────────┤
│  Infrastructure (lib/prisma.ts, lib/auth.ts) │
└─────────────────────────────────────────────┘
```

## API Architecture

Build8 uses **Server Actions** as the primary API layer. No REST API routes except Auth.js.

### Request Flow

```
Client Component
    ↓
Server Action (server/actions/*.actions.ts)
    ↓
RBAC Check (lib/rbac/check-permission.ts)
    ↓
Validation (lib/validations/*.ts)
    ↓
Service Layer (server/services/*.service.ts)
    ↓
Prisma ORM (lib/prisma.ts)
    ↓
PostgreSQL
```

### Server Actions Structure

| Module | Action File | Key Functions |
|--------|------------|---------------|
| Auth | `auth.actions.ts` | login, logout, forgotPassword, resetPassword |
| Dashboard | `dashboard.actions.ts` | getDashboardStats, getMonthlyFinancialData |
| Clients | `clients.actions.ts` | getClients, createClient, updateClient, deleteClient |
| Leads | `leads.actions.ts` | getLeads, createLead, updateLeadStage |
| Projects | `projects.actions.ts` | getProjects, createProject, assignMember |
| Tasks | `tasks.actions.ts` | getTasks, createTask, updateTaskStatus |
| People | `people.actions.ts` | getPeople, createPerson, updatePerson |
| Candidates | `candidates.actions.ts` | getCandidates, updateStage |
| Finance | `finance.actions.ts` | getRevenues, createExpense, getProfitDistribution |
| Quotations | `quotations.actions.ts` | createQuotation, generatePDF |
| Invoices | `invoices.actions.ts` | createInvoice, markPaid, generatePDF |
| Documents | `documents.actions.ts` | uploadDocument, searchDocuments |
| Reports | `reports.actions.ts` | generateReport, exportPDF |
| Settings | `settings.actions.ts` | getSettings, updateSettings, manageRoles |

### Action Result Pattern

All server actions return a consistent `ActionResult<T>` type:

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

## Security

- JWT session strategy via Auth.js
- RBAC enforced at server action level
- Middleware protects all dashboard routes
- Password hashing with bcrypt (12 rounds)
- No multi-tenancy — single organization scope
- Input validation with Zod on all mutations

## Dashboard UI Layout

```
┌──────────┬──────────────────────────────────────────────┐
│          │  Header (search, notifications, theme, user) │
│ Sidebar  ├──────────────────────────────────────────────┤
│          │                                              │
│ Dashboard│  Page Content                                │
│ Clients  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│ Leads    │  │ Stat 1 │ │ Stat 2 │ │ Stat 3 │ │ Stat 4 ││
│ Projects │  └────────┘ └────────┘ └────────┘ └────────┘│
│ Tasks    │  ┌──────────────────────┐ ┌───────────────┐ │
│ ...      │  │   Revenue Chart      │ │ Activity Feed │ │
│          │  └──────────────────────┘ └───────────────┘ │
│ Settings │  ┌─────────────────────────────────────────┐│
│          │  │         Founder Earnings Panel          ││
└──────────┴──┴─────────────────────────────────────────┴┘
```

Design tokens follow Linear/Vercel aesthetic: neutral palette, subtle borders, backdrop blur header, collapsible sidebar with Framer Motion transitions.
