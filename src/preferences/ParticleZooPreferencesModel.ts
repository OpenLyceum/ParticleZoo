/**
 * ParticleZooPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in particleZooQueryParameters.
 *
 * A single instance is shared by main.ts (the Preferences dialog) and the
 * screen views that read it.
 */

import { BooleanProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import ParticleZooNamespace from "../ParticleZooNamespace.js";
import particleZooQueryParameters from "./particleZooQueryParameters.js";

export class ParticleZooPreferencesModel {
  /** Cycle the colour charges of the quarks in the Hadron Builder bag (gluon exchange). Turn off for reduced motion. */
  public readonly animateColorChargeProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.animateColorChargeProperty = new BooleanProperty(
      particleZooQueryParameters.animateColorCharge,
      tandem ? { tandem: tandem.createTandem("animateColorChargeProperty") } : undefined,
    );
  }

  public reset(): void {
    this.animateColorChargeProperty.reset();
  }
}

/** The sim-wide preferences. */
export const particleZooPreferences = new ParticleZooPreferencesModel(Tandem.ROOT.createTandem("preferences"));

ParticleZooNamespace.register("ParticleZooPreferencesModel", ParticleZooPreferencesModel);
