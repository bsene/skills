# Language-Specific Refactoring Idioms

Language-specific shapes for general techniques. For general guidance, see [techniques.md](techniques.md).

---

## Java / C# — Extract Class

```java
// ❌ OrderService doing CRUD + payment + notifications
public class OrderService {
    public void createOrder(/*...*/) { }
    public void validatePayment(/*...*/) { }
    public void sendConfirmation(Order order) { }
    // ... 10+ more across mixed concerns
}

// ✅ One class per concern, OrderService orchestrates
public class OrderRepository { Order create(Order o); Order findById(String id); }
public class PaymentService { void validate(Payment p); void process(Order o, Payment p); }
public class OrderNotificationService { void sendConfirmation(Order o); }

public class OrderService {
    private OrderRepository repository;
    private PaymentService paymentService;
    private OrderNotificationService notificationService;
    public void createOrder(OrderRequest request) { /* delegate */ }
}
```

---

## Go — Struct for Data Clumps

```go
// ❌
func queryDatabase(host string, port int, user, password string) (*sql.DB, error) { /* ... */ }
func closeDatabase(host string, port int, user, password string) error { /* ... */ }

// ✅
type DatabaseConfig struct {
    Host     string
    Port     int
    User     string
    Password string
}

func (c *DatabaseConfig) Validate() error {
    if c.Host == "" { return fmt.Errorf("host required") }
    if c.Port <= 0 || c.Port > 65535 { return fmt.Errorf("invalid port") }
    return nil
}

func queryDatabase(cfg DatabaseConfig) (*sql.DB, error) { /* ... */ }
func closeDatabase(cfg DatabaseConfig) error { /* ... */ }
```

---

## Rust — Struct + impl for Data Clumps

```rust
// ❌
fn connect_database(host: &str, port: u16, user: &str, password: &str) -> Result<Connection, Error>;
fn query_database(host: &str, port: u16, user: &str, password: &str, query: &str) -> Result<Vec<Row>, Error>;

// ✅
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub user: String,
    pub password: String,
}

impl DatabaseConfig {
    pub fn validate(&self) -> Result<(), String> {
        if self.host.is_empty() { return Err("host required".into()); }
        if self.port == 0 { return Err("port required".into()); }
        Ok(())
    }
}

fn connect_database(cfg: &DatabaseConfig) -> Result<Connection, Error> { cfg.validate()?; /* ... */ }
fn query_database(cfg: &DatabaseConfig, query: &str) -> Result<Vec<Row>, Error> { /* ... */ }
```
