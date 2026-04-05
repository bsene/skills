# [Skill Name] Templates and Forms

Pre-formatted templates for common outputs and workflows.

## Template 1: [Template Name]

**Purpose:** [What this template is used for]

**When to Use:**
- [Use case 1]
- [Use case 2]
- [Use case 3]

**Template:**

```markdown
# [Title]

**Date:** [Date]
**Created by:** [Name/System]
**Version:** [Version]

## Overview

[Brief description of what this document contains]

## Section 1: [Section Name]

### Subsection 1.1
[Content structure]

### Subsection 1.2
[Content structure]

## Section 2: [Section Name]

| Column 1 | Column 2 | Column 3 | Column 4 |
|----------|----------|----------|----------|
| [Data] | [Data] | [Data] | [Data] |
| [Data] | [Data] | [Data] | [Data] |

## Section 3: [Section Name]

**Key Point 1:** [Description]

**Key Point 2:** [Description]

**Key Point 3:** [Description]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

## Next Steps

- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]
```

**Usage Example:**
[Show how to fill in the template with sample data]

---

## Template 2: [Template Name]

**Purpose:** [What this template is used for]

**When to Use:**
- [Use case 1]
- [Use case 2]

**Template:**

```markdown
# [Document Title]

## Summary

**Objective:** [Brief objective]
**Status:** [Status indicator]
**Priority:** [Priority level]

## Details

### Part A: [Name]
[Structure for this part]

### Part B: [Name]
[Structure for this part]

### Part C: [Name]
[Structure for this part]

## Metrics

| Metric | Target | Actual | Variance | Status |
|--------|--------|--------|----------|--------|
| [Metric 1] | [Value] | [Value] | [%] | 🟢/🟡/🔴 |
| [Metric 2] | [Value] | [Value] | [%] | 🟢/🟡/🔴 |

## Analysis

[Detailed analysis section]

## Conclusion

[Summary and key takeaways]
```

---

## Template 3: [Template Name]

**Purpose:** [What this template is used for]

**Template:**

```json
{
  "metadata": {
    "title": "[Title]",
    "created": "[ISO 8601 timestamp]",
    "version": "[Version]"
  },
  "configuration": {
    "parameter1": "[value]",
    "parameter2": "[value]",
    "parameter3": "[value]"
  },
  "data": [
    {
      "field1": "[value]",
      "field2": "[value]",
      "field3": "[value]"
    }
  ],
  "results": {
    "status": "[status]",
    "output": "[output]"
  }
}
```

---

## Form 1: [Form Name]

**Purpose:** [Data collection purpose]

**Fields:**

```
================================
[FORM TITLE]
================================

Date: _______________
User: _______________

SECTION 1: [Section Name]
--------------------------------
Field 1: _______________
Field 2: _______________
Field 3: _______________

SECTION 2: [Section Name]
--------------------------------
[ ] Option 1
[ ] Option 2
[ ] Option 3
[ ] Option 4

SECTION 3: [Section Name]
--------------------------------
Question 1: _______________
Question 2: _______________
Question 3: _______________

NOTES:
________________________________
________________________________
________________________________

VALIDATION:
[ ] Check 1
[ ] Check 2
[ ] Check 3

Completed by: _______________
Date: _______________
```

---

## Code Template 1: [Template Name]

**Purpose:** [What this code template provides]

**Language:** [Programming language]

**Template:**

```python
#!/usr/bin/env python3
"""
[Brief description of what this script does]

Usage:
    python script_name.py [arguments]

Example:
    python script_name.py input.txt --option value
"""

import sys
import argparse

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='[Description]')
    
    parser.add_argument('input', help='[Input description]')
    parser.add_argument('--option', help='[Option description]')
    
    args = parser.parse_args()
    
    try:
        # Process input
        result = process(args.input, args.option)
        
        # Output result
        print(result)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

def process(input_data, option):
    """Process the input data."""
    # Implementation
    return result

if __name__ == "__main__":
    main()
```

---

## Configuration Template: [Template Name]

**Purpose:** [Configuration file purpose]

**Format:** YAML

**Template:**

```yaml
# [Configuration Name]
# Purpose: [Description]

version: "1.0"

settings:
  setting1: value1
  setting2: value2
  setting3: value3

options:
  - name: option1
    value: value1
    enabled: true
  
  - name: option2
    value: value2
    enabled: false

parameters:
  param1:
    type: string
    default: "default_value"
    description: "Parameter description"
  
  param2:
    type: integer
    default: 100
    description: "Parameter description"
  
  param3:
    type: boolean
    default: true
    description: "Parameter description"

# Advanced settings (optional)
advanced:
  feature1: enabled
  feature2: disabled
```

---

## Report Template: [Template Name]

**Purpose:** [Reporting purpose]

**Template:**

```markdown
# [Report Title]

**Report Period:** [Period]
**Generated:** [Date and time]
**Report Type:** [Type]

---

## Executive Summary

[2-3 paragraph summary of key findings and recommendations]

### Key Highlights

- 🔴 Critical: [Finding]
- 🟡 Warning: [Finding]
- 🟢 Success: [Finding]

---

## Detailed Findings

### Finding 1: [Title]

**Severity:** [High/Medium/Low]
**Category:** [Category]

**Description:**
[Detailed description]

**Impact:**
[What this means for the user/system]

**Evidence:**
```
[Supporting data or logs]
```

**Recommendation:**
[What should be done]

### Finding 2: [Title]

[Same structure as Finding 1]

---

## Metrics and Statistics

### Overall Metrics

| Metric | Value | Change | Target | Status |
|--------|-------|--------|--------|--------|
| [Metric 1] | [Value] | [±%] | [Target] | [Status] |
| [Metric 2] | [Value] | [±%] | [Target] | [Status] |

### Breakdown by Category

#### Category A
- Metric X: [Value]
- Metric Y: [Value]

#### Category B
- Metric X: [Value]
- Metric Y: [Value]

---

## Recommendations

### Immediate Actions (Within 1 week)
1. [Action 1] - Priority: High
2. [Action 2] - Priority: High

### Short-term Actions (1-4 weeks)
1. [Action 1] - Priority: Medium
2. [Action 2] - Priority: Medium

### Long-term Actions (1-3 months)
1. [Action 1] - Priority: Low
2. [Action 2] - Priority: Low

---

## Appendices

### Appendix A: [Title]
[Additional supporting information]

### Appendix B: [Title]
[Additional supporting information]

---

**Report prepared by:** [Name/System]
**Review date:** [Date]
**Next review:** [Date]
```

---

## Dashboard Template

**Purpose:** Structure for dashboard layout

**Template:**

```markdown
# [Dashboard Title]

Last Updated: [Timestamp] | Auto-refresh: [Interval]

## Status Overview
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Metric 1  │   Metric 2  │   Metric 3  │   Metric 4  │
│   [Value]   │   [Value]   │   [Value]   │   [Value]   │
│   [Status]  │   [Status]  │   [Status]  │   [Status]  │
└─────────────┴─────────────┴─────────────┴─────────────┘

## Primary Visualization
[Main chart/graph description]

## Secondary Metrics
┌──────────────────────┬──────────────────────┐
│  Category A          │  Category B          │
│  • Metric: [Value]   │  • Metric: [Value]   │
│  • Metric: [Value]   │  • Metric: [Value]   │
└──────────────────────┴──────────────────────┘

## Recent Activity
| Time | Event | Status | Details |
|------|-------|--------|---------|
| [T]  | [E]   | [S]    | [D]     |

## Alerts
🔴 [Critical alert description]
🟡 [Warning description]
🟢 [System healthy]
```

---

## Usage Guidelines

### Selecting the Right Template

**Use Template 1 when:**
- [Condition 1]
- [Condition 2]

**Use Template 2 when:**
- [Condition 1]
- [Condition 2]

**Use Template 3 when:**
- [Condition 1]
- [Condition 2]

### Customization Tips

1. **Replace placeholders:** All items in [brackets] should be replaced
2. **Remove unused sections:** Delete sections that don't apply
3. **Add sections as needed:** Templates are starting points
4. **Maintain formatting:** Keep consistent structure for readability

### Template Variables

Common variables used across templates:

- `[Date]`: ISO 8601 format (YYYY-MM-DD)
- `[Timestamp]`: ISO 8601 with time (YYYY-MM-DDTHH:MM:SSZ)
- `[Status]`: One of: Success, Warning, Error, Pending
- `[Priority]`: One of: High, Medium, Low
- `[Version]`: Semantic versioning (X.Y.Z)

### Best Practices

1. **Fill all required fields** before using
2. **Validate data** against expected formats
3. **Review output** for completeness
4. **Archive** completed forms appropriately
5. **Update templates** based on feedback
