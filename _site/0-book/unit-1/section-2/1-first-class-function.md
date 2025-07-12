:::lang-en

# First-Class Functions

We've established that mathematical expressions and functional pipelines both evaluate to **values**, which are the same concept as **data** in programming. This aligns closely with basic arithmetic and algebra. Now, let's consider the status of _functions_ themselves. This section explores that fundamental concept: First-Class Functions.

## Functions as Values: Extending the Mathematical View

**The Foundation: Functions in School Math**

In typical school math, functions (like `f(x) = x * 2 + 1`) are primarily understood as **rules**, **processes**, or **mappings**. They represent a way to get an output value (`f(x)`) from an input value (`x`). We learn to evaluate them, graph them, and use them in equations. Functions are the tools we _apply_.

**The Extension: Functions as Values in Functional Programming**

Functional programming builds upon this foundation by introducing a powerful extension: the idea that _**functions themselves are values**_, just like numbers or strings. They become  **"first-class citizens."

While this might be a new way of thinking compared to the typical school math perspective, it's a natural evolution within the mathematical thinking embraced by FP.

## The Core Idea: Functions are Values (First-Class Functions)

Perhaps the most central concept is that **functions are treated as regular values**, just like numbers (e.g., `5`), strings (e.g., `"hello"`), or lists. They are not special second-class citizens.

The ability for functions to be defined by expressions and treated as **values** is a key feature of functional **languages** and the minimum requirement for a language to be functional. Mastering this feature unlocks the potential power of functional programming.

-   Pass functions _into_ other functions as arguments.

-   Have functions _return_ new functions as their result.

Understanding this concept – that functions can be treated as data – is the crucial next step. It allows us to fully explore the power of functional programming, starting with a proper introduction to **First-Class Functions** in the following sections.

:::