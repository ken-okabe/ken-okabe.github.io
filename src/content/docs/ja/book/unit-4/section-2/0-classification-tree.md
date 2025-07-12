---
title: 'Applicative Functor: The Parallel Computable Structure'
description: >-
  Focusing on the  Container Preserving Operations > Binary Operations  section
  of the classification above:
---
## Functional Programming Patterns (F# notation)

-   **Container Preserving Operations**
    -   **Unary Operations**: `F<'a> -> F<'b>`

        -   Universal function: `map: ('a -> 'b) -> F<'a> -> F<'b>` [**Functor**]
        -   Monadic function: `bind: ('a -> F<'b>) -> F<'a> -> F<'b>` [**Monad**]

    -   **Binary Operations**:  
        `map2: ('a -> 'b -> 'c) -> F<'a> -> F<'b> -> F<'c>` 

        -   **Independent Binary Operations**:  
            [**Applicative Functor**] (*parallel computable*)
            -   **Cartesian Product**:   
                The elements of two containers are combined in all possible pairings.
            
            -   **Pointwise**:  
                Two containers are combined one-to-one.

        -   **Dependent Binary Operations** (*sequential only*)  
            Implemented by **Monad**. The second computation depends on the result of the first.

-   **Container Elimination Operations**
    -   **Fold**: `fold: ('a -> 'b -> 'a) -> 'a -> F<'b> -> 'a`

-   **Container Generation Operations**: `('a -> F<'b>)`
    -   **Identity**: `ID: 'a -> F<'a>`
    -   **Unfold**: `unfold: ('b -> ('a * 'b) option) -> 'b -> F<'a>`

## Applicative Functor: The Parallel Computable Structure

Focusing on the  **Container Preserving Operations > Binary Operations**  section of the classification above:

### Independent Binary Operation

If the inputs `'a'` and `'b'` for the binary operation lifted by `map2: ('a -> 'b -> 'c) -> F<'a> -> F<'b> -> F<'c>` are independent of each other, as in an **Independent Binary Operation**, then we specifically call that algebraic structure an **Applicative Functor**.

If a structure is an Applicative Functor, it is **parallel computable**.

### Dependent Binary Operation

On the other hand, in the case of a **Dependent Binary Operation** (*sequential only*), even if the function takes the form of `map2: ('a -> 'b -> 'c) -> F<'a> -> F<'b> -> F<'c>`, we do not call it an Applicative Functor.
