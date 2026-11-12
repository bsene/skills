# Phoenix LiveView — Rules from the Official Docs

Condensed rules (not a reproduction) from the [Phoenix LiveView documentation](https://hexdocs.pm/phoenix_live_view/), checked against v1.2. Check the docs' changelog when you are on a different major version.

## Lifecycle

1. An HTTP request runs `mount/3` → `handle_params/3` → `render/1` and returns static HTML.
2. The browser connects over a WebSocket, a LiveView process is spawned, and **`mount/3` runs again**, followed by `handle_params/3` and `render/1`.
3. After that, `handle_event/3` (client events), `handle_info/2` (process messages such as PubSub), `handle_params/3` (patches) and `handle_async/3` update assigns. LiveView sends only the diffs.

| Rule                                                                                                                                | Why                                            |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Gate side effects (PubSub `subscribe`, timers) with `if connected?(socket)`                                                         | `mount/3` runs twice                           |
| Load data that never changes in `mount/3`; load data that changes with the URL (page, sort, filter) in `handle_params/3`            | Patches rerun `handle_params/3`, not `mount/3` |
| Never block in `mount`/`handle_event`: use `assign_async/3`, `start_async/3`, `stream_async/3`                                      | Blocking stalls rendering for that user        |
| Don't capture `socket` in async closures: copy the needed values into locals first                                                  | The whole socket gets copied to the task       |
| Async tasks are linked: a crash in plain `Task.async` kills the LiveView. Use `Task.Supervisor.async_nolink/3` or the async helpers | Fault isolation                                |

## Assigns and Change Tracking (HEEx)

- Change state only with `assign/2,3`, `assign_new/3` and `update/3`. **Never** `Map.put`/`Map.merge` on `assigns`: those values stop updating after the first render.
- **Do not** define variables in `render/1` or with `<% x = ... %>` in templates. Variables disable change tracking, so anything that uses them re-renders every time. Compute derived values into assigns instead.
- **Do not** pass the whole map (`<.child {assigns} />`). Pass explicit attributes so each child re-renders only when its inputs change.
- **Never load data inside a template.** A `Repo.all` call in HEEx never re-renders when the data changes.
- Give `:for` comprehensions a `:key` so an insert doesn't mark every later row as changed.
- Use **streams** for large or unbounded collections; the items are freed from the server after render.

```elixir
def mount(%{"id" => id}, _session, socket) do
  if connected?(socket), do: Phoenix.PubSub.subscribe(MyApp.PubSub, "post:#{id}")
  {:ok, socket |> assign(:post_id, id) |> stream(:comments, Blog.list_comments(id))}
end

def handle_info({:new_comment, c}, socket), do: {:noreply, stream_insert(socket, :comments, c, at: 0)}
```

```heex
<ul id="comments" phx-update="stream">
  <li :for={{dom_id, c} <- @streams.comments} id={dom_id}>{c.body}</li>
</ul>
```

**Stream rules:**

- The parent needs `phx-update="stream"` and a unique `id`, and each item needs `id={dom_id}`. Don't change the generated ids.
- `stream_insert/4` options are `:at` (`0` prepends, `-1` appends) and `:limit`, which you must pass on every call for it to apply.
- To move an item, delete it and insert it again. `reset: true` replaces the whole stream.
- `stream_configure/3` runs once, before any insert; in a LiveComponent, call it in `mount/1`.
- For an empty state, add a sibling element and style it with CSS `:only-child`.

## Choosing a Building Block

| Need                                      | Use                                                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Reusable markup                           | **Function component** (`attr`/`slot` + `~H`). This is the default                                                         |
| Markup that owns its own state and events | **LiveComponent** (`live_component/1`, needs an `:id`). It runs in the parent process, so its crash takes down the page    |
| Crash isolation or a separate lifecycle   | **Nested LiveView** (`live_render/3`, unique `:id`). Expensive; never use it just to organise code                         |
| Event handling shared across views        | `attach_hook/4` (stages `:handle_event`, `:handle_info`, `:handle_params`, `:handle_async`, `:after_render`) or `on_mount` |

## Navigation

| Goal                                             | Client                   | Server            | Effect                                            |
| ------------------------------------------------ | ------------------------ | ----------------- | ------------------------------------------------- |
| Same LiveView, new URL params (sort/filter/page) | `<.link patch={...}>`    | `push_patch/2`    | `handle_params/3` only, minimal diff, scroll kept |
| Another LiveView in the same `live_session`      | `<.link navigate={...}>` | `push_navigate/2` | New mount, layout stays in place                  |
| Outside the session, or a full reload            | `<.link href={...}>`     | `redirect/2`      | New HTTP request                                  |

Live navigation works only between LiveViews declared in the router, not nested ones. Crossing `live_session` boundaries forces a full reload.

## Forms

- Build `@form` with `to_form(changeset)` (use `action: :validate` in the change handler), render it with `<.form for={@form} phx-change="validate" phx-submit="save">` and `<.input field={@form[:email]} />`.
- Show errors only for fields the user has touched: `used_input?/1`.
- Give every form an `id`. With `phx-change`, that also enables automatic recovery after a reconnect; `phx-auto-recover` customises it.
- Use `phx-debounce` on text inputs. Use `phx-disable-with` on submit buttons.
- Use `.inputs_for` for nested fields.
- For routes that change the session (login), set `phx-trigger-action` to fall back to a plain HTTP POST.
- Focused inputs are never overwritten by server patches.

## Security

- **`live_session` + `on_mount`** for authentication (`{:cont, socket}` or `{:halt, redirect(socket, to: ...)}`). Router `pipe_through` does **not** protect live navigation within a session.
- **Authorise everywhere:** in `mount/3` (page), `handle_params/3` (navigation) and **every `handle_event/3`**. Hiding a button is not authorisation; pass the current scope to context functions that enforce the rule.
- Treat `params`, `session` and event payloads as hostile; validate them with changesets as you would in controllers.
- To force a logout everywhere, set `live_socket_id` in the session and broadcast `"disconnect"` on that topic. `mix phx.gen.auth` generates this wiring.
- Use `assign_new/3` for `current_user`/scope so nested LiveViews don't fetch it again.

## JS Interop

- Prefer **`Phoenix.LiveView.JS`** commands in HEEx (`JS.show`, `JS.toggle_class`, `JS.push`, `JS.navigate`): they run on the client and survive DOM patches.
- **Hooks** (`phx-hook`, which needs a unique `id`): callbacks `mounted`, `beforeUpdate`, `updated`, `destroyed`, `disconnected`, `reconnected`. Talk to the server with `this.pushEvent` / `this.handleEvent`.
- Prefer **colocated hooks** (`<script :type={Phoenix.LiveView.ColocatedHook} name=".Chart">`) for component-local JS.
- Server → client: `push_event/3`. Event names are global, so scope them, e.g. `"chart-#{id}"`.
- Use `phx-update="ignore"` on DOM that a JS library owns.
- Never set or replace element ids by hand in JS; use `js().setAttribute`.

## Testing (`Phoenix.LiveViewTest`)

```elixir
{:ok, view, _html} = live(conn, ~p"/posts/#{post}")
assert view |> form("#comment-form", comment: %{body: ""}) |> render_change() =~ "can&#39;t be blank"
view |> element("button", "Delete") |> render_click()
assert_patch(view, ~p"/posts")
```

- Prefer `element/3` / `form/3` over bare event names: they check that the markup actually emits the event.
- Fill inputs through `form/3`, not `render_submit/2` data, so renamed fields fail loudly.
- `render_async/2` before asserting on async data.
- `send(view.pid, msg)` then `render(view)` to test `handle_info`.
- Test function components with `render_component/2` or `rendered_to_string(~H"...")`.
- Use `live_isolated/3` for LiveViews that have no route.
- Keep the default `:raise` for duplicate-id and missing-form-id warnings.

## Review Checklist

1. Side effects in `mount/3` are gated by `connected?/1`; slow work is async.
2. No template variables, no whole-`assigns` passing, no data loading in HEEx.
3. Large lists are streams, with correct ids and `phx-update`.
4. Every `handle_event/3` authorises the action; auth lives in `on_mount` per `live_session`.
5. A function component unless state or isolation is required.
6. Tests drive the UI through `element/3`/`form/3`.
