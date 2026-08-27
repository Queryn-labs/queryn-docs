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
├── queryn-spec/
│   ├── schemas/                 # JSON Schema и формат проекта
│   ├── contract/               # контракты и сгенерированные типы
│   ├── protocol/               # протоколы runtime и инструментов
│   └── scripts/                # генерация, verify и проверки документации
├── queryn-core/
│   └── packages/
│       ├── types/              # базовые типы
│       ├── manifest/           # манифест проекта и расширения
│       ├── validation/         # проверка данных
│       └── project/             # операции с папкой проекта
├── queryn-sdk/
│   ├── src/                    # SDK, CLI и testkit
│   └── templates/              # шаблоны автора расширения
├── queryn-runtime/
│   ├── src/                    # supervisor, jobs, policy, agent, RPC, CLI
│   └── dist/                   # результат build, не исходный контракт
├── queryn-desktop/
│   └── src/
│       ├── main/               # Electron main и IPC handlers
│       ├── preload/            # window.queryn bridge
│       └── renderer/           # React UI
├── queryn-extensions/
│   ├── catalog/                # registry расширений
│   ├── examples/               # проверяемые пакеты
│   └── scripts/                # validation и runtime E2E
└── queryn-docs/
    └── docs/                   # сайт VitePress
~~~

Workspace-файлы отражают реальные связи. <code>queryn-core</code> включает
<code>packages/*</code>. <code>queryn-runtime</code> подключает core packages
и SDK. <code>queryn-desktop</code> подключает core packages, SDK и runtime.
<code>queryn-extensions</code> подключает SDK. У каждого каталога есть свой
<code>pnpm-lock.yaml</code>.

## Базовый порядок сборки

Для чистого checkout сначала устанавливаются зависимости в требуемых
репозиториях, затем строятся пакеты, на которые ссылается следующий слой:

~~~bash
cd queryn-spec && pnpm install && pnpm generate && pnpm verify
cd ../queryn-core && pnpm install && pnpm build
cd ../queryn-sdk && pnpm install && pnpm build
cd ../queryn-runtime && pnpm install && pnpm build
cd ../queryn-desktop && pnpm install && pnpm typecheck
cd ../queryn-extensions && pnpm install
~~~

Команды <code>cd</code> в этом примере последовательны: после каждой строки
текущим каталогом становится следующий репозиторий. В CI или отдельных
терминалах используйте соответствующий абсолютный путь.

## Команды по репозиториям

| Репозиторий | Команды из package scripts | Что делает |
| --- | --- | --- |
| <code>queryn-spec</code> | <code>pnpm test</code> | Запускает Node test для скриптов |
|  | <code>pnpm verify</code> | Проверяет контракты |
|  | <code>pnpm generate</code> | Генерирует контракты |
|  | <code>pnpm docs:check</code> | Запускает проверку документации |
|  | <code>pnpm docs:map</code> | Запускает проверку карты модулей документации |
| <code>queryn-core</code> | <code>pnpm build</code> | Очищает dist и компилирует types, manifest, validation, project |
|  | <code>pnpm test</code> | Сначала выполняет pretest, затем Vitest |
|  | <code>pnpm lint</code> | TypeScript-проверка без emit |
| <code>queryn-sdk</code> | <code>pnpm build</code> | Собирает SDK |
|  | <code>pnpm typecheck</code> | TypeScript-проверка без emit |
|  | <code>pnpm test</code> | Сначала выполняет pretest, затем build и selftest |
| <code>queryn-runtime</code> | <code>pnpm build</code> | Пересобирает <code>dist</code> runtime |
|  | <code>pnpm typecheck</code> | TypeScript-проверка без emit |
|  | <code>pnpm test</code> | Сначала выполняет pretest, затем build, тестовую компиляцию и Node test |
|  | <code>pnpm doctor</code> | Запускает <code>node dist/cli.js doctor</code> |
|  | <code>pnpm selftest</code> | Запускает временный end-to-end selftest runtime |
| <code>queryn-desktop</code> | <code>pnpm dev</code> | Запускает Electron через electron-vite; перед этим <code>predev</code> проверяет Electron |
|  | <code>pnpm build</code> | TypeScript-проверка и electron-vite build |
|  | <code>pnpm typecheck</code> | TypeScript-проверка |
|  | <code>pnpm test</code> | Запускает тест slug |
|  | <code>pnpm preview</code> | Electron preview; перед этим <code>prepreview</code> проверяет Electron |
| <code>queryn-extensions</code> | <code>pnpm test</code> | Проверяет манифесты примеров и каталог |
|  | <code>pnpm test:runtime</code> | Запускает runtime E2E для advanced media tool |
| <code>queryn-docs</code> | <code>pnpm dev</code> | Запускает VitePress dev server |
|  | <code>pnpm build</code> | Собирает production-сайт |
|  | <code>pnpm preview</code> | Показывает production-сборку |

## Pretest и зависимости

В репозиториях, где объявлен <code>pretest</code>, package manager запускает
его перед <code>test</code>. Оба шага ниже являются частью фактического
pretest:

~~~bash
node ../queryn-spec/scripts/generate-contracts.mjs --check
node ../queryn-spec/scripts/check-comment-hygiene.mjs --check --repo <repo-name>
~~~

| Репозиторий | Pretest | Что должно быть доступно |
| --- | --- | --- |
| <code>queryn-core</code> | Проверка сгенерированных контрактов и comment hygiene для <code>queryn-core</code> | Собранный или установленный <code>queryn-spec</code> рядом |
| <code>queryn-sdk</code> | Те же две проверки с <code>--repo queryn-sdk</code> | <code>queryn-spec</code>; тест после pretest сам собирает SDK |
| <code>queryn-runtime</code> | Те же две проверки с <code>--repo queryn-runtime</code> | <code>queryn-spec</code>, dist core packages и dist SDK для сборки и тестов |
| <code>queryn-desktop</code> | Отдельного <code>pretest</code> нет | Собранные локальные core/runtime/SDK-пакеты для корректного typecheck и Electron-сборки |
| <code>queryn-spec</code> | Отдельного <code>pretest</code> нет | Свои scripts и devDependencies |
| <code>queryn-extensions</code> | Отдельного <code>pretest</code> нет | <code>test:runtime</code> требует dist SDK, runtime и core project |
| <code>queryn-docs</code> | Отдельного <code>pretest</code> нет | Свои зависимости VitePress и Mermaid |

Флаг <code>--check</code> у генератора не переписывает контракты. Если он
находит drift, сначала выполните согласованный <code>pnpm generate</code> в
<code>queryn-spec</code>, проверьте diff и только затем повторите gate.

## Быстрая проверка слоя

~~~bash
cd queryn-core && pnpm test
cd ../queryn-sdk && pnpm test
cd ../queryn-runtime && pnpm selftest && pnpm test
cd ../queryn-desktop && pnpm typecheck && pnpm test
cd ../queryn-extensions && pnpm test
cd ../queryn-docs && pnpm build
~~~

Если менялся контракт в <code>queryn-spec</code>, перед этими командами
повторите <code>pnpm generate</code> и <code>pnpm verify</code>. Команды не
включают публикацию или установку пакетов во внешние каталоги.
