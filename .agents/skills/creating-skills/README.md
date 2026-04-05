# Claude Skill Creator

A comprehensive, self-contained toolkit for creating, validating, and managing Claude Agent Skills.

## What Are Claude Agent Skills?

Agent Skills are filesystem-based packages that extend Claude's capabilities for specialized tasks. They use a progressive disclosure architecture that loads information in stages, keeping context usage efficient while providing powerful custom functionality.

## This Skill's Structure

The skill-creator is a complete toolkit with everything you need:

```
skill-creator/
├── SKILL.md                    # Main skill file (this skill)
├── README.md                   # This overview file
├── BEST_PRACTICES.md          # Comprehensive authoring guidelines
├── examples/                   # Sample skills for reference
│   ├── simple-skill-example/  # Code reviewer (single file)
│   │   └── SKILL.md
│   └── complex-skill-example/ # Data analyzer (multi-file)
│       ├── SKILL.md
│       ├── REFERENCE.md
│       ├── FORMS.md
│       └── scripts/
│           └── analyze.py
├── scripts/                    # Utility scripts
│   └── validate_skill.py      # Skill validation tool
└── templates/                  # Ready-to-use templates
    ├── simple-skill-template/
    │   └── SKILL.md
    └── complex-skill-template/
        ├── SKILL.md
        ├── REFERENCE.md
        ├── FORMS.md
        └── scripts/
            └── process.py
```

## Quick Start

### Method 1: Invoke the Skill (Recommended)

Simply invoke this skill when you need to create a new Claude skill. It will guide you through the entire process with best practices.

### Method 2: Use Templates Directly

**For Simple Skills:**
```bash
cp -r templates/simple-skill-template/ ../your-skill-name/
# Edit ../your-skill-name/SKILL.md
python scripts/validate_skill.py ../your-skill-name/SKILL.md
```

**For Complex Skills:**
```bash
cp -r templates/complex-skill-template/ ../your-skill-name/
# Edit all files in ../your-skill-name/
python scripts/validate_skill.py ../your-skill-name/SKILL.md --strict
```

### Method 3: Study Examples

Review the example skills to understand structure and best practices:

**Simple Example:**
```bash
cat examples/simple-skill-example/SKILL.md
```

**Complex Example:**
```bash
cat examples/complex-skill-example/SKILL.md
cat examples/complex-skill-example/REFERENCE.md | head -100
cat examples/complex-skill-example/FORMS.md
```

## Skill Requirements

Every skill must have:

### 1. YAML Frontmatter
```yaml
---
name: skill-name
description: What it does. Use when specific triggers.
---
```

**name requirements:**
- Lowercase letters, numbers, hyphens only
- Maximum 64 characters
- Use gerund form (e.g., "processing-data", "analyzing-logs")

**description requirements:**
- Maximum 1024 characters
- Include specific triggers
- Write in third person

### 2. Clear Structure
- "When to Use This Skill" section
- Core functionality with steps
- Common patterns
- Error handling
- Examples
- Validation checklist

### 3. Best Practices
- Concise (only non-standard information)
- Progressive disclosure (for complex skills)
- Consistent terminology
- No time-sensitive content

## Progressive Disclosure Architecture

Skills load information in three levels:

**Level 1 - Metadata (Always Loaded)**
- YAML frontmatter (~100 tokens)
- Loaded at startup for skill discovery

**Level 2 - Instructions (Triggered Loading)**
- Main SKILL.md content (<5,000 tokens)
- Loaded when skill matches user request

**Level 3 - Resources (On-Demand)**
- REFERENCE.md, FORMS.md
- Scripts (execute without loading)
- Loaded only when referenced

## Skill Structure Patterns

### Simple Skill (Single File)
```
skill-name/
└── SKILL.md
```

**Best for:**
- Single, focused functionality
- Under 300 lines of content
- No extensive documentation needed
- No automation scripts

**Example:** See `examples/simple-skill-example/`

### Complex Skill (Multi-File)
```
skill-name/
├── SKILL.md          # Main entry point (<500 lines)
├── REFERENCE.md      # Detailed documentation
├── FORMS.md          # Templates and examples
└── scripts/
    └── utility.py    # Executable helpers
```

**Best for:**
- Multiple related capabilities
- Requires detailed technical docs
- Benefits from templates
- Needs automation scripts

**Example:** See `examples/complex-skill-example/`

## Available Resources

### SKILL.md (Main File)
The core skill that guides you through creating new skills. Includes:
- Step-by-step creation process
- Template selection guidance
- Validation instructions
- Best practices summary
- Quick start workflow
- Complete example walkthrough

### BEST_PRACTICES.md
Comprehensive guidelines covering:
- Core principles (conciseness, progressive disclosure, freedom levels)
- Frontmatter specifications with examples
- Content organization patterns
- Writing style guidelines
- Script best practices
- Testing and validation
- Common patterns and anti-patterns
- Optimization techniques

**Key sections:**
```bash
cat BEST_PRACTICES.md | grep "^## "
```

### templates/

**simple-skill-template/**
- Ready-to-use single-file template
- All placeholders marked with [brackets]
- Includes all required sections
- Copy and customize

**complex-skill-template/**
- Complete multi-file structure
- SKILL.md with progressive disclosure
- REFERENCE.md for technical details
- FORMS.md for output templates
- scripts/process.py as starter script

### examples/

**simple-skill-example/** - Code Reviewer
- Analyzes code quality
- Single SKILL.md file
- Clear workflow with checklists
- Language-specific recommendations

**complex-skill-example/** - Data Analyzer
- Comprehensive data analysis
- Multi-file structure
- Statistical methods in REFERENCE.md
- Report templates in FORMS.md
- Analysis script included

### scripts/validate_skill.py

Comprehensive validation tool that checks:

**Frontmatter:**
- ✅ YAML syntax
- ✅ Required fields (name, description)
- ✅ Name format (lowercase-with-hyphens, ≤64 chars)
- ✅ Description length (≤1024 chars)
- ✅ No XML tags or reserved words

**Content:**
- ✅ File length warnings (>500 lines)
- ✅ "When to Use" section present
- ✅ Examples included (strict mode)
- ✅ Validation checklists

**Structure:**
- ✅ Referenced files exist
- ✅ REFERENCE.md has TOC (if >100 lines)
- ✅ Scripts have shebang lines

**Usage:**
```bash
# Basic validation
python scripts/validate_skill.py path/to/SKILL.md

# Strict mode (best practices)
python scripts/validate_skill.py path/to/SKILL.md --strict

# Validate directory
python scripts/validate_skill.py path/to/skill-directory/
```

## Typical Workflow

### Creating a New Skill

1. **Invoke this skill** (or choose template based on complexity)

2. **Gather requirements:**
   - Skill name (lowercase-with-hyphens)
   - Description with triggers
   - Core functionality list

3. **Copy template:**
   ```bash
   cp -r templates/simple-skill-template/ ../my-skill/
   ```

4. **Edit SKILL.md:**
   - Update frontmatter
   - Fill in all [placeholder] sections
   - Add specific examples
   - Create validation checklist

5. **Validate:**
   ```bash
   python scripts/validate_skill.py ../my-skill/SKILL.md --strict
   ```

6. **Review best practices:**
   ```bash
   cat BEST_PRACTICES.md | less
   ```

7. **Test:**
   - Invoke skill with Claude Code
   - Test various scenarios
   - Verify token efficiency

## Runtime Constraints

When designing skills, remember:

- ❌ No network access or external API calls
- ❌ No runtime package installation
- ✅ Only pre-installed packages
- ✅ Scripts execute via bash without loading into context
- ✅ Progressive disclosure minimizes context usage

## Validation Checklist

Before using a new skill:

**Planning:**
- [ ] Clear use case identified
- [ ] Appropriate complexity level

**Frontmatter:**
- [ ] Valid name (gerund form, ≤64 chars)
- [ ] Description with triggers (≤1024 chars)
- [ ] No prohibited content

**Content:**
- [ ] "When to Use" section
- [ ] Core functionality with steps
- [ ] Examples included
- [ ] Validation checklist
- [ ] Concise (no unnecessary info)

**Structure:**
- [ ] Progressive disclosure applied
- [ ] SKILL.md under 500 lines
- [ ] Referenced files exist

**Testing:**
- [ ] Passed validator
- [ ] Functionally tested
- [ ] Works as expected

## Getting Help

**Study examples:**
```bash
cat examples/simple-skill-example/SKILL.md
cat examples/complex-skill-example/SKILL.md
```

**Review best practices:**
```bash
cat BEST_PRACTICES.md
```

**Check templates:**
```bash
cat templates/simple-skill-template/SKILL.md
cat templates/complex-skill-template/SKILL.md
```

**Validate your skill:**
```bash
python scripts/validate_skill.py ../your-skill/SKILL.md --strict
```

**Read main skill instructions:**
```bash
cat SKILL.md
```

## External Resources

- [Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills) - Official examples
- [Claude Skills Documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) - Full specifications
- [Agent Skills API](https://docs.anthropic.com/en/docs/build-with-claude/agent-skills) - API reference

## Why This Structure?

This skill is self-contained with all resources included because:

1. **Completeness**: Everything needed to create skills in one place
2. **Progressive Disclosure**: Main SKILL.md references detailed files as needed
3. **Examples**: Real working skills demonstrate patterns
4. **Validation**: Built-in tool ensures compliance
5. **Templates**: Ready-to-use starting points
6. **Best Practices**: Comprehensive guidelines always available

When you invoke this skill, it has access to all these resources and can reference them as needed, providing a complete skill creation experience.

## Summary

The skill-creator is a meta-skill that helps you create other Claude skills. It includes:

- ✅ Main skill file with step-by-step guidance
- ✅ Comprehensive best practices documentation
- ✅ Two ready-to-use templates (simple & complex)
- ✅ Two example skills for reference
- ✅ Validation script for compliance checking
- ✅ This README for quick reference

Simply invoke the skill and let it guide you through creating professional, well-structured Claude Agent Skills!
