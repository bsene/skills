# Ruby Design Patterns — Implementation Reference

Each entry: the idiomatic Ruby shape, a minimal example, the "using and abusing" caution from the source material, and a real-world sighting. Skip straight to the pattern you need — this file is a reference, not a narrative.

---

## Template Method

Keep the class hierarchy — this is one of the few patterns Ruby implements almost exactly like Java, because "one shared algorithm, one varying step" maps directly onto inheritance.

```ruby
class Report
  def output
    output_start
    output_body
    output_end
  end

  def output_body
    raise NotImplementedError, "#{self.class} must implement output_body"
  end

  def output_start; end
  def output_end; end
end

class HTMLReport < Report
  def output_start = puts "<html>"
  def output_body  = puts "<p>#{data}</p>"
  def output_end   = puts "</html>"
end
```

**Caution:** subclasses only override hook methods — never call `super` inside an override unless the hook is explicitly designed to be extended, and document which methods are hooks (`_start`/`_end` naming convention or a comment) so subclassers don't have to read the base class to know what's safe to touch.

**In the wild:** ActiveRecord callbacks are a Template-Method-shaped API (`before_save`, `after_commit`) built on hooks rather than inheritance — worth pointing out as the Rails-native evolution of this pattern.

---

## Strategy

Ruby's version rarely needs a `Strategy` class at all — a `Proc`/lambda passed into the context object *is* the pattern.

```ruby
class Report
  def initialize(&formatter)
    @formatter = formatter || method(:default_format)
  end

  def output(data) = @formatter.call(data)

  private

  def default_format(data) = data.to_s
end

Report.new { |data| data.to_json }.output(payload)
```

Class-based strategies are still worth it when the strategy needs its own state or multiple methods:

```ruby
class HTMLFormatter
  def format(data) = "<p>#{data}</p>"
end

Report.new(&HTMLFormatter.new.method(:format))
```

**Caution:** don't build a `Strategy` base class with `NotImplementedError` stubs if every concrete strategy is stateless and one-method — that's ceremony around what a block already does.

**In the wild:** `Enumerable#sort_by`, `#min_by`, `#group_by` all take the comparison/keying strategy as a block — this is Strategy applied at the standard-library level.

---

## Observer

```ruby
require "observer"

class Ticker
  include Observable

  def price=(new_price)
    changed
    notify_observers(Time.now, new_price)
  end
end

class Chart
  def update(time, price) = puts "#{time}: #{price}"
end

ticker = Ticker.new
ticker.add_observer(Chart.new)
```

Or skip `Observable` entirely for a one-off — an array of `Proc`s is often more transparent:

```ruby
class Ticker
  def initialize = @listeners = []
  def on_change(&block) = @listeners << block
  def price=(p) = @listeners.each { |l| l.call(p) }
end
```

**Caution:** `Observable#changed` must be called before `notify_observers` or nothing fires — a common silent bug. Watch for observer lists that grow unbounded (no `delete_observer`) causing memory leaks in long-lived processes.

**In the wild:** ActiveSupport::Notifications is Observer at framework scale (publish/subscribe with payloads), and ActiveRecord callbacks overlap conceptually with Observer for cross-model concerns.

---

## Composite

```ruby
module Node
  def total = raise NotImplementedError
end

class Leaf
  include Node
  def initialize(value) = @value = value
  def total = @value
end

class Branch
  include Node
  def initialize(*children) = @children = children
  def total = @children.sum(&:total)
end
```

**Caution:** only worth it when leaf and composite are called through genuinely the same interface. If callers need to special-case "is this a leaf or a branch," the abstraction has already failed — give the leaf harmless no-op versions of composite-only methods (e.g., `children = []`) rather than leaking the distinction.

**In the wild:** Rack middleware stacks are Composite — every middleware and the final app respond to `#call(env)` identically.

---

## Iterator

Don't hand-roll an external iterator class in Ruby — include `Enumerable` and define `#each`; every other iteration method (`map`, `select`, `reduce`, `sort_by`, `lazy`) comes free.

```ruby
class LineReader
  include Enumerable

  def initialize(path) = @path = path

  def each
    return enum_for(:each) unless block_given?
    File.foreach(@path) { |line| yield line.chomp }
  end
end
```

`return enum_for(:each) unless block_given?` is the idiom that makes the object work both with a block and as a lazy/chainable Enumerator (`reader.each.with_index`, `reader.lazy.select(...)`).

**Caution:** don't build a separate `Iterator` object with `#next`/`#has_next?` unless there's a real need to pause mid-iteration and resume later (rare) — `Enumerable` covers the overwhelming majority of cases and every Ruby developer already knows its API.

**In the wild:** almost every collection-like class in the standard library and in Rails (`ActiveRecord::Relation`, `ActiveRecord::Associations::CollectionProxy`) implements this exact shape.

---

## Command

```ruby
class MoveCommand
  def initialize(entity, dx, dy)
    @entity, @dx, @dy = entity, dx, dy
  end

  def execute   = @entity.move(@dx, @dy)
  def unexecute = @entity.move(-@dx, -@dy)
end

history = []
cmd = MoveCommand.new(player, 1, 0)
cmd.execute
history << cmd
history.pop.unexecute # undo
```

For fire-and-forget commands (no undo, no queuing), a `Proc` is the whole pattern: `history << -> { entity.move(1, 0) }`.

**Caution:** don't add `#unexecute` speculatively — only build the inverse operation when undo is an actual requirement; it roughly doubles the surface area of every command.

**In the wild:** ActiveRecord migrations (`up`/`down`) are Command with undo built in. Rake tasks and Thor commands are Command without it.

---

## Adapter

```ruby
class LegacyPrinterAdapter
  def initialize(legacy_printer) = @legacy = legacy_printer
  def print(text) = @legacy.print_string(text) # translate the call
end
```

For a single misbehaving instance rather than a whole class, extend just that object:

```ruby
module PrintAdapter
  def print(text) = print_string(text)
end

legacy_printer.extend(PrintAdapter)
```

**Caution:** adapting a single instance with `extend` is powerful but easy to lose track of — prefer the wrapper class when the adapted object escapes the local scope (gets passed around, stored, logged) so its type stays predictable.

**In the wild:** Rack's `env` hash plus middleware adapters between web servers (Puma, Unicorn) and Rack itself; ActiveRecord adapters (`ActiveRecord::ConnectionAdapters::PostgreSQLAdapter`, etc.) adapting different databases to one query interface.

---

## Proxy

```ruby
class LazyLoadProxy
  def initialize(&loader) = @loader = loader

  def method_missing(name, *args, **kwargs, &block)
    target.public_send(name, *args, **kwargs, &block)
  end

  def respond_to_missing?(name, include_private = false)
    target.respond_to?(name, include_private) || super
  end

  private

  def target = @target ||= @loader.call
end
```

Prefer stdlib delegation when there's no custom logic (laziness, access control, remote call) beyond pure forwarding:

```ruby
require "delegate"
class LoudLogger < SimpleDelegator
  def warn(msg) = super(msg.upcase)
end
```

**Caution:** always implement `respond_to_missing?` alongside `method_missing` — without it, `respond_to?`, `method()`, and duck-typing checks against the proxy silently lie. `BasicObject` (undefining most methods first) is the right base class for a proxy that must forward almost everything, since `Object` already defines methods like `#class` that would otherwise shadow the target.

**In the wild:** ActiveRecord association proxies (`has_many` returns a `CollectionProxy`, not a plain `Array`) are exactly this pattern — lazy-loaded, delegating, and pretending to be the underlying collection.

---

## Decorator

```ruby
module Compressed
  def write(data) = super(compress(data))
  private
  def compress(data) = data # ...
end

file_writer.extend(Compressed) # decorate one instance only
```

Or the classic wrap-and-delegate form when the decoration needs to apply broadly and be composed with `.new`:

```ruby
class CompressedWriter
  def initialize(writer) = @writer = writer
  def write(data) = @writer.write(compress(data))
  private
  def compress(data) = data # ...
end
```

**Caution:** module-based decoration (`extend`) only decorates one instance, which is usually what's wanted — but it's easy to forget and reach for it expecting class-wide effect. If every instance of a class should get the behavior, `prepend` the module onto the class instead of decorating instances one by one.

**In the wild:** ActiveSupport's `Module#prepend`-based instrumentation (Rails' own internals use this heavily) and gems like `SimpleDelegator` subclasses are this pattern.

---

## Singleton

```ruby
require "singleton"

class Configuration
  include Singleton
  attr_accessor :api_key
end

Configuration.instance.api_key = "..."
```

**Caution — read before reaching for this one:** a Ruby Singleton is a global variable wearing a costume. It couples every caller to one shared instance, and it is one of the most common sources of hard-to-isolate tests (state leaking between examples unless explicitly reset). Before using it, ask:
- Is "one per process" actually required, or would "one per request/job" (dependency-injected) be safer? If the latter, pass the object explicitly instead.
- If it must be global, is a plain module with module-level methods (`module Configuration; def self.api_key = ...; end`) more honest than a class dressed up to look instantiable?
- In tests, plan for `Configuration.instance.instance_variable_set(...)` resets or a test double — don't let Singleton state bleed across examples.

**In the wild:** Rails' `Rails.application`, `Rails.cache`, `Rails.logger` are all singleton-shaped globals — pragmatic at framework scope, exactly the pattern to avoid introducing casually in application code.

---

## Factory (Method / Abstract Factory)

```ruby
class ShapeFactory
  SHAPES = { circle: Circle, square: Square }.freeze

  def self.build(kind, **opts)
    klass = SHAPES.fetch(kind) { raise ArgumentError, "unknown shape #{kind}" }
    klass.new(**opts)
  end
end
```

Ruby's "classes are just objects" trick — pass the class itself where a factory would go in Java:

```ruby
def render(shape_class, **opts) = shape_class.new(**opts).render
render(Circle, radius: 3)
```

**Caution:** a `Hash`-based factory is almost always enough; don't build an `AbstractFactory` class hierarchy unless there are genuinely multiple families of related objects that must be swapped together (e.g., swapping an entire "Windows widget family" for a "Mac widget family") — a single-axis factory doesn't need that machinery.

**In the wild:** `ActiveRecord::Inheritance` (STI) resolves the class from a `type` column exactly like the `SHAPES` hash above; Rails' `ActiveJob` and `ActiveStorage` adapters resolve their concrete implementation from config the same way.

---

## Builder

```ruby
class ComputerBuilder
  def initialize
    @parts = {}
    yield self if block_given?
  end

  def cpu(value)   = (@parts[:cpu] = value; self)
  def memory(value) = (@parts[:memory] = value; self)
  def build = Computer.new(**@parts)
end

computer = ComputerBuilder.new { |b| b.cpu("M4").memory("32GB") }.build
```

**Caution:** if the object has three or fewer optional parameters, a keyword-argument `initialize` is simpler than a Builder — reach for Builder when construction genuinely has multiple valid orders/paths or needs validation *during* assembly (ensuring a "sane object" at every step, per Olsen), not just because a constructor has several arguments.

**In the wild:** RSpec's `describe`/`context`/`it` DSL and Rails' `ActiveRecord::Migration` `create_table do |t| ... end` blocks are Builder-shaped — `self` is yielded and methods accumulate configuration before the final object is built.

---

## Interpreter

Reach for this only when there's a genuine small grammar to evaluate, not for general "flexible configuration" (that's usually convention-over-configuration or a plain Hash instead).

```ruby
# A tiny file-matching AST
Not = Struct.new(:expr) { def evaluate(f) = !expr.evaluate(f) }
And = Struct.new(:l, :r) { def evaluate(f) = l.evaluate(f) && r.evaluate(f) }
BiggerThan = Struct.new(:size) { def evaluate(f) = f.size > size }

query = And.new(BiggerThan.new(1024), Not.new(BiggerThan.new(1_000_000)))
files.select { |f| query.evaluate(f) }
```

**Caution:** hand-writing a parser is rarely worth it in Ruby — either let the caller build the AST directly with plain Ruby objects (as above, no parser needed), or if text input is unavoidable, prefer letting *Ruby itself* parse it via a restrained internal DSL (see below) over writing a custom recursive-descent parser.

**In the wild:** rare in application code; RSpec matchers and Rails' `ActiveRecord::QueryMethods` (`where(...).not(...)`) compose in an Interpreter-adjacent way, building up an AST-like query object that's evaluated later.

---

## Domain-Specific Language (internal DSL)

```ruby
class BackupDSL
  def initialize(&block)
    @includes, @excludes = [], []
    instance_eval(&block)
  end

  def include(pattern) = @includes << pattern
  def exclude(pattern) = @excludes << pattern
end

config = BackupDSL.new do
  include "**/*.rb"
  exclude "spec/**/*"
end
```

`instance_eval` is what makes the block read as a mini-language — inside it, bare method calls resolve against the DSL object instead of the caller's `self`.

**Caution:** `instance_eval` blocks lose access to the caller's local `self` and instance variables (though local variables from the surrounding scope remain visible) — that's the price of the clean syntax. Don't build a DSL for one-shot, single-use configuration; the payoff comes when the same DSL is written many times (Rails routes, RSpec specs, Rake tasks).

**In the wild:** RSpec, Rails routes (`config/routes.rb`), Rake, Sinatra, and Gemfiles are all internal DSLs of exactly this shape.

---

## Metaprogramming (custom objects, method by method)

```ruby
class AttributeBuilder
  def self.attribute(name)
    define_method(name) { instance_variable_get("@#{name}") }
    define_method("#{name}=") { |v| instance_variable_set("@#{name}", v) }
  end
end
```

`Object#define_singleton_method` for one instance only; `Class#define_method`/`class_eval` for every instance of a class; `Module#included`/`Module#prepend` hooks for injecting behavior at include-time.

**Caution:** every generated method is a method the next reader can't `grep` for. Prefer `define_method` (keeps a real method-shaped call stack, works with `super`) over `method_missing` (invisible until it errors) whenever the set of methods is knowable ahead of time — `method_missing` is for genuinely open-ended method names.

**In the wild:** `attr_accessor` itself, ActiveRecord's dynamically-defined column accessors, and `Struct.new` are all this pattern in the standard library/Rails core.

---

## Convention Over Configuration

Not a class-shaped pattern — it's a design stance: derive behavior from naming/location instead of requiring explicit configuration, and let configuration exist only for the exception.

```ruby
class Gateway
  def self.for(name)
    const_get("#{name.to_s.camelize}Adapter") # convention: name -> constant
  end
end
```

**Caution:** this is the pattern most likely to need a comment. "Magic" that works via naming convention (`PostsController` -> `posts` table -> `Post` model) is fast to write and genuinely hard to trace for someone who doesn't already know the convention — flag this explicitly in reviews as a discoverability cost, not a correctness one.

**In the wild:** this is the core design philosophy of Rails itself — autoloading, RESTful routing defaults, ActiveRecord table/model naming.
