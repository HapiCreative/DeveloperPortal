# Developer Portal — Design Document

**Date:** March 27, 2026
**Status:** Draft
**Document Type:** Technical Design Specification

---

## 1. Overview

### 1.1 Purpose

Build a custom developer portal that serves as the single entry point for both external third-party developers and internal engineering teams to discover products, read documentation, follow guides, and manage their API integrations.

### 1.2 Goals

- Provide a searchable, filterable product catalog for 10+ products
- Deliver per-product documentation powered by OpenAPI v3 specs
- Offer task-oriented guides organized by journey stage and difficulty
- Support authenticated features: API key management, usage dashboards, feedback, and changelogs
- Achieve a Stripe/Twilio-quality developer experience with zero vendor costs

### 1.3 Audience

| Audience | Access Level | Primary Use |
|----------|-------------|-------------|
| External developers | Public content + authenticated features | Discover products, integrate APIs, manage keys |
| External partners | Public + partner-restricted content | Access partner-only APIs and guides |
| Internal engineers | Full access including internal-only products | Reference docs, internal tools, pre-release APIs |
| Internal relationship managers | Full access + partner management | Manage one or more partner accounts, control partner access to products, monitor partner usage and onboarding |

---

## 2. Technology Stack

### 2.1 Core Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js (App Router) | Maximum flexibility, SSR for SEO, React-based, full design control |
| **API Reference** | Scalar (@scalar/api-reference-react) | Best open-source UI/UX, native React, built-in "Try It" console, highly customizable |
| **Content** | MDX (Markdown + JSX) | Docs and guides as code in the repo, supports React components inline |
| **Database** | PostgreSQL | Familiar, robust, handles all persistent data needs |
| **ORM** | Prisma | Type-safe database access, migrations, excellent DX with PostgreSQL |
| **Authentication** | NextAuth.js (Auth.js v5) | Free, flexible, supports SSO for internal + standard signup for external |
| **Search** | Pagefind (client-side) | Fully free, no third-party dependency, indexes static + MDX content at build time |
| **Hosting** | Vercel or self-hosted | Free tier for Vercel, or deploy to your own infrastructure |
| **Styling** | Tailwind CSS | Utility-first, consistent design system, works perfectly with Next.js |

### 2.2 OpenAPI v3 Integration — Scalar

Scalar was chosen over Swagger UI, Redoc, and Stoplight Elements based on a detailed evaluation:

- **Native React component** (`@scalar/api-reference-react`) drops directly into Next.js pages
- **Built-in "Try It" API client** — the most powerful interactive console of all open-source options, with authentication support
- **Highly customizable** — CSS injection, multiple layout themes (default, modern), deep branding control
- **Most actively developed** — adopted by .NET, Hono, Fastify as default OpenAPI UI
- **Full OpenAPI v3 support** — 3.0, 3.1, and Swagger 2.0
- **Dark mode built-in** — toggles with the portal's theme
- **MIT licensed** — no cost, no vendor lock-in

Each product's API reference page renders its OpenAPI v3 spec through Scalar, auto-generating endpoint listings, request/response schemas, authentication requirements, and the interactive testing console.

---

## 3. Information Architecture

The portal is organized around three core pillars:

### 3.1 Product Catalog ("What we offer")

The searchable, filterable directory of all products.

**Catalog Landing Page:**

- Hero section with value proposition and prominent search bar
- Category-based grouping (by business domain/use case, not internal team structure)
- Filter sidebar: category, interaction type (API, SDK, CLI), status (GA, Beta, Coming Soon), use case
- Card-based product tiles: name, one-line description, status badge, icon, quick-action links

**Individual Product Page (one per product):**

- Product overview: "what it does and why you'd use it"
- "Get Started" CTA linking to the quickstart guide
- Tabbed navigation into relevant sections: API Reference, SDKs & Libraries, CLI Tools, Webhooks (only showing tabs relevant to that product)
- 2-3 use-case examples showing what developers can build
- Version indicator and changelog link
- Status/availability info (regions, environments, rate limits)

### 3.2 Documentation ("The reference")

Per-product technical reference documentation.

**Per-Product Doc Structure:**

- **Quickstart** — "Zero to first API call" in under 5 minutes
- **API Reference** — Auto-generated from OpenAPI v3 spec via Scalar, including endpoints, parameters, request/response examples, error codes, authentication
- **SDK Reference** — Per-language installation, initialization, method docs
- **CLI Reference** — Command list with flags, options, examples
- **Webhook Reference** — Event types, payload schemas, signature verification, retry behavior

**Documentation UX:**

- Three-column layout (Scalar default): left nav, center content, right code examples
- Persistent language switcher (Python, Node, Java, Go, etc.) — all code examples switch globally
- Copy-to-clipboard on every code block
- Interactive "Try It" API explorer via Scalar (make real calls with test keys)
- Dark/light mode toggle
- Breadcrumb navigation (critical with 10+ products)
- Version selector dropdown with deprecation warnings

### 3.3 Guides ("The how")

Task-oriented content organized by developer journey.

**Guides Landing Page:**

- Organized by journey stage: "Getting Started," "Core Concepts," "Common Use Cases," "Advanced Patterns"
- Each guide titled as an action: "Set up webhooks," "Authenticate with OAuth," "Handle pagination"
- Cross-product guides for multi-product scenarios
- Difficulty tags: Beginner, Intermediate, Advanced
- Estimated reading/completion time per guide

---

## 4. Database Design (PostgreSQL)

### 4.1 Schema Overview

The database stores all dynamic/authenticated data. Content (docs, guides) lives as MDX in the repo.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CORE ENTITIES                            │
├─────────────────────────────────────────────────────────────────┤
│  users              │  User accounts (external + internal)      │
│  organizations      │  Company/team groupings                   │
│  products           │  Product catalog metadata                 │
│  product_categories │  Category taxonomy                        │
├─────────────────────────────────────────────────────────────────┤
│                   PARTNER MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────┤
│  partner_assignments│  Maps relationship managers to partners   │
│  partner_product_access│ Controls which products partners access│
├─────────────────────────────────────────────────────────────────┤
│                     API KEY MANAGEMENT                          │
├─────────────────────────────────────────────────────────────────┤
│  api_keys           │  Keys with environment labels             │
│  api_key_scopes     │  Per-key product/permission scopes        │
├─────────────────────────────────────────────────────────────────┤
│                     USAGE & ANALYTICS                           │
├─────────────────────────────────────────────────────────────────┤
│  api_usage_logs     │  Request counts, errors, latency          │
│  usage_daily_rollup │  Pre-aggregated daily stats               │
├─────────────────────────────────────────────────────────────────┤
│                     FEEDBACK & CHANGELOGS                       │
├─────────────────────────────────────────────────────────────────┤
│  doc_feedback       │  "Was this helpful?" + comments per page  │
│  changelogs         │  Per-product changelog entries             │
│  changelog_tags     │  Tags: feature, bugfix, deprecation, etc. │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Key Tables

**users**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| email | VARCHAR(255) | Unique |
| name | VARCHAR(255) | |
| role | ENUM | `external`, `partner`, `internal`, `relationship_manager`, `admin` |
| org_id | UUID (FK) | Nullable, references organizations |
| auth_provider | VARCHAR(50) | `credentials`, `github`, `google`, `sso` |
| created_at | TIMESTAMP | |
| last_login_at | TIMESTAMP | |

**partner_assignments** (maps relationship managers to partner organizations)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| manager_id | UUID (FK) | References users (role = `relationship_manager`) |
| partner_org_id | UUID (FK) | References organizations (the partner company) |
| status | ENUM | `active`, `inactive` |
| notes | TEXT | Internal notes about the partnership |
| assigned_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

A single relationship manager can be assigned to multiple partner organizations, and a partner organization can have multiple relationship managers if needed. This table is the source of truth for "who manages whom."

**partner_product_access** (controls which products each partner can access)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| partner_org_id | UUID (FK) | References organizations |
| product_id | UUID (FK) | References products |
| granted_by | UUID (FK) | References users (the relationship manager who granted access) |
| access_level | ENUM | `read_docs`, `test_sandbox`, `full_production` |
| granted_at | TIMESTAMP | |
| expires_at | TIMESTAMP | Nullable, for time-limited access |

Unique constraint on `(partner_org_id, product_id)`. Relationship managers grant their partners access to specific products at specific levels, providing fine-grained control beyond the simple `partner` visibility flag on products.

**products**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| slug | VARCHAR(100) | Unique, URL-friendly |
| name | VARCHAR(255) | Display name |
| description | TEXT | Short description for catalog cards |
| category_id | UUID (FK) | References product_categories |
| status | ENUM | `ga`, `beta`, `coming_soon`, `deprecated` |
| visibility | ENUM | `public`, `partner`, `internal` |
| icon_url | VARCHAR(500) | Product icon |
| interaction_types | VARCHAR[] | Array: `api`, `sdk`, `cli`, `webhook` |
| openapi_spec_path | VARCHAR(500) | Path to OpenAPI v3 spec file |
| current_version | VARCHAR(50) | e.g., "v2.3.1" |
| metadata | JSONB | Flexible: regions, rate limits, etc. |
| sort_order | INTEGER | Display ordering |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**api_keys**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK) | Owner |
| name | VARCHAR(255) | User-defined label |
| key_hash | VARCHAR(255) | Hashed key (never store plaintext) |
| key_prefix | VARCHAR(10) | First 8 chars for identification |
| environment | ENUM | `test`, `production` |
| status | ENUM | `active`, `revoked`, `expired` |
| expires_at | TIMESTAMP | Nullable |
| last_used_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| revoked_at | TIMESTAMP | |

**api_usage_logs**

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL (PK) | |
| api_key_id | UUID (FK) | |
| product_id | UUID (FK) | |
| endpoint | VARCHAR(500) | |
| method | VARCHAR(10) | GET, POST, etc. |
| status_code | SMALLINT | |
| response_time_ms | INTEGER | |
| timestamp | TIMESTAMP | Indexed |

**usage_daily_rollup** (materialized/pre-aggregated)

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL (PK) | |
| api_key_id | UUID (FK) | |
| product_id | UUID (FK) | |
| date | DATE | Indexed |
| request_count | INTEGER | |
| error_count | INTEGER | |
| avg_response_ms | NUMERIC | |
| p95_response_ms | NUMERIC | |

**doc_feedback**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK) | Nullable (allow anonymous) |
| page_path | VARCHAR(500) | Doc page URL path |
| product_id | UUID (FK) | Nullable |
| helpful | BOOLEAN | "Was this helpful?" |
| comment | TEXT | Optional freeform feedback |
| created_at | TIMESTAMP | |

**changelogs**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| product_id | UUID (FK) | |
| version | VARCHAR(50) | e.g., "v2.3.1" |
| title | VARCHAR(255) | |
| content | TEXT | Markdown content |
| tags | VARCHAR[] | Array: `feature`, `bugfix`, `deprecation`, `breaking`, `security` |
| published_at | TIMESTAMP | |
| author_id | UUID (FK) | |
| created_at | TIMESTAMP | |

### 4.3 Indexing Strategy

- `products`: index on `slug`, `category_id`, `status`, `visibility`
- `api_keys`: index on `user_id`, `key_hash`, `status`
- `api_usage_logs`: composite index on `(api_key_id, timestamp)`, partition by month for performance
- `usage_daily_rollup`: composite index on `(api_key_id, product_id, date)`
- `doc_feedback`: index on `page_path`, `product_id`
- `changelogs`: index on `product_id`, `published_at DESC`
- `partner_assignments`: index on `manager_id`, `partner_org_id`, unique on `(manager_id, partner_org_id)`
- `partner_product_access`: index on `partner_org_id`, unique on `(partner_org_id, product_id)`

### 4.4 Data Partitioning

`api_usage_logs` should be partitioned by month using PostgreSQL native partitioning. This table will grow fastest and partitioning ensures queries against recent data remain fast while old partitions can be archived.

---

## 5. Cross-Cutting Features

### 5.1 Authentication & Access Control

- **Public content**: Product catalog, docs, and guides accessible without login (no gates on learning — critical for adoption)
- **Authenticated features**: API key management, "Try It" console with live keys, usage dashboards, personal bookmarks
- **Role-based views**:
  - `external`: public products only
  - `partner`: public + products specifically granted via partner_product_access
  - `internal`: everything including internal-only products and pre-release docs
  - `relationship_manager`: full internal access + partner management dashboard. Can assign themselves to partner organizations, grant/revoke partner product access, monitor partner usage and onboarding progress, and manage partner user accounts within their assigned organizations
  - `admin`: full access + user management, product CRUD, changelog publishing, relationship manager assignments
- **Auth providers**: SSO (SAML/OIDC) for internal developers via NextAuth.js; standard email/password + GitHub/Google OAuth for external developers

### 5.2 Global Search

- Unified search across products, docs, guides, and API endpoints
- Results grouped by type: "Products," "API Reference," "Guides," "Endpoints"
- Keyboard shortcut: Cmd+K / Ctrl+K (industry standard)
- Pagefind indexes all MDX content at build time; product metadata searched via PostgreSQL full-text search
- Search should index OpenAPI spec content so developers can search by endpoint name, parameter, or error code

### 5.3 Developer Dashboard (post-login)

- **API key management**: create, rotate, revoke keys with environment labels (test/production) and optional expiry
- **Usage metrics**: request counts, error rates, latency (average + P95) per product, per key
- **Charts**: daily/weekly/monthly usage trends using a lightweight chart library (Recharts)
- **Quicklinks**: recently viewed docs and bookmarked pages

### 5.4 Changelog & What's New

- Per-product changelogs with version, tags (feature, bugfix, breaking, etc.), and Markdown content
- Portal-wide "What's New" aggregated feed
- RSS feed support for programmatic consumers
- Admin interface for publishing changelog entries

### 5.5 Feedback Mechanism

- "Was this page helpful?" (yes/no) on every documentation page
- Optional freeform comment for reporting doc errors or suggesting improvements
- Feedback aggregated in admin dashboard to identify problematic pages

### 5.6 SEO & Performance

- Server-side rendering via Next.js for all public pages
- Clean URL structure: `/products/{slug}`, `/docs/{product}/{page}`, `/guides/{slug}`
- Proper meta tags, Open Graph, and structured data (JSON-LD)
- Sitemap.xml auto-generated at build time
- Static generation (ISR) for docs/guides pages for maximum performance

### 5.7 Additional DX Features

- **Dark/light mode** toggle (persisted in user preference or localStorage)
- **Status page link** — link or embed system status so developers know if an issue is theirs or yours
- **Breadcrumb navigation** — essential for 10+ product navigation
- **"Edit this page" links** — for internal contributors to submit doc fixes via Git

---

## 6. Project Structure

```
developer-portal/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (nav, footer, theme)
│   ├── page.tsx                  # Homepage / launchpad
│   ├── products/
│   │   ├── page.tsx              # Product catalog
│   │   └── [slug]/
│   │       ├── page.tsx          # Individual product page
│   │       └── api-reference/
│   │           └── page.tsx      # Scalar-powered API reference
│   ├── docs/
│   │   └── [product]/
│   │       └── [...slug]/
│   │           └── page.tsx      # MDX doc pages
│   ├── guides/
│   │   ├── page.tsx              # Guides landing
│   │   └── [slug]/
│   │       └── page.tsx          # Individual guide
│   ├── dashboard/
│   │   ├── page.tsx              # Developer dashboard
│   │   ├── api-keys/
│   │   │   └── page.tsx          # API key management
│   │   └── usage/
│   │       └── page.tsx          # Usage analytics
│   ├── changelog/
│   │   ├── page.tsx              # Aggregated changelog
│   │   └── [product]/
│   │       └── page.tsx          # Per-product changelog
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth.js endpoints
│   │   ├── keys/                 # API key CRUD
│   │   ├── usage/                # Usage data endpoints
│   │   ├── feedback/             # Doc feedback submission
│   │   ├── search/               # Product search (PostgreSQL)
│   │   └── changelog/            # Changelog CRUD (admin)
│   └── admin/
│       ├── products/             # Product CRUD
│       ├── changelogs/           # Changelog publishing
│       └── partners/             # Relationship manager → partner management
│           ├── page.tsx          # Partner organizations list
│           ├── [orgId]/
│           │   ├── page.tsx      # Partner detail: users, product access, usage
│           │   ├── access/
│           │   │   └── page.tsx  # Grant/revoke product access
│           │   └── usage/
│           │       └── page.tsx  # Partner-specific usage analytics
│           └── assignments/
│               └── page.tsx      # Manager-to-partner assignment management (admin only)
├── content/
│   ├── docs/                     # MDX documentation files
│   │   ├── product-a/
│   │   │   ├── quickstart.mdx
│   │   │   ├── sdk-reference.mdx
│   │   │   └── webhooks.mdx
│   │   └── product-b/
│   │       └── ...
│   ├── guides/                   # MDX guide files
│   │   ├── getting-started/
│   │   ├── core-concepts/
│   │   └── advanced/
│   └── specs/                    # OpenAPI v3 spec files
│       ├── product-a.yaml
│       ├── product-b.yaml
│       └── ...
├── components/
│   ├── ui/                       # Shared UI components
│   ├── product-catalog/          # Catalog cards, filters
│   ├── docs/                     # Doc layout, sidebar, breadcrumbs
│   ├── api-reference/            # Scalar wrapper component
│   ├── search/                   # Cmd+K search modal
│   └── dashboard/                # Dashboard charts, key management
├── lib/
│   ├── db/                       # Prisma client, queries
│   ├── auth/                     # NextAuth.js config
│   ├── mdx/                      # MDX processing utilities
│   └── search/                   # Pagefind integration
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
├── public/
│   ├── icons/                    # Product icons
│   └── images/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 7. Phased Implementation Plan

### Phase 1 — Foundation (Weeks 1-3)

**Goal:** Skeleton app with product catalog and basic navigation.

- Set up Next.js project with App Router, Tailwind CSS, TypeScript
- Set up PostgreSQL + Prisma with initial schema (users, products, product_categories)
- Build homepage launchpad with three clear paths: Products, Docs, Guides
- Build product catalog page: card grid, category filters, search (PostgreSQL full-text)
- Build individual product page (static content from DB)
- Implement dark/light mode toggle
- Set up Vercel deployment (or self-hosted CI/CD)

**Deliverable:** Publicly accessible portal with product catalog.

### Phase 2 — Documentation (Weeks 4-6)

**Goal:** Per-product documentation with OpenAPI-powered API reference.

- Set up MDX processing pipeline (next-mdx-remote or contentlayer)
- Build documentation layout: sidebar navigation, breadcrumbs, prev/next navigation
- Integrate Scalar for API reference pages (one per product with OpenAPI spec)
- Implement persistent language switcher for code examples
- Add copy-to-clipboard on all code blocks
- Build version selector component
- Add "Was this page helpful?" feedback widget

**Deliverable:** Full documentation experience with interactive API reference.

### Phase 3 — Guides (Weeks 7-8)

**Goal:** Task-oriented guide pages.

- Build guides landing page with journey-stage organization
- Implement guide MDX rendering with difficulty badges and time estimates
- Add cross-product guide support (linking between product docs)
- Implement global search (Pagefind) indexing docs + guides + product metadata

**Deliverable:** Complete content experience across all three pillars.

### Phase 4 — Authentication & Dashboard (Weeks 9-12)

**Goal:** Authenticated features for registered developers.

- Set up NextAuth.js with email/password, GitHub OAuth, Google OAuth
- Set up SSO (SAML/OIDC) integration for internal users
- Build API key management: create, rotate, revoke, environment labels
- Build developer dashboard with usage charts (Recharts)
- Implement usage data ingestion pipeline and daily rollup job
- Add role-based access control (middleware for internal/partner content)
- Build admin interface for product CRUD and changelog publishing

**Deliverable:** Full authenticated portal with developer self-service.

### Phase 5 — Polish & Launch (Weeks 13-14)

**Goal:** Production readiness.

- SEO optimization: meta tags, Open Graph, structured data, sitemap
- Performance audit: Core Web Vitals, Lighthouse score optimization
- Implement RSS feeds for changelogs
- Add "Edit this page" links for internal contributors
- Status page integration
- Accessibility audit (WCAG 2.1 AA)
- Load testing and security review
- Soft launch to internal teams, then public launch

**Deliverable:** Production-ready developer portal.

---

## 8. Design Benchmarks

This portal's design is informed by research into the following best-in-class developer portals:

| Portal | Key Pattern Borrowed |
|--------|---------------------|
| **Stripe** | Three-column doc layout, progressive disclosure, language switcher, clean URL structure |
| **Twilio** | Product-organized navigation with descriptive names, task-oriented guides, dark theme, interactive console |
| **Visa** | Business-function categorization for product catalog, robust search and filtering |
| **Spotify (Backstage)** | Software catalog model, plugin architecture concepts |
| **Discord** | Deep documentation as an authoritative resource, intuitive navigation |

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|------------|
| Time to first API call | < 5 minutes | Track via quickstart guide completion |
| Doc page helpfulness | > 80% positive | "Was this helpful?" feedback widget |
| Search success rate | > 90% | Search → click-through analytics |
| API key creation to first request | < 10 minutes | Dashboard analytics |
| Portal performance (LCP) | < 1.5 seconds | Lighthouse / Core Web Vitals |
| SEO: indexed pages | 100% of public pages | Google Search Console |

---

## 10. Cost Summary

| Component | Monthly Cost |
|-----------|-------------|
| Next.js framework | $0 (open-source) |
| Scalar API reference | $0 (MIT license) |
| Pagefind search | $0 (open-source) |
| NextAuth.js | $0 (open-source) |
| Prisma ORM | $0 (open-source) |
| PostgreSQL | $0 (self-hosted) or ~$15/mo (managed, e.g. Neon free tier) |
| Hosting (Vercel) | $0 (free tier) or $20/mo (Pro) |
| **Total** | **$0 — $35/month** |

Compared to paid alternatives (Mintlify $300+/mo, ReadMe $500-3,000+/mo), this represents a 90-100% cost savings with full design control and zero vendor lock-in.
