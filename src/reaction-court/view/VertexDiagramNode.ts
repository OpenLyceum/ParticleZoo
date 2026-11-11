/**
 * VertexDiagramNode.ts
 *
 * Draws a constrained quark-level Feynman diagram (time upward) and lets the
 * student fill its blanks: the exchanged boson and one or two fermion lines,
 * each a button that cycles through a short list. Each vertex dot is grey
 * until its blanks are filled, then green (balanced) or red, with the reason.
 */

import { Multilink, PatternStringProperty, StringProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, RichText, Text, VBox } from "scenerystack/scenery";
import { RectangularPushButton } from "scenerystack/sun";
import { FLAT_PANEL_PUSH_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../../common/ParticleZooButtonOptions.js";
import { StringManager } from "../../i18n/StringManager.js";
import ParticleZooColors from "../../ParticleZooColors.js";
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

const LABEL_FONT = "bold 18px serif";

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
  const amplitude = gluon ? 7 : 5;
  const wavelength = gluon ? 12 : 14;
  const steps = Math.max(8, Math.round(length / 2));
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
    node.bottom = end.y - 4;
  } else {
    node.top = end.y + 4;
  }
}

export class VertexDiagramNode extends Node {
  /** Focusable blanks, rebuilt for each template. */
  public readonly blanks = new Node();

  public constructor(model: ReactionCourtModel, width: number, height: number) {
    super();
    const strings = StringManager.getInstance().getReactionCourtStrings();
    const a11y = StringManager.getInstance().getReactionCourtA11yStrings();

    const frame = new Rectangle(0, 0, width, height, {
      fill: ParticleZooColors.panelBackgroundColorProperty,
      stroke: ParticleZooColors.panelBorderColorProperty,
      cornerRadius: 6,
    });
    const title = new Text(strings.diagramTitleStringProperty, {
      font: "bold 14px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      left: 10,
      top: 8,
      maxWidth: width - 20,
    });
    const hint = new RichText(strings.diagramHintStringProperty, {
      font: "12px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      lineWrap: width - 20,
      left: 10,
      top: 30,
    });
    const diagramLayer = new Node();
    const status = new VBox({ spacing: 2, align: "left" });
    this.children = [frame, title, hint, diagramLayer, this.blanks, status];

    // Diagram box inside the frame.
    const box = { left: 70, right: width - 40, top: 80, bottom: height - 70 };
    const at = (x: number, y: number) =>
      new Vector2(box.left + x * (box.right - box.left), box.bottom - y * (box.bottom - box.top));

    const cycleButton = (
      label: string,
      accessibleName: PatternStringProperty<{ value: StringProperty }>,
      onPress: () => void,
    ) =>
      new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        xMargin: 6,
        yMargin: 2,
        content: new Text(label, { font: LABEL_FONT, fill: LIGHT_SURFACE_TEXT_FILL }),
        listener: onPress,
        accessibleName,
      });

    const build = (diagram: DiagramTemplate | null): void => {
      // Keep keyboard focus on the same blank across the rebuild.
      const focusedIndex = this.blanks.children.findIndex((child) => child.focused);
      for (const child of [...diagramLayer.children, ...this.blanks.children]) {
        child.dispose();
      }
      diagramLayer.children = [];
      this.blanks.children = [];
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
        new Line(a, b, { stroke: ParticleZooColors.textColorProperty, lineWidth: 2.5 });

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
            font: LABEL_FONT,
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
            font: LABEL_FONT,
            fill: ParticleZooColors.textColorProperty,
            opacity: 0.8,
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
            lineWidth: 2.5,
            lineDash: boson === null ? [4, 4] : [],
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
        bosonButton.left = mid.x + 16;
        bosonButton.centerY = mid.y;
        blanks.unshift(bosonButton);
      }

      // Vertex dots.
      vertexPoints.forEach((point, i) => {
        const check = checks[i] ?? null;
        lines.push(
          new Circle(9, {
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
      const arrowX = 30;
      lines.push(
        new Line(arrowX, box.bottom, arrowX, box.top, {
          stroke: ParticleZooColors.textColorProperty,
          lineWidth: 1.5,
          opacity: 0.6,
        }),
        new Path(
          new Shape()
            .moveTo(arrowX - 6, box.top + 10)
            .lineTo(arrowX, box.top)
            .lineTo(arrowX + 6, box.top + 10),
          {
            stroke: ParticleZooColors.textColorProperty,
            lineWidth: 1.5,
            opacity: 0.6,
          },
        ),
        new Text(strings.timeStringProperty, {
          font: "12px sans-serif",
          fill: ParticleZooColors.textColorProperty,
          opacity: 0.7,
          rotation: -Math.PI / 2,
          centerX: arrowX - 12,
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
            maxWidth: width - 20,
          }),
      );
      status.left = 10;
      status.bottom = height - 8;
    };

    Multilink.multilink(
      [model.diagramProperty, model.bosonProperty, model.slotChoicesProperty, model.vertexChecksProperty],
      (diagram) => build(diagram),
    );
  }
}
