import { MASS_LADDER_NODE_SETTINGS } from "../../ParticleZooConstants.js";
/**
 * MassLadderNode.ts
 *
 * Mean decuplet mass for each strangeness row, with the step between rows
 * (≈ 150 MeV). The student's predicted mass appears at S = −3, and the
 * measured Ω⁻ mass joins it once revealed.
 */

import { Multilink } from "scenerystack/axon";
import { roundSymmetric, Vector2 } from "scenerystack/dot";
import { Circle, Line, Node, Rectangle, Text } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { EIGHTFOLD, FONTS, PANEL_CORNER_RADIUS } from "../../ParticleZooConstants.js";
import { type EightfoldWayModel, OMEGA, rowMeanMass } from "../model/EightfoldWayModel.js";

export class MassLadderNode extends Node {
  public constructor(model: EightfoldWayModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getEightfoldWayStrings();
    const frame = new Rectangle(0, 0, width, height, {
      fill: ParticleZooColors.panelBackgroundColorProperty,
      stroke: ParticleZooColors.panelBorderColorProperty,
      cornerRadius: PANEL_CORNER_RADIUS,
    });
    const title = new Text(strings.massLadderTitleStringProperty, {
      font: FONTS.PANEL_TITLE,
      fill: ParticleZooColors.textColorProperty,
      maxWidth: width - MASS_LADDER_NODE_SETTINGS.TITLE_MAX_WIDTH_OFFSET,
      left: MASS_LADDER_NODE_SETTINGS.TITLE_LEFT,
      top: MASS_LADDER_NODE_SETTINGS.TITLE_TOP,
    });
    const plot = new Node();
    this.children = [frame, title, plot];

    const left: number = MASS_LADDER_NODE_SETTINGS.LEFT;
    const right = width - 16;
    const top: number = MASS_LADDER_NODE_SETTINGS.TOP;
    const bottom = height - 26;
    const minMass = EIGHTFOLD.LADDER_MIN_MASS;
    const maxMass = EIGHTFOLD.LADDER_MAX_MASS;
    const x = (s: number): number => left + (-s / 3) * (right - left);
    const y = (m: number): number => bottom - ((m - minMass) / (maxMass - minMass)) * (bottom - top);

    const draw = (): void => {
      const children: Node[] = [];
      for (const m of [1200, 1400, 1600, 1800]) {
        children.push(
          new Line(left, y(m), right, y(m), { stroke: ParticleZooColors.panelBorderColorProperty }),
          new Text(`${m}`, {
            font: FONTS.TICK,
            fill: ParticleZooColors.textColorProperty,
            right: left - MASS_LADDER_NODE_SETTINGS.DRAW_RIGHT_OFFSET,
            centerY: y(m),
          }),
        );
      }
      for (const s of [0, -1, -2, -3]) {
        children.push(
          new Text(s === 0 ? "0" : `−${-s}`, {
            font: FONTS.TICK,
            fill: ParticleZooColors.textColorProperty,
            centerX: x(s),
            top: bottom + MASS_LADDER_NODE_SETTINGS.DRAW_TOP_OFFSET,
          }),
        );
      }
      const rows = [0, -1, -2].map((s) => ({ s, m: rowMeanMass(s) }));
      rows.forEach((row, i) => {
        children.push(
          new Circle(MASS_LADDER_NODE_SETTINGS.DRAW_RADIUS, {
            fill: ParticleZooColors.textColorProperty,
            center: new Vector2(x(row.s), y(row.m)),
          }),
        );
        const next = rows[i + 1];
        if (next) {
          children.push(
            new Line(x(row.s), y(row.m), x(next.s), y(next.m), { stroke: ParticleZooColors.textColorProperty }),
            new Text(
              strings.stepPatternStringProperty.value.replace("{{value}}", `${roundSymmetric(next.m - row.m)}`),
              {
                font: FONTS.TICK,
                fill: ParticleZooColors.textColorProperty,
                left: (x(row.s) + x(next.s)) / 2 + MASS_LADDER_NODE_SETTINGS.DRAW_LEFT_OFFSET,
                bottom: (y(row.m) + y(next.m)) / 2 - 2,
              },
            ),
          );
        }
      });
      const predicted = model.predictedMassProperty.value;
      const last = rows[rows.length - 1];
      if (last) {
        children.push(
          new Line(x(last.s), y(last.m), x(-3), y(predicted), {
            stroke: ParticleZooColors.highlightProperty,
            lineDash: [MASS_LADDER_NODE_SETTINGS.DRAW_LINE_DASH_DASH, MASS_LADDER_NODE_SETTINGS.DRAW_LINE_DASH_DASH],
          }),
        );
      }
      const dot = new Circle(EIGHTFOLD.LADDER_MARKER_RADIUS, {
        stroke: ParticleZooColors.highlightProperty,
        lineWidth: MASS_LADDER_NODE_SETTINGS.DOT_LINE_WIDTH,
        center: new Vector2(x(-3), y(predicted)),
      });
      children.push(dot);
      if (model.revealedProperty.value) {
        const real = new Circle(EIGHTFOLD.LADDER_MARKER_RADIUS, {
          fill: ParticleZooColors.goodProperty,
          center: new Vector2(x(-3), y(OMEGA.mass)),
        });
        children.push(real);
      }
      for (const child of plot.children) {
        child.disposeSubtree();
      }
      plot.children = children;
    };
    Multilink.multilink([model.predictedMassProperty, model.revealedProperty, strings.stepPatternStringProperty], draw);
  }
}
