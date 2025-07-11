:::lang-en

# Chapter 1: FRP is like Spreadsheet

Another familiar example of something  **fundamentally designed to keep its versions perfectly synchronized**  is the  **spreadsheet.**

And the FRP library being introduced here,  **Timeline** , will be easier to understand if this  **spreadsheet principle**  is kept in mind.

## Timeline provides binary operations to utilize the state management

In Functional Programming, everything is an expression or operation. Accordingly, Timeline library provides  **binary operations for the reactive state management** .

$$
TimelineA ~ ~ * ~ ~ Function \quad  \rightarrow \quad  TimelineB
$$

$$
TimelineB \quad = \quad TimelineA ~ ~ * ~ ~ Function
$$

This binary operation corresponds to an operation in [spreadsheet apps](https://www.google.com/intl/en/sheets/about/).

![image](https://raw.githubusercontent.com/ken-okabe/web-images4/main/img_1712461813235.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images4/main/img_1712453265841.png)

-  $TimelineA \quad = \quad$ **A1**


-  $TimelineB \quad = \quad$ **B1**

-  $Function \quad = \quad$ ***fx***

---

## 🔍 Functions

---

## ① Function to initialize `Timeline<'a>`

### `Timeline`

```fsharp
'a -> Timeline<'a>
```

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let counter = Timeline 0
```

**Consider the `Timeline` as a specific container for a value, similar to a  **Cell**  in [spreadsheet apps](https://www.google.com/intl/en/sheets/about/).**

![image](https://raw.githubusercontent.com/ken-okabe/web-images4/main/img_1712455522726.png)

---

## ② Functions for the binary operations

$$
TimelineA ~ ~ * ~ ~ Function \quad  \rightarrow \quad  TimelineB
$$

### `TL.map`

```fsharp
('a -> 'b) -> (Timeline<'a> -> Timeline<'b>)
```

### `TL.bind`

```fsharp
('a -> Timeline<'b>) -> (Timeline<'a> -> Timeline<'b>)
```

When the binary operator:  $*$  is `TL.map`,

$$
TimelineB \quad = \quad TimelineA \quad \triangleright TL.map \quad double
$$

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let double = fun a -> a * 2

let timelineA = Timeline 1

let timelineB =
    timelineA |> TL.map double

log (timelineB |> TL.last)
// 2
```

**This code for the binary operation simply corresponds to the basic usage of spreadsheet apps**

![image](https://raw.githubusercontent.com/ken-okabe/web-images4/main/img_1712453265841.png)

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/note.svg">

This is the identical structure of:

$$
ListA ~ ~ * ~ ~ Function \quad  \rightarrow \quad  ListB
$$

$$
ListB \quad = \quad ListA ~ ~ * ~ ~ Function
$$

$$
ListB \quad = \quad ListA \quad \triangleright List.map \quad double
$$

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/javascript.svg">

```js
let double = a => a * 2;

let listA = [1];

let listB =
    listA.map(double);

console.log(listB);
// [2]
```

![image](https://raw.githubusercontent.com/ken-okabe/web-images2/main/img_1694901961984.png#gh-light-mode-only)

We could recognize the array `[2]` is identical to the  **Cell**  and  **Value** `2` of a spreadsheet; however, the spreadsheet and **Timeline** maintain a `double` relationship  **as values change over the timeline** .

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/notefooter.svg">

---

## ③ Function to update `Timeline<'a>`

$$TimelineA \quad \triangleright TL.next \quad newValue \quad \rightarrow \quad unit$$

### `TL.next`

```fsharp
'a -> Timeline<'a> -> unit
```

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let timelineA = Timeline 1

timelineA |> TL.next 3

log (timelineA |> TL.last)
// 3
```

![image](https://raw.githubusercontent.com/ken-okabe/web-images4/main/img_1712456400282.png)

---

## ①②③ action of  `Timeline<'a>`

**The update to `timelineA` will trigger a reactive update of `timelineB` according to the rule defined by the binary operation.**

![image](https://raw.githubusercontent.com/ken-okabe/web-images4/main/img_1712453321296.png)

<img width="100%" src="https://raw.githubusercontent.com/ken-okabe/web-images/main/fsharp.svg">

```fsharp
let double = fun a -> a * 2

// ① initialize timelineA
let timelineA = Timeline 1

// confirm the lastVal of timelineA
log (timelineA |> TL.last)
// 1

// ② the binary operation
let timelineB =
    timelineA |> TL.map double

// confirm the lastVal of timelineB
log (timelineB |> TL.last)
// 2

//=====================================
// ③ update the lastVal of timelineA
timelineA
|> TL.next 3
// update to timelineA will trigger
//   a reactive update of timelineB

// confirm the lastVal of timelineA & timelineB
log (timelineA |> TL.last)
// 3
log (timelineB |> TL.last)
// 6
```
:::