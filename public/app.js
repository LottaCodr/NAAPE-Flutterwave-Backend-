(() => {
  'use strict';

  const endpoints = [
    ['Identity','POST','/api/v1/auth/register','Create a member account','Public','Register securely with name, email, and password. New accounts always begin with the member role.'],
    ['Identity','POST','/api/v1/auth/login','Sign in with email','Public','Authenticate with email and password and receive a signed JWT.'],
    ['Identity','POST','/api/v1/auth/google','Sign in with Google','Public','Verify a Google identity credential and create or connect a member account.'],
    ['Identity','POST','/api/v1/auth/forgot-password','Request a password reset','Public','Send a time-limited reset link without revealing whether an account exists.'],
    ['Identity','POST','/api/v1/auth/reset-password/:token','Reset a password','Public','Set a new password using a valid, unexpired reset token.'],
    ['Identity','GET','/api/v1/users/profile','Get my profile','Member','Return the authenticated user profile and publication statistics.'],
    ['Identity','PUT','/api/v1/users/profile','Update my profile','Member','Update personal, professional, and profile-image information.'],
    ['Identity','PATCH','/api/v1/users/change-password','Change my password','Member','Verify the current password and set a new secure password.'],
    ['Admin','GET','/api/v1/users','List users','Admin','Return all platform users without password or reset-token data.'],
    ['Admin','GET','/api/v1/users/members','List members','Admin','Return users with the member role.'],
    ['Admin','PATCH','/api/v1/users/:id/role','Change a user role','Admin','Assign the member, editor, or administrator role to another account.'],
    ['Publishing','GET','/api/v1/publications','List publications','Public','Return approved publications. Editors can filter the moderation queue by status.'],
    ['Publishing','POST','/api/v1/publications','Submit a publication','Member','Submit a new aviation publication for editorial review.'],
    ['Publishing','GET','/api/v1/publications/my','List my publications','Member','Return the authenticated author’s pending, approved, and rejected work.'],
    ['Publishing','GET','/api/v1/publications/:id','Get a publication','Public','Return approved content, or let an authenticated author preview their own draft.'],
    ['Publishing','PATCH','/api/v1/publications/my/:id','Update my publication','Member','Revise pending or rejected work and return it to the review queue.'],
    ['Publishing','DELETE','/api/v1/publications/my/:id','Delete my publication','Member','Delete owned work that has not yet been approved.'],
    ['Publishing','PATCH','/api/v1/publications/:id/approve','Approve a publication','Editor','Publish a reviewed submission and notify its author.'],
    ['Publishing','PATCH','/api/v1/publications/:id/reject','Reject a publication','Editor','Reject a submission with an optional reason for the author.'],
    ['Publishing','POST','/api/v1/comments/:publicationId','Add a comment','Member','Add a comment to an approved publication.'],
    ['Publishing','GET','/api/v1/comments/:publicationId','List comments','Member','Return comments for a publication in reverse chronological order.'],
    ['Publishing','DELETE','/api/v1/comments/delete/:commentId','Delete a comment','Member','Delete an owned comment; administrators may moderate any comment.'],
    ['Publishing','GET','/api/v1/news','List news','Public','Return all NAAPE news articles with author attribution.'],
    ['Publishing','GET','/api/v1/news/:id','Get a news article','Public','Return one news article by its resource ID.'],
    ['Publishing','POST','/api/v1/news','Publish news','Editor','Create a news item and notify relevant members.'],
    ['Identity','GET','/api/v1/notifications','List my notifications','Member','Return the authenticated member’s notification inbox.'],
    ['Identity','PATCH','/api/v1/notifications/:id/read','Mark notification read','Member','Mark one owned notification as read.'],
    ['Identity','PATCH','/api/v1/notifications/read-all','Mark all notifications read','Member','Mark all unread notifications for the current account as read.'],
    ['Identity','DELETE','/api/v1/notifications/:id','Delete a notification','Member','Remove one notification owned by the current account.'],
    ['Events','GET','/api/v1/events','List events','Public','Return upcoming and previous NAAPE events without attendee payment data.'],
    ['Events','GET','/api/v1/events/:id','Get an event','Public','Return public information for one event.'],
    ['Events','GET','/api/v1/events/my-events','List my events','Member','Return events for which the current user is registered.'],
    ['Events','POST','/api/v1/events','Create an event','Admin','Create a free or paid event with an optional image.'],
    ['Payments','POST','/api/v1/payments/events/register','Register for an event','Member','Register immediately for a free event or initialize hosted checkout for a paid event.'],
    ['Payments','GET','/api/v1/payments/events/verify','Verify event payment','Member','Verify transaction ownership, amount, currency, and event metadata.'],
    ['Payments','GET','/api/v1/payments/events/status','Get event payment status','Member','Return the current member’s registration and payment state for an event.'],
    ['Payments','POST','/api/v1/payments/subscription/initialize-payment','Start subscription checkout','Member','Initialize Flutterwave checkout for an active basic or premium plan.'],
    ['Payments','GET','/api/v1/payments/subscription/verify','Verify subscription payment','Member','Validate transaction ownership and activate the matching plan idempotently.'],
    ['Payments','GET','/api/v1/payments/subscription/status','Get subscription status','Member','Return the current tier, validity dates, interval, and included features.'],
    ['Payments','GET','/api/v1/payments/history/:userId','Get payment history','Member','Return owned payment history; administrators may inspect another user when required.'],
    ['Payments','POST','/api/v1/payments/create-link','Create a payment link','Member','Create a hosted Flutterwave payment link for the authenticated customer.'],
    ['Admin','POST','/api/v1/payments/plans','Create a Flutterwave plan','Admin','Create a recurring plan directly with Flutterwave.'],
    ['Admin','POST','/api/v1/payments/recipients','Create a transfer recipient','Admin','Create a verified bank-transfer recipient.'],
    ['Admin','POST','/api/v1/payments/transfers','Create a transfer','Admin','Initiate a privileged payout to an existing recipient.'],
    ['Payments','GET','/api/v1/plans','List subscription plans','Public','Return active subscription plans ordered by price.'],
    ['Admin','POST','/api/v1/plans','Save a subscription plan','Admin','Save an approved Flutterwave plan and its member-facing features.'],
    ['Identity','POST','/api/v1/membership-form','Submit membership application','Public','Submit a rate-limited NAAPE membership application.'],
    ['Admin','GET','/api/v1/membership-form','List applications','Admin','Return submitted membership applications for authorized review.'],
    ['Admin','GET','/api/v1/membership-form/:id','Get an application','Admin','Return one membership application.'],
    ['Admin','PATCH','/api/v1/membership-form/:id','Update an application','Admin','Update a membership application during review.'],
    ['Admin','DELETE','/api/v1/membership-form/:id','Delete an application','Admin','Permanently remove a membership application.'],
    ['Admin','GET','/api/v1/stats','Get platform statistics','Editor','Return user and publication totals for the administrative dashboard.'],
    ['Identity','GET','/api/v1/member-dashboard','Get member statistics','Member','Return publication status totals for the current member.'],
    ['Publishing','POST','/api/v1/ai-title/suggest-title','Suggest publication titles','Member','Generate up to five professional titles from supplied aviation content.']
  ].map(([group,method,path,summary,access,description], index) => ({group,method,path,summary,access,description,id:`endpoint-${index}`}));

  const state = { filter: 'All', query: '', step: 1, lang: 'curl' };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const baseUrl = location.origin;
  let toastTimer;

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const lockIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5a3 3 0 0 1 6 0v2M3.5 7h9v7h-9z"/></svg>';

  function renderEndpoints() {
    const query = state.query.trim().toLowerCase();
    const matches = endpoints.filter(item => {
      const filterMatch = state.filter === 'All' || item.group === state.filter;
      const textMatch = !query || [item.path,item.summary,item.description,item.method,item.group,item.access].join(' ').toLowerCase().includes(query);
      return filterMatch && textMatch;
    });
    const groups = [...new Set(matches.map(item => item.group))];
    $('#endpoint-list').innerHTML = groups.map(group => `
      <section class="endpoint-group" aria-labelledby="group-${group}">
        <div class="group-heading" id="group-${group}">${escapeHtml(group)} · ${matches.filter(item => item.group === group).length}</div>
        ${matches.filter(item => item.group === group).map(item => `
          <div class="endpoint-row" id="${item.id}">
            <button class="endpoint-summary" type="button" aria-expanded="false" aria-controls="${item.id}-detail">
              <span class="method ${item.method.toLowerCase()}">${item.method}</span>
              <code class="endpoint-path">${escapeHtml(item.path)}</code>
              <span class="endpoint-desc">${escapeHtml(item.summary)}</span>
              <svg class="endpoint-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>
            </button>
            <div class="endpoint-detail" id="${item.id}-detail">
              <div class="endpoint-detail-inner"><p>${escapeHtml(item.description)}</p><span class="access-badge">${item.access === 'Public' ? '' : lockIcon}${escapeHtml(item.access)}</span></div>
            </div>
          </div>`).join('')}
      </section>`).join('');
    $('#endpoint-list').hidden = matches.length === 0;
    $('#endpoint-empty').hidden = matches.length !== 0;
    $$('.endpoint-summary', $('#endpoint-list')).forEach(button => button.addEventListener('click', () => {
      const row = button.closest('.endpoint-row');
      const open = row.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    }));
  }

  const snippets = {
    1: {
      curl: () => `<span class="token-method">curl</span> <span class="token-url">${baseUrl}/api/v1</span> \\\n  -H <span class="token-string">"Accept: application/json"</span>`,
      javascript: () => `<span class="token-key">const</span> response = <span class="token-key">await</span> fetch(<span class="token-string">'${baseUrl}/api/v1'</span>);\n<span class="token-key">const</span> api = <span class="token-key">await</span> response.json();\nconsole.log(api);`
    },
    2: {
      curl: () => `<span class="token-method">curl</span> -X POST <span class="token-url">${baseUrl}/api/v1/auth/register</span> \\\n  -H <span class="token-string">"Content-Type: application/json"</span> \\\n  -d <span class="token-string">'{"name":"Ada Pilot","email":"ada@example.com","password":"secure-password"}'</span>`,
      javascript: () => `<span class="token-key">const</span> response = <span class="token-key">await</span> fetch(<span class="token-string">'${baseUrl}/api/v1/auth/register'</span>, {\n  method: <span class="token-string">'POST'</span>,\n  headers: { <span class="token-string">'Content-Type'</span>: <span class="token-string">'application/json'</span> },\n  body: JSON.stringify({ name: <span class="token-string">'Ada Pilot'</span>, email: <span class="token-string">'ada@example.com'</span>, password: <span class="token-string">'secure-password'</span> })\n});`
    },
    3: {
      curl: () => `<span class="token-method">curl</span> <span class="token-url">${baseUrl}/api/v1/users/profile</span> \\\n  -H <span class="token-string">"Authorization: Bearer YOUR_JWT_TOKEN"</span>`,
      javascript: () => `<span class="token-key">const</span> profile = <span class="token-key">await</span> fetch(<span class="token-string">'${baseUrl}/api/v1/users/profile'</span>, {\n  headers: { Authorization: <span class="token-string">'Bearer YOUR_JWT_TOKEN'</span> }\n}).then(response => response.json());`
    }
  };

  function renderSnippet() {
    $('#quick-code code').innerHTML = snippets[state.step][state.lang]();
    $$('.step').forEach((step, index) => step.classList.toggle('active', index + 1 === state.step));
  }

  function copyText(text, button) {
    const fallback = () => {
      const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select(); document.execCommand('copy'); area.remove();
    };
    (navigator.clipboard?.writeText(text) || Promise.resolve().then(fallback)).then(() => {
      const label = $('span', button); if (label) { const old = label.textContent; label.textContent = 'Copied'; setTimeout(() => label.textContent = old, 1400); }
      clearTimeout(toastTimer); $('#toast').classList.add('show'); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 1700);
    }).catch(fallback);
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('naape-theme', theme);
    $('#theme-toggle').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#081229' : '#0b1739';
  }

  function closeMenu() { document.body.classList.remove('menu-open'); $('#menu-toggle').setAttribute('aria-expanded','false'); }

  async function checkHealth() {
    const label = $('#health-label'), title = $('#health-title'), copy = $('#health-copy');
    try {
      const response = await fetch('/health', { headers: { Accept: 'application/json' } });
      const result = await response.json();
      if (result.status === 'ok') {
        label.classList.add('good'); label.lastChild.textContent = ' Operational'; title.textContent = 'All systems operational'; copy.textContent = 'The API and database are connected and ready to serve requests.';
      } else {
        label.classList.add('bad'); label.lastChild.textContent = ' Degraded'; title.textContent = 'API reachable'; copy.textContent = 'The service is online, but the database is not currently connected.';
      }
    } catch {
      label.classList.add('bad'); label.lastChild.textContent = ' Unavailable'; title.textContent = 'Health check unavailable'; copy.textContent = 'The live status endpoint could not be reached from this browser.';
    }
  }

  function init() {
    $('.count').textContent = endpoints.length;
    $('#base-url-label').textContent = baseUrl;
    $('#webhook-url').textContent = `${baseUrl}/webhook/flutterwave`;
    renderEndpoints(); renderSnippet(); checkHealth();

    const preferred = localStorage.getItem('naape-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferred);
    $('#theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
    $('#menu-toggle').addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); $('#menu-toggle').setAttribute('aria-expanded', String(open)); });
    $('#scrim').addEventListener('click', closeMenu);
    $$('.side-link').forEach(link => link.addEventListener('click', closeMenu));

    $$('.code-tab').forEach(tab => tab.addEventListener('click', () => {
      state.lang = tab.dataset.lang; $$('.code-tab').forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); }); renderSnippet();
    }));
    $$('.step button').forEach(button => button.addEventListener('click', () => { state.step = Number(button.dataset.step); renderSnippet(); }));
    $$('.copy-button').forEach(button => button.addEventListener('click', () => {
      const target = button.dataset.copyTarget && document.getElementById(button.dataset.copyTarget);
      copyText(button.dataset.copyText || target?.textContent || '', button);
    }));

    $('#endpoint-search').addEventListener('input', event => { state.query = event.target.value; renderEndpoints(); });
    $$('.filter-chip').forEach(chip => chip.addEventListener('click', () => {
      state.filter = chip.dataset.filter; $$('.filter-chip').forEach(item => item.classList.toggle('active', item === chip)); renderEndpoints();
    }));
    $$('[data-filter-link]').forEach(link => link.addEventListener('click', () => {
      state.filter = link.dataset.filterLink; $$('.filter-chip').forEach(item => item.classList.toggle('active', item.dataset.filter === state.filter)); renderEndpoints();
    }));
    $('#clear-search').addEventListener('click', () => { state.query = ''; state.filter = 'All'; $('#endpoint-search').value = ''; $$('.filter-chip').forEach(item => item.classList.toggle('active', item.dataset.filter === 'All')); renderEndpoints(); $('#endpoint-search').focus(); });
    document.addEventListener('keydown', event => {
      if (event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#endpoint-search').focus(); }
      if (event.key === 'Escape') closeMenu();
    });

    const sections = $$('.section-anchor');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) $$('.side-link[href^="#"]').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }), { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(section => observer.observe(section));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
