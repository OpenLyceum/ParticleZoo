/**
 * HadronReadoutPanel.ts
 *
 * Live quantum numbers of the bag: Q, B, S (and C, B̃ when non-zero), the
 * spin choice the constituents allow, and colour neutrality.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { GridBox, Text, VBox } from "scenerystack/scenery";
import { AquaRadioButtonGroup } from "scenerystack/sun";
import { formatSigned, formatThirds } from "../../common/model/quarks.js";
import { ParticleZooPanel } from "../../common/ParticleZooPanel.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import type { HadronBuilderModel } from "../model/HadronBuilderModel.js";

const FONT = "15px sans-serif";

/** Spin in units of ħ/2 → "½", "3/2", "0", "1". */
export function formatSpin(spin2: number): string {
  if (spin2 % 2 === 0) {
    return `${spin2 / 2}`;
  }
  return spin2 === 1 ? "½" : `${spin2}/2`;
}

export class HadronReadoutPanel extends ParticleZooPanel {
  public readonly spinGroup: AquaRadioButtonGroup<number>;

  public constructor(model: HadronBuilderModel, width: number) {
    const strings = StringManager.getInstance().getHadronBuilderStrings();
    const a11y = StringManager.getInstance().getHadronBuilderA11yStrings();
    const text = (s: TReadOnlyProperty<string>) =>
      new Text(s, { font: FONT, fill: ParticleZooColors.textColorProperty, maxWidth: width * 0.6 });
    const value = (property: TReadOnlyProperty<string>) =>
      new Text(property, { font: `bold ${FONT}`, fill: ParticleZooColors.textColorProperty });

    const sums = model.sumsProperty;
    const q = new DerivedProperty([sums], (s) => formatThirds(s.charge3));
    const b = new DerivedProperty([sums], (s) => formatThirds(s.baryon3));
    const st = new DerivedProperty([sums], (s) => formatSigned(s.strangeness));
    const c = new DerivedProperty([sums], (s) => formatSigned(s.charm));
    const bt = new DerivedProperty([sums], (s) => formatSigned(s.beauty));

    const charmLabel = text(strings.charmNumberStringProperty);
    const charmValue = value(c);
    const beautyLabel = text(strings.beautyNumberStringProperty);
    const beautyValue = value(bt);
    sums.link((s) => {
      charmLabel.visible = charmValue.visible = s.charm !== 0;
      beautyLabel.visible = beautyValue.visible = s.beauty !== 0;
    });

    const neutralValue = new Text("", { font: `bold ${FONT}` });
    const updateNeutral = () => {
      const bag = model.bagProperty.value;
      const neutral = model.colorNeutralProperty.value;
      neutralValue.string =
        bag.length === 0 ? "—" : neutral ? strings.yesStringProperty.value : strings.noStringProperty.value;
      neutralValue.fill =
        bag.length === 0
          ? ParticleZooColors.textColorProperty
          : neutral
            ? ParticleZooColors.goodProperty
            : ParticleZooColors.badProperty;
    };
    model.colorNeutralProperty.link(updateNeutral);
    model.bagProperty.link(updateNeutral);
    strings.yesStringProperty.lazyLink(updateNeutral);

    const grid = new GridBox({
      xSpacing: 16,
      ySpacing: 4,
      xAlign: "left",
      rows: [
        [text(strings.chargeStringProperty), value(q)],
        [text(strings.baryonNumberStringProperty), value(b)],
        [text(strings.strangenessStringProperty), value(st)],
        [charmLabel, charmValue],
        [beautyLabel, beautyValue],
        [text(strings.colorNeutralStringProperty), neutralValue],
      ],
    });

    // Spin choice: all four values exist; only the two the bag allows are enabled.
    const spinGroup = new AquaRadioButtonGroup<number>(
      model.spin2Property,
      [0, 1, 2, 3].map((spin2) => ({
        value: spin2,
        createNode: () => new Text(formatSpin(spin2), { font: FONT, fill: ParticleZooColors.textColorProperty }),
        options: {
          accessibleName: formatSpin(spin2),
          enabledProperty: new DerivedProperty([model.allowedSpinsProperty], (allowed) => allowed.includes(spin2)),
        },
      })),
      {
        orientation: "horizontal",
        spacing: 14,
        radioButtonOptions: { radius: 7 },
        accessibleName: a11y.controls.spinStringProperty,
      },
    );
    super(
      new VBox({
        spacing: 8,
        align: "left",
        children: [
          grid,
          new VBox({ spacing: 4, align: "left", children: [text(strings.spinStringProperty), spinGroup] }),
        ],
      }),
      { minWidth: width, maxWidth: width },
    );
    this.spinGroup = spinGroup;
  }
}
