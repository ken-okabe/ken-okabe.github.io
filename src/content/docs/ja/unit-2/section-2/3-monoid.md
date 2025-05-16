---
title: 'Monoids: Semigroups with Identity'
description: 'A  monoid  starts with the same requirements as a semigroup:'
---
A  **monoid**  starts with the same requirements as a semigroup:

- A is a set (in programming terms, a Type)
- • is a binary operator that combines two values of the same type and returns a result of that same type (in programming terms, a Function of type `a -> a -> a` where both inputs and the output must be the same type a)
- The operator must satisfy the associative law

And adds one more requirement:

- There exists an identity element e in A such that:
  - e • x = x (left identity)
  - x • e = x (right identity)
  - This must hold for all x in A

In other words,  **a monoid is a semigroup that has an identity element.**  All the associativity properties we learned about semigroups still apply, but now we have this additional special element that acts as an identity.

## Examples of Monoids

From our previous examples:

- (Numbers, +, 0) is a monoid
- (Numbers, ×, 1) is a monoid
- (Strings, concatenation, "") is a monoid

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

However, in a virtual space, we could create monoids from these semigroups:

For LEGO blocks:

- We could define a "virtual empty block" that acts as an identity
- This virtual block would leave other blocks unchanged when connected
- In a video game or CAD system, this is entirely possible!

For USB devices:

- We could create a "virtual empty hub" that acts as an identity
- This virtual hub would pass through connections unchanged
- In a device simulator, this would work perfectly

This reveals a fundamental mathematical fact: for any semigroup (S, •), there exists a potentially corresponding unique identity element e, and by adjoining this identity element to the original semigroup, we can always construct a monoid.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Why Monoids Matter

The addition of an identity element to a semigroup gives us even more power in our computations:

1. We still have everything a semigroup offers (associativity)
2. Plus we have a "starting point" or "default value" (the identity element)

This combination makes monoids particularly useful in programming, especially when working with collections or sequences of operations where we need both associativity and a sensible starting value.
