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