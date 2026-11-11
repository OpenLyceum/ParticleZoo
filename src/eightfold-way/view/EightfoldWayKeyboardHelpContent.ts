/**
 * EightfoldWayKeyboardHelpContent.ts
 *
 * Buttons and radio groups (basic actions), the mass slider and charge spinner.
 */
import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  SpinnerControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class EightfoldWayKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection()],
      [new SliderControlsKeyboardHelpSection(), new SpinnerControlsKeyboardHelpSection()],
    );
  }
}
