:::lang-en

# Chapter 5: `n`-Series Composition Functions

The `n`-series composition functions defined in `timeline.ts` are as follows.

### Binary Operations

- **`nCombineLatestWith`**: Combines two nullable `Timeline`s by applying a binary operation function only if both values are not null.

### Aggregate Operations

- **`nAnyOf`**: Computes the logical OR of multiple nullable `boolean` `Timeline`s.
- **`nAllOf`**: Computes the logical AND of multiple nullable `boolean` `Timeline`s.
- **`nSumOf`**: Computes the sum of multiple nullable `number` `Timeline`s.
- **`nListOf`**: Combines multiple nullable `Timeline`s into a single nullable `Timeline` holding an array of their values.

### N-ary Operations

- **`nCombineLatest`**: Combines an arbitrary number of nullable `Timeline`s by applying an N-ary composition function only if all values are not null.

:::

:::lang-ja

# Chapter 5: `n`シリーズ合成関数

`timeline.ts`に定義されている`n`シリーズ合成関数は、以下の通りです。

### 2項演算

- **`nCombineLatestWith`**: 2つのNull許容`Timeline`を、両方の値がNullでない場合にのみ2項演算関数を適用して合成します。

### 集約演算

- **`nAnyOf`**: 複数のNull許容`boolean` `Timeline`の論理和を計算します。
- **`nAllOf`**: 複数のNull許容`boolean` `Timeline`の論理積を計算します。
- **`nSumOf`**: 複数のNull許容`number` `Timeline`の合計値を計算します。
- **`nListOf`**: 複数のNull許容`Timeline`を、値の配列を持つ単一のNull許容`Timeline`にまとめます。

### N項演算

- **`nCombineLatest`**: 任意個のNull許容`Timeline`を、すべての値がNullでない場合にのみN項の合成関数を適用して合成します。

:::