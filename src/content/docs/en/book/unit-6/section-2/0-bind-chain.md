---
title: Asynchronous Event Chaining with bind
description: >-
  Before we get into the dedicated functions for composing multiple timelines
  (which will be discussed later), let's first see how we can orchestrate a
  series of operations using the core features of Timeline, especially TL.bind.
  This is particularly useful for asynchronous event chains. This approach
  achieves a similar effect to JavaScript's Promise.then chain but is realized
  using only the basic features of Timeline without needing additional
  composition functions. Understanding this fundamental capability of bind
  provides valuable insight into the inherent power and flexibility of the
  Timeline library's design.
---
Before we get into the dedicated functions for composing multiple timelines (which will be discussed later), let's first see how we can orchestrate a series of operations using the core features of `Timeline`, especially `TL.bind`. This is particularly useful for **asynchronous event chains**. This approach achieves a similar effect to JavaScript's `Promise.then` chain but is realized using only the basic features of `Timeline` without needing additional composition functions. Understanding this fundamental capability of `bind` provides valuable insight into the inherent power and flexibility of the `Timeline` library's design.

## `bind` chain

#### Key Mechanisms

This asynchronous chain is composed of the following three key mechanisms:

1.  **Pre-defined Receiving Timelines**: `Timeline` instances (`step1`, `step2`, `step3`, etc.) are pre-defined to receive the results of each step.
2.  **`bind` Chain**: An asynchronous operation is initiated within each `bind` function. When that operation completes, the result is set to the `Timeline` for the next step using `.define()`.
3.  **Chain Reaction**: When the value of a `Timeline` is updated, the next `bind` that depends on that `Timeline` is automatically triggered, and the chain progresses.

#### Code Example Flow

```javascript
// Similar implementation image in JavaScript
const step0 = Timeline(null);
const step1 = Timeline(null);
const step2 = Timeline(null);
const step3 = Timeline(null);

const asyncChain = step0
  .bind(value => {
    // Start asynchronous operation 1
    setTimeout(() => {
      const result1 = value + " -> The";
      step1.define(Now, result1); // Trigger the next step
    }, 2000);
    return step1; // Return the Timeline for the next step
  })
  .bind(value => {
    // Start asynchronous operation 2
    setTimeout(() => {
      const result2 = value + " -> Sequence";
      step2.define(Now, result2);
    }, 3000);
    return step2;
  })
  .bind(value => {
    // Start asynchronous operation 3
    setTimeout(() => {
      const result3 = value + " -> Done!!";
      step3.define(Now, result3);
    }, 1000);
    return step3;
  });

// Start the chain
step0.define(Now, "Hello!");
```

#### Comparison with `Promise.then`

This `Timeline` `bind` chain is similar to `Promise.then` in many ways.

* **Sequential Execution**: The next operation starts after the previous one is complete.
  * **Value Passing**: The result of the previous step is passed to the next step.

However, there are also important differences in the fundamental approach.

* **Reactive**: `Timeline` is a reactive system that automatically triggers subsequent operations in response to value changes.
  * **Explicit Receiving Timeline**: You need to pre-define a dedicated `Timeline` to receive the result of each step.
  * **Synchronous Return Value**: The `bind` function itself must **synchronously** return the `Timeline` to wait for next, without waiting for the asynchronous operation to complete.

-----

## Using `nBind`: Towards a More Robust Chain

The code example above is a "happy path" where all asynchronous operations succeed. However, in a real application, you must also consider the **possibility of failure** due to communication errors or unexpected results. This is where `nBind` is useful.

The current code using `bind` has a vulnerability where if any step returns `null`, a subsequent operation will cause an error, crashing the entire application.

| | `bind` (Original) | `nBind` (Refined) |
| :--- | :--- | :--- |
| **Happy Path** | Works correctly | Works correctly |
| **`null` occurs midway** | **Crashes with a runtime error** 💀 | **Safely skips subsequent operations** ✨ |
| **Robustness** | Low | High |
| **Code Appearance** | Almost the same | Almost the same |

`nBind` is designed to solve this problem elegantly. The operational rule of `nBind` is "**if the input is `null`, pass `null` through without executing the subsequent function**." By simply replacing `bind` with `nBind`, you can give this asynchronous chain robustness without changing the code's structure at all.

In comparison with `Promise.then`, using `nBind` significantly enhances the aspect of **"error handling"**. Unlike a Promise, which catches errors in a `.catch()` block, `nBind` propagates `null` as a "failure" signal safely through the pipeline without destroying it.

#### Code Refined with `nBind`

```javascript
const step0 = Timeline(null);
const step1 = Timeline(null);
const step2 = Timeline(null);
const step3 = Timeline(null);

const asyncChain = step0
  .nBind(value => { // .bind -> .nBind
    // Start asynchronous operation 1
    setTimeout(() => {
      const result1 = value + " -> The";
      step1.define(Now, result1);
    }, 2000);
    return step1;
  })
  .nBind(value => { // .bind -> .nBind
    // Start asynchronous operation 2
    setTimeout(() => {
      // Assume it fails and returns null
      const result2 = null;
      step2.define(Now, result2);
    }, 3000);
    return step2;
  })
  .nBind(value => { // .bind -> .nBind
    // This function will not be executed!
    console.log("This will not be executed.");
    setTimeout(() => {
      const result3 = value + " -> Done!!"; // No error will occur
      step3.define(Now, result3);
    }, 1000);
    return step3;
  });

// Start the chain
step0.define(Now, "Hello!");

// The final value of asyncChain will be null, without causing an error
```

### Conclusion

Using `nBind` is not just about replacing `bind`. It means **refining the code to be more reliable and declarative, taking into account not only the success case but also the failure case (`null`)**. This eliminates the need to write imperative error handling like `try-catch` or `if (value !== null)` outside the pipeline, allowing you to focus on the essential flow of the code.

## JS Demo

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1750968115971.png)

### https://g.co/gemini/share/5c7a059bed73

I've created a terminal-style demo for the Timeline Bind Chain! This demo has the following features:

## Key Features

- **Real-time Log Display**: Timestamped logs for each step
- **Progress Bar**: Visual representation of the chain's progress
- **3-Stage Asynchronous Process**: A chain of delays: 2s → 3s → 1s
- **Custom Input**: Test with any initial value

## Chain Flow

1. **Step 0**: Triggered with an initial value
2. **Step 1**: Adds "→ Processing" after 2 seconds
3. **Step 2**: Adds "→ Enhanced" after 3 seconds  
4. **Step 3**: Adds "→ Complete!" after 1 second

## How to Use

- **Start Chain**: Run the chain with the default value
- **Clear Log**: Clear the log and progress
- **Custom Input**: Run the chain with a custom value

This demo visually shows that Timeline's `bind` chain can achieve a sequence of asynchronous operations similar to `Promise.then`. You can see in real-time, through a terminal-style UI, how each step waits for the completion of the previous step before executing sequentially。
