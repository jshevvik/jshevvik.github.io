# Julia Shevchenko — Frontend Portfolio

Personal portfolio for **Julia Shevchenko**, a Junior Frontend Developer with a full-stack background. The site presents selected projects, technical writing, and a career journey through an accessible Spanish-language interface.

[Live demo](https://jshevvik.github.io)

![Portfolio hero preview](public/hero-preview.png)

## Highlights

- Layered, story-driven hero with pointer and scroll parallax
- Responsive layouts for desktop, tablet, and mobile
- Project case studies and content collections powered by Astro
- Semantic navigation, visible focus states, and keyboard support
- Motion progressively enhanced with `IntersectionObserver` and `requestAnimationFrame`
- Full `prefers-reduced-motion` support
- Static production output for GitHub Pages

## Stack

- Astro
- TypeScript
- SCSS and modern CSS
- JavaScript
- Accessible Astro Components
- Astro Icon with Lucide icons

## Local development

```bash
pnpm install
pnpm dev
```

Create and preview a production build:

```bash
pnpm build
pnpm preview
```

## Content structure

- `src/pages/` — routes for the homepage, portfolio, blog, about, contact, and supporting pages
- `src/content/projects/` — portfolio case studies
- `src/content/blog/` — articles and learning notes
- `src/components/` — shared Astro components, including the layered Hero and navigation
- `src/scripts/motion.ts` — progressive motion, parallax, reveal, and header behaviour
- `public/hero-layers/` — coordinated raster layers used by the Hero scene

## Accessibility

Accessibility is treated as part of the implementation rather than a final checklist. The site uses semantic landmarks, keyboard-operable navigation, clear focus styles, readable contrast, responsive typography, and reduced-motion fallbacks. Decorative Hero layers use empty alternative text while the scene has a concise accessible description.

## Author

**Julia Shevchenko**

[GitHub](https://github.com/jshevvik) · [Portfolio](https://jshevvik.github.io)

## Foundation and license

This portfolio was originally based on [Accessible Astro Starter](https://github.com/incluud/accessible-astro-starter) by Incluud and has since been substantially redesigned and adapted. The original MIT license is retained in [LICENSE](LICENSE).
