:::lang-en

# 🔍 Overview - Unit 7

The theme of this unit is **"Composition."** We will explain a hierarchical and mathematically beautiful set of APIs for combining multiple `Timeline`s to create a single new `Timeline`.

This Unit begins with `combineLatestWith`, the foundation of all composition. This is nothing other than a concrete implementation of the Applicative Functor we learned about in Unit 4.

Next, we will show how to scale this simple binary operation. The key to this is the algebraic structure known as a **Monoid**. You will witness how intuitive high-level APIs like `andOf`, `orOf`, and `listOf` are naturally derived from a single folding function, `foldTimelines`, and their respective Monoids.

Through this unit, you will move from the art of manipulating a single `Timeline` to acquiring the design philosophy of declaratively composing **collections** of `Timeline`s to elegantly construct complex states.

:::

:::lang-ja

# 🔍 Overview - Unit 7

このユニットのテーマは**「合成」**だ。複数の`Timeline`を組み合わせて、一つの新しい`Timeline`を創り出すための、階層的かつ数学的に美しいAPI群を解説する。

このUnitは、すべての合成の基礎となる`combineLatestWith`から始まる。これは、Unit 4で学んだApplicative Functorの具体的な実装に他ならない。

次に、この単純な二項演算を、いかにしてスケールさせるかを示す。その鍵となるのが**Monoid**という代数的構造だ。`andOf`, `orOf`, `listOf`といった直感的な高レベルAPIが、実は`foldTimelines`という一つの畳み込み関数と、それぞれのMonoidからいかに自然に導出されるかを目撃するだろう。

このユニットを通じて、あなたは単一の`Timeline`を操作する術から、`Timeline`の**コレクション**を宣言的に合成し、複雑な状態をエレガントに構築する設計思想を身につける。

:::