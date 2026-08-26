---
authority: normative
lifecycle: active
---

# Архитектура desktop-клиента

`queryn-desktop` использует Electron, React и TypeScript через `electron-vite`.
Текущая реализация собирает рабочий desktop-клиент для Windows и macOS. Различия
платформ ограничены системной оболочкой окна и жизненным циклом приложения, а
проектные данные и основные экраны используют общий код.

## Границы процессов

- `main`: жизненный цикл Electron, native dialogs, файловая система, сервисы
  проекта, локальных настроек и runtime, а также IPC-обработчики.
- `preload`: типизированный узкий мост `window.queryn`. Renderer не получает
  Node.js, shell или произвольный RPC.
- `renderer`: React-приложение с рабочей областью, проектом, сессиями,
  материалами, инструментами и настройками.

## Сервисы main

В main-коде используются четыре фактические сервисные границы:

- `runtime-service`: запускает дочерний процесс `queryn-runtime serve`, создаёт
  authenticated local RPC-клиент, проксирует запросы и передаёт события jobs,
  approvals, artifacts и агентного цикла в renderer.
- `project-service`: адаптер над `@queryn/project` для создания, открытия,
  усыновления, чтения и изменения проектов, заметок, файлов и связей. Он также
  обновляет список последних проектов.
- `settings-service`: хранит локальные настройки desktop-клиента, профиль,
  путь новых проектов и список последних проектов.
- `file-service`: предоставляет main-коду чтение JSON-файлов. Безопасные
  операции с путями проекта выполняются через `project-service` и проверки
  main-обработчиков.

Отдельных `plugin-service` и `ai-service` в текущем коде нет. Расширения,
операции, модели, контекст и агент принадлежат `queryn-runtime`, а desktop
вызывает их через `runtime-service`.

## Бренд Queryn в desktop

`Queryn` является текущим именем desktop-оболочки и агентного интерфейса. Оно
видно в заголовке окна, mark-логотипе рабочей области, поле ввода и настройках
`Queryn Intelligence`. `Queryn` остаётся названием продукта, формата проекта,
репозиториев и локального runtime. Queryn не является отдельным сервисом или
вторым источником данных, а обозначает пользовательскую оболочку и опциональный
агентный слой.

## Карта renderer-фич

Состав renderer следует фактической композиции `AppShell` и `ProjectWorkspace`:

- оболочка: `app/App`, `launch-splash`, `app-shell` и `app-titlebar`;
- рабочая область без открытого проекта: `workspace-home`,
  `WorkspaceLayoutRenderer` и системный виджет `queryn.projects`;
- открытый проект: `project-workspace` и `project-navigator` с режимами сессий,
  материалов и инструментов;
- сессии и агент: `session-workspace` хранит события, поток ответа, историю,
  подтверждения, выбор модели и режим памяти сессии;
- материалы: `materials-workspace`, `project-materials`, `note-editor`,
  `markdown-editor`, `asset-viewer` и `linked-files`;
- ручные операции: `tool-workspace` вызывает зарегистрированную операцию и
  показывает job, approval и опубликованные артефакты. Компонент существует в
  renderer, но `ProjectNavigator` пока не даёт доступного входа в режим
  `tools`;
- менеджер инструментов и настройки: backend API поддерживает установку,
  обновление, откат и подключение расширений, а текущий `tool-manager` в
  renderer покрывает установку, подключение, отключение, список operations и
  permissions. `app-settings` отвечает за профиль, оформление, поставщиков
  моделей и диагностику runtime.

Файл `widgets/project-explorer/ProjectExplorer.tsx` сохраняется в исходниках,
но текущая композиция `AppShell` использует `ProjectNavigator` и
`MaterialsWorkspace`. Поэтому `ProjectExplorer` не считается активной точкой
навигации продукта.

## Queryn и деградация

Сессия и материалы остаются доступными, когда `Queryn Intelligence` выключен или
модель не настроена. Ручной запуск инструментов выполняется через ту же границу
runtime и не превращает агент в обязательного владельца проекта.

## IPC-контракт

Полный список методов типизированного моста поддерживается в
[`queryn-desktop/src/preload/index.ts`](https://github.com/Queryn-labs/queryn-desktop/blob/main/src/preload/index.ts).
Изменения IPC должны проходить через обработчик в main, явный метод preload и
потребителя в renderer. Прямой импорт Electron или Node.js в renderer запрещён.
