# CODECAMP — React Website with Cursify Motions

A dark-themed, animated landing page for a code bootcamp, built in React with Cursify-style cursor effects, magnetic buttons, particle backgrounds, and scroll-driven reveal animations — all without any third-party animation libraries.

---

## Preview Sections

| Section | Description |
|---|---|
| Hero | Typewriter headline, particle canvas, floating badge, stat counters |
| Tracks | 6 animated course cards with hover glow effects |
| How It Works | 4-step process with pulsing numbered indicators |
| Testimonials | Testimonial cards with lift-on-hover interaction |
| CTA | Gradient-animated headline with magnetic buttons |
| Footer | Social links with color-transition hover states |

---

## Tech Stack

- **React 18** — Hooks only (`useState`, `useEffect`, `useRef`)
- **Canvas API** — Particle network background
- **IntersectionObserver API** — Scroll-triggered reveal animations
- **requestAnimationFrame** — Smooth cursor lerp loop
- **Google Fonts** — Space Mono (monospace identity) + DM Sans (body)
- **Zero dependencies** — No Framer Motion, GSAP, or animation libraries

---

## Cursify-Style Motion Features

### 1. Custom Cursor (`CursifyCursor`)
A two-layer cursor system inspired by Cursify:
- **Dot** — snaps to mouse position instantly via direct DOM transform
- **Ring** — lerps (linearly interpolates) at 12% per frame for a smooth trailing effect
- On hover over any `a`, `button`, or `[data-hover]` element: ring scales from 28px → 48px and switches color from `#00FFB2` → `#FF6B35`

```jsx
// Lerp formula used for the trailing ring
ringPos.x = lerp(ringPos.x, mouse.x, 0.12);
```

### 2. Magnetic Buttons (`MagBtn`)
Buttons physically lean toward the cursor using mouse offset math:

```jsx
const x = e.clientX - rect.left - rect.width / 2;
const y = e.clientY - rect.top - rect.height / 2;
button.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.04)`;
```
Resets smoothly on `mouseleave` via cubic-bezier transition.

### 3. Scroll Reveal (`Reveal`)
Wraps any content in an `IntersectionObserver`. When 15% of the element enters the viewport, it fades in and slides from a configurable direction (`up`, `down`, `left`, `right`) with an optional `delay` prop for staggering.

```jsx
<Reveal delay={0.2} dir="up">
  <p>This slides in from below</p>
</Reveal>
```

### 4. Typewriter (`Typewriter`)
Cycles through an array of strings — typing forward at 80ms/char, pausing 1.8s, then deleting at 45ms/char before moving to the next word.

### 5. Particle Network (`ParticleBg`)
Canvas-based animation with 60 drifting dots. Any two dots within 120px are connected by a semi-transparent line whose opacity scales with proximity.

### 6. Animated Counters (`Counter`)
Uses `IntersectionObserver` to start counting from 0 to a target number only when the stat enters the viewport. Runs via `requestAnimationFrame`.

---

## Component Reference

```
App                  Root layout, nav, all sections
├── CursifyCursor    Fixed custom cursor (dot + ring)
├── MagBtn           Magnetic button (primary / secondary variant)
├── Reveal           Scroll-triggered fade+slide wrapper
├── Typewriter       Animated text cycling component
├── ParticleBg       Canvas particle network
├── Counter          Viewport-triggered number counter
└── TrackCard        Animated course track card
```

---

## Project Structure

```
codecamps.jsx        Single-file React component (all-in-one)
README.md            This file
```

---

## Getting Started

### Option A — Run in Claude.ai Artifact
Paste `codecamps.jsx` directly into the Claude artifact panel. It renders immediately with no setup.

### Option B — Local Vite Project

```bash
# 1. Scaffold a new Vite + React project
npm create vite@latest codecamp -- --template react
cd codecamp

# 2. Replace src/App.jsx with codecamps.jsx content
# 3. Replace src/main.jsx with:
#    import React from 'react'
#    import ReactDOM from 'react-dom/client'
#    import App from './App.jsx'
#    ReactDOM.createRoot(document.getElementById('root')).render(<App />)

# 4. Install and run
npm install
npm run dev
```

### Option C — CodeSandbox / StackBlitz
1. Create a new React sandbox
2. Paste the contents of `codecamps.jsx` into `App.jsx`
3. No additional packages needed

---

## Customization Guide

### Change color palette
Two accent colors are used throughout. Find and replace:

| Token | Default | Role |
|---|---|---|
| Primary accent | `#00FFB2` | Cursor, buttons, highlights |
| Secondary accent | `#FF6B35` | Labels, nav hover, cursor hover |
| Background | `#080B10` | Page background |

### Add / remove tracks
Edit the `TRACKS` array near the top of the file:

```js
const TRACKS = [
  {
    icon: "⬡",           // Any unicode symbol
    label: "Web Dev",
    desc: "Short description of the track.",
    color: "#00FFB2",    // Card accent color
    weeks: 8,            // Duration badge
  },
  // ...
];
```

### Add testimonials
Edit the `TESTIMONIALS` array:

```js
const TESTIMONIALS = [
  {
    name: "Full Name",
    role: "Job Title @ Company",
    text: "Quote goes here.",
    avatar: "FN",        // 2-letter initials for the avatar circle
  },
];
```

### Adjust reveal animation speed / direction
```jsx
<Reveal delay={0.3} dir="left">
  {/* dir options: "up" | "down" | "left" | "right" */}
</Reveal>
```

### Tune cursor lerp speed
In `CursifyCursor`, change the interpolation factor (lower = slower/smoother, higher = snappier):
```js
ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.12); // 0.05–0.25 range
```

---

## CSS Animations Used

| Name | Effect | Used on |
|---|---|---|
| `float` | Gentle sine-wave bob | Hero badge |
| `pulse` | Glowing ring expand | Step number circles |
| `gradShift` | Hue-shifting gradient | CTA headline word |
| `spin` | Full rotation | (available, unused) |

All defined in a `<style>` tag injected via the root component.

---

## Browser Support

Works in all modern browsers that support:
- CSS Custom Properties
- `IntersectionObserver`
- `requestAnimationFrame`
- HTML5 `<canvas>`
- `clamp()` in CSS

No polyfills required for Chrome 90+, Firefox 90+, Safari 15+, Edge 90+.

---

## License

MIT — use freely for personal or commercial projects.
