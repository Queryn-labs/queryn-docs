---
authority: normative
lifecycle: active
---

# Архитектурные потоки

Ниже зафиксированы шесть последовательностей, которые уже поддерживаются
исходниками. Диаграммы показывают реальные границы runtime, core и Electron,
а не будущие пользовательские сценарии. Mermaid является каноническим
форматом диаграмм.

| Поток | Основные точки реализации |
| --- | --- |
| Выполнение операции | `queryn-runtime/src/operation-service.ts`, `job-manager.ts`, `runtime-supervisor.ts`, `artifact-ingestor.ts` |
| Агентный tool loop | `agent-orchestrator.ts`, `agent-kernel.ts`, `operation-service.ts` |
| Установка расширения | `extension-manager.ts`, `@queryn/plugin-sdk` |
| Context envelope | `context-broker.ts`, `extension-manager.ts` для custom provider |
| Открытие, усыновление и миграция | `project-service.ts`, `@queryn/project` |
| Desktop IPC | `preload/index.ts`, `main/index.ts`, `main/services/runtime-service.ts`, `rpc-server.ts` |

## 1. Выполнение операции {#operation-execution}

Операция всегда проходит через `OperationService`. До запуска проверяются
схема входа, artifact inputs, permissions и risk. При необходимости job
останавливается в `waiting-approval`. Внешний runtime получает только
материализованные inputs и пишет кандидатов в изолированный outbox.

```mermaid
sequenceDiagram
    autonumber
    participant Caller as Desktop
    participant Rpc as rpc-server
    participant Service as OperationService
    participant Registry as OperationRegistry
    participant Policy as PolicyEngine
    participant Jobs as JobManager
    participant Approval as Пользователь
    participant Supervisor as RuntimeSupervisor
    participant Tool as Builtin, process, OCI или remote
    participant Outbox as Изолированный outbox
    participant Ingestor as ArtifactIngestor
    participant Project as @queryn/project
    participant Session as Session events

    Caller->>Rpc: operation.invoke(projectPath, operationId, arguments)
    Rpc->>Service: invoke(input)
    Service->>Registry: validateInput и get
    Registry-->>Service: definition и runtime descriptor
    Service->>Policy: evaluate(project, extension, operation)
    Policy-->>Service: allowed и approvalRequired
    Service->>Jobs: create(queued или waiting-approval)

    alt требуется подтверждение
        Jobs-->>Caller: job waiting-approval
        Caller->>Approval: показать риск и запрос
        Approval-->>Caller: approved или denied
        Caller->>Rpc: approval.decide(jobId, decision)
        Rpc->>Service: decide(jobId, decision)
        alt решение approved
            Service->>Policy: rememberApproval при scope operation-project
            Service->>Jobs: transition queued
        else решение denied
            Service->>Jobs: cancel(jobId)
            Jobs-->>Rpc: job cancelled
            Rpc-->>Caller: отказ зафиксирован
        end
    else подтверждение не требуется
        Note over Service,Jobs: job остаётся queued и запускается асинхронно
    end

    opt job status is queued
        Service->>Jobs: transition running
        Service->>Supervisor: invoke(job, operation, scoped paths)
        Supervisor->>Tool: builtin handler или jobs/start
        Tool->>Outbox: записать candidate payloads
        Tool-->>Supervisor: structured result и artifact candidates
        Supervisor-->>Service: RuntimeInvocationResult
        Service->>Ingestor: publish(outbox, candidates, provenance, policy)
        Ingestor->>Project: publishArtifact для каждого candidate
        Project->>Project: проверить path, symlink, MIME, размер и SHA-256
        Project->>Project: rename staging в artifacts/data/id
        Project->>Project: записать descriptor через atomic rename
        Project-->>Ingestor: ArtifactDescriptor[]
        Ingestor-->>Service: опубликованные artifacts
        opt есть sessionId
            Service->>Session: operation-result и artifact-linked
        end
        Service->>Jobs: transition succeeded
        Ingestor-->>Rpc: artifact.published notification
        Jobs-->>Rpc: job.changed notification
        Rpc-->>Caller: result и события job
    end
```

Если `publishArtifacts` отключён, `OperationService` сохраняет кандидатов в
`pending-artifacts` и оставляет job ожидающим публикации. Вызов
`artifact.publish` повторно передаёт выбранные кандидаты `ArtifactIngestor`,
после чего записываются результат сессии и успешный статус job. Команда CLI
`operation:invoke` вызывает тот же `OperationService` напрямую и ждёт terminal
статус без участия `rpc-server`.

## 2. Агентный tool loop {#agent-tool-loop}

`AgentOrchestrator` авторизует выбранный model provider и передаёт управление
`AgentKernel`. Kernel читает session log, предлагает модели только доступные
операции, записывает видимый вызов инструмента и добавляет observation после
terminal job. Подтверждение приостанавливает run и не повторяет вызов до
явного resume.

```mermaid
sequenceDiagram
    autonumber
    participant User as Пользователь
    participant Rpc as rpc-server
    participant Orchestrator as AgentOrchestrator
    participant Kernel as AgentKernel
    participant SessionLog as Session log
    participant Provider as ModelProvider
    participant Registry as OperationRegistry
    participant Service as OperationService
    participant Jobs as JobManager
    participant Approval as Пользовательское подтверждение

    User->>Rpc: agent.chat(goal, sessionId, providerId, model)
    Rpc->>Orchestrator: chat(input)
    Orchestrator->>Orchestrator: проверить provider, project connection и policy
    Orchestrator->>Kernel: start(provider, input)
    Kernel->>SessionLog: read events и построить history
    Kernel->>Provider: complete(messages, tools)

    alt модель вернула финальный текст
        Provider-->>Kernel: text
        Kernel->>SessionLog: assistant-message
        Kernel-->>Orchestrator: ChatRun succeeded
        Orchestrator-->>Rpc: ChatRun
        Rpc-->>User: финальный ответ
    else модель вернула tool call
        Provider-->>Kernel: tool call и arguments
        Kernel->>Registry: get и validate input schema
        Registry-->>Kernel: доступная operation definition
        Kernel->>SessionLog: tool-call
        Kernel->>Service: invoke(provenanceRunId, sessionId)
        Service->>Jobs: create и запустить operation

        alt operation требует approval
            Jobs-->>Kernel: waiting-approval
            Kernel-->>Rpc: ChatRun waiting-approval
            Rpc-->>User: approval.required
            User->>Approval: изучить риск и принять решение
            Approval-->>User: approved или denied
            User->>Rpc: agent.chat.approve(runId, decision)
            Rpc->>Orchestrator: approveChat(runId, decision)
            Orchestrator->>Service: decide(pendingJobId, decision)
            Orchestrator->>Kernel: resume(runId)
            Kernel->>Jobs: await terminal job
        else operation завершилась
            Jobs-->>Kernel: succeeded или failed
            Kernel->>SessionLog: observation
            Kernel->>Provider: complete(history плюс observation)
            Provider-->>Kernel: следующий tool call или final text
        end
    end
```

После observation цикл возвращается к `Provider`, пока модель не вернёт текст,
не исчерпает `maxSteps` или не будет отменена. Сохраняются только видимые
события сессии, hidden model reasoning в проект не записывается.

## 3. Установка и откат расширения {#extension-installation}

Установка не активирует непроверенное дерево файлов. `ExtensionManager`
ограничивает размер пакета, проверяет manifest и host compatibility, integrity
и подпись, разворачивает файлы в уникальный staging path, а затем одним rename
публикует immutable version tree. Откат выбирает уже установленную версию и
повторно выполняет проверку install metadata перед активацией.

```mermaid
sequenceDiagram
    autonumber
    participant Caller as Desktop
    participant Rpc as rpc-server
    participant Manager as ExtensionManager
    participant Package as Extension package
    participant Sdk as @queryn/plugin-sdk
    participant Staging as Staging directory
    participant VersionStore as Installed version tree
    participant Active as active.json
    participant Registry as OperationRegistry

    Caller->>Rpc: extension.install(packagePath)
    Rpc->>Manager: install(packagePath, options)
    Manager->>Package: read package bytes
    Manager->>Manager: проверить maxPackageBytes и package format
    Manager->>Sdk: validateExtensionManifest(manifest)
    Sdk-->>Manager: valid или список ошибок
    Manager->>Manager: проверить hostVersion и queryn.minVersion
    Manager->>Manager: verifyPackageIntegrity

    alt подпись передана
        Manager->>Manager: verifyPackageSignature
    else подпись отсутствует
        Manager->>Manager: потребовать allowUnsigned
    end

    alt проверка и подготовка завершились успешно
        Manager->>Staging: создать уникальный staging path
        loop каждый файл пакета
            Manager->>Staging: декодировать, проверить SHA-256 и записать
        end
        Manager->>Staging: проверить runtime, theme и view entries
        Manager->>Staging: записать .install.json
        Manager->>VersionStore: rename staging в versions/version
        Manager->>Manager: activate(extensionId, version)
        Manager->>VersionStore: прочитать manifest и проверить install metadata
        Manager->>Active: записать активную версию
        Manager->>Registry: replaceExtensionVersion
        Manager-->>Rpc: InstalledExtension active=true
        Rpc-->>Caller: версия активирована
    else ошибка до публикации версии
        Manager->>Staging: удалить staging directory
        Manager-->>Rpc: ошибка установки
        Rpc-->>Caller: отказ без частичной версии
    end

    opt откат на установленную версию
        Caller->>Rpc: extension.rollback(extensionId, version)
        Rpc->>Manager: rollback(extensionId, version)
        Manager->>VersionStore: verifyInstalledVersion
        Manager->>Active: записать выбранную версию
        Manager->>Registry: зарегистрировать операции версии
        Manager-->>Rpc: ok
        Rpc-->>Caller: rollback завершён
    end
```

Иммунитет версии обеспечивается `integrity` из `.install.json`. Подключение к
проекту выполняется отдельной операцией: она добавляет требование в
`queryn.json`, обновляет `.queryn/extensions/lock.json` и выдаёт локальные
grants через `PolicyEngine`. CLI-команды `extension:install` и
`extension:rollback` вызывают `ExtensionManager` напрямую, без `rpc-server`.

## 4. Context envelope {#context-envelope}

`ContextBroker` разрешает материалы по их context policy, чувствительности,
уровню детализации и бюджету. Для `custom` provider перед вызовом runtime
проверяются permissions и risk. `RecipientGate` на диаграмме является частью
этой логики broker, а не отдельным исполняемым сервисом.

Текущий `SessionWorkspace` при открытии окружения вызывает `context.preview` и
показывает компактный каталог. Полный `context.resolve` доступен через
preload API и CLI, но не вызывается из `agent.chat`, ниже показан именно этот
явный путь разрешения envelope.

```mermaid
sequenceDiagram
    autonumber
    participant Desktop as Desktop preload API
    participant RuntimeCli as Runtime CLI
    participant Rpc as rpc-server
    participant Broker as ContextBroker
    participant Project as @queryn/project
    participant Extension as ExtensionManager
    participant Policy as PolicyEngine
    participant Supervisor as RuntimeSupervisor
    participant Provider as Context provider
    participant Budget as Budget и truncation
    participant RecipientGate as Recipient gate

    alt явный запрос desktop
        Desktop->>Rpc: context.resolve(projectId, level, budgetTokens, recipient)
        Rpc->>Broker: resolve(request)
    else запрос Runtime CLI
        RuntimeCli->>Broker: context:resolve(options)
    end
    Broker->>Project: list/read artifacts, notes и assets
    Project-->>Broker: descriptors и material contents
    Broker->>Broker: определить mode и sensitivity

    alt mode automatic
        Broker->>Broker: извлечь metadata, text prefix или media metadata
    else mode declarative
        Broker->>Broker: выбрать fields и применить template
    else mode custom
        Broker->>Extension: вызвать зарегистрированный custom provider
        Extension->>Policy: evaluate artifact:read и runtime permissions
        Policy-->>Extension: allowed и approvalRequired
        alt подтверждение требуется
            Extension-->>Broker: ошибка до вызова provider
            alt явный запрос desktop
                Broker-->>Rpc: ошибка до вызова provider
                Rpc-->>Desktop: ошибка policy
            else запрос Runtime CLI
                Broker-->>RuntimeCli: ошибка до вызова provider
            end
        else вызов разрешён
            Extension->>Supervisor: stage artifact и context/resolve
            Supervisor->>Provider: context/resolve(providerId, level, budget)
            Provider-->>Supervisor: ContextEnvelope candidate
            Supervisor-->>Extension: ContextEnvelope candidate
            Extension-->>Broker: ContextEnvelope candidate
        end
    else mode none или compact level
        Broker->>Broker: вернуть только безопасные metadata
    end

    Broker->>Budget: ограничить общий token budget
    Budget-->>Broker: text, tokenEstimate и truncated
    Broker->>RecipientGate: пересечь recipients с sensitivity
    RecipientGate-->>Broker: allowedRecipients
    alt явный запрос desktop
        Broker-->>Rpc: ContextEnvelope
        Rpc-->>Desktop: envelope
    else запрос Runtime CLI
        Broker-->>RuntimeCli: ContextEnvelope
    end
```

Встроенные режимы возвращают envelope с `providerVersion` вида
`host.automatic/1`, `host.declarative/1` или `host.metadata/1`. Если материал
помечен sensitive, допустимым получателем остаётся только `local`. Индекс
поиска строится отдельно в `.queryn/index` и не становится содержимым
переносимого контракта.

## 5. Открытие, усыновление и миграция проекта {#project-lifecycle}

Открытие проекта сначала читает manifest и проверяет структуру. Усыновление
незнакомой папки сначала возвращает план с отсутствующими директориями и
коллизиями, а затем по подтверждению создаёт только недостающие пути и пишет
новый manifest. Формат `0.1` не меняется при обычном открытии и переводится в
`0.2` только отдельной миграцией.

```mermaid
sequenceDiagram
    autonumber
    participant Renderer as Renderer
    participant Preload as PreloadBridge
    participant Main as MainProcess
    participant RuntimeRpc as rpc-server
    participant RuntimeProject as Runtime ProjectService
    participant Core as @queryn/project
    participant Folder as Project folder
    participant Extensions as ExtensionManager
    participant Policy as PolicyEngine
    participant Lock as extensions lock
    participant User as Пользователь

    alt в папке есть queryn.json
        Renderer->>Preload: window.queryn.openProject(projectId)
        Preload->>Main: ipcRenderer.invoke(project:open)
        Main->>Core: desktop project-service.openProject(rootPath)
        Core->>Folder: read queryn.json
        Core->>Core: validate manifest и ensure format directories
        Core-->>Main: QuerynProject
        Main->>RuntimeRpc: project.open(projectPath)
        RuntimeRpc->>RuntimeProject: open(projectPath)
        RuntimeProject->>Core: openProject(projectPath)
        RuntimeProject->>Extensions: reconcileProject(projectPath)
        Extensions->>Lock: read и обновить lock
        Extensions-->>RuntimeProject: resolved или missing
        RuntimeProject->>Policy: hydrateProject
        RuntimeProject-->>RuntimeRpc: opened project
        RuntimeRpc-->>Main: manifest
        Main-->>Preload: sanitized result
        Preload-->>Renderer: project manifest
    else manifest отсутствует
        Renderer->>Preload: inspectProjectAdoption(path)
        Preload->>Main: ipcRenderer.invoke(project:inspect-adoption)
        Main->>RuntimeRpc: project.inspect-adoption(path)
        RuntimeRpc->>RuntimeProject: inspectAdoption(path)
        RuntimeProject->>Core: inspectProjectAdoption(path)
        Core->>Folder: inspect reserved directories и entries
        Core-->>RuntimeProject: adoption plan с collisions
        RuntimeProject-->>RuntimeRpc: adoption plan
        RuntimeRpc-->>Main: adoption plan
        Main-->>Preload: sanitized plan
        Preload-->>Renderer: adoption plan
        Renderer->>User: показать план усыновления
        User-->>Renderer: подтвердить
        Renderer->>Preload: adoptProject(path, metadata)
        Preload->>Main: ipcRenderer.invoke(project:adopt)
        Main->>RuntimeRpc: project.adopt(path, metadata)
        RuntimeRpc->>RuntimeProject: adopt(path, input)
        RuntimeProject->>Core: adoptProject(path, input)
        Core->>Folder: mkdir только недостающих директорий
        Core->>Folder: write queryn.json через atomic rename
        RuntimeProject->>Core: open(path) после усыновления
        RuntimeProject-->>RuntimeRpc: adopted project
        RuntimeRpc-->>Main: manifest
        Main-->>Preload: sanitized result
        Preload-->>Renderer: project manifest
    end

    opt manifest имеет formatVersion 0.1
        Renderer->>Preload: migrateProject(dryRun=true)
        Preload->>Main: ipcRenderer.invoke(project:migrate)
        Main->>RuntimeRpc: project.migrate(dryRun=true)
        RuntimeRpc->>RuntimeProject: migrate(path, dryRun=true)
        RuntimeProject->>Core: inspectProjectMigration
        Core-->>RuntimeProject: plan 0.1 в 0.2
        RuntimeProject-->>RuntimeRpc: migration plan
        RuntimeRpc-->>Main: migration plan
        Main-->>Preload: sanitized plan
        Preload-->>Renderer: migration plan
        Renderer->>User: показать dry-run план
        User-->>Renderer: подтвердить миграцию
        Renderer->>Preload: migrateProject(dryRun=false)
        Preload->>Main: ipcRenderer.invoke(project:migrate)
        Main->>RuntimeRpc: project.migrate(dryRun=false)
        RuntimeRpc->>RuntimeProject: migrate(path, dryRun=false)
        RuntimeProject->>Core: migrateProject
        Core->>Folder: сохранить backup manifest в .queryn/migrations
        Core->>Folder: создать artifacts, sessions и relations
        Core->>Folder: атомарно записать formatVersion 0.2
        alt ошибка миграции
            Core->>Folder: восстановить backup и удалить созданные директории
            Core-->>RuntimeProject: ошибка без частичного перехода
        else миграция успешна
            Core-->>RuntimeProject: migrated manifest и backupPath
            RuntimeProject->>Core: open(path) и обновить runtime state
        end
        RuntimeProject-->>RuntimeRpc: migration result
        RuntimeRpc-->>Main: result
        Main-->>Preload: sanitized result
        Preload-->>Renderer: migration status
    end
```

В `queryn-core/packages/project/src/project.ts` чтение manifest также создаёт
только служебные директории, необходимые объявленной версии. В
`migration.ts` исходный manifest сохраняется до изменения, а ошибка восстанавливает
его байты и удаляет каталоги, созданные в рамках этой миграции.

## 6. Desktop IPC и local RPC {#desktop-ipc}

Renderer вызывает только типизированный `window.queryn`. Main process проверяет
доверенный frame, переводит идентификатор проекта в канонический путь и
санитизирует ответ. `DesktopRuntimeService` лениво запускает runtime, а
`RpcClient` добавляет bearer token к каждой JSON-RPC строке.

```mermaid
sequenceDiagram
    autonumber
    participant Renderer as Renderer
    participant Preload as PreloadBridge
    participant Main as MainProcess
    participant DesktopRuntime as DesktopRuntimeService
    participant RuntimeProcess as queryn-runtime process
    participant Client as RpcClient
    participant Server as rpc-server
    participant Runtime as QuerynRuntime

    Renderer->>Preload: window.queryn.listJobs(projectId)
    Preload->>Main: ipcRenderer.invoke(job:list, projectId)
    Main->>Main: assertTrustedSender и requireOpenProject
    Main->>DesktopRuntime: request(job.list, projectPath)

    alt первый runtime request
        DesktopRuntime->>RuntimeProcess: spawn node dist/cli.js serve
        RuntimeProcess-->>DesktopRuntime: address, token и protocol
        DesktopRuntime->>Client: connect(address, token)
    else client уже подключён
        DesktopRuntime-->>Client: переиспользовать connection
    end

    Client->>Server: JSON-RPC 2.0 с _auth bearer token
    Server->>Server: проверить token и удалить _auth из params
    Server->>Runtime: dispatch(job.list, projectPath)
    Runtime-->>Server: JobDescriptor[]
    Server-->>Client: JSON-RPC result
    Client-->>DesktopRuntime: typed response
    DesktopRuntime-->>Main: response
    Main->>Main: sanitizeProjectPaths и projectPath в projectId
    Main-->>Preload: sanitized result
    Preload-->>Renderer: jobs

    opt runtime notification
        Runtime-->>Server: job.changed или agent.activity
        Server-->>Client: JSON-RPC notification
        Client-->>DesktopRuntime: RuntimeNotification
        DesktopRuntime-->>Main: event emitter
        Main->>Main: translateRuntimeEvent
        Main-->>Preload: runtime:event
        Preload-->>Renderer: typed notification
    end
```

Для файловых операций main process использует `project-service.ts` и
`file-service.ts` напрямую, без обхода через runtime. Для runtime-операций
канон транспортного уровня остаётся `queryn-rpc/1`, а события передаются по
тому же локальному соединению.
