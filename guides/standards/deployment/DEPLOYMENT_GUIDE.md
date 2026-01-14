---
context_id: GUIDE_deployment
version: "1.1.0"
last_updated: 2026-01-04
status: active
owner: DevOps/Platform Team
audience: devops
language: ru
---

# Руководство по деплою

> **Это финальная фаза workflow.** См.: [WORKFLOW.md](../WORKFLOW.md)

---

## Содержание

- [Обзор](#обзор)
- [Предварительные требования](#предварительные-требования)
- [Чеклист деплоя](#чеклист-деплоя)
- [Шаги деплоя](#шаги-деплоя)
- [Процедура отката](#процедура-отката)
- [Конфигурация окружения](#конфигурация-окружения)
- [Чеклист мониторинга](#чеклист-мониторинга)
- [Типы деплоя](#типы-деплоя)
- [Команды PCC](#команды-pcc)
- [Связанные документы](#связанные-документы)

---

## Обзор

Данное руководство описывает подпроцесс DEPLOY — финальную фазу workflow релиза. После завершения APPLY_DELTAS кодовая база готова к деплою в production.

```
QA Testing ──► APPLY_DELTAS ──► DEPLOY ──► (Released)
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                  Git Tag                   Production
                  Created                   Deployed
```

---

## Предварительные требования

Перед деплоем убедитесь:

| Требование | Валидатор | Команда |
|------------|-----------|---------|
| Все дельты применены | `deltas_applied` | `pcc validate-domains` |
| QA тесты пройдены | `qa_tests_passed` | Проверить QA_v{X.Y.Z}.md |
| Нет P0 багов | `no_critical_bugs` | Проверить баг-трекер |
| Код смержен в main | `main_up_to_date` | `git log main..HEAD` |
| CHANGELOG обновлён | `changelog_exists` | Проверить CHANGELOG.md |

---

## Чеклист деплоя

### Перед деплоем

```yaml
checklist:
  pre_deployment:
    - item: "Все изменения смержены в main"
      status: pending
    - item: "CI/CD pipeline проходит"
      status: pending
    - item: "CHANGELOG.md обновлён"
      status: pending
    - item: "Номера версий обновлены"
      status: pending
    - item: "Переменные окружения настроены"
      status: pending
    - item: "Миграции БД готовы"
      status: pending
```

### Деплой

```yaml
  deployment:
    - item: "Создать git tag"
      status: pending
    - item: "Запушить tag в remote"
      status: pending
    - item: "Запустить deployment pipeline"
      status: pending
    - item: "Мониторить прогресс деплоя"
      status: pending
```

### После деплоя

```yaml
  post_deployment:
    - item: "Проверить успешность деплоя"
      status: pending
    - item: "Запустить smoke тесты"
      status: pending
    - item: "Проверить error rates"
      status: pending
    - item: "Обновить статус релиза"
      status: pending
    - item: "Уведомить stakeholders"
      status: pending
```

---

## Шаги деплоя

### Шаг 1: Создание Git Tag

```bash
# Убедитесь, что вы на ветке main с последними изменениями
git checkout main
git pull origin main

# Создайте аннотированный тег
git tag -a v1.9.0 -m "Release v1.9.0: [Название фичи]"

# Запушьте тег в remote
git push origin v1.9.0
```

**Конвенция именования тегов:**
- `vX.Y.Z` для релизов (например, `v1.9.0`)
- `vX.Y.Z-rc.N` для релиз-кандидатов (например, `v1.9.0-rc.1`)
- `vX.Y.Z-hotfix.N` для хотфиксов (например, `v1.9.0-hotfix.1`)

### Шаг 2: Запуск деплоя

Метод деплоя зависит от вашей инфраструктуры:

**Вариант A: CI/CD Pipeline (Рекомендуется)**
```yaml
# .github/workflows/deploy.yml или аналогичный
on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: |
          # Ваши команды деплоя
```

**Вариант B: Ручной деплой**
```bash
# Сборка
npm run build

# Деплой (примеры для различных платформ)
# Vercel
vercel --prod

# AWS
aws s3 sync dist/ s3://bucket-name

# Docker
docker build -t app:v1.9.0 .
docker push registry/app:v1.9.0
```

### Шаг 3: Проверка деплоя

```bash
# Проверка health приложения
curl -I https://your-app.com/health

# Запуск smoke тестов
npm run test:smoke

# Проверка логов на ошибки
# (команда зависит от платформы)
```

### Шаг 4: Обновление статуса релиза

Обновите файл Release контекста:

```yaml
# docs/releases/RELEASE_v1_9_0_feature.md
---
status: released                    # Изменить с 'validation' на 'released'
release_date: 2026-01-04           # Фактическая дата релиза
deployed_at: 2026-01-04T10:30:00Z  # Timestamp деплоя
---
```

### Шаг 5: Уведомление stakeholders

- Закрыть Release Epic в Yandex Tracker
- Отправить release notes stakeholders
- Обновить публичный changelog/release notes

---

## Процедура отката

Если после деплоя обнаружены проблемы:

### Быстрый откат (< 5 минут)

```bash
# Вариант 1: Откат на предыдущий тег
git checkout v1.8.0
# Передеплоить предыдущую версию

# Вариант 2: Feature flag (если доступен)
# Отключить проблемную фичу через конфиг
```

### Полный откат

1. **Оценка влияния**
   - Идентифицировать затронутые компоненты
   - Проверить целостность данных

2. **Откат кода**
   ```bash
   # Создать ветку отката
   git checkout -b rollback/v1.9.0 v1.8.0

   # Запушить и задеплоить
   git push origin rollback/v1.9.0
   ```

3. **Откат базы данных** (если необходимо)
   ```bash
   # Запустить rollback миграции
   npm run migrate:rollback
   ```

4. **Документирование инцидента**
   - Создать incident report
   - Запланировать post-mortem

---

## Конфигурация окружения

### Переменные окружения

| Переменная | Описание | Обязательна |
|------------|----------|-------------|
| `NODE_ENV` | Окружение (production) | Да |
| `DATABASE_URL` | Строка подключения к БД | Да |
| `API_KEY` | Внешние API ключи | Да |
| `LOG_LEVEL` | Уровень логирования | Нет |

### Управление секретами

- Используйте хранилища секретов для каждого окружения
- Никогда не коммитьте секреты в git
- Ротируйте секреты после деплоя

---

## Чеклист мониторинга

После деплоя мониторьте в течение 24 часов:

| Метрика | Порог | Действие при превышении |
|---------|-------|------------------------|
| Error Rate | < 1% | Откат |
| Response Time (p99) | < 500ms | Расследование |
| CPU Usage | < 80% | Масштабирование |
| Memory Usage | < 80% | Расследование |
| 5xx Errors | 0 | Откат |

---

## Типы деплоя

### Стандартный релиз

Полный workflow: RELEASE → BC → AC → PC → IC → QA → APPLY_DELTAS → DEPLOY

- Используется для: Новых фич, крупных изменений
- Approval: PM + Tech Lead + QA Lead
- Окно деплоя: Рабочие часы

### Хотфикс

Сокращённый workflow для критических исправлений:

```
Issue ──► Hotfix Branch ──► Fix ──► Fast QA ──► Deploy ──► Full Docs
                                        │
                                   PM Approval
```

- Используется для: Security fixes, критических багов
- Approval: Только PM
- Окно деплоя: Любое время

### Канареечный деплой

Постепенный rollout на подмножество пользователей:

```
Deploy ──► 5% traffic ──► Monitor ──► 25% ──► 50% ──► 100%
               │
          Issues? ──► Rollback
```

---

## Команды PCC

```bash
# Валидация доменов перед деплоем
pcc validate-domains

# Проверка статуса релиза
pcc -p /path/to/project status

# Просмотр иерархии релизов
pcc tracker --hierarchy
```

---

## Связанные документы

| Документ | Описание |
|----------|----------|
| [WORKFLOW.md](../WORKFLOW.md) | Полные фазы workflow |
| [RELEASE_MANAGEMENT.md](../reference/work-tracking/RELEASE_MANAGEMENT.md) | Планирование релизов |
| [LIVING_DOCUMENTATION.md](./LIVING_DOCUMENTATION.md) | Управление Delta/Domain |
| [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) | QA процесс |

---

**Последнее обновление:** 2026-01-04
**Владелец:** DevOps/Platform Team
**Статус:** Active
