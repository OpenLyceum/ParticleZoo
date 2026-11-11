/**
 * LedgerPanel.ts
 *
 * Conservation ledger: each quantity before and after, with a ✓ or ✗ (or a
 * note that a one-unit strangeness change is allowed only weakly), then the
 * mass–energy line.
 */

import { Multilink } from "scenerystack/axon";
import { GridBox, type Node, RichText, Text, VBox } from "scenerystack/scenery";
import { formatSigned } from "../../common/model/quarks.js";
import { ParticleZooPanel } from "../../common/ParticleZooPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import type { ReactionCourtModel } from "../model/ReactionCourtModel.js";
import type { LedgerRow } from "../model/reactionRules.js";
import { energyLine, ledgerLabel } from "./courtStrings.js";

const FONT = "14px sans-serif";

export class LedgerPanel extends ParticleZooPanel {
  public constructor(model: ReactionCourtModel, width: number) {
    const strings = StringManager.getInstance().getReactionCourtStrings();
    const text = (
      s: string,
      options: { bold?: boolean; fill?: typeof ParticleZooColors.textColorProperty; small?: boolean } = {},
    ) =>
      new Text(s, {
        font: `${options.bold ? "bold " : ""}${options.small ? "12px sans-serif" : FONT}`,
        fill: options.fill ?? ParticleZooColors.textColorProperty,
        maxWidth: width * 0.5,
      });
    const title = new Text(strings.ledgerTitleStringProperty, {
      font: `bold ${FONT}`,
      fill: ParticleZooColors.textColorProperty,
    });
    const grid = new GridBox({ xSpacing: 14, ySpacing: 3, xAlign: "center" });
    const energy = new Text("", { font: FONT, fill: ParticleZooColors.textColorProperty, maxWidth: width - 20 });
    const note = new Text(strings.spinNoteStringProperty, {
      font: "italic 11px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      opacity: 0.7,
      maxWidth: width - 20,
    });

    const ledgerRow = (row: LedgerRow, complete: boolean): Node[] => {
      const weakOnly = row.key === "strangeness" && row.before !== row.after && row.conserved;
      const mark = complete ? (weakOnly ? "~" : row.conserved ? "✓" : "✗") : "";
      const fill = weakOnly
        ? ParticleZooColors.highlightProperty
        : row.conserved
          ? ParticleZooColors.goodProperty
          : ParticleZooColors.badProperty;
      return [
        new RichText(ledgerLabel(row.key), {
          font: FONT,
          fill: ParticleZooColors.textColorProperty,
          maxWidth: width * 0.5,
          layoutOptions: { xAlign: "left" },
        }),
        text(formatSigned(row.before)),
        text(formatSigned(row.after)),
        text(mark, { bold: true, fill }),
      ];
    };

    Multilink.multilink(
      [model.judgementProperty, model.beforeProperty, model.afterProperty, strings.ledgerBeforeStringProperty],
      (judgement, before, after) => {
        const rows: Node[][] = [
          [
            text(""),
            text(strings.ledgerBeforeStringProperty.value, { small: true }),
            text(strings.ledgerAfterStringProperty.value, { small: true }),
            text(""),
          ],
        ];
        const complete = before.length > 0 && after.length > 0;
        rows.push(...judgement.rows.map((row) => ledgerRow(row, complete)));
        grid.rows = rows;
        const showEnergy = before.length > 0 && after.length > 0;
        energy.string = showEnergy
          ? `${energyLine(judgement, before, after)}  ${judgement.energyAllowed ? "✓" : "✗"}`
          : "";
        energy.fill = judgement.energyAllowed ? ParticleZooColors.textColorProperty : ParticleZooColors.badProperty;
      },
    );

    super(new VBox({ spacing: 6, align: "left", children: [title, grid, energy, note] }), {
      minWidth: width,
      maxWidth: width,
    });
  }
}
