# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Moose2Model2 is a client-side web application for visualizing software architecture as circuit-diagram-like diagrams. It renders SOMIX models in the browser using HTML5 Canvas. No server communication — runs entirely locally. Requires Chromium-based browsers (File System Access API).

Website: www.moose2model.org | SOMIX models created via www.sap2moose.org

## Development

**No build system, no package manager, no bundler.** Pure vanilla JavaScript (ES6+, strict mode) with zero external dependencies. jQuery was removed in recent updates.

**To run:** Open `src/moose2model.html` in a Chromium-based browser, either from a local file or served statically.

**To test:** No automated test framework. Manual browser testing only. Test data lives in `test/Test.mse`.

**Script versioning:** All `<script>` tags in `moose2model.html` use a `?v=XX` query parameter for cache busting. Increment this when changing JS files.

## Architecture

### Data Flow

1. **Load**: `HTMLLogic.js:LoadModel()` reads an MSE file from disk
2. **Parse**: `AnalyzeMseFile.js:analyzeMseFile()` parses SOMIX format into global data structures
3. **Initialize**: `Diagrams.js:useStartDiagram()` creates the initial diagram
4. **Render**: `Drawing.js:draw()` renders everything to an HTML5 Canvas
5. **Interact**: User actions handled by `Click.js`, `Drag.js`, `ContextMenu.js`, `MouseWheel.js`
6. **Layout**: `ForceDirecting.js` (physics-based) and `AutoLayout.js` (compact) position elements

### Global State (Global.js)

All model data lives in global structures:
- `modelElementsByUniqueKey` / `modelElementsByIndex` — element storage
- `parentChildByParent[]` / `parentChildByChild[]` — hierarchy
- `callByCaller[]` / `callByCalled[]` — call relationships
- `accessByAccessor[]` / `accessByAccessed[]` — access relationships

### Diagram System (Diagrams.js)

- `diagramms{}` — all diagrams with positions, visibility, layout state
- Diagram types: complete (`'A'`), circuit (`'C'`), bullet point (`'B'`)
- Diagrams are saved/loaded as `.m2m` files in the `models/` directory

### Key Modules

| File | Responsibility |
|------|---------------|
| `Global.js` | Global state, model metadata, canvas management |
| `Diagrams.js` | Diagram CRUD, switching, persistence |
| `Drawing.js` | Canvas rendering engine (largest file ~91KB) |
| `PositionElements.js` | Element positioning, camera, zoom/pan |
| `ForceDirecting.js` | Force-directed graph layout algorithm |
| `AnalyzeMseFile.js` | MSE/SOMIX file parser (state machine) |
| `HTMLLogic.js` | File I/O, UI logic, export functions |
| `ExtractCodeFromFiles.js` | JavaScript file → SOMIX model extraction |
| `ContextMenu.js` | Right-click menu and element operations |
| `Colors.js` | Dark/white theme management via CSS variables |
| `ExampleInternal.js` | Hardcoded demo model data (~422KB) |

### Data Formats

- **MSE** — SOMIX model files (parenthetical nesting format with types like `SOMIX.Grouping`, `SOMIX.Code`, `SOMIX.Call`, etc.)
- **M2M** — Diagram layout/position files
- **JSON** — AI-readable export format (recent feature)

## Agent Behavior

- Do not assume user intent – ask or state assumptions
- Do not refactor large code sections without explicit instruction
- Make incremental, minimal changes only

- Only modify files that are explicitly mentioned
- Do not introduce new dependencies without explicit approval
- Explain the intention and impact before applying changes
- Do not change existing behavior unless explicitly requested
- Prefer explicit, simple solutions over abstractions
- Avoid hidden side effects
- If unsure, stop and ask instead of proceeding
