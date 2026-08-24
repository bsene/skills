# Dantotsu Analysis Template

## Problem Statement

<!-- 🔍 User-facing issue in 1-2 sentences -->

---

## Metadata

| Field                   | Value                      |
| ----------------------- | -------------------------- |
| 🟢 **ID**               | `[ISSUE_ID]`               |
| 🟢 **Analysis Date**    | `[DATE_YYYY/MM/DD]`        |
| 🟢 **Project**          | `[PROJECT_NAME]`           |
| 🟢 **Detection Stage**  | `[A/B/C/D] - [STAGE_NAME]` |
| 🟢 **Startup**          | `[STARTUP_NAME]`           |
| 🟢 **Status**           | `[e.g., To Challenge]`     |
| 🔵 **Weak point**       | `[COMPONENT/TEAM]`         |
| 🟢 **Owner**            | `[OWNER_NAME]`             |
| 🟢 **napta_project_id** | `[ID]`                     |
| **Standard**            | 🎓 Dantotsu                |

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

_The technical or business misconception that led the developer to make the mistake._

### The Misconception

<!-- What the developer thought was true -->

### What Actually Happened

<!-- The reality that contradicts the misconception -->
<!-- Numbered list of actual facts -->

### Contributing Factor

<!-- What happened during development that enabled the mistake -->

---

## Detection Failure Causes

_Why the defect wasn't caught earlier._

### 1. Code Complexity (Local Validation Failure)

<!-- Why the code structure prevented detection -->

### 2. Process Gap

<!-- What process step was missing (e.g., "5-minute refactor pause") -->

### 3. Missing Tests

<!-- What tests would have caught this -->

### 4. Code Review

<!-- Why review didn't catch it -->

---

## Countermeasure

_How to fix the defect._

### Changes Made

<!-- What was changed to fix the issue -->

### Result

<!-- What works correctly now -->

---

## Eradication

_What are similar instances in the product? How to prevent a regression and eliminate the defect once and for all?_

### Similar Instances

<!-- List of other places where this pattern exists -->

### Prevention Strategy

<!-- How to prevent this pattern from recurring -->

### Weak Point History

<!-- Has this component failed similarly before? -->
