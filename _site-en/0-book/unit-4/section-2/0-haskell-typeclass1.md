# The Fiction of Haskell's "Theoretical Superiority": A Critical Verification from a Category Theory Perspective

## Introduction

It is an undeniable fact that Haskell has made immense intellectual contributions to the world of programming, pioneering the practical application of many abstract concepts, most notably the monad, and popularizing them throughout the programming world. Its theoretical rigor and expressive power continue to be a benchmark for many developers and researchers.

However, it is precisely because of this theoretical authority that certain design choices may have been mythologized as "mathematical necessities," making critical re-examination difficult. This paper begins from a fundamental point of inquiry: **Is this not merely a case of substituting Haskell's local rules for a universal mathematical argument?**

The purpose of this document is by no means to deny Haskell's overall value. Rather, it is to focus on one specific, long-debated issue—the **`List` Applicative implementation and its associated typeclass hierarchy**—and to fairly and rigorously re-verify whether this choice is truly as "theoretically natural" as is often claimed, using the lens of category theory and the more natural implementations found in other languages.

## 1. Structure of the Problem: The "Distortion" of Functor, Monad, and Applicative in Haskell

To understand the theoretical "distortion" at the heart of this issue, we must first look at the three concepts step-by-step.

### 1-1. The Foundation for Everything: "Functor"

First, the foundation for everything is the `Functor`. `map` (Functor) is the most fundamental operation, dealing with a single container (`f a`). Its role is to transform (map) only the contents inside the container using a function `a -> b`, without changing the container's structure (e.g., the length of a list) in any way.

The type signature for `Functor`'s `map` is `(a -> b) -> f a -> f b`. It can be considered a neutral and basic "mapping" operation that exists before the conflict between "Cartesian product" and "Zip" arises.

### 1-2. The Powerful "Monad" and its "Cartesian" Destiny

Next comes the `Monad`, which greatly extends the power of a `Functor`. `bind` (Monad), with a type like `m a -> (a -> m b) -> m b` (known as `collect` in F# or `flatMap` in JS), has the rich capability to determine the very **structure** of the next computation (`m b`) using the **value** `a` from the previous computation.

In the context of `List`, the "natural" implementation that satisfies the monad laws is one that behaves like a **Cartesian product (all combinations)**. This is the source of the `List` monad's power, and at the same time, the destiny that defines its "personality."

### 1-3. The Source of the Problem: The "Forcing" of "Applicative"

Finally, we discuss `Applicative`. Historically, it is relatively new among Haskell's typeclasses and, for some reason, was forced into an intermediate layer between `Functor` and `Monad`. This is where the problem this document continually points out arises.

* **The Diversity of Applicative**: As a basic premise, for `List`, there exist at least two categorically legitimate "choices" for `Applicative`: the **"Cartesian product"** and the **"Zip"**. This demonstrates the richness of the structure that the `List` type possesses.
* **The "Forcing" of Haskell's Hierarchy**: However, Haskell established the hierarchical structure `class Applicative f => Monad f`. This was an engineering decision in language design that **fixed** the behavior of the `Applicative` for `List` (which is a `Monad`) to be the Cartesian product version derived from the `Monad`.
* **The Resulting "Illusion" and Unjust Exclusion**: This situation—"Cartesian product is standard, and Zip is special"—is nothing more than an **"illusion" created by the engineering constraint** of Haskell's hierarchy. The Zip behavior is not mathematically troublesome in itself; it simply did not conform to the local rule Haskell created that dictates "this is how `Monad` and `Applicative` ought to be."

This is precisely the situation: "because Applicative was forced into an implementation as if it were an intermediate step between Functor and Monad, the Zip version seemed more troublesome," and as a result, despite being equally legitimate mathematically, it was unjustly exiled to a separate type, `ZipList`.

## 2. The Fiction of the Typeclass Hierarchy: Its Structure and Absence of Mathematical Justification

This section details how the "distortion" shown in the previous chapter originates from the `Functor => Applicative => Monad` hierarchy itself. It will clarify that this hierarchy is an engineering compromise, not categorically natural, and that Haskell's choice lacks mathematical justification because multiple, equally valid Applicative implementations exist from a category theory perspective.

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

### Categorical Verification: Full of Problems

**1. The "Hierarchy" is a Categorical Fiction**

In category theory, `Functor`, `Monad`, and `Applicative` are **independent concepts** and are not in such an enforced hierarchical relationship. An investigation of standard category theory texts (MacLane, Awodey, etc.) reveals the following relationships:

* **Monad**: endofunctor + unit + multiplication + associativity/unit laws.
* **Applicative (lax monoidal)**: endofunctor + lax monoidal structure + naturality.
* **Relationship**: An Applicative can be derived from a Monad, but there is **no enforced hierarchy**. Monad and Applicative are **parallel concepts**.

To make this more precise: In MacLane's "Categories for the Working Mathematician," a monad on a category C is defined as a triple (T, η, μ) where T: C → C is an endofunctor, η: 1_C → T is a natural transformation (unit), and μ: T² → T is a natural transformation (multiplication), satisfying associativity and unit laws. Meanwhile, an applicative functor corresponds to a lax monoidal functor, which is a functor F: C → D between monoidal categories, equipped with natural transformations φ₀: I_D → F(I_C) and φ₂: F(A) ⊗ F(B) → F(A ⊗ B), satisfying coherence conditions. These are fundamentally different categorical structures with no inherent ordering relationship.

**2. The Problem with "Deriving" Applicative from Monad**

In Haskell, it is said that "If it's a Monad, it can be an Applicative" using the following derivation:

```haskell
pure = return
f <*> x = f >>= \g -> x >>= \y -> return (g y)
```

But from a category theory perspective, this derivation is not trivial and implicitly assumes an additional, non-trivial structure called **tensorial strength**. This is a natural transformation `strength: A ⊗ T(B) → T(A ⊗ B)`, and Haskell implicitly assumes this exists for all types. This assumption is **mathematically non-trivial**.

More specifically, this derivation requires that the monad T be a strong monad. The strength natural transformation must satisfy coherence conditions with respect to the monoidal structure. In Moggi's seminal work "Notions of Computation and Monads" (1991), he explicitly discusses how computational monads require this additional structure. The existence of strength is not automatic and represents an additional constraint that is often glossed over in informal discussions.

### The Absence of Mathematical Justification: A Category Theory Perspective

**1. The Existence of Multiple Products in Category Theory**

The crucial fact from category theory is that Applicative Functors correspond to **lax monoidal functors**, and the **monoidal product is not unique** (up to isomorphism). This means that multiple different monoidal structures can coexist in the same category with **mathematically equal legitimacy**. For a single type like `List`, multiple "products" exist:

* **Cartesian Product-like Structure**: Generates all combinations.
    `[f1,f2] <*> [x1,x2,x3] = [f1 x1, f1 x2, f1 x3, f2 x1, f2 x2, f2 x3]`
* **Pointwise (Zip) Structure**: Combines corresponding elements.
    `[f1,f2] <*> [x1,x2] = [f1 x1, f2 x2]`

**Both** of these structures are completely legitimate in category theory; they both satisfy the monoidal laws (associativity, identity) and the conditions for a lax monoidal functor. It is **mathematically impossible** for one to be "more natural" or "more theoretical" than the other.

To be precise about the mathematical equality: Both structures can be shown to satisfy the monoidal laws. For the Cartesian structure, with unit [] and tensor ⊗_cart defined as above, we have associativity: (A ⊗_cart B) ⊗_cart C ≅ A ⊗_cart (B ⊗_cart C), and unit laws: [] ⊗_cart A ≅ A ≅ A ⊗_cart []. For the zip structure, with unit [id, id, ...] (infinite list of identities) and tensor ⊗_zip defined pointwise, similar laws hold. The fact that one requires finite lists while the other works naturally with infinite lists does not invalidate either structure categorically—it merely reflects different computational characteristics.

**2. Haskell's Arbitrary Choice and Justification**

Faced with multiple mathematically legitimate options, Haskell arbitrarily fixed the `Applicative` for `[]` to be the "Cartesian product" and exiled the equally legitimate zip version to a separate `ZipList` type. The actual motivation for this choice had no basis in category theory, but was rooted in **purely engineering reasons**:

1.  **Consistency with Monad**: The `Monad` instance for `[]` already had Cartesian-like behavior.
2.  **Predictability of Type Inference**: To avoid compilation errors from ambiguous instances.
3.  **Historical Reasons**: Applicative was added to the language much later than Monad (in 2008 by Conor McBride and Ross Paterson) and required compatibility with existing Monad code. This led to the compromise of a hierarchy that mechanically derives Applicative from Monad.

However, we must acknowledge that this choice, while mathematically arbitrary, serves important practical purposes within Haskell's design philosophy. The typeclass coherence that results from having a unique instance per type eliminates a significant class of runtime errors and makes type inference more predictable. The computational complexity of Cartesian product operations (O(m×n)) versus zip operations (O(min(m,n))) represents a trade-off between expressiveness and efficiency, but this is a separate consideration from mathematical legitimacy.

### Concrete Theoretical Contradictions of the Hierarchy

The artificial hierarchy creates numerous theoretical contradictions:

* **The Breakdown Proven by ZipList**: `ZipList` is Applicative, but precisely because of this hierarchy, it cannot be a Monad. If the hierarchy were "natural," why is only the zip structure excluded?
* **The Problem of the Set Functor**: `Set` is a Functor, but to become an `Applicative`, it requires an `Ord` constraint, which breaks the "pure" structure of the hierarchy.
* **The Peculiarity of the IO Monad**: The `>>=` for `IO` means sequencing, not the categorical `bind`, and its semantics differ from the parallel-like semantics of its `Applicative` instance.

The Set example deserves particular attention as it reveals another limitation of the hierarchy. The constraint Ord a => ... in the Applicative instance for Set reflects the fact that Set is not actually a functor in Hask (the category of Haskell types), but rather in a subcategory where all objects have Ord instances. This constraint propagation breaks the clean categorical interpretation and reveals that Haskell's type system is not a faithful representation of the mathematical categories it claims to model.

## 3. The "Theoretically Sincere" Implementation: Verification by Comparison with Other Languages

Based on the fact that this is a matter of mathematical freedom, this section presents how many other languages implement multiple Applicative-like behaviors on a single type in a more natural, flexible, and completely safe manner. The argument that multiple implementations would compromise "safety" or "type system coherence" is false.

### The Freedom of ML-family Languages (e.g., F#)

ML-family languages like F# take a **function-based** approach, allowing multiple operations with different semantics to be defined for the same type. The user's intent is made clear with specific function names, and no ambiguity arises.

```fsharp
// Multiple Applicative-like operations can be defined for the same List type
let mapCartesian f xs ys =
    xs |> List.collect (fun x -> ys |> List.map (f x))

let mapZip f xs ys =
    List.map2 f xs ys

// Explicit function calls make the intent clear
List.map2 (+) [1;2] [3;4]     // zip version: [4;6]
// List.allPairs (+) [1;2] [3;4] // A Cartesian product version
```

This is not an issue of "safety," but a difference in **API design philosophy**.

* **Haskell**: "The same abstract operation should have the same meaning."
* **ML-family Languages**: "Different operations should have different names."

It's worth noting that ML's approach sacrifices some theoretical elegance for practical clarity. The explicit naming convention eliminates the polymorphic abstraction that makes Haskell's approach powerful for generic programming. However, this trade-off reflects different priorities: ML prioritizes readability and explicitness, while Haskell prioritizes mathematical abstraction and reusability. Neither approach is inherently superior; they represent different points in the design space with different trade-offs.

### A Solved Problem in Other Languages

The claim that multiple instances would "break type inference" is contrary to the facts and has been solved in many other languages.

* **Scala** allows multiple instances to coexist using `implicit` parameters, which are selected explicitly at the call site.
    ```scala
    // Multiple Applicative instances exist
    implicit val listCartesian: Applicative[List] = ...
    implicit val listZip: Applicative[List] = ...

    // Explicitly select at time of use
    compute(List(1,2), List(3,4))(listCartesian) // Cartesian product
    compute(List(1,2), List(3,4))(listZip)       // zip
    ```
* **Rust** also allows for multiple trait implementations. Similar solutions have been adopted in **Swift, Kotlin, and even PureScript**.

However, each of these solutions comes with its own complexity costs. Scala's implicit system, while powerful, has been widely criticized for making code harder to understand and debug. The implicit resolution algorithm can be quite complex, and the cognitive overhead of tracking which implicits are in scope represents a real cost. Rust's trait system requires explicit disambiguation in cases of conflict, which provides clarity but at the expense of ergonomics. These trade-offs must be acknowledged when comparing design approaches.

### JavaScript: The Most Familiar Counter-Example

The world's most widely used `Array` in JavaScript proves that this flexible approach functions without any problems. It is possible to freely and clearly use all structures selectively on top of the single `Array` type, without needing a cumbersome type like `new ZipArray()`.

* **Functor**: `Array.prototype.map` is provided by default.
* **Monad**: `Array.prototype.flatMap` is also provided by default and can naturally express Cartesian product-like behavior.
* **Applicative**: While not standard, both behaviors can be easily implemented:
    ```javascript
    // Zip version
    const mapZip = (f, xs, ys) => xs.map((x, i) => f(x, ys[i]));

    // Cartesian product version
    const mapCartesian = (f, xs, ys) => xs.flatMap(x => ys.map(y => f(x, y)));
    ```

This shows that Haskell's constraint is not universal, but strictly a Haskell-specific design choice of its typeclass system.

However, the JavaScript comparison must be qualified by the fact that JavaScript operates in a fundamentally different context. As a dynamically typed language, JavaScript avoids many of the type inference complexities that make Haskell's choice more constrained. The freedom to define multiple operations without type system conflicts comes at the cost of compile-time safety guarantees. JavaScript's approach works well for its domain, but the comparison is not entirely fair given the different type system guarantees each language provides.

## 4. Case Study of an Authoritative Claim: The "ZipList cannot be a Monad" Discourse

This section re-examines a famous claim in Haskell as a concrete "case study" produced by its peculiar design philosophy, revealing how a "mathematical fact" and "Haskell's local rule" are conflated. Within the Haskell community, the following assertion is often authoritatively stated:

> **"It is mathematically impossible for ZipList to be a Monad."**

This claim is widely accepted, with proofs provided in Coq on GitHub, and treated as a classic example on the Haskell-cafe mailing list and StackOverflow. And indeed, it is difficult to define `>>=` for `ZipList` in a way that satisfies the monad laws, especially the associativity law.

```haskell
-- It is difficult to define this in a way that satisfies the monad laws.
zipBind :: ZipList a -> (a -> ZipList b) -> ZipList b
```

**Associativity Law**: `(m >>= f) >>= g` == `m >>= (\x -> f x >>= g)`

This law guarantees that the result remains the same regardless of how computations are ordered. Implementations based on a zip operation cannot satisfy this law in complex cases where list lengths and structures change.

To understand why this fails, consider a concrete attempt at implementation:

```haskell
zipBind :: ZipList a -> (a -> ZipList b) -> ZipList b
zipBind (ZipList xs) f = ZipList $ zipWith ($) (map (getZipList . f) xs) xs
```

This definition immediately fails because `map (getZipList . f) xs` produces a list of lists, not a list of functions. Any attempt to fix this encounters fundamental problems with the associativity law. If we try to define zipBind such that the lengths of intermediate results affect the final structure, we violate associativity. If we ignore length variations, we lose the essential character of the zip operation.

The mathematical impossibility here is real and stems from the fundamental incompatibility between zip-like operations (which preserve positional correspondence) and the kind of structural flexibility that monads require (where the shape of the computation can depend on intermediate values).

This "impossibility" is a pure mathematical requirement, not a local rule of Haskell. The problem, however, is that this fact is then used to justify the artificial hierarchy of Haskell and its arbitrary choice to make the Cartesian product the standard. The core issue is not the mathematical fact itself, but how it is instrumentalized within the community's discourse.

## 5. The Problem of Intellectual Attitude: The Abuse of "Theoretical Authority"

This section synthesizes the discussion so far and critiques the more serious problems observed in the Haskell community, such as authoritarianism and the abuse of theory, which it sometimes refers to as "Category Theory Laundering."

### Category Theory Laundering

There is a tendency to justify engineering conveniences as "categorically beautiful" or "mathematical necessities," and to glorify design problems as "theoretical profundity". The existence of `ZipList`, which is a product of the logical failure of arbitrarily anointing the Cartesian product as "standard" and exiling the mathematically equivalent zip structure, is nonetheless often justified as "design elegance."

This "laundering" appears in several patterns:

* **Canonization in Tutorials**: Explanations like "The Cartesian product is the natural implementation of Applicative" or "The typeclass hierarchy reflects categorical structure" are common, despite having no basis in category theory.
* **Abuse of Academic Authority**: Using the keyword "category theory" to lend authority to claims without providing actual categorical proof.
* **Uncritical Reproduction**: The circulation of established claims as "official views" without critical verification, and the systematic ignorance of counter-examples in other languages.

However, it's important to recognize that Haskell's design choices, while not categorically mandated, do serve legitimate engineering purposes. The coherence property—that each type has at most one instance of each typeclass—provides significant benefits in terms of reasoning and optimization. GHC can make aggressive optimizations based on the assumption that typeclass resolution is deterministic. This coherence also eliminates a class of runtime errors that can occur in systems with overlapping instances.

The criticism should be directed not at the design choice itself, but at the post-hoc theoretical justification that presents engineering trade-offs as mathematical necessities. A more honest discourse would acknowledge that Haskell chose coherence over flexibility, and that this choice has both costs and benefits.

### The "Design Philosophy" Escape Route and Typical Defenses

When it becomes clear there's no theoretical basis, a common tactic is to escape into subjective domains like "philosophy" or "aesthetics," dismissing criticism as a "lack of understanding." But in what way is the `class Functor f => Applicative f => Monad f` hierarchy "philosophically beautiful"? The approach of ML-family languages, which gives different names to different operations, is far clearer and more natural.

In actual discussions, the following **patterned defenses** frequently appear:

* **"Type Inference Coherence"**: The claim that multiple implementations break type inference. **Reality**: This is a solved problem in other languages. It presents a Haskell design constraint as a universal problem.
* **"Mathematical Necessity"**: The claim that the Cartesian product is "natural" and zip is "artificial". **Reality**: They are equivalent in category theory. It presents an arbitrary choice as theoretical justification.
* **"Design Philosophy"**: The claim that a unified interface is "beautiful". **Reality**: The abuse of `newtype` to separate mathematically equivalent structures is itself ugly. It re-packages an engineering compromise as aesthetics.

A more nuanced view would recognize that the "Type Inference Coherence" defense, while overstated, does point to real benefits. Haskell's approach enables powerful type inference and eliminates certain classes of runtime errors. The cost is reduced flexibility, but this represents a legitimate design trade-off rather than a mere prejudice.

Similarly, the preference for unified interfaces does have practical benefits in terms of generic programming and API consistency. The ability to write polymorphic code that works uniformly across different container types is valuable, even if it requires making arbitrary choices between equally valid mathematical structures.

Through a constraint that is completely unnatural in category theory (one implementation per typeclass), Haskell arbitrarily selects the Cartesian product as the "standard" and exiles the zip structure to a separate, artificial type called `ZipList`. And then, it offers a post-hoc justification for this logical failure as "design elegance," making it seem as if there were a mathematical necessity. This is a typical example of a lack of intellectual sincerity.

The charge of intellectual insincerity would be more fairly directed at overclaims rather than the design choice itself. The decision to prioritize coherence over mathematical completeness is a reasonable engineering judgment. The problem arises when this practical decision is misrepresented as a theoretical imperative.

## Conclusion: In Pursuit of True Theoretical Sincerity

Haskell's contributions to the world of functional programming are immeasurable. However, in the shadow of this great authority, a specific problem exists: **a tendency to justify engineering or historical design choices with a post-hoc narrative of "mathematical necessity" or "theoretical superiority."** The sequence of events that led to fixing the `List` Applicative implementation as the Cartesian product and necessitating the `ZipList` solution is the most symbolic example of this.

True theoretical sincerity begins with frankly acknowledging one's own language's constraints and design trade-offs.

### The Ideal Stance

1.  **Acknowledge multiple legitimate implementations**: Recognize that, as category theory shows, multiple `Applicative` structures can exist for `List`.
2.  **Do not confuse engineering constraints with theory**: Make it clear that "typeclass uniqueness" is an engineering choice of Haskell, not a universal mathematical truth.
3.  **Apply categorical concepts accurately**: Do not use concepts like `Monad` or `Applicative` for the purpose of justification or to claim authority.
4.  **Respect solutions in other languages**: Learn from the more flexible, and in some sense more categorically natural, approaches shown in F#, Scala, JS, and others.
5.  **Critically re-verify "official views"**: Always question the theoretical basis for even well-established discourse within the community.

Additionally, we should recognize that Haskell's design philosophy represents a particular point in a complex design space. The prioritization of type safety, inference predictability, and optimization opportunities through coherence represents a legitimate set of values, even when it requires departing from mathematical purity in certain respects. The key is to be honest about these trade-offs rather than obscuring them with theoretical rhetoric.

The benefits of Haskell's approach include: elimination of ambiguous type inference, enablement of aggressive compiler optimizations, consistency in API behavior across different contexts, and reduction of certain classes of runtime errors. These are real benefits that justify the design choice, independent of any category-theoretic considerations.

It is precisely because it has this leadership that Haskell must honestly explain the engineering judgments and historical context behind its design, rather than claiming a "compromise" is a "necessity." By stepping out from behind the cover of "theoretical authority" and openly discussing design trade-offs, Haskell can earn true respect and continue to lead the evolution of programming languages.