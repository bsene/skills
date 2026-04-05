# Data Analyzer Reference Guide

Comprehensive reference for statistical methods, algorithms, and advanced techniques.

## Table of Contents

1. [Statistical Methods Library](#statistical-methods-library)
2. [Machine Learning Algorithms](#machine-learning-algorithms)
3. [Time Series Techniques](#time-series-techniques)
4. [Text Analytics Methods](#text-analytics-methods)
5. [Missing Data Handling](#missing-data-handling)
6. [Statistical Testing](#statistical-testing)

## Statistical Methods Library

### Descriptive Statistics

**Measures of Central Tendency:**
- Mean: Average value, sensitive to outliers
- Median: Middle value, robust to outliers
- Mode: Most frequent value
- Trimmed mean: Mean after removing extreme values

**Measures of Dispersion:**
- Variance: Average squared deviation from mean
- Standard deviation: Square root of variance
- IQR: Interquartile range (Q3 - Q1)
- MAD: Median absolute deviation
- Coefficient of variation: SD/Mean ratio

**Measures of Shape:**
- Skewness: Distribution asymmetry
  - Negative: Left tail longer
  - Positive: Right tail longer
- Kurtosis: Tail heaviness
  - Leptokurtic: Heavy tails
  - Platykurtic: Light tails

### Inferential Statistics

**Confidence Intervals:**
```
CI = mean ± (critical_value × standard_error)
```
- 95% CI: 1.96 × SE for large samples
- Use t-distribution for small samples (n < 30)

**Effect Size Measures:**
- Cohen's d: Standardized mean difference
- Pearson's r: Correlation coefficient
- Eta squared: Proportion of variance explained

### Correlation Methods

**Pearson Correlation:**
- Measures linear relationship
- Range: -1 to +1
- Assumes: Normality, homoscedasticity
- Use when: Both variables continuous and normally distributed

**Spearman Rank Correlation:**
- Measures monotonic relationship
- Non-parametric alternative to Pearson
- Use when: Ordinal data or non-normal distributions

**Kendall's Tau:**
- Another non-parametric correlation
- More robust than Spearman for small samples
- Better for data with many tied ranks

## Machine Learning Algorithms

### Regression Models

**Linear Regression:**
- Assumes linear relationship
- Sensitive to outliers
- Requires independence of errors
- Check assumptions: linearity, homoscedasticity, normality

**Polynomial Regression:**
- Captures non-linear relationships
- Risk of overfitting with high degrees
- Use cross-validation for degree selection

**Ridge Regression (L2):**
- Adds penalty for large coefficients
- Reduces overfitting
- Good for multicollinearity

**Lasso Regression (L1):**
- Can zero out coefficients
- Performs feature selection
- Good for high-dimensional data

### Classification Models

**Logistic Regression:**
- Binary classification
- Outputs probabilities
- Interpretable coefficients
- Assumes linear decision boundary

**Decision Trees:**
- Non-parametric
- Handles non-linear relationships
- Prone to overfitting
- Use pruning or ensemble methods

**Random Forest:**
- Ensemble of decision trees
- Reduces overfitting
- Feature importance scores
- Robust to outliers

### Clustering Algorithms

**K-Means:**
- Partitioning method
- Requires specifying k (number of clusters)
- Use elbow method or silhouette score for k selection
- Sensitive to initialization and outliers

**Hierarchical Clustering:**
- Creates dendrogram
- No need to specify k upfront
- Two types: agglomerative (bottom-up), divisive (top-down)

**DBSCAN:**
- Density-based clustering
- Automatically determines number of clusters
- Can identify outliers
- Good for non-spherical clusters

## Time Series Techniques

### Decomposition

**Additive Model:**
```
Y(t) = Trend + Seasonal + Residual
```
Use when seasonal variation is constant.

**Multiplicative Model:**
```
Y(t) = Trend × Seasonal × Residual
```
Use when seasonal variation changes with trend level.

### Trend Analysis

**Moving Average:**
- Simple MA: Equal weights
- Weighted MA: Different weights
- Exponential MA: Exponentially decreasing weights

**Trend Detection:**
- Linear trend: Fit regression line
- Polynomial trend: Higher-order polynomials
- Mann-Kendall test: Non-parametric trend test

### Seasonality

**Detection Methods:**
- ACF plot: Look for repeating patterns
- Seasonal subseries plot: Compare seasons
- Periodogram: Identify dominant frequencies

**Adjustment Methods:**
- Seasonal differencing
- Seasonal decomposition (STL)
- Deseasonalization by division/subtraction

### Forecasting

**ARIMA Models:**
- AR (AutoRegressive): Uses past values
- I (Integrated): Differencing for stationarity
- MA (Moving Average): Uses past errors
- Model selection: Use ACF/PACF plots

**Exponential Smoothing:**
- Simple: Level only
- Holt: Level + trend
- Holt-Winters: Level + trend + seasonality

**Prophet:**
- Facebook's forecasting tool
- Handles missing data and outliers
- Captures multiple seasonality
- Easy to use for business forecasting

## Text Analytics Methods

### Text Preprocessing

**Standard Pipeline:**
1. Lowercase conversion
2. Remove punctuation
3. Tokenization
4. Remove stopwords
5. Stemming or lemmatization

**Advanced Preprocessing:**
- N-gram extraction
- Part-of-speech tagging
- Named entity recognition

### Vectorization

**Bag of Words (BoW):**
- Simple word counting
- Loses word order
- Sparse representation

**TF-IDF:**
- Term Frequency × Inverse Document Frequency
- Reduces weight of common words
- Better than BoW for most tasks

**Word Embeddings:**
- Word2Vec: CBOW or Skip-gram
- GloVe: Global vectors
- Dense representations
- Capture semantic relationships

### Analysis Techniques

**Sentiment Analysis:**
- Rule-based: Use sentiment lexicons
- Machine learning: Train classifier
- Deep learning: Use pre-trained models

**Topic Modeling:**
- LDA (Latent Dirichlet Allocation)
- NMF (Non-negative Matrix Factorization)
- Identify themes in document collections

**Text Classification:**
- Naive Bayes: Fast, works well for text
- SVM: Good for high-dimensional data
- Neural networks: Best performance, requires more data

## Missing Data Handling

### Missing Data Types

**MCAR (Missing Completely at Random):**
- No relationship between missingness and data
- Safe to delete or impute
- Check: Compare missing vs. non-missing groups

**MAR (Missing at Random):**
- Missingness related to observed data
- Can be handled with proper methods
- Requires modeling

**MNAR (Missing Not at Random):**
- Missingness related to unobserved data
- Most challenging to handle
- May require domain knowledge

### Imputation Methods

**Simple Imputation:**
- Mean/median/mode replacement
- Quick but ignores relationships
- Reduces variance

**Advanced Imputation:**
- KNN Imputation: Use k nearest neighbors
- MICE (Multiple Imputation by Chained Equations)
- Regression imputation
- Preserves relationships better

**When to Delete:**
- <5% missing data
- MCAR confirmed
- Large dataset where loss is acceptable

**When to Impute:**
- 5-20% missing data
- MAR or MCAR
- Missing data not in target variable

**When to Model Missingness:**
- >20% missing data
- MNAR suspected
- Missing data pattern informative

## Statistical Testing

### Test Selection Guide

**Comparing Two Groups:**

| Data Type | Distribution | Paired | Test |
|-----------|-------------|--------|------|
| Continuous | Normal | No | Independent t-test |
| Continuous | Normal | Yes | Paired t-test |
| Continuous | Non-normal | No | Mann-Whitney U |
| Continuous | Non-normal | Yes | Wilcoxon signed-rank |
| Categorical | - | No | Chi-square |
| Categorical | - | Yes | McNemar |

**Comparing Multiple Groups:**

| Data Type | Distribution | Test |
|-----------|-------------|------|
| Continuous | Normal | ANOVA |
| Continuous | Non-normal | Kruskal-Wallis |
| Categorical | - | Chi-square |

### Hypothesis Testing Framework

**Steps:**
1. State null hypothesis (H0) and alternative (H1)
2. Choose significance level (α, typically 0.05)
3. Calculate test statistic
4. Determine p-value
5. Make decision: Reject H0 if p < α

**Common Pitfalls:**
- Multiple testing: Adjust α (Bonferroni correction)
- p-hacking: Don't test until finding significance
- Confusing significance with importance
- Ignoring effect size

### Power Analysis

**Components:**
- Effect size: How large is the difference?
- Sample size: How many observations?
- Significance level: How much Type I error acceptable?
- Power: Probability of detecting true effect (typically 0.80)

**Use Cases:**
- Pre-study: Determine required sample size
- Post-study: Evaluate if sample was sufficient

## Assumptions and Diagnostics

### Regression Assumptions

**Linearity:**
- Check: Residual vs. fitted plot
- Solution: Transform variables or use non-linear model

**Independence:**
- Check: Durbin-Watson test, ACF of residuals
- Solution: Use time series methods if violated

**Homoscedasticity:**
- Check: Scale-location plot, Breusch-Pagan test
- Solution: Transform response or use weighted regression

**Normality of Residuals:**
- Check: Q-Q plot, Shapiro-Wilk test
- Solution: Transform response or use robust methods

**No Multicollinearity:**
- Check: VIF (variance inflation factor)
- Solution: Remove correlated predictors or use regularization

### Outlier Detection

**Methods:**
- IQR method: Values beyond 1.5 × IQR from quartiles
- Z-score: |z| > 3 (or 2.5)
- Isolation Forest: Machine learning approach
- DBSCAN: Density-based approach

**Handling Outliers:**
- Investigate: Are they errors or valid extremes?
- Remove: If errors or not of interest
- Transform: Log or other transformations
- Cap: Set to maximum acceptable value
- Use robust methods: Median, MAD, robust regression

## Performance Metrics

### Regression Metrics

**R-squared:**
- Proportion of variance explained
- Range: 0 to 1 (higher better)
- Limitation: Increases with more predictors

**Adjusted R-squared:**
- Penalizes additional predictors
- Better for model comparison

**RMSE (Root Mean Squared Error):**
- In same units as target
- Penalizes large errors more

**MAE (Mean Absolute Error):**
- More robust to outliers than RMSE
- Easier to interpret

### Classification Metrics

**Accuracy:**
- Proportion of correct predictions
- Misleading for imbalanced data

**Precision:**
- Of predicted positives, how many were correct?
- Use when false positives costly

**Recall (Sensitivity):**
- Of actual positives, how many were found?
- Use when false negatives costly

**F1 Score:**
- Harmonic mean of precision and recall
- Balances both metrics

**ROC AUC:**
- Area under ROC curve
- Threshold-independent
- Good for comparing models

## Best Practices

### Model Development

1. **Split data properly:**
   - Training: 60-80%
   - Validation: 10-20%
   - Test: 10-20%

2. **Use cross-validation:**
   - k-fold CV (typically k=5 or 10)
   - Prevents overfitting
   - Better estimate of performance

3. **Start simple:**
   - Begin with linear/simple models
   - Add complexity only if needed
   - Simpler models often generalize better

4. **Check assumptions:**
   - Don't ignore diagnostic plots
   - Violations can invalidate results
   - Use appropriate alternatives if violated

5. **Validate thoroughly:**
   - Test on holdout set
   - Check performance on different subgroups
   - Monitor for overfitting

### Reporting Results

**Always Include:**
- Sample size
- Method used
- Performance metrics
- Confidence intervals
- Assumptions checked
- Limitations

**Visualizations:**
- Clear labels and titles
- Appropriate chart types
- Error bars or confidence bands
- Legends and annotations

**Interpretation:**
- Statistical significance ≠ practical importance
- Report effect sizes
- Acknowledge limitations
- Avoid overconfidence
