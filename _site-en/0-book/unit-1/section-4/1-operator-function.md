# Operators as Functions and Pipeline Flow

In the previous chapter, we established that the pipeline operator (`|>`) acts like a binary operation, taking a value as its left operand and a **function value** as its right operand. This chapter explores the relationship between operators and functions in functional programming.

## Operators as Syntactic Sugar for Functions

In many common programming languages, like JavaScript, symbols such as `+` and `*` are treated primarily as built-in operators.

However, in functional programming languages like F# and Haskell, which are heavily influenced by mathematics, these operators are often considered convenient syntax – **syntactic sugar** – for underlying **functions**.

-   The `+` operator corresponds to a binary function, written `(+)` in F#. 
-   The `*` operator corresponds to a binary function, written `(*)` in F#. 
-   The `-` operator corresponds to a binary function, written `(-)` in F#. 

Wrapping an infix operator like `+` or `-` in parentheses `()` directly converts it to its corresponding prefix function value, `(+)` or `(-)`. This means the following are equivalent:

```fsharp
let sum1 = 5 + 3 
// Using the operator (+)
let sum2 = (+) 5 3 
// Using the function directly

let diff1 = 5 - 2 
// Using the operator (-)
let diff2 = (-) 5 2 
// Using the function directly

printfn "Sums: %d, %d" sum1 sum2       
// Output: Sums: 8, 8
printfn "Differences: %d, %d" diff1 diff2 
// Output: Differences: 3, 3
```

Treating operators as functions allows for greater consistency and enables powerful techniques like partial application.

## Creating New Functions with Partial Application (Preview)

Since `(+)` (type `int -> int -> int`) and `(*)` (type `int -> int -> int`) are function values, we can use them to create new functions by providing only one argument. 

This technique is called **Partial Application** (which we will explore in more detail in the next part of this section, specifically in `2-curry-partial.md`). 

This application of an initial argument to a function that expects multiple arguments, resulting in a new function, is an example of HOF Pattern 1 ( `'a -> ('b -> 'c)` ) that we discussed in Section 3.

```fsharp
// (+) has type: int -> int -> int. 
// Applying '1' (an int) results in a new function.
let add1 = (+) 1     
// add1 now has type: int -> int. 
// This is HOF Pattern 1 in action.

// (*) has type: int -> int -> int. 
// Applying '2' (an int) results in a new function.
let double = (*) 2   
// double now has type: int -> int. 
// Also HOF Pattern 1.

// Applying the newly created functions:
let result1 = 10 |> add1   // result1 is 11
let result2 = 10 |> double // result2 is 20
```

**The Subtraction Challenge:**

Can we create a function for `x - 2` in the same way using `(-)` (type `int -> int -> int`)? Let's try:

```fsharp
// Attempt to create 'subtract 2' 
// using partial application on (-)
let subtractsFrom2 = (-) 2 
// (-) takes minuend first, 
// then subtrahend: (-) minuend subtrahend.

// So, (-) 2 (applying minuend=2) creates 
// a function: (fun x -> 2 - x) 
// of type int -> int.

let result3 = 5 |> subtractsFrom2 
// result3 is 2 - 5 = -3. 
// This is NOT 5 - 2!
```

Because the subtraction operator function `(-)` expects the number being subtracted *from* (minuend) as its first argument, partially applying `(-) 2` creates a function that subtracts its input *from* 2, not the other way around.

To achieve the desired `x - 2` behavior, we typically define the function explicitly using a lambda expression (as discussed in Section 3), naming it appropriately:

```fsharp
// Correct way to define an 'x - 2' function
let minus2 = fun x -> x - 2 

let result4 = 10 |> minus2 
// result4 is 10 - 2 = 8
```

This highlights that while partial application with operators like `(+)` and `(*)` is straightforward, order-sensitive operations like subtraction require careful consideration or explicit function definition (like lambdas) to achieve the intended result when creating specialized functions.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

We will explore the mechanism behind Partial Application (Currying) in detail in `2-curry-partial.md`. For now, the key takeaway is that `(+)` and `(*)` are functions we can work with, but operators like `(-)` need care due to argument order when partially applied.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Using Functions like Operators (via `|>` )

So, operators are functions. Can we go the other way and use _any_ function as if it were an operator, perhaps in an infix style like `Value Operator Value`?

Some languages, like Haskell, offer ways to do this. For instance, using backticks allows a function like `add` to be used infix: ``5 `add` 3``. This syntax intuitively resembles the standard `Operand1 Operator Operand2` form of a binary operation.

F# takes a different, very practical approach using the **pipeline operator (`|>` )**. While `|>` doesn't make a function look exactly like `+` or `*` between two data values, it provides the primary mechanism in F# for applying functions sequentially in an **operator-like flow**:

`Value |> Function`

This structure, similar to Haskell's infix example, also fits the `Operand1 Operator Operand2` pattern, where `|>` is the operator, `Value` is the first operand, and the `Function` (which is a first-class value with a type) acts as the second operand.

It allows us to "operate" on a value with a function in a sequential chain, effectively converting function application into a binary operation form for the purpose of data flow.

Let's illustrate this with a custom `minus` function specifically designed to work intuitively with the pipeline for subtraction, addressing the issue we saw with partially applying `(-)`:

```fsharp
// Define the 'minus' function. 
// Assuming integer operation, its type is: int -> int -> int
// The first argument 'amountToSubtract' (type int)
// The second argument 'value' (type int)
// It calculates value - amountToSubtract
let minus amountToSubtract value = 
    value - amountToSubtract 

// Use it with the pipeline operator:
// 'minus 2' applies '2' as 'amountToSubtract'. 
// This is partial application (HOF Pattern 1), 
// resulting in a new function of type: int -> int
// This new function is: (fun value -> value - 2)
let tempFunction = minus 2 

// '5 |> tempFunction' applies this function to 5.
// Equivalent to: 
// tempFunction 5 => (fun value -> value - 2) 5 => 5 - 2
let result = 5 |> tempFunction 
// Or more directly: 5 |> (minus 2)

printfn "5 |> minus 2 = %d" result 
// Output: 5 |> minus 2 = 3
```

Here, by defining `minus` to take the `amountToSubtract` *first*, the pipeline `5 |> (minus 2)` naturally reads like "take 5 and subtract 2," achieving the desired operator-like flow. 

The expression `(minus 2)` creates an intermediate function of type `int -> int` via partial application, which is then applied to `5`.

## Summary

-   In functional languages like F#, operators such as `+` and `*` (and `-`) are often syntactic sugar for underlying functions (e.g., `(+) : int -> int -> int`). Wrapping the operator in `()` converts it to the function form.
-   Because these are functions, we can use them to create new functions via **Partial Application** (providing fewer arguments than expected, which results in a new function – an instance of HOF Pattern 1). This will be explained more fully in `2-curry-partial.md`.
-   Creating functions like `minus2` (for `x - 2`) via partial application of standard operators like `(-)` requires care due to argument order, often necessitating a lambda expression or a custom function definition tailored for pipeline usage.
-   F# uses the pipeline operator (`|>`) as the primary way to apply functions sequentially to a value (`Value |> Function`), providing an operator-like flow for data transformation, leveraging first-class functions.