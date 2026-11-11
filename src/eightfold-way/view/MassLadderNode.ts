/**
 * MassLadderNode.ts
 *
 * Mean decuplet mass for each strangeness row, with the step between rows
 * (≈ 150 MeV). The student's predicted mass appears at S = −3, and the
 * measured Ω⁻ mass joins it once revealed.
 */

import { Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Circle, Line, Node, Rectangle, Text } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { type EightfoldWayModel, OMEGA, rowMeanMass } from "../model/EightfoldWayModel.js";

const MIN_MASS = 1150;
const MAX_MASS = 1800;

export class MassLadderNode extends Node {
  public constructor(model: EightfoldWayModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getEightfoldWayStrings();
    const frame = new Rectangle(0, 0, width, height, {
      fill: ParticleZooColors.panelBackgroundColorProperty,
      stroke: ParticleZooColors.panelBorderColorProperty,
      cornerRadius: 6,
    });
    const title = new Text(strings.massLadderTitleStringProperty, {
      font: "bold 13px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      maxWidth: width - 16,
      left: 8,
      top: 6,
    });
    const plot = new Node();
    this.children = [frame, title, plot];

    const left = 46;
    const right = width - 16;
    const top = 32;
    const bottom = height - 26;
    const x = (s: number): number => left + (-s / 3) * (right - left);
    const y = (m: number): number => bottom - ((m - MIN_MASS) / (MAX_MASS - MIN_MASS)) * (bottom - top);

    const draw = (): void => {
      const children: Node[] = [];
      for (const m of [1200, 1400, 1600, 1800]) {
        children.push(
          new Line(left, y(m), right, y(m), { stroke: ParticleZooColors.panelBorderColorProperty }),
          new Text(`${m}`, {
            font: "11px sans-serif",
            fill: ParticleZooColors.textColorProperty,
            right: left - 4,
            centerY: y(m),
          }),
        );
      }
      for (const s of [0, -1, -2, -3]) {
        children.push(
          new Text(s === 0 ? "0" : `−${-s}`, {
            font: "11px sans-serif",
            fill: ParticleZooColors.textColorProperty,
            centerX: x(s),
            top: bottom + 4,
          }),
        );
      }
      const rows = [0, -1, -2].map((s) => ({ s, m: rowMeanMass(s) }));
      rows.forEach((row, i) => {
        children.push(
          new Circle(5, { fill: ParticleZooColors.textColorProperty, center: new Vector2(x(row.s), y(row.m)) }),
        );
        const next = rows[i + 1];
        if (next) {
          children.push(
            new Line(x(row.s), y(row.m), x(next.s), y(next.m), { stroke: ParticleZooColors.textColorProperty }),
            new Text(strings.stepPatternStringProperty.value.replace("{{value}}", `${Math.round(next.m - row.m)}`), {
              font: "11px sans-serif",
              fill: ParticleZooColors.textColorProperty,
              left: (x(row.s) + x(next.s)) / 2 + 4,
              bottom: (y(row.m) + y(next.m)) / 2 - 2,
            }),
          );
        }
      });
      const predicted = model.predictedMassProperty.value;
      const last = rows[rows.length - 1];
      if (last) {
        children.push(
          new Line(x(last.s), y(last.m), x(-3), y(predicted), {
            stroke: ParticleZooColors.highlightProperty,
            lineDash: [4, 4],
          }),
        );
      }
      const dot = new Circle(6, {
        stroke: ParticleZooColors.highlightProperty,
        lineWidth: 2.5,
        center: new Vector2(x(-3), y(predicted)),
      });
      children.push(dot);
      if (model.revealedProperty.value) {
        const real = new Circle(6, { fill: ParticleZooColors.goodProperty, center: new Vector2(x(-3), y(OMEGA.mass)) });
        children.push(real);
      }
      plot.children = children;
    };
    Multilink.multilink([model.predictedMassProperty, model.revealedProperty, strings.stepPatternStringProperty], draw);
  }
}
