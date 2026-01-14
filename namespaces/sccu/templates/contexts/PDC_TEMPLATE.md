<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - context_id: PDC_[name] → PDC_api_reference, PDC_sdk_documentation, etc.
   - based_on: PA context this PDC is generated from
   - publication.url: Public URL where docs will be published
   - last_updated: 2025-12-23 → Use today's date (format: YYYY-MM-DD)

2. Choose a unique context_id following the pattern: PDC_[name]
   - Only letters (a-z, A-Z) and underscores allowed
   - NO hyphens, NO braces, NO brackets
   - Examples: PDC_api_reference, PDC_webhooks, PDC_sdk_documentation

3. Update the date field with today's date:
   - Get date: `date +%Y-%m-%d` (Linux/Mac) or `Get-Date -Format "yyyy-MM-dd"` (Windows)
   - Format: YYYY-MM-DD (e.g., 2025-12-23)

4. Remove this instruction block after filling in all values

5. Fill in all required sections below

See also:
- YAML formatting guide: specifications/guides/standards/development/YAML_FRONTMATTER_GUIDE.md
- PA template: specifications/templates/contexts/PA_TEMPLATE.md
- Generate tool: npm run generate-public-docs
-->

---
context_id: PDC_[name]            # Example: PDC_api_reference, PDC_webhooks
version: "1.0.0"                  # Keep quotes! Don't use: version: 1.0.0
type: public-documentation        # Don't change - PDC contexts are always type: public-documentation
based_on:
  project_asset:
    id: "PA_[id]"                 # PA context this PDC is based on
    version: "1.0.0"              # Version of PA used
publication:
  url: "https://api.example.com/docs"  # Public URL for documentation
  formats:                        # Output formats
    - swagger-ui                  # Interactive API explorer
    - redoc                       # Clean API reference
    - markdown                    # Static docs
  visibility: public              # public | partner | internal
audience:                         # Target audience
  - external_developers           # Public developers
  - partners                      # Integration partners
  - community                     # Open source community
health:
  documentation_coverage: 100     # 0-100 percentage
  last_updated: 2025-12-23        # REPLACE with current date (format: YYYY-MM-DD)
  staleness_days: 0               # Auto-calculated by validator
  sync_status: synced             # synced | out_of_sync | pending
migration:
  breaking_changes: []            # List of breaking changes (if any)
  deprecations: []                # List of deprecated features
  migration_guide: null           # Link to migration guide (if needed)
---

# Public Documentation: [Name]

## Overview

[Brief description of what this public documentation covers - under 100 words]

**Purpose:**
- Provide external developers with clear API reference
- Enable partners to integrate with our services
- Offer community members documentation for SDKs/tools

**Audience:** [External developers | Partners | Community]

---

## Getting Started

### Prerequisites

- [Requirement 1: e.g., API key from developer portal]
- [Requirement 2: e.g., Account registration]
- [Requirement 3: e.g., Supported programming language]

### Quickstart

**Step 1: Get API Credentials**
```bash
# Register at https://developer.example.com
# Retrieve API key from dashboard
```

**Step 2: Make First Request**
```bash
curl -X GET "https://api.example.com/v1/resource" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Step 3: Handle Response**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1
  }
}
```

---

## API Reference

### Base URL

```
Production: https://api.example.com/v1
Sandbox:    https://sandbox-api.example.com/v1
```

### Authentication

**Method:** Bearer Token
```
Authorization: Bearer YOUR_API_KEY
```

**Example:**
```bash
curl -H "Authorization: Bearer sk_live_abc123..." \
     https://api.example.com/v1/products
```

### Rate Limits

| Plan | Requests/Hour | Burst |
|------|---------------|-------|
| Free | 1,000 | 100 |
| Pro  | 10,000 | 500 |
| Enterprise | Unlimited | Unlimited |

### Full Specification

**OpenAPI Schema:** See [openapi.yaml](./openapi.yaml)

**Interactive Docs:**
- Swagger UI: [https://api.example.com/docs](https://api.example.com/docs)
- ReDoc: [https://api.example.com/redoc](https://api.example.com/redoc)

---

## Endpoints

### Core Endpoints

#### GET /v1/resources

Retrieve a list of resources.

**Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `filter` (string, optional): Filter criteria

**Response:**
```json
{
  "data": [
    {
      "id": "res_123",
      "name": "Example Resource",
      "created_at": "2025-12-23T10:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

**Example Request:**
```bash
curl -X GET "https://api.example.com/v1/resources?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## SDKs & Libraries

### Official SDKs

**JavaScript/TypeScript:**
```bash
npm install @example/sdk
```

**Python:**
```bash
pip install example-sdk
```

**Go:**
```bash
go get github.com/example/sdk-go
```

### SDK Usage Examples

**JavaScript:**
```javascript
import { ExampleClient } from '@example/sdk';

const client = new ExampleClient({ apiKey: 'YOUR_API_KEY' });

const resources = await client.resources.list({
  page: 1,
  limit: 10
});
```

**Python:**
```python
from example_sdk import ExampleClient

client = ExampleClient(api_key='YOUR_API_KEY')
resources = client.resources.list(page=1, limit=10)
```

---

## Code Examples

### Example 1: List Resources

```typescript
// TypeScript
import { ExampleClient } from '@example/sdk';

const client = new ExampleClient({ apiKey: process.env.API_KEY });

async function listResources() {
  const response = await client.resources.list();
  console.log(response.data);
}
```

### Example 2: Create Resource

```typescript
// TypeScript
async function createResource() {
  const resource = await client.resources.create({
    name: 'New Resource',
    type: 'example'
  });
  console.log('Created:', resource.id);
}
```

### Example 3: Error Handling

```typescript
// TypeScript
try {
  const resource = await client.resources.get('res_123');
} catch (error) {
  if (error.status === 404) {
    console.error('Resource not found');
  } else if (error.status === 401) {
    console.error('Unauthorized - check API key');
  } else {
    console.error('Error:', error.message);
  }
}
```

---

## Webhooks

### Event Types

| Event | Description |
|-------|-------------|
| `resource.created` | New resource created |
| `resource.updated` | Resource updated |
| `resource.deleted` | Resource deleted |

### Webhook Payload

```json
{
  "event": "resource.created",
  "data": {
    "id": "res_123",
    "name": "Example Resource",
    "created_at": "2025-12-23T10:00:00Z"
  },
  "timestamp": "2025-12-23T10:00:01Z"
}
```

### Setting Up Webhooks

```bash
curl -X POST "https://api.example.com/v1/webhooks" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks",
    "events": ["resource.created", "resource.updated"]
  }'
```

---

## Error Handling

### Error Format

All errors return:
```json
{
  "error": {
    "code": "resource_not_found",
    "message": "The requested resource was not found",
    "details": {
      "resource_id": "res_123"
    }
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `unauthorized` | 401 | Invalid or missing API key |
| `forbidden` | 403 | Insufficient permissions |
| `resource_not_found` | 404 | Resource doesn't exist |
| `rate_limit_exceeded` | 429 | Too many requests |
| `internal_error` | 500 | Server error |

---

## Best Practices

### Security

- ✅ Store API keys in environment variables
- ✅ Use HTTPS for all requests
- ✅ Rotate API keys regularly
- ❌ Never commit API keys to version control

### Performance

- ✅ Use pagination for large datasets
- ✅ Cache responses when appropriate
- ✅ Implement exponential backoff for retries
- ❌ Don't make parallel requests exceeding rate limits

### Error Handling

- ✅ Handle all HTTP error codes
- ✅ Log errors for debugging
- ✅ Provide user-friendly error messages
- ❌ Don't expose internal error details to end users

---

## Support & Resources

### Documentation

- **API Reference:** [https://api.example.com/docs](https://api.example.com/docs)
- **Guides:** [https://docs.example.com/guides](https://docs.example.com/guides)
- **Changelog:** [https://docs.example.com/changelog](https://docs.example.com/changelog)

### Community

- **GitHub:** [https://github.com/example/sdk](https://github.com/example/sdk)
- **Discord:** [https://discord.gg/example](https://discord.gg/example)
- **Stack Overflow:** Tag `example-api`

### Support

- **Email:** support@example.com
- **Status Page:** [https://status.example.com](https://status.example.com)

---

## Changelog

### v1.0.0 - 2025-12-23

**Added:**
- Initial public API documentation
- JavaScript/Python SDK examples
- Webhook integration guide

**Based On:** PA_[id] v1.0.0

---

## Migration Log

### v1.0.0 - 2025-12-23 (Initial Version)
**Changes:** Initial public documentation
**Migration Steps:** N/A
**Affected Contexts:** None
