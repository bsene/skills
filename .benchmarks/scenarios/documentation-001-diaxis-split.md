---
id: documentation-001-diaxis-split
skill: documentation
---

# Prompt

Our docs are a mess. We have one giant page, "FastCart API Guide" (pasted below), and it serves everyone badly: junior engineers joining our team say they can't follow it, and external integrators who already ship code complain they have to scroll past beginner material to find what they need. Our goal is to cut support load for both audiences.

Restructure it. Audience and goal are as stated above. Deliver the new documentation set: the documents, their titles, and skeleton content for each.

Current page:

> # FastCart API Guide
>
> ## Getting Started
>
> Welcome! You'll learn how to connect your first store. First, what is an API key? An API key is a bearer credential... (300 words of conceptual background on auth). Create a file `config.js` and paste this... you should see a "connected" message.
>
> ## How to handle retries
>
> To handle retries, set `retry_policy` in your webhook config. Note that retries happen because distributed systems can fail... (200-word digression on eventual consistency). Then set `max_attempts`.
>
> ## Configuration Parameters
>
> `api_key` (string, required). Your credential. `retry_policy` (object, default null). `max_attempts` (integer, default 3). `timeout_ms` (integer, default 5000). `signature_header` (string, default "X-FastCart-Signature")... (full table)
>
> ## Why we sign webhooks
>
> We use HMAC signatures because... (400-word essay on replay attacks and signature schemes, with alternatives compared)

# Criteria

- [ ] Classifies the content into the four documentation types (tutorial, how-to guide, reference, explanation), naming the types or the Diátaxis framework
- [ ] Splits the single page into separate single-type documents rather than one mixed document
- [ ] Applies type-appropriate titles: verb-led for the tutorial, task-framed "How to..." for the how-to, thing-named for the reference, concept-framed for the explanation
- [ ] Strips conceptual digression out of the tutorial and the how-to steps and moves it to a linked explanation page (tutorial maximizes doing; how-to assumes baseline knowledge)
- [ ] Cross-links between the documents (e.g. tutorial → reference, how-to → explanation) instead of duplicating content inside them
- [ ] Does NOT respond with only clarifying questions or a requirements-gathering plan — the actual restructured doc set is delivered
