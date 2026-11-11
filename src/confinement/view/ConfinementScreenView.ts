/**
 * ConfinementScreenView.ts
 *
 * Flux-tube stage across the top, separation slider beneath it, V(r) plot
 * bottom left, field-energy bar on the right, and the break report.
 */

import { DerivedProperty, NumberProperty, PatternStringProperty } from "scenerystack/axon";
import { Dimension2 } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Node, RichText, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { AquaRadioButtonGroup, Checkbox, HSlider, RectangularPushButton } from "scenerystack/sun";
import { quarkSymbol } from "../../common/model/quarks.js";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../../common/ParticleZooButtonOptions.js";
import { PARTICLE_ZOO_CHECKBOX_OPTIONS, PARTICLE_ZOO_SLIDER_OPTIONS } from "../../common/ParticleZooControlOptions.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { SCREEN_VIEW_MARGIN } from "../../ParticleZooConstants.js";
import { type ConfinementModel, SEPARATION_RANGE } from "../model/ConfinementModel.js";
import { ConfinementScreenSummaryContent } from "./ConfinementScreenSummaryContent.js";
import { EnergyBarNode } from "./EnergyBarNode.js";
import { FluxTubeNode } from "./FluxTubeNode.js";
import { PotentialPlotNode } from "./PotentialPlotNode.js";

const FONT = "14px sans-serif";

export type ConfinementScreenViewOptions = ScreenViewOptions;

export class ConfinementScreenView extends ScreenView {
  public constructor(model: ConfinementModel, providedOptions?: ConfinementScreenViewOptions) {
    const options = optionize<ConfinementScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new ConfinementScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);
    const strings = StringManager.getInstance().getConfinementStrings();
    const a11y = StringManager.getInstance().getConfinementA11yStrings();
    const text = (s: typeof strings.coulombStringProperty, bold = false) =>
      new Text(s, { font: bold ? `bold ${FONT}` : FONT, fill: ParticleZooColors.textColorProperty, maxWidth: 300 });

    // ── controls ──
    const presetGroup = new AquaRadioButtonGroup(
      model.presetProperty,
      [
        {
          value: "piPlus",
          createNode: () => new Text("π⁺ = u d̄", { font: FONT, fill: ParticleZooColors.textColorProperty }),
          options: { accessibleName: "pi plus" },
        },
        {
          value: "kPlus",
          createNode: () => new Text("K⁺ = u s̄", { font: FONT, fill: ParticleZooColors.textColorProperty }),
          options: { accessibleName: "K plus" },
        },
        {
          value: "jpsi",
          createNode: () => new Text("J/ψ = c c̄", { font: FONT, fill: ParticleZooColors.textColorProperty }),
          options: { accessibleName: "J psi" },
        },
      ] as const,
      {
        orientation: "horizontal",
        spacing: 18,
        radioButtonOptions: { radius: 7 },
        accessibleName: a11y.controls.presetStringProperty,
      },
    );
    const coulombCheckbox = new Checkbox(model.coulombProperty, text(strings.coulombStringProperty), {
      ...PARTICLE_ZOO_CHECKBOX_OPTIONS,
    });
    const controls = new VBox({
      spacing: 8,
      align: "left",
      children: [text(strings.presetTitleStringProperty, true), presetGroup, coulombCheckbox],
      left: this.layoutBounds.minX + SCREEN_VIEW_MARGIN,
      top: this.layoutBounds.minY + SCREEN_VIEW_MARGIN,
    });

    // ── stage ──
    const stage = new FluxTubeNode(model);
    stage.x = this.layoutBounds.minX + 250;
    stage.y = this.layoutBounds.minY + 200;
    const hint = new Text(strings.dragHintStringProperty, {
      font: "italic 13px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      opacity: 0.75,
      left: stage.x - 40,
      top: stage.y + 40,
    });

    // ── separation slider (keyboard access to the drag) ──
    const sliderProperty = new NumberProperty(model.separationProperty.value, { range: SEPARATION_RANGE });
    let syncing = false;
    sliderProperty.lazyLink((r) => {
      if (!syncing) {
        model.pull(r);
      }
    });
    model.separationProperty.link((r) => {
      syncing = true;
      sliderProperty.value = r;
      syncing = false;
    });
    const slider = new HSlider(sliderProperty, SEPARATION_RANGE, {
      ...PARTICLE_ZOO_SLIDER_OPTIONS,
      trackSize: new Dimension2(260, PARTICLE_ZOO_SLIDER_OPTIONS.trackSize.height),
      keyboardStep: 0.05,
      enabledProperty: new DerivedProperty([model.phaseProperty], (phase) => phase === "bound"),
      accessibleName: a11y.controls.separationStringProperty,
    });
    const readout = new Text("", { font: `bold ${FONT}`, fill: ParticleZooColors.textColorProperty });
    const separationText = new PatternStringProperty(strings.separationPatternStringProperty, {
      value: new DerivedProperty([model.separationProperty], (r) => r.toFixed(2)),
    });
    const energyText = new PatternStringProperty(strings.energyPatternStringProperty, {
      value: new DerivedProperty([model.energyProperty], (v) => `${Math.round(v)}`),
    });
    const updateReadout = () => {
      readout.string = `${separationText.value}    ${energyText.value}`;
    };
    separationText.link(updateReadout);
    energyText.link(updateReadout);
    const sliderRow = new HBox({
      spacing: 14,
      children: [text(strings.separationStringProperty), slider, readout],
      left: this.layoutBounds.minX + SCREEN_VIEW_MARGIN,
      top: stage.y + 70,
    });

    // ── plot, bar, report ──
    const plot = new PotentialPlotNode(model, 420, 220);
    plot.left = this.layoutBounds.minX + SCREEN_VIEW_MARGIN;
    plot.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;

    const bar = new EnergyBarNode(model, 240);
    bar.left = this.layoutBounds.maxX - 280;
    bar.top = this.layoutBounds.minY + 60;

    const report = new RichText("", {
      font: FONT,
      fill: ParticleZooColors.textColorProperty,
      lineWrap: 380,
    });
    const rejoinButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: new Text(strings.rejoinStringProperty, { font: FONT, fill: LIGHT_SURFACE_TEXT_FILL }),
      listener: () => model.rejoin(),
      accessibleName: a11y.controls.rejoinStringProperty,
    });
    const reportBox = new VBox({ spacing: 10, align: "left", children: [report, rejoinButton] });
    const updateReport = () => {
      const fragments = model.fragmentsProperty.value;
      reportBox.visible = model.phaseProperty.value === "broken" && fragments !== null;
      hint.visible = !reportBox.visible;
      if (fragments) {
        const fragmentLabel = (f: (typeof fragments)[0]) =>
          `${f.meson?.symbol ?? strings.unknownMesonStringProperty.value} (${f.quarks.map(quarkSymbol).join(" ")})`;
        const popped = fragments[1].quarks[0];
        report.string = strings.brokenPatternStringProperty.value
          .replace("{{r}}", model.separationProperty.value.toFixed(2))
          .replace("{{pair}}", `${popped.flavor} ${popped.flavor}̄`)
          .replace("{{left}}", fragmentLabel(fragments[0]))
          .replace("{{right}}", fragmentLabel(fragments[1]));
      }
      reportBox.left = plot.right + 30;
      reportBox.top = plot.top + 10;
    };
    model.fragmentsProperty.link(updateReport);
    model.phaseProperty.link(updateReport);
    strings.brokenPatternStringProperty.lazyLink(updateReport);

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => model.reset(),
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [controls, stage, hint, sliderRow, plot, bar, reportBox, resetAllButton];
    this.addChild(new Node({ pdomOrder: [presetGroup, coulombCheckbox, slider, rejoinButton, resetAllButton] }));
  }
}
