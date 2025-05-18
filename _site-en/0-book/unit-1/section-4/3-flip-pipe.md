# HOFs in Action: Type Signatures, flip, and Pipelines

In the previous chapter, we learned about currying and partial application. Specifically, we saw how F# functions fundamentally accept arguments one at a time and can potentially return new functions. In this chapter, we will deepen that understanding, explore how Higher-Order Functions (HOFs) manifest in the type system, and how we can utilize them.

## The Multiplication Function and `int -> int -> int` Type: Structure as a HOF

First, let's revisit the multiplication example we used frequently in the previous chapter. In F#, the multiplication operator `*` can be treated as a function value `(*)`.

```fsharp
let multiply = (*)
```

The type signature for this `multiply` function was `int -> int -> int`. At first glance, this might seem like it takes two `int` arguments and returns one `int`. However, recalling the concept of currying reveals the true meaning of this type signature.

`int -> int -> int` is actually shorthand for `int -> (int -> int)`. **This becomes easier to understand if we recall the multiplication table analogy from the previous chapter.** The entire multiplication function `(*)` corresponds to the whole multiplication table, requiring two inputs (a row number and a column number). However, when we applied only the first argument (e.g., the row number `3`) to `(*)` (as in `(*) 3`), it was equivalent to selecting a specific row (the "3 times table") from the table. This "3 times table" was itself a new function (type: `int -> int`), waiting for just one more argument (the column number).

Let's reiterate the step-by-step process of how this `multiply` function operates due to currying:

1.  **Accepts the first `int` as input:** The function first takes the initial integer value (the row number in the multiplication table example).
2.  **Returns a new function (type `int -> int`):** Upon receiving the first argument, `multiply` doesn't immediately return the final result. Instead, it generates and returns a **new function** that "accepts the second `int` (the column number) and returns the final `int` result" (the specific row in the multiplication table example). The type of this new function is `int -> int`.
3.  **Accepts the second `int` as input:** The returned new function then accepts the second integer value (the column number).
4.  **Returns the final `int` as output:** Only when the second argument is received is the actual multiplication (looking up the value in the table) performed, and the final integer result is returned.

Let's visualize this step-by-step process with a diagram. Applying `2` to the `multiply` function (partial application) creates the `double` function (type: `int -> int`), and applying `10` to that `double` function yields the final result `20` (type: `int`).

!(uploaded:image_bab323.png-eddec289-a31b-405c-822a-7738ddec80e6)

Thus, the `multiply` function (`(*)`) has the ability to **return another function** after accepting an argument. This is precisely one of the key characteristics of Higher-Order Functions (HOFs) we learned about in the previous chapter (HOF Pattern 1). The type signature `int -> int -> int` clearly indicates this structure of a "function that returns a function"—a HOF.

In this section, using the multiplication table analogy, we reaffirmed that the type `int -> int -> int` signifies more than just "takes two ints, returns one int." It represents a deeper structure (a curried HOF): "takes an int, returns a function that takes an int and returns an int." This understanding is crucial for working with more complex functions and types moving forward.

## Solving Argument Order Issues with `flip`

We've seen that partial application is straightforward for functions like multiplication `(*)`. Applying `(*) 2` gives us a function that doubles its input, as expected.

However, recall the issue with subtraction `(-)` from the earlier chapter. The function `(-)` expects arguments in the order `minuend -> subtrahend -> difference`. Because of this, partially applying `(-) 2` creates a function `fun x -> 2 - x`, which subtracts its argument *from* 2, not the other way around.

**This can be counter-intuitive, especially when we want to use such functions in pipelines.**

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744496329575.png)

This is where the power of Higher-Order Functions comes into play. Functional programming provides tools to elegantly handle such argument order situations. A key tool for this is the **`flip`** function.

**What is `flip`?**

`flip` is a higher-order function specifically designed to swap the first two arguments of a given function. It takes a function `f` as input and returns a *new* function that behaves like `f`, but expects the first two arguments in the reverse order relative to how `f` uses them internally.

Here's the definition we are using:

```fsharp
// Flip definition: Takes f, x, y and applies f with y then x.
let flip = fun f x y -> f y x
```

Using a lamdba expression:

```fsharp
let flip' =
    fun f ->
        fun x ->
            fun y ->
                f y x
```

Let's break down this definition `let flip = fun f x y -> f y x`:

- `flip` is a function that takes three arguments due to currying: `f`, `x`, and `y`.
- `f` is the original function (e.g., `(-)`).
- `x` is the *first* argument passed to `flip f`.
- `y` is the *second* argument passed to `flip f`.
- The body `f y x` calls the original function `f` but provides the arguments in the swapped order: `y` (the second argument received by `flip f`) is passed as the *first* argument to `f`, and `x` (the first argument received by `flip f`) is passed as the *second* argument to `f`.

**Type Signature of `flip`**

Now, let's correctly determine the type signature for `let flip = fun f x y -> f y x`.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745147306999.png)

- Assume the original function `f` has the type `'a -> 'b -> 'c`. This means `f` expects an argument of type `'a` first, then an argument of type `'b`, and returns a `'c`.
- In the body `f y x`, `y` is passed as the first argument to `f`, so `y` must have type `'a`.
- `x` is passed as the second argument to `f`, so `x` must have type `'b`.
- The function `flip f` receives `x` first, then `y`.
- Therefore, `flip f` receives an argument of type `'b` (which is `x`) first, then an argument of type `'a` (which is `y`), and finally returns a `'c` (the result of `f y x`).
- Thus, the function returned by `flip f` has the type `'b -> 'a -> 'c`.
- The overall type signature for `flip` itself is `('a -> 'b -> 'c) -> 'b -> 'a -> 'c`.

**Basic Usage Example**

Let's see `flip` in action with the subtraction function `(-)`:

```fsharp
// Standard subtraction function (using the operator)
let subtract = (-) // Type: int -> int -> int ('a=int, 'b=int, 'c=int)

// Normal application: 5 is 'a (minuend), 2 is 'b (subtrahend)
let resultNormal = subtract 5 2 // 5 - 2 = 3
printfn "Normal subtract 5 2 = %d" resultNormal

// Create the flipped version and name it 'minus' 
let minus = flip subtract // Type: 'b -> 'a -> 'c => int -> int -> int

// Apply arguments to the flipped function 'minus': 5 is now 'b (subtrahend), 2 is 'a (minuend)
let resultFlipped = minus 5 2 // 'minus' expects 'b (subtrahend) then 'a (minuend)
                              // Internally calls subtract y x => subtract 2 5 => 2 - 5 = -3
printfn "Flipped minus 5 2 = %d" resultFlipped
```

Here, `minus 5 2` applies `5` as the first argument (type `'b`, subtrahend) and `2` as the second argument (type `'a`, minuend) to the flipped function. Inside `flip`, the body executes as `subtract 2 5`, resulting in `2 - 5 = -3`.

## Using `flip` for Pipeline-Friendly Partial Application

Now let's revisit the pipeline examples using the naming convention you suggested.

#### Fixing Subtraction for Pipelines

Our goal is to create a `minus2` function such that `value |> minus2` calculates `value - 2`. Direct partial application fails. We use `flip`.

```fsharp
printfn "\n--- Pipeline Subtraction ---"
// Start with the original subtraction function
let subtract = (-) // Original: 'a -> 'b -> 'c (int -> int -> int)

// 1. Flip the arguments of subtract to create 'minus'
// 'minus' now has type 'b -> 'a -> 'c (int -> int -> int)
// It expects the subtrahend ('b) first, then the minuend ('a).
let minus = flip subtract // Uses 'subtract'

// 2. Partially apply the *subtrahend* (2) to the flipped function 'minus'.
// We provide the first argument expected by 'minus', which is the subtrahend (type 'b = int).
let minus2 = minus 2 // 'minus 2' returns a function of type 'a -> 'c (int -> int)
                     // This function is: fun minuend -> subtract minuend 2 => fun x -> x - 2

// 3. Use the new 'minus2' function in the pipeline
let pipelineResultSub = 10 |> minus2 // Passes 10 (type 'a = int) as the minuend
printfn "10 |> minus2 = %d" pipelineResultSub // Output: 10 |> minus2 = 8

// Alternatively, apply partially applied function inline
// The expression (minus 2) evaluates to the same function as minus2 above.
let pipelineResultSubAlt = 10 |> (minus 2) // Parentheses for clarity
printfn "10 |> (minus 2) = %d" pipelineResultSubAlt // Output: 10 |> (minus 2) = 8
```

First, we define `subtract` as the original `(-)` function. Then, we create `minus` by flipping `subtract`. This `minus` function now expects the subtrahend (`'b`) first. Partially applying `2` (the subtrahend) to `minus` correctly produces the function `minus2` (type `'a -> 'c` or `int -> int`) that waits for the minuend (`'a`) and computes `minuend - 2`. This `minus2` works perfectly with the pipeline, as shown by `10 |> minus2`.

Alternatively, instead of defining `minus2` separately, we can use the partially applied function `(minus 2)` directly within the pipeline, as shown by `10 |> (minus 2)`. This achieves the same result more concisely.

**The key point here is that `minus2` (or the inline `(minus 2)`) is now a simple unary function of type `int -> int`. It's ready to be plugged into a pipeline just like the `double` or `add1` functions we saw earlier, allowing for clear, sequential data transformation.**

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745151316464.png)

---

In summary, `flip` (defined as `fun f x y -> f y x`) is a higher-order function with the type `('a -> 'b -> 'c) -> 'b -> 'a -> 'c`. It returns a new function that expects arguments in the order corresponding to the *second* then the *first* argument types of the original function. This makes it extremely useful for creating pipeline-friendly functions via partial application, especially for non-commutative operations.