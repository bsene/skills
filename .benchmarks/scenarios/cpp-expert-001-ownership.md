---
id: cpp-expert-001-ownership
skill: cpp-expert
---

# Prompt

Review this API: `Widget* make_widget();` Callers sometimes forget to delete the returned pointer, and the factory can fail. Propose the smallest modern C++ interface change and explain ownership and failure behavior.

# Criteria

- [ ] Replaces ambiguous raw-pointer ownership with `std::unique_ptr<Widget>`
- [ ] Explains that the caller owns the returned object and cleanup is automatic
- [ ] Does not use a raw owning pointer or manual `delete`
- [ ] Does not introduce `shared_ptr` without a demonstrated shared-ownership need
- [ ] Addresses factory failure with an appropriate documented C++ error strategy
