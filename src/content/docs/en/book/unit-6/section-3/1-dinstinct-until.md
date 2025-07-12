---
title: distinctUntilChanged — Noise Reduction
description: >-
  distinctUntilChanged is an application of a "stateful timeline" similar to
  scan, but its purpose is different. It is an extremely important optimization
  primitive for preventing unnecessary updates.
---
`distinctUntilChanged` is an application of a "stateful timeline" similar to `scan`, but its purpose is different. It is an extremely important optimization primitive for preventing unnecessary updates.

## Why Eliminate Duplicates?

In a reactive system, it is common for the same value to flow into a timeline consecutively. For example, when a user moves the mouse slightly but the coordinates do not change, or when the same character is typed consecutively in a text input.

If the system reacts to all of these events by re-rendering the UI or performing heavy computational processing, it can cause serious performance problems. The value has not substantially "changed," yet the update process runs repeatedly.

`distinctUntilChanged` is a filter for removing this "noise." It internally remembers the previous value and only propagates the new value to subsequent operations if it is different from the previous one—that is, only when there is a **truly meaningful change**.

-----

## API Definition

##### F\#: `distinctUntilChanged: Timeline<'a> -> Timeline<'a> when 'a : equality`

*Note: In F\#, `distinctUntilChanged` is a standalone function that requires the type to support equality comparison.*

##### TS: `.distinctUntilChanged(): Timeline<T>`

-----

## Code Example in TypeScript

Let's consider a scenario where a user moves the mouse. By using `distinctUntilChanged`, we can update the UI only when the mouse coordinates actually change.

```typescript
const mousePosition = Timeline({ x: 0, y: 0 });

// Compares with the last value and only passes the value if it has changed
const significantMoves = mousePosition.distinctUntilChanged();

// Callback to monitor updates
significantMoves.map(pos => {
  console.log(`Updating UI: x=${pos.x}, y=${pos.y}`);
});

// "Updating UI: x=10, y=20" is output
mousePosition.define(Now, { x: 10, y: 20 });

// Since the value is the same, the callback is not executed (UI re-rendering is prevented)
mousePosition.define(Now, { x: 10, y: 20 });
mousePosition.define(Now, { x: 10, y: 20 });

// "Updating UI: x=15, y=25" is output
mousePosition.define(Now, { x: 15, y: 25 });
```

In this example, even though `mousePosition` is updated three times, the callback within the `map` that depends on `significantMoves` is only executed twice—when the value actually changes.

-----

## Canvas Demo (Placeholder)

A demo that visually compares how, even if the same value flows consecutively into the input timeline, the timeline after passing through `distinctUntilChanged` is updated only once.
