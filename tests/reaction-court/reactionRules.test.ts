/**
 * Table-driven verdicts for classic reactions.
 */
import { describe, expect, it } from "vitest";
import { particleById } from "../../src/common/model/particleCatalog.js";
import { judge } from "../../src/reaction-court/model/reactionRules.js";

type Expect = "weak" | "electromagnetic" | "strong" | `forbidden:${string}`;

const CASES: [string, string, Expect][] = [
  ["n", "p e- anti-nu_e", "weak"],
  ["n", "p e- nu_e", "forbidden:electron"],
  ["Lambda", "p pi-", "weak"],
  ["Lambda", "n pi0", "weak"],
  ["Sigma0", "Lambda gamma", "electromagnetic"],
  ["Sigma+", "p pi0", "weak"],
  ["Xi-", "Lambda pi-", "weak"],
  ["Omega-", "Lambda K-", "weak"],
  ["Omega-", "Xi0 pi-", "weak"],
  ["Omega-", "n pi-", "forbidden:flavorJump"],
  ["Delta++", "p pi+", "strong"],
  ["rho0", "pi+ pi-", "strong"],
  ["phi", "K+ K-", "strong"],
  ["pi0", "gamma gamma", "electromagnetic"],
  ["pi+", "anti-mu- nu_mu", "weak"],
  ["pi+", "anti-mu- anti-nu_mu", "forbidden:muon"],
  ["pi-", "mu- anti-nu_mu", "weak"],
  ["K+", "pi+ pi0", "weak"],
  ["K+", "anti-mu- nu_mu", "weak"],
  ["mu-", "e- anti-nu_e nu_mu", "weak"],
  ["mu-", "e- gamma", "forbidden:electron,muon"],
  ["tau-", "pi- nu_tau", "weak"],
  ["p", "anti-e- pi0", "forbidden:baryon,electron"],
  ["p", "n anti-e- nu_e", "forbidden:energy"],
  ["gamma", "e- anti-e-", "forbidden:energy"],
  ["J/psi", "anti-mu- mu-", "electromagnetic"],
  ["p p", "p p pi0", "strong"],
  ["p anti-p", "pi+ pi- pi0", "strong"],
  ["anti-e- e-", "anti-mu- mu-", "electromagnetic"],
  ["nu_e n", "p e-", "weak"],
  ["pi- p", "K0 Lambda", "strong"],
  ["pi- p", "K- Sigma+", "forbidden:flavorJump"],
  ["pi- p", "K0 n", "weak"],
];

describe("judge", () => {
  for (const [before, after, expected] of CASES) {
    it(`${before} → ${after}: ${expected}`, () => {
      const result = judge(before.split(" ").map(particleById), after.split(" ").map(particleById));
      if (expected.startsWith("forbidden:")) {
        expect(result.verdict.kind).toBe("forbidden");
        const reasons =
          result.verdict.kind === "forbidden" ? [...result.verdict.reasons].sort((x, y) => x.localeCompare(y)) : [];
        expect(reasons).toEqual(
          expected
            .slice("forbidden:".length)
            .split(",")
            .sort((x, y) => x.localeCompare(y)),
        );
      } else {
        expect(result.verdict).toMatchObject({ kind: "allowed", force: expected });
      }
    });
  }
});
