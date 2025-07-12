---
title: 'Chapter 1: Navigating the Nullable World — The n-APIs as Safe Operations'
description: >-
  In the previous chapter, we delved into the truth behind the problems
  historically caused by null. Our conclusion was that the root of the problem
  was not that the concept of null itself is evil, but that the safe operations
  that should be paired with null (the empty set) were not defined in many
  languages. An algebraic structure is only complete with a pair of a "set" and
  an "operation." The failure to provide corresponding "operations" for the
  "set" element of null was the true "billion-dollar mistake."
---
## 1. The Conclusion of the Previous Chapter: The Missing Piece Was a "Safe Operation"

In the previous chapter, we delved into the truth behind the problems historically caused by `null`. Our conclusion was that the root of the problem was not that the concept of `null` itself is evil, but that the **safe operations** that should be paired with `null` (the empty set) were not defined in many languages. An algebraic structure is only complete with a pair of a "set" and an "operation." The failure to provide corresponding "operations" for the "set" element of `null` was the true "billion-dollar mistake."

This chapter explains how the `Timeline` library concretely implements those missing "safe operations." The answer is the **function group with the `n` prefix (the n-APIs)**.

-----

## 2. The Most Basic Operation: `nMap` — Allowing `null` to Pass Through Safely

To understand the design philosophy of the n-APIs, let's first look at the most basic `map` operation.

The original `map` function, without the `n` prefix, does not assume that the input timeline's value will be `null`. Therefore, if applied to a nullable timeline as shown below, it carries a potential risk of causing a runtime error like `TypeError: Cannot read properties of null` inside the mapping function (`x => x.toUpperCase()`).

```typescript
// Potentially problematic code
const nameTimeline = Timeline<string | null>("Alice");

const upperCaseName = nameTimeline.map(x => x.toUpperCase()); // Throws an error if 'x' is null

nameTimeline.define(Now, null); // An exception could be thrown here
```

The solution to this problem is `nMap`. `nMap` is a "safe operation" designed with the existence of `null` in mind.

-----

#### F\#: `nMap: ('a -> 'b) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

#### TS: `.nMap<B>(f): Timeline<B | null>`

The operational rule provided by `nMap` is extremely simple:

**"If the input timeline's value is `null`, do not execute the mapping function and immediately set the output timeline's value to `null`."**

This rule absorbs the risk of a `NullPointerException` within the `nMap` operation itself. `Null` passes through the pipeline safely without destroying it.

```typescript
// TS
const nullableNumbers = Timeline<number | null>(5);
const doubled = nullableNumbers.nMap(x => x * 2);
console.log(doubled.at(Now)); // 10

// When the input becomes null...
nullableNumbers.define(Now, null);
// ...the function is not executed, and the output safely becomes null.
console.log(doubled.at(Now)); // null
```

-----

## 3. Safe Navigation of Dynamic Graphs: `nBind`

This design philosophy of "letting `null` pass through safely" also applies to the more complex `bind` operation. While `bind` is a powerful feature for dynamically switching subsequent timelines based on a value, it carries the same risks as `map` if the possibility of a `null` input is not considered.

`nBind` is the operation that incorporates null-safety into the `bind` operation.

-----

#### F\#: `nBind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

#### TS: `.nBind<B>(monadf): Timeline<B | null>`

When the input timeline becomes `null`, `nBind` does not execute the function (`monadf`) that generates the subsequent timeline. Instead, it immediately sets the output timeline to `null`.

This is extremely useful in asynchronous chains. For example, in a process like "get user ID, then use that ID to get the user profile," if the initial "get user ID" step fails and returns `null`, the subsequent profile-fetching logic is safely skipped.

```typescript
// TS
const maybeNumber = Timeline<number | null>(5);

// Since the input is 5, the function executes and a result Timeline is generated.
const result = maybeNumber.nBind(x => Timeline(x.toString()));
console.log(result.at(Now)); // "5"

// When the input becomes null...
maybeNumber.define(Now, null);
// ...the function is not executed, and the output safely becomes null.
console.log(result.at(Now)); // null
```

-----

## 4. Fusion with Resource Management: `nUsing`

`using` is an advanced operation that synchronizes the value of a timeline with the lifecycle of an external resource, such as a DOM element or a timer. In this context, handling `null` is also critical. The state of "no resource exists" needs to be handled elegantly as a valid state, not as an error.

`nUsing` is the operation that meets this requirement.

-----

#### F\#: `nUsing: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

#### TS: `.nUsing<B>(resourceFactory): Timeline<B | null>`

`nUsing` defines an operation that, "if it receives `null` as input, does not execute the resource acquisition logic (`resourceFactory`) and returns a timeline whose result is also `null`."

This allows for common UI programming scenarios—such as "acquire the resource if the user has selected a DOM element, and do nothing if nothing is selected (`null`)"—to be written as a single, declarative pipeline without imperative `if` statement branching.

```typescript
// TS
const optionalUserId = Timeline<number | null>(123);

// Since optionalUserId is 123, the resource is acquired.
const resource = optionalUserId.nUsing(id => {
    // This part only runs if id is not null
    return createResource(`data_for_${id}`, () => console.log(`cleanup for ${id}`));
});
console.log(resource.at(Now)?.resource); // "data_for_123"

// When optionalUserId becomes null...
optionalUserId.define(Now, null);
// ...the resource factory is not executed, and the result becomes null.
// (The cleanup function for the previous resource is called here).
console.log(resource.at(Now)); // null
```

-----

## 5. Summary: The n-API Design Philosophy

Across `nMap`, `nBind`, and `nUsing`, a common design philosophy emerges. The "operation" provided by the n-API family is based on a simple rule:

**"Treat a `null` input as a special case, and without throwing an exception, return a `null` output while preserving the structure of the pipeline."**

This rule is the concrete answer to the problem we concluded was "missing" in the previous chapter: a safe operation to be paired with `null` (the empty set).

This design frees the programmer from needing to repeat defensive `if`-`null` checks on the "outside" of the pipeline. As a result, one can acknowledge the existence of `null` yet focus on writing cleaner, more declarative code without being bothered by its dangers.

-----

## Canvas Demo (Placeholder)

A demo comparing the behavior of `map` and `nMap` side-by-side. On the left (`map`), when `null` is input, the pipeline stops with a red warning indicator. On the right (`nMap`), when `null` is input, the pipeline's color changes, and it visually skips the subsequent operation, propagating `null` as the output.
