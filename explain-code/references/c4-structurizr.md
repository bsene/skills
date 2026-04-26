# C4 Model — Structurizr DSL Reference

## Workspace Skeleton

```
workspace "Name" "Description" {
  model {
    # define people, systems, containers, components here
  }
  views {
    # define which views to render
    styles {
      # visual styling rules
    }
  }
}
```

---

## Model Elements

### People and Systems

```
user = person "User" "Description"
admin = person "Admin" "Description"

sys = softwareSystem "System" "Description"
extSys = softwareSystem "External System" "Description" {
    tags "External"
}
```

### Containers (Level 2 — inside a softwareSystem block)

```
sys = softwareSystem "System" "Description" {
    web = container "Web App" "Description" "React"
    api = container "API" "Description" "Node.js Express"
    db = container "Database" "Description" "PostgreSQL" {
        tags "Database"
    }
    queue = container "Event Bus" "Description" "RabbitMQ" {
        tags "Queue"
    }
}
```

### Components (Level 3 — inside a container block)

```
api = container "API" "Description" "Node.js" {
    controller = component "Controller" "Handles HTTP requests" "Express Router"
    service = component "Service" "Business logic" "TypeScript class"
    repo = component "Repository" "Data access" "TypeORM"
}
```

### Relationships

```
user -> sys "Uses" "HTTPS"
web -> api "Calls" "JSON/HTTPS"
api -> db "Reads/writes" "SQL"
api -> queue "Publishes events" "AMQP"
controller -> service "Delegates to"
service -> repo "Uses"
```

---

## View Types

### System Context (Level 1)

```
views {
  systemContext sys "Context" "Description" {
    include *
    autoLayout
  }
}
```

### Container (Level 2)

```
views {
  container sys "Containers" "Description" {
    include *
    autoLayout lr
  }
}
```

`autoLayout` directions: `tb` (top-bottom, default), `bt`, `lr` (left-right), `rl`

### Component (Level 3)

```
views {
  component api "Components" "Description" {
    include *
    autoLayout
  }
}
```

### Dynamic (numbered interaction flow)

```
views {
  dynamic sys "Login" "Login flow" {
    user -> web "Opens browser"
    web -> api "POST /login"
    api -> db "SELECT user"
    autoLayout
  }
}
```

### Deployment (infrastructure)

```
model {
  prod = deploymentEnvironment "Production" {
    deploymentNode "AWS" {
      deploymentNode "ECS" "Container cluster" "Amazon ECS" {
        containerInstance web
        containerInstance api
      }
      deploymentNode "RDS" "Managed DB" "Amazon RDS" {
        containerInstance db
      }
    }
  }
}
views {
  deployment * prod "Deployment" {
    include *
    autoLayout
  }
}
```

---

## Styles

Inside `views { styles { ... } }`:

```
styles {
  element "Person" {
    shape Person
    background "#08427b"
    color "#ffffff"
  }
  element "Database" {
    shape Cylinder
  }
  element "Queue" {
    shape Pipe
  }
  element "External" {
    background "#999999"
    color "#ffffff"
  }
  relationship "Relationship" {
    dashed false
    thickness 2
  }
}
```

Built-in shape names: `Box`, `Circle`, `Component`, `Cylinder`, `Ellipse`, `Hexagon`, `Person`, `Pipe`, `RoundedBox`, `WebBrowser`, `MobileDeviceLandscape`, `MobileDevicePortrait`

---

## Tags

Tags enable grouping and targeted styling:

```
db = container "Database" "Stores data" "PostgreSQL" {
    tags "Database" "Persistent"
}
# Then style by tag:
# element "Database" { shape Cylinder }
```

Elements inherit a default tag matching their type (`Person`, `Software System`, `Container`, `Component`).

---

## Examples

### Level 1 — System Context

```
workspace "Online Banking" "System context view" {
  model {
    customer = person "Customer" "A bank customer with an account"
    banking = softwareSystem "Online Banking System" "Allows customers to view balances and make payments"
    email = softwareSystem "Email System" "Sends transactional emails" {
        tags "External"
    }
    mainframe = softwareSystem "Core Banking" "Stores account data and transactions" {
        tags "External"
    }

    customer -> banking "Views balances, makes payments" "HTTPS"
    banking -> email "Sends notifications" "SMTP"
    banking -> mainframe "Reads/writes account data" "XML/HTTPS"
  }
  views {
    systemContext banking "Context" {
      include *
      autoLayout
    }
    styles {
      element "External" { background "#999999"; color "#ffffff" }
      element "Person" { shape Person }
    }
  }
}
```

### Level 2 — Container

```
workspace "Online Banking" "Container view" {
  model {
    customer = person "Customer" "A bank customer"
    mainframe = softwareSystem "Core Banking" "Legacy mainframe" {
        tags "External"
    }

    banking = softwareSystem "Online Banking System" "Online banking platform" {
      spa = container "Single-Page App" "Provides banking UI" "React"
      api = container "API Gateway" "Routes requests, handles auth" "Node.js Express"
      accounts = container "Accounts Service" "Manages account logic" "Java Spring Boot"
      db = container "Database" "Stores users and transactions" "PostgreSQL" {
          tags "Database"
      }
      queue = container "Event Bus" "Async event processing" "RabbitMQ" {
          tags "Queue"
      }
    }

    customer -> spa "Uses" "HTTPS"
    spa -> api "Calls" "JSON/HTTPS"
    api -> accounts "Routes requests" "gRPC"
    accounts -> db "Reads/writes" "SQL"
    accounts -> queue "Publishes events" "AMQP"
    accounts -> mainframe "Syncs account data" "XML/HTTPS"
  }
  views {
    container banking "Containers" {
      include *
      autoLayout lr
    }
    styles {
      element "Database" { shape Cylinder }
      element "Queue" { shape Pipe }
      element "External" { background "#999999"; color "#ffffff" }
      element "Person" { shape Person }
    }
  }
}
```

### Level 3 — Component

```
workspace "Accounts Service" "Component view" {
  model {
    db = softwareSystem "Database" "PostgreSQL" { tags "External" }
    queue = softwareSystem "Event Bus" "RabbitMQ" { tags "External" }

    accounts = softwareSystem "Accounts Service" "Java Spring Boot" {
      api = container "Accounts Service" "Business logic and data access" "Spring Boot" {
        controller = component "Account Controller" "Handles HTTP requests" "Spring MVC"
        service = component "Account Service" "Business logic and validation" "Spring Bean"
        repo = component "Account Repository" "Data access layer" "Spring Data JPA"
        publisher = component "Event Publisher" "Publishes domain events" "Spring AMQP"
      }
    }

    controller -> service "Delegates to"
    service -> repo "Uses"
    service -> publisher "Publishes events via"
    repo -> db "Reads/writes" "JDBC"
    publisher -> queue "Sends messages" "AMQP"
  }
  views {
    component api "Components" {
      include *
      autoLayout
    }
    styles {
      element "External" { background "#999999"; color "#ffffff" }
    }
  }
}
```

---

## CLI Export

```bash
# Validate DSL syntax
structurizr-cli validate -workspace diagram.dsl

# Export all views as SVG
structurizr-cli export -workspace diagram.dsl -format svg -output ./out/

# Export as PNG
structurizr-cli export -workspace diagram.dsl -format png -output ./out/

# Export as PlantUML (for further tooling)
structurizr-cli export -workspace diagram.dsl -format plantuml -output ./out/
```

---

## Mermaid vs Structurizr — When to Use

| Need | Use |
|---|---|
| Quick inline preview in chat | Mermaid |
| Export PNG/SVG for docs/wiki | Structurizr |
| Multiple views from one model | Structurizr |
| Dynamic / numbered interaction flow | Either (`C4Dynamic` or Structurizr `dynamic`) |
| Deployment / infrastructure view | Structurizr (Mermaid `C4Deployment` is limited) |
| Class/method level detail (Level 4) | Mermaid `classDiagram` — no Structurizr equivalent |
| No tooling available | Mermaid |
