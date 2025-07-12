---
title: 'Chapter 0: Timeline.ts / Timeline.js -- FRP Implementation'
description: >-
  これまでの章では、Timelineライブラリの根底にある設計思想と、その概念的な振る舞いを、オリジンであるF#のコードを参照しながら探求してきました。F#の厳密な型システムと関数型パラダイムは、このライブラリの理論的基盤を理解する上で、最も優れた出発点でした。
---
### 言語の切り替え：F\#からTypeScript/JavaScriptへ

これまでの章では、`Timeline`ライブラリの根底にある設計思想と、その概念的な振る舞いを、オリジンであるF\#のコードを参照しながら探求してきました。F\#の厳密な型システムと関数型パラダイムは、このライブラリの理論的基盤を理解する上で、最も優れた出発点でした。

しかし、この`Timeline`ライブラリは、その歴史の中で大きな進化を遂げています。

オリジナルのF\#版からTypeScript/JavaScriptへと移植され、Webブラウザ上で動作するインタラクティブなデモや、実際のアプリケーションであるGNOME Shell拡張機能（これはJavaScriptで実装されています）での実践を通じて、その機能は大幅に強化されました。

そして、その実践の場で得られた成果は、再びオリジナルのF\#版へと\*\*「逆輸入」\*\*されています。その結果、現在では、`DependencyCore`の高度な機能からデバッグシステムに至るまで、**両言語のライブラリは完全に1:1で対応**しており、その品質と機能において、一貫性が保たれています。

### 本書の方針：TS/JS版をベースとした解説へ

このような経緯を踏まえ、本書ではこのセクション以降、主に**TypeScript/JavaScript版をベース**に解説を進めていきます。これは、Webブラウザ上で動作するインタラクティブなCanvasデモや、GNOME Shell拡張機能という具体的なリファレンスコードを提示する上で、最も実践的かつ効果的なアプローチだからです。

言語は変わりますが、APIの設計、`DependencyCore`や`Illusion`といった内部メカニズム、そしてブロック宇宙モデルという根底の哲学は、F\#版とTS版で完全に同一です。したがって、これまでの学習が無駄になることは一切ありません。

それでは、`Timeline`のTS/JSの完全なAPIリファレンスを見ていきましょう。

-----

# Timelineライブラリ - 完全APIリファレンス (F\# & TypeScript)

## コアの型

#### F\#: `type Timeline<'a> = private { _id: TimelineId; mutable _last: 'a }`

#### TS: `Timeline<A>`

型`A`の値を保持する、主要なリアクティブコンテナ型です。

```typescript
// TS
interface Timeline<A> {
    // 内部プロパティ
    readonly [_id]: TimelineId;
    readonly [_last]: A;

    // コア操作
    at(now: Now): A;
    define(now: Now, value: A): void;

    // 変換
    map<B>(f: (value: A) => B): Timeline<B>;
    bind<B>(monadf: (value: A) => Timeline<B>): Timeline<B>;

    // ユーティリティ
    scan<State>(accumulator: (state: State, input: A) => State, initialState: State): Timeline<State>;
    link(targetTimeline: Timeline<A>): void;
    distinctUntilChanged(): Timeline<A>;
    using<B>(resourceFactory: ResourceFactory<A, B>): Timeline<B | null>;
}
```

-----

#### TS: `NullableTimeline<A>`

`null`値を含むことができるタイムラインのための拡張インターフェースで、null安全な操作を提供します。F\#では、別のインターフェースの代わりに型制約（`when 'a : null`）を使用します。

```typescript
// TS
interface NullableTimeline<A> extends Timeline<A | null> {
    nMap<B>(f: (value: A) => B): Timeline<B | null>;
    nBind<B>(monadf: (value: A) => Timeline<B>): Timeline<B | null>;
    nUsing<B>(resourceFactory: ResourceFactory<A, B>): Timeline<B | null>;
}
```

-----

#### F\#: `type Resource<'a> = { Resource: 'a; Cleanup: unit -> unit }`

#### TS: `Resource<A>`

自動クリーンアップ機能を持つ、管理されたリソースの型です。

```typescript
// TS
interface Resource<A> {
    readonly resource: A;
    readonly cleanup: DisposeCallback;
}
```

-----

#### F\#: `type ResourceFactory<'a, 'b> = 'a -> Resource<'b>`

#### TS: `ResourceFactory<A, B>`

値からリソースを生成する関数です。

```typescript
// TS
type ResourceFactory<A, B> = (value: A) => Resource<B> | null;
```

-----

### 特殊な型

```typescript
// TS
type Now = symbol;               // 概念的な時間座標
type TimelineId = string;        // タイムラインの一意な識別子
type DependencyId = string;      // 依存関係の一意な識別子
type IllusionId = string;        // イリュージョンの一意な識別子
type DisposeCallback = () => void; // クリーンアップ関数の型
```

*F\#では、これらは通常、IDには`System.Guid`のような型、コールバックには`unit -> unit`が使用されます。*

-----

## コアAPI

### ファクトリ関数

#### F\#: `'a -> Timeline<'a>`

#### TS: `Timeline<A>(initialValue: A): Timeline<A>`

初期値を持つ新しいタイムラインを生成します。値が`null`の場合、TS版は`NullableTimeline`を返します。

```typescript
// TS
const numberTimeline = Timeline(42);
const stringTimeline = Timeline("hello");
const nullableTimeline = Timeline<string | null>(null); // これはNullableTimelineです
```

-----

#### F\#: `'a -> Timeline<'a>`

#### TS: `ID<A>(initialValue: A): Timeline<A>`

`Timeline`のエイリアスで、恒等タイムラインを生成します。

```typescript
// TS
const idTimeline = ID(100);
```

-----

#### 事前定義されたタイムライン

```typescript
// TS
const FalseTimeline: Timeline<boolean>; // Timeline(false) と等価
const TrueTimeline: Timeline<boolean>;  // Timeline(true) と等価
```

*これらはF\#とTSの両方で利用可能です。*

-----

### コア操作

#### F\#: `at: NowType -> Timeline<'a> -> 'a`

#### TS: `.at(Now): A`

タイムラインの現在の値を取得します。

```typescript
// TS
const timeline = Timeline(42);
const currentValue = timeline.at(Now); // 42
```

-----

#### F\#: `define: NowType -> 'a -> Timeline<'a> -> unit`

#### TS: `.define(Now, value: A): void`

新しい値を設定し、すべての依存関係の更新をトリガーします。

```typescript
// TS
const timeline = Timeline(42);
timeline.define(Now, 100);
console.log(timeline.at(Now)); // 100
```

-----

### 変換操作

#### F\#: `map: ('a -> 'b) -> Timeline<'a> -> Timeline<'b>`

#### TS: `.map<B>(f: (value: A) => B): Timeline<B>`

純粋関数を使用してタイムラインの値を変換します。

```typescript
// TS
const numbers = Timeline(5);
const doubled = numbers.map(x => x * 2);
console.log(doubled.at(Now)); // 10

numbers.define(Now, 10);
console.log(doubled.at(Now)); // 20
```

-----

#### F\#: `bind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b>`

#### TS: `.bind<B>(monadf: (value: A) => Timeline<B>): Timeline<B>`

モナドのbind操作で、ネストしたタイムラインを平坦化します。`flatMap`としても知られています。

```typescript
// TS
const outer = Timeline(5);
const result = outer.bind(x => Timeline(x * x));
console.log(result.at(Now)); // 25

outer.define(Now, 3);
console.log(result.at(Now)); // 9
```

-----

#### F\#: `scan: ('state -> 'input -> 'state) -> 'state -> Timeline<'input> -> Timeline<'state>`

#### TS: `.scan<State>(accumulator, initialState): Timeline<State>`

時間を通じて値を累積します（`reduce`に似ていますが、リアクティブです）。

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

### ユーティリティ操作

#### F\#: `link: Timeline<'a> -> Timeline<'a> -> unit`

#### TS: `.link(targetTimeline: Timeline<A>): void`

ソースからターゲットのタイムラインへ一方向のリンクを生成します。

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

#### F\#: `distinctUntilChanged: Timeline<'a> -> Timeline<'a> when 'a : equality`

#### TS: `.distinctUntilChanged(): Timeline<A>`

連続して発行される重複した値を除外します。

```typescript
// TS
const source = Timeline(1);
const distinct = source.distinctUntilChanged();
const watcher = distinct.map(v => { console.log(`値が次に変更されました: ${v}`); return v; });

source.define(Now, 1); // ログは出力されない
source.define(Now, 2); // ログ: "値が次に変更されました: 2"
source.define(Now, 2); // ログは出力されない
source.define(Now, 3); // ログ: "値が次に変更されました: 3"
```

-----

### リソース管理

#### F\#: `using: ResourceFactory<'a, 'b> -> Timeline<'a> -> Timeline<'b> when 'b: null`

#### TS: `.using<B>(resourceFactory): Timeline<B | null>`

ネットワークリクエストやファイルハンドルのように、クリーンアップが必要なリソースを管理します。ソースのタイムラインが変更されると、古いリソースのクリーンアップ関数が自動的に呼び出されます。

```typescript
// TS
const userId = Timeline(1);

const userDataResource = userId.using(id => {
    console.log(`ユーザー${id}のデータを取得中`);
    const abortController = new AbortController();
    const promise = fetch(`/api/users/${id}`, { signal: abortController.signal });

    // メモリリークを防ぐために、クリーンアップ関数は非常に重要です
    return createResource(promise, () => {
        console.log(`ユーザー${id}のリソースをクリーンアップ中`);
        abortController.abort();
    });
});

// ユーザーIDを変更して、クリーンアップと新しいリソースの生成をトリガーする
userId.define(Now, 2);
// コンソールには以下が出力される:
// "ユーザー1のリソースをクリーンアップ中"
// "ユーザー2のデータを取得中"
```

-----

#### F\#: `'a -> (unit -> unit) -> Resource<'a>`

#### TS: `createResource<A>(resource, cleanup): Resource<A>`

`.using()`で使用するリソースオブジェクトを生成するためのヘルパー関数です。

```typescript
// TS
const resource = createResource(
    "my-resource-data",
    () => console.log("my-resource-dataをクリーンアップ中")
);
```

-----

### Nullable操作

`null`値を含む可能性のあるタイムラインには、ランタイムエラーを避けるためにこれらのnull安全な亜種を使用します。F\#では、これは標準関数に型制約を適用することで処理されます。

#### F\#: `nMap: ('a -> 'b) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*注: F\#では、この型制約（`when 'a : null...`）は構文的にジェネリックパラメータ宣言の一部です。この表記はドキュメントの明確化のためのものです。*

#### TS: `.nMap<B>(f): Timeline<B | null>`

null安全なマッピングです。非null値にのみ関数を適用します。入力が`null`の場合、`null`を伝播させます。

```typescript
// TS
const nullableNumbers = Timeline<number | null>(5);
const doubled = nullableNumbers.nMap(x => x * 2);
console.log(doubled.at(Now)); // 10

nullableNumbers.define(Now, null);
console.log(doubled.at(Now)); // null
```

-----

#### F\#: `nBind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*注: F\#では、この型制約（`when 'a : null...`）は構文的にジェネリックパラメータ宣言の一部です。この表記はドキュメントの明確化のためのものです。*

#### TS: `.nBind<B>(monadf): Timeline<B | null>`

null安全なbind操作です。

```typescript
// TS
const maybeNumber = Timeline<number | null>(5);
const result = maybeNumber.nBind(x => Timeline(x.toString()));
console.log(result.at(Now)); // "5"

maybeNumber.define(Now, null);
console.log(result.at(Now)); // null
```

-----

#### F\#: `nUsing: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*注: F\#では、この型制約（`when 'a : null...`）は構文的にジェネリックパラメータ宣言の一部です。この表記はドキュメントの明確化のためのものです。*

#### TS: `.nUsing<B>(resourceFactory): Timeline<B | null>`

null安全なリソース管理です。ファクトリは非null値に対してのみ呼び出されます。

```typescript
// TS
const optionalUserId = Timeline<number | null>(123);
const resource = optionalUserId.nUsing(id => {
    // この部分はidがnullでない場合のみ実行される
    return createResource(`data_for_${id}`, () => {});
});

console.log(resource.at(Now)?.resource); // "data_for_123"

optionalUserId.define(Now, null);
console.log(resource.at(Now)); // null
```

-----

## 合成関数

### 二項操作

#### F\#: `combineLatestWith: ('a -> 'b -> 'c) -> Timeline<'a> -> Timeline<'b> -> Timeline<'c>`

#### TS: `combineLatestWith(f)(timelineA)(timelineB)`

二項関数で2つのタイムラインを結合します。

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

#### F\#: `nCombineLatestWith: ('a -> 'b -> 'c) -> Timeline<'a> -> Timeline<'b> -> Timeline<'c> when 'a: null and 'b: null and 'c: null`

#### TS: `nCombineLatestWith(f)(timelineA)(timelineB)`

`combineLatestWith`のnull安全版です。どちらかの入力タイムラインの値が`null`の場合、結果のタイムラインの値も`null`になります。結合関数`f`は両方の値が非nullの場合にのみ呼び出されます。

```typescript
// TS
const a = Timeline<number | null>(10);
const b = Timeline<number | null>(20);
const sum = nCombineLatestWith((x: number, y: number) => x + y)(a)(b);
console.log(sum.at(Now)); // 30

// 一方のタイムラインがnullになると、結果もnullになる
a.define(Now, null);
console.log(sum.at(Now)); // null
```

-----

### 集計操作

#### F\#: `anyOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `anyOf(timelines): Timeline<boolean>`

複数のブール値タイムラインにまたがる論理ORです。（F\#の`any`とTSの`anyOf`という名前の違いに注意してください）

```typescript
// TS
const flags = [Timeline(true), Timeline(false), Timeline(false)];
const hasAnyTrue = anyOf(flags);
console.log(hasAnyTrue.at(Now)); // true
```

-----

#### F\#: `allOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `allOf(timelines): Timeline<boolean>`

複数のブール値タイムラインにまたがる論理ANDです。（F\#の`all`とTSの`allOf`という名前の違いに注意してください）

```typescript
// TS
const flags = [Timeline(true), Timeline(true), Timeline(false)];
const allTrue = allOf(flags);
console.log(allTrue.at(Now)); // false
```

-----

#### TS: `sumOf(timelines): Timeline<number>`

複数の数値タイムラインの合計です。

```typescript
// TS
const numbers = [Timeline(10), Timeline(20), Timeline(30)];
const total = sumOf(numbers);
console.log(total.at(Now)); // 60
```

-----

#### TS: `maxOf(timelines): Timeline<number>`

複数の数値タイムラインにわたる最大値です。

```typescript
// TS
const numbers = [Timeline(10), Timeline(50), Timeline(30)];
const maximum = maxOf(numbers);
console.log(maximum.at(Now)); // 50
```

-----

#### TS: `minOf(timelines): Timeline<number>`

複数の数値タイムラインにわたる最小値です。

```typescript
// TS
const numbers = [Timeline(10), Timeline(50), Timeline(30)];
const minimum = minOf(numbers);
console.log(minimum.at(Now)); // 10
```

-----

#### TS: `averageOf(timelines): Timeline<number>`

複数の数値タイムラインの平均です。

```typescript
// TS
const numbers = [Timeline(10), Timeline(20), Timeline(30)];
const avg = averageOf(numbers);
console.log(avg.at(Now)); // 20
```

-----

#### TS: `listOf<A>(timelines): Timeline<A[]>`

複数のタイムラインを、それらの値の配列を保持する単一のタイムラインに結合します。

```typescript
// TS
const items = [Timeline("a"), Timeline("b"), Timeline("c")];
const list = listOf(items);
console.log(list.at(Now)); // ["a", "b", "c"]
```

*注: すべての集計操作のnull安全版がTSで利用可能です。これには*\*`nAnyOf`\*\*, **`nAllOf`**, **`nSumOf`**, \*\*`nListOf`\**が含まれます。これらの関数は`null`を含む可能性のあるタイムラインを操作します。入力タイムラインのいずれかの値が`null`の場合、結果のタイムラインの値も`null`になります。*

-----

### 高度な合成

#### F\#: `combineLatest: ('a array -> 'r) -> list<Timeline<'a>> -> Timeline<'r>`

#### TS: `combineLatest(combinerFn)(timelines)`

単純な畳み込みでは実現できない複雑なロジックのための、汎用的なN項結合関数です。

```typescript
// TS
const timelines = [Timeline(10), Timeline(2), Timeline(5)] as const;
// (a + b) / c
const result = combineLatest((a, b, c) => (a + b) / c)(timelines);
console.log(result.at(Now)); // (10 + 2) / 5 = 2.4
```

-----

#### TS: `nCombineLatest(combinerFn)(timelines)`

`combineLatest`のnull安全版です。入力タイムラインのいずれかに`null`値が含まれる場合、出力タイムラインは即座に`null`になります。`combinerFn`は、すべての入力タイムラインが非null値を持つ場合にのみ実行されます。

```typescript
// TS
const timelines = [Timeline<number|null>(10), Timeline<number|null>(2), Timeline<number|null>(5)] as const;
const result = nCombineLatest((a, b, c) => (a + b) / c)(timelines);
console.log(result.at(Now)); // 2.4

// 一つの入力をnullにする
timelines[1].define(Now, null);
console.log(result.at(Now)); // null
```

-----

#### F\#: `foldTimelines: (Timeline<'b> -> Timeline<'a> -> Timeline<'b>) -> Timeline<'b> -> list<Timeline<'a>> -> Timeline<'b>`

#### TS: `foldTimelines(timelines, initial, accumulator)`

タイムラインにわたる汎用的な畳み込み操作です。これは`sumOf`、`anyOf`などが構築される基になる強力なプリミティブです。

```typescript
// TS
const numbers = [Timeline(1), Timeline(2), Timeline(3)];
const product = foldTimelines(
    numbers,
    Timeline(1), // 初期値タイムライン
    (acc, curr) => combineLatestWith((a: number, b: number) => a * b)(acc)(curr)
);
console.log(product.at(Now)); // 6
```

-----

### ヘルパー関数

#### F\#: `(>>>): ('a -> Timeline<'b>) -> ('b -> Timeline<'c>) -> ('a -> Timeline<'c>)`

#### TS: `pipeBind`

モナド関数（値を受け取り新しい`Timeline`を返す関数）を連鎖させるためのヘルパー関数です。ネストした`.bind()`呼び出しに代わる、より宣言的で読みやすい方法を可能にします。F\#ではこの目的のために`>>>`演算子を使用します。

```typescript
// TS
// ネストした.bind()を使用
const input = Timeline(1);
const result1 = input.bind(a =>
    Timeline(a * 2).bind(b =>
        Timeline(b + 5)
    )
);
console.log(result1.at(Now)); // 7

// pipeBindを使用
const double = (a: number) => Timeline(a * 2);
const addFive = (b: number) => Timeline(b + 5);

const composed = pipeBind(double)(addFive);
const result2 = composed(1); // 値が7のTimelineを返す
console.log(result2.at(Now)); // 7
```

-----

## エラーハンドリング

タイムラインのコールバック内（例: `map`や`scan`操作）で発生する例外をキャッチして処理するために、グローバルなエラーハンドラを設定できます。これは、中央集権的なロギングやカスタムエラー報告に便利です。

#### TS: `setErrorHandler(handler: TimelineErrorHandler | null): void`

タイムラインシステムのグローバルエラーハンドラを設定または解除します。

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
    console.error("タイムラインシステムエラー:", error, "コンテキスト:", context);
    // このエラーをロギングサービスに送信することもできます。
});
```

-----

## デバッグサポート

#### F\#: `module DebugControl`

#### TS: `Debug Control`

URL（`?debug=true`）、`localStorage`、または`NODE_ENV`を介してデバッグモードを有効にします。

```typescript
// TS
// デバッグモードを永続的に有効にする（ページのリロードが必要）
DebugControl.enable();

// デバッグモードを永続的に無効にする（ページのリロードが必要）
DebugControl.disable();

// デバッグモードがアクティブかどうかを確認する
console.log(DebugControl.isEnabled());

// 現在のセッションでデバッグモードを有効にする
DebugControl.enableTemporary();
```

-----

### `Debug Information`

#### F\#: `Debug.getInfo: unit -> {| Scopes: ScopeDebugInfo list; ... |}`

#### TS: `DebugUtils.getInfo()`

```typescript
// TS
// すべてのイリュージョンと依存関係に関する包括的なデバッグ情報を取得する
const debugInfo = DebugUtils.getInfo();
console.log(`総イリュージョン数: ${debugInfo.totalIllusions}`);
```

-----

#### F\#: `Debug.printTree: unit -> unit`

#### TS: `DebugUtils.printTree()`

```typescript
// TS
// 整形された依存関係ツリーをコンソールに出力して、簡単に検査できるようにする
DebugUtils.printTree();
/*
出力:
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

#### F\#: `Debug.findAllCycles: unit -> TimelineId list list`

#### TS: `DebugUtils.findAllCycles()`

```typescript
// TS
// グラフ内の循環依存を検出して一覧表示する
const cycles = DebugUtils.findAllCycles();
if (cycles.length > 0) {
    console.log('循環依存が検出されました:', cycles);
}
/*
出力 (循環が存在する場合):
Found circular dependencies: [
  [ "timelineId-A", "timelineId-B", "timelineId-C" ]
]
*/
```

-----

### 補足: デバッグモード起動の詳細

`DebugControl`による手動切り替えに加えて、ライブラリは以下の条件を順に評価して自動的にデバッグモードを有効にします：

1.  **URLパラメータ**: URLに`?debug=true`が含まれる場合。

2.  **localStorage**: `localStorage`に`"timeline-debug": "true"`のキーと値のペアがある場合。

3.  **ビルド環境**: Webpackのようなビルドツールによってグローバル変数`__DEV__`が`true`に設定されている場合。

4.  **開発ホスト名**: サイトが`localhost`、`127.0.0.1`、または`192.168.`で始まるホスト名からアクセスされた場合。

5.  **Node.js環境**: `process.env.NODE_ENV`が`'development'`に設定されている場合。
