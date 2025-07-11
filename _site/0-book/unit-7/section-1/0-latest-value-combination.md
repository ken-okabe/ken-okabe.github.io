# Chaper 0: Recap and Strategy for Binary Operations

In the previous units and sections, we have built a powerful set of tools. We can transform single timelines with `map`, create sequential, dependent chains with `bind`, and manage stateful transformations over time with `scan`.

However, we now face an entirely new challenge: combining **multiple, independent timelines** that run in parallel. Consider tasks like "adding the latest values of two separate counters" or "checking if two different form inputs are both valid." These scenarios cannot be directly solved by our existing primitives alone.

What we need now is a general **binary operation** that takes two independent sources, `Timeline<'a>` and `Timeline<'b>`, and produces a new `Timeline<'c>`.

## Re-evaluating the Classifications from Unit 4

To solve this, let's revisit the classifications for  **Applicative Functors**  from Unit 4.

1.  **Cartesian:** In the context of `List`, this approach generated all possible combinations of elements. If applied to `Timeline`, this would mean combining every past event from `timelineA` with every past event from `timelineB`. This is computationally explosive and does not align with our goal of determining the *current* combined state. Therefore, **the Cartesian approach is unsuitable**.

2.  **Pointwise:** For `List`, this approach paired elements at the same index, like a `zip` operation. However, the concept of a synchronized "index" does not exist for `Timeline`. Timelines are **asynchronous**; an event on `timelineA` at time `t1` has no guarantee of a corresponding event on `timelineB` at the exact same time `t1`. A strict, `zip`-like combination based on synchronized "points" in time would be practically useless. Therefore, **the Pointwise classification, as defined for synchronous structures, is also unsuitable**.

## The Need for a New Concept: "Latest Value Combination"

Since the classifications from Unit 4 do not fit, we need a new concept tailored to the asynchronous nature of `Timeline`.

What we truly need is not to synchronize discrete *events* (points), but to combine continuously available *states*. This leads us to propose a new concept: **"Latest Value Combination."**

This idea is defined as follows:

> **The moment any source timeline is updated, its new value is combined with the most recently known value (the latest state) of the other source(s) to produce a new result.**

This powerful model fully embraces the asynchronous nature of the inputs while ensuring a consistent, combined state is always available. It is a pattern uniquely suited for reactive systems.