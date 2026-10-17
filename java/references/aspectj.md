# AspectJ and Aspect-Oriented Programming

Source: _AspectJ in Action_ (Laddad), concepts paraphrased and combined with common practice. For current syntax see https://eclipse.dev/aspectj/ and the Spring AOP section of the Spring Framework reference (https://docs.spring.io/spring-framework/reference/).

## When to use aspects

AOP modularizes a **cross-cutting concern** that would otherwise be scattered across many classes (tangling and scattering).

| Concern                                                    | Aspect fit | Notes                                                               |
| ---------------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| Logging / tracing / timing                                 | Good       | Keep advice side-effect free; no business logic                     |
| Transactions, security checks, caching                     | Good       | Usually via a framework (Spring) rather than hand-rolled            |
| Policy enforcement at build time (`declare error/warning`) | Excellent  | E.g. forbid `System.out`, direct JDBC use outside DAO, `new Thread` |
| Resource pooling, retry, rate limit                        | Fair       | Check a library (Resilience4j, Spring Retry) first                  |
| Thread-affinity (e.g. UI thread dispatch)                  | Fair       | Isolates tricky pattern in one place                                |
| Domain invariants, core workflow                           | Poor       | Hidden control flow; keep it in plain code                          |
| One or two call sites                                      | Poor       | A helper method or decorator is simpler                             |

Rule of thumb: if you can express it as a decorator, a `try-with-resources`, or a higher-order function, do that. Choose aspects when the same wrapping must apply to dozens of places selected by a rule (a pointcut).

## Core vocabulary

| Term                                  | Meaning                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| Join point                            | A point in execution (method call/execution, field access, constructor, exception handler) |
| Pointcut                              | Predicate selecting join points: `execution(* com.acme.service..*.*(..))`                  |
| Advice                                | Code run at a pointcut: `before`, `after`, `after returning`, `after throwing`, `around`   |
| Aspect                                | Module bundling pointcuts, advice, and inter-type declarations                             |
| Inter-type declaration (introduction) | Add fields/methods/interfaces to existing types                                            |
| Weaving                               | Applying aspects: compile-time, post-compile (binary), or load-time                        |

## AspectJ vs Spring AOP

| Aspect                                        | AspectJ                                                                       | Spring AOP                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Mechanism                                     | Bytecode weaving (compile / post-compile / load-time)                         | Runtime proxies (JDK dynamic or CGLIB)                             |
| Join points                                   | Method call and execution, field get/set, constructors, static init, handlers | Method **execution on Spring beans** only                          |
| Self-invocation                               | Advised (code is woven in)                                                    | **Not advised**: `this.foo()` bypasses the proxy                   |
| `private`/`final`/`static` methods, non-beans | Advised                                                                       | Not advised (CGLIB cannot override `final`/`private`)              |
| Performance                                   | No proxy indirection                                                          | Small proxy overhead per call                                      |
| Setup                                         | Compiler (`ajc`/plugin) or agent                                              | `@EnableAspectJAutoProxy`, `spring-boot-starter-aop`               |
| Syntax                                        | `.aj` or `@Aspect` annotation style                                           | `@Aspect` annotation style only (AspectJ pointcut language subset) |
| Use when                                      | Need field/constructor/call advice, non-Spring objects, build-time rules      | Cross-cutting on Spring beans, simple needs                        |

You can use AspectJ weaving inside a Spring app (`@EnableLoadTimeWeaving`, `mode = ASPECTJ` for `@Transactional`) to remove the self-invocation limit.

## Pitfalls

| Pitfall                                                                    | Fix                                                                                                          |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Spring: internal call to `@Transactional`/`@Cacheable` method does nothing | Move method to another bean, inject self, or use AspectJ mode                                                |
| Pointcut too broad (`execution(* *(..))`) matches framework/aspect code    | Scope by package/annotation; exclude `within(MyAspect)`                                                      |
| Infinite recursion: advice triggers itself                                 | Exclude the aspect itself: `&& !within(LoggingAspect)`                                                       |
| Wrong precedence between multiple aspects                                  | Declare order explicitly (`declare precedence` / `@Order`); security before tx before logging, as applicable |
| `around` advice forgets `proceed()` or swallows exceptions/return value    | Always return `proceed()` result; rethrow; avoid unless needed — prefer `before`/`after`                     |
| Advice that alters argument or return types silently                       | Keep behavior-preserving unless the aspect's name says otherwise                                             |
| Name-pattern pointcuts break on rename                                     | Prefer annotation pointcuts (`@annotation(Audited)`) for opt-in behavior                                     |
| Checked exceptions thrown by advice                                        | Soften (`declare soft`) or wrap; do not change method contracts                                              |
| Hard to debug: invisible control flow                                      | IDE aspect markers / `-showWeaveInfo`; log which advice fired; unit-test aspects                             |
| Load-time weaving and build complexity                                     | Prefer compile-time weaving unless third-party classes must be woven                                         |
| State on singleton aspects shared across threads                           | Keep aspects stateless or use `perthis`/`pertarget`/`percflow` association deliberately                      |
| Performance: expensive pointcut (`cflow`)                                  | Avoid `cflow` in hot paths                                                                                   |
| Native image / GraalVM, Java modules, JDK upgrades                         | Verify AspectJ version supports your JDK; proxies need reflection config in native builds                    |

## Idiomatic annotation-style example (Spring or AspectJ)

```java
@Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD)
public @interface Timed {}

@Aspect
public class TimingAspect {
  @Around("@annotation(Timed)")
  public Object time(ProceedingJoinPoint pjp) throws Throwable {
    long t0 = System.nanoTime();
    try {
      return pjp.proceed();
    } finally {
      log.info("{} took {} ns", pjp.getSignature(), System.nanoTime() - t0);
    }
  }
}
```

Build-time policy enforcement (AspectJ only):

```java
public aspect NoSystemOut {
  declare error : get(* System.out) || get(* System.err) : "use the logger";
}
```

## Testing aspects

- Unit-test advice logic by extracting it to a plain class the aspect delegates to.
- Integration-test that the pointcut matches what you intend (and nothing else) with a small test context.
- Treat a pointcut change as an API change: review matched joinpoints.
