:::lang-en

# Chapter 1: map — The Static Dependency Graph

The most fundamental and frequently used transformation in `Timeline` is `.map()`. It transforms the value of one `Timeline` into another according to a specific rule (a function), generating a new `Timeline`.

Its essence is to **define an immutable, "static" relationship between two `Timeline`s**.

## API Definition

##### F#: `map: ('a -> 'b) -> Timeline<'a> -> Timeline<'b>`
    
##### TS: `.map<B>(f: (value: A) => B): Timeline<B>`

`map` takes a pure function `f` as an argument, which accepts a value of type `A` and returns a value of type `B`.

TypeScript

```ts
const numbers = Timeline(5);

// Pass a function: (x: number) => string
const labels = numbers.map(x => `Score: ${x}`);

console.log(labels.at(Now)); // "Score: 5"

// When the source is updated, labels is automatically updated as well
numbers.define(Now, 100);
console.log(labels.at(Now)); // "Score: 100"
```

## Dependency Graph

When you call `map`, a **Dependency** is registered internally between the two `Timeline`s. The entire network of these relationships is called the **Dependency Graph**.

The dependency created by `map` is **Static**. Once you define the relationship `labels = numbers.map(...)`, the rule itself—the transformation of the value—does not change later.

```txt
        +-----------------+      .map(x => `Score: ${x}`)     +-----------------+
        | numbers         | --------------------------------> | labels          |
        | (Timeline<number>) |                                  | (Timeline<string>) |
        +-----------------+                                 +-----------------+
              ^                                                     |
              | .define(Now, 100)                                   V
              +-------------                                 Value propagates to "Score: 100"
```

This simple concept of a "static dependency" is the foundation for understanding the "dynamic" dependencies constructed by `bind` and `using`, which will be introduced later.

## Canvas Demo (Placeholder)

_(An interactive demo visually demonstrating the behavior of `.map()` will be placed here.)_

:::

:::lang-ja

# Chapter 1: `map` — 静的な依存グラフ

`Timeline`で最も基本的で頻繁に使われる変換操作が`.map()`です。これは、ある`Timeline`の値を、特定のルール（関数）に従って別の値に変換し、新しい`Timeline`を生成します。

その本質は、**2つの`Timeline`の間に、不変で「静的な」関係性を定義する**ことです。

## API定義

##### F#: `map: ('a -> 'b) -> Timeline<'a> -> Timeline<'b>`
    
##### TS: `.map<B>(f: (value: A) => B): Timeline<B>`

`map`は、型`A`の値を受け取って型`B`の値を返す純粋な関数`f`を引数に取ります。

TypeScript

```ts
const numbers = Timeline(5);

// (x: number) => string という関数を渡す
const labels = numbers.map(x => `Score: ${x}`);

console.log(labels.at(Now)); // "Score: 5"

// ソースを更新すると、labelsも自動的に更新される
numbers.define(Now, 100);
console.log(labels.at(Now)); // "Score: 100"

```

## 依存グラフ (Dependency Graph)

`map`を呼び出すと、内部では2つの`Timeline`の間に**依存関係 (Dependency)** が登録されます。この関係性のネットワーク全体を**依存グラフ**と呼びます。

`map`が作る依存関係は**静的 (Static)** です。一度`labels = numbers.map(...)`という関係を定義したら、`numbers`と`labels`の間の「値を変換する」というルールそのものが後から変わることはありません。

```txt
        +-----------------+      .map(x => `Score: ${x}`)     +-----------------+
        | numbers         | --------------------------------> | labels          |
        | (Timeline<number>) |                                  | (Timeline<string>) |
        +-----------------+                                 +-----------------+
              ^                                                     |
              | .define(Now, 100)                                   V
              +-------------                                 値が"Score: 100"へ伝播

```

このシンプルな「静的な依存関係」の概念が、後に出てくる`bind`や`using`が構築する「動的な」依存関係を理解するための基礎となります。

## Canvasデモ (Placeholder)

_(ここに`.map()`の動作を視覚的に示すインタラクティブなデモが配置されます。)_

:::