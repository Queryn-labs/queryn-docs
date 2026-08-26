---
authority: normative
lifecycle: active
---

# Osnova Runtime

`osnova-runtime` является локальным control plane для project services,
расширений, jobs, контекста и моделей. Сам процесс runtime является частью
backend, а AI-поддержка внутри него остается опциональной.

Runtime отвечает за:

- Operation Registry и Job Manager;
- Runtime Supervisor;
- Artifact Ingestor и Session Store;
- Context Broker и project-scoped index;
- model providers и model dependencies;
- диалоговая агентная оркестрация через `AgentKernel`.

Desktop взаимодействует с runtime через versioned local RPC. Файлы проекта,
artifact descriptors и sessions остаются долговечным состоянием. Индексы,
очереди восстановления и кеши являются производными данными.

## Агентный контур

Текущий runtime предоставляет один путь выполнения запроса: `agent.chat`
делегирует в `AgentKernel` единый диалоговый tool-loop. Ядро получает историю
сессии и схемы доступных operations, принимает ответ модели, последовательно
исполняет вызовы через Job Manager и возвращает финальный текст. У запуска есть
ограничения `maxSteps` и `maxDurationSeconds`, а рискованные операции могут
приостановить его до отдельного approval.

Отдельного planner, pipeline и RPC-контракта `agent.plan|get|execute|approve|cancel`
в текущем runtime нет. `ChatRun` хранится в производном runtime state для
статуса, продолжения и отмены текущего диалога. Он не является переносимым
структурным AgentPlan. В финальном `assistant-message` сохраняются текст,
идентификаторы провайдера и запуска и метрики, но не структурированный список
источников.
