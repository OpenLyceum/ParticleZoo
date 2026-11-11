/**
 * HadronBuilderModel.ts
 *
 * A bag that holds up to three quarks or antiquarks. As the student fills it,
 * the model reports the combined charge Q, baryon number B, strangeness S
 * (plus charm and beauty), the possible spins, whether the combination is
 * colour-neutral, and which real hadrons (if any) it matches.
 *
 * This is the K⁺ = u s̄ worked example made interactive: u (+2/3) and s̄
 * (+1/3) give Q = +1, B = 1/3 − 1/3 = 0, S = +1.
 */

import { DerivedProperty, NumberProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { hadronsWithContent, type Particle } from "../../common/model/particleCatalog.js";
import {
  allowedSpins2,
  contentKey,
  isColorNeutral,
  type Quark,
  type QuarkSums,
  sumQuarks,
} from "../../common/model/quarks.js";

export const BAG_CAPACITY = 3;

export const VERDICTS = ["empty", "netColor", "hadron", "unknown"] as const;
export type Verdict = (typeof VERDICTS)[number];

export class HadronBuilderModel implements TModel {
  public readonly bagProperty = new Property<readonly Quark[]>([]);
  /** Chosen total spin, in units of ħ/2. Snaps to an allowed value as the bag changes. */
  public readonly spin2Property = new NumberProperty(1);
  /** Elapsed time, drives the colour-exchange animation. */
  public readonly timeProperty = new NumberProperty(0);

  public readonly sumsProperty: TReadOnlyProperty<QuarkSums>;
  public readonly allowedSpinsProperty: TReadOnlyProperty<number[]>;
  public readonly colorNeutralProperty: TReadOnlyProperty<boolean>;
  /** Hadrons with this quark content and the chosen spin. */
  public readonly matchesProperty: TReadOnlyProperty<Particle[]>;
  /** Hadrons with this content at any spin (so the view can say "try the other spin"). */
  public readonly anySpinMatchesProperty: TReadOnlyProperty<Particle[]>;
  public readonly verdictProperty: TReadOnlyProperty<Verdict>;

  public constructor() {
    this.sumsProperty = new DerivedProperty([this.bagProperty], (bag) => sumQuarks(bag));
    this.allowedSpinsProperty = new DerivedProperty([this.bagProperty], (bag) => allowedSpins2(bag.length));
    this.colorNeutralProperty = new DerivedProperty([this.bagProperty], (bag) => isColorNeutral(bag));
    this.matchesProperty = new DerivedProperty([this.bagProperty, this.spin2Property], (bag, spin2) =>
      bag.length >= 2 && isColorNeutral(bag) ? hadronsWithContent(contentKey(bag), spin2) : [],
    );
    this.anySpinMatchesProperty = new DerivedProperty([this.bagProperty], (bag) =>
      bag.length >= 2 && isColorNeutral(bag) ? hadronsWithContent(contentKey(bag)) : [],
    );
    this.verdictProperty = new DerivedProperty(
      [this.bagProperty, this.colorNeutralProperty, this.matchesProperty],
      (bag, neutral, matches) =>
        bag.length === 0 ? "empty" : !neutral ? "netColor" : matches.length > 0 ? "hadron" : "unknown",
    );

    // Keep the chosen spin legal: default to the lower (ground-state) spin.
    this.allowedSpinsProperty.link((spins) => {
      if (spins.length > 0 && !spins.includes(this.spin2Property.value)) {
        this.spin2Property.value = spins[0] ?? 1;
      }
    });
  }

  public get isFull(): boolean {
    return this.bagProperty.value.length >= BAG_CAPACITY;
  }

  /** Adds a quark; returns false when the bag is already full. */
  public add(q: Quark): boolean {
    if (this.isFull) {
      return false;
    }
    this.bagProperty.value = [...this.bagProperty.value, q];
    return true;
  }

  public removeAt(index: number): void {
    this.bagProperty.value = this.bagProperty.value.filter((_, i) => i !== index);
  }

  public clear(): void {
    this.bagProperty.value = [];
  }

  /** Loads a recipe such as "uS" (u s̄), for presets and tests. */
  public setContents(quarks: readonly Quark[]): void {
    this.bagProperty.value = quarks.slice(0, BAG_CAPACITY);
  }

  public reset(): void {
    this.bagProperty.reset();
    this.spin2Property.reset();
    this.timeProperty.reset();
  }

  public step(dt: number): void {
    this.timeProperty.value += dt;
  }
}
