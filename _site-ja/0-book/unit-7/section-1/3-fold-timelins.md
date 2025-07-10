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