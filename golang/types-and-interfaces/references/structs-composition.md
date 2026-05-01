# Structs & Composition

## Struct Basics

```go
type User struct {
    ID        string
    Name      string
    Email     string
    CreatedAt time.Time
}

// Zero value is usable — all fields zeroed
var u User
u.Name = "Alice"

// Literal initialization
u := User{
    ID:    "abc123",
    Name:  "Alice",
    Email: "alice@example.com",
}
```

Always use named fields in struct literals — positional literals break when fields are added.

---

## Struct Tags

Metadata attached to struct fields, read by reflection at runtime:

```go
type User struct {
    ID        string    `json:"id" db:"user_id"`
    Name      string    `json:"name" db:"name"`
    Email     string    `json:"email,omitempty" db:"email"`
    Password  string    `json:"-" db:"password_hash"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
}
```

| Tag | Purpose |
|---|---|
| `json:"name"` | JSON field name for `encoding/json` |
| `json:",omitempty"` | Omit field from JSON when zero value |
| `json:"-"` | Never include in JSON |
| `db:"column"` | Database column mapping (sqlx, etc.) |
| `validate:"required"` | Validation rules (validator package) |
| `yaml:"key"` | YAML field name |

---

## Struct Embedding

Embedding promotes fields and methods of the embedded type:

```go
type Animal struct {
    Name string
}

func (a Animal) Speak() string {
    return a.Name + " speaks"
}

type Dog struct {
    Animal          // embedded — Dog gets Name field and Speak() method
    Breed  string
}

d := Dog{
    Animal: Animal{Name: "Rex"},
    Breed:  "Labrador",
}

d.Name           // "Rex" — promoted from Animal
d.Speak()        // "Rex speaks" — promoted method
d.Animal.Name    // same thing, explicit access
```

### Embedding Rules

- Promoted methods can satisfy interfaces:
  ```go
  type Speaker interface { Speak() string }
  var s Speaker = Dog{Animal: Animal{Name: "Rex"}} // Dog satisfies Speaker via Animal
  ```

- If outer type defines the same method, it shadows the promoted one:
  ```go
  func (d Dog) Speak() string { return d.Name + " barks" }
  // Dog.Speak() now returns "Rex barks", not "Rex speaks"
  ```

- Multiple embeddings with conflicting names → ambiguity error at call site

---

## Composition Patterns

### Has-a (field, not embedding)

```go
type OrderService struct {
    repo   OrderRepository
    notify Notifier
    logger *slog.Logger
}
```

Use regular fields when you don't want promoted methods. This is the default — embedding is the exception.

### Mix-in via Embedding

```go
type Logger struct {
    prefix string
}

func (l Logger) Log(msg string) {
    fmt.Printf("[%s] %s\n", l.prefix, msg)
}

type Server struct {
    Logger
    port int
}

s := Server{Logger: Logger{prefix: "HTTP"}, port: 8080}
s.Log("started") // [HTTP] started
```

### Interface Embedding for Composition

```go
type ReadWriter interface {
    io.Reader
    io.Writer
}

type ReadWriteCloser interface {
    ReadWriter
    io.Closer
}
```

Standard library uses this extensively: `io.ReadWriter`, `io.ReadCloser`, `io.ReadWriteCloser`.

---

## Constructor Pattern

Go has no constructors. Use `New*` functions:

```go
func NewServer(port int, handler http.Handler) *Server {
    return &Server{
        port:    port,
        handler: handler,
        logger:  slog.Default(),
    }
}
```

For complex construction with optional config, use functional options:

```go
type Option func(*Server)

func WithLogger(l *slog.Logger) Option {
    return func(s *Server) { s.logger = l }
}

func WithTimeout(d time.Duration) Option {
    return func(s *Server) { s.timeout = d }
}

func NewServer(port int, opts ...Option) *Server {
    s := &Server{port: port, logger: slog.Default(), timeout: 30 * time.Second}
    for _, opt := range opts {
        opt(s)
    }
    return s
}

// Usage
srv := NewServer(8080, WithLogger(myLogger), WithTimeout(10*time.Second))
```
