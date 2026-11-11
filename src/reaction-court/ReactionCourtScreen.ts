/**
 * ReactionCourtScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createReactionCourtIcon() in src/common/ParticleZooScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createReactionCourtIcon } from "../common/ParticleZooScreenIcons.js";
import ParticleZooColors from "../ParticleZooColors.js";
import { ReactionCourtModel } from "./model/ReactionCourtModel.js";
import { ReactionCourtKeyboardHelpContent } from "./view/ReactionCourtKeyboardHelpContent.js";
import { ReactionCourtScreenView } from "./view/ReactionCourtScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type ReactionCourtScreenOptions = ScreenOptions & { tandem: Tandem };

export class ReactionCourtScreen extends Screen<ReactionCourtModel, ReactionCourtScreenView> {
  public constructor(options: ReactionCourtScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new ReactionCourtModel(),
      // View factory — receives the model instance
      (model) =>
        new ReactionCourtScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<ReactionCourtScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ParticleZooColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new ReactionCourtKeyboardHelpContent(),
          homeScreenIcon: createReactionCourtIcon(),
          navigationBarIcon: createReactionCourtIcon(),
        },
        options,
      ),
    );
  }
}
