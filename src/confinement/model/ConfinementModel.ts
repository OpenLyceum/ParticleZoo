/**
 * ConfinementModel.ts
 *
 * A quark and an antiquark joined by a colour flux tube. Pulling them apart
 * stores energy V(r) = σr (σ ≈ 1 GeV/fm), optionally with the short-range
 * Coulomb-like term −(4/3)·αs·ħc/r. When V exceeds the cost of a new light
 * quark–antiquark pair (2 × 340 MeV of constituent mass), the tube snaps:
 * the new pair caps both ends and the student is left holding two mesons,
 * never a free quark.
 */

import {
  BooleanProperty,
  DerivedProperty,
  NumberProperty,
  Property,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { hadronsWithContent, type Particle } from "../../common/model/particleCatalog.js";
import { contentKey, FLAVOR_DATA, type Flavor, type Quark, quark } from "../../common/model/quarks.js";

/** String tension, MeV per fm (≈ 1 GeV/fm). */
export const STRING_TENSION = 1000;
/** ħc in MeV·fm. */
export const HBAR_C = 197.327;
/** Strong coupling at hadronic distances, for the optional Coulomb term. */
export const ALPHA_S = 0.3;
/** Separation range, fm. */
export const SEPARATION_RANGE = new Range(0.25, 1.6);
export const INITIAL_SEPARATION = 0.4;

export const PRESETS = ["piPlus", "kPlus", "jpsi"] as const;
export type Preset = (typeof PRESETS)[number];

/** Starting meson for each preset: [quark flavour, antiquark flavour]. */
export const PRESET_CONTENT: Readonly<Record<Preset, readonly [Flavor, Flavor]>> = {
  piPlus: ["u", "d"],
  kPlus: ["u", "s"],
  jpsi: ["c", "c"],
};

export const PHASES = ["bound", "broken"] as const;
export type Phase = (typeof PHASES)[number];

/** Field energy stored at separation r (fm), MeV. */
export function potential(r: number, coulomb: boolean): number {
  return STRING_TENSION * r - (coulomb ? ((4 / 3) * ALPHA_S * HBAR_C) / r : 0);
}

/** Energy needed to create a light (u ū or d d̄) pair, MeV. */
export const PAIR_THRESHOLD = 2 * FLAVOR_DATA.u.constituentMass + 8; // ≈ 680 MeV

/** Separation at which V(r) reaches the pair threshold, fm. */
export function breakingSeparation(coulomb: boolean): number {
  // σr − k/r = E  →  σr² − Er − k = 0
  const k = coulomb ? (4 / 3) * ALPHA_S * HBAR_C : 0;
  return (PAIR_THRESHOLD + Math.sqrt(PAIR_THRESHOLD ** 2 + 4 * STRING_TENSION * k)) / (2 * STRING_TENSION);
}

export type Fragment = {
  readonly quarks: readonly [Quark, Quark];
  /** Ground-state meson with this content (spin 0), if one is catalogued. */
  readonly meson: Particle | null;
};

function mesonFor(quarks: readonly [Quark, Quark]): Particle | null {
  return hadronsWithContent(contentKey(quarks), 0)[0] ?? null;
}

export class ConfinementModel implements TModel {
  public readonly presetProperty = new StringUnionProperty<Preset>("piPlus", { validValues: PRESETS });
  public readonly separationProperty = new NumberProperty(INITIAL_SEPARATION, { range: SEPARATION_RANGE });
  public readonly coulombProperty = new BooleanProperty(false);
  public readonly phaseProperty = new StringUnionProperty<Phase>("bound", { validValues: PHASES });
  /** Seconds since the string broke, for the fly-apart animation. */
  public readonly sinceBreakProperty = new NumberProperty(0);
  /** The two mesons left after the break. */
  public readonly fragmentsProperty = new Property<readonly [Fragment, Fragment] | null>(null);

  public readonly energyProperty: TReadOnlyProperty<number>;
  /** Fraction of the pair threshold stored in the field (0 … 1). */
  public readonly fillFractionProperty: TReadOnlyProperty<number>;
  public readonly originalMesonProperty: TReadOnlyProperty<Particle | null>;

  /** Alternates u ū and d d̄ between breaks, so both outcomes appear. */
  private nextPairFlavor: Flavor = "u";

  public constructor() {
    this.energyProperty = new DerivedProperty([this.separationProperty, this.coulombProperty], potential);
    this.fillFractionProperty = new DerivedProperty([this.energyProperty], (e) =>
      Math.max(0, Math.min(1, e / PAIR_THRESHOLD)),
    );
    this.originalMesonProperty = new DerivedProperty([this.presetProperty], (preset) => {
      const [q, aq] = PRESET_CONTENT[preset];
      return mesonFor([quark(q), quark(aq, true)]);
    });
    this.presetProperty.lazyLink(() => this.rejoin());
    this.coulombProperty.lazyLink(() => this.rejoin());
  }

  /** The student drags the antiquark: sets r, and snaps the string past threshold. */
  public pull(separation: number): void {
    if (this.phaseProperty.value === "broken") {
      return;
    }
    const breakAt = breakingSeparation(this.coulombProperty.value);
    if (separation >= breakAt) {
      this.separationProperty.value = Math.min(breakAt, SEPARATION_RANGE.max);
      this.snap();
    } else {
      this.separationProperty.value = SEPARATION_RANGE.constrainValue(separation);
    }
  }

  private snap(): void {
    const [q, aq] = PRESET_CONTENT[this.presetProperty.value];
    const flavor = this.nextPairFlavor;
    this.nextPairFlavor = flavor === "u" ? "d" : "u";
    const left: [Quark, Quark] = [quark(q), quark(flavor, true)];
    const right: [Quark, Quark] = [quark(flavor), quark(aq, true)];
    this.fragmentsProperty.value = [
      { quarks: left, meson: mesonFor(left) },
      { quarks: right, meson: mesonFor(right) },
    ];
    this.sinceBreakProperty.value = 0;
    this.phaseProperty.value = "broken";
  }

  /** Back to a single bound meson at the starting separation. */
  public rejoin(): void {
    this.phaseProperty.value = "bound";
    this.fragmentsProperty.value = null;
    this.sinceBreakProperty.value = 0;
    this.separationProperty.value = INITIAL_SEPARATION;
  }

  public reset(): void {
    this.presetProperty.reset();
    this.coulombProperty.reset();
    this.nextPairFlavor = "u";
    this.rejoin();
  }

  public step(dt: number): void {
    if (this.phaseProperty.value === "broken") {
      this.sinceBreakProperty.value += dt;
    }
  }
}
