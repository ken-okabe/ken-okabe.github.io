:::lang-en

# Chapter 1: Navigating the Nullable World — The n-APIs as Safe Operations

## 1. The Conclusion of the Previous Chapter: The Missing Piece Was a "Safe Operation"

In the previous chapter, we delved into the truth behind the problems historically caused by `null`. Our conclusion was that the root of the problem was not that the concept of `null` itself is evil, but that the **safe operations** that should be paired with `null` (the empty set) were not defined in many languages. An algebraic structure is only complete with a pair of a "set" and an "operation." The failure to provide corresponding "operations" for the "set" element of `null` was the true "billion-dollar mistake."

This chapter explains how the `Timeline` library concretely implements those missing "safe operations." The answer is the **function group with the `n` prefix (the n-APIs)**.

-----

## 2. The Most Basic Operation: `nMap` — Allowing `null` to Pass Through Safely

To understand the design philosophy of the n-APIs, let's first look at the most basic `map` operation.

The original `map` function, without the `n` prefix, does not assume that the input timeline's value will be `null`. Therefore, if applied to a nullable timeline as shown below, it carries a potential risk of causing a runtime error like `TypeError: Cannot read properties of null` inside the mapping function (`x => x.toUpperCase()`).

```typescript
// Potentially problematic code
const nameTimeline = Timeline<string | null>("Alice");

const upperCaseName = nameTimeline.map(x => x.toUpperCase()); // Throws an error if 'x' is null

nameTimeline.define(Now, null); // An exception could be thrown here
```

The solution to this problem is `nMap`. `nMap` is a "safe operation" designed with the existence of `null` in mind.

-----

##### F\#: `nMap: ('a -> 'b) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

##### TS: `.nMap<B>(f): Timeline<B | null>`

The operational rule provided by `nMap` is extremely simple:

**"If the input timeline's value is `null`, do not execute the mapping function and immediately set the output timeline's value to `null`."**

This rule absorbs the risk of a `NullPointerException` within the `nMap` operation itself. `Null` passes through the pipeline safely without destroying it.

```typescript
// TS
const nullableNumbers = Timeline<number | null>(5);
const doubled = nullableNumbers.nMap(x => x * 2);
console.log(doubled.at(Now)); // 10

// When the input becomes null...
nullableNumbers.define(Now, null);
// ...the function is not executed, and the output safely becomes null.
console.log(doubled.at(Now)); // null
```

-----

## 3. Safe Navigation of Dynamic Graphs: `nBind`

This design philosophy of "letting `null` pass through safely" also applies to the more complex `bind` operation. While `bind` is a powerful feature for dynamically switching subsequent timelines based on a value, it carries the same risks as `map` if the possibility of a `null` input is not considered.

`nBind` is the operation that incorporates null-safety into the `bind` operation.

-----

##### F\#: `nBind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

##### TS: `.nBind<B>(monadf): Timeline<B | null>`

When the input timeline becomes `null`, `nBind` does not execute the function (`monadf`) that generates the subsequent timeline. Instead, it immediately sets the output timeline to `null`.

This is extremely useful in asynchronous chains. For example, in a process like "get user ID, then use that ID to get the user profile," if the initial "get user ID" step fails and returns `null`, the subsequent profile-fetching logic is safely skipped.

```typescript
// TS
const maybeNumber = Timeline<number | null>(5);

// Since the input is 5, the function executes and a result Timeline is generated.
const result = maybeNumber.nBind(x => Timeline(x.toString()));
console.log(result.at(Now)); // "5"

// When the input becomes null...
maybeNumber.define(Now, null);
// ...the function is not executed, and the output safely becomes null.
console.log(result.at(Now)); // null
```

-----

## 4. Fusion with Resource Management: `nUsing`

`using` is an advanced operation that synchronizes the value of a timeline with the lifecycle of an external resource, such as a DOM element or a timer. In this context, handling `null` is also critical. The state of "no resource exists" needs to be handled elegantly as a valid state, not as an error.

`nUsing` is the operation that meets this requirement.

-----

##### F\#: `nUsing: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

##### TS: `.nUsing<B>(resourceFactory): Timeline<B | null>`

`nUsing` defines an operation that, "if it receives `null` as input, does not execute the resource acquisition logic (`resourceFactory`) and returns a timeline whose result is also `null`."

This allows for common UI programming scenarios—such as "acquire the resource if the user has selected a DOM element, and do nothing if nothing is selected (`null`)"—to be written as a single, declarative pipeline without imperative `if` statement branching.

```typescript
// TS
const optionalUserId = Timeline<number | null>(123);

// Since optionalUserId is 123, the resource is acquired.
const resource = optionalUserId.nUsing(id => {
    // This part only runs if id is not null
    return createResource(`data_for_${id}`, () => console.log(`cleanup for ${id}`));
});
console.log(resource.at(Now)?.resource); // "data_for_123"

// When optionalUserId becomes null...
optionalUserId.define(Now, null);
// ...the resource factory is not executed, and the result becomes null.
// (The cleanup function for the previous resource is called here).
console.log(resource.at(Now)); // null
```

-----

## 5. Summary: The n-API Design Philosophy

Across `nMap`, `nBind`, and `nUsing`, a common design philosophy emerges. The "operation" provided by the n-API family is based on a simple rule:

**"Treat a `null` input as a special case, and without throwing an exception, return a `null` output while preserving the structure of the pipeline."**

This rule is the concrete answer to the problem we concluded was "missing" in the previous chapter: a safe operation to be paired with `null` (the empty set).

This design frees the programmer from needing to repeat defensive `if`-`null` checks on the "outside" of the pipeline. As a result, one can acknowledge the existence of `null` yet focus on writing cleaner, more declarative code without being bothered by its dangers.

-----

## Canvas Demo (Placeholder)

A demo comparing the behavior of `map` and `nMap` side-by-side. On the left (`map`), when `null` is input, the pipeline stops with a red warning indicator. On the right (`nMap`), when `null` is input, the pipeline's color changes, and it visually skips the subsequent operation, propagating `null` as the output.

:::

:::lang-ja

# Chapter 1: Null許容世界の歩き方 — 安全な「演算」としてのn-API

## 1. 前章の結論：欠けていたのは「安全な演算」だった

前章で我々は、歴史的に`null`が引き起こしてきた問題の真相に迫りました。その結論は、「`null`という概念そのものが悪なのではなく、`null`（空集合）とペアになるべき**安全な演算**が、多くの言語で定義されていなかったことこそが問題の根源である」というものでした。代数構造は「集合」と「演算」のペアで初めて成立します。`null`という「集合」の要素を認めながら、それに対応する「演算」を用意しなかったこと、それが“億万ドルの間違い”の正体でした。

本章では、その欠けていた「安全な演算」を、`Timeline`ライブラリがどのように具体的に実装しているかを解説します。その答えが、**`n`接頭辞を持つ関数群 (n-API)** です。

-----

## 2. 最も基本的な演算： `nMap` — nullを安全に通過させる

`n-API`の設計思想を理解するために、まずは最も基本的な`map`操作から見ていきましょう。

`n`の付かないオリジナルの`map`関数は、入力タイムラインの値が`null`であることを想定していません。そのため、以下のように`null`を許容するタイムラインに適用すると、マッピング関数 (`x => x.toUpperCase()`) の内部で`TypeError: Cannot read properties of null`のような実行時エラーが発生する潜在的なリスクを抱えています。

```typescript
// エラーが発生する可能性のあるコード
const nameTimeline = Timeline<string | null>("Alice");

const upperCaseName = nameTimeline.map(x => x.toUpperCase()); // 'x'がnullの場合、エラーになる

nameTimeline.define(Now, null); // ここで例外がスローされる可能性がある
```

この問題を解決するのが`nMap`です。`nMap`は、`null`の存在を前提として設計された「安全な演算」です。

-----

##### F\#: `nMap: ('a -> 'b) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

##### TS: `.nMap<B>(f): Timeline<B | null>`

`nMap`が提供する演算ルールは、極めてシンプルです。

**「入力タイムラインの値が`null`であれば、マッピング関数を実行せず、出力タイムラインの値を即座に`null`にする」**

このルールにより、`NullPointerException`のリスクは`nMap`演算の内部で吸収されます。`null`はパイプラインを破壊することなく、安全に「通過」していくのです。

```typescript
// TS
const nullableNumbers = Timeline<number | null>(5);
const doubled = nullableNumbers.nMap(x => x * 2);
console.log(doubled.at(Now)); // 10

// 入力がnullになると...
nullableNumbers.define(Now, null);
// ...関数は実行されず、出力も安全にnullになる
console.log(doubled.at(Now)); // null
```

-----

## 3. 動的グラフの安全な航行： `nBind`

この「`null`を安全に通過させる」という設計哲学は、より複雑な`bind`操作にも適用されます。`bind`は、値に応じて後続のタイムラインを動的に切り替える強力な機能ですが、入力が`null`になる可能性を考慮しなければ、`nMap`と同様のリスクを抱えます。

`nBind`は、`bind`操作に`null`安全性を組み込んだ演算です。

-----

##### F\#: `nBind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

##### TS: `.nBind<B>(monadf): Timeline<B | null>`

入力タイムラインが`null`になった場合、`nBind`は後続のタイムラインを生成するための関数 (`monadf`) を実行しません。代わりに出力タイムラインを即座に`null`にします。

これは、非同期処理のチェーンなどで極めて有用です。例えば、「ユーザーIDを取得し、そのIDを使ってユーザープロファイルを取得する」という処理において、最初の「ユーザーIDの取得」が失敗し`null`を返した場合でも、後続のプロファイル取得処理が安全にスキップされます。

```typescript
// TS
const maybeNumber = Timeline<number | null>(5);

// 入力が5なので、関数が実行され、結果のTimelineが生成される
const result = maybeNumber.nBind(x => Timeline(x.toString()));
console.log(result.at(Now)); // "5"

// 入力がnullになると...
maybeNumber.define(Now, null);
// ...関数は実行されず、出力も安全にnullになる
console.log(result.at(Now)); // null
```

-----

## 4. リソース管理との融合： `nUsing`

`using`は、タイムラインの値と、DOM要素やタイマーといった外部リソースのライフサイクルを同期させる、高度な操作です。この文脈においても、`null`の扱いは重要になります。「リソースが存在しない」という状態を、エラーではなく、正当な状態としてエレガントに扱う必要があるからです。

`nUsing`は、この要求に応えるための演算です。

-----

##### F\#: `nUsing: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

##### TS: `.nUsing<B>(resourceFactory): Timeline<B | null>`

`nUsing`は、「入力が`null`を受け取ったら、リソース確保のロジック (`resourceFactory`) を実行せず、結果も`null`になるタイムラインを返す」という演算を定義します。

これにより、「ユーザーがDOM要素を選択している場合はそのリソースを確保し、何も選択していない（`null`の）場合は何もしない」といった、UIプログラミングで頻出するシナリオを、`if`文による命令的な分岐なしに、単一の宣言的なパイプラインとして記述できます。

```typescript
// TS
const optionalUserId = Timeline<number | null>(123);

// optionalUserIdが123なので、リソースが確保される
const resource = optionalUserId.nUsing(id => {
    // この部分はidがnullでない場合のみ実行される
    return createResource(`data_for_${id}`, () => console.log(`cleanup for ${id}`));
});
console.log(resource.at(Now)?.resource); // "data_for_123"

// optionalUserIdがnullになると...
optionalUserId.define(Now, null);
// ...リソース確保関数は実行されず、結果もnullになる。
// (前のリソースのクリーンアップ関数がここで呼ばれる)
console.log(resource.at(Now)); // null
```

-----

## 5. まとめ：n-APIという設計思想

`nMap`、`nBind`、`nUsing`。これらのAPIを通じて、共通の設計思想が見えてきます。`n-API`群が提供する「演算」とは、すべて以下のシンプルなルールに基づいています。

**「`null`という入力を特別扱いし、例外を発生させることなく、パイプラインの構造を維持したまま`null`という出力を返す」**

このルールこそが、前章で我々が「欠けていた」と結論付けた、「`null`（空集合）とペアになる安全な演算」の具体的な答えです。

この設計により、プログラマはパイプラインの「外側」で、防御的な`null`チェックの`if`文を繰り返す必要がなくなります。その結果、`null`の存在を認めつつも、その危険性に煩わされることなく、よりクリーンで宣言的なコードを書くことに集中できるのです。

-----

## Canvasデモ (Placeholder)

`map`と`nMap`の振る舞いを並べて比較するデモ。
左側（`map`）では、`null`が入力されるとパイプラインが赤い警告表示と共に停止する。右側（`nMap`）では、`null`が入力されるとパイプラインの色が変わり、後続の処理をスキップしてそのまま`null`が出力される様子を視覚化する。

:::