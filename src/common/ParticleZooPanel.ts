/**
 * ParticleZooPanel.ts
 *
 * A pre-themed Panel that automatically uses ParticleZooColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { ParticleZooPanel } from "../../common/ParticleZooPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new ParticleZooPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new ParticleZooPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new ParticleZooPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import ParticleZooColors from "../ParticleZooColors.js";
import { PANEL_CORNER_RADIUS } from "../ParticleZooConstants.js";

export type ParticleZooPanelOptions = PanelOptions;

export class ParticleZooPanel extends Panel {
  public constructor(content: Node, providedOptions?: ParticleZooPanelOptions) {
    const options = optionize<ParticleZooPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: ParticleZooColors.panelBackgroundColorProperty,
        stroke: ParticleZooColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
