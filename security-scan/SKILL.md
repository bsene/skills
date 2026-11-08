---
name: security-scan
description: >
  Security review of a repo or diff using Trivy (vulnerabilities, secrets, misconfigurations, licenses) and ggshield (GitGuardian secret scanning).

  TRIGGER when: security review, security scan, audit dependencies, find leaked secrets/credentials/API keys, CVE check, scan Dockerfile/Terraform/Kubernetes manifests, scan container image, pre-release or pre-commit security gate, mentions trivy or ggshield.
  DO NOT USE for manual code-level vulnerability review (use the built-in security-review) or pentesting.
---

# Security Scan (Trivy + ggshield)

Two tools, two jobs: **Trivy** = vulns, misconfig, secrets in files/images. **ggshield** = secrets incl. git history, backed by GitGuardian.

## Workflow

1. Preflight: `trivy --version` and `ggshield api-status`. If missing, `brew install trivy ggshield`. If ggshield is unhealthy (IP allowlist, no API key → `ggshield auth login`), report it as **not run**; never present a skipped scan as clean.
2. Run Trivy (working tree):
   `trivy fs --scanners vuln,secret,misconfig --skip-dirs .git .`
   Add `--severity HIGH,CRITICAL` for a gate, `--format json -o trivy.json` for tooling.
3. Run ggshield (history included):
   `ggshield secret scan repo .`
   Staged only: `ggshield secret scan pre-commit`. Range: `ggshield secret scan commit-range <base>..HEAD`.
4. Images: `trivy image <name>`; Dockerfile/IaC only: `trivy config .`.
5. Report as **Blockers** (leaked secret, CRITICAL/HIGH with fix available) / **Warnings** / **Suggestions**. Include tool, target, rule/CVE id, and fix version.

## Rules

- A leaked secret is compromised even if deleted from HEAD: **rotate first**, then clean history. Never print the secret value in the report.
- Empty Trivy table (`-` columns) means nothing scannable was found, not proof of safety (e.g. no lockfiles → no vuln scan). Say so.
- Suppress false positives only with a reason: `.trivyignore` (CVE id + comment) or `.gitguardian.yaml` (`ggshield secret ignore --last-found`).
- Do not paste scanner output containing secrets into commits, PRs, or issues.

## Gates

- Pre-commit: `ggshield install --mode local` (or `ggshield secret scan pre-commit`).
- CI: `trivy fs --exit-code 1 --severity HIGH,CRITICAL .` and `ggshield secret scan ci`.

## Docs

- Trivy: https://trivy.dev/
- ggshield: https://docs.gitguardian.com/ggshield-docs/
