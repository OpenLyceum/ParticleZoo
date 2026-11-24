/**
 * Memory-leak regression suite (fleet standard).
 *
 * Every view node that links model Properties, with a factory that builds a
 * fresh instance. The shared harness in tests/helpers/memoryLeak.ts
 * (template-owned) checks that each one is garbage collected after dispose()
 * and leaves no survivors across repeated cycles. The screen models are
 * long-lived (as in the sim), so they are built once here.
 */

import { describe, it } from "vitest";
import { quark } from "../src/common/model/quarks.js";
import { QuarkNode } from "../src/common/view/QuarkNode.js";
import { ConfinementModel } from "../src/confinement/model/ConfinementModel.js";
import { PotentialPlotNode } from "../src/confinement/view/PotentialPlotNode.js";
import { EightfoldWayModel } from "../src/eightfold-way/model/EightfoldWayModel.js";
import { MultipletDiagramNode } from "../src/eightfold-way/view/MultipletDiagramNode.js";
import { HadronBuilderModel } from "../src/hadron-builder/model/HadronBuilderModel.js";
import { BagNode } from "../src/hadron-builder/view/BagNode.js";
import { StringManager } from "../src/i18n/StringManager.js";
import ParticleZooColors from "../src/ParticleZooColors.js";
import { ParticleZooPreferencesModel } from "../src/preferences/ParticleZooPreferencesModel.js";
import { PRESETS, ReactionCourtModel } from "../src/reaction-court/model/ReactionCourtModel.js";
import { VertexDiagramNode } from "../src/reaction-court/view/VertexDiagramNode.js";
import { describeDisposalLeaks, expectNoListenerGrowth } from "./helpers/memoryLeak.js";

const eightfoldWay = new EightfoldWayModel();
const confinement = new ConfinementModel();
const reactionCourt = new ReactionCourtModel();
const betaDecay = PRESETS.find((p) => p.id === "betaDecay");
if (betaDecay) {
  reactionCourt.loadPreset(betaDecay);
}

describeDisposalLeaks([
  { name: "QuarkNode", create: () => new QuarkNode(quark("s", true)) },
  { name: "MultipletDiagramNode", create: () => new MultipletDiagramNode(eightfoldWay) },
  { name: "PotentialPlotNode", create: () => new PotentialPlotNode(confinement, 300, 200) },
  { name: "VertexDiagramNode", create: () => new VertexDiagramNode(reactionCourt, 400, 300) },
]);

describe("Rebuilt nodes release their localized labels", () => {
  it("VertexDiagramNode rebuilds and dispose leave the label Properties as they were", async () => {
    const a11y = StringManager.getInstance().getReactionCourtA11yStrings();
    const watched = [
      a11y.controls.slotPatternStringProperty,
      a11y.controls.bosonPatternStringProperty,
      ParticleZooColors.controlSurfaceTextColorProperty,
      ParticleZooColors.textColorProperty,
    ];
    await expectNoListenerGrowth(
      watched,
      () => {
        const node = new VertexDiagramNode(reactionCourt, 400, 300);
        // Each change rebuilds the blanks, their labels and the status lines.
        reactionCourt.bosonProperty.value = reactionCourt.bosonProperty.value === "W-" ? "Z0" : "W-";
        reactionCourt.setSlotChoice(0, "u");
        reactionCourt.setSlotChoice(0, "d");
        node.dispose();
      },
      { label: "slot/boson labels must be disposed with their buttons" },
    );
  });

  it("BagNode disposes each quark's accessible name when the bag rebuilds", async () => {
    const strings = StringManager.getInstance().getHadronBuilderStrings();
    const model = new HadronBuilderModel();
    new BagNode(model, 100, new ParticleZooPreferencesModel());
    await expectNoListenerGrowth(
      [
        strings.removeQuarkPatternStringProperty,
        ParticleZooColors.quarkTileProperty,
        ParticleZooColors.bagStrokeProperty,
      ],
      () => {
        model.add(quark("u"));
        model.add(quark("d"));
        model.add(quark("s"));
        model.removeAt(1);
        model.clear();
      },
      { label: "quark labels must be disposed with their nodes" },
    );
  });
});
