---
description: Use for Salesforce lead, account, contact, opportunity, and campaign lookups through the official sf CLI.
---

# Salesforce CLI

Use this skill when a GTM task needs Salesforce leads, accounts, contacts,
opportunities, or campaign context and Salesforce MCP is not configured.

## Setup

Use Salesforce's official CLI authentication outside Pi:

```bash
sf org login web
export SF_TARGET_ORG=...
```

`SF_TARGET_ORG` may be an alias, username, or org identifier. If it is not set,
use the default org configured in the Salesforce CLI.

## Workflow

1. Verify the CLI and org before querying:

```bash
if test -n "$SF_TARGET_ORG"; then
  sf org display --target-org "$SF_TARGET_ORG" --json
else
  sf org display --json
fi
```

2. Use read-only SOQL queries with JSON output:

```bash
if test -n "$SF_TARGET_ORG"; then
  sf data query --target-org "$SF_TARGET_ORG" --json \
    --query "SELECT Id, Name, Company, Email, Status FROM Lead WHERE Email = 'person@example.com' LIMIT 5"
else
  sf data query --json \
    --query "SELECT Id, Name, Company, Email, Status FROM Lead WHERE Email = 'person@example.com' LIMIT 5"
fi
```

3. Keep queries narrow. Select only fields needed for qualification, routing,
   do-not-send checks, account ownership, and relationship context.
4. Do not update Salesforce records unless the user explicitly asks.

## Output

Return the SOQL query used, the records found, owner/status fields, data
freshness caveats, and whether Salesforce evidence changed the recommendation.
