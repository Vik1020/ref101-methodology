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
      Add Global Validators section:
      - current_phase_has_history documentation
      - Backward compatibility notes
  - version: "2.0.0"
    date: 2026-01-06
    changes: |
      Major expansion with 5 new sections:
      - Типы валидации (расширенная классификация)
      - Точки контроля в процессе
      - Инструменты для валидации
      - Метрики качества validators
      - Оркестрация workflow
  - version: "1.0.0"
    date: 2026-01-06
    changes: Initial version with Content and Template-based validators
---

# Validators Guide

> **Для разработчиков PCC.** Как работают validators и как добавлять новые.

---

## Что такое Validators?

Validators проверяют **preconditions** (предусловия) перед переходом между фазами workflow.

**Архитектура (v2.3.0):**
- **RULES (ЧТО проверять)** → Templates (YAML frontmatter)
- **LOGIC (КАК проверять)** → Code (validators.ts)

```
Template                               Code
┌─────────────────────┐               ┌──────────────────────┐
│ validators:         │               │ bc_has_goals: () => {│
│   - id: bc_has_goals│ ────────────> │   // проверка        │
│     description: .. │               │ }                    │
└─────────────────────┘               └──────────────────────┘
```

---

## Типы Validators

### 1. Content Validators (существующие 32)

Проверяют **контент** из context (BC/AC/PC объектов).

**Сигнатура:**
```typescript
type PreconditionValidator = (
  state: WorkflowState,
  context?: AnyContext
) => PreconditionResult;
```

**Примеры:**
- `bc_has_goals` - проверяет `context.goals.length > 0`
- `ac_has_use_cases` - проверяет `context.use_cases.length > 0`
- `pc_test_coverage_80` - проверяет `context.health.testCoverage >= 80`

**Доступ:**
- ✅ `state.currentPhase`, `state.approvals`
- ✅ `context.goals`, `context.version`, `context.health`
- ❌ Phase Rules из template
- ❌ projectRoot, файловая система

---

### 2. Template-based Validators (новые)

Проверяют **файловую систему** или **Phase Rules** из template.

**Сигнатура:** Та же, но создаются через **factory function**.

**Примеры:**
- `output_file_exists` - проверяет существование файла из `output_file` Phase Rules

**Доступ:**
- ✅ Все из Content Validators
- ✅ Phase Rules (`output_file`, `validators`, `skip_allowed`)
- ✅ projectRoot, файловая система

**Реализация:** Factory function с closure (см. ниже).

---

## Как добавить новый Content Validator

### Шаг 1: Добавить в template

**Файл:** `templates/phases/BC_DELTA_TEMPLATE.md` (пример)

```yaml
validators:
  - id: bc_has_constraints  # NEW
    description: BC has defined constraints
  - id: bc_has_goals
    description: BC has defined goals
```

### Шаг 2: Реализовать логику

**Файл:** `tools/command-center/src/core/workflow/validators.ts`

```typescript
const PRECONDITION_VALIDATORS: Record<string, PreconditionValidator> = {
  // ...existing validators

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

**Готово!** TemplateParser автоматически прочитает validator из template, WorkflowEngine выполнит проверку.

---

## Как добавить новый Template-based Validator

### Пример: `output_file_exists`

**Особенность:** Нужен доступ к `projectRoot` и Phase Rules.

### Шаг 1: Добавить в template (как обычно)

```yaml
validators:
  - id: output_file_exists
    description: Output file exists at specified path
```

### Шаг 2: Создать factory function

**Файл:** `tools/command-center/src/core/workflow/validators.ts`

```typescript
export function createFileExistenceValidator(
  projectRoot: string,
  templateParser: TemplateParser
): PreconditionValidator {
  return (state: WorkflowState, context?: AnyContext): PreconditionResult => {
    // Получить Phase Rules из template
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

**Почему factory?** Closure "вшивает" `projectRoot` и `templateParser` в validator, сохраняя простую сигнатуру.

### Шаг 3: Зарегистрировать validator

**Файл:** Место инициализации (где создается WorkflowEngine)

```typescript
// Создать file validator
const fileValidator = createFileExistenceValidator(projectRoot, templateParser);

// Зарегистрировать в глобальном registry
PRECONDITION_VALIDATORS['output_file_exists'] = fileValidator;
```

**Готово!** Теперь validator доступен во всех phases.

---

## Debugging Validators

### Проверить, какие validators запускаются

```typescript
const validators = templateParser.getValidators('BC_DRAFT');
console.log(validators);
// [{ id: 'bc_has_goals', description: '...' }, ...]
```

### Вручную запустить validator

```typescript
const validator = PRECONDITION_VALIDATORS['bc_has_goals'];
const result = validator(state, context);
console.log(result);
// { passed: true } или { passed: false, reason: '...' }
```

### Посмотреть результаты в RELEASE файле

```yaml
phase_history:
  - phase: BC_DRAFT
    validators:
      bc_has_goals:
        status: passed  # passed | failed | skipped
        reason: null
```

---

## Best Practices

### 1. Validator должен быть **идемпотентным**

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

### 2. Validator должен возвращать **понятную причину** при ошибке

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

### 3. Validator должен быть **быстрым**

Validators вызываются часто. Избегать:
- Долгих I/O операций
- Сложных вычислений
- Внешних API calls

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

## Global Validators

> **Validators that apply to ALL phase transitions**, not just specific phases.

### `current_phase_has_history` (v2.4.0+)

**Purpose:** Ensures phase_history tracking is active for Progress Tracking feature.

**When applied:** Every transition (except initial RELEASE creation)

**Checks:**
- `phase_history` array exists in state
- Current phase has an entry in `phase_history`
- Entry has `entered_at` timestamp

**Implementation:**

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

**Backward compatibility:**
- If `phase_history` is undefined → passes (v2.3.0 and earlier)
- Only enforced when Progress Tracking is enabled

**Template location:** Global (not in any specific template)

---

## FAQ

**Q: Зачем разделять rules (template) и logic (code)?**
A: SSOT архитектура - rules меняются чаще (новые validators для фаз), logic стабильна.

**Q: Можно ли validator вызвать асинхронно?**
A: Нет, сигнатура синхронная. Для async используйте pre-checks перед workflow.

**Q: Как добавить validator только для одной фазы?**
A: Добавьте в template этой фазы. Validators не наследуются между фазами.

**Q: Что если validator не найден?**
A: Warning в console, но workflow не падает. Validator считается passed.

---

## Типы валидации (расширенная классификация)

> **Кроме Content и Template-based validators**, существуют другие подходы к валидации.

### Автоматические проверки (Скрипты/Программы)

**Что проверяют:**
- Структурные требования (наличие полей, форматы)
- Метрики кода (coverage, complexity, duplication)
- Файловая система (наличие файлов, структура директорий)
- Синтаксис и типы (TypeScript, YAML)
- Security (hardcoded secrets, XSS, SQL injection)

**Плюсы:**
- ✅ **Детерминированность** - одинаковый результат на одних данных
- ✅ **Скорость** - мгновенная проверка
- ✅ **Масштабируемость** - проверка любого объема
- ✅ **Стоимость** - бесплатно после разработки
- ✅ **Audit trail** - автоматическая фиксация результатов

**Минусы:**
- ❌ **Жесткость** - не адаптируется к контексту
- ❌ **Ограниченность** - только формальные проверки
- ❌ **Ложные срабатывания** - правило может не учитывать исключения
- ❌ **Maintenance** - нужно обновлять при изменении требований

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
- Качество формулировок (clear, concise, unambiguous)
- Трассируемость (AC Use Cases → PC tests)

**Плюсы:**
- ✅ **Контекстное понимание** - учитывает смысл, не только форму
- ✅ **Гибкость** - адаптируется к разным типам задач
- ✅ **Natural language** - работает с текстом "как есть"
- ✅ **Комплексная оценка** - может проверить "готовность" в целом

**Минусы:**
- ❌ **Недетерминированность** - разные результаты на одних данных (если temperature > 0)
- ❌ **Стоимость** - API calls (input + output tokens)
- ❌ **Скорость** - 2-10 секунд на запрос
- ❌ **False confidence** - может ошибаться, но уверенно

**Best practices для LLM-валидации:**
1. **Temperature = 0** - максимальная детерминированность
2. **Structured output** - JSON schema для парсинга ответа
3. **Clear criteria** - четкие критерии PASS/FAIL
4. **Context window** - не превышать 8K tokens для проверки
5. **Caching** - кэшировать prompts для скорости

### Ручная валидация (Human Approval)

**Что проверяют:**
- Бизнес-ценность (нужна ли эта фича?)
- Архитектурные решения (правильный ли подход?)
- UX/UI качество (удобно ли пользователю?)
- Политики и compliance (соответствие регуляторам)
- Стратегическое выравнивание (вписывается в roadmap?)

**Плюсы:**
- ✅ **Критическое мышление** - может оспорить предпосылки
- ✅ **Бизнес-контекст** - знает стратегию компании
- ✅ **Креативность** - может предложить альтернативы
- ✅ **Окончательное решение** - имеет authority

**Минусы:**
- ❌ **Субъективность** - разные люди → разные оценки
- ❌ **Скорость** - часы/дни на review
- ❌ **Масштабируемость** - ограничено рабочим временем
- ❌ **Burnout** - утомление от рутинных проверок

**Текущие approval points в WORKFLOW:**
```yaml
BC_delta  → Product Owner  # Бизнес-ценность
AC_delta  → Tech Lead      # Архитектура
PLAN      → Team           # Реалистичность оценок
QA        → QA Lead        # Качество тестирования
```

**Оптимизация ручной валидации:**
- Автоматизировать формальные проверки (освобождает время)
- LLM для предварительной оценки (highlight issues)
- Checklists для консистентности (уменьшает субъективность)
- Async reviews (не блокирует developer)

### Гибридные проверки

**Комбинация подходов:**

1. **Скрипт + Human fallback**
   ```typescript
   // Автоматическая проверка
   const autoResult = checkCoverage(context);
   if (autoResult.passed) return { passed: true };

   // Если failed → human review
   return {
     passed: false,
     reason: 'Coverage 75% < 80%. Request manual approval?',
     requiresHumanReview: true
   };
   ```

2. **Multi-stage validation**
   ```
   Stage 1: Fast scripts (< 1s)     → Структура OK?
   Stage 2: LLM pre-check (5s)      → Семантика OK?
   Stage 3: Human approval (hours)  → Бизнес-ценность OK?
   ```

---

## Точки контроля в процессе

### Классификация точек контроля

**1. Pre-condition (вход в процесс)**

**Цель:** Проверить готовность к началу

**Примеры:**
- BC_DRAFT → BC_APPROVED: `bc_has_goals`, `bc_has_actors`
- AC_DRAFT → AC_APPROVED: `ac_has_use_cases`, `ac_based_on_bc`

**Характер:** Блокирующие (cannot proceed if failed)

**2. In-process (во время выполнения)**

**Цель:** Мониторинг прогресса, ранняя детекция проблем

**Примеры:**
- PC_DEVELOPMENT: continuous linting, type checking
- QA_TESTING: test execution progress (10/100 tests passed)

**Характер:** Информационные (warnings, не блокируют)

**3. Post-condition (выход из процесса)**

**Цель:** Проверить корректность результата

**Примеры:**
- PC_REVIEW → IC_VALIDATION: `pc_test_coverage_80`, `pc_code_reviewed`
- QA_TESTING → APPLY_DELTAS: `qa_tests_passed`, `qa_coverage_met`

**Характер:** Блокирующие (качество gate)

**4. Retrospective (после завершения)**

**Цель:** Анализ качества процесса для улучшений

**Примеры:**
- DEPLOYED: сколько багов в production (за 30 дней)?
- Release: время от RELEASE до DEPLOYED (cycle time)?

**Характер:** Метрики для process improvement

### Точки контроля в WORKFLOW (diagram)

См. полную диаграмму в плане (секция "4. Точки контроля в процессе → B")

**Ключевые точки:**
- RELEASE: Post-conditions (release_has_problem, release_has_scope)
- BC_APPROVED: Approval required (Product Owner)
- AC_APPROVED: Approval required (Tech Lead)
- PLAN_FINALIZE: Approval required (Team)
- PC_DEVELOPMENT: In-process checks (ESLint, TypeScript)
- IC_VALIDATION: Pre-condition (pc_test_coverage_80)
- QA_TESTING: Approval required (QA Lead)
- DEPLOY: Retrospective metrics (production bugs, cycle time)

---

## Инструменты для валидации

### Для скриптовых проверок

**1. Type systems (TypeScript, Zod)**

```typescript
import { z } from 'zod';

const BCSchema = z.object({
  contextId: z.string().regex(/^BC_/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  goals: z.array(z.object({
    id: z.string(),
    description: z.string().min(10)
  })).min(1)  // ≥1 goal required
});

// Validator
bc_schema_valid: (_state, context) => {
  const result = BCSchema.safeParse(context);
  return {
    passed: result.success,
    reason: result.success ? undefined : result.error.message
  };
}
```

**2. Linters (ESLint, Prettier, yamllint)**
- Enforce coding standards
- Catch common mistakes
- Auto-fix where possible

**3. Static analysis (SonarQube, CodeQL)**
- Security vulnerabilities
- Code smells
- Complexity metrics

### Для ручной валидации

**1. Checklists (structured reviews)**

```yaml
BC_delta Review Checklist:
  Business Value:
    - [ ] Aligned with product strategy?
    - [ ] Clear ROI defined?
    - [ ] Customer pain point addressed?

  Goals:
    - [ ] All SMART (Specific, Measurable, Achievable)?
    - [ ] Prioritized (P0/P1/P2)?
    - [ ] No conflicts with existing goals?
```

**2. Review tools (GitHub PR, GitLab MR)**
- Inline comments на конкретные строки
- Discussions для обсуждения подходов
- Approve/Request changes для окончательного решения

**3. Templates для feedback**

См. пример в плане (секция "2. Инструменты для максимизации достоверности → C4")

---

## Метрики качества validators

### Типы ошибок валидации

**1. False Positives (Type I error)**
- Validator говорит FAIL, но на самом деле OK
- Блокирует разработку (developer frustration)
- Пример: lint rule слишком строгий

**Как минимизировать:**
- Настраиваемые thresholds (coverage: 80% → 70% for legacy)
- Escape hatches (disable rule with comment + reason)
- Regular review правил (remove obsolete)

**2. False Negatives (Type II error)**
- Validator говорит PASS, но на самом деле FAIL
- Пропускает баги в production (customer impact)
- Пример: regex для secrets не покрывает все форматы

**Как минимизировать:**
- Multiple layers (security: regex + SAST + manual)
- Continuous improvement (add rule when bug found)
- Post-mortems (analyze why validator missed issue)

**3. Flaky validators**
- Разные результаты на одних данных (недетерминированность)
- Подрывает доверие к системе
- Пример: LLM с temperature > 0

**Как минимизировать:**
- Temperature = 0 для LLM
- Seeded random для tests
- Retry with backoff для network-dependent

### Confusion Matrix

```
                   Actual
                PASS    FAIL
Predicted PASS   TP      FP (Type I)
         FAIL    FN      TN
              (Type II)
```

**Метрики:**
- **Precision** = TP / (TP + FP) - какой % FAIL действительно FAIL?
- **Recall** = TP / (TP + FN) - какой % реальных FAIL мы поймали?
- **F1 Score** = 2 * (Precision * Recall) / (Precision + Recall)

**Для validators стремимся:**
- **High Recall** (поймать все баги) → низкий FN
- **Acceptable Precision** (не слишком много ложных тревог) → низкий FP

---

## Оркестрация workflow

> **Кто вызывает следующий шаг процесса?** LLM, программа или человек?

### Текущий подход (v2.4.0): LLM-driven

**Архитектура:**
```
User Request → Claude (LLM) → RELEASE → BC → AC → ... → DEPLOY
                   ↓
              WorkflowEngine (validates transitions)
                   ↓
              phase_history (audit trail)
```

**Плюсы:**
- ✅ **Flexibility** - LLM понимает natural language инструкции
- ✅ **Autonomy** - сам решает, что делать дальше
- ✅ **Context awareness** - понимает бизнес-контекст

**Минусы:**
- ❌ **Недетерминированность** - может забыть шаги
- ❌ **Compliance risk** - может пропустить approval
- ❌ **Trust** - нужна валидация действий LLM

**Меры по митигации рисков:**

1. **Structured workflow (SSOT templates)**
   - LLM **не может** изменить порядок фаз (жесткий граф)
   - LLM **должен** соблюдать validators (WorkflowEngine блокирует)

2. **Audit trail (phase_history + transition_log)**
   ```yaml
   transition_log:
     - from: BC_DRAFT
       to: BC_APPROVED
       timestamp: 2026-01-05T11:00:00+03:00
       approval_by: user  # ОБЯЗАТЕЛЬНО для approval points
   ```

3. **Progress tracking in RELEASE file**
   - LLM **пишет** workflow_state, phase_history
   - PCC **читает** для UI display

### Альтернативные подходы

**Program-driven (PCC state machine):**
- Программа контролирует каждый шаг
- Гарантирует прохождение всех validators
- Менее гибкий, но более надежный

**Human-driven (manual checklists):**
- Человек решает каждый шаг
- Максимальный контроль, минимальная автоматизация
- Подходит для ad-hoc проектов

**Hybrid (рекомендация):**

| Компонент | Роль | Примеры |
|-----------|------|---------|
| **LLM** | Понимание intent, генерация контента | Написать BC goals |
| **PCC** | Enforcement workflow rules | Заблокировать переход если `bc_has_goals` failed |
| **Human** | Strategic decisions | Одобрить BC (бизнес-ценность) |
| **Scripts** | Formal checks | Проверить coverage >= 80% |

**Преимущества гибрида:**
- ✅ LLM генерирует контент (скорость + quality)
- ✅ PCC гарантирует compliance (validators + approvals)
- ✅ Human принимает strategic decisions (business value)
- ✅ Scripts проверяют formal requirements (coverage, lint)

---

## См. также

- [WORKFLOW.md](../WORKFLOW.md) - Workflow phases
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) - Testing approach
- [Phase Templates](../templates/phases/) - Template examples
