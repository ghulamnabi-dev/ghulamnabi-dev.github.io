# ghulamnabi-dev.github.io

The academic profile of Ghulam Nabi, computer science student and software engineer in Lahore: **https://ghulamnabi-dev.github.io**

The home page covers motivation, research interests, two research studies, four projects, and education. Three of the projects have a case study and a walkthrough: TechZone (PHP 8, MariaDB), PhoneBook (ASP.NET Core 9, Angular 19) and Mohalla (ASP.NET Core 9, Angular 19, SQL Server).

The earlier engineering-focused home page is kept on the `engineering` branch. It is not published.

## How it's built

Plain HTML and CSS, with a little JavaScript on the case studies, served by GitHub Pages. No framework and no build step for the pages themselves.

- `index.html`: the home page.
- `work/<project>/index.html`: the case studies, generated from one template by `tools/build_cases.py` (run it from the repository root after editing a case study).
- `css/academic.css`: the home page. It uses no JavaScript, and follows the reader's light or dark setting.
- `css/site.css` + `css/case.css`, `js/site.js` + `js/case.js`: the case studies, with the contents rail and reading progress.
- `js/zoom.js`: on the case studies, click a screenshot or recording to see it full size.
- `tools/tech_notes.py`: the "Under the hood" notes that the generator adds to each case study.
- `media/`: short silent loops (WebM and MP4, with poster images) recorded from the running apps.
- `fonts/`: Schibsted Grotesk and Source Serif 4, hosted here rather than loaded from Google.

Walkthrough videos are on YouTube (unlisted) and load through the privacy-enhanced `youtube-nocookie.com` player only when someone presses play. The site sets no cookies and has no analytics.
