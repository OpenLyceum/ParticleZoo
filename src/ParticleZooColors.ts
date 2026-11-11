/**
 * ParticleZooColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import ParticleZooColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import ParticleZooColors from "../../ParticleZooColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: ParticleZooColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the ParticleZooColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import ParticleZooNamespace from "./ParticleZooNamespace.js";

const ParticleZooColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(ParticleZooNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(ParticleZooNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(ParticleZooNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(ParticleZooNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(ParticleZooNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(ParticleZooNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(ParticleZooNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(ParticleZooNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  // ── Quarks and colour charge ───────────────────────────────────────────────
  colorRedProperty: new ProfileColorProperty(ParticleZooNamespace, "colorRed", {
    default: "#ef5350",
    projector: "#d32f2f",
  }),
  colorGreenProperty: new ProfileColorProperty(ParticleZooNamespace, "colorGreen", {
    default: "#66bb6a",
    projector: "#2e7d32",
  }),
  colorBlueProperty: new ProfileColorProperty(ParticleZooNamespace, "colorBlue", {
    default: "#42a5f5",
    projector: "#1565c0",
  }),
  /** Anticolours are drawn as the complements: cyan, magenta, yellow. */
  antiRedProperty: new ProfileColorProperty(ParticleZooNamespace, "antiRed", {
    default: "#4dd0e1",
    projector: "#00838f",
  }),
  antiGreenProperty: new ProfileColorProperty(ParticleZooNamespace, "antiGreen", {
    default: "#ce93d8",
    projector: "#8e24aa",
  }),
  antiBlueProperty: new ProfileColorProperty(ParticleZooNamespace, "antiBlue", {
    default: "#ffd54f",
    projector: "#f9a825",
  }),
  quarkTileProperty: new ProfileColorProperty(ParticleZooNamespace, "quarkTile", {
    default: "#e8eaf6",
    projector: "#e8eaf6",
  }),
  antiquarkTileProperty: new ProfileColorProperty(ParticleZooNamespace, "antiquarkTile", {
    default: "#37474f",
    projector: "#455a64",
  }),
  quarkLabelProperty: new ProfileColorProperty(ParticleZooNamespace, "quarkLabel", {
    default: "#1a1a2e",
    projector: "#1a1a2e",
  }),
  antiquarkLabelProperty: new ProfileColorProperty(ParticleZooNamespace, "antiquarkLabel", {
    default: "#ffffff",
    projector: "#ffffff",
  }),
  bagFillProperty: new ProfileColorProperty(ParticleZooNamespace, "bagFill", {
    default: "rgba(255,255,255,0.05)",
    projector: "rgba(0,0,0,0.04)",
  }),
  bagStrokeProperty: new ProfileColorProperty(ParticleZooNamespace, "bagStroke", {
    default: "#7986cb",
    projector: "#3949ab",
  }),
  /** Verdict colours: allowed / forbidden, neutral / net colour. */
  goodProperty: new ProfileColorProperty(ParticleZooNamespace, "good", { default: "#81c784", projector: "#2e7d32" }),
  badProperty: new ProfileColorProperty(ParticleZooNamespace, "bad", { default: "#e57373", projector: "#c62828" }),
  highlightProperty: new ProfileColorProperty(ParticleZooNamespace, "highlight", {
    default: "#ffd54f",
    projector: "#b26a00",
  }),
};

export default ParticleZooColors;
