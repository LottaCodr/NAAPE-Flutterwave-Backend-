# NAAPE Developer Platform — UI/UX Research and Design Rationale

## Product context

This repository is an API rather than the member-facing frontend. Its primary browser experience is therefore a developer portal for frontend engineers, integration partners, QA teams, and platform administrators. The redesign treats documentation as a product experience—not as a marketing splash page.

NAAPE’s public site establishes the organisation as the umbrella professional body for aircraft pilots and engineers, formed from APFEAN and NAAAET in 1984. Its important public journeys include membership, publications, events, galleries, and downloads. The developer portal translates those same service areas into a technical information architecture.

## Research findings

### 1. Optimize for time to first successful request

Modern developer portals should make APIs discoverable, understandable, testable, and consumable without manual support. A key success metric is time to first successful API call.

**Design response**

- A three-step quick start appears before the full endpoint catalogue.
- Code can be switched between cURL and JavaScript.
- Examples automatically use the current environment’s base URL.
- Every code block has a copy action and confirmation feedback.
- Authentication guidance follows the first public request rather than blocking it.

Reference: [DigitalAPI — API developer portal](https://www.digitalapi.ai/blogs/api-developer-portal)

### 2. Use progressive disclosure to control complexity

Nielsen Norman Group recommends showing frequently needed information first and revealing specialized details on request. The control must clearly communicate what users will find.

**Design response**

- Endpoint rows initially show method, path, and purpose.
- Selecting a row reveals authorization and implementation detail.
- Product-area filters and search prevent a long catalogue from becoming a wall of text.
- The sidebar separates onboarding, reference, and operational resources.

Reference: [Nielsen Norman Group — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)

### 3. Organize around user goals, not internal source files

Developer onboarding works best as a guided journey: understand the API, choose a use case, get access, make a first request, handle errors, then move to production.

**Design response**

- Capabilities are named Identity & Membership, Publishing & Knowledge, and Events & Payments.
- The API reference is grouped using the same product language.
- Errors, webhooks, system health, and release notes are first-class destinations.
- Role requirements use recognizable Member, Editor, and Admin labels.

Reference: [Developer Portals and API Knowledge Bases](https://knowledge-base.software/guides/developer-portals-and-api-knowledge-bases/)

### 4. Reflect association-member priorities

Association websites should make resources easy to access, streamline event registration, amplify member voices, and empower self-service. NAAPE’s public site also prioritizes membership, publications, events, and professional history.

**Design response**

- The content hierarchy mirrors real member journeys exposed by the API.
- Aviation language is restrained and functional rather than decorative.
- Live service status supports administrators and integration teams.
- Support contact remains consistently accessible in the sidebar and footer.

References:

- [Official NAAPE website](https://naape.org.ng/)
- [Orbit Media — Association web design](https://www.orbitmedia.com/association-web-design/)

### 5. Build accessibility into interaction design

WCAG 2.2 emphasizes visible keyboard focus, unobscured focus, sufficiently large targets, semantic structure, and predictable help.

**Design response**

- Semantic landmarks, headings, navigation labels, buttons, and status regions.
- A skip link and high-visibility `:focus-visible` treatment.
- Interactive targets are at least 36–46 pixels in primary flows.
- Full keyboard access for endpoint disclosure, themes, filters, steps, and mobile navigation.
- Reduced-motion support disables radar animation and transitions.
- Status is conveyed with text in addition to colour.
- Responsive layouts preserve reading order and avoid horizontal page scrolling.

Reference: [W3C Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)

## Information architecture

1. **Overview** — purpose, trust signals, and live health
2. **Capabilities** — product-oriented API discovery
3. **Quick start** — first public call, registration, authenticated call
4. **Authentication** — Bearer token pattern and role model
5. **API reference** — searchable, filterable endpoint catalogue
6. **Errors** — status-code recovery guidance and response shape
7. **Webhooks** — payment-event setup and trust model
8. **Changelog** — version awareness and release context
9. **Support and system health** — consistently available operational help

## Visual direction

The visual language balances institutional trust with technical precision:

- Deep navy communicates aviation, reliability, and operational seriousness.
- Blue is reserved for actions, links, and active states.
- Green, amber, and red have consistent semantic status roles.
- System fonts avoid render-blocking dependencies and improve privacy/performance.
- Monospace type is used only where it improves technical scanning.
- The radar/status visual establishes context without competing with tasks.

## Usability and quality metrics

Recommended post-launch measures:

- Median time from portal entry to first successful API call
- Search terms that return zero endpoint matches
- Copy-action use by quick-start step and language
- Authentication-related 401/403 rates by endpoint
- API error rate and repeated failure sequences
- Health-page visits during incidents
- Support requests grouped by missing documentation topic
- Keyboard-only and screen-reader task completion in each release
- Lighthouse accessibility and performance checks in CI

## Future work

- Generate the endpoint catalogue from an OpenAPI 3.1 specification to prevent documentation drift.
- Add schema examples and an authenticated sandbox for safe requests.
- Add API version migration guides and a machine-readable changelog.
- Add an incident-history view rather than only current health.
- Instrument privacy-respecting documentation analytics.
- Run task-based usability sessions with a frontend engineer, QA analyst, NAAPE administrator, and new integration partner.
