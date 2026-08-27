---
authority: normative
lifecycle: active
---

# Политика расширений и доверия

## Три уровня

1. Package объявляет максимальные permissions.
2. Пользователь должен выдавать их при подключении к конкретному проекту.
3. Каждый запуск проверяется risk-policy; network, external side effect и privileged требуют подтверждения или project-scoped правила.

## Установка

Целевая модель каталога поставляет подписанные packages и digest-pinned OCI
images. В текущем desktop-пути Tool Manager отсутствует переключатель Developer
Mode, а установка локального пакета всегда передаёт `allowUnsigned: true`.
Следовательно, этот путь фактически предназначен для разработки и не является
гарантированно подписанным каталогом. CLI принимает неподписанный пакет только
с явным `--developer-mode`.
Версия immutable, версии лежат side-by-side, active pointer меняется атомарно и
может быть откатан.

При подключении расширения текущий desktop передаёт runtime весь объявленный
`manifest.permissions`. Экран показывает список, но не даёт выбрать отдельные
разрешения. Гранулярное согласие и объяснение получателя данных остаются
целевым уровнем политики.

Host вычисляет effective policy сам: remote/network runtime всегда добавляет
`network:use` и риск не ниже `network-egress`, GPU повышает риск до
`privileged`, а native process требует `native:execute` и всегда считается
`privileged`. Автор расширения не может ослабить эти ограничения, назвав
операцию `safe-read`.

Install record содержит SHA-256 каждого файла. Несовпадение при следующей
активации переводит конкретную версию в integrity error, а не исполняет её и не
блокирует открытие всего проекта. Подпись каталога остаётся отдельным слоем
доверия; checksum сам по себе не доказывает издателя.

## Runtime

- builtin доверен и подписан Queryn;
- node-process получает defense-in-depth Node Permission Model, который не считается security boundary;
- native-process требует высокого доверия и не обещает защиту от malicious code;
- OCI запускается без project mount, Docker socket, root, capabilities и сети по умолчанию;
- remote требует HTTPS, кроме loopback, и network permission.

## Публикация результата

Advanced Tool не пишет в проект напрямую. Он получает read-only input, work, outbox и read-only models. Host проверяет пути, symlinks, MIME, размеры, типы и hash, а затем публикует выбранные кандидаты атомарно.

## Лицензии

Разработчик указывает лицензию package, image и model dependency. Архитектурные идеи Sentient OS допустимы как reference; перенос AGPL-кода в proprietary desktop без отдельного решения запрещён.
