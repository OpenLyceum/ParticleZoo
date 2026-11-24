/**
 * ReactionCourtScreenView.ts
 *
 * Left: case menu, side switch, the reaction, and the palette (or the quark
 * diagram). Right: the ledger and the verdict.
 */

import { Property, type TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Node, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { AquaRadioButtonGroup, ComboBox, RectangularPushButton } from "scenerystack/sun";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
  PARTICLE_ZOO_COMBO_BOX_OPTIONS,
} from "../../common/ParticleZooButtonOptions.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { CONTROLS, FONTS, REACTION_COURT, SCREEN_VIEW_MARGIN } from "../../ParticleZooConstants.js";
import { PRESETS, type ReactionCourtModel } from "../model/ReactionCourtModel.js";
import { LedgerPanel } from "./LedgerPanel.js";
import { ParticlePaletteNode } from "./ParticlePaletteNode.js";
import { ReactionCourtScreenSummaryContent } from "./ReactionCourtScreenSummaryContent.js";
import { ReactionEquationNode } from "./ReactionEquationNode.js";
import { VerdictPanel } from "./VerdictPanel.js";
import { VertexDiagramNode } from "./VertexDiagramNode.js";

export type ReactionCourtScreenViewOptions = ScreenViewOptions;

export class ReactionCourtScreenView extends ScreenView {
  public constructor(model: ReactionCourtModel, providedOptions?: ReactionCourtScreenViewOptions) {
    const options = optionize<ReactionCourtScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new ReactionCourtScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);
    const strings = StringManager.getInstance().getReactionCourtStrings();
    const a11y = StringManager.getInstance().getReactionCourtA11yStrings();
    const presetNames: Readonly<Record<string, TReadOnlyProperty<string>>> = strings.presetNames;
    const label = (s: typeof strings.beforeStringProperty) =>
      new Text(s, {
        font: FONTS.CONTROL,
        fill: ParticleZooColors.textColorProperty,
        maxWidth: REACTION_COURT.LABEL_MAX_WIDTH,
      });
    const left = this.layoutBounds.minX + SCREEN_VIEW_MARGIN;

    // ── top row: presets, side, clear ──
    const presetChoiceProperty = new Property<string>("none");
    const listParent = new Node();
    const presetBox = new ComboBox(
      presetChoiceProperty,
      [
        {
          value: "none",
          createNode: () =>
            new Text(strings.choosePresetStringProperty, { font: FONTS.CONTROL, fill: LIGHT_SURFACE_TEXT_FILL }),
        },
        ...PRESETS.map((preset) => ({
          value: preset.id,
          createNode: () =>
            new Text(presetNames[`${preset.id}StringProperty`] ?? preset.id, {
              font: FONTS.CONTROL,
              fill: LIGHT_SURFACE_TEXT_FILL,
              maxWidth: REACTION_COURT.PRESET_MAX_WIDTH,
            }),
        })),
      ],
      listParent,
      { ...PARTICLE_ZOO_COMBO_BOX_OPTIONS, accessibleName: a11y.controls.presetsStringProperty },
    );
    // The menu and the reaction update each other; this flag breaks the loop.
    let syncingMenu = false;
    presetChoiceProperty.lazyLink((id) => {
      const preset = PRESETS.find((p) => p.id === id);
      if (preset && !syncingMenu) {
        syncingMenu = true;
        model.loadPreset(preset);
        syncingMenu = false;
      }
    });
    // Editing the reaction by hand returns the menu to its prompt.
    const syncPreset = () => {
      if (syncingMenu) {
        return;
      }
      const key = (ids: readonly string[]) => ids.join(",");
      const before = key(model.beforeProperty.value.map((p) => p.id));
      const after = key(model.afterProperty.value.map((p) => p.id));
      const current = PRESETS.find(
        (p) => key(p.before.map(normalize)) === before && key(p.after.map(normalize)) === after,
      );
      syncingMenu = true;
      presetChoiceProperty.value = current?.id ?? "none";
      syncingMenu = false;
    };
    model.beforeProperty.lazyLink(syncPreset);
    model.afterProperty.lazyLink(syncPreset);

    const sideGroup = new AquaRadioButtonGroup(
      model.sideProperty,
      [
        {
          value: "before",
          createNode: () => label(strings.beforeStringProperty),
          options: { accessibleName: strings.beforeStringProperty },
        },
        {
          value: "after",
          createNode: () => label(strings.afterStringProperty),
          options: { accessibleName: strings.afterStringProperty },
        },
      ] as const,
      {
        orientation: "horizontal",
        spacing: REACTION_COURT.SIDE_RADIO_SPACING,
        radioButtonOptions: { radius: CONTROLS.RADIO_RADIUS },
        accessibleName: a11y.controls.sideStringProperty,
      },
    );
    const clearButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: new Text(strings.clearStringProperty, { font: FONTS.CONTROL, fill: LIGHT_SURFACE_TEXT_FILL }),
      listener: () => model.clear(),
      accessibleName: a11y.controls.clearStringProperty,
    });
    const topRow = new HBox({
      spacing: REACTION_COURT.TOP_ROW_SPACING,
      children: [
        presetBox,
        new HBox({
          spacing: REACTION_COURT.ADD_TO_SPACING,
          children: [label(strings.addToStringProperty), sideGroup],
        }),
        clearButton,
      ],
      left,
      top: this.layoutBounds.minY + SCREEN_VIEW_MARGIN,
    });

    // ── reaction ──
    const equation = new ReactionEquationNode(model);
    equation.boundsProperty.link(() => {
      equation.left = left + REACTION_COURT.EQUATION_LEFT_INSET;
      equation.top = topRow.bottom + REACTION_COURT.EQUATION_TOP_GAP;
    });

    // ── palette / diagram ──
    const palette = new ParticlePaletteNode(model);
    palette.left = left;
    palette.top = topRow.bottom + REACTION_COURT.PALETTE_TOP_GAP;
    const diagramWidth = this.layoutBounds.width - REACTION_COURT.RIGHT_WIDTH - 3 * SCREEN_VIEW_MARGIN;
    const diagram = new VertexDiagramNode(
      model,
      diagramWidth,
      this.layoutBounds.maxY - palette.top - SCREEN_VIEW_MARGIN,
    );
    diagram.left = left;
    diagram.top = palette.top;

    const diagramButtonLabel = new Text("", {
      font: FONTS.CONTROL,
      fill: LIGHT_SURFACE_TEXT_FILL,
      maxWidth: REACTION_COURT.DIAGRAM_BUTTON_MAX_WIDTH,
    });
    const diagramButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: diagramButtonLabel,
      listener: () => model.showDiagramProperty.toggle(),
      accessibleName: a11y.controls.diagramStringProperty,
    });
    model.showDiagramProperty.link((show) => {
      palette.visible = !show;
      diagram.visible = show;
      diagramButtonLabel.string = show
        ? strings.hideDiagramStringProperty.value
        : strings.showDiagramStringProperty.value;
    });
    model.diagramProperty.link((template) => {
      diagramButton.visible = template !== null;
    });

    // ── right column ──
    const ledger = new LedgerPanel(model, REACTION_COURT.RIGHT_WIDTH);
    const verdict = new VerdictPanel(model, REACTION_COURT.RIGHT_WIDTH);
    const rightColumn = new VBox({
      spacing: REACTION_COURT.RIGHT_COLUMN_SPACING,
      align: "left",
      children: [ledger, verdict, diagramButton],
    });
    rightColumn.boundsProperty.link(() => {
      rightColumn.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
      rightColumn.top = this.layoutBounds.minY + SCREEN_VIEW_MARGIN;
    });

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        presetChoiceProperty.value = "none";
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });

    this.children = [topRow, equation, palette, diagram, rightColumn, resetAllButton, listParent];
    this.addChild(
      new Node({
        pdomOrder: [
          presetBox,
          sideGroup,
          clearButton,
          equation,
          ...palette.buttons,
          diagram.blanks,
          diagramButton,
          resetAllButton,
        ],
      }),
    );
  }
}

/** Preset ids use readable aliases; the model stores catalog ids. */
function normalize(id: string): string {
  const aliases: Record<string, string> = { "pi-": "anti-pi+", "K-": "anti-K+", "e+": "anti-e-", "mu+": "anti-mu-" };
  return aliases[id] ?? id;
}
