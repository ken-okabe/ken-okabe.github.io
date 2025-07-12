---
title: How to Drive Your Code?
description: >-
  To get a computer to do any work, we need to give it "instructions." There are
  several fundamental ways of thinking about, or "styles" for, how we write
  these instructions—in other words, how we "drive the code." Let's get a feel
  for the "driving style" of two representative approaches: Imperative Code and
  Functional Code.
---
To get a computer to do any work, we need to give it "instructions." There are several fundamental ways of thinking about, or "styles" for, how we write these instructions—in other words, how we "drive the code." Let's get a feel for the "driving style" of two representative approaches: Imperative Code and Functional Code.

## Imperative Code

Imperative code is like a cooking recipe; it's a style where you instruct the computer step-by-step: "Do this, then do this, then do that..."

-   Step-by-Step is Fundamental:

    Code is basically executed line by line, in order, from top to bottom as it's physically written. The computer faithfully follows this flow of instructions, telling it what to do next.

-   Control Flow:

    Just flowing from top to bottom isn't enough for complex tasks. So, there are mechanisms to control this flow:

    -   **Conditional Branches:** These allow the computer to choose which instructions to execute based on certain conditions, like "If X is true, do task A; otherwise, do task B." In programming languages, `if` statements handle this.
    -   **Loops:** These allow a specific block of instructions to be executed repeatedly, such as "Repeat task Y 10 times," or "Keep doing task Z until condition Q is met." Programming languages use constructs like `for` and `while` loops for this.

In imperative code, you describe the series of actions you want the computer to perform by combining sequential execution, conditional branches, and loops. A key characteristic is achieving goals by changing "state" (for example, by reassigning values to variables) over time.

## Functional Code

Functional code has a different flavor compared to imperative code. Rather than giving detailed step-by-step instructions on "how to do it," it's a style that focuses on defining "what should be computed from what" using relationships, much like mathematical functions.

-   Computation Defined by Expressions:

    The core of functional code is the "expression." The entire computation is constructed from relationships: which expression needs to be evaluated to obtain a certain value, and on which other values or results of other expressions does that expression, in turn, depend.

-   Order of Computation is Determined by Dependencies:

    The physical order in which code is written doesn't necessarily dictate the direct order of execution. Instead, if the result of computation A is needed for computation B, then computation A naturally needs to happen before computation B. The order of computation is naturally determined by these dependencies.

If we represent this relationship of "what depends on what" as a diagram, it takes the form of a **"Dependency Graph,"** which we will look at in detail in the next chapter.
