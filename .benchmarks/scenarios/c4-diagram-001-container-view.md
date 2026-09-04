---
id: c4-diagram-001-container-view
skill: c4-diagram
---

# Prompt

I need a C4 diagram for our platform to go in the new-hire docs. The system: field engineers use a React web SPA; it talks over HTTPS to a Node.js (Express) REST API; the API stores data in PostgreSQL, caches sessions in Redis, charges cards through Stripe (a third-party payment provider we don't control), and sends emails through SendGrid (also third-party). The question the doc must answer for a new hire is: "what are the main services/apps/databases and how do they talk to each other?" I have the Structurizr CLI installed. Give me the diagram source I can use.

# Criteria

- [ ] Selects (and states) the Container level — Level 2 — as the right depth for a "main services and databases" question, not Context or code-level
- [ ] Delivers Structurizr DSL (workspace / model / views with a container view), not Mermaid or generic boxes
- [ ] Every container (SPA, API, PostgreSQL, Redis) declares its technology (React, Node.js Express, PostgreSQL, Redis)
- [ ] Every relationship is labeled with an action plus protocol (e.g. "makes charge calls via HTTPS", "reads/writes via SQL"), not a bare "uses"
- [ ] Stripe and SendGrid are modeled as external systems (tagged or described as external), not as containers inside our system boundary
- [ ] Does NOT include class/method-level (Level 4) boxes, and does not model more than ~12 elements by detailing every internal module
