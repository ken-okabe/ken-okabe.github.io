# Chapter 6: Dynamic Dependency Management and Automatic Resource Cleanup

## 6.1 Beyond Static Graphs: The Evolving Dependency Landscape

In the previous chapters, we explored the `Timeline<'a>` type (Chapter 2) and its core operations, `TL.map` (Chapter 3) and `TL.bind` (introduced alongside Monads in Chapter 5). We established that `Timeline` adheres to the Functor and Monad laws, providing a robust foundation for building reactive systems. We primarily viewed these operations through the lens of constructing an immutable **Dependency Graph**, where timelines are linked based on how they are derived from one another. This perspective helped explain the algebraic properties and the predictable flow of updates initiated by `TL.define`.

However, the Block Universe model, which justifies the internal mutability of `Timeline._last` as a simulation of an observer's moving viewpoint (`Now`) (Chapter 2), invites us to reconsider the nature of the dependency graph itself. Is the graph truly static once created?

In many real-world applications, the relationships between data points and the computations needed are not fixed. User interactions, external events, or changing application states often require the structure of dependencies to **evolve over time**. What data sources are relevant, or which calculations need to be performed, can change dynamically.

Just as the *value* observed at `Now` changes, couldn't the *dependency structure* itself be considered a value that evolves along the timeline within our Block Universe simulation? If `Timeline._last`'s mutability is justified to simulate observing a changing value, perhaps the structure connecting timelines also needs a mechanism to adapt.

## 6.2 Unveiling the Engine: `DependencyCore`

This brings us to a crucial aspect of this `Timeline` library's internal architecture, which was implicitly referenced by the mechanisms in `Timeline.fs` and is now formally discussed. Behind the scenes, managing the creation, tracking, and propagation of updates across the dependency graph is a dedicated internal system: the **`DependencyCore`**.

You can think of `DependencyCore` as the central registry and engine for all reactive relationships within the system. As seen in the `Timeline.fs` code, it maintains a complete picture of:

*   Which `Timeline` instances exist (identified by `TimelineId`).
*   How they depend on each other (which functions, or callbacks, need to run when a source updates, identified by `DependencyId`).
*   Crucially, how these dependencies might be grouped or scoped (using `ScopeId`), especially those created dynamically by operations like `TL.bind`.

This internal `DependencyCore` is the key to enabling not just efficient update propagation but also more advanced features like automatic resource management, which we will explore shortly.

## 6.3 `TL.map` and `TL.bind` as Clients of `DependencyCore`

With the existence and role of `DependencyCore` clarified (referencing its implementation in `Timeline.fs`), we can now understand the operations `TL.map` and `TL.bind` in a new light. They are not just pure functions returning new `Timeline` values in an abstract sense; they act as **clients** that interact with `DependencyCore` to **dynamically modify the dependency graph**.

*   **`timelineA |> TL.map f`**: When you use `TL.map`, it performs two main actions:
    1.  It creates a new `Timeline` (`timelineB`) using the `Timeline` factory function.
    2.  It instructs `DependencyCore` (via `DependencyCore.registerDependency` as seen in `TL.map`'s implementation in `Timeline.fs`) to **register a persistent dependency**: "Whenever `timelineA` updates, execute the function `f` with the new value and use the result to update `timelineB` (via `TL.define`)." This adds an edge to the dependency graph managed by `DependencyCore`.

*   **`timelineA |> TL.bind monadf`**: The `TL.bind` operation is significantly more sophisticated in its interaction with `DependencyCore` (as detailed in its `Timeline.fs` implementation):
    1.  It creates the result `Timeline` (`timelineB`).
    2.  It instructs `DependencyCore` to register the main dependency: "Whenever `timelineA` updates, execute the following complex reaction..."
    3.  The reaction itself involves further interaction with `DependencyCore`:
        *   Tell `DependencyCore` to **dispose of any resources associated with the previous execution** of `monadf` for this specific `bind` instance (this involves `DependencyCore.disposeScope` being called with the `currentScopeId` associated with the previous `innerTimeline`).
        *   Tell `DependencyCore` to **create a new "scope"** (`DependencyCore.createScope()`) specifically for the *current* execution of `monadf`.
        *   Execute `monadf` with the new value from `timelineA` to get a new `innerTimeline`.
        *   Propagate the current value from this new `innerTimeline` to `timelineB` (via `TL.define`).
        *   Tell `DependencyCore` to **register a new dependency** from `innerTimeline` to `timelineB` (via `DependencyCore.registerDependency`), associating this dependency with the **newly created scope**.

In essence, `TL.map` simply adds a static link to the graph, while `TL.bind` orchestrates a dynamic process of tearing down old dependency structures (within its managed scope) and building new ones every time its source timeline (`timelineA`) updates.

Understanding that `TL.map` and `TL.bind` are actively manipulating this managed dependency graph via `DependencyCore` is the key to appreciating how this library handles dynamic scenarios and automatic resource cleanup, moving beyond the limitations of a purely static graph model.

## 6.4 Analogies for Dynamic Dependency Management

Understanding the role of the internal `DependencyCore` and the dynamic nature of the dependency graph can be aided by drawing parallels to familiar concepts in software engineering:

*   **Garbage Collection (GC):** This is perhaps the strongest analogy. In languages like F# or JavaScript, the GC automatically reclaims memory for objects that are no longer reachable. Similarly, `DependencyCore`, through the scope mechanism used by `TL.bind` (i.e., `DependencyCore.disposeScope`), automatically identifies and **removes dependency connections (callbacks) that are no longer relevant** because the `innerTimeline` they originated from has been superseded. It cleans up the reactive graph.
*   **Package Management Systems (like `apt`, `npm`, `NuGet`):** These systems manage complex dependencies. `DependencyCore` performs a similar function for `Timeline` instances, managing dependencies created by `TL.map` and `TL.bind`.
*   **Version Control Systems (like Git):** Git tracks changes and relationships. `DependencyCore` manages the **current, evolving state** of the dependency graph, reflecting changes introduced by operations.

These analogies highlight that `DependencyCore` is a sophisticated internal system for maintaining the integrity and lifecycle of reactive dependencies.

## 6.5 Automatic Cleanup via Scopes: How `TL.bind` Manages Resources

Let's revisit how `TL.bind` leverages `DependencyCore` (as implemented in `Timeline.fs`) to achieve automatic resource cleanup, focusing on the scope mechanism:

1.  **Initial State:** When `timelineA |> TL.bind monadf` is first executed, `monadf` runs with `timelineA`'s initial value, producing an `innerTimeline` (say, `inner1`). `DependencyCore.createScope()` generates a new scope (say, `scope1`). A dependency from `inner1` to the result `timelineB` is registered via `DependencyCore.registerDependency`, associated with `Some scope1`.
2.  **Source Update:** Later, `timelineA` is updated (e.g., `timelineA |> TL.define Now newValueA`).
3.  **Reaction Triggered:** The main dependency (from `timelineA` to `timelineB`'s update logic, registered by `TL.bind`) is triggered.
4.  **Old Scope Disposal:** Within this reaction, `DependencyCore.disposeScope currentScopeId` (where `currentScopeId` held `scope1`) is called. `DependencyCore` removes all dependencies associated with `scope1`, disconnecting `inner1` from `timelineB`.
5.  **New Scope Creation:** `DependencyCore.createScope()` creates a new scope (`scope2`), which updates `currentScopeId`.
6.  **New Inner Timeline:** `monadf` is executed with `newValueA`, producing `inner2`.
7.  **Value Propagation:** `inner2`'s current value is defined onto `timelineB`.
8.  **New Dependency Registration:** A new dependency from `inner2` to `timelineB` is registered with `DependencyCore`, associated with `Some scope2`.

This cycle repeats. The disposal of the old scope (step 4) automatically cleans up reactive connections from the obsolete `innerTimeline`.

## 6.6 The Payoff: Safer Implementations with `TL.bind`

This automatic, scope-based resource cleanup managed by `DependencyCore` provides significant advantages:

*   **Elimination of Reactive Leaks:** Outdated computations/callbacks from previous `bind` states do not persist.
*   **Increased Robustness with `TL.bind`:** The Monad-compliant `TL.bind` becomes safer for dynamic scenarios.
*   **Simplified Application Logic:** Resource management is delegated to the library.

**Example: Incremental Search**

A classic example is **incremental search**.

```fsharp
// Assume SearchResult type and necessary setup
// let queryTimeline : Timeline<string> = (* ... from search input ... *)
// let searchApi (query: string) : Timeline<SearchResult> = (* ... async API call ... *)

// Using the safe, Monadic TL.bind
// let searchResultsTimeline : Timeline<SearchResult> = queryTimeline |> TL.bind searchApi
```

*(F# code block is illustrative, actual implementation would depend on `SearchResult` and `searchApi` details).*

With the scope-based cleanup:

1.  User types "funct". `TL.bind` runs `searchApi "funct"`, gets `innerTimelineFunct`, creates `scopeFunct`, links `innerTimelineFunct` to `searchResultsTimeline` via `scopeFunct`.
2.  Query becomes "functional". `TL.bind`'s reaction triggers.
3.  `DependencyCore.disposeScope(scopeFunct)` removes dependency from `innerTimelineFunct`.
4.  `DependencyCore.createScope()` creates `scopeFunctional`.
5.  `searchApi "functional"` runs, gets `innerTimelineFunctional`.
6.  Value from `innerTimelineFunctional` propagates to `searchResultsTimeline`.
7.  New dependency from `innerTimelineFunctional` registered with `scopeFunctional`.

Now, results from the "funct" request, if they arrive late, **cannot** update `searchResultsTimeline` because their reactive connection was removed. `TL.bind` automatically ensures only results for the latest query affect the output.

**(Important Note:** This cleans up the _internal reactive connection_. It does _not_ automatically cancel an ongoing _external_ network request for "funct". That requires different mechanisms, often specific to the asynchronous operation itself.)

This greatly enhances safety for dynamic UI patterns.

## 6.7 Summary: Internal Cleanup and the Path to Full Automation

This chapter unveiled `DependencyCore`, the engine managing the reactive dependency graph. We explored how `TL.bind`, unlike `TL.map`'s static dependency creation, interacts dynamically with `DependencyCore` using a scope mechanism for automatic cleanup of resources from previous `innerTimeline` instances.

The immediate payoffs are:

*   Elimination of common reactive leaks within `TL.bind`.
*   Increased robustness for dynamic scenarios.
*   Simplified application logic.

While this is effective for resources generated *dynamically within* `TL.bind`, what about managing the lifecycle of the *entire* reactive graph automatically?

The next chapter, **"Chapter 7: Full Automatic Resource Management via `bind` with AI Assistance"**, addresses this, demonstrating how modeling component lifecycles as `Timeline`s and using `TL.bind` strategically enables comprehensive automatic resource management, ideally with AI assistance for perfect implementation.