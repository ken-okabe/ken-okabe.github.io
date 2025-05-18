---
title: Currying and Partial Application with HOF
description: >-
  In previous chapters, we saw that functions are first-class values and that
  operators like (+) and (*) are essentially functions. We also briefly saw how
  applying only one argument to (+) or (*) created new functions like add1 or
  double. Let's explore the fundamental mechanism behind this: Currying and
  Partial Application.
---
In previous chapters, we saw that functions are first-class values and that operators like `(+)` and `(*)` are essentially functions. We also briefly saw how applying only one argument to `(+)` or `(*)` created new functions like `add1` or `double`. Let's explore the fundamental mechanism behind this: **Currying** and **Partial Application**.

## Binary Operations and Function Arguments: Unary vs Binary Functions

Let's focus on multiplication (`*`) as a typical example of a binary operation – it takes two arguments, `x` and `y`, to produce a result `x * y`.

In many languages, like JavaScript, a function implementing this would naturally be defined to accept two arguments together:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/javascript.svg">

```js
// Accepts two arguments (x, y) simultaneously
function multiply(x, y) { return x * y; } 
```

This `multiply` function is a typical **Binary Function** – it's defined to accept two arguments (`x` and `y`) together and return a result. Many programming languages directly support functions that take multiple arguments like this.

Now consider the F# equivalent:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Appears to take two arguments
let multiply x y = x * y 
```

This F# definition looks similar, but there's a crucial difference under the hood. While many languages directly support multi-argument functions, F# (like Haskell and other languages in the ML family) adopts a different model: fundamentally, **all F# functions are Unary Functions**, meaning they technically only accept **one argument** at a time.

This might seem counter-intuitive when looking at `let multiply x y = ...`. How can a function that only takes one argument handle a binary operation like multiplication? This leads us directly to the mechanism F# uses to achieve this...

## The F# Approach: Currying

The answer lies in **Currying**. F# (like Haskell and other ML-family languages) automatically transforms functions that appear to take multiple arguments into a chain of nested functions, each taking only a single argument.

The standard definition `let multiply x y = x * y` is actually convenient **syntactic sugar** for defining a nested lambda expression like this:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// The definition 'let multiply x y = x * y' is equivalent to:
let multiply = fun x -> (fun y -> x * y)
```

or you can write like this:

```fsharp
let multiply =
    fun x ->
        fun y ->
            x * y
```

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745147539756.png)

This explicitly shows the curried nature. The type signature `int -> int -> int` directly reflects this nested structure: it's shorthand for `int -> (int -> int)`.

This means the `multiply` function works step-by-step:

1.  It takes the _first_ argument (`x`, an `int`).
    
2.  It _**returns a new function**_ (`fun y -> x * y`). This new function "remembers" `x` and expects the _second_ argument (`y`). The type of this new function is `int -> int`.
    
3.  When this _new function_ receives the second argument (`y`), it finally performs the calculation (`x * y`) and returns the final `int` result.

## Partial Application: A Consequence of Currying

Now we can properly understand **Partial Application**.

-   **General Definition:** In programming generally, partial application means supplying _fewer_ arguments to a function than it normally takes.
    
-   **In F# (with Currying):** Because functions inherently take arguments one at a time due to currying, _**simply applying the first argument(s) is partial application.**_ There's no special syntax needed beyond normal function application. The result of applying the first argument _is_ the partially applied function (the intermediate function returned by the HOF).

So, when we write:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let multiply = (*)
let double = 2 |> multiply
let result = 10 |> double
// 20
```

![Diagram showing Partial Application](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744707418101.png)

## Analogy: The Multiplication Table

Let's visualize this using the familiar multiplication table.

**1. The Full Operation:** The complete multiplication operation, represented by the binary function `(*)`, needs _two_ numbers (e.g., a row number and a column number) to give you a result from the table. It corresponds to the entire table:

![Multiplication Table Analogy - Full Table](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744525249824.png)

(Requires two inputs, like  `(*) 3 4` )

**2. Fixing One Argument (Partial Application):** Now, what happens if we _partially apply_ the multiplication function by fixing the first number, say, to 3? In F#, we write this as `(*) 3`. This is like selecting just _one row_ from the table – the "3 times" row:

![Multiplication Table Analogy - Row 3](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744525063728.png)

(Represents the function  `(*) 3` )

By providing only the first argument (`3`) to the two-argument function `(*)`, we've created a _new function_. Let's call it `multiplyBy3`. This new function only needs _one_ more argument (the number for the column) and corresponds to this specific row.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Create a new function "multiplyBy3" by partially applying (*) with 3
let multiplyBy3 = (*) 3
```multiplyBy3` *is* the "3 times table" function; it waits for one more number.

**3. Applying the New Function:**

Once we have our specialized function `multiplyBy3`, we can give it the final argument. For example, applying it to `4` (`multiplyBy3 4`) is like looking up the 4th column in the 3rd row to find the result  `12` :

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

-   Unlike many languages that directly support multi-argument (e.g., binary) functions, FP languages like F# and Haskell fundamentally model all functions as **Unary Functions** (taking only one argument).
-   Because all functions are unary, **Currying** is the mechanism used automatically by F# to handle functions that *appear* to take multiple arguments. A definition like `let f x y = ...` becomes syntactic sugar for nested unary functions (`fun x -> (fun y -> ...)`), reflected in type signatures like `T1 -> T2 -> TResult` (shorthand for `T1 -> (T2 -> TResult)`).
-   **Partial Application** is the act of supplying fewer arguments than a function expects. Due to currying in F#, this occurs naturally when providing only the initial argument(s), resulting in a new, specialized function without needing special syntax.
-   This mechanism allows for the easy creation of specialized functions (like `add1` or `double`) from more general functions (like the operators `(+)` or `(*)`).
-   Partial application exemplifies **Higher-Order Functions** (specifically HOF Pattern 1), where providing input to a function results in a new function being returned, showcasing the power of treating functions as first-class values.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

It might seem that F#'s unary function model makes it awkward to pass multiple related pieces of data (like coordinates `(x, y)`) compared to JavaScript's multi-argument functions (`f(x, y)`). While currying handles functions that logically take multiple *independent* arguments step-by-step, what if you simply want to pass a single, grouped piece of data containing multiple components?

F# addresses this with **Tuples**. A tuple, written `(a, b)` or `(a, b, c, ...)`, groups multiple values into a *single*, composite value. This is different from a list (`[a; b; c]`) and is a data structure not present in the same way in JavaScript.

Because a tuple like `(x, y)` is considered a single value, it can be passed as the *one* argument to a unary F# function:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Define a function that takes ONE argument: a tuple of two integers
let addCoordinates (coords: int * int) =
    let (x, y) = coords // Deconstruct the tuple inside the function
    x + y

// Call the unary function, passing the tuple as the single argument
let result = addCoordinates (3, 4) // result is 7
```

Notice that the function call `addCoordinates (3, 4)` *looks* syntactically similar to a JavaScript call `addCoordinates(3, 4)` which might take two separate arguments. However, in F#, `addCoordinates` is still a unary function accepting a single tuple value. This provides a convenient syntax for working with grouped data within the unary function model, offering another example of F#'s pragmatic and expressive design.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">
