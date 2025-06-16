# Applicative Functor Laws For Us

At first glance, checking whether your code satisfies these Applicative Functor Laws might seem extremely cumbersome and impractical for programmers to verify against their own implementations.

However, we are extremely fortunate that the reality is quite the opposite.

**Comparing the three major functional programming abstractions:**

* **Functor Laws**: Abstract properties like `map id = id` and `map (f >> g) = map f >> map g` that produce subtle bugs when violated
* **Monad Laws**: Concepts involving left/right identity and associativity that require deep understanding of computation chains  
* **Applicative Laws**: Simply asking the intuitive question *"Are the inputs independent?"*

**Why Applicative is remarkably simple:**

1. **Aligns with real-world intuition**:  *"Can these run in parallel?"*  is universally understandable
2. **Automatic correctness**: Maintaining independence naturally ensures law compliance
3. **Practical verification**: The laws validate your intuition rather than impose arbitrary constraints

For beginners, being able to create mathematically correct Applicative Functors by simply answering *"Can these two processes execute simultaneously?"* makes this the most approachable concept in functional programming.

This approach allows learners to start with intuitive parallel processing concepts rather than memorizing complex mathematical laws!

## The Secret Behind This "Magical" Alignment

**Here's the fascinating truth that most textbooks don't emphasize:**

> The Applicative Laws weren't discovered first—they were **intentionally reverse-engineered** to mathematically formalize the concept of "independent computations."

**This is rarely explained clearly in educational materials**, which typically present the laws as fundamental mathematical truths rather than revealing their practical origins. Understanding this historical context transforms how we think about functional programming abstractions.

### The Historical Development (The Real Story)

**1. First, programmers faced concrete problems:**

```fsharp
// We wanted to combine multiple independent computations
let validateUser = map3 (fun n e a -> {Name = n; Email = e; Age = a}) name email age
let parseExpression = map3 (fun op1 operator op2 -> Expression(op1, operator, op2)) 
                           parseOperand parseOperator parseOperand
```

**2. Pattern recognition emerged:**
Mathematicians and programmers noticed the recurring pattern of "combining independent computations" across different domains—validation, parsing, parallel processing, optional values.

**3. Laws were reverse-engineered:**
The Applicative Laws were then **intentionally crafted as a mathematical specification** to capture this intuitive notion of independence. This is the crucial insight that most educational materials gloss over—the laws didn't emerge from abstract mathematical exploration, but were deliberately designed to formalize a practical programming pattern.

### Historical Evidence Supporting This View

**Direct evidence from the original McBride-Paterson paper (2008):**

The authors explicitly state their methodology: *"We begin by considering the ubiquity of this programming pattern"* and describe how they *"capture the essence of these computations"* through formal abstraction. This confirms that practical patterns preceded mathematical formalization.

**Pattern-to-formalization timeline:**

1. **Existing practice**: Programmers were already writing `map2`, `map3` functions for independent computations
2. **Pattern recognition**: McBride and Paterson observed this recurring pattern across different contexts
3. **Mathematical formalization**: The Applicative laws were crafted to capture what made these patterns work correctly

This historical sequence supports the reverse-engineering interpretation: the laws were designed to formalize existing successful practice, not derived from abstract mathematical principles.

### Why This Historical Context Matters

**Most functional programming textbooks present the story backwards:**

- They start with mathematical laws as "fundamental truths"
- Then show how these apply to practical problems
- **But this hides the fact that the practical problems came first**

**The reality:** Programmers were already solving independent computation problems, and mathematicians created the laws to capture what made those solutions work so well.

### Evidence: How Each Law Encodes Independence

**Identity Law**: `x |> apply (ID id) = x`
→ *"Doing nothing to an independent computation doesn't interfere with it"*

**Homomorphism**: `ID x |> apply (ID f) = ID (f x)`  
→ *"Pure values are completely independent—no container interference"*

**Interchange**: `ID y |> apply f = f |> apply (ID (fun g -> g y))`
→ *"Independent computations can be reordered without changing results"*

**Composition**: `x |> apply f |> apply g = x |> apply (ID (>>) |> apply g |> apply f)`
→ *"Independent computations follow associativity—grouping doesn't matter"*

### The Causality Correction (Often Misunderstood)

**The common misconception in textbooks:**

```
Independence → Applicative Laws  ❌ (suggests laws are fundamental)
```

**The actual historical relationship:**

```
Applicative Laws ← Independence  ✅ (laws formalize existing practice)
```

**The Applicative Laws are essentially a mathematical "specification" of what independence means in computational contexts.**

This reverse-engineering approach explains why the alignment feels "magical"—it's not coincidence, it's **intentional design**.

### Addressing Potential Criticism of the "Reverse-Engineering" Claim

**Some might argue**: "Isn't 'pattern abstraction' different from 'reverse-engineering'?"

**Response**: These terms describe the same fundamental process from different perspectives:

- **Pattern abstraction** (academic terminology): Identifying common structures and formalizing them
- **Reverse-engineering** (engineering terminology): Working backwards from successful implementations to understand underlying principles

**The key insight remains unchanged**: The Applicative Laws were not discovered through pure mathematical exploration, but were deliberately designed to capture why certain programming patterns worked so well in practice. This design-by-constraint approach explains why following independence intuition naturally leads to law compliance.

## Practical Note: Independence Naturally Ensures Law Compliance

**Corrected Key Insight**: If you implement `map2: ('a -> 'b -> 'c) -> F<'a> -> F<'b> -> F<'c>` such that the inputs `'a` and `'b` are treated as truly independent, then your implementation naturally satisfies the Applicative Laws—because the laws were specifically designed to capture this independence property.

### Why Independence Naturally Leads to Law Compliance

**1. Mathematical Foundation**

The Applicative Laws aren't arbitrary mathematical constraints—they're the **formal mathematical expression** of what we intuitively mean by "independent parallel computations."

**2. Independence Properties That Naturally Align with Laws**

```fsharp
// Independent implementation characteristics:
let map2 f fa fb = 
    // ✓ fa and fb are computed independently
    // ✓ Neither computation depends on the other's result
    // ✓ f combines results without side-effects on the containers
    // ✓ Order of evaluation doesn't matter
    // ✓ Container semantics are preserved consistently
```

**3. Natural Law Satisfaction**

- **Identity Law**: Independence means applying identity doesn't interfere with container structure
- **Homomorphism**: Pure values have no dependencies, so lifting and applying naturally commute  
- **Interchange**: Independent computations can naturally be reordered
- **Composition**: Function composition works naturally because no computation affects another's execution

**4. Practical Examples of True Independence**

```fsharp
// ✓ INDEPENDENT - Both validations run separately
let validateUser name email = 
    map2 (fun n e -> {Name = n; Email = e}) 
         (validateName name) 
         (validateEmail email)

// ✗ DEPENDENT - Second computation uses first's result  
let badExample x = 
    x |> bind (fun a -> (computeFrom a) |> map (fun b -> a + b))
    // This requires Monad, not Applicative!
```

**5. The Design Principle Revealed**

> *"The Applicative Laws were crafted to ensure that if you can conceptually execute both computations in parallel without any information flow between them, your implementation will be mathematically well-behaved."*

**6. Verification Strategy**

Instead of manually checking all four laws, ask yourself:

- Can `fa` and `fb` be computed simultaneously?
- Does neither computation need the other's result?
- Does `f` only combine final results without affecting container behavior?
- Are the container semantics preserved consistently?

**If yes to all, your implementation naturally aligns with the Applicative Laws—because that's exactly what they were designed to formalize.**

### Important Caveats for Mathematical Rigor

**1. Independence Must Include Container Semantics**

True independence means respecting the container's behavior:

```fsharp
// ✓ Correct Option Applicative - respects Maybe semantics
let apply fo xo = 
    match fo, xo with
    | Some f, Some x -> Some (f x)
    | _ -> None

let map2 f fa fb = ID f |> apply fa |> apply fb

// ✗ Violates container semantics despite value independence
let badMap2 f fa fb = 
    match fa with
    | Some a -> match fb with 
                | Some b -> Some (f a b) 
                | None -> Some (f a defaultValue)  // ❌ breaks Maybe semantics
    | None -> None
```

**2. Context-Dependent Complexity**

For some types (`IO`, `Parser`, `State`), determining true independence requires deeper analysis of the computational context.

**3. Laws as Formal Verification Tools**

While independence is an excellent design heuristic, the formal Applicative Laws serve as rigorous verification tools for edge cases and complex scenarios.

## The Beautiful Truth

**Why "Independent Operations = Applicative scope" works so well:**

This isn't just a useful heuristic—it's a fundamental principle that reflects how functional programming abstractions evolved. The mathematical formalism followed practical intuition, not the other way around.

The Applicative Laws are essentially asking: *"Does your implementation respect what we mathematically mean by independent computations?"*

This is why functional programming feels so natural once you grasp it—the abstractions were built to formalize concepts that already made intuitive sense to programmers dealing with real-world problems.

**For beginners**: You can trust your intuition about independence because the entire mathematical framework was designed to support and validate that intuition. The laws aren't arbitrary constraints—they're the mathematical expression of what independence means in computational contexts.