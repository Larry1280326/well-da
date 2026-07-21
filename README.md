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
- **Quotation page** — dedicated "Request for Quotation" page with contact info and video
- **FAQ page** — accordion-style frequently asked questions organized by topic
- **YouTube embedding** — reusable component for embedded video content

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)             |
| UI Library     | Mantine v9 + `@mantine/hooks`       |
| Icons          | `@tabler/icons-react`               |
| Language       | TypeScript 5                        |
| Styling        | PostCSS + Mantine PostCSS preset    |
| Linting        | ESLint 9 + `eslint-config-next`     |

## Project Structure

```text
src/
├── app/
│   ├── [lang]/                        # Locale-prefixed routes (en, zh)
│   │   ├── layout.tsx                 # Root layout (MantineProvider + LocaleProvider)
│   │   ├── page.tsx                   # Home page
│   │   ├── about/                     # About Us page
│   │   ├── applications/             # Products & Applications page
│   │   ├── manufacturing/            # Manufacturing Capabilities page
│   │   ├── quality/                  # Quality & Tolerance page
│   │   ├── case-studies/             # Case Studies page
│   │   ├── quotation/                # Request for Quotation page
│   │   └── faq/                      # FAQ page
│   └── globals.css                   # Global styles
├── components/
│   ├── about/                        # About page sections (AboutContent, TrustLineSection)
│   ├── applications/                 # Applications page content
│   ├── manufacturing/                # Manufacturing page (ManufacturingContent, CapabilityItem)
│   ├── quality/                      # Quality page content
│   ├── case-studies/                 # Case Studies page content
│   ├── quotation/                    # Quotation page content
│   ├── faq/                          # FAQ page content (FaqContent)
│   ├── layout/                       # Layout components
│   │   ├── SiteHeader/               # Top-level header assembly
│   │   ├── TopBar/                   # Notification/status bar
│   │   ├── MainHeader/               # Logo + search + CTA row
│   │   ├── NavigationBar/            # Desktop dropdown navigation
│   │   ├── MobileNav/                # Mobile slide-out menu
│   │   └── LanguageSwitcher/         # EN/ZH toggle
│   └── ui/                           # Shared UI primitives (Logo, HashLink, YouTubeEmbed)
├── config/
│   └── navigation.ts                 # Nav structure + contact info (per locale)
├── i18n/
│   ├── dictionaries.ts               # Dictionary loader (server-only)
│   ├── locale-context.tsx            # LocaleProvider + useLocale hook (client)
│   └── dictionaries/                 # en.json, zh.json translation files
├── theme/
│   └── mantine-theme.ts              # Custom Mantine theme (green palette)
└── proxy.ts                          # Middleware: locale detection + redirect
scripts/
└── copy-standalone-assets.mjs        # Post-build asset copy for standalone output
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

| Command         | Description                                |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Start the development server               |
| `npm run build` | Production build + copy standalone assets  |
| `npm run start` | Start the production server                |
| `npm run lint`  | Run ESLint across the codebase             |

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

## Brand

- **Company:** Well Da Factory Limited
- **Primary color:** Green (`#45a145`)
- **Font:** Arial / Helvetica with CJK fallbacks (Microsoft JhengHei, PingFang TC)
- **Contact:** (+852) 2790 5008 · `eng@wellda.com`
