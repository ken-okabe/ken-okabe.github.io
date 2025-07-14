---
title: Asynchronous Event Chaining with bind
description: >-
  複数のタイムラインを合成するための専用関数（後述）に入る前に、まずはTimelineのコア機能、特にTL.bindそのものを使い、どのように一連の処理を編成できるかを見ていきましょう。これは、特に**非同期イベントの連鎖（asynchronous
  event
  chains）**において有用です。このアプローチは、JavaScriptのPromise.thenチェーンと同様の効果を示しますが、追加の合成関数を必要とせず、Timelineの基本機能のみで実現されます。このbindの基本的な能力を理解することは、Timelineライブラリの設計に内在する力と柔軟性についての貴重な洞察を与えてくれます。
---
複数のタイムラインを合成するための専用関数（後述）に入る前に、まずは`Timeline`のコア機能、特に`TL.bind`そのものを使い、どのように一連の処理を編成できるかを見ていきましょう。これは、特に**非同期イベントの連鎖（asynchronous event chains）**において有用です。このアプローチは、JavaScriptの`Promise.then`チェーンと同様の効果を示しますが、追加の合成関数を必要とせず、`Timeline`の基本機能のみで実現されます。この`bind`の基本的な能力を理解することは、`Timeline`ライブラリの設計に内在する力と柔軟性についての貴重な洞察を与えてくれます。

## `bind` chain

#### 主要な仕組み

この非同期チェーンは、以下の3つの主要な仕組みで構成されています。

1.  **事前定義された受信用Timeline**: 各ステップの結果を受け取るための`Timeline`インスタンス（`step1`, `step2`, `step3`など）を事前に定義します。
2.  **`bind`チェーン**: 各`bind`関数の中で非同期処理を開始し、その処理が完了した時点で、次のステップ用の`Timeline`に結果を`.define()`で設定します。
3.  **連鎖反応**: ある`Timeline`の値が更新されると、その`Timeline`に依存している次の`bind`が自動的にトリガーされ、チェーンが進行します。

#### コード例の流れ

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

#### `Promise.then`との比較

この`Timeline`の`bind`チェーンは、`Promise.then`と多くの点で似ています。

* **順次実行**: 前の処理が完了してから次の処理が開始されます。
  * **値の引き継ぎ**: 前のステップの結果が次のステップに渡されます。

しかし、根本的なアプローチには重要な違いもあります。

* **リアクティブ**: `Timeline`は値の変化に反応して自動的に後続処理をトリガーする、リアクティブなシステムです。
  * **明示的な受信Timeline**: 各ステップの結果を受け取るための専用の`Timeline`を事前に定義する必要があります。
  * **同期的な戻り値**: `bind`関数自体は、非同期処理の完了を待たず、次に待機すべき`Timeline`を**同期的**に返す必要があります。

-----

## `nBind`の利用：より堅牢なチェーンへ

上のコード例は、すべての非同期処理が成功する「ハッピーパス」です。しかし、現実のアプリケーションでは、通信エラーや予期せぬ結果によって処理が**失敗する可能性**も考慮しなければなりません。そのときに有用なのが、`nBind`です。

`bind`を使った現在のコードは、いずれかのステップが`null`を返した瞬間に、後続の処理でエラーが発生し、アプリケーション全体がクラッシュする脆弱性を抱えています。

| | `bind` (オリジナル) | `nBind` (洗練後) |
| :--- | :--- | :--- |
| **ハッピーパス** | 正常に動作 | 正常に動作 |
| **途中で`null`発生** | **実行時エラーでクラッシュ** 💀 | **後続処理を安全にスキップ** ✨ |
| **堅牢性** | 低い | 高い |
| **コードの見た目** | ほぼ同じ | ほぼ同じ |

`nBind`は、この問題をエレガントに解決するために設計されています。`nBind`の演算ルールは「**入力が`null`なら、後続の関数を実行せずに`null`をそのまま通過させる**」でした。`bind`を`nBind`に置き換えるだけで、コードの構造を全く変えずに、この非同期チェーンに堅牢性を与えることができます。

`Promise.then`との比較で言えば、`nBind`を使うことで、「**エラーハンドリング**」の側面が大幅に強化されます。`.catch()`ブロックでエラーを捕捉するPromiseとは異なり、`nBind`は`null`という値を「失敗」のシグナルとして、パイプラインを破壊することなく安全に伝搬させます。

#### `nBind`で洗練されたコード

```javascript
const step0 = Timeline(null);
const step1 = Timeline(null);
const step2 = Timeline(null);
const step3 = Timeline(null);

const asyncChain = step0
  .nBind(value => { // .bind -> .nBind
    // 非同期処理1を開始
    setTimeout(() => {
      const result1 = value + " -> The";
      step1.define(Now, result1);
    }, 2000);
    return step1;
  })
  .nBind(value => { // .bind -> .nBind
    // 非同期処理2を開始
    setTimeout(() => {
      // 失敗してnullを返したと仮定
      const result2 = null;
      step2.define(Now, result2);
    }, 3000);
    return step2;
  })
  .nBind(value => { // .bind -> .nBind
    // この関数は実行されない！
    console.log("This will not be executed.");
    setTimeout(() => {
      const result3 = value + " -> Done!!"; // エラーが起きない
      step3.define(Now, result3);
    }, 1000);
    return step3;
  });

// チェーンを開始
step0.define(Now, "Hello!");

// 最終的なasyncChainの値は、エラーを起こさずにnullになる
```

### \#\# 結論

`nBind` を使うことは、単に `bind` を置き換えるだけではありません。それは、**成功ケースだけでなく、失敗ケース（`null`）も考慮に入れた、より信頼性が高く、宣言的なコードへと洗練させる**ことを意味します。これにより、`try-catch` や `if (value !== null)` といった命令的なエラーハンドリングをパイプラインの外側に書く必要がなくなり、コードの本質的な流れに集中できるようになるのです。

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
