---
id: vendor-reference-001-source-grounding
skill: vendor-reference
---

# Prompt

We use an unfamiliar library and its docs are incomplete. Before recommending its retry API, ground the answer in the library's implementation without adding its source to our repository history.

# Criteria

- [ ] Asks for or identifies the library and version to inspect
- [ ] Uses the library source as read-only analysis material
- [ ] Keeps vendored source out of version control
- [ ] Bases the recommendation on observed implementation behavior rather than guessing from documentation
- [ ] Does not alter the application merely to inspect the library
