:::lang-en

# Code Driven by Dependency Graph

So, what is this **Dependency Graph** we referred to?

In essence, it's a diagram that illustrates dependencies between various items. These graphs are built from two basic elements:

-   **Nodes:** These represent the fundamental **items** or distinct **entities** within the system being considered. They are the individual components or abstract elements of the structure.

-   **Edges (Arrows):** These lines or pathways illustrate the **relationships** or **interconnections** between nodes. The direction of an arrow typically indicates a **dependency** or flow, showing that one node relies on, or leads to, another.

## Dependency Graph (Order of Evaluation)

```
    Node1
   ↗    ↖
Node2   Node3
```

In this diagram, the **arrows (↗ and ↖)** illustrate **dependencies**:

-   The arrow from `Node2` points to `Node1`.
-   The arrow from `Node3` points to `Node1`.

This means `Node1` **depends on** `Node2` and `Node3`. In other words, `Node2` and `Node3` are **prerequisites** for `Node1`.

So, the arrows effectively show the **order of evaluation**:

1.  `Node2` and `Node3` (**prerequisites**)
2.  `Node1` (**depends on the prerequisites**)

Dependency graphs are all about representing these kinds of directional relationships. Technically, these are known as **Directed Graphs** (or **Digraphs**). The arrows are crucial because they explicitly show the direction of dependency. So, fundamentally, a dependency graph is a type of directed graph.

## The Role of Operator Precedence and Parentheses

-   **Operator Precedence (e.g., `*` has higher precedence than `+`):**

    -   Operators with higher precedence need to be computed "earlier" or, in graph terms, are often "lower" or "deeper" in the dependency structure, meaning their results are needed by operations with lower precedence.
    -   For example, in the expression `a + b * c`, the `b * c` part must be calculated first.
    -   In the dependency graph, edges would be drawn from `b` and `c` to a `*` (multiplication) node.
    -   Then, edges would be drawn from `a` and the output of the `*` node to a `+` (addition) node.
    -   This structure naturally represents that the multiplication must occur before the addition because the result of the multiplication is a dependency for the addition.

    ```
         +
       ↗   ↖
      a      *
           ↗   ↖
          b      c
    ```

    In this graph, the `+` node cannot be evaluated until the `*` node has produced its result, thus enforcing that `b*c` is computed first.

-   **Parentheses `()`:**

    -   **Parentheses explicitly override the natural operator precedence**, forcing the sub-expression within them to be calculated first.
    -   In a dependency graph, the sub-expression enclosed in parentheses forms a distinct sub-graph. The result of this sub-graph's computation then becomes a single input (a dependency) for an operator outside the parentheses.
    -   For example, in the expression `(a + b) * c`, `a + b` must be calculated first.
    -   In the dependency graph, edges would be drawn from `a` and `b` to a `+` (addition) node.
    -   Then, edges would be drawn from the output of this `+` node and from `c` to a `*` (multiplication) node.

    ```
          *
        ↗   ↖
       +      c
     ↗  ↖
    a     b

    ```

    Here, the result of the `+` node (representing the parenthesized sub-expression `a+b`) becomes an input for the `*` node, ensuring `(a+b)` is evaluated first.

**In Summary:**

Parentheses and operator precedence are essentially the rules for constructing the dependency graph for an expression:

-   **Operator precedence** implicitly determines which operations (nodes) depend on the results of which other operations, forming the basic branching structure of the graph.
-   **Parentheses** explicitly group certain sub-expressions, forcing them to be evaluated as a single unit whose result (the output of a sub-graph) then feeds into other operations.

The resulting dependency graph (often a tree structure for expressions, known as an "expression tree" or "Abstract Syntax Tree" - AST) uniquely represents the necessary order of evaluation for the expression. A node in this graph can only be "evaluated" (its operation performed) once all its input dependencies (nodes pointing to it) have been resolved.

This is how the dependency graph naturally embodies the structure and evaluation order defined by parentheses and operator precedence.

:::