/**
 * EightfoldWayScreenSummaryContent.ts
 *
 * Screen summary; current details read back the student's prediction.
 */
import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatSigned } from "../../common/model/quarks.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { EightfoldWayModel } from "../model/EightfoldWayModel.js";

export class EightfoldWayScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: EightfoldWayModel) {
    const a11y = StringManager.getInstance().getEightfoldWayA11yStrings();
    const prediction = new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
      quarks: new DerivedProperty([model.predictedQuarksProperty], (q) => q.join(" ")),
      charge: new DerivedProperty([model.predictedChargeProperty], formatSigned),
      mass: model.predictedMassProperty,
    });
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new DerivedProperty(
        [prediction, model.revealedProperty, a11y.revealedDetailsStringProperty],
        (text, revealed, revealedText) => (revealed ? `${text} ${revealedText}` : text),
      ),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
