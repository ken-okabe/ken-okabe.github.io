---
title: 'Chapter 1: Filtering Timelines with distinctUntilChanged'
description: >-
  In the previous chapter, we introduced scan as a powerful combinator for
  stateful transformations. We will now build another essential stateful
  operator, distinctUntilChanged, by applying the very same underlying design
  pattern.
---
In the previous chapter, we introduced `scan` as a powerful combinator for stateful transformations. We will now build another essential stateful operator, `distinctUntilChanged`, by applying the very same underlying design pattern.

Its purpose is to solve the common and practical problem of redundant updates by filtering out consecutive, identical values from a timeline.

## Implementation with the "Stateful Timeline" Pattern

Instead of using `DependencyCore` directly or introducing new primitives, we will implement `distinctUntilChanged` using the clean pattern we established for `scan`: we will create a dedicated internal timeline to hold the state of the "last propagated value."

The source timeline will then drive changes via `map`, and we will only update the final result timeline if the new value is different from the state timeline's current value.

This approach perfectly adheres to our architectural principle of building higher-level combinators on top of our core primitives.

```fsharp
module TL =
    // ... map, bind, scan, etc. ...

    let distinctUntilChanged<'a when 'a : equality> (sourceTimeline: Timeline<'a>) : Timeline<'a> =
        let initialValue = sourceTimeline |> at Now

        // This is the public-facing timeline that will only contain distinct values.
        let resultTimeline = Timeline initialValue

        // This is a private, internal timeline that holds the state of the last value
        // that was successfully propagated.
        let lastPropagatedTimeline = Timeline initialValue

        // We register a reaction on the source timeline using `map`.
        sourceTimeline
        |> map (fun currentValue ->
            // For each new value from the source, get the state of the last propagated one.
            let lastPropagatedValue = lastPropagatedTimeline |> at Now

            // Only if the new value is different...
            if currentValue <> lastPropagatedValue then
                // ...do we update both our internal state timeline...
                lastPropagatedTimeline |> define Now currentValue
                // ...and the final result timeline.
                resultTimeline |> define Now currentValue
        )
        |> ignore // The Timeline<unit> from map is not needed.

        resultTimeline
```

## Benefits of this Approach

This implementation is superior because:

1.  **It adheres to our design principles:** It does not use `mutable` local variables or directly call `DependencyCore`. It is built entirely on top of the established basic primitives (`map`, `at`, `define`), respecting the library's architectural layers.
2.  **It is clear and declarative:** The logic is easy to follow. The use of a `lastPropagatedTimeline` explicitly models the state that needs to be maintained, and the update logic is contained within a simple `map` transformation.

With this clean implementation, `distinctUntilChanged` serves as a powerful utility for optimizing reactive data flows, most notably when combined with the binary operators we will explore in the next section.
