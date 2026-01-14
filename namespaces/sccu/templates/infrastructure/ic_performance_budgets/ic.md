---
context_id: IC_performance_budgets
version: "1.0.0"
type: infrastructure
category: performance
applies_to:
  - PC_*  # All programmatic contexts (components)
  - services/*  # Backend services
enforcement: mandatory
health:
  documentation_coverage: 100
  last_updated: 2025-12-21
  staleness_days: 0
related_contexts:
  - IC_a11y_standards
  - IC_monitoring_logging
migration:
  breaking_changes: []
  deprecations: []
  migration_guide: null
---

# Infrastructure Context: Performance Budgets

## Purpose

Defines mandatory performance budgets and optimization requirements to ensure fast, responsive user experience. Enforces limits on bundle size, render time, and Core Web Vitals metrics across all components and pages.

---

## Requirements

### Mandatory

1. **Component bundle size MUST NOT exceed limits**
   - Individual component: < 50 KB gzipped
   - Page bundle (total): < 200 KB gzipped
   - Initial JavaScript: < 100 KB gzipped
   - Images optimized: WebP/AVIF format, lazy loaded

2. **Core Web Vitals MUST meet Google thresholds**
   - **LCP (Largest Contentful Paint):** < 2.5 seconds
   - **FID (First Input Delay):** < 100 milliseconds
   - **CLS (Cumulative Layout Shift):** < 0.1
   - Measured at 75th percentile of real users

3. **Component render time MUST be optimized**
   - Initial render: < 16ms (60 FPS)
   - Re-render after state change: < 16ms
   - No unnecessary re-renders (use React.memo, useMemo, useCallback)
   - Virtual scrolling for lists > 100 items

4. **API calls MUST be optimized**
   - Response time: < 200ms for critical paths
   - Batch multiple requests when possible
   - Cache responses (client-side + CDN)
   - No N+1 query patterns
   - Implement request debouncing/throttling

5. **Images and media MUST be optimized**
   - Use next-gen formats (WebP, AVIF)
   - Responsive images with srcset
   - Lazy loading for below-the-fold images
   - Compress images to appropriate quality
   - Use CDN for static assets

6. **Code splitting MUST be implemented**
   - Route-based code splitting
   - Lazy load non-critical components
   - Dynamic imports for heavy libraries
   - Tree-shaking enabled

### Recommended

1. Use service workers for offline caching
2. Implement progressive loading (skeleton screens)
3. Prefetch resources for likely next navigation
4. Use HTTP/2 for multiplexing
5. Minimize third-party scripts

### Optional

1. Implement edge caching with Cloudflare/Vercel
2. Use WebAssembly for CPU-intensive tasks
3. Implement request coalescing
4. Use connection pooling for database

---

## Validation Rules

### Automated Checks

- **Webpack Bundle Analyzer:** Track bundle sizes
- **Lighthouse CI:** Performance score ≥ 90 (target: 95+)
- **Web Vitals Library:** Monitor LCP, FID, CLS in production
- **Bundle size limit:** GitHub Actions check on PR

### Manual Review

- [ ] Bundle size under budget (check webpack stats)
- [ ] Lighthouse performance score ≥ 90
- [ ] No blocking resources on initial load
- [ ] Images lazy loaded and optimized
- [ ] Code splitting implemented for routes
- [ ] No unnecessary re-renders (React DevTools Profiler)
- [ ] API calls batched and cached

### Tools

- **Lighthouse:** `npx lighthouse https://localhost:5173 --only-categories=performance`
- **Webpack Bundle Analyzer:** `npm run build -- --analyze`
- **React DevTools Profiler:** Identify expensive renders
- **Web Vitals Extension:** Chrome extension for real-time metrics

---

## Implementation Guide

### Step 1: Configure Bundle Size Limits

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    // Warn if chunk exceeds 500 KB
    chunkSizeWarningLimit: 500,
  },
  plugins: [
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
    }),
  ],
});
```

### Step 2: Implement Code Splitting

```typescript
// ✅ GOOD: Lazy load routes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

export const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </Suspense>
);
```

### Step 3: Optimize Re-Renders

```typescript
// ✅ GOOD: Memoize expensive computations
import { useMemo, useCallback } from 'react';

const ExpensiveComponent = ({ data, onItemClick }) => {
  // Memoize filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => item.isActive);
  }, [data]);

  // Memoize callback
  const handleClick = useCallback((id) => {
    onItemClick(id);
  }, [onItemClick]);

  return <List items={filteredData} onClick={handleClick} />;
};
```

### Step 4: Lazy Load Images

```typescript
// ✅ GOOD: Native lazy loading
<img
  src="/hero.jpg"
  alt="Hero image"
  loading="lazy"
  decoding="async"
  width={800}
  height={600}
/>

// ✅ GOOD: Responsive images
<img
  srcSet="/image-320w.jpg 320w,
          /image-640w.jpg 640w,
          /image-1280w.jpg 1280w"
  sizes="(max-width: 640px) 320px,
         (max-width: 1280px) 640px,
         1280px"
  src="/image-640w.jpg"
  alt="Responsive image"
  loading="lazy"
/>
```

### Step 5: Monitor Web Vitals

```typescript
// src/utils/webVitals.ts
import { onCLS, onFID, onLCP } from 'web-vitals';

export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onLCP(onPerfEntry);
  }
};

// src/main.tsx
import { reportWebVitals } from './utils/webVitals';

reportWebVitals((metric) => {
  console.log(metric);
  // Send to analytics
  analytics.track('Web Vitals', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  });
});
```

---

## Examples

### ✅ Good Examples

#### Example 1: Optimized List Component

```typescript
// ✅ GOOD: Virtual scrolling for large lists
import { FixedSizeList } from 'react-window';

interface ProductListProps {
  products: Product[];
}

export const ProductList = ({ products }: ProductListProps) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ProductCard product={products[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={products.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

#### Example 2: Batched API Requests

```typescript
// ✅ GOOD: Batch multiple requests
import { useQuery } from '@tanstack/react-query';

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Single batched request instead of 3 separate calls
      const response = await fetch('/api/dashboard/batch', {
        method: 'POST',
        body: JSON.stringify({
          requests: ['stats', 'recent-activity', 'notifications']
        })
      });
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
```

#### Example 3: Debounced Search

```typescript
// ✅ GOOD: Debounce search input
import { useState, useCallback } from 'react';
import { debounce } from 'lodash-es';

export const SearchInput = () => {
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      // API call
      fetch(`/api/search?q=${searchQuery}`);
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return <input value={query} onChange={handleChange} />;
};
```

#### Example 4: Image Optimization Component

```typescript
// ✅ GOOD: Optimized image component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const OptimizedImage = ({ src, alt, width, height }: OptimizedImageProps) => {
  return (
    <picture>
      <source type="image/avif" srcSet={`${src}.avif`} />
      <source type="image/webp" srcSet={`${src}.webp`} />
      <img
        src={`${src}.jpg`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};
```

### ❌ Anti-Patterns

#### Bad Example 1: No Code Splitting

```typescript
// ❌ VIOLATION: All components loaded upfront
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

// Bundle size: 500+ KB gzipped

// ✅ CORRECT: Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
// etc.
```

#### Bad Example 2: Unnecessary Re-Renders

```typescript
// ❌ VIOLATION: Component re-renders on every parent update
const ExpensiveList = ({ items }) => {
  const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
  // Sorts on EVERY render!
  return <ul>{sorted.map(item => <li>{item.name}</li>)}</ul>;
};

// ✅ CORRECT: Memoize expensive operation
const ExpensiveList = ({ items }) => {
  const sorted = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  return <ul>{sorted.map(item => <li>{item.name}</li>)}</ul>;
};
```

#### Bad Example 3: N+1 Query Pattern

```typescript
// ❌ VIOLATION: N+1 queries (1 + N API calls)
const UserList = () => {
  const users = await fetch('/api/users'); // 1 call

  return users.map(user => {
    const details = await fetch(`/api/users/${user.id}/details`); // N calls
    return <UserCard user={user} details={details} />;
  });
};

// ✅ CORRECT: Single batched request
const UserList = () => {
  const usersWithDetails = await fetch('/api/users?include=details'); // 1 call

  return usersWithDetails.map(user => (
    <UserCard user={user} details={user.details} />
  ));
};
```

#### Bad Example 4: Blocking Third-Party Scripts

```html
<!-- ❌ VIOLATION: Blocking script in <head> -->
<script src="https://analytics.example.com/script.js"></script>

<!-- ✅ CORRECT: Async/defer scripts -->
<script src="https://analytics.example.com/script.js" async></script>
<!-- or -->
<script src="https://analytics.example.com/script.js" defer></script>
```

---

## Performance Budgets

### Page-Level Budgets

| Metric | Target | Max Allowed | Measured |
|--------|--------|-------------|----------|
| **Total Bundle Size** | < 150 KB | 200 KB | Gzipped JS + CSS |
| **Initial JS** | < 80 KB | 100 KB | Gzipped |
| **Images** | < 500 KB | 1 MB | Total per page |
| **Fonts** | < 50 KB | 100 KB | WOFF2 format |
| **Third-party Scripts** | < 30 KB | 50 KB | Analytics, ads |

### Component-Level Budgets

| Component Type | Target | Max Allowed |
|----------------|--------|-------------|
| **UI Component** | < 5 KB | 10 KB |
| **Feature Component** | < 20 KB | 30 KB |
| **Page Component** | < 40 KB | 50 KB |
| **Heavy Library** | < 30 KB | 50 KB |

### Runtime Performance

| Metric | Target | Max Allowed |
|--------|--------|-------------|
| **LCP (Largest Contentful Paint)** | < 2.0s | 2.5s |
| **FID (First Input Delay)** | < 50ms | 100ms |
| **CLS (Cumulative Layout Shift)** | < 0.05 | 0.1 |
| **TTI (Time to Interactive)** | < 3.0s | 3.5s |
| **TBT (Total Blocking Time)** | < 200ms | 300ms |

---

## Exceptions

### Requesting an Exception

Performance exceptions require justification and mitigation plan.

```yaml
compliance_exceptions:
  - rule: "IC_performance_budgets - bundle_size"
    reason: "Rich text editor required for content creation (Monaco Editor 120 KB)"
    approved_by: "Tech Lead"
    approved_date: "2025-12-21"
    expires: "2026-06-21"
    mitigation: "Lazy load editor only when user clicks 'Edit', code split to separate chunk"
```

### Valid Exception Reasons

- **Essential third-party library:** No lighter alternative exists (document evaluation)
- **Complex feature:** Rich text editor, chart library, etc. (must lazy load)
- **Admin-only feature:** Not part of critical user path (must code split)

---

## Metrics & Monitoring

### Compliance Metrics

- **Target:** 95% of pages score ≥ 90 on Lighthouse Performance
- **Current:** Track via Lighthouse CI + RUM (Real User Monitoring)
- **Blockers:** Pages scoring < 80

### Tracking

- **Dashboard:** Lighthouse CI + Google Analytics Web Vitals
- **Alert threshold:** Performance score drops below 85
- **Review frequency:** Every PR + Weekly performance audit

---

## Related Documents

- **Parent Spec:** [Web Performance Working Group](https://www.w3.org/webperf/)
- **Related ICs:**
  - `IC_a11y_standards` - Performance impacts accessibility
  - `IC_monitoring_logging` - Track performance metrics
- **Reference Standards:**
  - [Core Web Vitals](https://web.dev/vitals/)
  - [RAIL Performance Model](https://web.dev/rail/)
  - [Performance Budgets Calculator](https://www.performancebudget.io/)

---

## Change Log

### v1.0.0 (2025-12-21)

- Initial version
- Defined bundle size budgets
- Added Core Web Vitals thresholds
- Created optimization requirements
- Included Lighthouse CI integration guide

---

## Enforcement

**Enforcement Level:** Mandatory

**Violations BLOCK deployment.** Any page with Lighthouse Performance score < 90 or bundle size exceeding budget must be optimized before merge.

### Review Process

1. **Automated:** Lighthouse CI runs on every PR
2. **Bundle Analysis:** Webpack stats reviewed for large chunks
3. **Performance Audit:** Monthly review of production Web Vitals
4. **IC Update:** Quarterly budget review (adjust for new patterns)

---

## FAQ

### Q: What if my component is inherently large (e.g., data visualization)?

**A:** Implement lazy loading. Load the component only when user navigates to that section.

```typescript
const ChartComponent = lazy(() => import('./HeavyChart'));
```

### Q: How do I measure my component's bundle size?

**A:**
1. Run `npm run build -- --analyze`
2. Open `dist/stats.html` in browser
3. Find your component chunk and check gzipped size

### Q: What if third-party library exceeds budget?

**A:** Evaluate alternatives. If no alternative:
1. Lazy load the library
2. Code split to separate chunk
3. Only load when feature is used
4. Document in compliance exceptions

### Q: How do I test Web Vitals locally?

**A:**
- Use Chrome DevTools Lighthouse panel
- Install Web Vitals extension
- Use `web-vitals` library in code for real metrics

---

**Last Review:** 2025-12-21
**Next Review:** 2026-03-21
**Owner:** Frontend Team + Performance Lead
