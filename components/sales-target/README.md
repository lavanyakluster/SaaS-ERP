# Sales Target Analysis Dashboard

## Overview

The Sales Target Analysis Dashboard provides comprehensive insights into branch-level sales performance against targets. It helps management monitor achievement rates, identify top and bottom performers, and make data-driven decisions.

## Features

### 1. Overview Metrics (4 Cards)
- **Total Target**: Sum of all branch targets with branch count
- **Total Achieved**: Total sales achieved across all branches
- **Achievement Rate**: Overall percentage of target achieved
- **Variance**: Difference between achieved and target (with positive/negative indicators)

### 2. Branch Performance Statistics (4 Cards)
- **Total Branches**: Count of all active branches
- **Branches Achieving**: Number of branches meeting or exceeding targets
- **Branches With Targets**: Count of branches with targets set
- **Branches Under Target**: Number of branches requiring attention

### 3. Category Performance Chart
- Bar chart comparing target vs achieved by category
- Categories: Pharmacy (P), Medical (M), Van (V), Others (A)
- Automatic filtering of categories with no branches

### 4. Monthly Trend Analysis
- Composed chart showing target vs achievement over 12 months
- Line chart for achieved sales
- Bar chart for target amounts
- Interactive tooltips with formatted values

### 5. Achievement Distribution
- Pie chart showing distribution of branches by achievement percentage
- Ranges: 0-25%, 26-50%, 51-75%, 76-100%, 100%+
- Color-coded segments for easy identification
- Distribution summary table with branch counts and percentages

### 6. Top 10 Performing Branches
- Ranked list of best-performing branches
- Achievement percentage highlighted
- Target vs achieved amounts displayed
- Green-themed cards for positive reinforcement

### 7. Bottom 10 Performing Branches
- Ranked list of underperforming branches
- Red-themed cards for attention
- Helps identify branches needing support

### 8. Comprehensive Branch Table
- Sortable table with all branch data
- Columns: Branch Code, Branch Name, Target, Achieved, Variance, Achievement %
- Color-coded achievement badges:
  - Green: ≥100% (Exceeding target)
  - Blue: 75-99% (Near target)
  - Yellow: 50-74% (Below target)
  - Red: <50% (Critical)
- Hover effects for better UX

## API Integration

### Endpoint
```
GET /api/sales-target-analysis
```

### Parameters
- `dbyear`: Database year (e.g., 2026)
- `month`: Month in 2-digit format (01-12)
- `topN`: Number of top records (default: 100)
- `year`: Analysis year (e.g., 2026)

### Response Structure
```typescript
{
  table1: BranchTargetData[],  // Branch-level data
  table2: any[],                // Reserved for future use
  table3: MonthlyTargetTrend[]  // Monthly trend data
}
```

## Features by Organization Context

The dashboard automatically:
- Respects the selected organization context
- Uses the organization's API URL from the auth token
- Filters data by the current financial year
- Handles month selection for period analysis

## Responsive Design

- Desktop: Full grid layout with multiple columns
- Tablet: 2-column layout
- Mobile: Single column stacked view
- All charts are responsive using ResponsiveContainer

## Performance Optimizations

- React.memo for component optimization
- Efficient data processing with memoization
- Lazy loading of chart components
- Optimized filtering and sorting algorithms

## Color Scheme

- Primary: Blue (#3b82f6)
- Secondary: Gray (#6b7280)
- Success: Green (#10b981)
- Warning: Yellow (#fbbf24)
- Danger: Red (#ef4444)

## Usage

Navigate to: `Analytics > Sales Target Analysis` or visit `/dashboard/sales-target`

Select a month from the dropdown to view period-specific analysis.

## Data Calculations

### Achievement Percentage
```
Achievement % = (Achieved Amount / Target Amount) × 100
```

### Variance
```
Variance = Achieved Amount - Target Amount
```

### Category Totals
Automatically calculated by summing all branches within each category (P, M, V, A).

## Branch Categories

- **P**: Pharmacy branches (P01-P65)
- **M**: Medical branches (M01-M09)
- **V**: Van stores (V01-V23)
- **A**: Other branches (A01-A05)

## Empty States

The dashboard gracefully handles:
- No branch data available
- No targets set for the period
- Missing monthly trend data
- Null or zero values in API response

## Future Enhancements

- Export to Excel/PDF
- Branch comparison tool
- Target setting interface
- Alerts for underperforming branches
- Historical comparison (YoY, MoM)
- Drill-down to individual branch details
- Forecast predictions based on trends
