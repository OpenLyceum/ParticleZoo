import { EIGHTFOLD_WAY_SCREEN_VIEW_SETTINGS } from "../../ParticleZooConstants.js";
/**
 * EightfoldWayScreenView.ts
 *
 * Multiplet diagram (left), mass ladder and prediction panel (right). The
 * octet view hides the prediction tools: every octet member was known.
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, RichText, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { AquaRadioButtonGroup } from "scenerystack/sun";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/ParticleZooButtonOptions.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { CONTROLS, EIGHTFOLD, FONTS, SCREEN_VIEW_MARGIN } from "../../ParticleZooConstants.js";
import type { EightfoldWayModel } from "../model/EightfoldWayModel.js";
import { EightfoldWayScreenSummaryContent } from "./EightfoldWayScreenSummaryContent.js";
import { MassLadderNode } from "./MassLadderNode.js";
import { MultipletDiagramNode } from "./MultipletDiagramNode.js";
import { PredictionPanel } from "./PredictionPanel.js";

export type EightfoldWayScreenViewOptions = ScreenViewOptions;

export class EightfoldWayScreenView extends ScreenView {
  public constructor(model: EightfoldWayModel, providedOptions?: EightfoldWayScreenViewOptions) {
    const options = optionize<EightfoldWayScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new EightfoldWayScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);
    const strings = StringManager.getInstance().getEightfoldWayStrings();
    const a11y = StringManager.getInstance().getEightfoldWayA11yStrings();
    const label = (s: typeof strings.decupletStringProperty) =>
      new Text(s, {
        font: FONTS.CONTROL,
        fill: ParticleZooColors.textColorProperty,
        maxWidth: EIGHTFOLD_WAY_SCREEN_VIEW_SETTINGS.LABEL_MAX_WIDTH,
      });

    const multipletGroup = new AquaRadioButtonGroup(
      model.multipletProperty,
      [
        {
          value: "decuplet",
          createNode: () => label(strings.decupletStringProperty),
          options: { accessibleName: strings.decupletStringProperty },
        },
        {
          value: "octet",
          createNode: () => label(strings.octetStringProperty),
          options: { accessibleName: strings.octetStringProperty },
        },
      ] as const,
      {
        orientation: "horizontal",
        spacing: EIGHTFOLD.MULTIPLET_RADIO_SPACING,
        radioButtonOptions: { radius: CONTROLS.RADIO_RADIUS },
        accessibleName: a11y.controls.multipletStringProperty,
      },
    );
    multipletGroup.left = this.layoutBounds.minX + SCREEN_VIEW_MARGIN;
    multipletGroup.top = this.layoutBounds.minY + SCREEN_VIEW_MARGIN;

    const yearNote = new Text(strings.yearNoteStringProperty, {
      font: FONTS.CONTROL_ITALIC,
      fill: ParticleZooColors.textColorProperty,
      opacity: EIGHTFOLD_WAY_SCREEN_VIEW_SETTINGS.YEAR_NOTE_OPACITY,
    });

    const diagram = new MultipletDiagramNode(model);
    const diagramArea = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN * 2 - EIGHTFOLD.RIGHT_WIDTH;
    diagram.boundsProperty.link(() => {
      diagram.centerX = this.layoutBounds.minX + SCREEN_VIEW_MARGIN + diagramArea / 2;
      diagram.top = multipletGroup.bottom + EIGHTFOLD.DIAGRAM_TOP_GAP;
    });
    yearNote.boundsProperty.link(() => {
      yearNote.left = multipletGroup.left;
      yearNote.top = multipletGroup.bottom + EIGHTFOLD.YEAR_NOTE_TOP_GAP;
    });

    const omegaNote = new RichText(strings.omegaRevealedStringProperty, {
      font: FONTS.CONTROL,
      fill: ParticleZooColors.highlightProperty,
      lineWrap: diagramArea - EIGHTFOLD.OMEGA_NOTE_INSET,
    });
    omegaNote.boundsProperty.link(() => {
      omegaNote.left = multipletGroup.left;
      omegaNote.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;
    });

    const ladder = new MassLadderNode(model, EIGHTFOLD.RIGHT_WIDTH, EIGHTFOLD.LADDER_HEIGHT);
    const prediction = new PredictionPanel(model, EIGHTFOLD.RIGHT_WIDTH);
    const rightColumn = new VBox({
      spacing: EIGHTFOLD.RIGHT_COLUMN_SPACING,
      align: "left",
      children: [ladder, prediction],
    });
    rightColumn.boundsProperty.link(() => {
      rightColumn.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
      rightColumn.top = this.layoutBounds.minY + EIGHTFOLD.RIGHT_COLUMN_TOP;
    });

    model.multipletProperty.link((multiplet) => {
      const decuplet = multiplet === "decuplet";
      rightColumn.visible = decuplet;
      yearNote.visible = decuplet;
    });
    model.revealedProperty.link((revealed) => {
      omegaNote.visible = revealed;
    });

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => model.reset(),
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [multipletGroup, yearNote, diagram, omegaNote, rightColumn, resetAllButton];
    this.addChild(new Node({ pdomOrder: [multipletGroup, ...prediction.focusables, resetAllButton] }));
  }
}
