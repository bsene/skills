# Language-Specific Refactoring Patterns

Refactoring techniques adapted for different programming languages and paradigms.

---

## TypeScript/JavaScript

### Extract Method

```typescript
// Before
function processOrder(order: Order): void {
  if (order.items.length === 0) throw new Error("No items");
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  order.total = total;
  order.status = "processed";
}

// After
function processOrder(order: Order): void {
  validateOrder(order);
  order.total = calculateOrderTotal(order);
  markOrderAsProcessed(order);
}

function validateOrder(order: Order): void {
  if (order.items.length === 0) throw new Error("No items");
}

function calculateOrderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function markOrderAsProcessed(order: Order): void {
  order.status = "processed";
}
```

### Parameter Objects

```typescript
// Before
interface Service {
  query(host: string, port: number, user: string, password: string): Promise<Result>;
}

// After
interface ConnectionConfig {
  host: string;
  port: number;
  credentials: {
    user: string;
    password: string;
  };
}

interface Service {
  query(config: ConnectionConfig): Promise<Result>;
}
```

### Replace Primitives with Types

```typescript
// Before
function createUser(id: string, email: string, age: number) { }

// After
type UserId = string & { readonly __brand: "UserId" };
type Email = string & { readonly __brand: "Email" };
type Age = number & { readonly __brand: "Age" };

function createUserId(value: string): UserId {
  if (!value.match(/^[0-9a-f]{8}$/i)) throw new Error("Invalid ID");
  return value as UserId;
}

function createEmail(value: string): Email {
  if (!value.includes("@")) throw new Error("Invalid email");
  return value as Email;
}

function createAge(value: number): Age {
  if (value < 0 || value > 150) throw new Error("Invalid age");
  return value as Age;
}

function createUser(id: UserId, email: Email, age: Age) { }
```

---

## Python

### Extract Method

```python
# Before
def process_order(order):
    for item in order['items']:
        if item['quantity'] <= 0:
            raise ValueError("Invalid quantity")
        if item['price'] < 0:
            raise ValueError("Invalid price")

    total = sum(item['price'] * item['quantity'] for item in order['items'])
    order['total'] = total
    order['status'] = 'processed'
    return order

# After
def process_order(order):
    validate_order_items(order['items'])
    order['total'] = calculate_total(order['items'])
    mark_as_processed(order)
    return order

def validate_order_items(items):
    for item in items:
        if item['quantity'] <= 0:
            raise ValueError("Invalid quantity")
        if item['price'] < 0:
            raise ValueError("Invalid price")

def calculate_total(items):
    return sum(item['price'] * item['quantity'] for item in items)

def mark_as_processed(order):
    order['status'] = 'processed'
```

### Data Class for Data Clumps

```python
# Before
def query_database(host, port, user, password, db_name):
    pass

def close_connection(host, port, user, password):
    pass

# After
from dataclasses import dataclass

@dataclass
class DatabaseConfig:
    host: str
    port: int
    user: str
    password: str
    db_name: str

    def __post_init__(self):
        if not self.host:
            raise ValueError("Host required")
        if self.port < 0 or self.port > 65535:
            raise ValueError("Invalid port")

def query_database(config: DatabaseConfig):
    pass

def close_connection(config: DatabaseConfig):
    pass
```

### Enum for Primitive Obsession

```python
# Before
def process_payment(status):
    if status == "pending":
        send_email("Your payment is pending")
    elif status == "approved":
        send_email("Your payment was approved")
    elif status == "rejected":
        send_email("Your payment was rejected")

# After
from enum import Enum

class PaymentStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

def process_payment(status: PaymentStatus):
    emails = {
        PaymentStatus.PENDING: "Your payment is pending",
        PaymentStatus.APPROVED: "Your payment was approved",
        PaymentStatus.REJECTED: "Your payment was rejected",
    }
    send_email(emails[status])
```

---

## Java/C#

### Extract Method

```java
// Before
public void processOrder(Order order) {
    if (order.getItems().isEmpty()) {
        throw new IllegalArgumentException("No items");
    }

    double total = 0;
    for (Item item : order.getItems()) {
        total += item.getPrice() * item.getQuantity();
    }

    order.setTotal(total);
    order.setStatus("processed");
}

// After
public void processOrder(Order order) {
    validateOrder(order);
    order.setTotal(calculateTotal(order));
    markAsProcessed(order);
}

private void validateOrder(Order order) {
    if (order.getItems().isEmpty()) {
        throw new IllegalArgumentException("No items");
    }
}

private double calculateTotal(Order order) {
    double total = 0;
    for (Item item : order.getItems()) {
        total += item.getPrice() * item.getQuantity();
    }
    return total;
}

private void markAsProcessed(Order order) {
    order.setStatus("processed");
}
```

### Extract Class for Large Class

```java
// Before
public class OrderService {
    private Database db;
    private EmailService emailService;
    private Logger logger;

    public void createOrder(/* many params */) { }
    public void updateOrder(/* many params */) { }
    public void deleteOrder(String id) { }
    public Order findOrder(String id) { }
    public void validatePayment(/* params */) { }
    public void processPayment(/* params */) { }
    public void refundPayment(String orderId) { }
    public void sendConfirmation(Order order) { }
    public void sendShippingNotice(Order order) { }
    public void logAudit(String action, String orderId) { }
}

// After
public class OrderRepository {
    private Database db;

    public Order create(Order order) { }
    public Order update(Order order) { }
    public void delete(String id) { }
    public Order findById(String id) { }
}

public class PaymentService {
    private PaymentGateway gateway;

    public void validate(Payment payment) { }
    public void process(Order order, Payment payment) { }
    public void refund(String orderId) { }
}

public class OrderNotificationService {
    private EmailService emailService;

    public void sendConfirmation(Order order) { }
    public void sendShippingNotice(Order order) { }
}

public class OrderService {
    private OrderRepository repository;
    private PaymentService paymentService;
    private OrderNotificationService notificationService;
    private Logger logger;

    public void createOrder(OrderRequest request) { }
}
```

---

## Go

### Extract Function

```go
// Before
func processPayment(cardNumber string, amount float64) error {
    if len(cardNumber) != 16 {
        return fmt.Errorf("invalid card number")
    }

    balance := fetchBalance(cardNumber)
    if balance < amount {
        return fmt.Errorf("insufficient funds")
    }

    transactionID := uuid.New().String()
    err := chargeCard(cardNumber, amount, transactionID)
    if err != nil {
        return err
    }

    logTransaction(transactionID, "success")
    return nil
}

// After
func processPayment(cardNumber string, amount float64) error {
    if err := validateCard(cardNumber); err != nil {
        return err
    }

    if err := checkBalance(cardNumber, amount); err != nil {
        return err
    }

    transactionID, err := chargeCard(cardNumber, amount)
    if err != nil {
        logTransaction(transactionID, "failed")
        return err
    }

    logTransaction(transactionID, "success")
    return nil
}

func validateCard(cardNumber string) error {
    if len(cardNumber) != 16 {
        return fmt.Errorf("invalid card number")
    }
    return nil
}

func checkBalance(cardNumber string, amount float64) error {
    balance := fetchBalance(cardNumber)
    if balance < amount {
        return fmt.Errorf("insufficient funds")
    }
    return nil
}
```

### Struct for Data Clumps

```go
// Before
func queryDatabase(host string, port int, user string, password string) (*sql.DB, error) {
    // ...
}

func closeDatabase(host string, port int, user string, password string) error {
    // ...
}

// After
type DatabaseConfig struct {
    Host     string
    Port     int
    User     string
    Password string
    Database string
}

func (c *DatabaseConfig) Validate() error {
    if c.Host == "" {
        return fmt.Errorf("host is required")
    }
    if c.Port <= 0 || c.Port > 65535 {
        return fmt.Errorf("invalid port")
    }
    return nil
}

func queryDatabase(config DatabaseConfig) (*sql.DB, error) {
    // ...
}

func closeDatabase(config DatabaseConfig) error {
    // ...
}
```

---

## Rust

### Extract Function

```rust
// Before
fn process_payment(card_number: &str, amount: f64) -> Result<String, String> {
    if card_number.len() != 16 {
        return Err("Invalid card number".to_string());
    }

    let balance = fetch_balance(card_number)?;
    if balance < amount {
        return Err("Insufficient funds".to_string());
    }

    let transaction_id = Uuid::new_v4().to_string();
    charge_card(card_number, amount, &transaction_id)?;
    log_transaction(&transaction_id, "success");

    Ok(transaction_id)
}

// After
fn process_payment(card_number: &str, amount: f64) -> Result<String, String> {
    validate_card(card_number)?;
    check_balance(card_number, amount)?;
    let transaction_id = charge_and_log(card_number, amount)?;
    Ok(transaction_id)
}

fn validate_card(card_number: &str) -> Result<(), String> {
    if card_number.len() != 16 {
        return Err("Invalid card number".to_string());
    }
    Ok(())
}

fn check_balance(card_number: &str, amount: f64) -> Result<(), String> {
    let balance = fetch_balance(card_number)?;
    if balance < amount {
        return Err("Insufficient funds".to_string());
    }
    Ok(())
}

fn charge_and_log(card_number: &str, amount: f64) -> Result<String, String> {
    let transaction_id = Uuid::new_v4().to_string();
    charge_card(card_number, amount, &transaction_id)?;
    log_transaction(&transaction_id, "success");
    Ok(transaction_id)
}
```

### Struct for Data Clumps

```rust
// Before
fn connect_database(host: &str, port: u16, user: &str, password: &str) -> Result<Connection, Error> {
    // ...
}

fn query_database(host: &str, port: u16, user: &str, password: &str, query: &str) -> Result<Vec<Row>, Error> {
    // ...
}

// After
#[derive(Clone)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub user: String,
    pub password: String,
}

impl DatabaseConfig {
    pub fn validate(&self) -> Result<(), String> {
        if self.host.is_empty() {
            return Err("Host is required".to_string());
        }
        if self.port == 0 {
            return Err("Port is required".to_string());
        }
        Ok(())
    }
}

fn connect_database(config: &DatabaseConfig) -> Result<Connection, Error> {
    config.validate()?;
    // ...
}

fn query_database(config: &DatabaseConfig, query: &str) -> Result<Vec<Row>, Error> {
    // ...
}
```

---

## Key Patterns Across Languages

1. **Extract Method/Function** — All languages support extracting logic into named functions
2. **Extract Class/Struct** — Create objects to group related data and behavior
3. **Parameter Objects** — Use objects/structs instead of multiple primitives
4. **Enums for Constants** — Replace magic strings/ints with typed enums
5. **Type Aliases** — Create semantic types (UserId, Email) for clarity
6. **Validation in Constructors** — Ensure objects are valid from creation

The goal is the same across all languages: **Make intent clear, validation explicit, and responsibilities focused.**
