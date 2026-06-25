---
id: cupid-checker-001-review
skill: cupid-checker
---

# Prompt

Review this code with CUPID.

```python
class DataManager:
    def __init__(self, db, cache, mailer, config):
        self.db = db; self.cache = cache; self.mailer = mailer; self.config = config
        self._state = {}

    def process(self, x):
        # validates, writes to db, updates cache, sends email, mutates self._state
        ...
        if random.random() > 0.5:
            return None
        return self._state
```

# Criteria

- [ ] Produces a section for EACH of the five properties (Composable, Unix philosophy, Predictable, Idiomatic, Domain-based)
- [ ] Each section uses the mandated shape: Rating (🟢/🟡/🔴) + Observations + Suggestions
- [ ] Flags the god-object / broad dependency list under Composable, and the multi-responsibility `process` under Unix philosophy
- [ ] Flags non-determinism (`random`) and hidden mutable state (`self._state`) under Predictable
- [ ] Flags CS-speak naming (`DataManager`) under Domain-based
- [ ] Cites concrete code references, not generic advice
- [ ] Frames feedback as direction-of-travel (no "violates"/"must"); names what the code does well
- [ ] Ends with an overall summary + top 1–3 highest-leverage improvements
