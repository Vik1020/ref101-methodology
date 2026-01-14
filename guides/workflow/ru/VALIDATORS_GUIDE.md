---
context_id: GUIDE_validators
version: "2.1.0"
type: guide
status: active
audience: developers
language: ru
owner: DevOps
last_updated: 2026-01-07
related_documents:
  - WORKFLOW.md
  - TESTING_STRATEGY.md
  - SYSTEM_PROMPT.md
changelog:
  - version: "2.1.0"
    date: 2026-01-07
    changes: |
      Добавлена секция глобальных валидаторов:
      - Документация current_phase_has_history
      - Заметки по обратной совместимости
  - version: "2.0.0"
    date: 2026-01-06
    changes: |
      Крупное расширение с 5 новыми секциями:
      - Типы валидации (расширенная классификация)
      - Точки контроля в процессе
      - Инструменты для валидации
      - Метрики качества validators
      - Оркестрация workflow
  - version: "1.0.0"
    date: 2026-01-06
    changes: Начальная версия с Content и Template-based валидаторами
---

# Руководство по валидаторам

> **Для разработчиков PCC.** Как работают валидаторы и как добавлять новые.

---

## Что такое валидаторы?

Валидаторы проверяют **предусловия (preconditions)** перед переходом между фазами workflow.

**Архитектура (v2.3.0):**
- **ПРАВИЛА (ЧТО проверять)** → Шаблоны (YAML frontmatter)
- **ЛОГИКА (КАК проверять)** → Код (validators.ts)

```
Шаблон                             Код
┌─────────────────────┐           ┌──────────────────────┐
│ validators:         │           │ bc_has_goals: () => {│
│   - id: bc_has_goals│ ────────> │   // проверка        │
│     description: .. │           │ }                    │
└─────────────────────┘           └──────────────────────┘
```

---

## Типы валидаторов

### 1. Content-валидаторы (существующие 32)

Проверяют **контент** из контекста (BC/AC/PC объектов).

**Сигнатура:**
```typescript
type PreconditionValidator = (
  state: WorkflowState,
  context?: AnyContext
) => PreconditionResult;
```

**Примеры:**
- `bc_has_goals` — проверяет `context.goals.length > 0`
- `ac_has_use_cases` — проверяет `context.use_cases.length > 0`
- `pc_test_coverage_80` — проверяет `context.health.testCoverage >= 80`

**Доступ:**
- ✅ `state.currentPhase`, `state.approvals`
- ✅ `context.goals`, `context.version`, `context.health`
- ❌ Phase Rules из шаблона
- ❌ projectRoot, файловая система

---

### 2. Template-based валидаторы (новые)

Проверяют **файловую систему** или **Phase Rules** из шаблона.

**Сигнатура:** Та же, но создаются через **factory-функцию**.

**Примеры:**
- `output_file_exists` — проверяет существование файла из `output_file` Phase Rules

**Доступ:**
- ✅ Всё из Content-валидаторов
- ✅ Phase Rules (`output_file`, `validators`, `skip_allowed`)
- ✅ projectRoot, файловая система

**Реализация:** Factory-функция с замыканием (см. ниже).

---

## Как добавить новый Content-валидатор

### Шаг 1: Добавить в шаблон

**Файл:** `templates/phases/BC_DELTA_TEMPLATE.md` (пример)

```yaml
validators:
  - id: bc_has_constraints  # НОВЫЙ
    description: BC has defined constraints
  - id: bc_has_goals
    description: BC has defined goals
```

### Шаг 2: Реализовать логику

**Файл:** `tools/command-center/src/core/workflow/validators.ts`

```typescript
const PRECONDITION_VALIDATORS: Record<string, PreconditionValidator> = {
  // ...существующие валидаторы

  bc_has_constraints: (_state, context) => {
    if (!context || !('constraints' in context)) {
      return { passed: false, reason: 'Not a BC context' };
    }
    const bc = context as BusinessContext;
    return {
      passed: bc.constraints.length > 0,
      reason: bc.constraints.length === 0
        ? 'BC must have at least one constraint'
        : undefined
    };
  },
};
```

### Шаг 3: Добавить описание

**Файл:** `tools/command-center/src/core/workflow/validators.ts` (функция `getPreconditionDescription`)

```typescript
const descriptions: Record<string, string> = {
  // ...
  bc_has_constraints: 'BC has defined constraints',
};
```

**Готово!** TemplateParser автоматически прочитает валидатор из шаблона, WorkflowEngine выполнит проверку.

---

## Как добавить новый Template-based валидатор

### Пример: `output_file_exists`

**Особенность:** Нужен доступ к `projectRoot` и Phase Rules.

### Шаг 1: Добавить в шаблон (как обычно)

```yaml
validators:
  - id: output_file_exists
    description: Output file exists at specified path
```

### Шаг 2: Создать factory-функцию

**Файл:** `tools/command-center/src/core/workflow/validators.ts`

```typescript
export function createFileExistenceValidator(
  projectRoot: string,
  templateParser: TemplateParser
): PreconditionValidator {
  return (state: WorkflowState, context?: AnyContext): PreconditionResult => {
    // Получить Phase Rules из шаблона
    const rules = templateParser.getPhaseRules(state.currentPhase);

    if (!rules?.output_file || !rules.output_file_mandatory) {
      return { passed: true };
    }

    // Подставить переменные {X.Y.Z}, {tool}, {feature}
    const filePath = resolveVariables(rules.output_file, context, projectRoot);

    // Проверить существование
    const exists = fs.existsSync(filePath);
    return {
      passed: exists,
      reason: exists ? undefined : `File not found: ${filePath}`
    };
  };
}
```

**Почему factory?** Замыкание «вшивает» `projectRoot` и `templateParser` в валидатор, сохраняя простую сигнатуру.

### Шаг 3: Зарегистрировать валидатор

**Файл:** Место инициализации (где создаётся WorkflowEngine)

```typescript
// Создать file-валидатор
const fileValidator = createFileExistenceValidator(projectRoot, templateParser);

// Зарегистрировать в глобальном реестре
PRECONDITION_VALIDATORS['output_file_exists'] = fileValidator;
```

**Готово!** Теперь валидатор доступен во всех фазах.

---

## Отладка валидаторов

### Проверить, какие валидаторы запускаются

```typescript
const validators = templateParser.getValidators('BC_DRAFT');
console.log(validators);
// [{ id: 'bc_has_goals', description: '...' }, ...]
```

### Вручную запустить валидатор

```typescript
const validator = PRECONDITION_VALIDATORS['bc_has_goals'];
const result = validator(state, context);
console.log(result);
// { passed: true } или { passed: false, reason: '...' }
```

### Посмотреть результаты в RELEASE-файле

```yaml
phase_history:
  - phase: BC_DRAFT
    validators:
      bc_has_goals:
        status: passed  # passed | failed | skipped
        reason: null
```

---

## Лучшие практики

### 1. Валидатор должен быть **идемпотентным**

Повторный вызов с теми же данными → тот же результат.

❌ **Плохо:**
```typescript
bc_approved: () => {
  const now = Date.now();
  return { passed: now % 2 === 0 }; // недетерминированно
}
```

✅ **Хорошо:**
```typescript
bc_approved: (state) => {
  return { passed: state.approvals.some(a => a.phase === 'BC_DRAFT') };
}
```

### 2. Валидатор должен возвращать **понятную причину** при ошибке

❌ **Плохо:**
```typescript
return { passed: false, reason: 'Failed' };
```

✅ **Хорошо:**
```typescript
return {
  passed: false,
  reason: `Test coverage (${coverage}%) must be >= 80%`
};
```

### 3. Валидатор должен быть **быстрым**

Валидаторы вызываются часто. Избегать:
- Долгих I/O-операций
- Сложных вычислений
- Внешних API-вызовов

### 4. Используйте **Type Guards**

```typescript
bc_has_goals: (_state, context) => {
  if (!context || !('goals' in context)) {
    return { passed: false, reason: 'Not a BC context' };
  }
  const bc = context as BusinessContext;
  // ...
}
```

---

## Глобальные валидаторы

> **Валидаторы, применяемые ко ВСЕМ переходам между фазами**, а не только к конкретным.

### `current_phase_has_history` (v2.4.0+)

**Назначение:** Гарантирует, что отслеживание phase_history активно для функции Progress Tracking.

**Когда применяется:** Каждый переход (кроме начального создания RELEASE)

**Проверки:**
- Массив `phase_history` существует в состоянии
- Текущая фаза имеет запись в `phase_history`
- Запись имеет метку времени `entered_at`

**Реализация:**

```typescript
current_phase_has_history: (state) => {
  const history = state.phase_history || [];
  const currentPhaseEntry = history.find(h => h.phase === state.currentPhase);

  if (!currentPhaseEntry) {
    return {
      passed: false,
      reason: `No history entry for current phase: ${state.currentPhase}`
    };
  }

  return { passed: true };
}
```

**Обратная совместимость:**
- Если `phase_history` не определён → проходит (v2.3.0 и ранее)
- Применяется только когда Progress Tracking включён

**Расположение в шаблоне:** Глобальный (не в конкретном шаблоне)

---

## FAQ

**В: Зачем разделять правила (шаблон) и логику (код)?**
О: Архитектура SSOT — правила меняются чаще (новые валидаторы для фаз), логика стабильна.

**В: Можно ли валидатор вызвать асинхронно?**
О: Нет, сигнатура синхронная. Для async используйте pre-checks перед workflow.

**В: Как добавить валидатор только для одной фазы?**
О: Добавьте в шаблон этой фазы. Валидаторы не наследуются между фазами.

**В: Что если валидатор не найден?**
О: Warning в консоли, но workflow не падает. Валидатор считается пройденным.

---

## Типы валидации (расширенная классификация)

> **Кроме Content и Template-based валидаторов** существуют другие подходы к валидации.

### Автоматические проверки (Скрипты/Программы)

**Что проверяют:**
- Структурные требования (наличие полей, форматы)
- Метрики кода (coverage, complexity, duplication)
- Файловая система (наличие файлов, структура директорий)
- Синтаксис и типы (TypeScript, YAML)
- Безопасность (hardcoded secrets, XSS, SQL injection)

**Плюсы:**
- ✅ **Детерминированность** — одинаковый результат на одних данных
- ✅ **Скорость** — мгновенная проверка
- ✅ **Масштабируемость** — проверка любого объёма
- ✅ **Стоимость** — бесплатно после разработки
- ✅ **Audit trail** — автоматическая фиксация результатов

**Минусы:**
- ❌ **Жёсткость** — не адаптируется к контексту
- ❌ **Ограниченность** — только формальные проверки
- ❌ **Ложные срабатывания** — правило может не учитывать исключения
- ❌ **Обслуживание** — нужно обновлять при изменении требований

**Примеры в PCC:**
```typescript
bc_has_goals          // Структура: goals.length > 0
pc_test_coverage_80   // Метрика: coverage >= 80%
output_file_exists    // FS: fs.existsSync(path)
```

### LLM-валидация (семантические проверки)

**Что проверяют:**
- Семантическая корректность (понятность, логичность)
- Полнота описаний (достаточно ли деталей)
- Консистентность между BC → AC → PC
- Качество формулировок (ясность, краткость, однозначность)
- Трассируемость (AC Use Cases → PC tests)

**Плюсы:**
- ✅ **Контекстное понимание** — учитывает смысл, не только форму
- ✅ **Гибкость** — адаптируется к разным типам задач
- ✅ **Естественный язык** — работает с текстом «как есть»
- ✅ **Комплексная оценка** — может проверить «готовность» в целом

**Минусы:**
- ❌ **Недетерминированность** — разные результаты на одних данных (если temperature > 0)
- ❌ **Стоимость** — API-вызовы (input + output токены)
- ❌ **Скорость** — 2-10 секунд на запрос
- ❌ **Ложная уверенность** — может ошибаться, но уверенно

**Лучшие практики для LLM-валидации:**
1. **Temperature = 0** — максимальная детерминированность
2. **Структурированный вывод** — JSON schema для парсинга ответа
3. **Чёткие критерии** — понятные критерии PASS/FAIL
4. **Контекстное окно** — не превышать 8K токенов для проверки
5. **Кэширование** — кэшировать промпты для скорости

### Ручная валидация (Human Approval)

**Что проверяют:**
- Бизнес-ценность (нужна ли эта фича?)
- Архитектурные решения (правильный ли подход?)
- UX/UI качество (удобно ли пользователю?)
- Политики и compliance (соответствие регуляторам)
- Стратегическое выравнивание (вписывается в roadmap?)

**Плюсы:**
- ✅ **Критическое мышление** — может оспорить предпосылки
- ✅ **Бизнес-контекст** — знает стратегию компании
- ✅ **Креативность** — может предложить альтернативы
- ✅ **Окончательное решение** — имеет полномочия

**Минусы:**
- ❌ **Субъективность** — разные люди → разные оценки
- ❌ **Скорость** — часы/дни на ревью
- ❌ **Масштабируемость** — ограничено рабочим временем
- ❌ **Выгорание** — утомление от рутинных проверок

**Текущие точки согласования в WORKFLOW:**
```yaml
BC_delta  → Product Owner  # Бизнес-ценность
AC_delta  → Tech Lead      # Архитектура
PLAN      → Team           # Реалистичность оценок
QA        → QA Lead        # Качество тестирования
```

**Оптимизация ручной валидации:**
- Автоматизировать формальные проверки (освобождает время)
- LLM для предварительной оценки (выделить проблемы)
- Чеклисты для консистентности (уменьшает субъективность)
- Асинхронные ревью (не блокирует разработчика)

### Гибридные проверки

**Комбинация подходов:**

1. **Скрипт + Human fallback**
   ```typescript
   // Автоматическая проверка
   const autoResult = checkCoverage(context);
   if (autoResult.passed) return { passed: true };

   // Если failed → ручное ревью
   return {
     passed: false,
     reason: 'Coverage 75% < 80%. Request manual approval?',
     requiresHumanReview: true
   };
   ```

2. **Многостадийная валидация**
   ```
   Стадия 1: Быстрые скрипты (< 1с)      → Структура OK?
   Стадия 2: LLM предпроверка (5с)       → Семантика OK?
   Стадия 3: Согласование человеком (ч)  → Бизнес-ценность OK?
   ```

---

## Точки контроля в процессе

### Классификация точек контроля

**1. Pre-condition (вход в процесс)**

**Цель:** Проверить готовность к началу

**Примеры:**
- BC_DRAFT → BC_APPROVED: `bc_has_goals`, `bc_has_actors`
- AC_DRAFT → AC_APPROVED: `ac_has_use_cases`, `ac_based_on_bc`

**Характер:** Блокирующие (нельзя продолжить при ошибке)

**2. In-process (во время выполнения)**

**Цель:** Мониторинг прогресса, ранняя детекция проблем

**Примеры:**
- PC_DEVELOPMENT: непрерывный линтинг, проверка типов
- QA_TESTING: прогресс выполнения тестов (10/100 тестов пройдено)

**Характер:** Информационные (предупреждения, не блокируют)

**3. Post-condition (выход из процесса)**

**Цель:** Проверить корректность результата

**Примеры:**
- PC_REVIEW → IC_VALIDATION: `pc_test_coverage_80`, `pc_code_reviewed`
- QA_TESTING → APPLY_DELTAS: `qa_tests_passed`, `qa_coverage_met`

**Характер:** Блокирующие (качественный гейт)

**4. Retrospective (после завершения)**

**Цель:** Анализ качества процесса для улучшений

**Примеры:**
- DEPLOYED: сколько багов в production (за 30 дней)?
- Release: время от RELEASE до DEPLOYED (cycle time)?

**Характер:** Метрики для улучшения процесса

### Точки контроля в WORKFLOW (диаграмма)

См. полную диаграмму в плане (секция «4. Точки контроля в процессе → B»)

**Ключевые точки:**
- RELEASE: Post-conditions (release_has_problem, release_has_scope)
- BC_APPROVED: Требуется согласование (Product Owner)
- AC_APPROVED: Требуется согласование (Tech Lead)
- PLAN_FINALIZE: Требуется согласование (Team)
- PC_DEVELOPMENT: Проверки в процессе (ESLint, TypeScript)
- IC_VALIDATION: Pre-condition (pc_test_coverage_80)
- QA_TESTING: Требуется согласование (QA Lead)
- DEPLOY: Ретроспективные метрики (production bugs, cycle time)

---

## Инструменты для валидации

### Для скриптовых проверок

**1. Системы типов (TypeScript, Zod)**

```typescript
import { z } from 'zod';

const BCSchema = z.object({
  contextId: z.string().regex(/^BC_/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  goals: z.array(z.object({
    id: z.string(),
    description: z.string().min(10)
  })).min(1)  // ≥1 goal обязательно
});

// Валидатор
bc_schema_valid: (_state, context) => {
  const result = BCSchema.safeParse(context);
  return {
    passed: result.success,
    reason: result.success ? undefined : result.error.message
  };
}
```

**2. Линтеры (ESLint, Prettier, yamllint)**
- Обеспечивают стандарты кодирования
- Выявляют типичные ошибки
- Автоисправление где возможно

**3. Статический анализ (SonarQube, CodeQL)**
- Уязвимости безопасности
- Запахи кода
- Метрики сложности

### Для ручной валидации

**1. Чеклисты (структурированные ревью)**

```yaml
Чеклист ревью BC_delta:
  Бизнес-ценность:
    - [ ] Соответствует стратегии продукта?
    - [ ] Определён чёткий ROI?
    - [ ] Решает проблему клиента?

  Цели:
    - [ ] Все SMART (Конкретные, Измеримые, Достижимые)?
    - [ ] Приоритезированы (P0/P1/P2)?
    - [ ] Нет конфликтов с существующими целями?
```

**2. Инструменты ревью (GitHub PR, GitLab MR)**
- Inline-комментарии к конкретным строкам
- Дискуссии для обсуждения подходов
- Approve/Request changes для окончательного решения

**3. Шаблоны для обратной связи**

См. пример в плане (секция «2. Инструменты для максимизации достоверности → C4»)

---

## Метрики качества валидаторов

### Типы ошибок валидации

**1. False Positives (Ошибка I рода)**
- Валидатор говорит FAIL, но на самом деле OK
- Блокирует разработку (фрустрация разработчика)
- Пример: lint-правило слишком строгое

**Как минимизировать:**
- Настраиваемые пороги (coverage: 80% → 70% для legacy)
- Escape hatches (отключить правило с комментарием + причиной)
- Регулярный пересмотр правил (удалить устаревшие)

**2. False Negatives (Ошибка II рода)**
- Валидатор говорит PASS, но на самом деле FAIL
- Пропускает баги в production (влияние на клиента)
- Пример: regex для секретов не покрывает все форматы

**Как минимизировать:**
- Несколько уровней (security: regex + SAST + ручная проверка)
- Непрерывное улучшение (добавлять правило при обнаружении бага)
- Post-mortem (анализировать почему валидатор пропустил проблему)

**3. Нестабильные валидаторы (Flaky)**
- Разные результаты на одних данных (недетерминированность)
- Подрывает доверие к системе
- Пример: LLM с temperature > 0

**Как минимизировать:**
- Temperature = 0 для LLM
- Seeded random для тестов
- Повторные попытки с экспоненциальной задержкой для сетезависимых

### Матрица ошибок (Confusion Matrix)

```
                   Фактически
               PASS    FAIL
Предсказано PASS   TP      FP (I рода)
           FAIL    FN      TN
                (II рода)
```

**Метрики:**
- **Precision** = TP / (TP + FP) — какой % FAIL действительно FAIL?
- **Recall** = TP / (TP + FN) — какой % реальных FAIL мы поймали?
- **F1 Score** = 2 * (Precision * Recall) / (Precision + Recall)

**Для валидаторов стремимся:**
- **Высокий Recall** (поймать все баги) → низкий FN
- **Приемлемый Precision** (не слишком много ложных тревог) → низкий FP

---

## Оркестрация workflow

> **Кто вызывает следующий шаг процесса?** LLM, программа или человек?

### Текущий подход (v2.4.0): LLM-driven

**Архитектура:**
```
Запрос пользователя → Claude (LLM) → RELEASE → BC → AC → ... → DEPLOY
                          ↓
                     WorkflowEngine (валидирует переходы)
                          ↓
                     phase_history (audit trail)
```

**Плюсы:**
- ✅ **Гибкость** — LLM понимает инструкции на естественном языке
- ✅ **Автономность** — сам решает, что делать дальше
- ✅ **Осведомлённость о контексте** — понимает бизнес-контекст

**Минусы:**
- ❌ **Недетерминированность** — может забыть шаги
- ❌ **Риск compliance** — может пропустить согласование
- ❌ **Доверие** — нужна валидация действий LLM

**Меры по снижению рисков:**

1. **Структурированный workflow (SSOT-шаблоны)**
   - LLM **не может** изменить порядок фаз (жёсткий граф)
   - LLM **должен** соблюдать валидаторы (WorkflowEngine блокирует)

2. **Audit trail (phase_history + transition_log)**
   ```yaml
   transition_log:
     - from: BC_DRAFT
       to: BC_APPROVED
       timestamp: 2026-01-05T11:00:00+03:00
       approval_by: user  # ОБЯЗАТЕЛЬНО для точек согласования
   ```

3. **Отслеживание прогресса в RELEASE-файле**
   - LLM **пишет** workflow_state, phase_history
   - PCC **читает** для отображения в UI

### Альтернативные подходы

**Program-driven (PCC state machine):**
- Программа контролирует каждый шаг
- Гарантирует прохождение всех валидаторов
- Менее гибкий, но более надёжный

**Human-driven (ручные чеклисты):**
- Человек решает каждый шаг
- Максимальный контроль, минимальная автоматизация
- Подходит для ad-hoc проектов

**Гибридный (рекомендация):**

| Компонент | Роль | Примеры |
|-----------|------|---------|
| **LLM** | Понимание намерения, генерация контента | Написать BC goals |
| **PCC** | Обеспечение правил workflow | Заблокировать переход если `bc_has_goals` failed |
| **Human** | Стратегические решения | Одобрить BC (бизнес-ценность) |
| **Scripts** | Формальные проверки | Проверить coverage >= 80% |

**Преимущества гибрида:**
- ✅ LLM генерирует контент (скорость + качество)
- ✅ PCC гарантирует compliance (валидаторы + согласования)
- ✅ Human принимает стратегические решения (бизнес-ценность)
- ✅ Scripts проверяют формальные требования (coverage, lint)

---

## См. также

- [WORKFLOW.md](../WORKFLOW.md) — Фазы workflow
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) — Подход к тестированию
- [Phase Templates](../templates/phases/) — Примеры шаблонов
