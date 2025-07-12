:::lang-en

# `distinctUntilChanged` — Noise Reduction

`distinctUntilChanged` is an application of a "stateful timeline" similar to `scan`, but its purpose is different. It is an extremely important optimization primitive for preventing unnecessary updates.

## Why Eliminate Duplicates?

In a reactive system, it is common for the same value to flow into a timeline consecutively. For example, when a user moves the mouse slightly but the coordinates do not change, or when the same character is typed consecutively in a text input.

If the system reacts to all of these events by re-rendering the UI or performing heavy computational processing, it can cause serious performance problems. The value has not substantially "changed," yet the update process runs repeatedly.

`distinctUntilChanged` is a filter for removing this "noise." It internally remembers the previous value and only propagates the new value to subsequent operations if it is different from the previous one—that is, only when there is a **truly meaningful change**.

-----

## API Definition

##### F\#: `distinctUntilChanged: Timeline<'a> -> Timeline<'a> when 'a : equality`

*Note: In F\#, `distinctUntilChanged` is a standalone function that requires the type to support equality comparison.*

##### TS: `.distinctUntilChanged(): Timeline<T>`

-----

## Code Example in TypeScript

Let's consider a scenario where a user moves the mouse. By using `distinctUntilChanged`, we can update the UI only when the mouse coordinates actually change.

```typescript
const mousePosition = Timeline({ x: 0, y: 0 });

// Compares with the last value and only passes the value if it has changed
const significantMoves = mousePosition.distinctUntilChanged();

// Callback to monitor updates
significantMoves.map(pos => {
  console.log(`Updating UI: x=${pos.x}, y=${pos.y}`);
});

// "Updating UI: x=10, y=20" is output
mousePosition.define(Now, { x: 10, y: 20 });

// Since the value is the same, the callback is not executed (UI re-rendering is prevented)
mousePosition.define(Now, { x: 10, y: 20 });
mousePosition.define(Now, { x: 10, y: 20 });

// "Updating UI: x=15, y=25" is output
mousePosition.define(Now, { x: 15, y: 25 });
```

In this example, even though `mousePosition` is updated three times, the callback within the `map` that depends on `significantMoves` is only executed twice—when the value actually changes.

-----

## Canvas Demo (Placeholder)

A demo that visually compares how, even if the same value flows consecutively into the input timeline, the timeline after passing through `distinctUntilChanged` is updated only once.

:::

:::lang-ja

# `distinctUntilChanged` — ノイズの除去

`distinctUntilChanged`は、`scan`と同様に「状態を持つタイムライン」の応用例ですが、その目的は異なります。これは、不要な更新を防ぐための、極めて重要な最適化プリミティブです。

## なぜ重複を排除するのか？

リアクティブなシステムでは、同じ値が連続してタイムラインに流れてくることが頻繁にあります。例えば、ユーザーがマウスを少し動かしても座標が変わらない場合や、テキスト入力で同じ文字が連続した場合などです。

もし、このすべてのイベントに反応してUIの再描画や重い計算処理を実行してしまうと、深刻なパフォーマンス問題を引き起こす可能性があります。値は実質的に「変化」していないのに、更新処理だけが何度も走ってしまうのです。

`distinctUntilChanged`は、この「ノイズ」を除去するためのフィルターです。内部で直前の値を記憶し、新しく来た値が直前の値と異なる場合、つまり**本当に意味のある変化**があった場合にのみ、その値を後続の処理に伝えます。

-----

## API定義

##### F\#: `distinctUntilChanged: Timeline<'a> -> Timeline<'a> when 'a : equality`

*Note: In F\#, `distinctUntilChanged` is a standalone function that requires the type to support equality comparison.*

##### TS: `.distinctUntilChanged(): Timeline<T>`

-----

## TypeScriptによるコード例

ユーザーがマウスを動かすシナリオを考えてみましょう。`distinctUntilChanged`を使うことで、マウス座標が実際に変化したときだけUIを更新できます。

```typescript
const mousePosition = Timeline({ x: 0, y: 0 });

// 最後の値と比較し、変化があった場合のみ値を通す
const significantMoves = mousePosition.distinctUntilChanged();

// 更新を監視するコールバック
significantMoves.map(pos => {
  console.log(`UIを更新: x=${pos.x}, y=${pos.y}`);
});

// "UIを更新: x=10, y=20" が出力される
mousePosition.define(Now, { x: 10, y: 20 });

// 値が同じなので、コールバックは実行されない（UIの再描画が防がれる）
mousePosition.define(Now, { x: 10, y: 20 });
mousePosition.define(Now, { x: 10, y: 20 });

// "UIを更新: x=15, y=25" が出力される
mousePosition.define(Now, { x: 15, y: 25 });
```

この例では、`mousePosition`が3回更新されても、`significantMoves`に依存する`map`内のコールバックは、値が実際に変化した2回しか実行されません。

-----

## Canvasデモ (Placeholder)

入力タイムラインに同じ値が連続して流れてきても、`distinctUntilChanged`を通過した後のタイムラインは一度しか更新されない様子を視覚的に比較できるデモ。

:::