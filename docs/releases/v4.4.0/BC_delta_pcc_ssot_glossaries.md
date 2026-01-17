# BC_delta: SSOT Glossaries for Methodologies

**Release:** v4.4.0
**Date:** 2026-01-17
**Status:** Draft

---

## Problem Statement

Глоссарии в проекте разрознены и не следуют принципу SSOT:
- `meta/README.md` содержит Приложение A с 13 базовыми терминами мета-методологии
- `core/GLOSSARY.md` содержит полный глоссарий SCCU (706 строк)
- Namespace-глоссарии (`namespaces/*/GLOSSARY.md`) отсутствуют

**Последствия:**
- Нет единого источника истины для терминов каждой методологии
- Дублирование определений между файлами
- Сложность поддержки и версионирования

---

## Goals

| ID | Goal | Success Criteria |
|----|------|------------------|
| G1 | SSOT для мета-методологии | `meta/GLOSSARY.md` содержит 8 базовых элементов |
| G2 | SSOT для namespace SCCU | `namespaces/sccu/GLOSSARY.md` содержит все термины SCCU |
| G3 | SSOT для namespace Node Hub | `namespaces/node-hub/GLOSSARY.md` существует |
| G4 | Устранение дублирования | `core/GLOSSARY.md` удалён, ссылки обновлены |

---

## Actors

| Actor | Type | Role |
|-------|------|------|
| Methodology Author | Human | Создаёт и поддерживает глоссарии |
| Claude Agent | AI | Использует глоссарии для понимания терминов |
| Developer | Human | Обращается к глоссариям для понимания терминов |

---

## Features

### F1: Meta Glossary
Создание `meta/GLOSSARY.md` с 8 базовыми элементами мета-методологии:
- State, Actor, Tool, Action, Entity, Artifact, Fact, Rule
- Формат: версионирование, примеры, связи

### F2: SCCU Namespace Glossary
Создание `namespaces/sccu/GLOSSARY.md`:
- Миграция всего содержимого из `core/GLOSSARY.md`
- Добавление секции наследования от `meta/GLOSSARY.md`
- Термины: SCCU, BC, AC, PC, IC, CCC, PA, PDC, EPA, A11y, XSS и др.

### F3: Node Hub Namespace Glossary
Создание `namespaces/node-hub/GLOSSARY.md`:
- Минимальный шаблон с секцией наследования
- Готовность к расширению по мере развития namespace

### F4: Cleanup
- Удаление `core/GLOSSARY.md`
- Обновление ссылок в `core/QUICK_REFERENCE.md`
- Удаление Приложения A из `meta/README.md`, добавление ссылки

---

## Scenarios

### SC1: Developer looks up a term
1. Developer открывает глоссарий соответствующего namespace
2. Находит термин с определением и примерами
3. При необходимости переходит по ссылке на базовый термин в meta/

### SC2: Claude Agent loads context
1. Agent загружает `namespaces/sccu/GLOSSARY.md`
2. Видит секцию наследования со ссылкой на meta/
3. При необходимости загружает базовые термины из meta/GLOSSARY.md

---

## Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR1 | Каждый термин определяется ровно в одном файле | Mandatory |
| BR2 | Namespace-глоссарий ссылается на meta/, не копирует | Mandatory |
| BR3 | Все глоссарии имеют версионирование (SemVer) | Mandatory |
| BR4 | Changelog обязателен для каждого глоссария | Recommended |
