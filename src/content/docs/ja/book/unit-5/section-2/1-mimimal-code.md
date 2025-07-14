---
title: Timeline.fs the Minimal Code
description: Timeline library is fundamentally very simple.
---
Timeline library is fundamentally very simple.

Initially, it was an F# implementation, less than 50 lines of code. Remarkably, this foundational skeleton is still entirely shared with the currently advanced Timeline library.

```fsharp
module Timeline

type Now = Now of string
let Now = Now "Conceptual time coordinate"

type Timeline<'a> =
    {
        mutable _last: 'a
        mutable _fns: ('a -> unit) list
    }
let Timeline =
    fun initialValue ->
        { _last = initialValue; _fns = [] }

module TL =
    let isNull (value: 'a) : bool =
        match box value with
        | null -> true
        | _ -> false
    let at =
        fun _ timeline ->
            timeline._last
    let define =
        fun _ a timeline ->
            timeline._last <- a
            timeline._fns
            |> List.iter (fun f -> f a)
    let map =
        fun f timelineA ->
            let timelineB = Timeline (timelineA |> at Now |> f)
            let newFn =
                fun valueA ->
                    timelineB
                    |> define Now (valueA |> f)

            timelineA._fns <- timelineA._fns @ [newFn]
            timelineB
    let bind =
        fun monadf timelineA ->
            let timelineB = timelineA |> at Now |> monadf
            let newFn =
                fun valueA ->
                    let innerTimeline = valueA |> monadf
                    timelineB
                    |> define Now (innerTimeline |> at Now)

            timelineA._fns <- timelineA._fns @ [newFn]
            timelineB
```


With the automatic type annotations in VSCode:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752470188913.png)
