/**
 * Memory-leak regression suite (fleet standard).
 *
 * Every view node that links model Properties, with a factory that builds a
 * fresh instance. The shared harness in tests/helpers/memoryLeak.ts
 * (template-owned) checks that each one is garbage collected after dispose()
 * and leaves no survivors across repeated cycles. The screen models are
 * long-lived (as in the sim), so they are built once here.
 */

import { quark } from "../src/common/model/quarks.js";
import { QuarkNode } from "../src/common/view/QuarkNode.js";
import { ConfinementModel } from "../src/confinement/model/ConfinementModel.js";
import { PotentialPlotNode } from "../src/confinement/view/PotentialPlotNode.js";
import { EightfoldWayModel } from "../src/eightfold-way/model/EightfoldWayModel.js";
import { MultipletDiagramNode } from "../src/eightfold-way/view/MultipletDiagramNode.js";
import { PRESETS, ReactionCourtModel } from "../src/reaction-court/model/ReactionCourtModel.js";
import { VertexDiagramNode } from "../src/reaction-court/view/VertexDiagramNode.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

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
