---
authority: normative
lifecycle: active
adrStatus: accepted
---

# ADR 0007: Extension contributions

## Статус

Принято. Supersedes ADR 0004 в части JS/TS-only plugin model.

## Решение

Пакет расширения объявляет contributions и runtime. Tool является пользовательской
возможностью, Operation - вызываемым действием. Расширения объединяются через
артефакты и операции, а не через внутренние desktop APIs.

## Последствия

Поддерживаются theme-only, process, OCI и remote extensions. Commands API 0.1
считается экспериментальным compatibility layer.
