---
name: example-mapping
description: >
  Clarify a user story's acceptance criteria with Example Mapping before development.
  Use for BDD discovery workshops, example mapping, rules, concrete examples, open
  questions, and story-scope conversations; do not use to write Gherkin or automate
  tests unless that is also requested.
---

# Example Mapping

Use Example Mapping to make a story's scope and acceptance criteria concrete before
development. Keep the conversation about behaviour, not implementation.

## Map the story

1. Put the user story at the top of the map.
2. Capture each acceptance rule or constraint beneath it.
3. Add concrete examples under the rule they illustrate. Include boundary and failure
   cases when they materially change behaviour.
4. Record unanswered questions and explicit assumptions separately; do not invent an
   answer to keep the session moving.
5. Split out newly discovered work that is outside the story's scope.

Use this compact layout in a document, whiteboard, or cards:

```text
Story: [yellow]
  Rule: [blue]
    Example: [green]
    Example: [green]
  Question / assumption: [red]
Deferred story: [separate]
```

## Finish with a decision

The story is ready when the group can state its rules, illustrate them with examples,
and resolve or consciously accept every open question. Otherwise, leave the question
visible and defer the story or its affected slice. Turn the agreed examples into
acceptance tests only when requested.

## Keep it small

Time-box the conversation. If it exposes many rules or unresolved questions, split the
story rather than extending the map into a specification.

## Source

Based on Cucumber's [Example Mapping guide](https://cucumber.io/docs/bdd/example-mapping/).
