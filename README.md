# nathansetaro.com — static site

Plain HTML/CSS/JS. No build step, no dependencies, no server code. Open
`index.html` directly or upload the whole folder to any host — Netlify, Vercel,
GitHub Pages, Cloudflare Pages, cPanel/FTP, S3, or a Raspberry Pi running nginx.

Every path in the site is **relative**, so the folder works at a domain root
(`nathansetaro.com/`) or in a subfolder (`user.github.io/portfolio/`) with no
edits. Keep the folder's internal structure intact and keep filenames lowercase —
some hosts are case-sensitive.

```
index.html            Landing page
resume.html           Resume page (the resume as real text; also the source of the PDF)
fluid.css / fluid.js  Motion layer shared by both pages: smooth scroll, page
                      transitions, springy buttons, staggered reveals
motion.css / motion.js  Expressive layer: interactive hero lotus (hover + click
                      ripples), glowing cursor, magnetic buttons, card spotlights
                      and tilt, letter-by-letter headings, scroll progress bar,
                      experience timeline, scroll-reactive tickers, image wipes
vendor/lenis.min.js   Smooth-scroll library (Lenis 1.1.20, MIT)
lotus-mark-dots.js    Dot data for the hero constellation
assets/               Photos, logos, resume PDF
logos/                Brand marks for the tool chips
```

## Filling the empty image spots

Drop a file with the matching name into `assets/` and it appears automatically —
no code change. Any of `.webp`, `.jpg`, `.jpeg`, `.png` works; a spot with no
file stays hidden (a project with no image shows its text full width).

| Name | Where it shows |
|---|---|
| `assets/about-1` … `about-3` | Three squares under the About photo — **already filled** |
| `assets/proj-ai` | Self-Hosted Personal AI Assistant |
| `assets/proj-pacifier` | Glucose Detection Pacifier — **filled** |
| `assets/proj-cloud` | Self-Hosted Cloud |
| `assets/proj-nas` | Network-Attached Storage |

Organization logos work the same way in `logos/` — add a transparent PNG named
after the slot and it replaces the monogram:
`logo-nationalgrid`, `logo-machado`, `logo-mlsc`, `logo-wpi`, `logo-wths`,
`logo-auburn`, `logo-anaeio` (**filled**), `logo-medhigh`, `logo-redcross`, `logo-comptia`.

Transparent marks sit on a themed disc: `logo-anaeio` gets teal in light mode,
`logo-auburn` gets white, and both go near-black in dark mode.

Tool chips without a brand mark accept `logos/<name>.png` too — e.g.
`canva.png`, `onshape.png`, `adobe-express.png`, `microsoft-word.png`.

## Updating the resume

The resume lives as text in `resume.html`. Edit it there, then make a new PDF
from that same page so the two always match:

1. Open `resume.html` in Chrome.
2. Print (Ctrl/Cmd + P) → Destination **Save as PDF**, Paper **Letter**,
   Margins **None**, turn **Headers and footers** off.
3. Save it over `assets/resume.pdf`.

The print stylesheet in `resume.html` lays it out as a one-page US Letter sheet in
Times New Roman; the site's nav, colours and buttons are left out automatically.

## Notes

- Light/dark choice lives in `sessionStorage` under `nds-theme`: every fresh
  visit opens in light mode, and the choice carries between both pages for the
  rest of that session.
- Fonts load from Google Fonts, so the type falls back to system sans/serif offline.
- Visitors who turn on "reduce motion" in their system settings get a still
  version: no smooth scroll, spinning rings, tickers, page transitions or any of
  the motion.js effects.
- The cursor, magnetic buttons, card spotlights/tilt and lotus hover only run with
  a mouse or trackpad; phones get tap ripples on the lotus and everything else.
