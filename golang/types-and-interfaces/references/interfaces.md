# Interfaces Deep Dive

## Implicit Satisfaction

No `implements` keyword. A type satisfies an interface by having all its methods:

```go
type Writer interface {
    Write(p []byte) (n int, err error)
}

// os.File satisfies Writer — it has a Write method with the right signature
// bytes.Buffer satisfies Writer — same
// Your custom type satisfies Writer if it has Write([]byte)(int, error)
```

Compile-time check that a type satisfies an interface:

```go
var _ Writer = (*MyType)(nil)
```

---

## Standard Library Interfaces

The most important interfaces to know:

| Interface | Package | Methods | Used for |
|---|---|---|---|
| `error` | builtin | `Error() string` | All error handling |
| `io.Reader` | io | `Read(p []byte) (n int, err error)` | Reading bytes from any source |
| `io.Writer` | io | `Write(p []byte) (n int, err error)` | Writing bytes to any destination |
| `io.Closer` | io | `Close() error` | Releasing resources |
| `io.ReadWriter` | io | `Read` + `Write` | Bidirectional byte streams |
| `io.ReadCloser` | io | `Read` + `Close` | HTTP response bodies, files |
| `fmt.Stringer` | fmt | `String() string` | Custom string representation |
| `sort.Interface` | sort | `Len`, `Less`, `Swap` | Custom sorting |
| `http.Handler` | net/http | `ServeHTTP(w, r)` | HTTP request handling |
| `json.Marshaler` | encoding/json | `MarshalJSON() ([]byte, error)` | Custom JSON encoding |
| `json.Unmarshaler` | encoding/json | `UnmarshalJSON([]byte) error` | Custom JSON decoding |
| `context.Context` | context | `Deadline`, `Done`, `Err`, `Value` | Cancellation, deadlines, request-scoped values |

---

## Interface Embedding

Compose larger interfaces from smaller ones:

```go
type ReadWriter interface {
    io.Reader
    io.Writer
}

type ReadWriteCloser interface {
    io.Reader
    io.Writer
    io.Closer
}
```

---

## Type Assertion

Extract the concrete type from an interface value:

```go
var w io.Writer = os.Stdout

// Single-value form — panics if wrong type
f := w.(*os.File)

// Two-value form — safe, returns ok=false if wrong type
f, ok := w.(*os.File)
if !ok {
    // w is not an *os.File
}
```

---

## Type Switch

Dispatch on the concrete type:

```go
func describe(i interface{}) string {
    switch v := i.(type) {
    case int:
        return fmt.Sprintf("integer: %d", v)
    case string:
        return fmt.Sprintf("string: %q", v)
    case error:
        return fmt.Sprintf("error: %v", v)
    default:
        return fmt.Sprintf("unknown: %T", v)
    }
}
```

Type switches are common for handling discriminated message types:

```go
type Event interface{ eventMarker() }

type OrderCreated struct { OrderID string }
type OrderShipped struct { OrderID string; TrackingNo string }

func (OrderCreated) eventMarker() {}
func (OrderShipped) eventMarker() {}

func handle(e Event) {
    switch ev := e.(type) {
    case OrderCreated:
        log.Printf("order created: %s", ev.OrderID)
    case OrderShipped:
        log.Printf("order %s shipped: %s", ev.OrderID, ev.TrackingNo)
    }
}
```

---

## Empty Interface / `any`

`any` (alias for `interface{}`) accepts any type but provides no type safety:

```go
func Print(v any) {
    fmt.Println(v)
}
```

Prefer specific interfaces or generics. Use `any` only when genuinely handling arbitrary types (e.g., JSON encoding, reflection).

---

## Interface Best Practices

1. **Consumer defines the interface.** The HTTP handler package defines `UserStore`, not the postgres package.

2. **Return concrete types.** Returning an interface hides implementation details the caller might need and prevents adding methods later.

3. **One-method interfaces are the sweet spot.** They compose easily and are trivially mockable.

4. **Don't force interfaces.** If there's only one implementation and no tests that need a fake, a concrete type is fine.

5. **Accept the narrowest interface.** If you only read, accept `io.Reader`, not `io.ReadWriteCloser`.
