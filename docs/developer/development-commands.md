---
authority: normative
lifecycle: active
---

# Команды разработки и layout

Workspace состоит из отдельных соседних репозиториев. Корневого
<code>package.json</code> у <code>osnova-foundation</code> нет, поэтому
установка и команды запускаются из конкретного каталога. Локальные зависимости
ссылаются на соседние пакеты через <code>file:</code> или
<code>workspace:</code>.

## Layout

~~~text
osnova-foundation/
├── osnova-spec/
│   ├── schemas/                 # JSON Schema и формат проекта
│   ├── contract/               # контракты и сгенерированные типы
│   ├── protocol/               # протоколы runtime и инструментов
│   └── scripts/                # генерация, verify и проверки документации
├── osnova-core/
│   └── packages/
│       ├── types/              # базовые типы
│       ├── manifest/           # манифест проекта и расширения
│       ├── validation/         # проверка данных
│       └── project/             # операции с папкой проекта
├── osnova-plugin-sdk/
│   ├── src/                    # SDK, CLI и testkit
│   └── templates/              # шаблоны автора расширения
├── osnova-runtime/
│   ├── src/                    # supervisor, jobs, policy, agent, RPC, CLI
│   └── dist/                   # результат build, не исходный контракт
├── osnova-desktop/
│   └── src/
│       ├── main/               # Electron main и IPC handlers
│       ├── preload/            # window.osnova bridge
│       └── renderer/           # React UI
├── osnova-plugins/
│   ├── catalog/                # registry расширений
│   ├── examples/               # проверяемые пакеты
│   └── scripts/                # validation и runtime E2E
└── osnova-docs/
    └── docs/                   # сайт VitePress
~~~

Workspace-файлы отражают реальные связи. <code>osnova-core</code> включает
<code>packages/*</code>. <code>osnova-runtime</code> подключает core packages
и SDK. <code>osnova-desktop</code> подключает core packages, SDK и runtime.
<code>osnova-plugins</code> подключает SDK. У каждого каталога есть свой
<code>pnpm-lock.yaml</code>.

## Базовый порядок сборки

Для чистого checkout сначала устанавливаются зависимости в требуемых
репозиториях, затем строятся пакеты, на которые ссылается следующий слой:

~~~bash
cd osnova-spec && pnpm install && pnpm generate && pnpm verify
cd ../osnova-core && pnpm install && pnpm build
cd ../osnova-plugin-sdk && pnpm install && pnpm build
cd ../osnova-runtime && pnpm install && pnpm build
cd ../osnova-desktop && pnpm install && pnpm typecheck
cd ../osnova-plugins && pnpm install
~~~

Команды <code>cd</code> в этом примере последовательны: после каждой строки
текущим каталогом становится следующий репозиторий. В CI или отдельных
терминалах используйте соответствующий абсолютный путь.

## Команды по репозиториям

| Репозиторий | Команды из package scripts | Что делает |
| --- | --- | --- |
| <code>osnova-spec</code> | <code>pnpm test</code> | Запускает Node test для скриптов |
|  | <code>pnpm verify</code> | Проверяет контракты |
|  | <code>pnpm generate</code> | Генерирует контракты |
|  | <code>pnpm docs:check</code> | Запускает проверку документации |
|  | <code>pnpm docs:map</code> | Запускает проверку карты модулей документации |
| <code>osnova-core</code> | <code>pnpm build</code> | Очищает dist и компилирует types, manifest, validation, project |
|  | <code>pnpm test</code> | Сначала выполняет pretest, затем Vitest |
|  | <code>pnpm lint</code> | TypeScript-проверка без emit |
| <code>osnova-plugin-sdk</code> | <code>pnpm build</code> | Собирает SDK |
|  | <code>pnpm typecheck</code> | TypeScript-проверка без emit |
|  | <code>pnpm test</code> | Сначала выполняет pretest, затем build и selftest |
| <code>osnova-runtime</code> | <code>pnpm build</code> | Пересобирает <code>dist</code> runtime |
|  | <code>pnpm typecheck</code> | TypeScript-проверка без emit |
|  | <code>pnpm test</code> | Сначала выполняет pretest, затем build, тестовую компиляцию и Node test |
|  | <code>pnpm doctor</code> | Запускает <code>node dist/cli.js doctor</code> |
|  | <code>pnpm selftest</code> | Запускает временный end-to-end selftest runtime |
| <code>osnova-desktop</code> | <code>pnpm dev</code> | Запускает Electron через electron-vite; перед этим <code>predev</code> проверяет Electron |
|  | <code>pnpm build</code> | TypeScript-проверка и electron-vite build |
|  | <code>pnpm typecheck</code> | TypeScript-проверка |
|  | <code>pnpm test</code> | Запускает тест slug |
|  | <code>pnpm preview</code> | Electron preview; перед этим <code>prepreview</code> проверяет Electron |
| <code>osnova-plugins</code> | <code>pnpm test</code> | Проверяет манифесты примеров и каталог |
|  | <code>pnpm test:runtime</code> | Запускает runtime E2E для advanced media tool |
| <code>osnova-docs</code> | <code>pnpm dev</code> | Запускает VitePress dev server |
|  | <code>pnpm build</code> | Собирает production-сайт |
|  | <code>pnpm preview</code> | Показывает production-сборку |

## Pretest и зависимости

В репозиториях, где объявлен <code>pretest</code>, package manager запускает
его перед <code>test</code>. Оба шага ниже являются частью фактического
pretest:

~~~bash
node ../osnova-spec/scripts/generate-contracts.mjs --check
node ../osnova-spec/scripts/check-comment-hygiene.mjs --check --repo <repo-name>
~~~

| Репозиторий | Pretest | Что должно быть доступно |
| --- | --- | --- |
| <code>osnova-core</code> | Проверка сгенерированных контрактов и comment hygiene для <code>osnova-core</code> | Собранный или установленный <code>osnova-spec</code> рядом |
| <code>osnova-plugin-sdk</code> | Те же две проверки с <code>--repo osnova-plugin-sdk</code> | <code>osnova-spec</code>; тест после pretest сам собирает SDK |
| <code>osnova-runtime</code> | Те же две проверки с <code>--repo osnova-runtime</code> | <code>osnova-spec</code>, dist core packages и dist SDK для сборки и тестов |
| <code>osnova-desktop</code> | Отдельного <code>pretest</code> нет | Собранные локальные core/runtime/SDK-пакеты для корректного typecheck и Electron-сборки |
| <code>osnova-spec</code> | Отдельного <code>pretest</code> нет | Свои scripts и devDependencies |
| <code>osnova-plugins</code> | Отдельного <code>pretest</code> нет | <code>test:runtime</code> требует dist SDK, runtime и core project |
| <code>osnova-docs</code> | Отдельного <code>pretest</code> нет | Свои зависимости VitePress и Mermaid |

Флаг <code>--check</code> у генератора не переписывает контракты. Если он
находит drift, сначала выполните согласованный <code>pnpm generate</code> в
<code>osnova-spec</code>, проверьте diff и только затем повторите gate.

## Быстрая проверка слоя

~~~bash
cd osnova-core && pnpm test
cd ../osnova-plugin-sdk && pnpm test
cd ../osnova-runtime && pnpm selftest && pnpm test
cd ../osnova-desktop && pnpm typecheck && pnpm test
cd ../osnova-plugins && pnpm test
cd ../osnova-docs && pnpm build
~~~

Если менялся контракт в <code>osnova-spec</code>, перед этими командами
повторите <code>pnpm generate</code> и <code>pnpm verify</code>. Команды не
включают публикацию или установку пакетов во внешние каталоги.
