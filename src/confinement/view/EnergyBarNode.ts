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
import { type ConfinementModel, PAIR_THRESHOLD } from "../model/ConfinementModel.js";

export class EnergyBarNode extends Node {
  public constructor(model: ConfinementModel, height: number) {
    super();
    const strings = StringManager.getInstance().getConfinementStrings();
    const width = 34;
    const outline = new Rectangle(0, 0, width, height, { stroke: ParticleZooColors.textColorProperty, lineWidth: 1.5 });
    const fill = new Rectangle(0, height, width, 0, { fill: ParticleZooColors.highlightProperty });
    const threshold = new Line(-8, 0, width + 8, 0, { stroke: ParticleZooColors.badProperty, lineWidth: 3 });
    const thresholdLabel = new Text(
      new PatternStringProperty(strings.thresholdPatternStringProperty, { value: Math.round(PAIR_THRESHOLD) }),
      { font: "12px sans-serif", fill: ParticleZooColors.badProperty, maxWidth: 150 },
    );
    thresholdLabel.boundsProperty.link(() => {
      thresholdLabel.left = width + 12;
      thresholdLabel.centerY = 0;
    });
    const title = new Text(strings.fieldEnergyStringProperty, {
      font: "bold 13px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      maxWidth: 140,
    });
    title.boundsProperty.link(() => {
      title.centerX = width / 2;
      title.top = height + 8;
    });
    this.children = [fill, outline, threshold, thresholdLabel, title];

    Multilink.multilink([model.fillFractionProperty, model.phaseProperty], (fraction, phase) => {
      const f = phase === "broken" ? 1 : fraction;
      fill.setRect(0, height * (1 - f), width, height * f);
      fill.fill = f >= 0.999 ? ParticleZooColors.badProperty : ParticleZooColors.highlightProperty;
    });
  }
}
