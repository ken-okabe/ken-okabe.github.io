:::lang-en

# Introducing `apply` and `map2`

Here is the familiar `map` function.

`f: 'a -> 'b`

`g: F<'a> -> F<'b>`

`map: ('a -> 'b) -> F<'a> -> F<'b>`

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745662189198.png)

Here is the familiar `ID` function.

`ID: 'a -> F<'a>`

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749339771188.png)

There is another way to convert from `f` to `g` besides directly using `map`.

It's possible to create an "intermediate step," `ID(f)`, by putting the entire function `f` into a container using `ID`.

`ID(f): F<'a -> 'b>`

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749339821829.png)

And then there is a new function, `apply`, which has the ability to convert from the "intermediate step" `ID(f)` to `g`.

Simply put, since we've decomposed `map` into `ID` and `apply`, conversely, the function composition of `ID` and `apply` results in `map`.

`map = ID >> apply`

`apply: F<'a -> 'b> -> F<'a> -> F<'b>`

Looking at the type of `apply`, we can see it is a function that has the ability to convert any function inside a container,

`F<'a -> 'b>`

into a **Mapper Function** between containers,

`F<'a> -> F<'b>`

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749872919816.png)

However, in this form, it's a bit difficult to imagine what this is useful for.

Here,

`f: 'a -> 'b`

can represent "any function," and this could also be a High-Order Function (HOF) like:

**Pattern 1: HOF Returns a Function**

![HOF Pattern 1: Value -> HOF -> Function](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745695953633.png)

`f: 'a -> ('b -> 'c)`

By applying `apply` twice,

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749339867636.png)

`f: 'a -> ('b -> 'c)`

can be converted into:

`g: F<'a> -> F<'b> -> F<'c>`

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749339908190.png)

If we combine this operation, we can express it as a whole:

`apply2: F<'a -> 'b -> 'c> -> F<'a> -> F<'b> -> F<'c>`

Now, let's once again connect it with:

`ID: 'a -> F<'a>`

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749339955011.png)

`ID >> apply2 = map2`

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749340006071.png)

We obtain:

`map2: ('a -> 'b -> 'c) -> F<'a> -> F<'b> -> F<'c>`

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1749340031405.png)

:::