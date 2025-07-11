:::lang-en
# List Monad

List, as a Monad, provides `bind` (List.collect in F#).

## Example in F#

```fsharp
let numbers = [1; 2; 3]
let withNeighbors = numbers |> List.collect (fun x -> [x - 1; x; x + 1])
// withNeighbors = [0; 1; 2; 1; 2; 3; 2; 3; 4]
```

List.collect applies a function that returns a list to each element and flattens the result. This is the monadic behavior of List.

---

Unlike Functor's `map`, which always produces a fixed number of elements (one output per input), the Monad's `bind` (collect) allows the monadic function (Kleisli arrow) to determine the structure of the container itself. This means:

- The function can return multiple elements for each input, increasing the total number of elements (as in the example above).
- The function can return an empty list for some inputs, effectively removing elements from the result (filtering behavior).
- The function can return a single-element or multi-element list, or even an empty list, for each input, giving full control over the resulting structure.

For example, you can use `collect` to filter elements, similar to how `flatMap` is used in JavaScript:

```fsharp
let getEvenNumbers = List.collect (fun x -> if x % 2 = 0 then [x] else [])
let evenNumbers = [1; 2; 3; 4; 5] |> getEvenNumbers
// evenNumbers = [2; 4]
```

This flexibility is a key feature of the Monad interface: the monadic function can both add and remove elements, and even change the shape of the container, not just transform values. This is more powerful than Functor's map, which only transforms values but preserves the container's structure.
:::