---
authority: normative
lifecycle: active
---

# Спецификация

Авторитетное описание формата проекта находится в репозитории `queryn-spec`.
Эта страница связывает структуру папки, JSON Schema и реализации, которые
используют контракт в workspace.

## Канон формата {#format-canon}

Проект является обычной папкой на диске. `queryn.json` идентифицирует проект и
объявляет `formatVersion`. Пользовательские материалы остаются в `notes/` и
`assets/`. Переносимые результаты и рабочие сессии в формате `0.2` находятся в
`artifacts/`, `sessions/` и `relations/`. `.queryn/` содержит производные
индексы, lock и application metadata и может быть пересобран.

## Диаграмма формата {#format-diagram}

Каноническая структура `0.2` показана рядом с читаемой структурой `0.1`.
Переход выполняется явной операцией `project.migrate` с dry-run и backup
manifest. Обычное открытие проекта не меняет `formatVersion`.

```mermaid
flowchart TB
  subgraph Format02["Формат 0.2"]
    Project02["project/"]
    Manifest02["queryn.json<br/>manifest и formatVersion 0.2"]
    Notes02["notes/<br/>Markdown-конспекты"]
    Assets02["assets/<br/>обычные пользовательские файлы"]
    Artifacts02["artifacts/<br/>descriptors и data/"]
    Sessions02["sessions/<br/>session.json и events.jsonl"]
    Relations02["relations/<br/>связи artifacts"]
    Derived02[".queryn/<br/>индексы, lock и metadata"]
    Project02 --> Manifest02
    Project02 --> Notes02
    Project02 --> Assets02
    Project02 --> Artifacts02
    Project02 --> Sessions02
    Project02 --> Relations02
    Project02 --> Derived02
  end

  subgraph Format01["Формат 0.1"]
    Project01["project/"]
    Manifest01["queryn.json<br/>manifest и formatVersion 0.1"]
    Notes01["notes/"]
    Assets01["assets/"]
    Cards01["cards/<br/>legacy cards"]
    Graph01["graph/<br/>legacy relations"]
    Ai01["ai/<br/>явно сохранённые AI-результаты"]
    Derived01[".queryn/<br/>производное состояние"]
    Project01 --> Manifest01
    Project01 --> Notes01
    Project01 --> Assets01
    Project01 --> Cards01
    Project01 --> Graph01
    Project01 --> Ai01
    Project01 --> Derived01
  end

  Migration["project.migrate<br/>dry-run, backup и atomic update"]
  Project01 -.-> Migration
  Migration -.-> Project02
```

Для `0.1` обязательными для проверки остаются `queryn.json`, `notes/`,
`assets/` и `.queryn/`. Каталоги `cards/`, `graph/` и `ai/` являются legacy
слоем, который остаётся читаемым. В `0.2` новые AI-результаты используют
общую модель `artifacts/`, а существующий `ai/` не удаляется автоматически.

## Сущности, схемы и реализации {#schema-implementation-map}

Генератор `queryn-spec/scripts/generate-contracts.mjs` компилирует публичные
схемы в generated types. Реализация операций с папкой остаётся в
`@queryn/project`, а manifest и validation разделены на узкие core-пакеты.
Оркестрация runtime использует эти типы, но не заменяет их отдельным форматом.

| Сущность | Схема `queryn-spec` | Реализация в `@queryn/*` и runtime |
| --- | --- | --- |
| Manifest проекта | `schemas/queryn.schema.json` | `@queryn/types` `QuerynManifest`, `@queryn/manifest` `createManifest` и `readManifest`, `@queryn/validation` |
| Версия формата | `$defs/formatVersion` в `queryn.schema.json` | `@queryn/types` `ProjectFormatVersion`, `@queryn/project` `inspectProjectMigration` и `migrateProject` |
| Конспект | `schemas/note-frontmatter.schema.json` | `@queryn/types` `Note` и `NoteSummary`, `@queryn/project` `note.ts` и `frontmatter.ts` |
| Artifact descriptor | `schemas/artifact.schema.json` | `@queryn/types` `ArtifactDescriptor`, `@queryn/project` `publishArtifact`, `registerExistingArtifact`, `readArtifact` |
| Artifact relation | `schemas/artifact-relation.schema.json` | `@queryn/types` `ArtifactRelation`, `@queryn/project` `createArtifactRelation` и `listArtifactRelations` |
| Session descriptor | `schemas/session.schema.json` | `@queryn/types` `SessionDescriptor`, `@queryn/project` `createSession`, `readSession` и `updateSession` |
| Session event | `schemas/session-event.schema.json` | `@queryn/types` `SessionEvent`, `@queryn/project` `appendSessionEvent` и `readSessionEvents` |
| Context envelope | `schemas/context-envelope.schema.json` | `@queryn/types` `ContextEnvelope`, runtime `ContextBroker` и SDK `ContextProviderHandler` |
| Job descriptor | `schemas/job.schema.json` | `@queryn/types` `JobDescriptor`, runtime `JobManager` |
| Agent plan | `schemas/agent-plan.schema.json` | `@queryn/types` `AgentPlan` как совместимая схема; текущий runtime не создаёт и не исполняет отдельный план, а `AgentKernel` ограничивает steps и duration |
| Extension Manifest v1 | `schemas/extension-manifest.schema.json` | generated type в `@queryn/plugin-sdk`, SDK `validateExtensionManifest`, runtime `ExtensionManager` |
| Legacy card | `schemas/card.schema.json` | `@queryn/types` `Card`, отдельного чтения `cards/` в текущем `@queryn/project` нет |
| Legacy relation | `schemas/relation.schema.json` | `@queryn/types` `Relation`, отдельного чтения `graph/` в текущем `@queryn/project` нет |

Схемы `card` и `relation` остаются Draft-контрактами для формата `0.1`.
Текущий `@queryn/project` не публикует и не читает эти legacy-файлы отдельными
операциями. Новые результаты в `0.2` публикуются как `ArtifactDescriptor`.

## Матрица версий {#format-version-matrix}

| Аспект | `0.1` | `0.2` |
| --- | --- | --- |
| Значение `formatVersion` | Разрешено схемой и validation | Разрешено схемой и является текущей максимальной версией в workspace |
| Базовая структура | `queryn.json`, `notes/`, `assets/`, `.queryn/` | `queryn.json`, `notes/`, `assets/`, `artifacts/`, `sessions/`, `relations/`, `.queryn/` |
| Старые учебные данные | `cards/` и `graph/` | Сохраняются как legacy-файлы, отдельной обработки в `@queryn/project` нет, новые связи используют `relations/` и artifacts |
| AI-результаты | Явно сохранённые файлы в `ai/` | Новые результаты в `artifacts/`, существующий `ai/` не удаляется автоматически |
| Сессии | Не входят в обязательную структуру Queryn | `sessions/session.json` и append-only `events.jsonl` |
| Artifact descriptor | Не является обязательным слоем | `artifacts/<id>.json` и payloads в `artifacts/data/` |
| Проверка структуры | `@queryn/validation` требует manifest, notes, assets и `.queryn/` | `@queryn/validation` дополнительно требует artifacts, sessions и relations |
| Создание проекта | Нужно явно выбрать версию, если нужен legacy формат | `@queryn/manifest` и `@queryn/project` создают `0.2` по умолчанию |
| Открытие проекта | Чтение разрешено, формат не меняется | Чтение разрешено, производные каталоги можно восстановить |
| Переход между версиями | Источник явной миграции | Целевая версия текущего migrator |
| Миграция | `project.migrate` возвращает dry-run план | Создаёт недостающие каталоги, сохраняет backup manifest и атомарно обновляет manifest |

Текущая максимальная версия `ProjectFormatVersion` равна `0.2`. Она не равна
`hostVersion` расширений `0.2.0` в `queryn-runtime`: host contract проверяет
совместимость расширения с runtime и является отдельной осью версий.

## Правила переносимости {#portability-rules}

- Папка проекта должна оставаться понятной без `.queryn/`. Индексы и runtime
  caches считаются производными данными.
- `queryn.json.extensions` хранит переносимые требования к расширениям. Выбранные
  версии и integrity находятся в удаляемом `.queryn/extensions/lock.json`.
- Permissions, secrets и сохранённые policy rules не принимаются из папки
  проекта. После переноса локальное доверие выдаётся заново.
- Runtime и внешний инструмент не записывают в папку напрямую. Candidate output
  проходит outbox, проверку и atomic publication через core API.

Подробные поля схем и примеры находятся в
`queryn-spec/specification/project-format.md`, `queryn-spec/schemas/` и
`queryn-spec/examples/`.
