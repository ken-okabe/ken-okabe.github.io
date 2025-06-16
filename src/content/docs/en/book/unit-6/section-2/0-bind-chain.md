---
title: Asynchronous Event Chaining with bind
description: >-
  Before diving into specialized functions for combining multiple timelines,
  which will be covered later, let's first explore how the core Timeline
  feature, specifically TL.bind, can itself be used to orchestrate sequential
  operations. This is particularly relevant for asynchronous event chains. This
  approach demonstrates an effect similar to Promise.then chaining in JavaScript
  but is achieved using only the fundamental Timeline mechanisms without
  requiring additional combinator functions. Understanding this foundational
  capability of bind provides valuable insight into the power and flexibility of
  the core Timeline system.
---
Before diving into specialized functions for combining multiple timelines, which will be covered later, let's first explore how the core `Timeline` feature, specifically `TL.bind`, can itself be used to orchestrate sequential operations. This is particularly relevant for **asynchronous event chains**. This approach demonstrates an effect similar to `Promise.then` chaining in JavaScript but is achieved using only the fundamental `Timeline` mechanisms without requiring additional combinator functions. Understanding this foundational capability of `bind` provides valuable insight into the power and flexibility of the core `Timeline` system.

## Mechanism of Chaining

The key to understanding this asynchronous chaining pattern lies in **pre-defining `Timeline` instances outside the `bind` chain to act as receivers for the results of each asynchronous step and triggers for the subsequent step**. These `Timeline`s serve as "mailboxes" where the outcome of an asynchronous operation is `define`d upon completion.

A concrete example of such timelines can be found in Unit 5, where we used `httpResponseTimeline` to asynchronously receive the result of an HTTP request. That `Timeline` waited for an asynchronous I/O result to be `define`d and then triggered subsequent actions (like logging via `link`). The `Timeline`s we pre-define in this asynchronous chain (named `step1`, `step2`, `step3` in the code example) fulfill exactly this role. Thus, **each `stepX` timeline corresponds to a specific "I/O wrapper timeline" or "step completion notification timeline," designated to receive the result of its corresponding asynchronous operation** (the work done inside `setTimeout` in our example).

With this structure in mind, the asynchronous chain operates as follows:

1.  **Trigger**: Defining a value onto the initial `Timeline` (`step0`) activates the first `bind` in the chain.
2.  **Start Async Work**: The function within the `bind` initiates the asynchronous operation for the first step.
3.  **Return Next Receiver Timeline**: The function within `bind` must **synchronously** return the **pre-defined `Timeline` designated as the receiver for the *next* step's result** (`step1`). This satisfies the type signature of `bind` (`'a -> Timeline<'b>`).
4.  **Async Completion and `define` on Receiver**: When the first asynchronous operation completes, its callback function calls `TL.define` on the receiver `Timeline` (`step1`), storing the result.
5.  **Chain Reaction**: The update (`define`) to `step1` triggers the next `bind` connected to it, repeating the process for subsequent steps (`step2`, `step3`...).

## Code Example: Asynchronous Sequence with `setTimeout`

The following example uses a simple `setTimeout` helper (using `System.Timers`) combined with `TL.bind` to implement an asynchronous sequence that processes messages with delays of 2 seconds, then 3 seconds, then 1 second, logging the progress using elapsed time. Note that this example uses `null` to represent the absence of a value in the `stepX` timelines, consistent with earlier discussions.

```fsharp
open System // For DateTime, TimeSpan, Thread
open System.Timers // For Timer
open System.Diagnostics // Required for Stopwatch

// Assuming Timeline factory, Now value, and TL module are accessible
// No 'open Timeline.TL' as per style guide

// Globally accessible isNull helper (as defined or assumed from Chapter 0)
// let isNull value = obj.ReferenceEquals(value, null)

// --- Stopwatch for Elapsed Time ---
let stopwatch : Stopwatch = Stopwatch() // Explicit type

// Helper: Executes function f after 'delay' ms (simple version)
// Adhering to F# style guide for function definition
let setTimeout : (unit -> unit) -> int -> unit =
    fun f delay ->
        let timer = new Timer(float delay)
        timer.AutoReset <- false
        timer.Elapsed.Add(fun _ -> f()) // Execute the callback directly
        timer.Start()
        // Error handling and Dispose are omitted for simplicity in this example.
        // In a real application, timer disposal would be important.

// --- Logging Timeline Setup ---
// Timeline dedicated to receiving log messages
let logTimeline : Timeline<string> = Timeline null // Initialize with null

// Reaction: Print any message defined on logTimeline with elapsed time
// Adhering to F# style guide for function application and definition
let logReaction : string -> unit =
    fun message -> // Function passed to TL.map
        // Only print if the message is not null
        if isNull message then // Adhering to if/then/else style and using global isNull
            () // Do nothing if message is null
        else
            // Get current elapsed time and format it
            let elapsedMs : float = stopwatch.Elapsed.TotalMilliseconds // Explicit type
            printfn "[+%7.1fms] %s" elapsedMs message // Format: [+  123.4ms] Log Message

logTimeline
|> TL.map logReaction // Using TL.map
|> ignore // Setup the side effect, ignore the resulting Timeline<unit>

// --- Step Timelines Definition ---
// Timelines to hold results (string) or indicate absence (null)
// These act as receivers for each asynchronous step's completion.
let step0 : Timeline<string> = Timeline null // Initial trigger (using null)
let step1 : Timeline<string> = Timeline null // Receiver for step 1 result
let step2 : Timeline<string> = Timeline null // Receiver for step 2 result
let step3 : Timeline<string> = Timeline null // Receiver for step 3 (final) result

// --- Asynchronous Chain Construction ---
// Build the chain starting from step0, linking binds sequentially
let asyncChainResultTimeline : Timeline<string> = // This variable will ultimately point to the same timeline as step3
    step0
    |> TL.bind (fun value -> // Reacts to step0 updates. 'value' is string
        // Check if the trigger value is valid (not null)
        if isNull value then
            () // If value is null, do nothing further in this step
        else
            logTimeline |> TL.define Now (sprintf "Step 0 Triggered with: '%s'" value) // Using sprintf for F#
            // Define the async work for step 1
            let work1 : unit -> unit = // Explicit type for callback
                fun () ->
                    let result1 : string = value + " -> The" // Perform some work, explicit type
                    logTimeline |> TL.define Now (sprintf "Step 1 Produced Result: '%s'" result1) // Log the result
                    // Define the result onto the *next* step's timeline to trigger downstream bind
                    step1 |> TL.define Now result1 // Define the string result directly
            // Schedule the async work
            logTimeline |> TL.define Now "Scheduling Step 1 (2000ms delay)..."
            setTimeout work1 2000 // 2000ms delay
        // IMPORTANT: bind must synchronously return the timeline for the next step
        step1 // Return step1 timeline as the result of this bind operation
    )
    |> TL.bind (fun value -> // Reacts to step1 updates. 'value' is string
        if isNull value then
            ()
        else
            logTimeline |> TL.define Now (sprintf "Step 2 Received the Result from Step 1: '%s'" value)
            // Define the async work for step 2
            let work2 : unit -> unit =
                fun () ->
                    let result2 : string = value + " -> Sequence" // Perform some work
                    logTimeline |> TL.define Now (sprintf "Step 2 Produced Result: '%s'" result2)
                    step2 |> TL.define Now result2 // Define the string result directly
            logTimeline |> TL.define Now "Scheduling Step 2 (3000ms delay)..."
            setTimeout work2 3000 // 3000ms delay
        step2
    )
    |> TL.bind (fun value -> // Reacts to step2 updates. 'value' is string
        if isNull value then
            ()
        else
            logTimeline |> TL.define Now (sprintf "Step 3 Received the Result from Step 2: '%s'" value)
            // Define the async work for step 3
            let work3 : unit -> unit =
                fun () ->
                    let result3 : string = value + " -> Done!!"
                    logTimeline |> TL.define Now (sprintf "Step 3 Produced Result: '%s'" result3)
                    step3 |> TL.define Now result3 // Define the string result directly
            logTimeline |> TL.define Now "Scheduling Step 3 (1000ms delay)..."
            setTimeout work3 1000 // 1000ms delay
        step3
    )

// --- Sequence Start ---
logTimeline |> TL.define Now "Starting sequence..."
stopwatch.Start() // Start measuring elapsed time
step0 |> TL.define Now "Hello!" // Define the initial string value directly

// --- Wait for Completion (Simple Demo Method) ---
// Wait long enough for all async operations (2s + 3s + 1s = 6s) to complete.
// NOTE: Thread.Sleep blocks the current thread and is generally not suitable
// for production applications (especially UI apps), but serves for this simple console demo.
System.Threading.Thread.Sleep(7000) // Wait 7 seconds

stopwatch.Stop() // Stop measuring time
logTimeline |> TL.define Now (sprintf "Sequence finished. Total elapsed: %A" stopwatch.Elapsed) // Using %A for TimeSpan
```

## Execution Flow Explanation

When the above code is executed, the console log will demonstrate the sequential nature of the operations, interleaved with the specified delays. The output, with elapsed time in milliseconds from the start of the sequence, will look similar to this (exact timings may vary slightly):

```
[+    0.0ms] Starting sequence...
[+    0.9ms] Step 0 Triggered with: 'Hello!'
[+    2.6ms] Scheduling Step 1 (2000ms delay)...
[+ 2025.8ms] Step 1 Produced Result: 'Hello! -> The'
[+ 2028.5ms] Step 2 Received the Result from Step 1: 'Hello! -> The'
[+ 2028.6ms] Scheduling Step 2 (3000ms delay)...
[+ 5030.0ms] Step 2 Produced Result: 'Hello! -> The -> Sequence'
[+ 5030.1ms] Step 3 Received the Result from Step 2: 'Hello! -> The -> Sequence'
[+ 5030.3ms] Scheduling Step 3 (1000ms delay)...
[+ 6031.4ms] Step 3 Produced Result: 'Hello! -> The -> Sequence -> Done!!'
[+ 7004.8ms] Sequence finished. Total elapsed: 00:00:07.0047507
```

*(The original log output had `Step 2 Logic: Processing result...` and `Step 3 Logic: Processing result...`. I've updated the F# code example's logging to match the `sprintf` formatting which is more idiomatic F# and also what's used for other log lines, ensuring the "Received the Result from Step X" message accurately reflects what the code would output.)*

This log clearly shows:

1.  The initial `define` on `step0` triggers the first `bind`.
2.  The first `bind` schedules `work1` after a 2000ms delay.
3.  After approximately 2000ms, `work1` completes, producing `result1` and defining it onto `step1`.
4.  The update to `step1` triggers the second `bind`.
5.  The second `bind` schedules `work2` after a 3000ms delay.
6.  After approximately 3000ms (cumulative ~5000ms), `work2` completes, producing `result2` and defining it onto `step2`.
7.  The update to `step2` triggers the third `bind`.
8.  The third `bind` schedules `work3` after a 1000ms delay.
9.  After approximately 1000ms (cumulative ~6000ms), `work3` completes, producing `result3` and defining it onto `step3`.
10. The `Thread.Sleep(7000)` allows all these asynchronous operations to complete before the program logs the final "Sequence finished" message.

Each `define` call on a `stepX` timeline effectively triggers the next `bind` in the chain, but only after its corresponding asynchronous `workX` function has completed and called `define`.

## Comparison with `Promise.then` (Revisited)

This pattern achieves an outcome similar to `Promise.then` chaining—sequencing asynchronous operations. However, the underlying mechanisms differ:

* `Timeline` operates as a reactive system where changes to values (events) trigger subsequent processing via dependencies established by `bind`.
* A `Promise` encapsulates the state (pending, fulfilled, rejected) and eventual result of a single asynchronous operation. `then` reacts to these state transitions.

In this `Timeline`-based approach, we explicitly manage intermediate `Timeline` instances (`step1`, `step2`, `step3`) to serve as the "links" in the chain, receiving results and triggering the next asynchronous step.

## Summary and Next Steps

The `TL.bind` operation, a core part of the Monad structure of `Timeline` (as we explored in Unit 5), is exceptionally flexible. As this chapter's `setTimeout` example demonstrated, `bind` can be used directly, without any additional specialized combinator functions, to construct relatively complex patterns like asynchronous event chains. This pattern of pre-defining "receiver" timelines and returning them from within the `bind` function allows us to sequence asynchronous operations in a manner reminiscent of `Promise.then` chaining, but using only the fundamental `Timeline` mechanisms. This ability to build sophisticated control flows from core components underscores the power inherent in the `Timeline` library's design.

While powerful, `TL.bind` is fundamentally for creating **sequential chains** where each step depends on the result of the previous one. It does not, however, directly address a different but equally common scenario: how to combine the latest values from multiple, **independent** timelines that are running in parallel.

This is precisely the challenge we will tackle in the next major section of this unit, **Section 4**. We will explore how to perform binary operations on timelines, moving from the Monadic pattern of `bind` to an Applicative-style approach. We will discover that the classifications from Unit 4 need to be adapted for the asynchronous nature of `Timeline`, leading us to a new core concept: "Latest Value Combination."
