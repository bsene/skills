# Core Function Index (cljs.info Cheatsheet)

Full interactive reference: https://cljs.info/cheatsheet/ (MIT-licensed, source: https://github.com/oakmac/cljs-cheatsheet). Use it as the go-to lookup when you need "is there a stdlib function for X" or the exact name of a less-common `clojure.core`/`clojure.string`/`clojure.set` function — CLJS shares almost all of `clojure.core` with JVM Clojure, so this doubles as a general Clojure cheatsheet too, not just a CLJS one.

This file is a category index (what's available, grouped by purpose) rather than a full function-by-function reproduction — follow the link above for the live version with docs links per function.

## Definitions & control flow
- **Define**: `def`, `defn`, `defn-`, `let`, `letfn`, `declare`, `ns`
- **Branch**: `if`, `if-not`, `when`, `when-not`, `when-let`, `if-let`, `when-first`, `when-some`, `if-some`, `cond`, `condp`, `case`
- **Compare/logic**: `=`, `not=`, `and`, `or`, `not`, `identical?`, `compare`

## Functions
- **Create**: `fn`, `defn`, `defn-`, `#(...)` reader shorthand, `identity`, `constantly`, `comp`, `complement`, `partial`, `juxt`, `memoize`, `fnil`, `every-pred`, `some-fn`
- **Call/thread**: `apply`, `->`, `->>`, `as->`, `cond->`, `cond->>`, `some->`, `some->>`
- **Test**: `fn?`, `ifn?`

## Numbers
CLJS numbers are all IEEE-754 doubles (same as JS) — no BigDecimal/BigInt/ratios.
- **Arithmetic**: `+`, `-`, `*`, `/`, `quot`, `rem`, `mod`, `inc`, `dec`, `max`, `min`
- **Compare**: `=`, `==`, `<`, `>`, `<=`, `>=`, `compare`
- **Test**: `zero?`, `pos?`, `neg?`, `even?`, `odd?`, `number?`, `integer?`
- **Random**: `rand`, `rand-int`
- **Bitwise**: `bit-and`, `bit-or`, `bit-xor`, `bit-not`, `bit-flip`, `bit-set`, `bit-shift-right`, `bit-shift-left`, `bit-and-not`, `bit-clear`, `bit-test`, `unsigned-bit-shift-right`

## Strings
- **Create/use**: `str`, `name`, `count`, `get`, `subs`
- **`clojure.string`**: `join`, `split`, `split-lines`, `replace`, `replace-first`, `reverse`, `capitalize`, `lower-case`, `upper-case`, `trim`, `trim-newline`, `triml`, `trimr`, `blank?`, `starts-with?`, `ends-with?`, `includes?`
- **Regex**: `#"pattern"`, `re-find`, `re-seq`, `re-matches`, `re-pattern`

## Atoms / state
`atom`, `deref`/`@`, `swap!`, `reset!`, `compare-and-set!`, `add-watch`, `remove-watch`, `set-validator!`, `get-validator` — see this skill's general note: reach for these only for genuine local mutable state, not as a default variable substitute (per Working Style).

## JS interop
`#js {}`/`js-obj`, `#js []`/`array`/`make-array`/`aclone`, `.-prop` get, `(set! (.-prop o) v)`, `js-delete`, `clj->js`/`js->clj`, `array?`/`fn?`/`number?`/`object?`/`string?`, `try`/`catch`/`finally`/`throw`. See this skill's `references/dependencies-and-interop.md` for the deeper mechanics (externs, `:advanced` renaming, etc.) — this cheatsheet only covers the syntax, not the compiler pitfalls.

## Collections (general)
`count`, `empty`, `not-empty`, `into`, `conj`, `distinct?`, `empty?`, `every?`, `not-every?`, `some`, `not-any?`, `sequential?`, `associative?`, `sorted?`, `counted?`, `reversible?`, `coll?`, `list?`, `vector?`, `set?`, `map?`, `seq?`

- **Lists `()`**: `list`, `list*`, `first`, `nth`, `peek`, `cons`, `conj`, `rest`, `pop`
- **Vectors `[]`**: `vector`, `vec`, `get`, `peek`, `assoc`, `pop`, `subvec`, `replace`, `conj`, `rseq`, `mapv`, `filterv`, `reduce-kv`
- **Sets `#{}`**: `set`, `hash-set`, `sorted-set`, `sorted-set-by`, `contains?`, `conj`, `disj`, `clojure.set/union`, `clojure.set/difference`, `clojure.set/intersection`, `clojure.set/select`, `clojure.set/subset?`, `clojure.set/superset?`
- **Maps `{}`**: `hash-map`, `array-map`, `zipmap`, `sorted-map`, `sorted-map-by`, `frequencies`, `group-by`, `get`, `get-in`, `contains?`, `find`, `keys`, `vals`, `assoc`, `assoc-in`, `dissoc`, `merge`, `merge-with`, `select-keys`, `update-in`, `key`, `val`

## Sequences
- **Shrink**: `distinct`, `filter`, `remove`, `take-nth`, `for`
- **Grow**: `cons`, `conj`, `concat`, `lazy-cat`, `mapcat`, `cycle`, `interleave`, `interpose`
- **From tail**: `rest`, `nthrest`, `next`, `fnext`, `nnext`, `drop`, `drop-while`, `take-last`
- **From head**: `take`, `take-while`, `butlast`, `drop-last`
- **Rearrange**: `reverse`, `sort`, `sort-by`
- **Process**: `map`, `map-indexed`, `mapcat`, `for`, `replace`
- **Extract item**: `first`, `second`, `last`, `rest`, `next`, `ffirst`, `nfirst`, `fnext`, `nnext`, `nth`, `nthnext`, `rand-nth`, `max-key`, `min-key`
- **Construct**: `zipmap`, `into`, `reduce`, `reductions`, `set`, `vec`, `into-array`
- **Create a seq**: `seq`, `vals`, `keys`, `rseq`, `lazy-seq`, `repeatedly`, `iterate`, `repeat`, `range`, `re-seq`, `tree-seq`, `keep`, `keep-indexed`
- **Force evaluation** (lazy by default): `doseq`, `dorun`, `doall`, `realized?`

## Truthiness note (differs from JS)
Everything is truthy except `false` and `nil` — including `0`, `""`, `js/NaN`, `[]`, and `(array)`. This is simpler than JS's truthiness rules but easy to get backwards if coming straight from JS/TS: `(if 0 "yes" "no")` → `"yes"` in CLJS, unlike JS's `if (0)`.