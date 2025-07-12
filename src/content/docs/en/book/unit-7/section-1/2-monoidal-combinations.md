---
title: 'Chapter 2: Binary Operations and Monoids'
description: >-
  combineLatestWith, which we learned about in Chapter 1, is a general-purpose
  primitive for bringing any binary operation into the world of Timeline. In
  this chapter, we will define a set of helper functions to use
  combineLatestWith more concretely and safely.
---
`combineLatestWith`, which we learned about in Chapter 1, is a general-purpose primitive for bringing any binary operation into the world of `Timeline`. In this chapter, we will define a set of helper functions to use `combineLatestWith` more concretely and safely.

What is important is that the binary operations we will define from now on are based on the mathematical structure called a **Monoid**, which we learned about in Unit 2. A Monoid was defined as an algebraic structure consisting of a set of three things: "a type," "a binary operation that takes two values of that type and returns a value of the same type, satisfying the **associative law**," and "an **identity element** for that operation."

This chapter will show how a value-level Monoid is inherited as is to a `Timeline` container-level Monoid by `combineLatestWith` (the `map2` operation of Applicative), preserving its beautiful structure.

## Binary Operation Helper Functions

The functions we will introduce now, such as `orOf`, `andOf`, `addOf`, and `concatOf`, are all specializations of `combineLatestWith` with a specific Monoid operation.

### Logical OR: orOf

##### F\#: `orOf: Timeline<bool> -> Timeline<bool> -> Timeline<bool>`

##### TS: `orOf(timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean>`

<!-- end list -->

Combines two `Timeline<boolean>`s with a logical OR (`||`).

The foundation of this operation is the Monoid of logical OR on the `boolean` type.

- **Type**: `boolean`

- **Binary Operation**: `||` (OR)

- **Identity Element**: `false` (`false || x` is always `x`)

The properties of this Monoid are inherited to the `Timeline` level by `orOf`.

```typescript
// TS
// The implementation uses combineLatestWith
const orOf = (timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean> =>
    combineLatestWith((a: boolean, b: boolean) => a || b)(timelineA)(timelineB);
```

-----

### Logical AND: andOf

##### F\#: `andOf: Timeline<bool> -> Timeline<bool> -> Timeline<bool>`

##### TS: `andOf(timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean>`

Combines two `Timeline<boolean>`s with a logical AND (`&&`).

This is based on the Monoid of logical AND.

- **Type**: `boolean`

- **Binary Operation**: `&&` (AND)

- **Identity Element**: `true` (`true && x` is always `x`)

-----

### Addition: addOf

##### F\#: (No direct helper in F\#. Use `combineLatestWith (+)`.)

##### TS: `addOf(timelineA: Timeline<number>, timelineB: Timeline<number>): Timeline<number>`

Combines two `Timeline<number>`s with addition (`+`).

This is based on the Monoid of numerical addition.

- **Type**: `number`

- **Binary Operation**: `+` (Addition)

- **Identity Element**: `0` (`0 + x` is always `x`)

-----

### Array Concatenation: concatOf

##### F\#: `concatOf: Timeline<'a list> -> Timeline<'a> -> Timeline<'a list>`

##### TS: `concatOf(timelineA: Timeline<any[]>, timelineB: Timeline<any>): Timeline<any[]>`

`concat` is an operation that combines two arrays to create one new array. This simple operation also forms an extremely important Monoid.

- **Type**: `array<'a>` (an array of any type)

- **Binary Operation**: `concat` (array concatenation)

- **Identity Element**: `[]` (the empty array) (concatenating `[]` with any array `x` leaves `x` unchanged)

This "Array Monoid" is the theoretical foundation for constructing `listOf`, which will appear in the next chapter.

## Conclusion: Inheritance of Monoid Properties

As we have seen so far, `combineLatestWith` plays the role of lifting a Monoid defined at the value level (addition, logical OR, array concatenation, etc.) into the world of the `Timeline` container, without losing any of its properties.

Just as adding `0` does not change a value, adding `Timeline(0)` with `addOf` does not change the behavior of a `Timeline`. Just as concatenating with `[]` does not change an array, concatenating with `Timeline([])` using `concatOf` does not change the behavior of a `Timeline`.

The `map2` operation of an Applicative Functor (here, `combineLatestWith`) allows the beautiful algebraic structure of the underlying Monoid to be inherited as is to the container-level Monoid. It is because of this robust mathematical foundation that we can confidently assemble these parts in the next chapter to build more complex composition functions.

## Canvas Demo (Placeholder)
