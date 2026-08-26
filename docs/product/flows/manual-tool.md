---
authority: normative
lifecycle: active
---

# Ручной запуск инструмента

Эта страница фиксирует границу между реализованным API и экраном ручного
запуска. Runtime умеет вернуть список операций и принять вызов через
<code>listOperations</code> и <code>invokeOperation</code>. В renderer есть
<code>ToolWorkspace</code> с полями из схемы операции, выбором совместимых
артефактов и сессии, но текущий <code>ProjectNavigator</code> показывает только
режимы <code>Сессия</code> и <code>Проект</code>. Кнопки, которая переводит
пользователя в <code>mode=tools</code>, нет. Поэтому этот экран не следует
считать доступным пользовательским сценарием версии 0.2.

## Поток

~~~mermaid
flowchart TD
  Project["ProjectWorkspace: загрузка проекта"] --> Operations["listOperations({ projectId, includeHidden: true })"]
  Operations --> Navigator["ProjectNavigator"]
  Navigator -->|доступны| Visible["Сессия / Проект"]
  Navigator -.->|"кнопки tools нет"| ToolMode["mode = tools"]
  ToolMode -.-> ToolWorkspace["ToolWorkspace: экран есть в коде"]
  ToolWorkspace --> Schema["Поля из inputSchema"]
  Schema --> Inputs["Опционально: совместимые артефакты и сессия"]
  Inputs --> Invoke["invokeOperation(...)"]
  Invoke --> Job["Job: queued / running"]
  Job --> Approval{"waiting-approval?"}
  Approval -->|да| Approve["decideApproval: разрешить один раз"]
  Approval -->|нет| Result["Результат или ошибка"]
  Approve --> Result
  Result --> Artifact["Опубликованные артефакты, если runtime их создал"]
~~~

Пунктиром показан кодовый путь, который нельзя открыть из текущей навигации.
Если этот компонент будет подключён к маршруту, форма отправит аргументы,
идентификаторы выбранных артефактов и сессии через <code>invokeOperation</code>.
Публикация запрашивается с флагом <code>publishArtifacts: true</code>.

## Точки потока

| Точка | Экран/действие | Ошибка/деградация |
| --- | --- | --- |
| Загрузка проекта | <code>ProjectWorkspace</code> запрашивает операции, расширения, артефакты, сессии и задания | Сбой runtime показывается всплывающим сообщением |
| Навигация | На экране видны только кнопки <code>Сессия</code> и <code>Проект</code> | Вход в ручной режим отсутствует, поэтому пользователь не может открыть <code>ToolWorkspace</code> |
| Экран ручного запуска | Компонент умеет строить поля из <code>inputSchema</code> и выбирать совместимые артефакты | Это кодовый компонент без доступного маршрута, он не является поставленной функцией |
| Входные материалы | Для операции с <code>accepts</code> можно отметить совместимые артефакты; при наличии сессий можно выбрать сессию | Операции без совместимых типов не показывают выбор материалов; произвольное прикрепление не предусмотрено |
| Запуск | <code>invokeOperation({ projectId, operationId, arguments, sessionId?, artifactIds?, publishArtifacts: true })</code> | Неверные аргументы или отказ политики возвращаются как ошибка вызова |
| Подтверждение | Для задания со статусом <code>waiting-approval</code> экран предлагает <code>decideApproval</code> с областью <code>once</code> | В интерфейсе есть только разрешение один раз, отдельной кнопки отказа нет |
| Результат | Статус задания, JSON-результат и ссылки на созданные артефакты | При отсутствии артефакта открывать нечего; ошибки остаются в карточке задания |

## Что доступно напрямую

Для автоматизации тот же runtime-путь доступен через CLI
<code>operation:list</code> и <code>operation:invoke</code>. Поля операции,
политика и статусы задания должны читаться из фактического ответа runtime.
Отдельного обещания о рабочем экране ручного запуска в этой версии нет.
