---
authority: normative
lifecycle: active
---

# Политика local-first, AI и приватности

## Source of truth

Папка проекта владеет заметками, медиа, descriptors, relations и session history. `.queryn/` содержит удаляемые индексы, checkpoints, runtime state и подробные логи. Удаление `.queryn/` не должно уничтожать пользовательский результат.

## AI опционален

Без model provider в desktop работают обычные Files и Notes. Operations и
`queryn.graph.link` доступны через runtime API и CLI, причём `graph.link` является
relation API, а не графовой поверхностью. `ToolWorkspace` и полноценные графовые и
карточные поверхности не входят в текущую поставку.
Local и cloud providers реализуют один контракт. Встроенная конфигурация сейчас
ограничена OpenAI-compatible endpoint, а другие типы provider требуют отдельного
адаптера расширения.

## Отправка данных

Целевой контракт политики для полного context envelope требует, чтобы перед
облачным вызовом пользователь мог проверить получателя, источники и объём.

- Context Provider объявляет sensitivity и `allowedRecipients`.
- Перед cloud-вызовом пользователь должен видеть модель, получателя, источники и объём.
- `context:none` запрещает раскрытие payload в явном `context.resolve`.
- Sensitivity и `allowedRecipients` ограничивают явный `context.resolve`, а
  project.read guard блокирует чувствительное содержимое для облачного
  `agent.chat`. Поисковые фрагменты и compact catalog пока не проходят через
  единый путь контроля.
- При явном `context.resolve` неизвестный MIME даёт модели только безопасные
  метаданные.
- Prompt injection внутри материала остаётся данными и не предоставляет permission на Operation.

Текущий desktop-поток перед cloud chat запрашивает разовое согласие на
получателя. В preview контекста видны оценка объёма, количество источников и до
восьми их названий. Это не является выбором или прикреплением источников.
Финальное `assistant-message` текущего agent contract не содержит
структурированного списка `sources`. Полная настройка состава отправляемого
контекста и атрибуция источников в финальном ответе остаются будущим развитием.
`agent.chat` не вызывает ContextBroker, поэтому точный исходящий набор и
поисковые фрагменты не проходят полный аудит этого контракта.

## Секреты

API keys хранятся в macOS Keychain или Windows DPAPI/Credential boundary. Они не записываются в `queryn.json`, sessions или extension package.

## Индексация

По умолчанию индексируется только открытый проект. Индексация компьютера — будущий отдельный connector с явным scope, permissions и возможностью полного удаления индекса.
