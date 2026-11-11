# AGENTS.md — Particle Zoo

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

"Build, predict, forbid": hadrons, the quark model and conservation laws for introductory university
and senior high school. Original work, forked from `SceneryStackTemplate` on 10 Nov 2026 as the
companion to `ColliderLab`. Four screens:

| Screen | Folder | Content |
|---|---|---|
| Hadron Builder | `src/hadron-builder/` | Drag/click quarks into a bag; Q, B, S, C, spin, colour readouts; matching hadrons named |
| Eightfold Way | `src/eightfold-way/` | 1962 decuplet with Ω⁻ missing; mass ladder; predict quarks, charge, mass; reveal; octet view |
| Confinement | `src/confinement/` | Pull a q q̄ pair; V = σr (+ Coulomb); energy bar; string breaks into two mesons |
| Reaction Court | `src/reaction-court/` | Build reactions; conservation ledger; verdict with force and lifetime; constrained Feynman vertices |

Physics: [`doc/model.md`](doc/model.md). Architecture and decisions:
[`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **Quantum numbers in thirds.** `quarks.ts` stores charge and baryon number ×3; format with
  `formatThirds`. `sumQuarks` normalises −0.
- **Catalog ids vs aliases.** Antiparticles are `anti-<id>` (`anti-pi+` is π⁻); `particleById`
  also accepts `pi-`, `K-`, `e+`, `mu+`, etc. Reaction presets and diagram templates use the aliases.
- **Rules are table-tested.** Add a reaction to `tests/reaction-court/reactionRules.test.ts` before
  changing `reactionRules.ts`.
- **Run the fuzz in assertion mode** (`npm run test:fuzz:quick`) after view changes: it caught
  property re-entry bugs that unit tests did not.
- **Node >=26** is required. Run `source ~/.nvm/nvm.sh && nvm use 26` before npm or a git commit
  (the pre-commit hook runs npm).

## Key files

| File | Purpose |
|---|---|
| `src/common/model/quarks.ts` | Flavours, sums, colour neutrality, allowed spins, formatting |
| `src/common/model/particleCatalog.ts` | Particles + antiparticles, `particleById`, `hadronsWithContent` |
| `src/reaction-court/model/reactionRules.ts` | Ledger and verdict |
| `src/reaction-court/model/vertexDiagrams.ts` | Diagram templates and per-vertex checks |
| `src/confinement/model/ConfinementModel.ts` | Potential, breaking separation, fragments |
| `src/eightfold-way/model/EightfoldWayModel.ts` | Multiplets, I₃ positions, equal-spacing prediction, grading |
| `src/common/view/QuarkNode.ts` | Quark/antiquark ball with colour-charge rim |
| `src/preferences/ParticleZooPreferencesModel.ts` | `animateColorCharge` preference (shared singleton) |

## Common components

### ParticleZooPanel

Every control panel and info box in the sim should use `ParticleZooPanel` so that
default/projector color switching is automatic:

```typescript
import { ParticleZooPanel } from "../../common/ParticleZooPanel.js";
const panel = new ParticleZooPanel(content);              // uses ParticleZooColors defaults
const panel = new ParticleZooPanel(content, { xMargin: 20 }); // override any PanelOption
```

### ParticleZooButtonOptions

SceneryStack's push/round buttons default to a 3-D/beveled look; every button in the sim
should be flat instead. Spread these into the relevant options object:

```typescript
import { FLAT_RESET_ALL_BUTTON_OPTIONS, FLAT_RECTANGULAR_BUTTON_OPTIONS } from "../../common/ParticleZooButtonOptions.js";

const resetAllButton = new ResetAllButton({ ...FLAT_RESET_ALL_BUTTON_OPTIONS, listener: () => {...} });
const exampleButton = new RectangularPushButton({ ...FLAT_RECTANGULAR_BUTTON_OPTIONS, content, listener });
```

`FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS` spreads into `TimeControlNode`'s `playPauseStepButtonOptions`;
`TIME_CONTROL_SPEED_RADIO_OPTIONS` fixes `TimeControlNode`'s speed-radio label color, which
otherwise defaults to black text on the sim's dark default-mode panels. `PARTICLE_ZOO_COMBO_BOX_OPTIONS`
themes a `ComboBox`'s button/list chrome to the light control surface below; pair item labels
with `LIGHT_SURFACE_TEXT_FILL` (not `ParticleZooColors.textColorProperty`, which is for panel-fill text).

`ParticleZooColors.ts` backs this with a "light control surfaces" section —
`controlSurfaceColorProperty`, `controlSurfaceDisabledColorProperty`,
`controlSurfaceTextColorProperty` — identical white/dark-text values in both default and
projector profiles, so any component that must stay light regardless of theme (combo boxes,
flat buttons, editable fields) keeps readable contrast automatically.

## Accessibility

Each screen has a live `currentDetailsContent`, an explicit `pdomOrder` and its own keyboard-help
content. Quark tiles, bag constituents, reaction tokens and diagram blanks are all buttons. A11y
strings live under the `a11y` key in each locale JSON, exposed via `StringManager.get*A11yStrings()`. Full convention and checklist: [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md).

## Compliance carve-outs

None.

### Template-owned files (drift-checked)

Infrastructure files are owned by `SceneryStackTemplate` and must stay byte-identical in every sim
(after substituting the sim's own name). `Baton/scripts/check-template-drift.sh ParticleZoo` compares
this sim against the template using `Baton/config/template-manifest.json`, which lists the exact files,
the required `package.json` scripts, and the few keys a sim may extend (extra `biome.json`
ignores, extra tsconfig `types`, CSP/Permissions additions).

To diverge on purpose, add a bullet to the sim's own `## Compliance carve-outs` section naming
the file in backticks and the reason, e.g. ``- `tests/setup.ts`: adds a WebGPU mock``. The drift
checker treats a file named there as approved. Fix template-owned files in `SceneryStackTemplate` first, then
propagate — never hand-edit one in a single sim.

Toolkit exports that only some sims use (`ParticleZooButtonOptions.ts`, `ParticleZooControlOptions.ts`, the
`memoryLeak.ts` helpers) carry a `@public` JSDoc tag so dead-code checkers such as knip do not
report them as unused in the sims that skip them. Tag any new toolkit export the same way.

### `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. |
| `brace-expansion` | `~5.0.12` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895; ≥5.0.12 for the CPU-DoS advisory). |

## Testing

Fleet-standard Vitest layout (keep when forking):

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `happy-dom` environment; `setupFiles: ["./tests/setup.ts"]`; `execArgv: ["--expose-gc"]` |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports |
| `tests/{common,hadron-builder,eightfold-way,confinement,reaction-court}/` | Physics and model tests |
| `tests/memory-leak.test.ts` | Lists the sim's disposables for `describeDisposalLeaks()` (collected after dispose, repeated cycles; opt-in double dispose) |
| `tests/helpers/memoryLeak.ts` | Template-owned leak harness: `describeDisposalLeaks`, `forceGC`, `createAndDispose` |
| `tests/fuzz/fuzz.spec.ts` | Optional Playwright fuzz smoke: pointer `?fuzz` + keyboard `?fuzzBoard` (template-owned; add sim-specific specs as separate files) |
| `playwright.config.ts` | Chromium project + Vite webServer for `tests/**/*.spec.ts` (template-owned) |
| `tests/browser/*.spec.ts` | Optional sim-specific Playwright tests (`npx playwright test tests/browser`); `npm run test:fuzz` runs only `tests/fuzz/` |

- Put unit tests only under root `tests/`, mirroring `src/` (never co-locate or use `__tests__/`).
- Run `npm test`. CI runs the suite when a `test` script is present.
- Add every model/view object that adds/removes nodes or links Properties at runtime to the
  `describeDisposalLeaks([...])` list in `memory-leak.test.ts`; put sim-specific leak scenarios
  after it using `forceGC()` from `tests/helpers/memoryLeak.ts` (never a local copy).
- Optional: `npm run test:fuzz` / `test:fuzz:quick` / `test:fuzz:long` (not part of default CI).
  Duration is 30s by default; override with `npm run test:fuzz -- 90` or `FUZZ_DURATION=90`.

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run build:single` | Single-file build mode |
| `npm run check` | TypeScript (`tsc --noEmit` on app, scripts, and tests) |
| `npm run lint` / `npm run fix` | Biome check / auto-fix |
| `npm test` | Vitest unit tests |
| `npm run test:fuzz` | Playwright fuzz smoke (pointer + keyboard, `?ea`, 30s each; `npm run test:fuzz -- 90` to change) |
| `npm run test:fuzz:quick` | 10s fuzz |
| `npm run test:fuzz:long` | 300s fuzz |
| `npm run icons` | Regenerate PWA icons; seed missing screenshots, preserve existing ones |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |

`src/init.ts` reads `version` from `package.json`, so the patch bump shows up in the About dialog
without a second edit.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
