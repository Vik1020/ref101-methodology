---
context_id: IC_monitoring_logging
version: "1.0.0"
type: infrastructure
category: monitoring
applies_to:
  - PC_*  # All programmatic contexts
  - services/*  # Backend services
  - CCC_*  # Cross-cutting contexts
enforcement: mandatory
health:
  documentation_coverage: 100
  last_updated: 2025-12-21
  staleness_days: 0
related_contexts:
  - IC_security_api_communication
  - IC_performance_budgets
  - CCC_error_boundary
migration:
  breaking_changes: []
  deprecations: []
  migration_guide: null
---

# Infrastructure Context: Monitoring & Logging

## Purpose

Defines mandatory monitoring and logging requirements to ensure system observability, error tracking, and production debugging capabilities. Establishes standards for what to log, how to log, and how to monitor application health.

---

## Requirements

### Mandatory

1. **ALL errors MUST be logged and tracked**
   - Frontend: Send to error tracking service (Sentry, LogRocket)
   - Backend: Log to structured logger (Winston, Pino)
   - Include stack trace, user context, environment
   - Error severity levels (critical, error, warning, info)

2. **NO sensitive data in logs**
   - NEVER log passwords, API keys, tokens, PII
   - Redact sensitive fields before logging
   - Use `[REDACTED]` placeholder for masked data
   - Sanitize user input before logging

3. **ALL logs MUST be structured (JSON format)**
   - Timestamp (ISO 8601 format)
   - Log level (error, warn, info, debug)
   - Message (human-readable)
   - Context (user ID, request ID, component name)
   - Metadata (additional key-value pairs)

4. **Critical user actions MUST be tracked**
   - Authentication events (login, logout, failed attempts)
   - Data mutations (create, update, delete)
   - Payment transactions
   - Permission changes
   - Export/download actions

5. **Performance metrics MUST be monitored**
   - API response times
   - Database query times
   - Page load times (Web Vitals)
   - Error rates
   - Uptime/downtime

6. **Application health MUST be monitored**
   - Health check endpoints (`/health`, `/readiness`)
   - Resource usage (CPU, memory, disk)
   - Dependency status (database, external APIs)
   - Alerting for anomalies

### Recommended

1. Implement distributed tracing for microservices
2. Use correlation IDs to track requests across services
3. Set up dashboards for key metrics (Grafana, Datadog)
4. Configure alerting thresholds (PagerDuty, Opsgenie)
5. Log slow queries and N+1 patterns

### Optional

1. Implement log aggregation (ELK stack, Splunk)
2. Set up anomaly detection (ML-based)
3. Create custom metrics for business KPIs
4. Implement session replay for debugging

---

## Validation Rules

### Automated Checks

- **ESLint:** Detect `console.log` in production code (warn only)
- **Type check:** Ensure logger interface is used consistently
- **Security scan:** Detect potential PII in log statements
- **Test:** Verify error handling logs errors

### Manual Review

- [ ] Errors sent to tracking service (Sentry/LogRocket)
- [ ] Logs are structured (JSON format)
- [ ] Sensitive data redacted in logs
- [ ] Critical actions tracked with context
- [ ] Health check endpoints implemented
- [ ] Alerts configured for critical errors
- [ ] Correlation IDs used for request tracking

### Tools

- **Sentry:** Error tracking and performance monitoring
- **Datadog/Grafana:** Metrics dashboards
- **Winston/Pino:** Structured logging libraries
- **OpenTelemetry:** Distributed tracing

---

## Implementation Guide

### Step 1: Configure Error Tracking

```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/utils/errorTracking.ts
import * as Sentry from '@sentry/react';

export const initErrorTracking = () => {
  if (import.meta.env.MODE === 'production') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1, // 10% of transactions
      beforeSend(event, hint) {
        // Redact sensitive data
        if (event.request?.headers) {
          delete event.request.headers.Authorization;
          delete event.request.headers.Cookie;
        }
        return event;
      },
    });
  }
};

// src/main.tsx
import { initErrorTracking } from './utils/errorTracking';

initErrorTracking();
```

### Step 2: Create Structured Logger

```typescript
// src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  component?: string;
  [key: string]: any;
}

class Logger {
  private redactSensitive(data: any): any {
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    const redacted = { ...data };

    Object.keys(redacted).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        redacted[key] = '[REDACTED]';
      }
    });

    return redacted;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? this.redactSensitive(context) : undefined,
      environment: import.meta.env.MODE,
    };

    // Development: console output
    if (import.meta.env.MODE === 'development') {
      console[level === 'debug' ? 'log' : level](JSON.stringify(logEntry, null, 2));
    }

    // Production: send to logging service
    if (import.meta.env.MODE === 'production') {
      // Send to your logging service (e.g., Datadog, LogRocket)
      this.sendToLoggingService(logEntry);
    }
  }

  private sendToLoggingService(logEntry: any) {
    // Implement your logging service integration
    // Example: fetch('/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error ? { message: error.message, stack: error.stack } : undefined,
    });

    // Also send to Sentry
    if (import.meta.env.MODE === 'production' && error) {
      Sentry.captureException(error, { contexts: { custom: context } });
    }
  }
}

export const logger = new Logger();
```

### Step 3: Track User Actions

```typescript
// src/utils/analytics.ts
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
}

class Analytics {
  track(event: AnalyticsEvent) {
    logger.info('User action tracked', {
      action: event.action,
      category: event.category,
      label: event.label,
      userId: event.userId,
    });

    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    if (import.meta.env.MODE === 'production') {
      // Example: gtag('event', event.action, { ... });
    }
  }

  trackError(error: Error, context?: Record<string, any>) {
    logger.error('Application error', error, context);
  }

  trackPerformance(metric: string, value: number) {
    logger.info('Performance metric', {
      metric,
      value,
      timestamp: Date.now(),
    });
  }
}

export const analytics = new Analytics();
```

### Step 4: Implement Health Check

```typescript
// Backend: src/api/health.ts
export const healthCheck = async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      externalApi: await checkExternalApi(),
    },
  };

  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');

  res.status(isHealthy ? 200 : 503).json(health);
};

const checkDatabase = async () => {
  try {
    await db.query('SELECT 1');
    return { status: 'ok' };
  } catch (error) {
    logger.error('Database health check failed', error);
    return { status: 'error', message: error.message };
  }
};
```

---

## Examples

### ✅ Good Examples

#### Example 1: Structured Error Logging

```typescript
// ✅ GOOD: Structured error log with context
try {
  await updateUser(userId, userData);
  logger.info('User updated successfully', {
    userId,
    component: 'UserProfile',
    action: 'update',
  });
} catch (error) {
  logger.error('Failed to update user', error as Error, {
    userId,
    component: 'UserProfile',
    action: 'update',
  });
  throw error;
}
```

#### Example 2: Redacted Sensitive Data

```typescript
// ✅ GOOD: Redact sensitive data before logging
const loginUser = async (email: string, password: string) => {
  try {
    const user = await auth.login(email, password);

    logger.info('User logged in', {
      userId: user.id,
      email,
      // password NOT logged
    });

    return user;
  } catch (error) {
    logger.error('Login failed', error as Error, {
      email,
      // password NOT logged
    });
    throw error;
  }
};
```

#### Example 3: Performance Monitoring

```typescript
// ✅ GOOD: Track API performance
const fetchProducts = async () => {
  const startTime = performance.now();

  try {
    const response = await fetch('/api/products');
    const data = await response.json();

    const duration = performance.now() - startTime;

    logger.info('API request completed', {
      endpoint: '/api/products',
      duration,
      status: response.status,
    });

    // Alert if slow
    if (duration > 1000) {
      logger.warn('Slow API response', {
        endpoint: '/api/products',
        duration,
      });
    }

    return data;
  } catch (error) {
    const duration = performance.now() - startTime;

    logger.error('API request failed', error as Error, {
      endpoint: '/api/products',
      duration,
    });

    throw error;
  }
};
```

#### Example 4: User Action Tracking

```typescript
// ✅ GOOD: Track critical user actions
const deleteDocument = async (documentId: string, userId: string) => {
  logger.info('Document deletion requested', {
    documentId,
    userId,
    action: 'delete',
    component: 'DocumentManager',
  });

  try {
    await api.deleteDocument(documentId);

    logger.info('Document deleted successfully', {
      documentId,
      userId,
      action: 'delete',
      component: 'DocumentManager',
    });

    analytics.track({
      action: 'document_deleted',
      category: 'content',
      userId,
    });
  } catch (error) {
    logger.error('Document deletion failed', error as Error, {
      documentId,
      userId,
      action: 'delete',
    });
    throw error;
  }
};
```

### ❌ Anti-Patterns

#### Bad Example 1: Logging Sensitive Data

```typescript
// ❌ CRITICAL VIOLATION: Password in logs
logger.info('Login attempt', {
  email: user.email,
  password: user.password, // NEVER log passwords!
});

// ✅ CORRECT: No sensitive data
logger.info('Login attempt', {
  email: user.email,
  // password omitted
});
```

#### Bad Example 2: Unstructured Logs

```typescript
// ❌ VIOLATION: Unstructured console.log
console.log('User logged in: ' + userId);

// ✅ CORRECT: Structured logging
logger.info('User logged in', {
  userId,
  timestamp: new Date().toISOString(),
});
```

#### Bad Example 3: No Error Context

```typescript
// ❌ VIOLATION: Error without context
try {
  await fetchData();
} catch (error) {
  console.error('Error'); // What error? Where? When?
}

// ✅ CORRECT: Error with full context
try {
  await fetchData();
} catch (error) {
  logger.error('Failed to fetch data', error as Error, {
    component: 'Dashboard',
    userId: currentUser.id,
    action: 'load',
  });
}
```

#### Bad Example 4: Silent Failures

```typescript
// ❌ VIOLATION: Error swallowed, not logged
try {
  await riskyOperation();
} catch (error) {
  // Error ignored - no one knows it happened!
}

// ✅ CORRECT: Log even if recovering
try {
  await riskyOperation();
} catch (error) {
  logger.warn('Operation failed, using fallback', error as Error, {
    operation: 'riskyOperation',
  });
  return fallbackValue;
}
```

---

## Log Levels

### When to Use Each Level

| Level | Usage | Examples |
|-------|-------|----------|
| **debug** | Detailed diagnostic info for development | Variable values, function entry/exit |
| **info** | General informational messages | User actions, successful operations |
| **warn** | Potentially harmful situations | Deprecated API usage, slow operations |
| **error** | Error events that might allow app to continue | Failed API call, validation error |
| **critical** | Severe errors causing app failure | Database down, out of memory |

---

## Exceptions

### Requesting an Exception

Monitoring/logging exceptions are rare and require strong justification.

```yaml
compliance_exceptions:
  - rule: "IC_monitoring_logging - error_tracking"
    reason: "Offline-first PWA - no network for error reporting in offline mode"
    approved_by: "Tech Lead"
    approved_date: "2025-12-21"
    expires: "2026-06-21"
    mitigation: "Queue errors locally, sync when online. Store max 100 errors."
```

### Valid Exception Reasons

- **Offline capability:** App works without network (must queue logs)
- **Third-party limitation:** External service doesn't support logging (document workaround)
- **Privacy regulation:** GDPR/HIPAA restricts logging (must anonymize)

---

## Metrics & Monitoring

### Compliance Metrics

- **Target:** 100% of errors tracked and logged
- **Current:** Monitor via error tracking dashboard
- **Blockers:** Any critical errors not captured

### Tracking

- **Dashboard:** Sentry dashboard for errors, Grafana for metrics
- **Alert threshold:** Error rate > 1% of requests
- **Review frequency:** Daily error review, weekly metrics review

---

## Related Documents

- **Parent Spec:** [Twelve-Factor App: Logs](https://12factor.net/logs)
- **Related ICs:**
  - `IC_security_api_communication` - Secure logging practices
  - `IC_performance_budgets` - Performance metrics
- **Related CCCs:**
  - `CCC_error_boundary` - Frontend error handling
- **Reference Standards:**
  - [Structured Logging Best Practices](https://www.datadoghq.com/blog/structured-logging/)
  - [OpenTelemetry](https://opentelemetry.io/)

---

## Change Log

### v1.0.0 (2025-12-21)

- Initial version
- Defined logging requirements
- Added error tracking integration (Sentry)
- Created structured logger utility
- Included health check examples

---

## Enforcement

**Enforcement Level:** Mandatory

**Violations BLOCK deployment.** Critical errors must be tracked, and sensitive data must never be logged.

### Review Process

1. **Automated:** ESLint warns on `console.log` in production code
2. **PR Review:** Check for proper error handling and logging
3. **Security Review:** Scan for potential PII in logs
4. **Production Monitoring:** Alert on error spikes
5. **IC Update:** Quarterly review of logging patterns

---

## FAQ

### Q: Can I use `console.log` for debugging?

**A:** In development, yes. In production code, use the structured logger. ESLint will warn you about `console.log` in production builds.

### Q: What about performance - won't logging slow down the app?

**A:**
- Async logging: Logs are sent in background
- Sampling: Log 100% errors, sample 10% of info logs
- Buffering: Batch logs before sending

### Q: How do I log in a React component?

**A:**

```typescript
import { logger } from '@/utils/logger';

export const MyComponent = () => {
  useEffect(() => {
    logger.info('Component mounted', {
      component: 'MyComponent',
    });
  }, []);

  const handleAction = () => {
    try {
      // ...
      logger.info('Action completed', {
        component: 'MyComponent',
        action: 'handleAction',
      });
    } catch (error) {
      logger.error('Action failed', error as Error, {
        component: 'MyComponent',
      });
    }
  };
};
```

### Q: What if I accidentally log sensitive data?

**A:**
1. Immediately rotate credentials if API keys/tokens were logged
2. Purge logs containing sensitive data
3. Update logger to redact that field
4. Conduct security review

---

**Last Review:** 2025-12-21
**Next Review:** 2026-06-21
**Owner:** DevOps Team + Backend Team
