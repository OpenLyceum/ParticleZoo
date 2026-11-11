/**
 * reactionRules.ts
 *
 * Judges a proposed reaction or decay. The ledger compares the before and
 * after totals of charge Q, baryon number B, the three lepton numbers and
 * strangeness S (plus charm and beauty, which behave like S), and checks
 * mass–energy:
 *
 *  - a decay (one particle before) needs m_before ≥ Σ m_after;
 *  - a collision (two before) can always be supplied with enough kinetic
 *    energy, so it reports the extra rest energy it must provide.
 *
 * Verdict, in order:
 *  1. Q, B or a lepton number not conserved → forbidden, whatever the force.
 *  2. A decay without enough rest energy → forbidden.
 *  3. Strangeness (or charm, beauty) changes by 2 or more → forbidden: the
 *     weak interaction changes flavour one unit at a time.
 *  4. Otherwise allowed, by the strongest force whose rules it obeys:
 *     neutrinos, or a change in S, C or beauty → weak;
 *     photons (or charged leptons, with no neutrinos) → electromagnetic;
 *     hadrons only, all flavours conserved → strong.
 *
 * Angular momentum and spin are not checked; the ledger says so.
 */

import type { Particle } from "../../common/model/particleCatalog.js";

export const LEDGER_KEYS = ["charge", "baryon", "electron", "muon", "tau", "strangeness"] as const;
export type LedgerKey = (typeof LEDGER_KEYS)[number];

export const FORCES = ["strong", "electromagnetic", "weak"] as const;
export type Force = (typeof FORCES)[number];

/** Characteristic lifetimes, seconds: [shortest, longest] of the typical range. */
export const LIFETIME_SCALE: Readonly<Record<Force, readonly [number, number]>> = {
  strong: [1e-24, 1e-22],
  electromagnetic: [1e-20, 1e-16],
  weak: [1e-13, 1e3],
};

export type LedgerRow = {
  readonly key: LedgerKey;
  readonly before: number;
  readonly after: number;
  /** For strangeness, a one-unit change is allowed (weakly), so it is not a violation. */
  readonly conserved: boolean;
};

export type Verdict =
  | { readonly kind: "incomplete" }
  | { readonly kind: "forbidden"; readonly reasons: readonly ForbiddenReason[] }
  | { readonly kind: "allowed"; readonly force: Force; readonly flavorChanges: boolean };

export type ForbiddenReason = LedgerKey | "energy" | "flavorJump";

export type Judgement = {
  readonly rows: readonly LedgerRow[];
  /** Σ m_before − Σ m_after, MeV/c². */
  readonly massBalance: number;
  readonly isDecay: boolean;
  /** Decay: whether m_before ≥ Σ m_after. Collision: always true (energy can be supplied). */
  readonly energyAllowed: boolean;
  readonly verdict: Verdict;
};

function value(p: Particle, key: LedgerKey): number {
  switch (key) {
    case "charge":
      return p.charge;
    case "baryon":
      return p.baryonNumber;
    case "electron":
      return p.electronNumber;
    case "muon":
      return p.muonNumber;
    case "tau":
      return p.tauNumber;
    case "strangeness":
      return p.strangeness;
  }
}

const sum = (ps: readonly Particle[], f: (p: Particle) => number): number => ps.reduce((t, p) => t + f(p), 0);

const isNeutrino = (p: Particle): boolean => p.family === "lepton" && p.charge === 0;

export function judge(before: readonly Particle[], after: readonly Particle[]): Judgement {
  const rows = LEDGER_KEYS.map((key) => {
    const b = sum(before, (p) => value(p, key));
    const a = sum(after, (p) => value(p, key));
    return { key, before: b, after: a, conserved: key === "strangeness" ? Math.abs(a - b) <= 1 : a === b };
  });
  const massBalance = sum(before, (p) => p.mass) - sum(after, (p) => p.mass);
  const isDecay = before.length === 1;
  const energyAllowed = !isDecay || massBalance >= 0;

  if (before.length === 0 || after.length === 0 || (isDecay && after.length < 2 && after[0]?.id === before[0]?.id)) {
    return { rows, massBalance, isDecay, energyAllowed, verdict: { kind: "incomplete" } };
  }

  const reasons: ForbiddenReason[] = rows.filter((r) => r.key !== "strangeness" && !r.conserved).map((r) => r.key);
  if (!energyAllowed) {
    reasons.push("energy");
  }
  const dS = sum(after, (p) => p.strangeness) - sum(before, (p) => p.strangeness);
  const dC = sum(after, (p) => p.charm) - sum(before, (p) => p.charm);
  const dBeauty = sum(after, (p) => p.beauty) - sum(before, (p) => p.beauty);
  if (Math.abs(dS) >= 2 || Math.abs(dC) >= 2 || Math.abs(dBeauty) >= 2) {
    reasons.push("flavorJump");
  }
  if (reasons.length > 0) {
    return { rows, massBalance, isDecay, energyAllowed, verdict: { kind: "forbidden", reasons } };
  }

  const all = [...before, ...after];
  const flavorChanges = dS !== 0 || dC !== 0 || dBeauty !== 0;
  const weak = flavorChanges || all.some(isNeutrino) || all.some((p) => p.id === "W+" || p.id === "anti-W+");
  const electromagnetic = all.some((p) => p.id === "gamma" || p.family === "lepton");
  const force: Force = weak ? "weak" : electromagnetic ? "electromagnetic" : "strong";
  return { rows, massBalance, isDecay, energyAllowed, verdict: { kind: "allowed", force, flavorChanges } };
}
