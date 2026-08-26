---
authority: normative
lifecycle: active
adrStatus: accepted
---

# ADR 0008: Общий Runtime Supervisor

## Статус

Принято.

## Решение

Переименовать `osnova-ai-runtime` в `osnova-runtime`. Общий runtime владеет jobs,
extensions, context, model providers и agent orchestration. AI остается
опциональным capability.

Runtime поддерживает builtin, node-process, native-process, OCI и remote drivers
с lifecycle `job`, `project` или `shared`.

## Последствия

Desktop main больше не запускает произвольный plugin code. Docker не требуется
для базовых проектов и process tools.
