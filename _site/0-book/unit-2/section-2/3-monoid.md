:::lang-en

# Monoids: Semigroups with an Identity Element

A **Monoid** is an algebraic structure that builds directly upon the concept of a Semigroup. It starts with the same requirements:

*   A non-empty set (in programming terms, a **Type**, let's call it `'a'`).
*   A binary operation `•` (in programming, a function of type **`'a -> 'a -> 'a`**) that is closed over the type `'a'`.
*   This operation `•` must be **associative**: `(x • y) • z = x • (y • z)` for all `x, y, z` of type `'a'`.

And then adds one crucial additional requirement:

*   There must exist an **identity element** `e` (also of type `'a'`) within the set `A` (our Type `'a'`) such that for every element `x` of type `'a'`:
    *   `e • x = x` (left identity)
    *   `x • e = x` (right identity)

In simpler terms, **a monoid is a semigroup that possesses an identity element** for its binary operation. All the benefits of associativity from semigroups still apply, but now we also have a special "neutral" element.

## Examples of Monoids

Let's revisit our familiar examples and see which ones form monoids:

*   **Integers with Addition:**
    *   Type (Set): `int`
    *   Binary Operation: `(+)` (type `int -> int -> int`), which is associative.
    *   Identity Element: `0` (type `int`), since `0 + x = x` and `x + 0 = x`.
    *   Therefore, (`int`, `(+)`, `0`) is a monoid.

*   **Integers with Multiplication:**
    *   Type (Set): `int`
    *   Binary Operation: `(*)` (type `int -> int -> int`), which is associative.
    *   Identity Element: `1` (type `int`), since `1 * x = x` and `x * 1 = x`.
    *   Therefore, (`int`, `(*)`, `1`) is a monoid.

*   **Strings with Concatenation:**
    *   Type (Set): `string`
    *   Binary Operation: `(+)` for strings (type `string -> string -> string`), which is associative.
    *   Identity Element: `""` (the empty string, type `string`), since `"" + s = s` and `s + "" = s`.
    *   Therefore, (`string`, `(+)` for concatenation, `""`) is a monoid.

*   **Booleans with Logical OR:**
    *   Type (Set): `bool`
    *   Binary Operation: Logical OR (let's denote `||`), which is associative (`(p || q) || r = p || (q || r)`).
    *   Identity Element: `false`, since `false || p = p` and `p || false = p`.
    *   Therefore, (`bool`, `||` (OR), `false`) is a monoid.

*   **Booleans with Logical AND:**
    *   Type (Set): `bool`
    *   Binary Operation: Logical AND (let's denote `&&`), which is associative (`(p && q) && r = p && (q && r)`).
    *   Identity Element: `true`, since `true && p = p` and `p && true = p`.
    *   Therefore, (`bool`, `&&` (AND), `true`) is a monoid.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

**Constructing Monoids from Semigroups**

What about our physical examples like LEGO blocks or USB devices, which formed semigroups but seemed to lack natural identity elements?

Mathematically, it's often possible to extend a semigroup to form a monoid by formally "adjoining" an identity element if one doesn't already exist within the original set.
For instance:

*   **LEGO blocks:** We could *define* a "virtual empty block" `e_lego` such that connecting `e_lego` to any block `X` (or `X` to `e_lego`) results in `X`. In a CAD system or a game, this `e_lego` could be a perfectly valid concept, allowing the (LEGO blocks + `e_lego`, join operation, `e_lego`) system to be treated as a monoid.
*   **USB devices:** Similarly, a "virtual null-port hub" could act as an identity for USB connections in a simulation.

This doesn't mean every semigroup *is* a monoid in its original form, but it highlights that the monoid structure (associativity plus identity) is a very common and useful pattern that can sometimes be achieved by augmenting a semigroup with a suitable identity concept. The key is whether such an identity element makes sense and behaves correctly within the context of the set and operation.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Why Monoids Matter

The addition of an identity element to the associative binary operation of a semigroup provides significant advantages in programming:

1.  **All benefits of a Semigroup:** We retain the crucial property of **associativity**, which allows for flexible grouping of operations and is key for tasks like parallel computation or efficient folding/reduction of sequences.
2.  **A "Neutral" Starting Point / Default Value:** The **identity element** provides a natural "zero" or "empty" or "default" value for the operation. This is extremely useful:
    *   When reducing a collection of items: if the collection is empty, the identity element is the sensible result (e.g., sum of an empty list of numbers is `0`, product is `1`, concatenation of an empty list of strings is `""`).
    *   As an initial value for accumulators in folds or loops.
    *   For representing a default or an "un-effected" state.

This combination of an associative binary operation and an identity element makes monoids a very powerful and frequently encountered pattern in functional programming, especially when dealing with aggregation, combination, or processing sequences of data.

:::