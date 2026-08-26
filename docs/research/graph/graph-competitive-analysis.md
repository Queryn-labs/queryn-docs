---
authority: informational
lifecycle: archived
---

# Competitive Anti-Pattern Analysis: Knowledge Graph Visualization

> Угол: конкурентный анализ. Что СУЩЕСТВУЕТ на рынке, почему КАЖДЫЙ паттерн
> проваливается, и какие визуальные метафоры НЕ использует НИ ОДИН инструмент —
> но которые были бы идеальны для student-focused note-taking app.
>
> Дополняет `graph-cognitive-metaphors.md` (когнитивный угол) и
> `graph-layout-research.md` (алгоритмический угол).

---

## I. Конкурентный каталог: что существует

### Паттерн 1: Force-directed soup

**Инструменты:** Obsidian, Logseq, Anytype, Capacities, Napkin.ai, Trilium (graph view), SiYuan

**Визуальный паттерн:** Точки в пустом пространстве. Линии связей. Физическая
симуляция (Fruchterman-Reingold, ForceAtlas2, d3-force) считает позиции. Folders
кодируются цветом точек — НЕ положением. Background — обычно чёрный void.

**Почему проваливается (по инструментам):**

| Инструмент | Специфика провала |
|---|---|
| **Obsidian** | Hairball при 200+ нодах. Позиция = результат physics, не смысла. При каждом открытии layout отличается (seed зависит от порядка). Folders — только цвет. Cross-folder links — spaghetti через весь canvas. Graph view — декорация, реальная навигация — через sidebar |
| **Logseq** | То же, но хуже: graph view — second-class citizen. Главная навигация — outliner. Graph не интегрирован в workflow |
| **Anytype** | Graph почти идентичен Obsidian. Object types — цвета. Те же hairball, та же meaningless position |
| **Capacities** | Force-directed + AI-группировка. AI пытается кластеризовать, но результат нестабилен и непредсказуем |
| **Napkin.ai** | AI-организованный force-directed. Выглядит "умно", но позиция = AI-эвристика, не user's mental model |

**Мета-провал:** Position carries no meaning. Где нода оказалась — результат
physics simulation, не семантического отношения. Мозг не может сформировать
cognitive map (Tolman, 1948), потому что "карта" меняется при каждом запуске.

---

### Паттерн 2: Manual whiteboard

**Инструменты:** Heptabase, Scrintal, Milanote, Kosmik, tldraw (as PKM), Fabric

**Визуальный паттерн:** Бесконечный canvas. Ноды — карточки. Пользователь
сам перетаскивает и группирует. Линии связей — ручные или auto-detected.

**Почему проваливается:**

| Инструмент | Специфика провала |
|---|---|
| **Heptabase** | Лучший в классе для intentional organization. Но: требует ручного труда. При 200+ карточек — canvas становится overwhelming. Нет auto-layout. Folders = manual groups. Knowledge = где ты её положил, не где она логически принадлежит |
| **Scrintal** | То же. Manual canvas + metadata. Нет graph auto-organization |
| **Milanote** | Canvas для creative work, не для knowledge management. Links — слабые, folders — manual |
| **Kosmik** | AI-assisted canvas. AI предлагает группировку, но финальное положение — manual |
| **Fabric** | AI-organized, но всё ещё canvas. AI группирует, но не делает иерархию видимой |

**Мета-провал:** Manual effort doesn't scale. При 10 карточках — отлично. При 200
— хаос. Нет auto-organization → graph не помогает понять структуру, только
отображает то, что user и так знает (потому что сам расставил).

---

### Паттерн 3: Decorative graph

**Инструменты:** Roam Research, RemNote

**Визуальный паттерн:** Graph view существует, но не используется для реальной
навигации. Главная навигация — inline backlinks, block references, breadcrumbs.

**Почему проваливается:**

| Инструмент | Специфика провала |
|---|---|
| **Roam Research** | Graph — "красивая картинка" для скриншотов. Реальная работа — в block references и inline links. Graph не помогает найти нужную заметку. Folders отсутствуют (Roam — flat graph, нет иерархии) |
| **RemNote** | Graph — вторичный. Главное — flashcards + outliner. Graph не интегрирован в study workflow |

**Мета-провал:** Graph disconnected from navigation. Если graph не помогает
перемещаться по знаниям — он бесполезен. Student открывает graph, смотрит,
закрывает, возвращается к списку.

---

### Паттерн 4: No graph — pure hierarchy

**Инструменты:** Notion, Reflect, Workflowy, Dynalist, AppFlowy

**Визуальный паттерн:** Sidebar tree. Folders и pages в списке. Backlinks —
как текстовый список внизу страницы. Graph — отсутствует.

**Почему проваливается:**

| Инструмент | Специфика провала |
|---|---|
| **Notion** | Мощная database система, но нет graph view. Cross-page connections видны только через backlinks list. Невозможно увидеть структуру знаний сверху. Folders = sidebar tree, не визуальная карта |
| **Reflect** | Backlinks list. Graph отсутствует. Чистый text-based navigation |
| **Workflowy / Dynalist** | Outliner. Нет graph. Иерархия = indentation. Connections невидимы |
| **AppFlowy** | Notion clone. Tree sidebar. Нет graph |

**Мета-провал:** Can't see connections. Student не видит, что конспект по
термодинамике связан с конспектом по статистической физике. Знания — изолированные
острова в sidebar.

---

### Паттерн 5: Tag/text network

**Инструменты:** TiddlyWiki (with plugins), InfraNodus

**Визуальный паттерн:** Graph строится из текста или тегов, не из note-to-note
links. Nodes — концепты/слова, не заметки.

**Почему проваливается (для student note-taking):**

| Инструмент | Специфика провала |
|---|---|
| **TiddlyWiki** | Tag-based. С плагинами — graph view, но force-directed. Tags ≠ folders. Нет folder hierarchy в graph. По умолчанию — нет graph вообще |
| **InfraNodus** | Text network analysis. Nodes — слова, не заметки. Показывает knowledge gaps (что интересно), но не помогает навигировать по заметкам. Другой unit of analysis |

**Мета-провал:** Wrong unit of analysis. Graph концептов ≠ graph заметок. Student
хочет кликнуть на заметку и открыть её, не на слово и посмотреть его контекст.

---

### Паттерн 6: Radial "plex" (local view)

**Инструменты:** TheBrain

**Визуальный паттерн:** Central node в центре. Parent, children, jump links
расходятся радиально. Это LOCAL view, не global. При навигации — анимированный
переход к новому central node.

**Почему проваливается (для student note-taking):**

| Инструмент | Специфика провала |
|---|---|
| **TheBrain** | Innovation: radial plex вместо global soup. Но: нет global overview (всегда локальный view). При 200+ nodes — бесконечное "путешествие" от node к node. Folders = types, не visual regions. Платный, сложный, не для студентов |

**Что работает (единственный инструмент с полезным паттерном):** Local radial
view даёт context — "вот эта заметка, вот её соседи". Это полезно. Но без
global overview — student теряется.

---

### Паттерн 7: Tree + list (split view)

**Инструменты:** Trilium (tree + relation map), Obsidian (sidebar + graph)

**Визуальный паттерн:** Sidebar tree для folders, отдельный graph view для
links. Два раздельных представления.

**Почему проваливается:**

| Инструмент | Специфика провала |
|---|---|
| **Trilium** | Tree sidebar + relation map (force-directed). Два view не интегрированы. Folder hierarchy в tree, graph topology в map — никогда одновременно |
| **Obsidian** | То же. Sidebar = folders. Graph = links. Никогда не показывают folder boundaries В графе |

**Мета-провал:** Hierarchy and graph are SEPARATED. Student видит folders В
sidebar и links В graph — но никогда не видит, как links пересекают folder
boundaries. Это именно то, что должно быть visible.

---

## II. Три мета-провала (что объединяет ВСЕ существующие решения)

### Мета-провал 1: The Position Problem

В КАЖДОМ существующем инструменте позиция ноды — либо:

- **Meaningless** (force-directed: позиция = physics, не семантика)
- **Manual** (canvas: позиция = куда user положил)
- **Absent** (no graph: нет позиции вообще)

Никто не делает позицию **функцией двух сил**: folder membership (где заметка
"живёт") и link topology (что к ней тянет). Это именно то, что Osnova может
эксплуатировать: folder hierarchy даёт **позиционный якорь**, wiki-links даёт
**pull force**, и напряжение между ними **ЕСТЬ визуализация**.

---

### Мета-провал 2: The Scale Problem

Каждый визуальный паттерн ломается при определённом масштабе:

| Паттерн | Ломается при | Как |
|---|---|---|
| Force-directed | ~200 notes | Hairball |
| Manual canvas | ~50 notes | Overwhelming |
| Decorative graph | ~100 notes | Бесполезен |
| No graph | N/A | Не помогает |
| Tag network | ~500 concepts | Hairball |
| Radial plex | ~200 notes | Infinite travel |
| Tree + list | ~500 notes | Scroll fatigue |

White space: метафоры с **встроенной multi-scale структурой**. Map: world →
country → city → street. Tree: forest → tree → branch → leaf. Strata: column →
layer → grain. Эти метафоры имеют **естественные zoom levels** — каждый уровень
имеет смысл, в отличие от Obsidian, где zoom = просто масштабирование hairball.

---

### Мета-провал 3: The Physics-as-Decoration Problem

В Obsidian physics симулирует гравитацию/заряд — но результат **бессмыслен**.
Нода оказалась там, где physics её посадил. Это декорация, не информация.

White space: physics, которая **кодирует смысл**. Когда нода тянется к границе
своего folder-региона — это не хаос, это **данные**: у этой заметки много
cross-folder links. Когда branch гнётся к vine-connected leaf — это не баг, это
**информация**: эти две темы связаны. The tension IS the visualization.

---

## III. White Space: 5 направлений

> Каждое направление — НЕ используется НИ ОДИН существующим инструментом,
> НЕ повторяет 7 метафор из `graph-cognitive-metaphors.md` (или существенно
> отличается углом), и эксплуатирует folder hierarchy + wiki-links.

---

### Направление 1: Tectonic Borders — folders как плиты, notes как города на границах

#### Core idea

Folders — **тектонические плиты** (tectonic plates): регионы с видимыми
границами (borders). Notes — точки внутри плит. Wiki-links — **мосты** (bridges)
между точками на разных плитах.

**Ключевая инновация (не делает НИКТО):** Notes с большим количеством
cross-folder links **мигрируют к границе** своей плиты. Это emergent behavior
из physics: folder centroid — жёсткий spring (якорь), cross-folder links —
мягкие springs (тяга). Нота с 10 cross-folder links и 2 intra-folder links
естественно оседает **на краю** своего региона, притягиваемая внешними связями.

Физика ЕСТЬ информация: пограничные ноды = **bridge concepts**. Студент видит,
какие конспекты соединяют разные предметы — не читая ни одной ссылки.

#### Physics

```
F_total = F_folder_anchor (stiff, keeps note in region)
        + F_link_pull (soft, pulls toward linked notes in other regions)
        + F_repulsion (prevents overlap)

Note with many cross-folder links → F_link_pull dominates at region edge
→ note migrates to border → VISIBLE bridge concept
```

`stiffness_anchor = 0.20`, `stiffness_link = 0.08`, `damping = 0.82`

Folder centroids располагаются через force-directed на **folder graph** (folders
как supernodes, cross-folder link count как edge weight). Плиты с большим
количеством mutual links — рядом.

#### Folder encoding

- **Borders**: solid 1px lines (как государственные границы на карте). Не
  dashed, не translucent — **чёткие границы**
- **Region fill**: subtle tint (folder color, 5% opacity)
- **Label**: в углу региона, как название страны на карте
- **Nested folders**: sub-regions внутри parent, с более тёмным tint

#### Link rendering

- **Intra-folder links**: тонкие прямые линии внутри плиты. Короткие, локальные
- **Cross-folder links**: дуги (quadratic bezier), огибающие другие плиты.
  Толщина ∝ link importance. При hover — подсветка + flow animation
- **Bridge clusters**: когда несколько links идут между двумя плитами, они
  **bundle** в один "мостовой коридор" (edge bundling) — чисто, без spaghetti

#### Scaling

| Scale | What's visible | What's hidden |
|---|---|---|
| 10 notes | 2-3 plates, all notes, all bridges | — |
| 50 notes | 5-8 plates, all notes, bridge corridors | Individual link labels |
| 200 notes | 10-15 plates, hub notes at borders, bridge corridors | Non-hub notes (appear on zoom) |

Multi-scale: zoom out → see plates and bridge corridors (как карта континента).
Zoom in → see individual notes and links (как карта города).

#### Why it's white space

- **Obsidian/Logseq/Anytype**: folders = цвет, не границы. Нет border migration
- **Heptabase**: manual borders, не emergent
- **TheBrain**: нет regions, нет borders
- **Nobody**: physics-based border migration where position IS information

#### Student value

Студент видит: "Конспект по 'Векторные пространства' — на границе между
Математикой и Физикой. Он bridge concept." Это **именно то**, что нужно для
interdisciplinary understanding — без чтения, без поиска, просто из позиции.

#### Implementation

- Layout: folder graph force-directed → plate centroids → per-region constrained
  force-directed (notes pulled by links but constrained to region)
- SVG: `<rect>` для границ, `<circle>` для notes, `<path>` для bridges
- Edge bundling: bundle cross-folder links by target plate (group → single
  bezier corridor)
- Compatible with existing `graph-layout.ts` architecture (folder graph +
  per-region FD), but adds border migration physics

---

### Направление 2: Knowledge Topography — link density как рельеф местности

#### Core idea

Граф выглядит на **топографическую карту** (topographic map). Link density
создаёт "высоту": области с плотными связями — **холмы/пики** (knowledge peaks),
области с редкими связями — **равнины/впадины** (knowledge deserts). Folders —
**долины** (valleys): естественные впадины, где ноды сгруппированы.

**Ключевая инновация (не делает НИКТО):** Топография ВЫЧИСЛЯЕТСЯ из данных, не
задаётся вручную. Каждая нода имеет "высоту" = её degree. Между нодами —
контурные линии (contour lines), показывающие gradient link density. Студент
видит "горный хребет" связей между Математикой и Физикой — и "пустыню" между
Математикой и Литературой.

#### Physics

Ноды не имеют traditional spring physics. Вместо этого:

1. **Density field**: вычислить 2D Gaussian kernel density из note positions +
   link weights. Peaks = dense link areas
2. **Contour generation**: marching squares algorithm → SVG `<path>` contour
   lines at discrete density levels
3. **Node "float"**: ноды имеют subtle spring, удерживающий их у локального
   density maximum (как объекты, осевшие в низинах рельефа). `stiffness=0.08,
   damping=0.85` — очень мягкий, "геологический" feel

Folder regions: вычисляются через treemap (детерминированный). Но вместо
прямых границ — ** organic borders**, следующие контурным линиям. Folders с
плотными internal links = глубокие долины. Folders с редкими links = плоские
равнины.

#### Visual

- **Background**: subtle gradient (топографическая карта — warm/cool по density)
- **Contour lines**: тонкие, полупрозрачные (5-15% opacity). Как на
  географической карте. Каждый 5-й контур — толще (index contour)
- **Notes**: circles, размер = degree. Hub = large + accent glow
- **Folders**: organic regions (не прямоугольники!), границы = контурные линии
- **Links**: тонкие линии, но ВТОРИЧНЫ. Главное — рельеф. Links подсвечиваются
  только при hover
- **Cross-folder links**: видны как "перевалы" (mountain passes) — разрывы в
  контурных линиях между двумя пиками

#### Scaling

| Scale | What's visible | What's hidden |
|---|---|---|
| 10 notes | Gentle topography, all notes, all contours | — |
| 50 notes | Clear peaks and valleys, hub notes on peaks | Individual links |
| 200 notes | Mountain ranges, knowledge deserts, major passes | Non-hub notes, fine contours |

Multi-scale: zoom out → see mountain ranges and deserts (как спутниковый снимок).
Zoom in → see individual notes and local topography (как топокарта 1:25000).

#### Why it's white space

- **Nobody** shows link density as topography. Obsidian shows density as cluster
  tightness (implicit, unreadable). InfraNodus shows text network density but
  not as topography
- **Cognitive metaphors doc** proposed Terraced Landscape, но там elevation =
  folder hierarchy (задаётся), не link density (вычисляется). Фундаментальная
  разница: здесь рельеф = ДАННЫЕ, не структура

#### Student value

Студент видит: "У меня плотный 'горный хребет' между Алгеброй и Геометрией
(много связей), но 'пустыня' между Алгеброй и Историей (почти нет связей)."
Это помогает понять, **где знания связаны, а где — изолированы**. Knowledge
gaps видны как топографические впадины.

#### Implementation

- Density field: 2D histogram → Gaussian smoothing → marching squares for
  contours. ~100 строк
- SVG: `<path>` для contour lines, `<circle>` для notes, `<radialGradient>` для
  hub glow
- Folder regions: treemap → organic border approximation (simplify contour at
  folder boundary level)
- Compatible with existing layout: treemap for regions, FD for positions, THEN
  density computation as visual overlay

---

### Направление 3: Temporal Strata — время как вертикальная ось, knowledge archaeology

#### Core idea

Граф выглядит на **геологический разрез** (stratigraphic column). Y-ось = время
создания заметки (creation date). Нижние слои — старые заметки. Верхние слои —
новые. Folders — **цветовые регионы** внутри слоёв (не отдельные горизонтальные
полосы, а colored zones within strata). Wiki-links — **корни** (roots), crossing
strata: заметка из верхнего слоя может ссылаться на заметку из нижнего.

**Ключевая инновация (не делает НИКТО):** Время = spatial axis. Студент видит
свою **learning journey** — как знания накапливались. "Я начал с основ
математики (нижний слой), потом добавил физику (средний слой), и вот теперь
связываю их в курсовой (верхний слой)." Это **knowledge archaeology**: каждый
слой = период обучения.

#### Physics

```
Y-position = f(creation_timestamp) — ДЕТЕРМИНИРОВАН, не physics
  → linear mapping: y = (timestamp - minTime) / (maxTime - minTime) * height

X-position = spring-based:
  F_x = F_folder_group (pull toward folder's x-centroid)
      + F_link_pull (pull toward linked notes' x-positions)
      + F_repulsion (prevent overlap)

Y is CLAMPED to stratum — note cannot leave its temporal layer
X is free — physics organizes within stratum
```

`stiffness_folder_x = 0.15`, `stiffness_link_x = 0.10`, `damping = 0.80`

Subtle vertical jitter: notes with many links to ADJACENT strata drift slightly
toward that stratum (как fossils, slightly displaced). Это physics-as-information:
заметка, дрейфующая вверх = "тянутая" к более новому знанию.

#### Folder encoding

- **Folders**: colored zones within strata. Notes of the same folder have the
  same tint. Folder boundaries = convex hull around same-folder notes within
  a stratum
- **Folder labels**: floating, positioned at the centroid of folder's notes
- **Nested folders**: sub-colors within parent color (hue variation)

#### Link rendering

- **Intra-folder links**: short curves within a stratum (same Y level)
- **Cross-folder links**: curves between different x-positions within a stratum
- **Cross-strata links**: longer curves crossing Y levels. These are the
  **roots** — connections from new knowledge to old knowledge. Visually
  prominent (thicker, accent color)
- **Upward roots** (new → old): "я опираюсь на..." — prominent, thicker
- **Downward shoots** (old → new): "это развивается в..." — thinner, dashed

#### Scaling

| Scale | What's visible | What's hidden |
|---|---|---|
| 10 notes | All strata, all notes, all roots | — |
| 50 notes | Clear layering, hub notes, major roots | Minor links |
| 200 notes | Thick strata, knowledge growth pattern, major roots | Non-hub notes, fine links |

Multi-scale: zoom out → see the full "geological column" (semester 1 → semester
2 → exam prep). Zoom in → see individual notes within a stratum.

**Vertical scroll** = travel through time. Это **естественный navigation metaphor**:
scroll down = go back in time. Никаких специальных timeline controls.

#### Why it's white space

- **Nobody** uses time as a spatial axis in the graph view. Obsidian has a
  timeline plugin (separate, not integrated with graph). Roam shows dates in
  page titles. Nobody makes creation date a **spatial dimension**
- **Cognitive metaphors doc** proposed Terraced Landscape (elevation = folder
  hierarchy) and Neural Layers (Y = folder). Это ФУНДАМЕНТАЛЬНО другое: Y = TIME,
  не folder. Folder = color, не position

#### Student value

1. **Learning journey**: видеть, как знания накапливались во времени. Мотивация
   ("я уже столько сделал") и обзор ("вот когда я начал изучать X")
2. **Review scheduling**: старые слои = candidates for review (spaced
   repetition principle). Визуально видно, что давно не трогал
3. **Knowledge evolution**: cross-strata links показывают, как старые концепты
   развиваются в новые. "Я написал про производные в сентябре, и вот в декабре
   они связаны с интегралами"
4. **Temporal gaps**: пустые слои = периоды без заметок. "Я ничего не писал
   две недели" — виден как пустая полоса

#### Implementation

- Y-mapping: sort notes by `note.createdAt` → linear interpolation. ~10 строк
- X-layout: per-stratum constrained force-directed (only X freedom). ~50 строк
- SVG: `<line>` для strata boundaries, `<path>` для roots, `<circle>` для notes
- Compatible with existing `graph-layout.ts`: replace treemap with temporal
  binning + per-stratum FD
- Data requirement: `note.createdAt` — проверить, есть ли в `NoteSummary`

---

### Направление 4: Tension Field — folders как магнитные полюса, field lines = связи

#### Core idea

Граф выглядит на **визуализацию электромагнитного поля** (iron filings over
magnets). Folders — **магнитные полюса** (poles): крупные nodes в центрах
регионов. Notes — **частицы** (particles) в поле между полюсами. Wiki-links —
**силовые линии** (field lines): видимые линии, показывающие направление и
силу "притяжения" между топиками.

**Ключевая инновация (не делает НИКТО):** Field lines ВЫЧИСЛЯЮТСЯ из link
topology, не рисуются как прямые A→B. Каждый folder генерирует "магнитное поле"
(силовой профиль ∝ количеству notes + сумме link weights). Notes притягиваются
к своему folder-полюсу (anchor) и к linked notes в других полях (link pull).
Результирующее поле визуализируется как **field lines** — плавные кривые,
показывающие "направление знаний".

Physics — **буквально** electromagnetic simulation. Field = data. Lines = data.
Position = data. Всё — информация.

#### Physics

```
Each folder F_i has:
  charge Q_i = noteCount_i × avgDegree_i  (folder "importance")
  position P_i = centroid (from folder graph layout)

Each note N_j has:
  charge q_j = degree_j  (note "centrality")
  position = equilibrium in field

Field at point (x,y):
  B(x,y) = Σ_i Q_i / dist((x,y), P_i)² × direction(P_i → (x,y))

Note position: equilibrium where F_folder + F_links = 0
Field lines: traced from each note through field gradient → SVG paths
```

`stiffness_field = 0.12`, `damping = 0.80`

Field lines: start at each note, follow field gradient, stop at next pole или
after maxSteps. Render как SVG `<path>` с `stroke-dasharray` для subtle flow.

#### Visual

- **Poles (folders)**: large circles (40-60px radius) with folder name inside.
  Size ∝ charge (importance). Accent color glow
- **Particles (notes)**: small circles (8-15px). Size ∝ degree. Positioned in
  field equilibrium
- **Field lines**: thin curves (1px, 30% opacity), flowing between poles. Like
  iron filings on paper over magnets. NOT the same as link lines — field lines
  show the FIELD, not individual connections
- **Link lines**: drawn ON TOP of field lines, thinner, accent color on hover.
  Individual A→B connections visible when needed
- **Background**: subtle field strength gradient (heatmap-like, very faint)

#### Folder encoding

- **Folders = poles**: inherently visual. Each folder IS a large named circle.
  No separate boundary/region needed — the pole IS the folder
- **Nested folders**: sub-poles orbiting parent pole (like moon around planet).
  Smaller circles near parent
- **Folder regions**: implicit (notes cluster around their pole). Can add subtle
  convex hull if desired

#### Link rendering

Two layers:
1. **Field lines** (bottom layer): computed from field gradient. Show overall
   "knowledge flow direction". Not individual links — field trends
2. **Link lines** (top layer): individual wiki-links. Thin, mostly hidden, light
   up on hover. Show specific connections when needed

This separation is KEY: field lines = macro structure (what topics pull toward
what), link lines = micro structure (which specific note links to which).

#### Scaling

| Scale | What's visible | What's hidden |
|---|---|---|
| 10 notes | All poles, all particles, all field lines, all link lines | — |
| 50 notes | Poles, hubs, field lines | Non-hub particles, individual link lines |
| 200 notes | Major poles, field line patterns, hub clusters | Individual particles, link lines (field lines carry the overview) |

Multi-scale: zoom out → see field pattern (как magnetic field photography). Zoom
in → see individual particles and specific links.

#### Why it's white space

- **Nobody** uses electromagnetic field metaphor for knowledge graphs. Closest:
  Obsidian's charge/repulsion physics, but it's INVISIBLE (physics is internal,
  result is dots). Here, the FIELD is visible
- **Cognitive metaphors doc** proposed Mycelium (organic network) — но это
  ТЕХНИЧЕСКАЯ, не органическая метафора. Field lines — это physical science
  metaphor, что может appeals to STEM students

#### Student value

1. **Knowledge "gravity"**: видно, какие topics "притягивают" больше заметок.
   Hub folders = сильные полюса. Periphery = слабые
2. **Field direction**: field lines показывают, куда "движутся" знания. Если
   линии тянутся от Математики к Физике — это значит, много math notes
   reference physics. Visually immediate
3. **Balance/imbalance**: notes в "equilibrium" между двумя poles = bridge
   concepts (как в Tectonic Borders, но visualized через field, не через
   position at border)
4. **STEM aesthetic**: для физиков/математиков — знакомая визуализация. Iron
   filings, field lines, charges — это из школьной физики. Zero learning curve
   для STEM students

#### Implementation

- Field computation: O(folders × notes) per tick. For 15 folders × 200 notes =
  3000 ops/tick — trivial
- Field line tracing: start at each note, step along gradient, ~20 steps max.
  ~80 строк
- SVG: `<circle>` для poles/particles, `<path>` для field lines + link lines
- Compatible with existing layout: folder graph → pole positions → field-based
  note placement (replaces per-folder FD)
- Risk: field metaphor может confuse non-STEM students. Нужно user testing

---

### Направление 5: Hierarchical Edge Bundles — radial tree с bundled cross-links

#### Core idea

Граф выглядит на **radial tree** (дерево, растущее из центра). Folder hierarchy
= radiating branches (root в центре, folders — major branches, sub-folders —
sub-branches, notes — leaves на ветках). Wiki-links, пересекающие folder
boundaries — **bundled edges** (иерархически упакованные связи): они route
**вдоль структуры дерева**, создавая плавные дуги вместо Obsidian's spaghetti.

**Ключевая инновация (не делает НИКТО в PKM):** Hierarchical edge bundling
(Holten, 2006) — известная техника в data visualization, но НИ ОДИН note-taking
tool её не использует. Cross-folder links route вдоль tree structure, создавая
**чистые, читаемые пучки** связей вместо хаотичных линий.

#### Physics

Tree layout — **детерминированный** (d3.tree() radial projection). Никакой
force-directed. Но:

- **Leaf jitter**: notes (leaves) имеют subtle spring jitter вдоль своей ветки
  (±5px). `stiffness=0.10, damping=0.85` — органичный micro-movement
- **Bundled edges**: computed via Holten's algorithm (control points along tree
  path, tension parameter controls bundling tightness). НЕ physics — geometry
- **Hover perturbation**: при hover на leaf, связанные bundled edges "раскрываются"
  (tension уменьшается, edges расходятся). Physics spring на tension parameter

```
Tree layout: d3.hierarchy(folderTree) → d3.tree().size([2π, radius]) → radial
Bundled edges: for each cross-link (A, B):
  path = tree_path(LCA(A, B), A) + tree_path(LCA(A, B), B)
  control_points = sample_along_path(path, tension=0.8)
  edge = bezier_through(control_points)
```

LCA = Lowest Common Ancestor in folder tree. Tension = 0.8 (high = tight bundles,
low = loose, individual edges).

#### Visual

- **Tree**: radial, root в центре. Branches = thick lines (1.5px). Sub-branches =
  thinner (1px). Leaves = small circles на концах веток
- **Folder labels**: на major branches, curved text along branch arc
- **Notes (leaves)**: circles на концах веток. Size = degree. Hub = large + accent
- **Bundled edges**: smooth bezier curves, routing along tree structure. Like
  fiber optic cables following a conduit. Color: subtle (border color). On hover:
  accent + flow animation
- **Bundle thickness**: где много links идут в одном направлении — bundle толще.
  Visually: "толстый кабель" = много связей между двумя ветками дерева

#### Folder encoding

- **Folders = branches**: inherently hierarchical. Parent folder → major branch.
  Sub-folder → sub-branch. Notes → leaves
- **Folder boundaries**: implicit (branch structure). No separate borders needed
- **Nesting depth**: encoded by branch length / distance from center. Deeper =
  further from center

#### Link rendering

- **Intra-folder links**: short curves between leaves on the same branch.
  Barely visible (same-branch connections are structurally obvious)
- **Cross-folder links (bundled edges)**: THE KEY VISUAL. These are the
  "interesting" connections — they cross branch boundaries. Bundled routing
  makes them clean, not spaghetti
- **Bundle highlighting**: hover on a leaf → all its bundled edges light up
  (accent color, flow animation). Other edges dim. User sees exactly which
  cross-folder connections this note has

#### Scaling

| Scale | What's visible | What's hidden |
|---|---|---|
| 10 notes | Full tree, all leaves, all edges | — |
| 50 notes | Tree structure, all leaves, bundled edges | Individual edge labels |
| 200 notes | Major branches, hub leaves, thick bundles | Non-hub leaves (appear on zoom into branch) |

Multi-scale: zoom out → see tree silhouette + major bundles (как рентген
дерева). Zoom into a branch → see individual leaves + their cross-connections.
Zoom into a leaf → see its specific bundled edges lighting up.

**Natural zoom levels:** root → folder branch → sub-folder branch → note leaf.
Each level has meaning (unlike Obsidian where zoom is just scale).

#### Why it's white space

- **Nobody in PKM** uses hierarchical edge bundling. Holten (2006) proposed it
  for software dependency visualization. It's used in D3 examples, scientific
  papers, but NOT in Obsidian/Logseq/Anytype/Heptabase/etc
- **Cognitive metaphors doc** proposed Constellation Map (sectors + links), но
  без edge bundling. Constellation = flat sectors. Hierarchical edge bundles =
  proper TREE with bundled routing. Фундаментальная разница в edge rendering:
  Constellation draws straight lines, HEB routes along tree structure

#### Student value

1. **Hierarchy is OBVIOUS**: tree structure = folder structure. Никаких
   "где эта папка?" — ветка показывает. Это最强 hierarchy visualization
2. **Cross-folder connections are CLEAN**: bundled edges вместо spaghetti.
   При 200 notes и 50 cross-links —Obsidian = hairball, HEB = organized bundles
3. **Bundle thickness = relationship strength**: толстый bundle между "Алгебра"
   и "Геометрия" = много связей. Тонкий между "Алгебра" и "История" = мало
4. **Zoom = drill-down**: zoom into "Математика" branch → see all math notes
   and their cross-connections. Natural, intuitive

#### Implementation

- Tree layout: `d3.hierarchy()` + `d3.tree().size([2π, radius])` — built-in, ~10
  строк
- Edge bundling: Holten's algorithm — compute tree path between LCA and each
  endpoint, sample control points, draw bezier. ~100 строк
- SVG: `<path>` для tree branches, `<path>` для bundled edges, `<circle>` для
  leaves. Curved text (`<textPath>`) для branch labels
- Compatible with existing `graph-layout.ts`: replace treemap with d3.tree radial,
  replace per-folder FD with leaf jitter springs, ADD edge bundling pass
- Library: `d3-hierarchy` (already planned). Edge bundling: custom (~100 строк)
  или `d3.cluster()` + manual bezier

---

## IV. Сводная таблица: white space направления

| Критерий | Tectonic Borders | Knowledge Topography | Temporal Strata | Tension Field | Hierarchical Edge Bundles |
|---|---|---|---|---|---|
| **Novelty** | ★★★★★ nobody does border migration | ★★★★★ nobody does density topography | ★★★★★ nobody uses time as axis | ★★★★★ nobody uses field metaphor | ★★★★☆ known technique, nobody in PKM |
| **Student value** | ★★★★★ bridge concepts visible | ★★★★☆ knowledge gaps visible | ★★★★★ learning journey visible | ★★★★☆ knowledge gravity visible (STEM) | ★★★★☆ clean cross-links at scale |
| **Folder encoding** | bordered regions | organic regions (contour) | colored zones in strata | poles (large circles) | tree branches |
| **Link rendering** | bundled bridge corridors | secondary (topography is primary) | roots crossing strata | field lines + link lines | bundled edges along tree |
| **Physics as info** | ★★★★★ border migration = bridge concepts | ★★★☆☆ density is computed, not physics | ★★★☆☆ time is deterministic, X has springs | ★★★★★ field IS the visualization | ★★☆☆☆ mostly geometric, subtle jitter |
| **Scaling 10→50→200** | ★★★★☆ zoom: continent→country→city | ★★★★☆ zoom: satellite→topomap→detail | ★★★★★ scroll: semester→week→note | ★★★★☆ zoom: field→poles→particles | ★★★★★ zoom: tree→branch→leaf |
| **Visually ≠ Obsidian** | ★★★★★ bordered regions, no void | ★★★★★ topographic map, no dots-in-space | ★★★★★ horizontal strata, no void | ★★★★★ field lines, no soup | ★★★★★ radial tree, no floating |
| **Implementation** | Medium (~200 lines on top of existing) | Medium-High (~300 lines: density + contours) | Low-Medium (~150 lines: temporal binning + FD) | Medium-High (~250 lines: field sim + line tracing) | Medium (~200 lines: tree + bundling) |
| **Data requirements** | folder + links (existing) | folder + links (existing) | note.createdAt (CHECK: in NoteSummary?) | folder + links (existing) | folder + links (existing) |
| **STEM affinity** | ★★★☆☆ maps are universal | ★★★★☆ topographic maps are universal | ★★★★☆ geology metaphor | ★★★★★ physics/electromagnetism | ★★★☆☆ tree structure is universal |
| **Non-STEM clarity** | ★★★★★ everyone understands maps/borders | ★★★★☆ topographic maps are common | ★★★★☆ layers are intuitive | ★★★☆☆ field lines need explanation | ★★★★☆ trees are intuitive |

---

## V. Рекомендация

### Для immediate implementation (на текущем этапе)

**Hierarchical Edge Bundles** — самый low-risk, high-impact выбор:

1. Использует `d3-hierarchy` (уже в плане зависимостей)
2. Tree layout детерминированный (не нужен FD tuning)
3. Edge bundling — ~100 строк custom code
4. Visually STUNNING и максимально отличается от Obsidian
5. Folder hierarchy = tree branches (идеальное использование folder structure)
6. Cross-folder links = bundled edges (clean at any scale)
7. Совместим с существующим планом: заменить treemap на d3.tree radial, убрать
   per-folder FD, добавить edge bundling pass

### Для differentiation (после MVP)

**Tectonic Borders** — самый инновационный, "killer feature" level:

1. Physics-as-information — уникальная концепция, никто на рынке не делает
2. Bridge concepts автоматически visible — GENUINELY useful для студентов
3. Border migration — emergent behavior, "magic" moment для пользователя
4. Visually как карта с границами — максимально далеко от Obsidian
5. Совместим с существующей архитектурой: folder graph → plate centroids →
   constrained FD с border migration physics

### Для long-term vision

**Temporal Strata** — самый амбициозный, "learning journey" angle:

1. Time as spatial axis — никто не делает, GENUINELY novel
2. Knowledge archaeology — уникальная metaphor для student experience
3. Vertical scroll = time travel — интуитивная navigation
4. Требует `note.createdAt` в data model — проверить availability
5. Может быть ALTERNATIVE view mode (toggle: structural / temporal)

### Гибридная стратегия

```
View Mode 1 (default): Hierarchical Edge Bundles
  → folder hierarchy = tree, links = bundled edges
  → clean, scalable, deterministic, beautiful

View Mode 2 (toggle): Tectonic Borders
  → folders = plates, links = bridges, border migration = bridge concepts
  → physics-as-information, "where are my interdisciplinary connections?"

View Mode 3 (toggle): Temporal Strata
  → time = Y-axis, folders = colors, links = roots
  → "how did my knowledge grow?"
```

Три view mode, один data model, один rendering engine (SVG/Canvas). Student
переключает в зависимости от задачи: "хочу понять структуру" (HEB), "хочу найти
bridge concepts" (Tectonic), "хочу回顾 learning journey" (Temporal).

---

## VI. What NOT to do (lessons from competitors)

| Anti-pattern | Who does it | Why avoid |
|---|---|---|
| Force-directed as default layout | Obsidian, Logseq, Anytype | Hairball, meaningless position, no folder structure |
| Manual canvas as primary view | Heptabase, Scrintal | Doesn't scale, requires effort, no auto-organization |
| Graph disconnected from navigation | Roam, RemNote | Graph = decoration, not tool |
| No graph at all | Notion, Reflect | Can't see connections |
| Folders as colors only | Obsidian, Anytype | Folders are invisible in graph. Position should encode folder, not color |
| Separate tree sidebar + graph | Trilium, Obsidian | Hierarchy and graph are never seen together |
| Local-only view (no global) | TheBrain | User gets lost without global overview |
| Tag network instead of note network | InfraNodus, TiddlyWiki | Wrong unit of analysis — students navigate notes, not tags |

---

## VII. Ключевой insight

**Все существующие инструменты делают одну и ту же ошибку:** они визуализируют
graph topology БЕЗ folder hierarchy, или folder hierarchy БЕЗ graph topology.
Никто не показывает **ОДНОВРЕМЕННО** как folders организуют знания и как links
пересекают эти границы.

White space Osnova: **визуализация, где folder hierarchy и link topology
сосуществуют, и их НАПРЯЖЕНИЕ есть информация.**

- Tectonic Borders: напряжение = border migration (где bridge concepts)
- Knowledge Topography: напряжение = density peaks (где knowledge dense)
- Temporal Strata: напряжение = roots crossing time (как знания развиваются)
- Tension Field: напряжение = field lines (куда тянут знания)
- Hierarchical Edge Bundles: напряжение = bundled edges crossing branches (как
  ветки связаны)

Каждое направление делает **folder boundaries и cross-folder links одновременно
видимыми** — и это именно то, чего не делает НИ ОДИН конкурент.
