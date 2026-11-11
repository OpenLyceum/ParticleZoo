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
import { type ConfinementModel, PAIR_THRESHOLD, potential, SEPARATION_RANGE } from "../model/ConfinementModel.js";

const V_MIN = -400;
const V_MAX = 1600;

export class PotentialPlotNode extends Node {
  public constructor(model: ConfinementModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getConfinementStrings();
    const frame = new Rectangle(0, 0, width, height, {
      fill: ParticleZooColors.panelBackgroundColorProperty,
      stroke: ParticleZooColors.panelBorderColorProperty,
      cornerRadius: 6,
    });
    const title = new Text("", {
      font: "bold 13px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      left: 8,
      top: 6,
      maxWidth: width - 16,
    });
    const plot = new Node();
    this.children = [frame, title, plot];

    const left = 48;
    const right = width - 12;
    const top = 30;
    const bottom = height - 30;
    const x = (r: number): number => left + (r / SEPARATION_RANGE.max) * (right - left);
    const y = (v: number): number => bottom - ((v - V_MIN) / (V_MAX - V_MIN)) * (bottom - top);

    const draw = (): void => {
      const coulomb = model.coulombProperty.value;
      title.string = coulomb ? strings.plotTitleCoulombStringProperty.value : strings.plotTitleStringProperty.value;
      const children: Node[] = [];
      for (const v of [0, 400, 800, 1200, 1600]) {
        children.push(
          new Line(left, y(v), right, y(v), { stroke: ParticleZooColors.panelBorderColorProperty }),
          new Text(`${v}`, {
            font: "11px sans-serif",
            fill: ParticleZooColors.textColorProperty,
            right: left - 4,
            centerY: y(v),
          }),
        );
      }
      for (const r of [0, 0.5, 1, 1.5]) {
        children.push(
          new Text(`${r}`, {
            font: "11px sans-serif",
            fill: ParticleZooColors.textColorProperty,
            centerX: x(r),
            top: bottom + 3,
          }),
        );
      }
      children.push(
        new Text(strings.rAxisStringProperty, {
          font: "11px sans-serif",
          fill: ParticleZooColors.textColorProperty,
          right: right,
          top: bottom + 14,
        }),
      );
      const curve = new Shape();
      let started = false;
      for (let r = 0.05; r <= SEPARATION_RANGE.max; r += 0.01) {
        const v = Math.max(V_MIN, potential(r, coulomb));
        started ? curve.lineTo(x(r), y(v)) : curve.moveTo(x(r), y(v));
        started = true;
      }
      children.push(
        new Path(curve, { stroke: ParticleZooColors.textColorProperty, lineWidth: 2 }),
        new Line(left, y(PAIR_THRESHOLD), right, y(PAIR_THRESHOLD), {
          stroke: ParticleZooColors.badProperty,
          lineDash: [6, 4],
          lineWidth: 1.5,
        }),
        new Circle(6, {
          fill: ParticleZooColors.highlightProperty,
          center: new Vector2(x(model.separationProperty.value), y(Math.max(V_MIN, model.energyProperty.value))),
        }),
      );
      plot.children = children;
    };
    Multilink.multilink([model.separationProperty, model.coulombProperty, strings.plotTitleStringProperty], draw);
  }
}
