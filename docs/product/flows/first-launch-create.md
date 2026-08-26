---
authority: normative
lifecycle: active
---

# Первый запуск и создание проекта

Этот поток описывает первый вход в desktop и создание новой папки проекта. Его
источник истины — текущие компоненты <code>LaunchSplash</code>, <code>AppShell</code>,
<code>WorkspaceHome</code>, <code>ProjectsWidget</code> и <code>CreateProjectModal</code> в
<code>osnova-desktop</code>.

Osnova не создаёт скрытую базу проекта. При успешном создании <code>osnova-core</code>
записывает <code>osnova.json</code> и служебные каталоги в выбранную папку, после чего
desktop открывает тот же проект в <code>ProjectWorkspace</code>.

## Поток

~~~mermaid
flowchart TD
  Start([Запуск desktop]) --> Splash["LaunchSplash"]
  Splash --> Shell["AppShell"]
  Shell --> Home["WorkspaceHome"]
  Home --> Recent["ProjectsWidget: последние проекты"]
  Recent --> Add["Добавить проект"]
  Add --> Choice{"Выбор действия"}
  Choice -->|Создать новый| Form["CreateProjectModal: имя и папка"]
  Form --> Create["createProject"]
  Create -->|успех| Project["ProjectWorkspace: Сессия"]
  Create -->|путь занят или не пуст| Error["Сообщение об ошибке"]
  Form -->|отмена диалога| Home
  Error --> Form
~~~

<code>LaunchSplash</code> длится около 3,8 секунды в обычном режиме и около 0,7 секунды
при включённом <code>prefers-reduced-motion</code>. Он не принимает действий пользователя.
После него открывается рабочая область с виджетом проектов.

В форме создания показываются имя, вычисляемое имя папки и родительская папка.
Родительскую папку можно выбрать через системный <code>selectFolder</code>. Вызов desktop
передаёт в <code>createProject</code> только имя и родительскую папку. Тип проекта в этой
форме не выбирается, даже если API допускает значения <code>general</code>, <code>subject</code> и
<code>exam</code>.

## Точки потока

| Точка | Экран/действие | Ошибка/деградация |
| --- | --- | --- |
| Запуск | <code>LaunchSplash</code> автоматически переходит в <code>AppShell</code> | При сокращённой анимации используется короткий статический переход |
| Workspace | <code>ProjectsWidget</code> загружает <code>listRecentProjects</code> и показывает поиск по имени | Ошибка чтения списка показывается всплывающим сообщением, пустой список получает состояние без проектов |
| Добавление | Кнопка <code>Добавить проект</code> открывает <code>AddProjectModal</code> | Отмена закрывает модальное окно без изменения данных |
| Форма | Пользователь вводит имя и при необходимости меняет родительскую папку | Сбой чтения папки по умолчанию оставляет путь в состоянии ожидания, выбор папки можно отменить |
| Создание | <code>createProject</code> создаёт папку и открывает <code>ProjectWorkspace</code> | Существующая папка или непустой каталог отклоняются. Desktop показывает сообщение о занятом проекте |
| Готовый проект | Проект открывается в режиме <code>Сессия</code> | Отдельного onboarding или мастера после создания в текущем коде нет |

## Граница реализации

Стартовая форма не предлагает шаблон, импорт материалов, выбор типа проекта или
настройку AI. Это последующие действия в уже открытом проекте, а не часть
первого запуска.
