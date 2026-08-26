---
authority: normative
lifecycle: active
---

# Обзор архитектуры

Queryn разделена на небольшие репозитории со стабильными зонами ответственности.

Основная модель данных - folder-based проект. Desktop-клиент использует общий
runtime control plane, а runtime использует core для project IO и стабильных
доменов. Расширения объявляют tools, operations, artifact types и runtime через
SDK. AI является опциональным модулем общего runtime.

## Слои

- Формат проекта: файлы, папки, артефакты, сессии и схемы.
- Core libraries: project IO, работа с manifest, validation и общие типы.
- Runtime: jobs, extensions, operations, context, models и agent orchestration.
- Desktop-клиент: Windows/macOS application shell, native integration и UI.
- Extension SDK: manifest, contributions, permissions и protocol contracts.

## Поток выполнения

```text
Desktop / CLI
  -> queryn-runtime
    -> policy + job manager
      -> builtin / process / OCI / remote tool
        -> outbox
      -> artifact validation + atomic publication
    -> session event + provenance
```

Сторонний runtime не получает прямой доступ на запись в папку проекта. Он
получает материализованные inputs и возвращает artifact candidates.

## Пилот Mermaid: запрос к runtime

```mermaid
flowchart LR
  Desktop["Desktop или CLI"] --> Runtime["queryn-runtime"]
  Runtime --> Policy["Policy и Job Manager"]
  Policy --> Tool["Builtin, process, OCI или remote tool"]
  Tool --> Outbox["Изолированный outbox"]
  Outbox --> Publish["Проверка и атомарная публикация"]
  Publish --> Project["Папка проекта"]
  Publish --> Session["Событие сессии и provenance"]
```
