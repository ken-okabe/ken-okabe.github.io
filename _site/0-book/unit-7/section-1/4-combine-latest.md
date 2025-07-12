:::lang-en

# Chapter 4: N-ary Operations — `combineLatest`

## Introduction

`foldTimelines`, which we learned about in Chapter 3, is very powerful for operations that sequentially fold a list using a single Monoid (`+` or `concat`), such as `sumOf` or `listOf`. However, there are cases where we want to handle more complex relationships between N terms that cannot be expressed by a simple fold, such as `(a + b) / c`.

`combineLatest` is what realizes such general-purpose N-ary operations that cannot be expressed by `fold`. It is the most powerful primitive for combining an arbitrary number of `Timeline`s with a single N-ary function.

## `combineLatest` API

#### F\#: `combineLatest: ('a array -> 'r) -> list<Timeline<'a>> -> Timeline<'r>`

#### TS: `combineLatest<T extends readonly Timeline<any>[], R>(combinerFn: (...values: TimelinesToValues<T>) => R) => (timelines: T): Timeline<R>`

`combineLatest` takes a list (or tuple) of `Timeline`s and an N-ary composition function (`combinerFn`) that takes the latest values of those `Timeline`s as arguments.

## Practical Code Example

Let's look at an example of performing the calculation `(a + b) / c` using three `Timeline`s. This cannot be achieved with a simple `fold`.

```typescript
// TS
const timelineA = Timeline(10);
const timelineB = Timeline(2);
const timelineC = Timeline(5);

const timelines = [timelineA, timelineB, timelineC] as const;

// A combinerFn that takes the latest values of the three Timelines and performs a complex calculation
const resultTimeline = combineLatest(
    (a, b, c) => (a + b) / c
)(timelines);

// The initial value is (10 + 2) / 5 = 2.4
console.log(resultTimeline.at(Now)); // 2.4

// When timelineC is updated, it is immediately recalculated
timelineC.define(Now, 6);

// The new value is (10 + 2) / 6 = 2
console.log(resultTimeline.at(Now)); // 2
```

## Conclusion

`combineLatest` is a general-purpose function that can be considered a "last resort" for handling any N-ary composition logic that does not fit the pattern of `fold`.

This completes the hierarchy of the library's composition functions. By using the high-level APIs from Chapter 3 for simple Monoidal folds, and `combineLatest` for more complex and special cases, you can handle any pattern of `Timeline` composition declaratively and robustly.

## Canvas Demo (Placeholder)

:::

:::lang-ja

# Chapter 4: N項演算 — `combineLatest`

## 導入

Chapter 3で学んだ`foldTimelines`は、`sumOf`や`listOf`のように、単一のMonoid（`+`や`concat`）を使ってリストを順次畳み込む操作には非常に強力です。しかし、`(a + b) / c` のように、単純な畳み込みでは表現できない、より複雑なN項間の関係性を扱いたいケースもあります。

このような、`fold`では表現できない汎用的なN項演算を実現するのが`combineLatest`です。これは、任意個の`Timeline`を、1つのN項関数で合成するための、最もパワフルなプリミティブです。

## `combineLatest` API

#### F\#: `combineLatest: ('a array -> 'r) -> list<Timeline<'a>> -> Timeline<'r>`

#### TS: `combineLatest<T extends readonly Timeline<any>[], R>(combinerFn: (...values: TimelinesToValues<T>) => R) => (timelines: T): Timeline<R>`

`combineLatest`は、`Timeline`のリスト（またはタプル）と、それらの`Timeline`の最新値を引数として受け取るN項の合成関数（`combinerFn`）を受け取ります。

## 実践コード例

3つの`Timeline`を使い、`(a + b) / c` という計算を行う例を見てみましょう。これは単純な`fold`では実現できません。

```typescript
// TS
const timelineA = Timeline(10);
const timelineB = Timeline(2);
const timelineC = Timeline(5);

const timelines = [timelineA, timelineB, timelineC] as const;

// 3つのTimelineの最新値を取り、複雑な計算を行うcombinerFn
const resultTimeline = combineLatest(
    (a, b, c) => (a + b) / c
)(timelines);

// 初期値は (10 + 2) / 5 = 2.4
console.log(resultTimeline.at(Now)); // 2.4

// timelineCを更新すると、即座に再計算される
timelineC.define(Now, 6);

// 新しい値は (10 + 2) / 6 = 2
console.log(resultTimeline.at(Now)); // 2
```

## 結論

`combineLatest`は、`fold`のパターンに収まらない、あらゆるN項の合成ロジックに対応できる、いわば「最終手段」となる汎用的な関数です。

これにより、ライブラリの合成関数の階層が完成します。単純なMonoid的な畳み込みにはChapter 3の高レベルAPIを使い、より複雑で特殊なケースには`combineLatest`を使うことで、あらゆるパターンの`Timeline`の合成に、宣言的かつ堅牢に対処することができます。

## Canvasデモ (Placeholder)

:::