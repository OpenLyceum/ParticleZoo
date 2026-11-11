import { describe, expect, it } from "vitest";
import {
  breakingSeparation,
  ConfinementModel,
  PAIR_THRESHOLD,
  potential,
} from "../../src/confinement/model/ConfinementModel.js";

describe("ConfinementModel", () => {
  it("V = σr with σ = 1 GeV/fm", () => {
    expect(potential(0.5, false)).toBeCloseTo(500, 6);
  });

  it("breaks where V reaches the pair threshold, with or without the Coulomb term", () => {
    for (const coulomb of [false, true]) {
      expect(potential(breakingSeparation(coulomb), coulomb)).toBeCloseTo(PAIR_THRESHOLD, 6);
    }
    expect(breakingSeparation(false)).toBeCloseTo(0.68, 3);
  });

  it("pulling a π⁺ apart gives two mesons, never a free quark", () => {
    const model = new ConfinementModel();
    model.pull(0.5);
    expect(model.phaseProperty.value).toBe("bound");
    model.pull(1.2);
    expect(model.phaseProperty.value).toBe("broken");
    const [left, right] = model.fragmentsProperty.value ?? [];
    // u d̄ + (u ū popped) → (u ū) + (u d̄)
    expect(left?.meson?.id).toBe("pi0");
    expect(right?.meson?.id).toBe("pi+");
    model.rejoin();
    model.pull(1.2);
    // next break pops d d̄ → (u d̄) + (d d̄)
    expect(model.fragmentsProperty.value?.[0].meson?.id).toBe("pi+");
    expect(model.fragmentsProperty.value?.[1].meson?.id).toBe("pi0");
  });

  it("a K⁺ breaks into a pion and a kaon", () => {
    const model = new ConfinementModel();
    model.presetProperty.value = "kPlus";
    model.pull(1.5);
    expect(model.fragmentsProperty.value?.map((f) => f.meson?.id)).toEqual(["pi0", "K+"]);
  });
});
