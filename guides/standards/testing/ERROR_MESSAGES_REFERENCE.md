---
context_id: GUIDE_error_messages
version: "1.1.0"
last_updated: 2026-01-04
status: active
owner: Architecture Team
audience: developers
language: ru
---

# Справочник сообщений об ошибках валидации

> Полный справочник ошибок validateContext.ts с инструкциями по исправлению.

---

## Как использовать

1. **Найдите ошибку** в разделах ниже
2. **Прочитайте причину**
3. **Следуйте инструкции** по исправлению
4. **Перезапустите валидацию**

```bash
node specifications/tools/validateContext.ts --file=path/to/context.md
```

---

## Содержание

- [Ошибки файла и Frontmatter](#ошибки-файла-и-frontmatter)
- [Ошибки формата Version и ID](#ошибки-формата-version-и-id)
- [Ошибки Type и обязательных полей](#ошибки-type-и-обязательных-полей)
- [Ошибки валидации ссылок](#ошибки-валидации-ссылок)
- [Ошибки Compliance (PC контексты)](#ошибки-compliance-pc-контексты)
- [Ошибки Health метрик](#ошибки-health-метрик)
- [Предупреждения (неблокирующие)](#предупреждения-неблокирующие)

---

## Ошибки файла и Frontmatter

### "No YAML frontmatter found"

**Причина:** Файл не имеет YAML frontmatter блока вверху.

**Исправление:**
```yaml
---
context_id: BC_your_context
version: "1.0.0"
type: business
status: active
owners:
  - role: product_owner
    name: "Your Name"
---

# Business Context: Your Context

...содержимое...
```

**Требования:**
- Должен начинаться с `---` на строке 1
- YAML контент между маркерами `---`
- Без пробелов перед дефисами

---

### "Invalid YAML"

**Причина:** Синтаксические ошибки YAML.

**Типичные причины:**
- Неверный отступ (табы вместо пробелов)
- Отсутствует двоеточие после имени поля
- Незакрытые кавычки

**Исправление:**
```yaml
# ❌ Неверно: Отсутствует двоеточие
context_id BC_catalog_main

# ✅ Правильно:
context_id: BC_catalog_main

# ❌ Неверно: Таб
based_on:
	business_context:  # ← Таб

# ✅ Правильно: 2 пробела
based_on:
  business_context:  # ← 2 пробела
```

---

## Ошибки формата Version и ID

### "Invalid version format"

**Сообщение:**
```
version: Invalid version format: 1.0.0 (expected: "1.0.0" with quotes)
```

**Причина:** Версия без кавычек. YAML парсит `1.0.0` как float `1.0`.

**Исправление:**
```yaml
# ❌ Неверно:
version: 1.0.0

# ✅ Правильно:
version: "1.0.0"
```

---

### "Invalid date format: YYYY-MM-DD"

**Причина:** Литеральный плейсхолдер из шаблона.

**Исправление:**
```yaml
# ❌ Неверно:
health:
  last_updated: YYYY-MM-DD

# ✅ Правильно:
health:
  last_updated: 2025-12-21
```

**Как получить дату:**
- Linux/Mac: `date +%Y-%m-%d`
- Windows: `Get-Date -Format "yyyy-MM-dd"`

---

### "Invalid context_id format"

**Причина:** Плейсхолдер или недопустимые символы.

**Валидный формат:** `(BC|AC|PC|IC|CCC)_[a-zA-Z_]+`

**Исправление:**
```yaml
# ❌ Неверно:
context_id: BC_{domain}_{name}
context_id: BC-catalog-main
context_id: catalog_main

# ✅ Правильно:
context_id: BC_catalog_main
context_id: PC_catalog_productList
```

---

## Ошибки Type и обязательных полей

### "Missing required field"

**Причина:** Отсутствует обязательное поле.

**Обязательные поля по типам:**

| Тип | Обязательные поля |
|-----|-------------------|
| BC | `context_id`, `version`, `type`, `status`, `owners` |
| AC | `context_id`, `version`, `type`, `based_on` |
| PC | `context_id`, `version`, `type`, `based_on`, `compliance` |
| IC | `context_id`, `version`, `type`, `applies_to`, `enforcement` |
| CCC | `context_id`, `version`, `type`, `scope` |

---

### "Invalid type"

**Причина:** Недопустимое значение `type`.

**Валидные значения:** `business`, `analytical`, `programmatic`, `infrastructure`, `cross-cutting`

**Исправление:**
```yaml
# ❌ Неверно:
type: Business  # Заглавная буква
type: bc  # Аббревиатура

# ✅ Правильно:
type: business
```

---

## Ошибки валидации ссылок

### "Missing id or version in business_context"

**Причина:** В `based_on.business_context` отсутствует `id` или `version`.

**Исправление:**
```yaml
# ❌ Неверно:
based_on:
  business_context:
    id: "BC_catalog_main"
    # version отсутствует!

# ✅ Правильно:
based_on:
  business_context:
    id: "BC_catalog_main"
    version: "1.0.0"
```

---

### "Missing id or version in analytic_context"

**Исправление:**
```yaml
based_on:
  business_context:
    id: "BC_catalog_main"
    version: "1.0.0"
  analytic_context:
    id: "AC_catalog_filters"
    version: "1.0.0"
```

---

## Ошибки Compliance (PC контексты)

### "PC contexts MUST declare IC compliance"

**Причина:** PC контекст без поля `compliance`.

**Исправление:**
```yaml
compliance:
  - IC_security_input_sanitization: "1.0.0"
  - IC_security_api_communication: "1.0.0"
  - IC_a11y_standards: "1.0.0"
  - IC_performance_budgets: "1.0.0"
  - IC_monitoring_logging: "1.0.0"
```

---

### "Missing mandatory IC compliance"

**Причина:** Отсутствует один из 5 обязательных IC.

**Обязательные IC:**
1. `IC_security_input_sanitization`
2. `IC_security_api_communication`
3. `IC_a11y_standards`
4. `IC_performance_budgets`
5. `IC_monitoring_logging`

---

## Ошибки Health метрик

### "Test coverage below mandatory threshold"

**Сообщение:**
```
health.test_coverage: 65% < mandatory (80%) for PC contexts
```

**Причина:** PC контексты требуют ≥ 80% test coverage.

**Исправление:**
1. Написать больше тестов
2. Запустить: `npm run test:coverage`
3. Обновить `health.test_coverage` реальным значением

---

## Предупреждения (неблокирующие)

### "Dependency budget exceeded"

**Сообщение:**
```
⚠️ dependencies: Dependency budget exceeded: 8/7
```

**Рекомендация:** Рефакторинг на ≤7 зависимостей или использование CCC facade.

---

### "Context stale for X days"

**Причина:** Контекст не обновлялся > 90 дней.

**Исправление:**
1. Проверить актуальность контекста
2. Обновить `health.last_updated` сегодняшней датой

---

## Таблица быстрого поиска ошибок

| Ключевое слово | Раздел | Быстрое исправление |
|----------------|--------|---------------------|
| "No frontmatter" | File & Frontmatter | Добавить `---` блок |
| "Invalid YAML" | File & Frontmatter | Проверить отступы |
| "Invalid version" | Version & ID | Добавить кавычки: `"1.0.0"` |
| "YYYY-MM-DD" | Version & ID | Заменить реальной датой |
| "Invalid context_id" | Version & ID | Формат: `BC_[slug]` |
| "Missing field" | Type & Required | Добавить поле |
| "Invalid type" | Type & Required | lowercase: `business` |
| "Missing id/version" | References | Добавить оба поля |
| "Missing compliance" | Compliance | Добавить 5 IC |
| "Test coverage" | Health | Написать тесты до 80% |

---

## Связанные документы

| Документ | Описание |
|----------|----------|
| [YAML_FRONTMATTER_GUIDE](YAML_FRONTMATTER_GUIDE.md) | Руководство по YAML |
| [Templates](../templates/) | Шаблоны контекстов |
| [QUICK_REFERENCE](../QUICK_REFERENCE.md) | Краткий справочник |

---

**Последнее обновление:** 2026-01-04
**Владелец:** Architecture Team
**Статус:** Active
