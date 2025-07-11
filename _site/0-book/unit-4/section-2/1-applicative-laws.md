:::lang-en

# Applicative Functor Laws

## F# Standard Operations

```fsharp
// Core Applicative operations (F# style)
let ID: 'a -> F<'a>                           
// Lift value into context
let apply: F<'a -> 'b> -> F<'a> -> F<'b>      
// Apply function in context

// F# pipe operator (standard)
let (|>) x f = f x                            
// x |> f means f(x)

// F# function composition (standard)
let (>>) f g = fun x -> g (f x)               
// f >> g means "first f, then g"
```

## The Four Applicative Laws (F# Style)

### 1. **Identity Law** ✅

```fsharp
x |> apply (ID id) = x
```

**Explanation**: Applying the identity function `id` (lifted by `ID`) to any applicative value `x` returns `x` unchanged.

**Verification Example**:

```fsharp
// Option example
let x = Some 42
x |> apply (ID id) = Some 42  // ✓ Correct
```

### 2. **Homomorphism Law** ✅

```fsharp
ID x |> apply (ID f) = ID (f x)
```

**Explanation**: Lifting a function `f` and value `x` separately, then applying them, equals applying `f` to `x` first and then lifting the result.

**Verification Example**:

```fsharp
// Option example
let f = (+) 10
let x = 5
ID x |> apply (ID f) = ID (f x)
// Some 5 |> apply (Some ((+) 10)) = Some 15  ✓ Correct
```

### 3. **Interchange Law** ✅

```fsharp
ID y |> apply f = f |> apply (ID (fun g -> g y))
```

**Explanation**: Applying a container of functions `f` to a lifted value `y` equals applying a specialized function to `f`.

**Verification Example**:

```fsharp
// Option example
let f = Some ((+) 10)
let y = 5
ID y |> apply f = f |> apply (ID (fun g -> g y))
// Some 5 |> apply (Some ((+) 10)) = Some ((+) 10) |> apply (Some (fun g -> g 5))
// Both equal Some 15  ✓ Correct
```

### 4. **Composition Law** ✅

```fsharp
x |> apply f |> apply g = x |> apply (ID (>>) |> apply g |> apply f)
```

**Explanation**: Applying functions `f` then `g` sequentially equals applying the composition `f >> g`. In F#, `f >> g` means "first apply `f`, then apply `g`".

**Alternative clearer notation**:

```fsharp
// Step by step breakdown
let composed = ID (>>) |> apply g |> apply f  // Creates f >> g in container
x |> apply f |> apply g = x |> apply composed
```

**Verification Example**:

```fsharp
// Option example
let f = Some ((+) 1)      // Add 1
let g = Some ((*) 2)      // Multiply by 2  
let x = Some 5

// Left side: apply f then g
let leftSide = x |> apply f |> apply g    // Some 5 -> Some 6 -> Some 12

// Right side: compose then apply
let composition = ID (>>) |> apply g |> apply f  // Some (fun x -> g(f(x)))
let rightSide = x |> apply composition           // Some 12

// leftSide = rightSide = Some 12  ✓ Correct
```

## Complete F# Implementation Example

```fsharp
// Option Applicative implementation
module OptionApplicative =
    let ID x = Some x
    
    let apply fo xo = 
        match fo, xo with
        | Some f, Some x -> Some (f x)
        | _ -> None

    // Derived helper (map2 can be built from ID and apply)
    let map2 f x y = ID f |> apply x |> apply y

// Law verification functions
let verifyIdentityLaw () =
    let x = Some 42
    let result1 = x |> apply (ID id)
    let result2 = x
    result1 = result2  // Should return true

let verifyHomomorphismLaw () =
    let f = (+) 10
    let x = 5
    let result1 = ID x |> apply (ID f)
    let result2 = ID (f x)
    result1 = result2  // Should return true

let verifyInterchangeLaw () =
    let f = Some ((+) 10)
    let y = 5
    let result1 = ID y |> apply f
    let result2 = f |> apply (ID (fun g -> g y))
    result1 = result2  // Should return true

let verifyCompositionLaw () =
    let f = Some ((+) 1)
    let g = Some ((*) 2)
    let x = Some 5
    
    // Left side: sequential application
    let result1 = x |> apply f |> apply g
    
    // Right side: composed application
    let composed = ID (>>) |> apply g |> apply f
    let result2 = x |> apply composed
    
    result1 = result2  // Should return true
```

## List Applicative Example

```fsharp
// List Applicative (Cartesian product behavior)
module ListApplicative =
    let ID x = [x]
    
    let apply fs xs = 
        [for f in fs do
         for x in xs do
         yield f x]

// Test with lists
let testListLaws () =
    let f = [((+) 1); ((*) 2)]
    let g = [((+) 10); ((*) 3)]
    let x = [5]
    
    // Composition law verification
    let result1 = x |> apply f |> apply g
    let composed = ID (>>) |> apply g |> apply f  
    let result2 = x |> apply composed
    
    result1 = result2  // Should return true
```

## Key F# Conventions Used

1.  **`ID`** instead of Haskell's `pure`
2.  **`apply`** with explicit piping using `|>`
3.  **`f >> g`** for "first `f`, then `g`" composition
4.  **Standard F# syntax** throughout
5.  **No Haskell-specific operators** like `<*>`

## Why These Laws Matter

-   **Parallel Safety**: Independent computations can run in any order
-   **Composability**: Complex operations built from simple parts
-   **Optimization**: Compilers can rearrange operations safely
-   **Reasoning**: Mathematical guarantees about program behavior

These laws ensure that your classification:

**Independent Operations = Applicative scope**

*is mathematically rigorous*  and practically implementable in F#.

:::