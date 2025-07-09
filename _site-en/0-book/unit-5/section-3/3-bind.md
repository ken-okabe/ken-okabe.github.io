# Chapter 3: `bind` — 動的な依存グラフ

Chapter 1と2では、`.map()`と`.link()`が、一度定義されると変化しない**静的な**依存関係を構築する方法を見ました。

しかし、現代的なアプリケーションでは、状況に応じて依存関係そのものを動的に切り替える必要性が頻繁に生じます。例えば、SNSアプリケーションで、表示するユーザーのタイムラインを切り替えるようなケースを考えてみましょう。

```javascript
// Aさんのタイムライン
const alicesPosts = Timeline(["Alice's post 1", "Alice's post 2"]);

// Bさんのタイムライン
const bobsPosts = Timeline(["Bob's post 1", "Bob's post 2"]);

// 現在選択されているユーザーID
const selectedUserId = Timeline("alice");

// ここで、selectedUserIdの値に応じて、alicesPostsとbobsPostsを切り替えたい
// しかし、mapでは実現できない...
// const currentUserPosts = selectedUserId.map(id => {
//   if (id === "alice") return alicesPosts; // Timelineを返してしまう
//   else return bobsPosts;
// });
```

`.map()`はあくまで値を変換するだけなので、`Timeline`そのものを切り替えることはできません。この、**依存関係の構造そのものを、動的に、かつ安全に（＝古い依存関係をクリーンアップしながら）切り替える**課題を解決するのが`.bind()`です。

## **`.bind()` — 依存関係を切り替える力**

`.bind()`の本質は、`.map()`のように単に値を変換するのではなく、**ソース`Timeline`の値に基づいて、次に接続すべき`Timeline`そのものを返す関数**を受け取ることです。

これにより、依存グラフの配線が時間と共に変化する、動的なシステムを構築できます。

### **API定義**

- **F\#**: `bind: ('a -> Timeline<'b>) -> Timeline<'a> -> Timeline<'b>`

- **TypeScript**: `.bind<B>(monadf: (value: A) => Timeline<B>): Timeline<B>`

引数に取る関数（`monadf`）が、値`A`を受け取り、**新しい`Timeline<B>`を返す**点が`.map()`との決定的な違いです。

### **実践例：SNSタイムラインの動的切り替え**

先ほどのSNSの例を、`.bind()`を使って実装してみましょう。

```typescript
const usersData = {
    "user123": { name: "Alice", posts: Timeline(["post1", "post2"]) },
    "user456": { name: "Bob", posts: Timeline(["post3", "post4"]) }
};

const selectedUserIdTimeline = Timeline<keyof typeof usersData>("user123");

// 選択されたユーザーIDに応じて、そのユーザーの投稿Timelineに接続を切り替える
const currentUserPostsTimeline = selectedUserIdTimeline.bind(
    userId => usersData[userId].posts
);

console.log("Initial user posts:", currentUserPostsTimeline.at(Now));
// > Initial user posts: ["post1", "post2"]

// ユーザー選択を切り替える
selectedUserIdTimeline.define(Now, "user456");

console.log("Switched user posts:", currentUserPostsTimeline.at(Now));
// > Switched user posts: ["post3", "post4"]
```

`selectedUserIdTimeline`の値が`"user123"`から`"user456"`に更新された瞬間、`currentUserPostsTimeline`の依存先が`usersData["user123"].posts`から`usersData["user456"].posts`へと、**動的に切り替わっている**のがわかります。

## **`DependencyCore`**

この動的な依存関係の切り替えは、どのようにして実現されているのでしょうか。その答えは、`Timeline`ライブラリの心臓部である\*\*`DependencyCore`\*\*にあります。

`DependencyCore`は、アプリケーション内に存在する全ての`Timeline`間の依存関係を記録・管理する、目に見えない中央管理システムです。`.map()`や`.link()`が静的な依存関係を登録するのに対し、`.bind()`はこの`DependencyCore`をより高度に利用します。

## **`Illusion` — 時間発展する依存グラフ**

`.bind()`がもたらす動的な依存関係の切り替えは、このライブラリの設計における、より深く、より強力な概念の現れです。それを理解するために、まず`map`と`bind`における「可変性」のレベルの違いを整理しましょう。

- **レベル1の可変性 (`map`/`link`の世界)**: 静的な依存関係では、`Timeline`オブジェクトそのものは不変の存在です。唯一「可変」なのは、`Now`という視点の移動に伴って更新される、内部の値 **`_last`** です。これは、ブロック宇宙における「現在の値」という、最小単位の\*\*イリュージョン（幻想）\*\*と言えます。

- **レベル2の可変性 (`bind`の世界)**: `.bind()`を導入すると、この可変性の概念が**拡張**されます。もはや`_last`という値だけが入れ替わるのではありません。`.bind()`が返す`innerTimeline`オブジェクトそのものが、ソースの値に応じて、まるごと入れ替わります。つまり、ある瞬間の「真実」を定義している\*\*`Timeline`自体が、一時的で、入れ替え可能な存在\*\*になるのです。

この「構造」レベルの可変性こそが、`Illusion`という概念の本質です。

概念的には、`bind`が返す結果の`Timeline`オブジェクト（例えば`currentUserPostsTimeline`）は、**最初に一度だけ生成される不変（Immutable）な存在**です。

しかし、我々の視点である`Now`が時間軸に沿って動く**可変な（Mutable）カーソル**であるのと全く同じ理由で、そのカーソルと常に同期している`innerTimeline`（例えば`"user123"`の投稿`Timeline`や`"user456"`の投稿`Timeline`）は、**可変でなければなりません**。

`innerTimeline`が「破壊」されなければならない根本的な理由は、**`Now`カーソルの移動と同期して、依存グラフそのものが時間発展しており、それぞれの時間座標においてグラフの構造が異なる**からです。

この、時間発展する依存グラフの「ある瞬間における状態」こそが\*\*`Illusion`\*\*です。そして、`Now`カーソルの移動と、この`Illusion`の書き換え（古いものの破棄と新しいものの生成）を同期させる作業を、`DependencyCore`が一括して命令的に管理しているのです。

つまり`Illusion`とは、`_last`という\*\*「値レベルの可変性」を、`innerTimeline`という「構造レベルの可変性」へと拡張した概念\*\*なのです。そして後続の章で`.using()`を導入する際には、この可変性の概念がさらに「外部リソースのライフサイクル」にまで拡張されていきます。

## **Canvasデモ (Placeholder)**

*(ここに`.bind()`による動的なタイムラインの切り替えを視覚的に示すインタラクティブなデモが配置されます。)*