# 3. Iteration

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744474702812.png)

**Iteration** (also known as looping or repetition) allows programs to execute a block of code multiple times. This is essential for processing collections of data (like lists or arrays) or repeating a task until a condition is met.

Let's compare how imperative and functional styles handle a common iteration task: calculating the sum of numbers in a list.

## The Imperative Way: Explicit Loops

#### What is the sum of the integers from  $0$  to  $5$ ?

$$
0 +1 + 2 + 3 + 4 + 5
$$

The most important thing to understand is that this is a  **straightforward calculation** .

However, in Imperative Programming, solving such problems often involves  **designing loops with ever-changing variables** . This can lead to complexities that obscure the problem's essence and increase the risk of introducing bugs.

Accustomed to the conventions of Imperative Programming, many programmers typically employ a  `for`  loop to solve this problem. Inside the loop, code often accesses elements one by one and updates state, such as an accumulator variable.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/javascript.svg">

```js
let sum = 0;
for (let i = 0; i <= 5; i++) {
    sum += i;
}
console.log(sum); // 15
```

In this imperative style:

-   We use an explicit `for` loop with a counter (`i`) that increments from 0 up to 5.
-   We use a mutable variable (`sum`) initialized to 0 and update it in each iteration by adding the current value of `i`.
-   The logic describes the step-by-step process of initializing state, looping with a condition, and accumulating a result.

After all, Imperative Programming is an approach to consider the flow of the code.

## The Functional Way: Higher-Order Functions and Pipelines

On the other hand, Functional Programming is an approach to consider the expressions of Mathematics.

The calculation for this problem proceeds as follows.

$$
\begin{gather*}
((((0 +1) + 2) + 3) + 4) + 5
\\
(((1 + 2) + 3) + 4) + 5
\\
((3 + 3) + 4) + 5
\\
(6 + 4) + 5
\\
10 + 5
\\
15
\end{gather*}
$$

The adequate operation that is capable of calculating this structure is called [Fold (higher-order function)](https://en.wikipedia.org/wiki/Fold_(higher-order_function))

> In [Functional Programming](https://en.wikipedia.org/wiki/Functional_programming "Functional Programming"), **fold** (also termed **reduce**, **accumulate**, **aggregate**, **compress**, or **inject**) refers to a family of [higher-order functions](https://en.wikipedia.org/wiki/Higher-order_function "Higher-order function") that [analyze](https://en.wikipedia.org/wiki/Analysis "Analysis") a [recursive](https://en.wikipedia.org/wiki/Recursive_data_type "Recursive data type") data structure and through use of a given combining operation, recombine the results of [recursively](https://en.wikipedia.org/wiki/Recursion "Recursion") processing its constituent parts, building up a return value.

Functional programming often avoids explicit loops and mutable state for iteration. Instead, it relies on **higher-order functions** (functions that operate on other functions or collections) like `map`, `filter`, and `fold` (or `reduce`/`sum`). These are often combined in pipelines.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744867612924.png)

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let reducer = List.reduce (+)
let sum = [0;1;2;3;4;5] |> reducer
printfn "%d" sum // 15
```

In JavaScript,

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/javascript.svg">

```js
let plus = (a,b) => a + b;
let sum = [0,1,2,3,4,5].reduce(plus);
console.log(sum); // 15
```

In this functional style:

-   We define the collection of numbers (`[0;1;2;3;4;5]` or `[0,1,2,3,4;5]`) explicitly first.
-   We use a higher-order function (`List.reduce` in F#, `.reduce` in JS) along with a combining function (`+` or `plus`) to aggregate the elements of the collection.
-   In F#, the pipeline operator (`|>`) is used to pass the list into the `reducer` function.
-   The entire aggregation is often expressed declaratively, focusing on *what* operation to apply to the collection, rather than the step-by-step looping mechanism.
-   Explicit loop counters and user-declared mutable accumulator variables are avoided.

But what if we don't want to define the collection of numbers manually like this? Functional programming provides ways to generate sequences programmatically.

### Generating the Input Sequence

Instead of writing out `[0;1;2;3;4;5]` by hand, we can generate it. Here are a couple of functional approaches:

**1. Using List.unfold:**

Another functional approach to generate a sequence is using the `List.unfold` function. This function builds a list from an initial state by repeatedly applying a *generator function*. The generator function takes the current state and decides whether to produce the next element of the list (along with the next state) or to stop the generation.

$$
\begin{gather*}
0
\\
0 ~ ~1
\\
0 ~ ~1 ~ ~ 2
\\
0 ~ ~ 1 ~ ~ 2 ~ ~ 3
\\
0 ~ ~ 1 ~ ~ 2 ~ ~ 3 ~ ~ 4
\\
0 ~ ~ 1 ~ ~ 2 ~ ~ 3 ~ ~ 4 ~ ~ 5
\end{gather*}
$$

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Generator function: takes current state, returns Option<(value_to_yield, next_state)>
let generator (state: int) =
    if state < 6 then
        // If state is less than 6, yield 'state' and the next state is 'state + 1'
        Some (state, state + 1)
    else
        // If state is 6 or more, stop generation
        None

// Initial state
let initialState = 0

// Generate the list using List.unfold
let generatedListUsingUnfold = List.unfold generator initialState
// generatedListUsingUnfold is now [0; 1; 2; 3; 4; 5]

printfn "List generated using List.unfold: %A" generatedListUsingUnfold
// Output: List generated using List.unfold: [0; 1; 2; 3; 4; 5]
```

**2. Using Infinite Sequences (Lazy Evaluation):**

A common F# approach involves potentially infinite sequences, which are evaluated lazily (only generating values as needed). We can define an infinite sequence and then take only the elements we require.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744868359390.png)

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// 1. Define the infinite sequence of natural numbers
// 'naturalNumbers' holds the definition (0, 1, 2...) but doesn't compute them all yet.
let naturalNumbers: seq<int> = Seq.initInfinite id

// 2. Take the first 6 elements and convert to a list
let firstSixList: list<int> =
    naturalNumbers      // Start with the infinite sequence
    |> Seq.take 6       // Lazily take the first 6 -> seq<int> { 0; 1; 2; 3; 4; 5 }
    |> Seq.toList       // Convert the finite sequence to a list -> [0; 1; 2; 3; 4; 5]

// 3. Now 'firstSixList' can be used, e.g., piped into the reducer
let sumFromGeneratedList = firstSixList |> List.reduce (+)

printfn "Generated List: %A" firstSixList
printfn "Sum from generated list: %d" sumFromGeneratedList

(*
Execution result:
Generated List: [0; 1; 2; 3; 4; 5]
Sum from generated list: 15
*)
```

This demonstrates how functional programming allows generating the data needed for an operation, often combining sequence generation and processing within a pipeline, avoiding manual collection definitions or imperative loops.

## Summary

Both styles achieve the same result for iteration over a collection.

-   The **imperative style** uses explicit **loops** (like `for`) and often manages state with **mutable variables** (like `sum` and the loop counter `i`).

-   The **functional style** uses **higher-order functions** (like `map`, `sum`, `filter`, `fold`) combined in **pipelines** to declaratively process collections, often avoiding explicit loops and mutable state. It also provides powerful ways to **generate** the data sequences needed.