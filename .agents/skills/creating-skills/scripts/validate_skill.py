#!/usr/bin/env python3
"""
Claude Skill Validator

Validates Claude Agent Skills against Anthropic's specifications.

Checks:
- YAML frontmatter syntax and structure
- Required fields (name, description)
- Field constraints (length, format, content)
- Reserved words and prohibited content
- File structure and references
- Best practices compliance

Usage:
    python validate_skill.py <path_to_SKILL.md>
    python validate_skill.py <path_to_skill_directory>
    python validate_skill.py <path_to_SKILL.md> --strict

Examples:
    python validate_skill.py ../skill-creator/SKILL.md
    python validate_skill.py ../examples/simple-skill-example/
    python validate_skill.py my-skill/SKILL.md --strict
"""

import sys
import re
import argparse
from pathlib import Path
from typing import List, Dict, Tuple, Optional


class SkillValidator:
    """Validates Claude Agent Skills."""

    # Constants from Anthropic specifications
    MAX_NAME_LENGTH = 64
    MAX_DESCRIPTION_LENGTH = 1024
    MAX_SKILL_MD_LINES = 500  # Recommended for complex skills

    RESERVED_WORDS = ["anthropic", "claude"]

    NAME_PATTERN = re.compile(r"^[a-z0-9-]+$")

    def __init__(self, strict_mode: bool = False):
        """Initialize validator."""
        self.strict_mode = strict_mode
        self.errors = []
        self.warnings = []
        self.info = []

    def validate_file(self, file_path: Path) -> bool:
        """Validate a SKILL.md file."""
        if not file_path.exists():
            self.errors.append(f"File not found: {file_path}")
            return False

        if file_path.is_dir():
            # Look for SKILL.md in directory
            skill_file = file_path / "SKILL.md"
            if not skill_file.exists():
                self.errors.append(f"SKILL.md not found in directory: {file_path}")
                return False
            file_path = skill_file

        if file_path.name != "SKILL.md":
            self.warnings.append(
                f"File should be named 'SKILL.md', found: {file_path.name}"
            )

        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception as e:
            self.errors.append(f"Error reading file: {e}")
            return False

        # Validate components
        self.validate_frontmatter(content, file_path)
        self.validate_content(content, file_path)
        self.validate_structure(file_path)

        # Return True if no errors
        return len(self.errors) == 0

    def validate_frontmatter(self, content: str, file_path: Path):
        """Validate YAML frontmatter."""
        # Extract frontmatter
        frontmatter = self.extract_frontmatter(content)

        if frontmatter is None:
            self.errors.append("No YAML frontmatter found. File must start with '---'")
            return

        # Parse YAML (simple parser for frontmatter)
        try:
            data = self.parse_simple_yaml(frontmatter)
        except Exception as e:
            self.errors.append(f"Invalid YAML syntax in frontmatter: {e}")
            return

        if not isinstance(data, dict):
            self.errors.append("Frontmatter must be a YAML dictionary")
            return

        # Check required fields
        self.validate_name_field(data.get("name"))
        self.validate_description_field(data.get("description"))

        # Check for prohibited content
        self.check_prohibited_content(frontmatter)

        # Check for extra fields (info only)
        known_fields = {"name", "description"}
        extra_fields = set(data.keys()) - known_fields
        if extra_fields:
            self.info.append(
                f"Extra frontmatter fields (may be custom): {', '.join(extra_fields)}"
            )

    def validate_name_field(self, name: Optional[str]):
        """Validate the 'name' field."""
        if name is None:
            self.errors.append("Required field 'name' is missing from frontmatter")
            return

        if not isinstance(name, str):
            self.errors.append(
                f"Field 'name' must be a string, got: {type(name).__name__}"
            )
            return

        if not name:
            self.errors.append("Field 'name' cannot be empty")
            return

        # Check length
        if len(name) > self.MAX_NAME_LENGTH:
            self.errors.append(
                f"Field 'name' exceeds maximum length of {self.MAX_NAME_LENGTH} "
                f"characters (current: {len(name)})"
            )

        # Check format (lowercase, numbers, hyphens only)
        if not self.NAME_PATTERN.match(name):
            self.errors.append(
                f"Field 'name' must contain only lowercase letters, numbers, and hyphens. "
                f"Found: '{name}'"
            )

        # Check naming convention (gerund form)
        if self.strict_mode:
            if not self.is_gerund_form(name):
                self.warnings.append(
                    f"Field 'name' should use gerund form (verb + -ing). "
                    f"Example: 'processing-data', 'analyzing-logs'. Found: '{name}'"
                )

        # Check for vague names
        vague_names = ["helper", "utils", "utility", "tool", "stuff", "misc"]
        if any(vague in name for vague in vague_names):
            self.warnings.append(
                f"Field 'name' appears vague. Use specific, descriptive names. Found: '{name}'"
            )

    def validate_description_field(self, description: Optional[str]):
        """Validate the 'description' field."""
        if description is None:
            self.errors.append(
                "Required field 'description' is missing from frontmatter"
            )
            return

        if not isinstance(description, str):
            self.errors.append(
                f"Field 'description' must be a string, got: {type(description).__name__}"
            )
            return

        if not description.strip():
            self.errors.append("Field 'description' cannot be empty")
            return

        # Check length
        if len(description) > self.MAX_DESCRIPTION_LENGTH:
            self.errors.append(
                f"Field 'description' exceeds maximum length of {self.MAX_DESCRIPTION_LENGTH} "
                f"characters (current: {len(description)})"
            )

        # Check for triggers
        if self.strict_mode:
            if "use when" not in description.lower():
                self.warnings.append(
                    "Field 'description' should include usage triggers "
                    "(e.g., 'Use when...')"
                )

        # Check if too short
        if len(description) < 20:
            self.warnings.append(
                f"Field 'description' is very short ({len(description)} chars). "
                "Consider adding more detail about when to use the skill."
            )

    def validate_content(self, content: str, file_path: Path):
        """Validate main content."""
        lines = content.split("\n")

        # Check file length
        if len(lines) > self.MAX_SKILL_MD_LINES:
            self.warnings.append(
                f"SKILL.md has {len(lines)} lines, exceeding recommended maximum of "
                f"{self.MAX_SKILL_MD_LINES} for complex skills. Consider splitting "
                "into SKILL.md + REFERENCE.md"
            )

        # Check for "When to Use" section
        if not re.search(r"#+\s*when\s+to\s+use", content, re.IGNORECASE):
            self.warnings.append(
                "Missing 'When to Use This Skill' section. This helps Claude know "
                "when to invoke the skill."
            )

        # Check for examples
        if self.strict_mode:
            if not re.search(r"#+\s*example", content, re.IGNORECASE):
                self.info.append(
                    "No 'Examples' section found. Including examples can improve skill effectiveness."
                )

        # Check for validation checklists
        if "- [ ]" in content or "- [x]" in content:
            self.info.append("Contains validation checklists - good practice!")

        # Check for file references
        self.check_file_references(content, file_path)

    def validate_structure(self, file_path: Path):
        """Validate file structure and related files."""
        skill_dir = file_path.parent

        # Check for common additional files
        reference_file = skill_dir / "REFERENCE.md"
        forms_file = skill_dir / "FORMS.md"
        scripts_dir = skill_dir / "scripts"

        if reference_file.exists():
            self.info.append("Found REFERENCE.md - good for complex skills")
            self.check_reference_file(reference_file)

        if forms_file.exists():
            self.info.append("Found FORMS.md - good for templates")

        if scripts_dir.exists() and scripts_dir.is_dir():
            self.info.append("Found scripts/ directory")
            self.check_scripts_directory(scripts_dir)

    def check_reference_file(self, reference_file: Path):
        """Check REFERENCE.md for best practices."""
        try:
            content = reference_file.read_text(encoding="utf-8")
            lines = len(content.split("\n"))

            # Check for table of contents
            if lines > 100:
                if "table of contents" not in content.lower():
                    self.warnings.append(
                        f"REFERENCE.md has {lines} lines but no table of contents. "
                        "Add one for files >100 lines."
                    )
        except Exception as e:
            self.warnings.append(f"Error reading REFERENCE.md: {e}")

    def check_scripts_directory(self, scripts_dir: Path):
        """Check scripts directory."""
        scripts = list(scripts_dir.glob("*"))

        if not scripts:
            self.warnings.append("scripts/ directory is empty")
            return

        for script in scripts:
            if script.is_file():
                # Check for shebang in Python/Bash scripts
                if script.suffix in [".py", ".sh"]:
                    try:
                        first_line = script.read_text(encoding="utf-8").split("\n")[0]
                        if not first_line.startswith("#!"):
                            self.warnings.append(
                                f"Script {script.name} missing shebang line"
                            )
                    except Exception:
                        pass

    def check_file_references(self, content: str, file_path: Path):
        """Check for file references and validate they exist."""
        skill_dir = file_path.parent

        # Look for common reference patterns
        patterns = [
            r"see\s+([A-Z_]+\.md)",
            r"refer\s+to\s+([A-Z_]+\.md)",
            r"`(scripts/[^`]+)`",
            r"cat\s+([A-Z_]+\.md)",
        ]

        referenced_files = set()
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                referenced_files.add(match.group(1))

        # Check if referenced files exist
        for ref_file in referenced_files:
            ref_path = skill_dir / ref_file
            if not ref_path.exists():
                self.warnings.append(f"Referenced file not found: {ref_file}")

    def check_prohibited_content(self, text: str):
        """Check for prohibited content in frontmatter."""
        lower_text = text.lower()

        # Check for XML tags
        if re.search(r"<[^>]+>", text):
            self.errors.append("Frontmatter contains XML tags, which are prohibited")

        # Check for reserved words
        for word in self.RESERVED_WORDS:
            if word in lower_text:
                self.errors.append(
                    f"Frontmatter contains reserved word '{word}', which is prohibited"
                )

    def extract_frontmatter(self, content: str) -> Optional[str]:
        """Extract YAML frontmatter from content."""
        lines = content.split("\n")

        if not lines or lines[0].strip() != "---":
            return None

        # Find closing ---
        for i, line in enumerate(lines[1:], start=1):
            if line.strip() == "---":
                return "\n".join(lines[1:i])

        return None

    def parse_simple_yaml(self, yaml_text: str) -> dict:
        """Simple YAML parser for frontmatter (key: value pairs only)."""
        data = {}
        lines = yaml_text.strip().split("\n")

        for line in lines:
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            # Simple key: value parsing
            if ":" in line:
                key, value = line.split(":", 1)
                key = key.strip()
                value = value.strip()

                # Remove quotes if present
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]

                data[key] = value

        return data

    def is_gerund_form(self, name: str) -> bool:
        """Check if name uses gerund form (ends with -ing)."""
        # Split on hyphens and check if any part ends with -ing
        parts = name.split("-")
        return any(part.endswith("ing") for part in parts)

    def print_results(self) -> bool:
        """Print validation results."""
        has_issues = bool(self.errors or self.warnings)

        if self.errors:
            print("\n❌ ERRORS:")
            for error in self.errors:
                print(f"  • {error}")

        if self.warnings:
            print("\n⚠️  WARNINGS:")
            for warning in self.warnings:
                print(f"  • {warning}")

        if self.info:
            print("\nℹ️  INFO:")
            for info in self.info:
                print(f"  • {info}")

        if not has_issues:
            print("\n✅ VALIDATION PASSED!")
            print("Skill meets all requirements.")
        else:
            print("\n" + "=" * 50)
            summary = []
            if self.errors:
                summary.append(f"{len(self.errors)} error(s)")
            if self.warnings:
                summary.append(f"{len(self.warnings)} warning(s)")
            print(f"Found: {', '.join(summary)}")

            if self.errors:
                print("\nPlease fix errors before using this skill.")
            else:
                print("\nNo errors found, but consider addressing warnings.")

        return not bool(self.errors)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Validate Claude Agent Skills",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    parser.add_argument("path", help="Path to SKILL.md file or skill directory")

    parser.add_argument(
        "--strict",
        action="store_true",
        help="Enable strict mode with additional best practice checks",
    )

    args = parser.parse_args()

    # Validate path
    path = Path(args.path)
    if not path.exists():
        print(f"Error: Path not found: {path}", file=sys.stderr)
        sys.exit(1)

    # Run validation
    print(f"Validating: {path}")
    print("=" * 50)

    validator = SkillValidator(strict_mode=args.strict)
    success = validator.validate_file(path)

    validator.print_results()

    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
