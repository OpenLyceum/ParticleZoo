/**
 * formatting.ts
 *
 * Number formatting shared by the screens: scientific notation with Unicode
 * superscripts (2.6 × 10⁻⁸), which reads correctly in every locale and font.
 */

const SUPERSCRIPTS: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

export function superscript(value: number): string {
  return [...`${value}`].map((ch) => SUPERSCRIPTS[ch] ?? ch).join("");
}

/** 2.603e-8 → "2.6 × 10⁻⁸"; values between 0.01 and 10 000 stay plain. */
export function formatScientific(value: number, significant = 2): string {
  if (value === 0) {
    return "0";
  }
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  if (exponent >= -2 && exponent <= 4) {
    return `${Number(value.toPrecision(significant + Math.max(0, exponent)))}`;
  }
  const mantissa = Number((value / 10 ** exponent).toPrecision(significant));
  return mantissa === 1 ? `10${superscript(exponent)}` : `${mantissa} × 10${superscript(exponent)}`;
}
