# Living Documentation Guide

**Version:** 1.1.0
**Last Updated:** 2026-01-04
**Purpose:** Методология накопления BC/AC документации с единым источником истины

> **This is a sub-process of APPLY_DELTAS phase.** See: [WORKFLOW.md](../WORKFLOW.md)

---

## Проблема

При росте проекта BC и AC документы накапливаются без агрегации:

```
После 10 релизов:
├── BC_feature_v1.md      # v1.0.0 функции
├── BC_feature_v2.md      # v2.0.0 добавления
├── BC_feature_v3.md      # v3.0.0 изменения
├── AC_feature_v1.md
├── AC_feature_v2.md
└── AC_feature_v3.md
```

**Проблемы:**
- Чтобы понять текущее состояние нужно прочитать все 6+ файлов
- Нет единого документа с полной функциональностью
- Функции разбросаны по версиям без явной связи
- LLM context window заполняется избыточной историей

---

## Решение: Incremental State Machine

### Концепция

```
┌──────────────────────────────────────────────────────────────┐
│                   3-TIER ARCHITECTURE                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Tier 1: OVERVIEW.md (~200 строк)                           │
│  ├── Описание продукта                                       │
│  ├── Список доменов                                          │
│  └── Ключевые capabilities                                   │
│                                                              │
│  Tier 2: BC/AC_DOMAIN_*.md (~500-1000 строк каждый)         │
│  ├── BC_DOMAIN_ui.md      (Features, Goals, Scenarios)      │
│  ├── AC_DOMAIN_ui.md      (Use Cases, API, Data Models)     │
│  ├── BC_DOMAIN_tracker.md                                    │
│  └── AC_DOMAIN_tracker.md                                    │
│                                                              │
│  Tier 3: deltas/ (архив изменений)                          │
│  └── v{X.Y.Z}/                                              │
│      ├── BC_delta_*.md    (BC изменения)                    │
│      └── AC_delta_*.md    (AC изменения)                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Принципы

1. **BC/AC = delta-документы**: описывают только изменения относительно предыдущей версии
2. **DOMAIN_*.md = master documents**: текущее полное состояние по домену
3. **OVERVIEW.md = навигатор**: высокоуровневый обзор для быстрого старта
4. **deltas/ = архив**: для recovery при сбое и audit trail
5. **applied_deltas = трассировка**: список применённых delta в каждом DOMAIN

### Стоимость операций

| Операция | Сложность | Когда выполняется |
|----------|-----------|-------------------|
| Применить delta | O(1) | Каждый релиз |
| Читать DOMAIN | O(1) | При работе с продуктом |
| Полная перегенерация | O(n) | Только при recovery |

---

## Файловая структура

```
docs/
├── TOOLS_INDEX.md                 # Multi-tool registry
├── OVERVIEW_{tool}.md             # Per-tool overview
│
├── domains/                       # Tier 2
│   ├── BC_DOMAIN_{tool}_{domain}.md
│   └── AC_DOMAIN_{tool}_{domain}.md
│
├── deltas/                        # Tier 3
│   └── v{X.Y.Z}/
│       ├── BC_delta_{tool}_{feature}.md
│       └── AC_delta_{tool}_{feature}.md
│
├── releases/
│   └── RELEASE_v{X}_{Y}_{Z}_{tool}_{feature}.md
│
├── qa/
│   └── QA_{tool}_v{X}_{Y}_{Z}.md
│
└── archive/{tool}/                # Per-tool archive
    ├── business/
    └── analytics/
```

### Multi-Tool Projects

For repositories with multiple tools, add `{tool}` prefix:

```
docs/
├── TOOLS_INDEX.md
├── OVERVIEW_pcc.md
├── OVERVIEW_classifier.md
├── domains/
│   ├── BC_DOMAIN_pcc_ui.md
│   ├── AC_DOMAIN_pcc_ui.md
│   ├── BC_DOMAIN_classifier_cataloging.md
│   └── AC_DOMAIN_classifier_cataloging.md
└── deltas/
    └── v1.0.0/
        ├── BC_delta_pcc_tabs.md
        └── BC_delta_classifier_cataloging.md
```

**Rule:** One `docs/` per project, NOT per tool.

> See: [WORKFLOW.md → Multi-Tool Projects](../WORKFLOW.md#multi-tool-projects)

---

## Workflow

### При создании нового релиза

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  1. Create  │────▶│  2. Apply   │────▶│  3. Verify  │
│    Delta    │     │   to Domain │     │   & Archive │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Step 1: Create Delta**
```bash
# Создать delta-документ для изменений
touch deltas/v1.9.0/BC_delta_ui.md
touch deltas/v1.9.0/AC_delta_ui.md
```

**Step 2: Apply to Domain**
```bash
# Применить delta к соответствующему domain
pcc apply-delta deltas/v1.9.0/BC_delta_ui.md --domain=ui
pcc apply-delta deltas/v1.9.0/AC_delta_ui.md --domain=ui
```

**Step 3: Verify & Archive**
```bash
# Проверить что все delta применены
pcc validate-domains

# Git commit
git add domains/ deltas/
git commit -m "docs: Apply v1.9.0 deltas to domains"
```

### При чтении документации

```
LLM Context Strategy:

1. Всегда загружать: OVERVIEW.md (~200 строк)
2. По запросу: BC/AC_DOMAIN_*.md нужного домена (~1000 строк)
3. Никогда: deltas/ (только для recovery)

Total context: ~1200 строк вместо ~5000+ строк старых BC/AC
```

---

## Отслеживание применённых delta

### В каждом DOMAIN файле

```yaml
---
domain_id: BC_DOMAIN_ui
applied_deltas:
  - version: v1.0.0
    delta: BC_delta_v1_0_0_ui
    applied_at: 2026-01-02
  - version: v1.5.0
    delta: BC_delta_v1_5_0_ui
    applied_at: 2026-01-03
  - version: v1.8.0
    delta: BC_delta_v1_8_0_ui
    applied_at: 2026-01-04
last_applied_version: v1.8.0
---
```

### Цепочка based_on

Каждый delta ссылается на предыдущий:

```yaml
# deltas/v1.9.0/BC_delta_ui.md
---
context_id: BC_delta_v1_9_0_ui
based_on: BC_delta_v1_8_0_ui   # Явная связь
target_domain: BC_DOMAIN_ui
---
```

### Валидация

```bash
$ pcc validate-domains

BC_DOMAIN_ui:
  ✓ v1.0.0 applied
  ✓ v1.5.0 applied
  ✗ v1.7.0 MISSING — delta exists in deltas/v1.7.0/BC_delta_ui.md
  ✓ v1.8.0 applied (gap detected!)

Action required:
  pcc apply-delta deltas/v1.7.0/BC_delta_ui.md --domain=ui
```

---

## Правила шардирования доменов

### Когда создавать новый домен

| Критерий | Порог | Действие |
|----------|-------|----------|
| Строки в DOMAIN файле | > 1000 | Split на поддомены |
| Количество фич | > 30 | Split по функциональности |
| Независимость | Можно развивать отдельно | Выделить в домен |

### Как разбивать

**До:**
```
BC_DOMAIN_ui.md (1200 строк, 35 фич)
```

**После:**
```
BC_DOMAIN_ui_core.md (400 строк, 12 фич)
BC_DOMAIN_ui_tracker.md (400 строк, 12 фич)
BC_DOMAIN_ui_releases.md (400 строк, 11 фич)
```

### Связывание доменов

```yaml
# BC_DOMAIN_ui_core.md
---
domain_id: BC_DOMAIN_ui_core
related_domains:
  - BC_DOMAIN_ui_tracker
  - BC_DOMAIN_ui_releases
related_ac: AC_DOMAIN_ui_core
---
```

---

## Команды PCC

### apply-delta

Применяет delta к domain файлу:

```bash
pcc apply-delta <delta-file> --domain=<name>

# Пример
pcc apply-delta deltas/v1.9.0/BC_delta_ui.md --domain=ui
```

**Что происходит:**
1. Парсит delta YAML frontmatter
2. Проверяет based_on (должен быть уже применён)
3. Добавляет новые features в DOMAIN
4. Обновляет modified features
5. Помечает deprecated features
6. Добавляет запись в applied_deltas
7. Обновляет last_applied_version

### validate-domains

Проверяет что все delta применены:

```bash
pcc validate-domains [--domain=<name>]

# Проверить все домены
pcc validate-domains

# Проверить конкретный домен
pcc validate-domains --domain=ui
```

**Что проверяет:**
- Все файлы в deltas/ имеют соответствующую запись в applied_deltas
- Нет пропущенных версий (gaps)
- Цепочка based_on непрерывна

### rebuild-domain

Восстанавливает domain из всех delta:

```bash
pcc rebuild-domain <domain-name>

# Пример
pcc rebuild-domain ui
```

**Когда использовать:**
- При обнаружении gap в applied_deltas
- При повреждении DOMAIN файла
- При миграции на новую структуру

### rebuild-all

Полная перегенерация всех domains:

```bash
pcc rebuild-all
```

**Сложность:** O(n) где n = количество delta файлов

---

## Миграция с legacy BC/AC

### Шаг 1: Создать domain файлы

```bash
# Создать структуру
mkdir -p docs/domains docs/releases

# Создать начальные domain файлы
touch docs/domains/BC_DOMAIN_ui.md
touch docs/domains/AC_DOMAIN_ui.md
```

### Шаг 2: Агрегировать существующие BC/AC

```bash
# Собрать все BC в один domain
pcc migrate-legacy --type=bc --domain=ui \
  docs/business/BC_web_ui.md \
  docs/business/BC_web_ui_v1_1.md \
  docs/business/BC_ui_enhancements_v1_5.md

# Аналогично для AC
pcc migrate-legacy --type=ac --domain=ui \
  docs/analytics/AC_web_ui.md \
  docs/analytics/AC_web_ui_v1_1.md \
  docs/analytics/AC_ui_enhancements_v1_5.md
```

### Шаг 3: Переместить старые файлы в deltas

```bash
# Переместить в архив
mkdir -p docs/releases/v1.0.0 docs/releases/v1.1.0 docs/releases/v1.5.0

mv docs/business/BC_web_ui.md docs/releases/v1.0.0/BC_delta_ui.md
mv docs/business/BC_web_ui_v1_1.md docs/releases/v1.1.0/BC_delta_ui.md
# ...
```

### Шаг 4: Обновить CLAUDE.md

Заменить references на старые BC/AC на новые domain файлы.

---

## Связь с DOCUMENTATION_SCALING.md

Living Documentation дополняет [DOCUMENTATION_SCALING.md](./DOCUMENTATION_SCALING.md):

| Проблема | DOCUMENTATION_SCALING | LIVING_DOCUMENTATION |
|----------|----------------------|----------------------|
| Domain proliferation | Domain Registry | Domain aggregators |
| File size bloat | Multi-file structure | Split domains |
| Content duplication | Reference-based | Delta-only docs |
| Navigation complexity | Hierarchical structure | 3-tier architecture |
| Broken references | Validation tools | based_on chain |
| Stale documentation | Health metrics | applied_deltas tracking |

**Когда использовать что:**
- DOCUMENTATION_SCALING: общие принципы масштабирования
- LIVING_DOCUMENTATION: конкретный механизм для BC/AC накопления

---

## Чеклист внедрения

### Phase 1: Подготовка

- [ ] Создать docs/domains/ структуру
- [ ] Создать docs/releases/ структуру
- [ ] Создать OVERVIEW.md
- [ ] Определить домены (по функциональным областям)

### Phase 2: Миграция

- [ ] Агрегировать существующие BC в BC_DOMAIN_*.md
- [ ] Агрегировать существующие AC в AC_DOMAIN_*.md
- [ ] Переместить старые BC/AC в deltas/v{version}/
- [ ] Заполнить applied_deltas в domain файлах

### Phase 3: Workflow

- [ ] Настроить команды PCC (apply-delta, validate-domains)
- [ ] Добавить validate-domains в CI
- [ ] Обновить CLAUDE.md с новым workflow
- [ ] Обновить RELEASE template

### Phase 4: Валидация

- [ ] Запустить pcc validate-domains
- [ ] Проверить все домены < 1000 строк
- [ ] Проверить OVERVIEW.md < 200 строк
- [ ] Протестировать rebuild-all

---

## Related Documentation

- [DOCUMENTATION_SCALING.md](./DOCUMENTATION_SCALING.md) - Общие принципы масштабирования
- [VERSIONING_CASCADE.md](./VERSIONING_CASCADE.md) - Каскадное обновление версий
- [BC_DELTA_TEMPLATE.md](../templates/phases/BC_DELTA_TEMPLATE.md) - Шаблон BC delta
- [AC_DELTA_TEMPLATE.md](../templates/phases/AC_DELTA_TEMPLATE.md) - Шаблон AC delta
- [BC_DOMAIN_TEMPLATE.md](../templates/domains/BC_DOMAIN_TEMPLATE.md) - Шаблон BC domain
- [AC_DOMAIN_TEMPLATE.md](../templates/domains/AC_DOMAIN_TEMPLATE.md) - Шаблон AC domain

---

**Status:** 🟢 Active
**Owner:** Architecture Team
**Feedback:** Create issue or PR for improvements
