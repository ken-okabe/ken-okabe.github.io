# Chapter 10: Case Study - Aggregating Asynchronous HTTP Request Outcomes

**Chapter Goal:**
This chapter provides a comprehensive, practical case study applying the "Map to Boolean, then Aggregate" pattern (discussed in Chapter 9) to a common real-world scenario: managing and evaluating the collective success of multiple asynchronous HTTP requests. We will walk through a complete F# code example, step-by-step, to illustrate how `Timeline`s, asynchronous operations, and the combinators developed in previous chapters (`TL.map`, `TL.all`, `TL.distinctUntilChanged`) work together to create a reactive system that monitors and responds to the outcomes of these requests.

## 10.1 Introduction: Bringing Theory to Practice

In Chapter 9, we established the "Map to Boolean, then Aggregate" pattern as a powerful and versatile strategy for applying logical aggregation (like "all true" or "any true") to collections of timelines that don't initially hold boolean values. This pattern involves transforming each non-boolean timeline into a `Timeline<bool>` representing a specific condition, and then using n-ary combinators like `TL.all` or `TL.any` (from Chapter 8) to derive an overall reactive boolean state.

This chapter moves from the general pattern to a concrete application. We will analyze a detailed F# example that:

1.  Initiates multiple asynchronous HTTP GET requests to different URLs.
2.  Represents the outcome of each request as a `Timeline<HttpResponseInfo>`.
3.  Uses the "Map to Boolean" step to convert these into `Timeline<bool>` indicating individual request success.
4.  Uses the "Aggregate" step (`TL.all`) to create a final `Timeline<bool>` that becomes `true` only when all requests have completed successfully.
5.  Reacts to this final signal to log detailed results.

This case study will solidify your understanding of how these `Timeline` concepts and combinators can be orchestrated to build robust, reactive solutions for asynchronous operations.

## 10.2 Recap: The "Map to Boolean, then Aggregate" Pattern

Before diving into the code, let's briefly revisit the two core steps of the pattern detailed in Chapter 9:

1.  **Step 1: Map to Boolean (`Timeline<'a> -> Timeline<bool>`)**: For each source `Timeline<'a>`, use `TL.map` (Unit 5) with a predicate function (`'a -> bool`) to derive a `Timeline<bool>`.
2.  **Step 2: Aggregate Booleans (`list<Timeline<bool>> -> Timeline<bool>`)**: Collect the `Timeline<bool>` instances into a list. Then, apply an n-ary aggregation combinator like `TL.all` or `TL.any` (Chapter 8).

This pattern promotes modularity and clarity.

## 10.3 The Example Scenario: Monitoring Multiple Web Requests

Our case study will simulate fetching data from several web URLs simultaneously. We want our system to:

*   Track individual request outcomes.
*   Determine if *all* requests completed successfully.
*   Log details upon collective success.

## 10.4 Detailed Code Walkthrough

Here is the F# code we will analyze.

```fsharp
open System
open System.Net.Http // Standard library for HttpClient
// Assume Timeline factory, Now value, TL module functions, and isNull helper are globally accessible
// No 'open Timeline' or 'open Timeline.TL'

// --- Dedicated Log Timeline Setup ---
let logTimeline : Timeline<string> = Timeline null

let logReactionForApp : string -> unit =
    fun message ->
        if not (isNull message) then
            printfn "[App Log ] %s" message
        // No else branch needed for implicit unit return

logTimeline |> TL.map logReactionForApp |> ignore

logTimeline |> TL.define Now "--- Case Study: Aggregating HTTP Request Success ---"

// --- Helper Types and Functions ---

type HttpResponseInfo = {
    Url: string
    StatusCode: int option
    IsSuccess: bool
    ContentSummary: string option
}

let private httpClient : HttpClient = new HttpClient()

let makeAsyncHttpRequest : string -> Timeline<HttpResponseInfo> =
    fun url ->
        let resultTimeline : Timeline<HttpResponseInfo> =
            Timeline { Url = url; StatusCode = None; IsSuccess = false; ContentSummary = Some "Request pending..." }

        async {
            try
                logTimeline |> TL.define Now (sprintf "[HTTP Log] Starting request to: %s" url)
                let! response = httpClient.GetAsync(url) |> Async.AwaitTask

                let statusCode : int = int response.StatusCode
                let success : bool = response.IsSuccessStatusCode
                let! content = response.Content.ReadAsStringAsync() |> Async.AwaitTask
                let summary : string option =
                    if success then Some (sprintf "OK (Content Length: %d)" content.Length)
                    else Some (sprintf "Failed (Status: %d)" statusCode)

                let responseInfo : HttpResponseInfo = {
                    Url = url
                    StatusCode = Some statusCode
                    IsSuccess = success
                    ContentSummary = summary
                }
                logTimeline |> TL.define Now (sprintf "[HTTP Log] Request to %s completed. Status: %d, Success: %b" url statusCode success)
                resultTimeline |> TL.define Now responseInfo
            with
            | ex ->
                logTimeline |> TL.define Now (sprintf "[HTTP Log] Request to %s FAILED. Error: %s" url ex.Message)
                let errorInfo : HttpResponseInfo = {
                    Url = url
                    StatusCode = None
                    IsSuccess = false
                    ContentSummary = Some (sprintf "Exception: %s" ex.Message)
                }
                resultTimeline |> TL.define Now errorInfo
        }
        |> Async.StartImmediate
        resultTimeline

// 1. Define URLs
let urlsToFetch : list<string> = [
    "https://www.google.com";
    "https://www.google.co.uk";
    "https://www.google.ca";
    // "https://nonexistent-domain123456.com"; // For failure testing
]

// 2. Create a list of Timelines, each representing an HTTP request result
let httpResultTimelines: list<Timeline<HttpResponseInfo>> =
    urlsToFetch |> List.map makeAsyncHttpRequest

// 3. Step 1 of "Map to Boolean" pattern:
let wasRequestSuccessfulPredicate : HttpResponseInfo -> bool =
    fun responseInfo -> responseInfo.IsSuccess

let successStatusTimelines: list<Timeline<bool>> =
    httpResultTimelines
    |> List.map (fun tlOfResponseInfo -> tlOfResponseInfo |> TL.map wasRequestSuccessfulPredicate)

// 4. Step 2 of "Map to Boolean" pattern: Aggregate with TL.all
let allRequestsInitiallySucceededSignal: Timeline<bool> =
    successStatusTimelines |> TL.all // Using new TL.all (from Chapter 8)

// 5. Optimize the final aggregated signal
let finalAllSuccessSignal: Timeline<bool> =
    allRequestsInitiallySucceededSignal |> TL.distinctUntilChanged // Using TL.distinctUntilChanged (from Chapter 6)

// 6. React to the final_all_success_signal.
let finalReactionOnSuccess : bool -> unit =
    fun allSucceeded ->
        if allSucceeded then
            let headerMsg : string = "EVENT: All HTTP requests reported success! Details:"
            logTimeline |> TL.define Now headerMsg

            httpResultTimelines
            |> List.iteri (fun i individualResultTimeline ->
                let resultData : HttpResponseInfo = individualResultTimeline |> TL.at Now
                let detailMsg : string =
                    sprintf "  %d. URL: %-25s Status: %-3s Success: %-5b Summary: %A"
                        (i + 1)
                        resultData.Url
                        (match resultData.StatusCode with Some s -> string s | None -> "N/A")
                        resultData.IsSuccess
                        resultData.ContentSummary
                logTimeline |> TL.define Now detailMsg
            )
            logTimeline |> TL.define Now "-----------------------------------------------------"
        else
            // Optional: Log waiting or partial failure status
            // logTimeline |> TL.define Now "STATUS: Not all requests have succeeded, or some are still pending/failed."
            ()

finalAllSuccessSignal |> TL.map finalReactionOnSuccess |> ignore

// --- Keep the program alive ---
logTimeline |> TL.define Now "Program initiated. HTTP requests dispatched..."
logTimeline |> TL.define Now "(Network dependent. Final aggregated log will appear if all succeed.)"

System.Threading.Thread.Sleep(20000) // Wait 20 seconds for demo.

logTimeline |> TL.define Now "Demo finished. Check [App Log] entries above."
```

(The sub-section breakdown below explains the F# code parts from the original document, now aligned with our style guide and terminology.)

### 10.4.1 Helper Types and Functions

*   **`HttpResponseInfo` Record:** Encapsulates URL, optional `StatusCode`, `IsSuccess` flag, and an optional `ContentSummary`. The `option` types for `StatusCode` and `ContentSummary` handle cases like pre-response pending states or low-level failures. `IsSuccess` is `false` for pending states.
*   **Shared `HttpClient`:** A single instance for efficiency.
*   **`makeAsyncHttpRequest` Function:**
    1.  **Initialization:** Returns a `Timeline<HttpResponseInfo>` immediately, initialized to a "pending" state (`IsSuccess = false`).
    2.  **Asynchronous Block:** Uses F# `async` to perform the HTTP GET. On success, populates `HttpResponseInfo` and `TL.define`s it onto `resultTimeline`. On exception, defines an error `HttpResponseInfo` onto `resultTimeline`. `Async.StartImmediate` initiates the operation.
    3.  **Return Value:** Synchronously returns the `resultTimeline`.

### 10.4.2 Dedicated Log Timeline Setup

A `logTimeline` for application-level logging, printing non-`null` messages.

### 10.4.3 Main Logic: Applying the Pattern

*   **1. Define URLs:** A list of target URLs.
*   **2. Create `httpResultTimelines`:** `List.map makeAsyncHttpRequest` initiates all requests concurrently, yielding a `list<Timeline<HttpResponseInfo>>`.
*   **3. Step 1: Map to `successStatusTimelines`**:
    *   `wasRequestSuccessfulPredicate`: `HttpResponseInfo -> bool` extracts `responseInfo.IsSuccess`.
    *   Each `Timeline<HttpResponseInfo>` is transformed into a `Timeline<bool>` using `tlOfResponseInfo |> TL.map wasRequestSuccessfulPredicate`. These initially hold `false`.
*   **4. Step 2: Aggregate with `allRequestsInitiallySucceededSignal`**:
    *   `successStatusTimelines |> TL.all` (using `TL.all` from Chapter 8) creates a `Timeline<bool>` that's `true` iff all individual success timelines are `true`. It's initially `false`.
*   **5. Optimize with `finalAllSuccessSignal`**:
    *   `allRequestsInitiallySucceededSignal |> TL.distinctUntilChanged` (from Chapter 6) ensures propagation only on actual state changes of overall success.
*   **6. React to `finalAllSuccessSignal`**:
    *   `TL.map finalReactionOnSuccess` triggers logging when `finalAllSuccessSignal` becomes `true`. It then iterates `httpResultTimelines`, gets current data using `TL.at Now`, and logs details.

### 10.4.4 Program Execution and Asynchronous Nature

`Thread.Sleep` keeps the console app alive. Output shows interleaved HTTP and app logs, with the detailed report appearing only after all requests succeed.

## 10.5 Discussion of Reactivity

This example illustrates:

*   **Declarative Dependencies:** How timelines relate is declared (`TL.map`, `TL.all`).
*   **Automatic Updates:** Changes flow from async completion -> `TL.define` on individual result timeline -> mapped `Timeline<bool>` -> `TL.all` output -> `TL.distinctUntilChanged` output -> final logging reaction.
*   **Handling Asynchronicity:** Callback complexity is abstracted.
*   **Initial States Matter:** "Pending" state (`IsSuccess = false`) correctly initializes aggregation.

## 10.6 Benefits Illustrated by the Example

1.  **Clarity:** Logic is separated and easy to follow.
2.  **Modularity:** Reusable components (`makeAsyncHttpRequest`, `wasRequestSuccessfulPredicate`, `TL.all`).
3.  **Composability:** Complex logic from simpler reactive parts.
4.  **Robustness:** Automatic state change handling.
5.  **Testability (Implied):** Individual functions and predicates are testable.

## 10.7 Further Considerations

Production systems might add:

*   More granular error/pending state reporting.
*   Handling dynamic URL lists (likely using `TL.bind`).
*   Retry logic, timeouts, cancellation.

## 10.8 Conclusion: Orchestrating Asynchronous Logic Reactively

This case study demonstrated the "Map to Boolean, then Aggregate" pattern with `Timeline`s for managing asynchronous operations. By transforming async results into boolean condition timelines and aggregating them, we build clear, robust solutions. `TL.map`, `TL.all` (or `TL.any`), and `TL.distinctUntilChanged` work declaratively for complex, event-driven behavior. This concludes our exploration of boolean aggregation and foundational combinators in Unit 6, Section 1.