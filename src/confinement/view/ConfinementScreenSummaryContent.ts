/**
 * ConfinementScreenSummaryContent.ts
 *
 * Screen summary; current details give the separation and stored energy, or
 * the break report once the string has snapped.
 */
import { DerivedProperty, PatternStringProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { ConfinementModel } from "../model/ConfinementModel.js";

export class ConfinementScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ConfinementModel) {
    const a11y = StringManager.getInstance().getConfinementA11yStrings();
    const strings = StringManager.getInstance().getConfinementStrings();
    const bound = new PatternStringProperty(a11y.currentDetailsBoundPatternStringProperty, {
      r: new DerivedProperty([model.separationProperty], (r) => r.toFixed(2)),
      energy: new DerivedProperty([model.energyProperty], (v) => `${Math.round(v)}`),
    });
    const details = new DerivedProperty(
      [bound, model.phaseProperty, model.fragmentsProperty, strings.brokenPatternStringProperty],
      (boundText, phase, fragments, pattern) =>
        phase === "broken" && fragments
          ? pattern
              .replace("{{r}}", model.separationProperty.value.toFixed(2))
              .replace("{{pair}}", fragments[1].quarks[0].flavor)
              .replace("{{left}}", fragments[0].meson?.symbol ?? "?")
              .replace("{{right}}", fragments[1].meson?.symbol ?? "?")
          : boundText,
    );
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: details,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
