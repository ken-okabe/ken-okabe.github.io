---
title: Pipelines and Expressions as Values
description: >-
  In the previous chapter, we saw how functional programming uses pipelines to
  transform data sequentially. Let's delve deeper into why this approach feels
  natural and powerful, connecting it to familiar concepts and introducing core
  functional ideas.
---
In the previous chapter, we saw how functional programming uses pipelines to transform data sequentially. Let's delve deeper into why this approach feels natural and powerful, connecting it to familiar concepts and introducing core functional ideas.

## Pipelines as Expressions: The Arithmetic Connection

Let's revisit our F# pipeline example:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744496329575.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744526390281.png)

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Define helper functions for clarity
let double = (*) 2
let add1 = (+) 1
```

```fsharp
let result =
    number
    |> double // Apply the double function -> 10
    |> add1   // Apply the add1 function -> 11
    |> double // Apply the double function again -> 22
```

```fsharp
let result =
    number
    |> (*) 2  // Apply the double function -> 10
    |> (+) 1  // Apply the add1 function -> 11
    |> (*) 2  // Apply the double function again -> 22
```

This pipeline looks remarkably similar to how we'd write the calculation in standard mathematics:

`((5 * 2) + 1) * 2 = 22`

Both the F# pipeline and the mathematical formula share key characteristics:

-   They start with an input value (`5`).
    
-   They apply a sequence of operations (`* 2`, `+ 1`, `* 2`).
    
-   They produce a single output value (`22`).
    
-   Crucially, both are self-contained **expressions** that evaluate to a value, rather than a series of statements that modify state.

This connection between functional pipelines and mathematical expressions is fundamental. Functional programming often strives to make code look and behave more like mathematical expressions.

## Expressions, Values, and Data: It's All the Same!

Let's look closer at the result of our calculations. The arithmetic expression `((5 * 2) + 1) * 2` equals `22`. The F# pipeline `5 |> double |> add1 |> double` also evaluates to `22`. What _is_ this `22`?

**Values in Mathematics**

In basic math, numbers like `5` or `22` represent specific quantities. We call them **values**. An **expression**, like `((5 * 2) + 1) * 2`, is something that can be calculated, or _evaluated_, to produce a single **value** (`22`). Think of expressions as recipes for getting values.

**Data and Values in Programming**

In programming, we work with information, generally called **Data**. Specific pieces of information that a program can manipulate – like the number `22`, the text `"Hello"`, or the boolean `true` – are called **Values**. A value is a concrete piece of data.

**The Bridge: Math Values == Programming Values/Data**

Here's the key insight: The **value** (`22`) you get from evaluating a mathematical **expression** is _exactly the same kind of thing_ as a **Value** (which is Data) in programming.

-   The number `5` on a math worksheet represents the same concept as the `5` in our code – it's a value, a piece of data.
    
-   The result `22` from the arithmetic expression is the same value/data as the result `22` from the F# expression. The way we calculate it differs (math formula vs. code pipeline), but the resulting value is identical.

**Connecting to School Math**

The math we learn early on (arithmetic, algebra) is all about applying operations (in expressions) to values (numbers) to get new values. Functional programming builds directly on this familiar foundation. It focuses on constructing programs by combining **expressions** that operate on and produce **values (data)**. The "Data" and "Values" in programming are concrete representations of the same abstract values you've worked with in math.

**Summary & Next Step**

So, both mathematical expressions and functional pipelines are primarily concerned with evaluating to **values** (data). This focus on expressions and values is central to FP.

Now, a fascinating question arises: can _functions themselves_ be treated as values in programming? That's exactly what we'll explore next when we discuss First-Class Functions.
