# Dark Pattern Components - Cognitive Mapping Implementation

This directory contains React components implementing various dark patterns with cognitive mapping targeting specific thinking styles.

## Components Overview

### 1. FakeSocialProof.jsx
**Target Cognitive Styles:** 言語思考型 (Linguistic), 物体視覚思考型 (Object Visual)
- **Purpose:** Creates false social validation and urgency
- **Activation:** Product list, product detail, cart, checkout
- **Visual Elements:** Live user count, satisfaction percentage, testimonials
- **Psychological Impact:** Social proof bias, FOMO (Fear of Missing Out)

### 2. FakeScarcity.jsx
**Target Cognitive Styles:** 物体視覚思考型 (Object Visual)
- **Purpose:** Creates artificial time pressure and limited availability
- **Activation:** Product list, product detail, cart, checkout
- **Visual Elements:** Countdown timer, stock indicators, urgency messages
- **Psychological Impact:** Scarcity bias, time pressure

### 3. ComparisonPrevention.jsx
**Target Cognitive Styles:** 空間視覚思考型 (Spatial Visual)
- **Purpose:** Makes price comparison difficult through confusing layouts
- **Activation:** Product list (first item only)
- **Visual Elements:** Inconsistent pricing units, confusing feature grids
- **Psychological Impact:** Decision paralysis, cognitive overload

### 4. Preselection.jsx
**Target Cognitive Styles:** 空間視覚思考型 (Spatial Visual)
- **Purpose:** Pre-selects additional options to increase conversion
- **Activation:** Product detail, cart, checkout
- **Visual Elements:** Pre-checked boxes, highlighted "recommended" options
- **Psychological Impact:** Default bias, status quo bias

### 5. HiddenCosts.jsx
**Target Cognitive Styles:** 言語思考型 (Linguistic)
- **Purpose:** Delays/reveals additional costs to manipulate decision making
- **Activation:** Product detail, checkout
- **Visual Elements:** Delayed cost revelation, hidden fees
- **Psychological Impact:** Anchoring bias, sunk cost fallacy

### 6. Sneaking.jsx
**Target Cognitive Styles:** 言語思考型 (Linguistic), 空間視覚思考型 (Spatial Visual)
- **Purpose:** Subtle modal offering additional benefits
- **Activation:** Product detail, checkout
- **Visual Elements:** Modal overlay, benefit highlights
- **Psychological Impact:** Reciprocity, additional value perception

## Usage

Each component accepts a `patternEnabled` prop (boolean) for backward compatibility, but now uses intensity levels (`patternIntensity`) from `PatternContext`:

```jsx
// 後方互換性: patternEnabledプロップも使用可能
<FakeSocialProof patternEnabled={true} />
<FakeScarcity patternEnabled={false} />

// 推奨: PatternContextを使用して強度レベルを管理
// コンポーネントは自動的にPatternContextから強度を取得します
<FakeSocialProof />
<FakeScarcity />
```

### Pattern Intensity Levels

ダークパターンは4つの強度レベルで制御できます：

- **`none`**: ダークパターン無効（クリーンな表示）
- **`low`**: 軽度（控えめなダークパターン、弱い影響）
- **`medium`**: 中度（標準的なダークパターン、中程度の影響）
- **`high`**: 重度（強力なダークパターン、強い影響）

### Pattern Toggle Control

Use the `PatternToggle` component to control all patterns with intensity levels:

```jsx
import PatternToggle from '../components/dark-patterns/PatternToggle';
import { PatternProvider } from '../../contexts/PatternContext';

// PatternProviderでラップして使用
<PatternProvider>
  <PatternToggle />
</PatternProvider>
```

`PatternToggle`コンポーネントは、強度レベルを切り替えられるドロップダウンメニューを提供します。

### Intensity Level Behavior

各ダークパターンコンポーネントは、強度レベルに応じて異なる表示をします：

#### Preselection
- **`none`**: オプションはすべてオフ（クリーンな表示）
- **`low`**: 低価格オプション（延長保証）のみ事前選択
- **`medium`**: 低・中価格オプションと無料オプションを事前選択
- **`high`**: すべてのオプションを事前選択、強力な視覚的強調

#### FakeSocialProof
- **`none`**: 表示なし
- **`low`**: 控えめな購入者数表示（247人、95%満足度）
- **`medium`**: 標準的な表示（1,247人、98%満足度）
- **`high`**: 強力な表示（3,247人、99%満足度、追加のレビュー）

#### FakeScarcity
- **`none`**: 表示なし
- **`low`**: 控えめなタイマー（15分、残り8個）
- **`medium`**: 標準的なタイマー（10分、残り3個）
- **`high`**: 強力なタイマー（5分、残り1個）、緊急性を強調

#### HiddenCosts
- **`none`**: すべての費用を最初から表示（送料500円、手数料200円）
- **`low`**: 1秒後に費用を表示、追加250円
- **`medium`**: 2秒後に費用を表示、追加450円
- **`high`**: 4秒後に費用を表示、追加450円、強力な警告

#### Sneaking
- **`none`**: 表示なし
- **`low`**: 5秒後に表示、10秒後に再表示
- **`medium`**: 3秒後に表示、5秒後に再表示
- **`high`**: 1秒後に表示、3秒後に再表示、強力な視覚的強調

#### ComparisonPrevention
- **`none`**: 表示なし
- **`low`**: 控えめな価格表示の混乱
- **`medium`**: 標準的な価格表示の混乱
- **`high`**: 強力な価格表示の混乱、追加の警告メッセージ

## Integration Points

### ProductList.jsx
- **FakeSocialProof:** Creates urgency and social validation
- **FakeScarcity:** Time pressure and limited availability
- **ComparisonPrevention:** Confusing pricing layout (first product only)

### ProductDetail.jsx
- **FakeSocialProof:** Social validation on product page
- **FakeScarcity:** Time pressure for purchase decision
- **HiddenCosts:** Delayed cost revelation
- **Preselection:** Pre-selected additional options
- **Sneaking:** Additional benefits modal

### Cart.jsx
- **FakeSocialProof:** Final social validation before checkout
- **FakeScarcity:** Urgency to complete purchase
- **Preselection:** Additional services in cart

### Checkout.jsx
- **FakeSocialProof:** Final social validation
- **FakeScarcity:** Final urgency push
- **HiddenCosts:** Reveals additional costs
- **Preselection:** Additional services during checkout
- **Sneaking:** Final attempt to add services

## Styling

All components use consistent styling defined in `DarkPatternStyles.css`:
- **Font:** "Noto Sans JP", sans-serif
- **Primary Colors:** #E84118 (red), #273C75 (blue), #F5F6FA (background)
- **Spacing:** gap: 8px; margin: 8px 0
- **Shadows:** box-shadow: 0 2px 4px rgba(0,0,0,0.1)

## Cognitive Mapping Reference

| Pattern | Stimulus | Target Style |
|----------|-----------|--------------|
| Fake Social Proof | Text + Visual emphasis | 言語思考型, 物体視覚思考型 |
| Fake Scarcity | Red color + Numbers + Timer | 物体視覚思考型 |
| Comparison Prevention | Layout confusion + inconsistent units | 空間視覚思考型 |
| Preselection | Default ON checkbox | 空間視覚思考型 |
| Hidden Costs | Delayed/revealed text | 言語思考型 |
| Sneaking | Subtle modal + wording | 言語思考型, 空間視覚思考型 |

## Ethical Considerations

These components are designed for research and educational purposes to:
1. Study the psychological impact of dark patterns
2. Understand cognitive biases in e-commerce
3. Develop countermeasures and ethical design practices
4. Train developers to recognize and avoid dark patterns

**Important:** These patterns should not be used in production environments without proper ethical review and user consent mechanisms.
