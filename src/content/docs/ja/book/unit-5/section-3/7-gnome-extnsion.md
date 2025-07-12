---
title: 'Chapter 7: 実践ガイド：timeline.jsによる堅牢なUI構築テクニック'
description: 本チャプターは、Timeline ライブラリの他のドキュメント群と、現実のアプリケーション開発との間のギャップを埋めることを目的とします。
---
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
