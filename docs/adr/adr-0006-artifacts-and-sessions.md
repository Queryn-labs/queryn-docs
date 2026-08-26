---
authority: normative
lifecycle: active
adrStatus: accepted
---

# ADR 0006: Артефакты и переносимые сессии

## Статус

Принято.

## Решение

Результаты, опубликованные operation flow, описываются ArtifactDescriptor с
обычными файловыми payloads и provenance. Нативные notes и assets остаются
обычными файлами и не получают ArtifactDescriptor автоматически. Сессии хранятся
в папке проекта как session metadata и append-only JSONL events. `.osnova` не
хранит единственную копию пользовательской истории.

## Последствия

Результаты можно переносить и повторно использовать. Технические подробные логи
остаются производными и могут быть удалены.
