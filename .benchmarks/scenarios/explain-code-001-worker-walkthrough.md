---
id: explain-code-001-worker-walkthrough
skill: explain-code
---

# Prompt

I just joined the team and I've never touched this part of the codebase. Walk me through what this does — I want to actually understand it, not just get a summary. Here's the code:

```typescript
// worker/queue.ts
export class OrderWorker {
  constructor(
    private queue: Queue,
    private payments: PaymentGateway,
    private mailer: Mailer,
  ) {}

  async tick() {
    const batch = await this.queue.claim(10, { visibilityTimeout: 30 });
    for (const msg of batch) {
      try {
        const charge = await this.payments.charge(msg.orderId, msg.amountCents);
        await this.mailer.sendReceipt(msg.email, charge.receiptUrl);
        await this.queue.ack(msg);
      } catch (err) {
        await this.queue.retry(msg, { attempts: msg.attempts + 1 });
      }
    }
  }
}
```

# Criteria

- [ ] Opens the explanation with an everyday-life analogy (or includes one early, before the technical walkthrough)
- [ ] Includes a plain-text/ASCII box-and-arrow diagram drawn directly in the response (e.g. `+---+`, `|`, `->` characters)
- [ ] The diagram's arrows are labeled with the data or action flowing along them (orderId/amountCents, charge, receipt, ack/retry), not left unlabeled
- [ ] Walks through the flow inputs-to-outputs naming the actual data (claim batch of up to 10 → charge per message → receipt email → ack, or retry on failure), not just listing the methods
- [ ] Ends with (or includes) a specific gotcha or common misconception (e.g. visibility timeout vs ack window, retry-attempts growth, partial-failure double charge)
- [ ] Does NOT use Mermaid, PlantUML, graphviz, or any diagram-tool DSL syntax in the response
