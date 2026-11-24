import { roundSymmetric } from "scenerystack/dot";
import { ENERGY_BAR_NODE_SETTINGS } from "../../ParticleZooConstants.js";
/**
 * EnergyBarNode.ts
 *
 * Vertical bar of the field energy, filling toward the cost of creating a
 * new quark–antiquark pair. Turns red at the top, where the string snaps.
 */

import { Multilink, PatternStringProperty } from "scenerystack/axon";
import { Line, Node, Rectangle, Text } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { CONFINEMENT, FONTS } from "../../ParticleZooConstants.js";
import { type ConfinementModel, PAIR_THRESHOLD } from "../model/ConfinementModel.js";

export class EnergyBarNode extends Node {
  public constructor(model: ConfinementModel, height: number) {
    super();
    const strings = StringManager.getInstance().getConfinementStrings();
    const width = CONFINEMENT.ENERGY_BAR_WIDTH;
    const outline = new Rectangle(0, 0, width, height, {
      stroke: ParticleZooColors.textColorProperty,
      lineWidth: ENERGY_BAR_NODE_SETTINGS.OUTLINE_LINE_WIDTH,
    });
    const fill = new Rectangle(0, height, width, 0, { fill: ParticleZooColors.highlightProperty });
    const overhang = CONFINEMENT.THRESHOLD_OVERHANG;
    const threshold = new Line(-overhang, 0, width + overhang, 0, {
      stroke: ParticleZooColors.badProperty,
      lineWidth: ENERGY_BAR_NODE_SETTINGS.THRESHOLD_LINE_WIDTH,
    });
    const thresholdLabel = new Text(
      new PatternStringProperty(strings.thresholdPatternStringProperty, { value: roundSymmetric(PAIR_THRESHOLD) }),
      {
        font: FONTS.SMALL,
        fill: ParticleZooColors.badProperty,
        maxWidth: ENERGY_BAR_NODE_SETTINGS.THRESHOLD_LABEL_MAX_WIDTH,
      },
    );
    thresholdLabel.boundsProperty.link(() => {
      thresholdLabel.left = width + ENERGY_BAR_NODE_SETTINGS.THRESHOLD_LABEL_LEFT_GAP;
      thresholdLabel.centerY = 0;
    });
    const title = new Text(strings.fieldEnergyStringProperty, {
      font: FONTS.PANEL_TITLE,
      fill: ParticleZooColors.textColorProperty,
      maxWidth: ENERGY_BAR_NODE_SETTINGS.TITLE_MAX_WIDTH,
    });
    title.boundsProperty.link(() => {
      title.centerX = width / 2;
      title.top = height + ENERGY_BAR_NODE_SETTINGS.TITLE_TOP_GAP;
    });
    this.children = [fill, outline, threshold, thresholdLabel, title];

    Multilink.multilink([model.fillFractionProperty, model.phaseProperty], (fraction, phase) => {
      const f = phase === "broken" ? 1 : fraction;
      fill.setRect(0, height * (1 - f), width, height * f);
      fill.fill = f >= 0.999 ? ParticleZooColors.badProperty : ParticleZooColors.highlightProperty;
    });
  }
}
