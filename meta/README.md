# Мета-методология v3: Архитектурный язык для человеко-AI процессов

---

## TL;DR

**Мета-методология** — инвариантный каркас для описания любых процессов с участием людей и AI.

Вместо создания отдельных методологий для каждой области используется **единый архитектурный язык из 8 элементов**:

```
┌─────────────────────────────────────────────────────────────┐
│  State → Actor[Tool] → Action → Entity[Artifact] → Fact    │
│                            ↑                               │
│                          Rule                              │
└─────────────────────────────────────────────────────────────┘
```

**Результат:** Новая методология создаётся за часы, автоматически совместима с AI-агентами и эволюционирует без переписывания.

---

## Quick Start

Минимальный пример методологии для согласования документа:

```yaml
# Методология: Согласование документа
Entity: Document
  schema: { title: string, content: string, status: enum }

States:
  - Draft [Initial]
  - Review [Waiting]
  - Approved [Terminal]
  - Rejected [Terminal]

Actors:
  - Author (Human) → Tool: Editor UI
  - Reviewer (Human) → Tool: Approval UI

Flow:
  Draft --"Submitted"--> Review --"Approved"--> Approved
                              \--"Rejected"--> Rejected
```

**Проверка:** Каждый State имеет выход? ✓ Каждый Actor имеет Tool? ✓

Подробные определения элементов — в [Части II](#часть-ii-восемь-элементов).

---

## Содержание

### Быстрый старт
- [Quick Start](#quick-start)

### Часть I: Основания
1. [Проблема: Семантический разрыв](#1-проблема-семантический-разрыв)
2. [Решение: Инвариантный каркас](#2-решение-инвариантный-каркас)
3. [Принципы мета-методологии](#3-принципы-мета-методологии)

### Часть II: Восемь элементов
4. [Элементы: Формальные определения](#4-элементы-формальные-определения)
5. [Связи между элементами](#5-связи-между-элементами)

### Часть III: Паттерны
6. [Паттерны композиции](#6-паттерны-композиции)
7. [Паттерны отказоустойчивости](#7-паттерны-отказоустойчивости)
8. [Анти-паттерны](#8-анти-паттерны)

### Часть IV: Метод применения
9. [Event Storming: Полная интеграция](#9-event-storming-полная-интеграция)
10. [Пошаговый процесс создания методологии](#10-пошаговый-процесс-создания-методологии)
11. [Миграция существующих процессов](#11-миграция-существующих-процессов)

### Часть V: Примеры
12. [Пример 1: Hello World](#12-пример-1-hello-world)
13. [Пример 2: Product Launch](#13-пример-2-product-launch)
14. [Пример 3: Итеративная генерация](#14-пример-3-итеративная-генерация)

### Часть VI: Мета-уровень
15. [Мета-методология о себе](#15-мета-методология-о-себе)
16. [Эволюция и версионирование](#16-эволюция-и-версионирование)
17. [Границы применимости](#17-границы-применимости)

### Часть VII: Практика
18. [Инструменты](#18-инструменты)
19. [Тестирование методологий](#19-тестирование-методологий)
20. [Метрики эффективности](#20-метрики-эффективности)

### Приложения
- [A. Глоссарий](#приложение-a-глоссарий)
- [B. Чеклист проектирования](#приложение-b-чеклист-проектирования)
- [C. Полный шаблон методологии](#приложение-c-полный-шаблон-методологии)
- [D. FAQ](#приложение-d-faq)

---

# Часть I: Основания

## 1. Проблема: Семантический разрыв

При создании систем, где LLM и люди работают вместе, возникает **семантический разрыв** — отсутствие единого языка описания работы.

| Участник | Как называет единицу работы | Как описывает результат |
|----------|----------------------------|------------------------|
| Менеджер | "Задача" | "Сделано" |
| Разработчик | "Тикет" | "Закрыт" |
| LLM | Зависит от промпта | Зависит от контекста |

**Последствия разрыва:**
- Невозможно автоматизировать передачу работы между людьми и AI
- AI теряет контекст при переходе между этапами
- Процессы невозможно версионировать и развивать системно

---

## 2. Решение: Инвариантный каркас

Мета-методология предлагает **единый словарь из 8 элементов**, достаточный для описания любого структурированного процесса:

| # | Элемент | Отвечает на вопрос |
|---|---------|-------------------|
| 1 | **State** | В какой фазе находится процесс? |
| 2 | **Actor** | Кто выполняет работу? |
| 3 | **Tool** | Чем выполняется работа? |
| 4 | **Action** | Что именно делается? |
| 5 | **Entity** | Над чем ведётся работа? |
| 6 | **Artifact** | Какой физический результат создаётся? |
| 7 | **Fact** | Что произошло? (событие) |
| 8 | **Rule** | При каких условиях это допустимо? |

**Ключевое свойство:** Элементы инвариантны относительно предметной области. Меняются только конкретные значения.

---

## 3. Принципы мета-методологии

### 3.1 Разделение каркаса и конфигурации

**Каркас (неизменный):** определяет, что любой процесс — это цикл трансформации Entity через States посредством Actions.

**Конфигурация (изменяемая):** подстановка конкретных значений создаёт методологию для области:

| Область | Entity | Actor | Tool |
|---------|--------|-------|------|
| Разработка | Pull Request | AI Reviewer | GitHub API |
| Маркетинг | Статья | AI Copywriter | LLM Generator |
| Юриспруденция | Договор | AI Lawyer | RAG Search |

### 3.2 Агностичность к типу исполнителя

Системе безразлично, кто Actor — человек или AI. Различие только в доступных Tools:

| Тип Actor | Характерные Tools |
|-----------|------------------|
| Human | UI-интерфейсы, формы, кнопки |
| AI | API, LLM-вызовы, скрипты |
| System | Cron-jobs, webhooks, триггеры |

Все типы подчиняются единым States, Actions и Rules.

### 3.3 Защита от некорректного поведения

- **State** ограничивает контекст: Actor не может выполнить Action, недопустимый в текущем State
- **Rule** выступает как gate: переход блокируется при невыполнении условия
- **Fact** фиксирует историю: невозможно "переиграть" то, что уже произошло

### 3.4 Явное лучше неявного

Каждый элемент процесса должен быть:
- **Именован** — уникальное имя в пределах контекста
- **Типизирован** — соответствует одному из 8 типов элементов
- **Связан** — явные связи с другими элементами

---

# Часть II: Восемь элементов

## 4. Элементы: Формальные определения

### Визуальная нотация

| Форма | Цвет | Элемент | Мнемоника |
|-------|------|---------|-----------|
| Скруглённый прямоугольник | Белый | **State** | Фаза ожидания |
| Скруглённый прямоугольник | Розовый | **Actor** | Исполнитель |
| Прямоугольник | Серый | **Tool** | Инструмент |
| Прямоугольник | Синий | **Action** | Действие |
| Прямоугольник | Жёлтый | **Entity** | Объект работы |
| Прямоугольник со скосом | Оранжевый | **Artifact** | Файл/документ |
| Круг | Красный | **Fact** | Событие |
| Ромб | Фиолетовый | **Rule** | Условие |

---

### 4.1 State (Состояние)

**Определение:** Именованная фаза жизненного цикла, определяющая допустимые Actions и условия перехода.

**Обязательные атрибуты:**

| Атрибут | Тип | Описание |
|---------|-----|----------|
| `id` | string | Уникальный идентификатор |
| `name` | string | Человекочитаемое имя |
| `allowed_actions` | list[Action] | Какие Actions можно выполнять |
| `entry_conditions` | list[Fact] | Какие Facts приводят в этот State |
| `exit_conditions` | list[Fact] | Какие Facts выводят из этого State |

**Типы States:**

| Тип | Описание | Пример |
|-----|----------|--------|
| **Initial** | Начальный, создаётся автоматически | `Created` |
| **Working** | Активная работа | `Drafting`, `Review` |
| **Waiting** | Ожидание внешнего события | `Pending Approval` |
| **Terminal** | Конечный, выхода нет | `Completed`, `Cancelled` |
| **Error** | Обработка сбоя | `Failed`, `Blocked` |

**Правила:**
- Из каждого не-Terminal State должен быть хотя бы один выход
- Initial State — ровно один на процесс
- Terminal States — минимум один (успешный) + один (для ошибок)

---

### 4.2 Actor (Исполнитель)

**Определение:** Агент, обладающий способностью выполнять Actions с использованием Tools.

**Обязательные атрибуты:**

| Атрибут | Тип | Описание |
|---------|-----|----------|
| `id` | string | Уникальный идентификатор |
| `name` | string | Роль или имя |
| `type` | enum | `Human`, `AI`, `System` |
| `tools` | list[Tool] | Доступные инструменты |
| `permissions` | list[Action] | Разрешённые действия |

**Типы Actors:**

| Тип | Характеристика | Пример |
|-----|----------------|--------|
| **Human** | Принимает решения, использует UI | Product Manager |
| **AI** | Выполняет по инструкции, использует API | AI Analyst |
| **System** | Автоматический триггер, без решений | Monitoring Service |

**Правила:**
- Actor без Tools не может выполнять Actions
- Actor без permissions бесполезен (удалить из процесса)
- Один Action — один ответственный Actor (Single Responsibility)

---

### 4.3 Tool (Инструмент)

**Определение:** Конкретная функция, API или интерфейс, через который Actor выполняет Action.

**Обязательные атрибуты:**

| Атрибут | Тип | Описание |
|---------|-----|----------|
| `id` | string | Уникальный идентификатор |
| `name` | string | Имя инструмента |
| `type` | enum | `API`, `UI`, `LLM`, `Script`, `Manual` |
| `compatible_actors` | list[ActorType] | Кто может использовать |
| `input_schema` | Schema | Что принимает на вход |
| `output_schema` | Schema | Что возвращает |

**Типы Tools:**

| Тип | Описание | Пример |
|-----|----------|--------|
| **API** | Программный интерфейс | `GitHub API`, `Slack Webhook` |
| **UI** | Пользовательский интерфейс | `Approve Button`, `Form` |
| **LLM** | Языковая модель | `Claude`, `GPT-4` |
| **Script** | Автоматизированный скрипт | `Python Script`, `Bash` |
| **Manual** | Ручное действие без системы | `Phone Call`, `Meeting` |

**Правила:**
- Tool типа `UI` несовместим с Actor типа `AI`
- Tool типа `API` несовместим с Actor типа `Human` (если нет UI-обёртки)
- Каждый Tool должен иметь определённые input/output schemas

---

### 4.4 Action (Действие)

**Определение:** Единица работы, выполняемая Actor с помощью Tool, изменяющая Entity или создающая Fact.

**Обязательные атрибуты:**

| Атрибут | Тип | Описание |
|---------|-----|----------|
| `id` | string | Уникальный идентификатор |
| `name` | string | Глагол в инфинитиве |
| `actor` | Actor | Кто выполняет |
| `tool` | Tool | Чем выполняет |
| `input` | Entity | Над чем работает |
| `output` | Entity or Fact | Результат |
| `allowed_in_states` | list[State] | Где допустим |

**Правила:**
- Имя Action — глагол (`Создать`, `Проверить`, `Утвердить`)
- Action без assigned Actor — ошибка проектирования
- Action должен быть разрешён минимум в одном State

---

### 4.5 Entity (Сущность)

**Определение:** Структурированный бизнес-объект, который проходит через States и трансформируется Actions.

**Обязательные атрибуты:**

| Атрибут | Тип | Описание |
|---------|-----|----------|
| `id` | string | Уникальный идентификатор экземпляра |
| `type` | string | Тип сущности |
| `schema` | JSON Schema | Структура данных |
| `current_state` | State | Текущее состояние |
| `artifacts` | list[Artifact] | Прикреплённые файлы |
| `history` | list[Fact] | История изменений |
| `version` | string | Версия данных |

**Правила:**
- Entity без schema — ошибка (структура обязательна)
- Entity всегда находится ровно в одном State
- История Entity — append-only (Facts не удаляются)

---

### 4.6 Artifact (Артефакт)

**Определение:** Физический файл или документ, связанный с Entity.

**Обязательные атрибуты:**

| Атрибут | Тип | Описание |
|---------|-----|----------|
| `id` | string | Уникальный идентификатор |
| `name` | string | Имя файла |
| `type` | string | MIME-тип или расширение |
| `entity_id` | string | К какой Entity привязан |
| `created_by` | Action | Каким Action создан |
| `version` | string | Версия артефакта |

**Правила:**
- Artifact всегда привязан к Entity
- Artifact создаётся Action (не появляется из ниоткуда)
- Версионирование Artifact независимо от Entity

---

### 4.7 Fact (Факт/Событие)

**Определение:** Неизменяемая запись о том, что произошло. Триггер для перехода между States.

**Обязательные атрибуты:**

| Атрибут | Тип | Описание |
|---------|-----|----------|
| `id` | string | Уникальный идентификатор |
| `name` | string | Глагол в прошедшем времени |
| `timestamp` | datetime | Когда произошло |
| `caused_by` | Action | Какой Action вызвал |
| `actor` | Actor | Кто выполнил Action |
| `entity_id` | string | Какую Entity затронуло |
| `payload` | object | Дополнительные данные |

**Правила:**
- Имя Fact — прошедшее время (`Создано`, `Утверждено`, `Отклонено`)
- Fact неизменяем (immutable) — создан и никогда не меняется
- Fact идемпотентен в контексте — один Fact одного типа на переход

---

### 4.8 Rule (Правило)

**Определение:** Логическое условие, управляющее допустимостью Actions или переходов.

**Обязательные атрибуты:**

| Атрибут | Тип | Описание |
|---------|-----|----------|
| `id` | string | Уникальный идентификатор |
| `name` | string | Описание правила |
| `type` | enum | Тип правила (см. ниже) |
| `condition` | expression | Логическое выражение |
| `scope` | State or Action | Где применяется |
| `on_violation` | enum | Что делать при нарушении |

**Типы Rules:**

| Тип | Когда проверяется | Пример |
|-----|-------------------|--------|
| **Precondition** | До выполнения Action | "Actor имеет права" |
| **Postcondition** | После выполнения Action | "Entity содержит поле X" |
| **Guard** | При попытке перехода | "market_score > 1000000" |
| **Invariant** | Всегда | "Status никогда null" |
| **Constraint** | При изменении Entity | "Max 3 итерации" |

**Реакции на нарушение (on_violation):**

| Реакция | Описание |
|---------|----------|
| `Block` | Запретить Action/переход |
| `Redirect` | Перенаправить в другой State |
| `Compensate` | Запустить компенсирующий Action |
| `Alert` | Уведомить и продолжить |
| `Retry` | Повторить Action |

**Правила:**
- Rule без condition — ошибка (нетестируемо)
- Condition должен быть детерминированным (одинаковый вход → одинаковый выход)
- При конфликте Rules приоритет: Invariant > Guard > Precondition > Constraint

---

## 5. Связи между элементами

### 5.1 Карта связей

```
                    ┌─────────────┐
                    │    Rule     │
                    └──────┬──────┘
                           │ constrains
                           ▼
┌─────────┐ triggers ┌─────────┐ allowed_in ┌─────────┐
│  Fact   │◄─────────│ Action  │───────────►│  State  │
└─────────┘          └────┬────┘            └────┬────┘
     ▲                    │                      │
     │ creates            │ transforms           │ contains
     │                    ▼                      ▼
     │               ┌─────────┐           ┌─────────┐
     └───────────────│ Entity  │◄──────────│  Actor  │
                     └────┬────┘  works_on └────┬────┘
                          │                     │
                          │ has                 │ uses
                          ▼                     ▼
                    ┌──────────┐          ┌─────────┐
                    │ Artifact │          │  Tool   │
                    └──────────┘          └─────────┘
```

### 5.2 Обязательные связи

| Элемент | Обязательно связан с |
|---------|---------------------|
| State | Минимум один входящий Fact (кроме Initial) |
| Actor | Минимум один Tool |
| Tool | Минимум один Actor |
| Action | Ровно один Actor, ровно один Tool, минимум один State |
| Entity | Минимум один State |
| Artifact | Ровно одна Entity |
| Fact | Ровно один Action |
| Rule | Минимум один State или Action |

---

# Часть III: Паттерны

## 6. Паттерны композиции

### 6.1 Линейный процесс (Sequence)

Простейший паттерн: последовательная цепочка States.

```
[Initial] ──Fact_A──► [State_1] ──Fact_B──► [State_2] ──Fact_C──► [Terminal]
```

**Когда использовать:** Процессы без ветвлений и возвратов.

---

### 6.2 Ветвление (Branch)

Условный переход на основе Rule.

```
                    ┌─── Rule=True ───► [State_B]
[State_A] ── Rule? ─┤
                    └─── Rule=False ──► [State_C]
```

**Когда использовать:** Процессы с альтернативными путями.

---

### 6.3 Слияние (Merge)

Несколько путей сходятся в один State.

```
[State_A] ──Fact_A──┐
                    ├──► [State_Merged]
[State_B] ──Fact_B──┘
```

**Когда использовать:** После ветвления, когда пути должны сойтись.

---

### 6.4 Параллельное выполнение (Fork-Join)

Несколько Actors работают одновременно.

```
              ┌── Actor_1 ── Action_1 ── Fact_1 ──┐
[State_Fork] ─┤                                   ├─► [State_Join]
              └── Actor_2 ── Action_2 ── Fact_2 ──┘

                      Join условие: ALL Facts
```

**Варианты Join-условия:**

| Условие | Описание |
|---------|----------|
| `ALL` | Ждать все Facts |
| `ANY` | Первый Fact побеждает |
| `MAJORITY` | Более половины Facts |
| `QUORUM(n)` | Минимум n Facts |

**Когда использовать:** Независимые параллельные работы.

---

### 6.5 Итеративный цикл (Loop)

Повторение до выполнения условия.

```
[State_Loop] ──Action──► Fact ──Rule?──┐
      ▲                                │
      │        Rule=False              │ Rule=True
      └────────────────────────────────┘       │
                                               ▼
                                        [State_Exit]
```

**Обязательные ограничения:**
- `max_iterations` — защита от бесконечного цикла
- `timeout` — максимальное время в цикле

**Когда использовать:** Итеративное улучшение, генерация с проверкой качества.

---

### 6.6 Bounded Context (Контекстная граница)

Независимые модули, связанные только через Facts.

```
┌─────────────────────┐         ┌─────────────────────┐
│   Context A         │         │   Context B         │
│                     │  Fact   │                     │
│ [State] → [State] ══╪════════►╪═► [State] → [State] │
│                     │         │                     │
└─────────────────────┘         └─────────────────────┘
```

**Правила:**
- Contexts не разделяют States
- Contexts не разделяют Entities (только копируют данные)
- Единственная связь — Fact как событие интеграции

**Когда использовать:** Кросс-функциональные процессы (Product → Legal → Marketing).

---

## 7. Паттерны отказоустойчивости

### 7.1 Error State

Каждый Working State должен иметь путь в Error State.

```
[Working] ──Action──► Fact_Success ──► [Next]
              │
              └─────► Fact_Failure ──► [Error]
```

**Обязательные атрибуты Error State:**
- `error_type` — классификация ошибки
- `retry_allowed` — можно ли повторить
- `escalation_actor` — кому эскалировать

---

### 7.2 Timeout

Ограничение времени нахождения в State.

```yaml
State: "Pending Approval"
  timeout: 24h
  on_timeout:
    action: Escalate
    target_state: "Escalated"
```

**Правила:**
- Timeout обязателен для Waiting States
- Timeout рекомендован для Working States с Human Actor

---

### 7.3 Retry

Автоматический повтор при сбое.

```yaml
Action: "Call External API"
  retry:
    max_attempts: 3
    delay: exponential(base=1s, max=30s)
    on_exhausted: Fact_Failure
```

**Когда применять:**
- Внешние API-вызовы
- AI-генерация (LLM может вернуть некорректный результат)
- Сетевые операции

---

### 7.4 Compensation (Saga)

Откат при частичном выполнении кросс-контекстного процесса.

```
Context_A: [State_A1] ──Action_A──► Fact_A ──► Context_B
                                                   │
                                              Fact_B_Failure
                                                   │
                                                   ▼
           [State_A1_Compensated] ◄── Compensate_A ◄─┘
```

**Правила:**
- Каждый Action в саге имеет Compensating Action
- Compensation выполняется в обратном порядке
- Compensation должен быть идемпотентным

---

### 7.5 Circuit Breaker

Защита от каскадных сбоев при работе с внешними системами.

```yaml
Tool: "External Payment API"
  circuit_breaker:
    failure_threshold: 5
    timeout: 30s
    half_open_after: 60s

States:
  - Closed: нормальная работа
  - Open: все вызовы блокируются, возвращается fallback
  - Half-Open: пробный вызов для проверки восстановления
```

---

## 8. Анти-паттерны

### 8.1 Анти-паттерны State

| Анти-паттерн | Проблема | Решение |
|--------------|----------|---------|
| **Размытый State** | `"В процессе"` — непонятно, что происходит | Декомпозировать на конкретные фазы |
| **Deadlock State** | State без выхода (не Terminal) | Добавить exit условие или сделать Terminal |
| **God State** | Один State на весь процесс | Декомпозировать по Actions |
| **Oscillating States** | Бесконечный цикл между двумя States | Добавить max_iterations или exit condition |

---

### 8.2 Анти-паттерны Actor

| Анти-паттерн | Проблема | Решение |
|--------------|----------|---------|
| **Phantom Actor** | Actor без Tools | Удалить или добавить Tools |
| **God Actor** | Один Actor делает всё | Разделить по ответственности |
| **Tool Mismatch** | AI Actor с UI Tool | Проверить совместимость типов |
| **Missing Escalation** | Нет Human Actor для эскалации AI-ошибок | Добавить Human fallback |

---

### 8.3 Анти-паттерны Action

| Анти-паттерн | Проблема | Решение |
|--------------|----------|---------|
| **Orphan Action** | Action без Actor | Назначить ответственного |
| **Ambiguous Action** | `"Обработать"` — непонятно, что делать | Конкретизировать глагол |
| **Side-Effect Action** | Action меняет несколько Entities | Разделить на атомарные Actions |
| **Unbound Action** | Action не привязан ни к одному State | Определить allowed_in_states |

---

### 8.4 Анти-паттерны Rule

| Анти-паттерн | Проблема | Решение |
|--------------|----------|---------|
| **Vague Rule** | `"Качество должно быть хорошим"` | Формализовать: `quality_score > 0.8` |
| **Untestable Rule** | Condition невозможно вычислить | Переформулировать с измеримыми метриками |
| **Conflicting Rules** | Два Rule противоречат друг другу | Определить приоритеты |
| **Missing On_Violation** | Rule без реакции на нарушение | Добавить on_violation |

---

### 8.5 Анти-паттерны Fact

| Анти-паттерн | Проблема | Решение |
|--------------|----------|---------|
| **Future Fact** | `"Будет утверждено"` — не прошедшее время | Использовать прошедшее: `"Утверждено"` |
| **Duplicate Fact** | Один Fact создаётся дважды | Обеспечить идемпотентность |
| **Orphan Fact** | Fact не триггерит никакой переход | Связать с State transition или удалить |
| **Missing Payload** | Fact без контекста произошедшего | Добавить payload с деталями |

---

# Часть IV: Метод применения

## 9. Event Storming: Полная интеграция

Event Storming — метод моделирования процессов через размещение событий на временной шкале.

### 9.1 Элементы Event Storming и маппинг

| Event Storming | Цвет стикера | Элемент мета-методологии |
|----------------|--------------|--------------------------|
| Domain Event | Оранжевый | **Fact** |
| Command | Синий | **Action** |
| Actor | Жёлтый (маленький) | **Actor** |
| Aggregate | Жёлтый (большой) | **Entity** |
| Policy | Сиреневый | **Rule** (тип: Guard) |
| Read Model | Зелёный | View для Actor (не элемент) |
| External System | Розовый | **Tool** (тип: API) |
| Hot Spot | Красный/Розовый | Неопределённость (пометка для обсуждения) |

### 9.2 Процесс Event Storming сессии

**Фаза 1: Chaotic Exploration (15-30 мин)**
1. Участники пишут Domain Events (оранжевые) — что происходит в процессе
2. Размещают на timeline слева направо
3. Не обсуждают, не структурируют — просто выгружают знания

**Фаза 2: Enforce Timeline (15-20 мин)**
1. Группируют дубликаты
2. Выстраивают хронологический порядок
3. Отмечают Hot Spots (неясности, споры)

**Фаза 3: Add Commands & Actors (20-30 мин)**
1. Перед каждым Event добавляют Command (синий) — что вызвало событие
2. К каждому Command добавляют Actor — кто выполняет
3. Проверяют: каждый Event должен иметь причину (Command)

**Фаза 4: Add Aggregates & Policies (20-30 мин)**
1. Группируют Events вокруг Aggregates (Entity)
2. Добавляют Policies — реактивную логику "когда X, делай Y"
3. Выделяют External Systems

**Фаза 5: Identify Bounded Contexts (15-20 мин)**
1. Обводят группы, которые могут работать независимо
2. Определяют связи между контекстами (только через Events)

**Фаза 6: Resolve Hot Spots (время варьируется)**
1. Обсуждают каждый Hot Spot
2. Принимают решения, фиксируют в Decision Log

### 9.3 Трансформация в мета-методологию

После Event Storming сессии:

| Event Storming результат | Действие |
|--------------------------|----------|
| Domain Events | Преобразовать в Facts, проверить прошедшее время |
| Commands | Преобразовать в Actions, определить Tools |
| Actors | Определить типы (Human/AI/System), назначить Tools |
| Aggregates | Определить Entity schemas |
| Policies | Преобразовать в Rules, формализовать conditions |
| Bounded Contexts | Определить границы, проверить связи только через Facts |
| Hot Spots | Преобразовать в открытые вопросы или риски |

---

## 10. Пошаговый процесс создания методологии

### Шаг 1: Определить центральную Entity

**Вопрос:** Какой объект проходит через весь процесс?

```yaml
Entity:
  type: "ProductBrief"
  schema:
    title: string (required)
    description: string (required)
    market_score: number (nullable)
    status: enum [draft, validated, approved, rejected]
```

### Шаг 2: Определить Lifecycle (States)

**Вопрос:** Через какие фазы проходит Entity?

```yaml
States:
  - id: initial
    name: "Created"
    type: Initial

  - id: drafting
    name: "Drafting"
    type: Working

  - id: validation
    name: "Market Validation"
    type: Working

  - id: approved
    name: "Approved"
    type: Terminal

  - id: rejected
    name: "Rejected"
    type: Terminal

  - id: failed
    name: "Failed"
    type: Error
```

### Шаг 3: Определить Facts (переходы)

**Вопрос:** Какие события переводят Entity между States?

```yaml
Facts:
  - name: "Brief Created"
    from_state: initial
    to_state: drafting

  - name: "Draft Completed"
    from_state: drafting
    to_state: validation

  - name: "Market Validated"
    from_state: validation
    to_state: approved
    condition: market_score > 1000000

  - name: "Market Rejected"
    from_state: validation
    to_state: rejected
    condition: market_score <= 1000000

  - name: "Validation Failed"
    from_state: validation
    to_state: failed
    trigger: error
```

### Шаг 4: Определить Workforce (Actors + Tools)

**Вопрос:** Кто участвует и какими инструментами пользуется?

```yaml
Actors:
  - id: pm
    name: "Product Manager"
    type: Human
    tools: [jira_ui, confluence_ui]

  - id: analyst
    name: "AI Market Analyst"
    type: AI
    tools: [google_trends_api, market_research_llm]

Tools:
  - id: jira_ui
    name: "Jira Interface"
    type: UI
    compatible_actors: [Human]

  - id: google_trends_api
    name: "Google Trends API"
    type: API
    compatible_actors: [AI, System]

  - id: market_research_llm
    name: "Market Research LLM"
    type: LLM
    compatible_actors: [AI]
```

### Шаг 5: Определить Actions

**Вопрос:** Какие действия выполняются в каждом State?

```yaml
Actions:
  - id: create_brief
    name: "Create Brief"
    actor: pm
    tool: jira_ui
    allowed_in_states: [initial]
    output: Fact("Brief Created")

  - id: complete_draft
    name: "Complete Draft"
    actor: pm
    tool: confluence_ui
    allowed_in_states: [drafting]
    output: Fact("Draft Completed")

  - id: validate_market
    name: "Validate Market"
    actor: analyst
    tool: google_trends_api
    allowed_in_states: [validation]
    output: Entity.market_score
    retry:
      max_attempts: 3
      delay: exponential
```

### Шаг 6: Определить Rules

**Вопрос:** Какие условия ограничивают процесс?

```yaml
Rules:
  - id: market_threshold
    name: "Market Size Threshold"
    type: Guard
    condition: entity.market_score > 1000000
    scope: transition(validation -> approved)
    on_violation: Redirect(rejected)

  - id: required_fields
    name: "Required Fields Present"
    type: Precondition
    condition: entity.title != null AND entity.description != null
    scope: action(complete_draft)
    on_violation: Block

  - id: max_validation_time
    name: "Validation Timeout"
    type: Constraint
    condition: time_in_state(validation) < 48h
    scope: state(validation)
    on_violation: Alert + Escalate
```

### Шаг 7: Валидация

Проверить по чеклисту (Приложение B).

---

## 11. Миграция существующих процессов

### 11.1 Процесс миграции

**Фаза 1: Археология (1-2 дня)**
1. Собрать все артефакты текущего процесса (документы, инструкции, чеклисты)
2. Провести интервью с участниками: "Расскажите, как реально работает процесс"
3. Зафиксировать расхождения между документацией и реальностью

**Фаза 2: Маппинг (0.5-1 день)**
1. Идентифицировать неявные States (часто скрыты в статусах задач)
2. Идентифицировать Actors (роли в существующей системе)
3. Идентифицировать Facts (что триггерит переходы)

**Фаза 3: Формализация (1-2 дня)**
1. Описать элементы в формате мета-методологии
2. Выявить пробелы (недостающие Rules, Error States)
3. Заполнить пробелы

**Фаза 4: Валидация (0.5 дня)**
1. Пройти чеклист
2. Прогнать один сквозной сценарий на бумаге
3. Получить подтверждение от stakeholders

### 11.2 Типичные проблемы при миграции

| Проблема | Признак | Решение |
|----------|---------|---------|
| Скрытые States | "Статус задачи не отражает реальность" | Добавить промежуточные States |
| Неявные Actors | "Кто-то должен это проверить" | Явно назначить Actor |
| Отсутствие Error handling | "Если ошибка — пишем в Slack" | Формализовать Error States |
| Размытые Rules | "Менеджер решает" | Формализовать критерии решения |

---

# Часть V: Примеры

## 12. Пример 1: Hello World

**Задача:** Согласовать текст поста в соцсети.

### Элементы

```yaml
Entity:
  type: SocialPost
  schema:
    text: string (max: 280)
    status: enum [draft, pending, published, rejected]

States:
  - Created (Initial)
  - Draft (Working)
  - Pending Review (Waiting)
  - Published (Terminal)
  - Rejected (Terminal)

Actors:
  - Copywriter (Human) + Tool: Google Docs
  - Manager (Human) + Tool: Approval UI

Actions:
  - Write Post: Copywriter создаёт текст
  - Submit for Review: Copywriter отправляет на проверку
  - Approve: Manager утверждает
  - Reject: Manager отклоняет

Facts:
  - "Post Created" → Created
  - "Draft Started" → Draft
  - "Submitted" → Pending Review
  - "Approved" → Published
  - "Rejected" → Rejected

Rules:
  - Text Length: len(text) <= 280, Guard на Submit
  - Required Text: text != empty, Precondition на Submit
```

### Диаграмма

```
[Created] ──"Draft Started"──► [Draft] ──"Submitted"──► [Pending Review] ──"Approved"──► [Published]
                                                                │
                                                                └──"Rejected"──► [Rejected]

Rule: len(text) <= 280 применяется перед "Submitted"
```

---

## 13. Пример 2: Product Launch

**Задача:** От идеи до анонса продукта через три контекста.

### Bounded Contexts

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  PRODUCT CONTEXT    │    │   LEGAL CONTEXT     │    │ MARKETING CONTEXT   │
│                     │    │                     │    │                     │
│ Drafting            │    │ Legal Review        │    │ Content Generation  │
│      ↓              │    │      ↓              │    │      ↓              │
│ Market Validation   │    │ Naming Correction   │    │ Final Approval      │
│      ↓              │    │ (if needed)         │    │      ↓              │
│ [Validated] ════════╪═══►╪═► [Review Start]    │    │ [Published]         │
│                     │    │         ↓           │    │                     │
│                     │    │ [Legal Clear] ══════╪═══►╪═► [Content Start]   │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### Product Context

```yaml
Entity: ProductBrief
States: [Drafting, MarketValidation, Validated, Failed]

Actors:
  - ProductManager (Human): Jira UI, Confluence
  - AIAnalyst (AI): GoogleTrendsAPI, WolframAlpha

Actions:
  - CreateInitiative: PM создаёт brief
  - EvaluateMarket: AI оценивает TAM (Total Addressable Market)

Facts:
  - "Initiative Described" → MarketValidation
  - "Market Validated" → Validated (if score > 1M)
  - "Market Insufficient" → Failed (if score <= 1M)

Rules:
  - MarketThreshold: market_score > 1000000
  - Timeout: 48h на validation, on_timeout → Escalate
```

### Legal Context

```yaml
Entity: ComplianceReport
States: [LegalReview, NamingCorrection, LegalClear, LegalBlocked]

Actors:
  - AILawyer (AI): USPTOSearchAPI, LLMBrainstorm
  - ProductManager (Human): SelectionUI

Actions:
  - SearchConflicts: AI ищет патентные конфликты
  - GenerateAlternatives: AI генерирует альтернативы
  - SelectName: PM выбирает имя

Facts:
  - "Conflicts Found" → NamingCorrection
  - "No Conflicts" → LegalClear
  - "Alternative Selected" → LegalClear
  - "Cannot Resolve" → LegalBlocked

Rules:
  - PatentCheck: patent_conflicts == 0 для LegalClear
  - MaxAlternatives: max 5 итераций генерации
```

### Marketing Context

```yaml
Entity: ContentPack
States: [ContentGeneration, FinalApproval, Published, ContentFailed]

Actors:
  - AIMarketer (AI): LLMCopywriter, RAGBrandbook
  - Editor (Human): CMSUI

Actions:
  - WriteContent: AI пишет статью
  - ReviewContent: Editor проверяет
  - Publish: Editor публикует

Facts:
  - "Draft Ready" → FinalApproval
  - "Content Approved" → Published
  - "Content Rejected" → ContentGeneration (retry)

Rules:
  - ToneOfVoice: content matches brandbook
  - MaxRetries: max 3 итерации генерации
```

---

## 14. Пример 3: Итеративная генерация

**Задача:** AI генерирует контент, Human оценивает, цикл до достижения качества.

### Элементы

```yaml
Entity:
  type: GeneratedContent
  schema:
    prompt: string
    content: string
    quality_score: number (0-1)
    iteration: number
    feedback: list[string]

States:
  - Generating (Working)
  - HumanReview (Waiting)
  - Accepted (Terminal)
  - MaxIterationsReached (Terminal)
  - Failed (Error)

Actors:
  - AIGenerator (AI): LLMGeneratorTool
  - Reviewer (Human): ReviewUI

Actions:
  - Generate: AI создаёт контент
  - Evaluate: Human оценивает и даёт feedback
  - Accept: Human принимает результат
  - RequestRevision: Human запрашивает доработку

Facts:
  - "Content Generated" → HumanReview
  - "Revision Requested" → Generating (iteration++)
  - "Content Accepted" → Accepted
  - "Max Iterations Hit" → MaxIterationsReached
  - "Generation Failed" → Failed

Rules:
  - MaxIterations: iteration <= 5, Constraint
  - QualityThreshold: quality_score >= 0.8 для auto-accept (optional)
  - Timeout: 24h на HumanReview, on_timeout → Alert
  - RetryOnError: 3 attempts на Generate, on_exhausted → Failed
```

### Диаграмма с циклом

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
[Generating] ──"Generated"──► [HumanReview] ──"Revision"──┘
     │                              │
     │                              ├──"Accepted"──► [Accepted]
     │                              │
     └──"Failed"──► [Failed]        └──"MaxIterations"──► [MaxIterationsReached]

Rule: iteration <= 5 проверяется при "Revision"
```

---

# Часть VI: Мета-уровень

## 15. Мета-методология о себе

Мета-методология применима к процессу создания методологий — это демонстрирует её универсальность.

```yaml
Entity: Methodology
  schema: { name, version, entities, states, actors, tools, actions, facts, rules }

States: [Conception] → [Modeling] → [Validation] → [Deployment] → [Evolution]
                            ↑              │
                            └──────────────┘ (if validation fails)

Key Rules:
  - AllElementsDefined: все 8 типов элементов определены
  - NoDeadlockStates: каждый не-Terminal State имеет выход
  - ActorToolCompatibility: все пары Actor-Tool совместимы
```

Подробная валидация методологий — в [разделе 19](#19-тестирование-методологий).

---

## 16. Эволюция и версионирование

### 16.1 Типы изменений

| Тип | Влияние | Пример | Версия |
|-----|---------|--------|--------|
| **Patch** | Не ломает процессы | Изменение Rule threshold | x.x.+1 |
| **Minor** | Расширяет возможности | Новый State, новый Actor | x.+1.0 |
| **Major** | Ломает совместимость | Изменение Entity schema, удаление State | +1.0.0 |

### 16.2 Что требует какой версии

| Изменение | Тип версии |
|-----------|------------|
| Изменение condition в Rule | Patch |
| Добавление нового Tool | Patch |
| Добавление нового State | Minor |
| Добавление нового Actor | Minor |
| Добавление нового Bounded Context | Minor |
| Изменение Entity schema (новое поле optional) | Minor |
| Изменение Entity schema (новое поле required) | Major |
| Удаление State | Major |
| Изменение Fact name | Major |
| Изменение связей между Contexts | Major |

### 16.3 Стратегии миграции

**Blue-Green:** Запуск новой версии параллельно, переключение трафика.

**Canary:** Постепенный перевод % процессов на новую версию.

**Feature Flag:** Условное включение изменений по Rule.

---

## 17. Границы применимости

### 17.1 Мета-методология подходит для

| Сценарий | Почему подходит |
|----------|-----------------|
| Человеко-AI коллаборации | Явное разделение Actor types |
| Процессы с чёткими этапами | States фиксируют фазы |
| Кросс-функциональные процессы | Bounded Contexts изолируют домены |
| Процессы требующие аудита | Facts создают immutable history |
| Процессы с SLA | Rules и Timeouts формализуют ограничения |

### 17.2 Мета-методология НЕ подходит для

| Сценарий | Почему не подходит | Альтернатива |
|----------|-------------------|--------------|
| Полностью хаотические процессы | Невозможно определить States | Kanban без формализации |
| Real-time системы (< 100ms) | Overhead на State machine | Event-driven без states |
| Физические процессы без агентов | Нет Actors | Физическое моделирование |
| Одноразовые ad-hoc задачи | Overhead на описание | Простой чеклист |

### 17.3 Пограничные случаи

| Сценарий | Рекомендация |
|----------|--------------|
| Творческие процессы | Использовать паттерн Iterative Loop с quality threshold |
| Исследовательские процессы | States как checkpoints, не как строгие фазы |
| Процессы с высокой неопределённостью | Больше Hot Spots, итеративное уточнение |

---

# Часть VII: Практика

## 18. Инструменты

### 18.1 Визуализация

| Инструмент | Тип | Применение |
|------------|-----|------------|
| Miro / FigJam | Whiteboard | Event Storming сессии |
| draw.io | Диаграммы | State machines, flowcharts |
| PlantUML | Code-as-diagram | Версионируемые диаграммы |
| Excalidraw | Скетчи | Быстрые наброски |

### 18.2 Валидация

JSON Schema для валидации методологии:

```yaml
$schema: "https://json-schema.org/draft/2020-12/schema"
type: object
required: [entity, states, actors, actions, facts]
properties:
  entity:
    type: object
    required: [type, schema]
  states:
    type: array
    minItems: 2  # минимум Initial + Terminal
    items:
      type: object
      required: [id, name, type]
      properties:
        type:
          enum: [Initial, Working, Waiting, Terminal, Error]
  actors:
    type: array
    minItems: 1
    items:
      required: [id, name, type, tools]
  # Полная схема: см. репозиторий
```

### 18.3 Автоматизация

| Трансформация | Описание | Инструмент |
|---------------|----------|------------|
| YAML → State Machine | Генерация XState/Robot конфигурации | Custom script |
| YAML → Documentation | Генерация Markdown/HTML документации | Custom script |
| YAML → Tests | Генерация property-based тестов | Hypothesis/fast-check |
| YAML → Diagram | Генерация PlantUML/Mermaid | Custom script |

### 18.4 Практические расширения

При реализации конкретных методологий допускается расширение базовой схемы для практических нужд. Эти расширения обратно совместимы и не нарушают семантику базовых 8 элементов.

#### Tool type: MCP

Спецификация определяет типы Tool: `API`, `UI`, `LLM`, `Script`, `Manual`.

**Расширение:** Тип `MCP` (Model Context Protocol) для инструментов, работающих через MCP-серверы в Claude Code и других AI-агентах.

```yaml
tools:
  - id: "mcp_pcc"
    name: "PCC MCP Server"
    type: "MCP"  # Расширение: Model Context Protocol
    compatible_actors: ["AI"]
    input_schema:
      release_id: "string (required)"
      artifact_type: "string (optional)"
    output_schema:
      success: "boolean"
      error: "string (optional)"
```

**Обоснование:** MCP — стандарт для tool use в современных AI-агентах, семантически ближе к API, но с собственным протоколом.

#### Секция: phase_defaults

**Назначение:** SSOT (Single Source of Truth) для генерации `processes/*.json` из `methodology.yaml`.

```yaml
phase_defaults:
  RELEASE:
    template: "RELEASE_TEMPLATE.md"
    validators:
      - "release_state_valid_schema"
      - "release_has_problem"
    skip_allowed: false

  BC_DELTA:
    template: "BC_DELTA_TEMPLATE.md"
    validators:
      - "bc_has_goals"
      - "bc_has_actors"
    approval_role: "product_owner"
```

**Использование:** Команда `ref101-meta generate <namespace>` использует `phase_defaults` для генерации JSON-конфигураций процессов.

#### Секция: processes

**Назначение:** Предопределённые композиции States для типичных сценариев использования методологии.

```yaml
processes:
  - id: "feature_full"
    version: "1.0.0"
    name: "Feature Development (Full)"
    type: "feature_development"
    states_sequence:
      - "RELEASE"
      - "BC_DELTA"
      - "AC_DELTA"
      - "PLAN_FINALIZE"
      - "PC"
      - "IC"
      - "QA"
      - "DEPLOY"
    approval_points:
      BC_DELTA: { role: "product_owner" }
      QA: { role: "qa_lead" }
    nodes:
      "sccu:workflow-engine": "^1.0.0"
```

**Отличие от базовой модели:** Спецификация определяет 8 базовых элементов. `processes` — это композиция `States` с дополнительной метаинформацией для runtime-конфигурации.

#### Entity.role

**Назначение:** Разделение сущностей на primary (проходят через States) и secondary (создаются как side effect).

```yaml
entities:
  - id: "release"
    type: "Release"
    role: "primary"  # Проходит через States
    artifacts:
      - "release_artifact"
      - "pc_artifact"
```

**Обоснование:** В сложных методологиях одна Entity проходит workflow, а другие создаются в процессе. Атрибут `role` делает это явным.

---

## 19. Тестирование методологий

### 19.1 Статическая валидация

| Проверка | Что ищем | Метод |
|----------|----------|-------|
| Schema validation | YAML соответствует JSON Schema | ajv, jsonschema |
| Reachability | Все States достижимы из Initial | Graph traversal (BFS) |
| Termination | Из всех States достижим Terminal | Graph traversal |
| Completeness | Все элементы связаны | Reference checker |
| No deadlocks | Нет не-Terminal States без выхода | Graph analysis |

### 19.2 Симуляция

```python
def simulate_happy_path(methodology):
    """Симуляция успешного прохождения процесса."""
    entity = create_entity(methodology.entity.schema)
    current_state = methodology.initial_state
    path = [current_state]

    while not is_terminal(current_state):
        action = select_allowed_action(current_state)
        fact = execute_action(action, entity)
        current_state = apply_transition(fact, current_state)
        path.append(current_state)

    assert current_state.type == "Terminal"
    assert current_state.name != "Error"
    return path
```

### 19.3 Property-based тесты для Rules

```python
from hypothesis import given, strategies as st

@given(market_score=st.integers(min_value=0, max_value=10_000_000))
def test_market_threshold_rule(market_score):
    """Проверка детерминированности Rule."""
    rule = MarketThresholdRule(threshold=1_000_000)
    result = rule.evaluate(market_score)

    if market_score > 1_000_000:
        assert result.next_state == "Approved"
    else:
        assert result.next_state == "Rejected"
```

---

## 20. Метрики эффективности

### 20.1 Операционные метрики

| Метрика | Формула | Целевое значение |
|---------|---------|------------------|
| Cycle Time | avg(Terminal.timestamp - Initial.timestamp) | Зависит от домена |
| Error Rate | count(Error Facts) / count(All Facts) | < 5% |
| Iteration Count | avg(iterations in Loop patterns) | < max_iterations / 2 |
| Timeout Rate | count(Timeout Facts) / count(Waiting entries) | < 10% |
| Human Intervention | count(Escalation Facts) / count(AI Actions) | < 20% |

### 20.2 Сбор метрик

Каждый Fact содержит `timestamp` → агрегация по `Entity.history`:

```python
def calculate_cycle_time(entity):
    """Вычисление времени прохождения процесса."""
    facts = entity.history
    start = next(f for f in facts if f.triggers_state.type == "Initial")
    end = next(f for f in reversed(facts) if f.triggers_state.type == "Terminal")
    return end.timestamp - start.timestamp

def calculate_error_rate(entities):
    """Вычисление процента ошибок."""
    total = len(entities)
    errors = sum(1 for e in entities if e.current_state.type == "Error")
    return errors / total if total > 0 else 0
```

---

# Приложения

## Приложение A: Глоссарий

| Термин | Определение |
|--------|-------------|
| **State** | Именованная фаза жизненного цикла Entity |
| **Actor** | Исполнитель (Human/AI/System) с набором Tools |
| **Tool** | Инструмент для выполнения Action |
| **Action** | Единица работы, изменяющая Entity или создающая Fact |
| **Entity** | Бизнес-объект, проходящий через States |
| **Artifact** | Файл/документ, привязанный к Entity |
| **Fact** | Неизменяемое событие, триггер перехода |
| **Rule** | Логическое условие, ограничивающее процесс |
| **Bounded Context** | Независимый модуль методологии |
| **Event Storming** | Метод моделирования через события на timeline |
| **Guard** | Rule, проверяемый при переходе между States |
| **Compensation** | Обратное действие для отката изменений |
| **Saga** | Паттерн управления распределёнными транзакциями |

---

## Приложение B: Чеклист проектирования

### Структура

- [ ] Определена центральная Entity с JSON Schema
- [ ] Определён Initial State (ровно один)
- [ ] Определены Terminal States (минимум один успешный + один для ошибок)
- [ ] Все States имеют уникальные имена

### Полнота

- [ ] Каждый не-Terminal State имеет минимум один выход
- [ ] Каждый Action имеет назначенного Actor
- [ ] Каждый Actor имеет минимум один Tool
- [ ] Каждый Tool совместим с типом своего Actor
- [ ] Каждый Fact написан в прошедшем времени
- [ ] Каждый Rule имеет формальный condition

### Отказоустойчивость

- [ ] Определён Error State
- [ ] Working States имеют путь в Error State
- [ ] Waiting States имеют Timeout
- [ ] Actions с внешними вызовами имеют Retry
- [ ] Кросс-контекстные процессы имеют Compensation

### Валидация

- [ ] Прогнан Happy Path сценарий
- [ ] Прогнан Error Path сценарий
- [ ] Проверены все Rules на тестируемость
- [ ] Нет циклов без exit condition
- [ ] Bounded Contexts связаны только через Facts

---

## Приложение C: Полный шаблон методологии

Подробные определения атрибутов каждого элемента — в [разделе 4](#4-элементы-формальные-определения).

```yaml
# ===== МЕТОДОЛОГИЯ: <Название> =====
# Версия: 1.0.0

# --- ENTITY ---
entity:
  type: <EntityName>
  schema:
    field1: string (required)
    field2: number (nullable)
    status: enum [state1, state2, ...]

# --- STATES ---
states:
  - id: created
    name: "Created"
    type: Initial
  - id: processing
    name: "Processing"
    type: Working
    timeout: 24h
  - id: completed
    name: "Completed"
    type: Terminal
  - id: failed
    name: "Failed"
    type: Error

# --- ACTORS ---
actors:
  - id: human_user
    type: Human
    tools: [ui_form]
  - id: ai_processor
    type: AI
    tools: [llm_api, external_api]

# --- TOOLS ---
tools:
  - id: ui_form
    type: UI
    compatible_actors: [Human]
  - id: llm_api
    type: LLM
    compatible_actors: [AI]
    retry: { max: 3, delay: exponential }

# --- ACTIONS ---
actions:
  - id: create
    name: "Create"
    actor: human_user
    tool: ui_form
    allowed_in_states: [created]
    output: Fact(entity_created)
  - id: process
    name: "Process"
    actor: ai_processor
    tool: llm_api
    allowed_in_states: [processing]
    output: Entity.result

# --- FACTS ---
facts:
  - id: entity_created
    name: "Entity Created"
    from: created → processing
  - id: processing_completed
    name: "Processing Completed"
    from: processing → completed
  - id: processing_failed
    name: "Processing Failed"
    from: processing → failed

# --- RULES ---
rules:
  - id: required_fields
    type: Precondition
    condition: entity.field1 != null
    scope: action(create)
    on_violation: Block
  - id: timeout_rule
    type: Constraint
    condition: time_in_state < 24h
    scope: state(processing)
    on_violation: Alert
```

---

## Приложение D: FAQ

### Q: Что если Actor может быть и Human, и AI?

**A:** Создайте абстрактный Actor с двумя реализациями:

```yaml
Actors:
  - id: reviewer
    name: "Reviewer"
    type: Abstract
    implementations:
      - HumanReviewer (Human) + Tool: ReviewUI
      - AIReviewer (AI) + Tool: LLMReviewAPI
    selection_rule: "Use AI if confidence > 0.9, else Human"
```

### Q: Как моделировать процессы с неизвестным числом шагов?

**A:** Используйте Dynamic States с генерацией:

```yaml
State:
  id: processing_item_{n}
  type: Dynamic
  generator: "for each item in entity.items"
  template:
    allowed_actions: [process_item]
    exit_conditions: [item_processed]
```

### Q: Можно ли иметь несколько Entity в одном процессе?

**A:** Да, но одна должна быть Primary (проходит через States), остальные — Secondary (создаются/модифицируются как side effects).

```yaml
Entities:
  - type: Order        # Primary
    role: primary
  - type: Payment      # Secondary
    role: secondary
    created_by: action(process_payment)
  - type: Notification # Secondary
    role: secondary
    created_by: action(send_confirmation)
```

### Q: Как обрабатывать частичный успех в Fork-Join?

**A:** Используйте Join условие с обработкой частичного результата:

```yaml
Join:
  condition: QUORUM(2 of 3)
  on_partial_success:
    - log_missing_results
    - continue_with_available
  on_complete_failure:
    - redirect_to: ErrorState
```

### Q: Когда использовать Bounded Context вместо States?

**A:**
- **States** — для фаз одного процесса с одной командой
- **Bounded Context** — для независимых доменов с разными командами/ответственными

Признаки необходимости Bounded Context:
- Разные Entity schemas для одного понятия
- Разные команды владеют разными частями процесса
- Части процесса могут развиваться независимо

---

_Версия документа: 3.1_
_Дата: 2026-01-16_
