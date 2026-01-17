---
context_id: GUIDE_migration_strategy
version: "1.1.0"
last_updated: 2026-01-04
status: active
owner: Architecture Team
audience: architects
language: ru
---

# Стратегия миграции

> Процесс обработки breaking changes в BC, AC, PC, IC и CCC контекстах.

---

## Содержание

- [Процесс Breaking Change](#процесс-breaking-change)
- [Deprecation Timeline](#deprecation-timeline)
- [SemVer правила](#semver-правила)
- [Скрипты миграции](#скрипты-миграции)
- [Процедура отката](#процедура-отката)
- [Формат Change Log](#формат-change-log)
- [Best Practices](#best-practices)

---

## Процесс Breaking Change

### 1. Proposal

**Кто:** Владелец контекста или тимлид
**Что:** RFC документ с описанием изменения

**Шаблон:**

```markdown
# RFC: [Название изменения]

## Контекст
- **Затрагивает:** BC/AC/PC/IC/CCC_{id}
- **Текущая версия:** 1.x.x
- **Предлагаемая версия:** 2.0.0

## Проблема
{Какую проблему решает}

## Предлагаемое решение
{Детальное описание}

## Breaking Changes
1. {Изменение 1}
2. {Изменение 2}

## Migration Path
{Пошаговое руководство}

## Rollback Plan
{Как откатить при необходимости}
```

---

### 2. Анализ влияния

**Определение затронутых контекстов:**

```bash
# Найти все контексты, зависящие от данного
grep -r "based_on.*{context_id}" docs/
grep -r "dependencies.*{context_id}" src/
```

**Шаблон Affected Contexts:**

```yaml
impact:
  direct_dependents:
    - PC_catalog_list: "Использует старый API формат"
    - PC_cart_checkout: "Ссылается на удалённое поле"
  indirect_dependents:
    - PC_order_summary: "Зависит от PC_cart_checkout"
  estimated_effort: "8 часов"
  breaking_change: true
```

---

### 3. План миграции

**Создайте migration guide:**

```markdown
## Migration Guide: {Context} v1.x → v2.0

### Сводка Breaking Changes
1. ❌ Удалён `oldField`
2. ❌ Переименован `getData()` в `fetchData()`
3. ✨ Добавлен обязательный prop `newField`

### Пошаговая миграция

#### Шаг 1: Обновление зависимостей
```bash
npm install {package}@2.0.0
\```

#### Шаг 2: Обновление кода
```typescript
// До (v1.x)
const data = oldAPI.getData();

// После (v2.0)
const data = newAPI.fetchData();
\```

#### Шаг 3: Запуск тестов
```bash
npm test
\```

#### Шаг 4: Обновление версий контекстов
Обновите ссылки `based_on` в зависимых контекстах.
```

---

### 4. Коммуникация

**Объявление breaking change:**
- Пост в Slack/Discord команды
- Обновление CHANGELOG.md
- Добавление deprecation warnings в код (при поэтапном удалении)

**Timeline:**
- **Объявление:** за 2 недели до релиза
- **Deprecation warnings:** в предыдущей major версии
- **Удаление:** в следующей major версии

---

### 5. Выполнение

**Release checklist:**
- [ ] Все зависимые контексты обновлены
- [ ] Migration script протестирован
- [ ] Документация обновлена
- [ ] CHANGELOG.md запись добавлена
- [ ] Git tag создан (`v2.0.0`)
- [ ] Команда уведомлена

---

### 6. Верификация

**Post-release проверки:**
- [ ] Все тесты проходят
- [ ] Нет regression bugs
- [ ] Зависимые контексты функционируют
- [ ] Rollback процедура валидирована

---

## Deprecation Timeline

### Фаза 1: Объявление (v1.0.0)

```typescript
/**
 * @deprecated Используйте fetchData(). Будет удалён в v3.0.0
 */
export const getData = () => {
  console.warn('[DEPRECATED] getData() is deprecated. Use fetchData().');
  return fetchData();
};
```

### Фаза 2: Предупреждение (v2.0.0)

- Сохраняем deprecated API с warnings
- Обновляем документацию с новым API
- Предоставляем migration guide

### Фаза 3: Удаление (v3.0.0)

- Удаляем deprecated код
- Breaking change в MAJOR версии

---

## SemVer правила

### MAJOR (x.0.0)

| Слой | Когда использовать |
|------|-------------------|
| **BC** | Фундаментальное изменение целей, удаление сценариев |
| **AC** | Удаление API endpoints, изменение формата ответа |
| **PC/IC/CCC** | Удаление функций/props, изменение сигнатур |

### MINOR (0.x.0)

| Слой | Когда использовать |
|------|-------------------|
| **BC** | Добавление целей/сценариев (backward compatible) |
| **AC** | Добавление опциональных полей, новых use cases |
| **PC/IC/CCC** | Добавление функций, опциональных props |

### PATCH (0.0.x)

**Все слои:** Bug fixes, typos, внутренний рефакторинг (без изменения API)

---

## Скрипты миграции

### Шаблон

```typescript
// architect/migrations/migrate-{context}-v2.ts
import fs from 'fs';

export const migrateContextV2 = (filePath: string) => {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Шаг 1: Обновить версию
  content = content.replace(/version: 1\.\d+\.\d+/, 'version: 2.0.0');

  // Шаг 2: Обновить ссылки based_on
  content = content.replace(
    /based_on:.*{old_context}: v1\.\d+\.\d+/g,
    'based_on:\n  {new_context}: v2.0.0'
  );

  // Шаг 3: Добавить новые обязательные поля
  if (!content.includes('new_required_field:')) {
    content = content.replace(
      /---\n/,
      `---\nnew_required_field: default_value\n`
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Migrated: ${filePath}`);
};
```

---

## Процедура отката

### Emergency Rollback

```bash
# 1. Откат кода
git revert {breaking-commit-sha}

# 2. Восстановление версий зависимостей
npm install {package}@1.x.x

# 3. Восстановление состояния БД/API (если нужно)
npm run db:rollback

# 4. Redeploy предыдущей версии
npm run deploy -- --version=1.9.0

# 5. Уведомление команды
echo "⚠️ Rollback to v1.9.0 due to {reason}"
```

### Тестирование отката

**Перед major release:**
1. Deploy на staging
2. Тест миграции
3. **Тест отката**
4. Верификация работы отката
5. Deploy на production

---

## Формат Change Log

```markdown
# Changelog

## [2.0.0] - 2025-12-15

### Breaking Changes
- ❌ Удалён `oldAPI.getData()` - используйте `newAPI.fetchData()`
- ❌ Переименован prop `data` на `content` в `PC_catalog_list`

### Added
- ✨ Новый метод `fetchData()` с улучшенной обработкой ошибок
- ✨ Добавлено поле `newField` в response

### Migration Guide
См. [MIGRATION_V2.md](./MIGRATION_V2.md)

### Affected Contexts
- PC_catalog_list
- PC_cart_checkout

## [1.9.0] - 2025-12-01
### Added
- New feature X
```

---

## Best Practices

1. **Избегайте breaking changes** - предпочитайте additive changes
2. **Объединяйте breaking changes** - не выпускайте MAJOR для каждого изменения
3. **Предоставляйте codemods** - автоматические скрипты миграции экономят время
4. **Тестируйте откат** - всегда проверяйте работу отката перед релизом
5. **Сообщайте заранее** - давайте командам 2+ недели
6. **Синхронизация версий** - держите BC → AC → PC версии согласованными

---

## Связанные документы

| Документ | Описание |
|----------|----------|
| [VERSIONING_GUIDE](VERSIONING_GUIDE.md) | SemVer правила |
| [CODE_REVIEW_CHECKLIST](CODE_REVIEW_CHECKLIST.md) | Ревью breaking changes |

---

**Последнее обновление:** 2026-01-04
**Владелец:** Architecture Team
**Статус:** Active
