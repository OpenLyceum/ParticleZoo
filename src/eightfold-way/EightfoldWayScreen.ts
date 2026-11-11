/**
 * EightfoldWayScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createEightfoldWayIcon() in src/common/ParticleZooScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createEightfoldWayIcon } from "../common/ParticleZooScreenIcons.js";
import ParticleZooColors from "../ParticleZooColors.js";
import { EightfoldWayModel } from "./model/EightfoldWayModel.js";
import { EightfoldWayKeyboardHelpContent } from "./view/EightfoldWayKeyboardHelpContent.js";
import { EightfoldWayScreenView } from "./view/EightfoldWayScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type EightfoldWayScreenOptions = ScreenOptions & { tandem: Tandem };

export class EightfoldWayScreen extends Screen<EightfoldWayModel, EightfoldWayScreenView> {
  public constructor(options: EightfoldWayScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new EightfoldWayModel(),
      // View factory — receives the model instance
      (model) =>
        new EightfoldWayScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<EightfoldWayScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: ParticleZooColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new EightfoldWayKeyboardHelpContent(),
          homeScreenIcon: createEightfoldWayIcon(),
          navigationBarIcon: createEightfoldWayIcon(),
        },
        options,
      ),
    );
  }
}
