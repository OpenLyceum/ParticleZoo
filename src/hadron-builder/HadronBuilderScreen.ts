/**
 * HadronBuilderScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createHadronBuilderIcon() in src/common/ParticleZooScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createHadronBuilderIcon } from "../common/ParticleZooScreenIcons.js";
import ParticleZooColors from "../ParticleZooColors.js";
import { HadronBuilderModel } from "./model/HadronBuilderModel.js";
import { HadronBuilderKeyboardHelpContent } from "./view/HadronBuilderKeyboardHelpContent.js";
import { HadronBuilderScreenView } from "./view/HadronBuilderScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type HadronBuilderScreenOptions = ScreenOptions & { tandem: Tandem };

export class HadronBuilderScreen extends Screen<HadronBuilderModel, HadronBuilderScreenView> {
  public constructor(options: HadronBuilderScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new HadronBuilderModel(),
      // View factory — receives the model instance
      (model) =>
        new HadronBuilderScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<HadronBuilderScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ParticleZooColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new HadronBuilderKeyboardHelpContent(),
          homeScreenIcon: createHadronBuilderIcon(),
          navigationBarIcon: createHadronBuilderIcon(),
        },
        options,
      ),
    );
  }
}
