# Dantotsu Analysis Template

## Problem Statement

<!-- 🔍 User-facing issue in 1-2 sentences -->

---

## Metadata

| Field                   | Value                          |
| ----------------------- | ------------------------------ |
| 🟢 **ID**               | `[ISSUE_ID]`                   |
| 🟢 **Analysis Date**    | `[DATE_YYYY/MM/DD]`            |
| 🟢 **Project**          | `[PROJECT_NAME]`               |
| 🟢 **Detection Stage**  | `[A/B/C/D/E/F] - [STAGE_NAME]` |
| 🟢 **Startup**          | `[STARTUP_NAME]`               |
| 🟢 **Status**           | `[e.g., To Challenge]`         |
| 🟢 **Owner**            | `[OWNER_NAME]`                 |
| **Standard**            | 🎓 Dantotsu                    |

---

## User Impact

<!-- Description of the user-facing issue and likely outcomes -->
<!-- Include: what users experience, what they can't do, what happens next -->

---

## Causal Chain

_The sequence of events that led to the user-facing error._

<!-- Numbered list of events from user action to final error -->
<!-- Include code snippets if relevant -->

---

## Root Cause of Occurrence

_The conditions that caused the defect, supported by the occurrence whys chain._

### Evidence and Occurrence Whys

<!-- Trace observed facts and each why to evidence; mark missing information as unknown -->

### Hypotheses (if any)

<!-- Label unconfirmed explanations and what would confirm or disprove them -->
<!-- Do not infer a person's reasoning without evidence -->

### Contributing Factors (if established)

<!-- Include only factors supported by evidence; omit inapplicable subsections -->

---

## Detection Failure Causes

_Why the defect wasn't caught earlier._

<!-- Run a separate detection whys chain, comparing actual and earliest feasible detection stages -->
<!-- Include only evidenced gaps; code complexity, process, tests, and review are candidates, not required causes -->
<!-- Mark hypotheses and unknowns explicitly; use not applicable where an earlier stage could not catch this defect -->

---

## Countermeasure

_How to fix the defect._

### Actions and Status

<!-- Separate containment already performed from remaining proposed actions -->

### Result

<!-- Record observed outcomes; mark results of unperformed actions as unverified -->

---

## Eradication

_Prevent this defect pattern; state the scope covered and remaining limitations._

### Similar Instances

<!-- List of other places where this pattern exists -->

### Prevention Strategy

<!-- How to prevent this pattern from recurring -->

### Verification and Monitoring

<!-- Record the reproducer or regression check, result, and scenarios covered; mark untested prevention as unverified -->
<!-- Separately record the monitoring window, workload or opportunities for recurrence, owner, and review point -->
<!-- No observed recurrence alone does not prove eradication -->
