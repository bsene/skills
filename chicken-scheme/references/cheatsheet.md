# CLI & Compiler Cheatsheet

Condensed from the official [CHICKEN User's Manual](https://wiki.call-cc.org/manual/index)
(`Using the interpreter`, `Using the compiler`, `Declarations`, `Deployment`). For shebang
scripts and everyday flag usage see `scripting-cli.md`; this file is the exhaustive flag/
declaration reference — reach for it when you need an option you don't use every day.

---

## 1. `csi` (interpreter) command-line options

```
csi {FILENAME|OPTION} ...
```

| Option | Effect |
|---|---|
| `-s`, `-script PATHNAME` | `-batch -quiet -no-init PATHNAME`; rest of argv → `command-line-arguments` |
| `-ss PATHNAME` | Like `-s`, but calls `(main (command-line-arguments))` after loading; `main`'s integer result becomes the exit code |
| `-sx PATHNAME` | Like `-s`, but echoes each form to stderr before evaluating (tracing) |
| `-e`, `-eval EXPR` | Evaluate `EXPR`; implies `-batch -no-init -quiet` |
| `-p`, `-print EXPR` | Evaluate and `print` the result(s); implies batch/no-init/quiet |
| `-P`, `-pretty-print EXPR` | Same as `-p` but `pretty-print`s the result |
| `-b`, `-batch` | Quit after processing all command-line options |
| `-n`, `-no-init` | Skip loading `$HOME/.csirc` |
| `-q`, `-quiet` | No startup banner; disables call-trace generation |
| `-i`, `-case-insensitive` | Case-insensitive reader |
| `-D`, `-feature SYMBOL` | Register a `cond-expand`/`feature?` symbol |
| `-R`, `-require-extension NAME` | Equivalent to `(import NAME)` before anything else |
| `-I`, `-include-path PATH` | Extra search path for `include` |
| `-K`, `-keyword-style prefix|suffix` | Common-Lisp `:kw` vs DSSSL `kw:` keyword syntax |
| `-w`, `-no-warnings` | Silence reader/eval warnings |
| `-r5rs-syntax` | Disable CHICKEN's syntax extensions (non-standard read syntax stays on) |
| `-no-parentheses-synonyms` | Disable `[...]`/`{...}` as `(...)` |
| `-setup-mode` | Look in the current directory for extensions before the repository |
| `--` | Stop parsing csi options (runtime `-:...` options still recognized) |
| `-version` / `-h`, `-help` | Print version / usage and exit |

`CSI_OPTIONS` env var supplies default options on every invocation (runtime `-:` options excluded).
The `chicken-script` feature identifier is defined automatically when running under `-script`,
useful for `cond-expand`-gating a `main` entry point vs. interactive loading.

### Toplevel REPL commands (full list)

Beyond the everyday `,?  ,l  ,t  ,d  ,q` from the top-level Quick-Start table:

| Command | Effect |
|---|---|
| `,c` | Show call-trace of the most recent error |
| `,f N` | Select call-trace frame N (0 = most recent) for inspection |
| `,g NAME` | Get value of a local variable in the selected frame (prefix match) |
| `,exn` | Describe the last exception and add it to result history |
| `,e FILENAME` | Open FILENAME in `$EDITOR`/`$VISUAL`/emacsclient/vi |
| `,ln FILENAME` | Load file, printing the result of each top-level form |
| `,m MODULENAME` | Switch evaluation context to a module (`,m #f` returns to toplevel) |
| `,p EXPR` | Pretty-print the result of EXPR |
| `,x EXPR` | Pretty-print the macro-expansion of EXPR without evaluating it |
| `,s TEXT` | Run a shell command |
| `,h` / `,ch` | Show / clear expression-result history |
| `,r` | Show system info |
| `#N` | At the prompt, re-use the result of history entry N (`#` alone = last result) |

---

## 2. `csc`/`chicken` (compiler) command-line options

```
chicken FILENAME OPTION ...      # csc wraps this + the C compiler/linker
```

Full list via `csc -help`; the ones worth knowing:

**Correctness / safety**
| Option | Effect |
|---|---|
| `-unsafe` | Drop all runtime safety checks (bounds, argc, procedure-type) — implies `-no-bound-checks -no-procedure-checks -no-argc-checks` |
| `-no-bound-checks` / `-no-argc-checks` / `-no-procedure-checks` | Drop one specific check category |
| `-disable-stack-overflow-checks` | Same as running the binary with `-:o` |
| `-strict-types` | Assume assignment never changes a variable's declared type (unsafe if violated) |

**Optimization**
| Option | Effect |
|---|---|
| `-O0`..`-O5` (`-optimize-level N`) | See table below |
| `-inline` / `-inline-global` | Local / cross-module inlining of small known procedures |
| `-inline-limit N` (default 20) | Size threshold for inlining |
| `-unroll-limit N` (default 1) | How many times to unroll self-recursive inlined calls |
| `-specialize` | Type-directed optimization via lightweight flow analysis |
| `-lfa2` | Extra flow-analysis pass to strip more type checks |
| `-local` | Assume toplevel vars in this unit aren't modified externally — more inlining, but external `set!`s may be invisible |
| `-block` | Assume global vars are never redefined outside this unit; unused toplevel bindings dropped, `eval` can't see them |
| `-clustering` | Merge local procedure groups into dispatch loops |
| `-disable-interrupts` | No thread-preemption checks in this unit |
| `-fixnum-arithmetic` | Assume all arithmetic is fixnum-only |

#### Optimization level table

| Level | Flags enabled | Notes |
|---|---|---|
| 0 | `-no-usual-integrations -no-compiler-syntax` | No optimization |
| 1 | `-optimize-leaf-routines` | Minimal |
| **2 (default)** | + `-inline -lfa2` | Standard-compliant optimizations |
| 3 | + `-local -inline-global -specialize` | Maximal, still "safe" |
| 4 | + `-unsafe` | Maximal, unsafe |
| 5+ | + `-block -disable-interrupts -no-trace -no-lambda-info -clustering` | Everything, unsafe |

**Linking / deployment**
| Option | Effect |
|---|---|
| `-static` | Statically link extensions and the runtime where possible (see §4) |
| `-dynamic` | Compile for dynamic loading into a running Scheme process |
| `-link NAME` | Link extension NAME as a unit (comma-separated for several) |
| `-uses NAME` | Pull in a library unit's toplevel forms before this one runs; registers it as a `cond-expand` feature |
| `-unit NAME` | Compile this file as a library unit named NAME |
| `-module NAME` | Wrap the whole file in an implicit module |
| `-explicit-use` | Disable automatic `library`/`eval`/`expand` units — needed when compiling a library unit |

**Build ergonomics**
| Option | Effect |
|---|---|
| `-k`, keep `.c` | Debugging FFI/codegen — inspect the generated C |
| `-output-file FILE` | Name the generated `.c` file explicitly |
| `-to-stdout` | Write generated C to stdout instead of a file |
| `-feature SYM` / `-no-feature SYM` | Register/unregister a `cond-expand` symbol |
| `-heap-size N[K\|M]` (default 500K), `-nursery`/`-stack-size N[K\|M]` | Fixed heap/stack sizing for the binary |
| `-profile` / `-accumulate-profile` | Instrument for `chicken-profile` (writes `PROFILE.<n>`) |
| `-check-syntax` | Stop after macro-expansion + syntax checks (fast lint pass) |
| `-analyze-only` | Stop after the first analysis pass |
| `-verbose` / `-no-warnings` | More notes / silence warnings |
| `-consult-types-file FILE` / `-emit-types-file FILE` | Load / write a type database for scrutiny across units |
| `-emit-inline-file FILE` / `-consult-inline-file FILE` | Write / load cross-module inlining data |

`CHICKEN_OPTIONS` env var supplies default compiler flags for every invocation.

### Runtime options (accepted by any compiled CHICKEN binary, and by `csi`)

Form: `-:X` (flag) or `-:XNUMBER` (numeric, suffix `K`/`M`/`G` allowed). Combine like `-:dc`.

| Option | Effect |
|---|---|
| `-:?` | List runtime options and exit |
| `-:hNUMBER` / `-:hiNUMBER` / `-:hmNUMBER` | Fixed / initial / max heap size |
| `-:hgPCT` (default 200) / `-:hsPCT` (default 50) | Heap growth / shrink rate |
| `-:hfNUMBER` (default 8M) | Free-heap threshold that triggers a major GC |
| `-:sNUMBER` | Stack size |
| `-:o` | Disable stack-overflow detection |
| `-:g` / `-:d` / `-:D` | GC info / debug info / more debug info |
| `-:p` / `-:PFREQUENCY` | Statistical profiling; sample every FREQUENCY µs (default 10000) |
| `-:r` | Trace output to stderr (no-op if compiled with `-no-trace`) |
| `-:x` | Propagate uncaught exceptions from spawned threads to the primordial thread |
| `-:RNUMBER` | Seed the PRNG (useful for deterministic benchmarking/debugging) |

Runtime option parsing stops at the first non-runtime argument (or at a bare `-:`) — everything
after that is passed through to the program (e.g. `command-line-arguments`).

---

## 3. Declarations (`(declare ...)`)

In-source equivalents of many compiler flags; **always ignored by `csi`**, apply for the whole
compilation unit regardless of where they're written, and override command-line flags. Last
conflicting declaration in the file wins.

```scheme
(declare (unsafe))
(declare (block))
(declare (uses srfi-1 srfi-13))
```

| Declaration | Command-line equivalent / purpose |
|---|---|
| `(unsafe)` | `-unsafe` |
| `(block)` | `-block` |
| `(local)` / `(local ID ...)` | `-local`, optionally scoped to specific identifiers |
| `(uses ID ...)` | `-uses` — load these library units' toplevel forms first, register as features |
| `(unit ID)` | `-unit` |
| `(inline)` / `(inline ID ...)` / `(not inline ...)` | `-inline`, globally or per-procedure |
| `(inline-global ...)` | `-inline-global` (implies `(inline)`) |
| `(inline-limit N)` / `(unroll-limit N)` | `-inline-limit` / `-unroll-limit` |
| `(specialize)` | `-specialize` |
| `(strict-types)` | `-strict-types` |
| `(disable-interrupts)` | No thread preemption in this unit |
| `(hide ID ...)` / `(export ID ...)` | Restrict or whitelist which toplevel bindings leave the unit (`(hide)` alone ≡ `(block)`) |
| `(always-bound ID ...)` | Skip bound-checks for these variables |
| `(bound-to-procedure ID ...)` | Skip procedure-type checks for these calls |
| `(type (ID TYPE) ...)` | Declare a toplevel procedure's type for the scrutinizer (see `:` shorthand in [Types](https://wiki.call-cc.org/man/5/Types)) |
| `(predicate (ID TYPE) ...)` | Mark ID as a type predicate |
| `(pure ID ...)` | No side effects — enables dead-code elimination |
| `(fixnum-arithmetic)` / `(number-type TYPE)` | Assume fixnum-only math |
| `(profile ID ...)` | Limit profiling instrumentation to these procedures |
| `(unused ID ...)` | Suppress unused/undefined-variable warnings for ID |
| `(compile-syntax)` | Make macros available at runtime too |
| `(keep-shadowed-macros)` | Don't drop a macro when a same-named toplevel var is defined |
| `(no-argc-checks)` / `(no-bound-checks)` / `(no-procedure-checks)` | Fine-grained pieces of `(unsafe)` |
| `(emit-import-library MOD ...)` / `(emit-types-file [FILE])` | Companion-file generation, mirrors the `-emit-*` flags |

---

## 4. Deployment

Three ways to ship a CHICKEN program; this section covers the third:

1. Ship source (target needs matching CHICKEN installed)
2. Ship generated C (target needs matching CHICKEN + a C toolchain)
3. **Ship a compiled binary** — dynamically linked, statically linked, or fully self-contained

```bash
csc myprogram.scm              # dynamic: links against libchicken.so/.dylib/.dll
ldd myprogram                  # inspect: shows libchicken.so + libc/libm/libdl

csc -static myprogram.scm      # static: runtime + extensions baked into the binary
ldd myprogram                  # only libc/libm/libdl remain
```

- `-static` statically links any extension that ships a static object file (most do by default)
  as well as the CHICKEN runtime itself.
- **Shipping the shared runtime instead:** copy `libchicken.so` alongside the binary and any
  extensions from the extension repository (`$PREFIX/lib/chicken/$BINARYVERSION`), then fix the
  runtime linker path with `chrpath`/`patchelf` (Linux, target `$ORIGIN`) or `install_name_tool`
  (macOS), or launch through a wrapper script that sets `LD_LIBRARY_PATH`/`DYLD_LIBRARY_PATH`.
  A directory built this way is fully portable (e.g. runs off a USB stick); at runtime the app
  can locate itself via `(repository-path)`.
- **Windows:** DLLs are looked up in the program's own directory by default, so bundling
  third-party DLLs next to the `.exe` just works. Use Dependency Walker to audit dependencies.
- **macOS:** no static binaries; use `otool -L` to inspect and `install_name_tool` to repatch
  linker paths.
- Distributing the generated C directly (no CHICKEN on the target) is possible but far more
  involved — you must vendor `runtime.c`, `chicken.h`, `chicken-config.h`, `buildtag.h`, plus
  `build-version.c chicken-syntax.c eval.c expand.c internal.c library.c modules.c` from the
  CHICKEN build tree and compile everything together with a plain C compiler. Only worth it for
  toolchains where shipping a normal binary isn't an option.

---

## Source

Distilled from the official manual — [Using the interpreter](https://wiki.call-cc.org/man/5/Using%20the%20interpreter),
[Using the compiler](https://wiki.call-cc.org/man/5/Using%20the%20compiler),
[Declarations](https://wiki.call-cc.org/man/5/Declarations),
[Deployment](https://wiki.call-cc.org/man/5/Deployment). Consult those pages directly for
anything not covered here (cross-compilation, the `Types` type-syntax grammar, compiler
extension hooks).
