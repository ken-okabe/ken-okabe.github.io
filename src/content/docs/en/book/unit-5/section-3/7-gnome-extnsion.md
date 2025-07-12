---
title: 'Chapter 7: Practical Guide: Robust UI Construction Techniques with timeline.js'
description: >-
  This chapter aims to bridge the gap between the other documentation for the
  Timeline library and real-world application development.
---
This chapter aims to bridge the gap between the other documentation for the `Timeline` library and real-world application development.

The subject is the **final reference code (`extension.js`) for a minimal yet essential GNOME Shell extension**. This extension adds a single icon to the panel, which opens a menu when clicked. The menu displays a static list of "favorite" icons and a "demo" section where icons are dynamically added and removed every three seconds.

GNOME Shell extensions are a **mass of object-oriented and imperative paradigms**. The creation and destruction of UI widgets and event handling are all done imperatively.

The core challenge of this project is how to beautifully integrate this imperative world into the **declarative data flow** provided by `timeline.js` and the **sophisticated, fully automatic resource management** realized by `bind`/`using`.

This reference code is a **Proof of Concept** to demonstrate that the philosophy of `timeline.js` is **not just a theoretical exercise, but is practically effective in complex, real-world application development**.

Below, we will unravel the "clever tricks" scattered throughout this code and clarify the process of connecting theory to solving real-world problems.

----------

## Outline

### 1. The Soul of the Application: Global Management with `lifecycleTimeline`

The most important and fundamental technique in this architecture is to represent the "enabled/disabled" state of the extension with a single `Timeline` object that functions as the **soul of the entire application**.

-   Implementation (extension.js)
    
    First, we define `lifecycleTimeline`, which acts as the "ON/OFF switch" for the application. Then, we subscribe to this Timeline with the `using` operator, linking the creation and destruction of the entire application's UI and resources to it.
    
    JavaScript
    
    ```js
    // 1. The "master switch" Timeline is created, initially off (false).
    const lifecycleTimeline = Timeline(false);
    
    // Public methods for GNOME Shell to turn the switch ON or OFF.
    this.enable = () => lifecycleTimeline.define(Now, true);
    this.disable = () => lifecycleTimeline.define(Now, false);
    
    // 2. The `using` operator subscribes to this master switch.
    // The entire application's existence is bound to this block.
    lifecycleTimeline.using(isEnabled => {
        if (!isEnabled) {
            // When the switch is OFF, do nothing and ensure all old resources are cleaned up.
            return null;
        }
    
        // When the switch is ON, create all UI and resources.
        // ... (All UI setup processing) ...
    
        // Return the created resources paired with their cleanup logic.
        return createResource(panelMenuButton, cleanup);
    });
    ```
    
-   Execution Log
    
    When the value of this `lifecycleTimeline` changes to `true`, "Creating..." is logged, and when it changes to `false`, "Destroying..." is logged.
    
    ```
    Jul 02 11:27:26 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Destroying top-level UI...
    ...
    Jul 02 11:27:27 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Creating top-level UI...
    ```

This pattern is the **heart of achieving complete, automatic resource management for the entire application**. It guarantees that all resources created in `enable` are **flawlessly and automatically destroyed** by the illusion management feature of this top-level `using` when `disable` is called.

----------

### 2. Full Automation of Dynamic UI Updates: The True Value of `using`

The most noteworthy part of this reference code is the **complete automation of complex dynamic behavior** shown by the `manageDynamicItems` component. The timer **only updates the data** every three seconds and contains no imperative operations like adding or removing UI elements.

-   Implementation (extension.js)
    
    The timer's callback is only responsible for data manipulation: reading the current state and defining the next state. There is no code that directly manipulates the UI anywhere.
    
    JavaScript
    
    ```js
    const timerId = GLib.timeout_add(..., () => {
        // 1. Read current state
        const currentState = dynamicDataTimeline.at(Now);
        // 2. Define next state
        const nextState = (currentState.length === 1) ? STATE_B : STATE_A;
        dynamicDataTimeline.define(Now, nextState);
        // 3. Continue timer
        return GLib.SOURCE_CONTINUE;
    });
    ```
    
-   Execution Log
    
    However, the execution log shows that this simple data manipulation leads to perfect UI updates and resource management.
    
    ```
    Jul 02 11:27:15 nixos .gnome-shell-wr[216152]: [AIO-Validator] DEMO: Timer fired, toggling dynamic data...
    Jul 02 11:27:15 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Destroying 1 items.
    Jul 02 11:27:15 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Building UI for 2 items.
    Jul 02 11:27:18 nixos .gnome-shell-wr[216152]: [AIO-Validator] DEMO: Timer fired, toggling dynamic data...
    Jul 02 11:27:18 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Destroying 2 items.
    Jul 02 11:27:18 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Building UI for 1 items.
    ```
    
    Every time the timer updates the data, the `using` operator **automatically destroys the old UI (`Destroying...`) and rebuilds the new UI (`Building...`)**.

**The fact that resource management is performed perfectly, despite the timer's code having no manual operations like `destroy`, is the core value of this framework.**

----------

### 3. Componentization and Separation of Responsibilities

This code divides each part of the UI into **self-contained components** like `manageFavorites` and `manageDynamicItems`. This improves the readability and maintainability of the entire codebase.

-   Implementation (extension.js)
    
    Each component has a clear interface: it accepts a parent container to inject the UI into and returns a `dispose` method to destroy the external resources it manages.
    
    JavaScript
    
    ```js
    /** Manages a list of items that changes dynamically via a timer. */
    function manageDynamicItems(container) {
        // ... component logic ...
        // Provide a dispose method to clean up the external timer.
        return {
            dispose: () => { /* ... */ }
        };
    }
    ```
    
-   Execution Log
    
    The use of prefixes (namespaces) like `FAV:`, `DYNAMIC:`, and `BRIDGE:` in the `log()` output also shows that the responsibilities of each component are separated. This makes debugging complex behavior easier.
    
    ```
    Jul 02 11:27:12 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Creating top-level UI...
    Jul 02 11:27:12 nixos .gnome-shell-wr[216152]: [AIO-Validator] FAV: Building UI for 2 favorite items.
    Jul 02 11:27:12 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Building UI for 1 items. 
    ```

----------

### 4. Hierarchical Cleanup

The principle of "global automatic management" established in Chapter 1 is **applied hierarchically** to child components, ensuring the robustness of the entire system.

-   Implementation (extension.js)
    
    The parent component's `cleanup` function first calls the `dispose` method of the child component (`dynamicItemsManager`) before destroying the UI it created (`panelMenuButton`).
    
    JavaScript
    
    ```js
    const cleanup = () => {
        log('BRIDGE: Destroying top-level UI...');
        // 1. Tell children to clean up their own external resources.
        favoritesManager.dispose();
        dynamicItemsManager.dispose();
        // 2. Destroy the top-level UI widget.
        panelMenuButton.destroy();
    };
    ```
    
-   Execution Log
    
    The log from when the extension is disabled shows that this hierarchical cleanup works perfectly.
    
    ```
    Jul 02 11:27:19 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Destroying top-level UI...
    Jul 02 11:27:19 nixos .gnome-shell-wr[216152]: [AIO-Validator] DEMO: Timer explicitly removed.
    Jul 02 11:27:19 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Top-level UI destroyed.
    ```
    
    The parent's `cleanup` is triggered, which first destroys the timer managed by the child component, and then the parent's UI is completed. This ensures that even a running timer is safely stopped and destroyed.

----------

### Conclusion

This reference code and its execution log concretely demonstrate how `timeline.js` can handle real-world complex requirements (asynchronous events, external resources, dynamic state changes) robustly and declaratively, going beyond mere theory.

By applying the "tricks" explained here, developers can be freed from the worry of resource leaks and focus on building the essential logic of their applications.

---

## Gemini Canvas Emulation

**This emulation runs in the Gemini Canvas web app environment.**

### https://g.co/gemini/share/c070c89cee50

It is possible to implement and display the "safe resource creation and destruction" by Timeline `using` with the exact same logs as in the GNOME environment, without any flaws.

---

### Why can it be proven with the same logs?

1.  **Because the logic of `extension.js` is not changed**:
    The `Building UI...` log output when building the UI and the `Destroying ... items.` log when destroying resources are all described within `extension.js`. The emulation **does not touch this application logic at all.

2.  **Because the emulation API mimics the "behavior"**:
    * **On creation**: When `extension.js` calls `new St.Icon()`, the emulation API creates an HTML `<div>` element instead of an actual GNOME widget. At this time, the `Building...` log is output to the console.
    * **On destruction**: When the `using` operator calls the `cleanup` function, and `icon.destroy()` is executed within it, the emulation API **completely removes** the corresponding `<div>` element from the HTML. Simultaneously, the `Destroying...` log is output to the console.
    * **On timer destruction**: When `dispose()` is called and `GLib.Source.remove()` is executed, the emulation API calls `clearInterval()` to stop the timer and outputs the `Timer explicitly removed.` log.

3.  **Because the behavior of `timeline.js` is universal**:
    The core logic of resource management—**when `using` calls `cleanup`**—is within `timeline.js` and is environment-independent. Therefore, the commands for resource creation and destruction are executed at the exact same timing and in the exact same order, whether on GNOME or in a browser.

As a result, **the logs ultimately output to the screen are identical to those obtained in the GNOME environment**, making it possible to prove both visually (addition/removal of UI elements) and quantitatively (logs) how practical and effective the sophisticated resource management by `using` is.

### What this emulation proves

-   **Identical Logic**: The application logic of `extension.js` is not touched at all; only the operating environment (GNOME Shell → Web Browser) is swapped.
    
-   **Identical Resource Management**: The `using` operator completely and automatically manages the creation and destruction of HTML elements instead of GNOME widgets, at the exact same timing and in the same order.
    
-   **Identical Log Output**: Logs that are identical to those obtained in the GNOME environment are output to the screen in real-time.

This demonstrates that the architecture of `timeline.js` is universal and robust, not dependent on a specific platform.
