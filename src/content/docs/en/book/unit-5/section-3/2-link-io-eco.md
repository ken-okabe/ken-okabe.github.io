---
title: 'Chapter 2: I/O and Timeline — Defining Dependencies with link'
description: >-
  In Chapter 1, we saw how .map() defines a static dependency by deriving a
  Timeline. In this chapter, we explore a different approach to integrating
  interactions with the external world (I/O) into our system.
---
In Chapter 1, we saw how `.map()` defines a static dependency by **deriving** a `Timeline`. In this chapter, we explore a different approach to integrating interactions with the external world (I/O) into our system.

The key is to **connect two initially independent `Timeline`s using the `.link()` API to define a new dependency**.

## Modeling I/O

From the perspective of the block universe model, an I/O operation like `console.log("Hello")` is not an action that "changes" the world.

-   State of the universe at time coordinate `t1`: "Hello" is not displayed on the console.
    
-   State of the universe at time coordinate `t2`: "Hello" is displayed on the console.

`console.log` merely describes the relationship between these two different, yet both immutable, states of the universe at different time coordinates.

## Encapsulating I/O as a Responsibility

Based on this philosophy, instead of dealing with the imperative `console.log` directly, we define a declarative `Timeline` that encapsulates its "rule."

In the block universe, there is no imperative I/O. There is only the **declarative entity** we define, `logTimeline`.

TypeScript

```ts
// As a helper, define a function that logs a value of any type
const log = <A>(value: A): void => {
    // Following the library's philosophy, null is treated specially
    if (value !== null) {
        console.log(`[LOG]:`, value);
    }
};

// Define a declarative logTimeline whose sole responsibility is to "output values to the console"
const logTimeline = Timeline<any>(null);

// Define its behavior with .map()
logTimeline.map(log);
```

## `.link()` — Connecting Two `Timeline`s

`.link()` defines the simplest form of dependency: unilaterally synchronizing the value from a source to a target between **two already existing `Timeline`s**.

### API Definition

##### F#: `link: Timeline<'a> -> Timeline<'a> -> unit`

##### TS: `.link(targetTimeline: Timeline<A>): void`

### Practical Example: Defining a Dependency between `scoreTimeline` and `logTimeline`

Let's connect the `scoreTimeline` from our application to the `logTimeline` we just defined.

TypeScript

```ts
const scoreTimeline = Timeline(100);

// Define the dependency from scoreTimeline to logTimeline with .link()
scoreTimeline.link(logTimeline);
// > [LOG]: 100  (The initial value propagates the moment the dependency is defined, and a log is output)

// When the value of scoreTimeline is updated...
scoreTimeline.define(Now, 150);
// > [LOG]: 150  (...the update propagates to logTimeline according to the defined dependency, and a log is output again)
```

In this pattern, `scoreTimeline` focuses solely on managing its own value and is completely unaware of logging. `.link()` serves to define a dependency between these two declarative entities with separated responsibilities.

## The Static Dependency Graph (Revisited)

What's important here is that, just like `.map()` from Chapter 1, `.link()` also defines a **static dependency graph**.

-   `.map()`: Defined a static dependency by **deriving a new `Timeline` from a single source**.
    
-   `.link()`: Defined a static dependency by **connecting two existing `Timeline`s**.

Although their starting points differ, both play the same essential role in building a predictable and stable relationship within the system—one that, once defined, does not change.

## Canvas Demo (Placeholder)

_(An interactive demo visually demonstrating the behavior of `.link()` will be placed here.)_
