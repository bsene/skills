# Functional Core / Imperative Shell

This is Ports and Adapters without requiring classes or interfaces. The **functional
core** contains deterministic business decisions: plain data in, plain data out, and
no I/O. The **imperative shell** performs I/O, converts the results to core inputs,
calls the core, and performs the resulting effects.

| Part             | Owns                                                                            | Must avoid                                                            |
| ---------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Functional core  | validation, calculations, state transitions, decisions                          | database, network, filesystem, framework APIs, hidden time/randomness |
| Imperative shell | HTTP/CLI/job input, persistence, remote calls, clocks, logging, process startup | business decisions duplicated from the core                           |

## Apply it

1. Extract the decision into a pure function with explicit inputs and result.
2. Obtain time, randomness, configuration, and remote data in the shell; pass the
   values in rather than reading them inside the core.
3. Have the shell persist, publish, or render after the core has decided what should
   happen. Keep the boundary data simple and owned by the core.
4. Unit-test the core with values only; integration-test the shell's real adapters
   separately when their wiring matters.

No port type is required. A function parameter, a callback, protocol dispatch, or a
returned command can represent the boundary when it is the smallest clear option.

Source: extracted from [Ports and Adapters Architecture](../../ports-adapters-architecture/SKILL.md).
