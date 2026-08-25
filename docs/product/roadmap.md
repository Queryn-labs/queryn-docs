# Roadmap Osnova Reborn

## 1. Нормативная основа

- Принять продуктовую модель Reborn.
- Зафиксировать формат проекта 0.2 и миграцию 0.1 -> 0.2.
- Принять ADR для артефактов, расширений, runtime, контекста и агента.

## 2. Доменное ядро

- Артефакты, payloads, provenance и relations.
- Переносимые сессии и append-only события.
- Атомарная публикация результатов.
- Reconciliation обычных файлов и дескрипторов.

## 3. Runtime control plane

- Локальный versioned RPC.
- Job Manager, cancellation и crash recovery.
- Operation Registry и risk policy.
- Headless CLI для полного backend-сценария.

## 4. Экосистема расширений

- Extension Manifest v1 и Developer Kit.
- Подписанный каталог, установка, update и rollback.
- Process, OCI, remote и MCP adapters.
- Reference Tool и Advanced Tool.

## 5. Контекст и модели

- Compact/expanded context providers.
- Project-scoped индекс и connectors.
- Local и cloud model providers.
- Проверяемые model dependencies.
- Пользовательские названия провайдеров и полезные характеристики моделей в каталоге моделей пикера вместо технических идентификаторов вроде `local.ollama` и `organization_owner`.

## 6. Агентная оркестрация

- Видимый plan schema.
- Bounded execution и approvals по риску.
- Provenance и audit trail без сохранения hidden reasoning.

## 7. Desktop integration

- Typed bridge к runtime без нового renderer.
- Sandboxed Electron renderer.
- API для будущих экранов проекта, сессий, контекста и Tool Manager.

## После backend foundation

- Цельный новый frontend Reborn.
- Спроектировать экран инструментов, глобальный поиск, настройки приложения и возврат к рабочей области после удаления постоянной боковой панели.
- Использовать существующий экран проектов вместо отдельной навигационной иконки папки.
- Подписанный публичный каталог и процессы модерации.
- Явно подключаемый контекст workspace или всего компьютера.
- Фоновая обработка и синхронизация как отдельные opt-in возможности.
