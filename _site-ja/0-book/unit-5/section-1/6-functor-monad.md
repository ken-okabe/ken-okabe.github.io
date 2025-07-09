# **Chapter 6: 理論的堅牢性 — Functor/Monad則の再検証**

これまでの章で、`.map()`と`.bind()`という2つの主要なAPIを見てきました。この章では、これらの操作が単なる便利機能の寄せ集めではなく、**数学的に堅牢な基盤**の上に成り立っていることを証明します。

## **なぜ「法則」が重要なのか？ (再訪)**

まず、Unit 2で解説したFunctor/Monad則を簡潔に振り返ります。なぜ、このような抽象的な「法則」の検証が重要なのでしょうか？

それは、これらの法則を満たすことで、APIの振る舞いが**予測可能**になり、開発者は安心してコードの組み合わせやリファクタリングを行えるからです。これは、人間による開発だけでなく、AIがコードを自動生成・リファクタリングする際にも、論理的な破綻がなく、バグを含まない、堅牢でメンテナンス性の高いコードを生み出すための**絶対的な基盤**となります。

## **Functor則の再検証 (`.map`)**

Functor則は、`.map()`が関数合成という基本的な構造を正しく「保存」することを保証します。

1.  **恒等法則 (Identity)**: `timeline.map(id)` は `timeline` と振る舞いが等価である。
2.  **合成法則 (Composition)**: `timeline.map(f).map(g)` は `timeline.map(g << f)` と振る舞いが等価である。

<!-- end list -->

```typescript
// 恒等関数
const id = <A>(x: A): A => x;

// 合成する関数
const f_functor = (x: number): string => `value: ${x}`;
const g_functor = (s: string): boolean => s.length > 10;

const initialTimeline_functor = Timeline(5);

// 1. 恒等法則の検証
const mappedById = initialTimeline_functor.map(id);
// initialTimeline_functor.at(Now) は 5
// mappedById.at(Now) も id(5) = 5 であり、振る舞いが等価

// 2. 合成法則の検証
const composedFunc = (x: number) => g_functor(f_functor(x));
const result_LHS = initialTimeline_functor.map(composedFunc); // g(f(5)) -> false
const result_RHS = initialTimeline_functor.map(f_functor).map(g_functor);   // f(5) -> "value: 5" -> g("value: 5") -> false

// 両者とも、振る舞いが等価
```

## **Monad則の再検証 (`.bind`)**

Monad則の検証は、よりシンプルで本質的な**Kleisli合成**のアプローチで行います。これは、**「`Timeline`を返す関数（Kleisliアロー）」の合成演算子`>>>`が、`ID`を単位元としてMonoidを形成するか**を検証することと等価です。

### **定義**

- **Kleisliアロー**: `'a -> Timeline<'b>` というシグネチャを持つ関数。

- **単位元 (`ID`)**: 値を`Timeline`でラップする関数。

- **クライスリ合成 (`>>>`)**: 2つのKleisliアローを`.bind()`で繋ぐ演算子。`f >>> g` は `x => f(x).bind(g)` と定義されます。

### **Monoid則の検証**

#### **1. 結合法則 (Associativity)**

- **法則**: `(f >>> g) >>> h` は `f >>> (g >>> h)` と等価である。
  - **必然性の解説**: この法則は、`.bind()`自体の結合法則 `m.bind(f).bind(g)` が `m.bind(x => f(x).bind(g))` と等価であることから、直接的に保証されます。`DependencyCore`は、あなたが依存関係の定義をどう「グルーピング」したかを気にしません。`A→B→C`というステップで定義しようが、`A→C`という一続きのルールで定義しようが、最終的に構築される情報のフローパスは全く同じになります。結合法則は、この\*\*「依存関係の定義方法は、最終的な情報の流れに影響を与えない」\*\*という、依存グラフモデルにおける自明の理を数学的に表現したものなのです。

#### **2. 左単位元則 (Left Identity)**

- **法則**: `ID >>> f` は `f` と等価である。
  - **必然性の解説**: `ID >>> f` を値 `a` に適用すると `ID(a).bind(f)` となりますが、これは`f(a)`と等価です。`ID(a)`という`Timeline`は、`f`という次の計算をキックするためだけの一時的なラッパーに過ぎず、両者の振る舞いが等価なのは自明です。

#### **3. 右単位元則 (Right Identity)**

- **法則**: `f >>> ID` は `f` と等価である。
  - **必然性の解説**: `f >>> ID` を値 `a` に適用すると `f(a).bind(ID)` となりますが、これは`f(a)`と等価です。`.bind(ID)`という操作は、`f(a)`から来た値を何もせず、そのまま下流に流すのと同じだからです。

### **コードによる検証**

```typescript
// --- 定義 ---
const ID = <A>(x: A): Timeline<A> => Timeline(x);

const kleisliCompose = <A, B, C>(f: (a: A) => Timeline<B>, g: (b: B) => Timeline<C>) => {
    return (a: A): Timeline<C> => f(a).bind(g);
};

// --- 検証用のKleisliアロー ---
const f_monad = (x: number): Timeline<string> => ID(`value:${x}`);
const g_monad = (s: string): Timeline<boolean> => ID(s.length > 10);
const h_monad = (b: boolean): Timeline<string> => ID(b ? "Long" : "Short");

// --- 1. 結合法則の検証 ---
const fg = kleisliCompose(f_monad, g_monad);
const gh = kleisliCompose(g_monad, h_monad);

const result_LHS_monad = kleisliCompose(fg, h_monad)(12345);
const result_RHS_monad = kleisliCompose(f_monad, gh)(12345);
// LHS: 12345 -> "value:12345" -> true -> "Long"
// RHS: 12345 -> "value:12345" -> true -> "Long"
// 最終的なTimelineの値はどちらも "Long" となり、振る舞いが等価

// --- 2. 左単位元則の検証 ---
const id_f = kleisliCompose(ID, f_monad);
// id_f(10) の結果と f_monad(10) の結果は、どちらも値が "value:10" のTimelineとなり、振る舞いが等価

// --- 3. 右単位元則の検証 ---
const f_id = kleisliCompose(f_monad, ID);
// f_id(10) の結果と f_monad(10) の結果は、どちらも値が "value:10" のTimelineとなり、振る舞いが等価
```

## **結論：依存グラフから生まれる必然性**

これらの数学的法則は、難解な制約ではなく、**`Timeline`の依存グラフモデルからすれば、むしろ必然的な性質である**と結論付けられます。

- **Functor則の必然性**: `.map()`が定義するのは**静的な**依存関係です。`A -> B`という不変の変換ルールを定義する以上、その合成が数学的な法則に従うのは当然です。

- **Monad則の必然性**: 一方、`.bind()`が定義するのは**動的な**依存関係です。依存グラフの構造自体が時間と共に変化します。この「動的な配線の切り替え」という複雑な操作が予測不能なカオスに陥らず、常に一貫した結果を生むためには、**操作の順番（結合法則）に結果が左右されない**という数学的な保証が不可欠です。Monad則は、この**動的なグラフの進化が、常に秩序正しく、予測可能であることを保証する**ための、必然的なルールなのです。

## **Canvasデモ (Placeholder)**

*(ここにMonad則（特に結合法則）の振る舞いを視覚的に示すインタラクティブなデモが配置されます。)*