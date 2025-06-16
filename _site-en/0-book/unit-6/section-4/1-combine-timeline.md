# Combining Timelines with `combineLatestWith`

As established in the previous chapter, our goal is to implement the "Latest Value Combination" concept. The primary tool for this purpose is the `combineLatestWith` combinator. It is the `Timeline` library's implementation of an Applicative operation, specifically designed for combining asynchronous, independent sources.

## The Name: `combineLatestWith`

The name `combineLatestWith` is chosen deliberately. It is standard terminology in many popular reactive programming libraries (like RxJS) and it perfectly describes the function's behavior: it **combines** the **latest** known values from its sources, applying a user-provided function **with** them.

## Signature

The type signature for `combineLatestWith` conforms to the standard `map2` pattern for Applicative Functors that we established in Unit 4.

```fsharp
// Located in the TL module
val combineLatestWith<'a, 'b, 'c> : ('a -> 'b -> 'c) -> Timeline<'a> -> Timeline<'b> -> Timeline<'c>
```

Let's break this down:

1.  **`('a -> 'b -> 'c)` (The Combining Function `f`):** A function that takes a value of type `'a` as its first argument and a value of type `'b` as its second, producing a result of type `'c'`.
2.  **`Timeline<'a>` (The First Source):** The first source timeline. Its latest value will be passed as the first argument to `f`.
3.  **`Timeline<'b>` (The Second Source):** The second source timeline. Its latest value will be passed as the second argument to `f`.
4.  **`Timeline<'c>` (The Result):** A new timeline that will emit the results of the `f` function.

The standard way to call this function is: `TL.combineLatestWith f timelineA timelineB`.

## Behavior: Initialization and Updates

`combineLatestWith` adheres strictly to the philosophy of handling absence established in Section 1. Its core behavior is defined as follows:

1.  **Initialization:** When the result timeline is created, `combineLatestWith` immediately inspects the current values of both source timelines.
    * If both initial values are non-`null`, it calls the combining function `f` and initializes the result timeline with the output.
    * If either initial value is `null`, `f` is **not** called. The result timeline is initialized with `null` (or the type's default value, e.g., `Unchecked.defaultof<'c>`).

2.  **Updates:** The result timeline listens for updates on both sources. Whenever an update occurs on either `timelineA` or `timelineB`:
    * It retrieves the latest current values from **both** sources.
    * It performs the same check: if both latest values are non-`null`, it calls `f` and defines the output on the result timeline.
    * If either of the latest values is `null`, it defines `null` (or the default) on the result timeline without calling `f`.

## Example: Summing Two Number Timelines

Let's see `combineLatestWith` in action by creating a timeline that reactively represents the sum of two independent counters.

```fsharp
// Assume Timeline factory, Now, TL module, and isNull helper are accessible

// 1. Create source timelines
let counterA = Timeline 10
let counterB = Timeline 20

// 2. Create the sum timeline using the standard function call
// The combining function is the standard addition operator (+)
let sumTimeline = TL.combineLatestWith (+) counterA counterB

printfn "Initial Sum: %d" (sumTimeline |> TL.at Now)
// Expected Output: Initial Sum: 30

// 3. Update counterA
printfn "Updating CounterA to 15..."
counterA |> TL.define Now 15
printfn "Current Sum after A updated: %d" (sumTimeline |> TL.at Now)
// Expected Output: Current Sum after A updated: 35

// 4. Introduce a null value
let textA : Timeline<string> = Timeline "Hello"
let textB : Timeline<string> = Timeline "World"

let combinedText = TL.combineLatestWith (sprintf "%s, %s!") textA textB

printfn "Initial Combined Text: %s" (combinedText |> TL.at Now)
// Expected Output: Initial Combined Text: Hello, World!

printfn "Setting textB to null..."
textB |> TL.define Now null
// The `isNull` check inside nCombineLatestWith prevents the sprintf function from being called
printfn "Combined Text after B is null: %A" (combinedText |> TL.at Now)
// Expected Output: Combined Text after B is null: null
```

This example demonstrates how `combineLatestWith` produces a new, derived state from its sources. It is the foundational building block for all the binary combinations we will explore next.