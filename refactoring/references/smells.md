# Code Smell Catalog

Surface signals that a deeper problem exists. Smells don't break code — they make it harder to understand, test, and change.

---

## Smell #1: Long Method

**Detect:** >10–15 lines · multiple responsibilities · many local vars · hard to name concisely · multiple indentation levels.

**Treatment:** Extract Method (Rule of Three).

```python
# ❌ One method doing 5 things
def process_payment(order, payment_info, invoice_manager, email_service):
    if payment_info['amount'] <= 0: raise ValueError("Invalid amount")
    if payment_info['card_number'] is None: raise ValueError("Card required")
    transaction_id = gateway.charge(payment_info['card_number'], payment_info['amount'], payment_info['expiry'])
    order.transaction_id = transaction_id
    order.status = 'paid'
    order.paid_at = datetime.now()
    invoice = invoice_manager.create(order, transaction_id)
    email_service.send_order_confirmation(order)
    email_service.send_invoice(order.customer_email, invoice)
    return transaction_id

# ✅ Orchestrator + focused helpers (each ~5 lines)
def process_payment(order, payment_info, invoice_manager, email_service):
    validate_payment_info(payment_info)
    transaction_id = charge_payment(payment_info)
    update_order_with_transaction(order, transaction_id)
    send_order_confirmation(order, invoice_manager, email_service)
    return transaction_id
```

**Payoff:** Each helper testable in isolation; intent visible at orchestrator level.

---

## Smell #2: Large Class

**Detect:** >10–15 methods · >5–7 fields across different concerns · vague suffix (`Manager`, `Handler`, `Service`) · multiple reasons to change · many dependencies.

**Treatment:** Extract Class.

```typescript
// ❌ UserService mixing CRUD + password + email + audit + cache
class UserService {
  private db; private emailService; private auditLog; private cache; private cryptoService;
  createUser() {} updateUser() {} findUserById() {}
  hashPassword() {} verifyPassword() {}
  sendWelcomeEmail() {} logAudit() {}
  // ... 6 more across mixed concerns
}

// ✅ Split by concern
class PasswordManager { hash() {} verify() {} generateResetToken() {} }
class UserRepository { create() {} update() {} findById() {} }
class UserService {
  constructor(private userRepo, private passwordManager, private emailService, private auditLog) {}
  registerUser(name, email, password) {
    const hash = this.passwordManager.hash(password);
    const user = this.userRepo.create({ name, email, passwordHash: hash });
    this.emailService.sendWelcomeEmail(user);
    this.auditLog.log("user_registered", user.id);
    return user;
  }
}
```

**Payoff:** Focused classes; one reason to change each; easier to test and extend.

---

## Smell #3: Primitive Obsession

**Detect:** string/int constants for domain values (`status = "pending"`) · primitive arrays as pseudo-objects (`person = ["John", 30]`) · validation scattered (`email.includes("@")` everywhere) · type info lost (`unknown[]`).

**Treatment:** Introduce Type / Object.

```typescript
// ❌ Validation scattered, status is a stringly-typed pseudo-enum
function processOrder(customerId: string, items: string[], amount: number, status: string) {
  if (customerId.length === 0) throw new Error("Invalid customer");
  if (!["pending", "processing", "completed"].includes(status)) throw new Error("Invalid status");
  if (status === "pending") { /* ... */ }
}

// ✅ Domain types — validation once, status closed
enum OrderStatus { PENDING = "pending", PROCESSING = "processing", COMPLETED = "completed" }
type Email = string & { readonly __brand: "Email" };
function createEmail(value: string): Email {
  if (!value.includes("@")) throw new Error("Invalid email");
  return value as Email;
}
type Order = { readonly customerId: CustomerId; readonly items: readonly string[]; readonly amount: number; readonly status: OrderStatus };
function processOrder(order: Order) {
  switch (order.status) { case OrderStatus.PENDING: /* ... */ }
}
```

**Payoff:** Validation centralized; type system prevents invalid states; intent explicit.

---

## Smell #4: Long Parameter List

**Detect:** >3–4 params · params related to a common concept · positional booleans (`true, false, "rush", 50`) · same group repeated across functions.

**Treatment:** Introduce Parameter Object / collapse booleans to enums.

```python
# ❌ 16 params — call site is unreadable
def book_flight(departure_city, arrival_city, departure_date, return_date,
    number_of_passengers, cabin_class, is_direct_only, max_price, airline_preference,
    hotel_needed, hotel_city, hotel_check_in, hotel_check_out,
    car_rental_needed, car_rental_location, car_rental_type): ...

book_flight("NYC", "LAX", "2026-04-01", "2026-04-08", 2, "business", True, 1500, "United", True, "LAX", "2026-04-01", "2026-04-08", True, "LAX", "midsize")

# ✅ Parameter objects + enum for cabin
@dataclass
class FlightCriteria:
    departure_city: str; arrival_city: str; departure_date: date
    return_date: date | None = None; number_of_passengers: int = 1
    cabin_class: CabinClass = CabinClass.ECONOMY
    is_direct_only: bool = False; max_price: float | None = None

def book_trip(flight: FlightCriteria, accommodation: AccommodationCriteria): ...

book_trip(
    FlightCriteria(departure_city="NYC", arrival_city="LAX",
                   departure_date=date(2026, 4, 1), cabin_class=CabinClass.BUSINESS),
    AccommodationCriteria(hotel_city="LAX", car_rental_type="midsize"))
```

**Payoff:** Call sites self-documenting; fewer test combinations; easy to extend.

---

## Smell #5: Data Clumps

**Detect:** same group of variables repeats across signatures/classes · same fields appear with same names in multiple types · same local vars used together.

**Treatment:** Extract Class — let the clump become a real domain object with its own validation.

```python
# ❌ Same 5 card fields + validation duplicated in every class
class PaymentProcessor:
    def process(self, card_number, card_holder, exp_month, exp_year, cvv):
        if len(card_number) != 16: raise ValueError("Invalid card")
        if exp_month < 1 or exp_month > 12: raise ValueError("Invalid month")

class PaymentValidator:
    def validate(self, card_number, card_holder, exp_month, exp_year, cvv):
        if len(card_number) != 16: raise ValueError("Invalid card")

# ✅ CreditCard owns its data + validation
@dataclass
class CreditCard:
    number: str; holder_name: str; exp_month: int; exp_year: int; cvv: str
    def __post_init__(self):
        if len(self.number) != 16 or not self.number.isdigit(): raise ValueError("Invalid card number")
        if self.exp_month < 1 or self.exp_month > 12: raise ValueError("Invalid month")
        if self.exp_year < datetime.now().year: raise ValueError("Card expired")

class PaymentProcessor:
    def process(self, card: CreditCard, amount: float): ...
```

**Payoff:** Validation in one place; parameters harder to misuse; consistent type across codebase.

---

## Smell #6: Comments

A **Comments smell** is a comment that explains *what* code does instead of *why* — usually a sign the code's structure (not its annotation) needs to change.

### Detection → Treatment

| Comment looks like | Treatment |
|--------------------|-----------|
| Explains a complex expression | **Extract Variable** |
| Describes what a block does | **Extract Method** |
| Method purpose unclear from name | **Rename Method** |
| Documents a required precondition | **Introduce Assertion** |
| Documents expected behavior / edge cases | **Write Tests** |
| Commented-out code | Ask user, then delete |
| Restates the code | Delete |
| Outdated / misleading | Delete |

### Examples

```typescript
// ❌ Complex condition with no name
if (user.age >= 18 && user.country === "FR" && !user.isBanned) allowAccess();
// ✅ Extract Variable
const canAccessAdultContentInFrance = user.age >= 18 && user.country === "FR" && !user.isBanned;
if (canAccessAdultContentInFrance) allowAccess();
```

```typescript
// ❌ Two responsibilities glued together
function processOrder(order: Order) {
  for (const item of order.items) {
    if (item.quantity <= 0) throw new Error("Invalid quantity");
    if (item.price < 0) throw new Error("Invalid price");
  }
  const total = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
}
// ✅ Extract Method
function processOrder(order: Order) {
  validateOrderItems(order.items);
  const total = calculateOrderTotal(order.items);
}
```

```typescript
// ❌ Cryptic name
function process(x: number): number { return (x * 9) / 5 + 32; }
// ✅ Rename
function celsiusToFahrenheit(c: number): number { return (c * 9) / 5 + 32; }
```

```typescript
// ❌ Precondition implied
setDiscount(rate: number) { this.discount = rate; }
// ✅ Introduce Assertion
setDiscount(rate: number) {
  if (rate < 0 || rate > 1) throw new RangeError("Rate must be between 0 and 1");
  this.discount = rate;
}
```

### Tidyings Chain

Refactors invalidate adjacent comments. After Extract Method or Guard Clause, re-scan nearby comments:

```typescript
// ❌ Comment now restates the guard
function handleRequest(req: Request) {
  if (!req.session) return renderAnonymous();
  // no session, fall back to anonymous
  return renderDashboard(loadUser(req.session.userId));
}
// ✅ Delete the redundancy
function handleRequest(req: Request) {
  if (!req.session) return renderAnonymous();
  return renderDashboard(loadUser(req.session.userId));
}
```

### Inverse Tidying: Add Comment

Record non-obvious *why*: hidden constraints, ordering requirements, domain quirks, fix context that won't be inferred from the code.

```typescript
// Stripe webhooks can arrive out of order and be redelivered for up to 3 days.
// Dedupe on event.id rather than created_at.
async function handleStripeEvent(event: Stripe.Event) {
  if (await seenEvents.has(event.id)) return;
  await seenEvents.add(event.id);
  await process(event);
}
```

### Legitimate Comments — Do Not Remove

- *Why* a decision was made (business, regulatory, workaround)
- Genuinely complex algorithm where simpler alternatives were exhausted
- Public API docs (JSDoc for libraries)
- External context (tickets, specs, legal)
- Order-of-execution / non-inferable constraints
- TODO comments (always require manual decision)

> "The whole point is not to delete comments, but to obviate them and then delete them." — Tim Ottinger

---

## Smell #7: Uncommunicative Name

A name that fails to answer *why does it exist, what does it do, how is it used?* If the name requires a comment, it does not reveal intent. — *Clean Code*, Martin, ch. 2

**Detect:** single-letter vars outside tight loops (`d`, `tmp`, `r`) · name needs a comment for units/purpose (`int d; // days`) · generic placeholders (`data`, `info`, `list1`, `getThem`) · magic indices (`x[0]`) · missing unit/measure (`timeout` not `timeoutMs`) · misleading or outdated.

**Treatment:** Rename (Technique #7), Introduce Variable / Replace Magic Literal (Technique #4).

```java
// ❌ Implicit code — reader must reconstruct the context
public List<int[]> getThem() {
  List<int[]> list1 = new ArrayList<int[]>();
  for (int[] x : theList)
    if (x[0] == 4) list1.add(x);
  return list1;
}

// ✅ Same operators and structure — context now explicit
public List<int[]> getFlaggedCells() {
  List<int[]> flaggedCells = new ArrayList<int[]>();
  for (int[] cell : gameBoard)
    if (cell[STATUS_VALUE] == FLAGGED) flaggedCells.add(cell);
  return flaggedCells;
}
```

For primitives, the right rename depends on which question matters:

```java
int d;                       // ❌ unit hidden in a comment
int elapsedTimeInDays;       // ✅ duration
int daysSinceCreation;       // ✅ age from anchor
int fileAgeInDays;           // ✅ domain-specific framing
```

**Payoff:** No simpler, no shorter — but the reader stops reverse-engineering. Comments that restated intent (see Smell #6) can be deleted.

---

## Severity Guidelines

| Severity | Long Method | Large Class | Param List | Data Clumps | Uncommunicative Name |
|----------|------------|-------------|------------|-------------|----------------------|
| **Critical** | >30 lines | >20 methods | >6 params | 3+ places | Public API / cross-module name misleading |
| **High** | 15–30 lines | 15–20 methods | 5–6 params | 2 places | Generic name on widely-called function/class |
| **Medium** | 10–15 lines | 10–15 methods | 4–5 params | limited scope | Single-letter vars outside tight loops; missing units |
| **Low** | 8–10 lines (clear) | 8–10 methods (cohesive) | 3–4 params (named) | local only | Local temp with weak but unambiguous name |
