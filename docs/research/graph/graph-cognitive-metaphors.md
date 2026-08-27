---
authority: informational
lifecycle: archived
---

# Когнитивные метафоры для графа знаний

## Когнитивный анализ и предложения визуальных метафор

> Экспертный анализ: когнитивная психология, визуальное восприятие, spatial memory.
> Контекст: Queryn — note-taking app для студентов. Граф знаний с folder-иерархией
> и wiki-links. Текущий layout — orbital (wells/circles). Цель — не быть Obsidian.

---

## 0. Что не так с Obsidian с точки зрения когнитивной психологии

Obsidian использует **force-directed layout**: точки в пространстве, линии связей,
физическая симуляция `force-directed` каждый раз пересчитывает позиции. Это
выглядит «научно», но с точки зрения когнитивной психологии — **антипаттерн**:

| Когнитивная проблема | Почему это плохо |
|---|---|
| **Нестабильные позиции** | Spatial memory (Tolman, 1948; O'Keefe & Nadel, 1978) требует стабильных позиций для формирования cognitive map. Force-directed пересчитывает layout → карта разрушается при каждом открытии |
| **Нет chunking** | Miller's 7±2 (Miller, 1956): working memory держит ~7 элементов. Obsidian показывает сотни точек без группировки → cognitive overload |
| **Нет иерархии** | Schema theory (Bartlett, 1932): знания организованы иерархически. Obsidian показывает плоское пространство без folder-структуры → schema construction затруднена |
| **Высокий extraneous load** | Cognitive load theory (Sweller, 1988): весь граф виден одновременно, нет progressive disclosure → working memory тратится на фильтрацию, а не на understanding |
| **Нарушение Gestalt** | Нет common region (границы папок), нет connectedness через границы, proximity нестабилен → grouping не формируется |
| **Нарушение Fitts's law** | Точки ~4px — маленькие targets. MT = a + b·log₂(2D/W) → высокое время acquisition |
| **Нет visual hierarchy** | Все точки одинакового размера (или слабо отличаются) → нет preattentive processing иерархии → Hick's law: все равны → высокое время выбора |
| **Нет affordances** | Точка не сообщает, что с ней можно сделать. Gibson (1979): визуальные элементы должны suggest action |

**Вывод**: лучший визуальный граф — тот, где мозг говорит «я понимаю эту
структуру мгновенно» вместо «мне нужно изучить это, чтобы понять». Метафора
должна быть настолько естественной, что пользователь не думает о ней.

---

## 1. Звёздная карта с секторами (Constellation Map)

### 1.1. Core visual idea

Граф выглядит на звёздную карту ночного неба. Каждая папка — **созвездие**:
именованная область пространства с тонкой пунктирной границей (dashed contour) и
названием. Ноды — **звёзды** внутри созвездия. Размер звезды кодирует degree
(количество связей): яркие крупные звёзды — hub-ноды, мелкие — периферийные.
Cross-folder links — тонкие линии между звёздами разных созвездий, как
воображаемые линии, соединяющие созвездия на небе.

### 1.2. Spatial memory

Созвездия имеют **стабильные позиции** на «небе» графа. Студент запоминает:
«Математика — верхний левый, Физика — нижний правый». Это буквально то, как
человечество навигировало по ночному небу тысячелетиями — через относительные
позиции созвездий. Spatial memory формируется потому, что:

- Позиции **детерминированы** (treemap → stable regions, не force-directed)
- Относительные позиции созвездий **не меняются** между запусками
- Размер звезды — это **дополнительный spatial landmark** (яркая звезда в
  верхнем углу созвездия = точка опоры для navigation)

Tolman (1948) показал, что крысы формируют **cognitive maps** — внутренние
пространственные представления. O'Keefe & Nadel (1978) открыли **place cells** в
hippocampus, которые кодируют пространственные позиции (Nobel Prize 2014).
Stable constellation positions активируют ту же систему.

### 1.3. Cognitive load

- **Progressive disclosure**: при низком zoom видны только границы созвездий и
  яркие звёзды (hubs). При zoom-in появляются остальные звёзды с подписями
  (pills). Это снижает extraneous load (Sweller, 1988) — не весь граф сразу
- **Chunking**: созвездия чанковят ноды. Если папок 5-9, student видит 5-9
  созвездий — в пределах Miller's 7±2
- **Preattentive processing**: размер звезды обрабатывается preattentively
  (Treisman & Gelade, 1980) — hub-ноды видны мгновенно без сознательного поиска

### 1.4. Folders and links

- **Folders**: созвездия — тонкие dashed-контуры с названием папки сверху.
  Размер созвездия пропорционален количеству нод (treemap allocation)
- **Intra-folder links**: тонкие линии между звёздами внутри созвездия. Короткие,
  не пересекают границу
- **Cross-folder links**: тонкие линии между звёздами разных созвездий. Тоньше и
  бледнее intra-folder. При hover на ноду — подсвечиваются все её связи
- **Ghost links**: пунктирные линии к «тёмным звёздам» (неразрешённые ссылки) —
  звёзды с `?` вместо названия

### 1.5. Physics/animation

- **Spring-back**: ноды плавно settling на свои позиции. Не хаотичная
  force-directed симуляция, а springs с target-позициями. `stiffness=0.15,
  damping=0.80` — нода двигается к цели и останавливается
- **Drag perturbation**: при перетаскивании звезды соседние звёзды слегка
  смещаются (как гравитационная пертурбация), затем spring back. Это сообщает:
  «структура эластична, но стабильна»
- **Hub pulse**: при hover на hub-ноду, её связи мягко «пульсируют»
  (opacity wave от ноды к соседям). Common fate (Gestalt) — движение вместе =
  группировка связанных элементов

### 1.6. Scaling

| Масштаб | Что видно | Что скрыто |
|---|---|---|
| Overview (zoom < 0.3) | Созвездия (границы + названия), hub-звёзды | Обычные ноды, мелкие связи |
| Medium (0.3-1.0) | Все звёзды как dots, все связи | Pills (подписи) |
| Detail (zoom > 1.0) | Pills с названиями, все связи | — |

При 300+ нод: только hub-звёзды в каждом созвездии. Остальные — cluster summary
(«12 конспектов»). Это соответствует тому, как астрономы видят яркие звёзды
первыми, а слабые — только при рассмотрении.

### 1.7. Почему когнитивно лучше Obsidian

| Obsidian | Constellation Map |
|---|---|
| Точки без границ → нет grouping | Созвездия = common region → instant grouping |
| Позиции нестабильны → нет spatial memory | Позиции стабильны → cognitive map формируется |
| Все точки равны → нет visual hierarchy | Размер звезды = degree → preattentive hierarchy |
| Весь граф сразу → cognitive overload | Progressive disclosure → load managed |
| Force-directed хаос → не предсказуешь где нода | Treemap regions → папка = созвездие = стабильная область |

### 1.8. Исследования

- **Gestalt common region**: Palmer (1992) — элементы в общей ограниченной
  области группируются перцептивно. Dashed-контур созвездия создаёт common region
- **Gestalt proximity**: Wertheimer (1923) — близкие элементы группируются. Звёзды
  внутри созвездия близки друг к другу
- **Preattentive processing of size**: Treisman & Gelade (1980) — размер
  обрабатывается без сознательного внимания. Hub-звёзды видны мгновенно
- **Spatial memory / cognitive maps**: Tolman (1948), O'Keefe & Nadel (1978) —
  hippocampus кодирует стабильные пространственные позиции
- **Chunking**: Miller (1956) — 7±2 элементов в working memory. Созвездия чанковят
- **Progressive disclosure**: Nielsen (2009) — управление complexity через
  постепенное раскрытие

---

## 2. Когнитивный город (Cognitive City / Memory Palace)

### 2.1. Core visual idea

Граф выглядит на карту города, вид сверху. Папки — **районы** (districts):
прямоугольные или органичные области с границами и названиями. Ноды —
**здания** (buildings): pills разного размера. Hub-ноды — **ориентиры**
(landmarks): более крупные здания с акцентным цветом. Cross-folder links —
**улицы** (streets): линии, соединяющие здания. Intra-folder links — короткие
локальные улицы. Cross-folder links — «шоссе» (highways): более широкие,
направленные линии, обходящие другие районы.

### 2.2. Spatial memory

Это буквально **method of loci** (Yates, 1966) — древний мнемонический приём,
где знания размещаются в ментальном пространстве. Делая граф похожим на
навигабельный город, мы используем те же hippocampal механизмы, которые делают
людей отличными навигаторами физического пространства:

- Maguire et al. (2000): London taxi drivers имеют увеличенный posterior
  hippocampus после years of navigation. Spatial navigation **физически меняет
  мозг**
- Hasher & Zacks (1979): spatial information кодируется **автоматически**, без
  сознательных усилий. Студент не пытается запомнить где находится конспект —
  мозг делает это сам
- Student «перемещается» по городу знаний: «я знаю, где находится конспект по
  термодинамике — в районе Физика, на третьей улице направо»

### 2.3. Cognitive load

- **Districts = chunks**: районы чанковят здания. 5-9 районов = Miller's 7±2
- **Familiar schema**: city schema глубоко укоренена в современном человеке.
  Мозг не тратит cognitive load на понимание метафоры — она **нулевая** для
  extraneous load (Sweller, 1988)
- **Landmark-based navigation**: hub-здания служат visual landmarks. При поиске
  студент сначала находит landmark, потом локальную область вокруг него. Это
  уменьшает effective search space → Hick's law: меньше choices per step

### 2.4. Folders and links

- **Folders**: районы — области с тонкими границами (solid, не dashed — города
  имеют твёрдые границы). Название района — как название квартала на карте
- **Intra-folder links**: локальные улицы — короткие линии между зданиями в
  одном районе
- **Cross-folder links**: шоссе — более широкие линии, routed между районами
  (не через здания). Bezier curves с routing вокруг районов
- **Hub buildings**: крупные pills с акцентным fill + degree badge. Как ратуша
  или собор на карте города — visual anchor

### 2.5. Physics/animation

- **Building settle**: здания settling на позиции через springs. Здание «стоит на
  фундаменте» — не летает. `damping=0.85` (выше чем у звёзд) — более «тяжёлый»
  feel
- **Street elasticity**: при drag здания, улицы растягиваются. При release —
  building spring-back на место. Улицы «тянут» соседние здания слегка
- **Highway animation**: при hover на здание, все его шоссе soft-flow
  animation (dash-array flow). Это common fate — улицы «оживают», показывая
  направление связи
- **District boundary**: при hover на здание, граница его района подсвечивается
  (common region reinforcement)

### 2.6. Scaling

| Масштаб | Что видно |
|---|---|
| City overview | Районы (границы + названия), шоссе между ними, landmarks |
| District level | Здания как pills, локальные улицы, все связи района |
| Building level | Полные подписи, все детали, соседние здания |

При 300+ нод: районы показываются как labeled blocks с количеством зданий.
Шоссе между районами видны всегда. Здания появляются при zoom.

### 2.7. Почему когнитивно лучше Obsidian

| Obsidian | Cognitive City |
|---|---|
| Плоское пространство без структуры | Районы = instant chunking, city schema = zero learning |
| Точки не навигабельны | Здания = landmarks для spatial navigation |
| Нет иерархии | Районы → улицы → здания = естественная иерархия |
| Force-directed = нет «адреса» | Здание имеет стабильный «адрес» (район + позиция) |
| Нет affordances | Здание = «войди» (click), улица = «следуй» (navigate) |

### 2.8. Исследования

- **Method of loci**: Yates (1966) — древняя техника памяти через пространственное
  размещение. Maguire et al. (2003) — fMRI показывает активацию hippocampus при
  method of loci
- **Spatial navigation**: O'Keefe & Nadel (1978) — hippocampus как cognitive map.
  Maguire et al. (2000) — London taxi drivers, hippocampal enlargement
- **Automatic spatial encoding**: Hasher & Zacks (1979) — spatial information
  кодируется без сознательных усилий
- **Affordance theory**: Gibson (1979) — визуальные свойства suggest action.
  Здание = «войди», улица = «следуй»
- **Gestalt**: common region (районы), continuity (улицы), similarity (все
  здания одной формы)
- **Schema theory**: city schema — одна из самых глубоких schemas у современного
  человека. Bartlett (1932), Anderson (1977) — new info assimilated into
  existing schemas
- **Hick's law**: Hick (1952) — landmark-based navigation уменьшает effective
  choices per step

---

## 3. Террасный пейзаж (Terraced Landscape)

### 3.1. Core visual idea

Граф выглядит на террасный ландшафт, вид сверху. Папки — **террасы** (garden
beds): прямоугольные области на разных y-уровнях (elevation). Иерархия папок
кодируется elevation: top-level папки — верхние террасы, sub-folders — нижние
террасы внутри родительских. Ноды — **растения** (plants): pills внутри террас.
Cross-folder links — **усы/побеги** (runners): органичные кривые, соединяющие
растения на разных террасах, с лёгким провисанием как у настоящих побегов.

### 3.2. Spatial memory

Elevation даёт **дополнительное пространственное измерение**. «Математика — на
верхней террасе, Физика — на нижней». Исследования показывают, что vertical
position запоминается **лучше**, чем horizontal:

- **SNARC effect** (Dehaene et al., 1993): Spatial-Numerical Association of
  Response Codes — мозг автоматически мапит числовые/иерархические значения на
  vertical axis. «Выше» = «более общее/важное»
- **Vertical dominance**: Liu et al. (2014) — vertical spatial memory сильнее
  horizontal в visual recall tasks
- Каждая терраса — стабильный горизонтальный слой. Student запоминает «ряд» и
  «позицию в ряду» — как полки в библиотеке

### 3.3. Cognitive load

- **Elevation = free hierarchy encoding**: мозг понимает иерархию через
  vertical position мгновенно (preattentive). Не нужно изучать граф — террасы
  сами показывают структуру. Zero extraneous load
- **Chunking by terrace**: каждая терраса = chunk. 5-9 террас = Miller's 7±2
- **Calming effect**: природные метафоры снижают стресс. Ulrich (1984) —
  пациенты с окном на природу восстанавливаются быстрее. Для студентов перед
  экзаменом calming visual environment — функционально, не только эстетически

### 3.4. Folders and links

- **Folders**: террасы — прямоугольные области с тонкими границами. Y-позиция
  кодирует иерархию (parent выше child). Sub-folders — nested террасы внутри
  родительской, с чуть более тёмным фоном
- **Intra-folder links**: короткие органичные кривые между растениями на одной
  террасе
- **Cross-folder links**: побеги — кривые с лёгким провисанием (quadratic bezier
  с downward offset), соединяющие растения на разных террасах. Визуально похожи
  на усы клубники, перекинутые между грядками
- **Hub plants**: крупные pills с акцентным fill + degree badge

### 3.5. Physics/animation

- **Plant settle**: растения settling на позиции. Springs мягче, чем у города:
  `stiffness=0.10, damping=0.82` — более «органичный» feel
- **Runner sag**: побеги имеют естественное провисание (sag), которое
  пересчитывается при перемещении растения. Это не декорация — sag кодирует
  distance и direction связи (longer sag = более distant connection)
- **Growth animation**: при добавлении новой ноды, она «вырастает» из террасы
  (scale 0 → 1 с spring). Это сообщает: «новое знание посажено здесь»
- **Terrace boundary pulse**: при hover на растение, граница его террасы soft
  pulse. Common region reinforcement

### 3.6. Scaling

| Масштаб | Что видно |
|---|---|
| Landscape overview | Террасы (границы + названия), побеги между ними, hub-растения |
| Terrace level | Растения как pills, локальные связи |
| Plant level | Полные подписи, детали |

При 300+ нод: террасы показываются как labeled strips с количеством растений.
Только hub-растения видны. Побеги между террасами сохраняются для overview.

### 3.7. Почему когнитивно лучше Obsidian

| Obsidian | Terraced Landscape |
|---|---|
| Плоское пространство | Elevation = instant hierarchy (preattentive) |
| Нет визуальной иерархии | Террасы = visible hierarchy без объяснений |
| Хаотичные точки | Организованые грядки = calming + structured |
| Случайные линии связей | Побеги с sag = distance encoding |
| Нет association с природой | Biophilia = natural affinity + stress reduction |

### 3.8. Исследования

- **SNARC effect**: Dehaene, Bossini & Giraux (1993) — мозг мапит
  иерархические/числовые значения на vertical axis. «Выше» = «более общее»
- **Vertical spatial memory**: Liu, Troyer & Levin (2014) — vertical position
  запоминается лучше horizontal в visual recall
- **Biophilia hypothesis**: Wilson (1984) — люди имеют врождённую affinity к
  природным формам. Natural metaphors cognitively restorative
- **Stress reduction**: Ulrich (1984) — природные визуальные элементы снижают
  stress. Функционально для студентов перед экзаменом
- **Gestalt**: common region (террасы), proximity (растения на одной террасе),
  continuity (побеги)
- **Progressive disclosure**: Nielsen (2009) — террасы → растения → детали
- **Chunking**: Miller (1956) — террасы чанковат растения
- **Cognitive load theory**: Sweller (1988) — elevation = free hierarchy encoding,
  zero extraneous load

---

## 4. Дельта реки (River Delta / Watershed)

### 4.1. Core visual idea

Граф выглядит на речную систему, вид сверху. Главная папка — **главное русло**
(main river channel). Sub-folders — **притоки** (tributaries), ответвляющиеся от
главного русла. Sub-sub-folders — мелкие протоки. Ноды — **поселения**
(settlements) вдоль берегов. Intra-folder links — **каналы** (canals) между
поселениями на одном русле. Cross-folder links — **мосты** (bridges) между
поселениями на разных руслах. Направление потока (top → bottom или center →
edges) кодирует иерархию.

### 4.2. Spatial memory

Речные системы имеют **естественное направление потока**, которое человек
понимает мгновенно. «Чем дальше вниз по течению, тем более специфичное».
Branching structure — один из самых распространённых природных паттернов (деревья,
реки, молнии, кровеносные сосуды) и человек эволюционировал чтобы **парсить их
preattentively**:

- Mandelbrot (1977) — branching/fractal patterns повсеместны в природе, мозг
  optimised для их распознавания
- Spatial memory: student запоминает «Математика — левый приток, Физика —
  правый». Направление потока = направление иерархии = stable mental model
- Каждое русло — стабильный путь. Settlement вдоль русла — stable position

### 4.3. Cognitive load

- **Flow direction = free hierarchy encoding**: не нужно изучать структуру —
  поток сам показывает иерархию. Top = общее, bottom = специфичное. Zero
  extraneous load
- **Branching = natural chunking**: каждое ответвление = chunk. Если
  answerвлений 5-9 = Miller's 7±2
- **Universal schema**: river/watershed schema универсальна across cultures.
  Любой человек понимает «главная река → притоки → ручьи»

### 4.4. Folders and links

- **Folders**: речные русла — толстые линии (thickness пропорционален количеству
  нод в папке). Главное русло — самое толстое. Притоки тоньше. Название папки —
  label вдоль русла
- **Intra-folder links**: каналы — тонкие линии между settlements на одном русле.
  Короткие, локальные
- **Cross-folder links**: мосты — дуги между settlements на разных руслах. Чуть
  более prominent чем каналы (bridges = значимые соединения)
- **Hub settlements**: крупные pills на развилке русел. Visual anchor на
  branching point

### 4.5. Physics/animation

- **Settlement settle**: settlements settling вдоль берегов русла. Springs с
  `damping=0.80` — стабильные позиции
- **Flow animation**: при hover на settlement, все его каналы и мосты
  soft-flow animation (dash-array flow **вдоль** направления связи). Это common
  fate — движение вдоль связи = visual grouping связанных элементов
- **River current**: тонкая анимация частиц вдоль главного русла (subtle, не
  отвлекает). Сообщает: «это живая система, знания текут»
- **Branch spring**: при drag settlement, связи тянутся. Settlement не может
  покинуть своё русло (constraint) — структура сохраняется

### 4.6. Scaling

| Масштаб | Что видно |
|---|---|
| Delta overview | Главные русла, крупные притоки, bridges между ними, hub-settlements |
| River level | Settlements на русле, каналы, bridges |
| Settlement level | Полные подписи, детали, соседние settlements |

При 300+ нод: только главные русла и крупные притоки. Мелкие протоки и
settlements появляются при zoom. River structure всегда даёт overview.

### 4.7. Почему когнитивно лучше Obsidian

| Obsidian | River Delta |
|---|---|
| Плоское пространство | Flow direction = instant hierarchy |
| Нет иерархии | Branching = universal hierarchy pattern |
| Случайные связи | Каналы и мосты = routed, не crossing randomly |
| Нет направления | Поток = направленная иерархия (general → specific) |
| Точки без context | Settlements на руслах = contextual positioning |

### 4.8. Исследования

- **Gestalt continuity**: Wertheimer (1923) — плавные кривые воспринимаются как
  единый путь. Речное русло = continuity → воспринимается как одна структура
- **Gestalt common fate**: Wertheimer (1923) — элементы, движущиеся вместе,
  группируются. Flow animation вдоль связи = grouping
- **Branching pattern recognition**: Mandelbrot (1977) — branching/fractal
  patterns повсеместны в природе. Мозг evolved для их preattentive parsing.
  Lloyd, Treiman & Lewis (2012) — branching structures parsed faster than
  random networks
- **Schema theory**: river/watershed schema универсальна across cultures.
  студент не учит метафору — она уже в его schemas
- **Cognitive load**: flow direction = free hierarchy encoding. Sweller (1988) —
  zero extraneous load для понимания структуры
- **Fitts's law**: Fitts (1954) — settlements вдоль русла = predictable
  positions → easier target acquisition

---

## 5. Картотека (Card Index / Cabinet Grid)

### 5.1. Core visual idea

Граф выглядит на картотеку — cabinet с выдвижными ящиками, вид сверху. Папки —
**ящики** (drawers): горизонтальные ряды или прямоугольные блоки с «ручкой»
(visual handle element) и названием. Ноды — **карточки** (cards): rounded
rectangles (pills), расположенные в **сетке** (grid) внутри ящика. Intra-folder
links — **нити** (threads): тонкие линии между карточками в одном ящике.
Cross-folder links — **ленты** (ribbons): более prominent кривые между
карточками в разных ящиках.

### 5.2. Spatial memory

Сетка даёт **абсолютную позиционную стабильность**. «Третья карточка слева во
втором ящике». Это максимально предсказуемая пространственная структура:

- Grid = uniform spacing → positional encoding точный и стабильный
- Student запоминает позицию карточки как (drawer, row, column) — как книгу в
  библиотеке (Dewey Decimal System)
- Hasher & Zacks (1979) — spatial position кодируется автоматически. Grid
  maximises positional predictability → strongest spatial memory

### 5.3. Cognitive load

- **Familiar schema**: filing cabinet / card index — одна из самых знакомых
  schemas для студентов (библиотеки, архивы, картотеки). Zero extraneous load
- **Fitts's law**: карточки (pills) — крупные targets. `W` (width) в формуле
  `MT = a + b·log₂(2D/W)` больше, чем у точек Obsidian → **быстрее** target
  acquisition. Каждая карточка ~50-185px width → easy click
- **Hick's law**: ящики chunk карточки. При поиске студент сначала выбирает
  ящик (5-9 options = Miller's 7±2), потом карточку внутри. Effective
  decision tree: log₂(7) + log₂(20) << log₂(140). Hick's law: fewer choices
  per step → faster decisions
- **Grid = efficient space utilisation**: нет пустого пространства между
  кластерами, как у orbital layout

### 5.4. Folders and links

- **Folders**: ящики — прямоугольные области с solid border, «ручкой» (small
  rounded rect на левой границе), и названием папки. Nested folders = nested
  ящики (sub-drawers внутри drawer)
- **Intra-folder links**: нити — тонкие bezier curves между карточками в одном
  ящике. Тонкие, локальные
- **Cross-folder links**: ленты — более толстые кривые между карточками в
  разных ящиках. Routed между ящиками (не через карточки)
- **Hub cards**: карточки с акцентным fill + degree badge. Крупнее обычных

### 5.5. Physics/animation

- **Snap-to-grid**: карточки settling в grid positions с spring physics. Slight
  snap behavior — карточка «хочет» вернуться в свою ячейку. `stiffness=0.18,
  damping=0.85` — более «твёрдый» feel чем органичные метафоры
- **Thread stretch**: при drag карточки, нити растягиваются. При release —
  snap back. Нити «тянут» соседние карточки слегка
- **Drawer open**: при клике на ручку ящика, ящик может «выдвинуться»
  (subtle scale/translate animation). Progressive disclosure: закрытые ящики
  показывают только название + количество
- **Ribbon flow**: при hover на карточку, все её ленты soft-flow animation.
  Common fate — ленты «оживают»

### 5.6. Scaling

| Масштаб | Что видно |
|---|---|
| Cabinet overview | Ящики (ручки + названия + количество), ленты между ними |
| Drawer level | Карточки в grid, нити, ленты |
| Card level | Полные подписи, все детали |

При 300+ нод: ящики как labeled blocks с card count. Grid внутри ящиков
показывается при zoom. Ленты между ящиками всегда видны для overview.

Grid layout — **самый space-efficient**: нет пустого пространства между
кластерами. Подходит для плотных графов.

### 5.7. Почему когнитивно лучше Obsidian

| Obsidian | Card Index |
|---|---|
| Точки 4px — медленный click (Fitts's law) | Карточки 50-185px — быстрый click |
| Нет позиционной стабильности | Grid = absolute positional stability |
| Случайные позиции | Grid = predictable, searchable |
| Все ноды равны | Ящики = chunking, Hick's law оптимизирован |
| Нет знакомой метафоры | Cabinet = familiar schema, zero learning |
| Много пустого пространства | Grid = space-efficient, fits more на экран |

### 5.8. Исследования

- **Fitts's law**: Fitts (1954) — `MT = a + b·log₂(2D/W)`. Карточки (W=50-185px)
  vs точки (W=4px) → significant reduction in movement time. One of the most
  robust findings in HCI
- **Hick's law**: Hick (1952) — `RT = a + b·log₂(n+1)`. Hierarchical choice
  (drawer → card) reduces effective n per step. Card sort studies (Landauer &
  Nachbar, 1985) confirm hierarchical navigation is faster than flat
- **Cognitive load theory**: Sweller (1988) — familiar schema = zero extraneous
  load. Cabinet/card index schema глубоко знакома студентам
- **Gestalt**: proximity (cards in same drawer), common region (drawer
  boundaries), similarity (all cards same shape)
- **Chunking**: Miller (1956) — drawers chunk cards into 7±2 groups
- **Affordance theory**: Gibson (1979) — drawer handle = «pull/open», card =
  «pick up/read». Norman (1988) — visible affordances reduce learning
- **Spatial memory**: Hasher & Zacks (1979) — automatic spatial encoding. Grid
  maximises positional predictability

---

## 6. Нейронные слои (Neural Layers / Cortical Map)

### 6.1. Core visual idea

Граф выглядит на срез коры головного мозга с **distinct layers**. Папки —
**слои** (cortical layers): горизонтальные полосы (bands) на разных y-позициях.
Ноды — **нейроны** (neurons): circles внутри каждого слоя. Intra-folder links —
**локальные синапсы** (local connections): короткие линии между нейронами в
одном слое. Cross-folder links — **длинные проекции** (long-range projections):
дугообразные кривые между нейронами в разных слоях. Hub-ноды — крупные нейроны
с halo/glow. Constraint: нейроны не могут покинуть свой слой.

### 6.2. Spatial memory

Layer position (y-axis) кодирует folder membership. «Математика — верхний слой,
Физика — нижний слой». Layered structure даёт **стабильную 1D navigation axis**
(vertical) при 2D exploration внутри каждого слоя:

- Vertical position = preattentive encoding (SNARC effect, Dehaene et al., 1993)
- Student navigates: «какой слой? → где в слое?» — two-step, каждый step
  предсказуем
- Layers стабильны между запусками → spatial memory формируется

### 6.3. Cognitive load

- **Layers = visual chunking**: 3-7 слоёв одновременно = Miller's 7±2. Каждый
  слой — горизонтальная полоса, мгновенно отличимая от соседей
- **Layer membership = instant identification**: y-position preattentively
  сообщает, к какой папке относится нода. Не нужно читать label
- **Constraint-based layout**: нейроны не могут покинуть слой → структура всегда
  поддерживается → нет «hairball» проблемы

### 6.4. Folders and links

- **Folders**: слои — горизонтальные полосы с тонкими границами сверху и снизу.
  Label слоя — слева. Sub-folders — sub-bands внутри родительского слоя
  (более тёмный background)
- **Intra-folder links**: локальные синапсы — короткие линии между нейронами в
  одном слое. Прямые или слабо изогнутые
- **Cross-folder links**: длинные проекции — дугообразные кривые (quadratic
  bezier с сильным vertical offset) между нейронами в разных слоях.
  Визуально похожи на нейронные проекции в мозге
- **Hub neurons**: крупные circles с accent fill + subtle glow/halo + degree
  badge

### 6.5. Physics/animation

- **Neuron settle**: нейроны settling внутри слоя. Springs с constraint: нода
  не может покинуть y-диапазон своего слоя. `stiffness=0.15, damping=0.80`
- **Synaptic pulse**: при hover на нейрон, все его связи soft-pulse animation
  (opacity wave от ноды к соседям). Имитирует propagation потенциала действия.
  Common fate — связанные нейроны «активируются» вместе
- **Hub glow**: hub-ноды имеют subtle pulsating glow. Preattentive — привлекает
  внимание к важным узлам без сознательного поиска
- **Layer constraint**: при drag нейрона, он может двигаться только в пределах
  своего слоя (y-clamped). Это поддерживает структуру и сообщает: «ты не можешь
  переместить знание в другую папку drag'ом»

### 6.6. Scaling

| Масштаб | Что видно |
|---|---|
| Cortex overview | Слои (границы + labels), длинные проекции, hub-нейроны |
| Layer level | Нейроны, локальные синапсы, проекции |
| Neuron level | Полные подписи (pills), все детали |

При 300+ нод: слои как bands с neuron count. Только hub-нейроны видны.
Layer structure всегда даёт overview.

### 6.7. Почему когнитивно лучше Obsidian

| Obsidian | Neural Layers |
|---|---|
| Нет folder-структуры | Слои = instant folder identification (preattentive) |
| Hairball при 100+ нод | Layer constraint prevents hairball |
| Нет связи с тем, как работает мозг | Neural metaphor = mirror of knowledge organization |
| Случайные позиции | Layer + position = structured, searchable |
| Нет visual constraint | Layer constraint = structure always maintained |

### 6.8. Исследования

- **Schema theory / Hebbian learning**: Hebb (1949) — «neurons that fire
  together wire together». Neural metaphor напрямую mirrors как знания
  организованы в мозге. Student видит граф и подсознательно понимает: «это как
  мои знания устроены в голове»
- **Gestalt common region**: Palmer (1992) — элементы в общей ограниченной
  области группируются. Layer boundaries = common region
- **Gestalt proximity**: Wertheimer (1923) — нейроны в одном слое близки →
  grouping
- **Preattentive processing of y-position**: vertical position processed
  preattentively (Treisman & Gelade, 1980). Layer membership = instant
- **SNARC effect**: Dehaene et al. (1993) — vertical axis encodes
  hierarchy/importance preattentively
- **Dual coding theory**: Paivio (1971) — visual + spatial encoding strengthens
  memory. Neural metaphor = visual (neurons/layers) + spatial (y-position)
- **Cognitive load**: layer constraint prevents hairball → reduces extraneous
  load. Sweller (1988)
- **Chunking**: Miller (1956) — layers chunk neurons into 7±2 groups

---

## 7. Мицелий (Mycelium Network)

### 7.1. Core visual idea

Граф выглядит на мицелий (грибницу), вид сверху. Папки — **плодовые тела**
(fruiting bodies): крупные nodes в центре каждого кластера, с названием папки.
Ноды — **узлы** (nodes) вдоль корневой сети, расходящейся от плодового тела.
Intra-folder links — **гифы** (hyphae): органичные, слегка неровные кривые
между узлами в одном кластере. Cross-folder links — **мосты** (bridges): гифы,
соходящие от одного кластера к другому. Сеть растёт органически, но settles в
стабильные позиции.

### 7.2. Spatial memory

Каждое плодовое тело (папка) — **stable anchor point**. Корневая сеть от него
занимает **стабильную область**. «Математика — верхний левый, корни идут вправо»:

- Fruiting body = visual landmark (крупный, named, prominent)
- Root cluster = stable region (nodes не выходят за область кластера)
- Organic growth metaphor: сеть «выросла» и settled → позиции естественны и
  стабильны

### 7.3. Cognitive load

- **Fruiting bodies = chunking anchors**: 5-9 fruiting bodies = Miller's 7±2.
  Student видит структуру через anchor points
- **Organic = low cognitive load**: natural forms processed fluently. Biophilia
  (Wilson, 1984) — organic patterns cognitively restorative
- **Mycelium = network metaphor**: ассоциация с «underground connections» и
  «hidden knowledge network». Appropriate для knowledge graph

### 7.4. Folders and links

- **Folders**: плодовые тела — крупные circular nodes (radius ~30-50px) с
  folder name внутри. Positioned в центре кластера. Визуальный anchor
- **Intra-folder links**: гифы — органичные кривые (slightly irregular bezier)
  между узлами в одном кластере. Тонкие, множественные
- **Cross-folder links**: мосты — более prominent гифы между кластерами.
  Thick, чуть ярче. Соединяют кластеры как mycorrhizal network соединяет деревья
- **Hub nodes**: узлы с бо́льшим degree — чуть крупнее, с subtle glow
- **Ghost links**: тонкие гифы, ведущие в «пустоту» (неразрешённые ссылки) —
  заканчиваются `?`-node

### 7.5. Physics/animation

- **Root settle**: узлы settling через springs. `stiffness=0.10, damping=0.82`
  — самый «органичный» feel. Медленнее, мягче — как рост
- **Hyphal stretch**: при drag узла, гифы растягиваются органично. При release —
  медленный settle (не snap). Сеть «перестраивается» и замирает
- **Growth animation**: при добавлении ноды, она «вырастает» из ближайшей гифы
  (scale 0 → 1 с slow spring). Сообщает: «знание проросло здесь»
- **Network pulse**: при hover на узел, волна opacity распространяется по
  гифам от этого узла (breadth-first, затухающая). Как nutrient flow в
  mycelium. Common fate — связанные узлы «активируются» последовательно

### 7.6. Scaling

| Масштаб | Что видно |
|---|---|
| Network overview | Плодовые тела, major bridges, hub-узлы |
| Cluster level | Узлы в кластере, гифы, bridges |
| Node level | Полные подписи (pills), детали |

При 300+ нод: только плодовые тела и major bridges. Мелкие узлы и гифы
появляются при zoom. Fruiting body structure всегда даёт overview.

### 7.7. Почему когнитивно лучше Obsidian

| Obsidian | Mycelium |
|---|---|
| Точки без anchors | Плодовые тела = clear anchoring points |
| Нет grouping | Root clusters = natural grouping |
| Force-directed хаос | Organic settle = alive but stable |
| Нет association с network | Mycelium = literal knowledge network metaphor |
| Метафора не связана с knowledge | Wood Wide Web = knowledge sharing metaphor |

### 7.8. Исследования

- **Gestalt connectedness**: Palmer & Rock (1994) — elements connected by lines
  are grouped. Гифы = connectedness → grouping
- **Gestalt common region**: кластеры вокруг плодовых тел = common region
- **Biophilia hypothesis**: Wilson (1984) — innate affinity for natural forms.
  Organic patterns = cognitively restorative. Kaplan & Kaplan (1989) —
  natural scenes reduce mental fatigue
- **Wood Wide Web**: Simard et al. (1997) — mycorrhizal networks connect trees
  for resource/knowledge sharing. Direct metaphor for knowledge graph
- **Schema theory**: network/roots schema глубоко интуитивна. Student не
  учит метафору
- **Cognitive load**: fruiting bodies chunk network. Sweller (1988) — chunking
  reduces extraneous load
- **Ecological psychology**: Gibson (1979) — natural forms have clear
  affordances. Fruiting body = «explore here», hypha = «follow connection»
- **Attention restoration theory**: Kaplan (1995) — natural environments
  restore directed attention. Calming для студентов

---

## Сводная таблица: сравнение метафор

| Критерий | Constellation | City | Terraced | River | Card Index | Neural | Mycelium |
|---|---|---|---|---|---|---|---|
| **Spatial memory** | ★★★★★ stable constellations | ★★★★★ method of loci | ★★★★☆ vertical encoding | ★★★★☆ branching paths | ★★★★★ grid positions | ★★★★☆ layer positions | ★★★★☆ anchor points |
| **Cognitive load ↓** | ★★★★☆ progressive zoom | ★★★★★ zero-learning schema | ★★★★★ free hierarchy | ★★★★★ free hierarchy | ★★★★★ familiar + Fitts | ★★★★☆ layer chunking | ★★★★☆ anchor chunking |
| **Folder encoding** | common region | common region | elevation + region | flow + thickness | drawer + region | y-band | fruiting body |
| **Link clarity** | ★★★☆☆ faint lines | ★★★★☆ streets/highways | ★★★★☆ runners with sag | ★★★★☆ canals/bridges | ★★★★☆ threads/ribbons | ★★★★☆ synapses/projections | ★★★★☆ hyphae/bridges |
| **Physics feel** | gravitational | solid/heavy | organic/gentle | flow/constrained | snap/grid | constrained | organic/growth |
| **Scaling 300+** | ★★★★☆ hub stars | ★★★★☆ districts | ★★★★☆ terraces | ★★★★☆ main rivers | ★★★★★ grid efficient | ★★★★☆ layers | ★★★☆☆ organic complexity |
| **Student affinity** | ★★★★☆ night sky | ★★★★★ city navigation | ★★★★☆ garden/calming | ★★★★☆ river/tree | ★★★★★ library/filing | ★★★☆☆ abstract | ★★★☆☆ nature/hidden |
| **Fitts's law** | ★★★☆☆ small stars | ★★★★☆ buildings | ★★★★☆ plants | ★★★★☆ settlements | ★★★★★ large cards | ★★★☆☆ small neurons | ★★★☆☆ small nodes |
| **Biophilia** | ★★★☆☆ | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★☆☆☆☆ | ★★☆☆☆ | ★★★★★ |
| **Не похож на Obsidian** | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★☆ |

---

## Рекомендация: гибридный подход

Ни одна метафора не идеальна в чистом виде. Для Queryn рекомендуется
**гибрид Card Index + Terraced Landscape**:

### Почему гибрид

1. **Card Index** даёт лучший Fitts's law (крупные карточки = быстрый click),
   лучшее scaling (grid = space-efficient) и знакомую schema (картотека =
   zero learning). Но grid слишком «механичен» — не передаёт organic nature
   связей знаний

2. **Terraced Landscape** даёт free hierarchy encoding (elevation = instant
   hierarchy), calming biophilia и organic feel связей (побеги с sag). Но
   чистый terrace layout менее space-efficient чем grid

3. **Гибрид**: folders как **террасы** (horizontal bands, elevation = hierarchy),
   notes как **карточки** в **grid** внутри каждой террасы, links как
   **organic curves** (побеги) между карточками на разных террасах

### Конкретно

```
┌─────────────────────────────────────────────────┐
│ ▸ Математика                          [12 cards] │  ← верхняя терраса
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│   │Алгеб│ │Геом │ │МатАн│ │ТопоЛ│ │Диск│        │
│   └──┬──┘ └──┬──┘ └─┬───┘ └─────┘ └─────┘       │
│      │       │     │                              │
│      └───────┼─────┘ ← побег (intra-folder link)  │
│              │                                    │
│              ╲← побег (cross-folder link, sag)    │
│               ╲                                   │
│ ▸ Физика                             [8 cards]    │  ← нижняя терраса
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                 │
│   │Механ│ │Терм │ │Элект│ │Квант│                 │
│   └─────┘ └──┬──┘ └─────┘ └─────┘                 │
│              │                                    │
│              ↑← побег приходит сюда               │
└─────────────────────────────────────────────────┘
```

### Когнитивное обоснование гибрида

| Свойство | Источник | Когнитивный механизм |
|---|---|---|
| Elevation = hierarchy | Terraced | SNARC effect, preattentive vertical processing |
| Grid внутри террасы | Card Index | Fitts's law, positional stability |
| Organic links = побеги | Terraced | Gestalt continuity, biophilia |
| Террасы = chunks | Terraced + Card | Miller's 7±2 |
| Знакомая schema | Card Index | Zero extraneous load (cabinet/shelf) |
| Calming visual | Terraced | Biophilia, stress reduction (Ulrich, 1984) |
| Space-efficient | Card Index | Grid = maximum density, fits screen |
| Progressive disclosure | Both | Zoom: террасы → карточки → детали |

### Реализация с текущей архитектурой

Текущий план (`graph-implementation-plan.md`) предлагает **treemap + force-directed**
(Stage 1: treemap для folder regions, Stage 2: FD внутри regions). Гибрид
**Terraced + Card Index** совместим с этой архитектурой:

1. **Treemap** → заменить на **sliced treemap** (`d3.treemap().tile(d3.treemapSliced)`)
   — горизонтальные полосы (террасы) вместо прямоугольных regions. Elevation =
   hierarchy
2. **Force-directed внутри regions** → заменить на **grid layout** внутри каждой
   террасы. Grid = детерминированный, space-efficient, не нужен FD
3. **Springs** → остаются для smooth transitions при resize/zoom/filter. Cards
   spring к grid positions. `stiffness=0.15, damping=0.80`
4. **Links** → organic bezier curves (побеги) между grid positions в разных
   террасах. С лёгким vertical sag для organic feel
5. **Hub cards** → larger + accent fill + degree badge. Preattentive hierarchy

### Альтернативный layout код (концептуальный)

```typescript
// Замена d3.treemap() на sliced treemap (horizontal bands)
const tm = treemap()
  .tile(treemapSlice)  // горизонтальные полосы = террасы
  .size([width, height])
  .padding(8)           // gap между террасами
  .paddingInner(4)
  .round(true);

// Внутри каждой террасы — grid, не force-directed
function gridLayout(
  nodes: GraphNode[],
  region: { x0, y0, x1, y1 }
): Map<string, { x, y }> {
  const cols = Math.ceil(Math.sqrt(nodes.length * (region.x1 - region.x0) / (region.y1 - region.y0)));
  const rows = Math.ceil(nodes.length / cols);
  const cellW = (region.x1 - region.x0) / cols;
  const cellH = (region.y1 - region.y0) / rows;
  // Sort by degree (hubs first) → top-left
  nodes.sort((a, b) => b.degree - a.degree);
  // Place in grid
  // ...
}
```

---

## Список цитированных исследований

| Исследование | Автор(ы) | Год | Релевантность |
|---|---|---|---|
| Gestalt principles | Wertheimer | 1923 | Proximity, continuity, common fate |
| Schema theory | Bartlett | 1932 | Knowledge organized in mental frameworks |
| Cognitive maps | Tolman | 1948 | Spatial memory, internal representations |
| Hebbian learning | Hebb | 1949 | "Neurons that fire together wire together" |
| Fitts's law | Fitts | 1954 | Target acquisition: MT = a + b·log₂(2D/W) |
| Hick's law | Hick | 1952 | Decision time: RT = a + b·log₂(n+1) |
| Chunking (7±2) | Miller | 1956 | Working memory capacity |
| Affordance theory | Gibson | 1979 | Visual elements suggest action |
| Cognitive maps / hippocampus | O'Keefe & Nadel | 1978 | Place cells, spatial navigation (Nobel 2014) |
| Automatic spatial encoding | Hasher & Zacks | 1979 | Spatial info encoded without effort |
| Preattentive processing | Treisman & Gelade | 1980 | Feature integration theory |
| Dual coding theory | Paivio | 1971 | Visual + verbal = stronger memory |
| Cognitive load theory | Sweller | 1988 | Intrinsic / extraneous / germane load |
| Design affordances | Norman | 1988 | Visible affordances reduce learning |
| Gestalt common region | Palmer | 1992 | Elements in bounded area = grouped |
| Gestalt connectedness | Palmer & Rock | 1994 | Elements connected by lines = grouped |
| SNARC effect | Dehaene, Bossini & Giraux | 1993 | Vertical axis = hierarchy encoding |
| Biophilia hypothesis | Wilson | 1984 | Innate affinity for natural forms |
| Stress reduction | Ulrich | 1984 | Nature views reduce stress |
| Method of loci / fMRI | Maguire et al. | 2000, 2003 | Hippocampus & spatial memory |
| Fractal/branching patterns | Mandelbrot | 1977 | Branching = natural hierarchy pattern |
| Wood Wide Web | Simard et al. | 1997 | Mycorrhizal networks = knowledge sharing |
| Progressive disclosure | Nielsen | 2009 | Managing complexity through gradual reveal |
| Attention restoration | Kaplan | 1995 | Natural environments restore attention |
| Vertical spatial memory | Liu, Troyer & Levin | 2014 | Vertical > horizontal in recall |
| Hierarchical navigation | Landauer & Nachbar | 1985 | Hierarchical search faster than flat |
| Cognitive load in visualization | Sweller, van Merriënboer & Paas | 1998 | Cognitive architecture and design |
