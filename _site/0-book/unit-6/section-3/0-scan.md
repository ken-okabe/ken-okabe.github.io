:::lang-en

# `scan` — Evolution of State Along the Timeline

`scan` is one of the most powerful primitives in this library. It serves as the fundamental tool for constructing a timeline that has "state" which evolves over time.

## The Three Dimensions of Folding: Structure and Time

To understand the unique role of `scan`, we will compare three types of "folds" in programming. The first two deal with **Structure**, while the third, `scan`, deals with a completely different dimension: **Time**.

1.  **`fold` (Folding of Structure)**: Deals with a static collection structure like `[1, 2, 3]` and calculates **one final value** (e.g., `6`).
2.  **`foldTimelines` (Folding of Structure)**: Deals with a list of timelines (a dynamic collection structure) like `[Timeline<1>, Timeline<2>, Timeline<3>]` and combines them into **one resulting timeline**.
3.  **`scan` (Folding of Time)**: Deals with a **single timeline** (a temporal event stream) like `1 -> 2 -> 3` and, each time an event occurs, generates a **new timeline that holds the intermediate values** (e.g., `1 -> 3 -> 6`).

The following comparison table summarizes these differences.

| Feature | `fold` (Structure) | `foldTimelines` (Structure) | `scan` (Time) |
| :--- | :--- | :--- | :--- |
| **Purpose** | Final aggregation | **Structural** composition | **Temporal** aggregation |
| **Input** | Array, etc. | **List** of timelines | **One** timeline |
| **Processing** | All at once | All at once | **Each time** an event occurs |
| **Output** | One final value | Timeline of the **final result** | Timeline of **intermediate progress** |
| **Analogy** | **Total amount** in a shopping cart 🧾 | **Final tally** of multiple votes 🗳️ | **Account balance history** 📈 |

`fold` and `foldTimelines` are very similar in that they both combine an input "collection structure" into one. On the other hand, this comparison makes it clear that `scan` is a tool with a completely different purpose: to track the **temporal changes of a single stream**. It is the core operation for constructing a **stateful timeline** that remembers its past history and updates its state based on new inputs.

-----

## API Definition

##### F\#: `scan: ('state -> 'input -> 'state) -> 'state -> Timeline<'input> -> Timeline<'state>`

*Note: In F\#, `scan` is a standalone function.*

##### TS: `.scan<S>(accumulator: (acc: S, value: T) => S, seed: S): Timeline<S>`

-----

## Code Example in TypeScript

Let's look at the behavior of `scan` with a counter that sums up incoming numbers.

```typescript
// Create a timeline of numbers
const numberStream = Timeline<number>(0);

// Use scan to sum up the incoming numbers
const runningTotal = numberStream.scan(
  (sum, currentValue) => sum + currentValue, // accumulator: add the new value to the current sum
  0 // seed: the initial value of the sum
);

// runningTotal always holds the latest total
console.log(runningTotal.at(Now)); // 0

numberStream.define(Now, 5);
console.log(runningTotal.at(Now)); // 5 (0 + 5)

numberStream.define(Now, 10);
console.log(runningTotal.at(Now)); // 15 (5 + 10)

numberStream.define(Now, -3);
console.log(runningTotal.at(Now)); // 12 (15 - 3)
```

-----

## Canvas Demo (Placeholder)

A demo that visualizes how the state timeline (the total sum) constructed by `scan` is updated in real-time each time a number flows into the input timeline.

-----

:::

:::lang-ja

# `scan` — 時間軸に沿った状態の進化

`scan`は、このライブラリで最も強力なプリミティブの一つです。これは、時間とともに進化する「状態」を持つタイムラインを構築するための、基本的なツールとなります。

## 畳み込みの3つの次元：構造と時間

`scan`のユニークな役割を理解するため、プログラミングにおける3種類の「畳み込み（fold）」を比較します。最初の2つは**構造 (Structure)** を扱い、3つ目の`scan`は**時間 (Time)** という全く異なる次元を扱います。

1.  **`fold` (構造の畳み込み)**: `[1, 2, 3]` のような配列（静的なコレクション構造）を扱い、**一つの最終的な値**（例：`6`）を算出します。
2.  **`foldTimelines` (構造の畳み込み)**: `[Timeline<1>, Timeline<2>, Timeline<3>]` のようなタイムラインのリスト（動的なコレクション構造）を扱い、それらを**一つの結果タイムライン**に合成します。
3.  **`scan` (時間の畳み込み)**: `1 -> 2 -> 3` のような**単一のタイムライン**（時間的なイベントストリーム）を扱い、イベントが発生するたびに**途中経過の値を保持する新しいタイムライン**（例：`1 -> 3 -> 6`）を生成します。

これらの違いをまとめたのが、以下の比較表です。

| 特徴 | `fold` (構造) | `foldTimelines` (構造) | `scan` (時間) |
| :--- | :--- | :--- | :--- |
| **目的** | 最終的な集計 | **構造的**な合成 | **時間的**な集約 |
| **入力** | 配列など | タイムラインの**リスト** | **1つ**のタイムライン |
| **処理** | 一度に全体 | 一度に全体 | イベントの**たびに** |
| **出力** | 1つの最終値 | **最終結果**のタイムライン | **途中経過**のタイムライン |
| **比喩** | 買い物かごの**合計金額** 🧾 | 複数の投票の**最終集計** 🗳️ | 銀行口座の**残高推移** 📈 |

`fold`と`foldTimelines`は、共に入力となる「コレクション構造」を一つにまとめる点で非常によく似ています。一方で`scan`は、**単一のストリームの時間的な変化**を追跡するための、全く異なる目的を持つツールであることが、この比較から明確になります。それは過去の履歴を記憶し、新しい入力に基づいて状態を更新していく、**状態を持つタイムライン**を構築するための核心的な操作なのです。

-----

## API定義

##### F\#: `scan: ('state -> 'input -> 'state) -> 'state -> Timeline<'input> -> Timeline<'state>`

*Note: In F\#, `scan` is a standalone function.*

##### TS: `.scan<S>(accumulator: (acc: S, value: T) => S, seed: S): Timeline<S>`

-----

## TypeScriptによるコード例

`scan`の動作を、流れてくる数値を合計していくカウンターで見てみましょう。

```typescript
// 数値のタイムラインを作成
const numberStream = Timeline<number>(0);

// scanを使って、流れてくる数値を合計していく
const runningTotal = numberStream.scan(
  (sum, currentValue) => sum + currentValue, // accumulator: 現在の合計値に新しい値を加算
  0 // seed: 合計値の初期値
);

// runningTotalは常に最新の合計値を保持する
console.log(runningTotal.at(Now)); // 0

numberStream.define(Now, 5);
console.log(runningTotal.at(Now)); // 5 (0 + 5)

numberStream.define(Now, 10);
console.log(runningTotal.at(Now)); // 15 (5 + 10)

numberStream.define(Now, -3);
console.log(runningTotal.at(Now)); // 12 (15 - 3)
```

-----

## Canvasデモ (Placeholder)

入力タイムラインに数値が流れるたびに、`scan`によって構築された状態タイムライン（合計値）がリアルタイムに更新されていく様子を視覚化するデモ。

-----

:::