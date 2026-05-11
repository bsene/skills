# Language-Specific Refactoring Idioms

Language-specific patterns only. For general techniques, see [techniques.md](techniques.md).

---

## Java/C#

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
