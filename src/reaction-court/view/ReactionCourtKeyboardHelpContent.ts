/**
 * ReactionCourtKeyboardHelpContent.ts
 *
 * Buttons and radio groups (basic actions) and the case menu (combo box).
 */
import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class ReactionCourtKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new BasicActionsKeyboardHelpSection()], [new ComboBoxKeyboardHelpSection()]);
  }
}
