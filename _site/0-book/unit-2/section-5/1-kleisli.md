:::lang-en
# The Kleisli Arrow

## A Peculiar Kind of Function

Regular functions map values to values:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745714141212.png)

However, there exists a special class of functions that have an intriguing characteristic - they produce their output wrapped in a container type:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745714186810.png)

These functions, known as **Kleisli arrows** (or **monadic functions**), possess a remarkable capability: they can determine the structure of their output container internally. This distinguishes them from regular functions, as they don't just compute values - they also define how those values should be organized within a container context.

**While the universal function type `'a -> 'b` can theoretically express any function (including these container-producing ones), there are compelling reasons to treat Kleisli arrows as a distinct category.** Their unique power to shape container structures from within the function itself provides a key insight into understanding Monads, which we'll explore next.
:::