---
title: 'Chapter 5: using — Synchronizing Lifecycles with External Resources'
description: >-
  At the heart of the timeline framework lies the idea of declaratively handling
  time-varying values, based on the "block universe" model from physics.
  Naturally flowing from this concept is the realization of fully automatic
  resource management, allowing developers to focus on writing essential logic
  without ever worrying about the timing of resource creation or destruction.
---
At the heart of the `timeline` framework lies the idea of declaratively handling time-varying values, based on the "block universe" model from physics. Naturally flowing from this concept is the realization of **fully automatic resource management**, allowing developers to focus on writing essential logic without ever worrying about the timing of resource creation or destruction.

We have discovered a path to apply this ideal not only to reactive internal state but to the **lifecycle of any external resource**, such as GTK widgets in a Gnome Shell extension. The `.using()` API, which we will now discuss, is the **final, complete form** of this framework that fully embodies this ideal.

## The `.using()` API — Ultimate Resource Management

While `.bind()` manages the lifecycle of `Timeline` objects, `.using()` is the one and only correct approach to **perfectly synchronize the "lifespan of a resource" with the "illusion of a `Timeline`"**.

### API Definition

##### F#: `using: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b option>`

##### TS: `using<B>(resourceFactory: (value: A) => { resource: B; cleanup: () => void } | null): Timeline<B | null>`

### Behavior and Guarantees

1.  When the value of `sourceTimeline` changes, `using` first **reliably executes the `cleanup` function associated with the resource generated in the previous illusion, via `disposeIllusion`.**
2.  Next, it calls the `resourceFactory` function with the new value.
3.  If `resourceFactory` returns a `{ resource, cleanup }` object:
      - `resource` becomes the new value of the output `Timeline`.
      - The `cleanup` function is registered with `DependencyCore` as an `onDispose` callback associated with the new illusion.
4.  If `resourceFactory` returns `null`, the output `Timeline` becomes `null`, and no cleanup process is registered.

<!-- end list -->

- **Guarantee**: This mechanism ensures that any resource ever created by `resourceFactory` is guaranteed to have its **corresponding `cleanup` function called** when its illusion ends (for any reason). This structurally prevents resource leaks.

## Extending the `Illusion` Concept — Level 3 Mutability

With the introduction of `.using()`, the concept of `Illusion` is extended one step further.

- **Level 1 (`map`)**: The **value** `_last` is mutable.
- **Level 2 (`bind`)**: The **internal structure** `innerTimeline` is mutable.
- **Level 3 (`using`)**: **External world entities** like the DOM or timers become mutable entities synchronized with the `Illusion`'s lifecycle.

## The Evolved Heart: `DependencyCore` and `onDispose`

`DependencyCore` is no longer just a management system for "reactive connections." It has evolved into a **general-purpose foundation that guarantees all kinds of cleanup processes associated with the lifecycle of a dependency**.

`.using()` registers the `cleanup` function returned by `resourceFactory` through this `onDispose` callback feature of `DependencyCore`. Then, when an `Illusion` is destroyed, `DependencyCore` **100% guarantees** the execution of this `onDispose` (i.e., `cleanup`), completely automating the cleanup of external resources.

## Conclusion: Unification of Paradigms

This `Timeline` is no longer just an FRP library. It is a new dimension of framework that has completely integrated the often-conflicting paradigms of declarative data flow and imperative resource management under the single, unified concept of **"lifecycle."

With a design that balances **debugging efficiency** with **production environment performance**, this framework consistently supports developers from the research and development phase to practical application. This is the realization of a truly complete software architecture that combines theoretical beauty with practical value.

## Canvas Demo

### https://g.co/gemini/share/1560a1f89a35

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752463208863.png)

---

### https://gemini.google.com/share/0cf840f99b3c

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752462161899.png)
