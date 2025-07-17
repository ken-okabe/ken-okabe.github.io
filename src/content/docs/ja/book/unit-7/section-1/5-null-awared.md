---
title: 'Chapter 5: nシリーズ合成関数'
description: timeline.tsに定義されているnシリーズ合成関数は、以下の通りです。
---
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
