/**
 * VerdictPanel.ts
 *
 * The court's ruling: forbidden (and why), or allowed by which force, with
 * the lifetime scale that force implies and, for a decay, the measured
 * lifetime of the parent.
 */

import { Multilink } from "scenerystack/axon";
import { RichText, Text, VBox } from "scenerystack/scenery";
import { ParticleZooPanel } from "../../common/ParticleZooPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import type { ReactionCourtModel } from "../model/ReactionCourtModel.js";
import { verdictSentences } from "./courtStrings.js";

export class VerdictPanel extends ParticleZooPanel {
  public constructor(model: ReactionCourtModel, width: number) {
    const strings = StringManager.getInstance().getReactionCourtStrings();
    const title = new Text(strings.verdictTitleStringProperty, {
      font: "bold 14px sans-serif",
      fill: ParticleZooColors.textColorProperty,
    });
    const verdict = new RichText("", { font: "bold 15px sans-serif", lineWrap: width - 24 });
    const measured = new RichText("", {
      font: "14px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      lineWrap: width - 24,
    });

    Multilink.multilink(
      [model.judgementProperty, model.beforeProperty, strings.incompleteStringProperty],
      (judgement, before) => {
        const sentences = verdictSentences(judgement, before);
        verdict.string = sentences.verdict;
        measured.string = sentences.measured;
        const kind = judgement.verdict.kind;
        verdict.fill =
          kind === "forbidden"
            ? ParticleZooColors.badProperty
            : kind === "allowed"
              ? ParticleZooColors.goodProperty
              : ParticleZooColors.textColorProperty;
      },
    );

    super(new VBox({ spacing: 6, align: "left", children: [title, verdict, measured] }), {
      minWidth: width,
      maxWidth: width,
      minHeight: 110,
    });
  }
}
