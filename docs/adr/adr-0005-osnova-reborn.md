---
authority: normative
lifecycle: active
adrStatus: accepted
---

# ADR 0005: Osnova Reborn

## Статус

Принято.

## Контекст

Folder-based MVP полезен, но команды плагинов и отдельный AI status process не
описывают композицию ручных инструментов, тяжелых runtime и переносимых
результатов.

## Решение

Принять Osnova Reborn как основное направление. Проект объединяет файлы,
сессии, артефакты, подключенные инструменты и опциональную agent orchestration.

## Последствия

Формат 0.1 сохраняется для чтения. Новые контракты вводятся форматом 0.2,
Extension Manifest v1 и Osnova Tool Protocol v1.
