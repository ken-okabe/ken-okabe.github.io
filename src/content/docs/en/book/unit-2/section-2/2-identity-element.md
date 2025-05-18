---
title: Identity Elements
description: >-
  An  identity element  (often called a "unit element") is a special value that,
  when combined with any other value using a binary operator, leaves that other
  value unchanged.
---
## What is an Identity Element?

An  **identity element**  (often called a "unit element") is a special value that, when combined with any other value using a binary operator, leaves that other value unchanged.

A value e is called an identity element if combining it with any other element x leaves x unchanged:

- Left identity: e • x = x
- Right identity: x • e = x
- This must work for all values x in the set

## Identity Elements in Familiar Operations

### Addition and Multiplication

For numbers, we have natural identity elements:

For addition:

- Identity element: 0
- Property: Adding 0 leaves any number unchanged
  - 0 + 3 = 3 = 3 + 0
  - 0 + 7 = 7 = 7 + 0
  - Works for any number!

For multiplication:

- Identity element: 1
- Property: Multiplying by 1 leaves any number unchanged
  - 1 × 5 = 5 = 5 × 1
  - 1 × 8 = 8 = 8 × 1
  - Works for any number!

### String Concatenation

For strings, we have:

- Identity element: "" (empty string)
- Property: Concatenating with empty string leaves any string unchanged
  - "" + "hello" = "hello" = "hello" + ""
  - "" + "world" = "world" = "world" + ""
  - Works for any string!

### Physical Examples: No Natural Identity

In our physical examples, we find that identity elements don't naturally exist:

LEGO blocks:

- There's no physical LEGO block that, when connected to any other block, leaves that block unchanged
- Any real LEGO block will physically alter the block it's connected to

USB devices:

- There's no physical USB device that, when connected to others, leaves their configuration unchanged
- Any real hub or device will affect the physical configuration

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

An important property of identity elements: if they exist at all, they must be both left and right identities, and they must be unique.

Let's prove this by contradiction:

1. First, assume we have two different identity elements: a left identity eL and a right identity eR
   (i.e., assume eL and eR are different elements)

2. By definition of left identity:
   - eL • x = x for any x
   - Therefore, eL • eR = eR (because eR is also an element)

3. By definition of right identity:
   - x • eR = x for any x
   - Therefore, eL • eR = eL (because eL is also an element)

4. Now we have a contradiction:
   - eL • eR = eR (from step 2)
   - eL • eR = eL (from step 3)
   - Therefore eL = eR

5. This contradicts our initial assumption that eL and eR were different.

Therefore, our assumption must have been wrong - a left identity and a right identity cannot be different elements. If an identity element exists, it must be:

1. Both a left and right identity
2. The only identity element (unique)

In other words, you can't have "just a left identity" or "just a right identity" - if an identity element exists at all, it must work from both sides, and it must be unique.

Let's confirm this with our familiar examples:

For addition:

- 0 is the identity element
- It works from both sides: 3 + 0 = 3 and 0 + 3 = 3
- And there can't be any other number that works as an identity
  (if there were another number n, then n + 0 would have to equal both n and 0)

For multiplication:

- 1 is the identity element
- It works from both sides: 5 × 1 = 5 and 1 × 5 = 5
- And there can't be any other number that works as an identity
  (if there were another number n, then n × 1 would have to equal both n and 1)

This shows why, for any given operation, its identity element (if it exists) must be both left and right identity, and must be unique.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">
