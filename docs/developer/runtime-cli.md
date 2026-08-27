---
authority: normative
lifecycle: active
---

# CLI runtime

CLI runtime собирается из <code>queryn-runtime/src/cli.ts</code>. После сборки
его можно запускать напрямую:

~~~bash
cd queryn-runtime
pnpm build
node dist/cli.js help
~~~

Вызов не является оболочкой с подкомандами и позиционными аргументами:
команда выбирается первым аргументом, остальные параметры разбираются по
именованным флагам. JSON печатается с отступами в stdout. Ошибка печатается в
stderr, а процесс завершается с кодом 1.

## Общие команды

| Команда | Аргументы и результат |
| --- | --- |
| <code>help</code>, <code>--help</code>, <code>-h</code> | Печатает встроенный список команд |
| <code>selftest</code> | Создаёт временный проект, выполняет встроенную операцию создания заметки, проверяет артефакт и контекст, затем удаляет временные данные |
| <code>status</code> | Возвращает состояние runtime |
| <code>doctor [--project PATH]</code> | Возвращает диагностический отчёт runtime, при наличии пути включает проект |
| <code>runtime:stop [--runtime ID]</code> | Останавливает выбранный или текущий runtime и печатает новый статус |

До выполнения большинства команд runtime создаётся с домашним каталогом по
умолчанию. Дополнительный флаг <code>--runtime-home PATH</code> можно передать
в общий список аргументов, чтобы задать каталог runtime.

## Проекты и миграции

| Команда | Обязательные параметры | Дополнительные параметры |
| --- | --- | --- |
| <code>project:create</code> | <code>--path PATH --id ID --name NAME</code> | <code>--description TEXT</code> |
| <code>project:open</code> | <code>--path PATH</code> | — |
| <code>project:validate</code> | <code>--path PATH</code> | — |
| <code>project:migrate</code> | <code>--path PATH</code> | <code>--dry-run</code> |

<code>project:create</code> записывает манифест и служебные каталоги проекта.
<code>project:migrate --dry-run</code> строит план без применения изменений.
Усыновление папки через CLI отдельно не выделено: полный RPC-метод
<code>project.adopt</code> есть в runtime dispatch, но команды
<code>project:inspect-adoption</code> и <code>project:adopt</code> в
<code>cli.ts</code> нет.

## Расширения

| Команда | Аргументы |
| --- | --- |
| <code>extension:install</code> | <code>--package FILE</code>, необязательно <code>--developer-mode</code> |
| <code>extension:update</code> | <code>--package FILE</code>, необязательно <code>--developer-mode</code> |
| <code>extension:list</code> | Нет обязательных аргументов |
| <code>extension:rollback</code> | <code>--extension ID --version VERSION</code> |
| <code>extension:connect</code> | <code>--project PATH --extension ID --version VERSION</code> |
| <code>extension:disconnect</code> | <code>--project PATH --extension ID</code> |

Для <code>extension:connect</code> доступны
<code>--permissions p1,p2</code> и необязательный
<code>--requirement RANGE</code>. Для установки и обновления
<code>--developer-mode</code> передаёт runtime
<code>allowUnsigned: true</code>. Это режим разработки, а не проверка
подписи. Даже в нём runtime выполняет проверки формата, манифеста, размеров,
путей и целостности.

Версия, которую подключают к проекту, должна удовлетворять требованию
проекта, а переданные разрешения должны быть объявлены манифестом. Команда
отката печатает <code>{ "rolledBack": true }</code> после успешного вызова.

## Runtime, сессии и операции

Эти команды требуют <code>--project PATH</code>. CLI сначала открывает проект
через runtime, затем выполняет действие.

| Команда | Параметры |
| --- | --- |
| <code>runtime:start</code> | <code>--project PATH --runtime ID</code> |
| <code>session:create</code> | <code>--project PATH --title TEXT</code>, необязательно <code>--goal TEXT</code> |
| <code>session:list</code> | <code>--project PATH</code> |
| <code>session:events</code> | <code>--project PATH --session ID</code> |
| <code>operation:list</code> | <code>--project PATH</code>, необязательно <code>--all</code> для скрытых операций |
| <code>operation:invoke</code> | <code>--project PATH --operation ID</code> |

Для <code>operation:invoke</code> доступны:

- <code>--input JSON</code> — JSON-объект аргументов, по умолчанию <code>{}</code>
- <code>--session ID</code> — привязать задание к сессии
- <code>--artifacts ID1,ID2</code> — передать входные артефакты
- <code>--publish</code> — запросить публикацию созданных артефактов
- <code>--approve</code> — автоматически разрешить ожидающее действие один раз
- <code>--scope operation-project</code> — область решения для одобренного действия

CLI ждёт терминальный статус задания. Если операция ожидает подтверждения,
без <code>--approve</code> команда возвращает состояние
<code>waiting-approval</code>. Если runtime ждёт публикации артефакта, это
состояние также возвращается вызывающему коду.

## Подтверждения и задания

| Команда | Аргументы | Поведение |
| --- | --- | --- |
| <code>approval:decide</code> | <code>--job ID</code>, необязательно <code>--approve</code> и <code>--scope operation-project</code> | Читает задание, открывает его проект и передаёт решение runtime |
| <code>job:get</code> | <code>--job ID</code> | Возвращает одно задание |
| <code>job:list</code> | Необязательно <code>--project PATH</code> | Возвращает задания runtime или одного проекта |
| <code>job:cancel</code> | <code>--job ID</code> | Отменяет задание и печатает его результат |

У <code>approval:decide</code> отсутствие флага <code>--approve</code> означает
отказ. Область решения по умолчанию — <code>once</code>, а
<code>operation-project</code> выбирается только явным флагом. Успешная команда
ожидает задание до терминального состояния.

## Артефакты и контекст

| Команда | Аргументы |
| --- | --- |
| <code>artifact:list</code> | <code>--project PATH</code> |
| <code>artifact:publish</code> | <code>--project PATH --job ID</code>, необязательно <code>--indexes 0,1</code> |
| <code>context:preview</code> | <code>--project PATH</code> |
| <code>context:resolve</code> | <code>--project PATH</code>, необязательно <code>--artifacts ID1,ID2 --expanded --budget N --cloud --approve --scope ...</code> |
| <code>context:reindex</code> | <code>--project PATH</code> |

Без <code>--expanded</code> разрешается компактный контекст с бюджетом 2000
токенов. <code>--cloud</code> выбирает облачного получателя, а
<code>--approve</code> добавляет решение для запроса контекста. Индексы
публикации разбираются как числа, разделённые запятыми.

## Коннекторы

| Команда | Аргументы |
| --- | --- |
| <code>connector:list</code> | Фактически проходит через project-scoped ветку CLI и поэтому требует <code>--project PATH</code>, хотя список runtime не использует путь |
| <code>connector:sync</code> | <code>--project PATH --connector ID</code>, необязательно <code>--approve --scope ...</code> |

<code>connector:sync</code> возвращает задание после ожидания терминального
статуса. Встроенной команды регистрации MCP в <code>cli.ts</code> нет.
Прямой метод <code>QuerynRuntime.registerMcpServer</code> относится к
программному API runtime. Desktop bridge публикует MCP-вызовы, но dispatch
RPC в текущей версии не содержит методов <code>mcp.server.*</code>.

## Модели и поставщики

| Команда | Аргументы |
| --- | --- |
| <code>model:list</code> | Нет обязательных аргументов |
| <code>model:provider-template-list</code> | Нет обязательных аргументов |
| <code>model:provider-list</code> | Нет обязательных аргументов |
| <code>model:provider-config-list</code> | Нет обязательных аргументов |
| <code>model:install</code> | <code>--dependency JSON</code>, необязательно <code>--allow-network</code> |
| <code>model:remove</code> | <code>--sha256 DIGEST</code> |
| <code>model:provider-configure</code> | <code>--config JSON</code>, необязательно <code>--secret-stdin</code> |
| <code>model:provider-remove</code> | <code>--provider ID</code> |

<code>--dependency</code> и <code>--config</code> должны быть JSON-объектами.
Секрет поставщика читается только из стандартного ввода при наличии
<code>--secret-stdin</code>. Новая конфигурация поставщика содержит
<code>templateId</code> и явный <code>recipient</code>. После удаления модели или
поставщика CLI печатает <code>{ "removed": true }</code>.

## Примеры

~~~bash
node dist/cli.js project:create \
  --path /tmp/queryn-demo \
  --id demo \
  --name "Demo project"

node dist/cli.js session:create \
  --project /tmp/queryn-demo \
  --title "Проверить материалы" \
  --goal "Собрать список тем"

node dist/cli.js operation:list --project /tmp/queryn-demo --all

node dist/cli.js operation:invoke \
  --project /tmp/queryn-demo \
  --operation queryn.notes.create \
  --input '{"title":"Первая заметка","body":"Текст"}' \
  --publish

node dist/cli.js model:provider-configure \
  --config '{"id":"cloud.openai","templateId":"cloud.openai","type":"openai-compatible","endpoint":"https://api.openai.com/v1","credentialAccount":"cloud.openai","recipient":"cloud"}' \
  --secret-stdin < provider-secret.txt

node dist/cli.js model:provider-remove --provider cloud.openai
~~~

## RPC-сервер

<code>node dist/cli.js serve</code> печатает одной строкой JSON с
<code>address</code>, <code>token</code>, <code>protocol: "queryn-rpc/1"</code>
и <code>pid</code>, после чего остаётся запущенным до SIGINT или SIGTERM.
Файл <code>rpc.json</code> записывается в data root runtime и удаляется при
закрытии. RPC-клиент должен передавать токен в поле <code>_auth</code>. Список
доступных RPC-методов шире CLI и является отдельным контрактом
<code>queryn-runtime/src/rpc-server.ts</code>.
