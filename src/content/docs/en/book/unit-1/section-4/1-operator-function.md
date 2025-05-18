---
title: Operators as Functions and Pipeline Flow
description: >-
  In the previous chapter, we established that the pipeline operator (|>) acts
  like a binary operation, taking a value as its left operand and a function
  value as its right operand. This chapter explores the relationship between
  operators and functions in functional programming.
---
In the previous chapter, we established that the pipeline operator (`|>`) acts like a binary operation, taking a value as its left operand and a **function value** as its right operand. This chapter explores the relationship between operators and functions in functional programming.

## Operators as Syntactic Sugar for Functions

In many common programming languages, like JavaScript, symbols such as `+` and `*` are treated primarily as built-in operators.

However, in functional programming languages like F# and Haskell, which are heavily influenced by mathematics, these operators are often considered convenient syntax – **syntactic sugar** – for underlying **functions**.

-   The `+` operator corresponds to a binary function, written `(+)` in F#.
-   The `*` operator corresponds to a binary function, written `(*)` in F#.
-   The `-` operator corresponds to a binary function, written `(-)` in F#.

Wrapping an infix operator like `+` or `-` in parentheses `()` directly converts it to its corresponding prefix function value, `(+)` or `(-)`. This means the following are equivalent:

```fsharp
let sum1 = 5 + 3 // Using the operator (+)
let sum2 = (+) 5 3 // Using the function directly

let diff1 = 5 - 2 // Using the operator (-)
let diff2 = (-) 5 2 // Using the function directly

printfn "Sums: %d, %d" sum1 sum2       // Output: Sums: 8, 8
printfn "Differences: %d, %d" diff1 diff2 // Output: Differences: 3, 3
```

Treating operators as functions allows for greater consistency and enables powerful techniques like partial application.

## Creating New Functions with Partial Application (Preview)

Since `(+)` and `(*)` are function values, we can use them to create new functions by providing only one argument. This technique is called **Partial Application** (which we will explore fully in the next chapter).

```fsharp
// Creating unary functions by partially applying the operator functions:
let add1 = (+) 1     // Creates a function that adds 1 (Type: int -> int)
let double = (*) 2   // Creates a function that doubles (Type: int -> int)

// Applying the newly created functions:
let result1 = 10 |> add1   // result1 is 11
let result2 = 10 |> double // result2 is 20
```

**The Subtraction Challenge:**

Can we create a function for `x - 2` in the same way using `(-)`? Let's try:

```fsharp
// Attempt to create 'subtract 2' using partial application on (-)
let subtractsFrom2 = (-) 2 // What does this function do?
                           // (-) takes minuend first, then subtrahend: (-) minuend subtrahend = minuend - subtrahend
                           // So, (-) 2 creates a function that takes 'x' and calculates 2 - x

let result3 = 5 |> subtractsFrom2 // result3 is 2 - 5 = -3. This is NOT 5 - 2!
```

Because the subtraction operator function `(-)` expects the number being subtracted *from* (minuend) as its first argument, partially applying `(-) 2` creates a function that subtracts its input *from* 2, not the other way around.

To achieve the desired `x - 2` behavior, we typically define the function explicitly using a lambda expression, naming it appropriately:

```fsharp
// Correct way to define an 'x - 2' function
let minus2 = fun x -> x - 2 // Type: int -> int

let result4 = 10 |> minus2 // result4 is 10 - 2 = 8
```

This highlights that while partial application with operators like `(+)` and `(*)` is straightforward, order-sensitive operations like subtraction require careful consideration or explicit function definition (like lambdas) to achieve the intended result when creating specialized functions.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

We will explore the mechanism behind Partial Application in detail in the next chapter. For now, the key takeaway is that `(+)` and `(*)` are functions we can work with, but operators like `(-)` need care due to argument order when partially applied.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Using Functions like Operators (via `|>`)

So, operators are functions. Can we go the other way and use _any_ function as if it were an operator, perhaps in an infix style like `Value Operator Value`?

Some languages, like Haskell, offer ways to do this. For instance, using backticks allows a function like `add` to be used infix: ``5 `add` 3``. This syntax intuitively resembles the standard `Operand1 Operator Operand2` form of a binary operation.

F# takes a different, very practical approach using the **pipeline operator (`|>` )**. While `|>` doesn't make a function look exactly like `+` or `*` between two data values, it provides the primary mechanism in F# for applying functions sequentially in an **operator-like flow**:

`Value |> Function`

This structure, similar to Haskell's infix example, also fits the `Operand1 Operator Operand2` pattern, where `|>` is the operator, `Value` is the first operand, and the `Function` itself acts as the second operand. It allows us to "operate" on a value with a function in a sequential chain, effectively converting function application into a binary operation form for the purpose of data flow.

Let's illustrate this with a custom `minus` function specifically designed to work intuitively with the pipeline for subtraction, addressing the issue we saw with partially applying `(-)`:

```fsharp
// Define the 'minus' function where the first argument 'a' 
// is the amount to subtract, and the second argument 'b' 
// is the value being subtracted from.
let minus a b = b - a // Calculates b - a (value - amountToSubtract)

// Use it with the pipeline operator:
// 'minus 2' creates a function that takes 'b' and returns 'b - 2'
// '5 |> minus 2' applies this function to 5, resulting in 5 - 2
let result = 5 |> minus 2 // Equivalent to: minus 2 5 => 5 - 2

printfn "5 |> minus 2 = %d" result // Output: 5 |> minus 2 = 3
```

Here, by defining `minus` to take the amount to subtract (`a`) *first*, the pipeline `5 |> minus 2` naturally reads like "take 5 and subtract 2," achieving the desired operator-like flow. While the underlying mechanism involves function application (`minus 2 5`), the syntax provided by `|>` allows this intuitive expression when functions are defined appropriately.

## Summary

-   In functional languages like F#, operators such as `+` and `*` (and `-`) are often syntactic sugar for underlying functions like `(+)` and `(*)` (and `(-)`). Wrapping the operator in `()` converts it to the function form.
-   Because these are functions, we can use them to create new functions via **Partial Application** (providing fewer arguments than expected, explained fully next chapter).
-   Creating functions like `minus2` (for `x - 2`) via partial application requires care due to argument order (e.g., `(-) 2` means `2 - x`), often necessitating a lambda expression (`fun x -> x - 2`) or a custom function definition.
-   F# uses the pipeline operator (`|>`) as the primary way to apply functions sequentially to a value (`Value |> Function`), providing an operator-like flow (a form of binary operation) for data transformation, leveraging the fact that functions are first-class values.
