import { VERTEX_DIAGRAM_NODE_SETTINGS } from "../../ParticleZooConstants.js";
/**
 * VertexDiagramNode.ts
 *
 * Draws a constrained quark-level Feynman diagram (time upward) and lets the
 * student fill its blanks: the exchanged boson and one or two fermion lines,
 * each a button that cycles through a short list. Each vertex dot is grey
 * until its blanks are filled, then green (balanced) or red, with the reason.
 */

import { Multilink, PatternStringProperty, StringProperty } from "scenerystack/axon";
import { roundSymmetric, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { RectangularPushButton } from "scenerystack/sun";
import { FLAT_PANEL_PUSH_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../../common/ParticleZooButtonOptions.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
import { FONTS, PANEL_CORNER_RADIUS, REACTION_COURT } from "../../ParticleZooConstants.js";
import type { ReactionCourtModel } from "../model/ReactionCourtModel.js";
import {
  BOSON_SYMBOLS,
  BOSONS,
  type Boson,
  type DiagramTemplate,
  fermion,
  type Leg,
  type VertexCheck,
} from "../model/vertexDiagrams.js";

/** Sinusoidal (photon/W/Z) or coiled (gluon) line from a to b. */
function bosonShape(a: Vector2, b: Vector2, boson: Boson | null): Shape {
  const shape = new Shape();
  if (boson === null) {
    return shape.moveToPoint(a).lineToPoint(b);
  }
  const length = a.distance(b);
  const dir = b.minus(a).normalized();
  const perp = dir.perpendicular;
  const gluon = boson === "gluon";
  const amplitude = gluon ? REACTION_COURT.GLUON_AMPLITUDE : REACTION_COURT.PHOTON_AMPLITUDE;
  const wavelength = gluon ? REACTION_COURT.GLUON_WAVELENGTH : REACTION_COURT.PHOTON_WAVELENGTH;
  const steps = Math.max(REACTION_COURT.BOSON_MIN_STEPS, roundSymmetric(length / 2));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * length;
    const phase = (2 * Math.PI * t) / wavelength;
    // A gluon's coil adds a back-and-forth component along the line.
    const along = gluon ? -amplitude * 0.9 * Math.cos(phase) + amplitude * 0.9 : 0;
    const point = a
      .plus(dir.timesScalar(Math.min(length, t + along)))
      .plus(perp.timesScalar(amplitude * Math.sin(phase)));
    i === 0 ? shape.moveToPoint(point) : shape.lineToPoint(point);
  }
  return shape;
}

/** Puts a label just above a top endpoint or just below a bottom one. */
function placeAtEnd(node: Node, end: Vector2, isTop: boolean): void {
  node.centerX = end.x;
  if (isTop) {
    node.bottom = end.y - REACTION_COURT.LABEL_END_GAP;
  } else {
    node.top = end.y + REACTION_COURT.LABEL_END_GAP;
  }
}

export class VertexDiagramNode extends Node {
  private readonly multilinks: { dispose(): void }[] = [];
  /** Focusable blanks, rebuilt for each template. */
  public readonly blanks = new Node();

  public constructor(model: ReactionCourtModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getReactionCourtStrings();
    const a11y = StringManager.getInstance().getReactionCourtA11yStrings();

    const frame = new Rectangle(0, 0, width, height, {
      fill: ParticleZooColors.panelBackgroundColorProperty,
      stroke: ParticleZooColors.panelBorderColorProperty,
      cornerRadius: PANEL_CORNER_RADIUS,
    });
    const title = new Text(strings.diagramTitleStringProperty, {
      font: FONTS.DIAGRAM_TITLE,
      fill: ParticleZooColors.textColorProperty,
      left: REACTION_COURT.DIAGRAM_TITLE_LEFT,
      top: REACTION_COURT.DIAGRAM_TITLE_TOP,
      maxWidth: width - 2 * REACTION_COURT.DIAGRAM_TITLE_LEFT,
    });
    const hint = new RichText(strings.diagramHintStringProperty, {
      font: FONTS.SMALL,
      fill: ParticleZooColors.textColorProperty,
      lineWrap: width - 2 * REACTION_COURT.DIAGRAM_TITLE_LEFT,
      left: REACTION_COURT.DIAGRAM_TITLE_LEFT,
      top: REACTION_COURT.DIAGRAM_HINT_TOP,
    });
    const diagramLayer = new Node();
    const status = new VBox({ spacing: REACTION_COURT.DIAGRAM_STATUS_SPACING, align: "left" });
    this.children = [frame, title, hint, diagramLayer, this.blanks, status];

    // Diagram box inside the frame.
    const box = {
      left: REACTION_COURT.DIAGRAM_BOX_LEFT,
      right: width - REACTION_COURT.DIAGRAM_BOX_RIGHT_INSET,
      top: REACTION_COURT.DIAGRAM_BOX_TOP,
      bottom: height - REACTION_COURT.DIAGRAM_BOX_BOTTOM_INSET,
    };
    const at = (x: number, y: number) =>
      new Vector2(box.left + x * (box.right - box.left), box.bottom - y * (box.bottom - box.top));

    const cycleButton = (
      label: string,
      accessibleName: PatternStringProperty<{ value: StringProperty }>,
      onPress: () => void,
    ): RectangularPushButton => {
      const button = new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        xMargin: REACTION_COURT.DIAGRAM_BLANK_X_MARGIN,
        yMargin: REACTION_COURT.DIAGRAM_BLANK_Y_MARGIN,
        content: new Text(label, { font: FONTS.DIAGRAM_LABEL, fill: LIGHT_SURFACE_TEXT_FILL }),
        listener: onPress,
        accessibleName,
      });
      // accessibleName is not a scene-graph child; button chrome/content go with disposeSubtree.
      button.disposeEmitter.addListener(() => accessibleName.dispose());
      return button;
    };

    const build = (diagram: DiagramTemplate | null): void => {
      // Keep keyboard focus on the same blank across the rebuild.
      const focusedIndex = this.blanks.children.findIndex((child) => child.focused);
      // disposeSubtree(): Node.dispose() leaves RectangularPushButton chrome (and any nested
      // Text/Path) alive, retained through long-lived color and a11y Properties.
      for (const child of [...diagramLayer.children, ...this.blanks.children, ...status.children]) {
        child.disposeSubtree();
      }
      diagramLayer.children = [];
      this.blanks.children = [];
      status.children = [];
      if (!diagram) {
        return;
      }
      const boson = model.bosonProperty.value;
      const choices = model.slotChoicesProperty.value;
      const checks = model.vertexChecksProperty.value;
      const lines: Node[] = [];
      const labels: Node[] = [];
      const blanks: Node[] = [];

      const fermionLine = (a: Vector2, b: Vector2) =>
        new Line(a, b, {
          stroke: ParticleZooColors.textColorProperty,
          lineWidth: REACTION_COURT.DIAGRAM_LINE_WIDTH,
        });

      const legLabel = (leg: Leg, end: Vector2, isTop: boolean): void => {
        if ("slot" in leg) {
          const slot = leg.slot;
          const current = choices[slot];
          const options = diagram.slotOptions[slot] ?? [];
          const shown = current ? fermion(current).symbol : "?";
          const button = cycleButton(
            shown,
            new PatternStringProperty(a11y.controls.slotPatternStringProperty, { value: new StringProperty(shown) }),
            () => {
              const index = current ? options.indexOf(current) : -1;
              model.setSlotChoice(slot, options[(index + 1) % options.length] ?? "u");
            },
          );
          placeAtEnd(button, end, isTop);
          blanks.push(button);
        } else {
          const text = new Text(fermion(leg.fermion).symbol, {
            font: FONTS.DIAGRAM_LABEL,
            fill: ParticleZooColors.textColorProperty,
          });
          placeAtEnd(text, end, isTop);
          labels.push(text);
        }
      };

      // Spectator quarks: straight lines from bottom to top.
      diagram.spectators.forEach((flavor, i) => {
        const x = 0.04 + 0.09 * i;
        const bottom = at(x, 0);
        const top = at(x, 1);
        lines.push(fermionLine(bottom, top));
        for (const [end, isTop] of [
          [bottom, false],
          [top, true],
        ] as const) {
          const text = new Text(fermion(flavor).symbol, {
            font: FONTS.DIAGRAM_LABEL,
            fill: ParticleZooColors.textColorProperty,
            opacity: VERTEX_DIAGRAM_NODE_SETTINGS.TEXT_OPACITY,
          });
          placeAtEnd(text, end, isTop);
          labels.push(text);
        }
      });

      const vertexPoints = diagram.vertices.map((v) => at(v.x, v.y));
      diagram.vertices.forEach((vertex, vi) => {
        const point = vertexPoints[vi] ?? at(0.5, 0.5);
        const ins = vertex.legs.filter((leg) => leg.direction === "in");
        const outs = vertex.legs.filter((leg) => leg.direction === "out");
        const spread = (count: number, index: number) => (count === 2 ? (index === 0 ? -0.13 : 0.13) : 0);
        ins.forEach((leg, i) => {
          const end = at(vertex.x + spread(ins.length, i), 0);
          lines.push(fermionLine(end, point));
          legLabel(leg, end, false);
        });
        outs.forEach((leg, i) => {
          // A single outgoing leg at a boson-emitting vertex leans away from the boson.
          const lean = outs.length === 1 && vertex.bosonDirection === "out" ? -0.06 : 0;
          const end = at(vertex.x + spread(outs.length, i) + lean, 1);
          lines.push(fermionLine(point, end));
          legLabel(leg, end, true);
        });
      });

      // Boson between the vertices.
      const [p0, p1] = vertexPoints;
      if (p0 && p1) {
        lines.push(
          new Path(bosonShape(p0, p1, boson), {
            stroke: ParticleZooColors.highlightProperty,
            lineWidth: REACTION_COURT.DIAGRAM_LINE_WIDTH,
            lineDash:
              boson === null
                ? [VERTEX_DIAGRAM_NODE_SETTINGS.BUILD_LINE_DASH_DASH, VERTEX_DIAGRAM_NODE_SETTINGS.BUILD_LINE_DASH_DASH]
                : [],
          }),
        );
        const shown = boson ? BOSON_SYMBOLS[boson] : "?";
        const bosonButton = cycleButton(
          shown,
          new PatternStringProperty(a11y.controls.bosonPatternStringProperty, { value: new StringProperty(shown) }),
          () => {
            const index = boson ? BOSONS.indexOf(boson) : -1;
            model.bosonProperty.value = BOSONS[(index + 1) % BOSONS.length] ?? "gamma";
          },
        );
        const mid = p0.average(p1);
        bosonButton.left = mid.x + VERTEX_DIAGRAM_NODE_SETTINGS.BUILD_LEFT_OFFSET;
        bosonButton.centerY = mid.y;
        blanks.unshift(bosonButton);
      }

      // Vertex dots.
      vertexPoints.forEach((point, i) => {
        const check = checks[i] ?? null;
        lines.push(
          new Circle(REACTION_COURT.DIAGRAM_VERTEX_RADIUS, {
            center: point,
            fill:
              check === null
                ? ParticleZooColors.panelBorderColorProperty
                : check.balanced
                  ? ParticleZooColors.goodProperty
                  : ParticleZooColors.badProperty,
            stroke: ParticleZooColors.textColorProperty,
          }),
          new Text(`${i + 1}`, {
            font: "bold 11px sans-serif",
            fill: ParticleZooColors.backgroundColorProperty,
            center: point,
          }),
        );
      });

      // Time arrow.
      const arrowX = REACTION_COURT.DIAGRAM_TIME_ARROW_X;
      lines.push(
        new Line(arrowX, box.bottom, arrowX, box.top, {
          stroke: ParticleZooColors.textColorProperty,
          lineWidth: VERTEX_DIAGRAM_NODE_SETTINGS.BUILD_LINE_WIDTH,
          opacity: VERTEX_DIAGRAM_NODE_SETTINGS.BUILD_OPACITY,
        }),
        new Path(
          new Shape()
            .moveTo(arrowX - 6, box.top + 10)
            .lineTo(arrowX, box.top)
            .lineTo(arrowX + 6, box.top + 10),
          {
            stroke: ParticleZooColors.textColorProperty,
            lineWidth: VERTEX_DIAGRAM_NODE_SETTINGS.BUILD_LINE_WIDTH,
            opacity: VERTEX_DIAGRAM_NODE_SETTINGS.BUILD_OPACITY,
          },
        ),
        new Text(strings.timeStringProperty, {
          font: "12px sans-serif",
          fill: ParticleZooColors.textColorProperty,
          opacity: VERTEX_DIAGRAM_NODE_SETTINGS.TIME_LABEL_OPACITY,
          rotation: -Math.PI / 2,
          centerX: arrowX - VERTEX_DIAGRAM_NODE_SETTINGS.BUILD_CENTER_X_OFFSET,
          centerY: (box.top + box.bottom) / 2,
        }),
      );

      diagramLayer.children = [...lines, ...labels];
      this.blanks.children = blanks;
      if (focusedIndex >= 0) {
        blanks[focusedIndex]?.focus();
      }

      // Status lines.
      const problemText = (check: VertexCheck | null): string => {
        if (check === null) {
          return strings.unfilledStringProperty.value;
        }
        if (check.balanced) {
          return strings.balancedStringProperty.value;
        }
        const key = {
          charge: "problemCharge",
          baryon: "problemBaryon",
          lepton: "problemLepton",
          flavor: "problemFlavor",
          boson: "problemBoson",
        }[check.problem ?? "flavor"] as "problemCharge";
        return strings[`${key}StringProperty`].value;
      };
      status.children = checks.map(
        (check, i) =>
          new Text(`${strings.vertexPatternStringProperty.value.replace("{{n}}", `${i + 1}`)}: ${problemText(check)}`, {
            font: "13px sans-serif",
            fill:
              check === null
                ? ParticleZooColors.textColorProperty
                : check.balanced
                  ? ParticleZooColors.goodProperty
                  : ParticleZooColors.badProperty,
            maxWidth: width - VERTEX_DIAGRAM_NODE_SETTINGS.BUILD_MAX_WIDTH_OFFSET,
          }),
      );
      status.left = REACTION_COURT.DIAGRAM_TITLE_LEFT;
      status.bottom = height - REACTION_COURT.DIAGRAM_STATUS_BOTTOM_INSET;
    };

    this.multilinks.push(
      Multilink.multilink(
        [model.diagramProperty, model.bosonProperty, model.slotChoicesProperty, model.vertexChecksProperty],
        (diagram) => build(diagram),
      ),
    );
  }

  public override dispose(): void {
    for (const multilink of this.multilinks) {
      multilink.dispose();
    }
    for (const child of [...this.children]) {
      child.disposeSubtree();
    }
    super.dispose();
  }
}
