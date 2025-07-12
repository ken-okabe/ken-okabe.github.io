---
title: Lifting Binary Operations into Containers
description: 'map2 has the following type signature:'
---
## `map2` as an Algebraic Structure

`map2` has the following type signature:

```fsharp
map2: ('a -> 'b -> 'c) -> F<'a> -> F<'b> -> F<'c>
```

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749874545899.png)

Recall that a function of the form `('a -> 'b -> 'c)` represents a **binary operation**.

The definition `let multiply x y = x * y` is essentially convenient syntax for:
<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let multiply = fun x -> (fun y -> x * y)
// Type: int -> (int -> int)
//    or int -> int -> int
```

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745147539756.png)

In other words, `map2: ('a -> 'b -> 'c) -> F<'a> -> F<'b> -> F<'c>`

is a function that can transform "any binary operation"

`'a * 'b = 'c`

into a binary operation in the world of containers:

`F<'a> * F<'b> = F<'c>`

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749875872398.png)

Here, the pair `(F, *)` defines an algebraic structure.

## Parallel Computing/Concurrency

The binary operation between containers `(F, *)` resulting from `map2` can represent any binary operation.

Because it can represent any binary operation, it is possible for the containers of `'a` and `'b` to be completely independent.

In other words, if you think of the binary operation between containers `(F, *)` as an "aggregation task," the source data containers `'a` and `'b` are completely independent, so **parallel computing is possible.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749878635851.png)

## Classification System of Implementation Patterns

Of course, since `map2` can represent any binary operation, there are also cases where the containers are not independent, but dependent on each other.

### First Branch: Classification by Dependency

All `map2` implementations can be broadly classified into two major categories based on computational dependency:

1. **Independent / Parallelizable**: The two containers are independent of each other
2. **Dependent / Sequential Processing Required**: The result of one computation affects the other
