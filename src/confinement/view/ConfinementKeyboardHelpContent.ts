/**
 * ConfinementKeyboardHelpContent.ts
 *
 * Basic actions, the separation slider, and direct antiquark movement.
 */
import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpIconFactory,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

export class ConfinementKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const strings = StringManager.getInstance().getConfinementStrings();
    super(
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
      [
        new SliderControlsKeyboardHelpSection(),
        new KeyboardHelpSection(strings.antiquarkDragTitleStringProperty, [
          KeyboardHelpSectionRow.labelWithIconList(
            strings.antiquarkDragHelpStringProperty,
            [
              KeyboardHelpIconFactory.leftRightOrADKeysRowIcon(),
              KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.leftRightOrADKeysRowIcon()),
            ],
            { labelInnerContent: strings.antiquarkDragHelpStringProperty, labelOptions: { lineWrap: 220 } },
          ),
        ]),
      ],
    );
  }
}
