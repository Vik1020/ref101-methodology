# Руководство по интеграции дизайн-системы с LLM

**Версия:** 1.0.0
**Последнее обновление:** 2026-01-08

> Это руководство описывает интеграцию дизайн-систем (публичных, как shadcn/ui, или приватных, как Figma)
> с LLM-воркфлоу для генерации консистентного и качественного UI-кода.

---

## Содержание

1. [Введение](#введение)
2. [Архитектура провайдера дизайн-системы](#архитектура-провайдера-дизайн-системы)
3. [W3C Design Tokens](#w3c-design-tokens)
4. [Фаза UI_DESIGN](#фаза-ui_design)
5. [Провайдер shadcn](#провайдер-shadcn)
6. [Провайдер Figma](#провайдер-figma-roadmap)
7. [MCP-обработчики](#mcp-обработчики)
8. [Правила использования LLM](#правила-использования-llm)
9. [Выбор паттерна макета страницы](#выбор-паттерна-макета-страницы-v1500) (v1.50.0)
10. [Валидация узлов](#валидация-узлов)
11. [Путь миграции](#путь-миграции)

---

## Введение

### Зачем нужна интеграция дизайн-системы с LLM?

Когда LLM генерирует UI-код без контекста дизайн-системы:
- Несогласованные стили (разные цвета, отступы, типографика)
- Нестандартные компоненты (кастомные кнопки вместо библиотечных)
- Проблемы доступности (отсутствие ARIA, клавиатурной навигации)
- Технический долг (сложно поддерживать сгенерированный код)

**С интеграцией дизайн-системы:**
- LLM знает доступные компоненты и их API
- Согласованное использование дизайн-токенов
- Следование устоявшимся паттернам
- Код соответствует стандартам команды

### Ключевые концепции

| Концепция | Описание |
|-----------|----------|
| **Провайдер дизайн-системы (DSP)** | Абстракция над источниками дизайн-системы |
| **Провайдер** | Конкретный источник: shadcn, Figma, кастомный |
| **Дизайн-токены** | Примитивные значения: цвета, отступы, типографика |
| **Спецификация компонента** | Описание API: props, варианты, правила использования |
| **Фаза UI_DESIGN** | Этап воркфлоу для UI-требований |

---

## Архитектура провайдера дизайн-системы

### Обзор

```
┌─────────────────────────────────────────────────────────────┐
│              Провайдер дизайн-системы (DSP)                 │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │Провайдер shadcn │              │ Провайдер Figma │       │
│  │  (активен)      │              │  (в плане)      │       │
│  └────────┬────────┘              └────────┬────────┘       │
│           │                                │                │
│           └────────────┬───────────────────┘                │
│                        ▼                                    │
│              ┌─────────────────┐                            │
│              │  Унифицированный│                            │
│              │       API       │                            │
│              │  - getComponent │                            │
│              │  - getTokens    │                            │
│              │  - listComponents│                           │
│              └─────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────┐
              │   LLM / PCC     │
              │   Воркфлоу      │
              └─────────────────┘
```

### Конфигурация

**Файл:** `design-system/config.json`

```json
{
  "provider": "shadcn",
  "providers": {
    "shadcn": {
      "components_path": "src/components/ui",
      "tokens_path": "design-system/tokens/shadcn-tokens.json",
      "docs_path": "docs/domains/PA_DESIGN_SYSTEM_SHADCN.md"
    },
    "figma": {
      "mcp_endpoint": "https://mcp.figma.com/mcp",
      "file_id": "your-figma-file-id",
      "tokens_path": "design-system/tokens/figma-tokens.json",
      "docs_path": "docs/domains/PA_DESIGN_SYSTEM_FIGMA.md",
      "code_connect_path": "design-system/code-connect/"
    }
  }
}
```

### Переключение провайдеров

```bash
# Редактируем config.json
{
  "provider": "figma"  # Изменено с "shadcn"
}

# LLM автоматически использует новый провайдер
# Те же MCP-вызовы, другой источник
```

---

## W3C Design Tokens

### Формат (стабильная версия 2025.10)

Дизайн-токены следуют [спецификации W3C Design Tokens](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/).

**Файл:** `design-system/tokens/shadcn-tokens.json`

```json
{
  "color": {
    "primary": {
      "$value": "hsl(222.2 47.4% 11.2%)",
      "$type": "color",
      "$description": "Основной цвет бренда",
      "$extensions": {
        "ai": {
          "when_to_use": "Основные кнопки, активные состояния, ссылки",
          "avoid_when": "Деструктивные действия, неактивные состояния",
          "semantic_role": "brand-primary"
        }
      }
    },
    "destructive": {
      "$value": "hsl(0 84.2% 60.2%)",
      "$type": "color",
      "$extensions": {
        "ai": {
          "when_to_use": "Кнопки удаления, состояния ошибок, предупреждения",
          "avoid_when": "Состояния успеха, информационный UI",
          "semantic_role": "danger"
        }
      }
    }
  },
  "spacing": {
    "sm": {
      "$value": "8px",
      "$type": "dimension",
      "$extensions": {
        "ai": {
          "when_to_use": "Плотные отступы, промежутки между иконками, маленький padding",
          "semantic_role": "spacing-small"
        }
      }
    },
    "md": {
      "$value": "16px",
      "$type": "dimension",
      "$extensions": {
        "ai": {
          "when_to_use": "Стандартный padding, отступы в карточках, промежутки между секциями",
          "semantic_role": "spacing-medium"
        }
      }
    }
  },
  "typography": {
    "heading": {
      "lg": {
        "$value": {
          "fontFamily": "Inter, sans-serif",
          "fontSize": "24px",
          "fontWeight": 600,
          "lineHeight": 1.2
        },
        "$type": "typography",
        "$extensions": {
          "ai": {
            "when_to_use": "Заголовки страниц, заголовки секций",
            "semantic_role": "heading-large"
          }
        }
      }
    }
  }
}
```

### Расширения AI-метаданных

Объект `$extensions.ai` предоставляет рекомендации для LLM:

| Поле | Назначение | Пример |
|------|------------|--------|
| `when_to_use` | Позитивные сценарии | "Основные кнопки, CTA" |
| `avoid_when` | Антипаттерны | "Деструктивные действия" |
| `semantic_role` | Семантическое значение | "brand-primary" |

---

## Фаза UI_DESIGN

### Место в воркфлоу

```
AC_delta → UI_DESIGN → PLAN_FINALIZE → PC
(согласование)  (согласование)   (согласование)
```

### Назначение

Преобразование Use Cases из AC в:
1. **Карту компонентов** — какие UI-компоненты нужны
2. **Использование токенов** — какие дизайн-токены применяются
3. **Состояния экрана** — по умолчанию, загрузка, ошибка, пустое

### Артефакт: UI_DESIGN_delta.md

```markdown
---
context_id: UI_DESIGN_delta_v1_40_0_feature_name
type: ui_design_delta
version: "1.0.0"
based_on:
  - AC_delta_v1_40_0_feature_name: "1.0.0"
figma_source:                    # Опционально, для провайдера Figma
  file_id: "abc123"
  frame_id: "456:789"
---

## Компоненты

| Компонент | Путь в коде | Варианты | Сценарий |
|-----------|-------------|----------|----------|
| Button | @/components/ui/button | variant="default" | UC01: Отправка формы |
| Input | @/components/ui/input | type="email" | UC01: Ввод email |
| Card | @/components/ui/card | - | UC02: Отображение элемента |

## Токены

| Категория | Токен | Использование |
|-----------|-------|---------------|
| Цвет | color.primary | Фон кнопки отправки |
| Отступы | spacing.md | Padding карточки |
| Типографика | typography.heading.lg | Заголовок страницы |

## Состояния

- [x] Состояние по умолчанию
- [x] Состояние загрузки
- [x] Пустое состояние
- [x] Состояние ошибки

## Трассировка

| Сценарий AC | Компоненты |
|-------------|------------|
| UC01: Отправка формы | Button, Input |
| UC02: Отображение элемента | Card |
```

### Валидаторы

| Валидатор | Критичность | Описание |
|-----------|-------------|----------|
| `components_exist` | error | Все компоненты есть в DSP |
| `ac_traceability` | error | Каждый компонент связан с UC |

---

## Провайдер shadcn

### Обзор

[shadcn/ui](https://ui.shadcn.com/) — дизайн-система, готовая к работе с AI:
- Открытый код (копирование, не npm-пакет)
- Примитивы Radix UI + Tailwind CSS
- Предсказуемая структура, понятная LLM

### Настройка

```bash
# 1. Инициализировать shadcn/ui
npx shadcn@latest init

# 2. Добавить компоненты
npx shadcn@latest add button input card

# 3. Создать конфигурацию DSP
cat > design-system/config.json << 'EOF'
{
  "provider": "shadcn",
  "providers": {
    "shadcn": {
      "components_path": "src/components/ui",
      "tokens_path": "design-system/tokens/shadcn-tokens.json",
      "docs_path": "docs/domains/PA_DESIGN_SYSTEM_SHADCN.md"
    }
  }
}
EOF
```

### PA-документация

**Файл:** `docs/domains/PA_DESIGN_SYSTEM_SHADCN.md`

```markdown
---
domain_id: PA_DESIGN_SYSTEM_SHADCN
type: project_asset
version: "1.0.0"
---

# Актив проекта: дизайн-система shadcn/ui

## Источник
- **Библиотека:** shadcn/ui
- **Документация:** https://ui.shadcn.com/docs
- **Провайдер:** shadcn

## Компоненты

### Button
- **Код:** `@/components/ui/button`
- **Варианты:** default, destructive, outline, secondary, ghost, link
- **Размеры:** default, sm, lg, icon
- **Когда использовать:**
  - Основные действия (Отправить, Сохранить, Подтвердить)
  - Отправка форм
  - Кнопки призыва к действию
- **Избегать когда:**
  - Навигация (используйте компонент Link)
  - Переключение состояний (используйте компонент Toggle)
  - Триггеры меню (используйте DropdownMenuTrigger)

### Input
- **Код:** `@/components/ui/input`
- **Типы:** text, email, password, number, search
- **Когда использовать:**
  - Поля форм
  - Поля поиска
  - Однострочный ввод текста
- **Избегать когда:**
  - Многострочный текст (используйте Textarea)
  - Форматированный текст (используйте Editor)

### Card
- **Код:** `@/components/ui/card`
- **Подкомпоненты:** CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Когда использовать:**
  - Группировка связанного контента
  - Элементы списка с действиями
  - Виджеты дашборда
```

---

## Провайдер Figma (в плане)

### Обзор

[MCP-сервер Figma](https://www.figma.com/blog/introducing-figma-mcp-server/) позволяет:
- Прямой доступ к дизайнам Figma из LLM
- Экспорт токенов в формате W3C
- Маппинг Code Connect

### Настройка (будущее)

```bash
# 1. Настроить Figma MCP
cat >> .claude/mcp.json << 'EOF'
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["@anthropic-ai/figma-mcp-server"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_TOKEN}"
      }
    }
  }
}
EOF

# 2. Обновить конфигурацию DSP
{
  "provider": "figma",
  "providers": {
    "figma": {
      "mcp_endpoint": "https://mcp.figma.com/mcp",
      "file_id": "your-file-id"
    }
  }
}
```

### Code Connect

Связывает компоненты Figma с кодом:

```typescript
// design-system/code-connect/button.figma.tsx
import { figma } from '@figma/code-connect';
import { Button } from '@/components/ui/button';

figma.connect(Button, 'https://figma.com/file/.../Button', {
  props: {
    variant: figma.enum('Variant', {
      Primary: 'default',
      Secondary: 'secondary',
      Destructive: 'destructive'
    })
  },
  example: (props) => <Button variant={props.variant}>Нажми меня</Button>
});
```

---

## MCP-обработчики

### pcc_ds_get_component

Получить детальную спецификацию компонента.

**Запрос:**
```json
{
  "component_name": "Button",
  "variant": "primary"
}
```

**Ответ:**
```json
{
  "success": true,
  "component": {
    "name": "Button",
    "code_path": "@/components/ui/button",
    "variants": ["default", "destructive", "outline"],
    "props": [
      { "name": "variant", "type": "string", "default": "default" }
    ],
    "usage_rules": {
      "when_to_use": ["Основные действия", "Отправка форм"],
      "avoid_when": ["Навигация", "Переключение состояний"]
    }
  }
}
```

### pcc_ds_get_tokens

Получить дизайн-токены по категории.

**Запрос:**
```json
{
  "category": "colors"
}
```

**Ответ:**
```json
{
  "success": true,
  "tokens": {
    "primary": {
      "$value": "hsl(222.2 47.4% 11.2%)",
      "$type": "color",
      "$extensions": {
        "ai": {
          "when_to_use": "Основные кнопки, активные состояния"
        }
      }
    }
  }
}
```

### pcc_ds_list_components

Получить список всех доступных компонентов.

**Ответ:**
```json
{
  "success": true,
  "components": [
    { "name": "Button", "description": "Интерактивная кнопка" },
    { "name": "Input", "description": "Поле ввода текста" }
  ]
}
```

---

## Правила использования LLM

### Правила P0 (блокирующие)

```markdown
## Правила UI-компонентов

### ВСЕГДА использовать компоненты дизайн-системы
- Button: `import { Button } from "@/components/ui/button"`
- Input: `import { Input } from "@/components/ui/input"`
- Card: `import { Card } from "@/components/ui/card"`

### НИКОГДА не использовать сырой HTML для этих элементов
- ❌ `<button>` → ✅ `<Button>`
- ❌ `<input>` → ✅ `<Input>`
- ❌ Кастомный div с border → ✅ `<Card>`

### Проверять PA_DESIGN_SYSTEM перед генерацией
1. Прочитать PA_DESIGN_SYSTEM_*.md для правил компонентов
2. Следовать рекомендациям `when_to_use`
3. Применять правильные варианты для контекста
```

### Интеграция с воркфлоу

```
1. Фаза UI_DESIGN:
   - Выбрать паттерн макета страницы (v1.50.0)
   - Вызвать pcc_ds_list_components()
   - Связать Use Cases с компонентами
   - Сгенерировать UI_DESIGN_delta.md

2. Фаза PC:
   - Импортировать layout из @/components/layouts
   - Вызвать pcc_ds_get_component() для каждого компонента
   - Сгенерировать код с правильными импортами
   - Применить токены из pcc_ds_get_tokens()
```

---

## Выбор паттерна макета страницы (v1.50.0)

> Перед связыванием компонентов с Use Cases определите паттерн макета страницы.

### Шаг 1: Анализ Use Cases

Ищите эти паттерны в Use Cases AC:

| Фраза UC | Предлагаемый макет |
|----------|-------------------|
| "Просмотреть список...", "Обзор..." | CardListLayout |
| "Выбрать X для просмотра деталей" | ListDetailLayout |
| "Фильтровать/искать элементы" | CardListLayout + filterBar |
| "Боковая навигация" | ListDetailLayout |
| "Переключаться между вкладками" | TabbedLayout (кастомный) |
| "Создать/Редактировать сущность" | FormLayout (кастомный) |

### Шаг 2: Выбор компонента макета

Импорт из `@/components/layouts`:

| Компонент | Когда использовать |
|-----------|-------------------|
| **CardListLayout** | Списки сущностей (релизы, узлы, навыки), сетки карточек с фильтрацией |
| **ListDetailLayout** | Master-detail представления (дерево → контент), браузеры документов |
| **Кастомный** | Использовать атомарные компоненты (PageHeader, LoadingState, EmptyState, ErrorBanner) |

### Шаг 3: Документирование в UI_DESIGN

Включите секцию "Паттерн макета страницы":
1. Таблица **Выбор макета** (Тип страницы, Компонент макета, Обоснование)
2. Таблица **Конфигурация макета** (layout, gridCols, sidebarWidth и т.д.)
3. Связь обоснования с Use Case из AC

### Пример

**Use Case AC:**
```
UC025: Просмотр деталей узла
Актор: Разработчик
Сценарий: Пользователь кликает на узел в списке → Система показывает детали узла в панели
```

**Секция макета UI_DESIGN:**
```markdown
## Паттерн макета страницы

### Выбор макета

| Свойство | Значение |
|----------|----------|
| **Тип страницы** | ListDetail |
| **Компонент макета** | ListDetailLayout |
| **Обоснование** | UC025 требует паттерн клик-для-просмотра с панелью деталей |

### Конфигурация макета

| Опция | Значение |
|-------|----------|
| sidebarWidth | md |
| cardTitle | Детали узла |
| contentEmpty | yes (начальное состояние) |
```

### Справка

См. [PA_DESIGN_SYSTEM_LAYOUTS](../../../docs/domains/PA_DESIGN_SYSTEM_LAYOUTS.md) для полной документации компонентов.

---

## Валидация узлов

### Узел: design-system

**Файл:** `tools/node-validators/nodes.yaml`

```yaml
design-system:
  name: Дизайн-система
  description: Дизайн-токены, компоненты, конфигурация провайдера
  coupling: structural
  ssot: design-system/config.json
  components:
    auto:
      - design-system/tokens/*.json
      - design-system/providers/**/*.json
    explicit:
      - design-system/config.json
  dependencies:
    - workflow-engine
    - phase-templates
    - mcp-tooling
  rules:
    - id: provider-config-valid
      description: config.json должен иметь валидный провайдер
      severity: error
    - id: tokens-w3c-format
      description: Токены должны следовать спецификации W3C
      severity: error
    - id: components-documented
      description: Компоненты должны иметь PA-документацию
      severity: warning
    - id: provider-paths-exist
      description: Пути в конфигурации должны существовать
      severity: error
```

### Запуск валидации

```bash
# Валидировать узел design-system
pcc nodes design-system

# Валидировать все узлы
pcc nodes --validate
```

---

## Путь миграции

### Фаза 1: Провайдер shadcn (текущая)

1. Настроить React + Tailwind + shadcn/ui
2. Создать конфигурацию DSP с провайдером shadcn
3. Документировать компоненты в PA_DESIGN_SYSTEM_SHADCN.md
4. Экспортировать токены в формат W3C

### Фаза 2: Провайдер Figma (будущее)

1. Настроить MCP-сервер Figma
2. Настроить маппинги Code Connect
3. Экспортировать токены из Figma
4. Переключить провайдер в config.json

### Гибридный подход

```json
{
  "provider": "figma",
  "providers": {
    "shadcn": { ... },
    "figma": {
      "tokens_path": "design-system/tokens/figma-tokens.json",
      "components": "shadcn"  // Использовать компоненты shadcn с токенами Figma
    }
  }
}
```

---

## Ссылки

### Внешние
- [shadcn/ui](https://ui.shadcn.com/) — Дизайн-система, готовая к AI
- [MCP-сервер Figma](https://www.figma.com/blog/introducing-figma-mcp-server/)
- [W3C Design Tokens 2025.10](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)

### Внутренние
- [WORKFLOW.md](../../WORKFLOW.md) — Определения фаз
- [SYSTEM_PROMPT.md](../../SYSTEM_PROMPT.md) — Инструкции LLM
