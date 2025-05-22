---
title: >-
  Chapter 9: Practical Aggregation of Non-Boolean Timelines – The "Map to
  Boolean" Pattern
description: >-
  Chapter Goal: This chapter demonstrates a common and powerful pattern for
  applying the boolean aggregation combinators (like TL.all and TL.any from
  Chapter 8) to collections of timelines that do not originally hold boolean
  values. We will show how to first transform these timelines into
  Timeline<bool> instances using TL.map and then aggregate these boolean
  timelines, using practical examples like checking the success of multiple HTTP
  requests.
---
**Chapter Goal:**
This chapter demonstrates a common and powerful pattern for applying the boolean aggregation combinators (like `TL.all` and `TL.any` from Chapter 8) to collections of timelines that do not originally hold boolean values. We will show how to first transform these timelines into `Timeline<bool>` instances using `TL.map` and then aggregate these boolean timelines, using practical examples like checking the success of multiple HTTP requests.

## 9.1 Introduction: The Challenge of Aggregating Diverse Data

In Chapter 8, we developed `TL.all` and `TL.any`, powerful tools for aggregating conditions from a `list<Timeline<bool>>`. These allow us to easily determine if all boolean timelines in a list are `true`, or if at least one is `true`.

However, a practical question quickly arises: what if our source timelines don't inherently represent boolean states? Consider these common scenarios:

*   **Multiple HTTP Requests:** We might have several independent HTTP requests, each represented by a `Timeline` that will eventually hold a response object (e.g., `Timeline<HttpResponseInfo>`). How do we create a single `Timeline<bool>` that tells us if *all* these requests completed successfully?
*   **Form Input Validation:** A form might have various input fields, each with its own validation logic. An email field might return `Timeline<EmailValidationResult>`, a password field `Timeline<PasswordStrengthScore>`, and a username field `Timeline<UsernameAvailability>`. How do we combine these diverse validation outcomes into a single `Timeline<bool>` indicating if the *entire form* is valid?
*   **System Health Checks:** Monitoring various system components (database, external services, internal queues), each providing status updates via a `Timeline` (e.g., `Timeline<ServiceStatus>`). How do we get an overall `Timeline<bool>` for "all systems operational"?

In these cases, the source data isn't directly boolean, but we need to derive a boolean condition from each source before we can perform a logical aggregation (like AND or OR) across all of them. This chapter introduces a versatile two-step pattern to address this: **"Map to Boolean, then Aggregate."**

## 9.2 The Core Pattern: Map, Then Aggregate

The "Map to Boolean, then Aggregate" pattern is a straightforward yet powerful strategy for applying logical aggregation to collections of non-boolean timelines. It involves two distinct steps:

1.  **Step 1: Map to Boolean (`Timeline<'a> -> Timeline<bool>`)**
    For each individual source timeline that doesn't inherently hold a boolean value (let's say it's a `Timeline<'a>`), we use the `TL.map` combinator (from Unit 5, Chapter 3). We provide `TL.map` with a predicate function of type `'a -> bool`. This function takes the value from the source timeline and transforms it into a boolean value representing the specific condition we care about for that source.
    *   Example: If `sourceTimeline: Timeline<HttpResponseInfo>`, the mapping function might be `fun responseInfo -> responseInfo.IsSuccess`. This produces a `Timeline<bool>` indicating if that specific request was successful.
    *   Example: If `sourceTimeline: Timeline<string>` for a username, the mapping function might be `fun username -> username.Length > 3 && not (System.String.IsNullOrWhiteSpace username) (* more checks *)`. This produces a `Timeline<bool>` indicating if the username is valid.

2.  **Step 2: Aggregate Booleans (`list<Timeline<bool>> -> Timeline<bool>`)**
    Once each of the original source timelines has been transformed into a `Timeline<bool>` representing the relevant boolean condition, we collect these new `Timeline<bool>` instances into a list.
    Then, we apply one of the n-ary boolean aggregation combinators developed in Chapter 8:
    *   `TL.all`: To check if *all* conditions are true.
    *   `TL.any`: To check if *any* of the conditions are true.
    This yields a final, single `Timeline<bool>` representing the overall aggregated logical state.

This pattern elegantly separates concerns:

*   The logic for determining the boolean status of an individual source is encapsulated within its specific mapping function.
*   The logic for aggregating multiple boolean statuses is handled by the general-purpose `TL.all` or `TL.any` combinators.

This composability makes the overall system easier to understand, maintain, and extend.

## 9.3 Example: Aggregating Success of Multiple HTTP Requests

Let's make the common scenario of checking if multiple HTTP requests have all completed successfully more concrete.

**Scenario Setup:**
Suppose we have functions that initiate different API calls. Each returns a `Timeline` that will eventually contain information about the HTTP response. (This example reuses the `HttpResponseInfo` type and `makeRequest` function structure from the original Chapter 11, which mirrors the case study in original Chapter 12 / new Chapter 10).

```fsharp
// Assume Timeline factory, Now, TL.at, TL.define, TL.map, TL.all, TL.any are accessible.
// Assume isNull helper is globally available.

// Record definition (similar to one used in Chapter 10's case study)
type HttpResponseInfo = {
    Url: string
    StatusCode: int
    IsSuccess: bool // True if status code indicates success (e.g., 2xx)
    ContentLength: int64
}

// Functions that simulate making requests and returning results on timelines
// In a real app, these would involve actual async HTTP calls (see Unit 5, Chapter 4)
let makeRequest : string -> int -> Timeline<HttpResponseInfo> =
    fun url simulatedStatusCode ->
        let response : HttpResponseInfo =
            { Url = url
              StatusCode = simulatedStatusCode
              IsSuccess = simulatedStatusCode >= 200 && simulatedStatusCode < 300
              ContentLength = 1024L } // Dummy length
        Timeline response // In a real scenario, this would be updated async

let request1Result: Timeline<HttpResponseInfo> = makeRequest "/api/data/1" 200
let request2Result: Timeline<HttpResponseInfo> = makeRequest "/api/data/2" 200
let request3Result: Timeline<HttpResponseInfo> = makeRequest "/api/data/3" 404 // This one will fail
```

**Step 1: Map each request result to `Timeline<bool>` (Success/Failure)**
We need a function to determine if an `HttpResponseInfo` represents a successful request.

```fsharp
// (Continued from previous F# block)

// Mapping function: extracts the IsSuccess flag
let wasRequestSuccessfulPredicate : HttpResponseInfo -> bool =
    fun responseInfo ->
        responseInfo.IsSuccess

// Create boolean timelines representing the success of each request
let request1Succeeded: Timeline<bool> = request1Result |> TL.map wasRequestSuccessfulPredicate
let request2Succeeded: Timeline<bool> = request2Result |> TL.map wasRequestSuccessfulPredicate
let request3Succeeded: Timeline<bool> = request3Result |> TL.map wasRequestSuccessfulPredicate

// At this point (conceptually, after initial values are processed):
// request1Succeeded |> TL.at Now  // true
// request2Succeeded |> TL.at Now  // true
// request3Succeeded |> TL.at Now  // false
```

**Step 2: Aggregate the boolean success timelines**
Now that we have a list of `Timeline<bool>` instances, we use `TL.all` (from Chapter 8).

```fsharp
// (Continued from previous F# block)

let allRequestsSucceeded: Timeline<bool> =
    [request1Succeeded; request2Succeeded; request3Succeeded]
    |> TL.all // Using the n-ary combinator TL.all (from Chapter 8)

printfn "Initial: All requests succeeded? %b" (allRequestsSucceeded |> TL.at Now)
// Expected Output: Initial: All requests succeeded? false (because request3 failed)

// To check if *any* request succeeded:
let anyRequestSucceeded: Timeline<bool> =
    [request1Succeeded; request2Succeeded; request3Succeeded]
    |> TL.any // Using the n-ary combinator TL.any (from Chapter 8)

printfn "Initial: Any request succeeded? %b" (anyRequestSucceeded |> TL.at Now)
// Expected Output: Initial: Any request succeeded? true (because request1 and request2 succeeded)
```

This demonstrates the pattern. For efficiency, one would typically apply `TL.distinctUntilChanged` (Chapter 6) to `allRequestsSucceeded` or `anyRequestSucceeded`.

## 9.4 Example: Validating Multiple Input Fields for Form Submission

Another common use case is determining if a form is ready for submission.

**Scenario Setup:**
A registration form with username, password complexity, and email format.

```fsharp
// Assume Timeline factory, Now, TL.at, TL.define, TL.map, TL.all are accessible.

// Simulate input timelines and their validation state
type EmailValidationStatus = NotValidated | Validating | Valid | Invalid

let usernameValue: Timeline<string> = Timeline ""
let passwordScore: Timeline<int> = Timeline 0 // Score from 0-100
let emailStatus: Timeline<EmailValidationStatus> = Timeline EmailValidationStatus.NotValidated
```

**Step 1: Map each input state to `Timeline<bool>` (Is Valid?)**
Define predicates for each field.

```fsharp
// (Continued from previous F# block)

let isUsernameValidCriteria : string -> bool =
    fun name -> name.Length >= 4

let isPasswordStrongCriteria : int -> bool =
    fun score -> score >= 75

let isEmailFormatValidCriteria : EmailValidationStatus -> bool =
    fun status -> status = EmailValidationStatus.Valid

// Create boolean timelines for each validation check
let usernameIsValid: Timeline<bool> = usernameValue |> TL.map isUsernameValidCriteria
let passwordIsStrong: Timeline<bool> = passwordScore |> TL.map isPasswordStrongCriteria
let emailFormatIsValid: Timeline<bool> = emailStatus |> TL.map isEmailFormatValidCriteria
```

**Step 2: Aggregate for overall form validity**
Use `TL.all` to check if all individual validation timelines are `true`.

```fsharp
// (Continued from previous F# block)

let isFormReadyToSubmit: Timeline<bool> =
    [usernameIsValid; passwordIsStrong; emailFormatIsValid]
    |> TL.all // Using new TL.all

// This timeline can now be used to enable/disable a submit button.
// let submitButtonReaction (canSubmit: bool) : unit = (* submitButton.IsEnabled <- canSubmit *) ()
// isFormReadyToSubmit |> TL.map submitButtonReaction |> ignore

printfn "Initial form readiness: %b" (isFormReadyToSubmit |> TL.at Now)
// Expected Output: Initial form readiness: false

// Simulate user typing and validation occurring
usernameValue |> TL.define Now "TestUser"    // usernameIsValid becomes true
passwordScore |> TL.define Now 80           // passwordIsStrong becomes true
emailStatus |> TL.define Now EmailValidationStatus.Valid // emailFormatIsValid becomes true

printfn "Updated form readiness: %b" (isFormReadyToSubmit |> TL.at Now)
// Expected Output: Updated form readiness: true
```

This `isFormReadyToSubmit` timeline reactively reflects the overall form validity.

## 9.5 Benefits of the "Map to Boolean" Pattern

This two-step pattern offers significant advantages:

1.  **Modularity and Separation of Concerns:**
    *   Individual condition logic is encapsulated in mapping functions (`'a -> bool`).
    *   Aggregation is handled by generic `TL.all` or `TL.any`.
2.  **Reusability:**
    *   `TL.all`, `TL.any` are highly reusable.
    *   Mapping functions can also be reused.
3.  **Clarity and Readability:**
    *   The two-step process often makes overall logic easier to understand.
4.  **Flexibility:**
    *   Different mapping functions can be applied to diverse data types before aggregation.

## 9.6 Conclusion: A Versatile Strategy for Complex Conditions

The "Map to Boolean, then Aggregate" pattern is a cornerstone strategy for applying logical AND/OR combinators (`TL.Or`/`TL.And` for binary from Chapter 7, `TL.any`/`TL.all` for n-ary from Chapter 8) to collections of reactive data sources not initially boolean. By first using `TL.map` to transform diverse timelines into `Timeline<bool>` instances representing specific conditions, we then leverage the power and robustness of `TL.all` and `TL.any` for aggregation.

This approach embodies the composable nature of functional reactive programming. It effectively concludes our primary discussion on fundamental combinators for boolean logic within Unit 6, Section 1.

With the tools and patterns explored – from naive Monoids (Chapter 3), motivations for general tools (Chapter 4), `TL.zipWith` (Chapter 5), `TL.distinctUntilChanged` (Chapter 6), refined binary (`TL.Or`, `TL.And` in Chapter 7) and n-ary (`TL.any`, `TL.all` in Chapter 8) logical combinators, and now this "Map to Boolean" strategy – you are equipped to construct a wide range of complex and robust reactive systems. The final chapter in this section will present a comprehensive case study putting many of these pieces together.
