/**
 * particleZooQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) must set `public: true`.
 *
 * ── How to add a query parameter ──────────────────────────────────────────────
 * 1. Add an entry below with a `type`, `defaultValue`, and (if user-facing)
 *    `public: true`. Add `isValidValue` to bound numeric ranges.
 * 2. If it should also be user-editable at runtime, surface it as a preference
 *    in ParticleZooPreferencesModel (initialize that Property from this query parameter).
 *
 * Usage: append e.g. `?animateColorCharge=false` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import ParticleZooNamespace from "../ParticleZooNamespace.js";

const particleZooQueryParameters = QueryStringMachine.getAll({
  /**
   * Cycle the colour charges of the quarks in the Hadron Builder bag (gluon exchange). Turn off for reduced motion.
   */
  animateColorCharge: {
    type: "boolean",
    defaultValue: true,
    public: true,
  },
});

ParticleZooNamespace.register("particleZooQueryParameters", particleZooQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default particleZooQueryParameters;
