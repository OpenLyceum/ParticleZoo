import { BAG_NODE_SETTINGS } from "../../ParticleZooConstants.js";
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
import { FONTS, HADRON_BUILDER } from "../../ParticleZooConstants.js";
import type { ParticleZooPreferencesModel } from "../../preferences/ParticleZooPreferencesModel.js";
import type { HadronBuilderModel } from "../model/HadronBuilderModel.js";

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

  private readonly preferences: ParticleZooPreferencesModel;

  public constructor(model: HadronBuilderModel, radius: number, preferences: ParticleZooPreferencesModel) {
    super();
    this.preferences = preferences;
    this.radius = radius;
    const strings = StringManager.getInstance().getHadronBuilderStrings();

    const outline = new Circle(radius, {
      fill: ParticleZooColors.bagFillProperty,
      stroke: ParticleZooColors.bagStrokeProperty,
      lineWidth: HADRON_BUILDER.OUTLINE_LINE_WIDTH,
      lineDash: [...HADRON_BUILDER.OUTLINE_DASH],
    });
    const hint = new Text(strings.bagHintStringProperty, {
      font: FONTS.BAG_HINT,
      fill: ParticleZooColors.textColorProperty,
      maxWidth: radius * BAG_NODE_SETTINGS.HINT_MAX_WIDTH_FACTOR,
      opacity: BAG_NODE_SETTINGS.HINT_OPACITY,
    });
    hint.boundsProperty.link(() => {
      hint.centerX = 0;
      hint.centerY = 0;
    });
    this.children = [outline, hint, this.constituentLayer];

    model.bagProperty.link((bag) => {
      hint.visible = bag.length === 0;
      // disposeSubtree: disposing each QuarkNode fires its disposeEmitter, which releases the
      // accessible-name PatternStringProperty from the localized string. Disposing the ball, rim
      // and letter is only tidiness: their fill/stroke color Properties are subscribed only while
      // drawn on a Display, and are released when the node leaves it.
      for (const node of this.constituents) {
        node.disposeSubtree();
      }
      const spread = bag.length === 1 ? 0 : radius * HADRON_BUILDER.CONSTITUENT_SPREAD_FACTOR;
      this.constituents = bag.map((q, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / bag.length + (bag.length === 2 ? Math.PI / 2 : 0);
        const accessibleName = new PatternStringProperty(strings.removeQuarkPatternStringProperty, {
          quark: quarkSymbol(q),
        });
        const node = new QuarkNode(q, {
          radius: HADRON_BUILDER.CONSTITUENT_RADIUS,
          cursor: "pointer",
          tagName: "button",
          accessibleName,
        });
        // The node owns its accessible name, which subscribes to the sim-lifetime string.
        node.disposeEmitter.addListener(() => accessibleName.dispose());
        node.center =
          bag.length === 1 ? outline.center : outline.center.plusXY(spread * Math.cos(angle), spread * Math.sin(angle));
        node.addInputListener({ click: () => model.removeAt(i) });
        return node;
      });
      this.constituentLayer.children = this.constituents;
      this.updateColors(model);
    });
    model.timeProperty.link(() => this.updateColors(model));
    this.preferences.animateColorChargeProperty.lazyLink(() => this.updateColors(model));
  }

  private updateColors(model: HadronBuilderModel): void {
    const bag = model.bagProperty.value;
    const phase = Math.floor(model.timeProperty.value / HADRON_BUILDER.COLOR_PERIOD);
    const neutral = model.colorNeutralProperty.value;
    let quarkIndex = 0;
    let antiIndex = 0;
    this.constituents.forEach((node, i) => {
      const q = bag[i];
      if (!q) {
        return;
      }
      // Animate only colour-neutral combinations (and only if the preference allows motion).
      const shift = neutral && this.preferences.animateColorChargeProperty.value ? phase : 0;
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
