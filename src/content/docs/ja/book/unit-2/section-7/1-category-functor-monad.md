---
title: 'Beyond Simple Mapping: Preserving the Structure of Composition'
description: >-
  In our initial exploration of Functors (in Unit 2, Section 4), we used a
  helpful analogy to build intuition. We revisited the basic concept of mapping
  between sets:
---
In our initial exploration of Functors (in Unit 2, Section 4), we used a helpful analogy to build intuition. We revisited the basic concept of mapping between sets:

![Mapping between Set X and Set Y](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745577833678.png)

And extended this idea to mapping between *sets of functions*:

**In this context, a Functor is essentially this same kind of mapping, but where both Set X and Set Y are sets of functions.**

For clarity, let's call these sets of functions Set F and Set G:

![Mapping between Set F and Set G](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745577612988.png)

This analogy, comparing a Functor to a Higher-Order Function that transforms functions, serves as a useful starting point. However, as noted previously, this view is incomplete:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

**Here**, we introduced the concept of a Functor using an analogy based on familiar ideas of mapping as shown in the diagram. We extended the idea of mapping values between sets to mapping functions between sets of functions to build an initial intuition.

It's important to understand that this initial explanation was designed primarily to help grasp the  **core intuitive idea**  behind Functors, which is the concept of transforming content while preserving structure.

However, as our more detailed discussions will reveal later, this analogy alone is insufficient for a **rigorous definition** of a Functor. To define Functors precisely, we need to introduce the **Functor Laws** (Identity and Composition), which are specific rules that these operations must satisfy.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

So, what exactly is missing from this initial analogy? Why is simply being a mapping between functions not enough? To understand the "More Than That" required for Functors and Monads, we need to look at the crucial concept of **structure preservation**, particularly concerning function composition. The key lies in understanding the robust structure already inherent in function composition itself.

## The Foundation: Function Composition is a Natural Monoid

Let's recall our discussion from Unit 2, Section 3 ("Function Composition: A Natural Monoid"). We established a fundamental and truly remarkable property: **function composition forms a Monoid**.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745414533607.png)

For functions that map a type back to itself (like `int -> int` or `'a -> 'a`), the act of composing them using the `>>` operator exhibits:

1.  **Associativity:** `(f >> g) >> h` is equivalent to `f >> (g >> h)`. The grouping doesn't matter.
2.  **Identity Element:** The `id` function (`fun x -> x`) acts as an identity: `id >> f = f` and `f >> id = f`.

This inherent Monoid structure means function composition is naturally robust and predictable. Combining functions sequentially "just works" in a mathematically sound way, much like adding numbers or concatenating strings. This reliable structure is the bedrock upon which functional programming builds its pipelines.

## The Structure Preservation Problem

Now, let's consider the world of containers and the functions that operate on them, like `map` (for Functors) and `bind` (for Monads). We need to examine composition in three distinct contexts:

1.  **(Inner World) Composition of Regular Functions:** As we just reaffirmed, functions operating on regular values inside containers (like `f: A -> B` and `g: B -> C`) can be composed (`f >> g: A -> C`), and this composition forms a Monoid (when types align appropriately, e.g., `A -> A`). This is our baseline, well-behaved structure.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747107039123.png)

2.  **(Outer World) Composition of Mapping Functions:** The functions that `map` and `bind` *produce*  the ones that operate on containers (like `map f: List<A> -> List<B>` and `map g: List<B> -> List<C>`)  can *also* be composed. We can certainly define `(map f) >> (map g): List<A> -> List<C>`. Function composition works here too, forming its own Monoid structure in the "outer" world of container transformations.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747107081688.png)

3.  **The Core Question: Does Lifting Preserve Structure?** Here lies the crucial issue. We have a Monoid structure for composing regular functions (like `f >> g` in world 1). We also have a Monoid structure for composing the container mapping functions (like `map f >> map g` in world 2). The operations `map` and `bind` act as bridges, "lifting" functions from world 1 to world 2. The critical question is: **Does this lifting operation preserve the Monoid structure?

    Specifically:
    * Does mapping the identity function (`id`) result in an identity mapping function for containers? (`map id = id_container?`)
    * Does mapping a composed function (`f >> g`) yield the same result as composing the mapped functions (`map f >> map g`)? Is `map (f >> g)` equivalent to `(map f) >> (map g)`?

    This equivalence is **not automatically guaranteed** just because `map` is a higher-order function. It's an *additional property* we might desire.

## The Requirement: Why Structure Preservation Matters

Why should we care if `map` or `bind` preserves the structure of composition and identity? Because requiring this preservation leads to **more predictable, reliable, and composable abstractions**.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1746225922395.png)

If `map (f >> g)` is guaranteed to be the same as `map f >> map g`, it means we can reason about composing functions either *before* lifting them into the container world or *after*, and the result will be the same. This allows us to refactor code, optimize pipelines, and build complex transformations with confidence, knowing that the behavior remains consistent across these different levels of abstraction. Without this guarantee, the connection between the simple functions (`f`, `g`) and their containerized counterparts (`map f`, `map g`) becomes less predictable, making the abstractions less robust. We want our lifted functions to respect the fundamental algebraic structure of the functions they originate from.
