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
import { FONTS, REACTION_COURT } from "../../ParticleZooConstants.js";
import { PALETTE_IDS, type ReactionCourtModel } from "../model/ReactionCourtModel.js";

export class ParticlePaletteNode extends ParticleZooPanel {
  public readonly buttons: RectangularPushButton[];

  public constructor(model: ReactionCourtModel) {
    const a11y = StringManager.getInstance().getReactionCourtA11yStrings();
    const cell = REACTION_COURT.PALETTE_CELL;
    const buttons = PALETTE_IDS.map((id) => {
      const particle = particleById(id);
      return new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        minWidth: cell,
        minHeight: cell - REACTION_COURT.PALETTE_CELL_HEIGHT_INSET,
        xMargin: REACTION_COURT.PALETTE_BUTTON_X_MARGIN,
        content: new RichText(richSymbol(particle.symbol), {
          font: FONTS.PALETTE_SYMBOL,
          fill: LIGHT_SURFACE_TEXT_FILL,
          maxWidth: cell - REACTION_COURT.PALETTE_SYMBOL_INSET,
        }),
        listener: () => model.add(id),
        accessibleName: new PatternStringProperty(a11y.controls.addPatternStringProperty, {
          particle: particle.symbol,
        }),
      });
    });
    const rows: RectangularPushButton[][] = [];
    for (let i = 0; i < buttons.length; i += REACTION_COURT.PALETTE_COLUMNS) {
      rows.push(buttons.slice(i, i + REACTION_COURT.PALETTE_COLUMNS));
    }
    super(
      new GridBox({
        rows,
        xSpacing: REACTION_COURT.PALETTE_GRID_SPACING,
        ySpacing: REACTION_COURT.PALETTE_GRID_SPACING,
      }),
    );
    this.buttons = buttons;
  }
}
