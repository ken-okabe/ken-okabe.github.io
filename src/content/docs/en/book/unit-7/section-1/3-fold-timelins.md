---
title: 'Chapter 3: foldTimelines — Folding with Monoids'
description: >-
  In Chapter 2, we learned how to combine two Timelines using binary operations
  that form a Monoid. In this chapter, we will extend that concept further and
  explore how to fold a list of Timelines (an arbitrary number of Timelines)
  into a single Timeline.
---
## Introduction

In Chapter 2, we learned how to combine two `Timeline`s using binary operations that form a Monoid. In this chapter, we will extend that concept further and explore how to fold a **list** of `Timeline`s (an arbitrary number of `Timeline`s) into a single `Timeline`.

The general-purpose tool for this is `foldTimelines`. This is an application of the standard folding operation in functional programming, `fold` (or `reduce`), to the world of `Timeline`, and it relies completely on the Monoid structure established in Chapter 2.

## `foldTimelines` API

#### F\#: `foldTimelines: (Timeline<'b> -> Timeline<'a> -> Timeline<'b>) -> Timeline<'b> -> list<Timeline<'a>> -> Timeline<'b>`

#### TS: `foldTimelines<A, B>(timelines: readonly Timeline<A>[], initialTimeline: Timeline<B>, accumulator: (acc: Timeline<B>, current: Timeline<A>) => Timeline<B>): Timeline<B>`

`foldTimelines` takes a list of `Timeline`s and generates a single `Timeline` by successively applying the "binary operation" of a Monoid to the elements of the list, using the "identity element" of the Monoid as the initial value.

The breakdown of the arguments corresponds perfectly to the components of a Monoid:

- `timelines`: The list of `Timeline`s to be folded.

- `initialTimeline`: The **identity element** of the Monoid (the initial value for the fold).

- `accumulator`: The **binary operation** of the Monoid (e.g., `orOf` as defined in Chapter 2).

## Derivation of High-Level APIs

The true value of `foldTimelines` is that intuitive high-level APIs like `anyOf` and `sumOf` can be realized simply by combining `foldTimelines` with various Monoids, without needing any special implementation. They are merely thin wrappers around `foldTimelines`.

### `anyOf`

#### F\#: `anyOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `anyOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

This is derived by applying `foldTimelines` to a list of `boolean`s, using "identity element `Timeline(false)`" and "binary operation `orOf`."

#### Implementation Code

```typescript
// TS
export const anyOf = (booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean> => {
    return foldTimelines(booleanTimelines, FalseTimeline, orOf);
};
```

### `allOf`

#### F\#: `allOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `allOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

Derived from "identity element `Timeline(true)`" and "binary operation `andOf`."

### `sumOf`

#### TS: `sumOf(numberTimelines: readonly Timeline<number>[]): Timeline<number>`

Derived from "identity element `Timeline(0)`" and "binary operation `addOf`."

### `listOf`

#### F\#: `listOf: list<Timeline<'a>> -> Timeline<'a list>`

#### TS: `listOf<A>(timelines: readonly Timeline<A>[]): Timeline<A[]>`

Derived from the **Array Monoid** emphasized in Chapter 2, namely "identity element `Timeline([])`" and "binary operation `concatOf`." Since this function can simply combine multiple `Timeline`s into a single `Timeline` holding an array of their values, it is easy for an AI to handle when generating code and tends to be used preferentially.

## Conclusion

It is now clear that the high-level API group, including `anyOf` and `sumOf`, is not a collection of ad-hoc, individual functions. They are all derived with mathematical necessity from a single general abstraction, `foldTimelines`, and the Monoid structure that each type possesses.

This hierarchical structure of `combineLatestWith` (Applicative) → binary operation (Monoid) → `foldTimelines` → high-level API is the core of this library's design beauty and the robustness that eliminates code duplication.

## Canvas Demo (Placeholder)
