---
authority: normative
lifecycle: active
adrStatus: superseded
supersededBy: 14
---

# ADR 0001: Windows-first desktop

## Статус

Решение заменено ADR 0014.

## Контекст

Первые целевые пользователи в основном работают на Windows desktop. Продукту нужен прямой доступ к папкам, native file dialogs и привычная модель приложения.

## Решение

Osnova начинается как Windows-first desktop-приложение.

## Последствия

Первая desktop-реализация может оптимизировать packaging, тестирование и файловое поведение под Windows. Cross-platform поддержка должна оставаться возможной, но не является ограничением первого релиза.
