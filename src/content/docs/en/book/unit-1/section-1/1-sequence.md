---
title: 1.  Sequence
description: image
---
![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744474563390.png)

**Sequence** is the most basic control structure in programming. Instructions are simply executed one after another in the order they appear.

Let's explore how this fundamental concept looks in different programming styles, using a simple calculation: double the number 5, add 1, double the result, and display the final result.

## The Imperative Way: Step-by-Step Commands

In imperative programming, you typically write a sequence of commands that modify the program's state or produce results step by step. Each command executes in order.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/javascript.svg">

```js
// Start with the input number
const number = 5;

// Step 1: Double the number
const step1Result = number * 2;
// step1Result is 10

// Step 2: Add 1 to the result
const step2Result = step1Result + 1;
// step2Result is 11

// Step 3: Double the result again
const result = step2Result * 2;
// result is 22

// Display the final result
console.log(`The result is: ${result}`);
// Output: The result is: 22
```

Here, each step is performed sequentially, storing intermediate results (`step1Result`, `step2Result`) in variables before the next step.

## The Functional Way: Data Transformation Pipelines

Functional programming often approaches sequential operations as a **pipeline** of data transformations. Data flows through a series of functions (or operations), where each performs a specific transformation and passes its result to the next.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744496636340.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744496329575.png)

Let's rewrite the previous example using F#, which has a built-in  **pipeline operator (`|>`)** :

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Define helper functions for clarity
let double x = x * 2
let add1 x = x + 1

// Define the input number
let number = 5

// Start with the input number and pipe it through transformations
let result =
    number
    |> double
// Apply the double function -> 10
    |> add1
// Apply the add1 function -> 11
    |> double
// Apply the double function again -> 22

// Display the final result
printfn "The result is: %d" result
// Output: The result is: 22
```

In this F# code:

-   We define helper functions `double` and `add1` first.

-   We start with the input `5`.

-   The `|>` operator pipes `5` into the `double` function, resulting in `10`.

-   The result `10` is then piped into the `add1` function, resulting in `11`.

-   The result `11` is piped into the `double` function again, resulting in `22`.

-   The final result `22` is assigned to the `result` variable.

-   Finally, `printfn` is called separately to display the value of `result`.

-   The calculation pipeline itself remains a single expression without intermediate variables for the steps.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

JavaScript's function style notation is  `f(x)` , which is the notation learned in early mathematics.
$$
f(x)
$$

F# or Haskell's function style notation is  `f x` , which doesn't require parentheses  `()` . This is the same as notation that omits parentheses, like trigonometric functions learned later in mathematics.
$$
\sin x
$$
$$
f \; x
$$

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Summary

Both the imperative JavaScript code and the functional F# code achieve the same sequential result for this calculation.

---

### Imperative Programming

**Instructions on Flaws, Step by Step**

The **imperative style** uses explicit steps and intermediate variables.


![Image of Sequence, Selection, Iteration flowchart symbols](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744474477850.png)

----------

### Functional Programming

**Declaration of the Structures**

The structures are all about **pipelines composed by functions**.

The **functional pipeline style** emphasizes composing functions/operations to create a flow of data transformations.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744496636340.png)

Understanding this pipeline concept is fundamental to grasping the functional approach to programming.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

### Pure FP vs. Pragmatic FP Sequencing

It's worth noting a distinction regarding execution order and sequencing when comparing different functional languages.

In **purely functional languages** (like Haskell), which strictly adhere to the principle that everything is an expression evaluating to a value, the top-to-bottom visual order of independent code definitions often doesn't dictate execution sequence in the same way as imperative code. The evaluation order is primarily determined by data dependencies. Code written with an imperative step-by-step intention might not be directly valid or meaningful if there's no explicit dependency.

However, many functional languages, including **F#**, adopt a more **pragmatic approach**. While they strongly encourage expression-based pipelines and minimizing side effects (like state mutation), they _do_ allow and respect imperative-style sequencing for practical purposes, especially for actions like input/output (I/O), logging, or structuring code logically.

Consider our F# calculation example where we separated the final printing:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Define helper functions for clarity
let double x = x * 2
let add1 x = x + 1

// Define the input number
let number = 5

// Calculation (an expression resulting in a value)
let result =
    number
    |> double // Apply the double function -> 10
    |> add1   // Apply the add1 function -> 11
    |> double // Apply the double function again -> 22

// Action using the result (depends on the previous step)
printfn "The result is: %d" result // Output: The result is: 22

```

In this F# code:

1.  The line `let result = ...` binds the final value (`22`) of the pipeline expression to the name `result`.

2.  The subsequent line, `printfn "The result is: %d" result`, performs an action (printing to the console) that explicitly uses the `result` value.

F# **does** execute these bindings and actions in the top-to-bottom order they are written. The `result` must be calculated and bound _before_ the `printfn` function can be called with its value. This sequential execution is familiar from imperative programming.

So, while the functional pipeline _itself_ (`number |> double |> add1 |> double`) is a pure expression focused on data transformation without regard to imperative steps, F# allows you to sequence these expressions and side-effecting actions (like `printfn`) in a predictable, top-to-bottom manner. This blends the benefits of functional expressions with the practical necessity and convenience of sequential execution for certain tasks.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">
