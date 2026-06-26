---
id: solid-001-god-class
skill: oop-principles-solid
---

# Prompt

Review this class with SOLID and refactor it.

```python
class OrderService:
    def __init__(self, db_conn, smtp_host):
        self.db = db_conn
        self.smtp_host = smtp_host

    def place_order(self, cart, user):
        # validate the cart
        if not cart.items:
            raise ValueError("empty cart")
        total = sum(i.price * i.qty for i in cart.items)
        # charge the card by talking to Stripe directly
        import stripe
        stripe.api_key = "sk_live_xxx"
        charge = stripe.Charge.create(amount=int(total * 100), source=user.card_token)
        # persist with a raw SQL string
        self.db.execute(
            f"INSERT INTO orders (user_id, total, charge_id) "
            f"VALUES ({user.id}, {total}, '{charge.id}')"
        )
        # send a confirmation email via raw SMTP
        import smtplib
        s = smtplib.SMTP(self.smtp_host)
        s.sendmail("noreply@shop.com", user.email, f"Order confirmed: ${total}")
        s.quit()
        return charge.id
```

# Criteria

- [ ] Identifies the SRP violation: `place_order` mixes validation, payment, persistence, and notification — multiple reasons to change
- [ ] Identifies the DIP violation: hard dependency on concrete Stripe and smtplib (instantiated/imported inside the method) rather than injected abstractions
- [ ] Proposes splitting along the genuine responsibilities (e.g. a validator, a payment gateway/port, an order repository, a notifier) — roughly one collaborator per real responsibility
- [ ] Proposes depending on injected abstractions (interfaces/ports for payment, persistence, email) so the gateway/transport can be swapped or faked in tests
- [ ] Does NOT over-split: no anemic one-method-per-class explosion, no interface introduced where there is only one implementation and no test/extension need
- [ ] Does NOT change observable behavior or invent unrelated requirements; the refactor preserves what place_order does
