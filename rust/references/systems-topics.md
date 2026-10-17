# Systems Topics: Data, Files, Networking, Time

Source: _Rust in Action_, ch. 5 (data in depth), 7 (files and storage), 8 (networking), 9 (time), 12 (signals/interrupts).

## Bits and numbers

| Topic                   | Guidance                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Integer overflow        | debug panics, release wraps; choose `checked_add`, `wrapping_add`, `saturating_add`, `overflowing_add` deliberately |
| Casting                 | `as` truncates/saturates silently; use `TryFrom` when range matters                                                 |
| Endianness              | pick explicitly: `to_le_bytes`, `from_be_bytes`; `byteorder` crate for streams                                      |
| Bit ops                 | `& \| ^ << >> !`, `count_ones`, `leading_zeros`, `rotate_left`                                                      |
| Floats (IEEE 754)       | inexact; compare with epsilon; `NaN != NaN`; `f32` does not implement `Eq`/`Ord`/`Hash` (use `total_cmp`, or wrap)  |
| Fixed point / quantized | store integers scaled by a constant when floats are too heavy or non-deterministic                                  |
| Enum layout             | `#[repr(u8)]` etc. when the discriminant is persisted                                                               |
| CPU emulation exercises | model opcodes with `enum` + `match`, memory as `[u8; N]`                                                            |

## Files and storage

| Task                  | Tool                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Read whole small file | `fs::read_to_string`, `fs::read`                                                                  |
| Line/stream reading   | `BufReader::new(File::open(p)?)` + `.lines()`                                                     |
| Buffered writes       | `BufWriter` (call `flush` or drop)                                                                |
| Seek / random access  | `Seek`, `SeekFrom`                                                                                |
| Paths                 | `Path`/`PathBuf`; never build with string concat; `join`, `extension`                             |
| Binary formats        | fixed header, length-prefixed records, version byte; frame with explicit endianness               |
| Integrity             | checksum each record (e.g. CRC32); verify on read                                                 |
| Append-only log store | write record, index key to file offset in memory, rebuild index by scanning; compact periodically |
| Serialization         | `serde` + `bincode`/`serde_json` instead of hand-rolling when format is yours                     |

Generic I/O code takes `impl Read`/`impl Write` so tests can use `&[u8]` / `Vec<u8>` / `Cursor`.

## Networking

| Layer             | Tool                                                           |
| ----------------- | -------------------------------------------------------------- |
| HTTP client       | `reqwest` (blocking or async)                                  |
| TCP               | `TcpStream::connect`, `TcpListener::bind`; wrap in `BufReader` |
| DNS               | `ToSocketAddrs`, resolver crates                               |
| Raw / TAP devices | OS-specific; needs privileges; build frames by hand            |
| Protocol states   | model as an `enum` state machine with explicit transitions     |

Checklist: set read/write timeouts; handle partial reads (`read_exact`, loop); treat all input as untrusted; map network, parse, and protocol failures to distinct error variants; use `Box<dyn Error>` only in binaries; prefer libraries over hand-rolled HTTP except to learn.

## Time

| Concept             | Guidance                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Wall clock          | `SystemTime`; can jump (NTP, DST, user edits)                                                                    |
| Monotonic           | `Instant` for durations and timeouts; never goes backwards                                                       |
| Calendar/zones      | `chrono` or `time` crates; store UTC, convert at the edges                                                       |
| Formats             | ISO 8601 / RFC 3339 for storage and APIs; RFC 2822 for email                                                     |
| Epoch               | Unix seconds since 1970-01-01 UTC; mind 32-bit year-2038 overflow                                                |
| Clock sync          | NTP exchanges four timestamps; offset = ((t1-t0)+(t2-t3))/2; apply gradual (slew) adjustment, avoid sudden steps |
| Setting system time | privileged, platform-specific; wrap in `unsafe` FFI behind a small safe function                                 |
| Tests               | inject a clock trait instead of calling `now()` directly                                                         |

## Signals and processes

Handle SIGINT/SIGTERM via an atomic flag set by the handler (`signal-hook`/`ctrlc`); do real work outside the handler. Use `std::process::Command` for child processes; check exit status; avoid shell string interpolation.
