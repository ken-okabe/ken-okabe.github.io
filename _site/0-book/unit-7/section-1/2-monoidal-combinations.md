:::lang-en

# Chapter 2: Binary Operations and Monoids

`combineLatestWith`, which we learned about in Chapter 1, is a general-purpose primitive for bringing any binary operation into the world of `Timeline`. In this chapter, we will define a set of helper functions to use `combineLatestWith` more concretely and safely.

What is important is that the binary operations we will define from now on are based on the mathematical structure called a **Monoid**, which we learned about in Unit 2. A Monoid was defined as an algebraic structure consisting of a set of three things: "a type," "a binary operation that takes two values of that type and returns a value of the same type, satisfying the **associative law**," and "an **identity element** for that operation."

This chapter will show how a value-level Monoid is inherited as is to a `Timeline` container-level Monoid by `combineLatestWith` (the `map2` operation of Applicative), preserving its beautiful structure.

## Binary Operation Helper Functions

The functions we will introduce now, such as `orOf`, `andOf`, `addOf`, and `concatOf`, are all specializations of `combineLatestWith` with a specific Monoid operation.

### Logical OR: orOf

##### F\#: `orOf: Timeline<bool> -> Timeline<bool> -> Timeline<bool>`

##### TS: `orOf(timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean>`

<!-- end list -->

Combines two `Timeline<boolean>`s with a logical OR (`||`).

The foundation of this operation is the Monoid of logical OR on the `boolean` type.

- **Type**: `boolean`

- **Binary Operation**: `||` (OR)

- **Identity Element**: `false` (`false || x` is always `x`)

The properties of this Monoid are inherited to the `Timeline` level by `orOf`.

```typescript
// TS
// The implementation uses combineLatestWith
const orOf = (timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean> =>
    combineLatestWith((a: boolean, b: boolean) => a || b)(timelineA)(timelineB);
```

-----

### Logical AND: andOf

##### F\#: `andOf: Timeline<bool> -> Timeline<bool> -> Timeline<bool>`

##### TS: `andOf(timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean>`

Combines two `Timeline<boolean>`s with a logical AND (`&&`).

This is based on the Monoid of logical AND.

- **Type**: `boolean`

- **Binary Operation**: `&&` (AND)

- **Identity Element**: `true` (`true && x` is always `x`)

-----

### Addition: addOf

##### F\#: (No direct helper in F\#. Use `combineLatestWith (+)`.)

##### TS: `addOf(timelineA: Timeline<number>, timelineB: Timeline<number>): Timeline<number>`

Combines two `Timeline<number>`s with addition (`+`).

This is based on the Monoid of numerical addition.

- **Type**: `number`

- **Binary Operation**: `+` (Addition)

- **Identity Element**: `0` (`0 + x` is always `x`)

-----

### Array Concatenation: concatOf

##### F\#: `concatOf: Timeline<'a list> -> Timeline<'a> -> Timeline<'a list>`

##### TS: `concatOf(timelineA: Timeline<any[]>, timelineB: Timeline<any>): Timeline<any[]>`

`concat` is an operation that combines two arrays to create one new array. This simple operation also forms an extremely important Monoid.

- **Type**: `array<'a>` (an array of any type)

- **Binary Operation**: `concat` (array concatenation)

- **Identity Element**: `[]` (the empty array) (concatenating `[]` with any array `x` leaves `x` unchanged)

This "Array Monoid" is the theoretical foundation for constructing `listOf`, which will appear in the next chapter.

## Conclusion: Inheritance of Monoid Properties

As we have seen so far, `combineLatestWith` plays the role of lifting a Monoid defined at the value level (addition, logical OR, array concatenation, etc.) into the world of the `Timeline` container, without losing any of its properties.

Just as adding `0` does not change a value, adding `Timeline(0)` with `addOf` does not change the behavior of a `Timeline`. Just as concatenating with `[]` does not change an array, concatenating with `Timeline([])` using `concatOf` does not change the behavior of a `Timeline`.

The `map2` operation of an Applicative Functor (here, `combineLatestWith`) allows the beautiful algebraic structure of the underlying Monoid to be inherited as is to the container-level Monoid. It is because of this robust mathematical foundation that we can confidently assemble these parts in the next chapter to build more complex composition functions.

## Canvas Demo (Placeholder)

:::

:::lang-ja

# Chapter 2: 二項演算とMonoid

Chapter 1で学んだ`combineLatestWith`は、あらゆる2項演算を`Timeline`の世界に持ち込むための、汎用的なプリミティブです。この章では、その`combineLatestWith`をより具体的に、そして安全に利用するためのヘルパー関数群を定義します。

重要なのは、これから定義する2項演算が、Unit 2で学んだ**Monoid**という数学的構造に基づいている点です。Monoidは、「ある型」「その型の2つの値を取り、同じ型の値を返す**結合法則**を満たす2項演算」「その演算における**単位元**」の3つの組で定義される代数的構造でした。

この章で示すのは、値レベルのMonoidが、`combineLatestWith`（Applicativeの`map2`操作）によって、そのまま`Timeline`コンテナレベルのMonoidへと、その美しい構造を保ったまま引き継がれる様子です。

## 2項演算ヘルパー関数

これから紹介する`orOf`, `andOf`, `addOf`, `concatOf`といった関数は、すべて`combineLatestWith`を特定のMonoid演算で特殊化したものです。

### 論理和: orOf

##### F\#: `orOF: Timeline<bool> -> Timeline<bool> -> Timeline<bool>`

##### TS: `orOf(timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean>`

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

##### F\#: `andOf: Timeline<bool> -> Timeline<bool> -> Timeline<bool>`

##### TS: `andOf(timelineA: Timeline<boolean>, timelineB: Timeline<boolean>): Timeline<boolean>`

2つの`Timeline<boolean>`を論理積（`&&`）で合成します。

これは、論理積のMonoidに基づいています。

- **型**: `boolean`

- **2項演算**: `&&` (AND)

- **単位元**: `true` (`true && x`は常に`x`)

-----

### 加算: addOf

##### F\#: (F\#版には直接のヘルパーなし。`combineLatestWith (+)` を使用)

##### TS: `addOf(timelineA: Timeline<number>, timelineB: Timeline<number>): Timeline<number>`

2つの`Timeline<number>`を加算（`+`）で合成します。

これは、数値の加算におけるMonoidに基づいています。

- **型**: `number`

- **2項演算**: `+` (Addition)

- **単位元**: `0` (`0 + x`は常に`x`)

-----

### 配列の結合: concatOf

##### F\#: `concatOf: Timeline<'a list> -> Timeline<'a> -> Timeline<'a list>`

##### TS: `concatOf(timelineA: Timeline<any[]>, timelineB: Timeline<any>): Timeline<any[]>`

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

:::