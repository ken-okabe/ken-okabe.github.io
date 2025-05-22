# Higher-Order Functions (HOF)

Building on the idea that functions are first-class values, we can now explore a powerful consequence: Higher-Order Functions (HOFs). These are functions that operate on other functions, either by taking them as input or returning them as output. This section introduces the basic patterns of HOFs.

## The 3 Basic Higher-Order Function (HOF) Patterns

As we just discussed, the core idea of First-Class Functions means we can:

-   Pass functions _into_ other functions as arguments.

-   Have functions _return_ new functions as their result.

These two capabilities define what makes a function a Higher-Order Function (HOF). We can visualize the basic patterns that emerge from this definition using the following diagram:

![img](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744564785396.png)

Let's break down these patterns based on the definition:

1.  **`Value |> Function = Function`**

Returns a Function as its output.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745695953633.png)

2.  **`Function |> Function = Value`**

Takes a Function as input.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745695880762.png)

3.  **`Function |> Function = Function`**

Takes and Returns a Function as input and also returns a function as output.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745695992437.png)

These three patterns illustrate the fundamental ways functions can be used as first-class values, enabling the powerful techniques found in functional programming.