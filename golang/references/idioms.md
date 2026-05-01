# Go Idioms

## Go Proverbs → Code

Rob Pike's Go proverbs are the soul of the language. Each maps to a concrete coding rule.

| Proverb | What it means in code |
|---|---|
| "Don't communicate by sharing memory; share memory by communicating" | Use channels to transfer data ownership, not shared variables with mutexes |
| "Concurrency is not parallelism" | Goroutines structure code; parallelism is a runtime property of hardware |
| "Channels orchestrate; mutexes serialize" | Channels for coordination flow, mutexes for protecting shared state |
| "The bigger the interface, the weaker the abstraction" | Prefer 1-3 method interfaces (`io.Reader`, not `io.ReadWriteCloserSeeker`) |
| "Make the zero value useful" | Design structs so `var x MyType` works without initialization (`sync.Mutex`, `bytes.Buffer`) |
| "interface{} says nothing" | Avoid `any` / `interface{}` — it erases type safety; use generics or specific interfaces |
| "A little copying is better than a little dependency" | Copy 10 lines rather than importing a package for one function |
| "Errors are values" | Errors are not exceptions — they are data you can inspect, wrap, compare, and return |
| "Don't just check errors, handle them gracefully" | Add context with `fmt.Errorf("doing X: %w", err)`, don't just `return err` |
| "Clear is better than clever" | A 3-line `if/else` is better than a 1-line trick nobody understands |

---

## Naming Conventions

### Exported vs Unexported

Go uses capitalization, not keywords, for visibility:

```go
type Server struct {     // Exported — visible outside package
    port    int          // Unexported field
    handler http.Handler // Unexported field
}

func NewServer(port int) *Server { ... }  // Exported constructor
func (s *Server) start() { ... }          // Unexported method
```

### Acronyms

All-caps for acronyms, regardless of position:

```go
// Correct
type HTTPClient struct{}
var userID string
func ServeHTTP(w http.ResponseWriter, r *http.Request)
func ParseURL(raw string) (*URL, error)

// Wrong
type HttpClient struct{}
var oderId string
func ServeHttp(w http.ResponseWriter, r *http.Request)
```

### Receiver Names

1-2 letter abbreviation of the type, consistent across all methods:

```go
func (s *Server) Start() error    // s for Server
func (s *Server) Stop() error     // same s — consistent
func (c *Client) Do(req *Request) // c for Client
func (b *Buffer) Write(p []byte)  // b for Buffer
```

Never use `self` or `this`.

### Interface Naming

Single-method interfaces use the method name + `-er`:

```go
type Reader interface { Read(p []byte) (n int, err error) }
type Writer interface { Write(p []byte) (n int, err error) }
type Stringer interface { String() string }
type Closer interface { Close() error }
```

Multi-method interfaces: use a descriptive noun (`ReadWriter`, `Handler`, `Store`).

### Package Names

Short, lowercase, no underscores or mixedCaps:

```go
package strconv   // not string_conversion
package httputil  // not httpUtility
package bufio     // not buffered_io
```

The package name is part of the call site: `http.Get()`, not `httpPackage.HTTPGet()`.

---

## Blank Identifier

Use `_` for intentionally discarded values:

```go
for _, v := range items { ... }        // discard index
_ = conn.Close()                        // discard error (only when truly safe)
var _ Interface = (*Type)(nil)          // compile-time interface check
```

---

## Short Variable Names

Go favors short names in small scopes, descriptive names in larger scopes:

```go
// Small scope — short names are clear
for i, v := range items { ... }
if err := doSomething(); err != nil { ... }

// Larger scope — use descriptive names
func ProcessOrders(orderRepository OrderRepository, notifier Notifier) { ... }
```

---

## Formatting

`gofmt` and `goimports` are mandatory. They produce the one true format:

- Tabs for indentation (not spaces)
- Opening brace on same line
- No trailing semicolons
- `goimports` manages import grouping: stdlib, then blank line, then third-party
