---
title: 'Chapter 1: FRP is like Spreadsheet'
description: Timeline provides binary operations to utilize state management.
---
Timeline provides binary operations to utilize state management.

In Functional Programming, everything is an expression or operation. Similarly, Timeline provides **binary operations for reactive state management**:

TimelineA * Function → TimelineB
    TimelineB = TimelineA * Function

This binary operation is analogous to how spreadsheet applications work.

For example, in a spreadsheet:

![Spreadsheet analogy: cell B1 as a function of A1](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1745825679642.png)

- `timelineA` = A1
- `timelineB` = B1
- `function` = fx (e.g., `=A1*2`)

Just as a spreadsheet cell automatically updates when its referenced cell changes, a timeline in FRP automatically propagates changes through binary operations. This makes FRP intuitive and powerful for managing reactive state, much like working with formulas in a spreadsheet.
