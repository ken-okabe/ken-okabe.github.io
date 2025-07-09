---
title: "\U0001F50D Overview - Unit 5"
description: >-
  In this chapter, we bring together the core ideas explored so far and focus on
  one of the most powerful aspects of functional programming: the unified
  treatment of state, events, and concurrency.
---
In this chapter, we bring together the core ideas explored so far and focus on one of the most powerful aspects of functional programming: the unified treatment of state, events, and concurrency.

Here, we will see how functional programming—especially through the lens of Functional Reactive Programming (FRP)—offers a cohesive and elegant approach to managing values that change over time, discrete events, and concurrent computations. This unit builds directly on the unifying perspective introduced in Unit 0, showing how streams and pipelines can simplify even the most complex interactive and concurrent applications.


# 🔷Unit 5🔷 コアAPI — 宣言的プログラミングの基盤

このユニットでは、`Timeline`ライブラリの核となるAPI群を探求します。リアクティブな値を生成し、変換し、そしてリソースのライフサイクルを管理するための基本的なビルディングブロックを一つずつ見ていきましょう。これらのAPIは、このライブラリの根底にある「ブロック宇宙」という哲学を、いかにして実践的なコードに落とし込んでいるのかを明らかにする鍵となります。
