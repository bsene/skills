# C4 Model — Mermaid Syntax Reference

## Diagram Types

```
C4Context      — Level 1: System Context
C4Container    — Level 2: Container
C4Component    — Level 3: Component
C4Dynamic      — Numbered interaction flow
C4Deployment   — Infrastructure mapping
```

---

## Elements

### People

```
Person(alias, "Label", "Description")
Person_Ext(alias, "Label", "Description")
```

### Systems (Level 1)

```
System(alias, "Label", "Description")
System_Ext(alias, "Label", "Description")
SystemDb(alias, "Label", "Description")
SystemDb_Ext(alias, "Label", "Description")
SystemQueue(alias, "Label", "Description")
SystemQueue_Ext(alias, "Label", "Description")
```

### Containers (Level 2)

```
Container(alias, "Label", "Technology", "Description")
ContainerDb(alias, "Label", "Technology", "Description")
ContainerQueue(alias, "Label", "Technology", "Description")
Container_Ext(alias, "Label", "Technology", "Description")
ContainerDb_Ext(alias, "Label", "Technology", "Description")
ContainerQueue_Ext(alias, "Label", "Technology", "Description")
```

### Components (Level 3)

```
Component(alias, "Label", "Technology", "Description")
ComponentDb(alias, "Label", "Technology", "Description")
ComponentQueue(alias, "Label", "Technology", "Description")
Component_Ext(alias, "Label", "Technology", "Description")
```

---

## Boundaries

```
Enterprise_Boundary(alias, "Label") {
  ...elements...
}
System_Boundary(alias, "Label") {
  ...elements...
}
Container_Boundary(alias, "Label") {
  ...elements...
}
Boundary(alias, "Label", "type") {
  ...elements...
}
```

---

## Relationships

```
Rel(from, to, "Label", "Technology")
BiRel(from, to, "Label", "Technology")
Rel_U(from, to, "Label", "Technology")   — upward
Rel_D(from, to, "Label", "Technology")   — downward
Rel_L(from, to, "Label", "Technology")   — leftward
Rel_R(from, to, "Label", "Technology")   — rightward
Rel_Back(from, to, "Label", "Technology")
```

For dynamic diagrams (numbered steps):
```
RelIndex(index, from, to, "Label")
```

---

## Styling

```
UpdateElementStyle(alias, $bgColor="blue", $fontColor="white", $borderColor="navy")
UpdateRelStyle(from, to, $textColor="red", $lineColor="red", $offsetX="-40", $offsetY="60")
UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## Examples

### Level 1 — System Context

```mermaid
C4Context
  title System Context — Online Banking

  Person(customer, "Customer", "A bank customer with an account")
  System(banking, "Online Banking System", "Allows customers to view balances and make payments")
  System_Ext(email, "Email System", "Sends transactional emails")
  System_Ext(mainframe, "Core Banking", "Stores account data and transactions")

  Rel(customer, banking, "Views balances, makes payments", "HTTPS")
  Rel(banking, email, "Sends notifications", "SMTP")
  Rel(banking, mainframe, "Reads/writes account data", "XML/HTTPS")
```

### Level 2 — Container

```mermaid
C4Container
  title Container — Online Banking System

  Person(customer, "Customer", "A bank customer")

  System_Boundary(banking, "Online Banking System") {
    Container(spa, "Single-Page App", "React", "Provides banking UI")
    Container(api, "API Gateway", "Node.js Express", "Routes requests, handles auth")
    Container(accounts, "Accounts Service", "Java Spring Boot", "Manages account logic")
    ContainerDb(db, "Database", "PostgreSQL", "Stores users and transactions")
    ContainerQueue(queue, "Event Bus", "RabbitMQ", "Async event processing")
  }

  System_Ext(mainframe, "Core Banking", "Legacy mainframe")

  Rel(customer, spa, "Uses", "HTTPS")
  Rel(spa, api, "Calls", "JSON/HTTPS")
  Rel(api, accounts, "Routes requests", "gRPC")
  Rel(accounts, db, "Reads/writes", "SQL")
  Rel(accounts, queue, "Publishes events", "AMQP")
  Rel(accounts, mainframe, "Syncs account data", "XML/HTTPS")
```

### Level 3 — Component

```mermaid
C4Component
  title Component — Accounts Service

  Container_Boundary(accounts, "Accounts Service") {
    Component(controller, "Account Controller", "Spring MVC", "Handles HTTP requests")
    Component(service, "Account Service", "Spring Bean", "Business logic and validation")
    Component(repo, "Account Repository", "Spring Data JPA", "Data access layer")
    Component(publisher, "Event Publisher", "Spring AMQP", "Publishes domain events")
  }

  ContainerDb(db, "Database", "PostgreSQL", "Stores accounts")
  ContainerQueue(queue, "Event Bus", "RabbitMQ", "Async events")

  Rel(controller, service, "Delegates to")
  Rel(service, repo, "Uses")
  Rel(service, publisher, "Publishes events via")
  Rel(repo, db, "Reads/writes", "JDBC")
  Rel(publisher, queue, "Sends messages", "AMQP")
```
