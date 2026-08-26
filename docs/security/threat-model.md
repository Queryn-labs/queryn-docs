---
authority: normative
lifecycle: active
---

# Threat model Osnova Reborn

## Активы

Содержимое и история проекта, credentials, целостность host/desktop, model files, вычислительные ресурсы, подтверждения и provenance.

## Границы доверия

```text
Renderer (untrusted web boundary)
  -> typed preload
Desktop main
  -> authenticated local RPC
osnova-runtime
  -> process / OCI / remote tool
Artifact Ingestor
  -> project folder
```

Renderer не получает Node, shell или произвольный RPC. Runtime token доступен только main process. Агент не получает filesystem/shell API.

## Основные угрозы и меры

| Угроза | Мера |
|---|---|
| path traversal / symlink escape | project-relative normalization, realpath/lstat, isolated outbox |
| extension package bomb | package и unpacked size limits, per-file SHA-256 |
| подмена версии | immutable directory, per-file SHA-256, atomic active pointer; signed catalog remains target |
| prompt injection | model output проходит schema + policy; данные не создают permission |
| renderer compromise | Electron sandbox, sender/frame validation, CSP, narrow preload |
| container escape surface | no Docker socket/project mount/root/capabilities/network by default |
| утечка cloud provider | Для явного `context.resolve` работают recipients/sensitivity и approval. В `agent.chat` project.read guard ограничивает sensitive cloud payload, но project search и snippets идут отдельным путём |
| повтор необратимого шага | retry только idempotent; Agent сам не повторяет destructive step |
| crash посередине публикации | staging/outbox, atomic rename, terminal job после audit write |
| кража credentials из проекта | Keychain/DPAPI, secrets absent from project and logs |

## Остаточные риски

Node Permission Model — defense-in-depth, не защита от malicious code. Native process и разрешённый remote server требуют доверия. OCI уменьшает поверхность, но не делает Docker daemon безопасным автоматически. Подпись подтверждает издателя и целостность, а не отсутствие уязвимостей.

Текущий агентный цикл не строит запрос через ContextBroker: он передаёт модели
историю, observations и результаты project tools. Поэтому preview не является
аудитом исходящего chat payload, а сквозная фильтрация sensitivity для поисковых
snippets и структурированная атрибуция источников остаются целевой возможностью.
