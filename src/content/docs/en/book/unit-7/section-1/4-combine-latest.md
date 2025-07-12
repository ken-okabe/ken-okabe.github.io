---
title: 'Chapter 4: N-ary Operations — combineLatest'
description: >-
  foldTimelines, which we learned about in Chapter 3, is very powerful for
  operations that sequentially fold a list using a single Monoid (+ or concat),
  such as sumOf or listOf. However, there are cases where we want to handle more
  complex relationships between N terms that cannot be expressed by a simple
  fold, such as (a + b) / c.
---
## Introduction

`foldTimelines`, which we learned about in Chapter 3, is very powerful for operations that sequentially fold a list using a single Monoid (`+` or `concat`), such as `sumOf` or `listOf`. However, there are cases where we want to handle more complex relationships between N terms that cannot be expressed by a simple fold, such as `(a + b) / c`.

`combineLatest` is what realizes such general-purpose N-ary operations that cannot be expressed by `fold`. It is the most powerful primitive for combining an arbitrary number of `Timeline`s with a single N-ary function.

## `combineLatest` API

#### F\#: `combineLatest: ('a array -> 'r) -> list<Timeline<'a>> -> Timeline<'r>`

#### TS: `combineLatest<T extends readonly Timeline<any>[], R>(combinerFn: (...values: TimelinesToValues<T>) => R) => (timelines: T): Timeline<R>`

`combineLatest` takes a list (or tuple) of `Timeline`s and an N-ary composition function (`combinerFn`) that takes the latest values of those `Timeline`s as arguments.

## Practical Code Example

Let's look at an example of performing the calculation `(a + b) / c` using three `Timeline`s. This cannot be achieved with a simple `fold`.

```typescript
// TS
const timelineA = Timeline(10);
const timelineB = Timeline(2);
const timelineC = Timeline(5);

const timelines = [timelineA, timelineB, timelineC] as const;

// A combinerFn that takes the latest values of the three Timelines and performs a complex calculation
const resultTimeline = combineLatest(
    (a, b, c) => (a + b) / c
)(timelines);

// The initial value is (10 + 2) / 5 = 2.4
console.log(resultTimeline.at(Now)); // 2.4

// When timelineC is updated, it is immediately recalculated
timelineC.define(Now, 6);

// The new value is (10 + 2) / 6 = 2
console.log(resultTimeline.at(Now)); // 2
```

## Conclusion

`combineLatest` is a general-purpose function that can be considered a "last resort" for handling any N-ary composition logic that does not fit the pattern of `fold`.

This completes the hierarchy of the library's composition functions. By using the high-level APIs from Chapter 3 for simple Monoidal folds, and `combineLatest` for more complex and special cases, you can handle any pattern of `Timeline` composition declaratively and robustly.

## Canvas Demo (Placeholder)
