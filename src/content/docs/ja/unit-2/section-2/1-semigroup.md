---
title: 'Semigroups: Our First Algebraic Structure'
description: >-
  Remember how we discovered that binary operators like + and * are actually
  functions in disguise? Now let's explore our first formal algebraic structure
  built around such operators: the Semigroup.
---
Remember how we discovered that binary operators like `+` and `*` are actually functions in disguise? Now let's explore our first formal algebraic structure built around such operators: the **Semigroup**.

## Understanding Semigroups Through Types and Operators

A semigroup is an algebraic structure (A, •) where:

- A is a set (in programming terms, a Type)
- • is a binary operator that combines two values of the same type and returns a result of that same type (in programming terms, a Function of type `a -> a -> a` where both inputs and the output must be the same type a)
- The operator must satisfy the associative law

Let's see this in familiar examples:

### Numbers with Addition and Multiplication

```fsharp
let add = (+)    // type: int -> int -> int
                 // takes two ints and returns an int of the same type
let mult = (*)   // type: int -> int -> int
                 // takes two ints and returns an int of the same type
```

For addition:

- Set (Type): The integers
- Operator (Function): Addition
- Associativity: $(1 + 2) + 3 = 1 + (2 + 3)$

For multiplication:

- Set (Type): The integers
- Operator (Function): Multiplication
- Associativity: $(1 × 2) × 3 = 1 × (2 × 3)$

Note that subtraction and division are not associative:
$(10 - 5) - 2 ≠ 10 - (5 - 2)$
$(16 ÷ 4) ÷ 2 ≠ 16 ÷ (4 ÷ 2)$

### Strings with Concatenation

```fsharp
let concat = (+)  // type: string -> string -> string
                  // takes two strings and returns a string of the same type
```

- Set (Type): All possible strings
- Operator (Function): String concatenation
- Associativity: ("He" + "l") + "lo" = "He" + ("l" + "lo")

## Physical Examples: The Same Pattern

### LEGO Blocks

- Set (Type): All physical LEGO blocks
- Operator (Function): Physical connection (takes two LEGO blocks and returns a combined LEGO block - same type!)
- Associativity: (A+B)+C = A+(B+C)

The LEGO connection operator is just like our binary operators in code - it takes two blocks and returns a combined block of the same type. And just like `+` for numbers, the way we group the connections doesn't affect the final result.

### USB Devices

- Set (Type): All USB devices
- Operator (Function): Hub connection (takes two USB devices and returns a combined USB device configuration - same type!)
- Associativity: Nesting hubs in different orders yields the same final configuration

## Why Semigroups Matter

The real power of recognizing something as a semigroup is that we know:

1. We have a well-defined set of values (our Type)
2. We have a binary operator (our Function) that:
   - Takes two values of our type
   - Returns a value of the same type
   - Combines values in a predictable way (associativity)

This means we can reliably chain operations together in our pipelines, just like we can reliably connect LEGO blocks or USB devices in any order. In mathematics, this structure is called a semigroup - but for us as programmers, it's a guarantee that our (Type, Function) pair will work reliably in pipelines, regardless of how we group the operations.
