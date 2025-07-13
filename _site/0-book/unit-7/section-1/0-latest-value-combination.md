:::lang-en

# Chapter 0: Recap and Strategy for Binary Operations

In the previous units and sections, we have built a powerful set of tools. We can transform single timelines with `map`, create sequential, dependent chains with `bind`, and manage stateful transformations over time with `scan`.

However, we now face an entirely new challenge: combining **multiple, independent timelines** that run in parallel. Consider tasks like "adding the latest values of two separate counters" or "checking if two different form inputs are both valid." These scenarios cannot be directly solved by our existing primitives alone.

What we need now is a general **binary operation** that takes two independent sources, `Timeline<'a>` and `Timeline<'b>`, and produces a new `Timeline<'c>`.

## Re-evaluating the Classifications from Unit 4

To solve this, let's revisit the classifications for  **Applicative Functors**  from Unit 4.

1.  **Cartesian:** In the context of `List`, this approach generated all possible combinations of elements. If applied to `Timeline`, this would mean combining every past event from `timelineA` with every past event from `timelineB`. This is computationally explosive and does not align with our goal of determining the *current* combined state. Therefore, **the Cartesian approach is unsuitable**.

2.  **Pointwise:** For `List`, this approach paired elements at the same index, like a `zip` operation. However, the concept of a synchronized "index" does not exist for `Timeline`. Timelines are **asynchronous**; an event on `timelineA` at time `t1` has no guarantee of a corresponding event on `timelineB` at the exact same time `t1`. A strict, `zip`-like combination based on synchronized "points" in time would be practically useless. Therefore, **the Pointwise classification, as defined for synchronous structures, is also unsuitable**.

## The Need for a New Concept: "Latest Value Combination"

Since the classifications from Unit 4 do not fit, we need a new concept tailored to the asynchronous nature of `Timeline`.

What we truly need is not to synchronize discrete *events* (points), but to combine continuously available *states*. This leads us to propose a new concept: **"Latest Value Combination."

This idea is defined as follows:

> **The moment any source timeline is updated, its new value is combined with the most recently known value (the latest state) of the other source(s) to produce a new result.**

This powerful model fully embraces the asynchronous nature of the inputs while ensuring a consistent, combined state is always available. It is a pattern uniquely suited for reactive systems.

:::

:::lang-ja

# Chapter 0: 二項演算の再評価と戦略

これまでのユニットやセクションで、我々は強力なツール群を構築してきた。`map`で単一のタイムラインを変換し、`bind`で逐次的な依存チェーンを生成し、`scan`で時間とともに状態を持つ変換を管理できるようになった。

しかし、我々は今、全く新しい挑戦に直面している。それは、並行して実行される**複数の独立したタイムライン**を合成することだ。「2つの別々のカウンターの最新値を足し合わせる」や「2つの異なるフォーム入力が両方とも有効かチェックする」といったタスクを考えてみてほしい。これらのシナリオは、既存のプリミティブだけでは直接解決できない。

今我々が必要としているのは、2つの独立したソース`Timeline<'a>`と`Timeline<'b>`を受け取り、新しい`Timeline<'c>`を生成する、汎用的な**二項演算**である。

## Unit 4の分類の再評価

この問題を解決するため、Unit 4で学んだ**Applicative Functor**の分類を再訪しよう。

1.  **デカルト積 (Cartesian):** `List`の文脈では、このアプローチは要素の全ての可能な組み合わせを生成した。これを`Timeline`に適用すると、`timelineA`の過去の全イベントと`timelineB`の過去の全イベントを組み合わせることを意味する。これは計算量的に爆発的であり、*現在*の合成された状態を決定するという我々の目標とは一致しない。したがって、**デカルト積アプローチは不適切**である。

2.  **Pointwise:** `List`では、このアプローチは`zip`操作のように同じインデックスの要素をペアにした。しかし、`Timeline`には同期された「インデックス」という概念は存在しない。タイムラインは**非同期**であり、時刻`t1`の`timelineA`上のイベントが、全く同じ時刻`t1`に`timelineB`上に対応するイベントがあるという保証はない。同期された時間の「点」に基づく厳密な`zip`のような合成は、実質的に役に立たないだろう。したがって、同期的な構造に対して定義された**Pointwise分類もまた不適切**である。

## 新しい概念の必要性：「最新値の組み合わせ」

Unit 4の分類が適合しないため、`Timeline`の非同期的な性質に合わせた新しい概念が必要となる。

我々が本当に必要としているのは、離散的な*イベント*（点）を同期させることではなく、継続的に利用可能な*状態*を組み合わせることだ。これは我々に新しい概念、**「最新値の組み合わせ (Latest Value Combination)」** を提案させる。

この考えは次のように定義される。

> **いずれかのソースタイムラインが更新された瞬間、その新しい値は、他のソースの最も最近知られている値（最新の状態）と組み合わされ、新しい結果を生成する。**

この強力なモデルは、入力の非同期的な性質を完全に受け入れつつ、一貫した合成状態が常に利用可能であることを保証する。これはリアクティブシステムに特有のパターンである。

:::