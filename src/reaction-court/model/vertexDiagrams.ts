/**
 * vertexDiagrams.ts
 *
 * Constrained quark-level Feynman diagrams. Each template is two vertices
 * joined by one exchanged boson, with spectator quarks drawn alongside.
 * The student fills the blanks (the boson, and one or two fermion lines)
 * from short lists; each vertex lights green when it balances and red when
 * it does not. Time runs upward, as in the book.
 *
 * Vertex rules (the Standard Model's three basic vertices):
 *  - photon:  f → f + γ, flavour unchanged, f must be charged;
 *  - gluon:   q → q + g, flavour unchanged, quarks only;
 *  - Z⁰:      f → f + Z⁰, flavour unchanged;
 *  - W±:      flavour changes within a weak doublet: up-type ↔ down-type
 *             quark (any generation, via CKM mixing) or charged lepton ↔
 *             its own neutrino; charge changes by the W's charge.
 *  - every vertex conserves Q, B, Lₑ, L_μ and L_τ.
 *
 * Fermion legs are written as particles entering (in) or leaving (out) the
 * vertex. An antifermion leaving counts the same as a fermion entering.
 */

export type Fermion = {
  readonly id: string;
  readonly symbol: string;
  /** Charge in units of e/3. */
  readonly charge3: number;
  /** Baryon number in units of 1/3. */
  readonly baryon3: number;
  readonly le: number;
  readonly lmu: number;
  readonly ltau: number;
  /** Flavour label shared by particle and antiparticle ("u", "e", "nu_e", …). */
  readonly flavor: string;
  readonly anti: boolean;
};

export const BOSONS = ["gamma", "gluon", "Z0", "W+", "W-"] as const;
export type Boson = (typeof BOSONS)[number];
export const BOSON_SYMBOLS: Readonly<Record<Boson, string>> = {
  gamma: "γ",
  gluon: "g",
  Z0: "Z⁰",
  "W+": "W⁺",
  "W-": "W⁻",
};
const BOSON_CHARGE3: Readonly<Record<Boson, number>> = { gamma: 0, gluon: 0, Z0: 0, "W+": 3, "W-": -3 };

type Base = Omit<Fermion, "id" | "symbol" | "anti">;
const BASES = new Map<string, Base & { symbol: string; antiSymbol: string }>([
  ["u", { flavor: "u", charge3: 2, baryon3: 1, le: 0, lmu: 0, ltau: 0, symbol: "u", antiSymbol: "ū" }],
  ["d", { flavor: "d", charge3: -1, baryon3: 1, le: 0, lmu: 0, ltau: 0, symbol: "d", antiSymbol: "d̄" }],
  ["s", { flavor: "s", charge3: -1, baryon3: 1, le: 0, lmu: 0, ltau: 0, symbol: "s", antiSymbol: "s̄" }],
  ["c", { flavor: "c", charge3: 2, baryon3: 1, le: 0, lmu: 0, ltau: 0, symbol: "c", antiSymbol: "c̄" }],
  ["e", { flavor: "e", charge3: -3, baryon3: 0, le: 1, lmu: 0, ltau: 0, symbol: "e⁻", antiSymbol: "e⁺" }],
  ["nu_e", { flavor: "nu_e", charge3: 0, baryon3: 0, le: 1, lmu: 0, ltau: 0, symbol: "νₑ", antiSymbol: "ν̄ₑ" }],
  ["mu", { flavor: "mu", charge3: -3, baryon3: 0, le: 0, lmu: 1, ltau: 0, symbol: "μ⁻", antiSymbol: "μ⁺" }],
  ["nu_mu", { flavor: "nu_mu", charge3: 0, baryon3: 0, le: 0, lmu: 1, ltau: 0, symbol: "ν_μ", antiSymbol: "ν̄_μ" }],
]);

/** Fermion by id: the base flavour, or "anti-" + flavour. */
export function fermion(id: string): Fermion {
  const anti = id.startsWith("anti-");
  const base = BASES.get(anti ? id.slice(5) : id);
  if (!base) {
    throw new Error(`fermion: unknown ${id}`);
  }
  const sign = anti ? -1 : 1;
  return {
    id,
    symbol: anti ? base.antiSymbol : base.symbol,
    anti,
    flavor: base.flavor,
    charge3: sign * base.charge3 + 0,
    baryon3: sign * base.baryon3 + 0,
    le: sign * base.le + 0,
    lmu: sign * base.lmu + 0,
    ltau: sign * base.ltau + 0,
  };
}

const QUARKS = new Set(["u", "d", "s", "c"]);
const UP_TYPE = new Set(["u", "c"]);
const LEPTON_PARTNER = new Map<string, string>([
  ["e", "nu_e"],
  ["nu_e", "e"],
  ["mu", "nu_mu"],
  ["nu_mu", "mu"],
]);

/** A leg is a fixed fermion or a blank the student fills (index into the template's slots). */
export type Leg =
  | { readonly direction: "in" | "out"; readonly fermion: string }
  | { readonly direction: "in" | "out"; readonly slot: number };

export type Vertex = {
  /** Position in the unit diagram box, (0,0) bottom-left, time upward. */
  readonly x: number;
  readonly y: number;
  readonly legs: readonly [Leg, Leg];
  /** Whether the exchanged boson leaves (vertex 0) or arrives (vertex 1). */
  readonly bosonDirection: "in" | "out";
};

export type DiagramTemplate = {
  readonly id: string;
  /** Reaction in the catalog's ids, so selecting the reaction offers this diagram. */
  readonly before: readonly string[];
  readonly after: readonly string[];
  /** Spectator quarks (bottom labels), drawn as straight vertical lines. */
  readonly spectators: readonly string[];
  readonly vertices: readonly [Vertex, Vertex];
  /** Options for each fermion blank; the boson blank is always BOSONS. */
  readonly slotOptions: readonly (readonly string[])[];
};

export const DIAGRAMS: readonly DiagramTemplate[] = [
  {
    id: "betaDecay",
    before: ["n"],
    after: ["p", "e-", "anti-nu_e"],
    spectators: ["u", "d"],
    vertices: [
      {
        x: 0.3,
        y: 0.4,
        bosonDirection: "out",
        legs: [
          { direction: "in", fermion: "d" },
          { direction: "out", slot: 0 },
        ],
      },
      {
        x: 0.75,
        y: 0.65,
        bosonDirection: "in",
        legs: [
          { direction: "out", fermion: "e" },
          { direction: "out", slot: 1 },
        ],
      },
    ],
    slotOptions: [
      ["u", "d", "s", "c"],
      ["nu_e", "anti-nu_e", "nu_mu", "anti-nu_mu"],
    ],
  },
  {
    id: "lambdaDecay",
    before: ["Lambda"],
    after: ["p", "pi-"],
    spectators: ["u", "d"],
    vertices: [
      {
        x: 0.3,
        y: 0.4,
        bosonDirection: "out",
        legs: [
          { direction: "in", fermion: "s" },
          { direction: "out", slot: 0 },
        ],
      },
      {
        x: 0.75,
        y: 0.65,
        bosonDirection: "in",
        legs: [
          { direction: "out", fermion: "d" },
          { direction: "out", slot: 1 },
        ],
      },
    ],
    slotOptions: [
      ["u", "d", "s", "c"],
      ["anti-u", "anti-d", "anti-s", "u"],
    ],
  },
  {
    id: "pionDecay",
    before: ["pi+"],
    after: ["mu+", "nu_mu"],
    spectators: [],
    vertices: [
      {
        x: 0.5,
        y: 0.35,
        bosonDirection: "out",
        legs: [
          { direction: "in", fermion: "u" },
          { direction: "in", fermion: "anti-d" },
        ],
      },
      {
        x: 0.5,
        y: 0.7,
        bosonDirection: "in",
        legs: [
          { direction: "out", fermion: "anti-mu" },
          { direction: "out", slot: 0 },
        ],
      },
    ],
    slotOptions: [["nu_e", "anti-nu_e", "nu_mu", "anti-nu_mu"]],
  },
  {
    id: "kaonDecay",
    before: ["K+"],
    after: ["mu+", "nu_mu"],
    spectators: [],
    vertices: [
      {
        x: 0.5,
        y: 0.35,
        bosonDirection: "out",
        legs: [
          { direction: "in", fermion: "u" },
          { direction: "in", slot: 0 },
        ],
      },
      {
        x: 0.5,
        y: 0.7,
        bosonDirection: "in",
        legs: [
          { direction: "out", fermion: "anti-mu" },
          { direction: "out", fermion: "nu_mu" },
        ],
      },
    ],
    slotOptions: [["anti-u", "anti-d", "anti-s", "s"]],
  },
  {
    id: "electronPositron",
    before: ["e+", "e-"],
    after: ["mu+", "mu-"],
    spectators: [],
    vertices: [
      {
        x: 0.5,
        y: 0.35,
        bosonDirection: "out",
        legs: [
          { direction: "in", fermion: "e" },
          { direction: "in", fermion: "anti-e" },
        ],
      },
      {
        x: 0.5,
        y: 0.7,
        bosonDirection: "in",
        legs: [
          { direction: "out", fermion: "mu" },
          { direction: "out", slot: 0 },
        ],
      },
    ],
    slotOptions: [["anti-e", "anti-mu", "mu", "nu_mu"]],
  },
  {
    id: "deltaDecay",
    before: ["Delta++"],
    after: ["p", "pi+"],
    spectators: ["u", "u"],
    vertices: [
      {
        x: 0.3,
        y: 0.4,
        bosonDirection: "out",
        legs: [
          { direction: "in", fermion: "u" },
          { direction: "out", slot: 0 },
        ],
      },
      {
        x: 0.75,
        y: 0.65,
        bosonDirection: "in",
        legs: [
          { direction: "out", fermion: "d" },
          { direction: "out", slot: 1 },
        ],
      },
    ],
    slotOptions: [
      ["u", "d", "s", "c"],
      ["anti-u", "anti-d", "anti-s", "d"],
    ],
  },
];

export function diagramFor(beforeIds: readonly string[], afterIds: readonly string[]): DiagramTemplate | null {
  const norm = (ids: readonly string[]) => [...ids].sort((x, y) => x.localeCompare(y)).join(" ");
  return (
    DIAGRAMS.find(
      (d) => norm(d.before.map(normalizeId)) === norm(beforeIds) && norm(d.after.map(normalizeId)) === norm(afterIds),
    ) ?? null
  );
}

/** Template ids use readable aliases; compare against catalog ids. */
function normalizeId(id: string): string {
  const aliases: Record<string, string> = { "pi-": "anti-pi+", "e+": "anti-e-", "mu+": "anti-mu-", "K-": "anti-K+" };
  return aliases[id] ?? id;
}

export type VertexCheck = {
  readonly balanced: boolean;
  /** Which rule failed, for the explanation line. */
  readonly problem: "charge" | "baryon" | "lepton" | "flavor" | "boson" | null;
};

/** Resolves a leg to a fermion given the student's slot choices. */
export function legFermion(leg: Leg, choices: readonly string[]): Fermion {
  return fermion("slot" in leg ? (choices[leg.slot] ?? "u") : leg.fermion);
}

/**
 * Checks one vertex. Each fermion leg is converted to "fermion flowing in":
 * an outgoing particle counts as an incoming antiparticle, which turns the
 * conservation check into "everything entering sums to zero".
 */
export function checkVertex(vertex: Vertex, boson: Boson, choices: readonly string[]): VertexCheck {
  const [a, b] = vertex.legs.map((leg) => ({ f: legFermion(leg, choices), sign: leg.direction === "in" ? 1 : -1 }));
  if (!(a && b)) {
    return { balanced: false, problem: "flavor" };
  }
  const bosonSign = vertex.bosonDirection === "in" ? 1 : -1;
  const total = (f: (x: Fermion) => number) => a.sign * f(a.f) + b.sign * f(b.f);
  if (total((x) => x.charge3) + bosonSign * BOSON_CHARGE3[boson] !== 0) {
    return { balanced: false, problem: "charge" };
  }
  if (total((x) => x.baryon3) !== 0) {
    return { balanced: false, problem: "baryon" };
  }
  if (total((x) => x.le) !== 0 || total((x) => x.lmu) !== 0 || total((x) => x.ltau) !== 0) {
    return { balanced: false, problem: "lepton" };
  }
  // Flavour line: the two legs are one fermion line passing through (or a pair
  // created/annihilated), so compare flavours.
  const flavors = [a.f.flavor, b.f.flavor] as const;
  const sameFlavor = flavors[0] === flavors[1];
  const bothQuarks = QUARKS.has(flavors[0]) && QUARKS.has(flavors[1]);
  if (boson === "gamma" || boson === "Z0" || boson === "gluon") {
    if (!sameFlavor) {
      return { balanced: false, problem: "flavor" };
    }
    if (boson === "gluon" && !bothQuarks) {
      return { balanced: false, problem: "boson" };
    }
    if (boson === "gamma" && a.f.charge3 === 0) {
      return { balanced: false, problem: "boson" };
    }
    return { balanced: true, problem: null };
  }
  // W: one up-type and one down-type quark, or a lepton and its own neutrino.
  const doublet = bothQuarks
    ? UP_TYPE.has(flavors[0]) !== UP_TYPE.has(flavors[1])
    : LEPTON_PARTNER.get(flavors[0]) === flavors[1];
  return doublet ? { balanced: true, problem: null } : { balanced: false, problem: "flavor" };
}
