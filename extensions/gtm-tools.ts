import type { ExtensionAPI, ExtensionFactory } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function jsonRequest(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) throw new Error(`${url} failed: ${res.status} ${res.statusText}${text ? `\n${text}` : ""}`);
  return text ? JSON.parse(text) : {};
}

function sfUrl(path: string): string {
  const base = required("SALESFORCE_INSTANCE_URL").replace(/\/$/, "");
  const version = process.env.SALESFORCE_API_VERSION || "v60.0";
  return `${base}/services/data/${version}${path}`;
}

const extension: ExtensionFactory = (pi: ExtensionAPI) => {
  pi.registerTool({
    name: "salesforce_get_lead",
    label: "Salesforce Lead",
    description: "Fetch a Salesforce Lead by id. Requires SALESFORCE_INSTANCE_URL and SALESFORCE_ACCESS_TOKEN.",
    parameters: Type.Object({ lead_id: Type.String() }),
    async execute(_id, params) {
      const body = await jsonRequest(sfUrl(`/sobjects/Lead/${encodeURIComponent(params.lead_id)}`), {
        headers: { Authorization: `Bearer ${required("SALESFORCE_ACCESS_TOKEN")}` },
      });
      return { content: [{ type: "text", text: JSON.stringify(body, null, 2) }], details: body };
    },
  });

  pi.registerTool({
    name: "salesforce_get_account",
    label: "Salesforce Account",
    description: "Fetch a Salesforce Account by id. Requires SALESFORCE_INSTANCE_URL and SALESFORCE_ACCESS_TOKEN.",
    parameters: Type.Object({ account_id: Type.String() }),
    async execute(_id, params) {
      const body = await jsonRequest(sfUrl(`/sobjects/Account/${encodeURIComponent(params.account_id)}`), {
        headers: { Authorization: `Bearer ${required("SALESFORCE_ACCESS_TOKEN")}` },
      });
      return { content: [{ type: "text", text: JSON.stringify(body, null, 2) }], details: body };
    },
  });

  pi.registerTool({
    name: "gong_search_calls",
    label: "Gong Search Calls",
    description: "Search Gong calls. Requires GONG_ACCESS_KEY and GONG_ACCESS_KEY_SECRET.",
    parameters: Type.Object({
      query: Type.String(),
      from_date: Type.Optional(Type.String({ description: "YYYY-MM-DD" })),
      to_date: Type.Optional(Type.String({ description: "YYYY-MM-DD" })),
    }),
    async execute(_id, params) {
      const auth = Buffer.from(`${required("GONG_ACCESS_KEY")}:${required("GONG_ACCESS_KEY_SECRET")}`).toString("base64");
      const body = await jsonRequest("https://api.gong.io/v2/calls/extensive", {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          filter: {
            fromDateTime: params.from_date ? `${params.from_date}T00:00:00Z` : undefined,
            toDateTime: params.to_date ? `${params.to_date}T23:59:59Z` : undefined,
          },
          contentSelector: { context: "Extended", exposedFields: { parties: true, content: true } },
        }),
      });
      const calls = (body.calls ?? []).filter((call: any) => JSON.stringify(call).toLowerCase().includes(params.query.toLowerCase()));
      return { content: [{ type: "text", text: JSON.stringify(calls.slice(0, 10), null, 2) }], details: { ...body, calls } };
    },
  });

  pi.registerTool({
    name: "apollo_enrich_contact",
    label: "Apollo Enrich Contact",
    description: "Enrich a contact with Apollo. Requires APOLLO_API_KEY.",
    parameters: Type.Object({
      email: Type.Optional(Type.String()),
      first_name: Type.Optional(Type.String()),
      last_name: Type.Optional(Type.String()),
      organization_name: Type.Optional(Type.String()),
    }),
    async execute(_id, params) {
      const url = new URL("https://api.apollo.io/api/v1/people/match");
      for (const [key, value] of Object.entries(params)) if (value) url.searchParams.set(key, String(value));
      const body = await jsonRequest(url.toString(), {
        headers: { "Cache-Control": "no-cache", "x-api-key": required("APOLLO_API_KEY") },
      });
      return { content: [{ type: "text", text: JSON.stringify(body, null, 2) }], details: body };
    },
  });

  pi.registerTool({
    name: "bigquery_query",
    label: "BigQuery Query",
    description: "Run a BigQuery SQL query. Requires GOOGLE_OAUTH_TOKEN and BIGQUERY_PROJECT_ID.",
    parameters: Type.Object({
      query: Type.String(),
      max_results: Type.Optional(Type.Number({ minimum: 1, maximum: 1000 })),
    }),
    async execute(_id, params) {
      const projectId = required("BIGQUERY_PROJECT_ID");
      const body = await jsonRequest(`https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(projectId)}/queries`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${required("GOOGLE_OAUTH_TOKEN")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: params.query, useLegacySql: false, maxResults: params.max_results ?? 100 }),
      });
      return { content: [{ type: "text", text: JSON.stringify(body, null, 2) }], details: body };
    },
  });

  pi.registerTool({
    name: "slack_post_draft",
    label: "Slack Post Draft",
    description: "Post an approval-ready outbound draft to Slack. Requires SLACK_BOT_TOKEN.",
    parameters: Type.Object({
      channel: Type.Optional(Type.String({ description: "Defaults to SLACK_APPROVAL_CHANNEL_ID." })),
      draft: Type.String(),
      rationale: Type.Optional(Type.String()),
    }),
    async execute(_id, params) {
      const channel = params.channel ?? required("SLACK_APPROVAL_CHANNEL_ID");
      const text = params.rationale ? `${params.draft}\n\nRationale:\n${params.rationale}` : params.draft;
      const body = await jsonRequest("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${required("SLACK_BOT_TOKEN")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel, text }),
      });
      if (!body.ok) throw new Error(`Slack error: ${body.error}`);
      return { content: [{ type: "text", text: JSON.stringify(body, null, 2) }], details: body };
    },
  });
};

export default extension;
