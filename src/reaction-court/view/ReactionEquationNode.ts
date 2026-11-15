/**
 * ReactionEquationNode.ts
 *
 * The reaction as written: before → after. Each particle is a button that
 * removes it; the active side is underlined.
 */

import { Multilink, PatternStringProperty } from "scenerystack/axon";
import { HBox, Line, Node, RichText, Text } from "scenerystack/scenery";
import type { Particle } from "../../common/model/particleCatalog.js";
import { richSymbol } from "../../common/view/richSymbol.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { FONTS, REACTION_COURT } from "../../ParticleZooConstants.js";
import type { ReactionCourtModel, Side } from "../model/ReactionCourtModel.js";

export class ReactionEquationNode extends Node {
  public constructor(model: ReactionCourtModel) {
    super();
    const a11y = StringManager.getInstance().getReactionCourtA11yStrings();
    const row = new HBox({ spacing: REACTION_COURT.EQUATION_SPACING, align: "center" });
    const underline = new Line(0, 0, 0, 0, {
      stroke: ParticleZooColors.highlightProperty,
      lineWidth: REACTION_COURT.EQUATION_UNDERLINE_WIDTH,
    });
    this.children = [row, underline];

    const token = (p: Particle, side: Side, index: number): Node => {
      const text = new RichText(richSymbol(p.symbol), {
        font: FONTS.EQUATION,
        fill: ParticleZooColors.textColorProperty,
        cursor: "pointer",
        tagName: "button",
        accessibleName: new PatternStringProperty(a11y.controls.removePatternStringProperty, { particle: p.symbol }),
      });
      text.addInputListener({ click: () => model.remove(side, index), down: () => model.remove(side, index) });
      return text;
    };
    const plus = () => new Text("+", { font: FONTS.EQUATION, fill: ParticleZooColors.textColorProperty, opacity: 0.6 });
    const placeholder = () =>
      new Text("…", { font: FONTS.EQUATION, fill: ParticleZooColors.textColorProperty, opacity: 0.4 });
    const sideNode = (particles: readonly Particle[], which: Side): Node => {
      if (particles.length === 0) {
        return placeholder();
      }
      const children: Node[] = [];
      particles.forEach((p, i) => {
        if (i > 0) {
          children.push(plus());
        }
        children.push(token(p, which, i));
      });
      return new HBox({ spacing: REACTION_COURT.EQUATION_TOKEN_SPACING, children });
    };

    Multilink.multilink([model.beforeProperty, model.afterProperty, model.sideProperty], (before, after, active) => {
      for (const child of row.children) {
        child.dispose();
      }
      const beforeNode = sideNode(before, "before");
      const afterNode = sideNode(after, "after");
      row.children = [
        beforeNode,
        new Text("→", { font: FONTS.EQUATION, fill: ParticleZooColors.highlightProperty }),
        afterNode,
      ];
      const target = active === "before" ? beforeNode : afterNode;
      underline.setLine(target.left, row.bottom + 4, target.right, row.bottom + 4);
    });
  }
}
