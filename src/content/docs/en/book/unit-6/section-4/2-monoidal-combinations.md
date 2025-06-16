---
title: 'Monoidal Combinations: TL.And & TL.Or'
description: >-
  With combineLatestWith as our foundational tool for binary combination, we can
  now construct higher-level, specific combinators for common tasks. The most
  frequent need is for logical combination: checking if two boolean timelines
  are both true (AND) or if at least one is true (OR).
---
With `combineLatestWith` as our foundational tool for binary combination, we can now construct higher-level, specific combinators for common tasks. The most frequent need is for logical combination: checking if two boolean timelines are both `true` (AND) or if at least one is `true` (OR).

In this chapter, we will build `TL.And` and `TL.Or`. We will demonstrate that by using `combineLatestWith` and the standard boolean operators, these new combinators naturally adhere to the algebraic laws of a **Monoid**. This provides a guarantee of robustness and predictability, which is critical for building complex reactive logic.

## Monoids: A Brief Recap

As we explored in Unit 2, a Monoid is a fundamental algebraic structure consisting of:

1.  A set of values (in our case, `Timeline<bool>`).
2.  A binary operation that is **associative** (e.g., `(a + b) + c = a + (b + c)`).
3.  An **identity element** (or "unit") that has no effect when combined with other values (e.g., `a + 0 = a`).

If our `TL.And` and `TL.Or` operations form Monoids, it means we can confidently combine long chains of conditions without worrying about the order of operations.

## `TL.And`: Logical Conjunction

We can define a logical AND combinator for timelines by simply providing the standard F# `&&` operator to `combineLatestWith`.

### Construction and Behavior

The implementation is remarkably concise:

```fsharp
module TL =
    // ... other definitions including combineLatestWith ...

    /// A Timeline<bool> that is perpetually true.
    /// It serves as the identity element for the TL.And monoidal operation.
    let TrueTimeline : Timeline<bool> = Timeline true

    /// Creates a timeline that is true only if both input timelines are true.
    /// This combinator effectively forms a Monoid with TL.TrueTimeline as its identity.
    let And (timelineA: Timeline<bool>) (timelineB: Timeline<bool>) : Timeline<bool> =
        // Note: We use nCombineLatestWith to handle potential nulls gracefully,
        // though for boolean logic this is less of a concern.
        nCombineLatestWith (&&) timelineA timelineB
```

The behavior of `TL.And` is directly inherited from `combineLatestWith`: it produces `true` if and only if the latest values from both source timelines are `true`.

### Monoid Properties

`TL.And` forms a valid Monoid with `TL.TrueTimeline` as its identity element.

1.  **Identity Law:** `TL.And TL.TrueTimeline timelineA` results in a timeline that behaves identically to `timelineA`, because `true && x` is always `x`. The same is true for the right identity. The law holds.
2.  **Associativity Law:** `TL.And (TL.And timelineA timelineB) timelineC` behaves identically to `TL.And timelineA (TL.And timelineB timelineC)`. This is guaranteed because the underlying `&&` operator is associative. The law holds.

## `TL.Or`: Logical Disjunction

Symmetrically, we define a logical OR combinator using the `||` operator.

### Construction and Behavior

```fsharp
module TL =
    // ... other definitions ...

    /// A Timeline<bool> that is perpetually false.
    /// It serves as the identity element for the TL.Or monoidal operation.
    let FalseTimeline : Timeline<bool> = Timeline false

    /// Creates a timeline that is true if either of the input timelines is true.
    /// This combinator effectively forms a Monoid with TL.FalseTimeline as its identity.
    let Or (timelineA: Timeline<bool>) (timelineB: Timeline<bool>) : Timeline<bool> =
        nCombineLatestWith (||) timelineA timelineB
```

`TL.Or` produces `true` if the latest value from at least one of the source timelines is `true`.

### Monoid Properties

`TL.Or` forms a valid Monoid with `TL.FalseTimeline` as its identity element.

1.  **Identity Law:** `TL.Or TL.FalseTimeline timelineA` behaves like `timelineA` because `false || x` is always `x`. The law holds.
2.  **Associativity Law:** `TL.Or` is associative because the underlying `||` operator is associative. The law holds.

## Example Usage

```fsharp
// Assume isUserLoggedIn and isFormValid are Timeline<bool>

// The form can be submitted only if the user is logged in AND the form is valid.
let canSubmit = TL.And isUserLoggedIn isFormValid

// An alert should be shown if an error occurs OR if a warning is present.
let showAlert = TL.Or hasError hasWarning

// For efficiency, especially with UI, remember the pattern from Section 3:
let efficientCanSubmit = canSubmit |> TL.distinctUntilChanged
```

By building our logical combinators on the foundation of `combineLatestWith` and verifying their Monoidal properties, we have created tools that are not only simple and practical but also mathematically sound and predictable.
