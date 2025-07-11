:::lang-en
# List Functor

List, as a Functor, provides `map` to apply a function to each element.

## Example in F#

```fsharp
let numbers = [1; 2; 3]
let doubled = numbers |> List.map (fun x -> x * 2)
// doubled = [2; 4; 6]
```

List.map applies the function to each element and returns a new list.
:::