# Chapter 1: すべての基礎 combineLatestWith

Unit 4で確立したApplicative Functorの概念、すなわち「独立したコンテナを2項演算で合成する」という操作を、`Timeline`ライブラリで具現化するものが`combineLatestWith`です。これは、非同期で独立した複数のソースを合成するために設計された、Applicative操作の具体的な実装です。

後続の章で登場する`anyOf`や`sumOf`といった高レベルな合成関数は、すべてこの`combineLatestWith`というプリミティブな操作の上に成り立っています。

## 名前の由来

`combineLatestWith`という名前は、他の主要なリアクティブプログラミングライブラリ（RxJSなど）でも標準的に使われている用語であり、その振る舞いを正確に表現しています。すなわち、複数のソースから**最新の（latest）** 値を**組み合わせ（combine）**、提供された関数を**使って（with）** 新しい値を生成する、という意味が込められています。

## API定義

#### F\#: `combineLatestWith: ('a -> 'b -> 'c) -> Timeline<'a> -> Timeline<'b> -> Timeline<'c>`

#### TS: `combineLatestWith<A, B, C>(f: (valA: A, valB: B) => C) => (timelineA: Timeline<A>) => (timelineB: Timeline<B>): Timeline<C>`

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