---
authority: normative
lifecycle: active
adrStatus: superseded
supersededBy: 7
---

# ADR 0004: Система плагинов

## Статус

Решение заменено ADR 0007.

## Контекст

Osnova должна поддерживать расширения без переноса каждого предметного workflow в desktop-клиент.

## Решение

Историческое решение ограничивало плагины TypeScript/JavaScript-командами. Reborn заменяет его общим Extension Manifest v1, Operations и Runtime Supervisor.

## Последствия

Системе плагинов нужен стабильный SDK и desktop permission model. Начальная реализация должна определить контракт до полноценного plugin marketplace.
