# Chapter 3: Transforming Timelines and Introducing the Dependency Graph

In the previous chapter (Chapter 2), we established the `Timeline<'a>` type as a way to represent values that change over time, mimicking a "mini Block Universe." We also saw how to query the current value using `TL.at` and declare a new value at a specific point in time using `TL.define`.

However, simply defining and reading values isn't enough for building reactive applications. We often need to **derive new timelines based on the values of existing ones**. For example, if we have a `Timeline<int>` representing a counter, we might want a `Timeline<string>` that displays the counter's value formatted as text.

This is where the fundamental operation `TL.map` comes into play.

## 3.1 Transforming Values with `TL.map`

The `TL.map` function is the primary way to create a new `Timeline` whose value is derived from another `Timeline` by applying a function.

Its signature (as found in `Timeline.fs` under the `TL` module) is straightforward:

```fsharp
// module TL
// val map<'a, 'b> : ('a -> 'b) -> Timeline<'a> -> Timeline<'b>
```

It takes two arguments:

1.  A function `f` of type `'a -> 'b`: This function defines how to transform the value.
2.  A source timeline `timelineA` of type `Timeline<'a>`.

It returns a **new timeline** `timelineB` of type `Timeline<'b>`.

**How it works:**

*   When `TL.map` is called, it immediately applies the function `f` to the *current* value of `timelineA` (obtained via `timelineA |> TL.at Now`) to determine the *initial* value of the new `timelineB`.
*   Crucially, it also establishes a **dependency**: whenever `timelineA` is updated using `TL.define`, the function `f` is automatically re-applied to the new value of `timelineA`, and the result is used to update `timelineB` (again, using an internal `define`-like mechanism managed by `DependencyCore`).

**Simple Example: Doubling a Number**

Let's see a concrete example. Suppose we have a timeline holding a number, and we want another timeline that always holds double that number:

```fsharp
// Assume Timeline factory, Now value, and TL module functions are accessible
// No 'open Timeline' or 'open Timeline.TL'

// 1. Create the source timeline
let numberTimeline : Timeline<int> = Timeline 5 // Explicit type and using factory

// 2. Use TL.map to create a derived timeline
//    The function (fun x -> x * 2) doubles the input value
let doubleFn : int -> int = fun x -> x * 2 // Define function in F# style
let doubledTimeline : Timeline<int> = numberTimeline |> TL.map doubleFn // Explicit TL.map

// 3. Check the initial value of the derived timeline
printfn "Initial doubled value: %d" (doubledTimeline |> TL.at Now) // Explicit TL.at
// Output: Initial doubled value: 10

// 4. Update the source timeline
numberTimeline |> TL.define Now 7 // Explicit TL.define

// 5. Check the derived timeline again - it has automatically updated!
printfn "Updated doubled value: %d" (doubledTimeline |> TL.at Now) // Explicit TL.at
// Output: Updated doubled value: 14
```

In this example:

*   `doubledTimeline` is created with an initial value of `5 * 2 = 10`.
*   When `numberTimeline` is updated to `7`, the `TL.map` operation automatically triggers the `doubleFn` (which is `fun x -> x * 2`) with the new value `7`, resulting in `14`. This value `14` is then used to update `doubledTimeline`.

`TL.map` allows us to build new timelines declaratively based on existing ones, and the library ensures that changes automatically propagate according to the defined transformation.

## 3.2 Introducing the Dependency Graph

The `TL.map` operation highlights a fundamental aspect of this FRP approach: **relationships and dependencies between timelines**.

*   When we write `let doubledTimeline = numberTimeline |> TL.map doubleFn`, we are not just creating a new, independent timeline. We are explicitly stating that `doubledTimeline` **depends on** `numberTimeline`.
*   We can visualize these relationships as a network or graph, where each `Timeline` is a node, and an operation like `TL.map` creates a directed edge representing the dependency (e.g., `numberTimeline --> doubledTimeline`). This network is often called a **Dependency Graph**.

```
        +-----------------+      TL.map (fun x -> x*2)   +-----------------+
        | numberTimeline  | ---------------------------> | doubledTimeline |
        | (Timeline<int>) |                              | (Timeline<int>)  |
        +-----------------+                              +-----------------+
              ^                                                    |
              | TL.define Now 7                                    V
              +-------------                                Propagation: updates to 14
```

*(Diagram updated to reflect TL.map)*

*   When `TL.define` updates a timeline (like `numberTimeline`), the change **propagates** through this dependency graph. The internal mechanism of the `Timeline` library (specifically, `DependencyCore` as mentioned in Unit 4, Chapter 2 and detailed in Unit 4, Chapter 6) follows the established dependencies and triggers the necessary updates on downstream timelines (like `doubledTimeline`).

**Why is this important?**

Thinking in terms of a dependency graph helps us understand how changes flow through our reactive system. As we introduce more operations (like `TL.bind` later in Unit 4, Chapter 5), this graph can become more complex, with timelines depending on multiple sources or dependencies changing dynamically.

The core promise of this FRP library is that this dependency graph is managed consistently. The internal system (`DependencyCore`) ensures that dependencies are correctly tracked and that updates propagate efficiently and reliably according to the rules defined by operations like `TL.map`.

This concept of a managed dependency graph is crucial. It's analogous to how:

*   A spreadsheet automatically recalculates cells when their precedents change.
*   A software package manager tracks library dependencies to ensure consistency during installation or removal.
*   Version control systems like Git track the history and relationships between different code versions.

Understanding that operations like `TL.map` build this underlying graph is key to grasping the power and robustness of the `Timeline` abstraction, which will become even more apparent when we discuss more advanced operations and concurrency in later chapters.

In the next chapter (Chapter 4), we'll see how this `TL.map` operation, combined with the concept of the dependency graph, allows us to integrate I/O operations seamlessly into our `Timeline`-based model.