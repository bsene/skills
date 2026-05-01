# JSON & Templates

## encoding/json

### Struct Tags

```go
type User struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email,omitempty"`  // omit when ""
    Password  string    `json:"-"`                 // never include
    CreatedAt time.Time `json:"created_at"`
}
```

### Marshal / Unmarshal

```go
// Struct → JSON
data, err := json.Marshal(user)

// JSON → struct
var user User
err := json.Unmarshal(data, &user)

// Pretty print
data, err := json.MarshalIndent(user, "", "  ")
```

### Streaming (Encoder / Decoder)

For HTTP request/response bodies — avoids intermediate `[]byte`:

```go
// Write JSON to response
w.Header().Set("Content-Type", "application/json")
json.NewEncoder(w).Encode(response)

// Read JSON from request
var req CreateUserRequest
if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
    http.Error(w, "invalid JSON", http.StatusBadRequest)
    return
}
```

Prefer `NewDecoder`/`NewEncoder` for HTTP. Prefer `Marshal`/`Unmarshal` for in-memory conversions.

### Custom Marshaler

```go
type Status int

const (
    StatusActive Status = iota
    StatusInactive
)

func (s Status) MarshalJSON() ([]byte, error) {
    var str string
    switch s {
    case StatusActive:
        str = "active"
    case StatusInactive:
        str = "inactive"
    default:
        str = "unknown"
    }
    return json.Marshal(str)
}

func (s *Status) UnmarshalJSON(data []byte) error {
    var str string
    if err := json.Unmarshal(data, &str); err != nil {
        return err
    }
    switch str {
    case "active":
        *s = StatusActive
    case "inactive":
        *s = StatusInactive
    default:
        return fmt.Errorf("unknown status: %s", str)
    }
    return nil
}
```

### Working with Dynamic JSON

```go
// Unknown structure → map
var data map[string]any
json.Unmarshal(raw, &data)

// json.RawMessage — delay parsing
type Event struct {
    Type    string          `json:"type"`
    Payload json.RawMessage `json:"payload"`
}

var event Event
json.Unmarshal(raw, &event)

switch event.Type {
case "order":
    var order Order
    json.Unmarshal(event.Payload, &order)
case "payment":
    var payment Payment
    json.Unmarshal(event.Payload, &payment)
}
```

---

## encoding/xml

```go
type Feed struct {
    XMLName xml.Name `xml:"feed"`
    Title   string   `xml:"title"`
    Entries []Entry  `xml:"entry"`
}

type Entry struct {
    Title   string `xml:"title"`
    Link    string `xml:"link,attr"`
    Summary string `xml:"summary"`
}

// Unmarshal
var feed Feed
xml.Unmarshal(data, &feed)

// Marshal with header
output, _ := xml.MarshalIndent(feed, "", "  ")
xmlHeader := []byte(xml.Header)
result := append(xmlHeader, output...)
```

XML struct tags: `xml:"element"`, `xml:"attr,attr"`, `xml:",chardata"`, `xml:",innerxml"`, `xml:"-"`.

---

## html/template

### Basic Usage

```go
tmpl := template.Must(template.ParseFiles("templates/page.html"))

func handler(w http.ResponseWriter, r *http.Request) {
    data := PageData{
        Title: "Home",
        Users: users,
    }
    if err := tmpl.Execute(w, data); err != nil {
        http.Error(w, "template error", http.StatusInternalServerError)
    }
}
```

### Template Syntax

```html
<!-- Variable -->
<h1>{{.Title}}</h1>

<!-- Range -->
{{range .Users}}
  <p>{{.Name}} — {{.Email}}</p>
{{end}}

<!-- Conditional -->
{{if .IsAdmin}}
  <span>Admin</span>
{{else}}
  <span>User</span>
{{end}}

<!-- Pipe -->
{{.CreatedAt | formatDate}}

<!-- Nested template -->
{{template "header" .}}
```

### Layout Composition

```go
// base.html
{{define "base"}}
<!DOCTYPE html>
<html>
<head><title>{{template "title" .}}</title></head>
<body>{{template "content" .}}</body>
</html>
{{end}}

// home.html
{{define "title"}}Home{{end}}
{{define "content"}}<h1>Welcome</h1>{{end}}
```

```go
tmpl := template.Must(template.ParseFiles("templates/base.html", "templates/home.html"))
tmpl.ExecuteTemplate(w, "base", data)
```

### Custom Functions

```go
funcMap := template.FuncMap{
    "upper":      strings.ToUpper,
    "formatDate": func(t time.Time) string { return t.Format("2006-01-02") },
}

tmpl := template.Must(
    template.New("page.html").Funcs(funcMap).ParseFiles("templates/page.html"),
)
```

### Security

`html/template` auto-escapes HTML, JS, and URL contexts. Never use `text/template` for HTML — it doesn't escape.

To insert trusted HTML:

```go
type HTML = template.HTML
data := PageData{Content: template.HTML(trustedHTML)}
```
