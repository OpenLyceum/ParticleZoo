/**
 * HadronBuilderScreenView.ts
 *
 * Palette (top left) → bag (centre left) → readouts and result (right).
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { RectangularPushButton } from "scenerystack/sun";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../../common/ParticleZooButtonOptions.js";
import { StringManager } from "../../i18n/StringManager.js";
import { SCREEN_VIEW_MARGIN } from "../../ParticleZooConstants.js";
import type { HadronBuilderModel } from "../model/HadronBuilderModel.js";
import { BagNode } from "./BagNode.js";
import { HadronBuilderScreenSummaryContent } from "./HadronBuilderScreenSummaryContent.js";
import { HadronReadoutPanel } from "./HadronReadoutPanel.js";
import { HadronResultPanel } from "./HadronResultPanel.js";
import { QuarkPaletteNode } from "./QuarkPaletteNode.js";

const BAG_RADIUS = 150;
const RIGHT_WIDTH = 330;

export type HadronBuilderScreenViewOptions = ScreenViewOptions;

export class HadronBuilderScreenView extends ScreenView {
  public constructor(model: HadronBuilderModel, providedOptions?: HadronBuilderScreenViewOptions) {
    const options = optionize<HadronBuilderScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new HadronBuilderScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);
    const strings = StringManager.getInstance().getHadronBuilderStrings();
    const a11y = StringManager.getInstance().getHadronBuilderA11yStrings();

    const bag = new BagNode(model, BAG_RADIUS);
    const dragLayer = new Node();

    const palette = new QuarkPaletteNode(model, dragLayer, (globalPoint) => {
      const local = bag.globalToLocalPoint(globalPoint);
      return local.magnitude <= BAG_RADIUS;
    });
    palette.left = this.layoutBounds.minX + SCREEN_VIEW_MARGIN;
    palette.top = this.layoutBounds.minY + SCREEN_VIEW_MARGIN;

    // Centre the bag in the space left of the readouts.
    bag.centerX =
      (this.layoutBounds.minX + SCREEN_VIEW_MARGIN + this.layoutBounds.maxX - SCREEN_VIEW_MARGIN - RIGHT_WIDTH) / 2;
    bag.top = palette.bottom + 20;

    const clearButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: new Text(strings.clearStringProperty, { font: "14px sans-serif", fill: LIGHT_SURFACE_TEXT_FILL }),
      listener: () => model.clear(),
      accessibleName: a11y.controls.clearStringProperty,
    });
    clearButton.centerX = bag.centerX;
    clearButton.top = bag.bottom + 10;

    const readouts = new HadronReadoutPanel(model, RIGHT_WIDTH);
    const result = new HadronResultPanel(model, RIGHT_WIDTH);
    const rightColumn = new VBox({ spacing: 12, align: "left", children: [readouts, result] });
    rightColumn.boundsProperty.link(() => {
      rightColumn.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
      rightColumn.top = this.layoutBounds.minY + SCREEN_VIEW_MARGIN;
    });

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [palette, bag, clearButton, rightColumn, resetAllButton, dragLayer];
    this.addChild(
      new Node({
        pdomOrder: [...palette.tiles, bag.constituentLayer, clearButton, readouts.spinGroup, resetAllButton],
      }),
    );
  }

  public reset(): void {
    // No view-only state.
  }
}
