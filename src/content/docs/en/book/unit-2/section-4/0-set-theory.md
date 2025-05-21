---
title: 'Set Theory and Types: A Deeper Look'
description: >-
  Building on our introduction to types and sets from Section 1, let's explore
  how  set theory  provides the foundation for understanding not just types, but
  also the algebraic structures we've been studying.
---
Building on our introduction to types and sets from Section 1, let's explore how  **set theory**  provides the foundation for understanding not just types, but also the algebraic structures we've been studying.

## Set Theory and Functions: The Origins

Set theory provides more than just a way to group elements - it gives us the concept of **mappings** between sets. In fact, functions in programming are direct implementations of set-theoretical mappings:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// A mapping from integers to booleans
let isPositive x = x > 0    // Maps ℤ → {true, false}

// A mapping from one set to another
let toString x = x.ToString() // Maps any type → string
```

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745577833678.png)
*(This diagram illustrates a function f mapping elements from Set X (Domain, corresponding to an input Type X) to Set Y (Codomain, corresponding to an output Type Y).)*

This connection between sets and functions is fundamental. The lambda calculus, the theoretical foundation of functional programming, was developed to formalize these mappings.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745553771606.png)
*(This image often depicts a function as a transformation or a "black box" that takes input from one set and produces output in another, consistent with the set-theoretic view of functions.)*

```fsharp
// Mathematical λx.x becomes:
let id = fun x -> x

// Mathematical λx.λy.x + y becomes:
let add = fun x -> fun y -> x + y
```

## Set Theory: Bottom-Up Understanding

Set theory builds our understanding from the ground up:

1.  **Elements**: The basic building blocks.
    ```fsharp
    let x = 42        // A number
    let s = "hello"   // A string
    let b = true      // A boolean
    ```
    *(These are individual members of their respective sets/types.)*

2.  **Sets (Types)**: Collections of elements.
    ```fsharp
    type Numbers = int        // The set of all integers
    type Strings = string    // The set of all possible strings
    type Booleans = bool     // The set {true, false}
    ```
    ![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745564518303.png)
    *(This diagram visually groups elements into their respective sets: int, string, bool.)*

3.  **Structured Types (e.g., Lists as Sets of Elements of a Given Type)**:
    Types can also define structures that group elements. For instance, `List<int>` is the type representing all possible lists of integers.
    ```fsharp
    let intList: List<int> = [1; 2; 3] // An element of the type List<int>
    ```
    The concept of "sets of sets" can be seen in how types like `List<List<int>>` (a list of integer lists) are formed.
    ![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745564670846.png)
    *(Visualizing a list as a container holding elements, e.g., `[1,2,3]`.)*
    ![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745564700292.png)
    *(Illustrating a list of lists, e.g., `[[1,2],[3]]`, where each inner list is an element of the outer list.)*

This approach mirrors how we naturally understand collections. Consider a library organization:
```fsharp
type Book = { title: string; isbn: string }
type Shelf = List<Book>           // A type whose values are lists of Books
type Section = List<Shelf>        // A type whose values are lists of Shelves
type Library = List<Section>      // A type whose values are lists of Sections
```
![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745541695708.png)
*(This illustrates a hierarchical structure: a library contains sections, sections contain shelves, and shelves contain books.)*

## The Relative Nature of Sets and Elements

A crucial insight from set theory is that the distinction between "elements" and "sets" is relative. In our library example:
1.  A `Book` is an element of type `Shelf`.
2.  A `Shelf` (which is a set/collection of `Book`s) is an element of type `Section`.
3.  A `Section` is an element of type `Library`.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">
This relativity is fundamental:
- Values are instances (elements) of their types (sets).
- Complex types (like `List<Book>`) define sets whose elements are themselves collections or structured data.
This mirrors how types work in programming.
<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Types of Types: A Natural Progression

This relative nature leads to a hierarchy of type constructions:

1.  **Simple Types (Basic Sets):**
    ```fsharp
    let n: int = 42      // int is a set of integers
    let b: bool = true   // bool is the set {true, false}
    ```
2.  **Constructed Types (e.g., Lists, Tuples):** These types are formed by applying type constructors to other types.
    ```fsharp
    let numbers: List<int> = [1; 2; 3]      // List<int> is a type: the set of all lists of integers.
    let pair: int * int = (1, 2)          // int * int is a type: the set of all pairs of integers.
    ```
3.  **Type Constructors (like Functions from Types to Types):**
    These are not types themselves, but "recipes" to create types.
    `List<'T>` is a type constructor: given a type `'T'`, it produces the type `List<'T>`.
    `Option<'T>` is another: given `'T'`, it produces `Option<'T>` (a type representing an optional value of `'T'`).

## Values as Singleton Sets: Blurring Lines
An interesting perspective is that individual values can be conceptually viewed as types that contain only one element (singleton sets).
```fsharp
// Conceptually:
// The value 1 can be seen as an instance of a type "TheNumberOne" which only contains 1.
let one = 1
// A discriminated union defines a type with a small, fixed set of possible constructors/values.
type DiceFace = One | Two | Three | Four | Five | Six // Defines the set {One, Two, ..., Six}
```
![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745564856679.png)
*(This diagram illustrates that a value (like 1) can be thought of as a set containing only itself, and a type (like DiceFace) is a set of specific, enumerated values.)*

This perspective suggests that the distinction between "a value" and "a type (as a set)" is not always absolute.

## The Limitations of Simple Type Systems
Current mainstream type systems, like F#'s, are powerful but have limitations in directly expressing sets defined by arbitrary properties of values:
```fsharp
// We cannot directly define these as distinct static types in F#
// without runtime checks or more advanced type system features:
// type PositiveInt     // The set of integers n where n > 0
// type ByteRange       // The set of integers n where 0 <= n <= 255
// type EvenNumber      // The set of integers n where n % 2 = 0
```
This is because such "subset types" or "refined types" often require types to depend on runtime values, blurring the compile-time/runtime distinction.

## Dependent Types: The Natural Evolution
Dependent types are a more advanced feature in some type systems (not standard F#) that allow types to be dependent on values.
```fsharp
// Hypothetical dependent type syntax (not valid F#)
// type PositiveInt = (n: int) where n > 0
// type ByteRange = (n: int) where 0 <= n && n <= 255
```
<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">
This evolution follows naturally from set theory:

1. Simple types (fixed sets like `int`).
2. Generic types / Type constructors (functions from sets to sets, like `List<T>`).
3. Dependent types (sets defined by predicates on values).

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Looking Forward: Impact on Programming
Our journey through set theory reveals that types and values are deeply intertwined. This understanding helps us:
- Appreciate why current type systems have certain expressive capabilities and limitations.
- See how algebraic structures arise naturally from these concepts.
- Understand the direction of programming language design towards more expressive type systems.

These concepts of types as sets, and especially **type constructors** that operate on these sets (like `List<'T>`), provide the essential groundwork for understanding **Functors**, which we will explore next. Functors, in essence, are type constructors equipped with a way to apply functions "inside" the structure they define, while preserving that structure.
