# Ghulam Nabi — portfolio

One-page personal site. Plain HTML, CSS and JavaScript, no build step.

- `index.html` — all content (keep every fact identical to the CV)
- `styles.css` — layout and typography (single dark theme, print stylesheet)
- `script.js` — section index in the rail, and the short cursor intro on the opening
- `favicon.svg` — tab icon
- `sentinel-flux-core-report.pdf` — the final-year project report (81 pages), with student ID numbers and student e-mails redacted
- `.nojekyll` — tells GitHub Pages to serve the files as they are

## Hosting

GitHub Pages user site: this repository is `gn-4200.github.io`, so GitHub publishes
the `main` branch root automatically at https://gn-4200.github.io/ a minute or two
after each push. No Pages settings are needed.

## Local preview

```bash
python -m http.server 8765
```

Then open http://localhost:8765/ .
