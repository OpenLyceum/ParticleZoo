/**
 * richSymbol.ts
 *
 * Particle symbols are stored as plain Unicode, with "_x" marking a
 * subscript that Unicode cannot express (ν_μ, D_s⁺, Λ_c⁺). This converts
 * them to RichText markup: ν<sub>μ</sub>.
 */

export function richSymbol(symbol: string): string {
  return symbol.replace(/_([^⁺⁻⁰\s]+)/g, "<sub>$1</sub>");
}
