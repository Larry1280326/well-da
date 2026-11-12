# Deployment readiness and PR handoff

Inspection date: 2026-11-12 (Asia/Shanghai).
Repository: `Larry1280326/well-da`; default branch: `master`.
Continuation baseline: `3cf121bb9188c117ec9f4040fc6a4275b7c72215`.
Feature branch: `feat/wellda-seo-rfq-goal1-goal2`.

## Decision

**HOLD push and Draft PR creation.** AWS configuration inspection is blocked by missing authenticated AWS access. Production branch mapping, feature/PR build triggers and resource isolation are unknown. No push, PR, merge, deployment, credential change, resource creation or external test email was performed. The remaining work is account evidence and approval, not another website improvement project.

The feature branch no longer tracks `origin/master`. Its upstream is deliberately unset because `git ls-remote --heads origin feat/wellda-seo-rfq-goal1-goal2` returned no matching remote branch. Its branch-specific `pushRemote` is `origin`. Local `master`, remote `master` and global Git settings were not changed. After a safe explicitly authorized feature push, `--set-upstream` must establish tracking to the matching remote feature branch.

## Verified facts and unknowns

| Question | Evidence / result |
| --- | --- |
| Which branch deploys to wellda.com? | **Unknown.** Git default is master, which does not establish domain mapping. Public DNS: www.wellda.com CNAME to d28mumogw6k63l.cloudfront.net. DNS does not identify the Amplify branch |
| AWS access available? | No AWS CLI on PATH or at its standard Windows install path; no default `.aws` directory, AWS/Amplify credential/profile environment variables, boto3 or AWS connector exposed. Chrome opened the Amplify console and reached AWS IAM sign-in. No credentials were entered and no authentication/security settings changed |
| Account/app/region? | Owner account, actual hosting app ID and region are unverified. The sign-in redirect region is not evidence of the application's region |
| Auto-build / auto-deploy on feature pushes? | **Unknown.** App/branch settings and branch auto-creation patterns are not in this repository. No GitHub Actions workflows are in the checkout. Empty combined-status results for default-branch commit f2af37c do not prove absence of deployment integration |
| Auto-build / auto-deploy on PRs, including drafts? | **Unknown.** No console preview settings were accessible. A Draft PR is not a guarantee that external build hooks will stay idle |
| Preview RDS/S3/SES/environment isolation? | **Unknown.** `amplify.yml` writes whatever PG*, S3_* and SES_* values are supplied into `.env`, without a branch/PR resource-isolation condition. There is no checked-in dedicated preview configuration or resource mapping |
| Public production behavior? | Read-only GET /en, /zh and /en/search?q=enclosure returned 200 with Next.js headers; GET /api/rfq returned 405. No production POST was attempted. These responses neither identify the deployed SHA/version nor prove database, file or mail behavior |
| Framework/runtime in checkout? | Next.js 16.4.3; build pins Node 22.23.4 in `.nvmrc` and amplify.yml; local runtime is Node 26.8.2. No framework/runtime/deployment configuration was changed |
| AWS documented support? | Current AWS managed SSR documentation lists Next.js 12–15. It does not establish managed support for this Next.js 16 checkout. AWS separately documents Node 22 as a supported runtime major; that is not Next.js 16 compatibility proof |
| Existing RFQ receipt/notification? | POST persists through existing PostgreSQL/S3 flow and sends buyer acknowledgement via SES. Staff receipt is the authenticated dashboard. No staff notification email implementation/configuration is present |

Sources: [AWS Next.js support](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html), [SSR deployment](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html), [Node support](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-supported-features.html), [PR previews](https://docs.aws.amazon.com/amplify/latest/userguide/pr-previews.html).

The different preview URL documented by AWS is not evidence that this application's manually configured RDS/S3/SES are isolated. Do not infer that a temporary Amplify-managed backend provisions replacements for these resources. The repo is public; the AWS preview documentation also describes public-repository/IAM-role restrictions. Actual app platform, role and preview eligibility must be read from this account rather than inferred from generic documentation.

## Exact missing capability and evidence required

Needed: an owner-provided **existing authenticated, read-only AWS session/role** for the correct hosting account, plus the hosting region/app ID, or read access to discover the app in an owner-identified region. No new access keys, credential rotation or deployment-setting changes are requested. An owner can alternatively supply a redacted configuration report containing the fields below. Do not put secret values, credentials, raw logs or full API responses in this repository, chat or PR.

Read-only Amplify capabilities required: ListApps (if discovery is needed), GetApp, ListBranches, GetBranch, ListDomainAssociations, GetDomainAssociation, ListJobs/GetJob and ListWebhooks/GetWebhook as needed. To certify role isolation, an owner/security reviewer must also supply effective service/compute-role policies or permit reading the relevant IAM policies. These are missing inspection capabilities; no IAM permission denial has been observed because no authenticated principal is available.

| Read-only evidence | Required fields / decision |
| --- | --- |
| App identity | Repository URL, app ID/region, platform, productionBranch; deployed commit/job ID. Must correspond to Larry1280326/well-da |
| Domain association | wellda.com subDomains[].subDomainSetting.prefix and branchName for apex and www; redirect rules and any auto-subdomain patterns. Confirm the feature/PR cannot replace either production mapping |
| App triggers | enableBranchAutoBuild, enableAutoBranchCreation, autoBranchCreationPatterns, autoBranchCreationConfig.enableAutoBuild and enablePullRequestPreview; relevant webhooks and non-repo deployment integrations |
| Branch triggers | master and feature branch enableAutoBuild, enablePullRequestPreview, stage, effective build spec, branch source/destination mappings, backendEnvironmentArn and computeRoleArn |
| Environment inheritance | Compare effective app + branch overrides + auto-branch/PR values for PGHOST/PGDATABASE/PGUSER, S3_BUCKET_NAME/region and SES sender/region; report only missing / same-as-production / distinct-test-resource. Compare credentials privately in memory; never print/export them. Different credentials alone do not prove different resources |
| Effective permissions | Service/compute roles and static S3/SES/PG credentials must not grant preview code production data access. A preview with production secrets at build time is unsafe even if no RFQ is submitted |
| Current deployment proof | Successful build/deploy job showing actual deployed commit, resolved Next version, Node major, build image and adapter/provider path. Review only relevant redacted log excerpts |
| Next.js 16 compatibility | Establish a supported deployment path for this exact version (provider documentation or AWS confirmation), plus an isolated same-platform test of proxy/redirects, SSG/SSR, images, route handlers, multipart body limits and runtime variables. Do not silently downgrade, add an adapter or migrate hosting |

API field references: [GetApp](https://docs.aws.amazon.com/amplify/latest/APIReference/API_GetApp.html), [GetBranch](https://docs.aws.amazon.com/amplify/latest/APIReference/API_GetBranch.html), [DomainAssociation](https://docs.aws.amazon.com/amplify/latest/APIReference/API_DomainAssociation.html). Inspect configuration without using Update*, Create*, StartJob or webhook invocation.

## Isolated real RFQ verification plan — not executed

No test resources or recipients have been approved/provided. Do not execute this plan against production or assume access to new infrastructure. Prefer an existing owner-approved isolated staging deployment and resources.

### Prerequisites and stop conditions

1. Owner names the exact staging URL, isolated database/schema, private S3 bucket, SES configuration, approved test recipient(s), staff test account and resource owner. Confirm the staging runtime cannot read/write production resources and contains no copied real RFQs. All fixtures use synthetic company/contact/project data, marked RFQ-QA with a unique run identifier.
2. Use a real, approved test mailbox for actual SES delivery; example.invalid is only for local mocks. Confirm SES sandbox/verified-identity restrictions, region, permissions and sending status before test mail. Do not send to eng@wellda.com or other commercial inboxes without explicit approval naming that destination.
3. Owner approves the test count, upload sizes, temporary storage/cost, evidence storage and cleanup. Use the pinned Node 22 runtime and actual intended Amplify deployment path. No new app, database, bucket, IAM role or mail setup is authorized by this plan.
4. Stop if a URL/resource/credential resolves to production, recipient approval is missing, a test unexpectedly accesses real records, or any test would require changing production/network/security settings. Do not disable production protections for testing.

### Test matrix and proof

| Test | Required evidence / pass condition |
| --- | --- |
| Browser entry and source | Submit from each priority product topic and manufacturing; include English and Chinese, desktop and mobile. Saved notes contain only the expected localized allowlisted source, without query/hash/PII |
| Real DB persistence | Correlate response reference to exactly one committed RFQ and all customer/project/material/quantity/delivery/technical/file records using read-only staging queries or authorized dashboard. Check required fields, drawing revision, custom finish, quantity 1,000 stored as 1000, technical notes and file instructions. Reload/detail access proves persistence beyond the response |
| S3 upload/download | Upload synthetic PDF + STEP together and a second batch covering supported types. Check private bucket/key, file count, original names and sizes, then download through the staff detail UI and compare SHA-256 to input bytes. A new unsigned URL must not expose an object. Re-sign a staging-only legacy/expired link and verify staff download without changing production records |
| SES acknowledgement | Approved mailbox actually receives the matching reference/project and correct language. Check the actual delivery outcome, not only a SendEmail request/message ID. No drawing attachment or unnecessary technical data should be in the acknowledgement |
| Staff receipt/notification | Designated staff user sees the same RFQ in the existing inbox and can open/download it under the intended role. Verify restricted roles do not gain customer-contact access. There is currently no staff alert email; if a pushed notification is required, the channel, recipient and narrowly scoped implementation must be separately approved before claiming that criterion passes |
| Validation and errors | Missing required fields, bad email, unchecked processing consent, empty/unsupported files and invalid quantities fail clearly without creating records/files/mail. Form retains input on transport/server failure. Honeypot is not a saved RFQ or conversion |
| Failure cleanup | Only on isolated test dependencies: induce second-upload failure, DB connection/transaction failure and mail failure. Verify failed RFQs leave no committed RFQ or orphaned files; a mail failure after COMMIT preserves the saved RFQ/files and displays a warning. Never revoke/alter production credentials or policies to create failures |
| Privacy/measurement | With analytics denied or absent, no GA script/event request; processing consent alone does not enable GA. On an approved test property with separate analytics consent, exactly one generate_lead for a committed submission, none for failures/honeypot. Network inspection shows no contact/project/reference/filename/drawing/free-text or unfiltered query/referrer payload |
| Reconciliation and cleanup | Run identifier, response reference, DB record IDs, file checksums/count, approved mailbox result and staff receipt all match. Owner-approved deletion removes only this run's test rows/objects/messages under the documented staging cleanup process; retain only approved redacted evidence |

Existing supported extensions: PDF, DXF, DWG, STEP/STP, IGS/IGES, JPG/JPEG, PNG, XLSX, ZIP (case-insensitive extension validation). Generate files with the correct format, using no proprietary drawings; extension-only local tests do not prove a viewer can parse a drawing.

Configured application limits: **50 × 1024² bytes per file, 100 × 1024² bytes total, 10 files** (UI labels these MB; these are MiB). Validate both browser and server:

- Ordinary files for every extension; mixed 2-file and 10-file requests.
- One file at 50 MiB and at 50 MiB + 1 byte.
- Two files at exactly 100 MiB total and a request over total while every file remains within its own limit (e.g. 50 MiB + 49 MiB + 1 MiB + 1 byte).
- Eleven small files; zero-byte file; an unsupported extension; no files with and without the explicit no-drawing option.
- Run success-boundary tests through the actual staging CloudFront/Amplify URL, accounting for multipart overhead and the handler's request-size guard. Capture HTTP status/error body, timeout, persistence/file cleanup and browser recovery. The existing per-instance 3-attempt/hour limit must be allowed for using an approved schedule/test runner; do not disable a production limiter or evade it by spoofing forwarding headers.

AWS's documented **response** limit is not proof of an allowed 100 MiB **request**. If the hosting path rejects a currently advertised valid upload, record this as a blocking deployment defect and agree the smallest remedy separately; do not introduce a new upload architecture in this readiness task. [AWS SSR troubleshooting](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-SSR.html).

## Truthful Privacy Policy: owner facts required

The requested display name is now Well Da Metal Factory Limited. That does not independently verify the registered legal data controller. Before drafting/publishing an EN/ZH policy and collection notice, obtain owner-approved facts:

- Legal controller identity, business address and actual privacy/access/correction/deletion contact; do not assume the sales mailbox is the privacy contact.
- Exact RFQ fields/files collected; mandatory vs optional fields; purpose of each; what happens if mandatory data is withheld; whether any follow-up/marketing reuse occurs. Validate the current purpose copy against real practice.
- Actual staff/engineer access, factory/affiliate/supplier sharing, service providers and processing locations for hosting, database, storage, mail, logs and backups; cross-border transfers and applicable target-market rules for qualified review.
- Retention periods/criteria separately for RFQ rows, drawings, email, access/application logs and backups; deletion/access/correction workflow, exceptions and responsible person. Seven-day signed-link expiry is **not** file deletion or retention evidence.
- Actual security/access controls and incident/contact process; never promise encryption, certifications or deletion schedules that have not been verified.
- Current cookies/browser storage and third parties, including locale/admin cookies, embedded YouTube, and any future analytics; analytics purposes, consent/withdrawal mechanism and provider terms.

The current quotation-processing checkbox is not a complete privacy policy or analytics consent. The missing /privacy document remains unresolved. Do not invent retention periods, no-sharing claims, data residency, marketing practices or business/legal identity. Have the owner/appropriate privacy reviewer approve the facts and applicable obligations before publication. [Hong Kong PCPD principles](https://www.pcpd.org.hk/english/data_privacy_law/6_data_protection_principles/principles.html).

## GA4 activation prerequisites — remain inactive

No GA4 loader/property/CMP is configured in the repo. The existing window.wellDaAnalyticsConsent gate is only an adapter input, not a consent manager or Consent Mode implementation.

Before activation, obtain the intended property/measurement ID, administrator approval, approved domain, purpose/target regions, retention/data-sharing settings, approved privacy notice and separate analytics consent UX. Reuse the intended account; no parallel analytics system is proposed.

Proposed minimal behavior, subject to owner approval: basic opt-in mode with no GA script or analytics requests before grant; denied defaults before any tag configuration; consent persistence and accessible withdrawal; update/revoke the adapter flag from the real consent state. Do not enable ads storage, Google Signals, enhanced conversions, user-provided data or cookieless denied-state pings merely to obtain more data. RFQ consent must never grant analytics consent.

Use one success-only generate_lead hook; disable automatic/enhanced form collection for RFQ and avoid duplicate GTM triggers. Sanitize page URLs/referrers on **all** automatic page views/configuration as well as the custom event. Only allowlisted source_page, language and safe page paths may be sent; exclude RFQ reference, contacts, project/part details, filenames, drawings and free text. Configure source_page as an event dimension and generate_lead as a key event. Verify denial/grant/withdrawal, SPA transitions, failure/honeypot paths, duplicate submission behavior and network payloads against an approved test property. Then verify organic acquisition/content views without exposing RFQ data.

This plan is not a claim of legal compliance; the owner's actual consent/data practices and applicable requirements must be confirmed. [Google Consent Mode guidance](https://developers.google.com/tag-platform/security/guides/consent).

## Conditions for feature push / Draft PR

All must be satisfied before either action:

1. Correct AWS app and apex/www branch mappings verified; feature push and PR creation cannot deploy or overwrite production.
2. Every triggered build/preview has no production data/secret access; either no deployment triggers or an explicitly approved isolated preview/test environment, including roles and inherited settings. A different preview hostname is insufficient.
3. Any triggered Next.js 16 build/deployment impact is understood and approved; no silent framework/hosting changes.
4. User explicitly authorizes the feature push and Draft PR after the inspection evidence is reviewed. Current execution remains on hold.

Then use the explicit matching refspec, without force or master push:

```text
git push --set-upstream origin refs/heads/feat/wellda-seo-rfq-goal1-goal2:refs/heads/feat/wellda-seo-rfq-goal1-goal2
```

Verify the remote feature SHA and tracking branch; create a **Draft** PR with head feat/wellda-seo-rfq-goal1-goal2, base master and the prepared PR_DRAFT.md body. Do not infer a Draft PR disables Amplify. No merge or auto-merge.

## Exact conditions before merge

- AWS mapping/trigger/resource-access evidence above is complete and the Draft PR is reviewed at its actual latest head.
- Next.js 16 deployment support/path is resolved and the actual Node 22 + provider staging checks pass; observed live pages alone are insufficient.
- Isolated real RFQ matrix passes, including DB/S3/SES, staff receipt, advertised upload limits and rollback/cleanup. Any required pushed staff notification has an approved working channel or is explicitly accepted as inbox-only.
- Controller/purpose/retention/sharing facts and public EN/ZH privacy/collection notice are approved. GA remains inactive unless the separate settings, consent and payload checks pass.
- Required CI/branch-protection checks pass. Historical lint errors are unchanged and not bypassed; if a required check runs repository-wide lint and fails on them, report that actual gate and obtain narrowly scoped resolution rather than disabling checks or doing unrelated cleanup now.
- Owner explicitly approves merge and production deployment. A later production RFQ test needs separate named test-resource/recipient approval. No automatic merge.

## Local readiness verification

The only website code change in this continuation restores the requested name in the header/logo alt, bilingual page titles/default metadata, Open Graph site name, Organization name and existing About descriptions. Service H1s, RFQ code, routes, framework versions, deployment configuration, email sender/templates and business policies are unchanged. Build regenerated the existing search indexes without content changes.

Passed: npm run build (36 generated pages), npm run typecheck, npm test (14 existing isolated tests), scoped ESLint on the three edited TS/TSX files, git diff --check, and npm run test:site against fresh port 3002 (22 bilingual public pages and 260 internal links/anchors). Additional HTTP checks confirmed the restored name in EN/ZH home, About and Search titles, visible header and Open Graph site name. The local Next.js 16 build runs on Node 26.8.2; the pinned AWS runtime has not been executed in this inspection. No real-service E2E result is claimed.

Fresh production-mode local preview: http://127.0.0.1:3002/en and /zh. The previous Goal 1/2 delivery record remains historical; use this document for the current deployment/PR gate and PR_DRAFT.md for the unsubmitted PR description.
