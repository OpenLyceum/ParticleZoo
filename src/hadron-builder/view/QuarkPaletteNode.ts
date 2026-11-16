import { QUARK_PALETTE_NODE_SETTINGS } from "../../ParticleZooConstants.js";
/**
 * QuarkPaletteNode.ts
 *
 * Two rows of tiles: the five quarks and their antiquarks. A tile can be
 * dragged into the bag, or clicked (or activated from the keyboard) to drop
 * straight in.
 */

import { PatternStringProperty } from "scenerystack/axon";
import type { Vector2 } from "scenerystack/dot";
import { DragListener, HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { FLAVORS, type Quark, quark, quarkSymbol } from "../../common/model/quarks.js";
import { ParticleZooPanel } from "../../common/ParticleZooPanel.js";
import { QuarkNode } from "../../common/view/QuarkNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { FONTS, HADRON_BUILDER } from "../../ParticleZooConstants.js";
import type { HadronBuilderModel } from "../model/HadronBuilderModel.js";

export class QuarkPaletteNode extends ParticleZooPanel {
  public readonly tiles: Node[];

  /**
   * @param dragLayer - node (in screen coordinates) that holds the dragged ghost
   * @param dropTarget - returns true when a global point lies inside the bag
   */
  public constructor(model: HadronBuilderModel, dragLayer: Node, dropTarget: (globalPoint: Vector2) => boolean) {
    const strings = StringManager.getInstance().getHadronBuilderStrings();
    const a11y = StringManager.getInstance().getHadronBuilderA11yStrings();

    const makeTile = (q: Quark): Node => {
      const tile = new QuarkNode(q, {
        radius: HADRON_BUILDER.TILE_RADIUS,
        cursor: "pointer",
        tagName: "button",
        accessibleName: new PatternStringProperty(a11y.controls.addQuarkPatternStringProperty, {
          quark: quarkSymbol(q),
        }),
      });
      tile.addInputListener({ click: () => model.add(q) });

      let ghost: QuarkNode | null = null;
      let start: Vector2 | null = null;
      tile.addInputListener(
        new DragListener({
          start: (event) => {
            start = event.pointer.point.copy();
            ghost = new QuarkNode(q, {
              radius: HADRON_BUILDER.TILE_RADIUS,
              pickable: false,
              opacity: QUARK_PALETTE_NODE_SETTINGS.MAKE_TILE_OPACITY,
            });
            ghost.center = dragLayer.globalToLocalPoint(event.pointer.point);
            dragLayer.addChild(ghost);
          },
          drag: (event) => {
            if (ghost) {
              ghost.center = dragLayer.globalToLocalPoint(event.pointer.point);
            }
          },
          end: (event) => {
            const point = event?.pointer.point ?? start;
            const moved = point && start ? point.distance(start) : 0;
            if (point && (moved < HADRON_BUILDER.CLICK_SLOP || dropTarget(point))) {
              model.add(q);
            }
            ghost?.dispose();
            ghost = null;
            start = null;
          },
        }),
      );
      return tile;
    };

    const quarkTiles = FLAVORS.map((f) => makeTile(quark(f)));
    const antiTiles = FLAVORS.map((f) => makeTile(quark(f, true)));
    const label = (text: typeof strings.quarksStringProperty) =>
      new Text(text, {
        font: FONTS.PALETTE_LABEL,
        fill: ParticleZooColors.textColorProperty,
        maxWidth: QUARK_PALETTE_NODE_SETTINGS.LABEL_MAX_WIDTH,
      });

    super(
      new VBox({
        spacing: HADRON_BUILDER.PALETTE_V_SPACING,
        align: "left",
        children: [
          label(strings.quarksStringProperty),
          new HBox({ spacing: HADRON_BUILDER.PALETTE_H_SPACING, children: quarkTiles }),
          label(strings.antiquarksStringProperty),
          new HBox({ spacing: HADRON_BUILDER.PALETTE_H_SPACING, children: antiTiles }),
        ],
      }),
    );
    this.tiles = [...quarkTiles, ...antiTiles];
  }
}
