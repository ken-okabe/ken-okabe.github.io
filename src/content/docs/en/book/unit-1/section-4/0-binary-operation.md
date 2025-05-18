---
title: Binary Operations and the Pipeline Operator
description: >-
  We've seen how functional pipelines connect functions and resemble
  mathematical expressions. Let's now look at the underlying structure by
  examining binary operations and how the pipeline operator (|>) fits into this
  picture.
---
We've seen how functional pipelines connect functions and resemble mathematical expressions. Let's now look at the underlying structure by examining **binary operations** and how the pipeline operator (`|>`) fits into this picture.

## What are Binary Operations?

A **binary operation** is a fundamental concept in mathematics and programming. It's simply a rule that combines **two** inputs (called **operands**) using a specific **operator** to produce a single output.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744580262004.png)

-   Arithmetic operations are **binary operations** (they take two inputs).
![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744527199206.png)
-   Symbols like `+` and `*` are **binary operators**.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744527228018.png)

## The Pipeline Operator (`|>`): A Binary Operation with Functions

Now, let's look at the F# pipeline operator (`|>`) again:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let double x = x * 2
let result = 5 |> double // result is 10
```

Can we view the expression `5 |> double` as a binary operation? Let's examine its parts:

-   Operand 1: `5` 
    
-   Operator: `|>`
    
-   Operand 2: `double` (A function)

Yes! The pipeline operator `|>` acts as a **binary operator**. What's unique here is that its **second operand is a function value**.

This is possible precisely because, as we learned in the previous chapter, **functions are first-class values** in F#. They can be treated like data and used as operands in operations like the pipeline.

The `Value |> Function` structure takes the value as the first operand and the function as the second operand. It applies the function to the value and produces the function's output.

This allows us to chain these operations together seamlessly:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744496329575.png)

`5 |> double |> add1 |> double = 22`

```fsharp
let add1 x = x + 1
// Value |> Function --> Value |> Function --> Value |> Function --> Final Value
let result = 5 |> double |> add1 |> double // result is 22
```

Each `|>` step applies this binary operation, taking the result from the left as the first operand for the next step.

## Summary

-   A **binary operation** combines two operands with an operator to produce a result (e.g., `5 + 3`).
    
-   The pipeline operator (`|>`) acts as a binary operation where the structure is `Value |> Function`.
    
-   This is enabled by **first-class functions**, allowing functions to be used as operands (data).
