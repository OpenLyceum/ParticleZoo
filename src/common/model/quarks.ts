/**
 * quarks.ts
 *
 * The five quark flavours students can build with (top is omitted: it decays
 * before it can form a hadron), and their antiquarks.
 *
 * Charges and baryon numbers are stored in thirds, as integers, so sums stay
 * exact: a proton's uud adds to charge 3/3 = 1 and baryon number 3/3 = 1.
 */

export const FLAVORS = ["u", "d", "s", "c", "b"] as const;
export type Flavor = (typeof FLAVORS)[number];

export type Quark = {
  readonly flavor: Flavor;
  readonly anti: boolean;
};

export type FlavorData = {
  /** Electric charge in units of e/3. */
  readonly charge3: number;
  /** Constituent mass, MeV/c² (the effective mass inside a hadron). */
  readonly constituentMass: number;
  /** Strangeness, charm and beauty carried by the quark (not the antiquark). */
  readonly strangeness: number;
  readonly charm: number;
  readonly beauty: number;
};

/**
 * Quark properties. Strangeness is −1 for s by convention (and beauty −1 for
 * b); charm is +1 for c.
 */
export const FLAVOR_DATA: Readonly<Record<Flavor, FlavorData>> = {
  u: { charge3: 2, constituentMass: 336, strangeness: 0, charm: 0, beauty: 0 },
  d: { charge3: -1, constituentMass: 340, strangeness: 0, charm: 0, beauty: 0 },
  s: { charge3: -1, constituentMass: 486, strangeness: -1, charm: 0, beauty: 0 },
  c: { charge3: 2, constituentMass: 1550, strangeness: 0, charm: 1, beauty: 0 },
  b: { charge3: -1, constituentMass: 4730, strangeness: 0, charm: 0, beauty: -1 },
};

export function quark(flavor: Flavor, anti = false): Quark {
  return { flavor, anti };
}

/** Symbol with a combining overline for antiquarks, e.g. "s̄". */
export function quarkSymbol(q: Quark): string {
  return q.anti ? `${q.flavor}̄` : q.flavor;
}

/** Parses compact content strings: lowercase = quark, uppercase = antiquark ("uS" is u s̄). */
export function parseContent(content: string): Quark[] {
  return [...content].map((ch) => {
    const flavor = ch.toLowerCase() as Flavor;
    if (!FLAVORS.includes(flavor)) {
      throw new Error(`parseContent: unknown quark ${ch}`);
    }
    return quark(flavor, ch !== flavor);
  });
}

/** Canonical key for a multiset of quarks, independent of order. */
export function contentKey(quarks: readonly Quark[]): string {
  return quarks
    .map((q) => (q.anti ? q.flavor.toUpperCase() : q.flavor))
    .sort()
    .join("");
}

/** Combined quantum numbers of a set of quarks. */
export type QuarkSums = {
  readonly charge3: number;
  readonly baryon3: number;
  readonly strangeness: number;
  readonly charm: number;
  readonly beauty: number;
};

export function sumQuarks(quarks: readonly Quark[]): QuarkSums {
  let charge3 = 0;
  let baryon3 = 0;
  let strangeness = 0;
  let charm = 0;
  let beauty = 0;
  for (const q of quarks) {
    const data = FLAVOR_DATA[q.flavor];
    const sign = q.anti ? -1 : 1;
    charge3 += sign * data.charge3;
    baryon3 += sign;
    strangeness += sign * data.strangeness;
    charm += sign * data.charm;
    beauty += sign * data.beauty;
  }
  // "+ 0" normalises −0 (an antiquark's zero strangeness) to 0.
  return {
    charge3: charge3 + 0,
    baryon3: baryon3 + 0,
    strangeness: strangeness + 0,
    charm: charm + 0,
    beauty: beauty + 0,
  };
}

/**
 * Colour neutrality. With at most three constituents, the colour singlets are
 * qqq (red + green + blue), q̄q̄q̄ (the anticolours) and qq̄ (colour + its
 * anticolour). Anything else (q, qq, qqq̄, …) carries net colour and cannot
 * exist on its own.
 */
export function isColorNeutral(quarks: readonly Quark[]): boolean {
  const antis = quarks.filter((q) => q.anti).length;
  const normals = quarks.length - antis;
  return (normals === 3 && antis === 0) || (antis === 3 && normals === 0) || (normals === 1 && antis === 1);
}

/**
 * Allowed total spins (in units of ħ/2, so 1 means ½) for spin-½ constituents
 * with no orbital angular momentum: qq̄ → 0 or 1; qqq → ½ or 3/2.
 */
export function allowedSpins2(count: number): number[] {
  if (count === 2) {
    return [0, 2];
  }
  if (count === 3) {
    return [1, 3];
  }
  return count === 1 ? [1] : [];
}

/** Formats a value stored in thirds: 3 → "+1", −1 → "−1/3", 0 → "0". */
export function formatThirds(value3: number): string {
  if (value3 === 0) {
    return "0";
  }
  const sign = value3 > 0 ? "+" : "−";
  const magnitude = Math.abs(value3);
  return magnitude % 3 === 0 ? `${sign}${magnitude / 3}` : `${sign}${magnitude}/3`;
}

/** Formats a signed integer with a true minus sign. */
export function formatSigned(value: number): string {
  return value === 0 ? "0" : value > 0 ? `+${value}` : `−${-value}`;
}
