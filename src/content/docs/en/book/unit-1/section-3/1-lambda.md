---
title: First-Class Functions and Lambda Expressions
description: >-
  In the previous chapter ["Types: Ensuring Smooth Pipelines"], we saw that
  functions, like other data, have types (e.g., int -> int, 'a -> 'a) that
  define their inputs and outputs, ensuring our pipelines connect correctly.
  This understanding of functions having types naturally leads us to explore how
  we can work with these function values directly.
---
In the previous chapter ["Types: Ensuring Smooth Pipelines"], we saw that functions, like other data, have **types** (e.g., `int -> int`, `'a -> 'a`) that define their inputs and outputs, ensuring our pipelines connect correctly. This understanding of functions having types naturally leads us to explore how we can work with these function values directly.

## Lambda Expressions: Anonymous Functions

If functions are values with types, how do we represent them directly as expressions, especially simple ones we might only need once? This leads us to **Lambda Expressions**, also known as **anonymous functions**.

Lambdas are the syntax for creating **function values** inline, without needing a separate `let` binding. They are the direct expression form of first-class functions.

## Why Use Lambda Expressions? Consistency with Types!

In the previous chapter, we saw that functions have types, often written with an arrow, like `int -> int` (a function taking an `int` and returning an `int`). Functional programming provides a syntax to directly create function values that **visually matches** this type notation: **Lambda Expressions**.

The lambda syntax `fun parameter -> expression` allows us to define this function value directly where it's needed. Notice the structural similarity:

-   **Type Notation:** `input_type -> output_type` (e.g., `int -> int`)
    
-   **Lambda Syntax:** `fun input_parameter -> output_expression` (e.g., `fun x -> x * x`)

The arrow `->` appears in both, visually connecting the input to the output. Lambda expressions provide a direct, inline syntax that is **consistent with the function types** used to describe them. This syntactic consistency is a primary motivation for using lambdas – they are the natural way to write down an expression whose _value_ has a function type, especially for simple, one-off functions passed to other functions.

## The Simplest Lambda: Identity and Generics

The simplest lambda returns its input unchanged:  `a -> a` .

![Diagram showing mapping from a to a](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744888895623.png)

![Diagram showing a looping back to a](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744888916969.png)

This is the  **Identity function** , often predefined as `id`.

![Diagram showing id function mapping a to a](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744888983112.png)

![Screenshot of F# id function type signature](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744889000150.png)

If we check the type of the `id` function (perhaps by temporarily assigning it to a name like `f`), the compiler or IDE shows its type as `'a -> 'a`.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744892235032.png)

This confirms that its structure matches the conceptual Identity function `a -> a`.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

The `'a` in the type signature `'a -> 'a` is important. It's a **generic type parameter**, acting as a **placeholder** for any type. This means `id` is a function value that works for any type `T`, having the type `T -> T`.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745569160992.png)

This relates to the general concept of placeholders seen elsewhere:

web forms:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745381798686.png)

---

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745382163946.png)

type placeholders:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745382883047.png)

---

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745382601165.png)

---

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745569083188.png)

or even function arguments `x` in `f(x)`.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

Generics make function values like `id` highly reusable across different data types.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// val id: x:'a -> 'a (Generic type 'a -> 'a)
let resultNum = id 3 // 'a becomes int, result is 3 (int)
let resultStr = id "hello" // 'a becomes string, result is "hello" (string)
```

_(JS equivalent requires manual definition):_

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/javascript.svg">

```js
// Type in TS might be: <T>(a: T) => T
let id = a => a;
let result1 = id(3);
let result2 = id("hello");
```

## Lambda Syntax

F# Lambda Syntax:  `fun ->`

Uses the fun keyword:  `fun parameter(s) -> expression` . The resulting expression is a function value.

**Simple Examples:**

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

-   Adds 1:
    
    ```fsharp
    fun x -> x + 1 // This expression has type: int -> int
    ```
    
-   Converts string to uppercase:
    
    ```fsharp
    fun s -> s.ToUpper() // This expression has type: string -> string
    ```
    
-   Adds two numbers:
    
    ```fsharp
    fun a b -> a + b // This expression has type: int -> int -> int
    ```
    
    It's important to note that F# functions are automatically _curried_. This means a function that appears to take multiple arguments, like `fun a b -> a + b` (with type `int -> int -> int`), can also be seen as `fun a -> (fun b -> a + b)`. In this view, the function takes the _first_ argument (`a` of type `int`) and returns a _new function_ (`fun b -> a + b`, which has the type `int -> int`). Viewed this way, the lambda `fun a b -> a + b` actually fits **HOF Pattern (`Input |> Function = Function`)** because applying it to the first argument (`a`) results in a function being returned.

These directly define function _values_ with specific _types_.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

**Syntax Across Languages**

Lambda expression syntax varies between languages, but often uses an arrow-like symbol (`=>`, `->`), reflecting the mathematical concept of mapping.

```sh
a => a        // C#/JavaScript
\a -> a       // Haskell
fun a -> a    // F#
|a| a         // Rust
```

F#'s `fun` keyword might feel verbose and inferior for a functional language, but like `let`, it's a 4-character keyword including the space. When formatting with 4-space indents, it allows writing clean code where argument indentation aligns naturally within a clear scope.

*This formatting benefit can be seen in more complex lambda expressions:*

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let bind =
    fun monadf timelineA ->
        let timelineB = timelineA._last |> monadf // Create new timeline with monadF
        let newFn =                    // Create function to propagate future updates
            fun a ->
                let timeline = a |> monadf
                timelineB |> next timeline._last

        timelineA._fns <- timelineA._fns @ [ newFn ] // Register new function
        timelineB                                    // Return new timeline
```

The consistent 4-character width (`let` and `fun` ) helps maintain visual alignment for function bodies and arguments, contributing to code readability in F#.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Using Lambdas

1. Naming Lambdas (Assigning Function Values):

You can assign lambda expressions (function values) to names using let.

```fsharp
// Assign the lambda value to 'double'
let double = fun a -> a * 2 // double has type: int -> int
let result = double 1       // result is 2 (int)
```

2. Passing Lambdas as Arguments (to HOFs):

A primary use is passing simple logic directly to Higher-Order Functions (HOFs) like List.map, avoiding separate let bindings. (More on HOFs later).

```fsharplet squares = [1; 2; 3; 4] |> List.map (fun x -> x * x)  // Result: [1; 4; 9; 16]```

3. Lambdas in Pipelines:

Useful for inline transformation steps.

```fsharp
" john smith " // Type: string
|> fun str -> str.ToUpper() // Lambda type: string -> string. Output: string
|> fun str -> str.Trim()    // Lambda type: string -> string. Output: string
|> sprintf "Hello, %s!"   // Function type: string -> string. Output: string
```

Each lambda expression evaluates to a function value, which is then applied via the pipeline.

## Summary

-   **First-Class Functions:** The core idea that functions are values, just like numbers or strings, with specific **types**. They can be assigned, passed, and returned. This is a key feature of functional **languages**.
    
-   **Lambda Expressions:** A concise syntax (`fun ->` in F#) for creating anonymous function values inline, directly representing function logic as typed data, consistent with function **type notation**.
    
-   **Primary Use:** Defining simple functions directly where needed, especially for passing as arguments to Higher-Order Functions or within data transformation pipelines, relying on type compatibility.
