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
import type { HadronBuilderModel } from "../model/HadronBuilderModel.js";

const TILE_RADIUS = 22;
const CLICK_SLOP = 6; // px a press may wander and still count as a click

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
        radius: TILE_RADIUS,
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
            ghost = new QuarkNode(q, { radius: TILE_RADIUS, pickable: false, opacity: 0.85 });
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
            if (point && (moved < CLICK_SLOP || dropTarget(point))) {
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
      new Text(text, { font: "bold 13px sans-serif", fill: ParticleZooColors.textColorProperty, maxWidth: 260 });

    super(
      new VBox({
        spacing: 6,
        align: "left",
        children: [
          label(strings.quarksStringProperty),
          new HBox({ spacing: 8, children: quarkTiles }),
          label(strings.antiquarksStringProperty),
          new HBox({ spacing: 8, children: antiTiles }),
        ],
      }),
    );
    this.tiles = [...quarkTiles, ...antiTiles];
  }
}
