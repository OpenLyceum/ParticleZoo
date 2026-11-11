/**
 * ConfinementKeyboardHelpContent.ts
 *
 * Radio buttons, checkbox and buttons (basic actions); the separation slider.
 */
import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class ConfinementKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
      [new SliderControlsKeyboardHelpSection()],
    );
  }
}
