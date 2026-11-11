import { describe, expect, it } from "vitest";
import { PARTICLES, particleById } from "../../src/common/model/particleCatalog.js";
import { formatThirds, parseContent, sumQuarks } from "../../src/common/model/quarks.js";

describe("particle catalog", () => {
  it("every hadron's quark content reproduces its Q, B, S, C and beauty", () => {
    for (const p of PARTICLES.filter((x) => x.family === "meson" || x.family === "baryon")) {
      for (const content of p.contents) {
        const sums = sumQuarks(parseContent(content));
        expect(sums.charge3, `${p.id} ${content} charge`).toBe(3 * p.charge);
        expect(sums.baryon3, `${p.id} baryon`).toBe(3 * p.baryonNumber);
        expect(sums.strangeness, `${p.id} S`).toBe(p.strangeness);
        expect(sums.charm, `${p.id} C`).toBe(p.charm);
        expect(sums.beauty, `${p.id} beauty`).toBe(p.beauty);
      }
    }
  });

  it("antiparticles conjugate every additive quantum number", () => {
    const p = particleById("p");
    const pbar = particleById(p.antiId);
    expect(pbar.charge).toBe(-1);
    expect(pbar.baryonNumber).toBe(-1);
    expect(pbar.contents).toEqual(["UUD"]);
    expect(particleById(pbar.antiId)).toBe(p);
    expect(particleById("pi0").antiId).toBe("pi0");
  });

  it("ids are unique", () => {
    expect(new Set(PARTICLES.map((p) => p.id)).size).toBe(PARTICLES.length);
  });

  it("formats thirds", () => {
    expect(formatThirds(2)).toBe("+2/3");
    expect(formatThirds(-1)).toBe("−1/3");
    expect(formatThirds(3)).toBe("+1");
    expect(formatThirds(0)).toBe("0");
  });
});
