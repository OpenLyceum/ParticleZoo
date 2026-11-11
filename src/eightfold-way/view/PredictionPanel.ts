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
import { type EightfoldWayModel, MASS_RANGE, PREDICTION_FLAVORS } from "../model/EightfoldWayModel.js";

const FONT = "14px sans-serif";

export class PredictionPanel extends ParticleZooPanel {
  public readonly focusables: (RectangularPushButton | NumberSpinner | NumberControl)[];

  public constructor(model: EightfoldWayModel, width: number) {
    const strings = StringManager.getInstance().getEightfoldWayStrings();
    const a11y = StringManager.getInstance().getEightfoldWayA11yStrings();
    const text = (s: TReadOnlyProperty<string>, bold = false) =>
      new Text(s, {
        font: bold ? `bold ${FONT}` : FONT,
        fill: ParticleZooColors.textColorProperty,
        maxWidth: width - 60,
      });

    // ── quark pickers ──
    const pickers = ([0, 1, 2] as const).map((slot) => {
      const flavor = new DerivedProperty([model.predictedQuarksProperty], (q) => q[slot]);
      const holder = new Node();
      const button = new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        xMargin: 4,
        yMargin: 4,
        content: holder,
        listener: () => {
          const index = PREDICTION_FLAVORS.indexOf(model.predictedQuarksProperty.value[slot]);
          model.setPredictedQuark(slot, PREDICTION_FLAVORS[(index + 1) % PREDICTION_FLAVORS.length] ?? "u");
        },
        accessibleName: new PatternStringProperty(strings.cycleQuarkPatternStringProperty, { slot: slot + 1, flavor }),
      });
      flavor.link((f) => {
        holder.children = [new QuarkNode(quark(f), { radius: 18 })];
      });
      return button;
    });

    const impliedCharge = new Text(
      new PatternStringProperty(strings.impliedChargePatternStringProperty, {
        value: new DerivedProperty([model.contentChargeProperty], (q) => formatSigned(q)),
      }),
      { font: "12px sans-serif", fill: ParticleZooColors.textColorProperty, opacity: 0.8, maxWidth: width - 20 },
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
      delta: 5,
      titleNodeOptions: { font: FONT, fill: ParticleZooColors.textColorProperty },
      numberDisplayOptions: { valuePattern: "{{value}} MeV/c²", decimalPlaces: 0 },
      sliderOptions: {
        ...PARTICLE_ZOO_NUMBER_CONTROL_OPTIONS.sliderOptions,
        keyboardStep: 5,
        constrainValue: (m: number) => Math.round(m / 5) * 5,
      },
      accessibleName: a11y.controls.massStringProperty,
    });

    // ── feedback marks ──
    const mark = (correct: TReadOnlyProperty<boolean>) => {
      const node = new Text("", { font: "bold 18px sans-serif" });
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
      content: new Text(strings.checkStringProperty, { font: FONT, fill: LIGHT_SURFACE_TEXT_FILL }),
      listener: () => model.check(),
      accessibleName: a11y.controls.checkStringProperty,
    });
    const revealButton = new RectangularPushButton({
      ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
      content: new Text(strings.revealStringProperty, { font: FONT, fill: LIGHT_SURFACE_TEXT_FILL }),
      listener: () => model.reveal(),
      accessibleName: a11y.controls.revealStringProperty,
    });

    super(
      new VBox({
        spacing: 8,
        align: "left",
        children: [
          text(strings.predictTitleStringProperty, true),
          text(strings.quarkContentStringProperty),
          new HBox({ spacing: 8, children: [...pickers, mark(model.contentCorrectProperty)] }),
          impliedCharge,
          new HBox({
            spacing: 10,
            children: [text(strings.chargeStringProperty), chargeSpinner, mark(model.chargeCorrectProperty)],
          }),
          new HBox({ spacing: 8, align: "center", children: [massControl, mark(model.massCorrectProperty)] }),
          new HBox({ spacing: 12, children: [checkButton, revealButton] }),
        ],
      }),
      { minWidth: width, maxWidth: width },
    );
    this.focusables = [...pickers, chargeSpinner, massControl, checkButton, revealButton];
  }
}
