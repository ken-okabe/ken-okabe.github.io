---
title: 'The "Map to Boolean, then Aggregate" Pattern'
description: >-
  In the previous chapter, we developed TL.all and TL.any for aggregating
  conditions from a list<Timeline<bool>>. But what if our source data is not
  inherently boolean?
---
In the previous chapter, we developed `TL.all` and `TL.any` for aggregating conditions from a `list<Timeline<bool>>`. But what if our source data is not inherently boolean?

For instance, how do we create a single `Timeline<bool>` to signal if *all* HTTP requests in a list were successful, when the sources are `Timeline<HttpResponse>`?

This chapter introduces a versatile and powerful two-step pattern to solve this: **"Map to Boolean, then Aggregate."**

## The Core Pattern

This strategy allows us to apply our logical aggregation combinators to collections of non-boolean timelines. It involves two distinct steps:

1.  **Step 1: Map to Boolean (`Timeline<'a> -> Timeline<bool>`)**
    For each source timeline (e.g., `Timeline<'a>`), we use the `TL.map` combinator with a predicate function (`'a -> bool`). This function transforms the value from the source timeline into a boolean that represents the condition we care about. For an HTTP response, this function might be `fun response -> response.IsSuccessStatusCode`. This step produces a `Timeline<bool>` for each source.

2.  **Step 2: Aggregate Booleans (`list<Timeline<bool>> -> Timeline<bool>`)**
    Once we have transformed each source timeline into a `Timeline<bool>`, we collect them into a list. Then, we apply one of our n-ary aggregation combinators from the previous chapter:
    * `TL.all`: To check if *all* conditions are true.
    * `TL.any`: To check if *any* of the conditions are true.

This pattern elegantly separates the logic for evaluating an individual source's state from the logic of aggregating the overall state of the collection.

## Example: Form Input Validation

Consider a registration form where each input's validation state is represented by a non-boolean timeline.

```fsharp
// Timelines representing the state of various inputs
let usernameValue: Timeline<string> = Timeline ""
let passwordScore: Timeline<int> = Timeline 0 // Score from 0-100

// Step 1: Map each input state to a boolean validity timeline
let isUsernameValid = TL.map (fun name -> name.Length >= 4) usernameValue
let isPasswordStrong = TL.map (fun score -> score >= 75) passwordScore

// Step 2: Aggregate the boolean timelines to get overall form validity
let isFormReadyToSubmit = TL.all [ isUsernameValid; isPasswordStrong ]

// This timeline can now be used to reactively enable/disable a submit button.
// As the user types, `isFormReadyToSubmit` will automatically update.
```

This composable pattern is a cornerstone of practical reactive programming. It allows us to build complex, high-level conditions from simple, reusable parts (`map`, `all`, `any`), making our systems easier to understand, maintain, and extend.
