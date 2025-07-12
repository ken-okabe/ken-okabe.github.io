:::lang-en

# Chapter 3: bind — The Dynamic Dependency Graph

In Chapters 1 and 2, we saw how `.map()` and `.link()` build **static** dependencies that, once defined, do not change.

However, `.map()` can only transform values; it cannot switch the `Timeline` itself. The challenge of **dynamically and safely switching the dependency structure itself (i.e., while cleaning up old dependencies)** is solved by `.bind()`.

### `.bind()` — The HOF for Switching Dependencies

The essence of `.bind()` is not merely to transform a value, like `.map()`, but to accept a function that, **based on the value of the source `Timeline`, returns the next `Timeline` to connect to**.

This allows us to build dynamic systems where the wiring of the dependency graph changes over time.

### API Definition

#### **F\#**: `bind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b>`

##### TS: `.bind<B>(monadf: (value: A) => Timeline<B>): Timeline<B>`

The crucial difference from `.map()` is that the function it takes (`monadf`) accepts a value `A` and returns a **new `Timeline<B>`**.

## What is the use of `bind` or the Monad algebraic structure in a FRP library like Timeline?

Throughout this book, we have investigated the abstract concept of the Monad algebraic structure and its concrete function, `bind`. But what is the use of this Monad in FRP?

In reality, most programmers do not have an answer to this mystery. And perhaps even the developers of existing FRP libraries and participants in their ecosystems do not. It is observed that they likely do not have a clear answer.

Therefore, I would like to present a clear answer here and now.

## The Diamond Problem in FRP Libraries—Atomic Update

### 1. Definition of the Diamond Problem

The diamond problem in Functional Reactive Programming (FRP) refers to issues of glitches and inefficiency that arise when a dependency graph forms a diamond shape. Specifically, it occurs when a timeline `D` depends on two other timelines, `B` and `C`, both of which depend on a common source, `A`.

```
      A
     / \
    B   C
     \ /
      D
```

In this structure, when the value of `A` is updated, the change propagates to both `B` and `C`, and subsequently, the updates from `B` and `C` propagate to `D`.

#### The Problem:

*   **When A is updated, B and C are updated.**
*   **However, if the update order of B and C is indeterminate, D may be updated twice at different times.**
*   **D might be calculated with a temporarily inconsistent state (a glitch).**

#### Concrete Example:

Consider the case where the value of `A` changes from `5` to `10`.

JavaScript

```js
let A = 10;
let B = A + 1;    // Expected: 11
let C = A * 2;    // Expected: 20
let D = B + C;    // Expected: 31
```

However, depending on the propagation order of updates, a glitch can occur.

1.  If `B` is updated first, `D` will be calculated using the new value of `B` (`11`) and the old value of `C` (`10`).
    `D = 11 + 10 = 21` (Glitch)

2.  Afterward, `C` is updated, and `D` is recalculated using the new value of `B` (`11`) and the new value of `C` (`20`).
    `D = 11 + 20 = 31` (Final correct value)

This intermediate state (`D=21`) can cause unintended side effects (e.g., temporary UI flickering) and can be a source of serious bugs.

-----

### 2. The Approach of Many Existing FRP Libraries

To solve this deep-rooted problem, many existing FRP libraries (e.g., RxJS, Bacon.js, MobX) implement highly complex internal mechanisms. They primarily adopt an approach of not propagating updates synchronously and immediately, but rather queuing them and executing them in a controlled manner.

*   **Topological Sort for Update Order Control**: They analyze the dependency graph and reorder the execution of calculations to ensure updates are performed in the correct order: `A`→`B`, `A`→`C`, then (`B`,`C`)→`D`.

*   **Bulk Updates via Transactions**: All changes originating from an update to `A` (i.e., updates to `B` and `C`) are grouped into a single "transaction." Only after this transaction is complete (i.e., both `B` and `C` are updated) is the calculation for `D` performed, and only once.

*   **Consistency Checks with Timestamps**: A timestamp is attached to each update. When calculating `D`, the system checks that its dependencies (`B`, `C`) have updates with the same timestamp (i.e., originating from the same event) before performing the calculation.

These techniques are effective, but they complicate the library's internal implementation and can lead to behavior that is opaque to the developer. This is also described as achieving **atomic updates**.

-----

### 3. The Timeline Library's Approach: "It's Wrong for the Diamond Problem to Occur in the First Place"

The `Timeline` library, rather than relying on such low-level mechanisms, cuts this problem off at its root through a higher level of abstraction. Its philosophy is the highly refined idea that **"a design that allows the diamond problem to occur is itself flawed, and a better design should be chosen."

#### Conceptual Purity: Expressing the Essence of "Defining D from A"

The ultimate solution presented by this library is to use `.bind` (a monadic composition).

TypeScript

```ts
const D = A.bind(a => {
    const b = a * 2;
    const c = a + 10;
    return Timeline(b + c);
});
```

The reason this approach is superior to other libraries or workaround-style techniques lies in its **conceptual purity**. The essential dependency in the diamond problem is the fact that "the value of `D` is ultimately determined solely by the value of `A`." `B` and `C` are merely intermediate values in that calculation process.

This code using `bind` expresses that essence in a remarkably straightforward way. For each value `a` of `A`, it defines a single, pure relationship that returns a `Timeline` containing the new state of `D`. This embodies the very philosophy of the library, elevating the perspective from an imperative world, often fraught with side effects, to a declarative world of data flow.

A single `bind` naturally forms a Monad structure that performs **atomic updates**. No complex underlying mechanisms are needed.

### 4. A Simple and Refined Solution Unmatched by Other Libraries

The benefits of this `bind` approach are numerous.

#### 1. Structural Elimination of Glitches

As a common approach, trying to define `B` and `C` separately with `.map` and then combining them to create `D` gives rise to the "problematic structure" of a diamond. However, by using `bind`, the dependency graph changes fundamentally.

Plaintext

```
+-----------+     .bind(a => { return Timeline(d); })    +-----------+
| Timeline A| ------------------------------------------> | Timeline D|
+-----------+                                             +-----------+
```

There are no longer intermediate `timelineB` or `timelineC`, and the diamond structure itself is never formed. Therefore, problems like glitches and multiple updates **cannot structurally occur**. This is a solution on a different level: not fixing a problem after it occurs, but **choosing a superior design where the problem does not arise**.

#### 2. Execution Efficiency

In this structure, every time `A` is updated, the function passed to `bind` is executed only once, and `D` is calculated only once. This is highly efficient.

#### 3. Complete Elimination of Transactional Processing

Even more importantly, the **complex, low-level processing such as transaction handling and scheduling, which other libraries perform under the hood to avoid glitches, becomes entirely unnecessary**. By using a high-level abstraction (the Monad), this library achieves further execution efficiency and simplicity, eliminating the need for such wasteful processing.

#### 4. Readability

The logic for calculating the value of `D` from the value of `A` (the calculation of `b` and `c`, and their addition) is all contained within the `bind` callback. This dramatically improves code readability and makes the logic easier to maintain.

### 5. Conclusion: "A Design Where Problems Don't Occur" through Monads

Many other solutions are all "post-problem-fixes." They are merely symptomatic treatments that attempt to hide the glitches that have occurred with a complex mechanism called a transaction.

However, `bind` enables **"a design where problems don't occur."** This is the very beauty of functional programming.

`.bind` is backed by the mathematical laws of Monad, and its behavior is completely predictable. **With the powerful abstraction of the Monad, developers can completely control side effects (in this case, the unintended propagation of intermediate states) and safely describe only the essential computation.

The `Timeline` library, being faithful to theory, naturally provides not only `.map` but also `.bind`. This was not intentionally designed with the thought, "this can solve the diamond problem." The Monad algebraic structure is there from the beginning.

This fundamentally theoretical library design is precisely the driving force that naturally provides developers with this "structurally elegant problem-solving," and this is the proof of the design philosophy that sets this library apart from other FRP libraries.

## The Natural Question of Performance

However, the fact that the function passed to `.bind` creates a new `innerTimeline` with every update of the source `Timeline` raises a natural concern for experienced developers: "Doesn't this constantly create unnecessary objects, becoming a direct cause of performance degradation?" This question is valid and is a crucial point in understanding how the powerful concept of `bind` is made practical.

## The Answer: A Design for Safely Realizing Dynamic Graphs

In conclusion, there is no need to worry. The `Timeline` library is designed to execute the dynamic graph structure switching brought about by `bind` safely and efficiently. The core of this is that **the framework completely and automatically disposes of any `innerTimeline` that has served its role, without any leaks**. This is an **extremely important implementation feature of this library** that allows the powerful concept of `bind` to be utilized without the fear of resource leaks.

This mechanism for safely managing the dynamic graph structure is realized by the `Timeline` library's heart, `DependencyCore`, and a concept called `Illusion`. Let's take a closer look at this technical foundation next.

## `DependencyCore`

How is this dynamic switching of dependencies achieved? The answer lies in the heart of the `Timeline` library: **`DependencyCore`**.

`DependencyCore` is an invisible central management system that records and manages the dependencies between all `Timeline`s existing in the application. While `.map()` and `.link()` register static dependencies, `.bind()` utilizes this `DependencyCore` in a more advanced way.

## `Illusion` — The Time-Evolving Dependency Graph

The dynamic switching of dependencies brought about by `.bind()` is a manifestation of a deeper, more powerful concept in the library's design. To understand it, let's first organize the different levels of "mutability" in `map` and `bind`.

-   **Level 1 Mutability (The world of `map`/`link`)**: In a static dependency, the `Timeline` object itself is an immutable entity. The only thing that is "mutable" is the internal value **`_last`**, which is updated as the `Now` viewpoint moves. This can be called the minimal unit of **illusion**, the "current value" in the block universe.
-   **Level 2 Mutability (The world of `bind`)**: When `.bind()` is introduced, this concept of mutability is **extended**. It's no longer just the `_last` value that gets replaced. The `innerTimeline` object returned by `.bind()` is swapped out entirely according to the source's value. This means that the **`Timeline` itself, which defines the "truth" of a given moment, becomes a temporary, replaceable entity**.

This "structural" level of mutability is the essence of the `Illusion` concept.

Conceptually, the resulting `Timeline` object from a `bind` call (e.g., `currentUserPostsTimeline`) is an **immutable entity created only once**.

However, for the exact same reason that our viewpoint, `Now`, is a **mutable cursor** moving along the timeline, the `innerTimeline` that is always synchronized with that cursor (e.g., the posts `Timeline` for `"user123"` or the posts `Timeline` for `"user456"`) **must also be mutable**.

The fundamental reason the `innerTimeline` must be "destroyed" is that **the dependency graph itself evolves over time in sync with the movement of the `Now` cursor, and the structure of the graph is different at each time coordinate**.

This "state of the time-evolving dependency graph at a particular moment" is precisely what **`Illusion`** is. And the task of synchronizing the movement of the `Now` cursor with the rewriting of this `Illusion` (destroying the old and creating the new) is managed imperatively and collectively by `DependencyCore`.

In other words, `Illusion` is a concept that **extends the "value-level mutability" of `_last` to the "structure-level mutability" of `innerTimeline`**. And as we introduce `.using()` in subsequent chapters, this concept of mutability will be further extended to the "lifecycle of external resources."

## Application Case: Building Dynamic UIs

So far, we have looked at the essential power of `bind` (building dynamic dependency graphs) and the library's implementation that safely supports it (automatic resource management by `DependencyCore` and `Illusion`). So, what value is created in actual application development when this theory and implementation technology are combined? Let's look at a scenario that frequently occurs in modern UI development: "dynamically switching the component to be displayed according to the user's selection."

In modern applications, the need to dynamically switch the dependency relationship itself arises frequently. For example, consider a case in a social media application where you switch the user's timeline to be displayed.

```javascript
// Alice's timeline
const alicesPosts = Timeline(["Alice's post 1", "Alice's post 2"]);

// Bob's timeline
const bobsPosts = Timeline(["Bob's post 1", "Bob's post 2"]);

// Currently selected user ID
const selectedUserId = Timeline("alice");

// Here, we want to switch between alicesPosts and bobsPosts depending on the value of selectedUserId
// But this cannot be achieved with map...
// const currentUserPosts = selectedUserId.map(id => {
//   if (id === "alice") return alicesPosts; // This returns a Timeline
//   else return bobsPosts;
// });
```

### Practical Example: Dynamic Switching of a Social Media Timeline

Let's implement the previous social media example using `.bind()`.

```typescript
const usersData = {
    "user123": { name: "Alice", posts: Timeline(["post1", "post2"]) },
    "user456": { name: "Bob", posts: Timeline(["post3", "post4"]) }
};

const selectedUserIdTimeline = Timeline<keyof typeof usersData>("user123");

// Depending on the selected user ID, switch the connection to that user's posts Timeline
const currentUserPostsTimeline = selectedUserIdTimeline.bind(
    userId => usersData[userId].posts
);

console.log("Initial user posts:", currentUserPostsTimeline.at(Now));
// > Initial user posts: ["post1", "post2"]

// Switch the user selection
selectedUserIdTimeline.define(Now, "user456");

console.log("Switched user posts:", currentUserPostsTimeline.at(Now));
// > Switched user posts: ["post3", "post4"]
```

This code example brilliantly demonstrates two aspects of `bind`. First, the **theoretical aspect**: it describes the complex requirement of dynamically switching the UI state in a highly declarative way. Second, the **implementation aspect**: behind the scenes, `DependencyCore` reliably disposes of the old `innerTimeline` through the `Illusion` mechanism, so the developer does not need to be conscious of resource management. Thus, `bind` shows its true value only when a powerful theory and a robust implementation that supports it are combined.

:::

:::lang-ja

# Chapter 3: `bind` — 動的な依存グラフ

Chapter 1と2では、`.map()`と`.link()`が、一度定義されると変化しない**静的な**依存関係を構築する方法を見ました。

`.map()`はあくまで値を変換するだけなので、`Timeline`そのものを切り替えることはできません。この、**依存関係の構造そのものを、動的に、かつ安全に（＝古い依存関係をクリーンアップしながら）切り替える**課題を解決するのが`.bind()`です。

### `.bind()` — 依存関係を切り替えるHOF

`.bind()`の本質は、`.map()`のように単に値を変換するのではなく、**ソース`Timeline`の値に基づいて、次に接続すべき`Timeline`そのものを返す関数**を受け取ることです。

これにより、依存グラフの配線が時間と共に変化する、動的なシステムを構築できます。

### API定義

#### **F\#**: `bind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b>`

##### TS: `.bind<B>(monadf: (value: A) => Timeline<B>): Timeline<B>`

引数に取る関数（`monadf`）が、値`A`を受け取り、**新しい`Timeline<B>`を返す**点が`.map()`との決定的な違いです。

## TimelineというFRPライブラリで `bind` あるいはMonadという代数構造はいったい何の役に立つのか？

我々はこの本を通じて、Monadという代数構造の抽象概念、その具体的な関数としての、`bind` を調べてきました。しかしFRPではこのMonadと言う代物はいったい何の役に立つのか？

実際このミステリーについてはほとんどのプログラマーは答えを持っていません。そして、既存のFRPライブラリの開発者、エコの参加者でさえそうかもしれません。彼らは明確な答えを持っていないだろうと観察されます。

そこで、今ここで一つの明確な答えを示したいと思います。

## FRPライブラリのダイアモンド問題ーAtomic Update

### 1\. ダイアモンド問題の定義

FRP（Functional Reactive Programming）におけるダイアモンド問題とは、依存関係のグラフが菱形（ダイアモンド型）になった時に発生する、グリッチ（Glitch）と非効率性に関する問題です。具体的には、あるタイムライン`D`が`B`と`C`という2つのタイムラインに依存し、その`B`と`C`が共通のソースである`A`に依存している場合に起こります。

```
      A
     / \
    B   C
     \ /
      D
```

この構造で`A`の値が更新されると、その変更は`B`と`C`の両方に伝播し、続いて`B`と`C`の更新が`D`に伝播します。

#### 問題の内容：

* **Aが更新されると、BとCが更新される**

* **しかし、BとCの更新順序が不定だと、Dが異なるタイミングで2回更新される可能性がある**

* **一時的に不整合な状態でDが計算されることがある（グリッチ）**

#### 具体例：

`A`の値が`5`から`10`に変更されたケースを考えます。

JavaScript

```js
let A = 10;
let B = A + 1;    // 期待値: 11
let C = A * 2;    // 期待値: 20
let D = B + C;    // 期待値: 31
```

しかし、更新の伝播順序によっては、グリッチが発生します。

1.  `B` が先に更新されると、`D` は `B` の新しい値(`11`)と`C`の古い値(`10`)を使って計算されてしまいます。

    `D = 11 + 10 = 21` (グリッチ)

2.  その後に`C`が更新され、`D`は`B`の新しい値(`11`)と`C`の新しい値(`20`)を使って再度計算されます。

    `D = 11 + 20 = 31` (最終的な正しい値)

この中間状態（`D=21`）は、意図しない副作用（例: UIの一時的なちらつき）を引き起こす可能性があり、深刻なバグの原因となります。

-----

### 2\. 既存の多くのFRPライブラリのアプローチ

この根深い問題を解決するため、多くの既存FRPライブラリ（例えば、RxJS、Bacon.js、MobXなど）は、内部的に高度で複雑な機構を実装しています。それらは主に、更新を同期的に即時伝播させるのではなく、一度更新をキューイングし、制御された方法で実行するアプローチを取ります。

* **トポロジカルソートによる更新順序の制御**: 依存関係グラフを解析し、`A`→`B`、`A`→`C`、(`B`,`C`)→`D`という正しい順序で更新が実行されるように、計算の実行順序を並べ替えます。

* **トランザクションによる一括更新**: `A`の更新に起因する全ての変更（`B`と`C`の更新）を一つの「トランザクション」としてまとめます。そして、そのトランザクションが完了した後（つまり`B`と`C`の両方が更新された後）に初めて、`D`の計算を一度だけ実行します。

* **タイムスタンプによる整合性チェック**: 各更新にタイムスタンプを付与し、`D`を計算する際に、依存元（`B`, `C`）の更新が同じタイムスタンプを持つ（つまり同じイベントに由来する）ことを確認してから計算を実行します。

これらの手法は有効ですが、ライブラリの内部実装を複雑にし、開発者からは見えない挙動を生み出す原因ともなります。

**Atomic update** を実現している、とも表現されます。

-----

### 3\. Timelineライブラリのアプローチ：「そもそもDiamond問題なんて起こるほうがおかしい」という思想

`Timeline`ライブラリは、上記のような低レベルな機構に頼るのではなく、より高次元な抽象化によって、この問題を根源から断ち切ります。その思想は、　**「ダイアモンド問題が起こるような設計自体が誤りであり、より優れた設計を選択すべき」** という、極めて洗練されたものです。

#### 概念的な純粋性：「AからDを定義する」という本質の表現

このライブラリが提示する究極の解決策は、`.bind`（モナド的構成）を用いることです。

TypeScript

```ts
const D = A.bind(a => {
    const b = a * 2;
    const c = a + 10;
    return Timeline(b + c);
});
```

このアプローチが他のライブラリや回避策的な手法よりも優れている理由は、その**概念的な純粋性**にあります。ダイアモンド問題における本質的な依存関係は、「`D`の値は、突き詰めれば`A`の値のみによって決定される」という事実です。`B`と`C`は、その計算過程における中間的な値に過ぎません。

`bind`を用いたこのコードは、その本質を極めて素直に表現しています。`A`の各値`a`に対して、`D`の新しい状態を内包した`Timeline`を返す、という単一の、純粋な関係性を定義しているのです。これは、しばしば副作用を伴う命令的な世界から、宣言的なデータフローの世界へと視点を引き上げる、このライブラリの思想そのものを体現しています。

単に `bind` ひとつだけで自然に **Atomic update** するMonad構造になっているのです。何ら水面下の複雑な仕組みも必要としていません。

### 4\. 他のライブラリを寄せ付けないシンプルかつ洗練された解決策

この`bind`によるアプローチがもたらす利点は、多岐にわたります。

#### 1\. グリッチの構造的排除

一般的なアプローチとして、`.map`で`B`と`C`を個別に定義し、それらを合成して`D`を生成しようとすると、ダイアモンドという「問題のある構造」が生まれてしまいます。しかし、`bind`を使うことで、依存グラフは根本的に変わります。

Plaintext

```
+-----------+     .bind(a => { return Timeline(d); })    +-----------+
| Timeline A| ------------------------------------------> | Timeline D|
+-----------+                                             +-----------+

```

もはやそこには中間的な`timelineB`も`timelineC`も存在せず、菱形（ダイアモンド）構造自体が生まれません。したがって、グリッチや複数回更新という問題は**構造的に発生し得ない**のです。これは、発生した問題を後から解決するのではなく、**問題が発生しない優れた設計を選ぶ**という、次元の違う解決策です。

#### 2\. 実行効率

この構造では、`A`が更新されるたびに`bind`に渡された関数が一度だけ実行され、`D`は一度だけ計算されます。これは非常に効率的です。

#### 3\. トランザクション処理の完全な不要性

さらに重要なのは、他のライブラリがグリッチを回避するために水面下で行っている**トランザクション処理やスケジューリングといった、複雑で低レベルな処理が一切不要になる**という点です。このライブラリは、高レベルな抽象化（モナド）を用いることで、そのような無駄な処理を必要としない、さらなる実行効率とシンプルさを実現しています。

#### 4\. 可読性

`A`の値から`D`の値を計算するためのロジック（`b`と`c`の計算、そしてそれらの足し算）が、`bind`のコールバック内に全てまとまっています。これにより、コードの可読性は劇的に向上し、ロジックの保守も容易になります。

### 5\. 結論：モナドによる「問題が起きない設計」

他の多くの解決策は、すべて「問題が起きた後の対処」です。それらは、発生してしまったグリッチを、トランザクションという名の複雑な機構で隠蔽しようとする対症療法に過ぎません。

しかし、`bind`は **「問題が起きない設計」** を可能にします。これこそが、関数型プログラミングの美しさそのものです。

`.bind`はMonad則という数学的な法則に裏打ちされており、その振る舞いは完全に予測可能です。**モナドという強力な抽象化によって、開発者は副作用（この場合は中間状態の意図しない伝播）を完全に制御し、本質的な計算だけを安全に記述できるのです。

`Timeline`ライブラリは、理論に忠実なので、自然な流れで、`.map`だけでなく`.bind`を提供しています。これは別にわざわざ「ダイアモンド問題はこれで解決可能だ」と意図して設計したものではありません。Monadという代数構造は最初からそこにあるのです。

その根元的に理論的なライブラリ設計こそが、まさにこの「構造的にエレガントな問題解決」を開発者に自然と提供できる原動力であり、これこそが、このライブラリが他のFRPライブラリと一線を画す、設計思想の証左と言えるでしょう。

## パフォーマンスへの自然な疑問

しかし、`.bind`に渡された関数が、ソース`Timeline`の更新のたびに新しい`innerTimeline`を生成するという事実は、経験豊富な開発者に当然の懸念を抱かせます。『これは、不要なオブジェクトを絶えず生成し、パフォーマンスを低下させる直接的な原因になるのではないか？』と。この疑問はもっともであり、`bind`の強力な概念を、いかにして実用的なものにしているかを理解する上で、重要な論点です。

## 答え：動的なグラフを安全に実現する設計

結論から言えば、その心配は不要です。`Timeline`ライブラリは、`bind`がもたらす動的なグラフ構造の切り替えを、安全かつ効率的に実行するための設計がなされています。その核心は、**役割を終えた`innerTimeline`を、フレームワークが一切の漏れなく、完全に自動で破棄する**という点にあります。これは、`bind`の強力な概念を、リソースリークの恐怖なしに活用可能にするための、**このライブラリの極めて重要な実装上の特徴**なのです。

この動的なグラフ構造を安全に管理する仕組みは、`Timeline`ライブラリの心臓部である`DependencyCore`と、`Illusion`という概念によって実現されています。次にその技術的な基盤を詳しく見ていきましょう。

## `DependencyCore`

この動的な依存関係の切り替えは、どのようにして実現されているのでしょうか。その答えは、`Timeline`ライブラリの心臓部である\*\*`DependencyCore`\*\*にあります。

`DependencyCore`は、アプリケーション内に存在する全ての`Timeline`間の依存関係を記録・管理する、目に見えない中央管理システムです。`.map()`や`.link()`が静的な依存関係を登録するのに対し、`.bind()`はこの`DependencyCore`をより高度に利用します。

## `Illusion` — 時間発展する依存グラフ

`.bind()`がもたらす動的な依存関係の切り替えは、このライブラリの設計における、より深く、より強力な概念の現れです。それを理解するために、まず`map`と`bind`における「可変性」のレベルの違いを整理しましょう。

- **レベル1の可変性 (`map`/`link`の世界)**: 静的な依存関係では、`Timeline`オブジェクトそのものは不変の存在です。唯一「可変」なのは、`Now`という視点の移動に伴って更新される、内部の値 **`_last`** です。これは、ブロック宇宙における「現在の値」という、最小単位の\*\*イリュージョン（幻想）\*\*と言えます。
  - **レベル2の可変性 (`bind`の世界)**: `.bind()`を導入すると、この可変性の概念が**拡張**されます。もはや`_last`という値だけが入れ替わるのではありません。`.bind()`が返す`innerTimeline`オブジェクトそのものが、ソースの値に応じて、まるごと入れ替わります。つまり、ある瞬間の「真実」を定義している\*\*`Timeline`自体が、一時的で、入れ替え可能な存在\*\*になるのです。

この「構造」レベルの可変性こそが、`Illusion`という概念の本質です。

概念的には、`bind`が返す結果の`Timeline`オブジェクト（例えば`currentUserPostsTimeline`）は、**最初に一度だけ生成される不変（Immutable）な存在**です。

しかし、我々の視点である`Now`が時間軸に沿って動く**可変な（Mutable）カーソル**であるのと全く同じ理由で、そのカーソルと常に同期している`innerTimeline`（例えば`"user123"`の投稿`Timeline`や`"user456"`の投稿`Timeline`）は、**可変でなければなりません**。

`innerTimeline`が「破壊」されなければならない根本的な理由は、**`Now`カーソルの移動と同期して、依存グラフそのものが時間発展しており、それぞれの時間座標においてグラフの構造が異なる**からです。

この、時間発展する依存グラフの「ある瞬間における状態」こそが\*\*`Illusion`\*\*です。そして、`Now`カーソルの移動と、この`Illusion`の書き換え（古いものの破棄と新しいものの生成）を同期させる作業を、`DependencyCore`が一括して命令的に管理しているのです。

つまり`Illusion`とは、`_last`という\*\*「値レベルの可変性」を、`innerTimeline`という「構造レベルの可変性」へと拡張した概念\*\*なのです。そして後続の章で`.using()`を導入する際には、この可変性の概念がさらに「外部リソースのライフサイクル」にまで拡張されていきます。

## 応用ケース：動的なUI構築

ここまで、`bind`が持つ本質的な力（動的な依存グラフの構築）と、それを安全に支えるライブラリの実装（`DependencyCore`と`Illusion`による自動リソース管理）を見てきました。では、この理論と実装技術が組み合わさることで、実際のアプリケーション開発でどのような価値が生まれるのでしょうか。現代的なUI開発で頻繁に発生する、『ユーザーの選択に応じて、表示するコンポーネントを動的に切り替える』というシナリオを見ていきましょう。

現代的なアプリケーションでは、状況に応じて依存関係そのものを動的に切り替える必要性が頻繁に生じます。例えば、SNSアプリケーションで、表示するユーザーのタイムラインを切り替えるようなケースを考えてみましょう。

```javascript
// Aさんのタイムライン
const alicesPosts = Timeline(["Alice's post 1", "Alice's post 2"]);

// Bさんのタイムライン
const bobsPosts = Timeline(["Bob's post 1", "Bob's post 2"]);

// 現在選択されているユーザーID
const selectedUserId = Timeline("alice");

// ここで、selectedUserIdの値に応じて、alicesPostsとbobsPostsを切り替えたい
// しかし、mapでは実現できない...
// const currentUserPosts = selectedUserId.map(id => {
//   if (id === "alice") return alicesPosts; // Timelineを返してしまう
//   else return bobsPosts;
// });
```

### 実践例：SNSタイムラインの動的切り替え

先ほどのSNSの例を、`.bind()`を使って実装してみましょう。

```typescript
const usersData = {
    "user123": { name: "Alice", posts: Timeline(["post1", "post2"]) },
    "user456": { name: "Bob", posts: Timeline(["post3", "post4"]) }
};

const selectedUserIdTimeline = Timeline<keyof typeof usersData>("user123");

// 選択されたユーザーIDに応じて、そのユーザーの投稿Timelineに接続を切り替える
const currentUserPostsTimeline = selectedUserIdTimeline.bind(
    userId => usersData[userId].posts
);

console.log("Initial user posts:", currentUserPostsTimeline.at(Now));
// > Initial user posts: ["post1", "post2"]

// ユーザー選択を切り替える
selectedUserIdTimeline.define(Now, "user456");

console.log("Switched user posts:", currentUserPostsTimeline.at(Now));
// > Switched user posts: ["post3", "post4"]
```

このコード例は、`bind`の二つの側面を見事に示しています。第一に、**理論的な側面**として、UIの状態を動的に切り替えるという複雑な要求を、極めて宣言的に記述しています。第二に、**実装的な側面**として、その裏側では`DependencyCore`が`Illusion`の仕組みを通じて古い`innerTimeline`を確実に破棄しており、開発者はリソース管理を意識する必要がありません。このように、強力な理論とそれを支える堅牢な実装が両立して初めて、`bind`はその真価を発揮するのです。

:::