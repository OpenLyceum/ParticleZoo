/**
 * ParticlePaletteNode.ts
 *
 * Grid of particle buttons. Each adds its particle to the active side of the
 * reaction (before or after the arrow).
 */

import { PatternStringProperty } from "scenerystack/axon";
import { GridBox, RichText } from "scenerystack/scenery";
import { RectangularPushButton } from "scenerystack/sun";
import { particleById } from "../../common/model/particleCatalog.js";
import { FLAT_PANEL_PUSH_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../../common/ParticleZooButtonOptions.js";
import { ParticleZooPanel } from "../../common/ParticleZooPanel.js";
import { richSymbol } from "../../common/view/richSymbol.js";
import { StringManager } from "../../i18n/StringManager.js";
import { PALETTE_IDS, type ReactionCourtModel } from "../model/ReactionCourtModel.js";

const COLUMNS = 9;
const CELL = 46;

export class ParticlePaletteNode extends ParticleZooPanel {
  public readonly buttons: RectangularPushButton[];

  public constructor(model: ReactionCourtModel) {
    const a11y = StringManager.getInstance().getReactionCourtA11yStrings();
    const buttons = PALETTE_IDS.map((id) => {
      const particle = particleById(id);
      return new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        minWidth: CELL,
        minHeight: CELL - 8,
        xMargin: 2,
        content: new RichText(richSymbol(particle.symbol), {
          font: "17px serif",
          fill: LIGHT_SURFACE_TEXT_FILL,
          maxWidth: CELL - 6,
        }),
        listener: () => model.add(id),
        accessibleName: new PatternStringProperty(a11y.controls.addPatternStringProperty, {
          particle: particle.symbol,
        }),
      });
    });
    const rows: RectangularPushButton[][] = [];
    for (let i = 0; i < buttons.length; i += COLUMNS) {
      rows.push(buttons.slice(i, i + COLUMNS));
    }
    super(new GridBox({ rows, xSpacing: 5, ySpacing: 5 }));
    this.buttons = buttons;
  }
}
