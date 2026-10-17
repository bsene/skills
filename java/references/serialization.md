# Serialization

Source: _Effective Java_, 3rd ed. (serialization chapter), paraphrased.

## Core stance

Java native serialization (`ObjectInputStream`) is a security liability: deserializing attacker-controlled bytes can run gadget chains, and it ties private representation to a permanent wire contract. Prefer a cross-platform structured format.

| Need                                   | Choose                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| Persist or send data                   | JSON (Jackson/Gson), Protobuf, Avro — with schema/versioning                               |
| Untrusted input                        | Never `ObjectInputStream`; if unavoidable, allowlist via `ObjectInputFilter` (JEP 290/415) |
| Existing `Serializable` class          | Keep stable `serialVersionUID`, test round trips across versions                           |
| New class, serialization really needed | Don't implement `Serializable`; if forced, follow rules below                              |
| Value type                             | `record` — serialization uses the canonical constructor, so invariants are re-validated    |
| Singleton / enum                       | Enum (serialization-safe); otherwise `readResolve` and `transient` fields                  |

## If you must implement Serializable

| Rule                                                                                                                                                         | Why                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Declare explicit `serialVersionUID`                                                                                                                          | Avoids accidental incompatibility on recompile       |
| Use a custom form for non-trivial state; fields `transient` where derivable                                                                                  | Default form exposes implementation and bloats       |
| Treat `readObject` like a public constructor: validate invariants, defensively copy mutable components                                                       | Attacker controls the byte stream                    |
| Prefer a **serialization proxy** (private static nested `SerializationProxy` + `writeReplace` + `readResolve`; `readObject` throws `InvalidObjectException`) | Closes forged-instance attacks, keeps `final` fields |
| Do not make classes designed for inheritance `Serializable`                                                                                                  | Burdens every subclass                               |
| Inner (non-static) classes should not be serializable                                                                                                        | Synthetic fields leak the outer instance             |
| Do not call overridable methods from `readObject`                                                                                                            | Subclass runs on half-built state                    |
| Synchronize `writeObject` if the class synchronizes other methods                                                                                            | Consistent snapshot                                  |

```java
private Object writeReplace() { return new Proxy(this); }
private void readObject(ObjectInputStream s) throws InvalidObjectException {
  throw new InvalidObjectException("Proxy required");
}
```
