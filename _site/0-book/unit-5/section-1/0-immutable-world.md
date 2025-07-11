# Chapter 0: Immutable World

Throughout this book, we've consistently explained that the core concept of programming is transforming data through pipelines of functions. We've shown that, in principle, all of this can be expressed mathematically—centered around binary operations and algebraic structures.

![Pipeline image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1744449185892.png)

With a few exceptions like recursion, we've demonstrated that Monoids, Functors, and Monads all fit neatly into this pipeline model, either as binary operations or higher-order functions.

We've also shown that the terminology often used to describe functional programming is largely absent in mathematics, where these properties are simply taken for granted. Such terms mainly serve as an antithesis to imperative programming, helping learners "unlearn" old habits.

**Immutability**, for example, is such a fundamental principle in mathematics that it's rarely even mentioned.

This leads to an important question:

**If mathematics takes immutability for granted, why is it that in imperative programming, variables are typically mutable and change freely?**

## 0.1 Mutable World

The answer is simple: our everyday experience of the world is mutable. The universe we inhabit evolves along the timeline, and this mindset is deeply embedded in imperative programming.

![A naive worldview: Universe = Mutable](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745825090668.png)

-   Universe = Mutable: This is the default worldview, and imperative programming naturally adopts it.
-   Mathematics = Mutable: This is a misconception—mathematics doesn't have such a concept; it's unique to programming.

For example, in games, simulations, or any program modeling a changing world, many programmers believe that immutability is impractical. They see mutable variables as the only realistic way to represent a world in flux, and view the immutability promoted by functional programming as an unattainable ideal.

## 0.2 Block Universe: Immutable World

Surprisingly, this worldview—that our universe is fundamentally mutable—is not supported by modern science. In theoretical physics, the universe is described mathematically, and those mathematical values are immutable. Even as the timeline progresses, each moment (t1, t2, t3, ...) is just a different value on the timeline; time itself is not overwritten like a mutable variable.

From the perspective of theoretical physics, the universe is modeled as immutable.

Some refer to this model as the "Block Universe."

![Block Universe illustration](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745825055126.png)

In the Block Universe, as adopted by physics, all points on the timeline are equally real—no single moment is privileged.

![All time is equal illustration](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745825021613.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1746559141259.png)

*Source: ["Time’s Passage is Probably an Illusion", SCIENTIFIC AMERICAN, Oct 24, 2014](https://www.scientificamerican.com/article/time-s-passage-is-probably-an-illusion/)*

What we call the "present" is just a subjective experience; every observer at every point on the timeline considers their own "now" to be real. But this is, as Einstein put it, "only a stubbornly persistent illusion."

![Present is an illusion illustration](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745825534766.png)

> The distinction between the past, present and future is only a stubbornly persistent illusion.
>
> — Albert Einstein

Functional programming adopts this model:

-   Universe = Immutable: The Block Universe, as in theoretical physics.
-   Mathematics = Immutable: So fundamental that mathematics doesn't even need the term.

An immutable Block Universe can be accurately modeled with immutable mathematical structures.

## 0.3 Introducing: Values That Change Over Timeline

In typical programming, a variable holds a single value at a time—like `x = 5` or `name = "Alice"`. But what about things that change as the timeline progresses?

-   The position of your mouse pointer.
-   The current temperature from a sensor.
-   The text in a search box.
-   Button clicks.

In our perspective of the immutable block universe, these are not just static values; they are **sequences of values or events over the timeline.**

![Block Universe illustration](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745825055126.png)

**Functional Reactive Programming (FRP)** provides a powerful way to handle these dynamic, time-varying values. It lets us treat a **"value over the timeline" as a first-class** concept—a **container** that holds not just one value, but **the entire history and future of a value as it changes.**

You'll often hear these called:

-   **Stream:** A flow of values or events, one after another.
-   **Observable:** Something you can watch or subscribe to, reacting to new values as they appear.
-   **Signal** or **Behavior:** A value that continuously exists and changes over the timeline.
-   **Reactive Value:** A value that automatically updates in response to changes, representing dynamic, time-varying data.

Instead of repeatedly asking "what is the mouse position now?", you can work with a `mousePositionStream`—a single entity representing all mouse positions over the timeline.

## 0.4 Version History

Conceptually, a stream or reactive value can be seen as an immutable container that holds all data from the past to the future of the universe.

In fact, there is a familiar, real-world implementation of this idea for programmers: the version control system Git, well-known from GitHub.

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1751676780114.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1751676856049.png)

Git maintains  **the entire history of changes from the past to the future.**  While it may look like the current value (such as a document) is being destructively updated (mutable) in imperative programming, in reality, all previous versions are preserved immutably in the history.

## 0.5 Conceptually Immutable

Of course, such an implementation is also possible in FRP. However, in most practical cases, what we actually need is just the “latest value.” For reasons of memory and code efficiency, it is usually unnecessary to keep the entire history; instead, we simply overwrite the memory with the most recent value.

In other words, while values that change over the timeline are conceptually immutable, their actual implementation is often very similar to mutable values in imperative programming. The difference is that, in FRP, the mutable variable is encapsulated inside a container type called Reactive value, and it can only be manipulated through FRP-specific operators.

## 0.6 FRP vs OOP

Interestingly, this is very similar to the idea of encapsulation in object-oriented programming (OOP).

In fact, Alan Kay’s original vision for OOP—according to his own statements—was not well represented by the name “object-oriented programming.” Instead, he envisioned a system where objects, with their internal state hidden, would cooperate by sending “messages” to each other. He argued it should have been called “message-oriented” programming. This approach was intended as a departure from the chaos of imperative programming—even when structured—by promoting a new paradigm of coordination and encapsulation.

However, the key difference is that, in FRP, all related ReactiveValues are fundamentally designed to keep their versions perfectly synchronized, just like Git. For example, when one value changes, all dependent values are automatically and consistently updated, ensuring the entire system remains in a coherent state.

By contrast, the fundamental problem with mutable variables in imperative programming is that this discipline is often lax. Programmers may try to keep the versions of separate variables in sync, but sometimes they forget, make mistakes, or simply ignore it. While OOP introduces encapsulation and some mechanisms to manage state, it does not, by design, guarantee the kind of automatic, system-wide version synchronization that FRP provides.

[^1]: Alan Kay, “The Early History of Smalltalk,” ACM SIGPLAN Notices, 1993.