---
title: 'Chapter 0: Timeline.fs -- Timeline<''a> and FRP Implementation'
description: >-
  Prerequisites: This section assumes a basic understanding of the "Block
  Universe" concept (the idea that the universe, including all of time, exists
  as an immutable data structure) and Einstein's related insight that the
  distinction between past, present, and future is a persistent illusion. In
  essence, the reader accepts the premise that the universe is fundamentally
  immutable.
---
**Prerequisites:** This section assumes a basic understanding of the "Block Universe" concept (the idea that the universe, including all of time, exists as an immutable data structure) and Einstein's related insight that the distinction between past, present, and future is a persistent illusion. In essence, the reader accepts the premise that the universe is fundamentally immutable.

## 2.1 Introduction: The Immutable Universe and Our Experience of Change

From the perspective of modern physics and certain philosophical viewpoints, the universe can be conceived as a static, four-dimensional block where all events across time are fixed and immutable. However, our everyday experience, and the phenomena we often model in programming (like user interface updates, sensor readings, or animations), are characterized by constant change.

How can we reconcile the immutable nature of this underlying reality (the Block Universe) with the dynamic, changing experiences we need to represent in our programs? Functional Reactive Programming (FRP) offers a sophisticated approach, and the `Timeline<'a>` type presented here is a core concept within one such FRP implementation strategy.

## 2.2 The `Timeline<'a>` Concept: Encapsulating Time-Varying Values

The central idea is the **`Timeline<'a>`** type. Instead of representing just a single value of type `'a` at a specific instant, a `Timeline<'a>` object encapsulates the **entire history and potential future** of a value that changes over time.

This `Timeline<'a>` object is, in essence, a **"mini Block Universe"** manifested within the program, representing the complete, immutable history of a specific value. It can be likened to possessing an entire reel of film, where each frame (a point in time) holds the immutable value for that instant.

`Timeline<'a>` creation is simple. Let's create a new `Timeline<string>` named `timeline` here (using the factory function as defined in our `Timeline.fs`):

```fsharp
// Assuming 'Timeline' factory function is available as:
// let Timeline<'a> : 'a -> Timeline<'a> = fun initialValue -> ...
let timeline : Timeline<string> = Timeline "initial Value"
```

## 2.3 `Now`: The Moving Viewpoint on the Immutable Timeline

While the `Timeline<'a>` represents the complete, immutable history (our "mini Block Universe"), our experience is typically focused on the "present" moment, which seems to constantly advance from past to future. This subjective experience of the present, the "stubbornly persistent illusion" Einstein spoke of, can be conceptualized by the type **`Now`**.

Imagine the concept of `Now` as a **cursor or pointer** moving across the immutable data track of the `Timeline<'a>`. The `Timeline<'a>` data itself (the film reel / mini Block Universe) is fixed, but the `Now` pointer (the projector gate showing a single frame) continuously shifts its position. This creates a crucial distinction:

*   **`Timeline<'a>` (The Data / Mini Block Universe):** Conceptually **Immutable**.
*   **The concept of `Now` (The Viewpoint / Cursor):** Conceptually **Mutable** (its position changes over time).

It is through this moving `Now` viewpoint that we perceive "change" within the fundamentally unchanging `Timeline<'a>` data.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg" alt="Note Header">

### `Now` (The Viewpoint / Cursor) is Conceptually Mutable (its position changes over time)

As repeatedly discussed, mathematics is fundamentally immutable. Consequently, the mutability of `Now` suggests it is ***something clearly outside*** the realm of mathematics.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg" alt="Note Footer">

## 2.4 Querying the Timeline: `TL.at` for Specific Coordinates

To determine the value of a `Timeline<'a>` at a specific point in time, we use an instance of the `Now` type as a coordinate. When we need the value *at* a particular instant, we use a specific instance of `Now` – an immutable time coordinate representing a snapshot of the moving viewpoint. In the F# code provided (from `Timeline.fs`), a value `Now` (capital 'N') holds this specific coordinate.

The function `TL.at` serves this purpose:

```fsharp
// Assuming 'timeline' is a Timeline<string> created above,
// 'Now' is the globally available immutable coordinate value,
// and 'TL.at' is defined in the TL module.
// let value : string = timeline |> TL.at Now
```

*(Presented as a comment as `value` is not used further in this context, adhering to general F# good practice where unused values might be warned against. The syntax demonstrates the call.)*

This operation treats the specific instance `Now` as a fixed coordinate on the immutable `Timeline<'a>` data structure (our "mini Block Universe"). It purely **reads** the value associated with that coordinate (in the provided implementation from `Timeline.fs`, this corresponds to accessing the `timeline._last` field, which holds the most recently computed or set value representing the state *at* or *before* this specific `Now`). As a pure read from an immutable conceptual structure based on fixed coordinates, `TL.at` aligns with functional principles of referential transparency.

## 2.5 Defining Values in Time: `TL.define` as Declaration

To associate a new value (`newValue`) with a specific time coordinate (`Now`), the operation `TL.define` is used:

```fsharp
// Assuming 'timeline' is Timeline<string> and 'newValue' is a string.
// 'Now' is the immutable coordinate.
// timeline |> TL.define Now newValue
```

*(Presented as a comment to illustrate the call signature.)*

Crucially, this should be understood not as "overwriting" or "mutating" the `Timeline<'a>` in a destructive sense, but as **declaratively defining** the state within the Block Universe model. It asserts: "At the immutable coordinate represented by `Now`, the value is `newValue`."

This is like adding a new entry or fact to the immutable record of the Block Universe (our "mini Block Universe"). It doesn't alter the facts recorded at *other* coordinates. Therefore, at the **conceptual level** of the Block Universe model, `TL.define` is a **pure, non-destructive declaration**. When `define` is called, it updates the internal `_last` value and also triggers notifications to any dependent timelines (via `DependencyCore`), ensuring changes propagate through the reactive system.

## 2.6 Implementation of FRP: Conventional Functional Views and Approach

How should this conceptually pure `Timeline<'a>` and its declarative `define` operation be implemented in practical code? This question reveals a fascinating contrast between common functional programming dogma and the implications of the Block Universe model.

The dominant perspective within many functional programming texts and communities strongly advocates for **immutability at all levels** of implementation. This viewpoint often stems from a desire for mathematical purity, easier reasoning about code (referential transparency), and simplified concurrency. From this conventional perspective:

*   **Mutation is Inherently Impure:** Any modification of existing state, *even encapsulated internal object state*, is fundamentally considered a "side effect."
*   **Returning New Objects: The "Pure" Ideal:** Consequently, the "purest" way to implement an update operation like `TL.define` is to leave the original `timeline` object untouched and return a **completely new `Timeline<'a>` object**.
*   **Internal Mutability as a Necessary Evil or Compromise:** Implementations that *do* utilize internal mutable state (like updating `timeline._last`) are frequently viewed with suspicion.

In essence, the conventional functional view establishes a strong dichotomy: immutability is good and pure, while mutability is bad and impure. This sets the stage for a contrasting perspective offered by the Block Universe simulation approach discussed next.

## 2.7 Implementation of FRP: Deeper Insight into Block Universe Simulation and Novel Approach

Grounding the FRP implementation in the Block Universe model offers a different, arguably more profound perspective than the standard functional approach. This view leads to interesting, seemingly paradoxical, implementation choices for `Timeline<'a>` and `Now`.

### 2.7.1 The Goal: Simulating Observation in an Immutable Universe

Recall the core concepts from the Block Universe perspective:

*   **`Timeline<'a>` (The Data / Mini Block Universe):** Conceptually **Immutable**.
*   **The concept of `Now` (The Viewpoint / Cursor):** Conceptually **Mutable**.

The primary goal of the `Timeline<'a>` object in this approach is to **actively simulate the experience of an observer** whose `Now` viewpoint progresses through the immutable Block Universe.

### 2.7.2 Implementing `Timeline<'a>`: Internal Mutability as Correctness

To achieve this simulation, the practical implementation of `Timeline<'a>` (as seen in `Timeline.fs`) uses internal mutability:

```fsharp
// From Timeline.fs (conceptual match, actual details in shared code)

// Timeline Type Definition (Simplified from Timeline.fs for illustration)
// type Timeline<'a> =
//     private
//         { id: TimelineId // Unique ID managed by the system
//           mutable _last: 'a } // The latest observed value

// Timeline Factory Function (Conceptual, matches provided Timeline.fs style)
// let Timeline<'a> : 'a -> Timeline<'a> =
//     fun initialValue ->
//         // let newId = DependencyCore.generateTimelineId() // From Timeline.fs
//         { id = (* newId *) System.Guid.NewGuid() // Simplified for example
//           _last = initialValue }

// Core Operations Module (Simplified View, matching TL.define from Timeline.fs)
// module TL =
//     let define<'a> : Now -> 'a -> Timeline<'a> -> unit =
//         fun now value timeline -> // 'now' parameter is illustrative
//             timeline._last <- value
//             // ... triggers notifications to dependents via DependencyCore ...
```

*(The F# code here is illustrative, referencing the structure from the provided `Timeline.fs`. The full, styled code for these elements exists in `Timeline.fs` itself and wouldn't be repeated verbatim in the chapter unless essential for a specific minor point not covered by the main library code sharing.)*

*   **Internal Mutability (`_last`) is Key:** Using a mutable internal field (`_last`) is the most conceptually accurate way to implement the *simulation* of the changing viewpoint.
*   **Dependency Propagation:** When `TL.define` updates `_last`, `DependencyCore` notifies dependents.
*   **Not Just Optimization:** This internal mutability of `_last` is fundamental to the *correctness* of the simulation.
*   **Contradiction of Internal Immutability:** If `_last` were strictly immutable, the object could *not* update its representation of the current value.
*   **Critique of Returning New Timelines:** Returning a *new* `Timeline` object on every update contradicts the model of a singular "mini Block Universe" for a given time-varying value.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg" alt="Note Header">

When `Now` (the viewpoint or cursor) is conceptually mutable (meaning its position changes over time), the corresponding `_last` that `Now` points to should also be actually mutable.

As repeatedly discussed, mathematics is fundamentally immutable.
Consequently, the very mutability of `Now` and `_last` confirms their status as ***entities belonging outside the mathematical realm***.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg" alt="Note Footer">

### 2.7.3 Implementing `Now`: The Immutable Placeholder Paradox

Paradoxically, while `Timeline<'a>` embraces internal mutability (`_last`), the implementation of `Now`—the conceptually *mutable* cursor—remains a static and immutable placeholder (as defined in `Timeline.fs`):

```fsharp
// From Timeline.fs
// type Now = Now of string
// let Now = Now "Conceptual time coordinate" // Or similar descriptive string
```

*   **Rationale Unchanged:** `Now` acts as a conceptual symbol for the present.
*   **API Formalism vs. Internal Reality:** API calls like `TL.at Now` maintain formal purity. The actual simulation of the advancing present is handled by `Timeline._last` and `DependencyCore`.

### 2.7.4 Summary: Conceptual vs. Practical Implementation

| Concept        | Conceptual Nature | Practical Implementation                     | Justification (Block Universe Simulation)                                                     |
| :------------- | :---------------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------- |
| `Timeline<'a>` | Immutable         | Object with `id` and **Internal Mutable `_last`** | Necessary to simulate the *changing observation* of the immutable data. Dependency propagation is handled internally by `DependencyCore`. |
| `Now`          | Mutable (Cursor)  | **Immutable Static Placeholder** (e.g., `Now "..."`)    | Acts as a symbolic API element; actual "current" state is in `Timeline._last`.                  |

This implementation strategy becomes logical when viewed through the lens of the Block Universe model.

## 2.8 Philosophical Shift: Purity Redefined by the Conceptual Model

Adopting the Block Universe simulation perspective involves a significant philosophical shift concerning "purity." This approach prioritizes **fidelity to the underlying conceptual model (the Block Universe)** over strict adherence to implementation-level rules like prohibiting internal mutation.

*   **Purity Resides in the Model:** The purity of operations like `TL.define` stems from their **declarative nature relative to the immutable Block Universe model**.
*   **Internal Mutability (`_last`) as Faithful Implementation:** Encapsulated internal mutation becomes a **necessary and correct mechanism for faithfully implementing the simulation**.

In essence, purity is redefined as the faithfulness of the implementation's behavior to the conceptual model it simulates.

## 2.9 Summary

*   The `Timeline<'a>` type is an abstraction for time-varying values, grounded in an immutable Block Universe concept.
*   `Now` is a conceptually mutable pointer across the immutable `Timeline<'a>`.
*   `TL.at Now` is a pure read of `_last`.
*   `TL.define Now value` is a conceptually pure declaration, updating `_last` and notifying dependents via `DependencyCore`.
*   Conventional functional programming views internal mutability as impure. The Block Universe simulation perspective argues that `Timeline._last`'s mutability is a **theoretically consistent and accurate way** to simulate observing changes.
*   "Purity" derives from fidelity to the conceptual model, allowing necessary internal mutability for correct simulation.
