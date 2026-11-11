import { describe, expect, it } from "vitest";
import {
  DECUPLET,
  EightfoldWayModel,
  equalSpacingPrediction,
  OCTET,
  rowMeanMass,
} from "../../src/eightfold-way/model/EightfoldWayModel.js";

describe("Eightfold Way", () => {
  it("places the decuplet on a triangle: I₃ from −3/2 to +3/2, Ω⁻ at the apex", () => {
    const omega = DECUPLET.find((m) => m.missing);
    expect(omega?.particle.id).toBe("Omega-");
    expect(omega?.isospin3).toBe(0);
    expect(DECUPLET.find((m) => m.particle.id === "Delta++")?.isospin3).toBe(1.5);
    expect(OCTET).toHaveLength(8);
  });

  it("rows step by about 150 MeV, and equal spacing predicts ≈ 1680 MeV", () => {
    expect(rowMeanMass(-1) - rowMeanMass(0)).toBeGreaterThan(140);
    expect(rowMeanMass(-1) - rowMeanMass(0)).toBeLessThan(160);
    expect(equalSpacingPrediction()).toBeGreaterThan(1660);
    expect(equalSpacingPrediction()).toBeLessThan(1700);
  });

  it("grades a correct prediction: sss, Q = −1, m ≈ 1680", () => {
    const model = new EightfoldWayModel();
    for (const slot of [0, 1, 2] as const) {
      model.setPredictedQuark(slot, "s");
    }
    model.predictedChargeProperty.value = -1;
    model.predictedMassProperty.value = 1680;
    expect(model.contentCorrectProperty.value).toBe(true);
    expect(model.contentChargeProperty.value).toBe(-1);
    expect(model.chargeCorrectProperty.value).toBe(true);
    expect(model.massCorrectProperty.value).toBe(true);
    model.predictedMassProperty.value = 1550;
    expect(model.massCorrectProperty.value).toBe(false);
  });
});
