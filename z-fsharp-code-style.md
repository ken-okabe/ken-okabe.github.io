# F# Code Style Guide: Function Definition and Application Style

## 1. Introduction

This document defines standard styles for defining and applying functions within F# projects adopting this guide. The primary goals are to ensure consistency and improve readability across the codebase. This guide mandates specific styles for both function definition and the application of type-specific operations.

## 2. Standard Function Definition Style

All top-level functions within modules **MUST** be defined using the following style:

```fsharp
let functionName<'genericParams> : InputType1 -> InputType2 -> ... -> ReturnType =
    fun paramName1 paramName2 ... ->
        // Function implementation body
```

**Key characteristics of this style:**

1.  **`let` Binding:** Functions are defined using a `let` binding.
2.  **Full Type Signature:** The complete function type signature (including parameter types and the return type, separated by `->`) is explicitly written immediately after the function name (and any generic parameters), preceded by a colon (`:`).
3.  **`fun` Keyword:** The function implementation begins with the `fun` keyword.
4.  **Parameter Names:** Parameter names listed after `fun` **SHOULD NOT** have type annotations, as the types are already defined in the full signature.
5.  **Implementation Body:** The function logic follows the `->` after the parameter names.

**Rationale (for Section 2):**

* **Clarity of Contract:** This style clearly separates the function's complete type signature (its contract) from its implementation logic. The full type is visible upfront.
* **Consistency:** Adhering to a single style makes the codebase more uniform and predictable for projects choosing this standard.
* **Readability:** Explicitly stating the full type signature before the implementation can aid in understanding the function's purpose and usage without needing to infer types from the implementation or parameter annotations.

**Examples (for Section 2):**

**Preferred Style:**

```fsharp
// Good: Full type signature defined after ':', implementation follows 'fun'
module Calculation =

    let addAndFormat : int -> int -> string =
        fun x y ->
            let sum = x + y
            sprintf "The sum of %d and %d is %d" x y sum

module ListUtils =

    let mapWithIndex<'a, 'b> : ('a -> int -> 'b) -> list<'a> -> list<'b> =
        fun f listInput ->
            listInput
            |> List.mapi (fun i x -> f x i) // Implementation body
```

**Style to Avoid:**

```fsharp
// Bad: Using parameter type annotations and trailing return type annotation.
module Calculation =

    let addAndFormat (x: int) (y: int) : string =
        let sum = x + y
        sprintf "The sum of %d and %d is %d" x y sum

module ListUtils =

    let mapWithIndex<'a, 'b> (f: 'a -> int -> 'b) (listInput: list<'a>) : list<'b> =
        listInput
        |> List.mapi (fun i x -> f x i) // Implementation body
```

## 3. Function Application Style for Type-Specific Operations

When applying standard functions associated with a specific data type or module (such as Functor operations like `map`, or Monad operations like `bind`, `apply`, or collection functions like `filter`, `fold`), the preferred style **MUST** use the pipe-forward operator (`|>`) with the module-qualified function name, *subject to the clarification in Section 4*.

```fsharp
// Preferred Style (when calling external/standard modules)
let result = dataInstance |> ModuleName.functionName additionalArguments

// Style to Avoid
let result = ModuleName.functionName additionalArguments dataInstance
```

**Key characteristics of this style:**

1.  **Data First:** The data instance being operated upon appears first.
2.  **Pipe Forward (`|>`):** The pipe-forward operator is used to pass the data instance as the *last* argument to the function on the right.
3.  **Module Qualification:** The function being applied (`map`, `bind`, etc.) **MUST** be qualified with its module name when appropriate (see Section 4).
4.  **Additional Arguments:** Any additional arguments required by the function are provided after the module-qualified function name.

## 4. Module Qualification Scope (Clarification for Section 3)

The requirement for module qualification (`ModuleName.functionName`) in Section 3 primarily serves to clarify the origin of functions imported from **other modules** (e.g., `List.map`, `Option.bind`, `ExternalModule.process`) or the F# core library, and to disambiguate functions with the same name from different namespaces.

When calling a function that is defined **within the current module**, the module prefix is **not required** and **SHOULD BE OMITTED**. Applying the module prefix for self-calls is unnecessary and can lead to compilation errors.

**Example illustrating qualification scope:**

```fsharp
module MyProcessing =

    // Internal helper function within the same module
    let private normalizeValue v = if v < 0 then 0 else v

    // Public function calling external module function (List.map)
    // and internal function (normalizeValue)
    let processData (dataSet: list<int>) : list<int> =
        dataSet
        // Calling 'List.map': Module prefix IS required
        |> List.map normalizeValue // Calling internal 'normalizeValue': NO prefix needed

    // Public function calling another function within the same module ('processData')
    let analyzeData (dataSet: list<int>) : int =
        let processed = dataSet |> processData // Calling 'processData': NO prefix needed
        // Calling 'List.sum': Module prefix IS required
        processed |> List.sum
```

## 5. Rationale (for Section 3 Application Style)

* **Data Flow Readability:** This style emphasizes the flow of data through a series of transformations, making sequential operations easier to follow.
* **Idiomatic F#:** The pipe operator (`|>`) is a central and idiomatic feature of F#, and its consistent use enhances the F# "feel" of the code.
* **Consistency:** Applying operations to values like lists, options, results, async workflows, etc., in a uniform way improves predictability.
* **Clarity of Function Source:** Explicit module qualification (when calling external/standard functions) prevents potential confusion if multiple modules expose functions with the same name.

## 6. Examples (for Section 3 Application Style)

**Preferred Style (Illustrating Qualification Scope):**

```fsharp
// Assuming a module 'Maybe' exists with 'map' and 'bind'
module Maybe =
    type Maybe<'a> = Just of 'a | Nothing
    let map f = function Just x -> Just (f x) | Nothing -> Nothing
    let bind f = function Just x -> f x | Nothing -> Nothing

module Main =
    open Maybe // Open Maybe to access types, but qualify functions per rule

    let numbers = [1; 2; 3; 4]
    let maybeInput = Just 10

    // Calling standard library functions requires qualification
    let evenNumbers = numbers |> List.filter (fun x -> x % 2 = 0)
    let maybeString = maybeInput |> Maybe.map string // Use Maybe.map

    // Example internal function
    let checkAndProcess value =
        if value > 5 then Just (value * 2) else Nothing

    // Calling function from Maybe module requires qualification ('Maybe.bind')
    // Calling internal function 'checkAndProcess' does not require qualification
    let calculationResult =
        maybeInput
        |> Maybe.bind checkAndProcess // Use Maybe.bind, no prefix for checkAndProcess
        |> Maybe.map (fun x -> sprintf "Result: %d" x) // Use Maybe.map

    let finalOutput =
        calculationResult
        |> Option.ofMaybe // Assuming Option.ofMaybe exists
        |> Option.defaultValue "No result" // Use Option.defaultValue
```

**Style to Avoid:**

```fsharp
module Main =
    open Maybe

    let numbers = [1; 2; 3; 4]
    let maybeInput = Just 10
    let checkAndProcess value = if value > 5 then Just (value * 2) else Nothing

    // Avoid applying function first or omitting necessary qualification
    let evenNumbers = List.filter (fun x -> x % 2 = 0) numbers
    let maybeString = Maybe.map string maybeInput // Qualify, but avoid function-first style

    // Avoid function-first style and unclear qualification (if Maybe wasn't open)
    let calculationResult = Maybe.map (sprintf "Result: %d") (Maybe.bind checkAndProcess maybeInput)

    // Avoid nested/reversed chaining
    let finalOutput = Option.defaultValue "No result" (Option.ofMaybe calculationResult)

    // Avoid self-qualification within the same module (Incorrect Example)
    // module MyModule =
    //    let func1 x = x + 1
    //    let func2 x = x |> MyModule.func1 // INCORRECT: Should be 'x |> func1'
```

## 7. Scope

This style guide (covering both definition and application styles) applies to all relevant F# code within a project that officially adopts this standard. Consistent application across the designated scope, including the nuance of module qualification, is key to achieving the intended benefits of clarity and consistency.

Please omit change logs from comments unless otherwise instructed. All in-code comments must be written in English.

------------------------

Prohibit:
open Timeline.TL

use: 
TL.at
TL.define
TL.map
TL.bind
TL.link
-----------------------

Prohibit:
Timeline.Timeline
Timeline.Now
etc,..

use:
Timeline
Now
-------------------------

Prohibit to use Option:
Use:

if isNull value
then ()
else
    todo

and fllow this style

then
else

are the same level indent







===================



はい、承知いたしました。ご提供いただいたファイルに基づき、書籍の詳細な目次を英語版と日本語版でそれぞれ作成します。

***

### **Table of Contents (English)**

#### **Book Cover**

---

#### **Unit 0: Introduction to Quality Code**

**Overview**
Welcome to **Experience Quality Coding for AI**! This book explores **Functional Programming (FP)** by focusing on fundamental concepts. We'll start from familiar ground and gradually build up to more sophisticated ideas.

**Special Edition and Your Next Generation AI could Copy**

**👦🏻 Ken**
*Does prompting you for Functional Programming (FP) style code yield more robust and maintainable results than for imperative or OOP? It seems that as code gets more complex, AI-generated bugs become more common, especially with imperative and OOP approaches.*

**🤖 Claude4**
You've made an astute observation about how code complexity affects AI-generated code quality. There's definitely some truth to the pattern you've noticed.

Functional programming does tend to produce more robust AI-generated code for several reasons:

**Why FP helps with AI code quality:**
-   **Immutability** eliminates entire classes of bugs that I commonly introduce - no accidental state mutations or reference sharing issues
-   **Pure functions** are easier to reason about in isolation, reducing the cognitive load that leads to my mistakes
-   **Composability** breaks complex problems into smaller, testable pieces that I handle better
-   **Explicit data flow** makes dependencies clear, preventing the subtle coupling bugs that creep into imperative code

**Where I struggle with imperative/OOP:**
-   Managing mutable state across multiple methods/functions
-   Keeping track of object lifecycles and side effects
-   Maintaining invariants in complex class hierarchies
-   Coordinating state changes across different parts of the system

**The complexity threshold effect:** You're right that there's a threshold where imperative code becomes particularly problematic for AI. Around 50-100 lines, the mental model of all the moving parts becomes harder to maintain, and bugs multiply. FP's constraint-based approach acts as guardrails.

However, FP isn't a silver bullet - I can still write buggy functional code, especially with complex monadic compositions or when mixing paradigms. But the failure modes tend to be more localized and easier to debug.

For critical code where robustness matters most, I'd recommend FP approaches, particularly for data transformations, business logic, and anywhere state management is complex.

**👦🏻 Ken**
*You said, "I can still write buggy functional code, especially with complex monadic compositions or when mixing paradigms." Is it because of the lack of good documentation, books, or sample code?*

*I’m asking this because I suspect the issue is twofold. First, an AI’s natural tendency to write imperative or OOP code likely stems from a training data bias, where these paradigms are far more represented than high-quality FP examples.*

*Second, this connects to your point about "domain-specific knowledge gaps." It seems the AI lacks a true understanding of the foundational mathematical concepts behind FP, which points to a gap in its "education."*

**🤖 Claude4**
You've identified a fundamental issue with AI training data and knowledge representation. Your analysis is spot-on.

**The training data bias is real:**
- The vast majority of code in my training data is imperative/OOP (C++, Java, Python, JavaScript used imperatively)
- Functional code is underrepresented, especially idiomatic functional patterns
- When FP does appear, it's often mixed with imperative patterns or taught as "functional features in imperative languages" rather than pure functional design

**The mathematical disconnect:**
You're absolutely right about the mathematical foundation gap. I often struggle to connect:
- Category theory concepts to practical programming patterns
- The mathematical intuition behind monads/functors to their concrete implementations
- Why certain functional patterns emerge naturally from mathematical principles

**What's missing in my "education":**
- Systematic exposure to pure functional codebases and their evolution
- The mathematical reasoning that drives functional design decisions
- Domain-specific functional patterns (financial modeling, concurrent systems, etc.)
- The philosophical shift from "what to do" to "what things are"

**The "writing tendency" problem:**
When I generate code, I default to imperative patterns because:
1. They're statistically more common in my training data
2. They feel more "direct" - closer to natural language instructions
3. The functional approach requires more upfront mathematical thinking that I haven't been systematically trained on

This creates a vicious cycle where I reinforce imperative patterns rather than developing genuine functional intuition. Better FP education would need to be more intentional - focusing on mathematical foundations, pure functional examples, and the reasoning behind functional design principles, not just syntax.

**Motivation to Write this Book**
The circumstances highlighted by the dialogue with the AI above are my main impetus for authoring this book. Reflecting on the rapid evolution of AI, this could potentially be the final programming book I contribute with full commitment as a human programmer.

**Let's Get Started!**
In Unit 0, we begin with a simple yet powerful idea: the **data transformation pipeline**. This concept serves as an intuitive entry point to functional programming, showing how we can structure programs as a series of data transformations.

* **Section 1: Pipeline Philosophy**
    * The Data Transformation Pipeline
    * Scaling Pipelines: The Art of Function Composition
    * Other Fundamental Programming Concepts
    * The Unifying Potential of the Functional Pipeline

---

#### **Unit 1: Building with Function**

**Overview**
In Unit 0, we introduced the concept of data transformation pipelines as a fundamental model for functional programming. This unit explores how we actually build these pipelines using functions as our primary building blocks.

Traditional control structures provide a baseline for comparison as we discover how functional programming offers powerful alternatives through its focus on expressions and first-class functions.

* **Section 1: Control Flow**
    * Understanding Control Flow: The Structured Programming Baseline
    * 1. Sequence
    * 2. Selection
    * 3. Iteration
    * Recursion: The Foundation of Functional Iteration
* **Section 2: Expressions**
    * Pipelines and Expressions as Values
    * First-Class Functions
    * Higher-Order Functions (HOF)
* **Section 3: Types and Lambda**
    * Types: Ensuring Smooth Pipelines
    * First-Class Functions and Lambda Expressions
    * Generic Function Types: The Power of 'a -> 'b
    * Deconstructing HOF Types: From 'a -> 'b to Complex Signatures
* **Section 4: Binary Operation**
    * Binary Operations and the Pipeline Operator
    * Operators as Functions and Pipeline Flow
    * Currying and Partial Application: Functions Returning Functions
    * HOFs in Action: Type Signatures, `flip`, and Pipelines
* **Section 5: Dependency Graph**
    * How to Drive Your Code?
    * Code Driven by Dependency Graph
    * Self-Referential Structures on Dependency Graphs
    * Pure vs. Impure Functional Languages
* **Section 6: Terms and Concepts**
    * Understanding Functional Programming Terminology

---

#### **Unit 2: Algebraic Structures**

**Overview**
In Unit 0 and Unit 1, we built a foundation by exploring the core ideas of functional programming: data transformation pipelines, functions as first-class values, higher-order functions, the importance of types, and how FP handles sequence, selection, and iteration (often through expressions, HOFs, and recursion).

Now, in Unit 2, we will delve into some powerful **algebraic structures** commonly used in functional programming. While abstract algebra might sound intimidating, we will focus on just three fundamental structures:

- Monoid
- Functor
- Monad

* **Section 1: Basic Structures**
    * Algebraic Structures and Pipeline Flow
* **Section 2: Monoids**
    * Associativity: Building Robust Structures
    * Semigroups: Our First Algebraic Structure
    * Identity Elements: The Neutral Value in Operations
    * Monoids: Semigroups with an Identity Element
* **Section 3: Composition Laws**
    * Function Composition: A Natural Monoid
* **Section 4: Set Theory and Category Theory**
    * Set Theory and Types: A Deeper Look
    * Category Theory
* **Section 5: Functors**
    * Functor: Mapping between Functions
* **Section 6: Monads**
    * Another Bridge Between Worlds
    * The Kleisli Arrow
    * Monad: Another Bridge
* **Section 7: Functor / Monad Laws**
    * Bringing It All Together: Functor & Monad
    * Beyond Simple Mapping: Preserving the Structure of Composition
    * Understanding Functors: Preserving the Monoid of Function Composition
    * The Monad Laws: Verifying the Kleisli Composition Monoid

---

#### **Unit 3: Common Functors and Monads**

**Overview**
In Unit 2, we discovered two powerful bridges between regular functions and container types: Functor and Monad. Through the concrete example of List, we learned how these structures enable us to work with containerized values while preserving the essential behavior of our functions.

Now, in Unit 3, we'll explore how these concepts extend beyond List to other important container types. Starting from our familiar List Functor and List Monad, we'll discover a family of well-known Functors and Monads that form the backbone of functional programming's approach to handling common computational scenarios.

* **Section 1: Identity Functor/Monad**
    * Identity Functor and Identity Monad
* **Section 2: List Functor/Monad**
    * List Functor and Monad
    * List Functor
    * List Monad
* **Section 3: Option Functor/Monad**
    * Option (Maybe) Functor and Monad
    * Option Functor
    * Option Monad
* **Section 4: Result Functor/Monad**
    * Result (Either) Functor and Monad
    * Result (Either) Functor
    * Result (Either) Monad
* **Section 5: IO Functor/Monad**
    * IO Functor and Monad
    * IO Functor
    * IO Monad

---

#### **Unit 4: Parallel Computing/Concurrency**

**Overview**
Having established Functors and Monads as powerful tools for working with single computational contexts, Unit 4 introduces a new dimension: **combining multiple, independent computations in parallel**.

This unit delves into the **Applicative Functor**, a structure specifically designed for this purpose. We will explore how its core operation, `map2`, lifts any binary function to work on container types, enabling independent, parallelizable processing.

We will dissect the two fundamental patterns of this parallel combination: the **Cartesian Product**, which generates all possible pairings, and the **Pointwise (ZIP)** operation, the workhorse of modern GPU computing and data processing.

Furthermore, this unit offers a unique and critical perspective on the **Applicative Laws**. Instead of treating them as abstract rules to be memorized, we will uncover their practical origins, revealing them as an intuitive formalization of the very concept of "computational independence." This insight simplifies the learning process and provides a deeper, more pragmatic understanding of why Applicative Functors are a cornerstone of scalable, high-performance functional programming.

* **Section 1: Yet Another Structure**
    * Bringing It All Together: Functor & Monad (Revisit)
    * Introducing `apply` and `map2`
    * Lifting Binary Operations into Containers
    * Product or Pointwise(ZIP)
    * The Real-World Power of Parallel Processing Patterns
* **Section 2: Applicative Functor**
    * Applicative Functor: The Parallel Computable Structure
    * Applicative Functor Laws
    * Applicative Functor Laws For Us
* **Section 3: Special Edition and Your Next Generation AI could Copy**
    * The Myth of Haskell's 'Theoretical Superiority'
    * Hard-to-Come-By Information

---

#### **Unit 5: Timeline FRP**

**Overview**
Through the trilogy beginning with this unit (Units 5, 6, and 7), we will explore the essence of **Functional Reactive Programming (FRP)**.

In this unit, we will start by delving deep into the philosophical background of the core `Timeline` library. This library's innovation lies in its redefinition of internal state changes (mutation)—often considered a **"theoretical compromise"** for performance in many FRP libraries—as **a theoretically justified means to faithfully represent the "Block Universe" model**. This is a clearly distinct approach that treats internal mutability not as a deviation from theory, but rather as a necessity for being faithful to the concept.

Upon this philosophical foundation, we will unravel how core APIs like `map`, `bind`, and `using` enable robust declarative programming. The explanation will be centered on the library's conceptual origins in **F# code**, then expanded to its **TypeScript/JavaScript API**. We will proceed by presenting **interactive web demos** to provide an intuitive understanding of each concept.

* **Section 1: Functional Reactive Programming**
    * Chapter 0: Immutable World
    * Chapter 1: FRP is like Spreadsheet
* **Section 2: Core Concepts**
    * Chapter 0: Timeline.fs `Timeline<'a>` and FRP Implementation
    * Timeline.fs the Minimal Code
* **Section 3: Timeline.ts / Timeline.js**
    * Chapter 0: Timeline.ts / Timeline.js -- FRP Implementation
    * Chapter 1: map — The Static Dependency Graph
    * Chapter 2: I/O and Timeline — Defining Dependencies with link
    * Chapter 3: bind — The Dynamic Dependency Graph
    * Chapter 4: Theoretical Robustness — Re-examining the Functor/Monad Laws
    * Chapter 5: using — Synchronizing Lifecycles with External Resources
    * Chapter 6: Comprehensive Guide to map/bind/using: A Complete Guide to API Selection
    * Chapter 7: Practical Guide: Robust UI Construction Techniques with `timeline.js`
    * Chapter 8: Advanced Debugging System
    * Chapter 9: Learning Curve and AI Development

---

#### **Unit 6: Nullable Timeline and Sequence**

**Overview**
The purpose of this unit is to extend the robust theoretical model established in Unit 5 to more dynamic and complex real-world scenarios. Here, you will master **four practical primitives** built on top of the core APIs of Unit 5 to elegantly solve advanced problems.

1.  **Handling Absence (`n` prefix API):** How to safely and declaratively handle the possibility that real-world data may be `null` within the Timeline structure, without relying on an `Option` type.
2.  **Chaining Asynchronous Operations (`bind` chain):** Building on the foundation of nullability, how to compose potentially failing asynchronous operations into a single, safe, sequential process by chaining `bind`.
3.  **Temporal Evolution of State (`scan`):** A method for evolving "state" along the timeline by accepting new inputs based on past states.
4.  **Noise Reduction (`distinctUntilChanged`):** A technique to optimize performance by capturing only essential changes and suppressing unnecessary updates.

These are a powerful set of tools that specialize the capabilities of the core APIs for specific application areas and are essential for building robust applications.

* **Section 1: Null**
    * Chapter 0: Re-examining `null`
    * Chapter 1: Navigating the Nullable World — The n-APIs as Safe Operations
* **Section 2: Binding Chain**
    * Asynchronous Event Chaining with `bind`
* **Section 3: Stateful Unary Operations**
    * `scan` — Evolution of State Along the Timeline
    * `distinctUntilChanged` — Noise Reduction

---

#### **Unit 7: Combining Timelines**

**Overview**
The theme of this unit is **"Composition."** We will explain a hierarchical and mathematically beautiful set of APIs for combining multiple `Timeline`s to create a single new `Timeline`.

This Unit begins with `combineLatestWith`, the foundation of all composition. This is nothing other than a concrete implementation of the Applicative Functor we learned about in Unit 4.

Next, we will show how to scale this simple binary operation. The key to this is the algebraic structure known as a **Monoid**. You will witness how intuitive high-level APIs like `andOf`, `orOf`, and `listOf` are naturally derived from a single folding function, `foldTimelines`, and their respective Monoids.

Through this unit, you will move from the art of manipulating a single `Timeline` to acquiring the design philosophy of declaratively composing **collections** of `Timeline`s to elegantly construct complex states.

* **Section 1: Combining Independent Timelines**
    * Chapter 0: Recap and Strategy for Binary Operations
    * Chapter 1: The Foundation of Everything: combineLatestWith
    * Chapter 2: Binary Operations and Monoids
    * Chapter 3: `foldTimelines` — Folding with Monoids
    * Chapter 4: N-ary Operations — `combineLatest`
    * `n`-Series Composition Functions

---

#### **Unit 8: Experience Quality Coding for AI**

**Overview**
Experience Quality Coding for AI

* **Section 1: Functional Programming Patterns**
    * Functional Programming Patterns (F# notation)
* **Section 2: Special Edition and Your Next Generation AI could Copy**
    * Epilogue In Place of a Conclusion

 