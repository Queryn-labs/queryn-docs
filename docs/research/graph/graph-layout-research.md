---
authority: informational
lifecycle: archived
---

# Graph Layout Algorithm Research Report

## For: Knowledge Graph in a Note-Taking App

### Problem Definition

We need a layout for a **compound graph** — a graph that has two simultaneous structures:

1. **Containment hierarchy** (folders → sub-folders → notes)
2. **Link topology** (wiki-links between notes, potentially crossing folder boundaries)

This is formally known as a **compound graph** or **clustered graph** layout problem. Most layout algorithms handle EITHER hierarchy OR graph topology, not both. The core challenge is finding an approach that respects both.

---

## Requirements Checklist

| Requirement | Description |
|---|---|
| Deterministic | Same data + same code = same layout (no randomness between runs) |
| Viewport-fit | Entire graph visible without zoom for overview |
| Folder grouping | Notes in same folder are visually close |
| Intra-folder links | Wiki-links between notes in same folder are visible |
| Cross-folder links | Wiki-links across folders visible without clutter |
| Scalability | Must handle 10–500 notes gracefully |
| Folder structure adaptivity | Must handle flat (0 folders), 1-level, nested (3+ levels), mixed |

---

## Detailed Analysis of Each Approach

### 1. Force-Directed (Fruchterman-Reingold, ForceAtlas2, d3-force)

**Algorithms:**
- **Fruchterman-Reingold (1991)**: Spring-electrical model. Attractive force on edges, repulsive force on all node pairs. O(n²) naive, O(n²/m) with grid variant. Classic, well-understood.
- **ForceAtlas2 (Jacomy et al., 2012)**: Designed for Gephi. Improvements: linRepulsion mode (linear repulsion for better cluster separation), strongGravity, anti-collision, adjustable edge weight influence. O(n log n) with Barnes-Hut. Prevents jitter via "adjustSizes" and "lint" modes. Published in PLoS ONE.
- **d3-force (Bostock)**: Velocity Verlet integrator. O(n log n) via Barnes-Hut quadtree. **Uses a fixed-seed linear congruential generator (LCG) by default** — meaning it IS deterministic out of the box. Initial positions use a phyllotaxis arrangement (deterministic spiral) when x/y are NaN. Can run as static layout via `simulation.stop()` + `simulation.tick(n)`.

**Folder structure handling:**
| Structure | Handling |
|---|---|
| Flat (0 folders) | Excellent — pure graph layout, this is the native use case |
| 1-level | Good WITH modification: add custom cluster force (pull nodes toward folder centroid) using `forceX`/`forceY`. Without modification, folders are ignored |
| Nested (3+ levels) | Poor — multi-level clustering forces are complex to tune. No visual boundary for folder containment |
| Mixed | Moderate — workable with careful force tuning |

**Scaling:**
| Notes | Performance | Quality |
|---|---|---|
| 10 | Instant, <50ms | Excellent, clear structure |
| 50 | <100ms (300 ticks) | Good, clusters form naturally |
| 100 | ~200ms (300 ticks) | Moderate — starts to look like a hairball without clustering forces |
| 500 | ~1-2s, needs Web Worker | Poor — hairball, nodes overlap, links unreadable without clustering |

**Link visibility:**
- Intra-folder links: Visible IF folder blobs are compact (need cluster forces). Without clustering, no folder awareness.
- Cross-folder links: Visible but can be long and crossing. No edge routing. At 100+ notes, becomes spaghetti.

**Deterministic**: YES (with caveats)
- d3-force: Deterministic by default (fixed-seed LCG + phyllotaxis init). **Must run fixed tick count** (e.g., `simulation.tick(300)`) and **must not use `Math.random()`** anywhere in custom forces. Node array order must be stable.
- Fruchterman-Reingold: Deterministic if initial positions are deterministic (e.g., place on circle by sorted index).
- ForceAtlas2: Deterministic if initialized deterministically. JS implementation: `graphology-layout-forceatlas2`.
- **Risk**: Floating-point non-determinism across browsers/platforms is theoretically possible but negligible in practice.

**Viewport fit**: Moderate. Force-directed layouts produce coordinates in arbitrary ranges. Must post-process: compute bounding box, scale + translate to fit viewport. Aspect ratio may not match viewport — letterboxing or stretching needed.

**Implementation complexity**: Medium
- d3-force: Well-documented, ~30 lines for basic setup. Custom cluster force: ~20-50 lines.
- ForceAtlas2: Use `graphology-layout-forceatlas2` npm package. ~15 lines.
- Key d3-force parameters:
  ```js
  simulation
    .alphaDecay(0.05)        // faster convergence (~140 ticks vs default 300)
    .velocityDecay(0.4)      // default friction
    .alphaMin(0.001)         // stopping threshold
    .force("charge", d3.forceManyBody().strength(-30).theta(0.9))
    .force("link", d3.forceLink(links).distance(30).strength(0.1))
    .force("collide", d3.forceCollide().radius(nodeRadius))
    .force("x", d3.forceX(folderCentroidX).strength(0.1))  // cluster force
    .force("y", d3.forceY(folderCentroidY).strength(0.1))  // cluster force
  // Run as static:
  simulation.stop();
  simulation.tick(300);  // fixed tick count for determinism
  ```

**Pros:**
- Shows graph structure naturally — the primary strength
- Handles arbitrary topologies (cycles, disconnected components, any link pattern)
- Aesthetic, organic-looking results
- Good library support (d3-force, graphology, ForceAtlas2)
- Can be made deterministic

**Cons:**
- Ignores folder structure by default (needs significant modification)
- Hairball at scale (100+ notes) even with clustering
- No visual folder boundaries — folders are implicit blobs, not explicit regions
- Cross-folder links are uncontrolled — can cross the entire canvas
- Non-deterministic by default in many implementations (must explicitly fix)
- Convergence time grows with graph size

---

### 2. Hierarchical / Sugiyama (Layered DAG)

**Algorithm:** Sugiyama framework (1981) — 4-stage approach:
1. Cycle removal (reverses back-edges, loses information)
2. Layer assignment (assigns nodes to horizontal levels)
3. Crossing reduction (minimizes edge crossings via barycenter heuristic)
4. Coordinate assignment (x/y positioning)

**Libraries:** `dagre` / `dagre-d3` (JS), `elkjs` (Eclipse Layout Kernel, JS bindings), `d3-dag`

**Folder structure handling:**
| Structure | Handling |
|---|---|
| Flat (0 folders) | Fails — no hierarchy to layer. All notes in one row or topological sort of links |
| 1-level | Moderate — folders as layers, but folder order is arbitrary, notes within folder may spread across layers |
| Nested (3+ levels) | Good — hierarchy maps naturally to layers |
| Mixed | Moderate |

**Scaling:**
| Notes | Performance | Quality |
|---|---|---|
| 10 | Fast | OK for DAG-like link structure |
| 50 | Fast | Moderate — layout gets wide |
| 100 | Moderate | Poor — very wide, many layers, viewport overflow |
| 500 | Slow (O(n·e) crossing reduction) | Fails — extremely wide/tall, doesn't fit viewport |

**Link visibility:**
- Intra-folder links: Only if notes in same folder happen to be on same layer — often they're NOT, because layering is based on link topology, not folder membership
- Cross-folder links: Visible but may route through many layers. Long vertical edges.

**Deterministic**: YES — Sugiyama is a deterministic algorithm. Crossing reduction uses barycenter heuristic which is deterministic given stable node ordering. Sort nodes by ID before processing for full determinism.

**Viewport fit**: POOR at scale. Layered layouts grow horizontally with max layer width and vertically with layer count. A 500-note graph with 20 folders would be extremely wide. No way to fit without zoom.

**Implementation complexity**: HIGH
- Sugiyama is one of the most complex layout algorithms (4 stages, each non-trivial)
- Use `dagre` (JS) or `elkjs` — but configuration is complex
- Cycle removal is needed because wiki-links are often cyclic (A→B→C→A)

**Critical problem**: Wiki-links are **undirected in practice** (a link from A to B is a navigational link, not a directed dependency). Sugiyama requires a DAG — it must remove cycles by reversing edges, which **loses information** and produces arbitrary edge directions. This is a fundamental mismatch.

**Pros:**
- Clear hierarchical structure when data is truly layered
- Deterministic
- Good library support (dagre, elkjs)

**Cons:**
- Wiki-links are cyclic — requires destructive cycle removal
- Folder membership doesn't determine layering — notes in same folder spread across layers
- Poor viewport fit at scale (grows linearly with max layer size)
- Complex to implement and configure
- Doesn't show folder containment (only link-based hierarchy)
- Fails completely for flat structures (0 folders)

---

### 3. Circular / Radial (Concentric Circles)

**Approach:** Place nodes on concentric circles. Folders as sectors (pie slices) or as different rings.

**Variants:**
- **Sector-based**: Each folder is an angular sector. Notes within folder placed on an arc at radius proportional to... something (degree, folder depth).
- **Ring-based**: Each folder depth level is a ring. Root in center, level-1 folders on ring 1, etc.
- **Radial tree**: `d3.tree()` with radial projection — tree laid out radially.

**Folder structure handling:**
| Structure | Handling |
|---|---|
| Flat (0 folders) | Poor — all notes on one circle, no structure |
| 1-level | Good — folders as sectors, notes on arcs within each sector |
| Nested (3+ levels) | Moderate — inner rings for inner folders, but arcs get thin and crowded |
| Mixed | Moderate |

**Scaling:**
| Notes | Performance | Quality |
|---|---|---|
| 10 | Instant | Excellent — clear, compact |
| 50 | Instant | Good — sectors are readable |
| 100 | Instant | Moderate — arc segments get small, labels may overlap |
| 500 | Instant | Poor — individual arcs too thin, labels unreadable, but geometrically fits |

**Link visibility:**
- Intra-folder links: Visible — notes in same sector are close, short edges
- Cross-folder links: Visible as chords across the circle. **Can be very cluttered** — all cross-folder links pass through the center area. Edge bundling helps but adds complexity.

**Deterministic**: YES — placement is purely trigonometric: `angle = sectorStart + (i / n) * sectorWidth`, `x = cos(angle) * radius`, `y = sin(angle) * radius`. Fully deterministic given stable sort order.

**Viewport fit**: EXCELLENT — always fits in a circle. Scale radius to min(viewportW, viewportH) / 2. Perfectly contained.

**Implementation complexity**: LOW-MEDIUM
- Custom trigonometry, ~50 lines
- d3 doesn't have built-in radial sector layout, but `d3.tree().size([2π, radius])` + radial projection gives radial tree
- Edge bundling for cross-folder links adds significant complexity

**Pros:**
- Always fits viewport (circular bound)
- Fully deterministic
- Compact and aesthetic for small-medium graphs
- Folders as sectors is intuitive
- O(n) computation — fastest of all approaches

**Cons:**
- Cross-folder links become spaghetti (all pass through center)
- Doesn't handle nested folders well (rings get thin)
- Notes within a folder are on a 1D arc, not 2D — wastes space, labels overlap
- Center of circle is wasted (or used for root folder only)
- No edge routing — links are straight chords
- Fails for flat structure (no sectors to define)

---

### 4. Treemap / Pack (Nested Circles/Rectangles)

**Algorithms:**
- **d3.treemap()**: Recursive rectangular subdivision. Squarified treemap (Bruls et al., 2000) by default. Space-efficient. Deterministic given sorted input.
- **d3.pack()**: Circle packing using front-chain packing (Wang et al.) + smallest enclosing circle (Matoušek-Sharir-Welzl). Nested circles show hierarchy via containment. Less space-efficient than treemap but more visually clear hierarchy.
- **Pack with explicit radii**: `pack.radius(accessor)` lets you set exact node radii.

**Folder structure handling:**
| Structure | Handling |
|---|---|
| Flat (0 folders) | Poor — single cell containing all notes, no structure. Just a packed blob. |
| 1-level | Excellent — each folder is a cell/circle, notes packed within |
| Nested (3+ levels) | Excellent — recursive nesting is the native use case |
| Mixed | Excellent |

**Scaling:**
| Notes | Performance | Quality |
|---|---|---|
| 10 | Instant | Good — clear cells |
| 50 | Instant | Good — space-efficient |
| 100 | Instant | Good — still readable |
| 500 | Instant | Moderate — cells get tiny but structure is preserved |

**Link visibility:**
- Intra-folder links: **NO** — notes are packed tightly in a cell. Links between them would be very short and completely overlap with the packing. Cannot draw meaningful edges.
- Cross-folder links: **POOR** — links between cells would cross cell boundaries. No edge routing. Would look like random lines over the treemap. Completely loses the clean hierarchy visualization.

**Deterministic**: YES — d3.treemap and d3.pack are deterministic. Must sort input consistently (`root.sort()` with stable comparator) for reproducible layouts.

**Viewport fit**: EXCELLENT — treemap fills `[width, height]` exactly. Pack fits within `[width, height]` with some wasted space at edges.

**Implementation complexity**: LOW
```js
// Treemap
const treemap = d3.treemap()
  .size([width, height])
  .padding(4)        // padding between cells
  .paddingInner(2)   // padding within cells
  .round(true);      // round to integers
const root = d3.hierarchy(folderTree)
  .sum(d => d.type === 'note' ? 1 : 0)
  .sort((a, b) => b.value - a.value);
treemap(root);

// Pack
const pack = d3.pack()
  .size([width, height])
  .padding(3);
const root = d3.hierarchy(folderTree)
  .sum(d => d.type === 'note' ? 1 : 0);
pack(root);
```

**Pros:**
- Perfect folder hierarchy visualization — this is literally what it's designed for
- Fully deterministic
- Space-efficient (treemap) or aesthetically clear (pack)
- Handles nested folders perfectly (recursive)
- Always fits viewport exactly
- Shows folder sizes (proportional to note count)
- O(n) — very fast
- Mature, well-documented implementations

**Cons:**
- **NO GRAPH STRUCTURE VISIBILITY** — this is a hierarchy-only layout. Wiki-links between notes cannot be meaningfully overlaid. This is the fatal flaw for this use case.
- Cross-folder links would destroy the clean visual
- Notes within a folder are packed, not positioned by graph structure
- Fails for flat structure (0 folders — just a blob)

**Verdict**: Excellent for showing folder structure, but **fundamentally incompatible** with showing wiki-links. Only usable if links are dropped or shown in a separate view.

---

### 5. Sankey / Flow (Columns with Flows)

**Algorithm:** d3-sankey. Nodes in vertical columns, flows as curved bands between columns. Width of flows encodes quantity.

**Folder structure handling:**
| Structure | Handling |
|---|---|
| Flat (0 folders) | Fails — no columns to organize |
| 1-level | Moderate — folders as columns, but column order is arbitrary (which folder is left vs right?) |
| Nested (3+ levels) | Poor — multi-level nesting doesn't map to columns |
| Mixed | Poor |

**Scaling:**
| Notes | Performance | Quality |
|---|---|---|
| 10 | Fast | OK |
| 50 | Fast | Moderate — columns get tall |
| 100 | Moderate | Poor — very tall columns |
| 500 | Moderate | Fails — extremely tall, flows become thin lines |

**Link visibility:**
- Intra-folder links: **NOT shown** — Sankey shows flows BETWEEN columns, not within. Links between notes in the same folder (same column) are invisible.
- Cross-folder links: YES — this is Sankey's strength. Flows between columns are clear and bundled. But only shows aggregate flows between folders, not individual note-to-note links.

**Deterministic**: YES — d3-sankey is deterministic given stable node ordering and sort.

**Viewport fit**: Moderate. Sankey tends to be wide (many columns) and tall (many nodes per column). Can scale to fit but aspect ratio often doesn't match viewport.

**Implementation complexity**: Medium. `d3-sankey` package. Need to define column assignment (folder → column) and link aggregation.

**Pros:**
- Shows cross-folder link flow clearly
- Deterministic
- Good for showing aggregate relationships between groups

**Cons:**
- **Loses intra-folder links entirely** — same-folder links are invisible
- Folder column order is arbitrary (no natural left-to-right ordering)
- Doesn't handle nested folders
- Not a true graph visualization — it's a flow diagram
- Notes within a column are just stacked, no graph structure within folders
- Fails for flat structure
- Individual note-to-note links are lost (only aggregate flows shown)

---

### 6. Grid / Lattice (Sorted Grid)

**Approach:** Group notes by folder, place folders in grid blocks, notes in sub-grids within blocks. Essentially a treemap with uniform cell sizes.

**Folder structure handling:**
| Structure | Handling |
|---|---|
| Flat (0 folders) | OK — grid of all notes, sorted alphabetically |
| 1-level | Good — folders as grid blocks |
| Nested (3+ levels) | OK — recursive grid (nested blocks) |
| Mixed | OK |

**Scaling:**
| Notes | Performance | Quality |
|---|---|---|
| 10 | Instant | Good |
| 50 | Instant | Good |
| 100 | Instant | Good |
| 500 | Instant | Moderate — cells small but structured |

**Link visibility:**
- Intra-folder links: POOR — notes in grid block are adjacent, but links between them overlap cells. Only visible for notes in same row/column.
- Cross-folder links: POOR — straight lines across grid, messy, no routing.

**Deterministic**: YES — trivially. Grid placement by sorted index.

**Viewport fit**: YES — fills viewport exactly, like treemap.

**Implementation complexity**: LOW — trivial. Compute grid dimensions, place by index.

**Pros:**
- Simplest to implement
- Fully deterministic
- Compact, fits viewport
- Handles all folder structures

**Cons:**
- No graph structure visibility — links are messy or invisible
- Low information density — all cells same size regardless of connectivity
- No spatial relationship between notes beyond folder membership
- Boring, doesn't leverage the graph structure at all
- Links between notes in same folder but non-adjacent grid positions are long and crossing

---

### 7. Cluster-First (Group by Folder, Then Layout Within Groups)

**Approach:** Two-stage algorithm:
1. **Stage 1 (Macro)**: Layout folder centroids — position folders in 2D space. Methods: force-directed on "folder graph" (folders as nodes, cross-folder links as edges), or grid/radial placement.
2. **Stage 2 (Micro)**: For each folder, layout notes within the folder's allocated region. Methods: small force-directed, circle pack, grid.
3. **Composition**: Translate note positions from folder-local coordinates to global coordinates using folder centroid.

**Folder structure handling:**
| Structure | Handling |
|---|---|
| Flat (0 folders) | Needs fallback — if 0 or 1 folder, skip macro stage, do pure force-directed |
| 1-level | Excellent — this is the sweet spot |
| Nested (3+ levels) | Good — recurse: layout sub-folder centroids within parent folder region, then notes within sub-folders |
| Mixed | Good |

**Scaling:**
| Notes | Performance | Quality |
|---|---|---|
| 10 | Fast | Excellent |
| 50 | Fast | Good — folder groups keep it organized |
| 100 | Moderate | Good — groups prevent hairball |
| 500 | Moderate | Moderate — individual folders may have many notes, but grouping prevents total hairball |

**Link visibility:**
- Intra-folder links: YES — notes in same folder are in same region, links are short and visible
- Cross-folder links: YES — links between folder regions are visible. Since folders are spatially separated, cross-folder links go between clearly separated regions (less cluttered than pure force-directed because the endpoints are in different regions)

**Deterministic**: YES if both stages use deterministic algorithms. Macro: deterministic force-directed (fixed seed, fixed ticks) or deterministic grid/radial. Micro: deterministic force-directed or deterministic pack/grid.

**Viewport fit**: YES — allocate folder regions to fit viewport, then fit notes within regions. Can compute folder region sizes proportional to note count and tile them to fill viewport.

**Implementation complexity**: MEDIUM-HIGH
- Two-stage algorithm with coordination between stages
- Need to handle: space allocation for folders (avoid overlap), coordinate composition, edge cases (empty folders, single folder, no folders)
- Each stage can use existing algorithms, but the integration is custom
- ~150-250 lines of custom code

**Pros:**
- Shows BOTH folder structure AND graph links — the key advantage
- Deterministic (if both stages are deterministic)
- Fits viewport
- Scales better than pure force-directed (folder grouping prevents hairball)
- Folders are visually clear regions
- Cross-folder links are visible and less cluttered than pure FD (endpoints are in distinct regions)
- Handles nested folders via recursion

**Cons:**
- More complex to implement than single-algorithm approaches
- Need to handle edge cases (0 folders, 1 folder with many notes, nested folders)
- Space allocation between folders can be tricky (large folders need more space)
- Links within densely packed folders may still overlap
- Folder centroid layout quality affects entire layout

---

### 8. Bipartite / Multipartite (Folders as Columns)

**Approach:** Similar to Sankey but without flow bands — folders as vertical columns, notes stacked in each column, links drawn as lines between columns.

**Folder structure handling:**
| Structure | Handling |
|---|---|
| Flat (0 folders) | Fails — no columns |
| 1-level | Moderate — folders as columns |
| Nested (3+ levels) | Poor — doesn't handle nesting |
| Mixed | Poor |

**Scaling:** Same issues as Sankey — tall columns at scale.

**Link visibility:**
- Intra-folder links: NOT shown (same-column links invisible or overlapping)
- Cross-folder links: YES — lines between columns, but cluttered when many links exist

**Deterministic**: YES
**Viewport fit**: Moderate — tends to be wide and tall
**Implementation complexity**: Medium

**Pros:** Cross-folder links visible
**Cons:** Same as Sankey — loses intra-folder links, no nesting support, arbitrary column order. Strictly worse than cluster-first for this use case.

---

### 9. Wordcloud-like (Spiral Placement)

**Algorithm:** Place nodes one at a time on a spiral, starting from center. Skip positions that collide. d3-cloud uses this approach. Node "size" (font size in wordcloud, could be degree in graph) determines priority.

**Folder structure handling:**
| Structure | Handling |
|---|---|
| Flat (0 folders) | OK — spiral by importance/degree |
| 1-level | Poor — no folder grouping mechanism |
| Nested (3+ levels) | Poor |
| Mixed | Poor |

**Scaling:**
| Notes | Performance | Quality |
|---|---|---|
| 10 | Fast | OK |
| 50 | Moderate (collision detection) | Moderate |
| 100 | Slow (O(n²) collision) | Poor — overlaps |
| 500 | Very slow | Fails — massive overlap |

**Link visibility:**
- Intra-folder links: NO
- Cross-folder links: NO

**Deterministic**: YES — deterministic spiral (d3-cloud is deterministic given fixed input order)
**Viewport fit**: YES — spirals outward to fill space
**Implementation complexity**: Low-Medium (d3-cloud exists but is for text, not graph nodes)

**Pros:** Compact for small datasets, deterministic
**Cons:** No graph structure, no folder grouping, doesn't scale, links not shown at all. Designed for text layout, not graph visualization. **Fundamentally wrong tool for this problem.**

---

### 10. Custom Hybrid

This is where the real solution lies. The problem requires showing BOTH containment hierarchy AND link topology simultaneously — no single standard algorithm does this well. The best approaches are hybrids.

#### Hybrid A: Treemap/Pack for Folder Regions + Constrained Force-Directed Within Regions

**Architecture:**
1. **Stage 1 — Folder region allocation**: Use `d3.treemap()` or `d3.pack()` to allocate a rectangular or circular region for each folder. This handles ALL folder structures (flat, 1-level, nested, mixed) perfectly and fills the viewport exactly.
2. **Stage 2 — Intra-folder layout**: For each leaf folder region, run a constrained force-directed layout:
   - Use `d3-force` with `forceX(regionCenterX)` and `forceY(regionCenterY)` to keep notes within their folder's region
   - Use `forceLink` for intra-folder wiki-links
   - Use `forceCollide` to prevent overlap
   - Use `forceManyBody` for spacing
   - Run as static: `simulation.stop(); simulation.tick(N)`
   - Clip/penalize nodes that drift outside their region
3. **Stage 3 — Cross-folder links**: Draw links between note positions across folder regions. These naturally route between regions.
4. **Viewport normalization**: Treemap already fills viewport. Intra-folder positions are relative to region. No additional scaling needed.

**Why this works:**
- Treemap handles folder hierarchy perfectly (deterministic, fills viewport, handles nesting)
- Force-directed within regions shows intra-folder graph structure
- Cross-folder links are visible and go between clearly bounded regions (less cluttered)
- Each stage is deterministic
- Space allocation is automatic (treemap assigns space proportional to note count)

**Edge case handling:**
- 0 folders: Treemap with single root → one big region → pure force-directed. Works.
- 1 folder, 50 notes: Treemap with one cell → force-directed within that cell. Works.
- 20 folders, 5 notes each: Treemap with 20 cells, small FD clusters in each. Works.
- Nested 3+ levels: Treemap handles recursively. Force-directed in leaf regions. Works.

**Implementation complexity**: Medium-High (~200-300 lines)
- Treemap setup: ~20 lines (d3.treemap is built-in)
- Per-folder force simulation: ~50 lines
- Cross-folder link rendering: ~30 lines
- Edge case handling: ~50 lines

#### Hybrid B: Force-Directed with Multi-Level Cluster Forces

**Architecture:**
1. Compute folder centroids using a "folder graph" — folders as supernodes, cross-folder links as edges between supernodes. Layout supernodes with force-directed.
2. For each note, add `forceX`/`forceY` targeting its folder's centroid, with strength proportional to folder depth.
3. Add intra-folder `forceLink` for wiki-links within same folder.
4. Add `forceCollide` for overlap prevention.
5. Run static simulation with fixed tick count.

**Why this works:**
- Folder centroids are positioned by their inter-folder link density (folders with many cross-links are closer)
- Notes cluster around their folder centroids (folder grouping)
- Intra-folder links pull related notes together within the cluster
- Cross-folder links are naturally drawn between clusters

**Edge case handling:**
- 0 folders: No supernodes → pure force-directed. Works.
- 1 folder: Single centroid at center → notes cluster around center. Works.
- Nested: Multi-level centroids (parent folder centroid, then sub-folder centroids offset from parent). Complex to tune.

**Implementation complexity**: Medium (~150-200 lines)
- Folder graph construction: ~30 lines
- Multi-level force configuration: ~50 lines
- Static simulation: ~20 lines

**Risk**: Multi-level cluster forces are harder to tune than Hybrid A. Folder blobs may overlap. No hard folder boundaries (unlike treemap regions in Hybrid A).

#### Hybrid C: Radial Sectors + Constrained Force-Directed Within Sectors

**Architecture:**
1. Assign each top-level folder an angular sector on a circle (proportional to note count, sorted alphabetically for determinism).
2. For nested folders, subdivide the parent sector into sub-sectors.
3. Within each leaf sector, run constrained force-directed layout (notes constrained to their sector's pie-slice region).
4. Draw cross-folder links as arcs or curves.

**Why this works:**
- Circular layout always fits viewport
- Folders as sectors is visually intuitive
- Force-directed within sectors shows intra-folder links
- Cross-folder links as arcs can be edge-bundled

**Edge case handling:**
- 0 folders: Full circle → pure force-directed. Works.
- 1 folder: Full circle sector → force-directed. Works.
- Nested: Sub-sectors within sectors. Works but gets thin at depth 3+.
- 20 folders: 20 sectors, each a thin slice. May be too thin for 5 notes each.

**Implementation complexity**: Medium-High (~200 lines)
- Sector computation: ~40 lines
- Constrained FD within pie slices: ~60 lines (custom force to keep nodes in angular range)
- Arc link rendering: ~30 lines

**Risk**: Thin sectors for many folders. Pie-slice constraint is non-trivial to implement as a force. Cross-folder arc links need edge bundling to avoid clutter.

#### Relevant Existing Libraries for Compound Graphs

- **cytoscape.js + cose-bilkent layout**: Force-directed layout specifically designed for compound graphs (graphs with containment). Handles nested clusters natively. Has Java/JS implementations. Deterministic with fixed seed. This is the closest off-the-shelf solution to the hybrid approaches above.
  - Algorithm: COSE (Compound Spring Embedder) extended by Bilkent researchers
  - Handles nested compound nodes (folders containing sub-folders containing notes)
  - Spring forces between all nodes + compound node boundaries
  - Published: Dogrusoz et al., 2017

- **webcola (constraint-based layout)**: JS layout engine supporting:
  - Compound graph constraints (containment)
  - Flow/direction constraints
  - Edge length constraints
  - Based on Dwyer/Marriott constraint-based layout research
  - Can enforce "nodes in folder X stay within region of folder X"

- **elkjs (Eclipse Layout Kernel)**: Supports layered, force, random, stress layouts. Has compound graph support via the "elk.layered" algorithm with container nodes. Very powerful but complex configuration.

---

## Comparison Matrix

| Approach | Folders | Intra-links | Cross-links | Deterministic | Viewport-fit | Scales to 500 | Complexity | Flat (0 folders) | Nested (3+ levels) |
|---|---|---|---|---|---|---|---|---|---|
| 1. Force-directed | Poor (needs mod) | Good | Moderate (messy) | Yes* | Moderate | Poor (hairball) | Medium | Excellent | Poor |
| 2. Sugiyama | Moderate | Poor | Moderate | Yes | Poor | Fails | High | Fails | Good |
| 3. Radial | Good (1-level) | Good | Poor (chords) | Yes | Excellent | Moderate | Low-Med | Poor | Moderate |
| 4. Treemap/Pack | Excellent | NO | NO | Yes | Excellent | Good | Low | Poor | Excellent |
| 5. Sankey | Moderate | NO | Good (aggregate) | Yes | Moderate | Fails | Medium | Fails | Poor |
| 6. Grid | Good | Poor | Poor | Yes | Excellent | Good | Low | OK | OK |
| 7. Cluster-first | Excellent | Yes | Yes (good) | Yes | Yes | Moderate | Med-High | Fallback | Good |
| 8. Bipartite | Moderate | NO | Yes | Yes | Moderate | Fails | Medium | Fails | Poor |
| 9. Wordcloud | Poor | NO | NO | Yes | Yes | Fails | Low-Med | OK | Poor |
| 10a. Hybrid A (treemap+FD) | Excellent | Yes | Yes (good) | Yes | Excellent | Good | Med-High | Fallback | Excellent |
| 10b. Hybrid B (FD+clusters) | Good | Yes | Yes (moderate) | Yes* | Moderate | Moderate | Medium | Excellent | Moderate |
| 10c. Hybrid C (radial+FD) | Good (1-level) | Yes | Yes (moderate) | Yes | Excellent | Moderate | Med-High | Fallback | Moderate |

\* Deterministic with explicit fixed seed and fixed tick count

---

## Edge Case Analysis

### Case 1: 0 Folders (All Notes at Root)

| Approach | Result |
|---|---|
| Pure force-directed | Excellent — native use case, no folder structure needed |
| Hybrid A (treemap+FD) | Treemap = single cell → pure FD within. Works seamlessly |
| Hybrid B (FD+clusters) | No folder centroids → pure FD. Works seamlessly |
| Hybrid C (radial+FD) | Full circle → pure FD. Works |
| Sugiyama | Fails — no hierarchy |
| Treemap alone | Poor — single blob, no structure |
| Radial | Poor — single circle, no structure |

**Recommendation**: Any hybrid with fallback to pure force-directed. Hybrid A and B handle this natively.

### Case 2: 1 Folder with 50 Notes

| Approach | Result |
|---|---|
| Pure force-directed | Good — 50 notes is within FD's comfort zone |
| Hybrid A (treemap+FD) | Single treemap cell → FD of 50 notes in that cell. Works |
| Hybrid B (FD+clusters) | Single centroid → 50 notes cluster around it. Works |
| Hybrid C (radial+FD) | Full circle sector → FD within. Works |
| Treemap alone | OK but no links visible |

**Recommendation**: All approaches work. Hybrid A gives best space utilization.

### Case 3: 20 Folders with 5 Notes Each (100 notes total)

| Approach | Result |
|---|---|
| Pure force-directed | Moderate — 20 small clusters, but clusters may merge, cross-folder links messy |
| Hybrid A (treemap+FD) | Excellent — 20 treemap cells, 5 notes FD'd in each. Clean separation. Cross-folder links between cells. |
| Hybrid B (FD+clusters) | Good — 20 clusters positioned by inter-folder links. But blobs may overlap. |
| Hybrid C (radial+FD) | Moderate — 20 sectors of 18° each. Each sector is thin. FD within thin sectors is constrained. |
| Sugiyama | Poor — 20 layers or 20 columns, very wide |
| Treemap alone | Good structure but no links |

**Recommendation**: Hybrid A is best — treemap gives each folder a clear bounded region, FD shows links within.

### Case 4: Deeply Nested Folders (3+ Levels)

Example: `Projects/Web/App/notes...` with 3 levels of nesting

| Approach | Result |
|---|---|
| Pure force-directed | Poor — no way to show 3 levels of nesting |
| Hybrid A (treemap+FD) | Excellent — treemap recurses naturally. Nested cells within cells. FD in leaf cells. |
| Hybrid B (FD+clusters) | Moderate — need 3 levels of cluster forces. Hard to tune. Blobs within blobs, may overlap. |
| Hybrid C (radial+FD) | Moderate — nested sectors within sectors. Gets very thin at depth 3. |
| Sugiyama | Good — hierarchy maps to layers |
| Treemap alone | Excellent structure but no links |

**Recommendation**: Hybrid A is best — treemap handles arbitrary nesting depth natively.

---

## Ranked Recommendations

### #1: Hybrid A — Treemap/Pack for Folder Regions + Constrained Force-Directed Within Regions

**Score: 9/10**

This is the strongest approach because it cleanly separates the two concerns:
- **Folder hierarchy** → handled by treemap/pack (deterministic, viewport-filling, handles all nesting depths)
- **Graph topology** → handled by force-directed within each region (shows intra-folder links, deterministic)

**Why it wins:**
1. **Folder structure**: Treemap handles flat, 1-level, nested, and mixed structures perfectly. It's literally designed for this. Recursive nesting works at any depth.
2. **Intra-folder links**: Force-directed within each folder region shows wiki-links between notes in the same folder. Notes are constrained to their region, so links are short and readable.
3. **Cross-folder links**: Drawn between note positions in different regions. Because regions are clearly bounded (treemap cells), cross-folder links go between distinct visual areas — much less cluttered than pure force-directed where everything is mixed.
4. **Deterministic**: Both stages are deterministic. Treemap is deterministic (given sorted input). d3-force is deterministic (fixed-seed LCG + fixed tick count).
5. **Viewport fit**: Treemap fills `[width, height]` exactly. No post-processing needed.
6. **Scaling**: Treemap is O(n). Force-directed within regions is O(k log k) per folder where k = notes in that folder. Total is O(n log k_max). At 500 notes, if max folder size is ~50, this is very fast.
7. **Edge cases**: All four edge cases handled natively (see above).

**Implementation outline:**
```
1. Build folder hierarchy tree from note metadata
2. d3.hierarchy(tree).sum(d => d.type === 'note' ? 1 : 0).sort(...)
3. d3.treemap().size([w, h]).padding(4)(root)
4. For each leaf folder node:
   a. Extract notes in this folder and their intra-folder links
   b. Create d3.forceSimulation(notes)
   c. .force("link", forceLink(intraFolderLinks).distance(20))
   d. .force("charge", forceManyBody().strength(-15))
   e. .force("collide", forceCollide().radius(noteRadius))
   f. .force("x", forceX(regionCenterX).strength(0.08))
   g. .force("y", forceY(regionCenterY).strength(0.08))
   h. simulation.stop(); simulation.tick(300);
   i. Translate local positions to global using region offset
5. Draw cross-folder links using global note positions
6. Draw folder boundaries using treemap cell rectangles
```

**Recommended parameters:**
- Treemap: `.padding(4).paddingInner(2).round(true)`
- Force within regions: `strength(-15)` (lower than global FD because space is limited), `linkDistance(20)`, `collideRadius(noteRadius + 2)`, `forceX/Y strength(0.08)`, `tick(300)`
- Use `d3.pack()` instead of `d3.treemap()` if circular folder regions are preferred (more aesthetic, slightly less space-efficient)
- Node radius: `Math.max(4, Math.min(12, regionArea / noteCount * 0.3))`

**Libraries:** d3-hierarchy (treemap/pack) + d3-force. Both are mature, well-documented, and have no dependencies beyond d3 itself.

---

### #2: cose-bilkent (Off-the-shelf Compound Graph Layout)

**Score: 8.5/10**

If you want to avoid building a custom two-stage algorithm, **cose-bilkent** is the best off-the-shelf option. It's a force-directed layout specifically designed for compound graphs (graphs with containment hierarchy).

**Why it ranks high:**
- **Purpose-built**: Designed exactly for this problem — graphs where nodes contain other nodes (folders contain notes)
- **Single algorithm**: No need for two-stage composition — it handles both hierarchy and topology in one pass
- **Nested support**: Handles arbitrary nesting depth natively
- **Deterministic**: With fixed seed, yes
- **Library**: Available as `cytoscape.js-cose-bilkent` or standalone COSE implementation

**Why not #1:**
- Uses cytoscape.js ecosystem — may not fit your rendering stack
- Less control over individual stages compared to Hybrid A
- Folder regions are soft (force-based), not hard (treemap cells) — folders can overlap
- Viewport fit requires post-processing (like any force-directed approach)
- At 500 notes, still risks hairball (it's fundamentally force-directed)

**When to choose over Hybrid A**: If you're already using cytoscape.js for graph rendering, or if you want a single-algorithm solution with less custom code.

---

### #3: Hybrid B — Force-Directed with Multi-Level Cluster Forces

**Score: 7.5/10**

A single-stage force-directed layout with custom cluster forces that pull notes toward their folder centroids.

**Why it's good:**
- Single simulation — no two-stage composition
- Folder centroids positioned by inter-folder link density (smart positioning)
- Simpler than Hybrid A
- Handles flat structure (0 folders) natively — just skip cluster forces

**Why not higher:**
- Folder blobs are soft — no hard boundaries, folders can overlap
- No explicit folder regions — harder to draw folder boundary boxes
- Multi-level nesting requires multi-level cluster forces (hard to tune)
- Viewport fit requires post-processing
- At scale, clusters can merge into a hairball

**Recommended parameters:**
```js
// Folder centroids from folder-graph force-directed
const folderSim = d3.forceSimulation(folderNodes)
  .force("charge", d3.forceManyBody().strength(-200))
  .force("link", d3.forceLink(folderLinks))
  .force("center", d3.forceCenter(w/2, h/2));
folderSim.stop(); folderSim.tick(300);

// Note layout with cluster forces
const noteSim = d3.forceSimulation(notes)
  .force("link", d3.forceLink(links).distance(30).strength(0.1))
  .force("charge", d3.forceManyBody().strength(-30))
  .force("collide", d3.forceCollide().radius(noteRadius))
  .force("x", d3.forceX().x(d => folderCentroids[d.folder].x).strength(0.1))
  .force("y", d3.forceY().y(d => folderCentroids[d.folder].y).strength(0.1));
noteSim.stop(); noteSim.tick(300);
```

---

### #4: Cluster-First (Approach 7, standalone)

**Score: 7/10**

The generic two-stage approach without specifying which algorithms to use. Essentially a simpler version of Hybrid A/B. Good conceptually but needs the specific algorithm choices (treemap for macro, FD for micro) to be practical.

---

### #5: Pure Force-Directed with Cluster Forces (Approach 1, modified)

**Score: 6.5/10**

Good for small graphs and flat structures. Hairball risk at scale. No hard folder boundaries. Best as a fallback for the 0-folder case within a hybrid approach.

---

### #6: Radial Sectors (Approach 3)

**Score: 6/10**

Good for 1-level folder structures with few folders. Compact and deterministic. Fails for nested folders and has chord-clutter problems for cross-folder links.

---

### #7: Treemap/Pack Alone (Approach 4)

**Score: 5/10**

Excellent folder visualization but **completely loses graph structure**. Only viable if wiki-links are shown in a separate view or as hover interactions.

---

### #8: Sugiyama / Hierarchical (Approach 2)

**Score: 4/10**

Fundamental mismatch: wiki-links are cyclic, requiring destructive cycle removal. Folder membership doesn't determine layering. Poor viewport fit at scale. Fails for flat structures.

---

### #9: Grid (Approach 6)

**Score: 3.5/10**

Simple and deterministic but shows neither graph structure nor meaningful spatial relationships. Links are messy. Only useful as a last-resort fallback.

---

### #10: Sankey (Approach 5)

**Score: 3/10**

Loses intra-folder links. Doesn't handle nesting. Not a graph visualization. Column order is arbitrary.

---

### #11: Bipartite (Approach 8)

**Score: 2.5/10**

Same problems as Sankey, strictly worse than cluster-first.

---

### #12: Wordcloud (Approach 9)

**Score: 2/10**

Wrong tool entirely. Designed for text placement, not graph visualization. No links, no folders, no scaling.

---

## Final Recommendation

### Primary: Hybrid A (Treemap + Constrained Force-Directed)

Build a two-stage layout:
1. **d3.treemap()** (or d3.pack()) for folder region allocation — handles all folder structures, fills viewport, deterministic
2. **d3-force** within each folder region for note placement — shows intra-folder wiki-links, deterministic with fixed seed
3. Cross-folder links drawn between computed note positions

This is the only approach that satisfies ALL requirements simultaneously:
- Folder structure: treemap (all depths, all structures)
- Intra-folder links: force-directed within regions
- Cross-folder links: drawn between bounded regions (less clutter)
- Deterministic: both stages deterministic
- Viewport fit: treemap fills viewport exactly
- Scaling: O(n log k) total, handles 500 notes
- Edge cases: all four handled natively

### Fallback: Pure Force-Directed (for 0-folder case)

When there are 0 (or 1) folders, skip the treemap stage and run pure d3-force on all notes. This is the native use case for force-directed and works well up to ~100 notes. For 100-500 notes with no folders, consider adding degree-based node sizing and link filtering (show only links to/from hovered/selected node).

### Alternative: cose-bilkent (if using cytoscape.js)

If the rendering layer uses cytoscape.js, use the cose-bilkent layout directly. It's purpose-built for compound graphs and handles the folder/notes containment natively in a single algorithm.

---

## Appendix: Key Library References

| Library | Purpose | npm package | Notes |
|---|---|---|---|
| d3-force | Force-directed layout | `d3-force` | Fixed-seed LCG, deterministic, velocity Verlet |
| d3-hierarchy | Treemap, pack, tree | `d3-hierarchy` | Deterministic, handles nested hierarchy |
| graphology-layout-forceatlas2 | ForceAtlas2 | `graphology-layout-forceatlas2` | Better cluster separation than vanilla FR |
| dagre / dagre-d3 | Sugiyama layered layout | `dagre` | For DAGs only, cycle removal needed |
| elkjs | Eclipse Layout Kernel | `elkjs` | Multiple algorithms, compound graph support |
| cytoscape.js-cose-bilkent | Compound graph FD | `cytoscape-cose-bilkent` | Purpose-built for containment + links |
| webcola | Constraint-based layout | `webcola` | Supports containment constraints |
| d3-sankey | Sankey/flow | `d3-sankey` | For flow diagrams, not general graphs |
