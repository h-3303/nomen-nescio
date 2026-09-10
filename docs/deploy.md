# Build, verify, deploy

## Local

```sh
npm install
npm run dev        # Vite dev server with HMR
npm run build      # tsc -b (type check) then vite build -> dist/
npm run preview    # serve dist/ on http://localhost:4173
npm run lint       # oxlint
```

`npm run build` fails on any TypeScript error; the deploy runs the same command, so a green
local build is the gate.

## Headless verification

`tools/verify/` holds two Playwright scripts (install with `cd tools && npm install`, plus
`npx playwright install chromium` once). Start `npm run preview` in the repo root first.

- `node verify/screenshots.mjs [url]`: desktop (1280 x 800) and phone (400 x 780) captures at
  six scroll positions, plus the work-list focus and unfocus states. Emulates
  `prefers-reduced-motion` so the software WebGL rasteriser is not asked to redraw continuously.
  Output in `tools/verify/shots/`.
- `node verify/motion.mjs [url]`: motion on; scrolls to 1100 px, prints the three strata
  offsets (expect dots -132 px, hatch -605 px, flecks -1408 px) and captures two frames. Slow
  under software GL; allow a few minutes.

Both scripts print page errors and console output; a clean run reports `logs: none`.

## Vercel

- Project `hdig/nomen-nescio`, framework preset Vite, output `dist/`.
- Git-connected to `github.com/h-3303/nomen-nescio`. Pushing to `main` builds and promotes to
  production; other branches get preview URLs.
- Production alias: https://nomen-nescio.vercel.app
- Manual deploy from a checkout: `vercel deploy --prod --yes` (needs `vercel login` once).
- `vercel.json` adds `Cache-Control: public, max-age=31536000, immutable` to `/models/*` and
  `/fonts/*`. Vite's hashed `assets/*` already get immutable caching from the platform;
  `index.html` is `max-age=0, must-revalidate`.

Useful checks after a deploy:

```sh
vercel ls                                   # recent deployments and state
curl -sI https://nomen-nescio.vercel.app/models/fa.glb | grep -i cache-control
```

## Custom domain

Add the domain in the Vercel project settings (or `vercel domains add <domain>`), point DNS at
Vercel, and update the `og:` tags in `index.html` if you add an absolute `og:image`.
