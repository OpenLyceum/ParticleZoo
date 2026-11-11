/**
 * courtStrings.ts
 *
 * Builds the Reaction Court's ledger labels and verdict sentences from the
 * judgement, so the panels and the screen summary say the same thing.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { formatScientific } from "../../common/model/formatting.js";
import type { Particle } from "../../common/model/particleCatalog.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ForbiddenReason, Judgement, LedgerKey } from "../model/reactionRules.js";

type Lookup = Record<string, TReadOnlyProperty<string> | undefined>;

function court(): Lookup {
  return StringManager.getInstance().getReactionCourtStrings() as unknown as Lookup;
}

function get(key: string): string {
  return court()[`${key}StringProperty`]?.value ?? key;
}

export function ledgerLabel(key: LedgerKey): string {
  return get(key);
}

const REASON_KEYS: Readonly<Record<ForbiddenReason, string>> = {
  charge: "reasonCharge",
  baryon: "reasonBaryon",
  electron: "reasonElectron",
  muon: "reasonMuon",
  tau: "reasonTau",
  strangeness: "reasonFlavorJump",
  energy: "reasonEnergy",
  flavorJump: "reasonFlavorJump",
};

/** One- or two-sentence verdict, plus the measured lifetime for a decay. */
export function verdictSentences(
  judgement: Judgement,
  before: readonly Particle[],
): { verdict: string; measured: string } {
  const v = judgement.verdict;
  let verdict: string;
  if (v.kind === "incomplete") {
    verdict = get("incomplete");
  } else if (v.kind === "forbidden") {
    verdict = get("forbiddenPattern").replace("{{reasons}}", v.reasons.map((r) => get(REASON_KEYS[r])).join("; "));
  } else if (v.force === "weak") {
    verdict = get(v.flavorChanges ? "allowedWeakFlavor" : "allowedWeak");
  } else {
    verdict = get(v.force === "strong" ? "allowedStrong" : "allowedEm");
  }
  let measured = "";
  const parent = before[0];
  if (v.kind === "allowed" && judgement.isDecay && parent) {
    measured =
      parent.lifetime === null
        ? get("stableNote")
        : get("measuredPattern")
            .replace("{{particle}}", parent.symbol)
            .replace("{{value}}", formatScientific(parent.lifetime));
  }
  return { verdict, measured };
}

/** Energy line for the ledger. */
export function energyLine(judgement: Judgement, before: readonly Particle[], after: readonly Particle[]): string {
  const total = (ps: readonly Particle[]) => ps.reduce((t, p) => t + p.mass, 0);
  const round = (m: number) => `${Number(m.toPrecision(5))}`;
  if (judgement.isDecay) {
    return get("massDecayPattern")
      .replace("{{before}}", round(total(before)))
      .replace("{{after}}", round(total(after)));
  }
  return judgement.massBalance >= 0
    ? get("massCollisionFree").replace("{{value}}", round(judgement.massBalance))
    : get("massCollisionPattern").replace("{{value}}", round(-judgement.massBalance));
}
