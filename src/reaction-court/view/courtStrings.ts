import { COURT_STRINGS_SETTINGS } from "../../ParticleZooConstants.js";
/**
 * courtStrings.ts
 *
 * Builds the Reaction Court's ledger labels and verdict sentences from the
 * judgement, so the panels and the screen summary say the same thing.
 */

import { formatScientific } from "../../common/model/formatting.js";
import type { Particle } from "../../common/model/particleCatalog.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ForbiddenReason, Judgement, LedgerKey } from "../model/reactionRules.js";

type CourtStrings = ReturnType<StringManager["getReactionCourtStrings"]>;
type CourtStringPropertyKey = Extract<keyof CourtStrings, `${string}StringProperty`>;

function get(key: CourtStringPropertyKey): string {
  return StringManager.getInstance().getReactionCourtStrings()[key].value;
}

export function ledgerLabel(key: LedgerKey): string {
  return get(`${key}StringProperty`);
}

const REASON_KEYS: Readonly<Record<ForbiddenReason, CourtStringPropertyKey>> = {
  charge: "reasonChargeStringProperty",
  baryon: "reasonBaryonStringProperty",
  electron: "reasonElectronStringProperty",
  muon: "reasonMuonStringProperty",
  tau: "reasonTauStringProperty",
  strangeness: "reasonFlavorJumpStringProperty",
  energy: "reasonEnergyStringProperty",
  flavorJump: "reasonFlavorJumpStringProperty",
};

/** One- or two-sentence verdict, plus the measured lifetime for a decay. */
export function verdictSentences(
  judgement: Judgement,
  before: readonly Particle[],
): { verdict: string; measured: string } {
  const v = judgement.verdict;
  let verdict: string;
  if (v.kind === "incomplete") {
    verdict = get("incompleteStringProperty");
  } else if (v.kind === "forbidden") {
    verdict = get("forbiddenPatternStringProperty").replace(
      "{{reasons}}",
      v.reasons.map((r) => get(REASON_KEYS[r])).join("; "),
    );
  } else if (v.force === "weak") {
    verdict = get(v.flavorChanges ? "allowedWeakFlavorStringProperty" : "allowedWeakStringProperty");
  } else {
    verdict = get(v.force === "strong" ? "allowedStrongStringProperty" : "allowedEmStringProperty");
  }
  let measured = "";
  const parent = before[0];
  if (v.kind === "allowed" && judgement.isDecay && parent) {
    measured =
      parent.lifetime === null
        ? get("stableNoteStringProperty")
        : get("measuredPatternStringProperty")
            .replace("{{particle}}", parent.symbol)
            .replace("{{value}}", formatScientific(parent.lifetime));
  }
  return { verdict, measured };
}

/** Energy line for the ledger. */
export function energyLine(judgement: Judgement, before: readonly Particle[], after: readonly Particle[]): string {
  const total = (ps: readonly Particle[]) => ps.reduce((t, p) => t + p.mass, 0);
  const round = (m: number) => `${Number(m.toPrecision(COURT_STRINGS_SETTINGS.ROUND_SIGNIFICANT_FIGURES))}`;
  if (judgement.isDecay) {
    return get("massDecayPatternStringProperty")
      .replace("{{before}}", round(total(before)))
      .replace("{{after}}", round(total(after)));
  }
  return judgement.massBalance >= 0
    ? get("massCollisionFreeStringProperty").replace("{{value}}", round(judgement.massBalance))
    : get("massCollisionPatternStringProperty").replace("{{value}}", round(-judgement.massBalance));
}
