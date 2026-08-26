---
authority: normative
lifecycle: active
adrStatus: accepted
---

# ADR 0009: Контекст проекта

## Статус

Принято.

## Решение

Контекст разрешается на уровне artifact type через `none`, `automatic`,
`declarative` или `custom`. Provider обязан поддерживать compact и expanded
levels с budget и source attribution внутри Context Envelope. Эта атрибуция
описывает источники самого контекста. Текущий `ChatRun` и финальное
`assistant-message` не переносят структурированный список `sources` в ответе.

В текущем desktop пользователь видит ограниченный preview: оценку объёма,
получателей и до восьми источников. Preview не является точным журналом
отправленного запроса и не поддерживает прикрепление артефактов из composer.
Полная инспекция исходящего контекста и атрибуция источников в финальном ответе
остаются будущими возможностями.

По умолчанию доступен только текущий проект. Workspace-wide и computer-wide
источники являются будущими opt-in connectors.
