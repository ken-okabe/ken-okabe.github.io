:::lang-en

# Chapter 1: The Foundation of Everything: combineLatestWith

`combineLatestWith` is what embodies the concept of the Applicative Functor established in Unit 4—the operation of "combining independent containers with a binary operation"—in the `Timeline` library. It is a concrete implementation of the Applicative operation, designed to combine multiple independent, asynchronous sources.

The high-level composition functions that will appear in subsequent chapters, such as `anyOf` and `sumOf`, are all built on top of this primitive operation, `combineLatestWith`.

## Origin of the Name

The name `combineLatestWith` is a standard term used in other major reactive programming libraries (like RxJS) and accurately expresses its behavior. That is, it implies that it **combines** the **latest** values from multiple sources and generates a new value **with** the provided function.

## API Definition

##### F\#: `combineLatestWith: ('a -> 'b -> 'c) -> Timeline<'a> -> Timeline<'b> -> Timeline<'c>`

##### TS: `combineLatestWith<A, B, C>(f: (valA: A, valB: B) => C) => (timelineA: Timeline<A>) => (timelineB: Timeline<B>): Timeline<C>`

The type signature of `combineLatestWith` conforms to the `map2` pattern of the Applicative Functor we learned in Unit 4.

This signature is composed of the following elements:

1.  **`('a -> 'b -> 'c)`**: A binary operation function. It takes a value of type `'a` as the first argument and a value of type `'b` as the second argument, and returns a result of type `'c`.
2.  **`Timeline<'a>`**: The first source `Timeline`. The latest value of this `Timeline` is passed as the first argument to the binary operation function.
3.  **`Timeline<'b>`**: The second source `Timeline`. The latest value of this `Timeline` is passed as the second argument to the binary operation function.
4.  **`Timeline<'c>`**: The new `Timeline` that is generated as a result. The result of the binary operation function becomes the value of this `Timeline`.

## Behavior

The behavior of `combineLatestWith` is defined in two phases: **initialization** and **update**.

1.  **Initialization**: When the result `Timeline` is created, `combineLatestWith` immediately checks the current values of both source `Timeline`s and applies the binary operation function to determine the initial value of the result `Timeline`.

2.  **Update**: The result `Timeline` monitors both source `Timeline`s. Whenever **either** source is updated, it gets the **latest** current values from both sources, applies the binary operation function again, and defines a new value on the result `Timeline`.

## Practical Code Example

Let's create a `Timeline` that reactively calculates the sum of two independent counters.

```typescript
// TS
const counterA = Timeline(10);
const counterB = Timeline(20);

// Combine the two Timelines using a binary operation (+)
const sumTimeline = combineLatestWith((a: number, b: number) => a + b)(counterA)(counterB);

// The initial value is 10 + 20 = 30
console.log(sumTimeline.at(Now)); // 30

// Update counterA
console.log("Updating CounterA to 15...");
counterA.define(Now, 15);

// sumTimeline is automatically recalculated (15 + 20 = 35)
console.log("Current Sum after A updated: %d", sumTimeline.at(Now)); // 35
```

## Internal Implementation

Internally, this operation registers dependencies from the two source `Timeline`s to the result `Timeline` in `DependencyCore`. Also, by using the `FinalizationRegistry` in `timeline.ts` (equivalent to `GcRegistry` in F\#), it has a memory-safe design where these dependencies are automatically cleaned up when the result `Timeline` becomes eligible for garbage collection.

## Canvas Demo (Placeholder)

:::

:::lang-ja

# Chapter 1: すべての基礎 combineLatestWith

Unit 4で確立したApplicative Functorの概念、すなわち「独立したコンテナを2項演算で合成する」という操作を、`Timeline`ライブラリで具現化するものが`combineLatestWith`です。これは、非同期で独立した複数のソースを合成するために設計された、Applicative操作の具体的な実装です。

後続の章で登場する`anyOf`や`sumOf`といった高レベルな合成関数は、すべてこの`combineLatestWith`というプリミティブな操作の上に成り立っています。

## 名前の由来

`combineLatestWith`という名前は、他の主要なリアクティブプログラミングライブラリ（RxJSなど）でも標準的に使われている用語であり、その振る舞いを正確に表現しています。すなわち、複数のソースから**最新の（latest）** 値を**組み合わせ（combine）**、提供された関数を**使って（with）** 新しい値を生成する、という意味が込められています。

## API定義

##### F\#: `combineLatestWith: ('a -> 'b -> 'c) -> Timeline<'a> -> Timeline<'b> -> Timeline<'c>`

##### TS: `combineLatestWith<A, B, C>(f: (valA: A, valB: B) => C) => (timelineA: Timeline<A>) => (timelineB: Timeline<B>): Timeline<C>`

`combineLatestWith`の型シグネチャは、Unit 4で学んだApplicative Functorの`map2`パターンに準拠しています。

このシグネチャは、以下の要素で構成されています。

1.  **`('a -> 'b -> 'c)`**: 2項演算関数。1つ目の引数として`'a`型、2つ目の引数として`'b`型の値を受け取り、`'c`型の結果を返します。
2.  **`Timeline<'a>`**: 1つ目のソース`Timeline`。この`Timeline`の最新値が、2項演算関数の第1引数に渡されます。
3.  **`Timeline<'b>`**: 2つ目のソース`Timeline`。この`Timeline`の最新値が、2項演算関数の第2引数に渡されます。
4.  **`Timeline<'c>`**: 結果として生成される新しい`Timeline`。2項演算関数の実行結果が、この`Timeline`の値となります。

## 動作

`combineLatestWith`の振る舞いは、**初期化**と**更新**の2つのフェーズで定義されます。

1.  **初期化**: 結果`Timeline`が生成されると、`combineLatestWith`は即座に両方のソース`Timeline`の現在値を確認し、2項演算関数を適用して結果`Timeline`の初期値を決定します。

2.  **更新**: 結果`Timeline`は、両方のソース`Timeline`を監視します。**いずれか**のソースが更新されるたびに、両方のソースから**最新の**現在値を取得し、再度2項演算関数を適用して、結果`Timeline`に新しい値を定義します。

## 実践コード例

2つの独立したカウンターの合計値をリアクティブに算出する`Timeline`を作成してみましょう。

```typescript
// TS
const counterA = Timeline(10);
const counterB = Timeline(20);

// 2項演算(+)を使って、2つのTimelineを合成する
const sumTimeline = combineLatestWith((a: number, b: number) => a + b)(counterA)(counterB);

// 初期値は 10 + 20 = 30
console.log(sumTimeline.at(Now)); // 30

// counterAを更新する
console.log("Updating CounterA to 15...");
counterA.define(Now, 15);

// sumTimelineは自動的に再計算される (15 + 20 = 35)
console.log("Current Sum after A updated: %d", sumTimeline.at(Now)); // 35
```

## 内部実装

この操作は内部で、2つのソース`Timeline`から結果`Timeline`への依存関係を`DependencyCore`に登録します。また、`timeline.ts`の`FinalizationRegistry`（F\#の`GcRegistry`に相当）を利用することで、結果`Timeline`がガベージコレクションの対象となった際に、これらの依存関係が自動的にクリーンアップされるメモリセーフな設計が施されています。

## Canvasデモ (Placeholder)

:::