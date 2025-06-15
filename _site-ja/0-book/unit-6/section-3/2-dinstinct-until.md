# Chapter 2: Filtering Timelines with `distinctUntilChanged`

Now that we have `combineLatestWith` to create new timelines, we need a way to manage the flow of events they produce. A common issue in reactive systems is redundant updates: an input changes, but the final output value remains the same. This can lead to unnecessary computations or UI re-renders. The `distinctUntilChanged` combinator is the essential tool for solving this problem.

## The Problem of Redundant Updates

Consider a timeline that checks if a counter is greater than 10.

`let isBig = counter |> TL.map (fun x -> x > 10)`

If `counter` changes from `15` to `20`, the `isBig` timeline will be updated from `true` to `true`. While the input changed, the semantic output did not. `distinctUntilChanged` allows us to filter out such "no-change" updates.

## Signature and Behavior

The `distinctUntilChanged` combinator is a simple unary operator that takes one timeline and produces another.

F#

```
// Located in the TL module
val distinctUntilChanged<'a when 'a : equality> : Timeline<'a> -> Timeline<'a>

```

-   It takes a `sourceTimeline` as input.
-   It returns a new timeline that only propagates an update from the source if the new value is **different** from the previously propagated value.
-   The type constraint `'a : equality` is crucial, as the function must be able to compare values to see if they are different.

## How It Works

`distinctUntilChanged` is a stateful combinator. Internally, it keeps track of the last value it propagated. When a new value arrives from the source, it compares the new value to the stored last value.

-   If they are **different**, it updates its internal state to the new value and propagates the new value to its output timeline.
-   If they are the **same**, it does nothing, effectively stopping the update from flowing further downstream.

## A Common Pattern: `combineLatestWith` + `distinctUntilChanged`

This combinator is most powerful when composed with others, especially `combineLatestWith`. The output of `combineLatestWith` often produces redundant values, and applying `distinctUntilChanged` is a standard pattern for optimizing the result.

F#

```
// Assume counterA and counterB are Timeline<int>

// Create a timeline that is true only if the sum is greater than 100
let rawSignal =
    TL.combineLatestWith (fun a b -> a + b > 100) counterA counterB

// Optimize the signal to only fire when the boolean state actually changes
let optimizedSignal =
    rawSignal |> TL.distinctUntilChanged

// Now, reactions connected to `optimizedSignal` will only run when the sum
// crosses the 100 threshold, not every time counterA or counterB changes.

```

By separating combination (`combineLatestWith`) from filtering (`distinctUntilChanged`), we gain flexibility, allowing developers to choose whether they need every calculated event or only the distinct state changes. This separation of concerns is a key principle in functional and reactive design.