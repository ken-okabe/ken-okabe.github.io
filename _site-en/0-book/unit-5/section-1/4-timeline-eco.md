# Chapter 4: Handling I/O: Extending the Block Universe Model

**Introduction: Theoretical Consistency for Interactions**

The previous chapters established the `Timeline<'a>` type, grounded in the Block Universe model (Chapter 0 and 2), and introduced fundamental operations like `TL.at`, `TL.define` (Chapter 2), and crucially, `TL.map` (Chapter 3). We saw how `TL.map` allows us to create new timelines derived from existing ones and how these operations build a conceptual **Dependency Graph**.

This chapter extends the Block Universe philosophy to another area often considered problematic in pure functional programming: Input/Output (I/O). Operations like reading user input, writing to files, or printing to the console inherently involve interaction with an external world.

Just as the internal state changes (`_last`) of `Timeline<'a>` were reframed as simulating observation within the Block Universe, I/O operations can also be integrated consistently. When viewed within the Block Universe, the side effects of I/O are simply part of the description of the universe's immutable state transitioning between different time coordinates. Therefore, to maintain theoretical consistency, all I/O interactions should also be brought *within* the `Timeline` framework. Wrapping I/O actions using `Timeline` objects and operations like `TL.map` allows us to manage them declaratively within the same dependency graph, ensuring the integrity of our "mini Block Universe" simulation even when interacting with the external world.

## 4.1 I/O Functions: The Standard View vs. Block Universe Perspective

Consider standard I/O functions like `printfn` (F#) or `console.log` (JavaScript). Conventional functional programming identifies these as fundamentally **impure** due to their **side effects**. They modify the state of an external entity (the console display) and don't typically return meaningful values based solely on their inputs.

However, let's re-examine this through the lens of the **Block Universe model**. In this view, *everything* is part of the immutable block. The state of the console display *before* a `printfn` call (at time `t1`) and the state *after* the call (at time `t2`) are simply two different, fixed states within the overall Block Universe. The `printfn` function itself simply describes the relationship or transition rule between these two immutable states.

The challenge isn't that I/O is fundamentally incompatible with an immutable universe, but rather how to **represent and manage** these state transitions within our `Timeline`-based programming model. The core principle is straightforward: **all I/O operations must also be managed by `Timeline`**.

## 4.2 Wrapping Output Actions: The "Hello, World!" of `Timeline` I/O

The most fundamental example is standard output. By using the `TL.map` function introduced in the previous chapter (Chapter 3), we can easily wrap an I/O action like F#'s `printfn`. This involves creating a `Timeline` whose updates trigger the desired I/O side effect.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg" alt="Note Header">

For convenience in the following examples, we'll use a simple helper function `log` that wraps `printfn` to handle generic types. (Assuming `isNull` is a globally available helper as discussed in Unit 6, Chapter 0).

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
// Helper function for generic logging
// Adhering to F# style guide for function definition
let log<'a> : 'a -> unit =
    fun a -> printfn "%A" a
```

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg" alt="Note Footer">

Now, let's wrap this `log` action using `Timeline` and `TL.map`.

**Example 1: Integer Logging Timeline**

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
// Assume Timeline factory, Now value, and TL module functions (TL.map, TL.define) are accessible
// No 'open Timeline' or 'open Timeline.TL'

// Create a Timeline initialized with an integer value
let logIntTimeline : Timeline<int> = Timeline 5 // Explicit type

// Connect the log function to the timeline using TL.map.
// TL.map returns a new timeline, but here we only care about the side effect.
// The dependency (logIntTimeline -> reaction) is established internally.
logIntTimeline
|> TL.map log // Apply the 'log' function whenever the timeline updates; Explicit TL.map
|> ignore   // We ignore the resulting timeline (often Timeline<unit>)

// Output: 5 (printed immediately upon map application due to initial value)
```

In this first example, `logIntTimeline` is created with an initial value of `5`. The `TL.map log` operation  immediately applies the `log` function to this initial value, causing `5` to be printed. Furthermore, a dependency is created: whenever `logIntTimeline` is updated via `TL.define`, the `log` function will be called again with the new value.

**Example 2: String Logging Timeline (with Null Handling)**

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
// Assume 'isNull' is a globally available helper as established in Unit 6, Chapter 0.

// Create a Timeline for strings, initialized with null
let logStringTimeline : Timeline<string> = Timeline null // Explicit type

// Connect the log function, adding logic to handle null
let logNonNullString : string -> unit = // Define the function passed to map
    fun value ->
        if not (isNull value) then // Adhering to if/then/else style
            log value // Log only if the value is not null
        else
            () // Explicitly do nothing if null, or just omit else for implicit unit
        // No else branch explicitly needed if we only act on non-null;
        // 'if condition then expr' implicitly returns unit if condition is false.
        // For clarity, we can keep the empty 'else ()'.

logStringTimeline
|> TL.map logNonNullString // Explicit TL.map
|> ignore // Setup the reaction, ignore the resulting Timeline<unit>

// Output: (nothing printed initially because the value is null)
```

Here, `logStringTimeline` starts with `null`. The `TL.map` operation sets up a reaction that only calls `log` if the incoming value is not `null`. We can trigger the log later using `TL.define`:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
// Later, define a new value onto the timeline
logStringTimeline |> TL.define Now "Hello" // Explicit TL.define
// Output: Hello (printed when define is called)

logStringTimeline |> TL.define Now "Timeline I/O!"
// Output: Timeline I/O! (printed when define is called)

logStringTimeline |> TL.define Now null // Define null again
// Output: (nothing printed)
```

These examples constitute the "Hello, World!" for using `Timeline` to manage I/O. They demonstrate the fundamental pattern: **wrap the I/O action within a function and use `TL.map` to apply that function whenever a source `Timeline` updates. Trigger the action by updating the source `Timeline` using `TL.define`**.

*(Why No Built-in `log` Timeline? User Choice!)*
You might wonder why a standard `logTimeline` isn't included directly in the `Timeline` library. The reason lies in flexibility. Users might need different logging formats, destinations, or null-handling logic. Providing the core tools (`Timeline` factory, `TL.map`, `TL.define`) allows users to easily implement the exact I/O behavior they need by passing the appropriate function to `TL.map`.

## 4.3 Linking Timelines to Monitor for Debugging

Once you've created a useful I/O timeline like `logStringTimeline`, it becomes a powerful tool for debugging. The `TL.link` function provides a convenient way to connect two timelines.

The `TL.link` function simply propagates updates from a source timeline (`timelineA`) to a target timeline (`timelineB`). Internally, as per `Timeline.fs`, it registers a direct dependency and performs an initial sync.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg" alt="Note Header">

`TL.link` sets up a dependency so that any value defined on `timelineA` is subsequently defined on `timelineB`. It also typically propagates the initial value immediately.

```fsharp
// Signature (from Timeline.fs, TL module):
// val link<'a> : Timeline<'a> -> Timeline<'a> -> unit
```

*(Note: The original text mentioned "Internally, it likely uses TL.map". While `link` could be conceptually built with `map`, the provided `Timeline.fs` shows a direct implementation using `DependencyCore.registerDependency` and an initial `TL.define` for sync. The text here is adjusted to reflect a more general statement about its effect, not presuming its exact internal implementation in this explanatory chapter unless crucial.)*

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg" alt="Note Footer">

Consider a scenario where you have an arbitrary timeline in your application, `timelineA`, and you want to monitor its value changes using `logStringTimeline`:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
// An arbitrary timeline in your application (ensure type matches target)
let timelineA : Timeline<string> = Timeline null // Start with null; explicit type

// Assume logStringTimeline is already set up as before (prints non-null strings)
// let logStringTimeline : Timeline<string> = ...

// Simply link timelineA to your logging timeline!
timelineA |> TL.link logStringTimeline // Explicit TL.link
// Output: (nothing printed initially as timelineA is null and logStringTimeline's map handles null)
```

With this single line, any update to `timelineA` will now be automatically propagated to `logStringTimeline`, which in turn will print the value (if not `null`, based on `logStringTimeline`'s setup).

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
// Now, whenever timelineA is updated...
timelineA |> TL.define Now "linked"
// Output: linked (propagated to logStringTimeline and printed)

timelineA |> TL.define Now "message!"
// Output: message! (propagated and printed)

timelineA |> TL.define Now null
// Output: (nothing printed)
```

Since all dynamic values in this system can be represented by `Timeline`s, `TL.link` provides a simple yet powerful way to observe the state of any part of your application by connecting it to a pre-configured logging or display `Timeline`.

## 4.4 Handling Asynchronous Input: HTTP Request Example

The previous examples showed how to send data *to* an I/O timeline (output). However, I/O often involves receiving data *from* the external world, such as the response to an HTTP request (input). We can handle this by using `TL.map` to trigger the asynchronous operation and `TL.define` within the async workflow to feed the result back into a `Timeline`.

Let's sketch a simple example for making an HTTP GET request.

**1. Define Timelines for Request and Response:**

We need one timeline to trigger the request (e.g., by defining the URL) and another to receive the response content.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
open System.Net.Http // Required for HttpClient

// Timeline to trigger the request with a URL
let httpRequestUrlTimeline : Timeline<string> = Timeline null // Explicit type

// Timeline to receive the response content (or error message)
let httpResponseTimeline : Timeline<string> = Timeline null // Explicit type
```

**2. Set up the I/O Handler (Async Request):**

This uses `TL.map` on the *request* timeline. When a non-null URL is defined, the function passed to `TL.map` triggers an asynchronous HTTP GET request. When the request completes (successfully or with an error), it calls `TL.define` on the *response* timeline.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
// Use a single HttpClient instance for efficiency (simplified example)
let httpClient : HttpClient = new HttpClient() // Explicit type

// Define the function that will be passed to TL.map
let httpRequestFn : string -> unit = // Explicit function type
    fun url ->
        if not (isNull url) then // Using global isNull
            // Asynchronously perform the HTTP GET request
            async {
                try
                    // Perform the async operations
                    let! response = httpClient.GetAsync(url) |> Async.AwaitTask
                    response.EnsureSuccessStatusCode() |> ignore // Throw exception on HTTP error
                    let! content = response.Content.ReadAsStringAsync() |> Async.AwaitTask

                    // Define the successful response content onto the response timeline
                    httpResponseTimeline |> TL.define Now content // Explicit TL.define

                with ex ->
                    // Define an error message onto the response timeline
                    let errorMsg : string = sprintf "HTTP Request Failed: %s - %s" url ex.Message // Explicit type
                    httpResponseTimeline |> TL.define Now errorMsg // Explicit TL.define
            }
            |> Async.StartImmediate // Start the async workflow without waiting
        else
            () // Do nothing if URL is null

// Set up the reaction on the request timeline using map
httpRequestUrlTimeline
|> TL.map httpRequestFn // Explicit TL.map
|> ignore // Ignore the Timeline<unit> result of map (since httpRequestFn returns unit)
```

**3. Connect the Response Timeline (e.g., to Logging):**

Now, we can react to the results arriving on `httpResponseTimeline` just like any other timeline, for example, by linking it to our logger (assuming `logStringTimeline` is set up).

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
// Assume logStringTimeline is set up as before
// let logStringTimeline : Timeline<string> = ...

// Link the response timeline to the logging timeline
// httpResponseTimeline |> TL.link logStringTimeline // Example, assuming logStringTimeline is defined
```

*(Example link commented out as `logStringTimeline` setup is assumed from prior examples, not redefined here).*

**4. Trigger the Request:**

Defining a URL onto `httpRequestUrlTimeline` starts the process.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg" alt="F# Logo">

```fsharp
// Trigger the HTTP request by defining a URL
httpRequestUrlTimeline |> TL.define Now "https://www.google.com"

// Console Output (from logStringTimeline, after request completes, example):
// Hello (if logStringTimeline was linked and google.com returned "Hello")
// or:
// HTTP Request Failed: https://www.google.com - <error details>
```

*(The console output example here is more generic, as the actual output depends on what `logStringTimeline` is linked to and how it processes the data from `httpResponseTimeline`.)*

In this pattern:

1.  Defining a value on `httpRequestUrlTimeline` triggers the function inside `TL.map`.
2.  This function starts an asynchronous I/O operation.
3.  When the operation completes, its result (or error) is fed back into the reactive system by calling `TL.define` on `httpResponseTimeline`.
4.  Other parts of the system (like a logger connected via `TL.link`) react declaratively to updates on `httpResponseTimeline`.

## 4.5 Benefits: System-Wide Consistency

By wrapping I/O side effects (both output and input) within `Timeline`s and using standard operations like `TL.map`, `TL.define`, and `TL.link` to manage them, I/O becomes a well-behaved participant in the FRP dependency graph introduced earlier (Chapter 3).

This approach ensures that:

1.  **Consistency:** All dynamic values and actions, including interactions with the outside world, are managed through the same `Timeline` propagation mechanism.
2.  **Declarative Control:** Dependencies and reactions (including I/O triggers and responses) are defined declaratively using functions like `TL.map` and `TL.link`, making the system flow easier to reason about.
3.  **Model Integrity:** The "mini Block Universe" simulation remains internally consistent. External interactions don't happen as unmanaged side effects but are channeled through `Timeline`s, respecting the dependency graph.

This practice of representing I/O via `Timeline`s is fundamental to building robust, large-scale applications using this FRP philosophy, ensuring the entire system adheres to the principles derived from the Block Universe model.