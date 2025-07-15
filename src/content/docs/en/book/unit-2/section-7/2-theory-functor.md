---
title: 'Understanding Functors: Preserving the Monoid of Function Composition'
description: >-
  In the previous section, we established that the concept of "structure
  preservation" is central to understanding robust abstractions in functional
  programming. We saw how Category Theory itself is founded on Monoid-like
  principles of composition and identity. This chapter delves into Functors,
  illustrating how the Functor Laws are precisely the requirements ensuring that
  the map operation preserves the natural Monoid structure of function
  composition.
---
In the previous section, we established that the concept of "structure preservation" is central to understanding robust abstractions in functional programming. We saw how Category Theory itself is founded on Monoid-like principles of composition and identity. This chapter delves into **Functors**, illustrating how the Functor Laws are precisely the requirements ensuring that the `map` operation preserves the natural **Monoid structure of function composition**.

Our core theme here is that a Functor's `map` operation isn't just any higher-order function that iterates over a container; it's a special kind of transformation that must respect the algebraic properties (associativity of composition and the role of identity) inherent in the functions it lifts.

We will explore why such preservation is crucial, how it's formally defined by the Functor Laws, the practical challenges of verification, and the theoretical guarantees (like Parametricity) that often allow us to trust common `map` implementations.

Our journey will confirm that a Functor's `map` is fundamentally about maintaining the integrity of the function composition Monoid as we move between the world of regular functions and the world of functions operating on containers.

## Re-contextualized for Monoid Preservation

Our goal is to understand what makes a `map` higher-order function behave as a Functor, which fundamentally means it must **preserve the Monoid structure inherent in function composition** (`>>` as the operation, `id` as the identity element).

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747205891858.png)

**Step 1: Two Independent Computational Processes - Starting from Definitions**

First, let's examine the main processes shown in Figure, using a generic `map` for a container `M`.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747207345043.png)

**Key Point: Independence and Definition**
Crucially, `map (f >> g)` and `(map f) >> (map g)` are **two independent operations with distinct computational processes**.

**Step 2: The Visual Suggestion vs. Logical Gap - A Premature Conclusion?**

Concluding these are identical operations just from diagrams or type signatures is a logical leap. The core question is whether they are *extensionally equivalent*.

**Step 3: Functor `map` and the Functor Laws - Guaranteeing Monoid Preservation**

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747206877586.png)

A `map` operation is a **Functor `map`** if it ensures these two distinct processes *always* yield the same result. This is precisely the requirement for `map` to **preserve the structure of the function composition Monoid**. The Functor Laws formalize this:

### The Functor Laws (Required for `map` to preserve the Function Composition Monoid):

1.  **Identity Law:** `map id = id_M` (where `id_M` is the identity transformation for container `M`; for example, if `map` is `List.map`, then `List.map id` should behave like `fun list -> list`).

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747203975841.png)

- *Monoid Interpretation:* The `map` must map the **identity element (`id`)** of the function composition Monoid to the **identity operation** in the world of container transformations. It preserves the identity.

- *Conceptual Verification with Code (using `map_List`):*

```fsharp
let lhs_identity_list = initialList |> map_List id
let rhs_identity_list = initialList // Applying id_M to initialList is initialList itself
printfn "Identity Law (List): LHS=%A, RHS=%A, Satisfied=%b" lhs_identity_list rhs_identity_list (lhs_identity_list = rhs_identity_list)
// For Option:
let lhs_identity_option_some = initialOptionSome |> map_Option id
let rhs_identity_option_some = initialOptionSome
printfn "Identity Law (Option Some): LHS=%A, RHS=%A, Satisfied=%b" lhs_identity_option_some rhs_identity_option_some (lhs_identity_option_some = rhs_identity_option_some)
let lhs_identity_option_none = initialOptionNone |> map_Option id
let rhs_identity_option_none = initialOptionNone
printfn "Identity Law (Option None): LHS=%A, RHS=%A, Satisfied=%b" lhs_identity_option_none rhs_identity_option_none (lhs_identity_option_none = rhs_identity_option_none)
```

2.  **Composition Law:** `map (f >> g) = (map f) >> (map g)`.

(Note: `(map f) >> (map g)` means

`fun container -> container |> map f |> map g`)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747206525700.png)

- *Monoid Interpretation:* The `map` must respect the **composition operation (`>>`)** of the function composition Monoid. Mapping a pre-composed function must yield the same as mapping individually then composing the results.
- *Conceptual Verification with Code (using `map_List`):*

```fsharp
let composed_fg_revised = f_intToString >> g_stringToBool_revised

// LHS for List
let lhs_composition_list = initialList |> map_List composed_fg_revised

// RHS for List
let rhs_composition_list = initialList |> map_List f_intToString |> map_List g_stringToBool_revised
printfn "Composition Law (List): LHS=%A, RHS=%A, Satisfied=%b" lhs_composition_list rhs_composition_list (lhs_composition_list = rhs_composition_list)

// LHS for Option Some
let lhs_composition_option_some = initialOptionSome |> map_Option composed_fg_revised
// RHS for Option Some
let rhs_composition_option_some = initialOptionSome |> map_Option f_intToString |> map_Option g_stringToBool_revised
printfn "Composition Law (Option Some): LHS=%A, RHS=%A, Satisfied=%b" lhs_composition_option_some rhs_composition_option_some (lhs_composition_option_some = rhs_composition_option_some)
```

A `map` is a Functor if it satisfies these laws, thereby acting as a **homomorphism** preserving the function composition Monoid.

**Interpreting Figure 3 (Bottom/Integrated Diagram):** This diagram, showing a single path, is valid *only if* `map` is a Functor because then the two distinct computational paths are extensionally equivalent.

**Step 4: A Serious Practical Concern - The Burden of Verification?**

If we need to prove these laws for every `map` (e.g., `List.map`, `Option.map`), the utility of the Functor abstraction diminishes.

**Step 5: A Savior Appears - "Theorems for free\!" (Parametricity)**

Philip Wadler's "Theorems for free\!" principle, derived from **Parametricity**, suggests that for generic `map` (`('a -> 'b) -> M<'a> -> M<'b>`), if implemented without type-specific "cheating," is constrained by its type signature to preserve structure. This "structure preservation" is what the Functor Laws (our Monoid preservation laws) articulate. A parametric `map` *must* apply the function while keeping the container structure intact, which inherently forces it to respect composition and identity  thus preserving the Monoid.

**Step 6: The Practical Conclusion - Trusting Generic Implementations to Preserve Monoid Structure**

Standard library functions like `List.map` and `Option.map` are designed parametrically. Therefore, in practice, we can trust them to be Functors and correctly preserve the Monoid structure of function composition.

### Summary

The diagrams illustrate the core issue: `map (f >> g)` and `(map f) >> (map g)` are, by definition, distinct computational processes. A **Functor `map` operation** is specifically one where these two processes are *defined* to be extensionally equivalent.

This equivalence is mandated by the **Functor Laws** (Identity and Composition), which collectively ensure that `map` **preserves the Monoid structure of function composition** (`id` as identity, `>>` as composition). The integrated diagram (Figure 3) is valid only under this assumption of Monoid preservation.

The practical concern of verifying these laws is significantly alleviated by **Parametricity ("Theorems for free\!")**, which suggests that parametrically implemented generic `map` functions will naturally satisfy these laws. Thus, typical "non-hacky" generic `map` implementations can be reliably treated as structure-preserving Functors.

-----

## Evaluation of the Counter-example Code (`mapThenReverse`)

```fsharp
// Function that reverses the entire list AFTER applying the normal List.map
let mapThenReverse (f: 'a -> 'b) (list: 'a list) : 'b list =
    list
    |> List.map f
    |> List.rev

// --- Verification of Composition Law (using >>) ---
// This law ensures that 'map' preserves the Monoid's composition operation.
let f_example x = x + 1
let g_example x = x * 2

let initialList_example = [1; 2; 3]

let lhsResult_counter =
    initialList_example
    |> mapThenReverse (f_example >> g_example)
// Expected: initialList_example |> List.map (fun x -> (x+1)*2) |> List.rev = [4; 6; 8] |> List.rev = [8; 6; 4]

let rhsResult_counter =
    let map_f_then_map_g = fun l -> l |> mapThenReverse f_example |> mapThenReverse g_example
    initialList_example |> map_f_then_map_g
// Expected: initialList_example |> mapThenReverse f_example gives [4;3;2]
// Then: [4;3;2] |> mapThenReverse g_example gives ([4;3;2] |> List.map (fun x -> x*2) |> List.rev) = ([8;6;4] |> List.rev) = [4;6;8]

printfn "Counter Example - Composition Law Check (Map then Reverse, using >>):"
printfn "LHS: initialList |> mapThenReverse (f_example >> g_example) = %A" lhsResult_counter
printfn "RHS: Composing mapThenReverse f and mapThenReverse g: %A" rhsResult_counter
printfn "Satisfied? %b" (lhsResult_counter = rhsResult_counter) // False
```

This F\# code correctly demonstrates that `mapThenReverse` **does not satisfy the Functor composition law**.

**1. Code Verification and Validity of the Counter-example**
The calculations (as commented) show `lhsResult_counter` (`[8; 6; 4]`) differs from `rhsResult_counter` (`[4; 6; 8]`). Thus, `mapThenReverse` fails to preserve the composition structure of the function Monoid.

**2. Consistency with Previous Discussions (Focus on Monoid Preservation):**

This counter-example perfectly illustrates why the Functor laws (as requirements for Monoid preservation) are crucial:

* **Proof That Not All `map`-like Operations Preserve Monoid Structure:** `mapThenReverse` is a `map`-like operation that clearly *fails* to preserve the function composition Monoid.
  * **Relation to "Theorems for free\!" and Parametricity:** Standard `List.map` is parametric. `mapThenReverse` adds `List.rev`, an explicit structural modification not solely dictated by the types in a parametric way. This non-parametric structural alteration breaks the Monoid preservation property.
  * **Importance of Laws/Implementation for Monoid Preservation:** This example underscores that whether a `map` operation preserves the function composition Monoid depends entirely on its **implementation**.

**3. Evaluation Summary (Monoid Perspective)**

The `mapThenReverse` counter-example excellently demonstrates that a generic type signature doesn't guarantee Monoid preservation. Preservation (i.e., satisfying Functor laws) is an implementation property, and deviations from parametric behavior can break it. This reinforces that the Functor laws are non-trivial requirements for `map` to act as a well-behaved, structure-preserving transformation that respects the natural Monoid of function composition.
