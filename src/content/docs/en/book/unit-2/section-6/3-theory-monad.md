---
title: 'The Monad Laws: Verifying the Kleisli Composition Monoid'
description: >-
  Having explored Functors and the crucial concept of structure preservation, we
  now turn our attention to Monads. Monads represent another fundamental
  structure in functional programming, often used to sequence computations that
  involve some form of context, such as handling potential absence of values
  (Option), managing multiple possible outcomes (List), dealing with
  asynchronous operations (Async, Task), or managing state.
---
Having explored Functors and the crucial concept of structure preservation, we now turn our attention to **Monads**. Monads represent another fundamental structure in functional programming, often used to sequence computations that involve some form of context, such as handling potential absence of values (`Option`), managing multiple possible outcomes (`List`), dealing with asynchronous operations (`Async`, `Task`), or managing state.

To ensure these sequenced computations behave predictably and compose reliably, the core operations provided by a Monad must adhere to specific rules: the **Monad Laws**. This chapter aims to illuminate these laws, providing a deeper understanding of what makes a Monad work.

## Recap: Kleisli Arrows

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747205448469.png)

First, let's recall **Kleisli arrows** from Unit 2, Section 5. These are the specialized functions that Monads are designed to work with. Unlike regular functions (`'a -> 'b`), Kleisli arrows take a regular value (`'a`) and return a value wrapped in the monadic context `M` (`'a -> M<'b>`). They represent a computation step whose result is context-dependent.

## The `bind` Operation

The primary mechanism Monads provide for sequencing Kleisli arrows is the `bind` operation. In F#, a common function that embodies the `bind` concept for lists is `List.collect`.

The type signature for such a `bind` operation, which takes a Kleisli arrow (a function producing a monadic value) and a monadic value itself, and then applies the function to the contents of the monadic value, is generally:
**`bind : ('a -> M<'b>) -> M<'a> -> M<'b>`**

This means `bind` takes:
1.  A Kleisli arrow `k: 'a -> M<'b>` (a function that takes a plain `'a` and returns a monadic `'b\`).
2.  A monadic value `mVal: M<'a>` (a value of type `'a` already wrapped in the monadic context `M`).
And it returns a new monadic value `M<'b>`.

### List Monad is `List.collect` in F#
F#'s `List.collect` function is a prime example of a `bind` operation for the List monad.
![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745804453086.png)
Its type `('a -> 'b list) -> 'a list -> 'b list` perfectly matches our `bind` signature where `M` is `list`.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745804937535.png)
*(This image shows `List.collect` taking a function `int -> int list` and an `int list`, producing an `int list`)*

Usage often looks like: `List.collect kleisliArrowF monadicValueA`.
Alternatively, Haskell's `>>=` infix operator has the signature `m a -> (a -> m b) -> m b`, which is `M<'a> -> ('a -> M<'b>) -> M<'b>`. The core idea is combining `M<'a>` and `'a -> M<'b>` to get `M<'b>`. For our discussion focusing on how `bind` facilitates Kleisli composition, the `('a -> M<'b>) -> M<'a> -> M<'b>` form (like `List.collect`) is convenient.

## Understanding the Monad Laws: The Kleisli Monoid Approach

How do we ensure that chaining operations with `bind` is well-behaved? This is where the Monad Laws come in. Typically, three laws involving `bind` and an identity operation (which we'll call `ID` or `return`/`unit`) are presented.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747205671216.png)

However, there's an equivalent formulation that arguably provides deeper insight into the algebraic structure Monads impose. This approach focuses on defining **composition directly for Kleisli arrows**. Let's denote this **Kleisli composition** operator as `>>>`.

A type constructor `M` forms a Monad if and only if its Kleisli arrows (`'a -> M<'b>`) form a **Monoid** under this composition operator `>>>`, with the identity Kleisli arrow (`ID : 'a -> M<'a>`) acting as the Monoid's identity element.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747204849057.png)

Why adopt this perspective? Because it connects directly to concepts we've already established:

1.  We know function composition (`>>`) forms a natural Monoid (associativity + `id`).
2.  We established that preserving this compositional structure is key for robust abstractions like Functors.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747205891858.png)

The Kleisli Monoid approach reveals that Monads achieve robustness by ensuring that the composition of *Kleisli arrows* (`>>>`) also adheres to the fundamental Monoid laws (associativity and identity laws) using `ID` as the identity. The standard Monad laws for `bind` are precisely the conditions needed to guarantee this Kleisli Monoid structure holds.

Therefore, in this chapter, we will verify the Monad structure by demonstrating these Kleisli Monoid properties, highlighting the core algebraic foundation.

## Definitions for General Monad `M`

Let `M` represent any type constructor that forms a valid Monad. We define `bind` with the F#-like signature for consistency with `List.collect`.

* **Kleisli Arrow (Monadic Function):** A function with the signature:
    `'a -> M<'b>`
* **Identity Kleisli Arrow (`ID` or `return` or `unit`):** The function that lifts a plain value `a` into the minimal monadic context `M`.
    `val ID<'a> : 'a -> M<'a>`
* **`bind` operation:**
    `val bind : ('a -> M<'b>) -> M<'a> -> M<'b>`
* **Kleisli Composition (`>>>`):** An operator to compose two Kleisli arrows, defined using `bind`.
    `val inline (>>>) : ('a -> M<'b>) -> ('b -> M<'c>) -> ('a -> M<'c>)`
    The definition, using our chosen `bind` signature, is: 
    `let (>>>) f g = fun a_val -> bind g (f a_val)`
    *(Read as: Apply Kleisli arrow `f` to `a_val` (yielding an `M<'b>`). Then, pass this `M<'b>` as the second argument to `bind`, with the Kleisli arrow `g` as the first argument.)*

## Setup for Examples (Generic)

Let's define some generic Kleisli arrows for illustration, assuming `M` is a valid Monad providing `M.ID` and a `bind` function (with signature `('x -> M<'y>) -> M<'x> -> M<'y>`).

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Assume M is a valid Monad with M.ID and bind defined as:
// val bind : ('k_in -> M<'k_out>) -> M<'k_in> -> M<'k_out>

// Sample Kleisli Arrows
let f_kleisli: int -> M<string> = fun i -> M.ID (sprintf "f(%d)" i)
let g_kleisli: string -> M<float> = fun s -> M.ID (float s.Length)
let h_kleisli: float -> M<bool> = fun fl -> M.ID (fl > 10.0)

// Initial Value for testing compositions
let initialSimpleValue = 5
```

## Verification of Kleisli Monoid Laws (via Standard Monad Laws)

We now demonstrate that if `M` is a valid Monad (meaning `bind` and `ID` satisfy the standard Monad laws), then the Kleisli composition `>>>` (defined via `bind` as `fun a -> bind g (f a)`) necessarily satisfies the Monoid laws with `ID`.

---

### **Law 1: Associativity**

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747204989154.png)

* **Equation:** `(f_kleisli >>> g_kleisli) >>> h_kleisli = f_kleisli >>> (g_kleisli >>> h_kleisli)`
* **Goal:** Show that composing Kleisli arrows `f_kleisli`, `g_kleisli`, and `h_kleisli` is associative. This means applying the differently grouped compositions to an initial value `a` should yield identical results in the context `M`.
* **Illustrative Code Structure (Conceptual LHS applied to `a_val`):**
    ```fsharp
    // ( (f_kleisli >>> g_kleisli) >>> h_kleisli ) a_val
    // = bind h_kleisli ( (f_kleisli >>> g_kleisli) a_val )             // Def of outer >>>
    // = bind h_kleisli ( bind g_kleisli (f_kleisli a_val) )            // Def of inner >>>
    ```
* **Illustrative Code Structure (Conceptual RHS applied to `a_val`):**
    ```fsharp
    // ( f_kleisli >>> (g_kleisli >>> h_kleisli) ) a_val
    // = bind (g_kleisli >>> h_kleisli) (f_kleisli a_val)               // Def of outer >>>
    // Let m_intermediate = f_kleisli a_val. 
    // This becomes: bind (fun b_val -> bind h_kleisli (g_kleisli b_val)) m_intermediate 
    ```
* **Equivalence Explanation:** The required equivalence is:
  `bind h_kleisli ( bind g_kleisli m_intermediate )` must be equivalent to `bind (fun x -> bind h_kleisli (g_kleisli x)) m_intermediate` (where `m_intermediate = f_kleisli a_val`).
  This is precisely the **associativity law of the `bind` operation** itself (one of the three standard Monad laws). If `bind` has the signature `('k_in -> M<'k_out>) -> M<'k_in> -> M<'k_out>`, the law is often stated as: `bind k2 (bind k1 m) = bind (fun x -> bind k2 (k1 x)) m`. Our expressions match this structure.
    **Therefore, the Associativity Law holds for `>>>` (guaranteed by `bind`'s associativity).**

---

### **Law 2: Left Identity**

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747205208301.png)

* **Equation:** `ID >>> f_kleisli = f_kleisli`
* **Goal:** Show that composing the identity Kleisli arrow `ID` before `f_kleisli` has no effect.
* **Illustrative Code Structure (Conceptual LHS applied to `a_val`):**
    ```fsharp
    // ( ID >>> f_kleisli ) a_val
    // = bind f_kleisli ( ID a_val )                          // Def of >>>
    ```
* **RHS applied to `a_val` is `f_kleisli a_val`.**
* **Equivalence Explanation:** The required equivalence `bind f_kleisli ( ID a_val ) = f_kleisli a_val` is precisely the **left identity law for `bind`** (another standard Monad law). (Often stated as: `bind f (return a) = f a`, where `return` is our `ID`).
    **Therefore, the Left Identity Law holds for `>>>`.**

---

### **Law 3: Right Identity**

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747205208301.png) 
*(Note: The image for right identity should ideally show f >>> ID)*

* **Equation:** `f_kleisli >>> ID = f_kleisli`
* **Goal:** Show that composing `f_kleisli` with `ID` afterwards has no effect.
* **Illustrative Code Structure (Conceptual LHS applied to `a_val`):**
    ```fsharp
    // ( f_kleisli >>> ID ) a_val
    // = bind ID ( f_kleisli a_val )                          // Def of >>>
    ```
* **RHS applied to `a_val` is `f_kleisli a_val`.**
* **Equivalence Explanation:** The required equivalence `bind ID ( f_kleisli a_val ) = f_kleisli a_val`. Let `m_val = f_kleisli a_val` (which is of type `M<'b>`). We need to show `bind ID m_val = m_val`. This is precisely the **right identity law for `bind`** (the third standard Monad law). (Often stated as: `m >>= return = m`, where `return` is our `ID`).
    **Therefore, the Right Identity Law holds for `>>>`.**

## Conclusion

We have demonstrated that the standard Monad Laws, typically expressed in terms of `bind` and `ID` (or `return`/`unit`), are mathematically equivalent to requiring that **Kleisli composition (`>>>`) forms a Monoid with `ID` as its identity element**.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747204849057.png)

If a type constructor `M` along with its `ID` and `bind` (signature `('a -> M<'b>) -> M<'a> -> M<'b>`) operations satisfy the three standard Monad laws, then its associated Kleisli composition `>>>` (defined as `fun a -> bind g (f a)`) is guaranteed to be associative and have `ID` as its identity.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747206323768.png)

This Kleisli Monoid perspective reinforces the idea that Monads are fundamentally about providing a **structured, predictable way to compose computations within a context**. The laws ensure that this composition mechanism adheres to the robust algebraic properties of a Monoid, fulfilling the "structure preservation" goal we discussed earlier and enabling the reliable chaining of monadic operations.
