/**
 * BagNode.ts
 *
 * The "bag" (the MIT-bag picture of a hadron) that holds the student's quarks.
 * Constituents swap colour charge over time, as gluon exchange does: in a
 * baryon the three colours rotate; in a meson the colour–anticolour pair
 * cycles together. Clicking a constituent removes it.
 */

import { PatternStringProperty } from "scenerystack/axon";
import { Circle, Node, Text } from "scenerystack/scenery";
import { quarkSymbol } from "../../common/model/quarks.js";
import { QuarkNode } from "../../common/view/QuarkNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import type { HadronBuilderModel } from "../model/HadronBuilderModel.js";

const COLOR_PERIOD = 0.9; // seconds per colour swap

const COLORS = [
  ParticleZooColors.colorRedProperty,
  ParticleZooColors.colorGreenProperty,
  ParticleZooColors.colorBlueProperty,
];
const ANTICOLORS = [
  ParticleZooColors.antiRedProperty,
  ParticleZooColors.antiGreenProperty,
  ParticleZooColors.antiBlueProperty,
];

export class BagNode extends Node {
  public readonly radius: number;
  /** Focusable constituent nodes, for the screen's pdomOrder. */
  public readonly constituentLayer = new Node();
  private constituents: QuarkNode[] = [];

  public constructor(model: HadronBuilderModel, radius: number) {
    super();
    this.radius = radius;
    const strings = StringManager.getInstance().getHadronBuilderStrings();

    const outline = new Circle(radius, {
      fill: ParticleZooColors.bagFillProperty,
      stroke: ParticleZooColors.bagStrokeProperty,
      lineWidth: 3,
      lineDash: [10, 6],
    });
    const hint = new Text(strings.bagHintStringProperty, {
      font: "13px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      maxWidth: radius * 1.6,
      opacity: 0.75,
    });
    hint.boundsProperty.link(() => {
      hint.centerX = 0;
      hint.centerY = 0;
    });
    this.children = [outline, hint, this.constituentLayer];

    model.bagProperty.link((bag) => {
      hint.visible = bag.length === 0;
      for (const node of this.constituents) {
        node.dispose();
      }
      const spread = bag.length === 1 ? 0 : radius * 0.42;
      this.constituents = bag.map((q, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / bag.length + (bag.length === 2 ? Math.PI / 2 : 0);
        const node = new QuarkNode(q, {
          radius: 30,
          cursor: "pointer",
          tagName: "button",
          accessibleName: new PatternStringProperty(strings.removeQuarkPatternStringProperty, {
            quark: quarkSymbol(q),
          }),
        });
        node.center =
          bag.length === 1 ? outline.center : outline.center.plusXY(spread * Math.cos(angle), spread * Math.sin(angle));
        node.addInputListener({ click: () => model.removeAt(i) });
        return node;
      });
      this.constituentLayer.children = this.constituents;
      this.updateColors(model);
    });
    model.timeProperty.link(() => this.updateColors(model));
  }

  private updateColors(model: HadronBuilderModel): void {
    const bag = model.bagProperty.value;
    const phase = Math.floor(model.timeProperty.value / COLOR_PERIOD);
    const neutral = model.colorNeutralProperty.value;
    let quarkIndex = 0;
    let antiIndex = 0;
    this.constituents.forEach((node, i) => {
      const q = bag[i];
      if (!q) {
        return;
      }
      // Animate only colour-neutral combinations; a lone net colour stays put.
      const shift = neutral ? phase : 0;
      if (q.anti) {
        // In a meson the antiquark carries the anticolour of its partner.
        const index = bag.length === 2 ? shift : antiIndex + shift;
        node.setColorCharge(ANTICOLORS[index % 3] ?? null);
        antiIndex++;
      } else {
        node.setColorCharge(COLORS[(quarkIndex + shift) % 3] ?? null);
        quarkIndex++;
      }
    });
  }
}
