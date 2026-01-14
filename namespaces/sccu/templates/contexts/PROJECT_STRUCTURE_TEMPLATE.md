# Рекомендуемая структура нового проекта

**Версия:** 1.0.0
**Последнее обновление:** 2025-12-21

---

## Назначение

Этот шаблон описывает рекомендуемую структуру для НОВОГО проекта, создаваемого на основе спецификации ref101-knowledge-base.

⚠️ **ВАЖНО:** Не создавайте новый проект внутри `ref101-knowledge-base/`. Создайте отдельную папку для вашего приложения.

---

## Стандарты именования папок

**Обязательный стандарт для папок документации:**

| Папка | Содержит | Стандарт |
|-------|----------|----------|
| `docs/business/` | BC контексты | ✅ Всегда `business/` |
| `docs/analytics/` | AC контексты | ✅ Всегда `analytics/` (НЕ `analytical/`) |
| `docs/programmatic/` | PC контексты (опционально) | ✅ Всегда `programmatic/` |

**Примечание:** Тип контекста в YAML остается `type: analytical` для AC контекстов, но папка называется `analytics/`.

---

## Рекомендуемая структура

```
my-new-project/                    # Ваш проект (НЕ в ref101-knowledge-base/)
├── docs/                          # Ваши BC и AC контексты
│   ├── business/
│   │   ├── BC_feature1_main.md
│   │   └── BC_feature2_main.md
│   └── analytics/
│       ├── AC_feature1_api.md
│       └── AC_feature2_filters.md
├── src/                           # Ваш код
│   ├── components/
│   │   ├── Feature1/
│   │   │   ├── context.md         # PC контекст
│   │   │   ├── Feature1.tsx
│   │   │   ├── Feature1.test.tsx
│   │   │   └── types.ts
│   │   └── Feature2/
│   │       ├── context.md
│   │       ├── Feature2.tsx
│   │       ├── Feature2.test.tsx
│   │       └── types.ts
│   ├── hooks/                     # Custom hooks (бизнес-логика)
│   │   ├── useFeature1.ts
│   │   └── useFeature2.ts
│   ├── services/                  # API calls, external integrations
│   │   ├── api.ts
│   │   └── yandexCloud.ts
│   ├── utils/                     # Helper functions
│   │   ├── sanitize.ts
│   │   └── validators.ts
│   └── App.tsx
├── specifications/                # Копия правил (read-only reference)
│   └── [скопировано из ref101-knowledge-base]
├── .claude/                       # Claude LLM конфигурация
│   ├── prompts/
│   │   └── system.md              # Правила работы с проектом
│   └── state/
│       └── workflow.json          # Состояние workflow
├── package.json
├── tsconfig.json
├── vite.config.ts                 # или webpack/next.config
├── .gitignore
└── README.md
```

---

## Создание нового проекта

### Шаг 1: Создайте новую папку

```bash
# НЕ внутри ref101-knowledge-base!
cd C:\Git
mkdir my-new-project
cd my-new-project
```

### Шаг 2: Инициализируйте проект

```bash
# Инициализация npm
npm init -y

# Установите базовые зависимости
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react

# Установите инструменты валидации (из ref101-knowledge-base)
npm install -D tsx js-yaml chalk glob @types/js-yaml @types/node
```

### Шаг 3: Скопируйте спецификацию и инструменты

```bash
# Копируем спецификацию как reference
cp -r ../ref101-knowledge-base/specifications .

# Копируем инструменты валидации
# (уже включены в specifications/tools/)

# Копируем Claude конфигурацию
cp -r ../ref101-knowledge-base/.claude .
```

### Шаг 4: Создайте структуру проекта

```bash
# Создаем папки для контекстов
mkdir -p docs/business docs/analytics

# Создаем папки для кода
mkdir -p src/components src/hooks src/services src/utils
```

### Шаг 5: Обновите package.json

Добавьте scripts из ref101-knowledge-base для валидации:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "validate-context": "tsx specifications/tools/validateContext.ts",
    "validate-all-contexts": "tsx specifications/tools/validateContext.ts --all",
    "check-compliance": "tsx specifications/tools/checkCompliance.ts",
    "check-compliance:all": "tsx specifications/tools/checkCompliance.ts --all",
    "collect-metrics": "tsx specifications/tools/collectMetrics.ts",
    "collect-metrics:all": "tsx specifications/tools/collectMetrics.ts --all",
    "traceability": "tsx specifications/tools/traceability.ts",
    "traceability:all": "tsx specifications/tools/traceability.ts --all",
    "generate-context": "tsx specifications/tools/generateContext.ts"
  }
}
```

---

## Workflow разработки в новом проекте

### Phase 1: Business Context Delta (BC)

1. Создайте файл в `docs/releases/v{X.Y.Z}/BC_delta_[domain].md`
2. Используйте шаблон `specifications/templates/phases/BC_DELTA_TEMPLATE.md`
3. Опишите:
   - Изменения (added, modified, deprecated, removed)
   - Бизнес-цели (Goals)
   - Действующих лиц (Actors)
   - Сценарии использования (Scenarios)

### Phase 2: Analytical Context Delta (AC)

1. Создайте файл в `docs/releases/v{X.Y.Z}/AC_delta_[domain].md`
2. Используйте шаблон `specifications/templates/phases/AC_DELTA_TEMPLATE.md`
3. Опишите:
   - Use Cases (UC01, UC02...)
   - API контракты
   - Data Models
   - Связь с BC_delta

### Phase 3: Programmatic Context (PC)

1. Создайте компонент в `src/components/[Feature]/`
2. Создайте `context.md` с помощью:
   ```bash
   npm run generate-context -- --type PC --name Feature
   ```
3. Реализуйте код согласно AC
4. Укажите в context.md:
   - `based_on` → ссылки на BC и AC
   - `compliance` → все 5 обязательных IC

### Phase 4: Validation

```bash
# Валидация одного контекста
npm run validate-context -- --file src/components/Feature/context.md

# Проверка compliance
npm run check-compliance -- --context PC_feature_main

# Сбор метрик здоровья
npm run collect-metrics:all

# Проверка трассируемости BC → AC → PC
npm run traceability:all
```

---

## Обязательные Infrastructure Contexts (IC)

Каждый PC контекст ДОЛЖЕН декларировать compliance со всеми 5 IC:

```yaml
compliance:
  - IC_security_input_sanitization: "1.0.0"    # P0 - DOMPurify, валидация
  - IC_security_api_communication: "1.0.0"     # P0 - HTTPS, env vars
  - IC_a11y_standards: "1.0.0"                 # P0 - WCAG 2.1 AA
  - IC_performance_budgets: "1.0.0"            # P0 - Bundle <50KB, LCP <2.5s
  - IC_monitoring_logging: "1.0.0"             # P0 - Error tracking
```

Документация по IC находится в `specifications/infrastructure/`

---

## Пример минимального проекта

### docs/business/BC_hello_main.md

```yaml
---
context_id: BC_hello_main
version: "1.0.0"
type: business
---

# Business Context: Hello Feature

## Goals
- Приветствовать пользователя при входе на сайт

## Actors
- **User** - любой посетитель сайта

## Scenarios
- S01: Пользователь открывает главную страницу
- S02: Система отображает приветственное сообщение

## Business Rules
- BR01: Приветствие должно быть персонализированным (если пользователь авторизован)
```

### src/components/Hello/context.md

```yaml
---
context_id: PC_hello_greeting
version: "1.0.0"
type: programmatic
based_on:
  business_context: { id: "BC_hello_main", version: "1.0.0" }
compliance:
  - IC_security_input_sanitization: "1.0.0"
  - IC_security_api_communication: "1.0.0"
  - IC_a11y_standards: "1.0.0"
  - IC_performance_budgets: "1.0.0"
  - IC_monitoring_logging: "1.0.0"
health:
  test_coverage: 85
  last_updated: "2025-12-21"
---

# Programmatic Context: Hello Greeting Component

## Responsibility
Отображает приветственное сообщение пользователю.

## Props
```typescript
interface HelloProps {
  userName?: string;
}
```

## IC Compliance Evidence
- **IC_security_input_sanitization**: userName санитизируется через DOMPurify
- **IC_a11y_standards**: Использует semantic HTML, aria-label
- **IC_performance_budgets**: Bundle size: 2KB
```

### src/components/Hello/Hello.tsx

```tsx
import DOMPurify from 'dompurify';

interface HelloProps {
  userName?: string;
}

export const Hello = ({ userName }: HelloProps) => {
  const sanitizedName = userName
    ? DOMPurify.sanitize(userName)
    : 'Guest';

  return (
    <div role="banner" aria-label="Welcome message">
      <h1>Hello, {sanitizedName}!</h1>
    </div>
  );
};
```

---

## Полезные команды

```bash
# Генерация нового контекста
npm run generate-context -- --type BC --name feature_main
npm run generate-context -- --type AC --name feature_api
npm run generate-context -- --type PC --name feature_component

# Валидация
npm run validate-all-contexts
npm run check-compliance:all

# Метрики
npm run collect-metrics:all

# Трассируемость
npm run traceability:all
```

---

## Дополнительные ресурсы

- [specifications/SYSTEM_PROMPT.md](../SYSTEM_PROMPT.md) - Правила для LLM
- [specifications/architecture/01_PHILOSOPHY.md](../architecture/01_PHILOSOPHY.md) - Философия SCCU
- [specifications/guides/standards/development/CODE_REVIEW_CHECKLIST.md](../guides/standards/development/CODE_REVIEW_CHECKLIST.md) - Code review
- [specifications/examples/](../examples/) - Примеры реализации

---

**Версия:** 1.0.0
**Статус:** 🟢 Active
**Последнее обновление:** 2025-12-21
