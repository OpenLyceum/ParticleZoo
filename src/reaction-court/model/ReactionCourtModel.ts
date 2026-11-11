/**
 * ReactionCourtModel.ts
 *
 * The student assembles a reaction from a particle palette, and the court
 * rules on it (see reactionRules.ts). For some allowed reactions, a
 * constrained quark-level Feynman diagram can be completed vertex by vertex
 * (see vertexDiagrams.ts).
 */

import {
  BooleanProperty,
  DerivedProperty,
  Property,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { type Particle, particleById } from "../../common/model/particleCatalog.js";
import { type Judgement, judge } from "./reactionRules.js";
import { type Boson, checkVertex, type DiagramTemplate, diagramFor, type VertexCheck } from "./vertexDiagrams.js";

export const SIDES = ["before", "after"] as const;
export type Side = (typeof SIDES)[number];

export const MAX_BEFORE = 2;
export const MAX_AFTER = 4;

/** Particles on the palette, in display order (rows of related particles). */
export const PALETTE_IDS: readonly string[] = [
  "e-",
  "e+",
  "nu_e",
  "anti-nu_e",
  "mu-",
  "mu+",
  "nu_mu",
  "anti-nu_mu",
  "gamma",
  "tau-",
  "tau+",
  "nu_tau",
  "anti-nu_tau",
  "pi+",
  "pi-",
  "pi0",
  "eta",
  "rho0",
  "K+",
  "K-",
  "K0",
  "anti-K0",
  "J/psi",
  "p",
  "anti-p",
  "n",
  "anti-n",
  "Lambda",
  "Sigma+",
  "Sigma0",
  "Sigma-",
  "Xi0",
  "Xi-",
  "Omega-",
  "Delta++",
  "Delta0",
];

export type Preset = { readonly id: string; readonly before: readonly string[]; readonly after: readonly string[] };

/** Classic cases, allowed and forbidden, for the preset menu. */
export const PRESETS: readonly Preset[] = [
  { id: "betaDecay", before: ["n"], after: ["p", "e-", "anti-nu_e"] },
  { id: "lambdaDecay", before: ["Lambda"], after: ["p", "pi-"] },
  { id: "pionDecay", before: ["pi+"], after: ["mu+", "nu_mu"] },
  { id: "kaonDecay", before: ["K+"], after: ["pi+", "pi0"] },
  { id: "omegaDecay", before: ["Omega-"], after: ["Lambda", "K-"] },
  { id: "deltaDecay", before: ["Delta++"], after: ["p", "pi+"] },
  { id: "pi0Decay", before: ["pi0"], after: ["gamma", "gamma"] },
  { id: "sigma0Decay", before: ["Sigma0"], after: ["Lambda", "gamma"] },
  { id: "associatedProduction", before: ["pi-", "p"], after: ["K0", "Lambda"] },
  { id: "electronPositron", before: ["e+", "e-"], after: ["mu+", "mu-"] },
  { id: "protonDecay", before: ["p"], after: ["e+", "pi0"] },
  { id: "muonToElectronGamma", before: ["mu-"], after: ["e-", "gamma"] },
  { id: "wrongNeutrino", before: ["n"], after: ["p", "e-", "nu_e"] },
  { id: "photonPair", before: ["gamma"], after: ["e-", "e+"] },
];

export class ReactionCourtModel implements TModel {
  public readonly beforeProperty = new Property<readonly Particle[]>([]);
  public readonly afterProperty = new Property<readonly Particle[]>([]);
  public readonly sideProperty = new StringUnionProperty<Side>("before", { validValues: SIDES });
  public readonly showDiagramProperty = new BooleanProperty(false);
  public readonly bosonProperty = new Property<Boson | null>(null);
  public readonly slotChoicesProperty = new Property<readonly (string | null)[]>([]);

  public readonly judgementProperty: TReadOnlyProperty<Judgement>;
  public readonly diagramProperty: TReadOnlyProperty<DiagramTemplate | null>;
  /** Per-vertex result, or null while a blank on that vertex is unfilled. */
  public readonly vertexChecksProperty: TReadOnlyProperty<readonly (VertexCheck | null)[]>;

  public constructor() {
    this.judgementProperty = new DerivedProperty([this.beforeProperty, this.afterProperty], judge);
    this.diagramProperty = new DerivedProperty([this.beforeProperty, this.afterProperty], (before, after) =>
      diagramFor(
        before.map((p) => p.id),
        after.map((p) => p.id),
      ),
    );
    this.diagramProperty.link((diagram) => {
      this.bosonProperty.value = null;
      this.slotChoicesProperty.value = diagram ? diagram.slotOptions.map(() => null) : [];
      if (!diagram) {
        this.showDiagramProperty.value = false;
      }
    });
    this.vertexChecksProperty = new DerivedProperty(
      [this.diagramProperty, this.bosonProperty, this.slotChoicesProperty],
      (diagram, boson, choices) =>
        diagram
          ? diagram.vertices.map((vertex) => {
              const filled =
                boson !== null && vertex.legs.every((leg) => !("slot" in leg) || choices[leg.slot] !== null);
              return filled
                ? checkVertex(
                    vertex,
                    boson,
                    choices.map((c) => c ?? ""),
                  )
                : null;
            })
          : [],
    );
  }

  /** Adds a particle to the active side; switches to "after" once "before" is full. */
  public add(id: string): void {
    const particle = particleById(id);
    if (this.sideProperty.value === "before") {
      if (this.beforeProperty.value.length < MAX_BEFORE) {
        this.beforeProperty.value = [...this.beforeProperty.value, particle];
      }
    } else if (this.afterProperty.value.length < MAX_AFTER) {
      this.afterProperty.value = [...this.afterProperty.value, particle];
    }
  }

  public remove(side: Side, index: number): void {
    const property = side === "before" ? this.beforeProperty : this.afterProperty;
    property.value = property.value.filter((_, i) => i !== index);
  }

  public clear(): void {
    this.beforeProperty.value = [];
    this.afterProperty.value = [];
    this.sideProperty.value = "before";
  }

  public loadPreset(preset: Preset): void {
    this.beforeProperty.value = preset.before.map(particleById);
    this.afterProperty.value = preset.after.map(particleById);
    this.sideProperty.value = "after";
  }

  public setSlotChoice(slot: number, fermionId: string): void {
    const next = [...this.slotChoicesProperty.value];
    next[slot] = fermionId;
    this.slotChoicesProperty.value = next;
  }

  public reset(): void {
    this.clear();
    this.showDiagramProperty.reset();
  }

  public step(_dt: number): void {
    // Static screen.
  }
}
