:::lang-en
# Container Types: Sets in Programming

In this chapter, we will explore  **container types**  - a fundamental concept in functional programming that builds upon our understanding of sets.

## Sets as Container Types

The sets we have been studying in mathematics are typically called **container types** in functional programming languages.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745562787732.png)

For example, a List is a container type that can hold multiple values:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// List of numbers
[1; 2; 3; 4; 5]

// List of strings
["apple"; "banana"; "cherry"]

// Nested lists (lists containing lists)
[[1; 2]; [3; 4]; [5; 6]]
```

The type declaration shows how Lists are generic containers:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745567340502.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745570291446.png)

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

***The above is merely a conceptual illustration of container types, so please keep that in mind.***

Come to think of it, types like Int and String are themselves sets - Int is a set of numbers like 1, 2, 3..., and String is a set of text strings. So even these basic types could be considered container types.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
   // Sets are collections:
   type Numbers = int        // The set of all integers
   type Strings = string    // The set of all possible strings
   type Booleans = bool     // The set {true, false}
   ```

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745564518303.png)

Everything is relative -  **a container type is nothing more than a "set of something".**

Since List type is the most intuitive image of a Set, for convenience, it's good to start by understanding that List type is the representative example of container types.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">
:::