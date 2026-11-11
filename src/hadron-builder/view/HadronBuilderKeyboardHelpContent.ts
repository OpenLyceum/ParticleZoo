/**
 * HadronBuilderKeyboardHelpContent.ts
 *
 * Every quark tile and bag constituent is a button, so basic actions cover
 * the screen; the spin choice is a radio group.
 */
import { BasicActionsKeyboardHelpSection, TwoColumnKeyboardHelpContent } from "scenerystack/scenery-phet";

export class HadronBuilderKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super([new BasicActionsKeyboardHelpSection()], []);
  }
}
