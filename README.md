# Well Da Website

The corporate website for **Well Da Engineering** — a precision manufacturing company specializing in CNC machining, sheet metal fabrication, die casting, and surface finishing across electronics, automotive, medical, and industrial sectors.

Built with **Next.js 16**, **React 19**, and **Mantine UI v9**.

## Features

- **Bilingual (EN / 中文)** — full i18n with English and Traditional Chinese, including locale-aware routing (`/en/...`, `/zh/...`)
- **Automatic locale detection** — cookie-based preference, then `Accept-Language` header fallback, defaulting to English
- **Responsive design** — mobile navigation, adaptive header, and Mantine-powered components
- **Component library** — built on Mantine UI with a custom green brand theme
- **Static generation** — pre-rendered locale pages for fast delivery
- **Structured navigation** — multi-level nav with dropdowns for About, Applications, Manufacturing, Quality, Case Studies, and FAQ sections

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

```
src/
├── app/
│   ├── [lang]/                  # Locale-prefixed routes (en, zh)
│   │   ├── layout.tsx           # Root layout (MantineProvider + LocaleProvider)
│   │   ├── page.tsx             # Home page
│   │   └── about/               # /about page
│   ├── globals.css              # Global styles
│   └── page.module.css          # Home page CSS modules
├── components/
│   ├── about/                   # About page content
│   ├── layout/                  # Layout components
│   │   ├── SiteHeader/          # Top-level header assembly
│   │   ├── TopBar/              # Notification/status bar
│   │   ├── MainHeader/          # Logo + search + CTA row
│   │   ├── NavigationBar/       # Desktop dropdown navigation
│   │   ├── MobileNav/           # Mobile slide-out menu
│   │   └── LanguageSwitcher/    # EN/ZH toggle
│   └── ui/                      # Shared UI primitives (Logo, etc.)
├── config/
│   └── navigation.ts           # Nav structure + contact info (per locale)
├── i18n/
│   ├── dictionaries.ts         # Dictionary loader (server-only)
│   ├── locale-context.tsx      # LocaleProvider + useLocale hook (client)
│   └── dictionaries/           # en.json, zh.json translation files
├── theme/
│   └── mantine-theme.ts        # Custom Mantine theme (green palette)
└── proxy.ts                    # Middleware: locale detection + redirect
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

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the development server    |
| `npm run build` | Production build                |
| `npm run start` | Start the production server     |
| `npm run lint`  | Run ESLint across the codebase  |

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
  "description": "First paragraph.\n\nUse \\n\\n to separate paragraphs — each pair renders as a distinct <p> block."
}
```

**2. Chinese** — `src/i18n/dictionaries/zh.json`:

```json
{
  "slug": "your-slug-here",
  "title": "你的案例標題",
  "description": "第一段。\n\n第二段。"
}
```

The `slug` must be **identical** in both files (it becomes the element `id`). The title and description should be translated into the target language.

**Example** — adding a server cabinet case study:

`en.json`:

```json
{
  "slug": "server-cabinet-project",
  "title": "Custom Server Cabinet for Data Centre",
  "description": "Designed and manufactured a 42U server cabinet with integrated cable management and ventilation.\n\nAll panels were laser-cut, bent, welded, and powder-coated according to the client's rack-mount specifications."
}
```

`zh.json`:

```json
{
  "slug": "server-cabinet-project",
  "title": "數據中心定制伺服器機櫃",
  "description": "設計並製造了42U伺服器機櫃，配備整合式線纜管理和通風系統。\n\n所有面板均按客戶機架安裝規格進行激光切割、折彎、焊接及噴粉處理。"
}
```

The component picks up new entries automatically — no code changes required.

## Brand

- **Primary color:** Green (`#45a145`)
- **Font:** Arial / Helvetica with CJK fallbacks (Microsoft JhengHei, PingFang TC)
- **Contact:** (+852) 2790 5008 · eng@wellda.com
