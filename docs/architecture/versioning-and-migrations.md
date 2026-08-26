---
authority: normative
lifecycle: active
---

# Версионирование и миграции

## Долгоживущие версии

- Project format: `0.1`, `0.2` — миграция только явным migrator.
- Artifact/session/relation descriptor: `schemaVersion: 1`.
- Extension Manifest: `manifestVersion: 1`.
- Osnova Tool Protocol: `1`.
- Local JSON-RPC: `osnova-rpc/1`.

Minor-релиз может добавлять optional fields и методы. Удаление поля, смена семантики или permission требует новой versioned boundary и ADR.

## Миграция проекта

`project.migrate` сначала возвращает dry-run plan. Реальный запуск сохраняет backup manifest, создаёт только новые служебные директории и меняет formatVersion атомарно. Ошибка вызывает rollback. Случайная папка никогда не инициализируется молча.

## Расширения

Проект хранит требуемую версию/range; локальный active version и lock являются производным состоянием. Установленные версии лежат side-by-side, а Operation, Runtime, Context Provider, Connector и Model Provider выбираются по lock конкретного проекта. Поэтому обновление расширения в одном проекте не меняет реализацию в другом.

Lock можно удалить и пересобрать. Permissions и сохранённые правила риска не принимаются из `.osnova`: доверие хранится локально в runtime и после переноса проекта выдаётся заново. Session events сохраняют переносимый аудит решения, но не дают проекту полномочий. Неизвестные artifact types сохраняются. Отсутствующее расширение влияет на соответствующие возможности, но не блокирует открытие проекта.

## Backward compatibility

Формат 0.1 остаётся читаемым. Legacy cards/relations адаптируются к общей artifact model при участии в новой операции; массовая принудительная обёртка не выполняется.
