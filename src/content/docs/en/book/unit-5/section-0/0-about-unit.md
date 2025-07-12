---
title: "\U0001F50D Overview - Unit 5"
description: >-
  Through the trilogy beginning with this unit (Units 5, 6, and 7), we will
  explore the essence of Functional Reactive Programming (FRP).
---
Through the trilogy beginning with this unit (Units 5, 6, and 7), we will explore the essence of **Functional Reactive Programming (FRP)**.

In this unit, we will start by delving deep into the philosophical background of the core `Timeline` library. This library's innovation lies in its redefinition of internal state changes (mutation)—often considered a **"theoretical compromise"** for performance in many FRP libraries—as **a theoretically justified means to faithfully represent the "Block Universe" model**. This is a clearly distinct approach that treats internal mutability not as a deviation from theory, but rather as a necessity for being faithful to the concept.

Upon this philosophical foundation, we will unravel how core APIs like `map`, `bind`, and `using` enable robust declarative programming. The explanation will be centered on the library's conceptual origins in **F# code**, then expanded to its **TypeScript/JavaScript API**. We will proceed by presenting **interactive web demos** to provide an intuitive understanding of each concept.
