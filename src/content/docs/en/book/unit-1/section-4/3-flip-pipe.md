---
title: 'HOFs in Action: Type Signatures, flip, and Pipelines'
description: >-
  In the previous chapter, we explored Currying and Partial Application,
  understanding how functions that appear to take multiple arguments are often
  sequences of functions each taking a single argument.
---
In the previous chapter, we explored Currying and Partial Application, understanding how functions that appear to take multiple arguments are often sequences of functions each taking a single argument.

This allows for the creation of new, specialized functions by supplying only some of the initial arguments. 

This chapter focuses on a practical HOF, `flip`, and how it helps manage argument order for pipeline-friendly function creation, building upon our understanding of HOF type structures from Section 3.

## Revisiting Argument Order and Partial Application Challenges

We've seen that partial application with functions like `(*)` (type `int -> int -> int`) is straightforward: `(*) 2` neatly gives us a `double` function of type `int -> int`. 

This is a direct application of HOF Pattern 1 (`'a -> ('b -> 'c)`), where providing `'a'` (the `2`) to `(*)` (our HOF) returns a new function `'b -> 'c'` (the `double` function).

However, for an operation like subtraction `(-)` (type `int -> int -> int`), which expects arguments in the order `minuend -> subtrahend -> difference`, partially applying `(-) 2` creates `fun x -> 2 - x`. 

This function subtracts its argument from `2`, which is often not what's desired for a pipeline operation like `value |> subtractTwo`.

This is where `flip` comes in.

## The `flip` Higher-Order Function

`flip` is a HOF designed to swap the first two arguments of a given function.
*   **Input:** It takes a function `f` (which is expected to take at least two arguments).
*   **Output:** It returns a *new function* that, when called, will invoke `f` but with its first two arguments exchanged.

Here's its definition:
```fsharp
let flip = fun f x y -> f y x
// Or using nested lambdas to emphasize its curried nature:
// let flip = fun f -> (fun x -> (fun y -> f y x))
```

**Type Signature of `flip` and HOF Pattern 3:**

Let's determine `flip`'s type signature using standard F# generic type parameters.

Assume the input function `f` has a type like `'a -> 'b -> 'c`. (This itself is `'a -> ('b -> 'c)` due to right-associativity).

The `flip` function:
1.  Takes `f` (type `'a -> 'b -> 'c`) as its first argument. So, the first part of `flip`'s type is `('a -> 'b -> 'c)`.

2.  It then returns a new function. This new function will:

    a.  First expect an argument that will become the *second* argument to `f`. So, this argument has type `'b`.

    b.  Then expect an argument that will become the *first* argument to `f`. So, this argument has type `'a`.
    
    c.  Finally, it will return a value of type `'c` (the result of `f y x`).

3.  Thus, the function returned by `flip f` has the type `'b -> 'a -> 'c`.

Combining these, the overall type signature for `flip` is:

**`('a -> 'b -> 'c) -> 'b -> 'a -> 'c`**

This actually matches 

**HOF Pattern 3**

`('a -> 'b) -> ('c-> 'd)`

 discussed in Unit 1, Section 3, where `FuncTypeInput` is `'a -> 'b -> 'c\`, and the returned function type is `'b -> 'a -> 'c\`. 
`flip` is a HOF that transforms one function into another function with a different argument order.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745147306999.png)

**Basic Usage Example:**
```fsharp
let subtract = (-) // Type: int -> int -> int
let resultNormal = subtract 5 2 // 3

// flip subtract : ('b -> 'a -> 'c) if subtract is ('a -> 'b -> 'c)
// Here, subtract is (int -> int -> int), so (flip subtract) is (int -> int -> int)
// but the roles of the first two int arguments for the original 'subtract' are swapped.
let minusWithFlippedArgs = flip subtract 
let resultFlipped = minusWithFlippedArgs 5 2 // Internally calls subtract 2 5 => -3.
// This means 'minusWithFlippedArgs' expects the subtrahend first (5), then the minuend (2).
// Not yet ideal for `value |> minusFive`.
printfn "Flipped minus 5 2 = %d" resultFlipped
```
This example shows `flip` in action but highlights that `flip subtract` alone doesn't immediately give us a pipeline-friendly `value - amount` function if we directly apply it with `value` then `amount`. The next step is crucial.

## Using `flip` for Pipeline-Friendly Partial Application

Our goal is to create a `minusAmount` function, e.g., `minus2`, such that `value |> minus2` calculates `value - 2`.

Let's break down the types and HOF patterns step-by-step:

1.  **Original `subtract` function:**
    ```fsharp
    let subtract = (-) // Type: int -> (int -> int). 
                      // Let's denote its generic structure as ''minuend -> ('subtrahend -> 'result)'
                      // Here, all are 'int'.
    ```

2.  **Apply `flip` to `subtract`:**
    `flip` has type: `('a -> 'b -> 'c) -> ('b -> 'a -> 'c)`
    ```fsharp
    let minus = flip subtract 
    // 'subtract' is 'int -> int -> int'.
    // So, 'minus' now has type: int -> (int -> int).
    // But its arguments are interpreted as: ''subtrahend -> ('minuend -> 'result)'
    // So, 'minus' expects the 'subtrahend' first, then the 'minuend'.
    // This step is HOF Pattern 3: 'flip' took 'subtract' (a function) and returned 'minus' (a new function).
    ```

3.  **Partially apply the `amountToSubtract` (e.g., 2) to `minus`:**
    This is where HOF Pattern 1 (`'firstArg -> ('secondArg -> 'returnType)`) comes into play again.
    `minus` has type `'subtrahend_type -> ('minuend_type -> 'result_type)`. We apply `2` (our `'subtrahend_type`, an `int`).
    ```fsharp
    let minus2 = minus 2 
    // minus2 is the result of applying the first argument to 'minus'.
    // minus2 now has type: int -> int (corresponding to ''minuend_type -> 'result_type').
    // It's a new function: fun minuend -> minus 2 minuend => fun minuend -> subtract minuend 2
    // This means: fun x -> x - 2
    ```

4.  **Use `minus2` in a pipeline:**
    ```fsharp
    let pipelineResult = 10 |> minus2 // 10 ('minuend_type') is passed to minus2 ('minuend_type -> 'result_type')
    printfn "10 |> minus2 = %d" pipelineResult // Output: 10 |> minus2 = 8
    ```
    This works because `minus2` is now a simple `int -> int` function, perfectly suited for the pipeline.

The expression `(minus 2)` directly creates this `int -> int` function.

**Key Insight:**
By first using `flip` (HOF Pattern 3) to create `minus` (a function that expects the subtrahend first), we can then use partial application (HOF Pattern 1) on `minus` to create the desired `minus2` function that subtracts a fixed amount from its pipeline input.

*(The image `img_1745151316464.png` can be used here to illustrate the pipeline with `minus2`)*

## Summary

- `flip` is a HOF of type `('a -> 'b -> 'c) -> 'b -> 'a -> 'c` (HOF Pattern 3), transforming a function's argument order.
- By applying `flip` to functions like `(-)`, we create an intermediate function that is more amenable to partial application for pipeline usage.
- Creating a pipeline-friendly function like `minus2` involves:
    1. `flip`ping the original operator (e.g., `(-)`) to get a new function (e.g., `minus`) that takes arguments in the desired order for partial application. This step is an application of HOF Pattern 3.
    2. Partially applying the fixed value (e.g., `2`) to this new function (`minus`) to get the final unary function (e.g., `minus2`). This step is an application of HOF Pattern 1.
- This two-step HOF application allows us to construct functions that integrate cleanly into data pipelines.
