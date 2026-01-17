# 🎯 Model Selection Logic - Brief Guide

## Overview
The system ranks models using weighted scoring based on three metrics: **Quality (0-10)**, **Response Time (ms)**, and **Cost ($)**. Each preference applies different weights to create optimal recommendations.

## Normalization (Convert to 0-10 Scale)
```
normalizedCost = (1.0 / cost) × 10      // Lower cost = higher score
normalizedSpeed = (800 / responseTime) × 10  // Lower time = higher score
quality = quality (already 0-10)
```

## Preferences & Formulas

| Preference | Formula | Best For |
|-----------|---------|----------|
| **Balanced** | 0.4Q + 0.3S + 0.3C | General use |
| **Quality** | Sort by Quality (descending) | Critical accuracy |
| **Latency** | Sort by ResponseTime (ascending) | Real-time apps |
| **Cost** | Sort by Cost (ascending) | Budget projects |
| **Quality+Latency** | 0.6Q + 0.4S | Fast & accurate |
| **Quality+Cost** | 0.6Q + 0.4C | Cheap & good |
| **Latency+Cost** | 0.5S + 0.5C | High-volume |

**Key:** Q = Quality, S = NormalizedSpeed, C = NormalizedCost

## Quick Examples

### Example 1: Customer Support (Quality+Latency)
```
Models:
- gpt-4o:       Quality=9.2, Speed=10, Cost=4
- gpt-4o-mini:  Quality=8.5, Speed=12, Cost=10
- claude-opus:  Quality=9.1, Speed=8, Cost=3

Scores (60% Q, 40% S):
- gpt-4o:       0.6(9.2) + 0.4(10) = 9.52 ⭐
- gpt-4o-mini:  0.6(8.5) + 0.4(12) = 9.9
- claude-opus:  0.6(9.1) + 0.4(8) = 8.66

Winner: gpt-4o-mini (fast AND accurate enough)
```

### Example 2: Medical Analysis (Quality Only)
```
Sort by quality descending:
- gpt-4o:       9.2 ⭐
- claude-opus:  9.1
- gpt-4o-mini:  8.5

Winner: gpt-4o (highest accuracy matters most)
```

### Example 3: Bulk Processing (Latency+Cost)
```
Models with normalized scores (50% Speed, 50% Cost):
- gpt-4o:       0.5(10) + 0.5(4) = 7.0
- gpt-4o-mini:  0.5(12) + 0.5(10) = 11.0 ⭐
- claude-opus:  0.5(8) + 0.5(3) = 5.5

Winner: gpt-4o-mini (fast AND cheap)
```

## Why Normalization?
Raw metrics have different scales (Quality: 0-10, Time: 300-1000ms, Cost: $0.0001-0.01). We convert all to 0-10 scale so we can use weighted averages fairly.

## Why These Weights?
- **Balanced (0.4, 0.3, 0.3):** Quality slightly more important; speed & cost equal
- **Quality+Latency (0.6, 0.4):** Quality is 1.5x more important than speed
- **Quality+Cost (0.6, 0.4):** Quality is 1.5x more important than cost
- **Latency+Cost (0.5, 0.5):** Speed and cost equally critical

## Code Reference
See `llm_model_router.js` functions:
- `normalizeSpeed()` & `normalizeCost()` - Convert metrics to 0-10 scale
- `hybridScore()` - Calculate weighted score
- `selectModel()` - Rank models by preference

---
**Last Updated:** January 18, 2026
