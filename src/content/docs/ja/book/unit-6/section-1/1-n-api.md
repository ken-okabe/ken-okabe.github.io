---
title: 'Chapter 1: Null許容世界の歩き方 — 安全な「演算」としてのn-API'
description: >-
  前章で我々は、歴史的にnullが引き起こしてきた問題の真相に迫りました。その結論は、「nullという概念そのものが悪なのではなく、null（空集合）とペアになるべき安全な演算が、多くの言語で定義されていなかったことこそが問題の根源である」というものでした。代数構造は「集合」と「演算」のペアで初めて成立します。nullという「集合」の要素を認めながら、それに対応する「演算」を用意しなかったこと、それが“億万ドルの間違い”の正体でした。
---
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

#### F\#: `nMap: ('a -> 'b) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

#### TS: `.nMap<B>(f): Timeline<B | null>`

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

#### F\#: `nBind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

#### TS: `.nBind<B>(monadf): Timeline<B | null>`

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

#### F\#: `nUsing: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b> when 'a : null and 'b : null`

*Note: In F\#, this type constraint (`when 'a : null...`) is syntactically part of the generic parameter declaration. This notation is for documentation clarity.*

#### TS: `.nUsing<B>(resourceFactory): Timeline<B | null>`

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
