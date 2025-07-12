---
title: 'Chapter 6: map/bind/using 総合利用ガイド：API選択の完全な指針'
description: >-
  このチャプターは、timeline.jsを利用する開発者が、map, bind,
  usingという3つの主要な変換APIの選択において、一切の迷いや手戻りを発生させないための、具体的かつ厳密な判断基準を提供することを目的とします。
---
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

```js
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

```js
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

```js
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

```
const scoreTimeline: Timeline<number> = Timeline(100);
// f: (score: number) => string
const labelTimeline: Timeline<string> = scoreTimeline.map(score => `Score: ${score}`);

```

#### シナリオ2: `bind`が最適なケース

ユーザーが選択したデータソース(`"posts"`または`"users"`)に応じて、表示する内容をAPIから取得する`Timeline`を切り替えます。

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

#### シナリオ3: `using`が最適なケース

`extension.js`のリファレンスコードが完璧な実例です。`Timeline<data>`の値に基づいて`DOM`要素を生成し、データが更新されたら古い`DOM`を破棄して新しいものを再生成します。

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

#### シナリオ4: `bind`と`using`の組み合わせ

「コンポーネントが表示されている間だけ、DOM要素を管理する」という、最も実践的なパターンです。

```
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
