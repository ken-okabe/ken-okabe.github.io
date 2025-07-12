---
title: 'Chapter 1: map — The Static Dependency Graph'
description: >-
  The most fundamental and frequently used transformation in Timeline is .map().
  It transforms the value of one Timeline into another according to a specific
  rule (a function), generating a new Timeline.
---
The most fundamental and frequently used transformation in `Timeline` is `.map()`. It transforms the value of one `Timeline` into another according to a specific rule (a function), generating a new `Timeline`.

Its essence is to **define an immutable, "static" relationship between two `Timeline`s**.

## **API Definition**

-   **F#**: `map: ('a -> 'b) -> Timeline<'a> -> Timeline<'b>`
    
-   **TypeScript**: `.map<B>(f: (value: A) => B): Timeline<B>`

`map` takes a pure function `f` as an argument, which accepts a value of type `A` and returns a value of type `B`.

TypeScript

```ts
const numbers = Timeline(5);

// Pass a function: (x: number) => string
const labels = numbers.map(x => `Score: ${x}`);

console.log(labels.at(Now)); // "Score: 5"

// When the source is updated, labels is automatically updated as well
numbers.define(Now, 100);
console.log(labels.at(Now)); // "Score: 100"
```

## **Dependency Graph**

When you call `map`, a **Dependency** is registered internally between the two `Timeline`s. The entire network of these relationships is called the **Dependency Graph**.

The dependency created by `map` is **Static**. Once you define the relationship `labels = numbers.map(...)`, the rule itself—the transformation of the value—does not change later.

```txt
        +-----------------+      .map(x => `Score: ${x}`)     +-----------------+
        | numbers         | --------------------------------> | labels          |
        | (Timeline<number>) |                                  | (Timeline<string>) |
        +-----------------+                                 +-----------------+
              ^                                                     |
              | .define(Now, 100)                                   V
              +-------------                                 Value propagates to "Score: 100"
```

This simple concept of a "static dependency" is the foundation for understanding the "dynamic" dependencies constructed by `bind` and `using`, which will be introduced later.

## **Canvas Demo (Placeholder)**

_(An interactive demo visually demonstrating the behavior of `.map()` will be placed here.)_
