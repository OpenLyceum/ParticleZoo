/**
 * EightfoldWayModel.ts
 *
 * The spin-3/2 baryon decuplet as Gell-Mann saw it in 1962: nine members
 * measured, the bottom corner (S = −3) empty. The student predicts the
 * missing particle's quark content, charge and mass, then reveals the Ω⁻
 * (discovered at Brookhaven in 1964, at 1672 MeV).
 *
 * The octet (spin ½) is available as a fully known comparison multiplet.
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
import { type Particle, particleById } from "../../common/model/particleCatalog.js";
import { contentKey, FLAVORS, type Flavor, parseContent, quark } from "../../common/model/quarks.js";

export const MULTIPLETS = ["decuplet", "octet"] as const;
export type Multiplet = (typeof MULTIPLETS)[number];

export type Member = {
  readonly particle: Particle;
  /** Third component of isospin, I₃ = Q − (B + S)/2: the horizontal position. */
  readonly isospin3: number;
  /** Unknown in 1962 (only the Ω⁻). */
  readonly missing: boolean;
};

function member(id: string, missing = false): Member {
  const particle = particleById(id);
  return { particle, isospin3: particle.charge - (particle.baryonNumber + particle.strangeness) / 2, missing };
}

export const DECUPLET: readonly Member[] = [
  "Delta-",
  "Delta0",
  "Delta+",
  "Delta++",
  "Sigma*-",
  "Sigma*0",
  "Sigma*+",
  "Xi*-",
  "Xi*0",
]
  .map((id) => member(id))
  .concat([member("Omega-", true)]);

export const OCTET: readonly Member[] = ["n", "p", "Sigma-", "Sigma0", "Lambda", "Sigma+", "Xi-", "Xi0"].map((id) =>
  member(id),
);

/** Mean mass of each strangeness row of the known decuplet, MeV/c². */
export function rowMeanMass(strangeness: number): number {
  const row = DECUPLET.filter((m) => !m.missing && m.particle.strangeness === strangeness);
  return row.reduce((sum, m) => sum + m.particle.mass, 0) / row.length;
}

/**
 * Gell-Mann's equal-spacing extrapolation: the S = −3 mass continues the
 * steps between rows (≈ 1232 → 1385 → 1533 → ≈ 1680 MeV).
 */
export function equalSpacingPrediction(): number {
  const masses = [0, -1, -2].map(rowMeanMass);
  const step = ((masses[2] ?? 0) - (masses[0] ?? 0)) / 2;
  return (masses[2] ?? 0) + step;
}

export const MASS_RANGE = new Range(1500, 1900);
/** How close a mass prediction must be to count, MeV/c². */
export const MASS_TOLERANCE = 30;

export const OMEGA = DECUPLET.find((m) => m.missing)?.particle ?? particleById("Omega-");

export class EightfoldWayModel implements TModel {
  public readonly multipletProperty = new StringUnionProperty<Multiplet>("decuplet", { validValues: MULTIPLETS });
  /** The student's three quark picks for the empty slot. */
  public readonly predictedQuarksProperty = new Property<readonly [Flavor, Flavor, Flavor]>(["u", "d", "s"]);
  public readonly predictedChargeProperty = new NumberProperty(0, { range: new Range(-2, 2) });
  public readonly predictedMassProperty = new NumberProperty(1600, { range: MASS_RANGE });
  public readonly checkedProperty = new BooleanProperty(false);
  public readonly revealedProperty = new BooleanProperty(false);

  public readonly contentCorrectProperty: TReadOnlyProperty<boolean>;
  public readonly chargeCorrectProperty: TReadOnlyProperty<boolean>;
  public readonly massCorrectProperty: TReadOnlyProperty<boolean>;
  /** Charge implied by the predicted quarks (so the student can see Q follows from content). */
  public readonly contentChargeProperty: TReadOnlyProperty<number>;

  public constructor() {
    const omegaKey = contentKey(parseContent(OMEGA.contents[0] ?? "sss"));
    this.contentCorrectProperty = new DerivedProperty(
      [this.predictedQuarksProperty],
      (flavors) => contentKey(flavors.map((f) => quark(f))) === omegaKey,
    );
    this.chargeCorrectProperty = new DerivedProperty([this.predictedChargeProperty], (q) => q === OMEGA.charge);
    this.massCorrectProperty = new DerivedProperty(
      [this.predictedMassProperty],
      (m) => Math.abs(m - OMEGA.mass) <= MASS_TOLERANCE,
    );
    this.contentChargeProperty = new DerivedProperty([this.predictedQuarksProperty], (flavors) => {
      const charges3: Record<Flavor, number> = { u: 2, d: -1, s: -1, c: 2, b: -1 };
      return flavors.reduce((sum, f) => sum + charges3[f], 0) / 3;
    });
    // Editing a prediction clears an earlier check.
    const uncheck = () => {
      this.checkedProperty.value = false;
    };
    this.predictedQuarksProperty.lazyLink(uncheck);
    this.predictedChargeProperty.lazyLink(uncheck);
    this.predictedMassProperty.lazyLink(uncheck);
  }

  public setPredictedQuark(slot: 0 | 1 | 2, flavor: Flavor): void {
    const next = [...this.predictedQuarksProperty.value] as [Flavor, Flavor, Flavor];
    next[slot] = flavor;
    this.predictedQuarksProperty.value = next;
  }

  public get members(): readonly Member[] {
    return this.multipletProperty.value === "decuplet" ? DECUPLET : OCTET;
  }

  public check(): void {
    this.checkedProperty.value = true;
  }

  public reveal(): void {
    this.revealedProperty.value = true;
  }

  public reset(): void {
    this.multipletProperty.reset();
    this.predictedQuarksProperty.reset();
    this.predictedChargeProperty.reset();
    this.predictedMassProperty.reset();
    this.checkedProperty.reset();
    this.revealedProperty.reset();
  }

  public step(_dt: number): void {
    // Static screen.
  }
}

/** The flavours offered in the prediction pickers (the light three, as in 1962). */
export const PREDICTION_FLAVORS: readonly Flavor[] = FLAVORS.slice(0, 3);
