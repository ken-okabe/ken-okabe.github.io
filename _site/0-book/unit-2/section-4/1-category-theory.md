:::lang-en

# Category Theory

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

In this chapter, we will explain **Category Theory**, but understanding its content is not essential to proceed with this book.

The reason for this is simply that functional programming is built entirely within the scope of **Set Theory**, and thus does not require the further abstraction provided by category theory. (This very fact is what we will be explaining in this chapter.)

However, it is an unavoidable fact that category theory itself, or concepts and terms related to it, appear frequently in the context of explaining functional programming. Therefore, we are explaining it from the stance that "knowing it will surely be helpful to avoid confusion."

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Set Theory is Bottom-Up

As we confirmed in the previous chapter, in set theory, we first define elements. Then, we create sets from those elements, and further sets from those sets, building a hierarchical structure in a bottom-up fashion.

The approach of building a theory from concrete elements before us—like `1`, `2`, `"Hello"`, or `true/false` in programming—is naive and intuitive. This is the very essence of the type theory in simple programming languages, where types like integer and string are defined as sets of these elements.

This set-theoretic bottom-up approach is sufficient not only for functional programming but also for advanced type systems like dependent types.

The idea that things are composed of concrete "things" is known as **"elemental reductionism."**

## Category Theory is Top-Down

However, as a theory evolves from the concrete to the abstract, the individual elements that once seemed important lose their essential significance. The idea emerges that what is truly essential is rather the nested structure of the "containers" that hold the elements, that is, the relationships themselves.

This way of thinking is called **"structuralism,"** a top-down approach that seeks the essence of things in their relationships.

In category theory, the mainstream style defines things using two systems: Objects and Arrows. However, even this presupposes the existence of "things" called Objects.

But there is another, non-mainstream style: the **"Arrows-only definition."** As the name implies, in this world, only **Arrows** exist.

So, where did the Objects go? In the Arrows-only definition, we consider a special form where an arrow points to itself, the **"Identity Arrow,"** and we **regard this as an Object**.

In other words, in this pure worldview of category theory, what exists at the root is **only the relationship called Arrow**, and even an Object is defined as **a special relationship that "points to itself."**

-----

## Set Theory vs. Category Theory

At the heart of this argument is the question: **"Do we seek the foundation of the world in independent 'elements' or 'substances,' or in 'relationships' and 'structures' themselves?"**

This opposition can be framed as the conflict between "Substantialism" and "Relationalism" in Western philosophy.

### 1\. Mathematical Foundation: The Contrast of 'Substance' and 'Relation'

#### **Set Theory: The Bottom-Up Approach 🧱**

Set theory is unequivocally a **bottom-up** worldview.

1.  **Elements as the Origin**: First, there exist **"elements" (members)**, the smallest units of the world.
2.  **Constructing Sets**: Next, these elements are gathered to create "containers" called **"sets."**
3.  **Relationships Emerge**: **Relationships** such as "maps" (functions) are defined between sets.

Everything begins with individual "things," and larger structures are built by assembling them. It's a very intuitive and concrete approach, like building from the ground up.

-----

#### **Category Theory: The Top-Down Approach 🌐**

On the other hand, category theory, especially the "Arrows-only" idea, is a completely **top-down** approach.

1.  **Relationships as the Origin**: At the beginning of the world, there are only **"arrows" (morphisms)**. An arrow is the relationship itself that connects "something" to "something."
2.  **Objects are Defined Later**: **"Objects"** are defined secondarily as the "start points" or "end points" of arrows, or as arrows that do nothing (identity arrows). In other words, objects are merely "nodes" in the network of relationships.
3.  **Elements Do Not Exist**: In the purest form of category theory, the concept of an "element" is unnecessary. The focus is not on what is inside an object, but only on what relationships (arrows) it has with other objects.

This is a very abstract and macroscopic approach that does not delve into the internal structure of individual things, but focuses on the structure, patterns, and relationships of the system as a whole.

-----

This fundamental conflict of perspectives in mathematics has a surprisingly universal structure and can be found as a similar paradigm in both Western and Eastern thought.

### 2\. Western Thought: The "Deconstruction of the Subject" by Structuralism

Next, let's look at how Western structuralism brought a similar mode of thinking to the human sciences. What structuralism criticized was the bottom-up thinking that placed the autonomous "individual (subject)" at the center of the world.

What structuralism showed was the fact that individual consciousness and behavior are governed by an unconscious **"structure"** that transcends the individual. In language, the meaning of a word does not lie in the word itself, but arises from its **difference (relationship)** with other words within the linguistic system (structure). Here, the "subject" is not a fundamental entity like an "element" in set theory, but is "deconstructed" into a mere node that gains meaning only by being positioned within the vast **network of relationships** of language and culture, much like an "object" in category theory.

### 3\. Eastern Thought: The "Negation of Substance" in "Emptiness" and "Dependent Origination"

Finally, let's see how this relational thinking was developed in a highly sophisticated form long ago in Buddhist thought, especially in the idea of "emptiness" (Śūnyatā). What Buddhism criticized was the substantialist way of thinking that posited an unchanging, independent "self" (Ātman) and the idea that all things have their own inherent essence (Svabhāva).

  * **Dependent Origination (Pratītyasamutpāda)**: The teaching that all things do not exist independently, but are provisionally established through the mutual dependence of innumerable causes and conditions (**relationships**).
  * **Emptiness (Śūnyatā)**: As a consequence of dependent origination, it is held that all things lack an "inherent essence" that exists independently of their relationships with others. This state of lacking substance is called **"emptiness."** Emptiness is not nothingness; it is the positive truth that **"all things are relationships themselves."**

A "table" as an object is a **bundle of innumerable relationships (dependent origination)** such as "wood, carpenter, design, purpose..." and if these relationships are removed, the entity "table" disappears. This aligns surprisingly well with the idea in category theory of viewing an object as a bundle of arrows.

### Conclusion

From the foregoing argument, it is clear that these three intellectual currents, while in different fields, all contain a common paradigm shift.

| Field | **Bottom-Up / Substantialism** | **Top-Down / Relationalism** |
| :--- | :--- | :--- |
| **Mathematics** | **Set Theory** (Elements are primary) | **Category Theory** (Relationships are primary) |
| **Western Thought** | **Existentialism/Humanism** (The individual is primary) | **Structuralism** (The structure is primary) |
| **Eastern Thought**| **Substantialism (Svabhāva/Ātman)** | **Emptiness/Dependent Origination** (Interdependence is reality)|

All of these are nothing less than an expression of the profound worldview that **"the world is not a collection of independent 'things,' but is essentially a web of 'relationships.'"** We can conclude that category theory is the most rigorous and universal expression of this ancient idea in the language of modern mathematics.

## The Only Tool to Construct a Category is the Relationship called Arrow

In the mainstream definition of category theory, there are two systems defined:

  - **Object** : The "thing" 
  - **Arrow** : The "relationship"


![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752571465750.png)

In addition, the Identity Arrow is assumed to exist trivially.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752571672298.png)

However, in the Arrows-only definition:

Object = Identity Arrow

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752571518656.png)


So,

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752571688664.png)








In fact, this Arrows-only definition is theoretically simpler, more beautiful, and elegant. It also purely expresses that category theory is a theoretical system that pursues only relationships in a structuralist way, as introduced at the beginning.

## The Two-System Definition of Object/Arrow is Mainstream

So, why is the two-system definition of Object/Arrow mainstream, rather than the Arrows-only definition?

Ultimately, this is a trade-off between **"axiomatic beauty and minimality" and "educational clarity and practical convenience."**

For many mathematicians, category theory is a "tool to be used," so the mainstream definition, which is easy to relate to concrete examples and intuitive to handle, is overwhelmingly widely adopted. The Arrows-only definition is positioned as an elegant alternative that is important when exploring the foundations of category theory more deeply.

The Arrows-only definition is not mainstream because, compared to the mainstream Object/Arrow definition, **its correspondence with concrete examples (especially set theory) is not intuitive, making it difficult to understand from an educational and practical perspective.**

-----

### Reasons for the Mainstream Definition's Adoption

1.  **Intuitive Clarity (Educational Consideration)** 🧠
    It is natural for humans to think in terms of "things" (objects) and their "relationships" (arrows). The mainstream definition directly corresponds to this intuition. The image of drawing dots (objects) on a blackboard and connecting them with lines (arrows) is easy for anyone to understand. The seminal work "Categories for the Working Mathematician" by one of the founders, Mac Lane, is also written with this mainstream definition, making it an educational standard.

2.  **Ease of Correspondence with Concrete Examples** 🔗
    The power of category theory lies in its ability to capture common structures in various fields of mathematics (set theory, group theory, topology, etc.). In these fields, the "things" being studied clearly exist.

      * **Set Theory**: Objects are **sets**, arrows are **maps**
      * **Group Theory**: Objects are **groups**, arrows are **homomorphisms**
      * **Topology**: Objects are **topological spaces**, arrows are **continuous maps**

    The mainstream definition is very convenient for application because it allows these "things" from concrete examples to be directly mapped to "objects" and their "relationships" to "arrows." The Arrows-only definition requires a roundabout interpretation of first finding the "identity map" and then regarding it as a "set."

3.  **Historical Context** 📜
    Category theory was originally devised by Eilenberg and Mac Lane in their study of algebraic topology to describe "functors" and "natural transformations" between different mathematical objects. What they were dealing with were precisely concrete things like topological spaces (objects) and continuous maps (arrows), and the mainstream definition was a straightforward generalization of that structure. The Arrows-only definition was a more abstract and refined form that emerged later from the quest to minimize the axioms of category theory.

Now, let's look at the definition of a "category" in category theory, following the mainstream Object/Arrow definition.

-----

## Definition of a Category

A **Category** is a mathematical structure defined by a collection of **Objects**, a collection of **Arrows** (or morphisms) between those objects, and a **Composition** of arrows, defined by the following components and axioms.

### Components of a Category

1.  **A collection of Objects**
    A collection (class) of **Objects**, such as $A, B, C, \dots$.

2.  **A collection of Arrows**
    A collection (class) of **Arrows** (or morphisms), such as $f, g, h, \dots$.

3.  **Domain and Codomain**
    Every arrow $f$ is assigned a **domain** `dom(f)` and a **codomain** `cod(f)`, which are objects. An arrow `f` with `dom(f) = A` and `cod(f) = B` is denoted as $f: A \to B$.
    The collection of all arrows from an object $A$ to an object $B$ is sometimes denoted as `Hom(A, B)`.

4.  **Composition**
    For any two arrows $f: A \to B$ and $g: B \to C$ (i.e., a pair satisfying `cod(f) = dom(g)`), there is a unique arrow called their **composition**, denoted $g \circ f: A \to C$.

-----

### Axioms of a Category

The above components must satisfy the following two axioms.

1.  **Associativity**
    For any three composable arrows $f: A \to B$, $g: B \to C$, and $h: C \to D$, the following equality holds:

    $$h \circ (g \circ f) = (h \circ g) \circ f$$

2.  **Identity**
    For every object $A$, there is a unique special arrow called the **identity Arrow**, $id\_A: A \to A$, such that for any arrow $f: A \to B$ and any arrow $g: C \to A$, the following equalities hold:

    $$f \circ id_A = f$$

    $$id_A \circ g = g$$

A system that satisfies these components and axioms is defined as a category.

## Definition of the "Category of Sets"

The "Category of **Set**" is a mathematical structure with **sets** as objects and **maps (functions)** between those sets as arrows, defined by the following components and axioms.

### Components of the "Category of Sets"

1.  **Collection of Objects**
    All **sets**, such as $A, B, C, \dots$.

2.  **Collection of Arrows**
    All **maps (functions)**, such as $f, g, h, \dots$.

3.  **Domain and Codomain**
    Every map $f$ has a **domain** set `dom(f)` and a **codomain** set `cod(f)`. A map `f` with `dom(f) = A` and `cod(f) = B` is denoted as $f: A \to B$.

4.  **Function Composition**
    For any two maps $f: A \to B$ and $g: B \to C$ (i.e., a pair where the codomain of `f` matches the domain of `g`), their **function composition** $g \circ f: A \to C$ is uniquely determined.

-----

### Axioms of the "Category of Sets"

The above components satisfy the following two axioms.

1.  **Associativity**
    For any three composable maps $f: A \to B$, $g: B \to C$, and $h: C \to D$, the following equality holds:

    $$h \circ (g \circ f) = (h \circ g) \circ f$$

2.  **Identity**
    For every set $A$, there is a unique **identity map** $id\_A: A \to A$ (which maps every element $x \in A$ to itself), such that for any map $f: A \to B$ and any map $g: C \to A$, the following equalities hold:

    $$f \circ id_A = f$$

    $$id_A \circ g = g$$

Thus, the world of sets and maps forms a concrete category that perfectly satisfies the axioms of a category.

## Function Composition: A Natural Monoid

The definition of the **"Category of Sets"** in category theory is identical, without any difference, to the laws we have already confirmed in the previous chapter:

**Function Composition: A Natural Monoid**

![Monoid structure of function composition](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745414533607.png)





## The "Category" in Category Theory is an Abstraction of the "Category of Sets"

In fact, the axioms (rules) of category theory were created by abstracting and generalizing the properties of sets and maps (functions). Therefore, it is a natural consequence that when the definition of a category is specialized to the "Category of **Set**," it fits perfectly with the rules of set theory that we are familiar with.

Let's look at what each element of category theory corresponds to in the category of sets.

| Abstract Concept in Category Theory | Concrete Counterpart in the Category of **Set** |
| :--- | :--- |
| **Object** | **Set** `A`, `B` |
| **Arrow** `f: A → B` | **Map (function)** `f: A → B` |
| **Identity** `id_A` | **Identity map** `id_A(x) = x` |
| **Composition** `∘` | **Function composition** `∘` |

Based on this correspondence, let's confirm how the axioms of category theory hold in the world of sets and maps.

### 1\. Correspondence of the Identity Law

In category theory, it is required that for every object `A`, there exists an identity arrow `id_A`, and for any arrow `f: A → B`, `f ∘ id_A = f` and `id_B ∘ f = f`.

This holds perfectly in the world of sets and maps.

  * For every set `A`, there exists an **identity map** such that `id_A(x) = x`.
  * When composed with a map `f: A → B`, for any element `x ∈ A`, `(f ∘ id_A)(x) = f(id_A(x)) = f(x)`, which is identical to the original map `f`. Similarly, `id_B ∘ f` is also identical to `f`.

### 2\. Correspondence of the Associativity Law

In category theory, it is required that for any three arrows `f, g, h` for which the compositions `g ∘ f` and `h ∘ g` are possible, `(h ∘ g) ∘ f = h ∘ (g ∘ f)`.

This is also a fundamental property of function composition.

  * Consider three maps: `f: A → B`, `g: B → C`, and `h: C → D`.
  * Taking any element `x ∈ A`:
      * The left side is `((h ∘ g) ∘ f)(x) = (h ∘ g)(f(x)) = h(g(f(x)))`
      * The right side is `(h ∘ (g ∘ f))(x) = h((g ∘ f)(x)) = h(g(f(x)))`
  * Since both sides yield the same result for all `x`, the two composite maps are perfectly equal.

Thus, when the abstract definition of a category is specialized to the concrete example of the "Category of Sets," it corresponds exactly to the laws of function composition in set theory. Category theory is a generalization that extracts only the "skeleton" of the structure created by sets and maps, so that it can be applied to various other mathematical objects (e.g., vector spaces and linear maps, topological spaces and continuous maps, etc.).

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

### A category itself can be regarded as a sort of generalized monoid

One of the founders of Category Theory, Saunders MacLane, states in his seminal text "Categories for the Working Mathematician":

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747107983842.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747107790672.png)

*(Source: Saunders MacLane, Categories for the Working Mathematician, 2nd ed., p. 7)*

This highlights that the very foundation of Category Theory is built upon the concept of a Monoid (associative operation + identity element). Therefore, it is natural that key constructs derived from it, like Functors and Monads, are defined in a way that respects and preserves this fundamental monoidal structure inherent in composition.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## The Framework of Set Theory is Sufficient

The Functors and Monads used in functional programming are indeed concepts derived from category theory, but in actual implementation and understanding, the framework of set theory is sufficient.

-----

**Historical Context:**

  - In the category of sets **Set**, objects are sets and arrows are functions.
  - Category theory abstracted this by retaining only the concepts of objects and arrows, while discarding the concept of specific "elements."

**Essence of Abstraction:**

  - Category of sets: There are sets A, B, and a function f: A → B.
  - General category: There are objects A, B, and an arrow f: A → B.
  - What is important is the existence of arrow composition and identity arrows; the "contents" are not questioned.

**Significance of this Abstraction:**

  - Allows other mathematical structures (topological spaces, groups, rings, etc.) to be treated within the same framework.
  - Provides a unified way to describe the concept of "structure-preserving maps."
  - Enables discussion of "relationships between structures," such as functors and natural transformations.

**From a Practical Perspective:**

  - A Functor can be understood as "lifting a function to a container type" (e.g., the map operation on a list).
  - A Monad can be treated as "wrapping a value and chaining computations" (e.g., safe computation chains with an Optional type).
  - In actual programming, this is sufficiently practical within the scope of a type system and function composition.

**Why the Abstraction of Category Theory is Unnecessary:**

  - The type systems of programming languages essentially operate within the category of sets (**Set**).
  - Higher-order category theory concepts like natural transformations of functors, limits/colimits, and topoi are not directly needed for everyday programming.
  - For implementing algorithms and ensuring type safety, a more concrete set-theoretic way of thinking is more practical.

**Concrete Examples:**

  - Scala's Option type, Java's Optional, and Rust's Option type can all be understood through the set-theoretic concept of "whether a value exists or not."
  - List operations (map, filter, reduce) can also be intuitively grasped as functions between sets.

-----

While knowledge of category theory is certainly helpful for understanding the theoretical background of why these concepts "work well," it remains a matter of general knowledge and is not essential for writing actual code. In fact, for many developers, understanding these concepts through the familiar ideas of sets and function composition is more practical.

That is why the intuition of the category of sets is sufficient when using Functors and Monads in functional programming. Since the type systems of programming languages basically operate within the category of sets, the more abstract concepts of category theory are interesting as a "theoretical background" but are not necessary in practice.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

### What about using the Kleisli category for Monads\!?

To that counterargument, one can respond as follows:

**1. The Kleisli Category is a Construction, Not a Prerequisite**

  - The Kleisli category is **constructed** from an existing Monad; it is not a prerequisite for defining a Monad.
  - In fact, in programming languages, a Monad is first defined by its basic operations, and then the Kleisli-like structure becomes apparent.

**2. At the Implementation Level, It's a Set-Theoretic Operation**

  - The implementation of the `bind` operation is ultimately the composition of functions that take a wrapped value and return another wrapped value.
  - This can be understood as function composition between sets, without needing to be conscious of the composition of arrows in a category.

**3. The Kleisli Category is a Post-Hoc Interpretation**

  - Programmers typically understand it as "a chain of computations with a context."
  - The composition of arrows in the Kleisli category is merely a mathematical formalization of this intuitive understanding.

**4. From a Practicality Standpoint**

  - In actual error handling or state management, one can effectively use Monads without knowing the concept of the Kleisli category.
  - For debugging and refactoring, an understanding of types and function composition is sufficient.

**5. Thinking with Concrete Examples**

  - Chained operations with a Maybe type: if a value exists, continue to the next computation; otherwise, stop.
  - This behavior can be intuitively understood as a "safe chain of computations," and can be implemented and used without knowledge of its category-theoretic background.

In short, one can argue that while the Kleisli category certainly exists, it is a "category-theoretic *interpretation* of a Monad," and not the *essence* of a Monad in programming.

### What about Haskell's Hask category\!?

To the counterargument about the Hask category, one can criticize it as "not a true category":

**1. It Does Not Satisfy the Axioms of a Category**

  - **Breakdown of Associativity**: Due to `undefined` and infinite loops, the composition of arrows may not satisfy the associative law.
  - **Problem with Identity Arrows**: The existence of `seq` means that a true identity arrow does not exist (the problem of strictness).
  - **Infinite Types**: Recursive type definitions make it impossible to clearly define a true "object."

**2. It is a Product of Implementation Compromises**

  - Due to the constraints of programming language implementation (memory, computation time), it is far from the ideal of a mathematical category.
  - The existence of `⊥` (bottom) pollutes the world of pure functional programming.

**3. It is Merely a Convenient Metaphor**

  - The Hask category is a convenient construction born from the desire to "explain programming with category theory."
  - In reality, it is just a forced fitting of the relationship between types and functions into the framework of category theory.

**4. Doubts about its Practicality**

  - Even if one were to accept the Hask category, it brings no value to the practice of programming.
  - On the contrary, clinging to an incomplete category-theoretic interpretation hinders a more intuitive set-theoretic understanding.

**Conclusion:**
The Hask category is mathematically incomplete and not practical. For understanding Functors and Monads in programming, it is healthier to use the straightforward framework of sets and functions. Category-theoretic ornamentation only adds non-essential complexity.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## Extending the "Natural Monoid" of Function Composition to the Container Level

  - Identity Law
  - Associativity


![Monoid structure of function composition](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745414533607.png)


Functors and Monads can be seen as mechanisms for extending this basic "monoid of composition" to the container level.

 

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745570291446.png)

  * A **Functor** **extends the existing "monoid of function composition" to the container level while preserving it**.
  * A **Monad** **constructs a new "monoid of composition for contextual functions" at the container level**.

:::

:::lang-ja
# 圏論（Category Theory）

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

このチャプターでは、**圏論（Category Theory）** を解説していますが、本書を読み進めるために、この章の内容の理解は必須ではありません。

その理由は、とりもなおさず、関数型プログラミングは、**集合論（Set Theory）** の範囲だけで構築されているので、圏論によるさらなる抽象化は必要としていないからです。（まさにその事実について本章では解説しています。）

しかし、圏論そのもの、あるいは圏論に関する概念または用語が関数型プログラミングの解説の文脈で頻出することは事実で不可避なので、「混乱しないために知っておくと必ず役立つだろう」というスタンスで解説しています。

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">



## 集合論（Set theory）はボトムアップ

前の章で確認した通り、集合論では、まず最初に要素を定義します。そしてその要素から集合を作り、さらにその集合を元にした集合を……というように、階層構造をボトムアップで構築していきます。
 
集合論のように目の前にある具体的な要素――プログラミングで言えば `1` や `2`、`"Hello"`、`true/false` といったデータ――から理論を積み上げていく手法は、素朴で直感的です。それらの集合として整数型や文字列型といった型（Type）が定義される、素朴なプログラミング言語の型理論そのものです。

関数型プログラミングはもちろん、依存型（Dependent type）のような高度な型システムにおいても、この集合論的なボトムアップのアプローチで十分に対応可能です。

物事は具体的なモノから構成されると考えるのが **「要素還元主義」** です。

## 圏論（Category theory）はトップダウン

しかし、理論が具体から離れて抽象へと進化するにつれ、かつて重要だと思われた個々の要素は、その本質的な重要性を失っていきます。真に本質的なのは、むしろ要素を収める「入れ物」が持つ入れ子構造、すなわち関係性そのものである、という考え方が生まれます。

このような考え方は **「構造主義」** と呼ばれ、物事の本質を関係性に求めるトップダウンのアプローチです。

圏論では、対象（Object）と射（Arrow）の2系統で定義するスタイルが主流ですが、これですらなお、Objectという「モノ」の存在を前提としています。

しかし、主流ではないもう一つのスタイルに **「Arrows-only定義」** があります。その名の通り、この世界に存在するものは **射（Arrow）** だけです。

では、Objectはどこへ行ったのでしょうか。Arrows-only定義では、射が自分自身を指し示す **「恒等射（Identity Arrow）」** という特別な形態を考え、これを **Objectと見なします**。

つまり、この純粋な圏論の世界観では、根源的に存在するのは**Arrowという関係性のみ**であり、Objectでさえも **「自分自身を示す」という特別な関係性** として定義されるのです。

---

## 集合論 vs 圏論

この論証の中心にあるのは、 **「世界の根源を、独立した『要素』や『実体』に求めるのか、それとも『関係性』や『構造』そのものに求めるのか」** という問いです。

この対立は、西洋哲学における「実体論（Substantialism）」と「関係論（Relationalism）」の対立として整理できます。

### 1. 数学的基礎：『実体』と『関係』の対比


#### **集合論：ボトムアップのアプローチ 🧱**

集合論は、まさしく**ボトムアップ**の世界観です。

1.  **要素が原点**: まず、世界の最小単位である **「要素（元）」** が存在します。
2.  **集合を構成**: 次に、その要素を集めて **「集合」** という「入れ物」を作ります。
3.  **関係が生まれる**: 集合と集合の間に「写像（関数）」などの **関係** が定義されます。

すべては個々の「モノ」から始まり、それらを組み立ててより大きな構造を作っていくという、非常に直感的で具体的なアプローチです。基礎から一つずつ積み上げていくイメージですね。

---

#### **圏論：トップダウンのアプローチ 🌐**

一方、圏論、特に「Arrows-only」の考え方は、完全な **トップダウン** です。

1.  **関係性が原点**: 世界の始まりには **「射（Arrow）」** しかありません。射は「何か」と「何か」をつなぐ関係性そのものです。
2.  **対象は後から定義される**: **「対象（Object）」** は、射の「始点」や「終点」として、あるいは何もしない射（恒等射）として、二次的に定義されます。つまり、対象は関係性の「結節点」のような存在にすぎません。
3.  **要素は存在しない**: 圏論の最も純粋な形では、「要素」という概念は必要ありません。対象の中に何が入っているかを問うのではなく、対象が他の対象とどのような関係（射）で結ばれているかだけが重要です。

これは、個々のモノの内部構造には立ち入らず、システム全体の構造やパターン、関係性そのものに注目する、非常に抽象的で大局的なアプローチと言えます。

---

この数学における根源的な視点の対立は、驚くほど普遍的な構造を持っており、西洋と東洋の思想にも同様のパラダイムとして見出すことができます。

### 2. 西洋思想：構造主義による「主体の解体」

次に、西欧の構造主義が、圏論と同様の思考様式を人間科学に持ち込んだことを見ます。構造主義が批判したのは、自律的な「個人（主体）」を世界の中心に据えるボトムアップ的な思想でした。

構造主義が示したのは、個人の意識や行動は、個人を超えた無意識的な **「構造」** によって規定されている、という事実です。言語において、単語の意味はそれ自体にあるのではなく、言語体系という「構造」の中での他の単語との**差異（関係性）**によって生じます。ここにおいて、「主体」は集合論の「要素」のような根源的実体ではなく、圏論の「対象」のように、言語や文化という巨大な**関係性のネットワーク**の中に位置づけられることでのみ意味を持つ、結節点のような存在へと「解体」されます。

### 3. 東洋思想：「空」と「縁起」における「実体の否定」

最後に、この関係主義的思考が、仏教思想、特に「空」の思想において、遥か昔から極めて洗練された形で展開されていたことを見ます。仏教が批判したのは、不変で独立した「自己（我）」や、事物に固有の「本質（自性）」を想定する実体論的な考え方でした。

* **縁起**: あらゆる事物は、単独で存在するのではなく、無数の原因や条件（＝**関係性**）が相互依存することで仮に成立している、という思想です。
* **空**: 上記の縁起の帰結として、あらゆる事物は、他との関係性を離れて独立して存在する「固有の本質」を持たない、とされます。空とは「無」ではなく、**「あらゆるものが関係性そのものである」** という積極的な真理を指します。

テーブルという「対象」は、「木材、設計図、大工…」といった無数の **関係性（縁起）の束** であり、関係を取り除けば「テーブル」という実体は消え去ります。これは、対象を射の束として捉える圏論の思想と驚くほど一致します。

### 結論

以上の論証から、この三つの思想潮流は、それぞれ異なる分野にありながら、共通のパラダイムシフトを内包していることが明らかです。

| 分野 | **ボトムアップ・実体論** | **トップダウン・関係論** |
| :--- | :--- | :--- |
| **数学** | **集合論**（要素が根源） | **圏論**（関係性が根源） |
| **西洋思想** | **実存主義・人間主義**（個人が根源） | **構造主義**（構造・関係性が根源） |
| **東洋思想** | **実体論（自性・我）** | **空・縁起**（相互依存・関係性が根源） |

これらはすべて、 **「世界は独立した『モノ』の集まりではなく、本質的に『関係性』の網の目である」** という、深遠な世界観の表明に他なりません。圏論は、この古代からの思想を、現代数学の言語で最も厳密かつ普遍的に表現したものと結論づけることができます。


## 圏論を構成する道具立てはArrowという関係だけ

圏論の主流の定義では、

- Objectというモノ
- Arrowという関係

の2系統定義

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752571465750.png)

加えて、Identit Arrowが自明に存在するとされる。

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752571672298.png)

しかし、Arrows-only定義では、

Object = Identity Arrow

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752571518656.png)

なので

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752571688664.png)


実際に、このArrows-only定義のほうが理論的にはシンプルで美しくエレガントになるし、最初に紹介したとおり、圏論とは構造主義的に関係性のみを追求する理論体系であることも純粋に表現できています。

## Object/Arrowの2系統の定義が主流

それでは、なぜArrows-only定義のほうではなく、Object/Arrowの2系統の定義が主流になっているのでしょうか？

結局のところ、これは **「公理的な美しさと最小性」と「教育的な分かりやすさと応用上の利便性」** のトレードオフです。

圏論は多くの数学者にとって「使うための道具」であるため、具体例との対応が分かりやすく、直感的に扱える主流の定義が圧倒的に広く採用されています。Arrows-only定義は、圏論の基礎をより深く探求する際に重要な、エレガントな代替案という位置づけです。

Arrows-only定義が主流になっていないのは、主流のObject/Arrow定義に比べて、**具体例（特に集合論）との対応が直感的でなく、教育的・実践的な観点から分かりにくいため**です。

---
### 主流定義が採用される理由

1.  **直感的な分かりやすさ（教育的配慮）** 🧠
    人間は「モノ（対象）」と、それらの「関係（射）」で物事を考えるのが自然です。主流の定義は、この直感に直接的に合致します。黒板に点を描き（対象）、それらを線で結ぶ（射）というイメージは、誰にとっても理解しやすいものです。創始者の一人であるマックレーンの名著『圏論の基礎』も、この主流の定義で書かれており、教育的な標準となっています。

2.  **具体例との対応付けの容易さ** 🔗
    圏論の力は、数学の様々な分野（集合論、群論、位相空間論など）に共通する構造を捉える点にあります。これらの分野では、研究対象となる「モノ」が明確に存在します。
    * **集合論**: 対象は**集合**、射は**写像**
    * **群論**: 対象は**群**、射は**準同型写像**
    * **位相空間論**: 対象は**位相空間**、射は**連続写像**

    主流の定義は、これらの具体例の「モノ」をそのまま「対象」に、「関係」をそのまま「射」に対応させられるため、応用する際に非常に便利です。Arrows-only定義では、まず「恒等写像」を見つけ出し、それを「集合」と見なす、という回りくどい解釈が必要になります。

3.  **歴史的な経緯** 📜
    圏論は元々、アイレンベルグとマックレーンが代数的位相幾何学の研究の中で、異なる数学的対象間の「関手」や「自然変換」を記述するために考案されました。彼らが扱っていたのは、まさに位相空間（対象）や連続写像（射）といった具体的なものであり、その構造を素直に一般化したのが主流の定義でした。Arrows-only定義は、その後に圏論の公理をいかに最小化できるか、という探求から生まれた、より抽象度の高い洗練された形式です。


それでは、主流のObject/Arrow定義に従って、圏論における「圏」の定義を見ていこう。

---
## 圏の定義

**圏（Category）** とは、**対象（Object）** の集まりと、その対象間の **射（Arrow）** の集まり、そして射の **合成（Composition）** が定められた数学的構造であり、以下の構成要素と公理によって定義されます。

### 圏の構成要素

1.  **対象の集まり**
    $A, B, C, \dots$ といった**対象**（Object）の集まり（クラス）。

2.  **射の集まり**
    $f, g, h, \dots$ といった**射**（Arrow）の集まり（クラス）。

3.  **ドメインとコドメイン**
    すべての射 $f$ には、その始点となる**ドメイン**（domain） `dom(f)` と、終点となる**コドメイン**（codomain） `cod(f)` と呼ばれる対象がそれぞれ一つずつ割り当てられています。`dom(f) = A` かつ `cod(f) = B` である射 `f` を、$f: A \to B$ と表記します。
    ある対象 $A$ から対象 $B$ へのすべての射の集まりを `Hom(A, B)` と表記することもあります。

4.  **合成**
    任意の2つの射 $f: A \to B$ と $g: B \to C$ （すなわち、`cod(f) = dom(g)` を満たすペア）に対して、その**合成**（composition）と呼ばれる射 $g \circ f: A \to C$ がただ一つ定まります。

---
### 圏の公理

上記の構成要素は、以下の2つの公理を満たさなければなりません。

1.  **結合法則 (Associativity)**
    合成が可能な任意の3つの射 $f: A \to B$, $g: B \to C$, $h: C \to D$ に対して、以下の等式が成り立ちます。

    $$h \circ (g \circ f) = (h \circ g) \circ f$$

2.  **単位法則 (Identity)**
    すべての対象 $A$ に対して、**恒等射**（identity Arrow）と呼ばれる特別な射 $id_A: A \to A$ がただ一つ存在し、任意の射 $f: A \to B$ と任意の射 $g: C \to A$ に対して、以下の等式が成り立ちます。
    
    $$f \circ id_A = f$$   
    
    $$id_A \circ g = g$$

以上の構成要素と公理を満たす体系が、圏として定義されます。



## 「集合の圏」の定義

「集合の圏」（Category of **Set**）とは、**集合** を対象とし、その集合間の **写像（関数）** を射とする数学的構造であり、以下の構成要素と公理によって定義されます。

### 「集合の圏」の構成要素

1.  **対象の集まり**
    $A, B, C, \dots$ といった、すべての**集合**。

2.  **射の集まり**
    $f, g, h, \dots$ といった、すべての**写像（関数）**。

3.  **ドメインとコドメイン**
    すべての写像 $f$ には、その定義域である**ドメイン**の集合 `dom(f)` と、値域である**コドメイン**の集合 `cod(f)` があります。`dom(f) = A` かつ `cod(f) = B` である写像 `f` を、$f: A \to B$ と表記します。

4.  **関数の合成**
    任意の2つの写像 $f: A \to B$ と $g: B \to C$ （すなわち、`f` のコドメインと `g` のドメインが一致するペア）に対して、その**関数の合成** $g \circ f: A \to C$ がただ一つ定まります。

---
### 「集合の圏」の公理

上記の構成要素は、以下の2つの公理を満たします。

1.  **結合法則 (Associativity)**
    合成が可能な任意の3つの写像 $f: A \to B$, $g: B \to C$, $h: C \to D$ に対して、以下の等式が成り立ちます。

    $$h \circ (g \circ f) = (h \circ g) \circ f$$

2.  **単位法則 (Identity)**
    すべての集合 $A$ に対して、**恒等写像** $id_A: A \to A$ （すべての要素 $x \in A$ を $x$ 自身に対応させる写像）がただ一つ存在し、任意の写像 $f: A \to B$ と任意の写像 $g: C \to A$ に対して、以下の等式が成り立ちます。

    $$f \circ id_A = f$$ 
    
    $$id_A \circ g = g$$

以上の通り、集合と写像の世界は、圏の公理を完全に満たす一つの具体的な圏を形成しています。

## Function Composition: A Natural Monoid

圏論の **「集合の圏」の定義** とは、すでに我々が前の章

**Function Composition: A Natural Monoid**

で確認した法則と寸分違わない同じものです。

![Monoid structure of function composition](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745414533607.png)




## 圏論の「圏」とは「集合の圏」を抽象化したもの

実は、圏論の公理（ルール）は、集合と写像（関数）が持つ性質を抽出・一般化して作られたものです。ですから、圏論の定義を「集合の圏 (Category of **Set**)」に具体化すると、私たちがよく知る集合論のルールにぴったりと収まるのは、当然の帰結と言えます。

具体的に、圏論の各要素が、集合の圏で何に対応するかを見てみましょう。

| 圏論の抽象的な概念 | 集合の圏 (**Set**) での具体的な対応物 |
| :--- | :--- |
| **対象 (Object)** | **集合** `A`, `B` |
| **射 (Arrow)** `f: A → B` | **写像（関数）** `f: A → B` |
| **恒等射 (Identity)** `id_A` | **恒等写像** `id_A(x) = x` |
| **合成 (Composition)** `∘` | **写像の合成** `∘` |

この対応関係をもとに、圏論の公理が集合と写像の世界でどのように成り立つかを確認します。

### 1. 単位法則 (Identity Law) の一致

圏論では、すべての対象 `A` に恒等射 `id_A` が存在し、任意の射 `f: A → B` に対して `f ∘ id_A = f` かつ `id_B ∘ f = f` であることを要請します。

これは集合と写像の世界で完璧に成り立ちます。
* すべての集合 `A` には、`id_A(x) = x` となる**恒等写像**が存在します。
* 写像 `f: A → B` と合成すると、任意の要素 `x ∈ A` に対して `(f ∘ id_A)(x) = f(id_A(x)) = f(x)` となり、元の写像 `f` と全く同じです。 `id_B ∘ f` も同様に `f` と一致します。

### 2. 結合法則 (Associativity) の一致

圏論では、合成 `g ∘ f` と `h ∘ g` が可能な任意の3つの射 `f, g, h` に対して、`(h ∘ g) ∘ f = h ∘ (g ∘ f)` であることを要請します。

これも写像の合成が持つ基本的な性質です。
* `f: A → B`, `g: B → C`, `h: C → D` という3つの写像を考えます。
* 任意の要素 `x ∈ A` を取ると、
    * 左辺は `((h ∘ g) ∘ f)(x) = (h ∘ g)(f(x)) = h(g(f(x)))`
    * 右辺は `(h ∘ (g ∘ f))(x) = h((g ∘ f)(x)) = h(g(f(x)))`
* 両者はすべての `x` について同じ結果を返すため、2つの合成写像は完全に等しくなります。

このように、圏論の抽象的な定義は、具体例である「集合の圏」に特殊化すると、集合論における写像の合成法則と寸分違わず対応します。圏論は、この集合と写像が作る構造を「骨格」だけ抜き出して、他の様々な数学的対象（例：ベクトル空間と線形写像、位相空間と連続写像など）にも当てはめられるように一般化したものなのです。


<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

### A category itself can be regarded as a sort of generalized monoid

圏論の創始者の一人であるソーンダース・マックレーンは、その独創的なテキスト『圏論の基礎』で次のように述べています。:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747107983842.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1747107790672.png)

*(Source: Saunders MacLane, Categories for the Working Mathematician, 2nd ed., p. 7)*

これは、圏論のまさにその基礎が、Monoidの概念（結合的な演算 + 単位元）の上に築かれていることを浮き彫りにしています。したがって、そこから導かれるファンクターやモナドのような主要な構成概念が、合成に内在するこの根源的なモノイド構造を尊重し、保存する方法で定義されるのは自然なことです。


<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">


## 集合論の枠組みだけで事足りる

関数型プログラミングで使われるFunctorやMonadは、確かに圏論由来の概念ですが、実際の実装や理解においては集合論の枠組みで十分事足ります。

---

**歴史的経緯：**
- 集合の圏**Set**では、対象が集合、射が関数
- これを抽象化して、対象と射の概念だけを残し、具体的な「要素」の概念を捨象したのが圏論

**抽象化の本質：**
- 集合の圏：集合 A, B があり、関数 f: A → B がある
- 一般の圏：対象 A, B があり、射 f: A → B がある
- 重要なのは射の合成と恒等射の存在で、「中身」は問わない

**この抽象化の意義：**
- 集合以外の数学的構造（位相空間、群、環など）も同じ枠組みで扱える
- 「構造を保つ写像」という概念を統一的に記述できる
- 関手や自然変換といった「構造間の関係」を論じられる

**実用的な観点から：**
- Functorは「コンテナ型に対する関数の持ち上げ」として理解できる（リストに対するmap操作など）
- Monadも「値の包装と連鎖的な計算」として扱える（Optional型での安全な計算連鎖など）
- 実際のプログラミングでは、型システムと関数合成の範囲で十分実用的

**圏論の抽象化が不要な理由：**
- プログラミング言語の型システムは基本的に集合の圏（**Set**）内で動作する
- 関手の自然変換、極限・余極限、トポスなどの高次の圏論的概念は、日常的なプログラミングでは直接必要ない
- アルゴリズムの実装や型安全性の確保において、より具体的な集合論的思考の方が実用的

**具体例：**
- ScalaのOption型、JavaのOptional、RustのOption型などは、すべて「値があるかないか」という集合論的な概念で理解できる
- リスト操作（map, filter, reduce）も、集合間の関数として直感的に把握できる

---

確かに圏論の知識は、なぜこれらの概念が「うまく動く」のかの理論的背景を理解するのに役立ちますが、それは教養的な価値にとどまり、実際のコードを書く上では必須ではありません。むしろ、集合と関数の合成という馴染みやすい概念で理解する方が、多くの開発者にとって実用的です。

だからこそ、関数型プログラミングでFunctorやMonadを使う際、集合の圏の直感で十分なのです。プログラミングの型システムは基本的に集合の圏内で動作するので、より抽象的な圏論の概念は「理論的背景」としては興味深いものの、実用上は必要ないということになります。

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

### Monadでクライスリの圏を使う！？

その反論に対しては、以下のように応答できます：

**1. クライスリ圏は構築物であって前提ではない**
- クライスリ圏は既存のMonadから**構築される**圏であり、Monadを定義するために必要な前提ではありません
- 実際、プログラミング言語ではまずMonadを基本操作で定義し、その後でクライスリ圏的な構造が見えてくる順序です

**2. 実装レベルでは集合論的操作**
- bind操作の実装は結局のところ、包装された型の値を受け取って別の包装された型の値を返す関数の合成です
- これは集合間の関数合成として理解でき、圏論的な射の合成を意識する必要はありません

**3. クライスリ圏は後付けの解釈**
- プログラマーは通常、「計算コンテキストを持つ値の連鎖」として理解します
- クライスリ圏での射の合成は、この直感的理解の数学的形式化に過ぎません

**4. 実用性の観点**
- 実際のエラーハンドリングや状態管理において、クライスリ圏の概念を知らなくても効果的にMonadを使えます
- デバッグやリファクタリングでも、型と関数合成の理解で十分です

**5. 具体例で考える**
- Maybe型での連鎖処理：値があれば次の計算を続行、なければ停止
- この動作は「安全な計算の連鎖」として直感的に理解でき、圏論的背景を知らなくても実装・利用できます

つまり、クライスリ圏は確かに存在しますが、それは「Monadの圏論的な*解釈*」であって、プログラミングにおけるMonadの*本質*ではない、と反論できるでしょう。


### HaskellのHask圏！？

Hask圏への反論については、「それは真の圏ではない」と批判できます：

**1. 圏の公理を満たさない**
- **結合律の破綻**：`undefined`や無限ループにより、射の合成が結合律を満たさない場合がある
- **恒等射の問題**：`seq`の存在により、真の恒等射が存在しない（正格性の問題）
- **無限型**：再帰的な型定義により、真の「対象」が明確に定義できない

**2. 実装上の妥協の産物**
- プログラミング言語の実装上の制約（メモリ、計算時間）により、数学的な圏の理想からかけ離れている
- `⊥`（bottom）の存在が、純粋な関数型の世界を汚染している

**3. 便宜的な比喩に過ぎない**
- Hask圏は「プログラミングを圏論で説明したい」という願望から生まれた便宜的な構築物
- 実際には、型と関数の関係を無理やり圏論の枠組みに当てはめただけ

**4. 実用性への疑問**
- 仮にHask圏を認めたとしても、それがプログラミングの実践に何の価値ももたらさない
- むしろ、不完全な圏論的解釈に固執することで、より直感的な集合論的理解が阻害される

**結論：**
Hask圏は数学的に不完全であり、実用的でもない。プログラミングにおけるFunctorやMonadの理解には、素直に集合と関数の枠組みを使う方が健全です。圏論的な装飾は、本質的でない複雑さを追加するだけです。

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

　　
## 関数の合成＝Natural Monoidをコンテナレベルに拡張する

- 単位法則 (Identity Law) 

- 結合法則 (Associativity) 


![Monoid structure of function composition](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745414533607.png)



　FunctorとMonadは、この基本的な「合成のモノイド」をコンテナレベルへと拡張する仕組みと見なせます。


![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745570291446.png)


* **Functor**は、既存の「関数の合成モノイド」を**保存したままコンテナレベルに拡張**します。
* **Monad**は、「文脈付き関数の合成」という**新しいモノイドをコンテナレベルに構築**します。



:::