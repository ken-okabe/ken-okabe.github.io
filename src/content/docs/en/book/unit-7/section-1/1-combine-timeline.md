---
title: 'Chapter 1: The Foundation of Everything: combineLatestWith'
description: >-
  combineLatestWith is what embodies the concept of the Applicative Functor
  established in Unit 4—the operation of "combining independent containers with
  a binary operation"—in the Timeline library. It is a concrete implementation
  of the Applicative operation, designed to combine multiple independent,
  asynchronous sources.
---
`combineLatestWith` is what embodies the concept of the Applicative Functor established in Unit 4—the operation of "combining independent containers with a binary operation"—in the `Timeline` library. It is a concrete implementation of the Applicative operation, designed to combine multiple independent, asynchronous sources.

The high-level composition functions that will appear in subsequent chapters, such as `anyOf` and `sumOf`, are all built on top of this primitive operation, `combineLatestWith`.

## Origin of the Name

The name `combineLatestWith` is a standard term used in other major reactive programming libraries (like RxJS) and accurately expresses its behavior. That is, it implies that it **combines** the **latest** values from multiple sources and generates a new value **with** the provided function.

## API Definition

#### F\#: `combineLatestWith: ('a -> 'b -> 'c) -> Timeline<'a> -> Timeline<'b> -> Timeline<'c>`

#### TS: `combineLatestWith<A, B, C>(f: (valA: A, valB: B) => C) => (timelineA: Timeline<A>) => (timelineB: Timeline<B>): Timeline<C>`

The type signature of `combineLatestWith` conforms to the `map2` pattern of the Applicative Functor we learned in Unit 4.

This signature is composed of the following elements:

1.  **`('a -> 'b -> 'c)`**: A binary operation function. It takes a value of type `'a` as the first argument and a value of type `'b` as the second argument, and returns a result of type `'c`.
2.  **`Timeline<'a>`**: The first source `Timeline`. The latest value of this `Timeline` is passed as the first argument to the binary operation function.
3.  **`Timeline<'b>`**: The second source `Timeline`. The latest value of this `Timeline` is passed as the second argument to the binary operation function.
4.  **`Timeline<'c>`**: The new `Timeline` that is generated as a result. The result of the binary operation function becomes the value of this `Timeline`.

## Behavior

The behavior of `combineLatestWith` is defined in two phases: **initialization** and **update**.

1.  **Initialization**: When the result `Timeline` is created, `combineLatestWith` immediately checks the current values of both source `Timeline`s and applies the binary operation function to determine the initial value of the result `Timeline`.

2.  **Update**: The result `Timeline` monitors both source `Timeline`s. Whenever **either** source is updated, it gets the **latest** current values from both sources, applies the binary operation function again, and defines a new value on the result `Timeline`.

## Practical Code Example

Let's create a `Timeline` that reactively calculates the sum of two independent counters.

```typescript
// TS
const counterA = Timeline(10);
const counterB = Timeline(20);

// Combine the two Timelines using a binary operation (+)
const sumTimeline = combineLatestWith((a: number, b: number) => a + b)(counterA)(counterB);

// The initial value is 10 + 20 = 30
console.log(sumTimeline.at(Now)); // 30

// Update counterA
console.log("Updating CounterA to 15...");
counterA.define(Now, 15);

// sumTimeline is automatically recalculated (15 + 20 = 35)
console.log("Current Sum after A updated: %d", sumTimeline.at(Now)); // 35
```

## Internal Implementation

Internally, this operation registers dependencies from the two source `Timeline`s to the result `Timeline` in `DependencyCore`. Also, by using the `FinalizationRegistry` in `timeline.ts` (equivalent to `GcRegistry` in F\#), it has a memory-safe design where these dependencies are automatically cleaned up when the result `Timeline` becomes eligible for garbage collection.

## Canvas Demo (Placeholder)
