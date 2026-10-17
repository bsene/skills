# Design by Contract

Treat every public method as a contract between caller and class. It makes LSP,
testing, and error handling concrete.

## Contract parts

| Part            | Who is responsible  | Meaning                                     |
| --------------- | ------------------- | ------------------------------------------- |
| Precondition    | Caller              | What must be true before the call           |
| Postcondition   | Method (supplier)   | What is guaranteed after a successful call  |
| Class invariant | Every public method | What is true of each instance between calls |

- A violated precondition is a caller bug: reject it at once (assert, guard, typed
  argument). Do not silently repair it.
- A violated postcondition or invariant is a bug in the class.
- Do not check the same condition on both sides. Either the caller guarantees it (precondition)
  or the method tolerates it (then it is not a precondition). Defensive checks everywhere
  hide who owns the rule.
- Exceptions mean "the method could not fulfil its contract", not control flow.

```ts
class Stack<T> {
  private items: T[] = [];
  // pre: !isEmpty()   post: size decreases by 1, returns last pushed
  pop(): T {
    if (this.items.length === 0) throw new Error("pop on empty stack");
    return this.items.pop() as T;
  }
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
```

Expose the precondition as a query (`isEmpty`) so callers can check it themselves.

## Subtyping rule (LSP, made precise)

A subclass or implementation may:

| Element       | Allowed change                    | Why                                             |
| ------------- | --------------------------------- | ----------------------------------------------- |
| Precondition  | Keep or weaken (accept more)      | Callers written for the parent still satisfy it |
| Postcondition | Keep or strengthen (promise more) | Callers still get what they relied on           |
| Invariant     | Keep or strengthen                | Instances stay valid for parent's callers       |

Red flags: an override that throws for inputs the parent accepted (stronger precondition),
returns less than the parent promised, or adds a "not supported" branch.

## Command-Query Separation

- Query: returns a value, changes nothing observable. Command: changes state, returns
  nothing (or only an ack/ID).
- Asking a question must not change the answer. This keeps queries safe in assertions,
  logs, and tests.
- Accepted exceptions: operations that are inherently both and atomic (pop, queue dequeue,
  compare-and-set). Name them so the effect is obvious.

## Related Meyer principles

| Principle          | Practical form                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Uniform access     | Callers should not know whether a value is stored or computed (use a property or getter, not a field vs method distinction) |
| Open-Closed        | Extend through new subtypes or strategies; stable modules are not edited for each variant                                   |
| Single choice      | When a system supports many variants, exactly one module knows the full list (factory or registry), not scattered switches  |
| Self-documentation | Put the contract in the signature, types, and assertions, not in a separate document                                        |

## Testing with contracts

- Contract assertions double as test oracles: a test exercises inputs that satisfy the
  precondition and checks postconditions and invariants.
- Test inputs that violate preconditions only once, to prove they are rejected.
- Reuse one contract test suite for every implementation of an interface.

Source: Meyer, "Object-Oriented Software Construction" (design by contract, redefinition
rule, command-query separation, uniform access, open-closed, single choice).
