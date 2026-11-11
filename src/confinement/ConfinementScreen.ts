/**
 * ConfinementScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createConfinementIcon() in src/common/ParticleZooScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createConfinementIcon } from "../common/ParticleZooScreenIcons.js";
import ParticleZooColors from "../ParticleZooColors.js";
import { ConfinementModel } from "./model/ConfinementModel.js";
import { ConfinementKeyboardHelpContent } from "./view/ConfinementKeyboardHelpContent.js";
import { ConfinementScreenView } from "./view/ConfinementScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ConfinementScreenOptions = ScreenOptions & { tandem: Tandem };

export class ConfinementScreen extends Screen<ConfinementModel, ConfinementScreenView> {
  public constructor(options: ConfinementScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ConfinementModel(),
      // View factory — receives the model instance
      (model) =>
        new ConfinementScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ConfinementScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ParticleZooColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ConfinementKeyboardHelpContent(),
          homeScreenIcon: createConfinementIcon(),
          navigationBarIcon: createConfinementIcon(),
        },
        options,
      ),
    );
  }
}
