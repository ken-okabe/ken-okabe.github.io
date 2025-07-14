---
title: 'Chapter 0: Timeline.ts / Timeline.js -- FRP Implementation'
description: >-
  In the previous chapters, we explored the underlying design philosophy and
  conceptual behavior of the Timeline library, referencing its original F# code.
  F#'s strict type system and functional paradigm provided an excellent starting
  point for understanding the library's theoretical foundation.
---
### Switching Languages: From F# to TypeScript/JavaScript

In the previous chapters, we explored the underlying design philosophy and conceptual behavior of the `Timeline` library, referencing its original F# code. F#'s strict type system and functional paradigm provided an excellent starting point for understanding the library's theoretical foundation.

However, the `Timeline` library has undergone a significant evolution throughout its history.

It was ported from the original F# version to TypeScript/JavaScript, and its functionality has been significantly enhanced through practical application in interactive web browser demos and a real-world GNOME Shell extension (which is implemented in JavaScript).

Furthermore, the achievements gained from these practical applications have been **"back-ported"** to the original F# version. As a result, the libraries in both languages now have a **complete 1:1 correspondence**, from the advanced features of `DependencyCore` to the debugging system, maintaining consistency in quality and functionality.

---

### This Book's Approach: Explanations Based on the TS/JS Version

Given this background, from this section forward, this book's explanations will be based primarily on the **TypeScript/JavaScript version**. This is the most practical and effective approach for presenting concrete reference code, such as the interactive Canvas demos that run in a web browser and the GNOME Shell extension.

Although the language is changing, the API design, internal mechanisms like `DependencyCore` and `Illusion`, and the underlying philosophy of the block universe model are completely identical between the F# and TS versions. Therefore, **none of your previous learning will be wasted**.

With that, let's dive into the complete API reference for the TS/JS version of `Timeline`.

---

# Timeline Library - Complete API Reference (F\# & TypeScript)

## Core Types

##### F\#: `type Timeline<'a> = private { _id: TimelineId; mutable _last: 'a }`

##### TS: `Timeline<A>`

The main reactive container type that holds a value of type `A`.

```typescript
// TS
interface Timeline<A> {
    // Internal properties
    readonly [_id]: TimelineId;
    readonly [_last]: A;

    // Core operations
    at(now: Now): A;
    define(now: Now, value: A): void;

    // Transformations
    map<B>(f: (value: A) => B): Timeline<B>;
    bind<B>(monadf: (value: A) => Timeline<B>): Timeline<B>;

    // Utilities
    scan<State>(accumulator: (state: State, input: A) => State, initialState: State): Timeline<State>;
    link(targetTimeline: Timeline<A>): void;
    distinctUntilChanged(): Timeline<A>;
    using<B>(resourceFactory: ResourceFactory<A, B>): Timeline<B | null>;
}
```

-----

##### TS: `NullableTimeline<A>`

Extended interface for timelines that can contain `null` values, providing null-safe operations. F\# uses type constraints (`when 'a : null`) instead of a separate interface.

```typescript
// TS
interface NullableTimeline<A> extends Timeline<A | null> {
    nMap<B>(f: (value: A) => B): Timeline<B | null>;
    nBind<B>(monadf: (value: A) => Timeline<B>): Timeline<B | null>;
    nUsing<B>(resourceFactory: ResourceFactory<A, B>): Timeline<B | null>;
}
```

-----

##### F\#: `type Resource<'a> = { Resource: 'a; Cleanup: unit -> unit }`

##### TS: `Resource<A>`

Type for managed resources with automatic cleanup.

```typescript
// TS
interface Resource<A> {
    readonly resource: A;
    readonly cleanup: DisposeCallback;
}
```

-----

##### F\#: `type ResourceFactory<'a, 'b> = 'a -> Resource<'b>`

##### TS: `ResourceFactory<A, B>`

A function that creates a resource from a value.

```typescript
// TS
type ResourceFactory<A, B> = (value: A) => Resource<B> | null;
```

-----

### Special Types

```typescript
// TS
type Now = symbol;               // Conceptual time coordinate
type TimelineId = string;        // Unique identifier for timelines
type DependencyId = string;      // Unique identifier for dependencies
type IllusionId = string;        // Unique identifier for illusions
type DisposeCallback = () => void; // Cleanup function type
```

*In F\#, these are typically represented by types like `System.Guid` for IDs and `unit -> unit` for callbacks.*

-----

## Core API

### Factory Functions

##### F\#: `'a -> Timeline<'a>`

##### TS: `Timeline<A>(initialValue: A): Timeline<A>`

Creates a new timeline with an initial value. If the value is `null`, the TS version returns a `NullableTimeline`.

```typescript
// TS
const numberTimeline = Timeline(42);
const stringTimeline = Timeline("hello");
const nullableTimeline = Timeline<string | null>(null); // This is a NullableTimeline
```

-----

##### F\#: `'a -> Timeline<'a>`

##### TS: `ID<A>(initialValue: A): Timeline<A>`

Alias for `Timeline` - creates an identity timeline.

```typescript
// TS
const idTimeline = ID(100);
```

-----

#### Pre-defined Timelines

```typescript
// TS
const FalseTimeline: Timeline<boolean>; // Equivalent to Timeline(false)
const TrueTimeline: Timeline<boolean>;  // Equivalent to Timeline(true)
```

*These are available in both F\# and TS.*

-----

### Core Operations

##### F\#: `at: NowType -> Timeline<'a> -> 'a`

##### TS: `.at(Now): A`

Gets the current value of a timeline.

```typescript
// TS
const timeline = Timeline(42);
const currentValue = timeline.at(Now); // 42
```

-----

##### F\#: `define: NowType -> 'a -> Timeline<'a> -> unit`

##### TS: `.define(Now, value: A): void`

Sets a new value and triggers all dependent updates.

```typescript
// TS
const timeline = Timeline(42);
timeline.define(Now, 100);
console.log(timeline.at(Now)); // 100
```

-----

### Transformation Operations

##### F\#: `map: ('a -> 'b) -> Timeline<'a> -> Timeline<'b>`

##### TS: `.map<B>(f: (value: A) => B): Timeline<B>`

Transforms timeline values using a pure function.

```typescript
// TS
const numbers = Timeline(5);
const doubled = numbers.map(x => x * 2);
console.log(doubled.at(Now)); // 10

numbers.define(Now, 10);
console.log(doubled.at(Now)); // 20
```

-----

##### F\#: `bind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b>`

##### TS: `.bind<B>(monadf: (value: A) => Timeline<B>): Timeline<B>`

Monadic bind operation - flattens nested timelines. Also known as `flatMap`.

```typescript
// TS
const outer = Timeline(5);
const result = outer.bind(x => Timeline(x * x));
console.log(result.at(Now)); // 25

outer.define(Now, 3);
console.log(result.at(Now)); // 9
```

-----

##### F\#: `scan: ('state -> 'input -> 'state) -> 'state -> Timeline<'input> -> Timeline<'state>`

##### TS: `.scan<State>(accumulator, initialState): Timeline<State>`

Accumulates values over time (like `reduce`, but reactive).

```typescript
// TS
const inputs = Timeline(1);
const sum = inputs.scan((acc, val) => acc + val, 0);

inputs.define(Now, 5);
console.log(sum.at(Now)); // 6

inputs.define(Now, 3);
console.log(sum.at(Now)); // 9
```

-----

### Utility Operations

##### F\#: `link: Timeline<'a> -> Timeline<'a> -> unit`

##### TS: `.link(targetTimeline: Timeline<A>): void`

Creates a one-way link from the source to a target timeline.

```typescript
// TS
const source = Timeline(10);
const target = Timeline(0);
source.link(target);
console.log(target.at(Now)); // 10

source.define(Now, 20);
console.log(target.at(Now)); // 20
```

-----

##### F\#: `distinctUntilChanged: Timeline<'a> -> Timeline<'a> when 'a : equality`

##### TS: `.distinctUntilChanged(): Timeline<A>`

Filters out consecutively emitted duplicate values.

```typescript
// TS
const source = Timeline(1);
const distinct = source.distinctUntilChanged();
const watcher = distinct.map(v => { console.log(`Value changed to: ${v}`); return v; });

source.define(Now, 1); // No log
source.define(Now, 2); // Logs: "Value changed to: 2"
source.define(Now, 2); // No log
source.define(Now, 3); // Logs: "Value changed to: 3"
```

-----

### Resource Management

##### F#: `using: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b option>`

##### TS: `using<B>(resourceFactory: (value: A) => { resource: B; cleanup: () => void } | null): Timeline<B | null>`

Manages resources that require cleanup, like network requests or file handles. When the source timeline changes, the old resource's cleanup function is called automatically.

```typescript
// TS
const userId = Timeline(1);

const userDataResource = userId.using(id => {
    console.log(`Fetching data for user ${id}`);
    const abortController = new AbortController();
    const promise = fetch(`/api/users/${id}`, { signal: abortController.signal });

    // The cleanup function is crucial for preventing memory leaks
    return createResource(promise, () => {
        console.log(`Cleaning up resource for user ${id}`);
        abortController.abort();
    });
});

// Change the user ID to trigger cleanup and new resource creation
userId.define(Now, 2);
// Console will log:
// "Cleaning up resource for user 1"
// "Fetching data for user 2"
```

-----

##### F\#: `'a -> (unit -> unit) -> Resource<'a>`

##### TS: `createResource<A>(resource, cleanup): Resource<A>`

A helper function to create a resource object for use with `.using()`.

```typescript
// TS
const resource = createResource(
    "my-resource-data",
    () => console.log("Cleaning up my-resource-data")
);
```

-----

### Nullable Operations

For timelines that may contain `null` values, use these null-safe variants to avoid runtime errors. In F\#, this is handled by applying type constraints to the standard functions.

##### F\#: `nMap: ('a -> 'b) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

##### TS: `.nMap<B>(f): Timeline<B | null>`

Null-safe mapping. Only applies the function to non-null values. If the input is `null`, it propagates `null`.

```typescript
// TS
const nullableNumbers = Timeline<number | null>(5);
const doubled = nullableNumbers.nMap(x => x * 2);
console.log(doubled.at(Now)); // 10

nullableNumbers.define(Now, null);
console.log(doubled.at(Now)); // null
```

-----

##### F\#: `nBind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

##### TS: `.nBind<B>(monadf): Timeline<B | null>`

Null-safe bind operation.

```typescript
// TS
const maybeNumber = Timeline<number | null>(5);
const result = maybeNumber.nBind(x => Timeline(x.toString()));
console.log(result.at(Now)); // "5"

maybeNumber.define(Now, null);
console.log(result.at(Now)); // null
```

-----

##### F\#: `nUsing: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

##### TS: `.nUsing<B>(resourceFactory): Timeline<B | null>`

Null-safe resource management. The factory is only called for non-null values.

```typescript
// TS
const optionalUserId = Timeline<number | null>(123);
const resource = optionalUserId.nUsing(id => {
    // This part only runs if id is not null
    return createResource(`data_for_${id}`, () => {});
});

console.log(resource.at(Now)?.resource); // "data_for_123"

optionalUserId.define(Now, null);
console.log(resource.at(Now)); // null
```

-----

## Composition Functions

### Binary Operations

##### F\#: `combineLatestWith: ('a -> 'b -> 'c) -> Timeline<'a> -> Timeline<'b> -> Timeline<'c>`

##### TS: `combineLatestWith(f)(timelineA)(timelineB)`

Combines two timelines with a binary function.

```typescript
// TS
const a = Timeline(10);
const b = Timeline(20);
const sum = combineLatestWith((x: number, y: number) => x + y)(a)(b);
console.log(sum.at(Now)); // 30

a.define(Now, 5);
console.log(sum.at(Now)); // 25
```

-----

##### F\#: `nCombineLatestWith: ('a -> 'b -> 'c) -> Timeline<'a> -> Timeline<'b> -> Timeline<'c> when 'a: null and 'b: null and 'c: null`

##### TS: `nCombineLatestWith(f)(timelineA)(timelineB)`

The nullable-safe version of `combineLatestWith`. If either input timeline's value is `null`, the resulting timeline's value will also be `null`. The combining function `f` is only called when both values are non-null.

```typescript
// TS
const a = Timeline<number | null>(10);
const b = Timeline<number | null>(20);
const sum = nCombineLatestWith((x: number, y: number) => x + y)(a)(b);
console.log(sum.at(Now)); // 30

// If one timeline becomes null, the result becomes null
a.define(Now, null);
console.log(sum.at(Now)); // null
```

-----

### Aggregate Operations

##### F\#: `anyOf: list<Timeline<bool>> -> Timeline<bool>`

##### TS: `anyOf(timelines): Timeline<boolean>`

Logical OR across multiple boolean timelines. (Note the name difference: `any` in F\# vs `anyOf` in TS)

```typescript
// TS
const flags = [Timeline(true), Timeline(false), Timeline(false)];
const hasAnyTrue = anyOf(flags);
console.log(hasAnyTrue.at(Now)); // true
```

-----

##### F\#: `allOf: list<Timeline<bool>> -> Timeline<bool>`

##### TS: `allOf(timelines): Timeline<boolean>`

Logical AND across multiple boolean timelines. (Note the name difference: `all` in F\# vs `allOf` in TS)

```typescript
// TS
const flags = [Timeline(true), Timeline(true), Timeline(false)];
const allTrue = allOf(flags);
console.log(allTrue.at(Now)); // false
```

-----

##### TS: `sumOf(timelines): Timeline<number>`

Sum of multiple number timelines.

```typescript
// TS
const numbers = [Timeline(10), Timeline(20), Timeline(30)];
const total = sumOf(numbers);
console.log(total.at(Now)); // 60
```

-----

##### TS: `maxOf(timelines): Timeline<number>`

Maximum value across multiple number timelines.

```typescript
// TS
const numbers = [Timeline(10), Timeline(50), Timeline(30)];
const maximum = maxOf(numbers);
console.log(maximum.at(Now)); // 50
```

-----

##### TS: `minOf(timelines): Timeline<number>`

Minimum value across multiple number timelines.

```typescript
// TS
const numbers = [Timeline(10), Timeline(50), Timeline(30)];
const minimum = minOf(numbers);
console.log(minimum.at(Now)); // 10
```

-----

##### TS: `averageOf(timelines): Timeline<number>`

Average of multiple number timelines.

```typescript
// TS
const numbers = [Timeline(10), Timeline(20), Timeline(30)];
const avg = averageOf(numbers);
console.log(avg.at(Now)); // 20
```

-----

##### F\#: `list<Timeline<'a>> -> Timeline<list<'a>>`

##### TS: `listOf<A>(timelines): Timeline<A[]>`

Combines multiple timelines into a single timeline holding an array of their values.

```typescript
// TS
const items = [Timeline("a"), Timeline("b"), Timeline("c")];
const list = listOf(items);
console.log(list.at(Now)); // ["a", "b", "c"]
```

*Note: Nullable-safe versions of all aggregate operations are available in TS, including **`nAnyOf`**, **`nAllOf`**, **`nSumOf`**, and **`nListOf`**. These functions operate on timelines that may contain `null`. If any of the input timelines' value is `null`, the resulting timeline's value will also be `null`.*

-----

### Advanced Composition

##### F\#: `combineLatest: ('a array -> 'r) -> list<Timeline<'a>> -> Timeline<'r>`

##### TS: `combineLatest(combinerFn)(timelines)`

Generic N-ary combination function for complex logic that can't be achieved with simple folds.

```typescript
// TS
const timelines = [Timeline(10), Timeline(2), Timeline(5)] as const;
// (a + b) / c
const result = combineLatest((a, b, c) => (a + b) / c)(timelines);
console.log(result.at(Now)); // (10 + 2) / 5 = 2.4
```

-----

##### TS: `nCombineLatest(combinerFn)(timelines)`

The nullable-safe version of `combineLatest`. If any of the input timelines contains a `null` value, the output timeline will immediately become `null`. The `combinerFn` is only executed when all input timelines have non-null values.

```typescript
// TS
const timelines = [Timeline<number|null>(10), Timeline<number|null>(2), Timeline<number|null>(5)] as const;
const result = nCombineLatest((a, b, c) => (a + b) / c)(timelines);
console.log(result.at(Now)); // 2.4

// Make one input null
timelines[1].define(Now, null);
console.log(result.at(Now)); // null
```

-----

##### F\#: `foldTimelines: (Timeline<'b> -> Timeline<'a> -> Timeline<'b>) -> Timeline<'b> -> list<Timeline<'a>> -> Timeline<'b>`

##### TS: `foldTimelines(timelines, initial, accumulator)`

Generic folding operation over timelines. This is the powerful primitive that `sumOf`, `anyOf`, etc., are built upon.

```typescript
// TS
const numbers = [Timeline(1), Timeline(2), Timeline(3)];
const product = foldTimelines(
    numbers,
    Timeline(1), // Initial value timeline
    (acc, curr) => combineLatestWith((a: number, b: number) => a * b)(acc)(curr)
);
console.log(product.at(Now)); // 6
```

-----

### Helper Functions

##### F\#: `(>>>): ('a -> Timeline<'b>) -> ('b -> Timeline<'c>) -> ('a -> Timeline<'c>)`

##### TS: `pipeBind`

A helper function for chaining monadic functions (functions that take a value and return a new `Timeline`). It allows for a more declarative, readable alternative to nesting `.bind()` calls. F\# uses the `>>>` operator for this purpose.

```typescript
// TS
// Using nested .bind()
const input = Timeline(1);
const result1 = input.bind(a =>
    Timeline(a * 2).bind(b =>
        Timeline(b + 5)
    )
);
console.log(result1.at(Now)); // 7

// Using pipeBind
const double = (a: number) => Timeline(a * 2);
const addFive = (b: number) => Timeline(b + 5);

const composed = pipeBind(double)(addFive);
const result2 = composed(1); // Returns a Timeline with the value 7
console.log(result2.at(Now)); // 7
```

-----

## Error Handling

A global error handler can be set to catch and process any exceptions that occur within timeline callbacks, such as in `map` or `scan` operations. This is useful for centralized logging or custom error reporting.

##### TS: `setErrorHandler(handler: TimelineErrorHandler | null): void`

Sets or unsets the global error handler for the timeline system.

```typescript
// TS
type TimelineErrorHandler = (
    error: any,
    context: {
        dependencyId?: string;
        inputValue?: any;
        context?: string;
    }
) => void;

setErrorHandler((error, context) => {
    console.error("Timeline system error:", error, "Context:", context);
    // You could also send this error to a logging service.
});
```

-----

## Debugging Support

##### F\#: `module DebugControl`

##### TS: `Debug Control`

Enable debug mode via URL (`?debug=true`), `localStorage`, or `NODE_ENV`.

```typescript
// TS
// Persistently enable debug mode (requires page reload)
DebugControl.enable();

// Persistently disable debug mode (requires page reload)
DebugControl.disable();

// Check if debug mode is active
console.log(DebugControl.isEnabled());

// Enable debug mode for the current session
DebugControl.enableTemporary();
```

-----

### `Debug Information`

##### F\#: `Debug.getInfo: unit -> {| Scopes: ScopeDebugInfo list; ... |}`

##### TS: `DebugUtils.getInfo()`

```typescript
// TS
// Get comprehensive debug information about all illusions and dependencies
const debugInfo = DebugUtils.getInfo();
console.log(`Total illusions: ${debugInfo.totalIllusions}`);
```

-----

##### F\#: `Debug.printTree: unit -> unit`

##### TS: `DebugUtils.printTree()`

```typescript
// TS
// Print a formatted dependency tree to the console for easy inspection
DebugUtils.printTree();
/*
Outputs:
Timeline Dependency Tree
  Total Illusions: 3
  Total Dependencies: 5
  Illusion: a1b2c3d4...
    Created: 2024-01-01T12:00:00.000Z
    Dependencies: 2
    ...
*/
```

-----

##### F\#: `Debug.findAllCycles: unit -> TimelineId list list`

##### TS: `DebugUtils.findAllCycles()`

```typescript
// TS
// Detect and list any circular dependencies in the graph
const cycles = DebugUtils.findAllCycles();
if (cycles.length > 0) {
    console.log('Found circular dependencies:', cycles);
}
/*
Outputs (if a cycle exists):
Found circular dependencies: [
  [ "timelineId-A", "timelineId-B", "timelineId-C" ]
]
*/
```

-----

### Supplement: Detailed Debug Mode Activation

In addition to manual toggling with `DebugControl`, the library automatically enables debug mode by evaluating the following conditions in order:

1.  **URL Parameter**: If the URL contains `?debug=true`.

2.  **localStorage**: If `localStorage` has a key-value pair of `"timeline-debug": "true"`.

3.  **Build Environment**: If a global `__DEV__` variable is set to `true` by a build tool like Webpack.

4.  **Development Hostname**: If the site is accessed from `localhost`, `127.0.0.1`, or a hostname starting with `192.168.`.

5.  **Node.js Environment**: If `process.env.NODE_ENV` is set to `'development'`.
