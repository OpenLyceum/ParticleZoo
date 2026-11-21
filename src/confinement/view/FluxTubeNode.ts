/**
 * FluxTubeNode.ts
 *
 * The quark (fixed, left) and antiquark (draggable) joined by a colour flux
 * tube. The tube keeps the same thickness however long it gets: the field
 * does not spread out the way an electric field does, so the energy per
 * unit length is constant and V grows linearly with r.
 *
 * After the break, the new pair appears where the tube snapped and the two
 * mesons drift apart.
 */

import { Multilink } from "scenerystack/axon";
import { DragListener, Node, Rectangle, Text } from "scenerystack/scenery";
import { type Quark, quark } from "../../common/model/quarks.js";
import { QuarkNode } from "../../common/view/QuarkNode.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { CONFINEMENT, FONTS } from "../../ParticleZooConstants.js";
import { type ConfinementModel, PRESET_CONTENT } from "../model/ConfinementModel.js";

/** Screen pixels per femtometre. */
const PIXELS_PER_FM = CONFINEMENT.PIXELS_PER_FM;

export class FluxTubeNode extends Node {
  public constructor(model: ConfinementModel) {
    super();
    const tubeHeight = CONFINEMENT.TUBE_HEIGHT;
    const quarkRadius = CONFINEMENT.QUARK_RADIUS;
    const tube = new Rectangle(0, -tubeHeight / 2, 1, tubeHeight, {
      cornerRadius: tubeHeight / 2,
      fill: ParticleZooColors.colorRedProperty,
    });
    const leftTube = new Rectangle(0, -tubeHeight / 2, 1, tubeHeight, {
      cornerRadius: tubeHeight / 2,
      fill: ParticleZooColors.colorRedProperty,
    });
    const rightTube = new Rectangle(0, -tubeHeight / 2, 1, tubeHeight, {
      cornerRadius: tubeHeight / 2,
      fill: ParticleZooColors.colorRedProperty,
    });
    const quarkLayer = new Node();
    const labelLayer = new Node();
    this.children = [tube, leftTube, rightTube, quarkLayer, labelLayer];

    const ball = (q: Quark): QuarkNode => new QuarkNode(q, { radius: quarkRadius, centerY: 0 });

    // Bound state: persistent nodes, so a drag in progress is never interrupted.
    const boundLayer = new Node();
    let quarkBall = ball(quark("u"));
    let antiquarkBall = ball(quark("d", true));
    // Pointer-only: pulling the quarks apart. The separation slider in ConfinementScreenView is the
    // keyboard path to the same model property.
    const dragListener = new DragListener({
      drag: (event) => {
        model.pull(this.globalToLocalPoint(event.pointer.point).x / PIXELS_PER_FM);
      },
    });
    model.presetProperty.link((preset) => {
      const [qFlavor, aqFlavor] = PRESET_CONTENT[preset];
      quarkBall.dispose();
      antiquarkBall.interruptSubtreeInput();
      if (antiquarkBall.hasInputListener(dragListener)) {
        antiquarkBall.removeInputListener(dragListener);
      }
      antiquarkBall.dispose();
      quarkBall = ball(quark(qFlavor));
      antiquarkBall = ball(quark(aqFlavor, true));
      antiquarkBall.cursor = "ew-resize";
      antiquarkBall.addInputListener(dragListener);
      quarkBall.centerX = 0;
      boundLayer.children = [quarkBall, antiquarkBall];
    });
    quarkLayer.addChild(boundLayer);

    // Broken state: four balls rebuilt once per break, then only moved.
    const brokenLayer = new Node();
    quarkLayer.addChild(brokenLayer);
    let brokenBalls: QuarkNode[] = [];
    model.fragmentsProperty.link((fragments) => {
      for (const node of brokenBalls) {
        node.dispose();
      }
      brokenBalls = fragments ? fragments.flatMap((f) => [ball(f.quarks[0]), ball(f.quarks[1])]) : [];
      brokenLayer.children = brokenBalls;
      const label = (text: string): Text =>
        new Text(text, {
          font: FONTS.FRAGMENT_LABEL,
          fill: ParticleZooColors.highlightProperty,
          top: quarkRadius + CONFINEMENT.LABEL_TOP_GAP,
        });
      for (const child of labelLayer.children) {
        child.disposeSubtree();
      }
      labelLayer.children = fragments ? fragments.map((f) => label(f.meson?.symbol ?? "?")) : [];
    });

    const draw = (): void => {
      const r = model.separationProperty.value * PIXELS_PER_FM;
      const broken = model.phaseProperty.value === "broken" && brokenBalls.length === 4;
      boundLayer.visible = tube.visible = !broken;
      brokenLayer.visible = labelLayer.visible = leftTube.visible = rightTube.visible = broken;

      if (!broken) {
        // Brighter tube as it stores more energy.
        tube.opacity = CONFINEMENT.TUBE_OPACITY_MIN + CONFINEMENT.TUBE_OPACITY_RANGE * model.fillFractionProperty.value;
        tube.setRect(0, -tubeHeight / 2, Math.max(1, r), tubeHeight);
        antiquarkBall.centerX = r;
        return;
      }

      // Two short tubes drifting apart from the break point.
      const t = Math.min(model.sinceBreakProperty.value, CONFINEMENT.DRIFT_TIME);
      const drift = CONFINEMENT.DRIFT_SPEED * t;
      const half = Math.min(r / 2, quarkRadius * CONFINEMENT.BROKEN_HALF_FACTOR);
      const mid = r / 2;
      const leftEnds = [-drift, mid - drift - half + 2 * quarkRadius] as const;
      const rightEnds = [mid + drift + half - 2 * quarkRadius, r + drift] as const;
      leftTube.setRect(leftEnds[0], -tubeHeight / 2, leftEnds[1] - leftEnds[0], tubeHeight);
      rightTube.setRect(rightEnds[0], -tubeHeight / 2, rightEnds[1] - rightEnds[0], tubeHeight);
      leftTube.opacity = rightTube.opacity = CONFINEMENT.BROKEN_TUBE_OPACITY;
      [leftEnds[0], leftEnds[1], rightEnds[0], rightEnds[1]].forEach((x, i) => {
        const node = brokenBalls[i];
        if (node) {
          node.centerX = x;
        }
      });
      const [leftLabel, rightLabel] = labelLayer.children;
      if (leftLabel && rightLabel) {
        leftLabel.centerX = (leftEnds[0] + leftEnds[1]) / 2;
        rightLabel.centerX = (rightEnds[0] + rightEnds[1]) / 2;
      }
    };
    Multilink.multilink(
      [
        model.presetProperty,
        model.separationProperty,
        model.phaseProperty,
        model.sinceBreakProperty,
        model.fragmentsProperty,
      ],
      draw,
    );
  }
}
