import { roundSymmetric } from "scenerystack/dot";
import { PREDICTION_PANEL_SETTINGS } from "../../ParticleZooConstants.js";
/**
 * PredictionPanel.ts
 *
 * The student's prediction for the empty S = −3 slot: three quark pickers
 * (each cycles u → d → s), a charge spinner, a mass control, and Check /
 * Reveal buttons with per-item feedback.
 */

import { DerivedProperty, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { HBox, Node, Text, VBox } from "scenerystack/scenery";
import { NumberControl } from "scenerystack/scenery-phet";
import { NumberSpinner, RectangularPushButton } from "scenerystack/sun";
import { formatSigned, quark } from "../../common/model/quarks.js";
import { FLAT_PANEL_PUSH_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../../common/ParticleZooButtonOptions.js";
import { PARTICLE_ZOO_NUMBER_CONTROL_OPTIONS } from "../../common/ParticleZooControlOptions.js";
import { ParticleZooPanel } from "../../common/ParticleZooPanel.js";
import { QuarkNode } from "../../common/view/QuarkNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { EIGHTFOLD, FONTS } from "../../ParticleZooConstants.js";
import { type EightfoldWayModel, MASS_RANGE, PREDICTION_FLAVORS } from "../model/EightfoldWayModel.js";

export class PredictionPanel extends ParticleZooPanel {
  public readonly focusables: (RectangularPushButton | NumberSpinner | NumberControl)[];

  public constructor(model: EightfoldWayModel, width: number) {
    const strings = StringManager.getInstance().getEightfoldWayStrings();
    const a11y = StringManager.getInstance().getEightfoldWayA11yStrings();
    const text = (s: TReadOnlyProperty<string>, bold = false) =>
      new Text(s, {
        font: bold ? FONTS.CONTROL_BOLD : FONTS.CONTROL,
        fill: ParticleZooColors.textColorProperty,
        maxWidth: width - PREDICTION_PANEL_SETTINGS.TEXT_MAX_WIDTH_OFFSET,
      });

    // ── quark pickers ──
    const pickers = ([0, 1, 2] as const).map((slot) => {
      const flavorProperty = new DerivedProperty([model.predictedQuarksProperty], (q) => q[slot]);
      // Filled before the button is built: an empty content node has no size.
      const holder = new Node({
        children: [new QuarkNode(quark(flavorProperty.value), { radius: EIGHTFOLD.PICKER_RADIUS })],
      });
      const button = new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        xMargin: EIGHTFOLD.PICKER_MARGIN,
        yMargin: EIGHTFOLD.PICKER_MARGIN,
        content: holder,
        listener: () => {
          const index = PREDICTION_FLAVORS.indexOf(model.predictedQuarksProperty.value[slot]);
          model.setPredictedQuark(slot, PREDICTION_FLAVORS[(index + 1) % PREDICTION_FLAVORS.length] ?? "u");
        },
        accessibleName: new PatternStringProperty(strings.cycleQuarkPatternStringProperty, {
          slot: slot + 1,
          flavor: flavorProperty,
        }),
      });
      flavorProperty.link((f) => {
        for (const child of holder.children) {
          child.disposeSubtree();
        }
        holder.children = [new QuarkNode(quark(f), { radius: EIGHTFOLD.PICKER_RADIUS })];
      });
      return button;
    });

    const impliedCharge = new Text(
      new PatternStringProperty(strings.impliedChargePatternStringProperty, {
        value: new DerivedProperty([model.contentChargeProperty], (q) => formatSigned(q)),
      }),
      {
        font: FONTS.SMALL,
        fill: ParticleZooColors.textColorProperty,
        opacity: PREDICTION_PANEL_SETTINGS.IMPLIED_CHARGE_OPACITY,
        maxWidth: width - PREDICTION_PANEL_SETTINGS.IMPLIED_CHARGE_MAX_WIDTH_OFFSET,
      },
    );

    const chargeSpinner = new NumberSpinner(
      model.predictedChargeProperty,
      model.predictedChargeProperty.rangeProperty,
      {
        numberDisplayOptions: { numberFormatter: (q: number) => formatSigned(q) },
        accessibleName: a11y.controls.chargeStringProperty,
      },
    );

    const massControl = new NumberControl(strings.massStringProperty, model.predictedMassProperty, MASS_RANGE, {
      ...PARTICLE_ZOO_NUMBER_CONTROL_OPTIONS,
      delta: EIGHTFOLD.MASS_DELTA,
      titleNodeOptions: { font: FONTS.CONTROL, fill: ParticleZooColors.textColorProperty },
      numberDisplayOptions: { valuePattern: "{{value}} MeV/c²", decimalPlaces: 0 },
      sliderOptions: {
        ...PARTICLE_ZOO_NUMBER_CONTROL_OPTIONS.sliderOptions,
        keyboardStep: EIGHTFOLD.MASS_DELTA,
        constrainValue: (m: number) => roundSymmetric(m / EIGHTFOLD.MASS_DELTA) * EIGHTFOLD.MASS_DELTA,
      },
      accessibleName: a11y.controls.massStringProperty,
    });

    // ── feedback marks ──
    const mark = (correct: TReadOnlyProperty<boolean>) => {
      const node = new Text("", { font: FONTS.FEEDBACK });
      const update = () => {
        node.visible = model.checkedProperty.value;
        node.string = correct.value ? strings.correctStringProperty.value : strings.wrongStringProperty.value;
        node.fill = correct.value ? ParticleZooColors.goodProperty : ParticleZooColors.badProperty;
      };
      correct.link(update);
      model.checkedProperty.link(update);
      return node;
    };

    const checkButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: new Text(strings.checkStringProperty, { font: FONTS.CONTROL, fill: LIGHT_SURFACE_TEXT_FILL }),
      listener: () => model.check(),
      accessibleName: a11y.controls.checkStringProperty,
    });
    const revealButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: new Text(strings.revealStringProperty, { font: FONTS.CONTROL, fill: LIGHT_SURFACE_TEXT_FILL }),
      listener: () => model.reveal(),
      accessibleName: a11y.controls.revealStringProperty,
    });

    super(
      new VBox({
        spacing: EIGHTFOLD.PREDICTION_SPACING,
        align: "left",
        children: [
          text(strings.predictTitleStringProperty, true),
          text(strings.quarkContentStringProperty),
          new HBox({
            spacing: EIGHTFOLD.PREDICTION_SPACING,
            children: [...pickers, mark(model.contentCorrectProperty)],
          }),
          impliedCharge,
          new HBox({
            spacing: EIGHTFOLD.CHARGE_ROW_SPACING,
            children: [text(strings.chargeStringProperty), chargeSpinner, mark(model.chargeCorrectProperty)],
          }),
          new HBox({
            spacing: EIGHTFOLD.PREDICTION_SPACING,
            align: "center",
            children: [massControl, mark(model.massCorrectProperty)],
          }),
          new HBox({ spacing: EIGHTFOLD.BUTTON_ROW_SPACING, children: [checkButton, revealButton] }),
        ],
      }),
      { minWidth: width, maxWidth: width },
    );
    this.focusables = [...pickers, chargeSpinner, massControl, checkButton, revealButton];
  }
}
