---
title: 'Chapter 7: Boolean Combinators with TL.zipWith'
description: >-
  Chapter Goal: This chapter demonstrates how to construct practical and
  efficient boolean combinators (TL.Or and TL.And) for Timeline<bool> by
  leveraging the TL.zipWith combinator (introduced in Chapter 5) and standard
  boolean operators. It clarifies their relationship to Monoid principles,
  compares them to the "naive" implementations (Chapter 3), and highlights their
  utility when combined with TL.distinctUntilChanged.
---
**Chapter Goal:** This chapter demonstrates how to construct practical and efficient boolean combinators (`TL.Or` and `TL.And`) for `Timeline<bool>` by leveraging the `TL.zipWith` combinator (introduced in Chapter 5) and standard boolean operators. It clarifies their relationship to Monoid principles, compares them to the "naive" implementations (Chapter 3), and highlights their utility when combined with `TL.distinctUntilChanged`.

---

## 7.1 Introduction: Practical Boolean Logic with a General Tool

### 7.1.1 Recap: The Need for Practical Combinators (from Chapter 4)

In Chapter 3, we explored the "naive" Monoidal implementations, `TL.naiveOr` and `TL.naiveAnd`. These provided a foundational understanding of how `Timeline<bool>` can embody algebraic structures directly from `Timeline` fundamentals, ensuring adherence to Monoid laws. This is invaluable for establishing the theoretical soundness of combining reactive boolean conditions.

However, as discussed in Chapter 4 ("Need for General Combinators and Efficiency"), while these naive implementations are algebraically correct, a mature `Timeline` library also benefits from combinators that offer greater ease of use, leverage general-purpose tools for conciseness, and integrate well with efficiency-enhancing utilities. Relying solely on bespoke naive implementations for every type of combination can lead to boilerplate and might not always offer the most straightforward approach for common tasks.

### 7.1.2 Introducing `TL.zipWith` as the Foundation (from Chapter 5)

Chapter 5 introduced `TL.zipWith` as a highly versatile, general-purpose combinator for the point-wise combination of two timelines. Its signature, `val zipWith<'a, 'b, 'c> : ('a -> 'b -> 'c) -> Timeline<'b> -> Timeline<'a> -> Timeline<'c>`, allows us to take any two source timelines and a binary function to produce a new timeline.

This chapter will demonstrate how this powerful `TL.zipWith` can be used as the foundation for creating our "refined" boolean logical combinators: `TL.Or` and `TL.And`. By simply providing the standard F# boolean operators `||` (for OR) and `&&` (for AND) as the combining function to `TL.zipWith`, we can achieve the desired logical combinations in an elegant, practical, and algebraically sound manner.

---

## 7.2 Logical OR with `TL.zipWith`: Defining `TL.Or`

We begin by constructing a practical OR combinator for `Timeline<bool>` using `TL.zipWith`. This "refined" version aims to provide the same logical outcome as `TL.naiveOr` but with an implementation based on our general point-wise combination tool.

### 7.2.1 Construction using `TL.zipWith (||)`

The core idea is remarkably straightforward: we use `TL.zipWith` and supply the standard F# boolean OR operator (`||`) as the combining function.

If `timelineA` and `timelineB` are `Timeline<bool>` instances, their OR combination is:
`timelineA |> TL.zipWith (||) timelineB`

**Behavior:**
The behavior of this combined timeline is directly inherited from the rules of `TL.zipWith` (as detailed in Chapter 5, Section 5.3):

*   **Initialization:**
    *   The resulting timeline is initialized by applying `||` to the initial values of `timelineA` and `timelineB`. Since `Timeline<bool>` instances are expected to hold non-`null` boolean values (`true` or `false`), the initial output will be `(initialValA || initialValB)`.
*   **Updates:**
    *   Whenever `timelineA` or `timelineB` is updated (via `TL.define`), `TL.zipWith` retrieves the latest current values from both.
    *   It then applies the `||` operator to these latest values: `latestValA || latestValB`.
    *   The result of this `||` operation is then defined onto the combined timeline, triggering its own downstream updates.

**F# Code Example (Basic Usage):**

```fsharp
// Assume Timeline factory, Now, TL.at, TL.define, TL.zipWith are accessible

let condition1 : Timeline<bool> = Timeline false
let condition2 : Timeline<bool> = Timeline true

// Combining function is the standard F# OR operator (||)
let combinedOrCondition : Timeline<bool> = condition1 |> TL.zipWith (||) condition2

printfn "Initial OR State: %b" (combinedOrCondition |> TL.at Now)
// Expected Output: Initial OR State: true (false || true)

condition1 |> TL.define Now true
printfn "After condition1 becomes true: %b" (combinedOrCondition |> TL.at Now)
// Expected Output: After condition1 becomes true: true (true || true)

condition2 |> TL.define Now false
printfn "After condition2 becomes false: %b" (combinedOrCondition |> TL.at Now)
// Expected Output: After condition2 becomes false: true (true || false)

condition1 |> TL.define Now false
printfn "After condition1 also becomes false: %b" (combinedOrCondition |> TL.at Now)
// Expected Output: After condition1 also becomes false: false (false || false)
```

This example shows the expected reactive logical OR behavior.

### 7.2.2 Comparison with `TL.naiveOr` (from Chapter 3)

*   **Implementation Strategy:** `TL.naiveOr` was conceptually built using direct `Timeline` manipulations. The `TL.zipWith (||)` approach reuses the general-purpose `TL.zipWith`.
*   **Behavioral Equivalence:** For `Timeline<bool>` (non-`null` boolean values), `timelineA |> TL.zipWith (||) timelineB` should behave identically to `timelineA |> TL.naiveOr timelineB`.
*   **`null` Handling by `TL.zipWith`:** `TL.zipWith`'s general `null` handling (Chapter 5) doesn't typically affect `Timeline<bool>` with `TL.FalseTimeline`, as these present non-`null` booleans to `(||)`.

### 7.2.3 Monoid Properties of `TL.Or`

This `TL.zipWith (||)` approach, which forms our `TL.Or`, adheres to Monoid laws with `TL.FalseTimeline` (`Timeline false`) as the identity.

1.  **Identity Law:**
    *   **Left Identity:** `TL.FalseTimeline |> TL.zipWith (||) timelineA` results in `false || valA = valA`. Behaves like `timelineA`.
    *   **Right Identity:** `timelineA |> TL.zipWith (||) TL.FalseTimeline` results in `valA || false = valA`. Behaves like `timelineA`.
    *   The identity law holds.

2.  **Associativity Law:**
    *   `(tA |> TL.zipWith (||) tB) |> TL.zipWith (||) tC` behaves identically to `tA |> TL.zipWith (||) (tB |> TL.zipWith (||) tC)`.
    *   This holds because standard `||` is associative, and `TL.zipWith` applies it to current values.
    *   The associativity law holds.

Thus, `timelineA |> TL.zipWith (||) timelineB` effectively forms a Monoid with `TL.FalseTimeline`.

### 7.2.4 Convenience Helper: `TL.Or` Function Definition

A named helper function `TL.Or` improves readability. This aligns with the `Timeline.fs` code where this function is named `Or`.

```fsharp
module TL =
    // ... other definitions including zipWith, FalseTimeline ...

    /// <summary>
    /// Creates a timeline that is true if either of the input timelines is true.
    /// This is a refined OR combinator implemented using TL.zipWith (||).
    /// It effectively forms a Monoid with TL.FalseTimeline as its identity.
    /// </summary>
    let Or : Timeline<bool> -> Timeline<bool> -> Timeline<bool> = // Renamed to TL.Or
        fun timelineB timelineA -> // For pipeline: timelineA |> TL.Or timelineB
            timelineA |> TL.zipWith (||) timelineB
```

**Example Usage:**

```fsharp
// let hasAttention : Timeline<bool> = isMouseOver |> TL.Or hasFocus // Using the new TL.Or
```

### 7.2.5 Optimizing `TL.Or` with `TL.distinctUntilChanged` (from Chapter 6)

The output of `TL.Or` can benefit from `TL.distinctUntilChanged` to prevent propagation if the logical OR result remains the same.

```fsharp
// Assume Timeline factory, Now, TL.at, TL.define, TL.Or, TL.distinctUntilChanged are accessible

let eventStreamA : Timeline<bool> = Timeline false
let eventStreamB : Timeline<bool> = Timeline false

let combinedUsingOr : Timeline<bool> = eventStreamA |> TL.Or eventStreamB // Using TL.Or

let efficientCombinedOr : Timeline<bool> =
    combinedUsingOr
    |> TL.distinctUntilChanged
```

This ensures propagation only on actual changes in the logical OR state.

### 7.2.6 Practical Advantages and Use Cases for `TL.Or`

This `TL.zipWith (||)` approach, encapsulated as `TL.Or`, offers:

*   Simplicity and Clarity.
*   Leverages Existing Tools (`TL.zipWith`).
*   Good Default Behavior.
*   Monoid Properties with `TL.FalseTimeline`.

**Common Use Cases:** UI element states, event flag aggregation, feature toggles.

---

## 7.3 Logical AND with `TL.zipWith`: Defining `TL.And`

Symmetrically, we construct a practical AND combinator using `TL.zipWith (&&)`.

### 7.3.1 Construction using `TL.zipWith (&&)`

The AND combination is: `timelineA |> TL.zipWith (&&) timelineB`

**Behavior:** Inherited from `TL.zipWith`.

*   **Initialization:** Output is `(initialValA && initialValB)`.
*   **Updates:** Output is `latestValA && latestValB`.

**F# Code Example (Basic Usage):**

```fsharp
// Assume Timeline factory, Now, TL.at, TL.define, TL.zipWith are accessible

let conditionX : Timeline<bool> = Timeline true
let conditionY : Timeline<bool> = Timeline false

let combinedAndCondition : Timeline<bool> = conditionX |> TL.zipWith (&&) conditionY

printfn "Initial AND State: %b" (combinedAndCondition |> TL.at Now)
// Expected Output: Initial AND State: false (true && false)

conditionY |> TL.define Now true
printfn "After conditionY becomes true: %b" (combinedAndCondition |> TL.at Now)
// Expected Output: After conditionY becomes true: true (true && true)

conditionX |> TL.define Now false
printfn "After conditionX becomes false: %b" (combinedAndCondition |> TL.at Now)
// Expected Output: After conditionX becomes false: false (false && true)
```

### 7.3.2 Comparison with `TL.naiveAnd` (from Chapter 3)

*   **Implementation Strategy:** `TL.naiveAnd` (direct) vs. `TL.zipWith (&&)` (general tool).
*   **Behavioral Equivalence:** Identical for non-`null` `Timeline<bool>`.
*   **`null` Handling by `TL.zipWith`:** Usually no impact with `TL.TrueTimeline`.

### 7.3.3 Monoid Properties of `TL.And`

This approach forms a Monoid with `TL.TrueTimeline` (`Timeline true`) as identity.

1.  **Identity Law:**
    *   **Left Identity:** `TL.TrueTimeline |> TL.zipWith (&&) timelineA` results in `true && valA = valA`.
    *   **Right Identity:** `timelineA |> TL.zipWith (&&) TL.TrueTimeline` results in `valA && true = valA`.
    *   Holds.

2.  **Associativity Law:**
    *   `(tA |> TL.zipWith (&&) tB) |> TL.zipWith (&&) tC` behaves identically to `tA |> TL.zipWith (&&) (tB |> TL.zipWith (&&) tC)`.
    *   Holds due to associativity of standard `&&`.

Thus, `timelineA |> TL.zipWith (&&) timelineB` effectively forms a Monoid with `TL.TrueTimeline`.

### 7.3.4 Convenience Helper: `TL.And` Function Definition

A named helper `TL.And` (aligning with `Timeline.fs` `And`).

```fsharp
module TL =
    // ... other definitions including zipWith, TrueTimeline ...

    /// <summary>
    /// Creates a timeline that is true only if both input timelines are true.
    /// This is a refined AND combinator implemented using TL.zipWith (&&).
    /// It effectively forms a Monoid with TL.TrueTimeline as its identity.
    /// </summary>
    let And : Timeline<bool> -> Timeline<bool> -> Timeline<bool> = // Renamed to TL.And
        fun timelineB timelineA -> // For pipeline: timelineA |> TL.And timelineB
            timelineA |> TL.zipWith (&&) timelineB
```

**Example Usage:**

```fsharp
// let formReadyToSubmit : Timeline<bool> = allFieldsValid |> TL.And termsAccepted // Using TL.And
```

### 7.3.5 Optimizing `TL.And` with `TL.distinctUntilChanged` (from Chapter 6)

Apply `TL.distinctUntilChanged` to prevent redundant propagations if the logical AND result is unchanged.

```fsharp
// Assume Timeline factory, Now, TL.at, TL.define, TL.And, TL.distinctUntilChanged are accessible

let inputA_isValid : Timeline<bool> = Timeline true
let inputB_isValid : Timeline<bool> = Timeline true

let formIsValid_refined : Timeline<bool> = inputA_isValid |> TL.And inputB_isValid // Using TL.And

let efficientFormIsValid : Timeline<bool> =
    formIsValid_refined
    |> TL.distinctUntilChanged
```

### 7.3.6 Practical Advantages and Use Cases for `TL.And`

Offers simplicity, clarity, and Monoidal robustness.
**Common Use Cases:** Form validation, permission checks, state machine transitions, resource availability.

---

## 7.4 Summary: Refined Boolean Combinators

### 7.4.1 `TL.Or` and `TL.And` as Robust and Practical Tools

In this chapter, we have constructed `TL.Or` and `TL.And`, our refined combinators for boolean logic on `Timeline<bool>`, both implemented using `TL.zipWith`.

We demonstrated that:

*   `TL.Or` forms a Monoid with `TL.FalseTimeline`.
*   `TL.And` forms a Monoid with `TL.TrueTimeline`.

These offer an excellent balance of algebraic soundness, ease of implementation, and intuitive behavior.

### 7.4.2 Relationship to Naive Implementations

`TL.naiveOr` and `TL.naiveAnd` (Chapter 3) provide foundational understanding. The `TL.zipWith`-based `TL.Or` and `TL.And` in this chapter offer practical advantages. For `Timeline<bool>`, `TL.zipWith` is a fitting general tool to lift boolean Monoids.
For optimal performance, outputs should typically be piped through `TL.distinctUntilChanged`.

### 7.4.3 Looking Ahead: Aggregating Multiple Timelines (to Chapter 8)

With these binary Monoidal operations (`TL.Or`, `TL.And`) defined, we can extend this logic to collections. The next chapter (**Chapter 8: Aggregating Lists of Booleans**) will explore n-ary combinators (`TL.any`, `TL.all`).
