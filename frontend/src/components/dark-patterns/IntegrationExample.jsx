import React, { useState } from 'react';
import FakeSocialProof from './FakeSocialProof';
import FakeScarcity from './FakeScarcity';
import ComparisonPrevention from './ComparisonPrevention';
import Preselection from './Preselection';
import HiddenCosts from './HiddenCosts';
import Sneaking from './Sneaking';
import PatternToggle from './PatternToggle';
import '../styles/DarkPatternStyles.css';

/**
 * Integration Example Component
 * 
 * This component demonstrates how to integrate all dark pattern components
 * into your e-commerce application with proper cognitive mapping.
 */
export default function IntegrationExample() {
  const [patternEnabled, setPatternEnabled] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleSneakAccept = () => {
    console.log('Sneaking pattern accepted - user added premium service');
    // Add premium service to cart or update user preferences
  };

  return (
    <div className="integration-example">
      <h1>ダークパターン統合例</h1>
      
      {/* Pattern Toggle Control */}
      <PatternToggle 
        patternEnabled={patternEnabled} 
        onToggle={setPatternEnabled} 
      />

      {/* Product List Section */}
      <section className="product-section">
        <h2>商品一覧での使用例</h2>
        
        {/* Fake Social Proof - 言語思考型, 物体視覚思考型 */}
        <FakeSocialProof patternEnabled={patternEnabled} />
        
        {/* Fake Scarcity - 物体視覚思考型 */}
        <FakeScarcity patternEnabled={patternEnabled} />
        
        {/* Comparison Prevention - 空間視覚思考型 */}
        <ComparisonPrevention patternEnabled={patternEnabled} />
      </section>

      {/* Product Detail Section */}
      <section className="product-section">
        <h2>商品詳細での使用例</h2>
        
        {/* Hidden Costs - 言語思考型 */}
        <HiddenCosts patternEnabled={patternEnabled} basePrice={15000} />
        
        {/* Preselection - 空間視覚思考型 */}
        <Preselection 
          patternEnabled={patternEnabled} 
          onSelectionChange={setSelectedOptions}
        />
      </section>

      {/* Checkout Section */}
      <section className="product-section">
        <h2>決済画面での使用例</h2>
        
        {/* Sneaking - 言語思考型, 空間視覚思考型 */}
        <Sneaking 
          patternEnabled={patternEnabled}
          onSneakAccept={handleSneakAccept}
        />
      </section>

      {/* Integration Notes */}
      <div className="integration-notes">
        <h3>統合時の注意点</h3>
        <ul>
          <li>各コンポーネントは<code>patternEnabled</code>プロパティで制御</li>
          <li>認知スタイルに応じて適切な場所に配置</li>
          <li>ユーザーエクスペリエンスを考慮した配置</li>
          <li>アクセシビリティの確保</li>
          <li>パフォーマンスへの影響を考慮</li>
        </ul>
      </div>
    </div>
  );
}

