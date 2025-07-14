:::lang-en

# Chapter 5: using — Synchronizing Lifecycles with External Resources

At the heart of the `timeline` framework lies the idea of declaratively handling time-varying values, based on the "block universe" model from physics. Naturally flowing from this concept is the realization of **fully automatic resource management**, allowing developers to focus on writing essential logic without ever worrying about the timing of resource creation or destruction.

We have discovered a path to apply this ideal not only to reactive internal state but to the **lifecycle of any external resource**, such as GTK widgets in a Gnome Shell extension. The `.using()` API, which we will now discuss, is the **final, complete form** of this framework that fully embodies this ideal.

## The `.using()` API — Ultimate Resource Management

While `.bind()` manages the lifecycle of `Timeline` objects, `.using()` is the one and only correct approach to **perfectly synchronize the "lifespan of a resource" with the "illusion of a `Timeline`"**.

### API Definition

##### F#: `using: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b option>`

##### TS: `using<B>(resourceFactory: (value: A) => { resource: B; cleanup: () => void } | null): Timeline<B | null>`

### Behavior and Guarantees

1.  When the value of `sourceTimeline` changes, `using` first **reliably executes the `cleanup` function associated with the resource generated in the previous illusion, via `disposeIllusion`.**
2.  Next, it calls the `resourceFactory` function with the new value.
3.  If `resourceFactory` returns a `{ resource, cleanup }` object:
      - `resource` becomes the new value of the output `Timeline`.
      - The `cleanup` function is registered with `DependencyCore` as an `onDispose` callback associated with the new illusion.
4.  If `resourceFactory` returns `null`, the output `Timeline` becomes `null`, and no cleanup process is registered.

<!-- end list -->

- **Guarantee**: This mechanism ensures that any resource ever created by `resourceFactory` is guaranteed to have its **corresponding `cleanup` function called** when its illusion ends (for any reason). This structurally prevents resource leaks.

## Extending the `Illusion` Concept — Level 3 Mutability

With the introduction of `.using()`, the concept of `Illusion` is extended one step further.

- **Level 1 (`map`)**: The **value** `_last` is mutable.
- **Level 2 (`bind`)**: The **internal structure** `innerTimeline` is mutable.
- **Level 3 (`using`)**: **External world entities** like the DOM or timers become mutable entities synchronized with the `Illusion`'s lifecycle.

## The Evolved Heart: `DependencyCore` and `onDispose`

`DependencyCore` is no longer just a management system for "reactive connections." It has evolved into a **general-purpose foundation that guarantees all kinds of cleanup processes associated with the lifecycle of a dependency**.

`.using()` registers the `cleanup` function returned by `resourceFactory` through this `onDispose` callback feature of `DependencyCore`. Then, when an `Illusion` is destroyed, `DependencyCore` **100% guarantees** the execution of this `onDispose` (i.e., `cleanup`), completely automating the cleanup of external resources.

## Conclusion: Unification of Paradigms

This `Timeline` is no longer just an FRP library. It is a new dimension of framework that has completely integrated the often-conflicting paradigms of declarative data flow and imperative resource management under the single, unified concept of **"lifecycle."

With a design that balances **debugging efficiency** with **production environment performance**, this framework consistently supports developers from the research and development phase to practical application. This is the realization of a truly complete software architecture that combines theoretical beauty with practical value.

## Canvas Demo

### https://g.co/gemini/share/1560a1f89a35

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752463208863.png)

---

### https://gemini.google.com/share/0cf840f99b3c

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752462161899.png)

:::

:::lang-ja

# Chapter 5: `using` — 外部リソースとのライフサイクル同期

`timeline`フレームワークの根底には、物理学の「ブロック宇宙」モデルに基づいた、時間と共に変化する値を宣言的に扱うという思想があります。この考え方から自然と導き出されるのは、開発者がリソースの生成や破棄のタイミングを一切気にすることなく、本質的なロジックの記述に集中できる**全自動リソース管理**の実現です。

我々はこの理想を、リアクティブな内部状態だけでなく、Gnome Shell拡張のGTKウィジェットのような、**あらゆる外部リソースのライフサイクル**にまで適用する道筋を発見しました。これから解説する`.using()`は、その理想を完全に具現化する、このフレームワークの**最終的な完成形**です。

## `.using()` API — 究極のリソース管理

`.bind()`が`Timeline`オブジェクトのライフサイクルを管理するのに対し、`.using()`は、**「リソースの生存期間」を「`Timeline`のイリュージョン」と完全に同期させる**ための、唯一の正しいアプローチです。

### API定義

##### F#: `using: ('a -> Resource<'b>) -> Timeline<'a> -> Timeline<'b option>`

##### TS: `using<B>(resourceFactory: (value: A) => { resource: B; cleanup: () => void } | null): Timeline<B | null>`

### 動作と保証

1.  `sourceTimeline`の値が変化すると、`using`はまず、**以前のイリュージョンで生成されたリソースに紐づく`cleanup`関数を、`disposeIllusion`を通じて確実に実行します。**
2.  次に、新しい値で`resourceFactory`関数を呼び出します。
3.  `resourceFactory`が`{ resource, cleanup }`オブジェクトを返した場合：
      - `resource`が、出力`Timeline`の新しい値となります。
      - `cleanup`関数が、新しいイリュージョンに紐づく`onDispose`コールバックとして`DependencyCore`に登録されます。
4.  `resourceFactory`が`null`を返した場合、出力`Timeline`は`null`となり、クリーンアップ処理も登録されません。

<!-- end list -->

- **保証**: このメカニズムにより、`resourceFactory`によって一度でも生成されたリソースは、そのイリュージョンが（どのような理由であれ）終了する際に、**対応する`cleanup`関数が必ず呼び出される**ことが保証されます。これにより、リソースリークは構造的に発生し得ません。

## `Illusion`概念の拡張 — レベル3の可変性

`.using()`の導入によって、`Illusion`の概念はさらに一段階拡張されます。

- **レベル1 (`map`)**: `_last`という**値**が可変。
- **レベル2 (`bind`)**: `innerTimeline`という**内部構造**が可変。
- **レベル3 (`using`)**: `DOM`やタイマーといった**外部世界の存在**そのものが、`Illusion`のライフサイクルと同期する可変な存在となる。

## 進化した心臓部: `DependencyCore`と`onDispose`

`DependencyCore`は、もはや単なる「リアクティブな接続」の管理システムではありません。それは、**「依存関係の生存期間（ライフサイクル）に紐づく、あらゆる種類のクリーンアップ処理」を保証する、汎用的な基盤**へと進化しました。

`.using()`は、`resourceFactory`が返す`cleanup`関数を、この`DependencyCore`の`onDispose`コールバック機能を通じて登録します。そして、`Illusion`が破棄される際に、`DependencyCore`がこの`onDispose`（つまり`cleanup`）の実行を**100%保証する**ことで、外部リソースのクリーンアップが完全に自動化されるのです。

## 結論：パラダイムの統合

この`Timeline`は、もはや単なるFRPライブラリではありません。それは、宣言的なデータフローと、命令的なリソース管理という、しばしば対立するパラダイムを、 **「ライフサイクル」** という単一の統一された概念の下に完全に統合した、新しい次元のフレームワークです。

**デバッグ効率**と**プロダクション環境でのパフォーマンス**を両立させる設計により、このフレームワークは研究開発段階から実用段階まで、一貫して開発者を支援します。これは、理論的な美しさと実用的な価値を兼ね備えた、真に完成されたソフトウェアアーキテクチャの実現です。

## Canvas デモ

### https://g.co/gemini/share/cea0a51b75bd

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752461659595.png)

---

### https://gemini.google.com/share/d4b42486dfdf

![image](https://raw.githubusercontent.com/ken-okabe/web-images5/main/img_1752461943501.png)

:::