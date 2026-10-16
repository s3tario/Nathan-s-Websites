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
                      ripples), magnetic buttons, card spotlights
                      and tilt, letter-by-letter headings, scroll progress bar,
                      experience timeline, scroll-reactive tickers, image wipes
med.css / med.js      The optional "Mediterranean" look (see below); off unless switched on
assets/med/           Its generated textures (stone, light web, olive-leaf shade)
compare.html          Classic and Mediterranean side by side
vendor/lenis.min.js   Smooth-scroll library (Lenis 1.1.20, MIT)
lotus-mark-dots.js    Dot data for the hero constellation
assets/               Photos, logos, resume PDF
logos/                Brand marks for the tool chips
```

## Two looks: Classic and Mediterranean

The site has two looks over the same content. **Classic** (the white Avatar/Pandora
look) is the default. **Mediterranean** is optional:

- A sun-bleached limestone terrace seen from above, with soft olive-leaf shade. The
  lotus floats over a still plunge pool with entry steps and a slow web of light.
- The page steps down three shallow ledges to a second pool at the footer. Panels
  are frosted glass slabs lying on the stone.
- At night the pool is lit from below and there is no leaf shade.

Switching:

- `index.html?look=med` turns Mediterranean on; `index.html?look=classic` turns it off.
- The choice sticks for the rest of the visit (`sessionStorage`, key `nds-look`)
  and carries over to the resume page.

`compare.html` shows both looks side by side, with light/dark, home/resume and
desktop/phone switches, synced scrolling, and keys 1 / 2 to focus one look,
F to flip, Esc for both.

The look lives only in `med.css`, `med.js` and `assets/med/` (generated textures).
To make it the only look, add `class="look-med"` to the `<html>` tag on both pages.
To remove it, delete those three and the two include lines on each page (the
`med.css` link and the `med.js` script). Printing (the resume PDF) always uses Classic.

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
All ten are **filled**. Every organisation badge is white in both themes, so a
transparent PNG or SVG drops straight in. Every tool chip has its mark. Sources and licences are in
`logos/CREDITS.md`.

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
- The magnetic buttons, card spotlights/tilt and lotus hover only run with
  a mouse or trackpad; phones get tap ripples on the lotus and everything else.
