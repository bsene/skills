---
id: golang-types-and-interfaces-001-consumer-interface
skill: golang-types-and-interfaces
---

# Prompt

We were told to "use interfaces everywhere" in our Go service. Is this design good, or should the billing package use something different? Show me the improved code. Current code:

```go
package store

type Store interface {
	GetUser(ctx context.Context, id string) (*User, error)
	ListUsers(ctx context.Context) ([]*User, error)
	CreateUser(ctx context.Context, u *User) error
	UpdateUser(ctx context.Context, u *User) error
	DeleteUser(ctx context.Context, id string) error
}

type PostgresStore struct{ db *sql.DB }

func (s *PostgresStore) GetUser(ctx context.Context, id string) (*User, error) { /* ... */ }
func (s *PostgresStore) ListUsers(ctx context.Context) ([]*User, error)        { /* ... */ }
func (s *PostgresStore) CreateUser(ctx context.Context, u *User) error         { /* ... */ }
func (s *PostgresStore) UpdateUser(ctx context.Context, u *User) error         { /* ... */ }
func (s *PostgresStore) DeleteUser(ctx context.Context, id string) error       { /* ... */ }

func NewPostgresStore(db *sql.DB) Store { return &PostgresStore{db: db} }
```

```go
package billing

import "myapp/store"

func ChargeUser(ctx context.Context, s store.Store, id string) error {
	u, err := s.GetUser(ctx, id)
	if err != nil {
		return err
	}
	// ... charge u
	return nil
}
```

# Criteria

- [ ] Recommends defining a small consumer-side interface inside the billing package (e.g. a one-method `UserGetter` with just `GetUser`) instead of billing importing store's wide interface
- [ ] Notes implicit satisfaction: PostgresStore satisfies billing's interface automatically, with no `implements` declaration or change to the store package
- [ ] Flags the 5-method `Store` interface as interface pollution and points to the small-interface rule (1-3 methods)
- [ ] Flags the premature, implementation-owned interface: an exported interface declared next to its single concrete implementation
- [ ] Applies accept-interfaces-return-structs to the constructor: `NewPostgresStore` should return the concrete `*PostgresStore`, not the `Store` interface
- [ ] Does NOT propose generics or inheritance-style base-struct reuse to solve the coupling