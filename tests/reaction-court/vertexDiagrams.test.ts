import { describe, expect, it } from "vitest";
import { checkVertex, DIAGRAMS, diagramFor } from "../../src/reaction-court/model/vertexDiagrams.js";

const template = (id: string) => {
  const t = DIAGRAMS.find((d) => d.id === id);
  if (!t) {
    throw new Error(id);
  }
  return t;
};
const both = (id: string, boson: Parameters<typeof checkVertex>[1], choices: string[]) =>
  template(id).vertices.map((v) => checkVertex(v, boson, choices).balanced);

describe("vertex diagrams", () => {
  it("β decay balances with d → u W⁻, W⁻ → e⁻ ν̄ₑ", () => {
    expect(both("betaDecay", "W-", ["u", "anti-nu_e"])).toEqual([true, true]);
    expect(both("betaDecay", "W-", ["u", "nu_e"])).toEqual([true, false]);
    expect(both("betaDecay", "W+", ["u", "anti-nu_e"])).toEqual([false, false]);
    expect(both("betaDecay", "gamma", ["d", "anti-nu_e"])[0]).toBe(true); // d → d γ is a fine vertex…
    expect(both("betaDecay", "gamma", ["d", "anti-nu_e"])[1]).toBe(false); // …but γ cannot make e⁻ ν̄ₑ
  });

  it("Λ decay: s → u W⁻, W⁻ → d ū", () => {
    expect(both("lambdaDecay", "W-", ["u", "anti-u"])).toEqual([true, true]);
  });

  it("π⁺ decay: u d̄ → W⁺ → μ⁺ ν_μ", () => {
    expect(both("pionDecay", "W+", ["nu_mu"])).toEqual([true, true]);
    expect(both("pionDecay", "W+", ["nu_e"])).toEqual([true, false]);
  });

  it("e⁺e⁻ → μ⁺μ⁻ works through γ or Z⁰", () => {
    expect(both("electronPositron", "gamma", ["anti-mu"])).toEqual([true, true]);
    expect(both("electronPositron", "Z0", ["anti-mu"])).toEqual([true, true]);
    expect(both("electronPositron", "gluon", ["anti-mu"])).toEqual([false, false]);
  });

  it("Δ⁺⁺ → p π⁺ through a gluon", () => {
    expect(both("deltaDecay", "gluon", ["u", "anti-d"])).toEqual([true, true]);
  });

  it("templates are found from catalog ids", () => {
    expect(diagramFor(["n"], ["p", "anti-e-", "anti-nu_e"])).toBeNull();
    expect(diagramFor(["n"], ["e-", "p", "anti-nu_e"])?.id).toBe("betaDecay");
    expect(diagramFor(["Lambda"], ["p", "anti-pi+"])?.id).toBe("lambdaDecay");
  });
});

import { PRESETS, ReactionCourtModel } from "../../src/reaction-court/model/ReactionCourtModel.js";

describe("ReactionCourtModel", () => {
  it("every preset parses, and the diagram presets find their template", () => {
    const model = new ReactionCourtModel();
    for (const preset of PRESETS) {
      model.loadPreset(preset);
      expect(model.judgementProperty.value.verdict.kind).not.toBe("incomplete");
    }
    model.loadPreset(PRESETS[0] ?? { id: "", before: [], after: [] });
    expect(model.diagramProperty.value?.id).toBe("betaDecay");
    expect(model.vertexChecksProperty.value).toEqual([null, null]);
    model.bosonProperty.value = "W-";
    model.setSlotChoice(0, "u");
    model.setSlotChoice(1, "anti-nu_e");
    expect(model.vertexChecksProperty.value.map((c) => c?.balanced)).toEqual([true, true]);
  });
});
