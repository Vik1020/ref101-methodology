---
context_id: GUIDE_testing_strategy
version: "2.2.0"
last_updated: 2026-01-04
status: active
owner: QA Team
audience: developers
language: ru
---

# Стратегия тестирования

> Тесты — мост между **Analytical Context (AC)** и **Programmatic Context (PC)**. Этот документ определяет требования к тестированию, паттерны и лучшие практики.

---

## Содержание

- [1. Трассируемость](#1-трассируемость)
- [2. Типы тестов](#2-типы-тестов)
- [3. Требования к покрытию](#3-требования-к-покрытию)
- [4. Стратегии мокирования](#4-стратегии-мокирования)
- [5. Примеры по типам контекстов](#5-примеры-по-типам-контекстов)
- [6. Организация тестов](#6-организация-тестов)
- [7. Ответственность LLM](#7-ответственность-llm)
- [8. Claude Self-Testing Protocol](#8-claude-self-testing-protocol)
- [9. CSP-Lite для CLI/Web инструментов](#9-csp-lite-для-cliweb-инструментов)
- [10. Чеклист тестирования](#10-чеклист-тестирования)

---

## 1. Трассируемость

Каждый файл тестов ДОЛЖЕН декларировать, какой AC Use Case он проверяет для полной трассируемости.

### Формат

```typescript
/**
 * ContextID: PC_{section}_{slug}
 * TestCaseID: TC_{test_name}
 * BasedOn: AC_{domain}_{name}:UC{number}
 */
test('should {expected behavior}', () => { ... })
```

### Пример

```typescript
/**
 * ContextID: PC_catalog_productList
 * TestCaseID: TC_filter_by_price
 * BasedOn: AC_catalog_filters:UC01
 */
test('should filter products by price range', () => {
  // Реализация теста
});
```

### Преимущества

- **Трассируемость:** Знаем, какое бизнес-требование покрывает тест
- **Анализ влияния:** Находим затронутые тесты при изменении AC
- **Документация:** Тесты документируют реализованные Use Cases
- **LLM контекст:** LLM может загрузить релевантный AC при написании тестов

---

## 2. Типы тестов

### Context-Unit Tests (CUT)

**Цель:** Проверить единичный PC юнит в полной изоляции.

**Scope:** Один компонент/хук/сервис
**Мокирование:** ВСЕ зависимости (хуки, сервисы, внешние библиотеки)
**Задача:** Тестировать внутреннюю логику компонента и обработку props

**Когда использовать:**
- Тестирование рендеринга UI компонентов
- Тестирование state management хуков
- Тестирование утилитарных функций
- Быстрая обратная связь (выполняется за миллисекунды)

**Пример:**

```typescript
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

/**
 * ContextID: PC_shared_ui_Button
 * TestCaseID: TC_button_renders
 * BasedOn: AC_ui_kit:UC01
 */
describe('Button Component (CUT)', () => {
  test('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('applies variant className', () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  test('handles onClick event', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  test('disables button when loading', () => {
    render(<Button isLoading>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

### Context-Integration Tests (CIT)

**Цель:** Проверить PC юнит + логический хук вместе (конкретный Use Case из AC).

**Scope:** Компонент + Хук + Бизнес-логика
**Мокирование:** ТОЛЬКО сетевой/API слой (рекомендуется MSW)
**Задача:** Проверить реализацию AC Use Case end-to-end

**Когда использовать:**
- Тестирование пользовательских flow
- Тестирование data fetching + рендеринга
- Тестирование отправки форм
- Верификация AC Use Cases

**Пример:**

```typescript
// __tests__/ProductList.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { ProductList } from '../ProductList';

// Mock API server
const server = setupServer(
  http.get('/api/products', () => {
    return HttpResponse.json([
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 },
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * ContextID: PC_catalog_productList
 * TestCaseID: TC_load_products
 * BasedOn: AC_catalog_main:UC01
 */
describe('ProductList Component (CIT)', () => {
  test('loads and displays products from API', async () => {
    render(<ProductList />);

    // Начальное состояние загрузки
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Ожидание загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  /**
   * TestCaseID: TC_filter_by_price
   * BasedOn: AC_catalog_filters:UC02
   */
  test('filters products by price range', async () => {
    const user = userEvent.setup();
    render(<ProductList />);

    await waitFor(() => screen.getByText('Product 1'));

    // Применение фильтра по цене
    const minPriceInput = screen.getByLabelText('Min Price');
    await user.type(minPriceInput, '150');

    // Только Product 2 должен быть виден
    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  /**
   * TestCaseID: TC_handle_api_error
   * BasedOn: AC_catalog_main:UC03
   */
  test('displays error message when API fails', async () => {
    server.use(
      http.get('/api/products', () => {
        return HttpResponse.error();
      })
    );

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
    });
  });
});
```

---

## 3. Требования к покрытию

### Минимальные целевые показатели покрытия

| Тип контекста | Unit Tests (CUT) | Integration Tests (CIT) | Общее покрытие |
|---------------|------------------|-------------------------|----------------|
| **PC (Components)** | ≥60% | ≥40% | ≥80% |
| **PC (Hooks)** | ≥80% | ≥20% | ≥80% |
| **PC (Services)** | ≥70% | ≥30% | ≥80% |
| **CCC** | ≥70% | ≥30% | ≥80% |
| **BC/AC/IC** | N/A (документация) | N/A | N/A |

### Что тестировать

**ОБЯЗАТЕЛЬНО тестировать (P0):**
- ✅ Все AC Use Cases (CIT обязателен)
- ✅ Happy path пользовательских flow
- ✅ Состояния ошибок (API failures, ошибки валидации)
- ✅ Edge cases (пустые данные, null значения)
- ✅ Критическая бизнес-логика

**ЖЕЛАТЕЛЬНО тестировать (P1):**
- ✅ Loading состояния
- ✅ Доступность (keyboard navigation, ARIA)
- ✅ Валидация форм
- ✅ State management (useState, useReducer)

**ХОРОШО бы тестировать (P2):**
- ✅ Визуальная регрессия (Chromatic, Percy)
- ✅ Производительность (время рендеринга)
- ✅ i18n переводы

### Что НЕ тестировать

**НЕ тестировать:**
- ❌ Внутренности сторонних библиотек (React, lodash)
- ❌ Детали реализации (названия внутренних state переменных)
- ❌ CSS стилизацию (если не критична для функционала)
- ❌ Browser APIs (уже протестированы производителями браузеров)

---

## 4. Стратегии мокирования

### Мокирование зависимостей (CUT)

**Принцип:** Мокировать все внешние зависимости для unit тестов.

**Примеры:**

```typescript
// Мокирование кастомного хука
vi.mock('@/hooks/useProducts', () => ({
  useProducts: vi.fn(() => ({
    products: [{ id: 1, name: 'Test Product' }],
    isLoading: false,
    error: null,
  }))
}));

// Мокирование внешней библиотеки
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

// Мокирование сервиса
vi.mock('@/services/api', () => ({
  fetchProducts: vi.fn(() => Promise.resolve([{ id: 1 }])),
}));
```

---

### Мокирование API (CIT)

**Принцип:** Мокировать только сетевой слой, позволить бизнес-логике работать.

**Рекомендуется:** MSW (Mock Service Worker)

```typescript
// __mocks__/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json([
      { id: 1, name: 'Product 1', price: 100 },
    ]);
  }),

  http.post('/api/products', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 123, ...body },
      { status: 201 }
    );
  }),

  http.delete('/api/products/:id', ({ params }) => {
    return new HttpResponse(null, { status: 204 });
  }),
];

// __mocks__/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Настройка в тестах:**

```typescript
import { server } from '../__mocks__/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

### Мокирование Context Providers (CCC)

**Принцип:** Обернуть компонент в тестовые провайдеры.

```typescript
// __tests__/utils/test-utils.tsx
import { ThemeProvider } from '@/reference/cross-cutting/ccc_theme_provider';
import { ErrorBoundary } from '@/reference/cross-cutting/ccc_error_boundary';

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <ErrorBoundary>
        {ui}
      </ErrorBoundary>
    </ThemeProvider>
  );
};

// Использование в тестах
renderWithProviders(<MyComponent />);
```

---

## 5. Примеры по типам контекстов

### Тестирование BC (Business Context)

**BC контексты — только документация** — тесты не нужны.

**Валидация:** Убедиться, что цели BC реализованы в AC/PC.

---

### Тестирование AC (Analytical Context)

**AC контексты — только документация** — тесты не нужны.

**Валидация:** Каждый AC Use Case ДОЛЖЕН иметь соответствующий CIT тест(ы).

**Чеклист:**
```markdown
AC_catalog_filters:
- [ ] UC01: Filter by price → TC_filter_by_price (CIT)
- [ ] UC02: Filter by category → TC_filter_by_category (CIT)
- [ ] UC03: Reset filters → TC_reset_filters (CIT)
```

---

### Тестирование PC (Components)

**Пример: Компонент формы**

```typescript
// ProductForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from '../ProductForm';

/**
 * ContextID: PC_catalog_productForm
 * TestCaseID: TC_form_validation
 * BasedOn: AC_catalog_create:UC01
 */
describe('ProductForm (CUT)', () => {
  test('validates required fields', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<ProductForm onSubmit={handleSubmit} />);

    // Submit без заполнения полей
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Показаны ошибки валидации
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/price is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('submits valid data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<ProductForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/name/i), 'Test Product');
    await user.type(screen.getByLabelText(/price/i), '99.99');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Test Product',
      price: 99.99,
    });
  });
});
```

---

### Тестирование PC (Hooks)

**Пример: Хук загрузки данных**

```typescript
// useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from '../useProducts';
import { server } from '../__mocks__/server';
import { http, HttpResponse } from 'msw';

/**
 * ContextID: PC_catalog_useProducts
 * TestCaseID: TC_hook_fetch_products
 * BasedOn: AC_catalog_main:UC01
 */
describe('useProducts Hook (CIT)', () => {
  test('fetches and returns products', async () => {
    const { result } = renderHook(() => useProducts());

    // Начальное состояние
    expect(result.current.isLoading).toBe(true);
    expect(result.current.products).toEqual([]);

    // Ожидание данных
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  test('handles fetch error', async () => {
    server.use(
      http.get('/api/products', () => HttpResponse.error())
    );

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.products).toEqual([]);
  });
});
```

---

### Тестирование IC (Infrastructure)

**IC контексты определяют требования** — compliance тестируется в PC тестах.

**Пример: Тестирование соответствия IC_a11y_standards**

```typescript
/**
 * ContextID: PC_catalog_productCard
 * TestCaseID: TC_accessibility_keyboard
 * BasedOn: IC_a11y_standards
 */
test('is keyboard accessible', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(<ProductCard onBuy={handleClick} />);

  const buyButton = screen.getByRole('button', { name: /buy now/i });

  // Tab к кнопке
  await user.tab();
  expect(buyButton).toHaveFocus();

  // Активация через Enter
  await user.keyboard('{Enter}');
  expect(handleClick).toHaveBeenCalled();
});
```

---

### Тестирование CCC (Cross-Cutting)

**Пример: Error Boundary**

```typescript
// ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

/**
 * ContextID: CCC_error_boundary
 * TestCaseID: TC_error_boundary_catches
 * BasedOn: IC_monitoring_logging
 */
describe('ErrorBoundary (CUT)', () => {
  // Подавление console.error для теста
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('catches and displays error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Working component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });
});
```

---

## 6. Организация тестов

### Структура директорий

```
src/
├── components/
│   ├── ProductList/
│   │   ├── ProductList.tsx
│   │   ├── ProductList.module.css
│   │   ├── context.md
│   │   └── __tests__/
│   │       ├── ProductList.test.tsx         (CUT)
│   │       └── ProductList.integration.test.tsx  (CIT)
├── hooks/
│   ├── useProducts/
│   │   ├── useProducts.ts
│   │   ├── context.md
│   │   └── __tests__/
│   │       └── useProducts.test.ts  (CIT - хуки тестируются с реальной логикой)
├── reference/cross-cutting/
│   ├── ccc_error_boundary/
│   │   ├── ErrorBoundary.tsx
│   │   ├── ccc.md
│   │   └── __tests__/
│   │       └── ErrorBoundary.test.tsx  (CUT)
└── __mocks__/
    ├── handlers.ts    (MSW API моки)
    └── server.ts      (MSW server setup)
```

### Конвенции именования файлов

- **CUT:** `{ComponentName}.test.tsx`
- **CIT:** `{ComponentName}.integration.test.tsx`
- **Hook:** `{hookName}.test.ts`
- **Mocks:** `__mocks__/{module}.ts`

---

## 7. Ответственность LLM

Когда LLM генерирует код для новой функции:

### Шаг 1: Прочитать AC Use Cases
```
Загрузить AC_{domain}_{name}.md
Извлечь все Use Cases (UC01, UC02, ...)
```

### Шаг 2: Сгенерировать реализацию PC
```
Создать компонент/хук/сервис
Реализовать бизнес-логику
```

### Шаг 3: Сгенерировать скелет тестов (ОБЯЗАТЕЛЬНО)
```typescript
// Автогенерация файла тестов с AC трассируемостью

/**
 * ContextID: PC_{generated}
 * TestCaseID: TC_{generated}
 * BasedOn: AC_{domain}_{name}:UC01
 */
describe('{ComponentName}', () => {
  // TODO: Реализовать тест для UC01
  test('should {UC01 goal}', () => {
    // Реализация теста
  });
});
```

### Шаг 4: Обновить context.md
```yaml
tests:
  unit:
    required: true
    files: ["./__tests__/Component.test.tsx"]
  integration:
    required: true
    files: ["./__tests__/Component.integration.test.tsx"]
```

---

## 8. Claude Self-Testing Protocol

> **CSP:** Claude ОБЯЗАН выполнить тесты и проверить результаты перед передачей кода пользователю.

### 8.1 CSP Workflow (5 фаз)

```
1. IMPLEMENT → 2. GENERATE TESTS → 3. EXECUTE → 4. VALIDATE → 5. REPORT
```

| Фаза | Действие | Обязательно |
|------|----------|-------------|
| 1. Implement | Разработка фичи по AC Use Cases | Да |
| 2. Generate Tests | Создание тестов с AC трассируемостью | Да |
| 3. Execute | Запуск `npm test`, `npm run type-check`, `npm run lint` | Да |
| 4. Validate | Проверка, что каждый AC Use Case проходит | Да |
| 5. Report | Генерация Self-Testing Report | Да |

### 8.2 Когда применять CSP

CSP **обязателен** когда:
- Реализация новой функции (PC контекст)
- Исправление бага в существующей функции
- Изменение API контрактов (изменения AC)
- Добавление/модификация UI компонентов с пользовательским взаимодействием

CSP **опционален** когда:
- Только изменения документации
- Обновление конфигурационных файлов
- Простой рефакторинг без изменения поведения

### 8.3 AC → Test Plan конвертация

**Алгоритм:**

```
AC Use Case → Test Cases
├── TC_positive: Main Flow (happy path)
├── TC_negative: Error cases
├── TC_edge: Edge cases
└── TC_postcondition: Проверка postconditions
```

**Маппинг к типам тестов:**

| AC источник | Тип теста | Описание |
|-------------|-----------|----------|
| Main Flow | CIT | Integration тест для happy path |
| Error Handling | CUT/CIT | Unit/Integration для error cases |
| Edge Cases | CUT | Unit тест для граничных условий |
| Postconditions | CIT | Верификация после действия |

**Пример конвертации:**

```yaml
# Input: AC_catalog_filters:UC01
UC01: Apply Category Filter
  Actor: Customer
  Main Flow: [8 шагов]
  Postconditions: [3 пункта]
  Error Handling: [2 случая]
```

| AC Use Case | Test Case ID | Тип | Описание |
|-------------|--------------|-----|----------|
| UC01 | TC_UC01_positive | CIT | Happy path — фильтр применяется |
| UC01 | TC_UC01_keyboard | CIT | A11y: keyboard навигация |
| UC01 | TC_UC01_loading | CIT | Loading состояние при фильтрации |
| UC01 | TC_UC01_error | CIT | Обработка ошибки при API failure |
| UC01 | TC_UC01_empty | CIT | Обработка пустых результатов |

### 8.4 P0 Self-Testing Checklist

Перед передачей кода Claude ОБЯЗАН проверить:

| Категория | Проверка | Приоритет | Команда |
|-----------|----------|-----------|---------|
| Тесты | Все AC Use Cases проходят | P0 | `npm test` |
| Покрытие | ≥ 80% | P0 | `npm test -- --coverage` |
| TypeScript | Нет ошибок | P0 | `npm run type-check` |
| Lint | Нет ошибок | P0 | `npm run lint` |
| Build | Успешен | P0 | `npm run build` |
| Безопасность | Нет несанитизированного HTML | P0 | Code review |
| Безопасность | Нет захардкоженных секретов | P0 | Code review |
| Функционал | Happy path работает | P1 | Ручной тест |
| Функционал | Error states работают | P1 | Ручной тест |

**При P0 нарушении:**

1. **ИСПРАВИТЬ** перед передачей
2. **ПЕРЕЗАПУСТИТЬ** валидацию
3. **ОБНОВИТЬ** Self-Testing Report

### 8.5 Формат Self-Testing Report

Claude ОБЯЗАН сгенерировать этот отчёт после реализации функции:

```markdown
## Self-Testing Report

**Feature:** {Название функции}
**Context ID:** PC_{domain}_{component}
**Based On:** AC_{domain}_{name}
**Date:** YYYY-MM-DD

### AC Use Case Coverage

| Use Case | Статус | Тип теста | Примечания |
|----------|--------|-----------|------------|
| UC01: {Name} | ✅ Pass | CIT | Main flow verified |
| UC02: {Name} | ✅ Pass | CIT | Edge cases tested |
| UC03: {Name} | ⚠️ Partial | CUT | Needs manual verification |

### Результаты выполнения тестов

\`\`\`bash
# npm test output
Tests: 12 passed, 0 failed
Coverage: 87% statements, 82% branches
Duration: 4.2s
\`\`\`

### P0 Checklist

- [x] Все AC Use Cases имеют passing тесты
- [x] Test coverage ≥ 80%
- [x] Нет TypeScript ошибок
- [x] Нет linting ошибок
- [x] Build успешен
- [x] Нет несанитизированного HTML
- [x] Нет захардкоженных секретов

### Найденные и исправленные проблемы

1. **Проблема:** {Описание}
   **Исправление:** {Решение} согласно {AC/IC reference}

### Оставшиеся пункты

- [ ] {Пункт, требующий ручной проверки}

### Рекомендация

**Статус:** ✅ READY FOR REVIEW | ⚠️ NEEDS ATTENTION | ❌ NOT READY

{Резюме готовности и известных ограничений}
```

---

## 9. CSP-Lite для CLI/Web инструментов

Для CLI инструментов и web dashboards без традиционных frontend тест-сьютов используйте CSP-Lite.

### 9.1 Когда использовать CSP-Lite

| Тип проекта | Test Suite | Протокол |
|-------------|-----------|----------|
| React/Vue frontend | npm test (vitest/jest) | Полный CSP (Раздел 8) |
| CLI tool | Нет или минимальный | CSP-Lite |
| Web dashboard | Только API тесты | CSP-Lite |

### 9.2 CSP-Lite Workflow

```
BUILD → TYPECHECK → [START SERVER] → API TESTS → REPORT
```

### 9.3 API тестирование с vitest + supertest

```typescript
import request from 'supertest';
import { createServer } from '../web/server.js';

describe('API', () => {
  it('should include queue in connections', async () => {
    const app = createServer({ projectRoot });
    const res = await request(app).get('/api/connections');
    expect(res.body.tracker).toHaveProperty('queue');
  });
});
```

### 9.4 Что Claude НЕ МОЖЕТ тестировать

- Click handlers, modal interactions
- Визуальный рендеринг, CSS стилизация
- Keyboard shortcuts в браузере

**Предоставьте чеклист ручного тестирования для UI фич.**

### 9.5 Шаблон CSP-Lite Report

```markdown
## Self-Testing Report (CSP-Lite)

**Tool:** {Name} v{Version}
**Date:** YYYY-MM-DD

### Build Validation
- [x] `npm run build` — passed
- [x] `npm test` — {N} tests passed

### API Tests
| Endpoint | Test | Result |
|----------|------|--------|
| GET /api/status | Returns project info | ✅ |

### Manual Testing Required
- [ ] {UI interaction to verify}

**Status:** ⚠️ API VERIFIED, UI NEEDS MANUAL TEST
```

---

## 10. Чеклист тестирования

Перед мержем PR:

- [ ] Все AC Use Cases имеют CIT тесты
- [ ] Test coverage ≥ 80%
- [ ] Все тесты проходят (`npm test`)
- [ ] Нет flaky тестов (запустить 3 раза)
- [ ] Тесты имеют AC трассируемость в комментариях
- [ ] Edge cases протестированы (error, empty, loading)
- [ ] Accessibility протестирована (keyboard, screen reader)
- [ ] context.md обновлён с путями к файлам тестов

---

## Связанные документы

| Документ | Описание |
|----------|----------|
| [CODE_REVIEW_CHECKLIST](CODE_REVIEW_CHECKLIST.md) | Чеклист code review |
| [PRIORITY_SYSTEM](PRIORITY_SYSTEM.md) | Система приоритетов P0/P1/P2 |
| [SYSTEM_PROMPT](../SYSTEM_PROMPT.md) | Основная спецификация |

---

**Последнее обновление:** 2026-01-04
**Владелец:** QA Team
**Статус:** Active
