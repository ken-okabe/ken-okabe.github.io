---
title: "\U0001F50D Overview - Unit 7"
description: >-
  The theme of this unit is "Composition." We will explain a hierarchical and
  mathematically beautiful set of APIs for combining multiple Timelines to
  create a single new Timeline.
---
The theme of this unit is **"Composition."** We will explain a hierarchical and mathematically beautiful set of APIs for combining multiple `Timeline`s to create a single new `Timeline`.

This Unit begins with `combineLatestWith`, the foundation of all composition. This is nothing other than a concrete implementation of the Applicative Functor we learned about in Unit 4.

Next, we will show how to scale this simple binary operation. The key to this is the algebraic structure known as a **Monoid**. You will witness how intuitive high-level APIs like `andOf`, `orOf`, and `listOf` are naturally derived from a single folding function, `foldTimelines`, and their respective Monoids.

Through this unit, you will move from the art of manipulating a single `Timeline` to acquiring the design philosophy of declaratively composing **collections** of `Timeline`s to elegantly construct complex states.
