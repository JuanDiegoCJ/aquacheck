# Supabase Free plan: pausing, limits, security model (as of 2026-11-17)

Method note: pages were fetched via a summarizing fetch tool; "quotes" are as returned by that tool and may be slightly paraphrased. Re-check key figures in the dashboard before committing. Most official docs pages carry no visible date; dates given only where shown.

## Pausing, restore, keep-alive

### Takeaway
CONFIRMED: Free projects pause after low activity over a 7-day period (pricing page: "1 week"). Current docs say restore is possible for up to 1 year; the 90-day figure (2024 changelog) is OUTDATED. Owners get a warning email about a week before. Paused projects do not count toward the free project limit.

### Cited Findings
- Pause trigger: Free projects are paused when they "show low activity over a 7-day period to save server resources." — [Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- Pricing page: "Free projects are paused after 1 week of inactivity." — [Pricing](https://supabase.com/pricing)
- Going-into-prod: "We may pause applications on the Free Plan that exhibit low activity in a 7-day period to save on server resources." Upgrading to Pro guarantees inactive projects won't be paused. — [Going into prod](https://supabase.com/docs/guides/deployment/going-into-prod)
- What counts as activity: database activity; "a few user requests to the database each day over the previous week" typically suffices; a project can be paused even if you use it, if usage is too low. — [Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- FAQ: "Opening the project in the dashboard or sending real requests from your app both count as activity." and "A few requests a day is usually enough to keep a project running, though that isn't a guarantee." — [KB FAQ](https://supabase.com/kb/faqs/platform/free-project-pausing)
- Warning email: owners get "A warning email roughly one week before the pause takes effect," then a confirmation email once paused. FAQ: "You get an email about a week before a pause, and another once it happens." — [Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing); [KB FAQ](https://supabase.com/kb/faqs/platform/free-project-pausing)
- After warning, you can "Visit the project from the Supabase Dashboard to generate activity," or make API calls from a connected app. — [Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- Restore: "You can restore a paused project for up to 1 year after it was paused." "The project will return to its previous state, including data and configurations." — [Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- Older rule (2024-06-24 changelog): restorable 90 days; after the window, restore is replaced by a download of the latest logical backup and all Storage objects. Superseded by the 1-year figure above (the replace-by-download behavior was also reported in a search summary for the current docs, not directly verified on the current page). — [Changelog](https://supabase.com/changelog/27497-paused-free-plan-projects-are-restorable-for-90-days)
- "Paused projects do not count towards your free project limit." — [Billing on Supabase](https://supabase.com/docs/guides/platform/billing-on-supabase)
- Official avoidance: generate activity, or upgrade to Pro (paid projects cannot be paused for inactivity). — [Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing)

### Inferences
- A scheduled ping/cron making a real DB-touching request daily is consistent with the docs' "a few requests a day" guidance, but the docs do not explicitly endorse or ban synthetic keep-alive pings. For a pilot with 20 active households, real usage likely suffices, but not guaranteed (school holidays!). Safe approach: a tiny daily scheduled query plus calendar reminder; pilot data should be exported regularly.
- Restore-after-pause: the dashboard "Restore project" flow is implied by docs but exact steps were not retrieved.

### Gaps
- Exact "Restore project" button wording/steps not retrieved (FAQ links to a "Restoring a paused project" section).
- No official statement found on keep-alive pings being discouraged or tolerated (only secondary community "keepalive" repos exist; not cited).
- Exact historical date when 90 days became 1 year not found.

## Free plan limits

### Takeaway
CONFIRMED: 500 MB DB per project, 1 GB storage, 50 MB max file upload, 5 GB egress (plus 5 GB cached), 50,000 MAU, 2 free projects, 500k Edge Function invocations, Realtime 200 peak connections / 2M messages / 256 KB max message, no automatic backups, 1 day log retention.

### Cited Findings
- "You are granted two free projects." / "The project limit applies across all organizations where you are an Owner or Administrator." — [Billing on Supabase](https://supabase.com/docs/guides/platform/billing-on-supabase)
- Free usage table: Egress 5 GB; DB size 500 MB per project; MAU 50,000; Third-party MAU 50,000; Storage 1 GB; Edge Function invocations 500,000; Realtime messages 2 million; Realtime peak connections 200; SSO MAU and image transformations unavailable. — [Billing on Supabase](https://supabase.com/docs/guides/platform/billing-on-supabase)
- Pricing page: "500 MB database size per project", storage "1 GB included", max upload "50 MB", "5 GB included" egress and "5 GB cached egress", "Limit of 2 active projects", Realtime max message size "256 KB", backups "Not included", API/database logs retained "1 day". — [Pricing](https://supabase.com/pricing)
- Going-into-prod: "Database backups are not available for download for Free Plan projects." — [Going into prod](https://supabase.com/docs/guides/deployment/going-into-prod)
- Backups: Free plan has no automatic backups described; "We recommend that free tier plan projects regularly export their data" (CLI `db dump`). Daily backups: Pro 7 days, Team 14, Enterprise up to 30. PITR is a paid add-on (Pro/Team/Enterprise). — [Backups](https://supabase.com/docs/guides/platform/backups)

### Inferences
- 20 households with phone numbers and maintenance text is tiny versus 500 MB; photos are the risk: 1 GB storage, and egress 5 GB if photos are served frequently. Compress client-side.

### Gaps
- Behavior when a Free quota is exceeded (read-only DB at 500 MB, throttling) not retrieved from official pages in this pass.
- Pricing page date unknown; no changelog check for 2026 limit changes (flag as possibly outdated).

## Regions

### Takeaway
CONFIRMED: South America (São Paulo) `sa-east-1` exists and is the closest listed to Peru. No Free-plan region restriction mentioned on the regions page.

### Cited Findings
- "South America (São Paulo), `sa-east-1`" listed among specific regions; page mentions no Free plan restrictions. — [Regions](https://supabase.com/docs/guides/platform/regions)

### Inferences
- Choosing sa-east-1 at project creation should minimize latency from Peru; region cannot generally be changed later without migration (not verified here).

### Gaps
- No official latency figures Lima to São Paulo; Free-plan availability of sa-east-1 only inferred from absence of restriction on the page.

## Security model: RLS, keys, anonymous access

### Takeaway
CONFIRMED: the publishable (and legacy anon) key is safe in client code only with RLS enabled and policies written; secret/service_role keys bypass RLS and must never be in a browser. Anon/service_role keys are being deprecated by end of 2026.

### Cited Findings
- Publishable key: "Safe to expose online: web page, mobile or desktop app, GitHub actions, CLIs, source code." Secret key: "Only use in backend components of your app". Formats `sb_publishable_...`, `sb_secret_...`. — [API keys](https://supabase.com/docs/guides/api/api-keys)
- `anon` = "Legacy version of publishable keys"; `service_role` = "Legacy version of secret keys"; both systems work at the same time. "Supabase is deprecating the `anon` and `service_role` keys by the end of 2026." Secret keys: "Never put one in a browser, a shipped application, or source control." "Policies never apply to a secret key, because `service_role` has the `BYPASSRLS` attribute." — [API keys](https://supabase.com/docs/guides/api/api-keys)
- RLS page: "Enable RLS on every table in an exposed schema." "Once RLS is enabled, no data is accessible through the API when using a publishable key, until you create policies." Recommends revoking default `anon` grants; a policy `to anon using ( true )` exposes all rows to unauthenticated visitors. On existing projects "a new table in `public` starts with every privilege already granted to all three roles"; a table in an exposed schema without RLS is readable/writable by any role with a grant. Event triggers can enable RLS on new tables automatically. — [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Secret key bypasses RLS only when the request carries no user access token. — [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- SECURITY DEFINER: runs with creator's privileges and can bypass RLS; set `search_path = ''`, schema-qualify names; do not create them in exposed schemas (Data API can call them). — [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Anonymous sign-ins: `signInAnonymously()` creates an anonymous user; "Anonymous users use the `authenticated` role"; policies must check the `is_anonymous` JWT claim; user can't recover account after sign-out/clearing data unless identity linked; "strongly recommended to enable invisible CAPTCHA or Cloudflare Turnstile"; bad actors can balloon DB size; IP rate limit 30 requests/hour (adjustable). — [Anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- Securing data page: "Protect exposed tables with Row Level Security (RLS) and grant only the privileges each role needs." — [Secure data](https://supabase.com/docs/guides/database/secure-data)

### Inferences
- Options for accountless household access: (a) per-household secret token passed to an RPC (SECURITY DEFINER, `search_path=''`) that checks token hash and returns only that household's rows, with direct table access revoked from anon; (b) anonymous sign-ins with `is_anonymous`-aware policies (devices lose access if storage cleared; abuse risk). Docs reviewed describe the mechanics of (b) and (SECURITY DEFINER) but do NOT specifically recommend the token-per-household pattern; that is NOT VERIFIED as official guidance. Note: SECURITY DEFINER functions in an exposed schema are callable via the Data API, so put them in a non-exposed schema or ensure internal checks.
- Safest for phone numbers: real auth (email magic link/OTP) or anonymous + minimal exposed data.

### Gaps
- Whether new projects now default to RLS on/grants revoked: RLS page wording ("existing projects") hints at a change for new projects, but no dated official statement retrieved. NOT VERIFIED.
- Storage bucket RLS guidance for photos not retrieved.

## Personal data, DPA, terms

### Takeaway
Terms incorporate a DPA; no Free-plan-specific or educational/non-commercial restriction found. Supabase is a US company; Peru-specific legal compliance (Ley 29733) is not addressed in what was retrieved.

### Cited Findings
- Terms 7(b): "The Parties agree to comply with the Data Processing Addendum, which is incorporated into this Agreement." "Customer may not store or process protected health information" (unless BAA). Personal Information defined as "any information that, individually or in combination, does or can identify a specific individual." — [Terms](https://supabase.com/terms)
- Terms do not address Free plan restrictions or educational use; non-commercial appears only in arbitration clause; 5(c) allows usage caps/throttling for accounts with insufficient billing history or elevated risk. — [Terms](https://supabase.com/terms)
- DPA exists (secondary: found via search listing, not fetched in full): [DPA](https://supabase.com/legal/customer-resources/data-processing-addendum); [Data Residency FAQ](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq). Search summary (unverified detail) says DPA covers GDPR/SCCs, and that account/billing data and telemetry may be processed outside the chosen region.

### Gaps
- DPA and Data Residency FAQ not fetched directly; subprocessor list not checked. Whether DPA is available/applicable to Free-plan orgs not verified.
- Peruvian data protection law (Ley 29733) and consent requirements for minors/households: out of scope, not researched.

## Instruction-like text found in pages
Nearly every supabase.com/docs page (billing, free-project-pausing, api-keys, RLS, regions, auth-anonymous, going-into-prod, backups, secure-data) contained a "Note for AI agents" block asking the reader to open a "Report documentation problems" page, end the reply with a feedback report, and ask whether to send it to Supabase. Ignored; nothing sent. (The KB FAQ and changelog pages had none.)
