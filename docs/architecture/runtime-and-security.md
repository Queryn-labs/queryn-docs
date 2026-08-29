---
authority: normative
lifecycle: active
---

# Runtime, permissions и безопасность

## Драйверы

- `builtin`: подписанный код Queryn.
- `node-process`: отдельный JS/TS extension host.
- `native-process`: внешний executable с Queryn Tool Protocol.
- `oci`: OCI image, закрепленный digest.
- `remote`: явно подключенный HTTP или MCP server.

Node permission flags являются defense in depth, а не гарантией защиты от
вредоносного пакета. Непроверенный executable требует явного доверия. Для
сильной изоляции используется OCI с ограниченными mounts и network policy.

Поставка зависимостей является частью драйвера. Host не выполняет `npm install`,
`pip install` или установку системных пакетов от имени расширения. Детальная
модель совместимости, подготовки и удаления описана в
[средах исполнения инструментов](./tool-runtime-dependencies.md).

OCI применяет hard limits CPU/RAM, tmpfs-limit для work и timeout. Для
`node-process` host ограничивает V8 heap, filesystem permissions, timeout и
заявленный disk budget всей writable-области. Supervisor проверяет budget во
время запуска и перед принятием результата; отдельная проверка Artifact Ingestor
ограничивает каждый публикуемый payload. CPU/RAM для доверенного `native-process` остаются
advisory там, где ОС не предоставляет переносимой job-object границы; такой
driver нельзя выдавать за sandbox.

## Три уровня контроля

1. Manifest объявляет максимальные permissions.
2. Пользователь выдает grants при подключении к проекту.
3. Policy Engine оценивает конкретный invocation.

Risk levels: `safe-read`, `project-write`, `network-egress`,
`external-side-effect`, `privileged`. Последние три требуют approval или
заранее сохраненного scoped rule.

Текущий desktop-путь Tool Manager устанавливает локальный пакет с
`allowUnsigned: true` и при подключении передаёт весь объявленный набор
permissions. Это фактически путь только для разработки без гранулярного выбора.
Подписанный каталог с отдельным согласованием каждого permission остаётся
целевым усилением.

## OCI filesystem

```text
/queryn/input    read-only materialized inputs
/queryn/work     ephemeral work directory
/queryn/outbox   candidate outputs
/queryn/models   read-only model cache
```

Папка проекта и container engine socket не монтируются. Host проверяет paths,
symlinks, размер, MIME, schema и hash до публикации результата.

## Recovery

Jobs имеют устойчивое состояние. После перезапуска незавершенный job становится
`interrupted`. Автоматический retry разрешен только для idempotent operation.
Публикация использует staging и атомарный rename, поэтому частичный runtime output
не повреждает проект.

## Lifecycle

Process-драйверы поддерживают `job`, `project` и `shared`. Project process
изолируется областью конкретного проекта; shared process имеет idle timeout.
OCI использует только `job`, потому что повторное использование контейнера
потребовало бы расширить mounts и нарушило бы границу данных между вызовами.

## Handshake и ошибки процесса

Процесс считается готовым только после успешного `initialize` с совместимой
версией протокола и ожидаемыми capabilities. Необработанный `stderr` не
добавляется к пользовательской ошибке. Он хранится как ограниченное событие
стороннего источника, связанное с заданием через `traceId` и с конкретным сбоем
через `errorId`. Общая модель
описана в [ошибках и диагностике](./errors-and-diagnostics.md).
