# Functions, Methods & Pointers

## Value vs Pointer Receiver

| Use pointer receiver `*T` when | Use value receiver `T` when |
|---|---|
| Method modifies the receiver | Receiver is small and read-only |
| Receiver is a large struct (avoids copy) | Receiver is a map, func, or chan (already reference types) |
| Consistency — if any method uses `*T`, all should | Receiver is a small struct or basic type |
| Method must appear in `*T`'s method set (for interface satisfaction) | Immutability is important for safety |

```go
type Account struct {
    balance int
}

// Pointer receiver — modifies state
func (a *Account) Deposit(amount int) {
    a.balance += amount
}

// Value receiver — read-only
func (a Account) Balance() int {
    return a.balance
}
```

**Key rule:** Don't mix receiver types on the same struct without reason. If one method needs a pointer, make them all pointer receivers for consistency.

---

## Method Sets

Method sets determine which interfaces a type satisfies:

| Type | Method set includes |
|---|---|
| `T` (value) | Methods with value receiver `T` only |
| `*T` (pointer) | Methods with value receiver `T` AND pointer receiver `*T` |

This means a value `T` cannot satisfy an interface that requires a pointer-receiver method:

```go
type Saver interface {
    Save() error
}

type Doc struct{}

func (d *Doc) Save() error { return nil } // pointer receiver

var _ Saver = Doc{}   // COMPILE ERROR: Doc does not implement Saver
var _ Saver = &Doc{}  // OK: *Doc implements Saver
```

---

## Closures

Functions capture variables from their enclosing scope by reference:

```go
func makeCounter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

c := makeCounter()
c() // 1
c() // 2
```

**Loop variable trap** (pre-Go 1.22):

```go
// Bug: all goroutines share the same `v`
for _, v := range values {
    go func() { fmt.Println(v) }() // prints last value N times
}

// Fix (pre-1.22): shadow the variable
for _, v := range values {
    v := v
    go func() { fmt.Println(v) }()
}
```

Go 1.22+ fixes this — each iteration gets its own variable. But be aware when targeting older versions.

---

## Variadic Functions

```go
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

sum(1, 2, 3)           // pass individual args
sum(numbers...)         // spread a slice
```

Variadic parameter must be last. Received as a slice inside the function.

---

## Defer

`defer` schedules a function call to run when the enclosing function returns. Critical for cleanup.

### LIFO Order

Deferred calls execute in last-in-first-out order:

```go
func example() {
    defer fmt.Println("first")
    defer fmt.Println("second")
    defer fmt.Println("third")
}
// Output: third, second, first
```

### Arguments Evaluated Immediately

Arguments to deferred functions are evaluated at the defer site, not at execution time:

```go
func example() {
    x := 1
    defer fmt.Println(x) // captures x=1 NOW
    x = 2
}
// Output: 1 (not 2)
```

To capture the final value, use a closure:

```go
func example() {
    x := 1
    defer func() { fmt.Println(x) }() // closure reads x at execution time
    x = 2
}
// Output: 2
```

### Common Patterns

```go
// Resource cleanup
f, err := os.Open(path)
if err != nil { return err }
defer f.Close()

// Mutex unlock
mu.Lock()
defer mu.Unlock()

// Timing
start := time.Now()
defer func() { log.Printf("took %v", time.Since(start)) }()

// Recover from panic
defer func() {
    if r := recover(); r != nil {
        log.Printf("recovered: %v", r)
    }
}()
```

### Defer in Loops

Deferred calls in a loop don't run until the function exits — they accumulate:

```go
// Bug: all files stay open until function returns
for _, path := range paths {
    f, _ := os.Open(path)
    defer f.Close() // won't close until outer function returns
}

// Fix: wrap in a function
for _, path := range paths {
    func() {
        f, _ := os.Open(path)
        defer f.Close()
        // process f
    }()
}
```
