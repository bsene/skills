# Claude Agent Skills: Best Practices

This guide provides comprehensive best practices for authoring effective Claude Agent Skills based on Anthropic's official specifications.

## Core Principles

### 1. Conciseness is Critical

Skills share the context window with conversation history and other content. Every token counts.

**The Golden Rule:** Only include information Claude doesn't already possess.

**Ask yourself:** "Does Claude really need this explanation?"

**Examples:**

❌ **Don't include:**
```markdown
Python is a programming language. To install packages, use pip.
Functions are defined with the def keyword.
```

✅ **Do include:**
```markdown
Use the custom `validate_data()` function from utils/validators.py
The API expects ISO-8601 timestamps with timezone offset
```

**Token Budget:**
- Frontmatter: ~100 tokens (always loaded)
- SKILL.md: <5,000 tokens (loaded on trigger)
- Reference files: Variable (loaded on demand)
- Keep main SKILL.md under 500 lines for complex skills

### 2. Progressive Disclosure Architecture

Load information in stages to minimize context usage.

**Level 1: Metadata (Always Loaded)**
```yaml
---
name: skill-name
description: Brief description. Use when specific triggers.
---
```

**Level 2: Main Instructions (Triggered)**
- Core workflows
- Common patterns
- Basic examples
- References to Level 3 content

**Level 3: Detailed Resources (On-Demand)**
- Comprehensive examples
- Edge cases
- Technical specifications
- Executable scripts

**Implementation Pattern:**

```markdown
## Data Processing

For standard CSV files, parse with pandas and validate schemas.

For complex scenarios (nested JSON, XML, custom formats), see REFERENCE.md
for detailed parsing strategies.

For automated processing, use `scripts/process_data.py`:
```bash
python scripts/process_data.py input.csv --validate
```
```

### 3. Appropriate Freedom Levels

Match specificity to task fragility and variation tolerance.

**High Freedom (Text Instructions)**
- Use for: Flexible approaches with multiple valid solutions
- Format: Natural language descriptions
- Example: "Analyze the code for security vulnerabilities and suggest improvements"

**Medium Freedom (Pseudocode)**
- Use for: Preferred patterns with some flexibility
- Format: Structured steps with guidelines
- Example:
  ```
  1. Load data from source
  2. Validate schema (all required fields present)
  3. Transform according to business rules
  4. Generate output in requested format
  ```

**Low Freedom (Executable Scripts)**
- Use for: Error-prone operations requiring exact execution
- Format: Runnable code
- Example: Binary file manipulation, complex API authentication, precise formatting

**Selection Guide:**
- Creative tasks → High freedom
- Standard workflows → Medium freedom
- Brittle operations → Low freedom

## Frontmatter Specifications

### Required Fields

```yaml
---
name: skill-name
description: Description text here.
---
```

### Field Requirements

**name:**
- Maximum 64 characters
- Lowercase letters, numbers, hyphens only
- No underscores, spaces, or special characters
- Use gerund form (verb + -ing)

✅ Good names:
- `processing-invoices`
- `analyzing-logs`
- `generating-reports`
- `debugging-api-calls`

❌ Bad names:
- `invoice_processor` (underscores)
- `LogAnalyzer` (uppercase)
- `helper` (vague)
- `utils` (non-descriptive)
- `data-stuff` (unprofessional)

**description:**
- Maximum 1024 characters
- Non-empty
- Write in third person
- Include specific triggers
- Format: "[What it does]. Use when [conditions]."

✅ Good description:
```yaml
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, document extraction, or PDF manipulation.
```

❌ Bad description:
```yaml
description: Helps with PDFs.
```

**Prohibited content:**
- XML tags
- Reserved words: "anthropic", "claude"
- Time-sensitive conditionals (e.g., "after 2024")

## Content Organization

### File Structure

**Simple Skill (Single File):**
```
skill-name/
└── SKILL.md
```

**Complex Skill (Multi-File):**
```
skill-name/
├── SKILL.md          # Entry point, <500 lines
├── REFERENCE.md      # Detailed docs
├── FORMS.md          # Templates
└── scripts/
    ├── process.py
    └── validate.sh
```

### SKILL.md Structure Template

```markdown
---
name: skill-name
description: Clear description. Use when triggers.
---

# Skill Title

Brief 1-2 sentence overview of what this skill does.

## When to Use This Skill

Invoke this skill when the user:
- [Specific condition 1]
- [Specific condition 2]
- [Mentions keywords: keyword1, keyword2]

## Core Functionality

### Main Task 1

[Instructions]

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Validation:**
- [ ] [Check 1]
- [ ] [Check 2]

### Main Task 2

[Instructions]

## Common Patterns

**Pattern 1: [Name]**
When to use: [Scenario]
Implementation: [Approach]

**Pattern 2: [Name]**
When to use: [Scenario]
Implementation: [Approach]

## Error Handling

**Error Type 1:** [How to handle]
**Error Type 2:** [How to handle]

## Examples

[Concrete examples of usage]

## Advanced Usage

For [complex scenario], see REFERENCE.md section [X].
For [templates], see FORMS.md.
For [automation], use `scripts/utility.py`.
```

### Reference File Guidelines

**When to create REFERENCE.md:**
- SKILL.md exceeds 400 lines
- Detailed technical specs needed
- Multiple domain-specific sections
- Extensive examples required

**REFERENCE.md structure:**
```markdown
# Skill Name Reference

## Table of Contents
(Required if >100 lines)

1. [Section 1](#section-1)
2. [Section 2](#section-2)

## Section 1

[Detailed content]

## Section 2

[Detailed content]
```

**Keep references one-level deep:**
- SKILL.md can reference REFERENCE.md
- REFERENCE.md should not reference other files
- Ensures complete file reads

## Writing Style Guidelines

### 1. Consistent Terminology

Choose one term and stick with it throughout all files.

❌ Inconsistent:
```markdown
Call the API endpoint...
Use the URL to fetch...
The API path requires...
```

✅ Consistent:
```markdown
Call the API endpoint...
Use the endpoint to fetch...
The endpoint requires...
```

### 2. Avoid Time-Sensitive Information

❌ Don't use:
```markdown
If the current year is before 2024, use method A.
If after 2024, use method B.
```

✅ Do use:
```markdown
## Current Pattern
Use method B for all new implementations.

## Legacy Pattern
Method A is deprecated but may appear in older codebases.
```

### 3. Action-Oriented Language

Use clear, directive language that guides Claude's actions.

❌ Passive/Vague:
```markdown
The data should probably be validated.
It might be good to check for errors.
```

✅ Active/Clear:
```markdown
Validate the data before processing.
Check for errors after each API call.
```

### 4. Structured Workflows

Break complex operations into sequential steps with validation.

**Template:**
```markdown
## [Task Name]

**Objective:** [What this accomplishes]

**Prerequisites:**
- [ ] [Requirement 1]
- [ ] [Requirement 2]

**Steps:**
1. [Action 1]
   - Expected result: [What should happen]
   - If error: [How to handle]

2. [Action 2]
   - Expected result: [What should happen]
   - If error: [How to handle]

3. [Action 3]
   - Expected result: [What should happen]
   - If error: [How to handle]

**Validation:**
- [ ] [Verify outcome 1]
- [ ] [Verify outcome 2]

**Common Issues:**
- Issue: [Problem]. Solution: [Fix]
```

## Script Best Practices

### Runtime Constraints

Scripts must work within these limitations:
- No network access or external API calls
- No runtime package installation (pip install, npm install)
- Only pre-installed packages available
- No persistent state between executions

### Script Structure

```python
#!/usr/bin/env python3
"""
Brief description of what this script does.

Usage:
    python script_name.py <input> [options]

Examples:
    python script_name.py data.json --validate
"""

import sys
import json  # Only use standard library or pre-installed packages

def main():
    """Main entry point with clear error handling."""
    if len(sys.argv) < 2:
        print("Usage: python script_name.py <input> [options]")
        sys.exit(1)
    
    try:
        # Implementation
        result = process_input(sys.argv[1])
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### Script Integration in SKILL.md

```markdown
## Automated Processing

Use the provided script for batch operations:

```bash
python scripts/process.py input.csv --format json
```

The script validates input and outputs structured data.
See `scripts/process.py --help` for all options.
```

## Testing and Validation

### Pre-Deployment Checklist

Before using a skill:

**Frontmatter:**
- [ ] Valid YAML syntax
- [ ] `name` field: lowercase-with-hyphens, ≤64 chars
- [ ] `description` field: ≤1024 chars, includes triggers
- [ ] No XML tags or reserved words
- [ ] Uses gerund form naming

**Content:**
- [ ] Clear "When to Use" section
- [ ] Structured workflows with steps
- [ ] Validation checklists where appropriate
- [ ] Consistent terminology
- [ ] No time-sensitive information
- [ ] Examples included

**Structure:**
- [ ] SKILL.md under 500 lines (or properly split)
- [ ] References are one-level deep
- [ ] Table of contents if files >100 lines
- [ ] Scripts use only available packages

**Quality:**
- [ ] Concise (no unnecessary Claude knowledge)
- [ ] Appropriate freedom level
- [ ] Error handling included
- [ ] Tested with sample inputs

### Multi-Model Testing

Test skills across Claude models:

**Claude Haiku:**
- Fast, efficient
- May need more explicit instructions
- Best for simple, well-defined tasks

**Claude Sonnet:**
- Balanced capability and speed
- Handles moderate complexity well
- Most common use case

**Claude Opus:**
- Advanced reasoning
- Handles complex, ambiguous tasks
- Higher cost, slower

Ensure your skill works effectively across all three models.

### Validation Script Usage

```bash
# Validate syntax and structure
python scripts/validate_skill.py path/to/SKILL.md

# Check for common issues
python scripts/validate_skill.py path/to/SKILL.md --strict

# Validate entire skill directory
python scripts/validate_skill.py path/to/skill-directory/
```

## Common Patterns

### Pattern 1: Simple Task Skill

**Use for:** Single, focused functionality

**Structure:**
- One SKILL.md file
- Clear workflow
- 2-5 main sections
- Under 200 lines

**Example:** Code formatting, file conversion, simple analysis

### Pattern 2: Multi-Domain Skill

**Use for:** Multiple related specializations

**Structure:**
```
skill-name/
├── SKILL.md (router/orchestrator)
├── DOMAIN_A.md (specific guidance)
├── DOMAIN_B.md (specific guidance)
└── DOMAIN_C.md (specific guidance)
```

**Example:** Industry-specific analysis (finance, sales, product)

### Pattern 3: Workflow Automation Skill

**Use for:** Multi-step processes with utilities

**Structure:**
```
skill-name/
├── SKILL.md (workflow guide)
├── REFERENCE.md (detailed specs)
└── scripts/
    ├── step1.py
    ├── step2.py
    └── orchestrate.sh
```

**Example:** Data pipeline, report generation, deployment automation

### Pattern 4: Reference-Heavy Skill

**Use for:** Tasks requiring extensive documentation

**Structure:**
```
skill-name/
├── SKILL.md (high-level guide, <300 lines)
├── REFERENCE.md (technical details, unlimited)
└── FORMS.md (templates and examples)
```

**Example:** API integration, framework usage, complex configuration

## Anti-Patterns to Avoid

### ❌ The Encyclopedia

**Problem:** Including general knowledge Claude already has

```markdown
# Python Programming

Python is a high-level programming language. Variables store data.
Functions are defined with def. Classes use the class keyword...
```

**Solution:** Only include domain-specific or non-standard information

### ❌ The Single Monster File

**Problem:** 2000-line SKILL.md that should be split

**Solution:** Use progressive disclosure with reference files

### ❌ The Vague Helper

**Problem:** Generic naming and unclear purpose

```yaml
name: data-helper
description: Helps with data stuff.
```

**Solution:** Specific naming and clear triggers

```yaml
name: processing-customer-invoices
description: Extracts, validates, and transforms customer invoice data from PDFs and CSVs. Use when working with invoices, billing data, or when user mentions invoice processing.
```

### ❌ The Time Bomb

**Problem:** Time-dependent conditionals

```markdown
If the year is 2024 or later, use API v2.
```

**Solution:** Version-based or feature-based conditionals

```markdown
For API v2 (current), use /v2/endpoint.
For legacy API v1, use /v1/endpoint.
```

### ❌ The Network Dreamer

**Problem:** Scripts that try to make network calls

```python
import requests
response = requests.get("https://api.example.com")
```

**Solution:** Work with local data only, document external requirements

### ❌ The Package Installer

**Problem:** Scripts that try to install dependencies

```python
import subprocess
subprocess.run(["pip", "install", "special-package"])
```

**Solution:** Use only pre-installed packages, document requirements

## Optimization Techniques

### 1. Conditional Loading

```markdown
## Basic Usage

[Standard workflow for common case]

## Advanced Scenarios

For edge cases involving [X], [Y], or [Z], see REFERENCE.md section 3.2.
```

### 2. Script Over Prose

When precise execution matters:

❌ 50 lines explaining algorithm
✅ 5 lines + `scripts/algorithm.py`

### 3. Template Reuse

Store reusable structures in FORMS.md:

```markdown
## API Request Template

See FORMS.md for the complete request structure.

```bash
cat FORMS.md | grep -A 20 "API Request Template"
```
```

### 4. Checklist Compression

❌ Verbose:
```markdown
First, you should check if the file exists.
Then, you need to verify it's readable.
After that, validate the format...
```

✅ Concise:
```markdown
**Validation:**
- [ ] File exists and is readable
- [ ] Format is valid JSON/CSV/XML
- [ ] Required fields present
- [ ] Data types correct
```

## Versioning and Maintenance

### Documenting Changes

When updating skills:

1. Keep deprecated patterns in "Legacy" sections
2. Clearly mark current vs. old approaches
3. Don't remove old patterns that might exist in user code
4. Update description if triggers change

### Backward Compatibility

Maintain compatibility when possible:

```markdown
## Current Pattern (Recommended)

[New approach]

## Legacy Pattern

[Old approach - still functional]
This pattern is deprecated but may appear in existing implementations.
```

## Summary Checklist

Use this for every skill you create:

**Planning:**
- [ ] Clear, specific use case
- [ ] Appropriate complexity level (simple vs. complex)
- [ ] Necessary scope (minimal but sufficient)

**Frontmatter:**
- [ ] Valid name (gerund form, ≤64 chars)
- [ ] Descriptive description with triggers (≤1024 chars)
- [ ] No prohibited content

**Content:**
- [ ] Concise (only non-standard info)
- [ ] Appropriate freedom level
- [ ] Structured workflows
- [ ] Validation checklists
- [ ] Error handling
- [ ] Consistent terminology
- [ ] No time-sensitive content

**Structure:**
- [ ] Progressive disclosure
- [ ] One-level deep references
- [ ] Table of contents (if >100 lines)
- [ ] Files under 500 lines

**Scripts:**
- [ ] No network access
- [ ] No package installation
- [ ] Clear documentation
- [ ] Error handling

**Testing:**
- [ ] Validated with validator script
- [ ] Tested functionally
- [ ] Works across Claude models
- [ ] Token usage verified

Follow these practices to create efficient, effective Claude Agent Skills.
