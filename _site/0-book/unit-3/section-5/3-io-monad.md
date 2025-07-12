:::lang-en

# IO Monad

IO, as a Monad, allows chaining multiple IO actions in sequence, enabling dynamic and controlled side-effectful workflows.

## Example in F# (pseudo IO type)

```fsharp
type IO<'a> = IO of (unit -> 'a)
bindIO = fun f (IO action) -> f (action ())

let readInput = IO (fun () -> System.Console.ReadLine())
let printTwice = fun input -> IO (fun () -> printfn "%s" input; printfn "%s" input)
let program = readInput |> bindIO printTwice
// When executed, this will read input and print it twice
```

---

## Functor (map) vs Monad (bind): Capabilities and Limitations

- Functor's `mapIO` applies a function to the value produced by an IO action, wrapping the result in a new IO action. It cannot control the sequence or branching of side effects; the structure and order are fixed.
- Monad's `bindIO` allows you to execute an IO action, then use its result to determine and execute the next IO action. This enables chaining, conditional branching, and complex workflows involving side effects—capabilities not possible with mapIO alone.

This distinction is fundamental: mapIO is for value transformation only, while bindIO enables full control over the flow and composition of side effects.
:::