---
context_id: GUIDE_versioning
version: "2.0.0"
last_updated: 2026-01-04
status: active
owner: Architecture Team
audience: developers, architects
language: ru
---

# Руководство по версионированию

> **SemVer для контекстов:** Мы версионируем знания, а не только код.

---

## Содержание

- [Формат версий](#формат-версий)
- [Правила инкремента](#правила-инкремента)
- [Cascade Update Workflow](#cascade-update-workflow)
- [Дедлайны обновлений](#дедлайны-обновлений)
- [Чеклист обновления](#чеклист-обновления)
- [Формат ссылок](#формат-ссылок)
- [Связанные документы](#связанные-документы)

---

## Формат версий

```
MAJOR.MINOR.PATCH (например, 1.2.0)
```

---

## Правила инкремента

### MAJOR (x.0.0)

| Слой | Когда использовать |
|------|-------------------|
| **BC (Business)** | Фундаментальное изменение целей или бизнес-правил. Старые сценарии недействительны. |
| **AC (Analytics)** | Breaking API change. Удаление Use Case. |
| **PC (Code)** | Изменение публичного интерфейса (Props/Exports), ломающее потребителей. |

### MINOR (0.x.0)

| Слой | Когда использовать |
|------|-------------------|
| **BC (Business)** | Добавление новой цели или сценария. Старые остаются валидными. |
| **AC (Analytics)** | Добавление нового опционального поля в API. Добавление нового Use Case. |
| **PC (Code)** | Добавление нового prop (опционального). Реализация новой функции. |

### PATCH (0.0.x)

| Слой | Когда использовать |
|------|-------------------|
| **Все слои** | Bug fixes, исправление опечаток, рефакторинг без изменения поведения. |

---

## Cascade Update Workflow

### Обзор

Изменения распространяются **вниз** по иерархии контекстов:

```
BC (Business Context)
 │
 ├─► AC (Analytical Context) ─► Обновить в течение 7 дней
 │    │
 │    └─► PC (Programmatic Context) ─► Обновить в течение 14 дней после AC
 │
 └─► IC (Infrastructure Context) ─► Независимый, обновлять по необходимости
```

### Шаг 1: Обновить BC Migration Log

При изменении версии BC создайте записи для ВСЕХ зависимых контекстов:

```markdown
## Migration Log

### v1.1.0 - 2025-12-31

**Изменения:** Добавлено BR-AUTH-6: Двухфакторная аутентификация

**Breaking Changes:** Нет

**Шаги миграции:**
1. Обновить AC_auth — добавить use cases для 2FA
2. Обновить PC_auth_login — реализовать 2FA flow

**Затронутые контексты:**

| Контекст | Тип | Требуемое действие | Статус |
|----------|-----|-------------------|--------|
| [AC_auth](../analytics/AC_auth.md) | AC | Добавить UC07: 2FA flow | Pending |
| [PC_auth_backend](../../src/auth/context.md) | PC | Реализовать 2FA | Pending |
```

### Шаг 2: Создать задачи в трекере (опционально)

При использовании Yandex Tracker:
- Каждый затронутый контекст становится подзадачей
- Родительская задача = задача обновления BC
- Исполнитель = владелец контекста

### Шаг 3: Обновить AC Reference Log

```markdown
## Reference Log

### v1.1.0 - 2025-12-31

**Источник:** [BC_auth v1.1.0](../business/BC_auth.md#v110---2025-12-31)

**Изменения:** Добавлен UC07: Двухфакторная аутентификация

**Требуется обновить downstream:**
- [PC_auth_backend](../../src/auth/context.md) — Реализовать 2FA endpoints
```

### Шаг 4: Обновить PC Reference Log

```markdown
## Reference Log

### v1.1.0 - 2025-12-31

**Источник:** [AC_auth v1.1.0](../analytics/AC_auth.md#v110---2025-12-31)

**Изменения:** Реализованы 2FA endpoints по UC07
```

### Шаг 5: Обновить статусы в BC

После завершения всех обновлений, обновите статусы в BC:

```markdown
| Контекст | Тип | Требуемое действие | Статус |
|----------|-----|-------------------|--------|
| [AC_auth](../analytics/AC_auth.md) | AC | Добавить UC07: 2FA flow | ✅ Done |
| [PC_auth_backend](../../src/auth/context.md) | PC | Реализовать 2FA | ✅ Done |
```

---

## Дедлайны обновлений

| От | До | Дедлайн |
|----|-----|---------|
| BC update | AC update | **7 дней** |
| AC update | PC update | **14 дней** |
| BC update | PC update (всего) | **21 день** |

> **Примечание:** Дедлайны — это ориентиры. Критические исправления могут требовать более быстрых обновлений.

---

## Чеклист обновления

Используйте этот чеклист при обновлении версии BC:

```markdown
## Cascade Update: BC_[context] v[old] → v[new]

### Подготовка
- [ ] BC Migration Log обновлён со всеми затронутыми контекстами
- [ ] Все затронутые контексты идентифицированы и перечислены
- [ ] Breaking changes чётко задокументированы

### AC Updates (в течение 7 дней)
- [ ] AC_[context1] - based_on.version обновлён
- [ ] AC_[context1] - Reference Log запись добавлена
- [ ] AC_[context2] - based_on.version обновлён
- [ ] AC_[context2] - Reference Log запись добавлена

### PC Updates (в течение 14 дней после AC)
- [ ] PC_[context1] - based_on.version обновлён
- [ ] PC_[context1] - Reference Log запись добавлена
- [ ] PC_[context1] - self_testing.status = passed

### Валидация
- [ ] Все ссылки в Affected Contexts валидны
- [ ] Все Reference Log записи ссылаются на корректные BC/AC версии
- [ ] BC Affected Contexts статусы обновлены на Done

### Финал
- [ ] Commit message следует Conventional Commits
- [ ] Все тесты проходят
```

---

## Формат ссылок

### Относительные пути

Всегда используйте относительные пути от текущего файла:

```markdown
# Из docs/business/BC_auth.md в docs/analytics/AC_auth.md
[AC_auth](../analytics/AC_auth.md)

# Из docs/analytics/AC_auth.md в src/auth/context.md
[PC_auth_backend](../../src/auth/context.md)
```

### Якоря версий

Ссылайтесь на конкретные версии через якоря:

```markdown
[BC_auth v1.1.0](../business/BC_auth.md#v110---2025-12-31)
```

Формат якоря: `#v{major}{minor}{patch}---{year}-{month}-{day}`

---

## Синхронизация версий

Пример: Если `BC_catalog` меняется с 1.0.0 на 1.1.0 (новая функция):

1. Обновить `BC_catalog` → 1.1.0
2. Обновить `AC_catalog` → 1.1.0 (based_on BC@1.1.0)
3. Обновить `PC_catalog` → 1.1.0 (based_on AC@1.1.0)

### Типы логов по слоям

| Слой | Тип лога | Содержание |
|------|----------|------------|
| **BC** | Migration Log | Полный changelog, breaking changes, таблица затронутых контекстов |
| **AC** | Reference Log | Ссылка на BC source + локальные изменения |
| **PC** | Reference Log | Ссылка на AC source + локальные изменения |

---

## Связанные документы

| Документ | Описание |
|----------|----------|
| [BC_DELTA_TEMPLATE](../templates/phases/BC_DELTA_TEMPLATE.md) | Шаблон BC Delta с чеклистом |
| [AC_DELTA_TEMPLATE](../templates/phases/AC_DELTA_TEMPLATE.md) | Шаблон AC Delta с чеклистом |
| [PC_CONTEXT_TEMPLATE](../templates/phases/PC_CONTEXT_TEMPLATE.md) | Шаблон PC с Reference Log |
| [LIVING_DOCUMENTATION](./LIVING_DOCUMENTATION.md) | Методология delta/domain |

---

**Последнее обновление:** 2026-01-04
**Владелец:** Architecture Team
**Статус:** Active
