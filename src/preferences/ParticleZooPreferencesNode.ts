/**
 * ParticleZooPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to ParticleZooPreferencesModel Properties (whose initial values come from
 * particleZooQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import ParticleZooColors from "../ParticleZooColors.js";
import { FONTS, PREFERENCES_LAYOUT } from "../ParticleZooConstants.js";
import ParticleZooNamespace from "../ParticleZooNamespace.js";
import type { ParticleZooPreferencesModel } from "./ParticleZooPreferencesModel.js";

export class ParticleZooPreferencesNode extends VBox {
  public constructor(preferencesModel: ParticleZooPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: FONTS.PREFERENCES_TITLE,
      fill: ParticleZooColors.controlSurfaceTextColorProperty,
    });

    const animateColorChargeCheckbox = new Checkbox(
      preferencesModel.animateColorChargeProperty,
      new Text(prefStrings.animateColorChargeStringProperty, {
        font: FONTS.PREFERENCES_LABEL,
        fill: ParticleZooColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: ParticleZooColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: ParticleZooColors.controlSurfaceColorProperty,
        spacing: PREFERENCES_LAYOUT.CONTROL_SPACING,
        ...(tandem && { tandem: tandem.createTandem("animateColorChargeCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: PREFERENCES_LAYOUT.SECTION_SPACING,
      children: [header, animateColorChargeCheckbox],
    });
  }
}

ParticleZooNamespace.register("ParticleZooPreferencesNode", ParticleZooPreferencesNode);
