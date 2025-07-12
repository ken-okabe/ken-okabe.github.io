---
title: 'Chapter 3: foldTimelines — Monoidによる畳み込み'
description: >-
  Chapter
  2では、Monoidを形成する二項演算を用いて2つのTimelineを結合する方法を学びました。この章では、その概念をさらに拡張し、Timelineのリスト（任意の数のTimeline）を1つのTimelineに畳み込む方法を探求します。
---
## はじめに

Chapter 2では、**Monoid**を形成する二項演算を用いて2つの`Timeline`を結合する方法を学びました。この章では、その概念をさらに拡張し、`Timeline`の**リスト**（任意の数の`Timeline`）を1つの`Timeline`に畳み込む方法を探求します。

そのための汎用的なツールが`foldTimelines`です。これは、関数型プログラミングにおける標準的な畳み込み操作である`fold`（または`reduce`）を`Timeline`の世界に応用したものであり、Chapter 2で確立したMonoidの構造に完全に依存しています。

-----

## `foldTimelines` API

### `foldTimelines`

#### F\#: `foldTimelines: (Timeline<'b> -> Timeline<'a> -> Timeline<'b>) -> Timeline<'b> -> list<Timeline<'a>> -> Timeline<'b>`

#### TS: `foldTimelines<A, B>(timelines: readonly Timeline<A>[], initialTimeline: Timeline<B>, accumulator: (acc: Timeline<B>, current: Timeline<A>) => Timeline<B>): Timeline<B>`

```typescript
// TS 実装
export const foldTimelines = <A, B>(
    timelines: readonly Timeline<A>[],
    initialTimeline: Timeline<B>,
    accumulator: (acc: Timeline<B>, current: Timeline<A>) => Timeline<B>
): Timeline<B> => {
    return timelines.reduce(accumulator, initialTimeline);
};
```

`foldTimelines`は`Timeline`のリストを受け取り、Monoidの「単位元」を初期値として、リストの要素にMonoidの「二項演算」を次々と適用することで、単一の`Timeline`を生成します。

引数の内訳は、Monoidの構成要素と完全に対応しています。

  * `timelines`: 畳み込まれる`Timeline`のリスト。
  * `initialTimeline`: Monoidの**単位元**（畳み込みの初期値）。
  * `accumulator`: Monoidの**二項演算**（例：Chapter2で定義した`orOf`）。

-----

## 高レベルAPIの導出

`foldTimelines`の真価は、`anyOf`や`sumOf`のような直感的な高レベルAPIが、特別な実装を必要とせず、様々なMonoidと`foldTimelines`を組み合わせるだけで実現できる点にあります。それらは`foldTimelines`の薄いラッパーに過ぎません。

### `anyOf`

#### F\#: `anyOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `anyOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

```typescript
// TS 実装
export const anyOf = (booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean> => {
    return foldTimelines(booleanTimelines, FalseTimeline, orOf);
};
```

複数のブール値タイムラインにまたがる論理和（OR）です。これは**論理和Monoid**を用いて`foldTimelines`を適用することで導出されます。

  * **単位元**: `Timeline(false)`
  * **二項演算**: `orOf`

<!-- end list -->

```typescript
// TS 利用例
const flags = [Timeline(true), Timeline(false), Timeline(false)];
const hasAnyTrue = anyOf(flags);
console.log(hasAnyTrue.at(Now)); // true
```

### `allOf`

#### F\#: `allOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `allOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

```typescript
// TS 実装
export const allOf = (booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean> => {
    return foldTimelines(booleanTimelines, TrueTimeline, andOf);
};
```

複数のブール値タイムラインにまたがる論理積（AND）です。これは**論理積Monoid**を用いて導出されます。

  * **単位元**: `Timeline(true)`
  * **二項演算**: `andOf`

<!-- end list -->

```typescript
// TS 利用例
const flags = [Timeline(true), Timeline(true), Timeline(false)];
const allTrue = allOf(flags);
console.log(allTrue.at(Now)); // false
```

### `sumOf`

#### TS: `sumOf(numberTimelines: readonly Timeline<number>[]): Timeline<number>`

```typescript
// TS 実装
export const sumOf = (numberTimelines: readonly Timeline<number>[]): Timeline<number> => {
    return foldTimelines(numberTimelines, Timeline(0), addOf);
};
```

複数の数値タイムラインの合計です。これは**加算Monoid**を用いて導出されます。

  * **単位元**: `Timeline(0)`
  * **二項演算**: `addOf`

<!-- end list -->

```typescript
// TS 利用例
const numbers = [Timeline(10), Timeline(20), Timeline(30)];
const total = sumOf(numbers);
console.log(total.at(Now)); // 60
```

### `maxOf`

#### TS: `maxOf(timelines): Timeline<number>`

```typescript
// TS 実装
export const maxOf = (numberTimelines: readonly Timeline<number>[]): Timeline<number> => {
    return foldTimelines(numberTimelines, Timeline(-Infinity), maxOf2);
};
```

複数の数値タイムラインにまたがる最大値です。これは**最大値Monoid**から導出されます。

  * **単位元**: `Timeline(-Infinity)`
  * **二項演算**: タイムライン用の二項`max`関数。

<!-- end list -->

```typescript
// TS 利用例
const numbers = [Timeline(10), Timeline(50), Timeline(30)];
const maximum = maxOf(numbers);
console.log(maximum.at(Now)); // 50
```

### `minOf`

#### TS: `minOf(timelines): Timeline<number>`

```typescript
// TS 実装
export const minOf = (numberTimelines: readonly Timeline<number>[]): Timeline<number> => {
    return foldTimelines(numberTimelines, Timeline(Infinity), minOf2);
};
```

複数の数値タイムラインにまたがる最小値です。これは**最小値Monoid**から導出されます。

  * **単位元**: `Timeline(Infinity)`
  * **二項演算**: タイムライン用の二項`min`関数。

<!-- end list -->

```typescript
// TS 利用例
const numbers = [Timeline(10), Timeline(50), Timeline(30)];
const minimum = minOf(numbers);
console.log(minimum.at(Now)); // 10
```

### `averageOf`

#### TS: `averageOf(timelines): Timeline<number>`

```typescript
// TS 実装
export const averageOf = (numberTimelines: readonly Timeline<number>[]): Timeline<number> => {
    if (numberTimelines.length === 0) return Timeline(0);
    return sumOf(numberTimelines).map(sum => sum / numberTimelines.length);
};
```

複数の数値タイムラインの平均です。これは単純なMonoidではありませんが、概念的には似ています。`sumOf`とタイムラインの数を探すために畳み込み、それらを割る新しいタイムラインを作成することで導出できます。

```typescript
// TS 利用例
const numbers = [Timeline(10), Timeline(20), Timeline(30)];
const avg = averageOf(numbers);
console.log(avg.at(Now)); // 20
```

### `listOf`

#### F\#: `listOf: list<Timeline<'a>> -> Timeline<'a list>`

#### TS: `listOf<A>(timelines: readonly Timeline<A>[]): Timeline<A[]>`

```typescript
// TS 実装
export const listOf = <A>(
    timelines: readonly Timeline<A>[]
): Timeline<A[]> => {
    const emptyArrayTimeline = Timeline<A[]>([]);
    return foldTimelines(timelines, emptyArrayTimeline, concatOf) as Timeline<A[]>;
};
```

複数のタイムラインを、それらの値の配列を保持する単一のタイムラインに結合します。これはChapter2で強調された**配列Monoid**から導出されます。

  * **単位元**: `Timeline([])`
  * **二項演算**: `concatOf`

この関数は複数の`Timeline`を、それらの値の配列を持つ単一の`Timeline`に単純に結合できるため、AIがコードを生成する際に扱いやすく、優先的に使用される傾向があります。

```typescript
// TS 利用例
const items = [Timeline("a"), Timeline("b"), Timeline("c")];
const list = listOf(items);
console.log(list.at(Now)); // ["a", "b", "c"]
```

-----

## 結論

`anyOf`や`sumOf`を含む高レベルAPI群が、場当たり的で個別な関数の集まりではないことが明らかになりました。それらはすべて、単一の汎用的な抽象概念である`foldTimelines`と、各型が持つMonoid構造から、数学的な必然性をもって導出されています。

`combineLatestWith`（Applicative） → 二項演算（Monoid） → `foldTimelines` → 高レベルAPIというこの階層構造こそが、このライブラリの設計美と、コードの重複を排除した堅牢性の核となっています。
 
## Canvasデモ (Placeholder)
