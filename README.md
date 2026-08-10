# Well Da Website

The corporate website for **Well Da Factory Limited** — a precision manufacturing company specializing in CNC machining, sheet metal fabrication, die casting, and surface finishing across electronics, automotive, medical, and industrial sectors.

Built with **Next.js 16**, **React 19**, and **Mantine UI v9**.

## Features

- **Bilingual (EN / 中文)** — full i18n with English and Traditional Chinese, including locale-aware routing (`/en/...`, `/zh/...`)
- **Automatic locale detection** — cookie-based preference, then `Accept-Language` header fallback, defaulting to English
- **Responsive design** — mobile navigation, adaptive header, and Mantine-powered components
- **Component library** — built on Mantine UI with a custom green brand theme
- **Static generation** — pre-rendered locale pages for fast delivery
- **Structured navigation** — multi-level nav with dropdowns for About, Products & Applications, Manufacturing Capabilities, Quality & Tolerance, Case Studies, and FAQ sections
- **Quotation page** — dedicated "Request for Quotation" page with contact info, video, and a full-stack RFQ submission form
- **RFQ form** — multi-section form (30+ fields across 8 sections) with CAD file uploads (PDF, DWG, DXF, STEP/STP, IGS/IGES, XLSX, ZIP), client + server validation, honeypot anti-spam protection, rate limiting, PostgreSQL storage, AWS S3 file storage with presigned URLs, AWS SES confirmation emails with bilingual (EN/ZH) HTML templates, and transaction rollback with S3 cleanup on failure
- **FAQ page** — accordion-style frequently asked questions organized by topic
- **YouTube embedding** — reusable component for embedded video content
- **In-website search** — static search index covering all pages, case studies, FAQ, products, and manufacturing capabilities; pre-built at compile time with client-side search overlay
- **SEO** — dynamic sitemap with hreflang alternates, robots.txt, canonical host enforcement

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)             |
| UI Library     | Mantine v9 + `@mantine/hooks`       |
| Icons          | `@tabler/icons-react`               |
| Language       | TypeScript 5                        |
| Styling        | PostCSS + Mantine PostCSS preset    |
| Database       | PostgreSQL (via `pg`)               |
| Storage        | AWS S3 (via `@aws-sdk/client-s3`, `@aws-sdk/lib-storage`, `@aws-sdk/s3-request-presigner`) |
| Email          | AWS SES (via `@aws-sdk/client-ses`)                                   |
| Search         | Static JSON index (pre-built)       |
| Linting        | ESLint 9 + `eslint-config-next`     |

Server-side modules (`src/lib/db.ts`, `s3.ts`, `rate-limit.ts`, `rfq-reference.ts`, `email.ts`) are guarded with `import "server-only"` to prevent accidental client-side bundling.

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   └── rfq/
│   │       └── route.ts              # RFQ submission endpoint (POST)
│   ├── [lang]/                        # Locale-prefixed routes (en, zh)
│   │   ├── layout.tsx                 # Root layout (MantineProvider + LocaleProvider)
│   │   ├── page.tsx                   # Home page
│   │   ├── about/                     # About Us page
│   │   ├── applications/             # Products & Applications page
│   │   ├── manufacturing/            # Manufacturing Capabilities page
│   │   ├── quality/                  # Quality & Tolerance page
│   │   ├── case-studies/             # Case Studies page
│   │   ├── quotation/                # Request for Quotation page
│   │   ├── faq/                      # FAQ page
│   │   └── search/                   # Search page
│   ├── globals.css                   # Global styles
│   ├── sitemap.ts                     # Dynamic sitemap with hreflang alternates
│   └── robots.ts                      # robots.txt generation
├── components/
│   ├── about/                        # About page sections (AboutContent, TrustLineSection)
│   ├── applications/                 # Applications page content
│   ├── manufacturing/                # Manufacturing page (ManufacturingContent, CapabilityItem)
│   ├── quality/                      # Quality page content
│   ├── case-studies/                 # Case Studies page content
│   ├── quotation/                    # Quotation page content + RfqForm directory
│   │   └── RfqForm/
│   │       ├── index.tsx             # Form orchestrator (validation + submit)
│   │       ├── ContactSection.tsx
│   │       ├── PartProjectSection.tsx
│   │       ├── MaterialSection.tsx
│   │       ├── QuantitySection.tsx
│   │       ├── DeliverySection.tsx
│   │       ├── TechnicalSection.tsx
│   │       ├── FileUploadSection.tsx
│   │       ├── PrivacySection.tsx
│   │       ├── SubmitSection.tsx
│   │       └── SuccessPanel.tsx
│   ├── faq/                          # FAQ page content (FaqContent)
│   ├── search/                       # Search overlay + search results page
│   ├── layout/                       # Layout components
│   │   ├── SiteHeader/               # Top-level header assembly
│   │   ├── TopBar/                   # Notification/status bar
│   │   ├── MainHeader/               # Logo + search + CTA row
│   │   ├── NavigationBar/            # Desktop dropdown navigation
│   │   ├── MobileNav/                # Mobile slide-out menu
│   │   └── LanguageSwitcher/         # EN/ZH toggle
│   └── ui/                           # Shared UI primitives (Logo, HashLink, YouTubeEmbed)
├── config/
│   ├── navigation.ts                 # Nav structure + contact info (per locale)
│   └── site.ts                       # Site URL constant
├── hooks/
│   └── useDebounce.ts                # Generic debounce hook
├── i18n/
│   ├── dictionaries.ts               # Dictionary loader (server-only)
│   ├── locale-context.tsx            # LocaleProvider + useLocale hook (client)
│   └── dictionaries/                 # en.json, zh.json translation files
├── lib/
│   ├── db.ts                         # PostgreSQL connection pool
│   ├── s3.ts                         # AWS S3 upload/delete/presigned URLs
│   ├── validation.ts                 # Server-side RFQ validation
│   ├── rate-limit.ts                 # Per-IP rate limiting for RFQ submissions
│   ├── countries.ts                  # Bilingual country/region dropdown lists
│   ├── rfq-reference.ts             # Reference number generation (RFQ-YYYY-NNNNNN)
│   ├── email.ts                     # AWS SES confirmation email sender
│   ├── email/
│   │   └── templates.ts             # Bilingual HTML email templates (EN + ZH)
│   └── types/
│       └── rfq.ts                   # Shared RFQ types, enums & constants
├── theme/
│   └── mantine-theme.ts              # Custom Mantine theme (green palette)
└── proxy.ts                          # Middleware: locale detection + redirect
scripts/
└── generate-search-index.ts          # Builds search-index-{locale}.json at build time
public/
├── search-index-en.json              # English search index (generated)
└── search-index-zh.json              # Chinese search index (generated)
next.config.ts                        # Next.js config (serverExternalPackages)
```

## Getting Started

### Prerequisites

- Node.js 18+ (or the version required by Next.js 16)

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to your detected locale.

### Scripts

| Command                    | Description                                |
| -------------------------- | ------------------------------------------ |
| `npm run dev`              | Start the development server               |
| `npm run build`            | Production build (search index + Next.js) |
| `npm run build-search-index`| Generate static search indexes only        |
| `npm run start`            | Start the production server                |
| `npm run lint`             | Run ESLint across the codebase             |

### Environment Variables

Create a `.env.local` file with the following variables for the RFQ form backend:

**PostgreSQL (AWS RDS):**

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `PGHOST`       | RDS instance hostname        |
| `PGPORT`       | PostgreSQL port (default 5432) |
| `PGDATABASE`   | Database name                |
| `PGUSER`       | Database user                |
| `PGPASSWORD`   | Database password            |

**AWS S3:**

| Variable               | Description                     |
| ---------------------- | ------------------------------- |
| `S3_REGION`            | AWS region (e.g. `ap-southeast-1`) |
| `S3_ACCESS_KEY_ID`     | IAM access key ID               |
| `S3_SECRET_ACCESS_KEY` | IAM secret access key           |
| `S3_BUCKET_NAME`       | S3 bucket name for RFQ uploads  |

**AWS SES (Email Confirmation):**

| Variable                   | Description                          |
| -------------------------- | ------------------------------------ |
| `SES_ACCESS_KEY_ID`        | IAM access key ID for SES            |
| `SES_SECRET_ACCESS_KEY`    | IAM secret access key for SES        |
| `SES_SENDER_EMAIL`         | Verified sender email address        |
| `SES_REGION`               | AWS region for SES (e.g. `ap-southeast-1`) |

The RFQ form works without these in development mode — the form renders, but submissions will fail. The rest of the site (pages, search, navigation) does not depend on these variables.

When SES variables are missing, the confirmation email step is silently skipped (logged as a warning); the submission itself still succeeds.

## Internationalization

Supported locales: `en` (English) and `zh` (Traditional Chinese).

- **Adding a locale:** Add the JSON dictionary in `src/i18n/dictionaries/`, register it in `src/i18n/dictionaries.ts`, and update `locales` in `src/proxy.ts`.
- **Translations for server components** use `getDictionary(locale)` from `@/i18n/dictionaries`.
- **Translations for client components** use the `useLocale()` hook, which exposes the `ClientDictionary` subset passed through `LocaleProvider`.

## Adding Content

### Case Study Cards

Case studies live in `src/i18n/dictionaries/en.json` and `zh.json` under the `caseStudies.sections` array. To add a new card, append a new entry to both files.

**1. English** — `src/i18n/dictionaries/en.json`:

```json
{
  "slug": "your-slug-here",
  "title": "Your Case Study Title",
  "description": "First paragraph.\n\nUse \\n\\n to separate paragraphs — each pair renders as a distinct <p> block.",
  "images": ["/images/your-image.jpg"]
}
```

**2. Chinese** — `src/i18n/dictionaries/zh.json`:

```json
{
  "slug": "your-slug-here",
  "title": "你的案例標題",
  "description": "第一段。\n\n第二段。",
  "images": ["/images/your-image.jpg"]
}
```

The `slug` must be **identical** in both files (it becomes the element `id`). The title and description should be translated into the target language.

**Example** — adding a server cabinet case study:

`en.json`:

```json
{
  "slug": "server-cabinet-project",
  "title": "Custom Server Cabinet for Data Centre",
  "description": "Designed and manufactured a 42U server cabinet with integrated cable management and ventilation.\n\nAll panels were laser-cut, bent, welded, and powder-coated according to the client's rack-mount specifications.",
  "images": ["/images/server-cabinet.jpg"]
}
```

`zh.json`:

```json
{
  "slug": "server-cabinet-project",
  "title": "數據中心定制伺服器機櫃",
  "description": "設計並製造了42U伺服器機櫃，配備整合式線纜管理和通風系統。\n\n所有面板均按客戶機架安裝規格進行激光切割、折彎、焊接及噴粉處理。",
  "images": ["/images/server-cabinet.jpg"]
}
```

The component picks up new entries automatically — no code changes required.

### FAQ Questions

FAQ content lives in `src/i18n/dictionaries/en.json` and `zh.json` under the `faq.sections` array. Each section has a `slug`, `title`, and a `questions` array.

**1. English** — `src/i18n/dictionaries/en.json`:

```json
{
  "faq": {
    "pageTitle": "Frequently Asked Questions",
    "sections": [
      {
        "slug": "products-orders",
        "title": "Products & Orders",
        "questions": [
          {
            "question": "Do you accept small-batch orders?",
            "answer": [
              "Yes, we accommodate both small-batch and high-volume production.",
              "- Bullet points start with \"- \"",
              "- Each bullet is a separate array entry"
            ]
          }
        ]
      }
    ]
  }
}
```

**2. Chinese** — `src/i18n/dictionaries/zh.json` (same structure, Chinese text).

Answers are an array of strings. Lines starting with `"- "` render as bulleted list items; other lines render as paragraphs. Wrap text in `**double asterisks**` for **bold** formatting.

## RFQ Form

The **Request for Quotation** form on the `/quotation` page accepts customer project details and CAD/drawing file attachments. It spans **8 sections** with over 30 fields.

**Form sections & fields:**
- **Contact** — company name, contact name, email, phone, country/region, preferred contact method
- **Part & Project** — project name, part number, drawing number/revision, product type, drawing availability
- **Material** — material, grade, thickness (with unit), surface finish, colour, critical tolerances, assembly required, hardware inserts, printing/marking
- **Quantity** — prototype quantity, production quantity, estimated annual volume
- **Delivery** — required date (with date type), delivery region, postal code, shipping quote required
- **Technical** — approximate dimensions, operating environment, protection requirements, inspection requirements, certifications/reports, special requirements
- **File Upload** — technical drawings or specifications (max 50 MB per file, 100 MB total, up to 10 files)
- **Privacy** — consent checkbox before submission

**Accepted file types:** PDF, DWG, DXF, STEP/STP, IGS/IGES, JPG/JPEG, PNG, XLSX, ZIP

**Rate limiting:** Submissions are rate-limited to **3 per hour per IP** to prevent abuse.

**Reference numbers:** Each successful submission is assigned a unique reference in the format `RFQ-YYYY-NNNNNN` (e.g. `RFQ-2026-000042`), generated by a PostgreSQL sequence for transactional safety.

**Backend flow:** Submissions hit `POST /api/rfq` → rate-limit check → honeypot anti-spam check → server-side validation → files uploaded to AWS S3 → records inserted into PostgreSQL (8 related tables: `customers`, `project_info`, `material_n_manu_req`, `quantity`, `delivery_requirements`, `additional_technical_requirements`, `rfq_files`, `rfqs`) in a single transaction → confirmation email sent via AWS SES (bilingual, locale-aware). On failure the transaction rolls back and any uploaded S3 files are cleaned up.

**Files:**
- `src/components/quotation/RfqForm/index.tsx` — form orchestrator with client-side validation + submit
- `src/components/quotation/RfqForm/ContactSection.tsx` — contact info with country & preferred method
- `src/components/quotation/RfqForm/PartProjectSection.tsx` — project & part details
- `src/components/quotation/RfqForm/MaterialSection.tsx` — material, finish & tolerance
- `src/components/quotation/RfqForm/QuantitySection.tsx` — quantities & volumes
- `src/components/quotation/RfqForm/DeliverySection.tsx` — delivery timeline & location
- `src/components/quotation/RfqForm/TechnicalSection.tsx` — environmental & quality requirements
- `src/components/quotation/RfqForm/FileUploadSection.tsx` — file upload with drag-and-drop
- `src/components/quotation/RfqForm/PrivacySection.tsx` — consent checkbox
- `src/components/quotation/RfqForm/SubmitSection.tsx` — submit button
- `src/components/quotation/RfqForm/SuccessPanel.tsx` — post-submission confirmation
- `src/app/api/rfq/route.ts` — API endpoint with transaction handling
- `src/lib/types/rfq.ts` — shared types, enums & constants (form limits, accepted extensions)
- `src/lib/validation.ts` — server-side validation rules
- `src/lib/rate-limit.ts` — per-IP submission rate limiting
- `src/lib/countries.ts` — bilingual country/region lists for dropdowns
- `src/lib/rfq-reference.ts` — reference number generation
- `src/lib/email.ts` — AWS SES confirmation email sender (fire-and-forget, with DB tracking)
- `src/lib/email/templates.ts` — bilingual HTML email templates (EN + ZH) with branded layout
- `src/lib/s3.ts` — S3 upload with presigned URLs (7-day expiry)
- `src/lib/db.ts` — PostgreSQL connection pool (with `server-only` guard)

## Search

In-website search is powered by a **pre-built static index**. At build time, `scripts/generate-search-index.ts` reads the English and Chinese dictionaries and writes `public/search-index-en.json` and `public/search-index-zh.json`. These are fetched client-side by the search components.

- **SearchOverlay** — instant dropdown in the header, debounced, showing up to 8 results with category badges
- **SearchContent** — full results page at `/search?q=...`, displaying all matches grouped by category

Search covers: navigation pages, about content, product categories, manufacturing capabilities, case studies, FAQ questions, and the quotation page.

## SEO

The site includes built-in SEO support:

- **Dynamic sitemap** (`src/app/sitemap.ts`) — automatically generates per-locale sitemap entries with `hreflang` language alternates (`en`, `zh-Hant`, `x-default`) and `changeFrequency`/`priority` metadata. Served at `/sitemap.xml`.
- **robots.txt** (`src/app/robots.ts`) — allows all crawlers and points to the sitemap.
- **Canonical host redirect** — the `wellda.com` domain redirects (308) to the canonical `www.wellda.com` host via middleware to prevent duplicate indexing.

## Deployment

The site is deployed on **AWS Amplify**. Connect your Git repository in the Amplify console and it auto-detects the Next.js project. The `amplify.yml` at the project root provides the build specification.

**Build pipeline** (`npm run build`):
1. `npm run build-search-index` — generates static search indexes
2. `next build` — Next.js production build

Set all environment variables in the Amplify console under **App settings → Environment variables**. See the [Environment Variables](#environment-variables) section above for the full list.

## Brand

- **Company:** Well Da Factory Limited
- **Primary color:** Green (`#45a145`)
- **Font:** Arial / Helvetica with CJK fallbacks (Microsoft JhengHei, PingFang TC)
- **Contact:** (+852) 2790 5008 · `eng@wellda.com`
