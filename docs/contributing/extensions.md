---
authority: normative
lifecycle: active
---

# Гайд автора расширения

Расширение состоит из манифеста, вкладов в продукт и одного или нескольких
runtime. Контракт манифеста и типы SDK генерируются из
<code>osnova-spec</code>. Host проверяет пакет до активации, а runtime
получает только временные входы и каталоги протокола.

## Фактический CLI SDK

В SDK объявлен бинарь <code>osnova-extension</code>. Его исходник —
<code>osnova-plugin-sdk/src/cli.ts</code>. После сборки SDK команды выглядят
так:

~~~bash
cd osnova-plugin-sdk
pnpm install
pnpm build
node dist/cli.js init ../my-tool --template tool
node dist/cli.js lint ../my-tool/extension.json
node dist/cli.js test ../my-tool/extension.json
node dist/cli.js dev ../my-tool
node dist/cli.js pack ../my-tool ../my-tool/extension.osnova-package.json
~~~

Доступны шаблоны <code>theme</code>, <code>note-linter</code>,
<code>tool</code>, <code>advanced</code>, <code>oci</code> и
<code>mcp</code>.

| Команда | Фактическое поведение |
| --- | --- |
| <code>init DIRECTORY --template TEMPLATE</code> | Создаёт <code>extension.json</code>, <code>package.json</code>, <code>tsconfig.json</code>, <code>src/index.ts</code>, <code>.gitignore</code> и README; отдельные шаблоны добавляют <code>server.mjs</code>, <code>tokens.json</code> или Dockerfile |
| <code>lint FILE</code> | Читает JSON и запускает <code>validateExtensionManifest</code> |
| <code>test FILE</code> | Делает ту же проверку манифеста; CLI не запускает runtime-процесс и не выполняет обработчик операции |
| <code>pack DIRECTORY OUTPUT</code> | Валидирует манифест и создаёт пакет формата <code>osnova-extension-package/1</code> с файлами, SHA-256 каждого файла и общей целостностью |
| <code>dev DIRECTORY</code> | Проверяет <code>extension.json</code> и печатает путь; отдельный server не запускает |
| <code>doctor</code> | Печатает версию Node, платформу, архитектуру и готовность SDK |

Сокращённая команда <code>osnova extension ...</code> не является
реализованным интерфейсом. В <code>osnova-runtime/src/cli.ts</code> также нет
команд <code>init</code>, <code>lint</code>, <code>test</code>, <code>pack</code>
или <code>dev</code>. Если для них появится wrapper, его можно описать после
появления фактического бинаря или package script.

## Минимальная структура

~~~text
my-tool/
├── extension.json          # обязательный манифест
├── package.json            # сборка и скрипты автора
├── tsconfig.json
├── src/index.ts            # defineExtension и типы SDK
├── server.mjs              # для node-process runtime, если нужен
└── README.md
~~~

<code>pack</code> обходит каталог рекурсивно и исключает только
<code>node_modules</code>, <code>.git</code> и файлы, чьё имя начинается с
<code>.osnova-package</code>. Перед упаковкой проверьте, что в результат не
попадают секреты и лишние сборочные файлы.

## Манифест

Обязательные поля верхнего уровня:

~~~json
{
  "manifestVersion": "1",
  "id": "osnova.example.tool",
  "name": "Example tool",
  "version": "1.0.0",
  "osnova": { "minVersion": "0.2.0" },
  "permissions": [],
  "contributes": {}
}
~~~

Идентификатор должен быть namespaced, версия — SemVer, а
<code>osnova.minVersion</code> — совместимой версией host. Вклады,
runtime и операции также используют идентификаторы с префиксом расширения.

## Вклады

В <code>contributes</code> можно объявить <code>themes</code>,
<code>tools</code>, <code>operations</code>, <code>artifactTypes</code>,
<code>contextProviders</code>, <code>connectors</code>,
<code>modelProviders</code> и <code>views</code>. Связи между ними проверяются
валидатором: операция ссылается на существующий tool, tool — на runtime при
его наличии, а provider и connector — на существующий runtime.

В текущем релизе <code>views</code> являются контрактом и записью для staging:
runtime и desktop не регистрируют и не отрисовывают собственные интерфейсы
расширения. Собственный интерфейс расширения и ручная поверхность
host-приложения относятся к целевому слою.

У операции обязательны <code>id</code>, <code>toolId</code>,
<code>version</code>, <code>title</code>, <code>inputSchema</code>,
<code>outputSchema</code>, <code>risk</code>,
<code>agentVisibility</code>, <code>execution</code> и
<code>permissions</code>. При <code>execution: "job"</code> нужен
положительный <code>timeoutSeconds</code>. Поля
<code>accepts</code> и <code>produces</code> связывают операцию с типами
артефактов.

~~~json
{
  "id": "osnova.example.tool.run",
  "toolId": "osnova.example.tool.tool",
  "version": "1.0.0",
  "title": "Run example",
  "inputSchema": {
    "type": "object",
    "required": ["text"],
    "properties": { "text": { "type": "string", "minLength": 1 } }
  },
  "outputSchema": { "type": "object" },
  "produces": ["osnova.example.tool.output"],
  "risk": "project-write",
  "agentVisibility": "explicit",
  "execution": "job",
  "timeoutSeconds": 60,
  "cancellable": true,
  "idempotent": true,
  "permissions": ["artifact:create"]
}
~~~

Это фрагмент определения операции. Если <code>produces</code> содержит тип
с префиксом расширения, этот тип также должен быть объявлен в
<code>contributes.artifactTypes</code>.

Риск операции выбирается из <code>safe-read</code>,
<code>project-write</code>, <code>network-egress</code>,
<code>external-side-effect</code> и <code>privileged</code>. Значение риска
влияет на политику и подтверждение. JSON Schema должна описывать фактические
вход и structured output, а обработчик должен соблюдать этот контракт.

## Runtime и разрешения

| Runtime | Обязательные ограничения |
| --- | --- |
| <code>node-process</code> | Нужен безопасный относительный <code>entry</code> |
| <code>native-process</code> | Нужны <code>native:execute</code> и безопасный <code>entry</code> |
| <code>oci</code> | Нужен образ с полным SHA-256 digest и <code>lifecycle: "job"</code> |
| <code>remote</code> | Нужен endpoint HTTPS, кроме loopback, и протокол <code>mcp</code> или <code>osnova-tool-v1</code> |
| <code>builtin</code> | Используется host для встроенных возможностей |

<code>lifecycle: "project"</code> или <code>shared</code> требует
<code>background:run</code>. Сеть или remote runtime требует
<code>network:use</code>. GPU требует <code>compute:gpu</code>, а runtime с
моделями — <code>models:use</code>. Операция, принимающая артефакты, требует
<code>artifact:read</code>. Проверка operation и runtime не заменяет
проверку policy в конкретном проекте.

| Разрешение | Назначение |
| --- | --- |
| <code>project:read</code> | Доступ к чтению проекта через разрешённый host-контекст |
| <code>artifact:read</code> | Чтение входных артефактов |
| <code>artifact:create</code> | Создание артефактов |
| <code>network:use</code> | Сетевой доступ |
| <code>models:use</code> | Использование моделей |
| <code>models:install</code> | Установка моделей |
| <code>compute:gpu</code> | Использование GPU |
| <code>native:execute</code> | Запуск нативного процесса |
| <code>external:apps</code> | Взаимодействие с внешними приложениями |
| <code>secrets:read</code> | Чтение секретов через предусмотренный host-механизм |
| <code>background:run</code> | Длительный lifecycle вне одной job |

Указывайте только нужные разрешения и повторяйте их на operation,
connector или runtime там, где этого требует контракт. Desktop ToolManager
сейчас передаёт при подключении весь массив <code>manifest.permissions</code>
и не показывает отдельный выбор. Установка из этого компонента также
передаёт <code>allowUnsigned: true</code>, поэтому такой путь следует
считать режимом разработчика.

## Процесс инструмента и протокол

Для <code>node-process</code> host запускает entry как отдельный
процесс и общается с ним JSON-RPC 2.0 по stdio. Контракт
<code>osnova-spec/protocol/osnova-tool-protocol.md</code> включает:

- <code>initialize</code> и <code>health</code> для handshake и состояния
- <code>jobs/start</code>, <code>jobs/get</code> и <code>jobs/cancel</code>
- <code>context/resolve</code> для объявленного context provider
- <code>connectors/pull</code> для connector
- <code>models/complete</code> для model provider
- <code>shutdown</code> для завершения

Host передаёт временные каталоги входа, работы, outbox и моделей. Процесс не
получает корень проекта и не должен рассчитывать на абсолютный project path.
Входные артефакты представлены манифестом и read-only копиями. Результат
может содержать structured data и candidate payloads. Пути payload должны
быть относительными, а <code>..</code> и абсолютные пути запрещены.

Минимальная схема ответа job:

~~~json
{
  "structured": { "ok": true },
  "artifacts": [
    {
      "type": "osnova.example.tool.output",
      "payloads": [{ "path": "output.md", "mediaType": "text/markdown" }]
    }
  ]
}
~~~

Host заново вычисляет checksum, размер и допустимый MIME, ограничивает
размеры и только затем публикует артефакты в проект. Внешний процесс должен
писать payload в outbox и сообщать относительный путь. Уведомления
<code>jobs/progress</code> и <code>logs/event</code> используются для прогресса
и журналов.

## Код SDK и testkit

<code>defineExtension</code> проверяет манифест и то, что переданные в
<code>operations</code> обработчики объявлены в манифесте. Обработчик получает
<code>OperationContext</code> с <code>jobId</code>, <code>projectId</code>,
входом, read-only artifact inputs, <code>outboxPath</code>, AbortSignal и
<code>reportProgress</code>.

<code>invokeTestOperation</code> из <code>@osnova/plugin-sdk/testkit</code>
проверяет наличие операции и handler, разрешения и обязательные поля
JSON Schema, затем вызывает handler с тестовым контекстом. Он не запускает
host, не создаёт реальный проект, не проверяет полный runtime protocol и не
заменяет runtime E2E.

~~~ts
import { defineExtension, type ExtensionManifest } from "@osnova/plugin-sdk";

const manifest = /* загрузка extension.json */ {} as ExtensionManifest;

export default defineExtension({
  manifest,
  operations: {
    "osnova.example.tool.run": async ({ input, reportProgress }) => {
      reportProgress(0.5, "Обработка");
      return { structured: { ok: true, text: String(input.text ?? "") } };
    }
  }
});
~~~

Этот обработчик полезен для testkit и SDK-кода. Для runtime-пакета должен
существовать процесс, совместимый с объявленным runtime и протоколом.

## Локальная проверка и упаковка

~~~bash
cd my-tool
pnpm install
pnpm build
pnpm lint
pnpm test
pnpm pack
~~~

Скрипты, созданные <code>init</code>, вызывают
<code>osnova-extension</code> для lint, test, pack и dev. Команда
<code>pnpm test</code> расширения проверяет manifest через SDK CLI, а не
проводит полный host E2E. Для примеров репозитория используйте:

~~~bash
cd osnova-plugins
pnpm test
pnpm test:runtime
~~~

<code>test:runtime</code> требует предварительно собранные dist
<code>osnova-core</code>, <code>osnova-plugin-sdk</code> и
<code>osnova-runtime</code>. Он упаковывает advanced media tool, устанавливает
его в временный runtime, подключает к временному проекту, запускает операцию
и проверяет артефакты.

## Установка в runtime

После сборки пакета runtime CLI устанавливает его так:

~~~bash
cd osnova-runtime
node dist/cli.js extension:install \
  --package ../my-tool/extension.osnova-package.json \
  --developer-mode
node dist/cli.js extension:list
node dist/cli.js extension:connect \
  --project /path/to/project \
  --extension osnova.example.tool \
  --version 1.0.0 \
  --permissions artifact:create
~~~

<code>--developer-mode</code> передаёт <code>allowUnsigned: true</code>.
Целостность, безопасные пути, формат, размеры и совместимость host всё равно
проверяются. Подключение к проекту отдельно от установки: runtime проверяет
диапазон версии, записывает lock и локальную выдачу policy. Пакет, который
установлен, но не подключён к проекту, не должен считаться доступной
операцией этого проекта.

Подписанный каталог и пользовательский мастер рецензии разрешений в текущем
desktop не поставлены. Подписанные варианты могут передаваться через полный
RPC-метод установки с signature и publicKey, но отдельной CLI-команды для
подписи или публикации в каталоге нет.

## Чек-лист автора

- [ ] ID расширения, вкладов и runtime используют namespace
- [ ] Версии и <code>osnova.minVersion</code> — SemVer
- [ ] Указаны только необходимые permissions
- [ ] Для каждой operation есть точные JSON Schema, risk, execution, timeout и idempotency
- [ ] <code>accepts</code> и <code>produces</code> согласованы с artifact types
- [ ] Runtime entry, endpoint или image проходят ограничения host
- [ ] Процесс не обращается к project root и не принимает абсолютные payload paths
- [ ] Отмена, таймаут и ошибки не оставляют незакрытые процессы или временные данные
- [ ] Пакет проверен через SDK lint/test/pack и runtime E2E, если операция зависит от host
- [ ] Секреты не попали в package files
