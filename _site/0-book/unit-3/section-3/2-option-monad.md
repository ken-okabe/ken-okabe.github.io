:::lang-en
# Option Monad

Option, as a Monad, provides `bind` (Option.bind in F#), which enables powerful control over computation flow.

## Example in F#

```fsharp
let safeDivide = fun x y -> if y = 0 then None else Some (x / y)
let result = Some 100 |> Option.bind (fun x -> safeDivide x 2) |> Option.bind (fun x -> safeDivide x 0)
// result = None
```

---

## Functor (map) vs Monad (bind): Capabilities and Limitations

- Functor's `map` applies a function only if the value is Some, leaving None unchanged. It can transform the value inside Some, but cannot change Some to None or vice versa. The container's shape (Some/None) is preserved, so early exit or conditional logic is not possible.
- Monad's `bind` allows the function to return Some or None, enabling short-circuiting: if any step returns None, subsequent computations are skipped. This allows for safe chaining of computations that may fail, early exit, and conditional logic—capabilities not possible with map alone.

This distinction is fundamental: map is for value transformation only, while bind enables control over the computation's flow and structure.
:::