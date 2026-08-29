---
authority: normative
lifecycle: active
---

# Система расширений

Расширения добавляют themes, tools, operations, artifact types, context
providers, connectors, model providers и будущие views.

## Границы

- Каждый пакет объявляет identity, version, compatibility, contributions,
  permissions и runtime.
- Operation IDs и artifact type IDs являются namespaced и стабильными.
- Runtime получает только brokered host API и ограниченные inputs.
- Установка, подключение к проекту и запущенный runtime являются разными
  состояниями.
- Пакет может работать без AI и не обязан предоставлять context provider.

Общий runtime отвечает за discovery, проверку, installation staging, policy,
execution и rollback. SDK отвечает за публичный контракт и Developer Kit.

MCP поддерживается через адаптер. Он не заменяет внутренний контракт артефактов,
provenance, installation и runtime lifecycle.

## Зависимости и совместимость

Установка расширения не выполняет его package manager и не изменяет глобальную
среду пользователя. Process-пакет поставляется самодостаточным, OCI закрепляется
по digest, модель проходит через отдельный `ModelManager`, а remote runtime
остаётся явным сетевым получателем. Полная политика описана в
[архитектуре сред инструментов](./tool-runtime-dependencies.md) и
[ADR 0016](../adr/adr-0016-extension-runtime-dependencies.md).

Ответ `initialize` процессного runtime является обязательной проверкой
совместимости до регистрации операций как доступных. Отсутствующая зависимость
делает недоступными только связанные возможности и не блокирует проект.

## Интерфейсные вклады

Текущий `contributes.views` валидируется, но не является реализованной
поверхностью desktop. Просмотр материалов расширяется отдельным узким вкладом
`previewProviders`, описанным в [архитектуре просмотрщика](./material-viewers.md).
Поставщик ссылается на существующую operation, запускается через общий
`OperationService` и возвращает данные по host-схеме. Произвольный сторонний UI
не входит в первый контракт просмотрщика и требует отдельного ADR.
