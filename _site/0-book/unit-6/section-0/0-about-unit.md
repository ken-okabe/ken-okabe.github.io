:::lang-en

# 🔍 Overview - Unit 6

The purpose of this unit is to extend the robust theoretical model established in Unit 5 to more dynamic and complex real-world scenarios. Here, you will master **four practical primitives** built on top of the core APIs of Unit 5 to elegantly solve advanced problems.

1.  **Handling Absence (`n` prefix API):** How to safely and declaratively handle the possibility that real-world data may be `null` within the Timeline structure, without relying on an `Option` type.
2.  **Chaining Asynchronous Operations (`bind` chain):** Building on the foundation of nullability, how to compose potentially failing asynchronous operations into a single, safe, sequential process by chaining `bind`.
3.  **Temporal Evolution of State (`scan`):** A method for evolving "state" along the timeline by accepting new inputs based on past states.
4.  **Noise Reduction (`distinctUntilChanged`):** A technique to optimize performance by capturing only essential changes and suppressing unnecessary updates.

These are a powerful set of tools that specialize the capabilities of the core APIs for specific application areas and are essential for building robust applications.

:::

:::lang-ja

# 🔍 Overview - Unit 6

Unit 5で確立した強固な理論モデルを、より動的で複雑な実世界のシナリオへと拡張するのが、このユニットの目的だ。ここでは、Unit 5のコアAPIの上に構築された、高度な問題をエレガントに解決するための**4つの実践的プリミティブ**を習得する。

1.  **不在のハンドリング (`n` prefix API):** 現実のデータが常に`null`である可能性を、`Option`型に頼ることなく、Timelineの構造内でいかに安全かつ宣言的に扱うか。
2.  **非同期処理の連鎖 (`bind` chain):** 上記の`null`許容性を基盤とし、`bind`を連鎖させることで、失敗する可能性のある非同期処理を、いかに安全な一本の逐次処理として合成するか。
3.  **状態の時間的進化 (`scan`):** 過去の状態を元に、新たな入力を受け付けて「状態」を時間軸に沿って進化させる方法。
4.  **ノイズの除去 (`distinctUntilChanged`):** 本質的な変化のみを捉え、不要な更新を抑制することで、パフォーマンスを最適化するテクニック。

これらは、コアAPIの能力を特定の応用分野へと特化させた強力なツール群であり、堅牢なアプリケーション構築に不可欠なものだ。

:::