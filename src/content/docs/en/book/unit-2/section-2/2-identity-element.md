---
title: 'Identity Elements: The Neutral Value in Operations'
description: >-
  In the context of a set (or Type) A and a binary operation • defined on that
  set (as discussed for semigroups), an identity element (often called a "unit
  element") is a special value within A that, when combined with any other value
  from A using •, leaves that other value unchanged.
---
In the context of a **set (or Type) `A`** and a **binary operation `•`** defined on that set (as discussed for semigroups), an **identity element** (often called a "unit element") is a special value within `A` that, when combined with any other value from `A` using `•`, leaves that other value unchanged.

## Defining the Identity Element

A value `e` (which must be an element of set `A`, so `e` has type `'a` if `A` corresponds to type `'a`) is called an identity element for the operation `•` on set `A` if, for every element `x` in `A`:

*   **Left identity property:** `e • x = x`
*   **Right identity property:** `x • e = x`

This must hold true for all possible values of `x` within the set `A`.

## Identity Elements in Familiar Operations

Let's look at some familiar binary operations and their identity elements:

### Addition and Multiplication on Integers

For the **Type** `int` (the set of integers):

*   With the **binary operation `(+)`** (addition):
    *   The **identity element** is `0` (which is of type `int`).
    *   Property: For any integer `x`, `0 + x = x` and `x + 0 = x`.
        *   Example: `0 + 3 = 3` and `3 + 0 = 3`.

*   With the **binary operation `(*)`** (multiplication):
    *   The **identity element** is `1` (which is of type `int`).
    *   Property: For any integer `x`, `1 * x = x` and `x * 1 = x`.
        *   Example: `1 * 5 = 5` and `5 * 1 = 5`.

### String Concatenation

For the **Type** `string` (the set of all strings):

*   With the **binary operation `(+)`** (string concatenation):
    *   The **identity element** is `""` (the empty string, which is of type `string`).
    *   Property: For any string `s`, `"" + s = s` and `s + "" = s`.
        *   Example: `"" + "hello" = "hello"` and `"hello" + "" = "hello"`.

### Physical Examples: The Challenge of Finding a Natural Identity

In our physical analogies, a true identity element in the mathematical sense is often hard to find or doesn't naturally exist:

*   **LEGO blocks** (Set: LEGO blocks, Operation: joining two blocks):
    *   Is there a LEGO block `e` such that joining `e` with any block `X` results in `X` unchanged (i.e., `e` joined with `X` is indistinguishable from `X` alone, and `X` joined with `e` is also indistinguishable from `X` alone)?
    *   No, any physical LEGO piece, when connected, physically alters the resulting structure or occupies space. There isn't a "do-nothing" LEGO block that leaves the other block as if no connection was made.

*   **USB devices** (Set: USB devices, Operation: connecting two devices):
    *   Similarly, there's no physical USB device `e` that, when connected to another device `X` (or a hub `X`), results in a configuration that is functionally and structurally identical to `X` alone. Any connection typically introduces at least a new point in the device tree.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

**Uniqueness and Two-Sidedness of Identity Elements**

An important property of an identity element, if one exists for a given binary operation `•` on a set `A`, is that it must be **unique** and it must be both a **left identity** and a **right identity**.

Let's prove this:

Assume, for a set `A` with a binary operation `•`, that `eL` is a left identity (so `eL • x = x` for all `x` in `A`) and `eR` is a right identity (so `x • eR = x` for all `x` in `A`). Both `eL` and `eR` are elements of `A`.

1.  Since `eL` is a left identity, it holds for `x = eR`. So, `eL • eR = eR`.
2.  Since `eR` is a right identity, it holds for `x = eL`. So, `eL • eR = eL`.

From steps 1 and 2, we have `eR = eL • eR` and `eL = eL • eR`.
Therefore, `eL = eR`.

This shows that if a left identity and a right identity both exist, they must be the same element. This also implies that if an identity element exists, it is unique. (If `e1` and `e2` were both two-sided identities, then `e1 = e1 • e2` (since `e2` is a right identity) and `e1 • e2 = e2` (since `e1` is a left identity), thus `e1 = e2`.)

So, for a given binary operation on a set:
*   You can't have just a left identity that isn't also a right identity (if a right identity also exists, and vice-versa).
*   If an identity element exists, it's the only one.

Let's confirm with our examples:
*   For (`int`, `+`): `0` is the unique two-sided identity.
*   For (`int`, `*`): `1` is the unique two-sided identity.
*   For (`string`, `+`): `""` is the unique two-sided identity.

This uniqueness and two-sided nature is a fundamental characteristic of identity elements in algebraic structures.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">
