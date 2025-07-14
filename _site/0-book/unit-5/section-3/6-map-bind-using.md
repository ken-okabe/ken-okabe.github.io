:::lang-en

# Chapter 6: Comprehensive Guide to map/bind/using: A Complete Guide to API Selection

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

```ts
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

```ts
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

```ts
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

```ts
const scoreTimeline: Timeline<number> = Timeline(100);
// f: (score: number) => string
const labelTimeline: Timeline<string> = scoreTimeline.map(score => `Score: ${score}`);
```

#### Scenario 2: The Optimal Case for `bind`

Switch the `Timeline` that fetches content from an API depending on the user's selected data source (`"posts"` or `"users"`).

```ts
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

```ts
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

```ts
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

:::

:::lang-ja

# Chapter 6: `map`/`bind`/`using` 総合利用ガイド：API選択の完全な指針

このチャプターは、`timeline.js`を利用する開発者が、`map`, `bind`, `using`という3つの主要な変換APIの選択において、一切の迷いや手戻りを発生させないための、**具体的かつ厳密な判断基準**を提供することを目的とします。

「`bind`と`using`はペアで使うのか？」「`map`と何が違うのか？」といった、開発者が直面する具体的な問いに答えるため、表面的な「役割の違い」の説明ではなく、内部の仕組みと**TypeScriptの型シグネチャ**から解き明かし、どのような問題状況に、どのAPIが唯一の解決策となるのかを定義します。

## 1. 2種類のオブジェクト

このライブラリでリソース管理を正しく理解するには、まず **我々（Timelineライブラリ）が扱うオブジェクトが2種類ある** ことを認識する必要があります。

-   **`Timeline`オブジェクト**: `timeline.js`ライブラリが管理する、リアクティブな値と依存関係を持つJavaScriptオブジェクトです。`Timeline(初期値)`によって生成されます。
    
-   **外部リソース (External Resource)**: `timeline.js`の管理外にある、あらゆるオブジェクトです。`DOM`要素、`GLib`のタイマー、ネットワーク接続などがこれにあたります。これらは明示的に生成・破棄されない限り、リソースを占有し続けます。

両者は生成方法とライフサイクル管理が根本的に異なります。この違いを理解することが、`map`/`bind`/`using`の役割を理解する鍵となります。

## 2. 概念的コードによる本質の理解

実際の`timeline.js`ライブラリは`DependencyCore`によるリソース管理機能を持つため複雑ですが、リアクティブな値の更新メカニズムという根幹においては、以下のミニマルなコードと等価です。

### 概念的な実装（型付き）

```ts
// map: Timeline<A> から Timeline<B> への変換
// 引数関数の型: (value: A) => B
const map = <A, B>(
    f: (value: A) => B,
    timelineA: Timeline<A>
): Timeline<B> => {
    const timelineB = Timeline(f(timelineA.at(Now)));
    const newFn = (valueA: A) => {
        timelineB.define(Now, f(valueA));
    };
    // 簡略化した依存関係の登録
    timelineA._fns.push(newFn);
    return timelineB;
};
```

```ts
// bind: Timeline<A> から Timeline<B> への変換
// 引数関数の型: (value: A) => Timeline<B>
const bind = <A, B>(
    monadicFn: (value: A) => Timeline<B>,
    timelineA: Timeline<A>
): Timeline<B> => {
    const initialInnerTimeline = monadicFn(timelineA.at(Now));
    const timelineB = Timeline(initialInnerTimeline.at(Now));
    const newFn = (valueA: A) => {
        // 実際には古いinnerTimelineのリソースはここで破棄される
        const newInnerTimeline = monadicFn(valueA);
        timelineB.define(Now, newInnerTimeline.at(Now));
    };
    timelineA._fns.push(newFn);
    return timelineB;
};
```

```ts
// using: Timeline<A> から Timeline<B | null> への変換
// 引数関数の型: (value: A) => Resource<B> | null
const using = <A, B>(
    resourceFactory: (value: A) => Resource<B> | null,
    timelineA: Timeline<A>
): Timeline<B | null> => {
    const initialResource = resourceFactory(timelineA.at(Now));
    const timelineB = Timeline(initialResource ? initialResource.resource : null);
    const newFn = (valueA: A) => {
        // 実際には古いresourceのcleanup()がここで実行される
        const newResourceData = resourceFactory(valueA);
        const newResource = newResourceData ? newResourceData.resource : null;
        timelineB.define(Now, newResource);
        // 実際には新しいcleanup()がここで登録される
    };
    timelineA._fns.push(newFn);
    return timelineB;
};
```

このコードから、以下の極めて重要な共通構造がわかります。

-   **`timelineB`の再利用**: 3つのAPIはどれも、最初に呼び出された時に**結果となる`timelineB`を一度だけ生成**します。以降、ソースである`timelineA`が更新されるたびに、その`timelineB`オブジェクトは**再利用**され、内部の値だけが更新されます。

> **Note: なぜこのような仕様になっているのか？（設計思想の復習）**
> 
> **答え：ブロックユニバースモデルに基づいているからです。**
> 
> 概念的には、`Timeline`はすべてブロックユニバースに存在する、その名の通り時間軸のタイムラインであり、変化することはありません。プログラミングの文脈でいうところの**Immutable（不変）** です。
> 
> しかし、`Now`が概念的に時間軸に沿って我々の視点とともに動く**Mutableなカーソル**であるのと全く同じ理由で、`Timeline`の中身はミニブロックユニバースそのものであり我々の視点と「常に同期している」**Mutableな値**であるのが自然な実装となります。
> 
> `map` / `bind` / `using`を通じて定義されたImmutableな`TimelineB`の中で発生し、`TimelineA`の中身のMutableな更新によりReactiveに更新され続ける`value` / `innerTimeline` / `resource`はそれぞれすべて、上記の哲学的設計理念からでMutableである必要があります。
> 
> `innerTimeline`や`resource`がmutableに「破壊」されなければならない根本的な理由は、概念的な**Mutableなカーソル**である`Now`が未来方向へ動くのと同期して**依存グラフが時間発展とともに変化しており、そのそれぞれの時間座標において異なる**からです。
> 
> この概念的にMutableな`Now`と依存グラフの同期（書き換え）作業は、一括して`DependencyCore`という水面下の依存グラフマネージャーが、命令的プログラミングのパラダイムで司ります。これが `illusion`という概念です。

## 3. 自動破棄のメカニズム — `bind`と`using`の共通基盤

### 3.1 `Timeline`オブジェクトの自動破棄：2段階のプロセス

`bind`は、引数に取る関数（`monadicFn`）が呼び出されるたびに、新しい`innerTimeline`オブジェクトを生成します。では、そのオブジェクト自体のリソース管理はどうなっているのでしょうか。

この自動破棄は、`bind`と`using`に共通する、以下の2段階のプロセスで行われます。

-----

#### ステップ1： リアクティブ接続の直接的な破棄（`DependencyCore`の役割）

`bind`/`using`は、ソース`Timeline`が次に更新された際、`DependencyCore`の`disposeIllusion`機能を呼び出します。これにより、古い`innerTimeline`から出力`Timeline`への **リアクティブな接続**（依存関係のレコード）が、`DependencyCore`の管理台帳から直接的に削除されます。

#### ステップ2：`Timeline`オブジェクトの間接的な破棄（`ガベージコレクタ`の役割）

ステップ1で **リアクティブな接続** が断ち切られることで、古い`innerTimeline`オブジェクトは、他にどこからも参照されていない「孤立した」状態になります。

`DependencyCore`によるこの「孤立化」こそが、JavaScriptエンジンの`ガベージコレクタ`（GC）がそのオブジェクトを不要と判断し、メモリを自動的に解放するための前提条件となります。

したがって、`DependencyCore`は、**リアクティブな接続** を断ち切ることで、間接的に`Timeline`オブジェクト自体の破棄（GCによるメモリ解放）を可能にしているのです。

-----

この **`DependencyCore`による孤立化 → GCによるメモリ解放** という2段階のプロセスは、`bind`と`using`で完全に共通のメカニズムです。

### 3.2 `using`の追加機能：外部リソースの直接的な破棄

`using`は、上記の共通メカニズムに**加えて**、`cleanup`関数を通じて**外部リソースを直接的に破棄する**という、極めて重要な追加機能を持っています。

`using`に渡す関数は`{ resource, cleanup }`という構造のオブジェクトを返します。`using`は、`disposeIllusion`が実行されるまさにその瞬間に、`DependencyCore`の`onDispose`コールバック機能を利用して、ユーザーが提供した**`cleanup`関数**（例: `() => dom.remove()`）を追加で実行させます。

これにより、`Timeline`オブジェクトの間接的な破棄と**同時に**、外部リソースの**直接的な破棄**が、完全に同期して行われます。

## 4. 依存グラフの振る舞いから理解するAPI選択

どのAPIを選択すべきかは、ライブラリの根底にある「依存グラフ」が、あなたのロジックによって時間と共にどう振る舞うべきか、で決まります。

**3つのAPIはすべて、`Timeline<A>`から新しい`Timeline<B>`への依存関係を構築します**が、その関係性の性質が異なります。

#### `map`

-   **依存グラフの振る舞い**: **静的（Static）**
    
    -   `map`が構築する依存グラフは、`Timeline`同士の**固定された関係**です。一度確立された接続は、時間と共に変化しません。
        
-   **引数関数の型**: `(value: A) => B`
    
    -   `map`は、ある`Timeline<A>`の値を、常に同じ変換ロジックで別の値`B`に変換し続ける関数を要求します。
        
-   **返り値の型**: **`Timeline<B>`**
    
    -   `map`は、変換後の値`B`を内部に持つ、新しい`Timeline<B>`を返します。
        
-   **自動破棄の対象**: なし

#### `bind`

-   **依存グラフの振る舞い**: **動的（Dynamic） - Timeline間**
    
    -   `bind`の核心は、ソース`Timeline`の値に応じて、**接続先の`Timeline`そのものを動的に切り替える**能力にあります。これは、依存グラフの配線が時間発展することを意味します。
        
-   **引数関数の型**: `(value: A) => Timeline<B>`
    
    -   `bind`は、入力値`A`を元に、次に接続すべき**新しい`Timeline<B>`を返却**する関数を要求します。
        
-   **返り値の型**: **`Timeline<B>`**
    
    -   `bind`は、最初に**単一の`Timeline<B>`を生成して返します。** ソース`Timeline`が更新されるたびに、引数関数が返す新しい`innerTimeline`が生成され、その**中身の値だけが**、最初に生成されたこの`Timeline<B>`にコピー（反映）されます。
        
-   **自動破棄の対象**:
    
    1.  接続 (直接)
        
    2.  `Timeline` (間接)

#### `using`

-   **依存グラフの振る舞い**: **動的（Dynamic） - Timelineと外部リソースのライフサイクルを同期**
    
    -   `using`も`bind`と同様に動的な依存グラフを構築しますが、その目的は**`Timeline`の状態変化と、外部リソースの生成・破棄（ライフサイクル）を完全に同期させる**点に特化しています。
        
-   **引数関数の型**: `(value: A) => Resource<B> | null`
    
    -   `using`は、入力値`A`を元に、生成された**外部リソース`B`と、それを破棄するための`cleanup`関数**をペアにした`Resource<B>`オブジェクトを返却する関数を要求します。
        
-   **返り値の型**: **`Timeline<B | null>`**
    
    -   `using`は、生成された`resource`を内部値として持つ、新しい`Timeline<B | null>`を返します。
        
-   **自動破棄の対象**:
    
    1.  接続 (直接)
        
    2.  `Timeline` (間接)
        
    3.  **外部リソース (直接)**

## 5. 実践シナリオ集

#### シナリオ1: `map`が最適なケース

ユーザーのスコア(`Timeline<number>`)を、画面表示用のラベル(`Timeline<string>`)に変換します。

```ts
const scoreTimeline: Timeline<number> = Timeline(100);
// f: (score: number) => string
const labelTimeline: Timeline<string> = scoreTimeline.map(score => `Score: ${score}`);

```

#### シナリオ2: `bind`が最適なケース

ユーザーが選択したデータソース(`"posts"`または`"users"`)に応じて、表示する内容をAPIから取得する`Timeline`を切り替えます。

```ts
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

#### シナリオ3: `using`が最適なケース

`extension.js`のリファレンスコードが完璧な実例です。`Timeline<data>`の値に基づいて`DOM`要素を生成し、データが更新されたら古い`DOM`を破棄して新しいものを再生成します。

```ts
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

#### シナリオ4: `bind`と`using`の組み合わせ

「コンポーネントが表示されている間だけ、DOM要素を管理する」という、最も実践的なパターンです。

```ts
// monadf: (isVisible: boolean) => Timeline<DOMElement | null>
isVisibleTimeline.bind(isVisible => { // ★外側のbind: コンポーネント全体の「存在」を管理
    if (!isVisible) {
        return Timeline(null); // 非表示なら、何も接続しない
    }

    // isVisibleがtrueの場合のみ、以下のリアクティブな処理が実行される
    // resourceFactory: (data: any) => Resource<DOMElement>
    return someDataTimeline.using(data => { // ★内側のusing: 表示中の「DOM要素」を管理
        const dom = createDomElement(data);
        return createResource(dom, () => dom.remove());
    });
});
```

-   **外側の`bind`は、コンポーネント全体のライフサイクルを管理し、不要になった際に内側の`using`へのリアクティブな接続を断ち切ります**。
    
-   **内側の`using`は、その接続が断ち切られた瞬間に、自身の`cleanup`関数を実行し、`DOM`要素を安全に破棄します**。

## 6. 結論

`map`, `bind`, `using`は、どちらを使うべきか迷うような競合するAPIではありません。**引数に渡す関数の型シグネチャ**によって、選択すべきAPIは常に一つに定まります。

そして、`bind`と`using`は**階層的に組み合わせて使うことで、完全な自動リソース管理を実現する、補完的な関係にある**のです。この構造を理解することが、堅牢でリークのないリアクティブなアプリケーションを構築するための鍵となります。

:::