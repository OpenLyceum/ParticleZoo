/**
 * ParticleZooConstants.ts
 *
 * Named constants for the simulation: layout sizes in view pixels and the
 * model's physical parameters.
 *
 * Model units (see doc/model.md):
 *   mass / energy   MeV (or MeV/c²)
 *   length          femtometres (fm) in the confinement model
 *   time            seconds (s)
 *   charge          elementary charge e
 *
 * Layout / chrome values are in screen pixels.
 * Colour strings live in ParticleZooColors.ts; display strings in strings_*.json.
 */

import { Dimension2, Range } from "scenerystack/dot";
import { PhetFont } from "scenerystack/scenery-phet";
import { FLAVOR_DATA } from "./common/model/quarks.js";
import ParticleZooNamespace from "./ParticleZooNamespace.js";

/** Margin (view px) between screen content and the layoutBounds edges. */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius (view px) for every panel. */
export const PANEL_CORNER_RADIUS = 6;

/** Panel margins (px). */
export const PANEL = {
  X_MARGIN: 12,
  Y_MARGIN: 10,
} as const;

/** Shared control dimensions and spacing (px); arrow-button scale is dimensionless. */
export const CONTROLS = {
  THUMB_SIZE: new Dimension2(12, 22),
  STANDALONE_TRACK_SIZE: new Dimension2(150, 3),
  NUMBER_CONTROL_TRACK_SIZE: new Dimension2(110, 3),
  SLIDER_PADDING: 4,
  ARROW_BUTTON_SCALE: 0.75,
  ARROW_BUTTON_SPACING: 3,
  VERTICAL_SPACING: 4,
  CHECKBOX_BOX_WIDTH: 16,
  CHECKBOX_SPACING: 4,
  RADIO_RADIUS: 7,
} as const;

/** Fonts shared across screens (CSS strings) and Preferences (PhetFont). */
export const FONTS = {
  CONTROL: "14px sans-serif",
  CONTROL_BOLD: "bold 14px sans-serif",
  CONTROL_ITALIC: "italic 13px sans-serif",
  PANEL_TITLE: "bold 13px sans-serif",
  READOUT: "15px sans-serif",
  READOUT_BOLD: "bold 15px sans-serif",
  SMALL: "12px sans-serif",
  TICK: "11px sans-serif",
  EQUATION: "bold 30px serif",
  DIAGRAM_LABEL: "bold 18px serif",
  DIAGRAM_TITLE: "bold 14px sans-serif",
  BAG_HINT: "13px sans-serif",
  PALETTE_LABEL: "bold 13px sans-serif",
  PALETTE_SYMBOL: "17px serif",
  MULTIPLET_SYMBOL: "bold 22px serif",
  MULTIPLET_MASS: "12px sans-serif",
  FRAGMENT_LABEL: "bold 26px serif",
  FEEDBACK: "bold 18px sans-serif",
  PREFERENCES_TITLE: new PhetFont({ size: 18, weight: "bold" }),
  PREFERENCES_LABEL: new PhetFont(14),
} as const;

/** Preferences spacing (px). */
export const PREFERENCES_LAYOUT = {
  CONTROL_SPACING: 8,
  SECTION_SPACING: 12,
} as const;

/** Home-screen icon drawing frame (px). */
export const SCREEN_ICONS = {
  WIDTH: 548,
  HEIGHT: 373,
  CONSTITUENT_RADIUS: 43,
} as const;

/** Shared quark-ball defaults (px). */
export const QUARK_NODE = {
  DEFAULT_RADIUS: 20,
} as const;

/** Hadron Builder: bag capacity and colour-exchange animation. */
export const HADRON_BUILDER = {
  /** Max quarks/antiquarks in the bag (dimensionless). */
  BAG_CAPACITY: 3,
  /** Seconds per colour-charge swap when animating. */
  COLOR_PERIOD: 0.9,
  /** Bag outline radius (px). */
  BAG_RADIUS: 150,
  /** Right-column panel width (px). */
  RIGHT_WIDTH: 330,
  /** Gap below the palette before the bag (px). */
  BAG_TOP_GAP: 20,
  /** Gap below the bag before Clear (px). */
  CLEAR_TOP_GAP: 10,
  /** Right-column VBox spacing (px). */
  RIGHT_COLUMN_SPACING: 12,
  /** Constituent ball radius inside the bag (px). */
  CONSTITUENT_RADIUS: 30,
  /** Fraction of bag radius used to spread multiple constituents. */
  CONSTITUENT_SPREAD_FACTOR: 0.42,
  /** Bag outline stroke (px) and dash pattern (px). */
  OUTLINE_LINE_WIDTH: 3,
  OUTLINE_DASH: [10, 6] as const,
  /** Palette tile radius (px) and click-slop (px). */
  TILE_RADIUS: 22,
  CLICK_SLOP: 6,
  /** Palette VBox / HBox spacing (px). */
  PALETTE_V_SPACING: 6,
  PALETTE_H_SPACING: 8,
  /** Spin radio spacing (px). */
  SPIN_RADIO_SPACING: 14,
  /** Readout grid spacing (px). */
  READOUT_X_SPACING: 16,
  READOUT_Y_SPACING: 4,
  READOUT_V_SPACING: 8,
  SPIN_LABEL_SPACING: 4,
} as const;

/** Eightfold Way: mass prediction and multiplet geometry. */
export const EIGHTFOLD = {
  /** Student mass-prediction slider range (MeV/c²). */
  MASS_RANGE: new Range(1500, 1900),
  /** Default predicted mass (MeV/c²). */
  MASS_DEFAULT: 1600,
  /** How close a mass prediction must be to count (MeV/c²). */
  MASS_TOLERANCE: 30,
  /** Predicted-charge spinner range (e). */
  CHARGE_RANGE: new Range(-2, 2),
  /** Mass NumberControl step (MeV/c²). */
  MASS_DELTA: 5,
  /** Right-column panel width (px). */
  RIGHT_WIDTH: 330,
  /** Mass-ladder chart height (px). */
  LADDER_HEIGHT: 170,
  /** Multiplet row height (px per unit of S). */
  ROW_HEIGHT: 105,
  /** Multiplet column width (px per unit of I₃). */
  COLUMN_WIDTH: 92,
  /** Member-circle radius (px). */
  MEMBER_RADIUS: 34,
  /** Mass-ladder plot mass window (MeV/c²). */
  LADDER_MIN_MASS: 1150,
  LADDER_MAX_MASS: 1800,
  /** Predicted / revealed mass markers on the ladder (px). */
  LADDER_MARKER_RADIUS: 6,
  /** Multiplet / year-note / right-column layout (px). */
  MULTIPLET_RADIO_SPACING: 20,
  YEAR_NOTE_TOP_GAP: 6,
  DIAGRAM_TOP_GAP: 24,
  OMEGA_NOTE_INSET: 40,
  RIGHT_COLUMN_SPACING: 10,
  RIGHT_COLUMN_TOP: 10,
  /** Prediction-panel quark picker radius (px). */
  PICKER_RADIUS: 18,
  PICKER_MARGIN: 4,
  PREDICTION_SPACING: 8,
  CHARGE_ROW_SPACING: 10,
  BUTTON_ROW_SPACING: 12,
} as const;

/** Confinement: linear potential, pair-creation threshold, flux-tube view. */
export const CONFINEMENT = {
  /** String tension σ (MeV/fm). ≈ 1 GeV/fm. */
  STRING_TENSION: 1000,
  /** ħc (MeV·fm). */
  HBAR_C: 197.327,
  /** Strong coupling αₛ at hadronic distances (dimensionless). */
  ALPHA_S: 0.3,
  /** Coulomb colour factor 4/3 (dimensionless). */
  COULOMB_FACTOR: 4 / 3,
  /** Separation slider range (fm). */
  SEPARATION_RANGE: new Range(0.25, 1.6),
  /** Starting separation (fm). */
  INITIAL_SEPARATION: 0.4,
  /**
   * Pair-creation threshold (MeV): 2 × u constituent mass + padding.
   * ≈ 680 MeV; the string snaps when V(r) reaches this.
   */
  PAIR_THRESHOLD: 2 * FLAVOR_DATA.u.constituentMass + 8,
  /** Screen pixels per femtometre. */
  PIXELS_PER_FM: 300,
  /** Flux-tube height (px). */
  TUBE_HEIGHT: 26,
  /** Quark ball radius on the stage (px). */
  QUARK_RADIUS: 24,
  /** Separating-meson drift speed after the break (px/s). */
  DRIFT_SPEED: 120,
  /** Drift animation duration (s). */
  DRIFT_TIME: 1.2,
  /** Half-tube length factor after break (× quark radius). */
  BROKEN_HALF_FACTOR: 2.2,
  /** Bound-tube opacity range (dimensionless). */
  TUBE_OPACITY_MIN: 0.35,
  TUBE_OPACITY_RANGE: 0.55,
  BROKEN_TUBE_OPACITY: 0.4,
  /** Fragment label offset below a quark (px). */
  LABEL_TOP_GAP: 12,
  /** Potential-plot V-axis window (MeV). */
  V_MIN: -400,
  V_MAX: 1600,
  /** Potential-plot sampling (fm). */
  CURVE_R_START: 0.05,
  CURVE_R_STEP: 0.01,
  /** Potential / energy-bar layout (px). */
  PLOT_WIDTH: 420,
  PLOT_HEIGHT: 220,
  PLOT_LEFT_PAD: 48,
  PLOT_RIGHT_PAD: 12,
  PLOT_TOP_PAD: 30,
  PLOT_BOTTOM_PAD: 30,
  PLOT_TITLE_INSET: 8,
  PLOT_TITLE_TOP: 6,
  MARKER_RADIUS: 6,
  ENERGY_BAR_WIDTH: 34,
  ENERGY_BAR_HEIGHT: 240,
  ENERGY_BAR_LEFT_INSET: 280,
  ENERGY_BAR_TOP: 60,
  THRESHOLD_OVERHANG: 8,
  /** Screen layout (px). */
  STAGE_X: 250,
  STAGE_Y: 200,
  HINT_LEFT_OFFSET: 40,
  HINT_TOP_OFFSET: 40,
  HINT_OPACITY: 0.75,
  SLIDER_TRACK_WIDTH: 260,
  SLIDER_KEYBOARD_STEP: 0.05,
  SLIDER_ROW_TOP_GAP: 70,
  SLIDER_ROW_SPACING: 14,
  PRESET_RADIO_SPACING: 18,
  CONTROLS_SPACING: 8,
  REPORT_LINE_WRAP: 380,
  REPORT_GAP: 30,
  REPORT_TOP_INSET: 10,
  REPORT_BOX_SPACING: 10,
} as const;

/** Reaction Court: reaction side limits and diagram / palette layout. */
export const REACTION_COURT = {
  /** Max particles before / after the arrow (dimensionless). */
  MAX_BEFORE: 2,
  MAX_AFTER: 4,
  /** Right-column panel width (px). */
  RIGHT_WIDTH: 360,
  /** Palette grid (px). */
  PALETTE_COLUMNS: 9,
  PALETTE_CELL: 46,
  PALETTE_CELL_HEIGHT_INSET: 8,
  PALETTE_SYMBOL_INSET: 6,
  PALETTE_BUTTON_X_MARGIN: 2,
  PALETTE_GRID_SPACING: 5,
  /** Top-row / equation / right-column layout (px). */
  TOP_ROW_SPACING: 16,
  SIDE_RADIO_SPACING: 12,
  ADD_TO_SPACING: 8,
  EQUATION_LEFT_INSET: 6,
  EQUATION_TOP_GAP: 18,
  PALETTE_TOP_GAP: 80,
  RIGHT_COLUMN_SPACING: 10,
  DIAGRAM_BUTTON_MAX_WIDTH: 260,
  PRESET_MAX_WIDTH: 220,
  LABEL_MAX_WIDTH: 160,
  /** Equation node (px). */
  EQUATION_SPACING: 10,
  EQUATION_TOKEN_SPACING: 8,
  EQUATION_UNDERLINE_WIDTH: 3,
  /** Vertex-diagram geometry (px). */
  DIAGRAM_TITLE_LEFT: 10,
  DIAGRAM_TITLE_TOP: 8,
  DIAGRAM_HINT_TOP: 30,
  DIAGRAM_BOX_LEFT: 70,
  DIAGRAM_BOX_RIGHT_INSET: 40,
  DIAGRAM_BOX_TOP: 80,
  DIAGRAM_BOX_BOTTOM_INSET: 70,
  DIAGRAM_BLANK_X_MARGIN: 6,
  DIAGRAM_BLANK_Y_MARGIN: 2,
  DIAGRAM_LINE_WIDTH: 2.5,
  DIAGRAM_VERTEX_RADIUS: 9,
  DIAGRAM_TIME_ARROW_X: 30,
  DIAGRAM_STATUS_SPACING: 2,
  DIAGRAM_STATUS_BOTTOM_INSET: 8,
  /** Boson wavy/coiled stroke (px). */
  PHOTON_AMPLITUDE: 5,
  PHOTON_WAVELENGTH: 14,
  GLUON_AMPLITUDE: 7,
  GLUON_WAVELENGTH: 12,
  BOSON_MIN_STEPS: 8,
  LABEL_END_GAP: 4,
} as const;

ParticleZooNamespace.register("ParticleZooConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PANEL,
  CONTROLS,
  FONTS,
  PREFERENCES_LAYOUT,
  SCREEN_ICONS,
  QUARK_NODE,
  HADRON_BUILDER,
  EIGHTFOLD,
  CONFINEMENT,
  REACTION_COURT,
});
