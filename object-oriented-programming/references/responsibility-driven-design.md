# Responsibility-Driven Design

Design by asking what each object knows, what it does, and who it decides for. Use when
the question is "where does this behaviour belong?" before applying SOLID or patterns.

## Role stereotypes

| Stereotype         | Responsibility                                              | Typical smell when overloaded                  |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------------- |
| Information holder | Knows and provides facts                                    | Anemic bag of getters with all logic elsewhere |
| Structurer         | Maintains relationships between objects                     | Also performs business decisions               |
| Service provider   | Does work on request, stateless-ish                         | Becomes a catch-all "Manager"                  |
| Coordinator        | Reacts to events, delegates work onward                     | Starts making the decisions itself             |
| Controller         | Makes decisions, directs others                             | Dominating controller (see below)              |
| Interfacer         | Translates between the system and the outside (UI, DB, API) | Leaks external types inward                    |

Label every class with the one or two stereotypes it plays. A class that needs four labels
is a candidate to split. Interfacers are where ports and adapters live.

## Control styles

| Style       | Shape                                             | Trade-off                                             |
| ----------- | ------------------------------------------------- | ----------------------------------------------------- |
| Centralized | One controller decides, others are data holders   | Simple to read; grows into a god object; poor reuse   |
| Delegated   | Controller hands decisions to a few collaborators | Balanced; usual target                                |
| Dispersed   | Many small objects each decide locally            | Flexible and cohesive; harder to trace the whole flow |

Prefer delegated. Move towards dispersed when logic follows the data (Tell, Don't Ask).
Retreat to centralized for short, linear workflows where tracing matters more than reuse.

### Spotting a dominating controller

- Calls many getters on its collaborators and decides for them.
- Other classes have only fields and accessors.
- Changing one rule touches the controller every time.

Fix: ask what each collaborator could decide using its own data, and push that decision
in as a method.

## Finding responsibilities

1. Take a user story or use case; list the steps as verbs.
2. Assign each verb to the object that already holds the needed information.
3. If no object has it, introduce a role (not necessarily a class yet) and name it after
   the responsibility.
4. Check collaborations: a responsibility that needs five collaborators is too big or
   misplaced.
5. Write the contract for each collaboration (see design-by-contract.md): what the client
   must provide, what the server guarantees.

## Collaboration checks

- Prefer few, stable collaborations; each is a coupling to maintain.
- Make a collaborator's role explicit through an interface named for the role, not for the
  implementer.
- Keep the object's public surface to what clients need; everything else is private.
- Names carry responsibility: if you cannot name a class without "And", "Manager", or
  "Helper", the responsibility is unclear.

Source: Wirfs-Brock and McKean, "Object Design: Roles, Responsibilities, and
Collaborations" (role stereotypes, control styles, contracts).
