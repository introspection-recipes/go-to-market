---
description: Use for Gong call history, transcript snippets, account activity, and sales conversation context through the Gong API.
---

# Gong API

Use this skill when a GTM task needs call history, transcript snippets, account
activity, or sales conversation context and Gong MCP is not configured.

## Setup

Gong API access uses an access key and access key secret.

```bash
export GONG_ACCESS_KEY=...
export GONG_ACCESS_KEY_SECRET=...
export GONG_BASE_URL=https://api.gong.io
```

## Workflow

1. Verify credentials are present before making requests:

```bash
test -n "$GONG_ACCESS_KEY" && test -n "$GONG_ACCESS_KEY_SECRET"
```

2. Use Basic authentication with `curl`:

```bash
curl -sS -u "$GONG_ACCESS_KEY:$GONG_ACCESS_KEY_SECRET" \
  "${GONG_BASE_URL:-https://api.gong.io}/v2/calls"
```

3. For call details or transcripts, use the official Gong endpoint for that
   resource and keep filters narrow by account, date range, call ID, or user.
4. Quote only short transcript snippets needed for the recommendation. Avoid
   placing long call transcripts in final output.
5. Do not create or update Gong resources unless the user explicitly asks.

## Output

Return call IDs, dates, participants, source links, short relevant snippets,
confidence, and caveats about missing transcripts or incomplete account match.
