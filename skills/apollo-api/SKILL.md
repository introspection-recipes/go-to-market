---
description: Use for Apollo contact and account enrichment through Apollo's REST API when Apollo MCP is unavailable.
---

# Apollo API

Use this skill when a GTM task needs contact or account enrichment and Apollo
MCP is not configured.

## Setup

Apollo's REST API uses an API key.

```bash
export APOLLO_API_KEY=...
export APOLLO_BASE_URL=https://api.apollo.io
```

## Workflow

1. Verify the API key before enrichment:

```bash
test -n "$APOLLO_API_KEY"
```

2. Use the Apollo API with the documented API key header:

```bash
curl -sS "${APOLLO_BASE_URL:-https://api.apollo.io}/api/v1/people/match" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: $APOLLO_API_KEY" \
  --data '{"email":"person@example.com"}'
```

3. Prefer exact identifiers: email, LinkedIn URL, company domain, or Apollo ID.
4. Treat enrichment as supporting evidence, not ground truth. Cross-check role,
   company, and region against Salesforce or public sources when available.
5. Do not initiate outreach from Apollo unless the user explicitly asks.

## Output

Return matched person/account fields, match confidence, source freshness, missing
fields, and whether enrichment affects qualification or personalization.
