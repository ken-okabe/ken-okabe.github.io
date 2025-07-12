---
title: >-
  Chapter 6: Comprehensive Guide to map/bind/using: A Complete Guide to API
  Selection
description: >-
  This chapter aims to provide concrete and rigorous criteria for developers
  using timeline.js to select among the three main transformation APIs—map,
  bind, and using—without any confusion or rework.
---
This chapter aims to provide **concrete and rigorous criteria** for developers using `timeline.js` to select among the three main transformation APIs—`map`, `bind`, and `using`—without any confusion or rework.

To answer specific questions developers face, such as "Should `bind` and `using` be used as a pair?" and "How is it different from `map`?", we will move beyond a superficial explanation of "differences in roles." Instead, we will unravel their mechanisms and **TypeScript type signatures** to define which API is the sole solution for a given problem situation.

## 1. Two Types of Objects

To correctly understand resource management in this library, you must first recognize that **we (the Timeline library) handle two types of objects**:

-   **`Timeline` Object**: A JavaScript object managed by the `timeline.js` library, which has a reactive value and dependencies. It is created by `Timeline(initialValue)`.
    
-   **External Resource**: Any object that is outside the management of `timeline.js`. This includes `DOM` elements, `GLib` timers, network connections, etc. These continue to occupy resources unless explicitly created and destroyed.

The two differ fundamentally in their creation methods and lifecycle management. Understanding this difference is the key to understanding the roles of `map`/`bind`/`using`.

## 2. Understanding the Essence Through Conceptual Code

The actual `timeline.js` library is complex due to its resource management features in `DependencyCore`, but at its core, the reactive value update mechanism is equivalent to the following minimal code.

### Conceptual Implementation (with Types)

```js
// map: Transformation from Timeline<A> to Timeline<B>
// Argument function type: (value: A) => B
const map = <A, B>(
    f: (value: A) => B,
    timelineA: Timeline<A>
): Timeline<B> => {
    const timelineB = Timeline(f(timelineA.at(Now)));
    const newFn = (valueA: A) => {
        timelineB.define(Now, f(valueA));
    };
    // Simplified dependency registration
    timelineA._fns.push(newFn);
    return timelineB;
};
```

```js
// bind: Transformation from Timeline<A> to Timeline<B>
// Argument function type: (value: A) => Timeline<B>
const bind = <A, B>(
    monadicFn: (value: A) => Timeline<B>,
    timelineA: Timeline<A>
): Timeline<B> => {
    const initialInnerTimeline = monadicFn(timelineA.at(Now));
    const timelineB = Timeline(initialInnerTimeline.at(Now));
    const newFn = (valueA: A) => {
        // In reality, the resources of the old innerTimeline are disposed of here
        const newInnerTimeline = monadicFn(valueA);
        timelineB.define(Now, newInnerTimeline.at(Now));
    };
    timelineA._fns.push(newFn);
    return timelineB;
};
```

```js
// using: Transformation from Timeline<A> to Timeline<B | null>
// Argument function type: (value: A) => Resource<B> | null
const using = <A, B>(
    resourceFactory: (value: A) => Resource<B> | null,
    timelineA: Timeline<A>
): Timeline<B | null> => {
    const initialResource = resourceFactory(timelineA.at(Now));
    const timelineB = Timeline(initialResource ? initialResource.resource : null);
    const newFn = (valueA: A) => {
        // In reality, the cleanup() of the old resource is executed here
        const newResourceData = resourceFactory(valueA);
        const newResource = newResourceData ? newResourceData.resource : null;
        timelineB.define(Now, newResource);
        // In reality, the new cleanup() is registered here
    };
    timelineA._fns.push(newFn);
    return timelineB;
};
```

From this code, we can see the following extremely important common structure:

-   **Reusability of `timelineB`**: All three APIs create the **resulting `timelineB` only once** when they are first called. Subsequently, every time the source `timelineA` is updated, that `timelineB` object is **reused**, and only its internal value is updated.

> **Note: Why is it specified this way? (Review of the design philosophy)**
> 
> **Answer: Because it is based on the block universe model.**
> 
> Conceptually, all `Timeline`s exist in the block universe, and as their name suggests, they are timelines on a time axis and do not change. In programming context, they are **Immutable**.
> 
> However, for the exact same reason that `Now` is conceptually a **Mutable cursor** that moves along the time axis with our viewpoint, the content of a `Timeline` is the mini block universe itself, and it is a natural implementation for it to be a **Mutable value** that is "always synchronized" with our viewpoint.
> 
> The `value` / `innerTimeline` / `resource` that are generated within the Immutable `TimelineB` defined through `map` / `bind` / `using` and continue to be reactively updated by the Mutable updates of the content of `TimelineA` must all be Mutable due to the philosophical design principles mentioned above.
> 
> The fundamental reason that `innerTimeline` and `resource` must be mutably "destroyed" is that the **dependency graph evolves over time in sync with the movement of the conceptual Mutable cursor `Now`, and it is different at each time coordinate**.
> 
> This synchronization (rewriting) task between the conceptually Mutable `Now` and the dependency graph is collectively managed by an underlying dependency graph manager called `DependencyCore` in the imperative programming paradigm. This is the concept of `illusion`.

## 3. The Automatic Disposal Mechanism — The Common Foundation of `bind` and `using`

### 3.1 Automatic Disposal of `Timeline` Objects: A Two-Step Process

`bind` creates a new `innerTimeline` object every time the function passed to it (`monadicFn`) is called. So, how is the resource management of that object itself handled?

This automatic disposal is performed in the following two-step process, common to both `bind` and `using`.

-----

#### Step 1: Direct Disposal of the Reactive Connection (The Role of `DependencyCore`)

When the source `Timeline` is next updated, `bind`/`using` calls the `disposeIllusion` function of `DependencyCore`. This directly removes the **reactive connection** (the dependency record) from the old `innerTimeline` to the output `Timeline` from `DependencyCore`'s management ledger.

#### Step 2: Indirect Disposal of the `Timeline` Object (The Role of the `Garbage Collector`)

By cutting the **reactive connection** in Step 1, the old `innerTimeline` object becomes "isolated," with no references from anywhere else.

This "isolation" by `DependencyCore` is the prerequisite for the JavaScript engine's `Garbage Collector` (GC) to determine that the object is no longer needed and to automatically free its memory.

Therefore, `DependencyCore` enables the indirect disposal of the `Timeline` object itself (memory release by GC) by cutting the **reactive connection**.

-----

This two-step process of **isolation by `DependencyCore` → memory release by GC** is a mechanism that is completely common to `bind` and `using`.

### 3.2 The Additional Feature of `using`: Direct Disposal of External Resources

`using`, **in addition** to the common mechanism above, has the extremely important additional feature of **directly disposing of external resources** through the `cleanup` function.

The function passed to `using` returns an object with the structure `{ resource, cleanup }`. At the very moment `disposeIllusion` is executed, `using` utilizes the `onDispose` callback feature of `DependencyCore` to have the user-provided **`cleanup` function** (e.g., `() => dom.remove()`) additionally executed.

This ensures that the **direct disposal** of the external resource is performed in perfect synchronization with the indirect disposal of the `Timeline` object.

## 4. Understanding API Selection from Dependency Graph Behavior

Which API you should choose is determined by how the library's underlying "dependency graph" should behave over time according to your logic.

**All three APIs build a dependency from a `Timeline<A>` to a new `Timeline<B>`**, but the nature of that relationship differs.

#### `map`

-   **Dependency Graph Behavior**: **Static**
    
    -   The dependency graph built by `map` is a **fixed relationship** between `Timeline`s. Once established, the connection does not change over time.
        
-   **Argument Function Type**: `(value: A) => B`
    
    -   `map` requires a function that always transforms the value of a `Timeline<A>` into another value `B` using the same transformation logic.
        
-   **Return Value Type**: **`Timeline<B>`**
    
    -   `map` returns a new `Timeline<B>` that internally holds the transformed value `B`.
        
-   **Subject to Automatic Disposal**: None

#### `bind`

-   **Dependency Graph Behavior**: **Dynamic - Between Timelines**
    
    -   The core of `bind` is its ability to **dynamically switch the destination `Timeline` itself** according to the value of the source `Timeline`. This means the wiring of the dependency graph evolves over time.
        
-   **Argument Function Type**: `(value: A) => Timeline<B>`
    
    -   `bind` requires a function that, based on the input value `A`, returns the **new `Timeline<B>`** to connect to next.
        
-   **Return Value Type**: **`Timeline<B>`**
    
    -   `bind` **creates and returns a single `Timeline<B>`** initially. Every time the source `Timeline` is updated, a new `innerTimeline` is created by the argument function, and only its **internal value** is copied (reflected) to this initially created `Timeline<B>`.
        
-   **Subject to Automatic Disposal**:
    
    1.  Connection (Direct)
        
    2.  `Timeline` (Indirect)

#### `using`

-   **Dependency Graph Behavior**: **Dynamic - Synchronizes Lifecycle of Timeline and External Resource**
    
    -   `using` also builds a dynamic dependency graph like `bind`, but its purpose is specialized in **perfectly synchronizing the state changes of a `Timeline` with the creation and destruction (lifecycle) of an external resource**.
        
-   **Argument Function Type**: `(value: A) => Resource<B> | null`
    
    -   `using` requires a function that, based on the input value `A`, returns a `Resource<B>` object, which is a pair of the created **external resource `B` and the `cleanup` function** to destroy it.
        
-   **Return Value Type**: **`Timeline<B | null>`**
    
    -   `using` returns a new `Timeline<B | null>` that holds the created `resource` as its internal value.
        
-   **Subject to Automatic Disposal**:
    
    1.  Connection (Direct)
        
    2.  `Timeline` (Indirect)
        
    3.  **External Resource (Direct)**

## 5. Practical Scenarios

#### Scenario 1: The Optimal Case for `map`

Convert a user's score (`Timeline<number>`) to a label for screen display (`Timeline<string>`).

```
const scoreTimeline: Timeline<number> = Timeline(100);
// f: (score: number) => string
const labelTimeline: Timeline<string> = scoreTimeline.map(score => `Score: ${score}`);
```

#### Scenario 2: The Optimal Case for `bind`

Switch the `Timeline` that fetches content from an API depending on the user's selected data source (`"posts"` or `"users"`).

```
const sourceChoiceTimeline: Timeline<string> = Timeline("posts");

// monadf: (choice: string) => Timeline<Post[] | User[]>
const dataTimeline: Timeline<Post[] | User[]> = sourceChoiceTimeline.bind(choice => {
    if (choice === "posts") {
        return fetchPostsApi(); // -> returns Timeline<Post[]>
    } else {
        return fetchUsersApi(); // -> returns Timeline<User[]>
    }
});
```

#### Scenario 3: The Optimal Case for `using`

The reference code in `extension.js` is a perfect real-world example. It generates `DOM` elements based on the value of a `Timeline<data>`, and when the data is updated, it disposes of the old `DOM` and regenerates new ones.

```
// resourceFactory: (items: Item[]) => Resource<Icon[]>
dynamicDataTimeline.using(items => {
    const icons = items.map(item => new St.Icon(...));
    container.add_child(...);
    // returns { resource: Icon[], cleanup: () => void }
    return createResource(icons, () => {
        icons.forEach(icon => icon.destroy());
    });
});
```

#### Scenario 4: Combining `bind` and `using`

This is the most practical pattern: "manage DOM elements only while the component is visible."

```
// monadf: (isVisible: boolean) => Timeline<DOMElement | null>
isVisibleTimeline.bind(isVisible => { // ★ Outer bind: Manages the "existence" of the entire component
    if (!isVisible) {
        return Timeline(null); // If not visible, connect to nothing
    }

    // The following reactive process is executed only if isVisible is true
    // resourceFactory: (data: any) => Resource<DOMElement>
    return someDataTimeline.using(data => { // ★ Inner using: Manages the "DOM elements" while visible
        const dom = createDomElement(data);
        return createResource(dom, () => dom.remove());
    });
});
```

-   **The outer `bind` manages the lifecycle of the entire component and cuts the reactive connection to the inner `using` when it's no longer needed.**
    
-   **The inner `using` executes its `cleanup` function the moment that connection is cut, safely disposing of the `DOM` elements.**

## 6. Conclusion

`map`, `bind`, and `using` are not competing APIs where you should hesitate about which one to use. The API to choose is always determined by the **type signature of the function you pass as an argument**.

And `bind` and `using` are **complementary, used in a hierarchical combination to achieve complete automatic resource management**. Understanding this structure is the key to building robust, leak-free reactive applications.
