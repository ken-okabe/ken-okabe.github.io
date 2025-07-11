````markdown
:::lang-en
# IO Functor

IO is a type for treating effectful computations as values. As a Functor, it provides `mapIO` to apply a function to the value inside IO.

## Example in F# (pseudo IO type)

```fsharp
type IO<'a> = IO of (unit -> 'a)

mapIO = fun f (IO action) -> IO (fun () -> f (action ()))

let ioValue = IO (fun () -> 10)
let mappedIO = ioValue |> mapIO (fun x -> x * 2)
// mappedIO |> fun (IO act) -> act () = 20
```

This way, you can apply a function to the value inside IO.
:::
````