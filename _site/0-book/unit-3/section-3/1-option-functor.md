:::lang-en

# Option Functor

Option, as a Functor, provides `Option.map` to apply a function only if the value is Some.

## Example in F#

```fsharp
let value = Some 10
let doubled = value |> Option.map (fun x -> x * 2)
// doubled = Some 20

let noneValue = None
let doubledNone = noneValue |> Option.map (fun x -> x * 2)
// doubledNone = None
```

Option.map applies the function only if a value is present.
:::