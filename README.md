# Particle Zoo

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Build, predict, forbid. Assemble hadrons from quarks and watch charge, baryon number and
strangeness add up; stand where Gell-Mann stood in 1962 and predict the missing Ω⁻; pull a quark
away from its partner until the string snaps into new mesons; and put proposed reactions on trial
against the conservation laws, down to the quark-level Feynman vertices. It is pitched at
introductory university physics and senior high school. Companion to
[Collider Lab](https://github.com/OpenLyceum/ColliderLab). Built with
[SceneryStack](https://scenerystack.org/); runs offline as a Progressive Web App.

## Features

- **Hadron Builder.** Drag (or click) quarks and antiquarks into a bag of up to three.
  - Live readouts of charge Q, baryon number B, strangeness S (and charm and beauty), the allowed
    spins, and colour neutrality.
  - A matching hadron is named with its mass and lifetime, from p, n and π⁺ to K⁺ = u s̄, Λ, Ω⁻
    and J/ψ. Same-content states (Λ and Σ⁰) are both shown.
  - Colour charges swap between the quarks, like gluon exchange (a preference turns this off).
- **Eightfold Way.** The spin-3/2 decuplet on strangeness and charge axes, as known in 1962, with the
  S = −3 corner empty.
  - A mass-vs-strangeness ladder shows the ~150 MeV steps.
  - Predict the missing particle's quarks, charge and mass, check, then reveal the Ω⁻ (1672 MeV).
  - The octet is shown for comparison.
- **Confinement.** Pull a quark–antiquark pair apart against V = σr (σ ≈ 1 GeV/fm), with an
  optional short-range Coulomb term.
  - An energy bar fills toward the cost of a new pair (~680 MeV); then the string snaps into two
    named mesons (π⁺ → π⁰ + π⁺, K⁺ → π⁰ + K⁺), never a free quark.
- **Reaction Court.** Build a reaction from 36 particles or pick one of 14 classic cases.
  - A ledger checks Q, B, L<sub>e</sub>, L<sub>μ</sub>, L<sub>τ</sub>, S and mass–energy.
  - The verdict names the broken law, or the force (strong, electromagnetic or weak), its lifetime
    scale and the parent's measured lifetime.
  - For six reactions, complete a quark-level Feynman diagram (time upward): choose the boson and
    the missing lines, and each vertex turns green or red.
- **Accessible:**
  - Every control works from the keyboard.
  - Each screen has a live screen summary and a keyboard-help dialog.
  - English, French and Spanish.
  - Default and projector colour profiles.
  - Installable PWA.
  - A preference (or `?animateColorCharge=false`) stops the colour animation.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.6 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
