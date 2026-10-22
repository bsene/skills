---
id: rest-api-002-idempotent-payment
skill: rest-api-design
---

# Prompt

Review my `POST /v1/payments` endpoint. Clients on flaky mobile networks retry on timeout and some customers got charged twice. Two requests can also edit the same payment at once. Body validation passes. What should the endpoint return and do?

# Criteria

- [ ] Response requires an `Idempotency-Key` header on the POST
- [ ] Response replays the same stored response for a repeated key (e.g. `X-Idempotent-Replayed: true`), not a second charge
- [ ] Response caches 2xx and 4xx results but allows retry after 5xx
- [ ] Response uses `409 Conflict` for the concurrent-edit state collision, distinct from `400` and `422`
- [ ] Response returns `201 Created` with `Location:` for creation
- [ ] Response specifies one error shape with machine-readable `error_code` + human message
