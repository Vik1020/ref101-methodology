# Глоссарий SCCU

**Namespace:** sccu
**Version:** 2.0.0
**Last Updated:** 2026-01-17

Единый источник истины (SSOT) для терминов методологии SCCU (Self-Contained Context Unit).

---

## Наследование

> Этот глоссарий расширяет: [`meta/GLOSSARY.md`](../../meta/GLOSSARY.md)
>
> Базовые элементы (State, Actor, Tool, Action, Entity, Artifact, Fact, Rule) определены в мета-глоссарии.

---

## Быстрый поиск

- [Основные концепции](#основные-концепции)
- [Типы контекстов](#типы-контекстов)
- [Аббревиатуры](#аббревиатуры)
- [Технические термины](#технические-термины)
- [Метрики и измерения](#метрики-и-измерения)
- [Процессы разработки](#процессы-разработки)

---

## Основные концепции

### SCCU (Self-Contained Context Unit)
**Самодостаточная единица контекста**

Изолированная единица разработки, содержащая полную документацию в 4 слоях (BC/AC/PC/IC). Решает проблему "Context Window" в LLM-driven development.

**Пример:** Компонент `ProductCard` с его `context.md`, кодом, тестами и зависимостями.

**Зачем:** Чтобы LLM мог загрузить 1-2 SCCU и иметь весь необходимый контекст без потери информации.

---

### Vibe Coding
**Философия разработки с сохранением контекста**

Подход к разработке, где каждая строка кода трассируется к бизнес-цели через 4 слоя Truth (BC→AC→PC→IC). Акцент на когнитивных окнах (Cognitive Windows) вместо традиционных паттернов (MVC, MVVM).

**Принципы:**
- Код не противоречит аналитике (PC follows AC)
- Изоляция контекстов (duplication > coupling)
- Explicit dependencies (no hidden imports)

---

### The Four Layers of Truth
**Четыре слоя истины**

Вертикальная иерархия контекстов, описывающая систему от бизнес-целей до кода:

1. **BC (Business Context)** - "Why" - Зачем нужна функция
2. **AC (Analytical Context)** - "What" - Что она делает (логика, API)
3. **PC (Programmatic Context)** - "How" - Как реализована (код)
4. **IC (Infrastructure Context)** - "Non-Functional" - Нефункциональные требования

**Plus:** CCC (Cross-Cutting Context) - горизонтальные решения.

---

### Context Window Problem
**Проблема контекстного окна**

Проблема: По мере роста проекта LLM теряет контекст, стоимость добавления features растет.

**Решение:** SCCU - разбиение приложения на самодостаточные единицы с полной документацией.

**До SCCU:**
```
Project size ↑ → LLM context loss ↑ → Feature cost ↑
```

**После SCCU:**
```
Load 1-2 SCCU → Full context → Predictable feature cost
```

---

## Типы контекстов

### BC (Business Context)
**Бизнес-контекст**

Документирует бизнес-цели, actors (пользователи), сценарии использования и бизнес-правила.

**Аудитория:** Product Owner, Stakeholders
**Формат:** `BC_{domain}_{name}` (e.g., `BC_catalog_main`)
**Ключевые секции:** Goals, Actors, Scenarios, Business Rules
**Пример:** "Пользователь должен видеть каталог продуктов с фильтрами"

---

### AC (Analytical Context)
**Аналитический контекст**

Документирует use cases, API контракты, data models, sequence diagrams.

**Аудитория:** System Architect, QA, LLM
**Формат:** `AC_{domain}_{name}` (e.g., `AC_catalog_filters`)
**Ключевые секции:** Use Cases, API Contracts, Data Models
**Пример:** "GET /api/products возвращает массив Product[]"

---

### PC (Programmatic Context)
**Программный контекст**

Документирует React компоненты, TypeScript interfaces, hooks, services.

**Аудитория:** Developer, LLM
**Формат:** `PC_{section}_{slug}` (e.g., `PC_catalog_productList`)
**Ключевые секции:** Responsibility, Props, Scenarios, Compliance, Edge Cases
**Пример:** `const ProductList: React.FC<Props>` с context.md

---

### IC (Infrastructure Context)
**Инфраструктурный контекст**

Документирует нефункциональные требования (security, accessibility, performance, monitoring).

**Аудитория:** Platform Engineer, Security Team, QA
**Формат:** `IC_{category}_{name}` (e.g., `IC_security_input_sanitization`)
**Ключевые секции:** Purpose, Requirements (Mandatory/Recommended/Optional), Validation, Examples
**Применение:** Горизонтально ко всем PC контекстам

**Примеры IC:**
- IC_security_input_sanitization
- IC_security_api_communication
- IC_a11y_standards
- IC_performance_budgets
- IC_monitoring_logging

---

### CCC (Cross-Cutting Context)
**Кросс-функциональный контекст**

Документирует переиспользуемые решения для горизонтальных concerns (error handling, theming, analytics).

**Аудитория:** System Architect, Developer
**Формат:** `CCC_{domain}_{name}` (e.g., `CCC_error_boundary`)
**Ключевые секции:** Purpose, Scope, Integration Points, API, Usage
**Природа:** Реализация IC требований в виде переиспользуемого кода

**Примеры CCC:**
- CCC_error_boundary (реализует IC_monitoring_logging)
- CCC_theme_provider (управление темой)
- CCC_analytics_tracker (отслеживание событий)

---

### PA (Project Asset)
**Проектный артефакт**

Централизованная техническая спецификация для критичных компонентов проекта (API, database, env configs).

**Аудитория:** System Architect, DevOps, Backend/Frontend Developers
**Формат:** `PA_{category}_{name}` (e.g., `PA_api_internal`, `PA_database_schema`)
**Ключевые секции:** Schema/Specification, Usage, Versioning Rules, Migration Guide
**Хранение:** `specifications/reference/assets/PA_*/pa.md`

**Примеры PA:**
- PA_api_internal - OpenAPI 3.1 spec для внутреннего REST API
- PA_database_schema - PostgreSQL DDL, migrations, ER diagram
- PA_env_config - Environment variables templates (.env.example)
- PA_storage_objects - S3 bucket structure, lifecycle policies
- PA_cache_strategy - Redis key naming, TTL policies

**Зачем:**
- Single source of truth для технических спецификаций
- Версионирование API/DB schemas (SemVer)
- Генерация публичной документации (PDC)
- Синхронизация AC (аналитика) и PC (код)

---

### PDC (Public Documentation Context)
**Публичная документация**

Документация для внешних разработчиков, generated from Project Assets (PA).

**Аудитория:** External Developers, Partners, API Consumers
**Формат:** `PDC_{name}` (e.g., `PDC_api_reference`, `PDC_sdk_documentation`)
**Ключевые секции:** Publication, Audience, Quickstart, Examples, Maintenance
**Хранение:** `specifications/reference/public-docs/PDC_*/pdc.md`

**Примеры PDC:**
- PDC_api_reference - Swagger UI/ReDoc docs (generated from PA_api_internal)
- PDC_sdk_documentation - JavaScript/TypeScript SDK docs
- PDC_webhooks - Webhook events specification

**Publication Formats:**
- Swagger UI (interactive API docs)
- ReDoc (readable API docs)
- TypeDoc (TypeScript SDK reference)
- Markdown (guides, tutorials)

**Generation Workflow:**
1. PA (technical spec) → Filter x-internal
2. Build static docs (Swagger UI, TypeDoc)
3. Deploy to https://docs.example.com/

---

### EPA (Essential Project Assets)
**Обязательные проектные артефакты**

Список из 10 обязательных + 8 опциональных PA контекстов для типичного web-проекта.

**Обязательные (10):**
1. PA_api_internal - Internal REST API
2. PA_api_external - Public REST API
3. PA_database_schema - Database schema
4. PA_storage_objects - Object storage (S3)
5. PA_cache_strategy - Caching strategy (Redis)
6. PA_auth_system - Authentication & authorization
7. PA_env_config - Environment configuration
8. PA_deployment - Deployment configs (K8s, Helm)
9. PA_monitoring - Monitoring & alerting
10. PA_backup_recovery - Backup & disaster recovery

**Опциональные (8):**
- PA_message_queue - Message queue (RabbitMQ, Kafka)
- PA_search_engine - Search engine (Elasticsearch)
- PA_cdn_strategy - CDN configuration
- PA_rate_limiting - Rate limiting rules
- PA_email_templates - Email templates
- PA_websockets - WebSocket API spec
- PA_cron_jobs - Scheduled jobs
- PA_feature_flags - Feature flag configuration

**Validation:**
```bash
npm run validate-epa  # Check all mandatory PA exist
```

---

## Аббревиатуры

### A11y
**Accessibility** - Доступность

Сокращение от "a" + 11 букв + "y". Способность приложения быть использованным людьми с ограниченными возможностями.

**Примеры:**
- Screen reader support
- Keyboard navigation
- Color contrast
- ARIA attributes

**См. также:** IC_a11y_standards, WCAG 2.1

---

### ARIA
**Accessible Rich Internet Applications**

Набор HTML атрибутов для улучшения доступности динамических веб-приложений.

**Примеры атрибутов:**
- `aria-label` - текстовая метка для screen readers
- `aria-expanded` - состояние раскрытия элемента
- `aria-live` - объявление динамических изменений
- `role` - семантическая роль элемента

---

### CSP
**Content Security Policy**

HTTP заголовок для предотвращения XSS атак путем ограничения источников контента.

**Пример:**
```
Content-Security-Policy: script-src 'self' https://cdn.example.com
```

---

### CSRF
**Cross-Site Request Forgery**

Атака, когда злонамеренный сайт заставляет браузер пользователя выполнить нежелательное действие на доверенном сайте.

**Защита:** CSRF tokens, SameSite cookies

---

### LCP
**Largest Contentful Paint**

Core Web Vital метрика - время до рендеринга самого большого visible элемента.

**Target:** < 2.5 секунды
**См. также:** IC_performance_budgets

---

### FID
**First Input Delay**

Core Web Vital метрика - время от первого interaction до ответа браузера.

**Target:** < 100 миллисекунд
**См. также:** IC_performance_budgets

---

### CLS
**Cumulative Layout Shift**

Core Web Vital метрика - сумма всех неожиданных сдвигов layout.

**Target:** < 0.1
**См. также:** IC_performance_budgets

---

### PII
**Personally Identifiable Information**

Персональные данные, идентифицирующие человека (email, phone, SSN, etc.).

**Правило:** НИКОГДА не логировать PII без редакции.

---

### XSS
**Cross-Site Scripting**

Атака, когда злонамеренный скрипт выполняется в контексте доверенного сайта.

**Защита:** Input sanitization, DOMPurify
**См. также:** IC_security_input_sanitization

---

## Технические термины

### Dependency Budget
**Бюджет зависимостей**

Ограничение на количество импортов в SCCU (обычно ≤5).

**Цель:** Предотвратить "spaghetti code", поддержать изоляцию контекстов.

**Правило:** Если компонент превышает бюджет → рефакторинг или split на sub-contexts.

---

### Enforcement Level
**Уровень обязательности**

Определяет, насколько строго требование IC context.

**Уровни:**
- **Mandatory** - нарушение блокирует deployment
- **Recommended** - нарушение создает warning
- **Optional** - нарушение логируется для visibility

---

### Health Metrics
**Метрики здоровья**

8 показателей качества контекста:
1. Documentation Coverage (≥90%)
2. Test Coverage (≥80%)
3. Dependency Health (green/yellow/red)
4. Performance Score (≥90)
5. Accessibility Score (100)
6. Security Audit (passed/failed)
7. Last Updated (YYYY-MM-DD)
8. Staleness Days (<90)

---

### Compliance
**Соответствие требованиям**

Список IC контекстов, которым соответствует PC компонент.

**Формат в context.md:**
```yaml
compliance:
  - IC_security_input_sanitization: "1.0.0"
  - IC_a11y_standards: "1.0.0"
```

**Исключения:** Через поле `compliance_exceptions` с обоснованием.

---

### Sanitization
**Санитизация**

Процесс очистки user input от потенциально опасного контента.

**Инструменты:**
- **DOMPurify** - для HTML
- **Zod/Yup** - для schema validation

**Правило:** Sanitize on output, validate on input.

---

### Code Splitting
**Разделение кода**

Техника деления bundle на chunks, которые загружаются по требованию.

**Методы:**
- Route-based (lazy load pages)
- Component-based (lazy load heavy components)
- Vendor splitting (separate react, ui libraries)

**Цель:** Уменьшить initial bundle size < 100 KB gzipped.

---

### Lazy Loading
**Ленивая загрузка**

Отложенная загрузка ресурсов (images, components) до момента, когда они нужны.

**Примеры:**
```html
<img src="..." loading="lazy" />
```
```typescript
const HeavyComponent = lazy(() => import('./Heavy'));
```

---

### Virtual Scrolling
**Виртуальный скроллинг**

Техника рендеринга только видимых элементов списка вместо всех элементов.

**Библиотеки:** react-window, react-virtualized
**Когда использовать:** Списки > 100 items

---

## Метрики и измерения

### Bundle Size
**Размер бандла**

Размер JavaScript/CSS файлов после сборки и сжатия (gzip).

**Лимиты (из IC_performance_budgets):**
- Component: < 50 KB gzipped
- Page: < 200 KB gzipped
- Initial JS: < 100 KB gzipped

---

### Test Coverage
**Покрытие тестами**

Процент кода, покрытого unit/integration тестами.

**Target:** ≥80% для PC/CCC контекстов

**Инструменты:** Jest --coverage, Vitest --coverage

---

### Documentation Coverage
**Покрытие документацией**

Процент заполненных обязательных полей в context.md.

**Target:** ≥90%

**Calculation:**
```
coverage = (filled_fields / required_fields) * 100
```

---

### Staleness Days
**Дни устаревания**

Количество дней с последнего обновления контекста.

**Target:** < 90 дней
**Warning:** 90-180 дней
**Critical:** > 180 дней

---

## Процессы разработки

### SemVer (Semantic Versioning)
**Семантическое версионирование**

Схема версионирования `MAJOR.MINOR.PATCH`.

**Для контекстов:**
- **MAJOR (x.0.0)** - Breaking changes (BC: цель изменилась, AC: API удален, PC: public interface изменился)
- **MINOR (0.x.0)** - New features (BC: новый сценарий, AC: опциональное поле, PC: новый опциональный prop)
- **PATCH (0.0.x)** - Bug fixes (все слои: фиксы, рефакторинг, typos)

---

### Breaking Change
**Ломающее изменение**

Изменение, несовместимое с предыдущей версией (требует обновления зависимых контекстов).

**Примеры:**
- Удаление prop из компонента
- Изменение типа возвращаемого значения
- Удаление API endpoint

**Процесс:** Migration guide обязателен

---

### Deprecation
**Устаревание**

Процесс поэтапного вывода функционала из использования.

**Фазы:**
1. **v1.0.0** - Добавить `@deprecated` notice с console.warn
2. **v2.0.0** - Оставить deprecated API с warnings
3. **v3.0.0** - Удалить deprecated код

---

### Rollback
**Откат**

Возврат к предыдущей версии при critical error в production.

**Процедура:**
```bash
git revert {commit-sha}
npm install {package}@{previous-version}
npm run deploy -- --version={previous}
```

---

### CUT (Context-Unit Test)
**Контекстно-юнитный тест**

Тест одного PC unit в изоляции (все зависимости mock).

**Цель:** Проверить внутреннюю логику компонента.

---

### CIT (Context-Integration Test)
**Контекстно-интеграционный тест**

Тест PC unit + Logic Hook вместе (только network/API mock).

**Цель:** Проверить конкретный Use Case из AC.

**Трассируемость:**
```typescript
/**
 * TestCaseID: TC_filter_price
 * BasedOn: AC_catalog_filters:UC01
 */
test('filters products by price', () => { ... })
```

---

## Domain-Specific термины

### UI Kit
**Набор UI компонентов**

Стандартизированные компоненты для интерактивных элементов.

**Обязательные компоненты:**
- Button
- Input
- TextArea
- Badge
- CollapsibleSection

**Правило:** НЕ использовать raw HTML tags (`<button>`, `<input>`).

---

### Logic Layer
**Слой бизнес-логики**

Custom hooks (`use[ContextName]`), инкапсулирующие всю бизнес-логику.

**Правило:** UI компоненты = "dumb" (чистая презентация), логика в hooks.

**Пример:**
```typescript
const useProducts = () => {
  const [products, setProducts] = useState([]);
  // ... бизнес-логика
  return useMemo(() => ({ products, ... }), [products]);
};
```

---

### Atomic Updates
**Атомарные обновления**

Отправка изменений только конкретного узла, а не всего дерева данных.

**Пример:**
```typescript
// BAD: Отправляем весь tree
PATCH /api/tree { ...wholeTree }

// GOOD: Только измененный узел
PATCH /api/tree/nodes/123 { name: "New Name" }
```

---

### Skeleton Loading
**Скелетная загрузка**

Паттерн: сначала загружаем lightweight иерархию, затем детали по требованию.

**Пример:**
```typescript
// 1. Fetch hierarchy (fast)
GET /api/tree → [{ id, name, children: [...] }]

// 2. Fetch details on expand (lazy)
GET /api/tree/nodes/123/details → { description, metadata }
```

---

## Примеры использования

### Как читать Context ID

```
IC_security_input_sanitization
│  │        │     │
│  │        │     └── name (описание)
│  │        └──────── domain (категория)
│  └────────────────── layer (BC/AC/PC/IC/CCC)
└────────────────────── префикс типа
```

**Другие примеры:**
- `BC_catalog_main` - Business Context для каталога
- `AC_catalog_filters` - Analytical Context для фильтров
- `PC_catalog_productList` - Programmatic Context для списка продуктов
- `CCC_error_boundary` - Cross-Cutting для обработки ошибок

---

### Как понять, когда использовать CCC

**Используйте CCC когда:**
1. Shared functionality (ошибки, аналитика, тема)
2. Реализация IC требований
3. Cross-component communication
4. Non-feature logic

**НЕ используйте CCC когда:**
- Функционал специфичен для одного компонента
- Простая утилита (используйте `src/utils/`)
- Бизнес-логика (используйте custom hook)

---

## Связанные документы

- [meta/GLOSSARY.md](../meta/GLOSSARY.md) - Базовые элементы мета-методологии
- [SYSTEM_PROMPT.md](core/SYSTEM_PROMPT.md) - Главная инструкция
- [WORKFLOW.md](core/WORKFLOW.md) - Спецификация workflow

---

## Changelog

### v2.0.0 - 2026-01-17
- Мигрировано из core/GLOSSARY.md в namespaces/sccu/
- Добавлена секция наследования от meta/GLOSSARY.md
- Обновлены ссылки на связанные документы

### v1.1.0 - 2025-12-23
- Добавлены PA, PDC, EPA контексты
- Расширены примеры использования

### v1.0.0 - 2025-12-21
- Создан GLOSSARY.md
- Добавлены все основные термины и аббревиатуры
