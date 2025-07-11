:::lang-en
# Monad: Another Bridge

## From Kleisli Arrow to Container Mapper

The Kleisli arrow at our disposal - a function that produces its output within a container:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745714186810.png)

Now, let's look back at the mapper function we created using Functor:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745662130518.png)

These two concepts suggest an intriguing possibility: what if we could create a function that transforms a Kleisli arrow into a container mapper function? Such a function would serve as another bridge between worlds.

This transforming function is called **bind**. It takes a Kleisli arrow and produces a container mapper function:

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745716642404.png)

This transformation - from Kleisli arrow to container mapper function - is precisely what defines a  **Monad** . Where Functor's map lifts regular functions to work with containers, bind transforms Kleisli arrows into container mappers.

This provides a completely different way to bridge the world of functions and containers, and this transformative capability is the core essence of what we call a Monad.

## Type of List Monad

### List Functor is `list.map` in F#

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745674327527.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745701569925.png)

### List Monad is `list.collect` in F#

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745804453086.png)

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745804937535.png)
:::