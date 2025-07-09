---
title: Stateful Transformation with scan
description: >-
  In our journey to build a comprehensive toolkit for Timeline, we now turn to a
  crucial class of operations: those that maintain state over time. To
  understand the correct approach for Timeline, we must first revisit our
  classification tree of functional patterns.
---
In our journey to build a comprehensive toolkit for `Timeline`, we now turn to a crucial class of operations: those that maintain state over time. To understand the correct approach for `Timeline`, we must first revisit our classification tree of functional patterns.

We identified `fold` as a key "Container Elimination Operation," essential for summarizing the contents of a container like `List` into a single, final value. A natural question arises: What is the corresponding concept for `Timeline`?

## The Limit of `fold`: The Problem of an Endless Timeline

As we have established, the `fold` operation has a fundamental prerequisite: the container must have a defined **end**. Its purpose is to process *all* elements to produce one, final result. For a `List`, which is finite, this is a perfect fit.

However, a `Timeline` is, by its very nature, conceptually infinite. It represents a value that changes over time, potentially forever, and has no intrinsic "end" point. It is impossible to process "all" the elements of a stream that never ends, and therefore, it is impossible to calculate a "final" result.

A direct, literal equivalent of `List.fold` cannot exist for `Timeline`. To apply the powerful idea of folding to our reactive world, we need to adapt it to the context of time.

## The Corresponding Concept for `Timeline`: `scan`

The concept that correctly corresponds to `fold` in a temporal, reactive context is `scan`.

Where `fold` waits for the end to give a final summary, `scan` provides a running summary at every step. It takes the idea of "aggregating with a state" from `fold` and adapts it for a world without an end, by emitting the intermediate state at each update.

* `fold` is like the **final total** on a shopping receipt.
* `scan` is like the **running balance** of a bank account, updated with every transaction.

`scan` is a **Container Preserving Operation**. It takes an input timeline and produces an output timeline that tracks the history of the accumulated state.

## Signature and Implementation

The type signature for `scan` clearly shows that it produces a new timeline of the state.

```fsharp
// Located in the TL module
val scan<'state, 'input> : ('state -> 'input -> 'state) -> 'state -> Timeline<'input> -> Timeline<'state>
```

1.  **`('state -> 'input -> 'state)` (The Accumulator Function):** A function that takes the previous state and the new input value, and returns the new state.
2.  **`'state` (The Initial State):** The starting value for the accumulation.
3.  **`Timeline<'input>` (The Source):** The input timeline.
4.  **`Timeline<'state>` (The Result):** A new timeline that emits the accumulated state after each input.

How do we implement this stateful operation while adhering to our principle of building upon our most basic primitives? The key is to use the `Timeline` type itself to manage the state. We can create a dedicated internal timeline to hold the accumulating state and use our existing `map` primitive to drive the updates.

This implementation is clean, high-level, and avoids any direct use of `mutable` local variables or `DependencyCore`.

```fsharp
module TL =
    // ... map, bind, etc. ...

    let scan<'state, 'input> (accumulator: 'state -> 'input -> 'state) (initialState: 'state) (sourceTimeline: Timeline<'input>) : Timeline<'state> =
        // The state itself is managed by a separate, dedicated timeline.
        let stateTimeline = Timeline initialState

        // We use `map` on the source timeline to trigger updates to the state timeline.
        sourceTimeline
        |> map (fun input ->
            // On each input, get the LATEST current state from the state timeline.
            let currentState = stateTimeline |> at Now
            // Calculate the new state.
            let newState = accumulator currentState input
            // Define the new state back onto the state timeline, creating a feedback loop.
            stateTimeline |> define Now newState
        )
        |> ignore // The Timeline<unit> returned by map is not needed.

        // Return the timeline that holds the state.
        stateTimeline
```

This implementation is powerful because it's built entirely from our existing primitives. It demonstrates a key pattern in `Timeline`-based FRP: using timelines themselves to manage state, creating clean, high-level abstractions. With `scan` now in our toolkit, we are ready to build even more sophisticated stateful logic.
