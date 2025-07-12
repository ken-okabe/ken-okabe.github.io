---
title: scan — Evolution of State Along the Timeline
description: >-
  scan is one of the most powerful primitives in this library. It serves as the
  fundamental tool for constructing a timeline that has "state" which evolves
  over time.
---
`scan` is one of the most powerful primitives in this library. It serves as the fundamental tool for constructing a timeline that has "state" which evolves over time.

## The Three Dimensions of Folding: Structure and Time

To understand the unique role of `scan`, we will compare three types of "folds" in programming. The first two deal with **Structure**, while the third, `scan`, deals with a completely different dimension: **Time**.

1.  **`fold` (Folding of Structure)**: Deals with a static collection structure like `[1, 2, 3]` and calculates **one final value** (e.g., `6`).
2.  **`foldTimelines` (Folding of Structure)**: Deals with a list of timelines (a dynamic collection structure) like `[Timeline<1>, Timeline<2>, Timeline<3>]` and combines them into **one resulting timeline**.
3.  **`scan` (Folding of Time)**: Deals with a **single timeline** (a temporal event stream) like `1 -> 2 -> 3` and, each time an event occurs, generates a **new timeline that holds the intermediate values** (e.g., `1 -> 3 -> 6`).

The following comparison table summarizes these differences.

| Feature | `fold` (Structure) | `foldTimelines` (Structure) | `scan` (Time) |
| :--- | :--- | :--- | :--- |
| **Purpose** | Final aggregation | **Structural** composition | **Temporal** aggregation |
| **Input** | Array, etc. | **List** of timelines | **One** timeline |
| **Processing** | All at once | All at once | **Each time** an event occurs |
| **Output** | One final value | Timeline of the **final result** | Timeline of **intermediate progress** |
| **Analogy** | **Total amount** in a shopping cart 🧾 | **Final tally** of multiple votes 🗳️ | **Account balance history** 📈 |

`fold` and `foldTimelines` are very similar in that they both combine an input "collection structure" into one. On the other hand, this comparison makes it clear that `scan` is a tool with a completely different purpose: to track the **temporal changes of a single stream**. It is the core operation for constructing a **stateful timeline** that remembers its past history and updates its state based on new inputs.

-----

## API Definition

#### F\#: `scan: ('state -> 'input -> 'state) -> 'state -> Timeline<'input> -> Timeline<'state>`

*Note: In F\#, `scan` is a standalone function.*

#### TS: `.scan<S>(accumulator: (acc: S, value: T) => S, seed: S): Timeline<S>`

-----

## Code Example in TypeScript

Let's look at the behavior of `scan` with a counter that sums up incoming numbers.

```typescript
// Create a timeline of numbers
const numberStream = Timeline<number>(0);

// Use scan to sum up the incoming numbers
const runningTotal = numberStream.scan(
  (sum, currentValue) => sum + currentValue, // accumulator: add the new value to the current sum
  0 // seed: the initial value of the sum
);

// runningTotal always holds the latest total
console.log(runningTotal.at(Now)); // 0

numberStream.define(Now, 5);
console.log(runningTotal.at(Now)); // 5 (0 + 5)

numberStream.define(Now, 10);
console.log(runningTotal.at(Now)); // 15 (5 + 10)

numberStream.define(Now, -3);
console.log(runningTotal.at(Now)); // 12 (15 - 3)
```

-----

## Canvas Demo (Placeholder)

A demo that visualizes how the state timeline (the total sum) constructed by `scan` is updated in real-time each time a number flows into the input timeline.

-----
