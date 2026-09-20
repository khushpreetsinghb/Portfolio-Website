# Portfolio-Website — Dark Premium 3D Revamp

Single-page, scroll-driven portfolio. Old multi-page site archived in `_legacy/`.

## Stack (minimal)
- `three` — fixed WebGL background: torus-knot + icosahedron/octahedron clusters + particles, camera moves on scroll
- `gsap` + ScrollTrigger — reveals, skill bars, counters, progress bar, filters, testimonials
- `vite` — dev + build only

## Run
```bash
npm install
npm run dev
npm run build  # outputs dist/
npm run preview
```

## Images — all remote placeholders, no local `images/` needed
Current code uses:
- Portraits/work: `https://picsum.photos/seed/<name>/800/600` — free, no key
- Avatars: `https://i.pravatar.cc/150?img=12` — free placeholder faces

Where to get real professional images:
1. Unsplash — https://unsplash.com (e.g. search "dark workspace", "web design mockup") — use Download → upload to `public/` → replace `src`
2. Pexels — https://pexels.com (free commercial use, better for Indian freelance context)
3. Your own screenshots — export 1600x1000 JPG/WebP into `public/work/` and swap the 6 `<img>` in `#work`
4. Your photo — replace the two `picsum.seed(khush-*)` URLs with `public/me.jpg`

Tip: keep files under ~200KB, use WebP. Replace Formspree endpoint in `#contact form action` if needed.

## Notes
- 3D auto-disables on mobile / `prefers-reduced-motion` → CSS gradient fallback (`body.no-3d`)
- No Swiper/Bootstrap/jQuery — testimonials are lightweight GSAP
- Legacy backup: `_legacy/index-legacy.html`, `about.html`, `service.html`, `contact.html`, `images/`
