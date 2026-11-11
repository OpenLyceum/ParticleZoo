/**
 * MultipletDiagramNode.ts
 *
 * A baryon multiplet on weight-diagram axes: strangeness S down the side
 * (one row per value) and isospin I₃ across, so lines of constant charge Q
 * run diagonally. Each member shows its symbol and mass; the missing Ω⁻
 * slot is a dashed "?" until revealed.
 */

import { Multilink } from "scenerystack/axon";
import { Circle, Line, Node, Text } from "scenerystack/scenery";
import ParticleZooColors from "../../ParticleZooColors.js";
import type { EightfoldWayModel, Member } from "../model/EightfoldWayModel.js";

const ROW_HEIGHT = 105;
const COLUMN_WIDTH = 92; // px per unit of I₃
const RADIUS = 34;

export class MultipletDiagramNode extends Node {
  private readonly multilinks: { dispose(): void }[] = [];
  public constructor(model: EightfoldWayModel) {
    super();
    const layer = new Node();
    this.addChild(layer);

    const x = (i3: number): number => i3 * COLUMN_WIDTH;
    const y = (s: number): number => -s * ROW_HEIGHT;

    const draw = (): void => {
      const members = model.members;
      const revealed = model.revealedProperty.value;
      const isDecuplet = model.multipletProperty.value === "decuplet";
      const children: Node[] = [];
      const strangenesses = [...new Set(members.map((m) => m.particle.strangeness))].sort((a, b) => b - a);
      const minI3 = Math.min(...members.map((m) => m.isospin3));
      const maxI3 = Math.max(...members.map((m) => m.isospin3));

      // Row guides and S labels.
      for (const s of strangenesses) {
        children.push(
          new Line(x(minI3) - RADIUS - 10, y(s), x(maxI3) + RADIUS + 10, y(s), {
            stroke: ParticleZooColors.panelBorderColorProperty,
            lineDash: [2, 6],
          }),
          new Text(`S = ${s === 0 ? "0" : `−${-s}`}`, {
            font: "14px sans-serif",
            fill: ParticleZooColors.textColorProperty,
            right: x(minI3) - RADIUS - 18,
            centerY: y(s),
          }),
        );
      }

      // Charge diagonals. With B = 1, Q = I₃ + (1 + S)/2, so a line of constant Q
      // moves +½ in I₃ for every step down in S. Each line starts half a row
      // above the top row, where its Q label sits.
      const topS = strangenesses[0] ?? 0;
      const charges = [...new Set(members.map((m) => m.particle.charge))].sort((a, b) => a - b);
      for (const q of charges) {
        const along = members.filter((m) => m.particle.charge === q);
        const lowestS = Math.min(...along.map((m) => m.particle.strangeness));
        const i3At = (s: number): number => q - (1 + s) / 2;
        const startS = topS + 0.55;
        children.push(
          new Line(x(i3At(startS)), y(startS), x(i3At(lowestS)), y(lowestS), {
            stroke: ParticleZooColors.panelBorderColorProperty,
            lineWidth: 1.5,
          }),
        );
        const label = new Text(q === 0 ? "Q = 0" : `Q = ${q > 0 ? "+" : "−"}${Math.abs(q)}`, {
          font: "13px sans-serif",
          fill: ParticleZooColors.textColorProperty,
          opacity: 0.85,
        });
        label.centerX = x(i3At(startS));
        label.bottom = y(startS) - 2;
        children.push(label);
      }

      for (const m of members) {
        children.push(this.memberNode(m, revealed, isDecuplet, x(m.isospin3), y(m.particle.strangeness)));
      }
      layer.children = children;
    };
    this.multilinks.push(Multilink.multilink([model.multipletProperty, model.revealedProperty], draw));
  }

  private memberNode(m: Member, revealed: boolean, isDecuplet: boolean, cx: number, cy: number): Node {
    const hidden = m.missing && !revealed && isDecuplet;
    const circle = new Circle(RADIUS, {
      fill: hidden ? null : ParticleZooColors.panelBackgroundColorProperty,
      stroke: m.missing ? ParticleZooColors.highlightProperty : ParticleZooColors.bagStrokeProperty,
      lineWidth: m.missing ? 3 : 2,
      lineDash: hidden ? [6, 5] : [],
    });
    circle.centerX = cx;
    circle.centerY = cy;
    const symbol = new Text(hidden ? "?" : m.particle.symbol, {
      font: "bold 22px serif",
      fill: m.missing ? ParticleZooColors.highlightProperty : ParticleZooColors.textColorProperty,
    });
    symbol.centerX = cx;
    symbol.centerY = cy - 6;
    const mass = new Text(hidden ? "" : `${Math.round(m.particle.mass)}`, {
      font: "12px sans-serif",
      fill: ParticleZooColors.textColorProperty,
      opacity: 0.8,
    });
    mass.centerX = cx;
    mass.top = symbol.bottom;
    return new Node({ children: [circle, symbol, mass] });
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
