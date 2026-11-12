# Draft PR preparation — not submitted

Target repository: Larry1280326/well-da
Base: master
Head: feat/wellda-seo-rfq-goal1-goal2
Draft: true
Suggested title: Improve bilingual search visibility and RFQ reliability

**Do not create this PR or push its branch until DEPLOYMENT_READINESS.md's gates are satisfied and the user explicitly authorizes the action.** Production mapping, preview triggers/resource isolation and AWS Next.js 16 compatibility remain unverified. Refresh verification/SHA details before submission.

---

## Summary

Buyers previously found short product summaries and largely shared page metadata, while several RFQ failure paths could lose attribution, truncate quantities or leave attachments behind. This change adds useful bilingual manufacturing/product information and repairs the existing RFQ flow while retaining the site's design, important routes and administration inbox.

- Add distinct EN/ZH metadata, canonical/hreflang/Open Graph, Organization and product breadcrumb schema, crawlable navigation and sitemap entries.
- Add three bilingual drawing-based product detail pages for enclosures/cabinets, equipment housings/covers, and panels/chassis, using existing photographs and documented materials/processes. Improve the homepage and manufacturing guide; preserve existing URLs/anchors.
- Correct quantity parsing, field validation/serialization, source-page recording and failure cleanup. Preserve committed RFQs if acknowledgement mail fails and refresh expiring staff attachment links.
- Prepare a disabled-by-default consent-gated GA4 conversion adapter. No analytics account/tag/CMP is activated.
- Restore the requested website name, Well Da Metal Factory Limited, in the visible header, bilingual titles, Open Graph and Organization metadata.

## Files and evidence

SEO_RFQ_DELIVERY.md lists the original implementation files, source facts and local results from baseline f2af37c to implementation commit 3cf121b. DEPLOYMENT_READINESS.md records the follow-up name change, read-only deployment inspection, isolated real-service E2E plan, privacy/analytics dependencies and exact merge gates. No deployment configuration or historical lint scripts were changed in the follow-up.

Local desktop/mobile screenshots exist under ignored .test-build and were shared in the local review; they have not been uploaded as PR attachments. Local preview is http://127.0.0.1:3002/en and /zh while running; it is not a hosted staging URL.

## Local verification

- npm run build: passed; TypeScript and 36 generated pages.
- npm run typecheck: passed.
- npm test: 14 passed; actual handler/validation code with simulated DB, S3 and SES boundaries. No real-service E2E claim.
- npm run test:site: 22 bilingual public pages and 260 internal links/anchors passed against this continuation's fresh production-mode build on port 3002. EN/ZH titles, visible header and Open Graph name were also checked over HTTP.
- Scoped lint and git diff --check: passed.
- Repository-wide lint has two existing errors in untouched scripts/delete-admin.ts and existing warnings; not fixed or suppressed. It can block merge if a required check runs whole-repo lint.

## Outstanding before merge

- Authenticated AWS evidence of production branch/domain mappings, auto-build/PR-preview triggers, effective environment/role isolation and actual deployed SHA/runtime/provider.
- Resolve managed Next.js 16 support/path: current AWS documentation lists Next.js 12–15; local compilation and existing live 200 responses do not establish support. No downgrade or infrastructure change is included.
- Execute the isolated approved real RDS/S3/SES/staff-receipt test matrix and verify advertised file limits through Amplify. Production RFQs/commercial recipients must not be used.
- Approve truthful controller, retention/sharing/contact facts and bilingual privacy/collection notice. GA4 remains off until the selected property, consent settings and network-payload checks are approved and verified.
- Explicit owner review and merge/deployment approval. Do not enable auto-merge.

No production deployment, production test submission, external test email or production data modification has been performed by this work.
