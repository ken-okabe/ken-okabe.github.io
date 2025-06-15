---
title: 'Currying and Partial Application: Functions Returning Functions'
description: >-
  In previous chapters, we've seen that functions are first-class values with
  types, and even operators like (+) are essentially functions.
---
In previous chapters, we've seen that functions are first-class values with types, and even operators like `(+)` are essentially functions.

We also previewed how applying only one argument to `(+)` (e.g., `(+) 1`) created a new function (`add1`).

This behavior, where providing an argument to a function that expects multiple arguments results in a new function, is a direct consequence of HOF Pattern 1 (`'a -> ('b -> 'c)`) discussed in Section 3.

Let's now explore the underlying mechanism that makes this possible: **Currying**, and its practical outcome, **Partial Application**.

## Revisiting Multi-Argument Functions and Type Signatures

Consider a function for multiplication. In many languages, you might define it to accept two arguments directly:
<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/javascript.svg">

```javascript
function multiply(x, y) { return x * y; }
// Expects x and y together
```

In F#, a similar definition `let multiply x y = x * y` appears to also take two arguments. However, its type signature, typically `int -> int -> int`, tells a deeper story.

As discussed in Section 3 regarding type signatures, this is shorthand for `int -> (int -> int)`. This nested structure implies that the function fundamentally operates by taking arguments one at a time.

## Currying: The "One Argument at a Time" Mechanism

This "one argument at a time" behavior is achieved through a process called **Currying**. Many functional languages, including F#, automatically transform functions that *appear* to take multiple arguments (like `let multiply x y = ...`) into a sequence of nested functions, each accepting a single argument.

The definition `let multiply x y = x * y` is essentially convenient syntax for:
<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let multiply = fun x -> (fun y -> x * y)
// Type: int -> (int -> int)
//    or int -> int -> int
```

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745147539756.png)

This `multiply` function now works as follows:

1.  It takes the first argument `x` (an `int`).
2.  It returns a *new function* (`fun y -> x * y`). This new function has "remembered" `x` and has the type `int -> int`. This step perfectly aligns with HOF Pattern 1 (`'a -> ('b -> 'c)`), where `'a` is the type of `x`, and `'b -> 'c` is the type of the returned function (`int -> int`).
3.  This new function then takes the second argument `y` (an `int`).
4.  Finally, it performs the calculation `x * y` and returns the `int` result.

This transformation, where a function taking multiple arguments is expressed as a chain of functions each taking a single argument and returning the next function in the chain (until the final value is computed), is known as Currying, named after the mathematician Haskell Curry.

## Partial Application: The Natural Result of Currying

With currying in place, **Partial Application** becomes a natural consequence.

*   **Definition:** Partial application is simply the act of calling a function with fewer arguments than it notionally expects.
*   **In a Curried System:** Since all functions fundamentally take one argument at a time, applying the first argument(s) to a curried function *is* partial application. The result is the intermediate function that's next in the curried chain. No special syntax is needed.

So, when we wrote `let double = (*) 2` in the previous chapter:
<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let multiplyOperatorAsFunction = (*)
// Type: int -> int -> int
// or    int -> (int -> int)
let double = multiplyOperatorAsFunction 2
// Apply first arg '2'
// 'double' is now
// 'int -> int'
let result = 10 |> double
// result is 20
```

`multiplyOperatorAsFunction 2` (or `(*) 2`) is a partial application. The `(*)` function (type `int -> (int -> int)`) receives its first `int` argument (`2`) and returns the intermediate function (type `int -> int`), which we named `double`.

![Diagram showing Partial Application](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744707418101.png)

## Analogy: The Multiplication Table

Let's visualize this using the familiar multiplication table.

**1. The Full Operation:** The complete multiplication operation, represented by the binary function `(*)`, needs _two_ numbers (e.g., a row number and a column number) to give you a result from the table. It corresponds to the entire table:

![Multiplication Table Analogy - Full Table](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744525249824.png)

(Requires two inputs, like  `(*) 3 4` )

**2. Fixing One Argument (Partial Application):** Now, what happens if we _partially apply_ the multiplication function by fixing the first number, say, to 3?

In F#, we write this as `(*) 3`. This is like selecting just _one row_ from the table – the "3 times" row:

![Multiplication Table Analogy - Row 3](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744525063728.png)

(Represents the function  `(*) 3` )

By providing only the first argument (`3`) to the two-argument function `(*)`, we've created a _new function_.

Let's call it `multiplyBy3`.

This new function only needs _one_ more argument (the number for the column) and corresponds to this specific row.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Create a new function "multiplyBy3"
// by partially applying (*) with 3
let multiplyBy3 = (*) 3
```

`multiplyBy3` *is* the "3 times table" function; it waits for one more number.

**3. Applying the New Function:**

Once we have our specialized function `multiplyBy3`, we can give it the final argument.

For example, applying it to `4` (`multiplyBy3 4`) is like looking up the 4th column in the 3rd row to find the result  `12` :

![Multiplication Table Analogy - Cell 3,4](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744525181657.png)

*(Represents applying the function: `multiplyBy3 4`)*

```fsharp
// Now use the new function - it only needs one argument
let result = multiplyBy3 4 // result is 12 (3 * 4)
printfn "3 times 4 is: %d" result
```

**Applying this to our previous examples:**

This process of fixing one argument to create a new, simpler function is exactly what we did earlier:

```fsharp
// Create a 'multiply by 2' function from (*)
let double = (*) 2

// Create an 'add 1' function from (+)
let add1 = (+) 1
```

We created specialized unary functions (`double`, `add1`) from general binary functions (`(*)`, `(+)`) using partial application.

This ability to easily create new, specialized functions from existing ones by partially applying arguments is a common and powerful technique in FP.

## Connecting Partial Application to HOF Pattern 1

As demonstrated with the `multiplyBy3`, `double`, and `add1` examples, partial application takes some initial input (like the number `3` for `(*)`, or `2` for `(*)`, or `1` for `(+)`) and _**returns a new function**_.

This perfectly matches **HOF Pattern 1:**

1.  **`Value |> Function = Function`**

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745695953633.png)

![Diagram connecting Partial Application to HOF Pattern 1](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744578599325.png)

```fsharp
// Create a 'multiply by 2' function from (*)
let double = 2 |> (*)

// Create an 'add 1' function from (+)
let add1 = 1 |> (+)
```

---

**`Value |> Function = Value`**

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745696474506.png)

![Diagram connecting Function Application to HOF patterns](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744579143286.png)

```fsharp
let result = 5 |> double // 10

let result' = 10 |> add1 // 11
```

Therefore, **partial application is a prime example of Higher-Order Functions in action**, specifically illustrating the pattern where functions _return_ other functions. It showcases how treating functions as first-class values allows us to manipulate and create new functions dynamically.

## Summary

-   Many functional languages employ **Currying**, a mechanism where functions appearing to take multiple arguments are automatically treated as a sequence of functions each taking a single argument and returning the next function in the chain, until the final result is produced.
-   A type signature like `T1 -> T2 -> TResult` reflects this, being shorthand for `T1 -> (T2 -> TResult)`. This is an instance of HOF Pattern 1.
-   **Partial Application** is the natural outcome of applying arguments to a curried function. Providing fewer arguments than notionally specified results in an intermediate function being returned.
-   This mechanism allows for the easy creation of specialized functions (like `add1` or `double`) from more general ones (like the operators `(+)` or `(*)`).
-   This entire behavior—a function taking an argument and returning a new function—is a prime example of HOF Pattern 1 in action.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

It might seem that F#'s unary function model makes it awkward to pass multiple related pieces of data (like coordinates `(x, y)`) compared to JavaScript's multi-argument functions (`f(x, y)`).

While currying handles functions that logically take multiple *independent* arguments step-by-step, what if you simply want to pass a single, grouped piece of data containing multiple components?

F# addresses this with **Tuples**. A tuple, written `(a, b)` or `(a, b, c, ...)`, groups multiple values into a *single*, composite value. This is different from a list (`[a; b; c]`) and is a data structure not present in the same way in JavaScript.

Because a tuple like `(x, y)` is considered a single value, it can be passed as the *one* argument to a unary F# function:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Define a function that takes ONE argument: a tuple of two integers
let addCoordinates (coords: int * int) =
    let (x, y) = coords
    // Deconstruct the tuple inside the function
    x + y

// Call the unary function,
// passing the tuple as the single argument
let result = addCoordinates (3, 4)
// result is 7
```

Notice that the function call `addCoordinates (3, 4)` *looks* syntactically similar to a JavaScript call `addCoordinates(3, 4)` which might take two separate arguments.

However, in F#, `addCoordinates` is still a unary function accepting a single tuple value.

This provides a convenient syntax for working with grouped data within the unary function model, offering another example of F#'s pragmatic and expressive design.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">
