# Phase: VALIDATION

> Проверка методологии на корректность

## Уровни валидации

### L1: Schema Validation

**Что проверяется:** YAML соответствует JSON Schema мета-методологии.

**Команда:**
```
meta_validate({ namespace: "{name}", level: "L1" })
```

**Типичные ошибки L1:**
- Отсутствуют обязательные поля
- Неправильный тип данных
- Невалидный YAML синтаксис

### L2: Link Validation

**Что проверяется:** Все ссылки между элементами корректны.

**Команда:**
```
meta_validate({ namespace: "{name}", level: "L2" })
```

**Проверки:**
- [ ] Все `actor` ссылки в Actions существуют в `actors[]`
- [ ] Все `tool` ссылки в Actions существуют в `tools[]`
- [ ] Все `from_state`/`to_state` в Facts существуют в `states[]`
- [ ] Все `triggered_by` в Facts существуют в `actions[]`
- [ ] Все `allowed_in_states` в Actions существуют в `states[]`

**Типичные ошибки L2:**
- Action ссылается на несуществующий Actor
- Fact ссылается на несуществующий State
- Tool указан, но не определён

### L3: Static Analysis

**Что проверяется:** Логическая корректность методологии.

**Команда:**
```
meta_validate({ namespace: "{name}", level: "L3" })
```

**Проверки:**
- [ ] Нет недостижимых States (unreachable)
- [ ] Нет deadlock States (не-Terminal без выхода)
- [ ] Все не-Terminal States имеют exit
- [ ] Ровно 1 Initial State
- [ ] Минимум 1 Terminal State
- [ ] Есть Error State
- [ ] Все Working States имеют путь в Error
- [ ] Waiting States имеют timeout
- [ ] Actor-Tool совместимость

**Типичные ошибки L3:**
- State без исходящих переходов (не Terminal)
- Несколько Initial States
- Отсутствует Error State
- AI Actor с UI Tool

## Процесс валидации

### Шаг 1: Запуск полной валидации

```
meta_validate({ namespace: "{name}", level: "all" })
```

### Шаг 2: Анализ результатов

**Если L1 failed:**
→ Вернуться к соответствующей фазе, исправить структуру

**Если L2 failed:**
→ Исправить ссылки между элементами

**Если L3 failed:**
→ Исправить логику процесса

### Шаг 3: Повторная валидация

После исправлений повторить валидацию до `all_passed: true`.

## Чеклист (Приложение B из README.md)

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

### Валидация
- [ ] Прогнан Happy Path сценарий
- [ ] Прогнан Error Path сценарий
- [ ] Проверены все Rules на тестируемость
- [ ] Нет циклов без exit condition

## Пример отчёта валидации

```
Validation Report: my_methodology
=================================

L1 (Schema): PASSED
  - All required fields present
  - Valid YAML structure
  - Types correct

L2 (Links): PASSED
  - 5 actors validated
  - 8 tools validated
  - 12 states validated
  - 15 facts validated
  - 20 actions validated

L3 (Analysis): PASSED
  - Initial states: 1 ✓
  - Terminal states: 3 ✓
  - Error states: 1 ✓
  - Unreachable states: 0 ✓
  - Deadlock states: 0 ✓
  - Actor-Tool compatibility: OK ✓

RESULT: ALL PASSED ✓
```

## Критерии выхода

- [x] L1 passed
- [x] L2 passed
- [x] L3 passed
- [x] Чеклист пройден

## Переход

**Предыдущая фаза:** RULES_DESIGN
**Следующая фаза:** COMPLETE
