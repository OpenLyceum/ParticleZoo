import { HADRON_RESULT_PANEL_SETTINGS } from "../../ParticleZooConstants.js";
/**
 * HadronResultPanel.ts
 *
 * Names what the bag makes: the matching hadron(s) with symbol, name, mass
 * and lifetime; or why nothing matches (net colour, or no known particle).
 */

import { Multilink } from "scenerystack/axon";
import { HBox, type Node, RichText, Text, VBox } from "scenerystack/scenery";
import { formatScientific } from "../../common/model/formatting.js";
import type { Particle } from "../../common/model/particleCatalog.js";
import { ParticleZooPanel } from "../../common/ParticleZooPanel.js";
import { richSymbol } from "../../common/view/richSymbol.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { FONTS } from "../../ParticleZooConstants.js";
import type { HadronBuilderModel } from "../model/HadronBuilderModel.js";

/** Localised description lines for one particle. */
export function describeParticle(particle: Particle): { name: string; family: string; mass: string; lifetime: string } {
  const sm = StringManager.getInstance();
  const names = sm.getParticleNames() as unknown as Record<string, { value: string } | undefined>;
  const common = sm.getCommonStrings();
  const name = names[`${particle.nameKey}StringProperty`]?.value ?? particle.nameKey;
  const family =
    particle.family === "baryon"
      ? particle.isAntiparticle
        ? common.antibaryonStringProperty.value
        : common.baryonStringProperty.value
      : particle.family === "meson"
        ? common.mesonStringProperty.value
        : particle.family === "lepton"
          ? common.leptonStringProperty.value
          : common.bosonStringProperty.value;
  const mass = common.massPatternStringProperty.value.replace(
    "{{value}}",
    `${Number(particle.mass.toPrecision(HADRON_RESULT_PANEL_SETTINGS.MASS_SIGNIFICANT_FIGURES))}`,
  );
  const lifetime =
    particle.lifetime === null
      ? common.stableStringProperty.value
      : common.lifetimePatternStringProperty.value.replace("{{value}}", formatScientific(particle.lifetime));
  return { name, family, mass, lifetime };
}

export class HadronResultPanel extends ParticleZooPanel {
  public constructor(model: HadronBuilderModel, width: number) {
    const strings = StringManager.getInstance().getHadronBuilderStrings();
    const content = new VBox({ spacing: HADRON_RESULT_PANEL_SETTINGS.CONTENT_SPACING, align: "left" });
    const note = (s: string, fill = ParticleZooColors.textColorProperty) =>
      new RichText(s, {
        font: FONTS.CONTROL,
        fill,
        lineWrap: width - HADRON_RESULT_PANEL_SETTINGS.NOTE_LINE_WRAP_OFFSET,
      });

    const card = (particle: Particle): Node => {
      const d = describeParticle(particle);
      return new HBox({
        spacing: HADRON_RESULT_PANEL_SETTINGS.CARD_SPACING,
        children: [
          new RichText(richSymbol(particle.symbol), {
            font: FONTS.EQUATION,
            fill: ParticleZooColors.highlightProperty,
          }),
          new VBox({
            align: "left",
            spacing: HADRON_RESULT_PANEL_SETTINGS.CARD_ITEM_2_SPACING,
            children: [
              new Text(`${d.name} (${d.family})`, {
                font: FONTS.READOUT_BOLD,
                fill: ParticleZooColors.textColorProperty,
                maxWidth: width - HADRON_RESULT_PANEL_SETTINGS.CARD_MAX_WIDTH_OFFSET,
              }),
              new Text(d.mass, { font: FONTS.CONTROL, fill: ParticleZooColors.textColorProperty }),
              new Text(d.lifetime, { font: FONTS.CONTROL, fill: ParticleZooColors.textColorProperty }),
            ],
          }),
        ],
      });
    };

    const update = () => {
      const verdict = model.verdictProperty.value;
      const matches = model.matchesProperty.value;
      for (const child of content.children) {
        child.disposeSubtree();
      }
      if (verdict === "empty") {
        content.children = [note(strings.emptyStringProperty.value)];
      } else if (verdict === "netColor") {
        content.children = [note(strings.netColorStringProperty.value, ParticleZooColors.badProperty)];
      } else if (verdict === "unknown") {
        const other = model.anySpinMatchesProperty.value.length > 0;
        content.children = [
          note(`${strings.unknownStringProperty.value}${other ? ` ${strings.tryOtherSpinStringProperty.value}` : ""}`),
        ];
      } else {
        content.children = [
          ...matches.map(card),
          ...(matches.length > 1 ? [note(strings.ambiguousNoteStringProperty.value)] : []),
        ];
      }
    };
    Multilink.multilink([model.verdictProperty, model.matchesProperty, strings.emptyStringProperty], update);

    super(content, {
      minWidth: width,
      maxWidth: width,
      minHeight: HADRON_RESULT_PANEL_SETTINGS.PANEL_MIN_HEIGHT,
    });
  }
}
