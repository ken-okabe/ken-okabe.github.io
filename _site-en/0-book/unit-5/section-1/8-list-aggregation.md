# Chapter 8: Aggregating Lists of Booleans

**Chapter Goal:** This chapter extends the practical OR and AND logic developed for binary combinations (`TL.Or` and `TL.And` from Chapter 7) to handle collections (specifically, lists) of `Timeline<bool>` instances. We will demonstrate how the Monoidal nature of our refined combinators allows for elegant aggregation of multiple boolean timelines using the standard `List.fold` operation, introducing `TL.any` and `TL.all`. The reactive implications of such aggregations will also be discussed.

## 8.1 Introduction: Beyond Binary Combinations

In Chapter 7, we established `TL.Or` and `TL.And` as refined, `TL.zipWith`-based combinators for merging the state of *two* `Timeline<bool>` instances. These provide clear, Monoid-adherent ways to handle binary logical conditions.

However, many real-world scenarios involve more than two conditions. Consider:

*   A UI form where multiple sections must be valid before submission: `allChecksPassed = section1Valid |> TL.And section2Valid |> TL.And section3Valid |> ...`
*   An alerting system where an alarm triggers if *any* of several sensor timelines indicate an issue: `alert = sensorA_error |> TL.Or sensorB_error |> TL.Or sensorC_error |> ...`

In these cases, we have a *list* of boolean timelines (e.g., `validationChecks: list<Timeline<bool>>`) and need to derive a single `Timeline<bool>` that represents whether *all* conditions in the list are true, or if *any* condition in the list is true. This chapter explores how to build such n-ary (operating on multiple inputs) combinators, which we will name `TL.all` and `TL.any`.

## 8.2 Leveraging Monoids for Aggregation: The Power of `fold`

The key to elegantly aggregating a list of values lies in the concept of a **Monoid**. Recall from Chapter 2 and Chapter 7 that:

1.  A set of values (`Timeline<bool>`).
2.  An **associative** binary operation (`TL.Or` or `TL.And`).
3.  An **identity element** (`TL.FalseTimeline` for `TL.Or`, `TL.TrueTimeline` for `TL.And`).

The `List.fold` function is perfectly designed to work with Monoidal structures. It takes a binary combining function, an initial accumulator value (the Monoid's identity element), and a list, then iteratively applies the combining function.

Given that `(Timeline<bool>, TL.Or, TL.FalseTimeline)` and `(Timeline<bool>, TL.And, TL.TrueTimeline)` effectively form Monoids, we can use `List.fold` with `TL.Or` and `TL.And` for n-ary aggregation.

## 8.3 `TL.any`: Is At Least One Timeline True?

**Conceptual Goal:**
Given `timelines: list<Timeline<bool>>`, produce `resultTimeline: Timeline<bool>` that is `true` if *any* timeline in the input list is currently `true`.

**Implementation using `List.fold`:**
We define `TL.any` by folding over the input list using `TL.Or` (from Chapter 7) as the combining operation and `TL.FalseTimeline` (from Chapter 3) as the initial accumulator.

```fsharp
// Assumes TL.Or and TL.FalseTimeline are defined.
// TL.Or : Timeline<bool> -> Timeline<bool> -> Timeline<bool>
// TL.FalseTimeline : Timeline<bool> (always false)

module TL =
    // ... other TL definitions ...

    /// <summary>
    /// Given a list of boolean timelines, creates a new timeline that is true
    /// if any timeline in the input list is currently true.
    /// If the input list is empty, it returns TL.FalseTimeline.
    /// </summary>
    let any : list<Timeline<bool>> -> Timeline<bool> = // Renamed from anyTrueInList
        fun booleanTimelines ->
            let initialAccumulator : Timeline<bool> = FalseTimeline
            // List.fold applies accumulator as the first argument to the folder function.
            // TL.Or is defined as: fun timelineB timelineA -> timelineA |> TL.zipWith (||) timelineB
            // For `acc |> TL.Or elem`, `acc` is `timelineA` and `elem` is `timelineB`.
            // `List.fold folder acc elem` means `folder acc elem`.
            // So, the folder function should be: fun acc elem -> acc |> TL.Or elem
            List.fold (fun acc elem -> acc |> TL.Or elem) initialAccumulator booleanTimelines
```

**Explanation:**

1.  `initialAccumulator` is `TL.FalseTimeline`.
2.  `List.fold` iterates:
    *   For `t1`: `TL.FalseTimeline |> TL.Or t1` (simplifies to `t1`).
    *   For `t2`: `(current_accumulator) |> TL.Or t2`.
    *   And so on.

**Handling Empty List:**
`TL.any []` correctly returns `TL.FalseTimeline`.

**Reactivity:**
`TL.any [t1; t2; t3]` constructs a static reactive dependency graph like `((TL.FalseTimeline |> TL.Or t1) |> TL.Or t2) |> TL.Or t3`. Changes in `t1`, `t2`, or `t3` propagate through this chain of `TL.Or` operations.

**Example Usage:**

```fsharp
// Assume Timeline factory, Now, TL.at, TL.define, TL.any, TL.FalseTimeline are accessible.

let sensorA_active : Timeline<bool> = Timeline false
let sensorB_active : Timeline<bool> = Timeline false
let sensorC_active : Timeline<bool> = Timeline false

let anySensorActive : Timeline<bool> =
    [ sensorA_active; sensorB_active; sensorC_active ] |> TL.any 

printfn "Initial: Any sensor active? %b" (anySensorActive |> TL.at Now)
// Expected Output: Initial: Any sensor active? false

sensorB_active |> TL.define Now true
printfn "After B active: Any sensor active? %b" (anySensorActive |> TL.at Now)
// Expected Output: After B active: Any sensor active? true

sensorB_active |> TL.define Now false
printfn "After B inactive: Any sensor active? %b" (anySensorActive |> TL.at Now)
// Expected Output: After B inactive: Any sensor active? false
```

## 8.4 `TL.all`: Are All Timelines True?

**Conceptual Goal:**
Given `timelines: list<Timeline<bool>>`, produce `resultTimeline: Timeline<bool>` that is `true` only if *all* timelines in the input list are currently `true`.

**Implementation using `List.fold`:**
Define `TL.all` by folding with `TL.And` (from Chapter 7) and `TL.TrueTimeline` (from Chapter 3).

```fsharp
// Assumes TL.And and TL.TrueTimeline are defined.
// TL.And : Timeline<bool> -> Timeline<bool> -> Timeline<bool>
// TL.TrueTimeline : Timeline<bool> (always true)

module TL =
    // ... other TL definitions ...

    /// <summary>
    /// Given a list of boolean timelines, creates a new timeline that is true
    /// if all timelines in the input list are currently true.
    /// If the input list is empty, it returns TL.TrueTimeline.
    /// </summary>
    let all : list<Timeline<bool>> -> Timeline<bool> = // Renamed from allTrueInList
        fun booleanTimelines ->
            let initialAccumulator : Timeline<bool> = TrueTimeline
            List.fold (fun acc elem -> acc |> TL.And elem) initialAccumulator booleanTimelines
```

**Handling Empty List:**
`TL.all []` correctly returns `TL.TrueTimeline` (vacuously true).

**Reactivity:**
Similar to `TL.any`, `TL.all` constructs a static reactive chain.

**Example Usage:**

```fsharp
// Assume Timeline factory, Now, TL.at, TL.define, TL.all, TL.TrueTimeline are accessible.

let check1_passed : Timeline<bool> = Timeline true
let check2_passed : Timeline<bool> = Timeline true
let check3_passed : Timeline<bool> = Timeline false

let allChecksPassed : Timeline<bool> =
    [ check1_passed; check2_passed; check3_passed ] |> TL.all

printfn "Initial: All checks passed? %b" (allChecksPassed |> TL.at Now)
// Expected Output: Initial: All checks passed? false

check3_passed |> TL.define Now true
printfn "After check3 passed: All checks passed? %b" (allChecksPassed |> TL.at Now)
// Expected Output: After check3 passed: All checks passed? true

check1_passed |> TL.define Now false
printfn "After check1 failed: All checks passed? %b" (allChecksPassed |> TL.at Now)
// Expected Output: After check1 failed: All checks passed? false
```

## 8.5 Optimizing N-ary Combinators with `TL.distinctUntilChanged`

The output timelines from `TL.any` and `TL.all` can benefit from `TL.distinctUntilChanged` (Chapter 6) to prevent redundant downstream reactions if the final aggregated boolean state remains the same despite internal updates.

```fsharp
// Assume myTimelineList : list<Timeline<bool>> is defined
// Assume TL.any, TL.all, TL.distinctUntilChanged are accessible

// let efficientAny : Timeline<bool> = (myTimelineList |> TL.any) |> TL.distinctUntilChanged
// let efficientAll : Timeline<bool> = (myTimelineList |> TL.all) |> TL.distinctUntilChanged
```

*(Code example commented out as `myTimelineList` is not defined here, but the pattern is shown).*

## 8.6 Practical Considerations: Dynamic Lists of Timelines

The `TL.any` and `TL.all` implementations shown use `List.fold` on an input list known when the aggregation timeline is created. The `List.fold` builds a static reactive dependency graph.

If the list of timelines to aggregate is itself dynamic (e.g., tasks added/removed), the simple `List.fold` is insufficient as it doesn't react to changes *in the list structure*. Handling dynamic collections typically requires `TL.bind` (Unit 4) to reconstruct the aggregation when the list of timelines changes, or specialized dynamic collection combinators. This chapter focuses on aggregating an initially provided list.

## 8.7 Summary and Outlook: Basic Combinators for Unit 5 Section 1

We extended our refined binary logical combinators, `TL.Or` and `TL.And`, to n-ary versions, `TL.any` and `TL.all`, using `List.fold` and leveraging Monoidal properties. We noted `TL.distinctUntilChanged` for optimization and briefly considered dynamic list challenges.

Our toolkit for fundamental logical combinations on `Timeline<bool>` is largely complete, covering:

*   Monoid theory (Chapter 2).
*   Naive Monoidal OR/AND (Chapter 3).
*   Motivation for general tools (Chapter 4).
*   `TL.zipWith` (Chapter 5) and `TL.distinctUntilChanged` (Chapter 6).
*   Refined binary `TL.Or`/`TL.And` (Chapter 7).
*   N-ary `TL.any`/`TL.all` (this chapter).

This provides solid tools for reactive boolean states.

**Outlook: Applying to Non-Boolean Timelines**
How do we aggregate if source timelines aren't boolean (e.g., "all HTTP requests successful")? This involves mapping each non-boolean timeline (e.g., `Timeline<HttpResponse>`) to a `Timeline<bool>` (e.g., `response.IsSuccessStatusCode`), then applying `TL.any`/`TL.all`. This "map to boolean, then aggregate" pattern is explored in **Chapter 9: Practical Aggregation of Non-Boolean Timelines**.