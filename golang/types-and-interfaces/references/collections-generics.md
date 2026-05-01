# Collections & Generics

## Slices

### Internals

A slice is a descriptor (pointer, length, capacity) over a backing array:

```go
s := make([]int, 3, 5)
// len(s) = 3, cap(s) = 5
// s points to an array of 5 ints, but only 3 are accessible
```

### Append Behavior

`append` returns a new slice. If capacity is exceeded, a new backing array is allocated:

```go
a := []int{1, 2, 3}
b := append(a, 4)       // may or may not share backing array with a
b[0] = 99               // may or may not mutate a — DANGEROUS assumption
```

**Rule:** Always use the return value of `append`. Never assume two slices share or don't share a backing array.

### Slice Gotchas

```go
// Gotcha 1: sub-slice shares backing array
original := []int{1, 2, 3, 4, 5}
sub := original[1:3]   // [2, 3] — shares memory with original
sub[0] = 99            // original is now [1, 99, 3, 4, 5]

// Fix: copy to a new slice
sub := make([]int, 2)
copy(sub, original[1:3])

// Gotcha 2: append to sub-slice overwrites original
original := []int{1, 2, 3, 4, 5}
sub := original[1:3]           // [2, 3], cap=4
sub = append(sub, 99)          // overwrites original[3] → original is [1, 2, 3, 99, 5]

// Fix: use full slice expression to limit capacity
sub := original[1:3:3]         // len=2, cap=2 — append allocates new array
```

### Common Slice Operations

```go
// Delete element at index i (order preserved)
s = append(s[:i], s[i+1:]...)

// Delete element at index i (order not important)
s[i] = s[len(s)-1]
s = s[:len(s)-1]

// Filter in place
n := 0
for _, v := range s {
    if keep(v) {
        s[n] = v
        n++
    }
}
s = s[:n]

// Contains (pre-generics)
func contains(s []string, target string) bool {
    for _, v := range s {
        if v == target { return true }
    }
    return false
}

// Contains (Go 1.21+ with slices package)
slices.Contains(s, target)
```

---

## Maps

### Basics

```go
m := map[string]int{
    "alice": 30,
    "bob":   25,
}

// Zero value of map is nil — reading is safe, writing panics
var m map[string]int
_ = m["key"]    // returns zero value (0), no panic
m["key"] = 1    // PANIC: assignment to nil map

// Always initialize: make(map[K]V) or map[K]V{}
```

### Iteration Order

Map iteration order is **not guaranteed** and intentionally randomized:

```go
for k, v := range m {
    // order changes between runs
}

// For deterministic order, sort keys first
keys := make([]string, 0, len(m))
for k := range m {
    keys = append(keys, k)
}
sort.Strings(keys)
for _, k := range keys {
    fmt.Println(k, m[k])
}
```

### Concurrent Access

Maps are **not safe** for concurrent read/write. Two options:

```go
// Option 1: sync.RWMutex
type SafeMap struct {
    mu sync.RWMutex
    m  map[string]int
}

func (s *SafeMap) Get(key string) int {
    s.mu.RLock()
    defer s.mu.RUnlock()
    return s.m[key]
}

func (s *SafeMap) Set(key string, val int) {
    s.mu.Lock()
    defer s.mu.Unlock()
    s.m[key] = val
}

// Option 2: sync.Map (optimized for append-heavy or read-heavy workloads)
var m sync.Map
m.Store("key", 42)
v, ok := m.Load("key")
```

### Check Existence

```go
v, ok := m[key]
if !ok {
    // key does not exist
}
```

---

## Generics (Go 1.18+)

### Syntax

```go
func Filter[T any](s []T, f func(T) bool) []T {
    var result []T
    for _, v := range s {
        if f(v) {
            result = append(result, v)
        }
    }
    return result
}

adults := Filter(users, func(u User) bool { return u.Age >= 18 })
```

### Type Constraints

```go
// Built-in constraints
any          // no restrictions
comparable   // supports == and !=

// Custom constraint
type Ordered interface {
    ~int | ~int8 | ~int16 | ~int32 | ~int64 |
    ~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 |
    ~float32 | ~float64 | ~string
}

// The ~ prefix matches underlying types (named types based on int, etc.)
type UserID int
// ~int matches UserID because its underlying type is int
```

### Standard Library Generic Packages (Go 1.21+)

| Package | Key functions |
|---|---|
| `slices` | `Sort`, `Contains`, `Index`, `Compact`, `Delete`, `Insert`, `Reverse` |
| `maps` | `Keys`, `Values`, `Clone`, `DeleteFunc`, `Equal` |
| `cmp` | `Compare`, `Or`, `Ordered` constraint |

```go
import "slices"

slices.Sort(nums)
slices.Contains(names, "alice")
idx := slices.Index(names, "bob")
```

### When NOT to Use Generics

- An interface already provides the needed polymorphism
- Only 1-2 concrete types exist — write concrete functions
- The generic version is harder to read than the duplicated versions
- You're using `any` as the constraint (usually means you need an interface instead)

---

## Enums with Iota

### Basic Enum

```go
type Day int

const (
    Sunday Day = iota  // 0
    Monday             // 1
    Tuesday            // 2
    Wednesday          // 3
    Thursday           // 4
    Friday             // 5
    Saturday           // 6
)
```

### Skip Zero Value

Reserve zero for "unknown" to catch uninitialized values:

```go
type Color int

const (
    ColorUnknown Color = iota  // 0 — explicitly unknown
    ColorRed                   // 1
    ColorGreen                 // 2
    ColorBlue                  // 3
)
```

### Bitmask with Iota

```go
type Permission uint8

const (
    PermRead    Permission = 1 << iota  // 1
    PermWrite                           // 2
    PermExecute                         // 4
)

func (p Permission) Has(flag Permission) bool {
    return p&flag != 0
}

perms := PermRead | PermWrite
perms.Has(PermRead)     // true
perms.Has(PermExecute)  // false
```

### String Method

Use `go generate` with `stringer` tool, or write manually:

```go
//go:generate stringer -type=Status
type Status int

const (
    StatusPending Status = iota
    StatusActive
    StatusDone
)
```
