:::lang-en
# Result (Either) Monad

Result, as a Monad, provides `bind` (Result.bind in F#), which enables robust error handling and control flow.

## Example in F#

```fsharp
let safeDivide = fun x y -> if y = 0 then Error "div by zero" else Ok (x / y)
let result = Ok 100 |> Result.bind (fun x -> safeDivide x 2) |> Result.bind (fun x -> safeDivide x 0)
// result = Error "div by zero"
```

---

## Functor (map) vs Monad (bind): Capabilities and Limitations

- Functor's `map` applies a function only if the value is Ok, leaving Error unchanged. It can transform the value inside Ok, but cannot change Ok to Error or vice versa. The success/failure state is preserved, so error propagation or early exit is not possible.
- Monad's `bind` allows the function to return Ok or Error, enabling short-circuiting: if any step returns Error, subsequent computations are skipped. This allows for safe error propagation, early exit on failure, and composition of error-prone computations—capabilities not possible with map alone.

This distinction is fundamental: map is for value transformation only, while bind enables control over the computation's flow and error handling.
:::