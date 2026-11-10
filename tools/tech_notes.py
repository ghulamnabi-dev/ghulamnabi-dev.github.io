"""The "Under the hood" notes for each case study. Every statement here is taken from that project's README or code.
Each entry is (title, short label, body). A body that starts with <p> is used as written; otherwise it becomes one paragraph."""

TECH = {'techzone': [('No framework, one shared core',
               'PHP 8, server-rendered',
               'A shared <code>core/</code> library holds bootstrap, sessions, CSRF, validation, uploads and checkout. The storefront and the admin both '
               'include it, so a fix lands once. Pages render on the server. The admin tables, the dashboard and the cart call JSON endpoints.'),
              ('AG Grid behind every admin table',
               'AG Grid Community 36, one wrapper',
               '<p>Ten admin screens (orders, products, inventory, customers, sellers, reviews, promotions, categories, messages and settings) run on AG Grid '
               'Community through one wrapper, <code>createAdminGrid()</code>, about 590 lines. A screen passes its columns and gets the rest for '
               'free.</p><p>The wrapper gives every table the same behaviour: quick search, column filters, paging, checkbox selection with bulk actions, CSV '
               'export, and row actions. Column order, width, sort, visibility and page size are remembered per screen in <code>localStorage</code>. A '
               'column’s <code>kind</code> picks a shared renderer for money, stock, dates and status pills, so they look the same everywhere.</p><p>The grid '
               'is themed from the admin’s design tokens, and every renderer builds DOM nodes, so data only reaches the page through <code>textContent</code> '
               'or an escape function. The library is vendored with its MIT licence rather than loaded from a CDN.</p><figure class="shot"><img '
               'src="../../img/techzone/22-admin-orders.webp" alt="The admin order queue as a data grid with tabs, search and status pills" loading="lazy" '
               'decoding="async"><figcaption>The order queue: one of ten admin screens on the same grid wrapper.</figcaption></figure>'),
              ('Checkout that cannot oversell',
               'Transactions, row locks',
               '<code>place_order()</code> runs in one transaction. Product rows are locked with <code>SELECT … FOR UPDATE</code> in id order, every line is '
               're-priced from the database, then stock is decremented with a guard. A test with 12 concurrent checkouts against 3 units produced exactly 3 '
               'orders and stock 0.'),
              ('Stock as a ledger, history as events',
               'Data model',
               'Stock only changes through <code>inventory_adjustments</code>. Every order step is an <code>order_events</code> row with the person who did '
               'it, and every admin write is an <code>audit_log</code> row with a before and after diff.'),
              ('Security without a framework',
               'SQL injection, CSRF, sessions',
               'PDO prepared statements everywhere, with emulation turned off. One 256-bit CSRF token per session, compared with <code>hash_equals</code>. '
               'Sessions are <code>HttpOnly</code> and <code>SameSite=Lax</code>, and the id is regenerated after every login. Five failed logins in 15 '
               'minutes lock the scope for 15 minutes. Uploads are checked with <code>finfo</code> and stored under random names.'),
              ('Authorization on the server, per row',
               'Roles',
               'Owner, Manager, Staff and Seller capabilities live in <code>core/permissions.php</code>. Sellers are also scoped per product and per order '
               'line, and another seller’s record returns a 404.'),
              ('Rules as code, not interface',
               'Pure functions',
               'Builder compatibility, shipping zones and discount eligibility are pure functions in <code>core/</code>, used the same way by the storefront, '
               'the APIs and the admin.'),
              ('Shipped like a service',
               'Docker, CI',
               'A Docker image with a production <code>php.ini</code>, and Compose seeds MariaDB on first start. CI lints every PHP file, then boots the real '
               'stack and calls real endpoints as a smoke test.')],
 'phonebook': [('Four layers',
                'Architecture',
                'Controllers do HTTP only. Services hold the business rules, DTOs, vCard reading and writing, and token issuing. The domain holds the '
                'entities. Infrastructure holds the <code>DbContext</code>, the provider switch, the generic repository and the unit of work.'),
               ('Generic Repository and Unit of Work',
                'Patterns',
                'A repository only stages changes and never saves. Services depend on <code>IUnitOfWork</code> alone and never see the <code>DbContext</code>, '
                'so one operation that touches several repositories commits together or not at all. The vCard import stages contacts in batches of 50 inside '
                'one explicit transaction.'),
               ('Sign-in tokens, standard library only',
                'JWT, without the Identity framework',
                '<code>PasswordHasher&lt;User&gt;</code> for credentials and an HS256 token with <code>sub</code>, <code>name</code> and '
                '<code>email</code> claims. Issuer, audience and lifetime are validated, and the API refuses to start with a missing or short secret.'),
               ('Each account sees only its own data',
                'Isolation',
                'Every query is scoped to the caller. Another user’s contact or group is a 404, never a 403, so ids do not leak.'),
               ('vCard 3.0 without a library',
                'File format',
                'A small reader and writer that handles folded lines, escaped commas, semicolons and newlines, and <code>TEL;TYPE=</code> mapping, and skips '
                'garbage between cards.'),
               ('Errors as a contract',
                'RFC 7807',
                'Data annotations on inputs, and RFC 7807 <code>ProblemDetails</code> for every failure path through one exception handler.'),
               ('Designed to be tested',
                'xUnit, WebApplicationFactory',
                'The database provider is a configuration switch between SQLite and SQL Server, so the real app boots on in-memory SQLite inside '
                '<code>WebApplicationFactory</code>. 36 API tests exercise HTTP, sign-in and validation end to end, and 109 client specs run beside them on '
                'every push.')],
 'mohalla': [('Layered API',
              'Controllers, services, repositories',
              'Controllers call services, and services call repositories, with every dependency behind an interface. Controllers never touch EF Core.'),
             ('Roles from the token to the button',
              'Identity, JWT',
              'ASP.NET Core Identity with a role claim in the token. <code>[Authorize(Roles = …)]</code> sits on every write, and a structural '
              '<code>*appAdminOnly</code> directive hides the same controls in the interface.'),
             ('Scheduled logic that heals itself',
              'Hangfire',
              'A Hangfire job opens each month’s ledger row. If a back-dated entry arrives first, the row is created on demand.'),
             ('Errors land on the right field',
              'RFC 7807',
              'The API returns RFC 7807 <code>ValidationProblemDetails</code>, and the client puts each message on the matching form field.'),
             ('Modern Angular',
              'Angular 19',
              'Standalone components, signals, the new control flow, functional guards and interceptors, and lazy routes. The chart is 60 lines of SVG instead '
              'of a charting dependency, and the initial bundle is about 114 kB gzipped.'),
             ('Designed to be tested',
              'SQLite in tests, CI',
              'The database provider and the background server are configurable, so the real app boots on SQLite inside the tests. Both suites run on every '
              'push, followed by a Docker build of both images.'),
             ('A design system as tokens', 'CSS', 'One accent, flat surfaces and dense tables. Light and dark come from the same stylesheet.')]}


def section(slug):
    rows = []
    for i, (title, label, body) in enumerate(TECH[slug]):
        if not body.startswith('<p>'):
            body = '<p>' + body + '</p>'
        rows.append('<details%s><summary><span>%s</span><small>%s</small></summary>%s</details>' % (' open' if i < 2 and slug == 'techzone' or i == 0 else '', title, label, body))
    return ('<div class="tech"><p>The technical choices, one at a time. Open any of them.</p>' + ''.join(rows)
            + '<p class="tech__all"><button type="button" data-all>Open all</button></p></div>')
