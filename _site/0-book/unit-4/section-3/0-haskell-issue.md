:::lang-en

# The Fiction of Haskell's "Theoretical Superiority": A Critical Verification from a Category Theory Perspective and Its Educational Impact on Beginners

## Introduction

Haskell's intellectual contributions to the programming world are immeasurable. In particular, its pioneering role in the practical implementation of many abstract concepts, beginning with monads, and its contribution to spreading these concepts throughout the programming community are undeniable facts. Its theoretical rigor and expressive power continue to serve as a benchmark for many developers and researchers.

However, this very theoretical authority sometimes mythologizes specific design choices as "mathematical necessities," making critical re-examination difficult. This paper begins with one fundamental question: **Is this merely a case of substituting Haskell's local rules for universal mathematical logic?**

**The particularly serious problem is that such abuse of theoretical authority has become a major obstacle for beginners who earnestly seek to learn the theoretical foundations of functional programming.** Engineering conveniences and historical design choices are taught as "mathematical necessities," forcing learners to accept implementations that are merely one option among many as the "only correct answer."

The purpose of this document is by no means to deny Haskell's overall value. Rather, it focuses on one specific, long-debated issue—**the `List` Applicative implementation and its associated typeclass hierarchy**—and aims to fairly and rigorously re-verify whether this choice is truly as "theoretically natural" as is often claimed, through the lens of category theory and more natural implementations found in other languages.

## 1. Structure of the Problem: The "Distortion" of Functor, Monad, and Applicative in Haskell

To understand the theoretical "distortion" at the heart of this issue, let us examine the three concepts step by step.

### 1-1. The Foundation of Everything: "Functor"

First, the foundation of everything is the `Functor`. `map` (Functor) is the most fundamental operation, dealing with a single container (`f a`). Its role is to transform (map) only the contents inside the container using a function `a -> b`, without changing the container's structure (e.g., the length of a list) in any way.

The type signature of `Functor`'s `map` is `(a -> b) -> f a -> f b`. This can be considered a neutral and basic "mapping" operation that exists before the conflict between "Cartesian product" and "Zip" arises.

### 1-2. The Powerful "Monad" and Its "Cartesian" Destiny

Next comes the `Monad`, which greatly extends the power of `Functor`. `bind` (Monad) has a type like `m a -> (a -> m b) -> m b` (known as `collect` in F# or `flatMap` in JS) and possesses the rich capability to determine not only the next computation's **value** but also its **structure** (`m b`) using the **value** `a` from the previous computation.

In the context of `List`, the "natural" implementation that satisfies the monad laws behaves like a **Cartesian product (all combinations)**. This is both the source of the `List` monad's power and the destiny that defines its "character."

### 1-3. The Source of the Problem: The "Forcing" of "Applicative"

Finally, we discuss `Applicative`. This is historically relatively new among Haskell's typeclasses and was forcibly positioned as an intermediate layer between `Functor` and `Monad` for some reason. Here arises the problem that this document consistently points out.

-   **The Diversity of Applicative**: As a basic premise, for `List`, there exist at least two category-theoretically legitimate "choices" for `Applicative`: **"Cartesian product"** and **"Zip"**. This demonstrates the richness of the structure that the `List` type possesses.
-   **The "Forcing" of Haskell's Hierarchy**: However, Haskell established the hierarchical structure `class Applicative f => Monad f`. This was an engineering decision in language design that **fixed** the behavior of `List`'s (which is a `Monad`) `Applicative` to the Cartesian product version derived from the `Monad`.
-   **The Resulting "Illusion" and Unjust Exclusion**: This situation—"Cartesian product is standard, Zip is special"—is merely an **"illusion" created by the engineering constraints** of Haskell's hierarchy. The Zip behavior is mathematically unproblematic; it simply didn't conform to the local rule that Haskell created dictating "how `Monad` and `Applicative` should be."

**This situation is precisely what confuses beginners who earnestly seek to learn functional programming.** When only one of two mathematically equivalent implementations is taught as "standard" while the other is treated as a "special case," learners are deprived of the opportunity to understand the true theoretical richness.

This is exactly what happened: "Because Applicative was forced into an implementation as if it were an intermediate stage between Functor and Monad, the Zip version appeared more problematic," resulting in the unjust exile of the equally legitimate Zip version to a separate type `ZipList`, despite being mathematically equivalent.

## 2. The Fiction of the Typeclass Hierarchy: Its Structure and Lack of Mathematical Foundation

This chapter details how the "distortion" shown in the previous chapter stems from the `Functor => Applicative => Monad` hierarchy itself. It clarifies that this hierarchy is an engineering compromise rather than something categorically natural, and that Haskell's choice lacks mathematical foundation because multiple equally valid Applicative implementations exist from a category theory perspective.

### Haskell's Typeclass Hierarchy

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
    
    ```scala
    // Multiple Applicative instances existimplicit val listCartesian: Applicative[List] = ...implicit val listZip: Applicative[List] = ...// Explicit selection at usagecompute(List(1,2), List(3,4))(listCartesian) // Cartesian productcompute(List(1,2), List(3,4))(listZip)       // zip
    
    ```
    
-   **Rust** also allows multiple trait implementations. **Swift, Kotlin, PureScript** adopt similar solutions

**The fact that these solutions work proves that Haskell's constraints are not universal problems but results of specific typeclass design.** By knowing this fact, beginners can understand functional programming concepts with a broader perspective.

### JavaScript: The Most Familiar Counter-Example

The world's most widely used `Array` in JavaScript proves that this flexible approach functions without problems. All structures can be used selectively, freely, and clearly on top of a single `Array` type without needing cumbersome types like `new ZipArray()`.

-   **Functor**: `Array.prototype.map` provided by default
-   **Monad**: `Array.prototype.flatMap` also provided by default, naturally expressing Cartesian product-like behavior
-   **Applicative**: Not standard, but both behaviors can be easily implemented:
    
    ```javascript
    // Zip versionconst mapZip = (f, xs, ys) => xs.map((x, i) => f(x, ys[i]));// Cartesian product versionconst mapCartesian = (f, xs, ys) => xs.flatMap(x => ys.map(y => f(x, y)));
    
    ```

**This example provides very important implications for beginners: functional programming concepts can be fully expressed without Haskell's special constraints.**

This shows that Haskell's constraints are not universal but are strictly Haskell-specific design choices of its typeclass system.

## 4. Case Study of Authoritative Claims: The "ZipList Cannot Be a Monad" Discourse

This chapter re-examines a well-known claim in the Haskell world as a concrete "case study" of how Haskell's peculiar design philosophy generates specific issues, revealing how "mathematical facts" and "Haskell's local rules" are conflated. Within the Haskell community, the following claim is often stated authoritatively:

> **"It is mathematically impossible for ZipList to become a Monad"**

This claim is widely accepted, with Coq proofs provided on GitHub and treated as a standard example on Haskell-cafe mailing lists and StackOverflow. Indeed, it is difficult to define a `>>=` for `ZipList` that satisfies the monad laws, particularly the associativity law.

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

This chapter synthesizes the previous discussions and critiques the more serious problem of authoritarianism and theoretical abuse occasionally seen in the Haskell community, which might be called "category theory laundering."

**Most importantly, these problems have become significant obstacles for beginners who earnestly seek to learn the theoretical foundations of functional programming.**

### Category Theory Laundering and Its Educational Harm

There is a tendency to justify engineering conveniences as "categorically beautiful" or "mathematical necessity," and to glorify design problems as "theoretical profundity." The existence of `ZipList`, a product of the logical failure of arbitrarily elevating Cartesian product as "standard" and exiling the mathematically equivalent zip structure, is often justified as "design refinement."

**This "laundering" severely harms beginners' learning:**

-   **False Theoretical Understanding**: When engineering compromises are taught as mathematical necessities, learners acquire distorted theoretical foundations
-   **Inhibition of Critical Thinking**: "Authoritative" explanations become difficult to question, preventing learners from developing critical thinking
-   **Conceptualization Narrowing**: Originally rich mathematical concepts are understood as limited to specific implementations

This "laundering" appears in several patterns:

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