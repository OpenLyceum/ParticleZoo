/**
 * ParticleZooScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen.
 * Drawn on the standard PhET 548 × 373 canvas using ParticleZooColors.
 * Reuses the screens' quark artwork and profile colors for a baryon, the
 * decuplet, a stretched color string and an annihilation with a conservation check.
 */
import type { TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, type Color, Line, Node, Path, Rectangle } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import ParticleZooColors from "../ParticleZooColors.js";
import { type Flavor, quark } from "./model/quarks.js";
import { QuarkNode } from "./view/QuarkNode.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: ParticleZooColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: ParticleZooColors.backgroundColorProperty,
  });
}

/** A static, noninteractive constituent matching the screen's quark tiles. */
function constituent(
  flavor: Flavor,
  anti: boolean,
  colorProperty: TReadOnlyProperty<Color>,
  x: number,
  y: number,
  radius = 43,
): QuarkNode {
  const node = new QuarkNode(quark(flavor, anti), { radius, x, y, pickable: false });
  node.setColorCharge(colorProperty);
  return node;
}

/** The color-neutral uud proton inside the builder's bag. */
export function createHadronBuilderIcon(): ScreenIcon {
  return iconFrom(
    new Node({
      children: [
        background(),
        new Circle(142, {
          x: W / 2,
          y: H / 2,
          fill: ParticleZooColors.bagFillProperty,
          stroke: ParticleZooColors.bagStrokeProperty,
          lineWidth: 6,
        }),
        new Path(new Shape().moveTo(212, 142).lineTo(336, 142).lineTo(274, 252).close(), {
          stroke: ParticleZooColors.bagStrokeProperty,
          lineWidth: 8,
        }),
        constituent("u", false, ParticleZooColors.colorRedProperty, 212, 142),
        constituent("u", false, ParticleZooColors.colorGreenProperty, 336, 142),
        constituent("d", false, ParticleZooColors.colorBlueProperty, 274, 252),
      ],
    }),
  );
}

/** The four-three-two-one decuplet, with the missing Omega at the bottom. */
export function createEightfoldWayIcon(): ScreenIcon {
  const lattice = new Shape();
  const particles: Node[] = [];
  for (let row = 0; row < 4; row++) {
    const y = 65 + row * 80;
    for (let column = 0; column < 4 - row; column++) {
      const x = 109 + row * 55 + column * 110;
      if (column < 3 - row) {
        lattice.moveTo(x, y).lineTo(x + 110, y);
      }
      if (row < 3 && column < 3 - row) {
        lattice
          .moveTo(x, y)
          .lineTo(x + 55, y + 80)
          .lineTo(x + 110, y);
      }
      const missing = row === 3;
      particles.push(
        new Circle(22, {
          x,
          y,
          fill: missing ? ParticleZooColors.backgroundColorProperty : ParticleZooColors.quarkTileProperty,
          stroke: missing ? ParticleZooColors.highlightProperty : ParticleZooColors.bagStrokeProperty,
          lineWidth: missing ? 7 : 5,
          lineDash: missing ? [9, 6] : [],
        }),
      );
    }
  }
  return iconFrom(
    new Node({
      children: [
        background(),
        new Path(lattice, { stroke: ParticleZooColors.bagStrokeProperty, lineWidth: 5 }),
        ...particles,
      ],
    }),
  );
}

/** A quark-antiquark pair being pulled against the tension of its color string. */
export function createConfinementIcon(): ScreenIcon {
  const string = new Shape().moveTo(138, H / 2);
  for (let i = 1; i <= 28; i++) {
    string.lineTo(138 + (272 * i) / 28, H / 2 + (i === 28 ? 0 : i % 2 === 0 ? -16 : 16));
  }
  const arrows = { headHeight: 28, headWidth: 38, tailWidth: 13, stroke: null };
  return iconFrom(
    new Node({
      children: [
        background(),
        new Line(138, H / 2, 410, H / 2, {
          stroke: ParticleZooColors.highlightProperty,
          lineWidth: 30,
          opacity: 0.15,
        }),
        new Path(string, { stroke: ParticleZooColors.highlightProperty, lineWidth: 6, lineJoin: "round" }),
        constituent("u", false, ParticleZooColors.colorRedProperty, 96, H / 2),
        constituent("d", true, ParticleZooColors.antiRedProperty, 452, H / 2),
        new ArrowNode(175, 285, 65, 285, { ...arrows, fill: ParticleZooColors.textColorProperty }),
        new ArrowNode(373, 285, 483, 285, { ...arrows, fill: ParticleZooColors.textColorProperty }),
      ],
    }),
  );
}

/** A schematic quark-antiquark annihilation into two photons and a conservation check. */
export function createReactionCourtIcon(): ScreenIcon {
  const photons = new Shape();
  for (const direction of [-1, 1]) {
    photons.moveTo(245, 164);
    for (let i = 1; i <= 80; i++) {
      const u = i / 80;
      photons.lineTo(245 + 195 * u, 164 + direction * 70 * u + 12 * Math.sin(u * 8 * Math.PI));
    }
  }
  return iconFrom(
    new Node({
      children: [
        background(),
        new Path(new Shape().moveTo(105, 75).lineTo(245, 164).lineTo(105, 253), {
          stroke: ParticleZooColors.bagStrokeProperty,
          lineWidth: 8,
          lineCap: "round",
        }),
        new Path(photons, { stroke: ParticleZooColors.highlightProperty, lineWidth: 7 }),
        constituent("u", false, ParticleZooColors.colorRedProperty, 105, 75, 35),
        constituent("u", true, ParticleZooColors.antiRedProperty, 105, 253, 35),
        new Circle(12, { x: 245, y: 164, fill: ParticleZooColors.textColorProperty }),
        new Path(new Shape().moveTo(323, 284).lineTo(358, 318).lineTo(441, 233), {
          stroke: ParticleZooColors.goodProperty,
          lineWidth: 18,
          lineCap: "round",
          lineJoin: "round",
        }),
      ],
    }),
  );
}
