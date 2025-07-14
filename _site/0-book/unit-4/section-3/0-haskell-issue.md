:::lang-en

# The Myth of Haskell's "Theoretical Superiority": A Critical Verification from a Category Theory Perspective and Its Educational Impact on Beginners

## Introduction

Haskell's intellectual contributions to the programming world are immeasurable. In particular, its pioneering role in the practical implementation of many abstract concepts, beginning with monads, and its contribution to spreading these concepts throughout the programming community are undeniable facts. Its theoretical rigor and expressive power continue to serve as a benchmark for many developers and researchers.

However, this very theoretical authority sometimes mythologizes specific design choices as "mathematical necessities," making critical re-examination difficult. This paper begins with one fundamental question: **Is this merely a case of substituting Haskell's local rules for universal mathematical logic?

**The particularly serious problem is that such abuse of theoretical authority has become a major obstacle for beginners who earnestly seek to learn the theoretical foundations of functional programming.** Engineering conveniences and historical design choices are taught as "mathematical necessities," forcing learners to accept implementations that are merely one option among many as the "only correct answer."

The purpose of this document is by no means to deny Haskell's overall value. Rather, it focuses on one specific, long-debated issue—**the `List` Applicative implementation and its associated typeclass hierarchy**—and aims to fairly and rigorously re-verify whether this choice is truly as "theoretically natural" as is often claimed, through the lens of category theory and more natural implementations found in other languages.

## 1. Structure of the Problem: The "Distortion" of Functor, Monad, and Applicative in Haskell

To understand the theoretical "distortion" at the heart of this issue, let us examine the three concepts step by step.

### 1-1. The Foundation of Everything: "Functor"

First, the foundation of everything is the `Functor`. `map` (Functor) is the most fundamental operation, dealing with a single container (`f a`). Its role is to transform (map) only the contents inside the container using a function `a -> b`, without changing the container's structure (e.g., the length of a list) in any way.

The type signature of `Functor`'s `map` is `(a -> b) -> f a -> f b`. This can be considered a neutral and basic "mapping" operation that exists before the conflict between "Cartesian product" and "Zip" arises.

### 1-2. The Powerful "Monad" and Its "Cartesian" Destiny

Next comes the `Monad`, which greatly extends the power of `Functor`. `bind` (Monad) has a type like `(a -> m b) -> m a -> m b` (known as `collect` in F# or `flatMap` in JS) and possesses the rich capability to determine not only the next computation's **value** but also its **structure** (`m b`) using the **value** `a` from the previous computation.

In the context of `List`, the "natural" implementation that satisfies the monad laws behaves like a **Cartesian product (all combinations)**. This is both the source of the `List` monad's power and the destiny that defines its "character."

### 1-3. The Source of the Problem: The "Forcing" of "Applicative"

Finally, we discuss `Applicative`. This is historically relatively new among Haskell's typeclasses and was forcibly positioned as an intermediate layer between `Functor` and `Monad` for some reason. Here arises the problem that this document consistently points out.

-   **The Diversity of Applicative**: As a basic premise, for `List`, there exist at least two category-theoretically legitimate "choices" for `Applicative`: **"Cartesian product"** and **"Zip"**. This demonstrates the richness of the structure that the `List` type possesses.
    
-   **The "Forcing" of Haskell's Hierarchy**: However, Haskell established the hierarchical structure `class Applicative f => Monad f`. This was an engineering decision in language design that **fixed** the behavior of `List`'s (which is a `Monad`) `Applicative` to the Cartesian product version derived from the `Monad`.
    
-   **The Resulting "Illusion" and Unjust Exclusion**: This situation—"Cartesian product is standard, Zip is special"—is merely an **"illusion" created by the engineering constraints** of Haskell's hierarchy. The Zip behavior is mathematically unproblematic; it simply didn't conform to the local rule that Haskell created dictating "how `Monad` and `Applicative` should be."

**This situation is precisely what confuses beginners who earnestly seek to learn functional programming.** When only one of two mathematically equivalent implementations is taught as "standard" while the other is treated as a "special case," learners are deprived of the opportunity to understand the true theoretical richness.

This is exactly what happened: "Because Applicative was forced into an implementation as if it were an intermediate stage between Functor and Monad, the Zip version appeared more problematic," resulting in the unjust exile of the equally legitimate Zip version to a separate type `ZipList`, despite being mathematically equivalent.

## 2. The Myth of the Typeclass Hierarchy: Its Structure and Lack of Mathematical Foundation

This chapter details how the "distortion" shown in the previous chapter stems from the `Functor => Applicative => Monad` hierarchy itself. It clarifies that this hierarchy is an engineering compromise rather than something categorically natural, and that Haskell's choice lacks mathematical foundation because multiple equally valid Applicative implementations exist from a category theory perspective.

### Haskell's Typeclass Hierarchy

Haskell

```haskell
class Functor f where
  fmap :: (a -> b) -> f a -> f b

class Functor f => Applicative f where
  pure :: a -> f a
  (<*>) :: f (a -> b) -> f a -> f b

class Applicative f => Monad f where
  return :: a -> f a
  (>>=) :: f a -> (a -> f b) -> f b
```

### Category-Theoretic Verification: Problematic Throughout

**1. The "Hierarchy" is a Category-Theoretic Fiction**

In category theory, `Functor`, `Monad`, and `Applicative` are **independent concepts** and do not exist in such a forced hierarchical relationship. Investigation of standard category theory texts (MacLane, Awodey, etc.) reveals the following relationships:

-   **Monad**: endofunctor + unit + multiplication + associativity/unit laws
    
-   **Applicative (lax monoidal)**: endofunctor + lax monoidal structure + naturality
    
-   **Relationship**: Applicative can be derived from Monad, but there is **no forced hierarchy**. Monad and Applicative are **parallel concepts**.

**The fact that such theoretical facts are not accurately conveyed to beginners creates fundamental distortions in understanding.** Many educational resources explain this hierarchy as if it were a mathematical necessity, but this is clearly misleading education.

**2. The Problem of "Deriving" Applicative from Monad**

In Haskell, it is claimed that "if something is a Monad, it can become an Applicative through the following derivation":

Haskell

```haskell
pure = return
f <*> x = f >>= \g -> x >>= \y -> return (g y)
```

However, from a category theory perspective, this derivation is not trivial and implicitly assumes an additional non-trivial structure called **tensorial strength**. This is a natural transformation `strength: A ⊗ T(B) → T(A ⊗ B)`, and Haskell implicitly assumes this exists for all types. This assumption is **mathematically non-trivial**.

**This complexity is completely omitted from beginner-oriented explanations, resulting in the false impression that "Applicative is automatically obtained from Monad."** This is an educational problem that sacrifices theoretical accuracy.

### Lack of Mathematical Foundation: A Category-Theoretic Perspective

**1. The Existence of Multiple Products in Category Theory**

The decisive fact from category theory is that Applicative Functors correspond to **lax monoidal functors**, and **monoidal products are not unique (up to isomorphism)**. This means that multiple different monoidal structures can coexist within the same category with **mathematically equal legitimacy**. For a single type like `List`, multiple "products" exist:

-   **Cartesian Product Structure**: Generates all combinations `[f1,f2] <*> [x1,x2,x3] = [f1 x1, f1 x2, f1 x3, f2 x1, f2 x2, f2 x3]`
    
-   **Pointwise (Zip) Structure**: Combines corresponding elements `[f1,f2] <*> [x1,x2] = [f1 x1, f2 x2]`

**Both of these structures** are completely legitimate in category theory and satisfy the monoidal laws (associativity, identity laws) and the conditions for lax monoidal functors. It is **mathematically impossible** for one to be more "natural" or "theoretical" than the other.

**However, current education often teaches the former as "standard" and the latter as "irregular," which instills false theoretical understanding in beginners.** Proper education should begin by explaining that both structures are equally legitimate.

**2. Haskell's Arbitrary Choice and Justification**

Faced with multiple mathematically legitimate options, Haskell arbitrarily fixed `[]`'s `Applicative` to "Cartesian product" and exiled the equally legitimate zip version to a separate `ZipList` type. The actual motivation for this choice was not rooted in category theory but was based on **purely engineering reasons**:

1.  **Consistency with Monad**: The `Monad` instance for `[]` already had Cartesian product-like behavior
    
2.  **Type Inference Predictability**: To avoid compilation errors from ambiguous instances
    
3.  **Historical Reasons**: Applicative was added to the language much later (in 2008 by Conor McBride and Ross Paterson), requiring compatibility with existing Monad code

**This engineering decision itself is reasonable, but the problem is that it is taught to beginners as "mathematical necessity."** Proper education should clearly convey that this was a mathematical choice, not an engineering convenience.

### Specific Theoretical Contradictions of the Hierarchy

The artificial hierarchy creates numerous theoretical contradictions:

-   **The Breakdown Proven by ZipList**: `ZipList` is Applicative but cannot become a Monad due to this hierarchy. If the hierarchy were "natural," why is only the zip structure excluded?
    
-   **The Set Functor Problem**: `Set` is a Functor, but requires an `Ord` constraint to become `Applicative`, breaking the "pure" structure of the hierarchy
    
-   **The Peculiarity of IO Monad**: `IO`'s `>>=` means sequencing, not category-theoretic `bind`

**These contradictions tend to be obscured in beginner-oriented explanations, resulting in learners having incomplete and distorted theoretical understanding.** Sincere education should honestly explain these limitations and contradictions.

## 3. "Theoretically Honest" Implementation: Verification Through Comparison with Other Languages

Based on the fact that this is a matter of mathematical degrees of freedom, this chapter shows that many other languages implement multiple Applicative-like behaviors for a single type in more natural, flexible, and completely safe ways. The claim that multiple implementations compromise "safety" or "type system consistency" is false.

### The Freedom of ML-Family Languages (F#, etc.)

ML-family languages like F# take a **function-based** approach, allowing multiple operations with different semantics to be defined for the same type. User intent is made clear through specific function names, and no ambiguity arises.

F#

```fsharp
// Multiple Applicative-like operations can be defined for the same List type
let mapCartesian f xs ys =
    xs |> List.collect (fun x -> ys |> List.map (f x))

let mapZip f xs ys =
    List.map2 f xs ys

// Explicit function calls clarify intent
List.map2 (+) [1;2] [3;4]     // zip version: [4;6]
// List.allPairs (+) [1;2] [3;4] // Cartesian product version
```

This is not a matter of "safety" but a difference in **API design philosophy**.

-   **Haskell**: "The same abstract operation should have the same meaning"
    
-   **ML-family languages**: "Different operations should have different names"

**This approach is much more understandable for beginners and avoids theoretical confusion.** The meaning of each operation is clear from its name, without being misled by artificial distinctions between "standard" and "irregular."

### A Problem Already Solved in Other Languages

The claim that multiple instances "break type inference" contradicts the facts and has been solved in many other languages.

-   **Scala** uses `implicit` parameters to allow multiple instances to coexist, with explicit selection at the call site
    
    Scala
    
    ```scala
    // Multiple Applicative instances exist
    implicit val listCartesian: Applicative[List] = ...
    implicit val listZip: Applicative[List] = ...
    
    // Explicit selection at usage
    compute(List(1,2), List(3,4))(listCartesian) // Cartesian product
    compute(List(1,2), List(3,4))(listZip)       // zip
    ```
    
-   **Rust** also allows multiple trait implementations. **Swift, Kotlin, PureScript** adopt similar solutions

**The fact that these solutions work proves that Haskell's constraints are not universal problems but results of specific typeclass design.** By knowing this fact, beginners can understand functional programming concepts with a broader perspective.

### JavaScript: The Most Familiar Counter-Example

The world's most widely used `Array` in JavaScript proves that this flexible approach functions without problems. All structures can be used selectively, freely, and clearly on top of a single `Array` type without needing cumbersome types like `new ZipArray()`.

-   **Functor**: `Array.prototype.map` provided by default
    
-   **Monad**: `Array.prototype.flatMap` also provided by default, naturally expressing Cartesian product-like behavior
    
-   **Applicative**: Not standard, but both behaviors can be easily implemented:
    
    JavaScript
    
    ```js
    // Zip version
    const mapZip = (f, xs, ys) => xs.map((x, i) => f(x, ys[i]));
    
    // Cartesian product version
    const mapCartesian = (f, xs, ys) => xs.flatMap(x => ys.map(y => f(x, y)));
    ```

**This example provides very important implications for beginners: functional programming concepts can be fully expressed without Haskell's special constraints.**

This shows that Haskell's constraints are not universal but are strictly Haskell-specific design choices of its typeclass system.

## 4. Case Study of Authoritative Claims: The "ZipList Cannot Be a Monad" Discourse

This chapter re-examines a well-known claim in the Haskell world as a concrete "case study" of how Haskell's peculiar design philosophy generates specific issues, revealing how "mathematical facts" and "Haskell's local rules" are conflated. Within the Haskell community, the following claim is often stated authoritatively:

> **"It is mathematically impossible for ZipList to become a Monad"**

This claim is widely accepted, with Coq proofs provided on GitHub and treated as a standard example on Haskell-cafe mailing lists and StackOverflow. Indeed, it is difficult to define a `>>=` for `ZipList` that satisfies the monad laws, particularly the associativity law.

Haskell

```haskell
-- Difficult to define in a way that satisfies monad laws
zipBind :: ZipList a -> (a -> ZipList b) -> ZipList b
```

**Associativity Law**: `(m >>= f) >>= g` == `m >>= (\x -> f x >>= g)`

This law ensures that results remain the same regardless of how computations are structured. Zip operation-based implementations cannot satisfy this law in complex cases where list lengths and structures change.

**This "impossibility" is a purely mathematical requirement, not a Haskell local rule. However, the problem is that this fact is subsequently used to justify Haskell's artificial hierarchy and arbitrary choice to make Cartesian product the standard.**

**Particularly in educational contexts, this mathematical fact tends to be presented as "evidence that Haskell's design is correct," but this is a logical inversion.** The fact that ZipList cannot be a Monad does not prove the legitimacy of Haskell's hierarchical design. Rather, it should be understood as an example of how mathematically equivalent structures were artificially separated due to type system constraints.

The core problem is not the mathematical fact itself, but how it is instrumentalized within community discourse.

## 5. Problems of Intellectual Attitude: Abuse of "Theoretical Authority" and Its Harmful Impact on Education

This chapter synthesizes the previous discussions and critiques the more serious problem of authoritarianism and theoretical abuse occasionally seen in the Haskell community.

**Most importantly, these problems have become significant obstacles for beginners who earnestly seek to learn the theoretical foundations of functional programming.**

### Post-hoc Justification using Category Theory and Its Educational Harm

There is a tendency to justify engineering conveniences as "categorically beautiful" or "mathematical necessity," and to glorify design problems as "theoretical profundity." The existence of `ZipList`, a product of the logical failure of arbitrarily elevating Cartesian product as "standard" and exiling the mathematically equivalent zip structure, is often justified as "design refinement."

This **"post-hoc justification"** severely harms beginners' learning:

-   **False Theoretical Understanding**: When engineering compromises are taught as mathematical necessities, learners acquire distorted theoretical foundations
    
-   **Inhibition of Critical Thinking**: "Authoritative" explanations become difficult to question, preventing learners from developing critical thinking
    
-   **Conceptualization Narrowing**: Originally rich mathematical concepts are understood as limited to specific implementations

This pattern of justification appears in several forms:

-   **Canonization in Tutorials**: Explanations like "Cartesian product is the natural implementation of Applicative" and "typeclass hierarchy reflects category-theoretic structure" frequently appear without category-theoretic foundation
    
-   **Abuse of Academic Authority**: Claims are given authority using the "category theory" keyword without providing actual category-theoretic proofs
    
-   **Uncritical Reproduction**: Established claims are circulated as "official views" without critical verification, systematically ignoring counter-examples from other languages

**These problems deprive beginners of opportunities to understand the theoretical richness and conceptual diversity they should be learning.**

### The "Design Philosophy" Escape Route and Typical Defenses and Their Educational Impact

When the lack of theoretical foundation becomes apparent, there's a common tactic of escaping into subjective domains like "philosophy" or "aesthetics," dismissing criticism as "lack of understanding." But in what sense is the `class Functor f => Applicative f => Monad f` hierarchy "philosophically beautiful"? The ML-family approach of giving different names to different operations is far clearer and more natural.

In actual discussions, the following **patterned defenses** frequently appear:

-   **"Type Inference Consistency"**: The claim that multiple implementations break type inference. **Reality**: A solved problem in other languages. Presents Haskell design constraints as universal problems.
    
-   **"Mathematical Necessity"**: The claim that Cartesian product is "natural" and zip is "artificial." **Reality**: They are equivalent in category theory. Presents arbitrary choice as theoretical justification.
    
-   **"Design Philosophy"**: The claim that unified interfaces are "beautiful." **Reality**: The abuse of `newtype` to separate mathematically equivalent structures is ugly. Re-packages engineering compromise as aesthetics.

**The uncritical adoption of these defensive discourses in educational settings causes beginners to face the following problems:**

-   **Confusion of Theory and Implementation**: Mathematical concepts and specific language implementations become indistinguishable
    
-   **Lack of Awareness of Alternatives**: Opportunities to learn about other legitimate implementation methods are lost
    
-   **Excessive Dependence on Authority**: The ability to critically verify concepts does not develop

Through completely unnatural constraints in category theory (one implementation per typeclass), Haskell arbitrarily selects Cartesian product as "standard" and exiles zip structure to an artificial type called `ZipList`. Then it post-hoc justifies this logical failure as "design refinement," making it appear as if there were mathematical necessity.

**This is a typical example of lack of sincere educational integrity, distorting the theoretical understanding of many people seeking to learn functional programming.**

## Conclusion: Pursuing True Theoretical Integrity and Educational Responsibility

Haskell's contributions to the functional programming world are immeasurable. However, in the shadow of this great authority, a specific problem exists: **the tendency to justify engineering and historical design choices with post-hoc narratives of "mathematical necessity" or "theoretical superiority."** The sequence of events that fixed the `List` Applicative implementation to Cartesian product and necessitated the `ZipList` solution is the most symbolic example of this.

**However, the most serious problem is that such inaccurate theoretical claims are propagated to beginners through education.** People who earnestly seek to learn the theoretical foundations of functional programming are given distorted understanding and deprived of opportunities to comprehend the original mathematical richness.

### Ideal Attitudes and Educational Responsibility

1.  **Acknowledge Multiple Legitimate Implementations**: Recognize that multiple `Applicative` structures exist for `List` as category theory shows
    
2.  **Don't Confuse Engineering Constraints with Theory**: Clearly state that "typeclass uniqueness" is Haskell's engineering choice, not universal mathematical truth
    
3.  **Apply Category-Theoretic Concepts Accurately**: Don't use concepts like `Monad` or `Applicative` for justification or authority
    
4.  **Respect Solutions in Other Languages**: Learn from the more flexible and, in some sense, more category-theoretically natural approaches seen in F#, Scala, JS, etc.
    
5.  **Critically Re-verify "Official Views"**: Always question the theoretical foundations of even established discourse within the community
    
6.  **Maintain Educational Integrity**: Don't teach engineering compromises as "mathematical necessities"

**The educational community has a responsibility to provide learners with accurate theoretical understanding rather than perpetuating distorted narratives that serve particular language advocacy.**

True theoretical sincerity begins with honestly acknowledging the constraints and design trade-offs of one's own language. It is precisely because Haskell holds this leadership position that it must honestly explain the engineering judgments and historical context behind its design, rather than claiming that "compromises" are "necessities."

**Most importantly, we must remember that the goal of education is to cultivate learners' critical thinking and deep understanding, not to indoctrinate them with particular implementation choices disguised as universal truths.**

By stepping out from behind the cover of "theoretical authority" and engaging in open discussion of design trade-offs, we can earn true respect and continue leading the evolution of programming language education in a direction that serves learners' genuine intellectual development.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

I encourage readers to critically verify this critique of the Haskell ecosystem from an educational perspective, perhaps taking advantage of AI in your own independent examination.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

:::

:::lang-ja

# Haskellの「理論的優位性」という神話：圏論的視点からの批判的検証と、それが初学者への教育に与える影響

## はじめに

Haskellがプログラミングの世界に与えた知的貢献は計り知れない。特に、モナドをはじめとする多くの抽象概念を実用的に実装し、プログラミングコミュニティ全体に広めた先駆的な役割は、紛れもない事実である。その理論的な厳密さと表現力は、今なお多くの開発者や研究者にとって一つのベンチマークであり続けている。

しかし、この理論的な権威性が、時として特定の設計選択を「数学的な必然」として神話化し、批判的な再検証を困難にさせている側面はないだろうか。本稿は、**それは単にHaskellのローカルルールを、普遍的な数学的論理にすり替えているだけではないのか？** という、一つの根源的な問いから始まる。

**特に深刻な問題は、こうした理論的権威の濫用が、関数型プログラミングの理論的背景を真摯に学ぼうとする初学者にとって、大きな学習障壁となっていることだ。** 本来はエンジニアリング上の都合や歴史的な設計選択に過ぎないものが、「数学的な必然」として教えられ、学習者は数ある選択肢の一つに過ぎない実装を「唯一の正解」として受け入れることを強いられている。

本稿の目的は、決してHaskellの価値全体を否定するものではない。むしろ、古くから議論の的となってきた一つの特定の問題、すなわち **`List`のApplicative実装と、それを取り巻く型クラス階層** に焦点を当て、この選択が本当に巷で語られるほど「理論的に自然」なものなのかを、圏論の視点や、他の言語におけるより自然な実装を通じて、公正かつ厳密に再検証することを目指す。

----------

## 1. 問題の構造：HaskellにおけるFunctor、Monad、Applicativeの「歪み」

この問題の核心にある理論的な「歪み」を理解するために、3つの概念を順を追って整理しよう。

### 1-1. 全ての土台：「Functor」

まず、全ての土台となるのが`Functor`である。`map`（Functor）は最も基本的な操作であり、単一のコンテナ（`f a`）を扱う。その役割は、関数 `a -> b` を用いてコンテナの内部にある中身だけを変換（写像）し、コンテナの構造（例：リストの長さ）自体には一切変更を加えないことである。

`Functor`の`map`の型シグネチャは `(a -> b) -> f a -> f b` となる。これは、「デカルト積」と「Zip」の対立が生じる以前の、ニュートラルで基本的な「写像」操作と見なすことができる。

### 1-2. 強力な「Monad」とその「デカルト積」的な宿命

次に、`Functor`の能力を大きく拡張するのが`Monad`である。`bind`（Monad）は `(a -> m b) -> m a -> m b`（F#では`collect`、JSでは`flatMap`）のような型を持ち、前の計算結果である**値** `a` を使って、次の計算の**値**だけでなく**構造**（`m b`）まで決定できる豊かな能力を持つ。

`List`の文脈において、モナド則を満たす「自然な」実装は、**デカルト積（全組み合わせ）** のような振る舞いとなる。これは`List`モナドの強力さの源泉であると同時に、その「性格」を決定づける宿命でもある。

### 1-3. 問題の源泉：「Applicative」の「押し付け」

最後に、`Applicative`について論じる。これはHaskellの型クラスの中では歴史的に比較的新しく、何らかの理由でFunctorとMonadの**中間層として無理やり位置付けられた**。ここに、本稿が一貫して指摘する問題が生じる。

-   **Applicativeの多様性**: 大前提として、`List`に対しては、圏論的に正当な`Applicative`の「選択肢」が少なくとも **「デカルト積」** と **「Zip」** の2つ存在する。これは`List`という型が持つ構造の豊かさを示している。
    
-   **Haskellの階層による「強制」**: しかし、Haskellは `class Applicative f => Monad f` という階層構造を定めた。これは、（`Monad`である）`List`の`Applicative`の振る舞いを、**`Monad`から導出されるデカルト積版に固定する** という、言語設計上のエンジニアリング的な決定だった。
    
-   **結果として生じた「錯覚」と不当な排除**: この「デカルト積が標準で、Zipが特殊」という状況は、あくまでHaskellの階層という **エンジニアリング上の制約が生んだ「錯覚」** に過ぎない。Zipの振る舞いは数学的には何ら問題なく、単にHaskellが独自に作った「`Monad`と`Applicative`はこうあるべき」というローカルルールに適合しなかっただけである。

**この状況こそが、関数型プログラミングを真摯に学ぼうとする初学者を混乱させている元凶である。** 数学的に等価な2つの実装のうち、片方だけが「標準」として教えられ、もう一方が「特殊なケース」として扱われることで、学習者は本来の理論的な豊かさを理解する機会を奪われている。

「ApplicativeがFunctorとMonadの中間段階であるかのように実装を強制されたため、Zip版の方が問題があるように見えてしまった」結果、数学的には等価でありながら、同等に正当なZip版が`ZipList`という別の型に不当に追放される事態となったのである。

----------

## 2. 型クラス階層という神話：その構造と数学的根拠の欠如

本章では、前章で示した「歪み」が、いかにして `Functor => Applicative => Monad` という階層そのものに起因するのかを詳述する。この階層が圏論的に自然なものではなく、エンジニアリング上の妥協の産物であること、そして圏論的には複数の正当なApplicative実装が存在するため、Haskellの選択には数学的な根拠が欠けていることを明らかにする。

### Haskellの型クラス階層

Haskell

```haskell
class Functor f where
  fmap :: (a -> b) -> f a -> f b

class Functor f => Applicative f where
  pure :: a -> f a
  (<*>) :: f (a -> b) -> f a -> f b

class Applicative f => Monad f where
  return :: a -> f a
  (>>=) :: f a -> (a -> f b) -> f b
```

### 圏論による検証：全面的に問題あり

**1. 「階層」は圏論的なフィクションである**

圏論において、`Functor`、`Monad`、`Applicative`はそれぞれ**独立した概念**であり、このような強制的な階層関係にはない。標準的な圏論の教科書（MacLane、Awodeyなど）を調査すれば、以下の関係が明らかになる。

-   **モナド**: 自己関手 + 単位 + 乗法 + 結合則/単位則
    
-   **Applicative (lax monoidal)**: 自己関手 + lax monoidal構造 + 自然性
    
-   **関係性**: モナドからApplicativeを導出することはできるが、そこに**強制的な階層関係はない**。モナドとApplicativeは**並列の概念**である。

**このような理論的事実が初学者に正確に伝えられていないことが、根本的な理解の歪みを生んでいる。** 多くの教材がこの階層をあたかも数学的な必然であるかのように説明するが、これは明らかにミスリードな教育である。

**2. モナドからApplicativeを「導出」する問題**

Haskellでは、「モナドであれば、以下の導出によってApplicativeになれる」とされている。

Haskell

```haskell
pure = return
f <*> x = f >>= \g -> x >>= \y -> return (g y)
```

しかし、圏論的な視点から見ると、この導出は自明ではなく、**テンソル強度 (tensorial strength)** と呼ばれる、自明ではない追加の構造を暗黙に仮定している。これは `strength: A ⊗ T(B) → T(A ⊗ B)` という自然変換であり、Haskellではこれが全ての型に対して存在することを暗黙に仮定している。この仮定は**数学的に非自明**である。

**この複雑さは、初学者向けの説明では完全に省略され、「ApplicativeはMonadから自動的に手に入る」という誤った印象を与えている。** これは理論的な正確性を犠牲にした教育上の問題である。

### 数学的根拠の欠如：圏論的視点

**1. 圏論における複数の積の存在**

圏論からの決定的な事実は、Applicative Functorが**lax monoidal functor**に対応し、**monoidal productは（同型を除いて）一意ではない**ということだ。これは、同じ圏の中に、**数学的に等しく正当な**複数の異なるmonoidal構造が共存できることを意味する。`List`のような単一の型に対して、複数の「積」が存在する。

-   **デカルト積構造**: 全組み合わせを生成する `[f1,f2] <*> [x1,x2,x3] = [f1 x1, f1 x2, f1 x3, f2 x1, f2 x2, f2 x3]`
    
-   **Pointwise (Zip) 構造**: 対応する要素を組み合わせる `[f1,f2] <*> [x1,x2] = [f1 x1, f2 x2]`

**これら2つの構造は、どちらも**圏論的に完全に正当であり、monoidal laws（結合則、単位則）やlax monoidal functorの条件を満たす。どちらか一方が他方より「自然」あるいは「理論的」であることは、**数学的にあり得ない**。

**しかし、現在の教育では、前者が「標準」で後者が「変則的」であるかのように教えられることが多く、これは初学者に誤った理論的理解を植え付けている。** 本来の教育は、両方の構造が等しく正当であることを説明することから始めるべきである。

**2. Haskellの恣意的な選択と正当化**

数学的に正当な選択肢が複数ある中で、Haskellは`[]`の`Applicative`を「デカルト積」に恣意的に固定し、同等に正当なzip版を`ZipList`という別の型に追放した。この選択の実際の動機は圏論に根差したものではなく、**純粋にエンジニアリング上の理由**に基づいていた。

1.  **モナドとの一貫性**: `[]`の`Monad`インスタンスは、既にデカルト積的な振る舞いであった
    
2.  **型推論の予測可能性**: 曖昧なインスタンスによるコンパイルエラーを避けるため
    
3.  **歴史的経緯**: Applicativeは後から（2008年にConor McBrideとRoss Patersonによって）言語に追加されたため、既存のMonadコードとの互換性が必要だった

**このエンジニアリング判断自体は合理的だが、問題は、それが「数学的な必然」として初学者に教えられていることだ。** 本来の教育は、これが数学的な選択ではなく、エンジニアリング上の都合であったことを明確に伝えるべきである。

### 階層の具体的な理論的矛盾

この人為的な階層は、数々の理論的矛盾を生み出している。

-   **ZipListが証明する破綻**: `ZipList`はApplicativeだが、この階層のせいでMonadになれない。もし階層が「自然」なら、なぜzip構造だけが排除されるのか？
    
-   **Set Functor問題**: `Set`はFunctorだが、`Applicative`になるには`Ord`制約が必要となり、階層の「純粋な」構造を壊す
    
-   **IOモナドの特殊性**: `IO`の`>>=`は逐次実行を意味し、圏論的な`bind`ではない

**これらの矛盾は初学者向けの説明では覆い隠される傾向にあり、結果として学習者は不完全で歪んだ理論的理解を持つことになる。** 誠実な教育であれば、これらの限界や矛盾も正直に説明すべきである。

----------

## 3. 「理論的に誠実」な実装：他言語との比較による検証

これが数学的な自由度の問題であるという事実に基づき、本章では他の多くの言語が、単一の型に対して複数のApplicative的な振る舞いを、より自然で、柔軟で、完全に安全な方法で実装していることを示す。「複数の実装は『安全性』や『型システムの一貫性』を損なう」という主張が誤りであることを証明する。

### ML系言語（F#など）の自由さ

F#のようなML系言語は、**関数ベース**のアプローチを取り、同じ型に対して意味の異なる複数の操作を定義できる。ユーザーの意図は具体的な関数名によって明確になり、曖昧さは生じない。

F#

```fsharp
// 同じList型に対して、複数のApplicative的な操作を定義できる
let mapCartesian f xs ys =
    xs |> List.collect (fun x -> ys |> List.map (f x))

let mapZip f xs ys =
    List.map2 f xs ys

// 明示的な関数呼び出しが意図を明確にする
List.map2 (+) [1;2] [3;4]     // zip版: [4;6]
// List.allPairs (+) [1;2] [3;4] // デカルト積版
```

これは「安全性」の問題ではなく、**API設計思想**の違いである。

-   **Haskell**: 「同じ抽象操作は、同じ意味を持つべきだ」
    
-   **ML系言語**: 「異なる操作は、異なる名前を持つべきだ」

**このアプローチは初学者にとって遥かに理解しやすく、理論的な混乱を避けることができる。** 各操作の意味が名前から明らかであり、「標準」と「変則」という人為的な区別に惑わされることがない。

### 他言語では既に解決済みの問題

複数のインスタンスが「型推論を壊す」という主張は事実に反し、多くの他言語で解決済みの問題である。

-   **Scala**は`implicit`パラメータを使い、複数のインスタンスを共存させ、呼び出し側で明示的に選択できるようにしている。
    
    Scala
    
    ```scala
    // 複数のApplicativeインスタンスが存在する
    implicit val listCartesian: Applicative[List] = ...
    implicit val listZip: Applicative[List] = ...
    
    // 使用時に明示的に選択
    compute(List(1,2), List(3,4))(listCartesian) // デカルト積
    compute(List(1,2), List(3,4))(listZip)       // zip
    ```
    
-   **Rust**も複数のトレイト実装を許容している。**Swift、Kotlin、PureScript**も同様の解決策を採用している。

**これらの解決策が機能しているという事実は、Haskellの制約が普遍的な問題ではなく、特定の型クラス設計に起因するものであることを証明している。** この事実を知ることで、初学者はより広い視野で関数型プログラミングの概念を理解できる。

### JavaScript：最も身近な反例

世界で最も広く使われているJavaScriptの`Array`は、この柔軟なアプローチが何の問題もなく機能することを証明している。`new ZipArray()`のような面倒な型を必要とせず、単一の`Array`型の上で、全ての構造を選択的、自由、かつ明確に利用できる。

-   **Functor**: `Array.prototype.map`がデフォルトで提供されている
    
-   **Monad**: `Array.prototype.flatMap`もデフォルトで提供され、自然にデカルト積的な振る舞いを表現できる
    
-   **Applicative**: 標準ではないが、両方の振る舞いを簡単に実装できる：
    
    JavaScript
    
    ```js
    // Zip版
    const mapZip = (f, xs, ys) => xs.map((x, i) => f(x, ys[i]));
    
    // デカルト積版
    const mapCartesian = (f, xs, ys) => xs.flatMap(x => ys.map(y => f(x, y)));
    ```

**この例は、初学者にとって非常に重要な示唆を与える：関数型プログラミングの概念は、Haskellの特殊な制約がなくても十分に表現できる。**

これは、Haskellの制約が普遍的なものではなく、あくまでHaskell固有の型クラスシステムの設計選択であることを示している。

----------

## 4. 権威的主張のケーススタディ：「ZipListはモナドになれない」言説

本章では、Haskellの特異な設計思想がどのように特定の問題を生み出すかの具体的な「ケーススタディ」として、Haskell界隈でよく知られるある主張を再検討し、「数学的な事実」と「Haskellのローカルルール」がどのように混同されているかを明らかにする。Haskellコミュニティ内では、しばしば次のような主張が権威的に述べられる。

> **「ZipListがモナドになることは数学的に不可能である」**

この主張は広く受け入れられており、GitHub上ではCoqによる証明が提供されたり、Haskell-cafeのメーリングリストやStackOverflowで標準的な例として扱われたりしている。実際、`ZipList`に対してモナド則、特に結合則を満たす`>>=`を定義することは困難である。

Haskell

```haskell
-- モナド則を満たすように定義することが困難
zipBind :: ZipList a -> (a -> ZipList b) -> ZipList b
```

**結合則**: `(m >>= f) >>= g` == `m >>= (\x -> f x >>= g)`

この法則は、計算をどのような構造で組み立てても結果が変わらないことを保証する。Zip操作ベースの実装では、リストの長さや構造が複雑に変化するケースでこの法則を満たすことができない。

**この「不可能性」は、純粋に数学的な要件であり、Haskellのローカルルールではない。しかし問題は、この事実が、その後Haskellの人為的な階層構造や、デカルト積を標準とする恣意的な選択を正当化するために利用されることにある。**

**特に教育的な文脈において、この数学的事実は「Haskellの設計が正しいことの証拠」として提示される傾向があるが、これは論理の倒錯である。** ZipListがモナドになれないという事実は、Haskellの階層設計の正当性を証明するものではない。むしろ、型システムの制約によって、数学的に等価な構造が人為的に引き裂かれた一例として理解されるべきである。

核心的な問題は、数学的な事実そのものではなく、それがコミュニティの言説の中でどのように道具として利用されるかにある。

----------

## 5. 知的態度の問題：「理論的権威」の濫用とその教育的弊害

本章では、これまでの議論を統合し、Haskellコミュニティで時折見られる権威主義と理論の濫用という、より深刻な問題を批判する。

**最も重要なことは、これらの問題が、関数型プログラミングの理論的背景を真摯に学ぼうとする初学者にとって、大きな学習障壁となっていることである。**

### 圏論を用いた後付けの正当化とその教育的害悪

エンジニアリング上の都合を「圏論的に美しい」「数学的な必然」として正当化し、設計上の問題を「理論的な深遠さ」として美化する傾向がある。数学的に等価なzip構造を追放し、デカルト積を「標準」として恣意的に格上げした論理的破綻の産物である`ZipList`の存在が、「設計の洗練」としてしばしば正当化される。

**このような「後付けの正当化」は、初学者の学習に深刻な害を及ぼす：**

-   **誤った理論的理解**: エンジニアリング上の妥協が数学的な必然として教えられることで、学習者は歪んだ理論的土台を身につけてしまう
    
-   **批判的思考の阻害**: 「権威ある」説明は疑問を呈しにくく、学習者が批判的思考を養うのを妨げる
    
-   **概念の矮小化**: 本来は豊かな数学的コンセプトが、特定の実装に限定されたものとして理解されてしまう

この種の正当化はいくつかのパターンで現れる：

-   **チュートリアルでの定説化**: 「Applicativeの自然な実装はデカルト積である」「型クラス階層は圏論的構造を反映している」といった説明が、圏論的根拠なしに頻出する
    
-   **学術的権威の濫用**: 実際の圏論的証明を提示することなく、「圏論」というキーワードを用いて主張に権威を持たせる
    
-   **無批判な再生産**: 一度定説化された主張が、批判的な検証なしに「公式見解」として流通し、他言語の反例などが組織的に無視される

**これらの問題は、初学者が本来学ぶべき理論的な豊かさや概念の多様性を理解する機会を奪っている。**

### 「設計思想」という逃げ道と、典型的な擁護論とその教育的影響

理論的根拠の欠如が明らかになると、「思想」や「美学」といった主観的な領域に逃げ込み、批判を「理解不足」として退ける常套手段がある。しかし、`class Functor f => Applicative f => Monad f` という階層が、どのような意味で「思想的に美しい」のだろうか？ 異なる操作に異なる名前を与えるML系のアプローチの方が、遥かに明快で自然である。

実際の議論では、以下のような**パターン化された擁護論**が頻出する：

-   **「型推論の一貫性」**: 複数の実装は型推論を壊すという主張。**現実**: 他言語では解決済みの問題。Haskellの設計制約を普遍的な問題として提示している。
    
-   **「数学的必然性」**: デカルト積は「自然」でzipは「人為的」だという主張。**現実**: 圏論では等価。恣意的な選択を理論的正当性として提示している。
    
-   **「設計思想」**: 統一されたインターフェースは「美しい」という主張。**現実**: 数学的に等価な構造を分離するための`newtype`の濫用は醜い。エンジニアリング上の妥協を美学として再パッケージ化している。

**これらの擁護言説が教育現場で無批判に採用されることで、初学者は以下のような問題に直面する：**

-   **理論と実装の混同**: 数学的な概念と、特定の言語実装が区別できなくなる
    
-   **代替案への無自覚**: 他の正当な実装方法について学ぶ機会が失われる
    
-   **権威への過度な依存**: 概念を批判的に検証する能力が育たない

Haskellは、圏論的には全く不自然な制約（型クラスにつき実装は一つ）によって、デカルト積を「標準」として恣意的に選び、zip構造を`ZipList`という人為的な型に追放した。そしてその論理的破綻を「設計の洗練」として後付けで正当化し、あたかもそこに数学的必然性があったかのように見せかけている。

**これは、関数型プログラミングを学ぼうとする多くの人々の理論的理解を歪める、教育的な誠実さに欠ける典型的な例である。**

----------

## 結論：真の理論的誠実さと教育的責任を求めて

Haskellが関数型プログラミングの世界に与えた貢献は計り知れない。しかし、その偉大な権威の陰で、**エンジニアリング上および歴史的な設計選択を、「数学的必然」や「理論的優位性」という後付けの物語で正当化する**という、特定の問題が存在する。`List`のApplicative実装をデカルト積に固定し、`ZipList`という解決策を必要とさせた一連の経緯は、その最も象徴的な例である。

**しかし、最も深刻な問題は、このような不正確な理論的主張が、教育を通じて初学者に広められていることだ。** 関数型プログラミングの理論的背景を真摯に学ぼうとする人々が、歪んだ理解を与えられ、本来の数学的な豊かさを理解する機会を奪われている。

### あるべき姿勢と教育的責任

1.  **複数の正当な実装を認める**: 圏論が示すように、`List`に対して複数の`Applicative`構造が存在することを認識する
    
2.  **エンジニアリングの制約と理論を混同しない**: 「型クラスの一意性」はHaskellのエンジニアリング上の選択であり、普遍的な数学的真理ではないことを明確に述べる
    
3.  **圏論的概念を正確に適用する**: `Monad`や`Applicative`といった概念を、正当化や権威付けのために利用しない
    
4.  **他言語の解決策を尊重する**: F#、Scala、JSなどに見られる、より柔軟で、ある意味ではより圏論的に自然なアプローチから学ぶ
    
5.  **「公式見解」を批判的に再検証する**: コミュニティ内で定説となっている言説であっても、その理論的根拠を常に問う
    
6.  **教育的誠実さを保つ**: エンジニアリング上の妥協を「数学的な必然」として教えない

**教育コミュニティには、特定の言語擁護に奉仕する歪んだ物語を永続させるのではなく、学習者に正確な理論的理解を提供する責任がある。**

真の理論的誠実さは、自らの言語の制約と設計上のトレードオフを正直に認めることから始まる。Haskellがこの指導的な立場にあるからこそ、「妥協」が「必然」であったと主張するのではなく、その設計の背後にあるエンジニアリング上の判断や歴史的文脈を誠実に説明しなければならない。

**最も重要なことは、教育の目標が、学習者の批判的思考と深い理解を育むことであり、特定の言語実装の選択肢を普遍的な真理であるかのように刷り込むことではない、ということを忘れてはならない。**

「理論的権威」という隠れ蓑から一歩踏み出し、設計のトレードオフについてオープンに議論することで、我々は真の尊敬を勝ち得、プログラミング言語教育の進化を、学習者の真の知的発達に資する方向へと導き続けることができるだろう。

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

読者は、教育的な観点から本稿のHaskellエコシステムに対する批判を、ご自身の独立した検証、あるいはAIなどを活用して批判的に検証してみることをお勧めします。

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

:::