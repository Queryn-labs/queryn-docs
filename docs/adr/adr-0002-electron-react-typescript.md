---
authority: normative
lifecycle: active
adrStatus: accepted
---

# ADR 0002: Electron, React и TypeScript

## Статус

Принято.

## Контекст

Osnova нужен desktop shell, поддерживаемый UI и общие TypeScript-контракты с core packages и plugin SDK.

## Решение

Desktop-клиент использует Electron, React и TypeScript вместе с `electron-vite`.

## Последствия

Приложение может разделять типы с `osnova-core` и `osnova-plugin-sdk`. Electron добавляет сложность packaging и process boundaries, поэтому код main, preload и renderer должен оставаться явно разделенным.
