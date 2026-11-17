# Cloudflare Pages FREE plan: limits, terms, URLs (as of 2026-11-17)

Method note: official pages were read through WebFetch, which summarizes pages with a small model. Quotes below are as returned by the tool and may not be character-exact. Re-check the critical quotes in a browser. Page dates are given where shown.

## 1. Bandwidth and requests for static assets; request caps

### Takeaway
CONFIRMED: Cloudflare's Pages Functions pricing page says static asset requests are free and unlimited on free and paid plans. The only request cap found applies to Functions (Workers Free quota, 100,000/day), not to static assets. No official statement of "unlimited bandwidth" was found on the pages fetched.

### Cited Findings
- CONFIRMED: "On both free and paid plans, requests to static assets are free and unlimited." — [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- CONFIRMED: Functions requests count toward the Workers Free daily quota (100,000/day shared with Workers; example "50,000 Functions requests and 50,000 Workers requests"). The daily limit resets at midnight UTC. — [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- CONFIRMED: "Requests to Pages functions count towards your quota for Workers plans". — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/) (page shows "Last updated Sep 5, 2026")
- The Limits page states no bandwidth limit. — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- The Developer Platform terms say "Cloudflare may temporarily limit your storage and/or the number of requests you can make or receive". This is a general reserved right, not a numeric cap. — [Developer Platform service-specific terms](https://www.cloudflare.com/service-specific-terms-developer-platform/) (Last updated Sep 28, 2026)
- A static Vite PWA without a `functions/` folder or `_worker.js` makes no Functions requests. That is an inference from the pricing page (see Inferences).

### Inferences
- For ~20 households and a ~140 KB site, the Functions cap is irrelevant as long as no Functions are used. Static traffic is documented as unlimited.

### Gaps
- NOT VERIFIED: any explicit official sentence "unlimited bandwidth" for Pages. The cloudflare.com/plans/developer-platform page did not show Pages free-plan details when fetched. The pages.cloudflare.com marketing page and the blog were not read.

## 2. Build limits, files, projects, domains

### Takeaway
CONFIRMED (Limits page): Free = 500 builds/month, 1 concurrent build (per account), 20-minute build timeout, 20,000 files per site, 25 MiB per file, 100 projects per account, 100 custom domains per project. The Limits page ties builds to Git pushes and does not mention Direct Upload.

### Cited Findings
- "Builds per month | 500 | 5,000 | 20,000" (Free, Pro, Business). — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- Concurrent builds: "1 build at a time" on Free. "Concurrent builds are counted per account." — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- "Builds will timeout after 20 minutes." — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- "Cloudflare Pages sites can contain up to 20,000 files on the Free plan." Paid plans: 100,000. — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- "The maximum file size for a single Cloudflare Pages site asset is 25 MiB." — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- "Cloudflare Pages has a limit of 100 projects" per account, "not routinely increased". The Workers project limit is separate. — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- Custom domains per project: Free 100, Pro 250, Business 500, Enterprise 500. — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- `_headers`: max 100 rules, 2,000 characters per line/header. `_redirects`: 2,000 static + 100 dynamic redirects. — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/), [Headers](https://developers.cloudflare.com/pages/configuration/headers/)
- "You can have an unlimited number of preview deployments active on your project at a time." — [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- Builds section opens with: "Each time you push new code to your Git repository, Pages will build and deploy your site." — [Pages Limits (raw md)](https://developers.cloudflare.com/pages/platform/limits/index.md)
- Vite: the build-configuration page lists a "React (Vite)" preset with build command `npm run build` and output directory `dist`. — [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- Direct Upload limits: Wrangler up to 20,000 files; drag-and-drop up to 1,000 files; 25 MiB per file. — [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)

### Inferences
- ~12 files and ~140 KB sit far below every limit.

### Gaps
- Not verified in the official docs fetched: the exact wording of how Pages is positioned versus Workers. The Pages framework-guides index now says "Workers supports most Pages use cases and offers a broader feature set" and that new projects should start on Workers ([framework guides](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/)). The index page itself was not shown with a date. Flag as possibly outdated: Pages may be in maintenance mode, so check whether Workers static assets is a better target. A Workers migration guide exists at https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/ (linked from that page, not fetched).
- The Vite guide page content (NODE_VERSION, etc.) was not retrievable; the URL returned only the guide index.

## 3. What counts as a build (Git, Direct Upload, previews)

### Takeaway
Git pushes build and deploy, so production pushes count. No official page states whether Direct Upload counts. Only a community reply (secondary, unverified) says it does not. Preview builds from Git are builds; no official page was found stating whether they count against the 500.

### Cited Findings
- "Each time you push new code to your Git repository, Pages will build and deploy your site." — [Pages Limits (raw md)](https://developers.cloudflare.com/pages/platform/limits/index.md)
- Git integration gives "preview URLs for a commit to any branch in the repository"; automatic deployments occur "every time you push a change to a branch". Branch control can disable production or preview automatic deployments (set the Preview branch to "None (Disable automatic branch deployments)"). — [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- "Commits/PRs from forked repositories will not create a preview." — [Known issues](https://developers.cloudflare.com/pages/platform/known-issues/index.md)
- Direct Upload page: you must run your build command locally before uploading. It does not say whether it counts against the build quota. — [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- SECONDARY, UNOFFICIAL: a community answer (about 7 months old at search time) says Direct Upload via Wrangler does not count toward the build limit. — [Answer Overflow thread](https://answeroverflow.com/m/1239028265079799901)

### Inferences
- Build quota consumption is plausibly tied to Cloudflare-run builds (Git integration), so local-build plus Direct Upload likely does not consume it. Not officially confirmed.
- At 500/month, a pilot with a few pushes per day is safe. To save the quota, disable preview-branch builds.

### Gaps
- NOT VERIFIED officially: Direct Upload counted or not. NOT VERIFIED: whether preview-deployment builds count toward the 500.

## 4. Terms of use, commercial use, student pilot

### Takeaway
No commercial-use restriction on the free plan was found in the Self-Serve Subscription Agreement, and no "non-commercial only" clause. Section 2.8 as referenced in the question does not exist in the current agreement (it ends at 2.7). The "disproportionate" CDN clause lives in the Application Services service-specific terms and does not name Pages. Free services carry no liability or SLA and can be terminated.

### Cited Findings
- Agreement "Last Updated September 12, 2025". Section 2 runs 2.1 to 2.7 (2.7 Acceptable Use). Searches for "2.8", "disproportionate", "non-HTML", and "Content Delivery Network" found nothing in this page. — [Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/)
- Section 2.2.1(b): you may not "create an undue burden on the Services or the networks". — [Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/)
- No non-commercial or commercial-use restriction found; "commercial" appears only in government-software and arbitration contexts (7.2, 17.3). — [Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/)
- Free Services: "We will have no liability for any harm or damage arising out of or in connection with any Free Services." Cloudflare may terminate a Free Service "in our sole discretion" and may modify or discontinue the Service without notice. No self-serve SLA. — [Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/)
- CDN clause (Application Services terms, last updated Sep 28, 2026): "Cloudflare's content delivery network (the "CDN") Service can be used to cache and serve web pages and websites." Cloudflare may limit access if you use the CDN without Paid Services "to serve video or a disproportionate percentage of pictures, audio files, or other large files." The Developer Platform is listed as one such Paid Service. The paragraph does not mention Pages. — [Application Services terms](https://www.cloudflare.com/service-specific-terms-application-services/)
- Developer Platform terms (Last updated Sep 28, 2026): "Unlike most Cloudflare products, the Developer Platform can be used to host content." Covers "Cloudflare Workers; Cloudflare Pages; Workers KV; D1". No commercial-use paragraph and no free-plan terms. — [Developer Platform terms](https://www.cloudflare.com/service-specific-terms-developer-platform/)
- Acceptable Use is in 2.7 of the Self-Serve agreement (malware, phishing, spam, etc.). — [Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/)

### Inferences
- A student/educational pilot serving a 140 KB HTML/JS PWA does not conflict with any clause found. The CDN large-file clause targets video, pictures, and audio, which the app does not serve.
- Because Free Services can be modified or terminated at will, the pilot should keep a copy of the build and not depend on guarantees.

### Gaps
- Search snippets showed versions of the service-specific terms dated March 24, 2026, June 2, 2026, and September 28, 2026. The fetched pages showed Sep 28, 2026 (latest).
- NOT VERIFIED: any explicit statement about education or student use. None was found.
- The URL service-specific-terms-developer-services returned 404. The working URL is service-specific-terms-developer-platform.
- The website-terms page was not read.

## 5. *.pages.dev URL behavior

### Takeaway
You choose the project name at creation, and it forms `<name>.pages.dev`. It cannot be renamed; the official workaround is to delete and recreate the project. Cloudflare reserves the right to change pages.dev subdomains with about one week's notice. A custom domain can be added later without code changes. Global uniqueness is not stated in the pages fetched.

### Cited Findings
- "`*.pages.dev` subdomains currently cannot be changed." Workaround: "If you need to change your `*.pages.dev` subdomain, delete your project and create a new one." — [Known issues](https://developers.cloudflare.com/pages/platform/known-issues/index.md)
- Without a custom domain, the project is "only accessible through the `*.pages.dev` subdomain you chose when creating your project." — [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- Add a custom domain via Pages project > Custom domains > Set up a domain. An apex domain needs a Cloudflare zone; a subdomain can use a CNAME. — [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- To retire the pages.dev URL, use Bulk Redirects from `*.pages.dev` to the custom domain. — [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- "Cloudflare may change Cloudflare Workers/Pages subdomain names of projects hosted at workers.dev or pages.dev ... Cloudflare will attempt to provide you with at least one week prior notice". This right does not extend to custom domains. — [Developer Platform terms](https://www.cloudflare.com/service-specific-terms-developer-platform/)
- Deleting a project: may be blocked if over 100 deployments; use `wrangler pages deployment delete` first. — [Known issues](https://developers.cloudflare.com/pages/platform/known-issues/index.md)
- Browser Integrity Check cannot be turned off for a Pages project; clients with default library User-Agents may get HTTP 403 (error 1010). — [Known issues](https://developers.cloudflare.com/pages/platform/known-issues/index.md)

### Inferences
- The URL is stable unless the project is deleted or Cloudflare exercises its subdomain-change right. A client-side app using relative or root paths needs no code change when a custom domain is added.
- If the project is deleted, the `<name>.pages.dev` URL stops working (deployments and bindings go with it). Whether the name can be reclaimed by someone else was not documented.
- If the name is already taken, creation presumably fails or suggests a suffix. Pages names are normally unique globally, but this was not verified.

### Gaps
- NOT VERIFIED officially: global uniqueness of project names, a name suffix on collision, and availability of the name after deletion (re-use by others).

## 6. SPA/hash routing, service worker, manifest, headers

### Takeaway
CONFIRMED: Pages serves the root for unmatched paths when there is no top-level `404.html` ("assumes you are deploying a single-page application"). Hash routing needs no server support. Default Cache-Control for static assets is `public, max-age=0, must-revalidate`, which is revalidating (not long-lived), plus ETag. A `_headers` file can override this.

### Cited Findings
- "Pages assumes that you are deploying a single-page application" when there is no top-level `404.html`; unmatched paths get the root, so client-side routes work. — [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- Default header: `Cache-Control: public, max-age=0, must-revalidate`, added "if the asset is cacheable". "In most situations, you should avoid setting up any custom caching on your site." — [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- "Pages always sends `Etag` headers for `200 OK` responses"; matching `If-None-Match` returns 304. — [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- `_headers`: "a plain text file called `_headers` without a file extension, in the static asset directory of your project". For Vite, put it in `public/` so it lands in `dist/`. Format: a URL pattern on one line, then indented `name: value`. — [Headers](https://developers.cloudflare.com/pages/configuration/headers/)
- Example: `/static/*` then `  Cache-Control: public, max-age=31556952, immutable`. — [Headers](https://developers.cloudflare.com/pages/configuration/headers/)
- Headers in `_headers` "override what Cloudflare ordinarily sends"; repeated headers are merged with commas; prefix `!` removes a header. — [Headers](https://developers.cloudflare.com/pages/configuration/headers/)
- SECONDARY (not Cloudflare official): a third-party Pages-hosted doc describes bypassing cache for `/sw.js` and purging after deploy. — [lantern docs](https://lantern-docs-dev.pages.dev/engineering/github/workflows/CLOUDFLARE_CACHE_SETUP)

### Inferences
- The default `max-age=0, must-revalidate` plus ETag means a new `sw.js` should be picked up on the next fetch, so the default is low-risk for stale service workers. Optionally add to `public/_headers`: `/sw.js` then `  Cache-Control: no-cache`. Verify with `curl -I https://<project>.pages.dev/sw.js`.
- Hash routing (`#/...`) never reaches the server, so no fallback is needed.
- Any stale-app issue would more likely come from the service worker's own cache (precache of index.html) than from server headers.

### Gaps
- Not verified by a live deploy: actual response headers for `/sw.js` and `manifest.webmanifest`. The Content-Type for `.webmanifest` was not checked in the docs.
- The Pages docs fetched did not state what applies to `/sw.js` specifically.

## 7. Direct Upload vs Git integration; migration

### Takeaway
CONFIRMED: Direct Upload projects cannot be switched to Git later. The migration path is to create a new project with Git integration. The reverse is also true: Git projects cannot switch to Direct Upload.

### Cited Findings
- "If you choose Direct Upload, you cannot switch to Git integration later." A new project with Git integration is needed for automatic deployments. — [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- "If you deploy using the Git integration, you cannot switch to Direct Upload later." To change repositories you must delete the project and create a new one. — [Known issues](https://developers.cloudflare.com/pages/platform/known-issues/index.md)
- Drag-and-drop uploads that fail on a large asset can be deleted but not replaced; you must re-upload the project. — [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)

### Inferences
- A new Git project gets a new `<name>.pages.dev` URL. Choosing a new name and re-pointing a custom domain is the migration cost, so choose Git integration from the start if the URL matters and GitHub push deploys are wanted (the build quota of 500/month is ample).
- Direct Upload with Wrangler (up to 20,000 files) avoids Cloudflare builds entirely.

### Gaps
- No official migration tool or in-place conversion was found.
