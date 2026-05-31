---
id: rest-api-001-status-code
skill: rest-api-design
---

# Prompt

I have `POST /v1/transfers` to move money between accounts. What status code should I return when the user tries to transfer $500 but only has $30? Body validates fine — accounts exist, amount is a positive number, currency matches.

# Criteria

- [ ] Response returns `400 Bad Request` (illegal operation, not schema violation), NOT `422`
- [ ] Response distinguishes `400` (illegal op) from `422` (validation/schema)
- [ ] Response distinguishes `400` from `409 Conflict` (state collision, e.g. concurrent edit)
- [ ] Response includes machine-readable `error_code` + human-readable message in body
- [ ] Response considers idempotency-key behavior (cache 4xx, not 5xx)
