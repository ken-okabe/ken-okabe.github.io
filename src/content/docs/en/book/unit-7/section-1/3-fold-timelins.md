---
title: 'Chapter 3: foldTimelines — Folding with Monoids'
description: >-
  In Chapter 2, we learned how to combine two Timelines using binary operations
  that form a Monoid. In this chapter, we will extend that concept further and
  explore how to fold a list of Timelines (an arbitrary number of Timelines)
  into a single Timeline.
---
## Introduction

In Chapter 2, we learned how to combine two `Timeline`s using binary operations that form a **Monoid**. In this chapter, we will extend that concept further and explore how to fold a **list of `Timeline`s** (an arbitrary number of `Timeline`s) into a single `Timeline`.

The general-purpose tool for this is `foldTimelines`. This is an application of the standard folding operation in functional programming, `fold` (or `reduce`), to the world of `Timeline`, and it relies completely on the Monoid structure established in Chapter 2.

-----

## `foldTimelines`

#### F\#: `foldTimelines: (Timeline<'b> -> Timeline<'a> -> Timeline<'b>) -> Timeline<'b> -> list<Timeline<'a>> -> Timeline<'b>`

#### TS: `foldTimelines<A, B>(timelines: readonly Timeline<A>[], initialTimeline: Timeline<B>, accumulator: (acc: Timeline<B>, current: Timeline<A>) => Timeline<B>): Timeline<B>`

```typescript
// TS Implementation
export const foldTimelines = <A, B>(
    timelines: readonly Timeline<A>[],
    initialTimeline: Timeline<B>,
    accumulator: (acc: Timeline<B>, current: Timeline<A>) => Timeline<B>
): Timeline<B> => timelines.reduce(accumulator, initialTimeline);
```

`foldTimelines` takes a list of `Timeline`s and generates a single `Timeline` by successively applying the "binary operation" of a Monoid to the elements of the list, using the "identity element" of the Monoid as the initial value.

The breakdown of the arguments corresponds perfectly to the components of a Monoid:

  * `timelines`: The list of `Timeline`s to be folded.
  * `initialTimeline`: The **identity element** of the Monoid (the initial value for the fold).
  * `accumulator`: The **binary operation** of the Monoid (e.g., `orOf` as defined in Chapter 2).

-----

## Derivation of High-Level APIs

The true value of `foldTimelines` is that intuitive high-level APIs like `anyOf` and `sumOf` can be realized simply by combining `foldTimelines` with various Monoids, without needing any special implementation. They are merely thin wrappers around `foldTimelines`.

### `anyOf`

#### F\#: `anyOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `anyOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

```typescript
// TS Implementation
export const anyOf = (booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean> => {
    return foldTimelines(booleanTimelines, FalseTimeline, orOf);
};
```

Logical OR across multiple boolean timelines. This is derived by applying `foldTimelines` using the **Logical OR Monoid**:

  * **Identity Element**: `Timeline(false)`
  * **Binary Operation**: `orOf`

<!-- end list -->

```typescript
// TS Usage Example
const flags = [Timeline(true), Timeline(false), Timeline(false)];
const hasAnyTrue = anyOf(flags);
console.log(hasAnyTrue.at(Now)); // true
```

### `allOf`

#### F\#: `allOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `allOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

```typescript
// TS Implementation
export const allOf = (booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean> => {
    return foldTimelines(booleanTimelines, TrueTimeline, andOf);
};
```

Logical AND across multiple boolean timelines. This is derived using the **Logical AND Monoid**:

  * **Identity Element**: `Timeline(true)`
  * **Binary Operation**: `andOf`

<!-- end list -->

```typescript
// TS Usage Example
const flags = [Timeline(true), Timeline(true), Timeline(false)];
const allTrue = allOf(flags);
console.log(allTrue.at(Now)); // false
```

### `sumOf`

#### TS: `sumOf(numberTimelines: readonly Timeline<number>[]): Timeline<number>`

```typescript
// TS Implementation
export const sumOf = (numberTimelines: readonly Timeline<number>[]): Timeline<number> => {
    return foldTimelines(numberTimelines, Timeline(0), addOf);
};
```

Sum of multiple number timelines. This is derived using the **Addition Monoid**:

  * **Identity Element**: `Timeline(0)`
  * **Binary Operation**: `addOf`

<!-- end list -->

```typescript
// TS Usage Example
const numbers = [Timeline(10), Timeline(20), Timeline(30)];
const total = sumOf(numbers);
console.log(total.at(Now)); // 60
```

### `maxOf`

#### TS: `maxOf(timelines): Timeline<number>`

```typescript
// TS Implementation
export const maxOf = (numberTimelines: readonly Timeline<number>[]): Timeline<number> => {
    return foldTimelines(numberTimelines, Timeline(-Infinity), maxOf2);
};
```

Maximum value across multiple number timelines. This is derived from a **Maximum Monoid**:

  * **Identity Element**: `Timeline(-Infinity)`
  * **Binary Operation**: A binary `max` function for timelines.

<!-- end list -->

```typescript
// TS Usage Example
const numbers = [Timeline(10), Timeline(50), Timeline(30)];
const maximum = maxOf(numbers);
console.log(maximum.at(Now)); // 50
```

### `minOf`

#### TS: `minOf(timelines): Timeline<number>`

```typescript
// TS Implementation
export const minOf = (numberTimelines: readonly Timeline<number>[]): Timeline<number> => {
    return foldTimelines(numberTimelines, Timeline(Infinity), minOf2);
};
```

Minimum value across multiple number timelines. This is derived from a **Minimum Monoid**:

  * **Identity Element**: `Timeline(Infinity)`
  * **Binary Operation**: A binary `min` function for timelines.

<!-- end list -->

```typescript
// TS Usage Example
const numbers = [Timeline(10), Timeline(50), Timeline(30)];
const minimum = minOf(numbers);
console.log(minimum.at(Now)); // 10
```

### `averageOf`

#### TS: `averageOf(timelines): Timeline<number>`

```typescript
// TS Implementation
export const averageOf = (numberTimelines: readonly Timeline<number>[]): Timeline<number> => {
    if (numberTimelines.length === 0) return Timeline(0);
    return sumOf(numberTimelines).map(sum => sum / numberTimelines.length);
};
```

Average of multiple number timelines. While not a simple monoid, this is conceptually similar. It can be derived by folding to find the `sumOf` and the count of timelines, then creating a new timeline that divides them.

```typescript
// TS Usage Example
const numbers = [Timeline(10), Timeline(20), Timeline(30)];
const avg = averageOf(numbers);
console.log(avg.at(Now)); // 20
```

### `listOf`

#### F\#: `listOf: list<Timeline<'a>> -> Timeline<'a list>`

#### TS: `listOf<A>(timelines: readonly Timeline<A>[]): Timeline<A[]>`

```typescript
// TS Implementation
export const listOf = <A>(
    timelines: readonly Timeline<A>[]
): Timeline<A[]> => {
    const emptyArrayTimeline = Timeline<A[]>([]);
    return foldTimelines(timelines, emptyArrayTimeline, concatOf) as Timeline<A[]>;
};
```

Combines multiple timelines into a single timeline holding an array of their values. This is derived from the **Array Monoid** emphasized in Chapter 2:

  * **Identity Element**: `Timeline([])`
  * **Binary Operation**: `concatOf`

Since this function can simply combine multiple `Timeline`s into a single `Timeline` holding an array of their values, it is easy for an AI to handle when generating code and tends to be used preferentially.

```typescript
// TS Usage Example
const items = [Timeline("a"), Timeline("b"), Timeline("c")];
const list = listOf(items);
console.log(list.at(Now)); // ["a", "b", "c"]
```

-----

## Conclusion

It is now clear that the high-level API group, including `anyOf` and `sumOf`, is not a collection of ad-hoc, individual functions. They are all derived with mathematical necessity from a single general abstraction, `foldTimelines`, and the Monoid structure that each type possesses.

This hierarchical structure of `combineLatestWith` (Applicative) → binary operation (Monoid) → `foldTimelines` → high-level API is the core of this library's design beauty and the robustness that eliminates code duplication.

## Canvas Demo (Placeholder)
