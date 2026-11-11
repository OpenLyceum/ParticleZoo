/**
 * ReactionCourtScreenSummaryContent.ts
 *
 * Screen summary; current details read the reaction and the verdict.
 */
import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { ReactionCourtModel } from "../model/ReactionCourtModel.js";
import { verdictSentences } from "./courtStrings.js";

export class ReactionCourtScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ReactionCourtModel) {
    const a11y = StringManager.getInstance().getReactionCourtA11yStrings();
    const reaction = new DerivedProperty(
      [model.beforeProperty, model.afterProperty, a11y.emptyReactionStringProperty],
      (before, after, empty) =>
        before.length + after.length === 0
          ? empty
          : `${before.map((p) => p.symbol).join(" + ")} → ${after.map((p) => p.symbol).join(" + ")}`,
    );
    const verdict = new DerivedProperty([model.judgementProperty, model.beforeProperty], (judgement, before) => {
      const s = verdictSentences(judgement, before);
      return `${s.verdict} ${s.measured}`.trim();
    });
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, { reaction, verdict }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
