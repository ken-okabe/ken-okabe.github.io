:::lang-en

# Chapter 2: I/O and Timeline — Defining Dependencies with link

In Chapter 1, we saw how `.map()` defines a static dependency by **deriving** a `Timeline`. In this chapter, we explore a different approach to integrating interactions with the external world (I/O) into our system.

The key is to **connect two initially independent `Timeline`s using the `.link()` API to define a new dependency**.

## Modeling I/O

From the perspective of the block universe model, an I/O operation like `console.log("Hello")` is not an action that "changes" the world.

-   State of the universe at time coordinate `t1`: "Hello" is not displayed on the console.
    
-   State of the universe at time coordinate `t2`: "Hello" is displayed on the console.

`console.log` merely describes the relationship between these two different, yet both immutable, states of the universe at different time coordinates.

## Encapsulating I/O as a Responsibility

Based on this philosophy, instead of dealing with the imperative `console.log` directly, we define a declarative `Timeline` that encapsulates its "rule."

In the block universe, there is no imperative I/O. There is only the **declarative entity** we define, `logTimeline`.

TypeScript

```ts
// As a helper, define a function that logs a value of any type
const log = <A>(value: A): void => {
    // Following the library's philosophy, null is treated specially
    if (value !== null) {
        console.log(`[LOG]:`, value);
    }
};

// Define a declarative logTimeline whose sole responsibility is to "output values to the console"
const logTimeline = Timeline<any>(null);

// Define its behavior with .map()
logTimeline.map(log);
```

## `.link()` — Connecting Two `Timeline`s

`.link()` defines the simplest form of dependency: unilaterally synchronizing the value from a source to a target between **two already existing `Timeline`s**.

### API Definition

#### **F#**: `link: Timeline<'a> -> Timeline<'a> -> unit`
    
#### **TS**: `.link(targetTimeline: Timeline<A>): void`

### Practical Example: Defining a Dependency between `scoreTimeline` and `logTimeline`

Let's connect the `scoreTimeline` from our application to the `logTimeline` we just defined.

TypeScript

```ts
const scoreTimeline = Timeline(100);

// Define the dependency from scoreTimeline to logTimeline with .link()
scoreTimeline.link(logTimeline);
// > [LOG]: 100  (The initial value propagates the moment the dependency is defined, and a log is output)

// When the value of scoreTimeline is updated...
scoreTimeline.define(Now, 150);
// > [LOG]: 150  (...the update propagates to logTimeline according to the defined dependency, and a log is output again)
```

In this pattern, `scoreTimeline` focuses solely on managing its own value and is completely unaware of logging. `.link()` serves to define a dependency between these two declarative entities with separated responsibilities.

## The Static Dependency Graph (Revisited)

What's important here is that, just like `.map()` from Chapter 1, `.link()` also defines a **static dependency graph**.

-   `.map()`: Defined a static dependency by **deriving a new `Timeline` from a single source**.
    
-   `.link()`: Defined a static dependency by **connecting two existing `Timeline`s**.

Although their starting points differ, both play the same essential role in building a predictable and stable relationship within the system—one that, once defined, does not change.

## Canvas Demo (Placeholder)

_(An interactive demo visually demonstrating the behavior of `.link()` will be placed here.)_

:::

:::lang-ja

# Chapter 2: I/OとTimeline — `link`による依存関係の定義

Chapter 1では、`.map()`が`Timeline`を**派生**させることで、静的な依存関係を定義する方法を見ました。この章では、それとは異なるアプローチで、外部の世界とのやり取り（I/O）をシステムに統合する方法を探ります。

その鍵は、**最初から独立して存在する2つの`Timeline`を、`.link()` APIを使って接続し、新たな依存関係を定義する**ことです。

## I/Oのモデル化

`console.log("Hello")`というI/O操作は、ブロック宇宙モデルの視点では、世界を「変化」させるアクションではありません。

-   時間座標`t1`における宇宙の状態：「コンソールに"Hello"は表示されていない」
    
-   時間座標`t2`における宇宙の状態：「コンソールに"Hello"が表示されている」

`console.log`は、これら2つの異なる時間座標における、**異なるが共に不変である宇宙の状態の間の関係**を記述しているに過ぎません。

## I/Oを責務としてカプセル化する

この哲学に基づき、我々は命令的な`console.log`を直接扱うのではなく、その「ルール」をカプセル化した、宣言的な`Timeline`を定義します。

ブロック宇宙には命令的なI/Oは存在しません。我々が定義する`logTimeline`という**宣言的な存在**があるだけです。

TypeScript

```ts
// ヘルパーとして、任意の型の値をログに出力する関数を定義
const log = <A>(value: A): void => {
    // このライブラリの哲学に従い、nullは特別扱いする
    if (value !== null) {
        console.log(`[LOG]:`, value);
    }
};

// 「値をコンソールに出力する」という責務だけを持つ、宣言的なlogTimelineを定義する
const logTimeline = Timeline<any>(null);

// その振る舞いを.map()で定義する
logTimeline.map(log);

```

## `.link()` — 2つの`Timeline`を接続する

`.link()`は、**すでに存在する2つの`Timeline`** の間に、値を一方的に同期させるという、最もシンプルな依存関係を定義します。

### API定義

#### **F#**: `link: Timeline<'a> -> Timeline<'a> -> unit`
    
#### **TS**: `.link(targetTimeline: Timeline<A>): void`

### 実践例：`scoreTimeline`と`logTimeline`の依存関係定義

アプリケーション内の`scoreTimeline`の値を、先ほど定義した`logTimeline`に接続してみましょう。

TypeScript

```ts
const scoreTimeline = Timeline(100);

// scoreTimelineからlogTimelineへの依存関係を.link()で定義する
scoreTimeline.link(logTimeline);
// > [LOG]: 100  (依存関係が定義された瞬間に初期値が伝播し、ログが出力される)

// scoreTimelineの値が更新されると...
scoreTimeline.define(Now, 150);
// > [LOG]: 150  (...定義された依存関係に従い、更新がlogTimelineに伝播し、再度ログが出力される)

```

このパターンでは、`scoreTimeline`は自身の値の管理に専念し、ロギングのことは一切関知しません。`.link()`は、これら責務が分離された2つの宣言的なエンティティの間に、依存関係を定義する役割を果たします。

## 静的な依存グラフ（再訪）

ここで重要なのは、Chapter 1の`.map()`と同様に、`.link()`もまた**静的な依存グラフ**を定義する、という点です。

-   `.map()`: **1つのソースから新しい`Timeline`を派生**させることで、静的な依存関係を定義した。
    
-   `.link()`: **2つの既存の`Timeline`を接続**することで、静的な依存関係を定義した。

プロセスの開始点は異なりますが、どちらも一度定義されると変わることのない、予測可能で安定した関係性をシステム内に構築するという点で、本質的に同じ役割を担っています。

## Canvasデモ (Placeholder)

_(ここに`.link()`の動作を視覚的に示すインタラクティブなデモが配置されます。)_

:::