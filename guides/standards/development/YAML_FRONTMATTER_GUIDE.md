---
context_id: GUIDE_yaml_frontmatter
version: "1.1.0"
last_updated: 2026-01-04
status: active
owner: Architecture Team
audience: developers
language: ru
---

# Руководство по YAML Frontmatter

> Синтаксис и правила заполнения YAML metadata для файлов контекстов.

---

## Содержание

- [Что такое YAML Frontmatter](#что-такое-yaml-frontmatter)
- [Обязательные поля по типам контекстов](#обязательные-поля-по-типам-контекстов)
- [Справочник форматов полей](#справочник-форматов-полей)
- [Частые ошибки и исправления](#частые-ошибки-и-исправления)
- [Процесс валидации](#процесс-валидации)
- [Краткий справочник](#краткий-справочник)
- [Примеры](#примеры)

---

## Что такое YAML Frontmatter

YAML frontmatter — это метаданные в начале Markdown файла, заключённые между маркерами `---`:

```yaml
---
context_id: BC_catalog_main
version: "1.0.0"
type: business
---
```

**Ключевые правила YAML:**
- Отступы важны (используйте 2 пробела, НЕ табы)
- После двоеточия должен быть пробел: `key: value`
- Строки со спецсимволами должны быть в кавычках
- Списки начинаются с `-` (дефис + пробел)

---

## Обязательные поля по типам контекстов

| Тип | Обязательные поля | Опциональные |
|-----|-------------------|--------------|
| **BC** | `context_id`, `version`, `type`, `status`, `owners` | `health`, `migration` |
| **AC** | `context_id`, `version`, `type`, `based_on` | `health`, `migration` |
| **PC** | `context_id`, `version`, `type`, `based_on`, `compliance` | `dependencies`, `tests`, `health` |
| **IC** | `context_id`, `version`, `type`, `applies_to`, `enforcement` | `health` |
| **CCC** | `context_id`, `version`, `type`, `scope` | `health` |

---

## Справочник форматов полей

### `version` (string, в кавычках)

✅ **Правильно:**
```yaml
version: "1.0.0"
```

❌ **Неправильно:**
```yaml
version: 1.0.0   # Без кавычек - YAML парсит как float 1.0
```

### `context_id` (string)

**Паттерн:** `(BC|AC|PC|IC|CCC)_[a-zA-Z_]+`

✅ **Правильно:**
```yaml
context_id: BC_catalog_main
context_id: PC_catalog_productList
```

❌ **Неправильно:**
```yaml
context_id: BC-catalog-main        # Дефисы не разрешены
context_id: BC_{domain}_{name}     # Литеральные плейсхолдеры
```

### `type` (string)

**Валидные значения:** `business`, `analytical`, `programmatic`, `infrastructure`, `cross-cutting`

**Правило:** `type` должен соответствовать префиксу context_id:
- `BC_*` → `type: business`
- `AC_*` → `type: analytical`
- `PC_*` → `type: programmatic`

### `last_updated` (date, YYYY-MM-DD)

✅ **Правильно:**
```yaml
health:
  last_updated: 2025-12-21
```

❌ **Неправильно:**
```yaml
health:
  last_updated: YYYY-MM-DD  # Литеральный плейсхолдер
```

### `based_on` (вложенный объект)

```yaml
based_on:
  business_context:
    id: "BC_catalog_main"
    version: "1.0.0"
  analytic_context:
    id: "AC_catalog_filters"
    version: "1.0.0"
```

### `compliance` (массив, только PC)

**Обязательные IC для всех PC контекстов:**

```yaml
compliance:
  - IC_security_input_sanitization: "1.0.0"
  - IC_security_api_communication: "1.0.0"
  - IC_a11y_standards: "1.0.0"
  - IC_performance_budgets: "1.0.0"
  - IC_monitoring_logging: "1.0.0"
```

---

## Частые ошибки и исправления

| Ошибка | Причина | Исправление |
|--------|---------|-------------|
| `version: 1.0.0` | Без кавычек YAML парсит как float | `version: "1.0.0"` |
| Неверный отступ | Табы вместо пробелов | Используйте 2 пробела |
| `YYYY-MM-DD` | Литеральный плейсхолдер | Замените реальной датой |
| `BC_{domain}` | Плейсхолдер из шаблона | Замените реальным slug |
| Inline YAML | `{ key: value }` | Многострочный формат |

---

## Процесс валидации

1. **Pre-commit hook** запускает `validateContext.ts`
2. **Проверка синтаксиса YAML**
3. **Проверка обязательных полей**
4. **Проверка форматов** (context_id, version, date)
5. **Проверка compliance** (для PC)
6. **Health метрики** (coverage, staleness)

---

## Краткий справочник

### Чеклист перед коммитом

- [ ] YAML начинается с `---` на строке 1
- [ ] Все обязательные поля присутствуют
- [ ] `version` в кавычках: `"1.0.0"`
- [ ] Нет плейсхолдеров (`YYYY-MM-DD`, `{...}`)
- [ ] Отступы: 2 пробела (не табы)
- [ ] Для PC: все 5 IC в `compliance`

### Локальное тестирование

```bash
node specifications/tools/validateContext.ts --file=path/to/context.md
```

---

## Примеры

### BC Context

```yaml
---
context_id: BC_catalog_main
version: "1.0.0"
type: business
status: active
owners:
  - role: product_owner
    name: "Sarah Chen"
health:
  documentation_coverage: 100
  last_updated: 2025-12-21
---
```

### PC Context

```yaml
---
context_id: PC_catalog_productList
version: "1.0.0"
type: programmatic
based_on:
  business_context:
    id: "BC_catalog_main"
    version: "1.0.0"
  analytic_context:
    id: "AC_catalog_filters"
    version: "1.0.0"
health:
  test_coverage: 85
  last_updated: 2025-12-21
compliance:
  - IC_security_input_sanitization: "1.0.0"
  - IC_security_api_communication: "1.0.0"
  - IC_a11y_standards: "1.0.0"
  - IC_performance_budgets: "1.0.0"
  - IC_monitoring_logging: "1.0.0"
---
```

---

## Связанные документы

| Документ | Описание |
|----------|----------|
| [ERROR_MESSAGES_REFERENCE](ERROR_MESSAGES_REFERENCE.md) | Справочник ошибок валидации |
| [Templates](../templates/) | Шаблоны контекстов |
| [QUICK_REFERENCE](../QUICK_REFERENCE.md) | Краткий справочник |

---

**Последнее обновление:** 2026-01-04
**Владелец:** Architecture Team
**Статус:** Active
