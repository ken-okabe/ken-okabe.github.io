:::lang-en

# Associativity: Building Robust Structures

This chapter lays the groundwork for understanding Monoids by exploring a fundamental property of **binary operations** that underpins this algebraic structure: **Associativity**. This property, where the grouping of operations doesn't affect the outcome, helps us build systems that are robust and predictable – where things "just connect and work" without surprises.

## Associativity: When Grouping Doesn't Matter

Consider combining three numbers with a **binary operation** like addition or multiplication:

`(1 + 2) + 3 = 1 + (2 + 3)`

`(1 × 2) × 3 = 1 × (2 × 3)`

For the binary operations of addition (`+`) and multiplication (`*`) on numbers, the way we group the operations using parentheses doesn't change the final result. This property is called **associativity**.

However, other binary operations like subtraction (`-`) and division (`/`) do *not* have this property:

`(10 - 5) - 2 ≠ 10 - (5 - 2)`

`(16 ÷ 4) ÷ 2 ≠ 16 ÷ (4 ÷ 2)`

Subtraction and division are **non-associative**. The order in which you perform these binary operations (how you group them) drastically changes the outcome.

## The Power of Predictability: Why Associativity is Desirable

Consider **LEGO blocks**.

If you have three blocks A, B, and C, and the binary operation is "joining two blocks", you can join them in different orders:

-   Join A and B first (A • B), then join with C: (A • B) • C

-   Join B and C first (B • C), then join with A: A • (B • C)

The beauty is that no matter which order you choose, you'll end up with the same final structure ABC. This "just connect and it works" simplicity makes them intuitive. The binary operation of connecting LEGO blocks is associative.

However, if the joining order mattered, it would create a very confusing and unpredictable situation.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745395036943.png)

Similarly, consider **USB devices**.

The binary operation of connecting two USB entities (a device to a hub, or a hub to a computer) is also associative.

You can plug a USB hub into your computer, then plug a keyboard into the hub. Or you could plug the keyboard into the hub first, and then plug the hub (with keyboard attached) into the computer. The final connected state works the same way.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745395866156.png)

As programmers, we strive to make our code and the operations within it as simple, predictable, and easy to reason about as possible. If a binary operation is associative, it means we don't have to worry about how intermediate computations are grouped.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

#### Combinatorial Explosion

Let's consider three items A, B, and C and an associative binary operation `•`.

If we first combine A • B to create item AB, then combine it with C to make (A • B) • C,
or if we first combine B • C to create item BC, then combine it with A to make A • (B • C),
the final result should be the same if `•` is associative.

However, imagine if the operation behaved differently based on the order of assembly. The number of possible outcomes would explode as you add more items, making it nearly impossible to predict or control the final result. This demonstrates why associativity is so valuable.

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

## String Concatenation: A Hidden Benefit We All Enjoy

Think about text editing. When you **cut (✂️) and paste (📋)** text, you're performing string concatenation.

Imagine if the order of cut-and-paste operations affected your final document!

Fortunately, thanks to the associative property of string concatenation, this chaotic situation doesn't exist.

Let's see how this looks in programming terms.

The `+` operator for strings is a binary operation (with type `string -> string -> string` in F# if we consider string concatenation) that is associative:

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
// The '+' operator for strings is a binary operation (string -> string -> string)
let s1 = "Hello"
let s2 = " "
let s3 = "world!"

// These operations are equivalent to different cut-paste sequences
let result1 = (s1 + s2) + s3  // ("Hello" + " ") + "world!"
let result2 = s1 + (s2 + s3)  // "Hello" + (" " + "world!")

printfn "%s" result1  // Output: Hello world!
printfn "%s" result2  // Output: Hello world!
// Both give us "Hello world!"
```

The fact that this "just works" is a direct result of string concatenation being an associative binary operation. This property is the first key ingredient in understanding the Monoid structure. Associativity, combined with another key element (the identity element, which we'll discuss next), forms the basis of the Monoid.

More importantly, it's a perfect example of how mathematical properties can make our everyday tools and programming operations more intuitive and reliable.
:::