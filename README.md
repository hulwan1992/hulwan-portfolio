# Hulwan Afif — Geospatial & LiDAR portfolio

**Live:** https://hulwan1992.github.io/hulwan-portfolio/

A fast, privacy-first one-page portfolio for **Muhammad Hulwan Afif Bin Rajali** — Field Data Processing Lead and Geospatial & LiDAR Specialist, Singapore.

- No frameworks, no build step.
- Self-hosted fonts, zero third-party requests.
- Procedural point-cloud visuals drawn on canvas.
- Deep-linkable case studies, shareable links, keyboard-accessible dialogs.
- Draggable point-cloud hero on desktop (auto-orbits otherwise).
- Public CV generated as A4, with no phone number, referee contacts or licence numbers.

## Preview locally

```bash
# from this folder
python3 -m http.server 4280
# open http://127.0.0.1:4280
```

Open via the local server for the intended typography: browsers block self-hosted fonts on `file://` for CORS reasons, so a direct double-click falls back to system fonts. The custom 404 page is at `404.html`.

## Structure

```
index.html                  Page content and section markup
404.html                    Custom off-the-map page
cv-public.html              Print source for the public A4 CV (noindex)
README.md                   This file
_headers                    CSP + security headers for Netlify / Cloudflare Pages
.htaccess                   Same headers and HTTPS redirect for Apache / cPanel
robots.txt                  Crawl rules
llms.txt                    Short public summary for AI agents
assets/css/styles.css       Design system, layout and responsive rules
assets/css/cv.css           A4 print styles for the public CV
assets/js/boot.js           Enables reveal styles before paint
assets/js/visuals.js        Procedural point-cloud scenes (hero, cards, modal)
assets/js/app.js            Navigation, reveal, metrics, filters, modal, deep links,
                            share, email assembly, privacy note
assets/fonts/               Self-hosted WOFF2 files + SIL OFL licences
assets/docs/                Hulwan_Afif_Public_CV.pdf (public, sanitised)
assets/img/                 Portrait, favicon and 1200 × 630 social cover
```

## Privacy model

This is deliberate; keep it if you edit the site.

**Public**
- Name, role, portrait, city and professional history.
- Skills, certifications, public email and LinkedIn.
- The public CV PDF in `assets/docs/`.

**Private — never put these in this folder**
- Phone number.
- Referee names, phone numbers and email addresses.
- Licence numbers (UAPL, WSH certificate IDs).
- The full detailed CV and the 2021 historical CV.

The site publishes phone as “available on request”, withholds referee details, and the contact email is assembled in JavaScript rather than sitting in the HTML. The public CV is a separate sanitised file. The full detailed CV is shared only on request.

The privacy note in the footer explains this to visitors; edit it in the `#privacy-modal` block in `index.html`.

## Edit content

| You want to change | Edit |
| --- | --- |
| Name, roles, profile copy, stats, timeline | `index.html` |
| Case-study titles, summaries, technical outputs, tags | `PROJECTS` object at the top of `assets/js/app.js` |
| Colours, type, spacing | `:root` block in `assets/css/styles.css` |
| Public CV content | `cv-public.html` + regenerate the PDF (below) |
| Social share image | Replace `assets/img/og-cover.jpg` (keep 1200 × 630) |
| Privacy wording | `#privacy-modal` in `index.html` |
| Security headers | `_headers` and `.htaccess` |

The six work cards have matching `id="project-…"` anchors and `data-project="…"` keys. Deep links use `#case-…` (for example `/#case-nparks`).

The email address is assembled in `assets/js/app.js`:

```js
var EMAIL = "hulwanafif" + "@" + "outlook.com";
```

Change it there, and in `cv-public.html` for the public CV.

## Regenerate the public CV

The PDF is printed from `cv-public.html` at A4. With the local server running:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --no-pdf-header-footer \
  --print-to-pdf="$PWD/assets/docs/Hulwan_Afif_Public_CV.pdf" \
  http://127.0.0.1:4280/cv-public.html
pdfinfo assets/docs/Hulwan_Afif_Public_CV.pdf   # should say A4, 2 pages
```

Check the result before publishing:

```bash
pdftotext assets/docs/Hulwan_Afif_Public_CV.pdf - | grep -Ei "\+65|U[0-9]{7}|licen[cs]e number|referee" || echo "clean"
```

Do not copy the detailed CV, the 2021 CV or the Word files into this folder. They contain phone numbers and referee contacts.

## Deploy

**Netlify or Cloudflare Pages (recommended)** — drag the folder in, or connect a repo. No build command; publish directory `/`. `_headers` is applied automatically.

**Vercel** — import the folder as “Other”, no build step. Translate the headers into `vercel.json` if you want the same security policy.

**Apache / cPanel** — upload the contents to `public_html`. `.htaccess` adds the headers, blocks directory listings and redirects to HTTPS.

**GitHub Pages** — this site is deployed at https://hulwan1992.github.io/hulwan-portfolio/. `.nojekyll` is included so the files are served as-is. GitHub Pages cannot apply custom response headers, so the main CSP and referrer policy are also set with meta tags in `index.html`; HSTS and `frame-ancestors` still require a host that supports headers, or Cloudflare in front.

After adding a real domain:

1. Update `og:image` / `twitter:image` in `index.html` to an absolute URL, for example `https://yourdomain.com/assets/img/og-cover.jpg`.
2. Add `og:url` and a canonical link.
3. Optionally add `sitemap.xml`.

## Security notes

- CSP is strict: self-hosted scripts, styles, fonts and images only. The inline JSON-LD block is allowed by SHA-256 hash.
- If you edit the JSON-LD block in `index.html`, regenerate the hash and update **both** `_headers` and `.htaccess`:

```bash
python3 - <<'PY'
import re, hashlib, base64
s = open("index.html").read()
body = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S).group(1)
print("sha256-" + base64.b64encode(hashlib.sha256(body.encode()).digest()).decode())
PY
```

- There are no forms, cookies, analytics or third-party embeds. `llms.txt` gives AI crawlers a clean public summary.
- The public CV is A4 and text-selectable; no sensitive fields. Keep it that way.

## Responsive and accessibility

Tested at 320, 360, 390, 430, 768, 834, 1024, 1180, 1280, 1440 and 1920 px with no horizontal overflow.

- Layout uses CSS grid, `clamp()`, `svh` and breakpoint-specific reflow.
- Touch targets for filters, copy and menu controls are enlarged on small screens.
- Dialogs use native `<dialog>` focus handling; the mobile menu makes the page inert while open.
- `prefers-reduced-motion` renders a still hero and disables reveal/scan motion.
- Focus-visible outlines, skip link and `aria-current` are included.

## Design notes

- Dark "survey instrument" interface with a warm paper *field manual* insert for capabilities — the light section is intentional, not a theme bug.
- Kinetic hero headline, draggable point-cloud hero and an oversized footer wordmark.
- Dotted world coverage map (Natural Earth) separating the field base from delivery exposure.
- Outcome lines on each work card and a pinned case-study visual on desktop.
- Self-hosted type, procedural visuals, no stock imagery or third-party requests.
- Deployed on GitHub Pages with a canonical URL, sitemap and absolute Open Graph image.
- All motion has a reduced-motion fallback; the paper section uses a print-like grid and contour texture.

## Notes

- All point-cloud imagery is **procedural and illustrative** — not survey data. This is labelled on the page and in each case study.
- The site and public CV now say **8+ years**, based on LiDAR/survey experience from 2018. The private detailed CV still says 6+ — update it before sending so every document agrees.
- Verify the UAPL renewal date and the YJP referee name/number before sending the private detailed CV; the public site deliberately avoids both.
- Fonts: Space Grotesk, JetBrains Mono and Instrument Serif, self-hosted under the SIL Open Font License. Licence files are in `assets/fonts/`.
