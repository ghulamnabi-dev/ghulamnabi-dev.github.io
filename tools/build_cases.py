#!/usr/bin/env python3
"""Generate work/<project>/index.html from one template, so the three case studies stay consistent.
Run from the site root: python3 tools/build_cases.py"""
import html
import os

import tech_notes

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMAIL = 'ghulamnabi7885@gmail.com'


def fig(src, caption, alt, cls='shot'):
    return (f'<figure class="{cls}"><img src="../../img/{src}" alt="{html.escape(alt)}" loading="lazy" decoding="async">'
            f'<figcaption>{caption}</figcaption></figure>')


def loop(name, caption, label):
    return (f'<figure class="shot"><video data-loop muted loop playsinline preload="none" poster="../../media/{name}-poster.jpg" aria-label="{html.escape(label)}">'
            f'<source src="../../media/{name}.webm" type="video/webm"><source src="../../media/{name}.mp4" type="video/mp4"></video>'
            f'<figcaption>{caption}</figcaption></figure>')


def pair(wide, narrow, caption, alt_wide, alt_narrow):
    return (f'<figure class="shot shot--pair"><img src="../../img/{wide}" alt="{html.escape(alt_wide)}" loading="lazy" decoding="async">'
            f'<img src="../../img/{narrow}" alt="{html.escape(alt_narrow)}" loading="lazy" decoding="async"><figcaption>{caption}</figcaption></figure>')


PROJECTS = {}

# --------------------------------------------------------------------------------------------- TechZone
PROJECTS['techzone'] = dict(
    key='tz', name='TechZone', youtube='zRxEUyW1uIs', length='2:48', poster='tz-loop-rates-poster.jpg',
    title='TechZone, a PC-parts marketplace: case study by Ghulam Nabi',
    description='How TechZone works: a storefront built around today’s rates, a PC builder that checks compatibility on the server, and a back-office with order timelines, a stock ledger and scoped partner sellers. PHP 8 and MariaDB, no framework.',
    lede='A PC-parts marketplace for Lahore: a storefront built around today’s rates, a PC builder that only offers parts that fit, and a back-office a real shop could run.',
    facts=[('My part', 'Everything: design, database, code and tests'), ('Built', '2025 to 2026'),
           ('Stack', 'PHP 8, MariaDB, plain JavaScript, AG Grid'), ('Code', '<a href="https://github.com/ghulamnabi-dev/TechZone">ghulamnabi-dev/TechZone</a>')],
    sections=[
        ('The brief', '''
<p>In Lahore, PC parts are bought in markets like Hafeez Centre and Hall Road, where prices move every week and the first question is always “aaj ka rate kya hai?”, what does it cost today. Building a PC adds a second problem: a processor, board, memory, case and power supply have to fit each other, and the mistakes are expensive.</p>
<p>TechZone is my answer to both, built as if a real shop were going to use it: the day’s rate is the headline, the builder will not let you pair parts that don’t fit, and the back-office covers what staff actually do all day, from confirming an order to explaining why the stock count is what it is.</p>
<p>I wrote it without a framework on purpose. I wanted to understand the parts a framework normally hides: sessions, CSRF protection, transactions, permissions. Everything security-related lives in one shared <code>core/</code> library that both the storefront and the admin use, so a fix lands once.</p>
'''),
        ('What it does', fig('techzone/07-catalogue.webp', 'The processor catalogue, with filters for socket and core count and the week’s price drops marked.', 'TechZone processor catalogue with product photos and filters') + '''
<ul>
<li><strong>Storefront.</strong> Today’s rates with a 12-week history for every part, a catalogue with filters per category (socket, cores, video memory and so on), comparison, wishlist, back-in-stock alerts, and checkout with cash on delivery.</li>
<li><strong>PC builder.</strong> Pick a processor and every list after it shows only the parts that fit, with the estimated power draw and the total at today’s prices.</li>
<li><strong>Back-office.</strong> Orders with a full timeline, a stock ledger, products with their specifications, discounts, shipping zones, staff roles and an activity log of every change.</li>
<li><strong>Marketplace.</strong> Partner shops apply to sell, get their own scoped view of the same back-office, and receive weekly payout statements.</li>
</ul>
'''),
        ('Decisions', '''
<h3>Compatibility rules are plain functions on the server</h3>
<p>The builder checks socket, memory type, motherboard size, graphics card length, cooler height and power, using each product’s specifications. The rules are pure functions in <code>core/builder.php</code>, used the same way by the storefront, its API and the admin, so there is one definition of “fits”.</p>
<p>A part that doesn’t fit isn’t silently hidden. The picker can list it with the reason, which turns a rejection into something a customer can learn from.</p>
''' + loop('tz-loop-builder', 'With a Ryzen 5 7600 chosen, the motherboard picker lists the AM5 boards, and below them the boards that don’t fit and why.', 'TechZone PC builder: the motherboard picker lists compatible boards and, below, incompatible ones with reasons') + '''
<p>The rules are only as good as the data, so the product editor has a Specifications card with the fields each part type needs. The values the builder compares are fixed choices, and a part cannot go live without them.</p>
''' + loop('tz-loop-specs', 'Clearing a graphics card’s length on a live product is refused: the builder needs it to check the case.', 'TechZone admin: clearing a required specification shows an error under the field') + '''
<h3>Checkout cannot sell what isn’t there</h3>
<p>Placing an order runs in one transaction. The product rows are locked in a fixed order, every line is re-priced from the database rather than trusted from the cart, and stock is reduced with a guarded update that fails if there isn’t enough. Anything that goes wrong rolls the whole order back.</p>
<p>To check it, I fired 12 checkouts at the same moment for a product with 3 units in stock. Exactly 3 orders went through and the stock ended at 0.</p>
<h3>Stock is a ledger, and orders have a timeline</h3>
<p>Stock never changes by editing a number. Every change is an adjustment row with a reason (received, sold, returned, damaged, correction) and the person who made it, and the seed and the migration both check that the adjustments add up to the stock on hand. Every step of an order is an event, and every change in the admin is written to an activity log with the old and new values.</p>
''' + fig('techzone/21-admin-order.webp', 'An order page: items, payment, shipping with the courier and tracking number, and the timeline of every step.', 'TechZone admin order page with payment, shipping and a timeline') + '''
<h3>Partner sellers are limited by the queries, not the menus</h3>
<p>The admin has four roles: owner, manager, staff and seller. A seller signs in to the same back-office but every query is scoped to their own products and to their lines on shared orders. Another shop’s order is a 404, not a page with the buttons hidden.</p>
''' + fig('techzone/28-seller-portal.webp', 'A seller’s view of an order that also contains another shop’s items: only their own lines are shown.', 'TechZone seller portal showing only the seller’s own items on an order') + '''
<h3>Security written by hand, and written down</h3>
<p>Prepared statements everywhere with emulation switched off; one CSRF token per session compared in constant time; session IDs renewed at every sign-in; sign-in throttling per IP and per session; the same message for an unknown e-mail and a wrong password; uploads checked by their content, not their name. Each of these, and the known gaps, is listed file by file in the project’s <a href="https://github.com/ghulamnabi-dev/TechZone/blob/main/docs/SECURITY.md">security notes</a>.</p>
'''),
        ('What I’d do differently', '''
<p>The automated checks are end to end: on every push, a CI job boots the real stack, seeds it and calls the real endpoints, including the security checks. There are no unit tests for the PHP functions themselves, and the builder rules are exactly the kind of code that should have them. That is the first thing I would add, followed by browser tests for checkout and the order flow.</p>
<p>For a real shop I would build on a framework such as Laravel. Writing sessions, CSRF and routing myself taught me what a framework does and why, which was the point, but I would not ask a client to maintain my versions of them.</p>
<p>Payments are a placeholder, the prices are demo data, and the content security policy is still in report-only mode until the last inline scripts move into files.</p>
'''),
    ],
    next='phonebook')

# --------------------------------------------------------------------------------------------- PhoneBook
PROJECTS['phonebook'] = dict(
    key='pb', name='PhoneBook', youtube='OrchwyS9jfs', length='1:25', poster='pb-loop-import-poster.jpg',
    title='PhoneBook, ASP.NET Core and Angular: case study by Ghulam Nabi',
    description='How PhoneBook works: a repository and unit of work with explicit transactions, all-or-nothing vCard import, per-user data isolation and tests that boot the real API. ASP.NET Core 9 and Angular 19.',
    lede='A contacts app used as a small, honest test of the patterns a business system needs: transactions, data that belongs to one user, a real file format, and tests that boot the real API.',
    facts=[('My part', 'Everything: API, client, tests and CI'), ('Built', '2026'),
           ('Stack', 'ASP.NET Core 9, EF Core, Angular 19'), ('Code', '<a href="https://github.com/ghulamnabi-dev/PhoneBook">ghulamnabi-dev/PhoneBook</a>')],
    sections=[
        ('The brief', '''
<p>A phone book is usually a beginner’s exercise. I rebuilt mine to practise what business software needs and small projects usually skip: one operation that touches several tables and either fully happens or doesn’t, data that must never leak between accounts, a standard file format that arrives full of mistakes, and tests that prove all of it over real HTTP.</p>
'''),
        ('What it does', fig('phonebook/cover.webp', 'Contacts on the left, the selected person on the right, with groups and the record beside the details.', 'PhoneBook with a contact list and a contact’s details') + '''
<ul>
<li>Each contact can have several numbers with labels, an e-mail, notes, groups and a favourite star.</li>
<li>Search matches names, companies, e-mails and any part of a number, however it was typed.</li>
<li>vCard 3.0 import and export: everything, one group, a selection, or a single contact.</li>
<li>Accounts with sign-in; each account sees only its own contacts and groups.</li>
</ul>
'''),
        ('Decisions', '''
<h3>Repositories stage changes; the unit of work commits them</h3>
<p>A repository in this project can add, remove and query, but it can never save. Saving, and opening or committing a transaction, belong to the unit of work, which holds every repository over one database context. A service that touches contacts, phones and groups therefore commits them together or not at all.</p>
<pre><code>// a repository only stages
void Add(T entity);
void Remove(T entity);
IQueryable&lt;T&gt; Query();

// the unit of work is the only way to persist
Task&lt;int&gt; SaveChangesAsync(CancellationToken ct = default);
Task BeginTransactionAsync(CancellationToken ct = default);
Task CommitAsync(CancellationToken ct = default);
Task RollbackAsync(CancellationToken ct = default);</code></pre>
<h3>An import is all or nothing</h3>
<p>A vCard file from a phone is rarely clean. The import writes contacts in batches of 50 inside one explicit transaction and keeps validating after the first problem, so it can report every bad card at once. Then it rolls back. Either the whole file is imported, or nothing is and the person knows exactly what to fix.</p>
''' + loop('pb-loop-import', 'A file with three bad cards: nothing is imported, and each problem names the card it came from.', 'PhoneBook import dialog listing every invalid card, with nothing imported') + '''
<h3>Someone else’s contact is a 404, not a 403</h3>
<p>Every query is scoped to the signed-in user. Asking for another account’s contact returns “not found” rather than “forbidden”, so the API never confirms that an id exists. A contact also cannot be put into another user’s group. Both rules have integration tests that sign in as two different people and try.</p>
<h3>Search follows how people type numbers</h3>
<p>The same number is stored as <code>+92 300 1234567</code> and typed as <code>0300-1234567</code>. Search compares digits rather than text and understands the local trunk prefix, so either form finds the contact.</p>
''' + fig('phonebook/2-search.webp', 'Searching “+92 30” finds every number that contains those digits, whatever the formatting.', 'PhoneBook search results for +92 30') + '''
<h3>The tests boot the real API</h3>
<p>The database provider is a configuration switch, so the integration tests start the actual application on in-memory SQLite and talk to it over HTTP: sign-up and sign-in, validation errors, other users’ data, search, paging, export and import. With the unit tests for the vCard reader and the unit of work, that is 36 tests on the server and 109 specs on the client, run on every push along with a Docker build.</p>
<ul class="tests">
<li>A_user_cannot_see_or_change_another_users_contact</li>
<li>Import_is_all_or_nothing_when_a_card_is_invalid</li>
<li>Search_with_local_trunk_prefix_finds_internationally_stored_number</li>
<li>Login_with_wrong_password_or_unknown_email_is_401_with_the_same_message</li>
</ul>
<h3>An interface that stays out of the way</h3>
<p>The client is Angular 19 with signals and Angular Material, laid out as a list and a detail pane. The detail pane uses a container query to move groups and the record beside the details when there is room, and avatars use five tones drawn from the accent colour so a long list reads as one palette. Dark mode is designed, not inverted.</p>
''' + pair('phonebook/6-dark.webp', 'phonebook/5b-mobile-detail.webp', 'Dark mode on a desktop, and a contact on a phone.', 'PhoneBook in dark mode', 'PhoneBook contact detail on a phone') + '''
'''),
        ('What I’d do differently', '''
<p>The client specs test components and services in isolation; the next step is a few browser tests that walk through sign-in, editing and import against the real API. I would also add contact photos, and put a demo online so it can be tried without cloning the code.</p>
'''),
    ],
    next='mohalla')

# --------------------------------------------------------------------------------------------- Mohalla
PROJECTS['mohalla'] = dict(
    key='mo', name='Mohalla', youtube='zd3m_JkKpFA', length='0:36', poster='mo-loop-statement-poster.jpg',
    title='Mohalla, housing-society finances: case study by Ghulam Nabi',
    description='How Mohalla works: a monthly ledger generated by a scheduled job, admin and viewer roles enforced in the API and the interface, and resident statements. ASP.NET Core 9, Angular 19, SQL Server.',
    lede='The books of a housing society: residents, monthly contributions, expenses, and a ledger that closes each month by itself and carries the balance forward.',
    facts=[('My part', 'Everything: API, client, tests and CI'), ('Built', '2025 to 2026'),
           ('Stack', 'ASP.NET Core 9, SQL Server, Hangfire, Angular 19'), ('Code', '<a href="https://github.com/ghulamnabi-dev/mohalla">ghulamnabi-dev/mohalla</a>')],
    sections=[
        ('The brief', '''
<p>A <em>mohalla</em> is a neighbourhood. In many of them in Pakistan, each house pays a monthly amount for the guard, the cleaner and the street lights, and a volunteer treasurer keeps the accounts in a notebook or a spreadsheet. The two questions that cause arguments are always the same: who is short this month, and how much is left?</p>
<p>Mohalla answers both without anyone doing arithmetic. The treasurer records payments and expenses, and everything else, totals, statements and the month’s closing balance, is calculated.</p>
'''),
        ('What it does', fig('mohalla/02-dashboard.webp', 'The dashboard: this month’s collection against what is expected, spending, the balance, and who hasn’t paid yet.', 'Mohalla dashboard with totals, a chart and the households yet to pay') + '''
<ul>
<li>Residents, with each household’s statement: what was due, paid and short, month by month.</li>
<li>Contributions and expenses, with categories, search and filters by month.</li>
<li>A monthly ledger: opening balance, collected, spent and closing balance, with a 12-month trend.</li>
<li>Two roles: admins record and manage, viewers see the same figures read-only.</li>
</ul>
'''),
        ('Decisions', '''
<h3>The ledger is generated, not typed</h3>
<p>A scheduled job runs just after midnight on the 1st of every month and opens the new month. The service calculates its totals and carries the previous month’s closing balance into the new opening balance, across the year boundary too. A payment recorded for an earlier month creates that month’s row if it is missing, so back-dated entries can’t break the chain.</p>
''' + fig('mohalla/07-ledger-dark.webp', 'The monthly ledger: each row opens with the previous month’s closing balance.', 'Mohalla monthly ledger in dark mode with a trend chart and a table of months') + '''
<h3>One rule for who can change things, enforced twice</h3>
<p>The role travels in the sign-in token. On the server, every write requires the admin role and a viewer gets a 403. In the client, a single directive driven by the same claim hides every button that changes data, so viewers never see a control they can’t use. The first account becomes the admin, and admins promote or demote others.</p>
<h3>Statements a household can follow</h3>
<p>Each resident’s page lists the months with what was due, what was paid and any shortfall, with a running balance. It is the screen a treasurer can show a resident at the door to settle a disagreement.</p>
''' + loop('mo-loop-statement', 'A household’s statement, then recording a payment from the same page.', 'Mohalla resident statement, then the record payment dialog') + '''
<h3>Errors land on the field that caused them</h3>
<p>The API returns standard problem details with an error per field, and the client maps each one onto the matching form control instead of showing a general message.</p>
<h3>Tested at both ends</h3>
<p>The API’s integration tests boot the application on in-memory SQLite with the scheduler switched off by configuration, and cover the rules that matter: the first account becomes admin, viewers can read but not write, payments roll into the next month, a back-dated payment creates its month, and the statement totals add up. The client has 94 unit specs, including the dashboard and statement arithmetic.</p>
<ul class="tests">
<li>Viewers_can_read_but_not_write</li>
<li>Payments_and_expenses_update_the_month_and_roll_into_the_next</li>
<li>A_back_dated_payment_creates_the_missing_ledger_row</li>
<li>Resident_statement_totals_the_history</li>
</ul>
'''),
        ('What I’d do differently', '''
<p>Mohalla records the current state of each payment but not who changed it and when. After building TechZone’s activity log, I would add the same audit trail here: in a society’s accounts, “who edited this?” matters as much as the number.</p>
<p>SQL Server makes it harder to host a free demo, so I would make the database provider switchable for deployment as well as for tests, and add browser tests for the main flows.</p>
'''),
    ],
    next='techzone')

ORDER = ['techzone', 'phonebook', 'mohalla']

TEMPLATE = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<meta name="color-scheme" content="dark">
<meta property="og:title" content="{name}: case study">
<meta property="og:description" content="{description}">
<meta property="og:image" content="https://ghulamnabi-dev.github.io/img/og-{slug}.png">
<meta property="og:url" content="https://ghulamnabi-dev.github.io/work/{slug}/">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<link rel="preload" href="../../fonts/schibsted-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../../css/site.css">
<link rel="stylesheet" href="../../css/case.css">
</head>
<body>
<a class="skip" href="#case">Skip to the case study</a>
<header class="case-top band--{key}">
  <div class="top">
    <div class="wrap">
      <a class="mark" href="../../" aria-label="Ghulam Nabi, home"><span class="mark__glyph" aria-hidden="true">GN</span><span class="mark__name">Ghulam Nabi</span></a>
      <nav aria-label="Projects">
{nav}
      </nav>
    </div>
  </div>
  <div class="case-hero">
    <div class="wrap">
      <a class="case-back" href="../../#work">All work</a>
      <h1><span class="band__mark" aria-hidden="true"></span>{name}</h1>
      <p class="lede">{lede}</p>
      <dl class="case-facts">
{facts}
      </dl>
    </div>
  </div>
</header>

<main id="case">
  <div class="watch band--{key}">
    <div class="watch__box" id="player">
      <img src="../../media/{poster}" alt="" loading="eager">
      <button class="watch__go" type="button" data-youtube="{youtube}" data-target="player" data-title="{name} walkthrough">
        <span class="watch__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg></span>
        <span><strong>Watch the walkthrough</strong><span>{length}, recorded from the running app</span></span>
      </button>
    </div>
    <p class="watch__note">The video plays from YouTube’s privacy-enhanced player and loads only when you press play.</p>
  </div>

  <article class="article case-wrap">
{sections}
  </article>
</main>

<a class="next band--{next_key}" href="../{next}/">
  <span class="wrap" style="display:block"><span class="next__label">Next project</span><strong>{next_name}</strong></span>
</a>

<footer class="foot">
  <div class="wrap">
    <span>© 2026 Ghulam Nabi. <a href="mailto:{email}">{email}</a></span>
    <span>Hand-written HTML, CSS and a little JavaScript. The fonts are hosted here and nothing tracks you.</span>
  </div>
</footer>
<script src="../../js/site.js" defer></script>
<script src="../../js/case.js" defer></script>
<script src="../../js/zoom.js" defer></script>
</body>
</html>
'''

for slug, p in PROJECTS.items():
    nav = '\n'.join(f'        <a href="../{s}/"{" aria-current=\"page\"" if s == slug else ""}>{PROJECTS[s]["name"]}</a>' for s in ORDER)
    facts = '\n'.join(f'        <div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in p['facts'])
    secs = list(p['sections'])
    secs.insert(len(secs) - 1, ('Under the hood', tech_notes.section(slug)))   # before "What I'd do differently"
    sections = '\n'.join(f'    <section aria-labelledby="s{i}"><h2 id="s{i}">{t}</h2><div class="prose">{body.strip()}</div></section>'
                         for i, (t, body) in enumerate(secs))
    nxt = PROJECTS[p['next']]
    out = TEMPLATE.format(title=html.escape(p['title']), description=html.escape(p['description']), name=p['name'], slug=slug, key=p['key'],
                          nav=nav, lede=p['lede'], facts=facts, poster=p['poster'], youtube=p['youtube'], length=p['length'],
                          sections=sections, next=p['next'], next_key=nxt['key'], next_name=nxt['name'], email=EMAIL)
    d = os.path.join(ROOT, 'work', slug)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(out)
    print('wrote', slug, len(out))
