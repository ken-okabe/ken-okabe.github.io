:::lang-en

# Chapter 7: Practical Guide: Robust UI Construction Techniques with `timeline.js`

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
    The `Building UI...` log output when building the UI and the `Destroying ... items.` log when destroying resources are all described within `extension.js`. The emulation **does not touch this application logic at all.**

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

:::

:::lang-ja

# Chapter 7: 実践ガイド：`timeline.js`による堅牢なUI構築テクニック

本チャプターは、`Timeline` ライブラリの他のドキュメント群と、現実のアプリケーション開発との間のギャップを埋めることを目的とします。

題材とするのは、ミニマルながらも本質的な機能を備えた**GNOME Shell拡張機能の最終リファレンスコード (`extension.js`)** です。この拡張機能は、パネルに一つのアイコンを追加し、クリックするとメニューが開きます。メニューには、静的な「お気に入り」アイコンリストと、3秒ごとにアイコンが動的に追加・削除される「デモ」セクションが表示されます。

GNOME Shell拡張機能は、まさに**オブジェクト指向と命令型パラダイムの塊**です。UIウィジェットの生成・破棄やイベント処理は、全て命令的に行われます。

このプロジェクトの核心的な挑戦は、この命令的な世界を、`timeline.js`が提供する**宣言的なデータフロー**と、`bind`/`using`が実現する**洗練された全自動リソース管理**のパラダイムへ、いかにして美しく統合するか、という点にあります。

このリファレンスコードは、`timeline.js`の思想が**机上の空論ではなく、現実の複雑なアプリケーション開発において実践的に有効である**ことを証明するための、**概念実証 (Proof of Concept)** です。

以下では、このコードに散りばめられた「巧みな工夫」を解き明かし、理論を現実の課題解決に結びつけるプロセスを明らかにします。

----------

## Outline

### 1. アプリケーションの魂：`lifecycleTimeline`による全体管理

このアーキテクチャで最も重要かつ根源的なテクニックは、拡張機能の「有効/無効」という状態を、**アプリケーション全体の魂**として機能する単一の`Timeline`オブジェクトで表現することです。

-   実装 (extension.js)
    
    まず、アプリケーションの「ON/OFFスイッチ」となるlifecycleTimelineを定義します。そして、そのTimelineをusing演算子で購読し、アプリケーション全体のUIとリソースの生成・破棄を紐付けます。
    
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
        // ... (全UIのセットアップ処理) ...
    
        // Return the created resources paired with their cleanup logic.
        return createResource(panelMenuButton, cleanup);
    });
    ```
    
-   実行ログ
    
    このlifecycleTimelineの値がtrueに変わるとCreating...が、falseに変わるとDestroying...がログに出力されます。
    
    ```
    Jul 02 11:27:26 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Destroying top-level UI...
    ...
    Jul 02 11:27:27 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Creating top-level UI...
    ```

このパターンこそが、**アプリケーション全体の完全な自動リソース管理を実現する心臓部**です。`enable`で生成されたすべてのリソースは、`disable`が呼ばれた際に、このトップレベルの`using`が持つイリュージョン管理機能によって、**漏れなく、かつ自動的に破棄される**ことが保証されます。

----------

### 2. 動的なUI更新の完全自動化：`using`の真価

このリファレンスコードで最も注目すべきは、`manageDynamicItems`コンポーネントが示す、**複雑な動的動作の完全な自動化**です。タイマーは3秒ごとに**データを更新するだけ**で、UIの追加や削除といった命令的な操作を一切含んでいません。

-   実装 (extension.js)
    
    タイマーのコールバックは、現在の状態を読み取り、次の状態を定義するという、データ操作にのみ責任を持ちます。UIを直接操作するコードはどこにもありません。
    
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
    
-   実行ログ
    
    しかし、実行ログを見れば、このシンプルなデータ操作が、完璧なUIの更新とリソース管理に繋がっていることがわかります。
    
    ```
    Jul 02 11:27:15 nixos .gnome-shell-wr[216152]: [AIO-Validator] DEMO: Timer fired, toggling dynamic data...
    Jul 02 11:27:15 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Destroying 1 items.
    Jul 02 11:27:15 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Building UI for 2 items.
    Jul 02 11:27:18 nixos .gnome-shell-wr[216152]: [AIO-Validator] DEMO: Timer fired, toggling dynamic data...
    Jul 02 11:27:18 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Destroying 2 items.
    Jul 02 11:27:18 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Building UI for 1 items.
    ```
    
    タイマーがデータを更新するたびに、`using`演算子が**自動的に古いUIを破棄(`Destroying...`)し、新しいUIを再構築(`Building...`)しています。**

**タイマーのコードには一切`destroy`などの手動操作がないにも関わらず、リソース管理が完璧に行われている点こそが、このフレームワークの核心的な価値です。**

----------

### 3. コンポーネント化と責務の分離

このコードは、UIの各部分を`manageFavorites`や`manageDynamicItems`といった**自己完結したコンポーネント**に分割しています。これにより、コードベース全体の可読性と保守性が向上します。

-   実装 (extension.js)
    
    各コンポーネントは、UIを注入する親コンテナを引数として受け取り、自身が管理する外部リソースを破棄するためのdisposeメソッドを返す、という明確なインターフェースを持っています。
    
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
    
-   実行ログ
    
    log()の出力にFAV:, DYNAMIC:, BRIDGE:といった接頭辞（ネームスペース）を設けていることからも、各コンポーネントの責務が分離されていることがわかります。これにより、複雑な動作のデバッグが容易になります。
    
    ```
    Jul 02 11:27:12 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Creating top-level UI...
    Jul 02 11:27:12 nixos .gnome-shell-wr[216152]: [AIO-Validator] FAV: Building UI for 2 favorite items.
    Jul 02 11:27:12 nixos .gnome-shell-wr[216152]: [AIO-Validator] DYNAMIC: Building UI for 1 items. 
    ```

----------

### 4. 階層的なクリーンアップ

第1章で確立した「アプリケーション全体の自動管理」という原則は、子コンポーネントにも**階層的に適用**され、システム全体の堅牢性を保証します。

-   実装 (extension.js)
    
    親コンポーネントのcleanup関数は、自身が生成したUI (panelMenuButton) を破棄する前に、まず子コンポーネント (dynamicItemsManager) のdisposeメソッドを呼び出しています。
    
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
    
-   実行ログ
    
    拡張機能が無効化された際のログは、この階層的クリーンアップが完璧に機能していることを示しています。
    
    ```
    Jul 02 11:27:19 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Destroying top-level UI...
    Jul 02 11:27:19 nixos .gnome-shell-wr[216152]: [AIO-Validator] DEMO: Timer explicitly removed.
    Jul 02 11:27:19 nixos .gnome-shell-wr[216152]: [AIO-Validator] BRIDGE: Top-level UI destroyed.
    ```
    
    親の`cleanup`がトリガーとなり、まず子コンポーネントが管理していたタイマーが破棄され、その後に親のUIが完了しています。これにより、動作中のタイマーですら安全に停止・破棄されることが保証されます。

----------

### 結論

このリファレンスコードとその実行ログは、`timeline.js`が単なる理論に留まらず、現実世界の複雑な要求（非同期イベント、外部リソース、動的な状態変化）に対して、いかに堅牢かつ宣言的に対処できるかを具体的に示しています。

ここで解説した「工夫」を適用することで、開発者はリソースリークの心配から解放され、アプリケーションの本質的なロジックの構築に集中することができます。

---

## Gemini Canvas エミュレーション

**このエミュレーションは、Gemini CanvasによるWebアプリ環境で動作します。**

### https://g.co/gemini/share/c070c89cee50

Timeline `using`による「安全なリソース生成・破棄」の様子を、GNOME環境と全く同じログで、不備なく実装・表示することが可能です。

---

### なぜ同じログで証明できるのか

1.  **`extension.js`のロジックは変更しないから**:
    UIを構築する際に出力される`Building UI...`というログや、リソースを破棄する際の`Destroying ... items.`というログは、すべて`extension.js`の中に記述されています。エミュレーションは、この**アプリケーションのロジックには一切手を加えません。**

2.  **エミュレーションAPIが「振る舞い」を模倣するから**:
    * **生成時**: `extension.js`が`new St.Icon()`を呼び出すと、エミュレーションAPIは実際のGNOMEウィジェットの代わりに、HTMLの`<div>`要素を生成します。この時、`Building...`ログがコンソールに出力されます。
    * **破棄時**: `using`演算子が`cleanup`関数を呼び出し、その中で`icon.destroy()`が実行されると、エミュレーションAPIは対応する`<div>`要素をHTMLから**完全に削除します。** 同時に、`Destroying...`ログがコンソールに出力されます。
    * **タイマー破棄時**: `dispose()`が呼ばれ、`GLib.Source.remove()`が実行されると、エミュレーションAPIは`clearInterval()`を呼び出してタイマーを停止させ、`Timer explicitly removed.`ログを出力します。

3.  **`timeline.js`の動作は普遍的だから**:
    `using`がいつ`cleanup`を呼び出すか、という**リソース管理の心臓部のロジックは`timeline.js`内にあり、環境に依存しません。** そのため、GNOME上でもブラウザ上でも、全く同じタイミングで、全く同じ順序でリソースの生成と破棄の命令が実行されます。

その結果、**最終的に画面に出力されるログは、GNOME環境で得られたものと同一**となり、`using`による洗練されたリソース管理がいかに実践的で有効であるかを、視覚的（UI要素の追加・削除）かつ定量的（ログ）に証明することが可能です。

### このエミュレーションが証明すること

-   **同一のロジック**: `extension.js`のアプリケーションロジックには一切手を加えず、動作環境（GNOME Shell → Webブラウザ）だけを差し替えています。
    
-   **同一のリソース管理**: `using`演算子が、GNOMEウィジェットの代わりにHTML要素の生成・破棄を、全く同じタイミング、同じ順序で、完全に自動管理します。
    
-   **同一のログ出力**: GNOME環境で得られたものと寸分違わぬログが、リアルタイムで画面に出力されます。

これにより、`timeline.js`のアーキテクチャが特定のプラットフォームに依存しない、普遍的で堅牢なものであることが実証されます。

:::