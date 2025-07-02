---
title: Asynchronous Event Chaining with bind
description: >-
  Before diving into specialized functions for combining multiple timelines,
  which will be covered later, let's first explore how the core Timeline
  feature, specifically TL.bind, can itself be used to orchestrate sequential
  operations. This is particularly relevant for asynchronous event chains. This
  approach demonstrates an effect similar to Promise.then chaining in JavaScript
  but is achieved using only the fundamental Timeline mechanisms without
  requiring additional combinator functions. Understanding this foundational
  capability of bind provides valuable insight into the power and flexibility of
  the core Timeline system.
---
Before diving into specialized functions for combining multiple timelines, which will be covered later, let's first explore how the core `Timeline` feature, specifically `TL.bind`, can itself be used to orchestrate sequential operations. This is particularly relevant for **asynchronous event chains**. This approach demonstrates an effect similar to `Promise.then` chaining in JavaScript but is achieved using only the fundamental `Timeline` mechanisms without requiring additional combinator functions. Understanding this foundational capability of `bind` provides valuable insight into the power and flexibility of the core `Timeline` system.

## JS Demo

Timelineライブラリの`bind`機能を使って、まさにPromise.thenチェーンのような非同期処理の連鎖を実現できます。

## 主要な仕組み

1.  **事前定義された受信用Timeline**: 各ステップの結果を受け取るための`Timeline`インスタンス（`step1`, `step2`, `step3`など）を事前に定義
2.  **bindチェーン**: 各`bind`内で非同期処理を開始し、完了時に次のステップ用のTimelineに結果を`define`
3.  **連鎖反応**: あるTimelineが更新されると、それに依存する次の`bind`が自動的にトリガーされる

## コード例の流れ

```javascript
// JavaScriptでの類似実装イメージ
const step0 = Timeline(null);
const step1 = Timeline(null);
const step2 = Timeline(null);
const step3 = Timeline(null);

const asyncChain = step0
  .bind(value => {
    // 非同期処理1を開始
    setTimeout(() => {
      const result1 = value + " -> The";
      step1.define(Now, result1); // 次のステップをトリガー
    }, 2000);
    return step1; // 次のステップのTimelineを返す
  })
  .bind(value => {
    // 非同期処理2を開始
    setTimeout(() => {
      const result2 = value + " -> Sequence";
      step2.define(Now, result2);
    }, 3000);
    return step2;
  })
  .bind(value => {
    // 非同期処理3を開始
    setTimeout(() => {
      const result3 = value + " -> Done!!";
      step3.define(Now, result3);
    }, 1000);
    return step3;
  });

// チェーンを開始
step0.define(Now, "Hello!");

```

## Promise.thenとの類似点

-   **順次実行**: 前の処理が完了してから次の処理が開始される
-   **値の引き継ぎ**: 前のステップの結果が次のステップに渡される
-   **エラーハンドリング**: 各ステップでエラーを捕捉・処理できる

## 主な違い

-   **リアクティブ**: Timelineは値の変化に反応するリアクティブシステム
-   **明示的な受信Timeline**: 各ステップの結果を受け取る専用のTimelineを事前定義する必要がある
-   **同期的な戻り値**: `bind`関数は同期的に次のステップのTimelineを返す必要がある

この仕組みにより、Timelineライブラリは非同期処理の連鎖を、Promiseとは異なるアプローチで実現していますね。

## JS Demo

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1750968115971.png)

### https://g.co/gemini/share/5c7a059bed73

Timeline Bind Chainのターミナル風デモを作成しました！このデモでは以下の特徴があります：

## 主な機能

- **リアルタイムログ表示**: 各ステップのタイムスタンプ付きログ
- **プログレスバー**: チェーンの進行状況をビジュアル表示
- **3段階の非同期処理**: 2秒 → 3秒 → 1秒の遅延チェーン
- **カスタム入力**: 任意の初期値でテスト可能

## チェーンの流れ

1. **Step 0**: 初期値でトリガー
2. **Step 1**: 2秒後に "→ Processing" を追加
3. **Step 2**: 3秒後に "→ Enhanced" を追加  
4. **Step 3**: 1秒後に "→ Complete!" を追加

## 操作方法

- **Start Chain**: デフォルト値でチェーン実行
- **Clear Log**: ログとプログレスをクリア
- **Custom Input**: カスタム値でチェーン実行

このデモは、Timelineの`bind`チェーンがPromise.thenのような非同期処理の連鎖を実現できることを視覚的に示しています。各ステップが前のステップの完了を待って順次実行される様子を、ターミナル風のUIでリアルタイムに確認できます。

## Summary and Next Steps

The `TL.bind` operation, a core part of the Monad structure of `Timeline` (as we explored in Unit 5), is exceptionally flexible. As this chapter's `setTimeout` example demonstrated, `bind` can be used directly, without any additional specialized combinator functions, to construct relatively complex patterns like asynchronous event chains. This pattern of pre-defining "receiver" timelines and returning them from within the `bind` function allows us to sequence asynchronous operations in a manner reminiscent of `Promise.then` chaining, but using only the fundamental `Timeline` mechanisms. This ability to build sophisticated control flows from core components underscores the power inherent in the `Timeline` library's design.

While powerful, `TL.bind` is fundamentally for creating **sequential chains** where each step depends on the result of the previous one. It does not, however, directly address a different but equally common scenario: how to combine the latest values from multiple, **independent** timelines that are running in parallel.

This is precisely the challenge we will tackle in the next major section of this unit, **Section 4**. We will explore how to perform binary operations on timelines, moving from the Monadic pattern of `bind` to an Applicative-style approach. We will discover that the classifications from Unit 4 need to be adapted for the asynchronous nature of `Timeline`, leading us to a new core concept: "Latest Value Combination."
