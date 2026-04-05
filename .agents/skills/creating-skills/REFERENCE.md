# Creating Skills - Reference Guide

Detailed technical specifications, examples, and troubleshooting for the creating-skills skill.

## Table of Contents

1. [Template Selection Guide](#template-selection-guide)
2. [Customization Guide](#customization-guide)
3. [Frontmatter Specifications](#frontmatter-specifications)
4. [Validation Tool](#validation-tool)
5. [Complete Example Walkthrough](#complete-example-walkthrough)
6. [Template Structures](#template-structures)
7. [Troubleshooting](#troubleshooting)

## Template Selection Guide

### Simple Template

**Use when:**
- Single, focused functionality
- Under 300 lines of content
- No need for extensive documentation
- No automation scripts required
- Straightforward workflow
- 2-5 main tasks

**Best for:**
- Code formatting/linting
- File conversion
- Simple analysis
- Validation tasks
- Quick transformations

**Structure:**
```
skill-name/
└── SKILL.md
```

**Example:** Code Reviewer (examples/simple-skill-example/)

### Complex Template

**Use when:**
- Multiple related capabilities
- Requires detailed technical documentation
- Benefits from report/output templates
- Needs automation scripts
- Complex workflows with many steps
- Domain-specific knowledge required

**Best for:**
- Data analysis with multiple methods
- Report generation with templates
- Multi-step automation
- Industry-specific workflows
- Integration with external tools (via scripts)

**Structure:**
```
skill-name/
├── SKILL.md          # Main entry point (<500 lines)
├── REFERENCE.md      # Detailed documentation
├── FORMS.md          # Templates and output formats
└── scripts/
    └── process.py    # Automation utilities
```

**Example:** Data Analyzer (examples/complex-skill-example/)

### Decision Matrix

| Criteria | Simple | Complex |
|----------|--------|---------|
| Number of main tasks | 2-5 | 5+ |
| Expected SKILL.md length | <300 lines | >300 lines |
| Technical depth | Basic | Advanced |
| Need templates | No | Yes |
| Need scripts | No | Yes |
| Documentation needs | Minimal | Extensive |
| Domain knowledge | General | Specialized |

## Customization Guide

### Editing Simple Template

**1. Update Frontmatter:**
```yaml
---
name: your-skill-name  # Use gerund form: processing-, analyzing-, etc.
description: What it does. Use when triggers.
---
```

**2. Edit Title:**
```markdown
# Your Skill Title
```

**3. Fill "When to Use" Section:**
```markdown
## When to Use This Skill

Invoke this skill when the user:
- [Specific condition 1]
- [Specific condition 2]
- [Mentions keywords: keyword1, keyword2]
```

**4. Define Core Functionality:**
```markdown
## Core Functionality

### Main Task 1

[Instructions]

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Output:**
[Description]
```

**5. Add Common Patterns:**
```markdown
## Common Patterns

**Pattern 1: [Name]**
- **When to use:** [Scenario]
- **Approach:** [How to handle]
```

**6. Include Error Handling:**
```markdown
## Error Handling

**Common Issue 1: [Issue]**
- **Cause:** [Why]
- **Solution:** [How to fix]
```

**7. Provide Examples:**
```markdown
## Examples

**Example 1: [Scenario]**

Input: [What user provides]

Process:
1. [What you do]
2. [What you do]

Output: [What you deliver]
```

**8. Add Validation Checklist:**
```markdown
## Validation Checklist

Before completing:
- [ ] [Check 1]
- [ ] [Check 2]
- [ ] [Output meets requirements]
```

### Editing Complex Template

**1-8. Same as Simple Template for SKILL.md**

**9. Edit REFERENCE.md:**
- Add table of contents (required if >100 lines)
- Document advanced methodology
- Include technical specifications
- Provide detailed algorithm descriptions
- Add troubleshooting guide

**10. Edit FORMS.md:**
- Create output templates
- Add configuration examples
- Include report formats
- Provide usage examples for each template

**11. Create Scripts:**
- Add shebang line (#!/usr/bin/env python3)
- Include argument parsing
- Add error handling
- Provide --help documentation
- Use only pre-installed packages

### Progressive Disclosure Pattern

**SKILL.md Structure:**
```markdown
## Basic Task
[Instructions for common case]

## Advanced Scenarios
For complex cases involving [X], see REFERENCE.md section [Y].

## Using Templates
See FORMS.md for available templates.

## Automation
Use the provided script:
```bash
python scripts/process.py input.txt
```
```

**REFERENCE.md Structure:**
```markdown
# Skill Name Reference

## Table of Contents
1. [Advanced Topic 1](#advanced-topic-1)
2. [Advanced Topic 2](#advanced-topic-2)

## Advanced Topic 1
[Detailed technical content]

## Advanced Topic 2
[Detailed technical content]
```

**FORMS.md Structure:**
```markdown
# Skill Name Templates

## Template 1: [Name]
**Purpose:** [Description]
**Template:**
```markdown
[Template content]
```
```

## Frontmatter Specifications

### Required Fields

**name:**
- **Format:** Lowercase letters, numbers, hyphens only
- **Length:** Maximum 64 characters
- **Pattern:** Must match `^[a-z0-9-]+$`
- **Convention:** Use gerund form (verb + -ing)
- **No:** Underscores, spaces, uppercase, special characters

✅ **Good Examples:**
- `processing-invoices`
- `analyzing-logs`
- `generating-reports`
- `debugging-api-calls`
- `formatting-json`
- `reviewing-code`

❌ **Bad Examples:**
- `invoice_processor` (underscores)
- `InvoiceProcessor` (uppercase)
- `LogAnalyzer` (uppercase, no gerund)
- `helper` (vague, no gerund)
- `utils` (vague, no gerund)
- `data-stuff` (vague, unprofessional)

**description:**
- **Format:** Plain text string
- **Length:** Maximum 1024 characters
- **Required Content:** What the skill does + when to use it
- **Tone:** Third person
- **Must Include:** Specific triggers

✅ **Good Examples:**
```yaml
description: Analyzes code quality, identifies bugs, suggests improvements, and checks adherence to best practices. Use when the user asks for code review, quality check, or mentions reviewing code.
```

```yaml
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

```yaml
description: Formats and validates JSON data with proper indentation and syntax checking. Use when the user needs to format JSON, validate JSON syntax, or mentions JSON formatting.
```

❌ **Bad Examples:**
```yaml
description: Helps with code.  # Too vague, no triggers
```

```yaml
description: A utility for processing data files.  # Vague, no specific triggers
```

### Prohibited Content

**In Frontmatter:**
- ❌ XML tags (e.g., `<tag>`, `</tag>`)
- ❌ Reserved word: "anthropic"
- ❌ Reserved word: "claude"

**Why?**
- Reserved words may conflict with system functionality
- XML tags can cause parsing issues
- Keep frontmatter clean and simple

### Optional Fields

While only `name` and `description` are required, you can add custom fields:

```yaml
---
name: skill-name
description: What it does. Use when triggers.
version: 1.0
author: Your Name
tags: [analysis, data, automation]
---
```

Note: Custom fields won't be validated or used by the system, but can help with documentation.

## Validation Tool

### Basic Usage

**Validate a file:**
```bash
python scripts/validate_skill.py path/to/SKILL.md
```

**Validate a directory:**
```bash
python scripts/validate_skill.py path/to/skill-directory/
```

**Strict mode (best practices):**
```bash
python scripts/validate_skill.py path/to/SKILL.md --strict
```

### What It Checks

**Frontmatter Validation:**
- YAML syntax is correct
- Required fields present (name, description)
- Name format: lowercase-with-hyphens, ≤64 chars
- Description length: ≤1024 chars
- No XML tags
- No reserved words ("anthropic", "claude")
- Gerund form naming (strict mode only)

**Content Validation:**
- File length warnings (>500 lines)
- "When to Use This Skill" section present
- Examples included (strict mode)
- Validation checklists present

**Structure Validation:**
- Referenced files exist
- REFERENCE.md has table of contents (if >100 lines)
- Scripts have shebang lines
- One-level-deep references

### Exit Codes

- `0`: Validation passed (no errors)
- `1`: Validation failed (errors found)

Warnings don't cause failure, only errors.

### Example Output

**Success:**
```
Validating: my-skill/SKILL.md
==================================================

ℹ️  INFO:
  • Contains validation checklists - good practice!

✅ VALIDATION PASSED!
Skill meets all requirements.
```

**With Warnings:**
```
Validating: my-skill/SKILL.md
==================================================

⚠️  WARNINGS:
  • Field 'name' should use gerund form (verb + -ing)
  • SKILL.md has 524 lines, exceeding recommended maximum of 500

ℹ️  INFO:
  • Found REFERENCE.md - good for complex skills

==================================================
Found: 2 warning(s)

No errors found, but consider addressing warnings.
```

**With Errors:**
```
Validating: my-skill/SKILL.md
==================================================

❌ ERRORS:
  • Required field 'name' is missing from frontmatter
  • Field 'description' exceeds maximum length of 1024 characters

⚠️  WARNINGS:
  • Missing 'When to Use This Skill' section

==================================================
Found: 2 error(s), 1 warning(s)

Please fix errors before using this skill.
```

### Validation in CI/CD

```bash
#!/bin/bash
# Validate all skills

for skill in skills/*/SKILL.md; do
    python scripts/validate_skill.py "$skill" --strict
    if [ $? -ne 0 ]; then
        echo "Validation failed for $skill"
        exit 1
    fi
done

echo "All skills validated successfully!"
```

## Complete Example Walkthrough

### Creating a JSON Formatter Skill

**User Request:** "I want a skill that formats JSON data"

#### Step 1: Gather Requirements

**Q: What should the skill be called?**
A: `formatting-json`

**Q: What does it do?**
A: "Formats and validates JSON data with proper indentation and syntax checking. Use when the user needs to format JSON, validate JSON syntax, or mentions JSON formatting."

**Q: Simple or complex?**
A: Simple (single focused task)

**Q: Core functionality?**
A: Validate JSON syntax, format with indentation, detect errors

#### Step 2: Copy Template

```bash
cp -r templates/simple-skill-template/ ../formatting-json/
cd ../formatting-json/
```

#### Step 3: Edit SKILL.md

**Frontmatter:**
```yaml
---
name: formatting-json
description: Formats and validates JSON data with proper indentation and syntax checking. Use when the user needs to format JSON, validate JSON syntax, or mentions JSON formatting.
---
```

**Title:**
```markdown
# JSON Formatter
```

**When to Use:**
```markdown
## When to Use This Skill

Invoke this skill when the user:
- Asks to format JSON data
- Needs to validate JSON syntax
- Wants to prettify or minify JSON
- Mentions JSON formatting or validation
```

**Core Functionality:**
```markdown
## Core Functionality

### Validate JSON Syntax

**Steps:**
1. Parse the JSON string
2. Check for syntax errors
3. Report specific error location if invalid
4. Confirm validity if correct

**Expected Output:**
Confirmation of validity or specific error message

### Format JSON with Indentation

**Steps:**
1. Parse JSON string
2. Format with specified indentation (default: 2 spaces)
3. Sort keys (optional)
4. Output formatted result

**Expected Output:**
Clean, indented JSON that's easy to read
```

**Common Patterns:**
```markdown
## Common Patterns

**Pattern 1: Pretty Print**
- **When to use:** User has minified JSON
- **Approach:** Parse and format with 2-space indentation

**Pattern 2: Minify**
- **When to use:** User needs compact JSON
- **Approach:** Remove all unnecessary whitespace

**Pattern 3: Validate and Fix**
- **When to use:** User has potentially invalid JSON
- **Approach:** Identify errors, suggest corrections
```

**Error Handling:**
```markdown
## Error Handling

**Common Issue 1: Invalid JSON Syntax**
- **Cause:** Missing quotes, commas, brackets
- **Solution:** Report exact error location and expected character

**Common Issue 2: Encoding Issues**
- **Cause:** Special characters not properly escaped
- **Solution:** Show correct escaping format
```

**Examples:**
```markdown
## Examples

**Example 1: Format Minified JSON**

Input: `{"name":"John","age":30,"city":"NYC"}`

Process:
1. Parse the JSON string
2. Format with 2-space indentation
3. Output formatted result

Output:
```json
{
  "name": "John",
  "age": 30,
  "city": "NYC"
}
```

**Example 2: Validate Invalid JSON**

Input: `{"name": "John" "age": 30}`

Process:
1. Attempt to parse JSON
2. Catch syntax error
3. Identify error location

Output: Error at position 15: Expected ',' or '}' after property value
```

**Validation Checklist:**
```markdown
## Validation Checklist

Before completing:
- [ ] JSON parsed successfully or error identified
- [ ] Proper indentation applied (if formatting)
- [ ] Syntax errors clearly reported (if invalid)
- [ ] Output is valid JSON
```

#### Step 4: Validate

```bash
python ../skill-creator/scripts/validate_skill.py SKILL.md --strict
```

Output:
```
Validating: SKILL.md
==================================================

ℹ️  INFO:
  • Contains validation checklists - good practice!

✅ VALIDATION PASSED!
Skill meets all requirements.
```

#### Step 5: Test

Place in skills directory and test with:
- Valid JSON
- Invalid JSON
- Minified JSON
- Already formatted JSON

## Template Structures

### Simple Template Structure

```markdown
---
name: your-skill-name
description: Brief description. Use when triggers.
---

# Your Skill Title

Brief 1-2 sentence overview.

## When to Use This Skill

Invoke this skill when the user:
- [Condition 1]
- [Condition 2]
- [Condition 3]

## Core Functionality

### Main Task 1

[Instructions]

**Steps:**
1. [Step 1]
2. [Step 2]

**Expected Output:**
[Description]

### Main Task 2

[Instructions]

**Steps:**
1. [Step 1]
2. [Step 2]

**Expected Output:**
[Description]

## Common Patterns

**Pattern 1: [Name]**
- **When to use:** [Scenario]
- **Approach:** [Approach]

**Pattern 2: [Name]**
- **When to use:** [Scenario]
- **Approach:** [Approach]

## Error Handling

**Common Issue 1: [Issue]**
- **Cause:** [Why]
- **Solution:** [Fix]

**Common Issue 2: [Issue]**
- **Cause:** [Why]
- **Solution:** [Fix]

## Validation Checklist

Before completing:
- [ ] [Check 1]
- [ ] [Check 2]
- [ ] [Check 3]
- [ ] Output meets requirements

## Examples

**Example 1: [Scenario]**

Input: [Input]

Process:
1. [Step]
2. [Step]

Output: [Output]

## Additional Notes

[Any other important information]
```

### Complex Template Structure

See templates/complex-skill-template/ for complete multi-file structure with:
- SKILL.md: Main workflow with progressive disclosure
- REFERENCE.md: Technical specifications and advanced methods
- FORMS.md: Output templates and examples
- scripts/process.py: Automation utilities

## Troubleshooting

### Validation Errors

**Error: "No YAML frontmatter found"**
- **Cause:** File doesn't start with `---`
- **Solution:** Add frontmatter at the very beginning of the file

**Error: "Invalid YAML syntax"**
- **Cause:** Malformed YAML in frontmatter
- **Solution:** Check for proper indentation, quotes, colons

**Error: "Required field 'name' is missing"**
- **Cause:** Frontmatter doesn't have `name` field
- **Solution:** Add `name: your-skill-name` to frontmatter

**Error: "Field 'name' must contain only lowercase letters, numbers, and hyphens"**
- **Cause:** Name has uppercase, underscores, or special characters
- **Solution:** Use lowercase-with-hyphens format

**Error: "Frontmatter contains reserved word"**
- **Cause:** Description includes "anthropic" or "claude"
- **Solution:** Rephrase to avoid these words

### Structural Issues

**Warning: "SKILL.md has XXX lines, exceeding recommended maximum of 500"**
- **Cause:** File is too long
- **Solution:** Split into SKILL.md + REFERENCE.md
  1. Keep main workflow in SKILL.md
  2. Move technical details to REFERENCE.md
  3. Add references: "See REFERENCE.md section [X]"

**Warning: "Referenced file not found"**
- **Cause:** SKILL.md references a file that doesn't exist
- **Solution:** Create the referenced file or remove the reference

**Warning: "REFERENCE.md missing table of contents"**
- **Cause:** REFERENCE.md is >100 lines without TOC
- **Solution:** Add table of contents at the beginning

### Content Issues

**Warning: "Missing 'When to Use This Skill' section"**
- **Cause:** No section explaining when to invoke the skill
- **Solution:** Add "## When to Use This Skill" section

**Warning: "Field 'name' should use gerund form"**
- **Cause:** Name doesn't use verb + -ing pattern
- **Solution:** Rename to gerund form (e.g., "data-processor" → "processing-data")

### Best Practices

**Keep SKILL.md concise:**
- Only include information Claude doesn't already know
- Move detailed technical specs to REFERENCE.md
- Use progressive disclosure

**Use consistent terminology:**
- Choose one term and stick with it
- Don't mix "endpoint", "URL", and "path"

**Include specific examples:**
- Show concrete inputs and outputs
- Demonstrate common use cases

**Add validation checklists:**
- Help ensure quality outputs
- Catch errors before completion

**Test thoroughly:**
- Try various inputs
- Test edge cases
- Verify token efficiency
