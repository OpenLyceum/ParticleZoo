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
import { PARTICLE_ZOO_SCREEN_ICONS_SETTINGS, SCREEN_ICONS } from "../ParticleZooConstants.js";
import { type Flavor, quark } from "./model/quarks.js";
import { QuarkNode } from "./view/QuarkNode.js";

const W = SCREEN_ICONS.WIDTH;
const H = SCREEN_ICONS.HEIGHT;

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
  radius: number = SCREEN_ICONS.CONSTITUENT_RADIUS,
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
        new Circle(PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_HADRON_BUILDER_ICON_RADIUS, {
          x: W / 2,
          y: H / 2,
          fill: ParticleZooColors.bagFillProperty,
          stroke: ParticleZooColors.bagStrokeProperty,
          lineWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_HADRON_BUILDER_ICON_LINE_WIDTH,
        }),
        new Path(
          new Shape()
            .moveTo(
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_HADRON_BUILDER_ICON_X,
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_HADRON_BUILDER_ICON_Y,
            )
            .lineTo(
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_HADRON_BUILDER_ICON_RIGHT_X,
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_HADRON_BUILDER_ICON_Y,
            )
            .lineTo(
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_HADRON_BUILDER_ICON_BOTTOM_X,
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_HADRON_BUILDER_ICON_BOTTOM_Y,
            )
            .close(),
          {
            stroke: ParticleZooColors.bagStrokeProperty,
            lineWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_HADRON_BUILDER_ICON_ITEM_3_LINE_WIDTH,
          },
        ),
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
        new Circle(PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_EIGHTFOLD_WAY_ICON_RADIUS, {
          x,
          y,
          fill: missing ? ParticleZooColors.backgroundColorProperty : ParticleZooColors.quarkTileProperty,
          stroke: missing ? ParticleZooColors.highlightProperty : ParticleZooColors.bagStrokeProperty,
          lineWidth: missing ? 7 : PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_EIGHTFOLD_WAY_ICON_LINE_WIDTH,
          lineDash: missing ? [PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_EIGHTFOLD_WAY_ICON_LINE_DASH_DASH, 6] : [],
        }),
      );
    }
  }
  return iconFrom(
    new Node({
      children: [
        background(),
        new Path(lattice, {
          stroke: ParticleZooColors.bagStrokeProperty,
          lineWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_EIGHTFOLD_WAY_ICON_LINE_WIDTH,
        }),
        ...particles,
      ],
    }),
  );
}

/** A quark-antiquark pair being pulled against the tension of its color string. */
export function createConfinementIcon(): ScreenIcon {
  const string = new Shape().moveTo(PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.STRING_X, H / 2);
  for (let i = 1; i <= 28; i++) {
    string.lineTo(138 + (272 * i) / 28, H / 2 + (i === 28 ? 0 : i % 2 === 0 ? -16 : 16));
  }
  const arrows = {
    headHeight: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.ARROWS_HEAD_HEIGHT,
    headWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.ARROWS_HEAD_WIDTH,
    tailWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.ARROWS_TAIL_WIDTH,
    stroke: null,
  };
  return iconFrom(
    new Node({
      children: [
        background(),
        new Line(
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_START_X,
          H / 2,
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_END_X,
          H / 2,
          {
            stroke: ParticleZooColors.highlightProperty,
            lineWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_LINE_WIDTH,
            opacity: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_OPACITY,
          },
        ),
        new Path(string, {
          stroke: ParticleZooColors.highlightProperty,
          lineWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_ITEM_3_LINE_WIDTH,
          lineJoin: "round",
        }),
        constituent("u", false, ParticleZooColors.colorRedProperty, 96, H / 2),
        constituent("d", true, ParticleZooColors.antiRedProperty, 452, H / 2),
        new ArrowNode(
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_LEFT_STUB_START_X,
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_START_Y,
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_LEFT_STUB_END_X,
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_END_Y,
          { ...arrows, fill: ParticleZooColors.textColorProperty },
        ),
        new ArrowNode(
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_RIGHT_STUB_START_X,
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_START_Y,
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_RIGHT_STUB_END_X,
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_CONFINEMENT_ICON_END_Y,
          { ...arrows, fill: ParticleZooColors.textColorProperty },
        ),
      ],
    }),
  );
}

/** A schematic quark-antiquark annihilation into two photons and a conservation check. */
export function createReactionCourtIcon(): ScreenIcon {
  const photons = new Shape();
  for (const direction of [-1, 1]) {
    photons.moveTo(
      PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_X,
      PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_Y,
    );
    for (let i = 1; i <= 80; i++) {
      const u = i / 80;
      photons.lineTo(245 + 195 * u, 164 + direction * 70 * u + 12 * Math.sin(u * 8 * Math.PI));
    }
  }
  return iconFrom(
    new Node({
      children: [
        background(),
        new Path(
          new Shape()
            .moveTo(
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_INCOMING_X,
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_INCOMING_TOP_Y,
            )
            .lineTo(
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_X,
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_Y,
            )
            .lineTo(
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_INCOMING_X,
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_INCOMING_BOTTOM_Y,
            ),
          {
            stroke: ParticleZooColors.bagStrokeProperty,
            lineWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_LINE_WIDTH,
            lineCap: "round",
          },
        ),
        new Path(photons, {
          stroke: ParticleZooColors.highlightProperty,
          lineWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_ITEM_3_LINE_WIDTH,
        }),
        constituent(
          "u",
          false,
          ParticleZooColors.colorRedProperty,
          105,
          75,
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.U_CONSTITUENT_RADIUS,
        ),
        constituent(
          "u",
          true,
          ParticleZooColors.antiRedProperty,
          105,
          253,
          PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.U_CONSTITUENT_RADIUS,
        ),
        new Circle(PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_RADIUS, {
          x: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_X,
          y: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_Y,
          fill: ParticleZooColors.textColorProperty,
        }),
        new Path(
          new Shape()
            .moveTo(
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_OUTGOING_START_X,
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_OUTGOING_START_Y,
            )
            .lineTo(
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_OUTGOING_MID_X,
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_OUTGOING_MID_Y,
            )
            .lineTo(
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_OUTGOING_END_X,
              PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_OUTGOING_END_Y,
            ),
          {
            stroke: ParticleZooColors.goodProperty,
            lineWidth: PARTICLE_ZOO_SCREEN_ICONS_SETTINGS.CREATE_REACTION_COURT_ICON_ITEM_7_LINE_WIDTH,
            lineCap: "round",
            lineJoin: "round",
          },
        ),
      ],
    }),
  );
}
