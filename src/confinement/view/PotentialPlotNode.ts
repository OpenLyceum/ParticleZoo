import { POTENTIAL_PLOT_NODE_SETTINGS } from "../../ParticleZooConstants.js";
/**
 * PotentialPlotNode.ts
 *
 * V(r) against r, with the pair-creation threshold as a horizontal line and
 * the current separation as a dot riding the curve.
 */

import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { CONFINEMENT, FONTS, PANEL_CORNER_RADIUS } from "../../ParticleZooConstants.js";
import { type ConfinementModel, PAIR_THRESHOLD, potential, SEPARATION_RANGE } from "../model/ConfinementModel.js";

export class PotentialPlotNode extends Node {
  private readonly multilinks: { dispose(): void }[] = [];
  public constructor(model: ConfinementModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getConfinementStrings();
    const frame = new Rectangle(0, 0, width, height, {
      fill: ParticleZooColors.panelBackgroundColorProperty,
      stroke: ParticleZooColors.panelBorderColorProperty,
      cornerRadius: PANEL_CORNER_RADIUS,
    });
    const title = new Text("", {
      font: FONTS.PANEL_TITLE,
      fill: ParticleZooColors.textColorProperty,
      left: CONFINEMENT.PLOT_TITLE_INSET,
      top: CONFINEMENT.PLOT_TITLE_TOP,
      maxWidth: width - 2 * CONFINEMENT.PLOT_TITLE_INSET,
    });
    const plot = new Node();
    this.children = [frame, title, plot];

    const left = CONFINEMENT.PLOT_LEFT_PAD;
    const right = width - CONFINEMENT.PLOT_RIGHT_PAD;
    const top = CONFINEMENT.PLOT_TOP_PAD;
    const bottom = height - CONFINEMENT.PLOT_BOTTOM_PAD;
    const vMin = CONFINEMENT.V_MIN;
    const vMax = CONFINEMENT.V_MAX;
    const x = (r: number): number => left + (r / SEPARATION_RANGE.max) * (right - left);
    const y = (v: number): number => bottom - ((v - vMin) / (vMax - vMin)) * (bottom - top);

    const draw = (): void => {
      const coulomb = model.coulombProperty.value;
      title.string = coulomb ? strings.plotTitleCoulombStringProperty.value : strings.plotTitleStringProperty.value;
      const children: Node[] = [];
      for (const v of [0, 400, 800, 1200, 1600]) {
        children.push(
          new Line(left, y(v), right, y(v), { stroke: ParticleZooColors.panelBorderColorProperty }),
          new Text(`${v}`, {
            font: FONTS.TICK,
            fill: ParticleZooColors.textColorProperty,
            right: left - POTENTIAL_PLOT_NODE_SETTINGS.DRAW_RIGHT_OFFSET,
            centerY: y(v),
          }),
        );
      }
      for (const r of [0, 0.5, 1, 1.5]) {
        children.push(
          new Text(`${r}`, {
            font: FONTS.TICK,
            fill: ParticleZooColors.textColorProperty,
            centerX: x(r),
            top: bottom + POTENTIAL_PLOT_NODE_SETTINGS.DRAW_TOP_OFFSET,
          }),
        );
      }
      children.push(
        new Text(strings.rAxisStringProperty, {
          font: FONTS.TICK,
          fill: ParticleZooColors.textColorProperty,
          right: right,
          top: bottom + POTENTIAL_PLOT_NODE_SETTINGS.AXIS_LABEL_TOP_GAP,
        }),
      );
      const curve = new Shape();
      let started = false;
      for (let r = CONFINEMENT.CURVE_R_START; r <= SEPARATION_RANGE.max; r += CONFINEMENT.CURVE_R_STEP) {
        const v = Math.max(vMin, potential(r, coulomb));
        started ? curve.lineTo(x(r), y(v)) : curve.moveTo(x(r), y(v));
        started = true;
      }
      children.push(
        new Path(curve, {
          stroke: ParticleZooColors.textColorProperty,
          lineWidth: POTENTIAL_PLOT_NODE_SETTINGS.DRAW_LINE_WIDTH,
        }),
        new Line(left, y(PAIR_THRESHOLD), right, y(PAIR_THRESHOLD), {
          stroke: ParticleZooColors.badProperty,
          lineDash: [
            POTENTIAL_PLOT_NODE_SETTINGS.DRAW_LINE_DASH_DASH,
            POTENTIAL_PLOT_NODE_SETTINGS.THRESHOLD_LINE_DASH_GAP,
          ],
          lineWidth: POTENTIAL_PLOT_NODE_SETTINGS.THRESHOLD_LINE_WIDTH,
        }),
        new Circle(CONFINEMENT.MARKER_RADIUS, {
          fill: ParticleZooColors.highlightProperty,
          center: new Vector2(x(model.separationProperty.value), y(Math.max(vMin, model.energyProperty.value))),
        }),
      );
      for (const child of plot.children) {
        child.disposeSubtree();
      }
      plot.children = children;
    };
    this.multilinks.push(
      Multilink.multilink([model.separationProperty, model.coulombProperty, strings.plotTitleStringProperty], draw),
    );
  }

  public override dispose(): void {
    for (const multilink of this.multilinks) {
      multilink.dispose();
    }
    for (const child of [...this.children]) {
      child.disposeSubtree();
    }
    super.dispose();
  }
}
