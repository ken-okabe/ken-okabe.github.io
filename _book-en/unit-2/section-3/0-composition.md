# Function Composition: A Natural Monoid

In the previous chapter, we learned about **Monoid** as an algebraic structure with an associative binary operator and an identity element. Now, let's explore an interesting fact: the **function pipeline** itself that we use most fundamentally is also a Monoid.

## Function Composition as Concatenation

Just like addition of numbers or concatenation of strings, functions can be combined using a binary operation. In fact, a pipeline is essentially a "concatenation" of functions.

Let's recall string concatenation:

```fsharp
"Hello" + " " + "World"  // "Hello World"
```

Similarly, we can concatenate functions using the function composition operator `>>`:

```fsharp
double >> add1 >> double  // Composed Function
```

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744496329575.png)

## Associativity of Function Composition

F#'s `>>` is the **function composition operator**. This operation of composing functions exhibits associativity.

For example, let's consider composing two `double` functions with an input of `1`:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745411970807.png)

```fsharp
  1 |> double |> double
= (1 |> double) |> double
= 1 |> (double >> double)
= 4
```

This means:

- First applying `double` to the input and then applying `double` again to the result
- Applying the composition of two `double` functions to the input at once

We can enhance this:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745413454234.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745413514862.png)

These yield exactly the same result, demonstrating that function composition is **associative**.

## Function Pipeline is Associative

The complicated diagram of operators above is  **an accurate representation of what the F# code does** , but there is absolutely no need to be overwhelmed.If you feel confused, just understand that it simply means that - arithmetic addition- arithmetic multiplication- string concatenation- Lego blocks- USBs-  **function pipelines**  are all  **associative**  – that's all there is to it.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1746181236237.png)

When visualized, **each of these is the same thing, differing only in how they are grouped.**

Let's understand that this property, where **the result is the same regardless of the grouping order, is called Associativity** , and function pipelines are an example of this.

## The Identity Function: Unit Element of Composition

The unit element for function composition is the **Identity function**, which simply returns its input unchanged:

![Diagram showing id function mapping a to a](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744888983112.png)

![Screenshot of F# id function type signature](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744889000150.png)

For any function `f`:

```fsharp
f >> id = f  // right identity
id >> f = f  // left identity
```

## Function Composition Forms a Monoid

From the above, we can see that function composition:

1. Is associative $(f \gg g) \gg h = f \gg (g \gg h)$
2. Has an identity element (Identity function)

Therefore, **(Set of functions, function composition, Identity function)** forms a **Monoid**!

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745414533607.png)

This is a profound realization. The composition of functions that we use in our code shares the exact same algebraic structure as number addition or string concatenation. This structural consistency is one of the sources of the elegance and power of functional programming.

$$
(1+2)+3 = 1+(2+3) 
$$

$$
0 + 1 = 1 = 1 + 0
$$

$$
(f \gg g) \gg h = f \gg (g \gg h)
$$

$$
id \gg f = f = f \gg id
$$