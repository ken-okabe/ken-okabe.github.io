---
title: n-Series Composition Functions
description: The n-series composition functions defined in timeline.ts are as follows.
---
The `n`-series composition functions defined in `timeline.ts` are as follows.

### Binary Operations

- **`nCombineLatestWith`**: Combines two nullable `Timeline`s by applying a binary operation function only if both values are not null.

### Aggregate Operations

- **`nAnyOf`**: Computes the logical OR of multiple nullable `boolean` `Timeline`s.
- **`nAllOf`**: Computes the logical AND of multiple nullable `boolean` `Timeline`s.
- **`nSumOf`**: Computes the sum of multiple nullable `number` `Timeline`s.
- **`nListOf`**: Combines multiple nullable `Timeline`s into a single nullable `Timeline` holding an array of their values.

### N-ary Operations

- **`nCombineLatest`**: Combines an arbitrary number of nullable `Timeline`s by applying an N-ary composition function only if all values are not null.
