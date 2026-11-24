/**
 * HadronBuilderScreenSummaryContent.ts
 *
 * Screen summary; the current-details paragraph lists the bag's contentsProperty and
 * what they make.
 */
import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { quarkSymbol } from "../../common/model/quarks.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { HadronBuilderModel } from "../model/HadronBuilderModel.js";
import { describeParticle } from "./HadronResultPanel.js";

export class HadronBuilderScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: HadronBuilderModel) {
    const a11y = StringManager.getInstance().getHadronBuilderA11yStrings();
    const strings = StringManager.getInstance().getHadronBuilderStrings();
    const contentsProperty = new DerivedProperty([model.bagProperty, a11y.emptyBagStringProperty], (bag, empty) =>
      bag.length === 0 ? empty : bag.map(quarkSymbol).join(" "),
    );
    const resultProperty = new DerivedProperty(
      [
        model.verdictProperty,
        model.matchesProperty,
        strings.netColorStringProperty,
        strings.unknownStringProperty,
        strings.emptyStringProperty,
      ],
      (verdict, matches, netColor, unknown, empty) =>
        verdict === "empty"
          ? empty
          : verdict === "netColor"
            ? netColor
            : verdict === "unknown"
              ? unknown
              : matches.map((p) => `${p.symbol}, ${describeParticle(p).name}`).join("; "),
    );
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: new PatternStringProperty(a11y.currentDetailsPatternStringProperty, {
        contents: contentsProperty,
        result: resultProperty,
      }),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
