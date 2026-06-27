# Go-to-Market

GTM orchestrator: qualify inbound leads, research accounts with verified web, warehouse, CLI, and direct API context, draft outbound for Slack approval, and publish account intelligence.

## Try It

```bash
recipes install github:introspection-recipes/go-to-market
pi --recipe go-to-market
```

For local development:

```bash
recipes doctor .
recipes install .
pi --recipe go-to-market
```

## What It Includes

- `agent`: GTM orchestrator.
- `lead-research`: inbound qualification and do-not-send checks.
- `sales-research`: Salesforce, Gong, Apollo, public web, warehouse, and user-provided account context worker.
- `account-intel`: account brief and relationship map writer.
- `outbound-playbook` and `gtm-workflow` skills.
- `salesforce-cli`, `gong-api`, and `apollo-api` skills for non-MCP integrations.
- Codex-style tools for shell, patching, planning, image inspection, and web search.

## MCP Configuration

The recipe uses verified MCP servers for BigQuery and Slack.
`recipes install` writes `.pi/mcp.local.json` into the installed recipe if it
does not already exist. Fill in the environment variables printed by install
before launching Pi:

```bash
export GOOGLE_OAUTH_ACCESS_TOKEN=...
export SLACK_MCP_URL=https://mcp.slack.com/mcp
export SLACK_MCP_TOKEN=...
pi --recipe go-to-market
```

BigQuery uses Google's hosted MCP endpoint at `https://bigquery.googleapis.com/mcp`
with a Google OAuth access token in `Authorization: Bearer ...`. Slack uses
Slack's hosted MCP token.

The recipe allows only verified tool names:

- BigQuery: `execute_sql_readonly`, `get_table_info`, `list_dataset_ids`, `list_table_ids`
- Slack: `slack_send_message_draft`

Salesforce, Gong, and Apollo MCPs are not enabled in this launch recipe. They
have real MCP offerings, but their supported setup is OAuth/client-flow oriented
or exposes workspace-defined tools, while the previous recipe names
(`salesforce_get_lead`, `gong_search_calls`, `apollo_enrich_contact`) were not
verified MCP tools.

## CLI/API Fallbacks

Salesforce, Gong, and Apollo are supported outside MCP through their official
CLI or REST APIs.

```bash
# Salesforce: authenticate once outside Pi, then optionally set the target org.
sf org login web
export SF_TARGET_ORG=...

# Gong: API access key and secret.
export GONG_ACCESS_KEY=...
export GONG_ACCESS_KEY_SECRET=...
export GONG_BASE_URL=https://api.gong.io

# Apollo: API key.
export APOLLO_API_KEY=...
export APOLLO_BASE_URL=https://api.apollo.io
```

The recipe skills keep these paths read-only by default:

- `salesforce-cli`: uses `sf data query --json` for SOQL lookups.
- `gong-api`: uses Gong's REST API with Basic auth for call context.
- `apollo-api`: uses Apollo's REST API with `X-Api-Key` for enrichment.

The agent should skip a fallback when its credentials or CLI are unavailable
and state what is missing rather than inventing account data.

The `web_search` tool remains a local recipe extension backed by Parallel. Set
these only if you want web search:

```bash
export PARALLEL_API_KEY=...
```

Nothing is sent externally by default except configured BigQuery read-only queries, Salesforce CLI queries, Gong/Apollo API reads, web search, and Slack approval drafts through `slack_send_message_draft`.
