# Cargo Workflow

Source: _Rust in Action_, ch. 2 (cargo, third-party crates, CLI args) and ch. 3 (modules, docs); commands reflect current stable cargo.

## Commands

| Command                                     | Purpose                                |
| ------------------------------------------- | -------------------------------------- |
| `cargo new name` / `--lib`                  | create project                         |
| `cargo check`                               | fast type check, no binary             |
| `cargo build [--release]`                   | compile                                |
| `cargo run -- args`                         | run binary with args                   |
| `cargo test`                                | unit, integration, doc tests           |
| `cargo clippy --all-targets -- -D warnings` | lints as errors                        |
| `cargo fmt` / `cargo fmt --check`           | format / verify                        |
| `cargo doc --open`                          | build docs                             |
| `cargo add crate`                           | add dependency                         |
| `cargo update`                              | refresh `Cargo.lock`                   |
| `cargo tree`                                | dependency graph                       |
| `cargo audit` / `cargo deny check`          | advisories, licenses (installed tools) |

## Verification gate

```sh
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-features
cargo doc --no-deps
```

## Project layout

```text
Cargo.toml          # package, deps, [features], [profile.*]
Cargo.lock          # commit for binaries
src/main.rs         # binary entry
src/lib.rs          # library root
src/bin/*.rs        # extra binaries
tests/*.rs          # integration tests (public API only)
benches/            # benchmarks
examples/           # runnable examples
```

Keep `main.rs` thin: parse args, call into the library, map errors to exit codes. Use `pub(crate)` over `pub` unless part of the API; re-export with `pub use`.

## Tests

| Kind        | Where                                 | Notes                                |
| ----------- | ------------------------------------- | ------------------------------------ |
| Unit        | `#[cfg(test)] mod tests` in same file | can test private items               |
| Integration | `tests/`                              | public API                           |
| Doc         | `///` examples with ` ``` `           | compiled and run; also documentation |

Return `Result<(), Box<dyn Error>>` from tests to use `?`. Use `#[should_panic]` sparingly. Inject I/O via `Read`/`Write` or clock traits for determinism.

## Docs

`///` for items, `//!` for crate/module. Include `# Examples`, `# Errors`, `# Panics`, and `# Safety` (for `unsafe fn`) sections.

## Dependencies and profiles

- Pin sensibly (`"1"` caret ranges); commit `Cargo.lock` for applications.
- Disable default features you do not need; gate optional code with `[features]`.
- CLI parsing: `clap`. Serialization: `serde`. Errors: `thiserror`/`anyhow`. Regex: `regex`.
- Benchmark and profile with `--release`; debug builds are far slower and overflow-check.
- `[profile.release]`: `lto`, `codegen-units = 1`, `panic = "abort"` only when measured and acceptable.
