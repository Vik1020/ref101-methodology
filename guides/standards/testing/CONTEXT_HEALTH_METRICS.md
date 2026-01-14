---
context_id: GUIDE_context_health_metrics
version: "1.1.0"
last_updated: 2026-01-04
status: active
owner: Quality Team
audience: developers, architects
language: ru
---

# Метрики здоровья контекстов

> Стандартизированные метрики качества для всех типов контекстов (BC, AC, PC, IC, CCC).

---

## Содержание

- [Назначение](#назначение)
- [Определения метрик](#определения-метрик)
- [Формула Health Score](#формула-health-score)
- [Автоматизация](#автоматизация)
- [Процесс ревью](#процесс-ревью)

---

## Назначение

Определяет стандартизированные health метрики для всех типов контекстов для отслеживания качества, поддерживаемости и готовности к production.

---

## Определения метрик

### 1. Documentation Coverage (0-100%)

**Что измеряет:** Полнота обязательных полей в метаданных контекста.

**Расчёт:**
```typescript
documentation_coverage = (filled_required_fields / total_required_fields) * 100
```

**Обязательные поля по типам:**
- **BC:** `context_id`, `version`, `goals`, `actors`, `scenarios`
- **AC:** `context_id`, `version`, `based_on`, `use_cases`, `api_contracts`
- **PC:** `context_id`, `version`, `based_on`, `dependencies`, `responsibility`
- **IC:** `context_id`, `version`, `category`, `enforcement`, `requirements`
- **CCC:** `context_id`, `version`, `scope`, `purpose`, `integration_points`

**Пороги:**
- 🟢 Green: ≥ 90%
- 🟡 Yellow: 70-89%
- 🔴 Red: < 70%

---

### 2. Test Coverage (0-100%)

**Что измеряет:** Процент кода, покрытого unit/integration тестами.

**Расчёт:** Использовать инструменты покрытия (Jest, Vitest)

```bash
npx vitest --coverage
```

**Пороги:**
- 🟢 Green: ≥ 80%
- 🟡 Yellow: 60-79%
- 🔴 Red: < 60%

**Примечания:**
- Применимо только к PC и CCC
- BC/AC/IC не имеют test coverage (только документация)

---

### 3. Dependency Health (green | yellow | red)

**Что измеряет:** Статус зависимостей (устаревшие, уязвимые).

**Расчёт:**
```bash
npm audit
npm outdated
```

**Статус:**
- 🟢 Green: Нет уязвимостей, все deps актуальны
- 🟡 Yellow: Minor/moderate уязвимости ИЛИ устаревшие deps
- 🔴 Red: High/critical уязвимости

---

### 4. Performance Score (0-100)

**Что измеряет:** Lighthouse performance score (только PC).

**Расчёт:**
```bash
npx lighthouse https://localhost:5173 --only-categories=performance
```

**Пороги:**
- 🟢 Green: ≥ 90
- 🟡 Yellow: 70-89
- 🔴 Red: < 70

**Применимо к:** Только PC компонентам

---

### 5. Accessibility Score (0-100)

**Что измеряет:** Lighthouse accessibility audit (только PC).

**Расчёт:**
```bash
npx lighthouse https://localhost:5173 --only-categories=accessibility
```

**Пороги:**
- 🟢 Green: 100
- 🟡 Yellow: 90-99
- 🔴 Red: < 90

**Применимо к:** Только PC компонентам

---

### 6. Security Audit (passed | failed | pending)

**Что измеряет:** Соответствие требованиям IC_security_*.

**Статус:**
- ✅ `passed`: Все проверки безопасности пройдены
- ❌ `failed`: Обнаружены нарушения безопасности
- ⏳ `pending`: Аудит ещё не выполнен

**Проверки:**
- Нет `dangerouslySetInnerHTML` без санитизации
- Нет захардкоженных секретов
- Только HTTPS endpoints
- Присутствует валидация ввода

---

### 7. Last Updated (YYYY-MM-DD)

**Что измеряет:** Дата последней модификации контекста.

**Источник:** Git commit date или ручной ввод

**Использование:** Отслеживание staleness

---

### 8. Staleness Days (0-365+)

**Что измеряет:** Дни с последнего обновления.

**Расчёт:**
```typescript
staleness_days = Math.floor((Date.now() - last_updated) / (1000 * 60 * 60 * 24))
```

**Пороги:**
- 🟢 Green: < 90 дней
- 🟡 Yellow: 90-180 дней
- 🔴 Red: > 180 дней

---

## Формула Health Score

**Overall Health:** Взвешенное среднее применимых метрик.

```typescript
health_score = (
  documentation_coverage * 0.2 +
  test_coverage * 0.3 +
  (dependency_health === 'green' ? 100 : dependency_health === 'yellow' ? 50 : 0) * 0.2 +
  performance_score * 0.15 +
  accessibility_score * 0.15
) / (applicable_metrics_count)
```

**Health Badge:**
- 🟢 Healthy: ≥ 80
- 🟡 At Risk: 60-79
- 🔴 Critical: < 60

---

## Автоматизация

### Скрипт сбора метрик

```typescript
// architect/tools/collectMetrics.ts
import { DocFile } from '../ContextLoader';

export const calculateHealth = (context: DocFile): ContextHealth => {
  const documentation_coverage = calculateDocCoverage(context);
  const test_coverage = getTestCoverage(context.path);
  const dependency_health = getDependencyHealth();
  const last_updated = context.data.health?.last_updated || getTodayDate();
  const staleness_days = calculateStaleness(last_updated);

  return {
    documentation_coverage,
    test_coverage,
    dependency_health,
    last_updated,
    staleness_days,
    performance_score: context.type === 'pc' ? getPerformanceScore() : undefined,
    accessibility_score: context.type === 'pc' ? getA11yScore() : undefined,
    security_audit: checkSecurityCompliance(context)
  };
};
```

---

## Процесс ревью

| Период | Действие |
|--------|----------|
| **Еженедельно** | Автоматическая проверка health |
| **Ежемесячно** | Ревью RED контекстов, создание action items |
| **Ежеквартально** | Ревью YELLOW контекстов |
| **Ежегодно** | Обновление определений health метрик |

---

## Связанные документы

| Документ | Описание |
|----------|----------|
| [TESTING_STRATEGY](TESTING_STRATEGY.md) | Стратегия тестирования |
| [CODE_REVIEW_CHECKLIST](CODE_REVIEW_CHECKLIST.md) | Чеклист code review |
| [PRIORITY_SYSTEM](PRIORITY_SYSTEM.md) | Система приоритетов |

---

**Последнее обновление:** 2026-01-04
**Владелец:** Quality Team
**Статус:** Active
