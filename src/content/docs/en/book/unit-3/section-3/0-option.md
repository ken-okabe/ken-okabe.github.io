---
title: 'Section 2: Option (Maybe) Functor and Monad'
description: >-
  Option (also called Maybe) is a container for handling the possibility of
  missing values. It expresses the presence or absence of a value in the type,
  as a safer alternative to null or undefined.
---
Option (also called Maybe) is a container for handling the possibility of missing values. It expresses the presence or absence of a value in the type, as a safer alternative to `null` or `undefined`.

- Functor: Applies a function only if a value is present (`map`).
- Monad: Allows safe chaining of computations, even if the value disappears along the way (`flatMap`).

Option is used to safely handle failures or missing values.
