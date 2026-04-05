---
name: ports-adapters-architecture
description: Explain Ports & Adapters architecture by the book from Allistair Cockburn. Also known as "Hexagonal Architecture"
---

# Ports and Adapters explained

## Directory structure

- one directory for app business logic and the ports definitions
- one for the test cases
- one called Driving/Primary Adapters
- one called Driven/Secondary Adapters

### App

- one directory for the business logic (eg: domain)
- one directory for Driving/Primary Ports
- one directory for Driven/Secondary Ports

> Note: Ports are just interface here for typed programming language
> Note: Use `for_doing_doing_something` naming convention for driving ports
