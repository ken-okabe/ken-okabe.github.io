---
title: 'Chapter 6: Filtering Timelines – TL.distinctUntilChanged'
description: >-
  Chapter Goal: This chapter formally introduces the TL.distinctUntilChanged
  combinator. We will explain its purpose, functionality, and use cases,
  highlighting its role as a crucial tool for addressing the efficiency concerns
  related to redundant updates, which were identified as a practical
  consideration in Chapter 4: Need for General Combinators and Efficiency.
---
**Chapter Goal:**
This chapter formally introduces the `TL.distinctUntilChanged` combinator. We will explain its purpose, functionality, and use cases, highlighting its role as a crucial tool for addressing the efficiency concerns related to redundant updates, which were identified as a practical consideration in **Chapter 4: Need for General Combinators and Efficiency**.

## 6.1 The Problem of Redundant Updates (Connecting to Chapter 4)

In **Chapter 4: Need for General Combinators and Efficiency**, we discussed how various timeline operations, including the naive Monoidal combinators (`TL.naiveOr` and `TL.naiveAnd` from Chapter 3), or even simple `TL.map` transformations (Unit 5), might propagate new events downstream even if the actual logical value they represent hasn't changed. For instance, if a `Timeline<bool>` representing `isReady` is already `true`, and an input causes it to re-evaluate to `true` again, an event carrying `true` is still propagated.

While correct from a "value at this instant" perspective, this can lead to inefficiencies:

*   **Unnecessary downstream computations:** Other timelines or reactions depending on `isReady` might be triggered, performing work that yields the same result as before.
*   **Redundant UI updates:** If `isReady` drives a UI element, the element might be instructed to re-render itself with the same state.

This motivates the need for a mechanism to filter out such consecutive, identical updates, ensuring that only genuine changes in value trigger further reactive processing.

## 6.2 Revisiting `TL.define`: Why Events Always Propagate by Default

To understand why `TL.distinctUntilChanged` is necessary, let's revisit the fundamental behavior of `TL.define`, the core operation for introducing a new value into a `Timeline`.

As established in Unit 5 (Chapter 2: "Understanding `Timeline<'a>` and FRP Implementation" and Chapter 3: "Transforming Timelines and Introducing the Dependency Graph"), and also touched upon in Unit 6 (Chapter 0: "Handling Absence"), the `TL.define` operation in this library has a key characteristic: **it always executes the registered callbacks (reactions) whenever it is called**, regardless of whether the new `value` being defined is different from the `timeline._last` value already stored.

This "always propagate" behavior is a deliberate design choice with several justifications:

*   **`Timeline` as an "Event Stream":** Beyond representing a value that changes over time (a "Behavior" or "Signal"), a `Timeline` can also be viewed as an "Event Stream." From this perspective, each call to `TL.define` signifies the occurrence of an event, and the `value` is the data associated with that event. Even if two consecutive events carry the same data, they are distinct occurrences.
*   **`define` as a "Command":** `TL.define` can be interpreted as a command: "Set the current value of this timeline to `value` and notify dependents." The act of issuing the command implies that the associated actions (callbacks) should be performed.
*   **Trigger for Re-evaluation:** An event on a timeline, even if it redefines the same value, can serve as a trigger for downstream computations that might depend on *other* timelines whose values *have* changed.
*   **Simplicity and Predictability:** The rule "a `define` call always triggers callbacks" is simple and predictable.
*   **Separation of Concerns:** The responsibility of generating an event (`define`) is kept separate from the responsibility of filtering or transforming that event stream (which can be handled by other combinators like `TL.distinctUntilChanged`).

However, as noted in Chapter 4, this "always propagate" behavior has potential drawbacks related to performance and sometimes intuitive expectations, which leads us directly to the solution.

## 6.3 Introducing `TL.distinctUntilChanged`: Filtering Based on Value Changes

To address the potential for redundant updates and to give programmers explicit control over event propagation based on value changes, the `Timeline` library provides the `TL.distinctUntilChanged` combinator.

**Purpose:**
`TL.distinctUntilChanged` creates a new timeline that only propagates updates from its source timeline if the new value is **different** from the previously propagated value from this specific `distinctUntilChanged` operation.

**Signature:**

```fsharp
// Contained within the TL module
// val distinctUntilChanged<'a when 'a : equality> : Timeline<'a> -> Timeline<'a>
```

The F# code for this function (from the provided `Timeline.fs`):

```fsharp
module TL =
    // ... other TL definitions ...

    let distinctUntilChanged<'a when 'a : equality> : Timeline<'a> -> Timeline<'a> =
        fun sourceTimeline ->
            let initialValue : 'a = sourceTimeline |> TL.at Now // Explicit TL.at
            let resultTimeline : Timeline<'a> = Timeline initialValue // Using Timeline factory

            // Store the last value that resultTimeline itself propagated
            let mutable lastPropagatedValueByResult : 'a = initialValue

            let reactionFn : 'a -> unit = // Explicit type for callback
                fun newValueFromSource ->
                    if newValueFromSource <> lastPropagatedValueByResult then
                        lastPropagatedValueByResult <- newValueFromSource
                        // Pass 'Now' explicitly as per TL.define signature
                        resultTimeline |> TL.define Now newValueFromSource // Explicit TL.define
                    // No else branch needed, as we do nothing if value is the same

            // Pass scopeIdOpt as None explicitly for registerDependency
            // The exact mechanism of registering reactionFn to sourceTimeline's updates
            // is handled by DependencyCore, conceptually:
            ignore (DependencyCore.registerDependency sourceTimeline.id resultTimeline.id (reactionFn :> obj) None)

            resultTimeline
```

*   It takes a source `sourceTimeline: Timeline<'a>` as input.
*   It returns a new `resultTimeline: Timeline<'a>` as output.

**Functionality:**
The `resultTimeline` will only be updated (and thus propagate its own events) when the value from `sourceTimeline` changes to something *different* from the last value that `resultTimeline` itself last propagated. If `sourceTimeline` is updated with the same value multiple times consecutively, `distinctUntilChanged` will ensure `resultTimeline` only propagates the first occurrence of that value, filtering out subsequent identical values.

**Type Constraint (`'a : equality`):**
The type constraint `'a : equality` is crucial. To determine if a new value is "distinct" from the previous one, the values must be comparable for equality. This means `TL.distinctUntilChanged` can be used with timelines holding types that support equality comparison (e.g., primitive types like `int`, `string`, `bool`, records and unions where all fields/cases are comparable, etc.).

## 6.4 `TL.distinctUntilChanged` in Action: Practical Examples

Let's illustrate the behavior of `TL.distinctUntilChanged`.

```fsharp
// Assume Timeline factory, Now, TL.at, TL.define, TL.map, TL.distinctUntilChanged are accessible
// And isNull helper is globally available.

// Example logging setup (can be simplified if not focusing on logTimeline itself)
let setupLogReaction (timelineName: string) (timelineToLog: Timeline<string>) : unit =
    timelineToLog
    |> TL.map (fun msg ->
        if not (isNull msg) then // Using global isNull
            printfn "[%s Log]: %s" timelineName msg
    )
    |> ignore

// Create a source timeline
let sourceEvents : Timeline<string> = Timeline "initial"

// --- Scenario 1: Without distinctUntilChanged ---
printfn "--- Scenario 1: Direct Logging ---"
let directLogOutput : Timeline<string> = sourceEvents |> TL.map id // Effectively a pass-through
directLogOutput |> setupLogReaction "Direct" // Log changes from directLogOutput

sourceEvents |> TL.define Now "event1"
// Output:
// [Direct Log]: initial (from map's initial execution after sourceEvents was created)
// [Direct Log]: event1

sourceEvents |> TL.define Now "event1" // Define same value again
// Output:
// [Direct Log]: event1 (logged again because TL.map reacts to every define on sourceEvents)

sourceEvents |> TL.define Now "event2"
// Output:
// [Direct Log]: event2

// --- Scenario 2: With distinctUntilChanged ---
printfn "\n--- Scenario 2: Logging with distinctUntilChanged ---"
// Reset sourceEvents or use a new one for true isolation, here we just redefine
sourceEvents |> TL.define Now "initial_distinct" // Resetting initial value for this scenario

let distinctSourceEvents : Timeline<string> = sourceEvents |> TL.distinctUntilChanged
distinctSourceEvents |> setupLogReaction "Distinct" // Log changes from distinctSourceEvents

// The 'initial_distinct' value is set on sourceEvents.
// distinctSourceEvents is created. Its initial TL.at Now is 'initial_distinct'.
// The map for logging distinctSourceEvents runs once with 'initial_distinct'.
// Output: [Distinct Log]: initial_distinct

sourceEvents |> TL.define Now "eventA"
// sourceEvents becomes "eventA".
// distinctSourceEvents compares "eventA" with its last propagated "initial_distinct". They are different.
// distinctSourceEvents updates to "eventA" and propagates.
// Output: [Distinct Log]: eventA

sourceEvents |> TL.define Now "eventA" // Define same value again on sourceEvents
// distinctSourceEvents compares "eventA" with its last propagated "eventA". They are the same.
// distinctSourceEvents does NOT update or propagate.
// Output: (nothing new logged from Distinct Log)

sourceEvents |> TL.define Now "eventB"
// distinctSourceEvents compares "eventB" with its last propagated "eventA". They are different.
// distinctSourceEvents updates to "eventB" and propagates.
// Output: [Distinct Log]: eventB

sourceEvents |> TL.define Now "eventA" // Define "eventA" again on sourceEvents
// distinctSourceEvents compares "eventA" with its last propagated "eventB". They are different.
// distinctSourceEvents updates to "eventA" and propagates.
// Output: [Distinct Log]: eventA
```

In the first scenario, defining `sourceEvents` with "event1" twice results in it being logged twice by the reaction on `directLogOutput`.
In the second scenario, using `distinctSourceEvents`, the second definition of "eventA" on `sourceEvents` (which is the same as the previous value propagated by `distinctSourceEvents`) is filtered out, and "eventA" is not logged again by the reaction on `distinctSourceEvents` until the value actually changes (e.g., to "eventB" and then back to "eventA").

## 6.5 How It Works: The Internal Mechanism

Conceptually, and as shown in the F# code snippet for `TL.distinctUntilChanged` in Section 6.3:

1.  When `sourceTimeline |> TL.distinctUntilChanged` is called, it creates a new `resultTimeline`.
2.  The `resultTimeline` is initialized with the current value of `sourceTimeline` (e.g., `sourceTimeline |> TL.at Now`).
3.  An internal mutable variable, `lastPropagatedValueByResult`, is created within the scope of the `distinctUntilChanged` operation. This variable is crucial for remembering the last value that `resultTimeline` actually emitted. It's initialized with `resultTimeline`'s own initial value.
4.  A reaction function (`reactionFn`) is registered as a dependency on `sourceTimeline`. This function will be invoked whenever `sourceTimeline` is updated (via `TL.define`).
5.  When this `reactionFn` is called with a `newValueFromSource`:
    *   `newValueFromSource` is compared (using F#'s structural equality `<>`) with the internally stored `lastPropagatedValueByResult`.
    *   If `newValueFromSource <> lastPropagatedValueByResult` (i.e., the new value is different from the last one propagated *by `resultTimeline`*):
        *   `lastPropagatedValueByResult` is updated to `newValueFromSource`.
        *   `resultTimeline` is updated with `newValueFromSource` using `resultTimeline |> TL.define Now newValueFromSource`. This causes `resultTimeline` to propagate the new, distinct value.
    *   If `newValueFromSource` is the **same** as `lastPropagatedValueByResult`:
        *   The `reactionFn` does nothing further; `resultTimeline` is *not* updated, and the event is effectively suppressed.

This internal state (`lastPropagatedValueByResult`) is encapsulated within the `distinctUntilChanged` combinator's implementation. From an external perspective, `TL.distinctUntilChanged` still appears as a pure function that maps a `Timeline<'a>` to another `Timeline<'a>`, but its behavior is achieved through this carefully managed internal state.

## 6.6 Use Cases and Benefits of Filtering

The `TL.distinctUntilChanged` combinator is highly valuable in numerous practical scenarios:

*   **UI Update Optimization:** This is a primary use case. If a `Timeline` drives a UI element's property (e.g., text, visibility, color), applying `distinctUntilChanged` ensures the UI only re-renders or updates when the underlying data has *meaningfully changed*, preventing flicker or unnecessary rendering cycles.
*   **Skipping Expensive Computations:** If a `Timeline`'s updates trigger a computationally intensive process (e.g., via `TL.map` or `TL.bind`), applying `TL.distinctUntilChanged` to the source `Timeline` ensures the expensive computation only runs when its input has truly changed, saving resources.
*   **Reducing Network Requests:** If a `Timeline`'s value is used as a parameter for a network request, `distinctUntilChanged` can prevent identical, consecutive requests if the parameters haven't actually changed.
*   **Creating More Semantic Event Streams:** It can transform a "raw" event stream that might contain duplicates into a more semantically meaningful stream representing only actual state transitions.
*   **Debouncing/Throttling Complements:** While `distinctUntilChanged` itself isn't for debouncing (waiting for a pause in events) or throttling (limiting event rate), it addresses a related concern of managing event stream "density" by eliminating redundancy. It can be used in conjunction with such mechanisms.

By filtering out redundant updates, `TL.distinctUntilChanged` helps create more efficient, responsive, and less "noisy" reactive systems, allowing developers to focus on reactions to genuine state changes.

## 6.7 `distinctUntilChanged` in the Broader `Timeline` Ecosystem

`TL.distinctUntilChanged` builds upon and relates to several core `Timeline` concepts:

*   **`Timeline` as a sequence of values/events:** It operates on this sequence, making decisions about which events (value updates) to allow through to its output timeline.
*   **Stateful Transformation:** Unlike a purely stateless function like `(fun x -> x * 2)` used with `TL.map` (where the output *only* depends on the current input value), `TL.distinctUntilChanged` is inherently **stateful**. It needs to remember the "last propagated value" to make its decision. This state is, however, encapsulated within the combinator's implementation and managed by the `Timeline` system.
*   **Dependency Graph:** In the reactive dependency graph, `distinctUntilChanged` acts as a **conditional gate**. It's a node that takes an input timeline and produces an output timeline, but the propagation along the edge from its output only occurs if the value-change condition is met.

## 6.8 Summary and Looking Ahead: Preparing for General Combinations

In this chapter, we've formally introduced `TL.distinctUntilChanged`, a vital utility combinator for managing the flow of events in a `Timeline`. By filtering out consecutive duplicate values, it helps to:

*   Improve performance by avoiding unnecessary downstream computations.
*   Reduce "noise" in reactive systems.
*   Enable more semantically meaningful event streams.

It directly addresses the efficiency concerns raised in **Chapter 4** when discussing the behavior of naive Monoidal combinators or frequent updates from `TL.define`.

While this chapter focused on filtering a single timeline, `TL.distinctUntilChanged` is a general-purpose tool. Its utility becomes even more apparent when applied to the *outputs* of more complex timeline combinations, which we are about to explore. For instance, when we combine two timelines, the resulting combined timeline might produce duplicate values even if the inputs are changing, and `distinctUntilChanged` can refine this output.

With this tool for managing update frequency in hand, we are now better prepared to introduce a general mechanism for combining two timelines: `TL.zipWith`. This will be the topic of **Chapter 5** (as per our revised chapter order, `zipWith` is introduced before `distinctUntilChanged`, but for logical flow in *this specific original chapter*, reference to upcoming `zipWith` is natural). We'll see how the results of `zipWith` can often benefit from the application of `TL.distinctUntilChanged`.
*(Self-correction: The original text's forward reference to "New Chapter 7" for `zipWith` was based on its old numbering. In our revised structure `zipWith` is Chapter 5. The sentence has been rephrased slightly to reflect that `zipWith` conceptually *could* come next in a general discussion, even if our book's chapter order presents it earlier for foundational reasons. The main point is the synergy between `zipWith` and `distinctUntilChanged`.)*
