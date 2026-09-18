# Context-budget implementation tickets

## CTX-1 — Add a context-engineering report command

**Target:** `pi-session-monitor/extensions/session-monitor.ts`

Add `/context-report` alongside `/ctx`. It reports the current and peak context budget, cumulative token cost, recent per-turn usage, compaction effectiveness, and a recommended next action: continue, compact, or hand off.

**Acceptance criteria:**

- Uses only existing Pi session and usage APIs.
- Clearly labels unavailable telemetry as unknown.
- Does not claim to inspect prompts, tools, or retrieved documents that Pi does not expose.

## CTX-2 — Surface the 100k handoff threshold

**Target:** `pi-session-monitor/extensions/session-monitor.ts`

Warn once when reported context tokens reach 100,000. The warning directs the user to `/context-report`; it never compacts or starts a new session automatically.

**Acceptance criteria:**

- Resets on new, resumed, and forked sessions.
- Does not warn when the provider omits current context-token telemetry.

## CTX-3 — Document the report and decision boundary

**Target:** `pi-session-monitor/README.md`

Document `/context-report`, the 100k warning, and that the report bases recommendations only on observable session telemetry.

**Acceptance criteria:**

- Keeps `/ctx` as the compact report.
- States that compaction and handoff remain user-directed.
