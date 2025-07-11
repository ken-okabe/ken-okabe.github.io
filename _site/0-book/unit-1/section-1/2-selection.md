:::lang-en

# 2. Selection

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744474652773.png)

**Selection** (also known as branching or conditional logic) is a fundamental concept in programming. It allows programs to make decisions and execute different code paths based on whether certain conditions are true or false.

Let's compare how imperative and functional styles typically handle selection, using a simple example of assigning a grade based on a score.

## The Imperative Way: `if/else` Statements

In imperative programming, selection is commonly handled using `if`, `else if`, and `else` **statements**. These statements control which block of code (a sequence of commands) is executed. Often, this involves assigning a value to a variable within the chosen block.

Here's a JavaScript example:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/javascript.svg">

```js
// Function to determine a letter grade based on a numeric score
function getGrade(score) {
  let grade;

  // Use if/else if/else statements to check conditions sequentially
  if (score >= 90) {
    grade = 'A';
  } else if (score >= 80) {
    grade = 'B';
  } else if (score >= 70) {
    grade = 'C';
  } else {
    grade = 'F';
  }
  // Return the final value assigned to the grade variable
  return grade;
}

console.log(`Score 92 gets grade: ${getGrade(92)}`);
// Output: Score 92 gets grade: A
console.log(`Score 75 gets grade: ${getGrade(75)}`);
// Output: Score 75 gets grade: C
```

In this imperative style:

-   We use statements (`if`, `else if`, `else`) to direct the flow.

-   We use a mutable variable (`grade`) which gets assigned a value inside the appropriate block.

-   The function executes a sequence of checks and assignments.

## The Functional Way: Expressions and Pattern Matching

Functional programming often favors using **expressions** that evaluate directly to a value, rather than statements that perform actions. For selection, this can involve `if-then-else` _expressions_ or, more powerfully in languages like F#, **pattern matching** (`match` expressions).

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744476075754.png)

Here's how the same logic might look in F#:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Function to determine grade based on score using a match expression
let getGrade score =
    match score with // Match the input 'score' against patterns/conditions
    | s when s >= 90 -> 'A'
    | s when s >= 80 -> 'B'
    | s when s >= 70 -> 'C'
    | _ -> 'F'

// The entire 'match' expression returns a single value ('A', 'B', 'C', or 'F')

printfn "Score 92 gets grade: %c" (getGrade 92)
// Output: Score 92 gets grade: A
printfn "Score 75 gets grade: %c" (getGrade 75)
// Output: Score 75 gets grade: C
```

In this functional style (using `match`):

-   The `match` construct is a single **expression** that evaluates to a result.

-   It checks the input (`score`) against several cases (`|`). The `when` keyword adds conditions (guards).

-   The code associated with the first matching case (`-> 'A'`, `-> 'B'`, etc.) provides the result of the entire `match` expression.

-   There's no need for intermediate mutable variables like `grade` for assignment; the expression _is_ the value. This resembles mathematical case definitions.

Alternatively, F# also supports `if-then-else` as an _expression_ that evaluates to a value:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// Function to determine grade using if-then-else expressions
let getGrade score =
    if score >= 90 then 'A'
    else if score >= 80 then 'B'
    else if score >= 70 then 'C'
    else 'F' // The final 'else' provides the value for the last condition
```

Notice that, similar to `match`, the entire `if-then-else` structure here is a single expression. Each branch (`then` or `else`) provides a value, and the value from the executed branch becomes the result of the whole expression. Again, no intermediate mutable variable is needed.

## Summary

Both styles achieve conditional logic.

-   The **imperative style** typically uses control flow **statements** (`if/else`) to execute different blocks of code, often involving assignments to mutable variables.

-   The **functional style** often uses conditional **expressions** (like F#'s `match` or `if-then-else expressions`) that directly evaluate to a result based on the input, avoiding intermediate assignments and aligning closely with mathematical definitions.

:::