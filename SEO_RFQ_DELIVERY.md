# Well Da — Goal 1 + Goal 2 delivery

Review date: 2026-11-12 (Asia/Shanghai).

Deployment-readiness continuation from commit `3cf121b`: see [DEPLOYMENT_READINESS.md](DEPLOYMENT_READINESS.md) for current AWS access findings, upstream correction, name restoration, isolated E2E plan and merge gates. [PR_DRAFT.md](PR_DRAFT.md) is prepared locally and has not been submitted. The results below describe the original Goal 1/2 implementation.

## Repository and authorization

- Repository: https://github.com/Larry1280326/well-da
- Verified default branch: `master` (GitHub repository metadata and `git ls-remote --symref origin HEAD`).
- Baseline: `f2af37cb47ee121886d621bd3ffb3279f424581e`; clean working tree before work; fetched default branch matched baseline.
- Implementation branch: `feat/wellda-seo-rfq-goal1-goal2`. No changes were implemented on master.
- Website identity: `src/config/site.ts` names `https://www.wellda.com`; a read-only GET to `/en` returned 200 and the same homepage title/content as the baseline. This is the website, including its existing RFQ administration UI, not a Sales Engine.
- Deployment: AWS Amplify (`amplify.yml`). No repository GitHub Actions workflows. Console branch/PR auto-deployment settings are unavailable locally. The user subsequently requested **local changes only until these settings are confirmed**. No push, PR, merge, deployment, production submission, DNS/account change or test email was performed.
- No production/staging credentials or `.env.local` are available. No existing customer records were accessed or changed.

## Acceptance status

| Area | Status |
| --- | --- |
| Goal 1: bilingual technical SEO, crawlable navigation, homepage | Implemented and verified on local production build |
| Goal 1: RFQ validation, attachments, source recording, transaction failure behavior | Implemented; actual handler tested with simulated external services; browser submission verified against local test service |
| Goal 1: actual RDS/S3/SES receipt and staff processing | Not verified; requires an isolated staging environment and designated test recipient |
| Goal 1: measurement | Existing Google verification retained; optional Bing verification and consent-gated GA4 conversion adapter prepared. Accounts, consent integration and actual reporting remain unverified/unconfigured |
| Goal 2: three useful product topics, matching Chinese versions, manufacturing upgrade | Implemented and verified locally |
| Feature branch PR | Not created, following the user's later local-only instruction |
| Overall | Ready for local code/content review; full production/end-to-end acceptance and PR workflow remain incomplete |

## Page inventory and URL preservation

Existing indexable routes, in both `/en` and `/zh`: homepage, `/about`, `/applications`, `/manufacturing`, `/quality`, `/case-studies`, `/quotation`, `/faq`. All retained. Materials remain part of manufacturing/FAQ; quality and case studies already have standalone routes. Existing applications and case studies retain all previous anchors. `/search` remains available and now has `noindex, follow`. Existing `/administrator` pages have `noindex, nofollow`; authentication/roles remain in place.

Previously the priority topics were only short cards/anchors in `/applications`, without independent metadata or substantial buyer information. Added exactly three detail paths per locale:

- `/applications/custom-metal-enclosures-cabinets`
- `/applications/equipment-housings-machine-covers`
- `/applications/sheet-metal-panels-chassis`

No existing URLs were replaced. Existing locale and apex-to-www redirects were retained and checked. XML sitemap now lists 22 pages with reciprocal en / zh-Hant / x-default alternates. No invented last-modified dates.

## Main changes and files

| Files | Change |
| --- | --- |
| `src/lib/seo.ts`; public route `page.tsx` files | Unique bilingual titles/descriptions, self-canonical, reciprocal hreflang and Open Graph |
| Public/admin `layout.tsx`; `src/app/sitemap.ts` | Organization schema with existing company/contact/logo facts, optional Bing token, zh-Hant HTML language, admin noindex, sitemap additions |
| `src/components/ui/Breadcrumbs.tsx`; applications `[slug]/page.tsx`; `src/config/products.ts` | Three static bilingual product pages, visible breadcrumbs + BreadcrumbList, real existing images, manufacturing/quality/example links and RFQ CTAs |
| EN/ZH dictionaries | Product-specific applications, materials, processes, drawing workflow, requirements and corresponding SEO; updated homepage and manufacturing guide |
| About/Applications/Manufacturing content components | Retained existing green Mantine design and sections; added useful product/process/RFQ links; fixed About H1 and product heading hierarchy |
| NavigationBar, MainHeader, LanguageSwitcher, navigation config | Crawlable top-level links, three product links in desktop/mobile menus, RFQ source links, preserved query/hash during language changes |
| `scripts/generate-search-index.ts`; generated indexes | New product content indexed in both languages (76 entries per language) |
| RFQ form, FileUploadSection, PrivacySection | Correct 1,000 quantity handling, controlled-value serialization, keyboard upload control, localized upload validation, retained invalid-file feedback, first-error focus, failure recovery, persisted-success gate |
| `src/app/api/rfq/route.ts`; validation/source helpers | Strict quantity/consent/date/file checks, sanitized public source path, use validated arrays, preserve custom finish, cleanup on upload/connection/transaction failure, email failure cannot undo committed RFQ |
| `src/lib/s3.ts`; existing admin RFQ detail API | Sign before upload; safe attachment filename; regenerate expired stored S3 URLs when an authenticated admin reads files, restricted to configured RFQ bucket/prefix |
| Email sender/templates; dictionaries | No raw customer details in validation/SES error logs; clear saved-but-email-failed result; truthful contact email label; removed unsupported one-business-day acknowledgement promise |
| `src/lib/rfq-measurement.ts`; `.env.example` | Disabled-by-default consent-gated `generate_lead` integration preparation; optional Bing verification token |
| `tests/*`; `scripts/verify-site.mjs`; package/config files | Native Node test runner, isolated real-handler tests, local-only browser fixture, read-only HTTP checks; declare already-used esbuild version directly as a dev dependency; ignore generated test artifacts |
| README | Correct sheet metal scope/contact number; link to this record |

RFQ source is appended as `[Website source page] /en/...` or `/zh/...` to the existing `additional_technical_requirements.special_req_notes`, visible under technical notes in the existing authorized admin detail UI. No schema migration is needed. User notes are retained. File instructions are also retained there, including when no drawing is uploaded. Only allowlisted public paths are accepted; query strings, hashes, external URLs, admin paths and arbitrary values are excluded. This is editable first-party page attribution, not authenticated proof of an acquisition channel.

## Manufacturing evidence and boundaries

No `FACTORY_CAPABILITIES`, `WELLDA_SALES_FACTS`, `GLOBAL` or equivalent current factory policy file exists in this checkout. Sources used: baseline `f2af37c` EN/ZH dictionaries (`about`, `applications`, `manufacturing`, `quality`, `faq`, first enclosure case), repository image assets, and the user's expressly supplied capability brief.

| Claim/content | Source and handling |
| --- | --- |
| Enclosures, cabinets, panels, brackets; drawing-based prototypes/small batches/repeat production | Existing applications/About/FAQ plus user brief |
| Equipment covers, chassis and mounting interfaces | User priority-topic brief; described as drawing-based scope for review, without fictitious completed cover/chassis projects |
| Mild steel, stainless steel, electrolytic/electrogalvanized sheet and aluminium | Existing manufacturing materials and material FAQ; no grades, thickness limits or machine capacities invented |
| Cutting, punching, bending, welding, grinding, finishing, silk screening, suitable assembly | Existing manufacturing list and FAQ; no claim that all work occurs at one site |
| Images | Existing enclosure, bending and panel photographs. Equipment-cover page labels its image as a process photograph |
| Precision | Existing qualified Quality/FAQ explanation retained; removed unconditional homepage ±0.2 mm badge in favor of drawing-specific review |
| ISO | Existing certificate link retained. No new certification scope, current-validity assertion or schema certification attribute added; current certificate validity needs owner verification |
| Kiosk case | Retained URL/images; removed unsupported 42U rack specification and performance/design claims from displayed bilingual copy |
| Commercial limits | No new IP, waterproof, explosion-proof, machine-safety, price or production lead-time guarantees. Metal control panels explicitly exclude complete wired electrical control panels |

The old RFQ linked to `/privacy`, which does not exist. The broken link was removed. Both languages now describe the existing quotation/review purpose and request consent for that use, rather than claiming agreement to an unavailable policy. A published, owner-approved privacy policy is still needed; none was invented.

## Measurement and receiving workflow

- Google Search Console: existing verification meta token retained. Property ownership, indexing, coverage and sitemap submission cannot be confirmed without account access.
- Bing: no existing verification found. Optional `BING_SITE_VERIFICATION` renders `msvalidate.01` during build; account verification/sitemap submission remain external work.
- GA4/GTM: no existing tag or consent manager found in code. No parallel tracker, account, script loader or cookie banner was introduced.
- Conversion preparation: form calls `trackRfqSuccess` only after a 2xx response with `success: true`, `persisted: true` and a saved reference; server sets this after COMMIT. Honeypot, validation, upload, database and transport failures do not qualify. Email failure after COMMIT still represents a saved RFQ.
- The adapter sends `generate_lead` only when a separately configured consent manager explicitly sets `window.wellDaAnalyticsConsent === true` and an existing `window.gtag` is present. It sends only allowlisted `source_page`, language, a sanitized quotation `page_location`, and an empty `page_referrer`. No reference, filename, drawing, contact, project details, free-text or URL query is sent. Consent absent/withdrawn means no event. RFQ processing consent must never set analytics consent.
- To enable measurement after owner/account review: use the existing/intended GA4 property, integrate its tag and consent handling, disable automatic form collection for the RFQ, sanitize page URLs/referrers, configure `source_page` as an event custom dimension, mark `generate_lead` as a key event and verify DebugView with synthetic data. Organic acquisition and content views require that account/tag setup. They are **not live** from this change alone.
- Staff receipt: the existing authenticated RFQ dashboard/detail remains the internal inbox. No internal notification email existed; none was sent or configured. Owner must confirm monitoring responsibility or separately authorize a notification recipient/setup. Buyer acknowledgement remains SES; its absence does not discard a saved RFQ.

## Verification

Executed using local Node `v26.8.2` / npm `11.19.1`, Next `16.4.3`. Production remains pinned to Node `22.23.4` in `.nvmrc`/Amplify; executing that pinned runtime was unavailable locally and remains a staging check.

| Command/check | Result |
| --- | --- |
| `npm ci` | Passed; 7 moderate dependency audit findings reported by existing lockfile; no unrelated upgrade performed |
| `npm run build` | Passed, including TypeScript and 36 generated pages. Windows sandbox blocked Turbopack junction creation; authorized local execution outside sandbox succeeded; deployment config unchanged |
| `npm run typecheck` | Passed |
| `npm test` | 14 passed. Actual API/validation/source/measurement/storage-signing code; DB/S3 upload/SES replaced with test doubles. No mail or external service access |
| `npm run test:site` | Passed: 22 bilingual public pages, 260 internal links/anchors, unique titles/descriptions, canonical/hreflang/OG, single H1, JSON-LD, image alt, sitemap, robots, search/admin noindex, 404s, redirects and search indexes |
| ESLint on every changed/new TS/TSX/MJS file | Passed |
| `npm run lint` (whole repository) | Fails on 2 pre-existing `require()` errors in untouched `scripts/delete-admin.ts`; 6 existing warnings in untouched admin/quotation components. Kept outside scope |
| `git diff --check` and sensitive-data review | Passed; no environment secrets, private drawings or customer records added |
| Browser — desktop and 390×844 mobile | Checked existing layout, product navigation, Chinese counterpart, language switching, mobile product menu and form |
| Browser — mobile Chinese RFQ | Uploaded two synthetic PDF/STEP files through real file chooser; actual form submitted to actual handler with simulated DB/S3/SES. Confirmed received filenames/bytes, quantity 1000, product source path, COMMIT and email warning |
| Browser — actual local API failure | Without backend credentials and with no-drawing option, API failure showed a clear error and retained input. No external mail/data access |

Limits: file count/type/50 MiB per-file/100 MiB total boundary checks use synthetic file metadata in tests. Browser upload used small synthetic attachments. Large uploads through Amplify, actual SQL schema/constraints (including notes capacity), RDS networking, S3 permissions/retention/download, SES delivery, real admin access and production consent/analytics remain unverified. Local tests and builds are not production end-to-end proof.

## Local review

```powershell
npm ci
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

Visit `http://127.0.0.1:3000/en` and `/zh`; follow the three product cards. In another terminal run `npm run test:site`.

For a **simulated** RFQ browser preview only, run `npm run preview:rfq-test` and visit `http://127.0.0.1:3001/en/quotation` or `/zh/quotation`. This binds only to loopback, uses in-memory service doubles, generates synthetic files in `.test-build`, blocks other API/admin requests and never sends mail. `.test-build` is ignored. Do not connect this fixture to production or treat its confirmation as a real RFQ.

Local QA images: `.test-build/product-mobile-zh.jpg`, `.test-build/product-desktop-en.jpg`, `.test-build/rfq-mobile-local-simulated.jpg` (last is explicitly a simulated result). These are review artifacts, not customer data or committed assets.

## Before push/PR and merge

1. Confirm Amplify branch auto-creation, branch-to-domain mapping, production branch and PR-preview settings. If feature push or PR can deploy production, leave it local. User has currently requested this hold.
2. When safe and authorized to resume, push **only** `feat/wellda-seo-rfq-goal1-goal2`; open a PR into `master`. Suggested title: **Improve bilingual search visibility and RFQ reliability**. Use this document's implementation, verification and limitations sections as the PR description. No auto-merge or default-branch push.
3. Provision/use isolated staging RDS/S3/SES and a designated test mailbox; do not reuse production RFQs or send to commercial recipients. Test both languages, representative supported files, maximum upload sizes through Amplify, internal dashboard receipt/download, refreshed legacy file links and buyer acknowledgement.
4. Confirm staff inbox monitoring, current publishable factory facts/certificate, and provide/review a public privacy policy. Review the pared-back kiosk wording and drawing-specific tolerances.
5. Verify Search Console/Bing ownership and reporting; complete the chosen GA4 property/consent integration if desired. Do not send confidential RFQ contents to analytics.
6. Obtain explicit user approval for merge/deployment; then separately authorize a production synthetic RFQ test with a named destination. Check live metadata, sitemap and service receipt after deployment. This work does not authorize either action.

## Primary guidance checked

Checked current documentation rather than assuming framework/SEO APIs: bundled Next.js metadata, sitemap and route-handler guides in `node_modules/next/dist/docs/`.

- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Localized versions and hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [GA4 recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead)
- [Google consent guidance](https://developers.google.com/tag-platform/security/guides/consent)
- [AWS Amplify SSR troubleshooting](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-SSR.html) — hosting behavior/limits still require staging verification; response limits are not evidence that a 100 MiB RFQ request works.
