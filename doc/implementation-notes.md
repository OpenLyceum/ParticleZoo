# Particle Zoo — implementation notes

Architecture and decisions; the physics is in [model.md](model.md).

## Layout

```
src/
  ParticleZoo{Colors,Constants,Namespace}.ts
  common/model/quarks.ts, particleCatalog.ts, formatting.ts
  common/view/QuarkNode.ts, richSymbol.ts
  hadron-builder/   model/HadronBuilderModel.ts; view/BagNode, QuarkPaletteNode, HadronReadoutPanel, HadronResultPanel
  eightfold-way/    model/EightfoldWayModel.ts; view/MultipletDiagramNode, MassLadderNode, PredictionPanel
  confinement/      model/ConfinementModel.ts; view/FluxTubeNode, EnergyBarNode, PotentialPlotNode
  reaction-court/   model/reactionRules.ts, vertexDiagrams.ts, ReactionCourtModel.ts;
                    view/ParticlePaletteNode, ReactionEquationNode, LedgerPanel, VerdictPanel,
                    VertexDiagramNode, courtStrings.ts
```

## Decisions

- **Symbols.** Particle symbols are Unicode; `_x` marks a subscript Unicode lacks (ν_μ, Λ_c⁺) and
  `richSymbol()` turns it into RichText `<sub>`. Antiquark letters in `QuarkNode` get a drawn bar,
  not a combining overline, so they render in every font.
- **Drag and click.** Quark tiles add on a click (DragListener end with < 6 px of travel) or a drop
  inside the bag; the PDOM `click` covers the keyboard. Bag constituents remove on click.
- **Confinement slider.** The separation Property's range is narrowed to the breaking point, and the
  slider uses `enabledRangeProperty`; reaching the end snaps the string. This avoids writing back to
  the slider's Property from inside its own listener (an assertion-mode re-entry error).
- **Persistent drag target.** The antiquark node is rebuilt only when the preset changes, never
  during a drag, so pointer and keyboard drags are not interrupted.
- **Reaction Court menu.** The preset combo box and the reaction update each other; a flag breaks the
  loop. Vertex-diagram blanks are rebuilt on each change and restore focus to the same blank.
- **Disposal.** Diagram, plot and quark nodes dispose their multilinks and subtrees;
  `tests/memory-leak.test.ts` covers them.
