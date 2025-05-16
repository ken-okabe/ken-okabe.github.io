---
title: Result (Either) Functor
description: >-
  Result (the Result type in F#) has two cases: success (Ok) and failure
  (Error). As a Functor, it provides Result.map to apply a function only in the
  success case.
---
Result (the Result type in F#) has two cases: success (Ok) and failure (Error). As a Functor, it provides `Result.map` to apply a function only in the success case.

## Example in F#

```fsharp
let okValue = Ok 10
let mappedOk = okValue |> Result.map (fun x -> x * 2)
// mappedOk = Ok 20

let errorValue = Error "error"
let mappedError = errorValue |> Result.map (fun x -> x * 2)
// mappedError = Error "error"
```

Result.map applies the function only in the Ok case and returns Error unchanged.
