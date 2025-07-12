---
title: 'Chapter 2: 二項演算とMonoid'
description: >-
  Chapter
  1で学んだcombineLatestWithは、あらゆる2項演算をTimelineの世界に持ち込むための、汎用的なプリミティブです。この章では、そのcombineLatestWithをより具体的に、そして安全に利用するためのヘルパー関数群を定義します。
---
Chapter 1で学んだ`combineLatestWith`は、あらゆる2項演算を`Timeline`の世界に持ち込むための、汎用的なプリミティブです。この章では、その`combineLatestWith`をより具体的に、そして安全に利用するためのヘルパー関数群を定義します。

重要なのは、これから定義する2項演算が、Unit 2で学んだ**Monoid**という数学的構造に基づいている点です。Monoidは、「ある型」「その型の2つの値を取り、同じ型の値を返す**結合法則**を満たす2項演算」「その演算における**単位元**」の3つの組で定義される代数的構造でした。

この章で示すのは、値レベルのMonoidが、`combineLatestWith`（Applicativeの`map2`操作）によって、そのまま`Timeline`コンテナレベルのMonoidへと、その美しい構造を保ったまま引き継がれる様子です。

## 2項演算ヘルパー関数

これから紹介する`orOf`, `andOf`, `addOf`, `concatOf`といった関数は、すべて`combineLatestWith`を特定のMonoid演算で特殊化したものです。

### 論理和: orOf

#### F\#**: `orOF: Timeline<bool> -> Timeline<bool> -> Timeline<bool>`

#### TS**: `orOf(timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean>`

<!-- end list -->

2つの`Timeline<boolean>`を論理和（`||`）で合成します。

この操作の基盤となるのは、`boolean`型における論理和のMonoidです。

- **型**: `boolean`

- **2項演算**: `||` (OR)

- **単位元**: `false` (`false || x`は常に`x`)

このMonoidの性質が、`orOf`によって`Timeline`レベルに引き継がれます。

```typescript
// TS
// 実装は combineLatestWith を利用している
const orOf = (timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean> =>
    combineLatestWith((a: boolean, b: boolean) => a || b)(timelineA)(timelineB);
```

-----

### 論理積: andOf

#### F\#**: `andOf: Timeline<bool> -> Timeline<bool> -> Timeline<bool>`

#### TS**: `andOf(timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean>`

2つの`Timeline<boolean>`を論理積（`&&`）で合成します。

これは、論理積のMonoidに基づいています。

- **型**: `boolean`

- **2項演算**: `&&` (AND)

- **単位元**: `true` (`true && x`は常に`x`)

-----

### 加算: addOf

#### F\#**: (F\#版には直接のヘルパーなし。`combineLatestWith (+)` を使用)

#### TS**: `addOf(timelineA: Timeline<number>, timelineB: Timeline<number>): Timeline<number>`

2つの`Timeline<number>`を加算（`+`）で合成します。

これは、数値の加算におけるMonoidに基づいています。

- **型**: `number`

- **2項演算**: `+` (Addition)

- **単位元**: `0` (`0 + x`は常に`x`)

-----

### 配列の結合: concatOf

**F\#**: `concatOf: Timeline<'a list> -> Timeline<'a> -> Timeline<'a list>`

**TS**: `concatOf(timelineA: Timeline<any[]>, timelineB: Timeline<any>): Timeline<any[]>`

`concat`は、2つの配列を結合して1つの新しい配列を作る操作です。この単純な操作もまた、極めて重要なMonoidを形成します。

- **型**: `array<'a>` (任意の型の配列)

- **2項演算**: `concat` (配列の結合)

- **単位元**: `[]` (空の配列) (`[]`と任意の配列`x`を結合しても、結果は`x`のまま)

この「配列のMonoid」は、次章で登場する`listOf`を構築するための理論的な礎となります。

## 結論：Monoidの性質の継承

ここまで見てきたように、`combineLatestWith`は、値レベルで定義されたMonoid（加算、論理和、配列結合など）を、その性質を一切損なうことなく、`Timeline`コンテナの世界へと持ち上げる役割を果たしています。

`0`を足しても値が変わらないように、`Timeline(0)`を`addOf`で加えても`Timeline`の振る舞いは変わりません。`[]`と結合しても配列が変わらないように、`Timeline([])`を`concatOf`で結合しても`Timeline`の振る舞いは変わりません。

Applicative Functorの`map2`操作（ここでは`combineLatestWith`）が、下層にあるMonoidの美しい代数的構造を、そのままコンテナレベルのMonoidへと継承させるのです。この堅牢な数学的基盤があるからこそ、我々は次章で、これらの部品を安心して組み上げ、より複雑な合成関数を構築することができます。

## Canvasデモ (Placeholder)
