---
authority: informational
lifecycle: archived
---

# План реализации графа знаний (Knowledge Graph)

## Контекст

Текущий компонент `KnowledgeGraph.tsx` (409 строк) — монолит с SVG-рендерингом, кастомным орбитальным layout (`gravity-layout.ts`, 205 строк), и спринг-физикой через React `setState` на каждый кадр. Данные приходят из `useProjectTree` (`listProjectTree` + `listProjectLinks`). Отбрасываются: неразрешённые wiki-ссылки, asset-ссылки, теги. Ошибки из хука не читаются. Keyboard-навигации, `prefers-reduced-motion`, screen reader-поддержки нет. `loading` стартует `false`.

Базовый каталог: `queryn-desktop/src/renderer/widgets/knowledge-graph/`

---

## 1. Структура файлов

### Новые файлы в `widgets/knowledge-graph/`

| Файл | Назначение | ~Строк |
|---|---|---|
| `graph-types.ts` | Общие типы: `GraphNode`, `GraphEdge`, `GhostNode`, `GraphCluster`, `Viewport`, `ScaleTier`, `GraphState` | 50 |
| `graph-layout.ts` | Алгоритм layout: treemap + force-directed (замена `gravity-layout.ts`) | 280 |
| `graph-physics.ts` | Спринг-движок: spring-back, throw velocity, dt-aware loop, direct-DOM mode | 130 |
| `graph-utils.ts` | Утилиты: `clamp`, `truncateForPill`, `estimatePillWidth`, `flowCurve`, `truncLabel`, `computeBBox`, `fitViewport` | 60 |
| `useGraphData.ts` | Хук: загрузка данных → построение `GraphNode[]`, `GraphEdge[]`, `GhostNode[]` | 90 |
| `useGraphViewport.ts` | Хук: viewport state, pan/zoom, zoom-to-cursor, fit, tween-анимация | 100 |
| `useGraphInteraction.ts` | Хук: hover, select, keyboard nav, context menu state | 120 |
| `GraphCanvas.tsx` | SVG / Canvas слой рендеринга: wells, edges, nodes, ghost nodes | 140 |
| `GraphNodeView.tsx` | Рендеринг одной ноды: pill / dot / hub / isolated / ghost варианты | 90 |
| `GraphEdgeView.tsx` | Рендеринг одного ребра: bezier curve, active/dimmed/flow состояния | 45 |
| `GraphWellView.tsx` | Рендеринг well (dashed circle + label) | 35 |
| `GraphControls.tsx` | Кнопки zoom, label масштаба, fit | 50 |
| `GraphSearch.tsx` | Поиск + фильтры (folder, tag, hide isolated) | 100 |
| `GraphContextMenu.tsx` | Контекстное меню ноды | 65 |
| `GraphStates.tsx` | Состояния: loading, error+retry, empty | 55 |
| `KnowledgeGraph.tsx` | Оркестратор: композиция хуков и компонентов (перезапись) | 160 |

### Модифицируемые файлы

| Файл | Изменение |
|---|---|
| `widgets/knowledge-graph/gravity-layout.ts` | **Удалить** — заменён на `graph-layout.ts` |
| `entities/project/lib/useProjectTree.ts` | `loading` стартует `true` (строка 17: `useState(false)` → `useState(true)`) |
| `shared/styles/knowledge-graph.css` | Полное обновление стилей (см. §4) |
| `package.json` (queryn-desktop) | Добавить зависимости (см. §9) |
| `tsconfig.json` | Без изменений |

### Новые файлы тестов

| Файл | ~Строк |
|---|---|
| `widgets/knowledge-graph/__tests__/graph-layout.test.ts` | 120 |
| `widgets/knowledge-graph/__tests__/graph-physics.test.ts` | 80 |
| `widgets/knowledge-graph/__tests__/graph-utils.test.ts` | 60 |
| `widgets/knowledge-graph/__tests__/useGraphData.test.ts` | 70 |

---

## 2. Фазы реализации

### Фаза 1 — Фундамент: типы, данные, layout
**Зависимости:** нет
**Тестируемость:** layout детерминирован (same input → same output), данные строятся корректно

1. Создать `graph-types.ts`
2. Создать `graph-utils.ts` (перенести `clamp`, `truncateForPill`, `estimatePillWidth`, `flowCurve` из `gravity-layout.ts`; добавить `truncLabel`, `computeBBox`, `fitViewport`)
3. Создать `useGraphData.ts` — хук-обёртка над `useProjectTree`, строит граф с ghost-нодами
4. Создать `graph-layout.ts` — treemap + FD (см. §3)
5. Удалить `gravity-layout.ts`
6. Починить `useProjectTree.ts`: `useState(true)` для loading
7. Написать тесты для layout, utils, useGraphData

**Контроль:** `computeGraphLayout(nodes, edges, 800, 600)` вызван дважды с теми же данными → идентичный `Map` позиций. Ghost- ноды присутствуют для неразрешённых ссылок.

### Фаза 2 — Рендеринг: SVG-компоненты
**Зависимости:** Фаза 1
**Тестируемость:** компонент рендерит N нод, M рёбер, K wells; видны ghost- ноды

1. Создать `GraphWellView.tsx`, `GraphEdgeView.tsx`, `GraphNodeView.tsx`
2. Создать `GraphCanvas.tsx` — композиция трёх выше
3. Создать `GraphStates.tsx` — loading / error+retry / empty
4. Создать `GraphControls.tsx`
5. Перезаписать `KnowledgeGraph.tsx` — оркестратор без интерактивности (только отображение)
6. Обновить `knowledge-graph.css`
7. Проверить: `loading` → спиннер, `message` (ошибка) → error + кнопка retry, `hasContent` → граф

**Контроль:** визуально видны wells (dashed circles), pill-ноды с заголовками, рёбра (bezier), ghost-ноды (dashed + "?"). Hub-ноды имеют accent-soft fill + badge. Изолированные — dashed border.

### Фаза 3 — Физика: springs, drag, direct-DOM
**Зависимости:** Фаза 2
**Тестируемость:** drag ноды → spring-back; release → throw; >60 нод → direct-DOM (без React re-render на кадр)

1. Создать `graph-physics.ts`:
   - `SpringEngine` класс: `tick(now)`, `dragStart(id)`, `dragMove(id, x, y)`, `dragEnd(id, vx, vy)`, `setTargets(map)`, `isSettled()`
   - Параметры: `stiffness=0.15`, `damping=0.80`, `throwFactor=0.35`, `maxThrow=18`
   - dt-aware: `dt = min((now - lastTime) / 16.67, 2)` — защита от больших скачков
   - `prefersReducedMotion` → мгновенный snap без анимации
2. В `KnowledgeGraph.tsx`: заменить `springStep` на `SpringEngine`, RAF loop с `document.hidden` check
3. В `GraphCanvas.tsx`: при `nodeCount > 60` переключиться на direct-DOM режим:
   - Ноды рендерятся один раз, затем `ref.current.setAttribute("transform", ...)` в RAF loop
   - React не ре-рендерит ноды на кадр
   - При hover/select — точечный ре-рендер только затронутых нод
4. Viewport culling: ноды вне `[0, width]×[0, height]` (с padding 50px) → `display: none`
5. Pause: `document.addEventListener("visibilitychange")` → cancel RAF when hidden

**Контроль:** drag ноды, отпустить → spring-back с затуханием, останавливается. Бросок с инерцией. 100 нод → плавный drag без frame drops ( RAF пишет в DOM напрямую).

### Фаза 4 — Интерактивность: hover, select, keyboard, context menu
**Зависимости:** Фаза 3
**Тестируемость:** hover → highlight neighbors + dim others; click → select (ring); double-click → open; keyboard → навигация

1. Создать `useGraphInteraction.ts`:
   - `hoveredNode`, `selectedNode`, `contextMenu: { nodeId, x, y } | null`
   - `neighborIds`, `connectedEdges` — useMemo от `hoveredNode` или `selectedNode`
   - Keyboard handler: `ArrowUp/Down/Left/Right` → переход к ближайшему соседу в направлении; `Enter` → `onOpenNote`; `F` → focus subgraph (fit to neighbors bbox); `Esc` → clear selection
2. В `KnowledgeGraph.tsx`:
   - `onNodeClick` → `setSelectedNode(id)` (вместо `onOpenNote`)
   - `onNodeDoubleClick` → `onOpenNote(id)`
   - `tabIndex={0}` на canvas, `onKeyDown` из хука
3. Создать `GraphContextMenu.tsx`:
   - "Открыть конспект" → `onOpenNote`
   - "Фокус на связи" → fit to subgraph
   - "Скопировать wiki-ссылку" → `navigator.clipboard.writeText("[[title]]")`
   - "Закрепить позицию" → `pinnedIds.add(id)` (исключить из spring)
4. Hover: `nOpacity(id)` → 1 для neighbors, 0.18 для остальных; `eOpacity` → 0.6 для connected, 0.03 для dimmed
5. Select: persistent ring (`kg-node--selected` класс, не убирается при hover-уходе)

**Контроль:** Tab → фокус на canvas → стрелки перемещают selection → Enter открывает конспект. Right-click на ноде → контекстное меню. Esc → очистка.

### Фаза 5 — Поиск, фильтры, scale fallback
**Зависимости:** Фаза 4
**Тестируемость:** поиск фильтрует ноды; фильтр по folder подсвечивает well; tier-переключение работает

1. Создать `useGraphViewport.ts`:
   - `viewport: { scale, tx, ty }`, `setViewport`, `zoomBy(factor)`, `zoomToCursor(mx, my, factor)`, `fit(bbox)`, `tweenTo(target, durationMs)`
   - Pan с momentum: drag background → `viewport.tx/ty`, release → momentum с `damping=0.92`
2. Создать `GraphSearch.tsx`:
   - `<input>` с live-фильтром: `query` → `matchedNodeIds: Set<string>`
   - Нody не в match → `opacity: 0.1` (не скрываются полностью)
   - Enter → auto-pan к ближайшему match (tween viewport)
   - Фильтры: chips для folders (click well label = toggle), dropdown для tags, checkbox "скрыть изолированные"
3. Scale tier determination: `const tier = nodeCount <= 100 ? 1 : nodeCount <= 300 ? 2 : 3`
4. Tier 2 (101-300): `springEngine.disabled = true`, позиции = `layout.targets` напрямую, `edgeOpacity *= 0.7`
5. Tier 3 (301+): hub-only режим — рендерятся только ноды с `degree > 0`, cluster summary circles для остальных
6. Banner: `Показано {visibleCount} из {totalCount} конспектов` — сверху canvas

**Контроль:** ввод "матем" → ноды с "математ" подсвечены, остальные dim. 250 нод → springs off, статичные позиции. 350 нод → только hub-ноды + summary circles.

### Фаза 6 — Полировка: accessibility, edge cases
**Зависимости:** Фаза 5
**Тестируемость:** `prefers-reduced-motion` отключает анимации; screen reader читает ноды; ResizeObserver не спамит

1. `prefers-reduced-motion`:
   - `const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches`
   - Если true: `SpringEngine` → snap без анимации, `kg-link` → `animation: none`, tween viewport → мгновенный
2. Screen reader:
   - `<section role="application" aria-label="Карта связей конспектов">`
   - Каждая нода: `<g role="button" aria-label="{title}, {degree} связей, папка {folder}" tabindex={-1}>`
   - Ghost: `aria-label="Неразрешённая ссылка: {rawTarget}"`
   - Live region: `<div aria-live="polite" class="sr-only">{statusMessage}</div>` — "Выбрано: {title}", "Найдено {n} конспектов"
3. ResizeObserver debounce: `setTimeout(150ms)` + `clearTimeout`
4. Label truncation: `truncLabel(label, maxWidth, fontSize)` — для folder labels и pill text (универсальная)
5. Auto-pan at edges during node drag: если курсок в пределах 40px от края canvas → pan viewport в ту сторону
6. Dark mode CSS audit: wells на stroke не fill, accent ярче

**Контроль:** включить `prefers-reduced-motion` в DevTools → ноды snap на позиции без анимации. VoiceOver/Trial → читает "Карта связей, кнопка, Математика, 5 связей, папка Лекции". Resize окна → 1 resize event через 150ms, не 20.

---

## 3. Алгоритм layout

### Решение: `d3-hierarchy` (treemap) + `d3-force`

**Обоснование:**

| Критерий | In-house | d3 |
|---|---|---|
| Treemap (nested folders) | ~150 строк, сложный алгоритм squarified | `d3.treemap()` — 5 строк |
| Force-directed (deterministic) | ~200 строк, нужен seeded PRNG + Verlet integrator | `d3.forceSimulation().tick(300)` — deterministic LCG из коробки |
| Barnes-Hut (O(n log n)) | ~80 строк, quadtree | Встроен в `d3.forceManyBody()` |
| Тестирование | Нужно покрывать сложный алгоритм | Библиотека протестирована |
| Bundle size | 0 KB | ~20KB gzipped (2 пакета) |
| Риск багов | Высокий (edge cases treemap, numerical stability) | Низкий |

Для Electron-приложения 20KB gzip — незначительно. Совокупная экономия: ~350 строк сложного алгоритмического кода, который трудно протестировать и поддерживать.

### Алгоритм: `computeGraphLayout`

```typescript
// graph-layout.ts

import { hierarchy, treemap } from "d3-hierarchy";
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY } from "d3-force";
import type { GraphNode, GraphEdge, GhostNode, GraphCluster } from "./graph-types";

interface LayoutInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  ghostNodes: GhostNode[];
  width: number;
  height: number;
}

interface LayoutResult {
  targets: Map<string, { x: number; y: number }>;  // id → position
  clusters: GraphCluster[];
  ghostPositions: Map<string, { x: number; y: number }>;
}

const TREEMAP_PADDING = 8;
const TREEMAP_PADDING_INNER = 4;
const FORCE_TICKS = 300;
const FORCE_STRENGTH_CHARGE = -20;
const FORCE_LINK_DISTANCE = 28;
const FORCE_LINK_STRENGTH = 0.15;
const FORCE_COLLIDE_PADDING = 4;
const FORCE_CENTER_STRENGTH = 0.08;

export function computeGraphLayout(input: LayoutInput): LayoutResult {
  const { nodes, edges, ghostNodes, width, height } = input;

  if (nodes.length === 0) {
    return { targets: new Map(), clusters: [], ghostPositions: new Map() };
  }

  // --- Stage 1: Folder hierarchy → treemap ---

  const folderTree = buildFolderHierarchy(nodes);
  const root = hierarchy(folderTree)
    .sum((d) => (d.type === "note" ? 1 : 0))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const tm = treemap<typeof folderTree.data>()
    .size([width, height])
    .padding(TREEMAP_PADDING)
    .paddingInner(TREEMAP_PADDING_INNER)
    .round(true);

  tm(root);

  // --- Stage 2: Per-folder constrained force-directed ---

  const clusters: GraphCluster[] = [];
  const targets = new Map<string, { x: number; y: number }>();
  const folderRegions = new Map<string, { x0: number; y0: number; x1: number; y1: number }>();

  for (const leaf of root.leaves()) {
    // leaf.data.folder → folder path; leaf.x0/y0/x1/y1 → treemap cell
    const folder = leaf.data.folder ?? "";
    const region = { x0: leaf.x0 ?? 0, y0: leaf.y0 ?? 0, x1: leaf.x1 ?? 0, y1: leaf.y1 ?? 0 };
    folderRegions.set(folder, region);

    const clusterNodes = nodes.filter((n) => n.folder === folder);
    if (clusterNodes.length === 0) continue;

    const cx = (region.x0 + region.x1) / 2;
    const cy = (region.y0 + region.y1) / 2;
    const rw = region.x1 - region.x0;
    const rh = region.y1 - region.y0;

    // Intra-folder edges only
    const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));
    const clusterEdges = edges
      .filter((e) => clusterNodeIds.has(e.source) && clusterNodeIds.has(e.target))
      .map((e) => ({ source: e.source, target: e.target }));

    const simNodes = clusterNodes.map((n) => ({
      id: n.id,
      x: cx + (deterministicOffset(n.id, 0) - 0.5) * rw * 0.6,
      y: cy + (deterministicOffset(n.id, 1) - 0.5) * rh * 0.6,
    }));

    // Deterministic initial positions (sorted by id → stable)
    simNodes.sort((a, b) => a.id.localeCompare(b.id));

    const sim = forceSimulation(simNodes)
      .force("link", forceLink(clusterEdges).id((d) => d.id).distance(FORCE_LINK_DISTANCE).strength(FORCE_LINK_STRENGTH))
      .force("charge", forceManyBody().strength(FORCE_STRENGTH_CHARGE))
      .force("collide", forceCollide().radius((d) => nodeRadius(d) + FORCE_COLLIDE_PADDING))
      .force("x", forceX(cx).strength(FORCE_CENTER_STRENGTH))
      .force("y", forceY(cy).strength(FORCE_CENTER_STRENGTH))
      .stop();

    sim.tick(FORCE_TICKS);

    // Clamp to region + collect positions
    for (const sn of simNodes) {
      const padding = 16;
      const x = clamp(sn.x ?? cx, region.x0 + padding, region.x1 - padding);
      const y = clamp(sn.y ?? cy, region.y0 + padding, region.y1 - padding);
      targets.set(sn.id, { x, y });
    }

    const usePills = clusterNodes.length <= 22 && rw * rh / clusterNodes.length > 1800;
    clusters.push({
      folder,
      label: folder || "Конспекты",
      cx, cy,
      radius: Math.min(rw, rh) / 2,
      nodeIds: clusterNodes.map((n) => n.id),
      usePills,
      maxPillWidth: Math.min(185, rw * 0.8),
    });
  }

  // --- Edge case: 0 folders (all notes at root) → pure FD ---

  if (clusters.length === 0 || (clusters.length === 1 && clusters[0].folder === "")) {
    // Single region = entire viewport → already handled by treemap with one cell
  }

  // --- Stage 3: Ghost nodes (unresolved links) ---

  const ghostPositions = new Map<string, { x: number; y: number }>();
  for (const ghost of ghostNodes) {
    const sourcePos = targets.get(ghost.sourceId);
    if (sourcePos) {
      // Place ghost near source, offset by deterministic angle
      const angle = deterministicOffset(ghost.id, 2) * Math.PI * 2;
      const offset = 50 + deterministicOffset(ghost.id, 3) * 30;
      ghostPositions.set(ghost.id, {
        x: sourcePos.x + Math.cos(angle) * offset,
        y: sourcePos.y + Math.sin(angle) * offset,
      });
    }
  }

  return { targets, clusters, ghostPositions };
}
```

### Вспомогательные функции

```typescript
// buildFolderHierarchy: nodes → nested {name, folder, type, children} для d3.hierarchy
function buildFolderHierarchy(nodes: GraphNode[]): FolderTreeNode {
  const root: FolderTreeNode = { name: "", folder: "", type: "folder", children: [] };
  for (const node of nodes) {
    insertNode(root, node.folder.split("/"), node);
  }
  return root;
}

// deterministicOffset: seeded hash → [0,1) без Math.random
function deterministicOffset(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return ((h >>> 0) % 10000) / 10000;
}

// nodeRadius: степень → радиус для forceCollide
function nodeRadius(d: { id: string }): number {
  // Используется в forceCollide; фактический visual radius берётся из GraphNode
  return 18;
}
```

### Edge cases

| Случай | Обработка |
|---|---|
| 0 папок | Treemap: один cell = весь viewport → FD на всех нодах |
| 1 папка | Treemap: один cell → FD внутри |
| 20 папок × 5 нод | 20 cells, маленькие FD-кластеры в каждом |
| Nested 3+ levels | Treemap рекурсивно; FD в leaf-cell |
| 0 нод | Early return: пустые Map'ы |
| 500 нод | Tier 3: hub-only, clusters с summary circles (без FD) |

---

## 4. Архитектура компонентов

### Дерево компонентов

```
KnowledgeGraph (оркестратор)
├── GraphStates (loading | error | empty — только один)
├── GraphSearch (search input + filter chips)
│   └── FilterChip (folder/tag toggle)
├── GraphCanvas (SVG / Canvas слой)
│   ├── GraphWellView[] (dashed circles + labels)
│   ├── GraphEdgeView[] (bezier curves)
│   ├── GraphNodeView[] (pills / dots / ghosts)
│   └── <canvas> (Tier 3: hub-only mode)
├── GraphControls (zoom buttons + label + fit)
├── GraphContextMenu (right-click menu)
└── <div aria-live="polite" class="sr-only" /> (screen reader status)
```

### KnowledgeGraph.tsx — оркестратор

```typescript
interface KnowledgeGraphProps {
  project: ProjectSummary;
  onOpenNote: (noteRelativePath: string) => void;
  onCloseProject?: () => void;
}

export function KnowledgeGraph({ project, onOpenNote, onCloseProject }: KnowledgeGraphProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, ghostNodes, loading, error, retry } = useGraphData(project.rootPath);
  const { containerSize, containerRef: sizeRef } = useContainerSize();
  const layout = useMemo(() => computeGraphLayout({ nodes, edges, ghostNodes, ...containerSize }), [nodes, edges, ghostNodes, containerSize]);
  const springEngine = useRef(new SpringEngine(layout.targets));
  const { viewport, ...viewportActions } = useGraphViewport(containerSize);
  const { hoveredNode, selectedNode, contextMenu, ...interaction } = useGraphInteraction({ nodes, edges, onOpenNote });
  const tier = nodes.length <= 100 ? 1 : nodes.length <= 300 ? 2 : 3;
  // ... RAF loop, event wiring, render
}
```

### Граф вызовов хуков

```
useGraphData (data)
  └── useProjectTree (IPC)
       ├── listProjectTree → tree → flattenTree → NoteSummary[]
       └── listProjectLinks → links → ProjectLink[]

computeGraphLayout (pure, useMemo)
  ├── d3.treemap → folder regions
  └── d3.forceSimulation per region → node positions

useGraphViewport (state + handlers)
  └── viewport: { scale, tx, ty }

useGraphInteraction (state + handlers)
  ├── hoveredNode, selectedNode
  └── keyboard handler (arrows, Enter, F, Esc)

SpringEngine (ref, imperative)
  └── RAF loop → setAttribute on refs (direct-DOM) or setState (≤60 nodes)
```

---

## 5. State management

### State diagram

```
                    useGraphData
                    ┌────────────────────────────────┐
                    │ nodes: GraphNode[]              │
                    │ edges: GraphEdge[]              │
                    │ ghostNodes: GhostNode[]         │
                    │ loading: boolean                │
                    │ error: string | null            │
                    │ retry: () => void               │
                    └──────────┬─────────────────────┘
                               │
                    computeGraphLayout (useMemo)
                    ┌────────────────────────────────┐
                    │ targets: Map<id, {x,y}>         │
                    │ clusters: GraphCluster[]        │
                    │ ghostPositions: Map<id, {x,y}>  │
                    └──────────┬─────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     useGraphViewport    SpringEngine    useGraphInteraction
     ┌──────────────┐   ┌────────────┐   ┌──────────────────┐
     │ scale        │   │ positions  │   │ hoveredNode      │
     │ tx, ty       │   │ velocities │   │ selectedNode     │
     │ isPanning    │   │ springing  │   │ contextMenu      │
     │ isZooming    │   │ pinned     │   │ searchQuery      │
     └──────────────┘   └────────────┘   │ activeFolder     │
                                         │ activeTags       │
                                         │ hideIsolated     │
                                         └──────────────────┘
```

### Переменные state

| State | Тип | Где | Trigger обновления |
|---|---|---|---|
| `positions` | `Map<string, {x,y}>` | `SpringEngine` (ref) | RAF loop, drag, layout change |
| `viewport` | `{scale, tx, ty}` | `useGraphViewport` (useState) | wheel, pan, zoomBy, fit, tween |
| `hoveredNode` | `string \| null` | `useGraphInteraction` (useState) | mouseenter/leave on node |
| `selectedNode` | `string \| null` | `useGraphInteraction` (useState) | click on node, keyboard nav |
| `draggingNode` | `string \| null` | `KnowledgeGraph` (useState) | mousedown/up on node |
| `panning` | `boolean` | `useGraphViewport` (useState) | mousedown/up on background |
| `contextMenu` | `{nodeId, x, y} \| null` | `useGraphInteraction` (useState) | right-click on node, Esc, click-away |
| `searchQuery` | `string` | `useGraphInteraction` (useState) | input onChange |
| `activeFolder` | `string \| null` | `useGraphInteraction` (useState) | click on well label |
| `activeTags` | `Set<string>` | `useGraphInteraction` (useState) | click on tag chip |
| `hideIsolated` | `boolean` | `useGraphInteraction` (useState) | checkbox toggle |
| `pinnedIds` | `Set<string>` | `KnowledgeGraph` (useRef) | context menu "pin" |
| `menuOpen` | `boolean` | `KnowledgeGraph` (useState) | header menu button |

### Производный state (useMemo)

| Производное | От | Вычисление |
|---|---|---|
| `neighborIds` | `hoveredNode \| selectedNode`, `edges` | BFS 1-hop |
| `connectedEdges` | `hoveredNode \| selectedNode`, `edges` | filter by source/target |
| `visibleNodes` | `nodes`, `searchQuery`, `activeFolder`, `activeTags`, `hideIsolated` | filter |
| `tier` | `nodes.length` | ≤100→1, ≤300→2, >300→3 |
| `reducedMotion` | `window.matchMedia` | media query |

---

## 6. Стратегия рендеринга

### SVG vs Canvas

| Tier | Нод | Рендеринг | Позиции | Почему |
|---|---|---|---|---|
| 1 | ≤100 | SVG (React) | `useState` + SpringEngine → `positions` | Мало нод, React справляется, CSS transitions, accessibility |
| 2 | 101-300 | SVG (direct-DOM) | `refs.setAttribute` в RAF | React re-render 300 нод на кадр = тормоза; direct-DOM = O(1) per node |
| 3 | 301+ | Canvas | `canvas.2d` context | 300+ SVG элементов = DOM bottleneck; Canvas = плоский pixel buffer |

### Переключение

```typescript
// KnowledgeGraph.tsx
const renderMode: "svg-react" | "svg-direct" | "canvas" =
  tier === 1 ? "svg-react" : tier === 2 ? "svg-direct" : "canvas";
```

### Direct-DOM режим (Tier 2)

```typescript
// GraphCanvas.tsx
function GraphCanvas({ renderMode, positions, ... }) {
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());

  // При renderMode === "svg-direct":
  // 1. React рендерит ноды ОДИН РАЗ (при mount / layout change)
  // 2. RAF loop обновляет позиции через ref.setAttribute
  useEffect(() => {
    if (renderMode !== "svg-direct") return;
    let raf: number;
    function tick(): void {
      for (const [id, pos] of springEngine.current.positions) {
        const el = nodeRefs.current.get(id);
        if (el) el.setAttribute("transform", `translate(${pos.x}, ${pos.y})`);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [renderMode]);

  // React ре-рендерит только при: layout change, filter change, tier change
  // НЕ при: position update (RAF делает это), hover (точечный update класса)
}
```

### Canvas режим (Tier 3)

```typescript
// GraphCanvas.tsx — Tier 3 branch
function CanvasRenderer({ nodes, edges, clusters, viewport, ... }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // RAF loop: clear → applyTransform → drawWells → drawEdges → drawHubs → drawLabels
  // Hub-only: только ноды с degree > 0, остальные → cluster summary circle
  // Hit detection: обратное преобразование координат click → найти ноду
}
```

### Viewport culling (все tier'ы)

```typescript
function isVisible(pos: {x,y}, viewport, containerSize, padding = 50): boolean {
  const sx = pos.x * viewport.scale + viewport.tx;
  const sy = pos.y * viewport.scale + viewport.ty;
  return sx > -padding && sx < containerSize.width + padding &&
         sy > -padding && sy < containerSize.height + padding;
}
```

---

## 7. Performance budget

| Tier | Нод | Цель FPS | Что включено | Что отключено |
|---|---|---|---|---|
| 1 | ≤100 | 60fps | Springs, throw, CSS transitions, all edges | — |
| 2 | 101-300 | 30-45fps | Direct-DOM positions, edge opacity ×0.7 | Springs (static), throw |
| 3 | 301+ | 30fps | Canvas, hub-only, cluster summary | Springs, throw, non-hub nodes, most edges |

### Измерения

- Layout computation: <50ms (100 нод), <150ms (300 нод), <300ms (500 нод)
- Spring tick: <2ms (60 нод), <5ms (100 нод) — direct-DOM
- Canvas redraw: <8ms (500 нод)
- Hover highlight: <16ms (React re-render 100 нод с opacity change)

### Защитные механизмы

- RAF loop: `document.hidden` → `cancelAnimationFrame`
- ResizeObserver: debounce 150ms
- Layout: `useMemo` (не пересчитывается при hover/drag)
- Spring: settles → stops RAF (`if (engine.isSettled()) cancelRAF()`)
- Viewport culling: skip `setAttribute` / canvas draw для off-screen нод

---

## 8. Стратегия тестирования

### Unit-тесты (vitest)

**`graph-layout.test.ts`** (~120 строк)
- `computeGraphLayout` с 0 нодами → пустые Map'ы
- 5 нод, 0 папок → один cluster, все ноды внутри
- 10 нод, 3 папки → 3 cluster'а, ноды в правильных cluster'ах
- Детерминизм: два вызова с теми же данными → `deepEqual` результатов
- Nested folders (2 уровня) → treemap cells вложены
- Ghost nodes: позиция рядом с source
- 300 нод → не падает, все ноды имеют позицию
- Edge case: 1 нода → позиция в центре

**`graph-physics.test.ts`** (~80 строк)
- `SpringEngine`: setTarget → tick(300) → позиция ≈ target (epsilon 0.5)
- `dragStart` → `dragMove` → позиция = dragMove
- `dragEnd` с velocity → throw, затем settle
- `isSettled()` → true после settle, false во время движения
- `pinnedIds` → нода не двигается при tick
- `prefersReducedMotion` → snap мгновенно

**`graph-utils.test.ts`** (~60 строк)
- `clamp(5, 0, 10)` → 5; `clamp(-1, 0, 10)` → 0; `clamp(11, 0, 10)` → 10
- `truncateForPill("Очень длинный заголовок конспекта", 80)` → "Очень длинный заголовок…"
- `estimatePillWidth("Test")` → в диапазоне [50, 185]
- `flowCurve({0,0}, {100,0})` → валидный SVG path с Q-командой
- `truncLabel("Папка с очень длинным названием", 120, 11)` → обрезан + "…"
- `computeBBox(positions)` → {minX, minY, maxX, maxY}
- `fitViewport(bbox, containerSize)` → {scale, tx, ty} что bbox вписан

**`useGraphData.test.ts`** (~70 строк)
- Mock `window.queryn.listProjectTree` + `listProjectLinks`
- 3 note nodes + 2 wiki links (1 resolved, 1 unresolved) → 3 GraphNode + 1 GraphEdge + 1 GhostNode
- Asset links → не попадают в edges (только wiki)
- Tags из NoteSummary → попадают в `GraphNode.tags`
- Error: mock reject → `error` заполнен, `retry` вызывает refresh
- Loading: initial state → `loading === true`

### Интеграционные тесты

Ручной чек-лист (Electron DevTools):

1. **Loading state**: открыть проект → спиннер → граф появляется
2. **Error state**: некорректный rootPath → error + кнопка retry → клик → загрузка
3. **Empty state**: проект без конспектов → "Нет данных"
4. **Hover**: навести на ноду → соседи подсвечены, остальные dim
5. **Select**: клик на ноду → ring persistent, не исчезает при hover-уходе
6. **Double-click**: → `onOpenNote` вызван, переключение на workspace
7. **Drag**: перетащить ноду → spring-back на release
8. **Throw**:快速 drag + release → инерция
9. **Pan**: drag фона → viewport двигается
10. **Zoom**: wheel → zoom-to-cursor
11. **Zoom buttons**: + / - / fit
12. **Keyboard**: Tab → фокус → стрелки → Enter → Esc
13. **Context menu**: right-click → меню → "Открыть" → "Скопировать [[ссылку]]"
14. **Search**: ввести текст → подсветка → Enter → auto-pan
15. **Filter folder**: клик на well label → только ноды этой папки видны
16. **Filter tag**: выбрать тег → только ноды с этим тегом
17. **Hide isolated**: чекбокс → изолированные ноды скрыты
18. **Ghost nodes**: неразрешённые ссылки → dashed "?" ноды
19. **Hub badge**: нода с degree ≥ maxDeg×0.4 → accent-soft + badge
20. **prefers-reduced-motion**: включить в DevTools → snap без анимации
21. **Tier 2**: 150 нод → springs off, статичные позиции
22. **Tier 3**: 350 нод → hub-only, cluster circles
23. **Banner**: "Показано N из M конспектов" виден
24. **Dark mode**: переключить тему → гра читаем, wells на stroke
25. **Resize окна**: граф пересчитывает layout без дёрганья

### Настройка vitest

```jsonc
// package.json (queryn-desktop) — добавить
"devDependencies": {
  "vitest": "^3.0.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "jsdom": "^25.0.0"
},
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

```typescript
// vitest.config.ts (новый файл в queryn-desktop/)
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/renderer/test-setup.ts"],
  },
});
```

```typescript
// src/renderer/test-setup.ts (новый)
import "@testing-library/jest-dom";

// Mock window.queryn for tests
globalThis.window.queryn = {
  listProjectTree: vi.fn(),
  listProjectLinks: vi.fn(),
  // ... остальные методы как vi.fn()
} as unknown as typeof window.queryn;
```

---

## 9. Зависимости

### Новые пакеты

| Пакет | Версия | Тип | Назначение | Размер gzip |
|---|---|---|---|---|
| `d3-hierarchy` | ^3.1.2 | dependencies | treemap для folder regions | ~8KB |
| `d3-force` | ^3.0.0 | dependencies | force-directed внутри regions | ~10KB |
| `@types/d3-hierarchy` | ^3.1.7 | devDependencies | TypeScript types | — |
| `@types/d3-force` | ^3.0.10 | devDependencies | TypeScript types | — |
| `vitest` | ^3.0.0 | devDependencies | test runner | — |
| `@testing-library/react` | ^16.0.0 | devDependencies | component testing | — |
| `@testing-library/jest-dom` | ^6.0.0 | devDependencies | DOM assertions | — |
| `jsdom` | ^25.0.0 | devDependencies | test environment | — |

**Итого новых runtime зависимостей:** 2 пакета, ~18KB gzip.

### Существующие пакеты (повторное использование)

| Пакет | Использование |
|---|---|
| `react` (18.3) | hooks, components, refs |
| `lucide-react` (1.20) | иконки (Plus, Minus, Maximize, MoreHorizontal, и др.) |
| `@queryn/types` | ProjectLink, NoteSummary, ProjectTree, ProjectTreeNode |
| `@queryn/project` | listProjectTree, listProjectLinks (через IPC) |

### Не добавляется

- ~~`d3` (full)~~ — нужен только d3-hierarchy + d3-force, не весь d3
- ~~`cytoscape`~~ — избыточен, свой рендеринг
- ~~`dagre` / `elkjs`~~ — Sugiyama не подходит (циклические wiki-ссылки)
- ~~`webcola`~~ — constraint-based layout избыточен для нашей задачи

---

## 4. CSS — обновление `knowledge-graph.css`

### Ключевые изменения

```css
/* --- Рёбра: pencil-ink цвет, NOT accent --- */
.kg-link {
  fill: none;
  stroke: var(--queryn-color-border);        /* было: --queryn-color-accent */
  stroke-width: 1.2;
  stroke-dasharray: none;                     /* было: 4 7 */
  /* БЕЗ animation по умолчанию */
}

/* Flow animation ТОЛЬКО на highlighted edges */
.kg-link--active {
  stroke: var(--queryn-color-accent);
  stroke-width: 2.2;
  stroke-dasharray: 6 4;
  animation: kg-flow 1.2s linear infinite;
}

/* Ghost nodes */
.kg-node--ghost .kg-node__pill {
  fill: transparent;
  stroke: var(--queryn-color-border-soft);
  stroke-dasharray: 4 3;
}
.kg-node--ghost .kg-node__pill-text {
  fill: var(--queryn-color-text-muted);
  font-style: italic;
}
.kg-node--ghost-icon {
  fill: var(--queryn-color-text-muted);
  font-size: 14px;
  font-weight: 600;
}

/* Hub badge */
.kg-node__badge {
  fill: var(--queryn-color-accent);
  rx: 7;
}
.kg-node__badge-text {
  fill: var(--queryn-color-surface-elevated);
  font-size: 9px;
  font-weight: 700;
  text-anchor: middle;
}

/* Selected ring (persistent) */
.kg-node--selected .kg-node__pill-ring {
  opacity: 0.4;                               /* было: только при hover */
}

/* Dimmed (non-neighbor when hover/select) */
.kg-node--dimmed {
  opacity: 0.18;
  transition: opacity 0.18s ease;
}

/* prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .kg-link { animation: none !important; }
  .kg-node { transition: none !important; }
  .kg-well { transition: none !important; }
}

/* Tier 3: cluster summary */
.kg-cluster-summary {
  fill: var(--queryn-color-surface-elevated);
  fill-opacity: 0.3;
  stroke: var(--queryn-color-border-soft);
  stroke-dasharray: 2 4;
}
.kg-cluster-summary__count {
  fill: var(--queryn-color-text-muted);
  font-size: 14px;
  font-weight: 600;
  text-anchor: middle;
}

/* Banner */
.kg-banner {
  position: absolute;
  top: var(--queryn-space-3);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--queryn-space-1) var(--queryn-space-3);
  background: var(--queryn-color-surface-elevated);
  border: 1px solid var(--queryn-color-border-soft);
  border-radius: var(--queryn-radius-md);
  font-size: 12px;
  color: var(--queryn-color-text-muted);
  z-index: 40;
  pointer-events: none;
  user-select: none;
}

/* Search bar */
.kg-search {
  position: absolute;
  top: var(--queryn-space-3);
  left: var(--queryn-space-4);
  z-index: 45;
}
.kg-search__input {
  width: 220px;
  padding: 6px 10px;
  border: 1px solid var(--queryn-color-border-soft);
  border-radius: var(--queryn-radius-md);
  background: var(--queryn-color-surface-elevated);
  font-size: 13px;
  color: var(--queryn-color-text);
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}

/* Dark mode: wells на stroke, не fill */
:root[data-queryn-theme="dark"] .kg-well {
  fill: transparent;
  stroke: var(--queryn-color-border-soft);
  stroke-opacity: 0.6;
}
:root[data-queryn-theme="dark"] .kg-well--active {
  stroke: var(--queryn-color-border-accent);
  stroke-opacity: 1;
}
```

---

## 10. Оценка рисков

| Риск | Вероятность | Влияние | Митигация |
|---|---|---|---|
| **d3-force non-determinism** на разных платформах (float precision) | Низкая | Среднее | Фиксированный seed LCG встроен в d3-force; `simulation.tick(300)` детерминирован. Тест на CI (macOS + Linux). Если drift — переключиться на `deterministicOffset` initial positions + fixed seed |
| **d3-force не сходится** в маленьких treemap cells (ноды вылезают за границы) | Средняя | Среднее | Post-processing: `clamp(x, cell.x0+pad, cell.x1-pad)` после tick. Уменьшить `FORCE_STRENGTH_CHARGE` если cell маленький |
| **Direct-DOM режим ломает hover/select** (React не знает о позиции) | Средняя | Высокое | Hover/select — через React event handlers (onMouseEnter работает на SVG элементах независимо от transform). Позиция для hit-test берётся из `springEngine.positions`, не из React state |
| **Canvas hit-detection неточна** в Tier 3 | Средняя | Низкое | Tier 3 = hub-only режим, мало нод. Hit-test: обратное преобразование `(clickX - tx) / scale`, найти ближайший hub в радиусе 20px |
| **Производительность SpringEngine на 100 нод** через setState | Средняя | Высокое | Порог direct-DOM = 60 нод (не 100). При ≤60 setState приемлемо. При >60 → direct-DOM |
| **Layout пересчёт при resize** вызывает полный re-layout | Высокая | Среднее | Debounce 150ms. Treemap пересчитывается, FD перезапускается. Позиции не сбрасываются (spring к новым target'ам) |
| **Ghost nodes clutter** при большом количестве неразрешённых ссылок | Средняя | Низкое | Limit: показать max 30 ghost nodes. Остальные — счётчик "и ещё N неразрешённых" |
| **Keyboard nav неточна** (arrow direction vs actual position) | Средняя | Низкое | Выбрать ближайшего соседа в октанте направления. Использовать angle между selected→neighbor и direction vector. Cosine similarity > 0.3 |
| **d3-force import tree-shaking** — весь d3 попадает в bundle | Низкая | Низкое | Импорт `import { forceSimulation } from "d3-force"` (named import, tree-shakeable). Не `import * as d3 from "d3"` |
| **Тесты с d3-force** — недетерминированы в jsdom | Средняя | Среднее | d3-force не использует DOM (чистая математика). jsdom OK. Для Layout tests — сравнение с epsilon (0.5px) |
| **CSS animation на 300+ edges** — frame drops | Высокая | Высокое | Animation ТОЛЬКО на highlighted edges (max ~20 при hover). По умолчанию `animation: none`. Tier 2: `edgeOpacity *= 0.7`. Tier 3: Canvas (нет CSS) |

---

## Сводка оценок

| Метрика | Значение |
|---|---|
| Новых файлов | 16 (src) + 4 (tests) + 2 (config) = 22 |
| Модифицируемых файлов | 4 |
| Удаляемых файлов | 1 (`gravity-layout.ts`) |
| Новых runtime зависимостей | 2 (`d3-hierarchy`, `d3-force`) |
| Новых dev зависимостей | 5 (vitest, testing-library, jsdom, types) |
| Общий объём нового кода | ~1700 строк (src ~1500 + tests ~330 + config ~70) |
| Объём удаляемого кода | ~610 строк (KnowledgeGraph.tsx 409 + gravity-layout.ts 205 - переработанное) |
| Чистый прирост | ~1100 строк (за счёт декомпозиции + новых фич) |
| Фаз реализации | 6 |
| Каждая фаза | независимо тестируема |
| Estimated effort | 3-5 дней на разработку + 1 день на тестирование |

---

## Приложение A: `graph-types.ts`

```typescript
import type { NoteSummary } from "../../entities/project/model";

export interface GraphNode {
  id: string;            // relativePath
  title: string;
  relativePath: string;
  folder: string;        // full folder path (e.g. "Lectures/Math")
  tags: string[];
  note: NoteSummary;
  degree: number;
  pillWidth: number;
}

export interface GraphEdge {
  id: string;            // `${source}->${target}`
  source: string;
  target: string;
  resolved: boolean;
  label?: string;
}

export interface GhostNode {
  id: string;            // `${sourceId}:ghost:${rawTarget}`
  sourceId: string;
  rawTarget: string;
  label?: string;
}

export interface GraphCluster {
  folder: string;
  label: string;
  cx: number;
  cy: number;
  radius: number;
  nodeIds: string[];
  usePills: boolean;
  maxPillWidth: number;
}

export interface Viewport {
  scale: number;
  tx: number;
  ty: number;
}

export type ScaleTier = 1 | 2 | 3;

export type RenderMode = "svg-react" | "svg-direct" | "canvas";
```

## Приложение B: `useGraphData.ts`

```typescript
import { useMemo } from "react";
import type { NoteSummary, ProjectLink, ProjectTree } from "../../entities/project/model";
import { useProjectTree } from "../../entities/project/lib/useProjectTree";
import { flattenTree, isNoteNode } from "../../entities/project/lib/tree-utils";
import { estimatePillWidth } from "./graph-utils";
import type { GraphNode, GraphEdge, GhostNode } from "./graph-types";

interface UseGraphDataResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  ghostNodes: GhostNode[];
  loading: boolean;
  error: string | null;
  retry: () => Promise<void>;
}

export function useGraphData(rootPath: string): UseGraphDataResult {
  const { tree, links, loading, message, refresh } = useProjectTree(rootPath);

  const { nodes, edges, ghostNodes } = useMemo(
    () => buildGraphData(tree, links),
    [tree, links]
  );

  return {
    nodes, edges, ghostNodes,
    loading,
    error: message || null,
    retry: refresh,
  };
}

function buildGraphData(
  tree: ProjectTree | null,
  links: ProjectLink[]
): { nodes: GraphNode[]; edges: GraphEdge[]; ghostNodes: GhostNode[] } {
  if (!tree) return { nodes: [], edges: [], ghostNodes: [] };

  const noteNodes = flattenTree(tree.notes).filter(isNoteNode);
  const nodes: GraphNode[] = noteNodes.map((node) => {
    const rp = node.note.relativePath;
    return {
      id: rp,
      title: node.note.title,
      relativePath: rp,
      folder: rp.includes("/") ? rp.slice(0, rp.lastIndexOf("/")) : "",
      tags: node.note.tags ?? [],
      note: node.note,
      degree: 0,
      pillWidth: estimatePillWidth(node.note.title),
    };
  });

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: GraphEdge[] = [];
  const ghostNodes: GhostNode[] = [];
  const seen = new Set<string>();

  for (const link of links) {
    if (link.kind !== "wiki") continue;  // asset links не в графе
    const source = link.sourceNoteRelativePath;
    if (!nodeIds.has(source)) continue;

    if (link.resolved && link.note) {
      const target = link.note.relativePath;
      if (!nodeIds.has(target) || target === source) continue;
      const eid = `${source}->${target}`;
      if (seen.has(eid)) continue;
      seen.add(eid);
      edges.push({ id: eid, source, target, resolved: true, label: link.label });
    } else {
      // Unresolved → ghost node
      const gid = `${source}:ghost:${link.rawTarget}`;
      if (seen.has(gid)) continue;
      seen.add(gid);
      ghostNodes.push({
        id: gid,
        sourceId: source,
        rawTarget: link.rawTarget,
        label: link.label,
      });
    }
  }

  // Compute degrees
  const deg = new Map<string, number>();
  for (const e of edges) {
    deg.set(e.source, (deg.get(e.source) ?? 0) + 1);
    deg.set(e.target, (deg.get(e.target) ?? 0) + 1);
  }
  // Ghost out-links count toward degree
  for (const g of ghostNodes) {
    deg.set(g.sourceId, (deg.get(g.sourceId) ?? 0) + 1);
  }
  for (const n of nodes) n.degree = deg.get(n.id) ?? 0;

  return { nodes, edges, ghostNodes };
}
```

## Приложение C: `graph-physics.ts`

```typescript
import type { GraphNode } from "./graph-types";

const STIFFNESS = 0.15;
const DAMPING = 0.80;
const THROW_FACTOR = 0.35;
const MAX_THROW = 18;
const SETTLE_THRESHOLD = 0.4;

export class SpringEngine {
  private targets = new Map<string, { x: number; y: number }>();
  private positions = new Map<string, { x: number; y: number }>();
  private velocities = new Map<string, { vx: number; vy: number }>();
  private springing = new Set<string>();
  private pinned = new Set<string>();
  private lastTime = 0;
  private reducedMotion = false;

  setTargets(targets: Map<string, { x: number; y: number }>): void {
    this.targets = new Map(targets);
    for (const [id, t] of targets) {
      if (!this.positions.has(id)) {
        this.positions.set(id, { ...t });
      }
      this.springing.add(id);
    }
    this.velocities.clear();
  }

  setReducedMotion(value: boolean): void {
    this.reducedMotion = value;
  }

  getPosition(id: string): { x: number; y: number } | undefined {
    return this.positions.get(id);
  }

  get allPositions(): Map<string, { x: number; y: number }> {
    return this.positions;
  }

  dragStart(id: string): void {
    this.springing.delete(id);
    this.velocities.delete(id);
  }

  dragMove(id: string, x: number, y: number): void {
    this.positions.set(id, { x, y });
  }

  dragEnd(id: string, vx: number, vy: number): void {
    const throwVx = Math.max(-MAX_THROW, Math.min(MAX_THROW, vx * THROW_FACTOR));
    const throwVy = Math.max(-MAX_THROW, Math.min(MAX_THROW, vy * THROW_FACTOR));
    this.velocities.set(id, { vx: throwVx, vy: throwVy });
    if (this.reducedMotion) {
      const t = this.targets.get(id);
      if (t) this.positions.set(id, { ...t });
    } else {
      this.springing.add(id);
    }
  }

  pin(id: string): void {
    this.pinned.add(id);
    this.springing.delete(id);
    this.velocities.delete(id);
  }

  unpin(id: string): void {
    this.pinned.delete(id);
    this.springing.add(id);
  }

  isSettled(): boolean {
    return this.springing.size === 0;
  }

  tick(now: number): boolean {
    if (this.springing.size === 0) return false;
    if (this.reducedMotion) {
      for (const id of this.springing) {
        const t = this.targets.get(id);
        if (t) this.positions.set(id, { ...t });
      }
      this.springing.clear();
      this.velocities.clear();
      return false;
    }

    const rawDt = this.lastTime === 0 ? 1 : (now - this.lastTime) / 16.67;
    const dt = Math.max(0.5, Math.min(rawDt, 2));
    this.lastTime = now;

    let active = false;
    for (const id of this.springing) {
      if (this.pinned.has(id)) continue;
      const t = this.targets.get(id);
      const c = this.positions.get(id);
      if (!t || !c) continue;
      const v = this.velocities.get(id) ?? { vx: 0, vy: 0 };
      const nvx = (v.vx + (t.x - c.x) * STIFFNESS * dt) * Math.pow(DAMPING, dt);
      const nvy = (v.vy + (t.y - c.y) * STIFFNESS * dt) * Math.pow(DAMPING, dt);
      this.velocities.set(id, { vx: nvx, vy: nvy });
      const nx = c.x + nvx * dt;
      const ny = c.y + nvy * dt;
      this.positions.set(id, { x: nx, y: ny });

      if (
        Math.abs(t.x - nx) < SETTLE_THRESHOLD &&
        Math.abs(t.y - ny) < SETTLE_THRESHOLD &&
        Math.abs(nvx) < SETTLE_THRESHOLD &&
        Math.abs(nvy) < SETTLE_THRESHOLD
      ) {
        this.positions.set(id, { x: t.x, y: t.y });
        this.springing.delete(id);
        this.velocities.delete(id);
      } else {
        active = true;
      }
    }
    return active;
  }
}
```
