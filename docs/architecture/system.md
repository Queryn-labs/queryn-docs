---
authority: normative
lifecycle: active
---

# Системная архитектура

Эта страница фиксирует архитектурные границы Osnova на уровне C4. Диаграммы
сверены с исходниками `osnova-runtime` и `osnova-desktop` на текущем срезе
репозиториев. Mermaid является каноническим форматом диаграмм.

Проект остаётся обычной папкой на диске. `osnova.json`, пользовательские
материалы и переносимые результаты живут в папке проекта. Локальный runtime
хранит производное состояние отдельно и не становится источником истины.

## C1. Контекст системы {#c1-context}

Диаграмма показывает участников и внешние системы, с которыми взаимодействует
продукт. Локальный runtime входит в системную границу продукта, а будущий
публичный каталог показан пунктиром, потому что текущая реализация его не
использует.

```mermaid
flowchart LR
  StudentResearcher["Учащийся или исследователь"]
  ExtensionDeveloper["Разработчик расширения"]
  Operator["Оператор или техник"]
  OsnovaDesktop["Osnova desktop<br/>Electron-клиент и локальный runtime"]
  ProjectFolder["Папка проекта на диске<br/>источник истины"]
  LocalModelRuntime["Локальный процесс моделей<br/>или OCI runtime"]
  PublicCatalog["Будущий публичный каталог расширений"]

  StudentResearcher -->|создаёт и изучает проекты| OsnovaDesktop
  ExtensionDeveloper -->|разрабатывает и подключает расширения| OsnovaDesktop
  Operator -->|проверяет состояние runtime и окружения| OsnovaDesktop
  OsnovaDesktop -->|читает и записывает материалы| ProjectFolder
  OsnovaDesktop -->|через локальный runtime запускает модели и инструменты| LocalModelRuntime
  OsnovaDesktop -.->|будущая публикация и поиск расширений| PublicCatalog
```

`ExtensionDeveloper` публикует пакет расширения через локальный интерфейс
установки. Доверие к пакету и его permissions проверяются локальным runtime.
Текущий продукт не требует сетевого каталога для создания, чтения или
переноса проекта.

В текущем desktop-пути локальный пакет устанавливается через путь для разработки,
допускающий неподписанный пакет, а подключение передаёт расширению весь
объявленный набор permissions. Гранулярный выбор разрешений и подписанный
каталог остаются целевым усилением.

## C2. Контейнеры Osnova {#c2-containers}

Внутри системной границы находятся четыре контейнера. `osnova-spec`,
`osnova-core` и `osnova-plugin-sdk` являются контрактами и библиотеками сборки,
а не исполняемыми контейнерами Osnova, поэтому на этом уровне они не показаны.
MCP-серверы и внешние провайдеры моделей находятся за границей системы.

```mermaid
flowchart LR
  subgraph OsnovaSystem["Система Osnova"]
    Desktop["Desktop<br/>Electron main, preload и renderer"]
    Runtime["Runtime<br/>osnova-runtime и локальный JSON-RPC"]
    ProjectStorage["Хранилище проекта<br/>обычная папка и источник истины"]
    LocalModelRuntime["Локальный runtime моделей<br/>процесс или OCI"]
  end

  subgraph ExternalSystems["Внешние системы"]
    MCPServers["MCP-серверы"]
    RemoteModelProviders["Удалённые или облачные провайдеры моделей"]
  end

  Desktop -->|IPC через безопасный preload bridge| Runtime
  Runtime -.->|уведомления jobs, runtime и agent| Desktop
  Desktop -->|операции с файлами через main process| ProjectStorage
  Runtime -->|чтение и запись через @osnova/project| ProjectStorage
  Runtime -->|RuntimeSupervisor управляет процессами| LocalModelRuntime
  LocalModelRuntime -->|структурированный результат и кандидаты артефактов| Runtime
  Runtime -->|McpBridge и tools/call| MCPServers
  MCPServers -->|ответы инструментов| Runtime
  Runtime -->|HTTPS completion при явной настройке| RemoteModelProviders
  RemoteModelProviders -->|текст, вызовы инструментов и usage| Runtime
```

`Desktop` создаёт процесс `osnova-runtime` при первом запросе к
`DesktopRuntimeService`. Связь использует случайный Unix socket на macOS или
named pipe на Windows и bearer token из стартового дескриптора. `ProjectStorage`
доступен desktop через main process, а runtime получает тот же folder API через
core-пакет.

`Local model runtime` означает локальный процесс или границу выполнения OCI,
которым управляет `RuntimeSupervisor`. Провайдер модели может быть локальным
HTTP endpoint на loopback или внешним HTTPS endpoint. Внешний endpoint всегда
остаётся отдельным провайдером, а выбор получателя cloud проходит через policy.

## C3. Компоненты runtime {#c3-runtime-components}

Компоненты ниже соответствуют классам и модулям `osnova-runtime/src`. Точкой
входа служит `OsnovaRuntime` в `runtime.ts`. `rpc-server.ts` вызывает
публичные методы runtime, а остальные компоненты сохраняют правила и состояние
в рамках локального процесса.

```mermaid
flowchart LR
  subgraph RuntimeComponents["osnova-runtime"]
    RpcServer["rpc-server.ts<br/>аутентифицированный JSON-RPC"]
    ProjectService["ProjectService<br/>открытие, миграция и усыновление"]
    AgentOrchestrator["AgentOrchestrator<br/>chat, approve и resume"]
    AgentKernel["AgentKernel<br/>ход и цикл инструментов"]
    ModelProvider["ModelProvider<br/>completion и каталог моделей"]
    ContextBroker["ContextBroker<br/>context envelope и policy"]
    ProjectIndexer["ProjectIndexer<br/>индекс и поиск"]
    OperationService["OperationService<br/>invoke и публикация"]
    OperationRegistry["OperationRegistry<br/>операции и версии"]
    PolicyEngine["PolicyEngine<br/>права, риск и подтверждения"]
    JobManager["JobManager<br/>состояние jobs и восстановление"]
    RuntimeSupervisor["RuntimeSupervisor<br/>builtin, process, OCI и remote"]
    ArtifactIngestor["ArtifactIngestor<br/>проверка и публикация artifacts"]
    ExtensionManager["ExtensionManager<br/>установка, активация и lock проекта"]
    ConnectorEngine["ConnectorEngine<br/>получение и импорт connectors"]
    ModelManager["ModelManager<br/>установка, подготовка и удаление моделей"]
    McpBridge["McpBridge<br/>MCP-инструменты в operations"]
    CredentialStore["CredentialStore<br/>системное хранилище секретов"]
  end

  ProjectIO["@osnova/project<br/>API папки проекта"]
  ProjectStorage["Хранилище проекта<br/>файлы проекта"]
  SecureStore["macOS Keychain или Windows DPAPI"]
  MCPServers["MCP-серверы"]
  ToolRuntimes["Builtin, process и OCI runtime"]
  RemoteRuntimes["Удалённые endpoint runtime"]
  ModelEndpoints["Loopback или cloud endpoint модели"]
  InvocationScopes["Область вызова runtime<br/>input, work, outbox и models"]

  RpcServer -->|вызов метода| ProjectService
  RpcServer -->|вызов метода| OperationService
  RpcServer -->|вызов метода| AgentOrchestrator
  RpcServer -->|вызов метода| ContextBroker
  RpcServer -->|вызов метода| ExtensionManager
  RpcServer -->|вызов метода| JobManager

  AgentOrchestrator -->|запуск и возобновление| AgentKernel
  AgentKernel -->|completion модели| ModelProvider
  AgentKernel -->|вызов инструмента| OperationService
  AgentKernel -->|ожидание terminal job| JobManager
  AgentKernel -->|события сессии и observations| ProjectIO
  ContextBroker -->|notes, assets и artifacts| ProjectIO
  AgentKernel -->|поиск в проекте| ProjectIndexer
  ContextBroker -.->|вызов зарегистрированного custom provider| ExtensionManager

  OperationService -->|получить и проверить| OperationRegistry
  OperationService -->|оценка риска| PolicyEngine
  OperationService -->|создание, переход и прогресс| JobManager
  OperationService -->|подготовка и выполнение| RuntimeSupervisor
  OperationService -->|подготовка объявленных моделей| ModelManager
  OperationService -->|публикация кандидатов| ArtifactIngestor
  OperationService -->|события результата сессии| ProjectIO
  RuntimeSupervisor -->|протокол supervisor| ToolRuntimes
  RuntimeSupervisor -->|jobs/start или tools/call| RemoteRuntimes
  RuntimeSupervisor -->|изолированные пути вызова| InvocationScopes
  ModelProvider -->|chat/completions и models| ModelEndpoints
  ArtifactIngestor -->|descriptor и payload| ProjectIO

  ExtensionManager -->|регистрация операций| OperationRegistry
  ExtensionManager -->|регистрация providers контекста| ContextBroker
  ExtensionManager -->|регистрация connectors| ConnectorEngine
  ExtensionManager -->|разрешение runtime descriptors| RuntimeSupervisor
  ExtensionManager -->|разрешение зависимостей моделей| ModelManager
  ExtensionManager -->|авторизация provider| AgentOrchestrator
  ExtensionManager -->|manifest проекта и lock| ProjectService
  ConnectorEngine -->|проверка policy| PolicyEngine
  ConnectorEngine -->|импорт кандидатов| ArtifactIngestor
  McpBridge -->|описания операций| OperationRegistry
  McpBridge -->|stdio tools/call| MCPServers
  ModelProvider -->|получение credentials| CredentialStore
  CredentialStore -->|байты секрета| SecureStore
  ProjectService -->|открытие, проверка и миграция| ProjectIO
  ProjectIO -->|обычные файлы| ProjectStorage
```

`OperationService` является единой точкой запуска операции. Он проверяет
входные данные, допустимые artifact inputs и policy, создаёт `JobDescriptor`,
передаёт вызов `RuntimeSupervisor`, а затем отдаёт candidate outputs
`ArtifactIngestor`. При публикации core-пакет сначала проверяет paths, MIME,
размер и hash, после чего выполняет staging и атомарный rename.

`JobManager` персистит производные записи jobs в runtime data root. После
перезапуска jobs со статусом `queued` или `running` становятся `interrupted`.
Состояние проекта не зависит от этих записей и остаётся в папке проекта.

`AgentOrchestrator` проверяет провайдера и передаёт модель-driven цикл
`AgentKernel`. Kernel пишет видимые `tool-call` и `observation` события в
session log, ждёт terminal job и при необходимости возвращает статус
`waiting-approval`.

В текущем `agent.chat` `AgentKernel` не вызывает `ContextBroker`. Он получает
историю сессии и работает через доступные project tools, включая поиск, чтение
и разрешение артефакта. `ContextBroker` вызывается отдельными методами
`context.preview` и `context.resolve` через RPC или CLI, а custom provider
подключается через зарегистрированный callback `ExtensionManager`.

`ContextBroker` строит envelope из project materials, применяет режимы
`none`, `automatic`, `declarative` и `custom`, ограничивает бюджет и пересекает
допустимых получателей с чувствительностью материала. `ProjectIndexer` хранит
производный SQLite FTS5 или portable index в `.osnova/index`.

`ExtensionManager` проверяет пакет, регистрирует его операции и runtime
descriptors, а при подключении к проекту обновляет manifest requirement,
производный lock и локальные grants. `McpBridge` использует ту же operation и
risk machinery для подключённых MCP tools.

## C3. Компоненты desktop {#c3-desktop-components}

Сервисная граница desktop состоит ровно из четырёх фактических main-сервисов:
`runtime-service.ts`, `project-service.ts`, `settings-service.ts` и
`file-service.ts`. Отдельных `plugin-service` и `ai-service` в исходниках нет.
Плагины и агент вызываются через runtime RPC.

```mermaid
flowchart LR
  subgraph DesktopComponents["osnova-desktop"]
    MainProcess["MainProcess<br/>src/main/index.ts"]
    RuntimeService["DesktopRuntimeService<br/>main/services/runtime-service.ts"]
    ProjectService["project-service.ts<br/>адаптер @osnova/project"]
    SettingsService["settings-service.ts<br/>локальный settings.json"]
    FileService["file-service.ts<br/>JSON и безопасное чтение файлов"]
    PreloadBridge["PreloadBridge<br/>типизированный window.osnova"]

    subgraph RendererLayer["Renderer"]
      AppShell["AppShell<br/>глобальная оболочка"]
      WorkspaceHome["workspace-home<br/>WorkspaceHome и ProjectsWidget"]
      SessionWorkspace["session-workspace<br/>сессии и agent chat"]
      ProjectWorkspace["project-workspace<br/>режимы проекта"]
      ToolManager["tool-manager<br/>управление расширениями"]
      ToolWorkspace["tool-workspace<br/>ручной запуск операции"]
      ProjectNavigator["project-navigator<br/>ProjectNavigator и ProjectExplorer"]
      MaterialsWorkspace["materials-workspace<br/>материалы и папки"]
      MarkdownEditor["markdown-editor<br/>MarkdownEditor и NoteEditor"]
      AssetViewer["asset-viewer<br/>просмотр assets"]
      AppSettings["app-settings<br/>настройки и палитры"]
    end
  end

  Runtime["osnova-runtime<br/>локальный JSON-RPC"]
  ProjectStorage["Хранилище проекта<br/>папка проекта"]
  UserSettings["Данные desktop<br/>settings.json"]

  AppShell -->|выбирает экран| WorkspaceHome
  AppShell -->|выбирает экран| ProjectWorkspace
  AppShell -.->|ветка activeView=tools, сейчас нет вызова| ToolManager
  AppShell -->|открывает модальное окно| AppSettings
  ProjectWorkspace -->|содержит| SessionWorkspace
  ProjectWorkspace -->|содержит| ProjectNavigator
  ProjectWorkspace -->|содержит| MaterialsWorkspace
  ProjectWorkspace -.->|ветка mode=tools, сейчас недостижима| ToolWorkspace
  ToolWorkspace -.->|onOpenToolManager| ToolManager
  MaterialsWorkspace -->|редактирует| MarkdownEditor
  MaterialsWorkspace -->|показывает| AssetViewer

  WorkspaceHome -->|типизированный API| PreloadBridge
  SessionWorkspace -->|типизированный API| PreloadBridge
  ProjectNavigator -->|типизированный API| PreloadBridge
  MaterialsWorkspace -->|типизированный API| PreloadBridge
  ToolManager -->|типизированный API| PreloadBridge
  AppSettings -->|типизированный API| PreloadBridge
  PreloadBridge -->|ipcRenderer.invoke| MainProcess
  MainProcess -->|запросы runtime| RuntimeService
  MainProcess -->|операции проекта| ProjectService
  MainProcess -->|операции настроек| SettingsService
  MainProcess -->|операции с файлами| FileService
  RuntimeService -->|RpcClient и osnova-rpc/1| Runtime
  ProjectService -->|создание, открытие, notes и assets| ProjectStorage
  FileService -->|проверка project-relative path| ProjectStorage
  SettingsService -->|чтение и запись| UserSettings
  RuntimeService -.->|уведомления jobs, agent и artifacts| MainProcess
  MainProcess -.->|runtime:event| PreloadBridge
```

`preload/index.ts` публикует узкий API `window.osnova`. Renderer не получает
доступ к Node или Electron API. Обработчик `handle` в main сначала проверяет
доверенный frame, затем переводит project id в канонический путь, выполняет
операцию и рекурсивно заменяет `projectPath` в ответах на `projectId`.

`DesktopRuntimeService` лениво запускает `osnova-runtime` с командой `serve`,
читает из stdout address и token, создаёт `RpcClient` и пересылает уведомления
`job.changed`, `approval.required`, `runtime.changed`, `artifact.published`,
`agent.activity` и `agent.output.delta` в renderer.

`ToolWorkspace` и ветка `activeView=tools` существуют в исходниках, однако
`ProjectNavigator` сейчас переключается только между `sessions` и `materials`
и не вызывает `onModeChange("tools")`. Поэтому ручной запуск операции и переход
в `ToolManager` показаны пунктиром как недостижимые из текущего интерфейса.

## Контракты и зависимости {#contracts-and-dependencies}

Эта диаграмма не является C4-уровнем. Она показывает поток схем и реальные
зависимости пакетов. Генератор контрактов пишет типы отдельно в core и SDK,
после чего runtime и desktop используют узкие публичные API.

```mermaid
flowchart LR
  subgraph SpecContracts["osnova-spec"]
    Schemas["schemas/*.schema.json<br/>публичные JSON Schema"]
    Protocols["protocol/*.md<br/>Tool Protocol v1 и RPC v1"]
    Generator["scripts/generate-contracts.mjs<br/>генератор типов"]
  end

  subgraph CorePackages["osnova-core"]
    CoreTypes["@osnova/types<br/>generated и domain types"]
    ManifestPackage["@osnova/manifest<br/>create и read manifest"]
    ValidationPackage["@osnova/validation<br/>manifest и structure validation"]
    ProjectPackage["@osnova/project<br/>folder, artifact и session API"]
  end

  SdkTypes["@osnova/plugin-sdk generated<br/>ExtensionManifest v1"]
  PluginSdk["@osnova/plugin-sdk<br/>SDK и validation"]
  Runtime["osnova-runtime<br/>runtime services"]
  RuntimeClient["osnova-runtime/client<br/>RpcClient и notifications"]
  Desktop["osnova-desktop<br/>main и renderer"]

  Schemas -->|компилирует core contracts| Generator
  Generator -->|записывает generated types| CoreTypes
  Generator -->|записывает ExtensionManifest type| SdkTypes
  CoreTypes -->|типовой слой| ManifestPackage
  CoreTypes -->|типовой слой| ValidationPackage
  CoreTypes -->|типовой слой| ProjectPackage
  SdkTypes -->|публичные типы| PluginSdk
  CorePackages -->|file dependencies| Runtime
  CorePackages -->|file dependencies| Desktop
  PluginSdk -->|file dependency| Runtime
  RuntimeClient -->|typed local RPC client| Desktop
  Protocols -->|method и event contract| Runtime
  Protocols -->|client protocol contract| RuntimeClient
```

Карта генерации определена в `osnova-spec/scripts/generate-contracts.mjs`.
Контракты проекта, artifacts, relations, sessions, session events, context,
совместимая схема agent plan и jobs становятся generated типами в
`@osnova/types`. Схема agent plan является остатком контракта и не означает,
что текущий runtime создаёт или исполняет отдельный `AgentPlan`. Контракт
Extension Manifest v1 генерируется в `@osnova/plugin-sdk`.

Runtime фактически зависит от `@osnova/manifest`, `@osnova/project`,
`@osnova/types`, `@osnova/validation` и `@osnova/plugin-sdk`. Desktop фактически
зависит от core-пакетов и `osnova-runtime`, а `RuntimeClient` скрывает socket
транспорт и bearer token за типизированным запросом.
