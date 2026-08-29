---
authority: normative
lifecycle: active
---

# Архитектурные решения

Журнал решений фиксирует долгосрочные продуктовые и архитектурные границы
Osnova. Номер и путь ADR стабильны. Если решение заменено, страница остаётся на
прежнем пути, а связь с новым решением указывается во фронтматтере.

Перед созданием решения прочитайте [шаблон ADR](./template.md) и
[устав жизненного цикла](./lifecycle.md).

| № | Тема | Статус | Заменено |
| --- | --- | --- | --- |
| [0001](./adr-0001-windows-first.md) | Windows-first desktop | `superseded` | 0014 |
| [0002](./adr-0002-electron-react-typescript.md) | Electron, React и TypeScript | `accepted` | — |
| [0003](./adr-0003-folder-based-projects.md) | Folder-based проекты | `accepted` | — |
| [0004](./adr-0004-plugin-system.md) | Система плагинов | `superseded` | 0007 |
| [0005](./adr-0005-osnova-reborn.md) | Osnova Reborn | `accepted` | — |
| [0006](./adr-0006-artifacts-and-sessions.md) | Артефакты и переносимые сессии | `accepted` | — |
| [0007](./adr-0007-extension-contributions.md) | Extension contributions | `accepted` | — |
| [0008](./adr-0008-runtime-supervisor.md) | Общий Runtime Supervisor | `accepted` | — |
| [0009](./adr-0009-context-policy.md) | Контекст проекта | `accepted` | — |
| [0010](./adr-0010-agent-risk-policy.md) | Агент и policy рисков | `accepted` | — |
| [0011](./adr-0011-cross-session-memory.md) | Кросс-сессионная память агента | `accepted` | — |
| [0012](./adr-0012-unified-agent-loop.md) | Единый диалоговый агентный движок | `accepted` | — |
| [0013](./adr-0013-agent-network-tools.md) | Сетевые инструменты агента | `accepted` | — |
| [0014](./adr-0014-equal-desktop-targets.md) | Windows и macOS как равноправные desktop-цели | `accepted` | — |
| [0015](./adr-0015-model-provider-catalog.md) | Каталог и жизненный цикл поставщиков моделей | `accepted` | — |
| [0016](./adr-0016-extension-runtime-dependencies.md) | Среды исполнения и зависимости расширений | `accepted` | — |
| [0017](./adr-0017-material-viewer-host.md) | Единый host просмотрщика материалов | `accepted` | — |
| [0018](./adr-0018-errors-and-diagnostics.md) | Структурированные ошибки и диагностика | `accepted` | — |

## Правило замены

При замене решения новая ADR получает следующий свободный номер. Старая ADR
получает `adrStatus: superseded` и `supersededBy: N`, но не перемещается в
архив. Значение `supersededBy` должно указывать на существующую ADR со статусом
`accepted`.

## Правила для новых ADR

Новая страница получает следующий свободный номер и обязательные поля
фронтматтера. Страница содержит разделы `Контекст`, `Решение` и `Последствия`.
Подробные примеры находятся в [шаблоне ADR](./template.md), а переходы между
статусами описаны в [уставе жизненного цикла](./lifecycle.md).
