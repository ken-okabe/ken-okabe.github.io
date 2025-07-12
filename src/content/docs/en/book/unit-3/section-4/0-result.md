---
title: Result (Either) Functor and Monad
description: >-
  Result (also known as Either) is a container that represents both success and
  failure cases in the type. It allows you to safely handle error processing and
  branching results.
---
Result (also known as Either) is a container that represents both success and failure cases in the type. It allows you to safely handle error processing and branching results.

- Functor: Applies a function only in the success (Right/Ok) case (`map`).
- Monad: Skips further computations if a failure (Left/Error) occurs along the way (`flatMap`).

Result/Either is used for error handling without exceptions.
