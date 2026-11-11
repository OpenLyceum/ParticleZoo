/**
 * QuarkNode.ts
 *
 * A quark or antiquark drawn as a ball with its flavour letter. Antiquarks are
 * dark with a bar drawn over the letter (a drawn line, not a combining
 * character, so it renders in every font). An optional colour charge tints
 * the ball's rim.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import type { Color } from "scenerystack/scenery";
import { Circle, Line, Node, type NodeOptions, Text } from "scenerystack/scenery";
import ParticleZooColors from "../../ParticleZooColors.js";
import type { Quark } from "../model/quarks.js";

export type QuarkNodeOptions = NodeOptions & { radius?: number };

export class QuarkNode extends Node {
  private readonly rim: Circle;

  public constructor(quark: Quark, providedOptions?: QuarkNodeOptions) {
    const radius = providedOptions?.radius ?? 20;
    const ball = new Circle(radius, {
      fill: quark.anti ? ParticleZooColors.antiquarkTileProperty : ParticleZooColors.quarkTileProperty,
    });
    const rim = new Circle(radius, { stroke: ParticleZooColors.bagStrokeProperty, lineWidth: Math.max(2, radius / 6) });
    const letter = new Text(quark.flavor, {
      font: `italic bold ${Math.round(radius * 1.1)}px serif`,
      fill: quark.anti ? ParticleZooColors.antiquarkLabelProperty : ParticleZooColors.quarkLabelProperty,
      center: ball.center,
    });
    letter.centerY = ball.centerY - radius * 0.08;
    const children: Node[] = [ball, rim, letter];
    if (quark.anti) {
      children.push(
        new Line(letter.left, letter.top + 1, letter.right, letter.top + 1, {
          stroke: ParticleZooColors.antiquarkLabelProperty,
          lineWidth: Math.max(1.5, radius / 12),
        }),
      );
    }
    const { radius: _ignored, ...nodeOptions } = providedOptions ?? {};
    super({ children, ...nodeOptions });
    this.rim = rim;
  }

  /** Sets the colour-charge rim (null for the neutral palette look). */
  public setColorCharge(color: TReadOnlyProperty<Color> | null): void {
    this.rim.stroke = color ?? ParticleZooColors.bagStrokeProperty;
  }
}
