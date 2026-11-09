# ghulamnabi-dev.github.io

The portfolio of Ghulam Nabi, software engineer in Lahore: **https://ghulamnabi-dev.github.io**

Three projects, each with a case study and a walkthrough: TechZone (PHP 8, MariaDB), PhoneBook (ASP.NET Core 9, Angular 19) and Mohalla (ASP.NET Core 9, Angular 19, SQL Server).

## How it's built

Plain HTML, CSS and a little JavaScript, served by GitHub Pages. No framework and no build step for the pages themselves.

- `index.html`: the home page.
- `work/<project>/index.html`: the case studies, generated from one template by `tools/build_cases.py` (run it from the repository root after editing a case study).
- `css/home.css`, `js/home.js`: the home page (dark, cursor intro, stacking project cards).
- `css/site.css`, `js/site.js`: the case studies.
- `media/`: short silent loops (WebM and MP4, with poster images) recorded from the running apps.
- `fonts/`: Schibsted Grotesk and Source Serif 4, hosted here rather than loaded from Google.

Walkthrough videos are on YouTube (unlisted) and load through the privacy-enhanced `youtube-nocookie.com` player only when someone presses play. The site sets no cookies and has no analytics.
