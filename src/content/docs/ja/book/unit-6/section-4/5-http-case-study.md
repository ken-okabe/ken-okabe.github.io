---
title: 'Chapter 5: Case Study: Aggregating Asynchronous HTTP Request Outcomes'
description: >-
  This chapter provides a comprehensive, practical case study that applies the
  "Map to Boolean, then Aggregate" pattern to a common real-world scenario:
  managing and evaluating the collective success of multiple asynchronous HTTP
  requests.
---
This chapter provides a comprehensive, practical case study that applies the "Map to Boolean, then Aggregate" pattern to a common real-world scenario: managing and evaluating the collective success of multiple asynchronous HTTP requests.

We will walk through a complete F# example, step-by-step, to illustrate how `Timeline`s, asynchronous operations, and our combinators (`TL.map`, `TL.all`, `TL.distinctUntilChanged`) work together to create a reactive system that monitors and responds to the outcomes of these requests.

## The Scenario

Our goal is to fetch data from several web URLs simultaneously. Our system must:

1.  Initiate all requests concurrently.
2.  Track the individual outcome of each request.
3.  Derive a single `Timeline<bool>` that becomes `true` only when *all* requests have completed successfully.
4.  React to this final signal by logging the detailed results.

## Code Walkthrough

```fsharp
open System.Net.Http

// Helper type to store response info
type HttpResponseInfo = { IsSuccess: bool; Url: string; StatusCode: int option }

// Function to perform a single async request
let makeAsyncHttpRequest (url: string) : Timeline<HttpResponseInfo> =
    let resultTimeline = Timeline { IsSuccess = false; Url = url; StatusCode = None }
    async {
        try
            // In a real app, use an HttpClient instance to get the response
            // For this example, we'll simulate a result
            let simulatedStatusCode = if url.Contains("fail") then 404 else 200
            let responseInfo = {
                IsSuccess = simulatedStatusCode >= 200 && simulatedStatusCode < 300;
                Url = url;
                StatusCode = Some simulatedStatusCode
            }
            // The async block defines the result onto the timeline upon completion
            resultTimeline |> TL.define Now responseInfo
        with ex ->
            // Handle exceptions
            let errorInfo = { IsSuccess = false; Url = url; StatusCode = None }
            resultTimeline |> TL.define Now errorInfo
    } |> Async.StartImmediate
    resultTimeline

// --- Main Logic ---

// 1. Define URLs and initiate all requests
let urlsToFetch = [ "https://api.example.com/data/1"; "https://api.example.com/data/2" ]
let httpResultTimelines = List.map makeAsyncHttpRequest urlsToFetch

// 2. Apply the "Map to Boolean" pattern
let wasRequestSuccessful (info: HttpResponseInfo) = info.IsSuccess
let successStatusTimelines =
    List.map (fun resultTl -> TL.map wasRequestSuccessful resultTl) httpResultTimelines

// 3. Aggregate the boolean timelines and optimize the signal
let allRequestsSucceeded =
    (TL.all successStatusTimelines)
    |> TL.distinctUntilChanged

// 4. React to the final aggregated signal
let finalReaction (allSucceeded: bool) =
    if allSucceeded then
        printfn "SUCCESS: All HTTP requests completed successfully!"
        // Here, we could gather the results from httpResultTimelines and process them
    else
        // This part might run initially when some requests are still pending
        printfn "STATUS: Not all requests have succeeded yet..."

allRequestsSucceeded |> TL.map finalReaction |> ignore
```

## Discussion

This case study perfectly illustrates the power of our reactive toolkit:

* **Declarative Logic:** We declare the *relationship* between data sources (`map`, `all`) rather than writing imperative callbacks.
* **Asynchronicity Handled:** The complexity of waiting for multiple asynchronous operations to complete is handled automatically by the reactive graph.
* **Composability:** We built a complex workflow by composing small, understandable, and reusable functions (`makeAsyncHttpRequest`, `wasRequestSuccessful`, `TL.map`, `TL.all`, `TL.distinctUntilChanged`).

This concludes our exploration of the fundamental combinators for combining independent timelines. With these tools and patterns, you are now equipped to construct a wide range of sophisticated and robust reactive systems.
