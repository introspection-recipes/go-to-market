# Go-to-Market

GTM orchestrator: qualify inbound leads, research accounts across CRM and calls, draft outbound for Slack approval, and publish account intelligence.

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
- `sales-research`: CRM, Gong, Apollo, and web context worker.
- `account-intel`: account brief and relationship map writer.
- `outbound-playbook` and `gtm-workflow` skills.
- Codex-style tools for shell, patching, planning, image inspection, and web search.

## Configuration

The recipe ships real HTTP API extension tools. Set only the services you plan to use:

```bash
export SALESFORCE_INSTANCE_URL=https://your-domain.my.salesforce.com
export SALESFORCE_ACCESS_TOKEN=...
export GONG_ACCESS_KEY=...
export GONG_ACCESS_KEY_SECRET=...
export GONG_BASE_URL=https://api.gong.io
export APOLLO_API_KEY=...
export GOOGLE_OAUTH_TOKEN=...
export BIGQUERY_PROJECT_ID=...
export SLACK_BOT_TOKEN=...
export SLACK_APPROVAL_CHANNEL_ID=...
export PARALLEL_API_KEY=...
```

Nothing is sent externally by default except Slack approval drafts through `slack_post_draft`.
