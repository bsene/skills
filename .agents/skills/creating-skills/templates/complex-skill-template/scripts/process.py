#!/usr/bin/env python3
"""
Template Processing Script

Generic template for processing scripts in complex skills.

Usage:
    python process.py <input_file> [options]

Examples:
    python process.py data.txt
    python process.py data.txt --format json
    python process.py data.txt --output results.txt --verbose
"""

import sys
import argparse
import json
from pathlib import Path


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Process input files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    # Required arguments
    parser.add_argument("input_file", help="Path to input file")

    # Optional arguments
    parser.add_argument(
        "--format",
        choices=["json", "text", "csv"],
        default="text",
        help="Output format (default: text)",
    )

    parser.add_argument("--output", help="Output file path (default: stdout)")

    parser.add_argument("--output-dir", help="Output directory for results")

    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")

    parser.add_argument(
        "--validate", action="store_true", help="Validate input before processing"
    )

    args = parser.parse_args()

    # Validate input file exists
    input_path = Path(args.input_file)
    if not input_path.exists():
        print(f"Error: Input file not found: {args.input_file}", file=sys.stderr)
        sys.exit(1)

    # Create output directory if specified
    if args.output_dir:
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

    try:
        if args.verbose:
            print(f"Processing {input_path}...")

        # Load input
        data = load_input(input_path, args.verbose)

        # Validate if requested
        if args.validate:
            if args.verbose:
                print("Validating input...")
            validate_input(data)

        # Process data
        if args.verbose:
            print("Processing data...")
        result = process_data(data, args)

        # Format output
        if args.verbose:
            print(f"Formatting output as {args.format}...")
        formatted_output = format_output(result, args.format)

        # Write output
        if args.output:
            output_path = Path(args.output)
            output_path.write_text(formatted_output)
            if args.verbose:
                print(f"Output written to {output_path}")
        else:
            print(formatted_output)

        if args.verbose:
            print("Processing complete!")

    except ValueError as e:
        print(f"Validation error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error during processing: {e}", file=sys.stderr)
        sys.exit(1)


def load_input(file_path: Path, verbose: bool = False) -> dict:
    """Load input from file."""
    if verbose:
        print(f"Loading from {file_path}...")

    # Read file content
    content = file_path.read_text()

    # Return as structured data
    # (In real implementation, would parse based on file type)
    return {
        "source": str(file_path),
        "content": content,
        "size": len(content),
        "lines": len(content.splitlines()),
    }


def validate_input(data: dict):
    """Validate input data."""
    # Example validation
    if data["size"] == 0:
        raise ValueError("Input file is empty")

    if data["lines"] < 1:
        raise ValueError("Input must contain at least one line")

    # Add more validation as needed
    pass


def process_data(data: dict, args) -> dict:
    """Process the input data."""
    # Placeholder processing logic
    # In real implementation, this would contain the core logic

    result = {
        "input_file": data["source"],
        "input_size": data["size"],
        "input_lines": data["lines"],
        "processed": True,
        "format": args.format,
        "results": {"items_processed": data["lines"], "status": "success"},
    }

    return result


def format_output(result: dict, format_type: str) -> str:
    """Format output based on requested format."""
    if format_type == "json":
        return json.dumps(result, indent=2)

    elif format_type == "csv":
        # Simple CSV format
        lines = [
            "key,value",
            f"input_file,{result['input_file']}",
            f"items_processed,{result['results']['items_processed']}",
            f"status,{result['results']['status']}",
        ]
        return "\n".join(lines)

    else:  # text format
        lines = [
            "Processing Results",
            "=" * 50,
            f"Input: {result['input_file']}",
            f"Size: {result['input_size']} bytes",
            f"Lines: {result['input_lines']}",
            "",
            "Results:",
            f"  Items processed: {result['results']['items_processed']}",
            f"  Status: {result['results']['status']}",
        ]
        return "\n".join(lines)


if __name__ == "__main__":
    main()
