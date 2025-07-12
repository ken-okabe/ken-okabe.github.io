:::lang-en

# Chapter 3: `foldTimelines` — Folding with Monoids

## Introduction

In Chapter 2, we learned how to combine two `Timeline`s using binary operations that form a Monoid. In this chapter, we will extend that concept further and explore how to fold a **list** of `Timeline`s (an arbitrary number of `Timeline`s) into a single `Timeline`.

The general-purpose tool for this is `foldTimelines`. This is an application of the standard folding operation in functional programming, `fold` (or `reduce`), to the world of `Timeline`, and it relies completely on the Monoid structure established in Chapter 2.

## `foldTimelines` API

#### F\#: `foldTimelines: (Timeline<'b> -> Timeline<'a> -> Timeline<'b>) -> Timeline<'b> -> list<Timeline<'a>> -> Timeline<'b>`

#### TS: `foldTimelines<A, B>(timelines: readonly Timeline<A>[], initialTimeline: Timeline<B>, accumulator: (acc: Timeline<B>, current: Timeline<A>) => Timeline<B>): Timeline<B>`

`foldTimelines` takes a list of `Timeline`s and generates a single `Timeline` by successively applying the "binary operation" of a Monoid to the elements of the list, using the "identity element" of the Monoid as the initial value.

The breakdown of the arguments corresponds perfectly to the components of a Monoid:

- `timelines`: The list of `Timeline`s to be folded.

- `initialTimeline`: The **identity element** of the Monoid (the initial value for the fold).

- `accumulator`: The **binary operation** of the Monoid (e.g., `orOf` as defined in Chapter 2).

## Derivation of High-Level APIs

The true value of `foldTimelines` is that intuitive high-level APIs like `anyOf` and `sumOf` can be realized simply by combining `foldTimelines` with various Monoids, without needing any special implementation. They are merely thin wrappers around `foldTimelines`.

### `anyOf`

#### F\#: `anyOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `anyOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

This is derived by applying `foldTimelines` to a list of `boolean`s, using "identity element `Timeline(false)`" and "binary operation `orOf`."

#### Implementation Code

```typescript
// TS
export const anyOf = (booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean> => {
    return foldTimelines(booleanTimelines, FalseTimeline, orOf);
};
```

### `allOf`

#### F\#: `allOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `allOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

Derived from "identity element `Timeline(true)`" and "binary operation `andOf`."

### `sumOf`

#### TS: `sumOf(numberTimelines: readonly Timeline<number>[]): Timeline<number>`

Derived from "identity element `Timeline(0)`" and "binary operation `addOf`."

### `listOf`

#### F\#: `listOf: list<Timeline<'a>> -> Timeline<'a list>`

#### TS: `listOf<A>(timelines: readonly Timeline<A>[]): Timeline<A[]>`

Derived from the **Array Monoid** emphasized in Chapter 2, namely "identity element `Timeline([])`" and "binary operation `concatOf`." Since this function can simply combine multiple `Timeline`s into a single `Timeline` holding an array of their values, it is easy for an AI to handle when generating code and tends to be used preferentially.

## Conclusion

It is now clear that the high-level API group, including `anyOf` and `sumOf`, is not a collection of ad-hoc, individual functions. They are all derived with mathematical necessity from a single general abstraction, `foldTimelines`, and the Monoid structure that each type possesses.

This hierarchical structure of `combineLatestWith` (Applicative) → binary operation (Monoid) → `foldTimelines` → high-level API is the core of this library's design beauty and the robustness that eliminates code duplication.

## Canvas Demo (Placeholder)

:::

:::lang-ja

# Chapter 3: `foldTimelines` — Monoidによる畳み込み

## 導入

Chapter 2では、Monoidを形成する2項演算を使って、2つの`Timeline`を合成する方法を学びました。この章では、その概念をさらに拡張し、`Timeline`の**リスト**（任意個の`Timeline`）を、1つの`Timeline`へと畳み込む方法を探求します。

そのための汎用的な道具が`foldTimelines`です。これは、関数型プログラミングにおける標準的な畳み込み操作である`fold`（または`reduce`）を`Timeline`の世界に適用したものであり、Chapter 2で確立したMonoidの構造に完全に依存しています。

## `foldTimelines` API

#### F\#: `foldTimelines: (Timeline<'b> -> Timeline<'a> -> Timeline<'b>) -> Timeline<'b> -> list<Timeline<'a>> -> Timeline<'b>`

#### TS: `foldTimelines<A, B>(timelines: readonly Timeline<A>[], initialTimeline: Timeline<B>, accumulator: (acc: Timeline<B>, current: Timeline<A>) => Timeline<B>): Timeline<B>`

`foldTimelines`は、`Timeline`のリストを受け取り、Monoidの「単位元」を初期値として、Monoidの「2項演算」をリストの要素に次々と適用していくことで、最終的に1つの`Timeline`を生成します。

引数の内訳は、Monoidの構成要素に完璧に対応しています。

- `timelines`: 畳み込みの対象となる`Timeline`のリスト。

- `initialTimeline`: Monoidの**単位元**（畳み込みの初期値）。

- `accumulator`: Monoidの**2項演算**（Chapter 2で定義した`orOf`など）。

## 高レベルAPIの導出

`foldTimelines`の真価は、`anyOf`, `sumOf`といった直感的な高レベルAPIが、特別な実装を必要とせず、`foldTimelines`と各種Monoidの組み合わせだけで実現できる点にあります。これらは`foldTimelines`の薄いラッパーに過ぎません。

### `anyOf`

#### F\#: `anyOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `anyOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

`boolean`のリストに対し、「単位元`Timeline(false)`」と「2項演算`orOf`」を使って`foldTimelines`を適用することで導出されます。

#### 実装コード

```typescript
// TS
export const anyOf = (booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean> => {
    return foldTimelines(booleanTimelines, FalseTimeline, orOf);
};
```

### `allOf`

#### F\#: `allOf: list<Timeline<bool>> -> Timeline<bool>`

#### TS: `allOf(booleanTimelines: readonly Timeline<boolean>[]): Timeline<boolean>`

「単位元`Timeline(true)`」と「2項演算`andOf`」から導出されます。

### `sumOf`

#### TS: `sumOf(numberTimelines: readonly Timeline<number>[]): Timeline<number>`

「単位元`Timeline(0)`」と「2項演算`addOf`」から導出されます。

### `listOf`

#### F\#: `listOf: list<Timeline<'a>> -> Timeline<'a list>`

#### TS: `listOf<A>(timelines: readonly Timeline<A>[]): Timeline<A[]>`

Chapter 2で強調した**配列のMonoid**、すなわち「単位元`Timeline([])`」と「2項演算`concatOf`」から導出されます。この関数は、複数の`Timeline`を、値の配列を持つ単一の`Timeline`へとシンプルにまとめることができるため、AIがコードを生成する際に扱いやすく、好んで使用する傾向にあります。

## 結論

`anyOf`, `sumOf`といった高レベルAPI群が、場当たり的に作られた個別機能の集合ではないことが、これで明らかになりました。これらはすべて、`foldTimelines`という一つの汎用的な抽象化と、それぞれの型が持つMonoid構造から、数学的な必然性をもって導出されています。

`combineLatestWith`（Applicative） → 2項演算（Monoid） → `foldTimelines` → 高レベルAPIという階層構造こそが、本ライブラリの設計の美しさと、コードの重複を排した堅牢性の根幹をなすものです。

## Canvasデモ (Placeholder)

:::