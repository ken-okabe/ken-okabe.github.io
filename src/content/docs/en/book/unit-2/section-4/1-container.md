---
title: 'Container Types: Packaging Values with Context'
description: >-
  In the previous chapter, we explored types from a set-theoretic perspective.
  Now, we'll focus on a specific kind of type structure crucial for
  understanding Functors: container types. These types do more than just group
  values; they often "wrap" values, providing a certain context or structure
  around them.
---
In the previous chapter, we explored types from a set-theoretic perspective. Now, we'll focus on a specific kind of type structure crucial for understanding Functors: **container types**. These types do more than just group values; they often "wrap" values, providing a certain context or structure around them.

## From Sets to Structured Containers

While all types can be seen as sets of values, in functional programming, the term "container type" (or "contextual type") often refers to generic types that hold or encapsulate values of another type, providing a specific structure or context. `List<'T>` is a prime example, but others like `Option<'T>` (which we will see later) also fit this description.

The diagram `img_1745562787732.png` (Set X -> Set Y) illustrates a general mapping between sets (types). Container types often represent these "sets" in a structured way within our programs.

For instance, a `List<'T>` is a container that can hold zero or more values of type `'T'`:
<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">
```fsharp
// List of numbers (a container of int)
[1; 2; 3; 4; 5]

// List of strings (a container of string)
["apple"; "banana"; "cherry"]

// List of lists (a container holding other containers)
[[1; 2]; [3; 4]; [5; 6]]
```
The `List<'T>` type itself is a **type constructor** (as discussed in `0-set-theory.md`). It takes a type `'T` and produces a new type: "list of `'T`". The images `img_1745567340502.png` and `img_1745570291446.png` visually represent this generic nature of `List<'T>` as a container for some type `'T`.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

***The diagrams `img_1745567340502.png` and `img_1745570291446.png` are conceptual illustrations of how `List<'T>` acts as a generic container.***

While basic types like `int` or `string` are indeed sets of values (as illustrated again by `img_1745564518303.png` and the F# type aliases `Numbers = int`, etc.), when we speak of "container types" in the context of concepts like Functors, we usually mean these structured, often generic, types that *wrap* other values.

The key idea is that a container type like `List<'T>` isn't just a "set of something"; it's a structure that gives context (e.g., "an ordered sequence of elements," "a value that might be missing"). `List` is an intuitive starting point because it clearly "contains" multiple items.

This notion of a type providing a "wrapper" or "context" around other values is fundamental for understanding Functors, which allow us to apply functions to the wrapped values without disturbing the surrounding structure.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">
