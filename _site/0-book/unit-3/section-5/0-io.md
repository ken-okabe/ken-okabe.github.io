:::lang-en

# IO Functor and Monad

IO is a container for treating effectful computations as values. It delays side effects until execution, helping to maintain pure functional programming.

- Functor: Applies a function to the value inside IO (`map`).
- Monad: Chains multiple IO actions in sequence (`flatMap`).

IO is used to safely handle interactions with the outside world (input/output, side effects).

:::