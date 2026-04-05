# Data Analysis Report Templates

Pre-formatted templates for various analysis report types.

## Executive Summary Template

```markdown
# Data Analysis Executive Summary

**Analysis Date:** [Date]
**Dataset:** [Dataset name/description]
**Analyst:** [Name/Team]

## Key Findings

1. [Most important finding with metric]
2. [Second most important finding with metric]
3. [Third most important finding with metric]
4. [Additional key finding]
5. [Additional key finding]

## Critical Metrics

| Metric | Value | Change | Status |
|--------|-------|--------|--------|
| [Metric 1] | [Value] | [+/-X%] | 🟢/🟡/🔴 |
| [Metric 2] | [Value] | [+/-X%] | 🟢/🟡/🔴 |
| [Metric 3] | [Value] | [+/-X%] | 🟢/🟡/🔴 |

## Recommendations

### Immediate Actions (Next 30 days)
1. [Action 1] - Expected impact: [Description]
2. [Action 2] - Expected impact: [Description]

### Strategic Initiatives (3-6 months)
1. [Initiative 1] - Expected impact: [Description]
2. [Initiative 2] - Expected impact: [Description]

## Risk Factors

- [Risk 1]: [Mitigation strategy]
- [Risk 2]: [Mitigation strategy]

## Next Steps

1. [Step 1] - Owner: [Name] - Due: [Date]
2. [Step 2] - Owner: [Name] - Due: [Date]
3. [Step 3] - Owner: [Name] - Due: [Date]
```

## Technical Report Template

```markdown
# Technical Data Analysis Report

## Executive Summary
[Brief overview - see Executive Summary Template]

## 1. Introduction

### 1.1 Objectives
[What questions are we trying to answer?]

### 1.2 Scope
- Data source: [Source]
- Time period: [Period]
- Variables analyzed: [List]
- Analysis type: [Type]

### 1.3 Limitations
- [Limitation 1]
- [Limitation 2]

## 2. Data Description

### 2.1 Dataset Overview
- **Rows:** [Number]
- **Columns:** [Number]
- **Size:** [MB/GB]
- **Format:** [CSV/JSON/etc.]

### 2.2 Variable Descriptions

| Variable | Type | Description | Missing % |
|----------|------|-------------|-----------|
| [Var 1] | [Type] | [Description] | [%] |
| [Var 2] | [Type] | [Description] | [%] |

### 2.3 Data Quality

**Completeness:**
- Missing values: [X%]
- Columns affected: [List]
- Handling approach: [Approach]

**Accuracy:**
- Outliers detected: [Number]
- Method: [Detection method]
- Treatment: [How handled]

**Consistency:**
- Duplicates: [Number removed]
- Format issues: [Description and fixes]

## 3. Methodology

### 3.1 Data Preparation
1. [Step 1]
2. [Step 2]
3. [Step 3]

### 3.2 Analysis Methods

**Descriptive Statistics:**
- [Methods used]

**Inferential Statistics:**
- [Tests performed]
- Significance level: α = 0.05

**Modeling:**
- Algorithm: [Name]
- Parameters: [Settings]
- Validation: [Method]

### 3.3 Tools and Libraries
- Python 3.x
- pandas, numpy
- scikit-learn
- matplotlib, seaborn

## 4. Results

### 4.1 Descriptive Statistics

#### Summary Statistics

| Variable | Mean | Median | SD | Min | Max |
|----------|------|--------|----|----|-----|
| [Var 1] | [X] | [X] | [X] | [X] | [X] |
| [Var 2] | [X] | [X] | [X] | [X] | [X] |

#### Distribution Analysis
[Description of distributions with visualizations]

### 4.2 Correlation Analysis

**Significant Correlations:**
- [Var A] ↔ [Var B]: r = [value], p < [value]
- [Var C] ↔ [Var D]: r = [value], p < [value]

[Correlation matrix heatmap]

### 4.3 Hypothesis Testing Results

**Test 1: [Name]**
- Null hypothesis: [H0]
- Alternative hypothesis: [H1]
- Test statistic: [Value]
- p-value: [Value]
- Result: [Reject/Fail to reject H0]
- Interpretation: [What this means]

### 4.4 Model Performance

**Model:** [Name]

| Metric | Training | Validation | Test |
|--------|----------|------------|------|
| Accuracy | [X%] | [X%] | [X%] |
| Precision | [X%] | [X%] | [X%] |
| Recall | [X%] | [X%] | [X%] |
| F1 Score | [X] | [X] | [X] |

**Feature Importance:**
1. [Feature 1]: [Score]
2. [Feature 2]: [Score]
3. [Feature 3]: [Score]

## 5. Insights and Interpretation

### 5.1 Key Findings
[Detailed discussion of results]

### 5.2 Patterns Identified
[Description of patterns with business context]

### 5.3 Anomalies
[Notable outliers or unusual findings]

## 6. Recommendations

### 6.1 Data-Driven Recommendations
1. **[Recommendation 1]**
   - Supporting data: [Evidence]
   - Expected impact: [Description]
   - Implementation: [How to do it]

2. **[Recommendation 2]**
   - Supporting data: [Evidence]
   - Expected impact: [Description]
   - Implementation: [How to do it]

### 6.2 Future Analysis
- [Suggested follow-up analysis 1]
- [Suggested follow-up analysis 2]

## 7. Conclusion

[Summary of main findings and implications]

## Appendices

### Appendix A: Additional Visualizations
[Supplementary charts and graphs]

### Appendix B: Statistical Details
[Detailed test outputs and diagnostics]

### Appendix C: Code
[Key analysis code snippets]
```

## Dashboard Layout Template

```markdown
# Data Analysis Dashboard

## Overview Section (Top)

### KPI Cards (Row 1)
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Total Records  │ │   Data Quality  │ │  Avg Metric X   │ │    Trend        │
│                 │ │                 │ │                 │ │                 │
│    12,543       │ │     98.5%       │ │     $45.2K      │ │    ↑ 12.3%     │
│                 │ │                 │ │                 │ │                 │
│  vs last: +5.2% │ │  vs last: +1.2% │ │  vs last: +8.4% │ │   vs last month │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘

## Visualizations Section (Middle)

### Main Charts (Row 2)
┌──────────────────────────────────────┐ ┌──────────────────────────────┐
│   Trend Over Time (Line Chart)       │ │  Category Breakdown (Pie)    │
│                                       │ │                              │
│   [Revenue/Sales/Metric visualization│ │  [Distribution by category]  │
│    showing trends across time]        │ │                              │
│                                       │ │                              │
└──────────────────────────────────────┘ └──────────────────────────────┘

### Supporting Charts (Row 3)
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐
│  Top 10 Items    │ │  Correlation     │ │  Geo Distribution        │
│  (Bar Chart)     │ │  (Heatmap)       │ │  (Map)                   │
│                  │ │                  │ │                          │
│  [Ranked items]  │ │  [Relationships] │ │  [Geographic breakdown]  │
└──────────────────┘ └──────────────────┘ └──────────────────────────┘

## Details Section (Bottom)

### Data Table (Row 4)
┌────────────────────────────────────────────────────────────────────┐
│  Detailed Data View                          [Filter] [Sort] [↓]   │
├────────┬──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Date   │ Category │ Metric A │ Metric B │ Status   │ Action      │
├────────┼──────────┼──────────┼──────────┼──────────┼─────────────┤
│ [Data] │ [Data]   │ [Data]   │ [Data]   │ [Data]   │ [View]      │
│ [Data] │ [Data]   │ [Data]   │ [Data]   │ [Data]   │ [View]      │
└────────┴──────────┴──────────┴──────────┴──────────┴─────────────┘

### Filters and Controls (Sidebar)
┌─────────────────┐
│ Filters         │
├─────────────────┤
│ Date Range:     │
│ [Picker]        │
│                 │
│ Category:       │
│ ☐ Category A    │
│ ☐ Category B    │
│ ☐ Category C    │
│                 │
│ Status:         │
│ ○ All           │
│ ○ Active        │
│ ○ Inactive      │
│                 │
│ [Apply] [Reset] │
└─────────────────┘
```

## Quick Analysis Template

```markdown
# Quick Data Analysis

**Dataset:** [Name]
**Date:** [Date]
**Records:** [Count]

## Summary Statistics

**Key Metrics:**
- Average: [Value]
- Median: [Value]
- Range: [Min] to [Max]
- Standard Deviation: [Value]

## Top Insights

1. **[Finding 1]**
   - What: [Description]
   - Why it matters: [Importance]

2. **[Finding 2]**
   - What: [Description]
   - Why it matters: [Importance]

3. **[Finding 3]**
   - What: [Description]
   - Why it matters: [Importance]

## Data Quality

- Completeness: [X%]
- Issues found: [Number]
- Outliers: [Number]

## Visualizations

[Key chart 1]
[Key chart 2]

## Next Steps

- [ ] [Action 1]
- [ ] [Action 2]
- [ ] [Action 3]
```

## Comparison Analysis Template

```markdown
# Comparative Analysis Report

## Groups Being Compared

**Group A:** [Description]
- Sample size: [N]
- Time period: [Period]

**Group B:** [Description]
- Sample size: [N]
- Time period: [Period]

## Metric Comparison

| Metric | Group A | Group B | Difference | % Change | Significant? |
|--------|---------|---------|------------|----------|--------------|
| [Metric 1] | [Value] | [Value] | [Diff] | [%] | Yes/No |
| [Metric 2] | [Value] | [Value] | [Diff] | [%] | Yes/No |
| [Metric 3] | [Value] | [Value] | [Diff] | [%] | Yes/No |

## Statistical Test Results

**Test Used:** [t-test/ANOVA/Chi-square/etc.]

- Test statistic: [Value]
- p-value: [Value]
- Confidence interval: [[Lower], [Upper]]
- Effect size: [Value]

**Conclusion:** [Reject/Fail to reject null hypothesis]

**Interpretation:** [What this means in practical terms]

## Visualizations

### Side-by-Side Comparison
[Chart showing both groups]

### Difference Plot
[Chart highlighting differences]

## Key Findings

1. **[Finding 1]:** Group A shows [X]% higher/lower [metric] than Group B
2. **[Finding 2]:** The difference in [metric] is statistically significant (p < [value])
3. **[Finding 3]:** [Other notable difference]

## Recommendations

Based on the comparison:
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]
```

## Time Series Analysis Template

```markdown
# Time Series Analysis Report

**Series:** [Name]
**Period:** [Start] to [End]
**Frequency:** [Daily/Weekly/Monthly/etc.]
**Observations:** [Count]

## Decomposition

### Trend
- Direction: [Increasing/Decreasing/Stable]
- Rate of change: [X per period]
- Pattern: [Linear/Exponential/etc.]

### Seasonality
- Period detected: [X units]
- Strength: [Weak/Moderate/Strong]
- Peak: [When]
- Trough: [When]

### Irregular Component
- Volatility: [Low/Medium/High]
- Notable anomalies: [Count]

## Statistical Properties

- Mean: [Value]
- Standard deviation: [Value]
- Autocorrelation: [Significant lags]
- Stationarity: [Yes/No] ([Test used])

## Forecast

### Method Used: [ARIMA/Exponential Smoothing/Prophet/etc.]

### Model Parameters
- [Parameter 1]: [Value]
- [Parameter 2]: [Value]

### Forecast Results

| Period | Point Forecast | 95% CI Lower | 95% CI Upper |
|--------|----------------|--------------|--------------|
| [T+1] | [Value] | [Value] | [Value] |
| [T+2] | [Value] | [Value] | [Value] |
| [T+3] | [Value] | [Value] | [Value] |

### Model Performance
- RMSE: [Value]
- MAE: [Value]
- MAPE: [Value]%

## Insights

1. **Trend:** [Description and implications]
2. **Seasonality:** [Description and implications]
3. **Forecast:** [What to expect in coming periods]

## Visualizations

[Time series plot with trend]
[Seasonal decomposition]
[Forecast plot with confidence intervals]

## Recommendations

1. [Action based on trend]
2. [Action based on seasonality]
3. [Action based on forecast]
```

## Usage Instructions

Each template is designed for specific analysis types:

- **Executive Summary:** For stakeholders needing high-level insights
- **Technical Report:** For detailed documentation and peer review
- **Dashboard Layout:** For interactive visualization planning
- **Quick Analysis:** For rapid exploratory work
- **Comparison Analysis:** For A/B testing or group comparisons
- **Time Series Analysis:** For temporal data analysis

To use a template:
1. Copy the markdown
2. Fill in bracketed placeholders
3. Customize sections as needed
4. Remove unused sections
5. Add visualizations and data
