import React, { useState, useEffect, useMemo } from 'react';
import { useLogging } from '../../contexts/LoggingContext';
import { usePattern, getPatternsByIntensity } from '../../contexts/PatternContext';
import { PRODUCTS } from '../../data/products';

export default function HiddenCosts({ 
  patternEnabled = false, 
  patternIntensity = null,
  basePrice = 0,
  product = null,
  items = [],
  selectedSKUs = [],
  selectedOptions = {
    warranty: false,
    insurance: false,
    newsletter: false,
    premiumSupport: false
  },
  onTotalChange = null
}) {
  // PatternContextから強度を取得（フォールバックとしてpropsも使用）
  let intensity = 'low';
  let patterns = null;
  try {
    const context = usePattern();
    intensity = context?.patternIntensity || (patternEnabled ? (patternIntensity || 'low') : 'low');
    patterns = getPatternsByIntensity(intensity);
  } catch {
    intensity = patternEnabled ? (patternIntensity || 'low') : 'low';
    patterns = getPatternsByIntensity(intensity);
  }

  // このダークパターンが有効かどうかを確認（中度・重度のみ）
  const isPatternEnabled = patterns?.hiddenCosts ?? false;

  // 商品価格を計算（選択されたSKUの価格を使用）
  const calculatedBasePrice = useMemo(() => {
    let price = basePrice; // デフォルトはpropsから
    
    if (product) {
      const selectedSKU = selectedSKUs.find(sku => sku.productId === product.id);
      if (selectedSKU) {
        price = selectedSKU.skuPrice;
      } else if (product.price) {
        price = product.price;
      }
    } else if (items && items.length > 0) {
      // カートの場合、商品価格の合計を計算
      price = items.reduce((sum, it) => {
        const selectedSKU = selectedSKUs.find(sku => sku.productId === (it.productId || it.id));
        if (selectedSKU) {
          return sum + (selectedSKU.skuPrice * (it.quantity || 1));
        }
        return sum + (it.price * (it.quantity || 1));
      }, 0);
    }
    
    return price;
  }, [basePrice, product, items, selectedSKUs]);

  // 現在選択されているSKUの送料を取得
  const currentShippingCost = useMemo(() => {
    let shippingCost = 500; // デフォルト送料
    
    if (product) {
      const productData = PRODUCTS.find(p => p.id === product.id);
      if (productData && productData.skus) {
        const selectedSKU = selectedSKUs.find(sku => sku.productId === product.id);
        if (selectedSKU) {
          const skuData = productData.skus.find(sku => sku.id === selectedSKU.skuId);
          if (skuData && skuData.shippingCost) {
            shippingCost = skuData.shippingCost;
          }
        } else if (productData.skus.length > 0) {
          // デフォルトで最初のSKUの送料を取得
          const firstSku = productData.skus[0];
          if (firstSku && firstSku.shippingCost) {
            shippingCost = firstSku.shippingCost;
          }
        }
      }
    } else if (items && items.length > 0) {
      const mainItem = items[0];
      const productData = PRODUCTS.find(p => p.id === mainItem.productId || p.id === mainItem.id);
      if (productData && productData.skus) {
        const selectedSKU = selectedSKUs.find(sku => sku.productId === (mainItem.productId || mainItem.id));
        if (selectedSKU) {
          const skuData = productData.skus.find(sku => sku.id === selectedSKU.skuId);
          if (skuData && skuData.shippingCost) {
            shippingCost = skuData.shippingCost;
          }
        } else if (productData.skus.length > 0) {
          const firstSku = productData.skus[0];
          if (firstSku && firstSku.shippingCost) {
            shippingCost = firstSku.shippingCost;
          }
        }
      }
    }
    
    return shippingCost;
  }, [product, items, selectedSKUs]);

  // 送料が高いかどうか（500円より高い場合）
  const hasHighShipping = currentShippingCost > 500;
  const standardShipping = 500;

  // 強度に応じて遅延時間を変更
  const getIntensityValues = (int) => {
    if (int === 'high') {
      return { delay: 3000 }; // 3秒後
    } else {
      return { delay: 2000 }; // 2秒後（medium）
    }
  };

  const { delay } = getIntensityValues(intensity);
  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const { markPatternUsed } = useLogging();

  useEffect(() => {
    if (!isPatternEnabled || !hasHighShipping) return;

    markPatternUsed('hidden_costs', 'checkout');

    const timer = setTimeout(() => {
      setShowShippingInfo(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPatternEnabled, hasHighShipping, intensity, delay, markPatternUsed]);

  const isHigh = intensity === 'high';
  const isMedium = intensity === 'medium';
  
  // オプション料金を計算
  const optionPrice = useMemo(() => {
    let price = 0;
    if (selectedOptions.warranty) price += 2000;
    if (selectedOptions.insurance) price += 1500;
    if (selectedOptions.premiumSupport) price += 3000;
    return price;
  }, [selectedOptions]);
  
  const totalCost = calculatedBasePrice + optionPrice + currentShippingCost + 200; // 商品価格 + オプション料金 + 送料 + 手数料

  // 合計金額を親コンポーネントに通知
  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(totalCost);
    }
  }, [totalCost, onTotalChange]);

  // パターンが無効、または送料が高くない場合は標準表示
  if (!isPatternEnabled || !hasHighShipping) {
    return (
      <div className="hidden-costs-clean">
        <h3>料金詳細</h3>
        <div className="cost-breakdown">
          <div className="cost-item">
            <span>商品価格</span>
            <span>¥{calculatedBasePrice.toLocaleString()}</span>
          </div>
          <div className="cost-item">
            <span>送料</span>
            <span>¥{standardShipping.toLocaleString()}</span>
          </div>
          <div className="cost-item">
            <span>手数料</span>
            <span>¥200</span>
          </div>
          {(() => {
            // オプション料金を計算
            let optPrice = 0
            if (selectedOptions.warranty) optPrice += 2000
            if (selectedOptions.insurance) optPrice += 1500
            if (selectedOptions.premiumSupport) optPrice += 3000
            return (
              <>
                {optPrice > 0 && (
                  <div className="cost-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <span>オプション料金</span>
                    <span>¥{optPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="cost-item total">
                  <span>合計</span>
                  <span>¥{(calculatedBasePrice + optPrice + standardShipping + 200).toLocaleString()}</span>
                </div>
              </>
            )
          })()}
        </div>
      </div>
    );
  }

  // 送料が高い場合の表示
  return (
    <div className="hidden-costs-dark" style={{
      border: isHigh ? '3px solid #E84118' : '2px solid #E84118',
      boxShadow: isHigh ? '0 4px 16px rgba(232, 65, 24, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
      padding: isHigh ? '20px' : '18px',
      borderRadius: '12px',
      background: isHigh ? 'linear-gradient(135deg, #fff5f5, #ffe0e0)' : 'linear-gradient(135deg, #f5f6fa, #e8ecf1)'
    }}>
      <div className="price-display" style={{
        padding: isHigh ? '20px' : '18px',
        background: 'white',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <div className="main-price" style={{
          fontSize: isHigh ? '36px' : '32px',
          fontWeight: '900',
          color: '#2d3748'
        }}>¥{calculatedBasePrice.toLocaleString()}</div>
        <div className="price-note" style={{
          fontSize: isHigh ? '16px' : '14px',
          color: '#666',
          marginTop: '8px'
        }}>税込価格</div>
      </div>
      
      {showShippingInfo && !isHigh && (
        <div className="shipping-cost-info" style={{
          background: '#fff3e0',
          border: '1px solid #ffc107',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#E84118'
          }}>
            <span style={{ marginRight: '8px' }}>⚠️</span>
            <span>送料について</span>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#333',
            lineHeight: '1.6'
          }}>
            選択された商品は通常送料¥{standardShipping.toLocaleString()}ですが、
            このSKUは送料が<strong style={{ color: '#E84118' }}>¥{currentShippingCost.toLocaleString()}</strong>となります。
          </div>
        </div>
      )}

      <div className="cost-breakdown" style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <div className="cost-item" style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <span>商品価格</span>
          <span>¥{calculatedBasePrice.toLocaleString()}</span>
        </div>
        <div className="cost-item" style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <span>送料</span>
          <span style={{ color: hasHighShipping ? '#E84118' : '#333', fontWeight: hasHighShipping ? 'bold' : 'normal' }}>
            ¥{currentShippingCost.toLocaleString()}
          </span>
        </div>
          <div className="cost-item" style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <span>手数料</span>
          <span>¥200</span>
        </div>
        {optionPrice > 0 && (
          <div className="cost-item" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <span>オプション料金</span>
            <span>¥{optionPrice.toLocaleString()}</span>
          </div>
        )}
        <div className="cost-item total" style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '15px 0 0 0',
          marginTop: '10px',
          borderTop: isHigh ? '3px solid #E84118' : '2px solid #E84118',
          fontSize: isHigh ? '24px' : '20px',
          fontWeight: '900',
          color: '#E84118'
        }}>
          <span>合計</span>
          <span>¥{totalCost.toLocaleString()}</span>
        </div>
      </div>

      <div className="hidden-costs-note" style={{
        fontSize: isHigh ? '14px' : '13px',
        fontWeight: 'normal',
        color: '#666',
        marginTop: '15px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '6px'
      }}>
        <span className="note-text">
          {isHigh ? '※送料は商品のSKUによって異なります。最終的な料金は決済時に確定します。' :
           '※送料は商品のSKUによって異なります。'}
        </span>
      </div>
    </div>
  );
}
