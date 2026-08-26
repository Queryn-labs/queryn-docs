---
authority: normative
lifecycle: active
---

# Preload и IPC API

Канон этой страницы — JSDoc и типы в
<code>queryn-desktop/src/preload/index.ts</code>. Preload создаёт объект
<code>window.queryn</code> через <code>contextBridge.exposeInMainWorld</code> и
экспортирует его тип как <code>QuerynApi</code>. Вызовы, отмеченные как
отклоняющие промис, должны обрабатываться renderer через
<code>try/catch</code>. Имена каналов ниже — фактические аргументы
<code>ipcRenderer.invoke</code>, а не самостоятельный публичный RPC-контракт.

## Платформа и диалоги

| Метод или свойство | Вход | IPC-канал | Результат по JSDoc |
| --- | --- | --- | --- |
| <code>platform</code> | — | — | Строка платформы Electron |
| <code>selectFolder()</code> | — | <code>dialog:select-folder</code> | Путь или <code>null</code>; отклоняет при ошибке IPC |
| <code>selectExtensionPackage()</code> | — | <code>dialog:select-extension-package</code> | Путь или <code>null</code>; отклоняет при ошибке IPC |
| <code>copyToClipboard(text)</code> | <code>string</code> | <code>clipboard:write</code> | <code>boolean</code>; отклоняет при ошибке IPC |

## Проекты

| Метод | Вход | IPC-канал | Результат по JSDoc |
| --- | --- | --- | --- |
| <code>createProject(input)</code> | <code>{ parentPath?: string; name: string; kind?: "general" &#124; "subject" &#124; "exam" }</code> | <code>project:create</code> | Результат создания; отклоняет при проверке или ошибке IPC |
| <code>defaultProjectParent()</code> | — | <code>project:default-parent</code> | Строка пути; отклоняет, если не читаются настройки |
| <code>openProject(projectId)</code> | <code>string</code> | <code>project:open</code> | Манифест проекта; отклоняет, если проект не открывается |
| <code>migrateProject(input)</code> | <code>{ projectId: string; dryRun?: boolean }</code> | <code>project:migrate</code> | Результат миграции; отклоняет при ошибке |
| <code>inspectProjectAdoption(projectPath)</code> | <code>string</code> | <code>project:inspect-adoption</code> | План усыновления; отклоняет при ошибке IPC |
| <code>adoptProject(input)</code> | <code>{ projectPath: string; id?: string; name?: string; description?: string; dryRun?: boolean }</code> | <code>project:adopt</code> | Результат усыновления; отклоняет при ошибке |
| <code>readManifest(projectId)</code> | <code>string</code> | <code>project:read-manifest</code> | Данные манифеста; отклоняет, если проект или манифест недоступны |
| <code>getProjectOverview(projectId)</code> | <code>string</code> | <code>project:overview</code> | Данные обзора; отклоняет при ошибке IPC |
| <code>listProjectTree(projectId)</code> | <code>string</code> | <code>project:tree</code> | Данные дерева; отклоняет при ошибке IPC |
| <code>listProjectLinks(projectId)</code> | <code>string</code> | <code>project:links</code> | Данные связей; отклоняет при ошибке IPC |
| <code>openProjectFolder(projectId)</code> | <code>string</code> | <code>project:open-folder</code> | Открытый путь; отклоняет при ошибке IPC |

<code>kind</code> допускает три значения в bridge API. Текущая форма создания
проекта передаёт только имя и родительскую папку. Наличие поля в типе не
означает, что оно представлено экраном.

## Файлы и материалы

| Метод | Вход | IPC-канал | Результат по JSDoc |
| --- | --- | --- | --- |
| <code>revealProjectFile(input)</code> | <code>{ projectId: string; projectRelativePath: string }</code> | <code>file:reveal</code> | <code>boolean</code>; отклоняет при неверном пути |
| <code>trashProjectMaterial(input)</code> | <code>{ projectId: string; kind: "note" &#124; "asset"; projectRelativePath: string }</code> | <code>material:trash</code> | <code>boolean</code>; отклоняет при ошибке пути или IPC |
| <code>createProjectFolder(input)</code> | <code>{ projectId: string; scope: ProjectTreeScope; parentRelativePath?: string; name: string }</code> | <code>folder:create</code> | Созданная запись; отклоняет при проверке |
| <code>createNote(input)</code> | <code>{ projectId: string; title: string; body?: string; folderRelativePath?: string }</code> | <code>note:create</code> | Созданная заметка; отклоняет при проверке или ошибке IPC |
| <code>readNote(input)</code> | <code>{ projectId: string; noteRelativePath: string }</code> | <code>note:read</code> | Данные заметки; отклоняет, если заметка не читается |
| <code>updateNote(input)</code> | <code>{ projectId: string; noteRelativePath: string; content: string }</code> | <code>note:update</code> | Результат обновления; отклоняет при проверке или ошибке IPC |
| <code>updateNoteDocument(input)</code> | <code>{ projectId: string; noteRelativePath: string; title?: string; body?: string }</code> | <code>note:update-document</code> | Результат обновления документа; отклоняет при проверке или ошибке IPC |
| <code>importAsset(input)</code> | <code>{ projectId: string; sourcePath: string; targetFolderRelativePath?: string }</code> | <code>asset:import</code> | Импортированный asset; отклоняет при ошибке файловой системы или IPC |
| <code>getPathForFile(file)</code> | Объект <code>File</code> renderer | —, локальный <code>webUtils</code> | Нативный путь; выбрасывает исключение, если Electron не может его определить |
| <code>moveNote(input)</code> | <code>{ projectId: string } &amp; MoveNoteInput</code> | <code>note:move</code> | Результат перемещения; отклоняет при проверке или ошибке IPC |
| <code>moveAsset(input)</code> | <code>{ projectId: string } &amp; MoveAssetInput</code> | <code>asset:move</code> | Результат перемещения; отклоняет при проверке или ошибке IPC |
| <code>moveProjectFolder(input)</code> | <code>{ projectId: string } &amp; MoveFolderInput</code> | <code>folder:move</code> | Результат перемещения; отклоняет при проверке или ошибке IPC |
| <code>openExternalFile(input)</code> | <code>{ projectId: string; projectRelativePath: string }</code> | <code>file:open-external</code> | Результат открытия; отклоняет при ошибке пути или IPC |
| <code>readFileAsDataURL(input)</code> | <code>{ projectId: string; projectRelativePath: string }</code> | <code>file:read-data-url</code> | URL данных; отклоняет при ошибке файловой системы или IPC |

Bridge использует относительные пути проекта для операций с материалами.
<code>getPathForFile</code> — единственный метод этой группы без IPC-вызова.

## Недавние проекты и настройки

| Метод | Вход | IPC-канал | Результат по JSDoc |
| --- | --- | --- | --- |
| <code>listRecentProjects()</code> | — | <code>recent-projects:list</code> | Данные проектов; отклоняет при ошибке настроек |
| <code>forgetRecentProject(projectId)</code> | <code>string</code> | <code>recent-projects:forget</code> | Обновлённый список; отклоняет при ошибке настроек |
| <code>renameRecentProject(input)</code> | <code>{ projectId: string; name: string }</code> | <code>recent-projects:rename</code> | Обновлённый список; отклоняет при проверке |
| <code>trashRecentProject(projectId)</code> | <code>string</code> | <code>recent-projects:trash</code> | Результат операции; отклоняет при ошибке файловой системы или IPC |
| <code>readSettings()</code> | — | <code>settings:read</code> | Настройки; отклоняет при ошибке IPC |
| <code>writeSettings(settings)</code> | <code>Record&lt;string, unknown&gt;</code> | <code>settings:write</code> | Нормализованные настройки; отклоняет при проверке или ошибке IPC |

## Runtime, расширения и операции

| Метод | Вход | IPC-канал | Результат по JSDoc |
| --- | --- | --- | --- |
| <code>runtimeStatus()</code> | — | <code>runtime:status</code> | Данные состояния; отклоняет при недоступности runtime |
| <code>startRuntime(input)</code> | <code>{ projectId: string; runtimeId: string }</code> | <code>runtime:start</code> | Данные запуска; отклоняет при ошибке запуска |
| <code>stopRuntime(runtimeId?)</code> | Необязательный <code>string</code> | <code>runtime:stop</code> | Результат остановки; отклоняет при ошибке IPC |
| <code>listExtensions()</code> | — | <code>extension:list</code> | Данные расширений; отклоняет при ошибке IPC |
| <code>installExtension(input)</code> | <code>{ packagePath: string; allowUnsigned?: boolean }</code> | <code>extension:install</code> | Данные расширения; отклоняет при политике или ошибке IPC |
| <code>updateExtension(input)</code> | <code>{ packagePath: string; allowUnsigned?: boolean }</code> | <code>extension:update</code> | Данные расширения; отклоняет при политике или ошибке IPC |
| <code>rollbackExtension(input)</code> | <code>{ extensionId: string; version: string }</code> | <code>extension:rollback</code> | Данные расширения; отклоняет при проверке или ошибке IPC |
| <code>connectExtension(input)</code> | <code>{ projectId: string; extensionId: string; version: string; requirementVersion?: string; permissions: string[] }</code> | <code>extension:connect</code> | Результат подключения; отклоняет при политике |
| <code>disconnectExtension(input)</code> | <code>{ projectId: string; extensionId: string }</code> | <code>extension:disconnect</code> | Результат отключения; отклоняет при проверке или ошибке IPC |
| <code>listOperations(input?)</code> | По умолчанию <code>{}</code>, поля <code>projectId?</code> и <code>includeHidden?</code> | <code>operation:list</code> | Дескрипторы операций; отклоняет при ошибке IPC |
| <code>invokeOperation(input)</code> | <code>{ projectId: string; operationId: string; arguments: Record&lt;string, unknown&gt;; sessionId?; artifactIds?; publishArtifacts? }</code> | <code>operation:invoke</code> | Результат задания; отклоняет при политике или ошибке IPC |
| <code>decideApproval(input)</code> | <code>{ jobId: string; decision: Record&lt;string, unknown&gt; }</code> | <code>approval:decide</code> | Результат решения; отклоняет при проверке или ошибке IPC |

Параметр <code>allowUnsigned</code> разрешает вызывающему выбрать режим
неподписанного пакета. Preload не добавляет отдельного диалога разрешений.
Конкретный компонент desktop может передать значение сам.

## Артефакты и сессии

| Метод | Вход | IPC-канал | Результат по JSDoc |
| --- | --- | --- | --- |
| <code>listArtifacts(projectId)</code> | <code>string</code> | <code>artifact:list</code> | Дескрипторы артефактов; отклоняет при ошибке IPC |
| <code>readArtifact(input)</code> | <code>{ projectId: string; artifactId: string }</code> | <code>artifact:read</code> | Данные артефакта; отклоняет, если чтение невозможно |
| <code>importArtifact(input)</code> | <code>{ projectId: string; type: string; title?; projectRelativePath: string; context? }</code> | <code>artifact:import</code> | Импортированный артефакт; отклоняет при проверке или ошибке IPC |
| <code>publishArtifacts(input)</code> | <code>{ jobId: string; indexes?: number[] }</code> | <code>artifact:publish</code> | Результат публикации; отклоняет при проверке или ошибке IPC |
| <code>createSession(input)</code> | <code>{ projectId: string; title: string; goal?: string }</code> | <code>session:create</code> | Дескриптор сессии; отклоняет при проверке или ошибке IPC |
| <code>forkSession(input)</code> | <code>{ projectId: string; sessionId: string; throughEventId: string; title?: string }</code> | <code>session:fork</code> | Форк сессии; отклоняет при проверке или ошибке IPC |
| <code>listSessions(projectId)</code> | <code>string</code> | <code>session:list</code> | Дескрипторы сессий; отклоняет при ошибке IPC |
| <code>readSessionEvents(input)</code> | <code>{ projectId: string; sessionId: string }</code> | <code>session:events</code> | События; отклоняет, если сессия не читается |
| <code>appendSessionEvent(input)</code> | <code>{ projectId: string; sessionId: string; type: string; data: Record&lt;string, unknown&gt; }</code> | <code>session:append</code> | Результат добавления; отклоняет при проверке или ошибке IPC |
| <code>updateSession(input)</code> | <code>{ projectId: string; sessionId: string; title?; goal?; memoryMode?: "full" &#124; "off" }</code> | <code>session:update</code> | Результат сессии; отклоняет при проверке или ошибке IPC |

## Контекст и коннекторы

| Метод | Вход | IPC-канал | Результат по JSDoc |
| --- | --- | --- | --- |
| <code>previewContext(projectId)</code> | <code>string</code> | <code>context:preview</code> | Envelope контекста; отклоняет при ошибке IPC |
| <code>resolveContext(input)</code> | <code>{ projectId: string; artifactIds?; level: "compact" &#124; "expanded"; budgetTokens?; recipient?: "local" &#124; "cloud"; approval?: unknown }</code> | <code>context:resolve</code> | Envelope контекста; отклоняет при политике или ошибке IPC |
| <code>reindexContext(projectId)</code> | <code>string</code> | <code>context:reindex</code> | Результат индексации; отклоняет при ошибке IPC |
| <code>searchContext(input)</code> | <code>{ projectId: string; query: string; limit?: number }</code> | <code>context:search</code> | Найденные источники; отклоняет при ошибке IPC |
| <code>listConnectors()</code> | — | <code>connector:list</code> | Дескрипторы коннекторов; отклоняет при ошибке IPC |
| <code>syncConnector(input)</code> | <code>{ projectId: string; connectorId: string; approval?: Record&lt;string, unknown&gt; }</code> | <code>connector:sync</code> | Результат синхронизации; отклоняет при одобрении или ошибке IPC |

Preview контекста — read-only вызов. Ни один метод этой группы не создаёт в
composer выбор произвольных вложений.

## MCP и агент

| Метод | Вход | IPC-канал | Статус |
| --- | --- | --- | --- |
| <code>registerMcpServer(descriptor)</code> | <code>{ id: string; command: string; args?; env?; defaultRisk?: string }</code> | <code>mcp:register</code> | Bridge и main handler существуют, но runtime RPC dispatch не реализует <code>mcp.server.register</code> |
| <code>listMcpServers()</code> | — | <code>mcp:list</code> | Bridge и main handler существуют, но runtime RPC dispatch не реализует <code>mcp.server.list</code> |
| <code>unregisterMcpServer(id)</code> | <code>string</code> | <code>mcp:unregister</code> | Bridge и main handler существуют, но runtime RPC dispatch не реализует <code>mcp.server.unregister</code> |
| <code>chatAgent(input)</code> | <code>{ projectId: string; goal: string; sessionId: string; providerId?; model?; maxSteps?; maxDurationSeconds?; historyBudgetTokens?; recipientApproval?; requestId? }</code> | <code>agent:chat</code> | Chat run; отклоняет при политике или ошибке runtime |
| <code>cancelAgentChat(requestId)</code> | <code>string</code> | <code>agent:chat-cancel</code> | Результат отмены; отклоняет при ошибке IPC |
| <code>getAgentChatRun(input)</code> | <code>{ projectId: string; runId: string }</code> | <code>agent:chat-get</code> | Chat run; отклоняет, если он не найден |
| <code>resumeAgentChatRun(input)</code> | <code>{ projectId: string; runId: string }</code> | <code>agent:chat-resume</code> | Chat run; отклоняет при политике или ошибке runtime |
| <code>approveAgentChatRun(input)</code> | <code>{ projectId: string; runId: string; decision: Record&lt;string, unknown&gt; }</code> | <code>agent:chat-approve</code> | Результат chat run; отклоняет при политике или ошибке IPC |

MCP-функции выше нельзя описывать как рабочую desktop-интеграцию до
добавления методов в <code>queryn-runtime/src/rpc-server.ts</code>. Прямой
программный метод <code>QuerynRuntime.registerMcpServer</code> существует в
runtime и не является этим bridge-маршрутом.

Тип входа <code>chatAgent</code> не содержит отдельного поля плана или списка
вложений. Поэтому bridge документирует диалоговую цель и параметры запуска,
а не несуществующий планировщик.

В типе preload поле <code>model</code> отмечено как необязательное, но
текущий runtime RPC dispatch требует непустую модель для
<code>agent.chat</code>. Renderer перед вызовом проверяет выбор поставщика и
модели, поэтому интеграции bridge следует делать такую же проверку.

## Задания, модели и диагностика

| Метод | Вход | IPC-канал | Результат по JSDoc |
| --- | --- | --- | --- |
| <code>listJobs(projectId?)</code> | Необязательный <code>string</code> | <code>job:list</code> | Дескрипторы заданий; отклоняет при ошибке IPC |
| <code>getJob(jobId)</code> | <code>string</code> | <code>job:get</code> | Дескриптор задания; отклоняет, если оно не найдено |
| <code>cancelJob(jobId)</code> | <code>string</code> | <code>job:cancel</code> | Результат отмены; отклоняет при проверке или ошибке IPC |
| <code>listModels()</code> | — | <code>model:list</code> | Дескрипторы моделей; отклоняет при ошибке IPC |
| <code>installModel(input)</code> | <code>{ dependency: RuntimeModelDependency; allowNetwork?: boolean }</code> | <code>model:install</code> | Результат установки; отклоняет при политике или ошибке файловой системы |
| <code>removeModel(sha256)</code> | <code>string</code> | <code>model:remove</code> | Результат удаления; отклоняет при ошибке файловой системы или IPC |
| <code>listModelProviders()</code> | — | <code>model:provider-list</code> | Дескрипторы поставщиков; отклоняет при ошибке IPC |
| <code>listModelProviderModels()</code> | — | <code>model:provider-models</code> | Каталоги моделей; отклоняет при ошибке IPC |
| <code>listModelProviderConfigs()</code> | — | <code>model:provider-config-list</code> | Конфигурации; отклоняет при ошибке IPC |
| <code>configureModelProvider(input)</code> | <code>{ config: { id: string; type: "openai-compatible"; endpoint: string; credentialAccount?: string }; secret?: string }</code> | <code>model:provider-configure</code> | Конфигурация; отклоняет при проверке или ошибке credentials |
| <code>removeModelCredential(account)</code> | <code>string</code> | <code>model:credential-remove</code> | Результат удаления; отклоняет при ошибке хранилища credentials |
| <code>runDiagnostics(projectId?)</code> | Необязательный <code>string</code> | <code>diagnostics:doctor</code> | Отчёт; отклоняет при ошибке IPC |

## События и окно

| Метод | Вход | IPC-канал | Поведение |
| --- | --- | --- | --- |
| <code>onRuntimeEvent(listener)</code> | Функция, принимающая <code>RuntimeNotification</code> | <code>runtime:event</code> | Подписывает listener и возвращает функцию отписки |
| <code>isWindowFullScreen()</code> | — | <code>window:is-full-screen</code> | <code>boolean</code>; отклоняет при ошибке IPC |
| <code>onWindowFullScreenChange(listener)</code> | Функция, принимающая <code>boolean</code> | <code>window:fullscreen-changed</code> | Подписывает listener и возвращает функцию отписки |
| <code>minimizeWindow()</code> | — | <code>window:minimize</code> | Завершается после операции; отклоняет при ошибке IPC |
| <code>toggleMaximizeWindow()</code> | — | <code>window:toggle-maximize</code> | Завершается после операции; отклоняет при ошибке IPC |
| <code>closeWindow()</code> | — | <code>window:close</code> | Завершается после операции; отклоняет при ошибке IPC |

Подписки используют внутренние функции-обёртки Electron и снимаются только
возвращённой функцией. Renderer не получает прямой доступ к
<code>ipcRenderer</code>.
