import { describe, expect, it } from "vitest";
import { parseContent } from "../../src/common/model/quarks.js";
import { HadronBuilderModel } from "../../src/hadron-builder/model/HadronBuilderModel.js";

const build = (content: string, spin2?: number) => {
  const model = new HadronBuilderModel();
  model.setContents(parseContent(content));
  if (spin2 !== undefined) {
    model.spin2Property.value = spin2;
  }
  return model;
};
const ids = (model: HadronBuilderModel) => model.matchesProperty.value.map((p) => p.id);

describe("HadronBuilderModel", () => {
  it("u s̄ is the K⁺ (the worked example)", () => {
    const model = build("uS");
    expect(model.sumsProperty.value).toMatchObject({ charge3: 3, baryon3: 0, strangeness: 1 });
    expect(ids(model)).toEqual(["K+"]);
    model.spin2Property.value = 2;
    expect(ids(model)).toEqual(["K*+"]);
  });

  it("uud is the proton at spin ½ and Δ⁺ at 3/2", () => {
    expect(ids(build("uud"))).toEqual(["p"]);
    expect(ids(build("udu", 3))).toEqual(["Delta+"]);
  });

  it("uds at spin ½ is ambiguous between Λ and Σ⁰", () => {
    expect(ids(build("uds")).sort()).toEqual(["Lambda", "Sigma0"]);
  });

  it("antiquarks build antibaryons", () => {
    expect(ids(build("UUD"))).toEqual(["anti-p"]);
  });

  it("uu carries net colour and matches nothing", () => {
    const model = build("uu");
    expect(model.colorNeutralProperty.value).toBe(false);
    expect(model.verdictProperty.value).toBe("netColor");
  });

  it("uuu at spin ½ is colour-neutral but unknown (Pauli), Δ⁺⁺ at 3/2", () => {
    expect(build("uuu").verdictProperty.value).toBe("unknown");
    expect(ids(build("uuu", 3))).toEqual(["Delta++"]);
  });

  it("holds at most three constituents", () => {
    const model = build("uud");
    expect(model.add(parseContent("s")[0] ?? { flavor: "s", anti: false })).toBe(false);
    expect(model.bagProperty.value).toHaveLength(3);
  });
});
