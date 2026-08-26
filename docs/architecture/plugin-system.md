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
