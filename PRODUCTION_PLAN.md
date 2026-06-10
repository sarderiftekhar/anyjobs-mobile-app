# AnyJobs Mobile — Production Plan

Scope is mobile-to-web parity for **Candidate**, **Employer**, and **Admin** roles only.
Agent and Editor roles, CV Builder suite, Market Trends, CV Library, CV Verification,
Support Tickets, Smart Matches, Career Events, Video Calls, Two-Factor Auth, Email
Verification flow, Appearance/Theme, and the admin items listed below are **out of scope**.

Each item notes whether it needs backend work (a new `Mobile\*` controller + route in
`C:\laragon\www\anyjobs\routes\api.php` under `/v1/mobile`) or can be built client-only
against existing mobile endpoints. Sizes: **S** ≈ ½ day, **M** ≈ 1–2 days, **L** ≈ 3+ days.

---

## Phase 0 — Finish the scaffolded screens already in the working tree

These files exist untracked in `app/` and `src/` but are not wired. Close them out first.

- [ ] **Employer › Interviews** full flow (index, `[id]`, schedule, reschedule, `_form`) — M — **backend needed** (no `Mobile\InterviewController` yet)
- [ ] **Employer › Analytics** (index + `job/` subroute) — M — **backend needed**
- [ ] **Employer › Talent** browse + `[id]` — M — **backend needed**
- [ ] **Employer › Resume Alerts** (index + `matches/`) — M — **backend needed**
- [ ] **Employer › Company › gallery + edit** — S — **backend needed** (gallery endpoints not in `/v1/mobile`)
- [ ] **Employer › Job templates** — S — **backend needed**
- [ ] **Candidate › Interviews** — M — **backend needed**
- [ ] **Candidate › Recommendations** — S — **backend needed** (server side exists as `CandidateController@recommendations`; needs mobile wrapper)
- [ ] **Admin tabs** shell — wire to dashboard/online-users only for now — S — client-only
- [ ] **AI components** (`AIGenerateModal`, `MatchScoreCard`) integrated where employer/candidate flows need them — S — client-only

---

## Phase 1 — Candidate parity  ✅ COMPLETE (2026-06-10), except billing (deferred)

### Job discovery
- [x] Browse jobs (`/jobs/browse` equivalent)
- [x] Report job — `POST /v1/mobile/jobs/{id}/report` + `JobReport` model; job detail "flag" action
- [x] Share job — RN `Share` sheet on job detail
- [x] Saved jobs bulk-apply — `POST /v1/mobile/jobs/saved/bulk-apply`; multi-select on Saved tab
- [x] Saved jobs bulk-remove — `POST /v1/mobile/jobs/saved/bulk-remove`

### Applications
- [x] Per-application messages thread — `GET /v1/mobile/applications/{id}/conversation` (find-or-create); "Message employer" on each application
- [x] Upload documents on apply — apply flow accepts portfolio docs via multipart `applyWithFiles`

### Interviews (candidate side)
- [x] Confirm / Reschedule / Cancel — reschedule modal added; all wired to `/v1/mobile/candidate/interviews/*`
- [~] Start / Complete — employer-driven; not exposed candidate-side by design
- [x] Upcoming / History list — interviews list returns `upcoming` + `past` tabs

### Profile
- [x] Profile Analysis (AI) — show / generate / confirm / regenerate / check-regeneration (routed to existing `ProfileAnalysisController`)
- [x] Profile Insights — index + data-by-type + refresh (`ProfileInsightsService`)
- [x] Granular section updates: basic-info, professional, contact, location, preferences, privacy (`profile/edit/[section]`)
- [x] Cover letter library + AI generate — `Mobile\CoverLetterController`; manager screen + job-scoped AI generation
- [x] Resume sections: certifications / languages / references (JSON on profile; new `references` column)

### Other candidate features
- [x] Career Path Planner — `GET /v1/mobile/candidate/career-path`
- [x] Courses (list only) — `GET /v1/mobile/candidate/courses`
- [x] Cover Letter AI page + generation UI — `cover-letter-ai` screen (job-scoped), save to library
- [x] Interview Prep page — `GET /v1/mobile/candidate/interview-prep`
- [x] Job Alerts (CRUD + toggle) — `Mobile\JobAlertController`; list + editor screens
- [x] Candidate Activities (index + recent) — `GET /v1/mobile/candidate/activities[/recent]`
- [x] Settings → notification preferences / privacy / job preferences (granular)
- [ ] Subscription & Billing (Stripe) — **DEFERRED** (needs Stripe SDK + custom dev build + store-policy work)
- [x] Onboarding — mobile wizard wired to `Mobile\OnboardingController`; gated in `AuthRedirect` via `needs_onboarding`

---

## Phase 2 — Employer parity

- [ ] Onboarding screen — M — **backend needed**
- [ ] Applications Center (list, detail, shortlist/unshortlist/reject) — M — **backend needed**
- [ ] Messages Center — S — **backend needed**
- [ ] Company profile granular: logo, banner, gallery (upload/reorder/clear), privacy, values, benefits, address — M — **backend needed** (extend `Mobile\EmployerController`)
- [ ] Image-based job posting (create-from-image, update-image) — M — **backend needed**
- [ ] Job status actions: publish, pause, resume, close, archive/unarchive, duplicate — S — **backend needed**
- [ ] Job bulk actions — S — **backend needed**
- [ ] Per-job analytics — M — **backend needed**
- [ ] Applications: rate, schedule interview, unshortlist, bulk actions, file download by type/index — M — **backend needed**
- [ ] Interviews (full flow) — CRUD + start/complete/cancel/reschedule + upcoming/today/stats — M — **backend needed** (shared with candidate side)
- [ ] Shortlisted candidates list — S — **backend needed**
- [ ] Resume Alerts (full CRUD) — M — **backend needed**
- [ ] Browse Talent — M — **backend needed**
- [ ] Password management — S — **backend needed**
- [ ] Profile deletion — S — **backend needed**
- [ ] Subscription & Billing (packages, purchase, success, cancel, billing portal, usage stats) — **L** — **backend needed** + Stripe SDK on device
- [ ] Notifications: read, mark-all-read, delete, clear-read — S — **backend needed**

---

## Phase 3 — Admin parity (trimmed scope)

Only the items below. Out of scope for admin: agent management, publisher management,
support tickets (admin side), reports, broadcast messaging, progress tracker.

- [ ] User management — CRUD + bulk + toggle verification/lock — M — **backend needed**
- [ ] Candidate management — edit, verify/unverify, upgrade subscription, bulk — M — **backend needed**
- [ ] Employer management — verify, suspend, activate, upgrade subscription, bulk — M — **backend needed**
- [ ] Subscriptions management — plans, users list, upgrade/extend/cancel, bulk — M — **backend needed**
- [ ] Jobs moderation — approve/reject + bulk — S — **backend needed**
- [ ] Applications moderation — approve/reject + bulk — S — **backend needed**
- [ ] Content Moderation — jobs, profiles, reports, history, report review — M — **backend needed**
- [ ] Support chat (visitor messages: reply, resolve, delete) — M — **backend needed**
- [ ] Admin notifications — list, unresolved, stats, read, resolve, archive, bulk, settings — M — **backend needed**
- [ ] System settings — password, login history, notifications, platform, API keys — M — **backend needed**
- [ ] System logs viewer — S — **backend needed**
- [ ] Hidden user list + reset password — S — **backend needed**

---

## Phase 4 — Cross-cutting infrastructure

- [ ] Real-time messaging (Laravel Echo broadcast auth or polling upgrade) — M — **backend needed** (broadcast channel auth for Sanctum)
- [ ] Push delivery verified end-to-end — server → Expo push ticket → device — S — **backend needed** (wire delivery to events like MessageReceived, JobApplicationSubmitted, InterviewStarted)
- [ ] Stripe SDK + billing flow shared between candidate + employer — L — **backend needed** (mobile purchase endpoints + receipt verification)
- [ ] Phone validation (Twilio) on signup/profile forms — S — **backend needed** (endpoint exists, needs mobile wrapper)
- [ ] App version-check gate (force-upgrade screen) — S — client-only (endpoint exists)
- [ ] Activity / feature-usage tracking — S — **backend needed** (Candidate events already emitted server-side; ensure mobile actions hit them)
- [ ] Rate-limit aware retry/backoff in API client — S — client-only
- [ ] Geolocation pickers (autocomplete, geocode, reverse-geocode, countries/states/cities, nearby jobs) — M — **backend needed**
- [ ] Google OAuth — user-type selection after first sign-in — S — **backend needed** (web flow exists; needs mobile deep-link + selection screen)

---

## Out of scope (explicitly excluded per product decision)

- Agent role (onboarding, dashboard, settings, agencies)
- Editor role (dashboard, settings)
- Smart Matches
- CV Builder (basic + advanced + analysis + AI content + tailoring + ATS + achievement quantifier + interview questions + temp data)
- Career Events
- Market Trends analytics
- CV verification check/process
- CV Library (employer)
- Support Tickets (candidate + employer)
- Admin: Agent management, Publisher management, Support tickets (admin), Reports, Broadcast messaging, Progress tracker
- Two-Factor Authentication
- Email verification deep-link flow
- Appearance / Theme settings
- Video calls (WebRTC) — both candidate and employer sides

---

## Suggested build order

1. **Phase 0** — close untracked scaffolds (ship visible progress fast)
2. **Phase 4 infra** partially — push delivery + real-time messaging (unblocks parity for both roles)
3. **Phase 1** — candidate parity (largest user base)
4. **Phase 2** — employer parity
5. **Phase 3** — admin (trimmed)
6. **Phase 4 infra** remainder — Stripe billing, geolocation pickers, version gate

## Backend work notes

Most of this requires new `Mobile\*` controllers and routes in
`C:\laragon\www\anyjobs\app\Http\Controllers\Api\Mobile\` and
`C:\laragon\www\anyjobs\routes\api.php` under the `/v1/mobile` prefix. Current mobile
API surface covers only auth, jobs, applications, profile (partial), CV upload,
messages, notifications, device token, employer basics, cover-letter AI, version check.
Everything else needs a thin `Mobile\*` wrapper over existing business logic — not a
rewrite.
