import React, { useState, useEffect } from 'react';
import { useLogging } from '../../contexts/LoggingContext';
import { usePattern, getPatternsByIntensity } from '../../contexts/PatternContext';

export default function Preselection({ 
  patternEnabled = false, 
  patternIntensity = null,
  onSelectionChange, 
  location = 'checkout', 
  defaultOptions, 
  optionOrder, 
  selectedOptions: externalSelectedOptions 
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
  
  // このダークパターンが有効かどうかを確認
  const isPatternEnabled = patterns?.preselection ?? false;

  // 強度に応じてデフォルトオプションを設定
  const getDefaultOptionsByIntensity = () => {
    if (!isPatternEnabled) {
      return {
        warranty: false,
        insurance: false,
        newsletter: false,
        premiumSupport: false
      };
    } else if (intensity === 'low') {
      return {
        warranty: true,  // 軽度: 低価格オプションのみ
        insurance: false,
        newsletter: false,
        premiumSupport: false
      };
    } else if (intensity === 'medium') {
      return {
        warranty: true,
        insurance: true,
        newsletter: true,
        premiumSupport: false  // 中度: 高価格オプションは除外
      };
    } else { // 'high'
      return {
        warranty: true,
        insurance: true,
        newsletter: true,
        premiumSupport: true  // 重度: すべてのオプション
      };
    }
  };

  // 外部からselectedOptionsが渡されている場合はそれを使用、そうでなければ内部状態を使用
  const [internalSelectedOptions, setInternalSelectedOptions] = useState(
    defaultOptions || getDefaultOptionsByIntensity()
  );
  
  const selectedOptions = externalSelectedOptions !== undefined ? externalSelectedOptions : internalSelectedOptions;
  const setSelectedOptions = externalSelectedOptions !== undefined ? onSelectionChange : setInternalSelectedOptions;
  
  const { markPatternUsed, logOptionSelection } = useLogging();

  useEffect(() => {
    if (isPatternEnabled) {
      markPatternUsed('preselection', location);
    }
  }, [isPatternEnabled, location, markPatternUsed]);

  const handleOptionChange = (option, value) => {
    const newSelection = { ...selectedOptions, [option]: value };
    if (externalSelectedOptions !== undefined && onSelectionChange) {
      onSelectionChange(newSelection);
    } else {
      setSelectedOptions(newSelection);
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
    }
    // オプション選択をログに記録
    const currentDefaultOptions = defaultOptions || getDefaultOptionsByIntensity();
    if (logOptionSelection) {
      logOptionSelection(newSelection, currentDefaultOptions);
    }
  };
  
  // オプションの定義
  const optionDefinitions = {
    warranty: {
      name: '延長保証',
      price: '+¥2,000',
      benefit: '故障時無料交換',
      priceValue: 2000,
      cleanName: '延長保証（+¥2,000）'
    },
    insurance: {
      name: '損害保険',
      price: '+¥1,500',
      benefit: '破損時補償',
      priceValue: 1500,
      cleanName: '損害保険（+¥1,500）'
    },
    newsletter: {
      name: 'ニュースレター',
      price: '無料',
      benefit: '最新情報をお届け',
      priceValue: 0,
      cleanName: 'ニュースレター配信'
    },
    premiumSupport: {
      name: 'プレミアムサポート',
      price: '+¥3,000',
      benefit: '24時間サポート',
      priceValue: 3000,
      cleanName: 'プレミアムサポート（+¥3,000）'
    }
  };
  
  // オプションの順序を決定（商品ごとの順序がある場合はそれを使用）
  const getOptionOrder = () => {
    if (optionOrder && optionOrder.length > 0) {
      return optionOrder;
    }
    return ['warranty', 'insurance', 'newsletter', 'premiumSupport'];
  };
  
  const orderedOptions = getOptionOrder();

  // 無効時: クリーンな表示
  if (!isPatternEnabled) {
    return (
      <div className="preselection-clean">
        <h3>オプション選択</h3>
        <div className="option-group">
          {orderedOptions.map((optionKey) => {
            const option = optionDefinitions[optionKey];
            if (!option) return null;
            
            return (
              <label key={optionKey} className="option-label">
                <input 
                  type="checkbox" 
                  checked={selectedOptions[optionKey] || false}
                  onChange={(e) => handleOptionChange(optionKey, e.target.checked)}
                />
                {option.cleanName || option.name}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  // 有効時: 強度に応じて異なる表示
  const isHigh = intensity === 'high';
  const isLow = intensity === 'low';

  return (
    <div className="preselection-dark">
      <div className="preselection-header">
        <h3>{isHigh ? '今すぐ追加！お得なオプション' : 'お得なオプション'}</h3>
        <span className="preselection-badge" style={{
          background: isHigh ? 'linear-gradient(135deg, #E84118, #c23616)' : 
                      isLow ? 'linear-gradient(135deg, #f39c12, #e67e22)' : 
                      'linear-gradient(135deg, #E84118, #c23616)',
          fontSize: isHigh ? '14px' : '12px',
          padding: isHigh ? '6px 14px' : '5px 12px'
        }}>
          {isHigh ? '🔥限定' : isLow ? 'おすすめ' : 'おすすめ'}
        </span>
      </div>
      {isHigh && (
        <div style={{
          background: 'linear-gradient(135deg, #fff3cd, #ffe69c)',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '10px',
          border: '2px solid #ffc107',
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#856404'
        }}>
          ⚡ 今すぐ追加でさらにお得！
        </div>
      )}
      <div className="preselection-options">
        {orderedOptions.map((optionKey) => {
          const option = optionDefinitions[optionKey];
          if (!option) return null;
          const isSelected = selectedOptions[optionKey] || false;
          
          return (
            <div 
              key={optionKey} 
              className="preselected-option"
              style={{
                border: isHigh && isSelected ? '3px solid #E84118' : 
                        isLow && isSelected ? '2px solid #f39c12' : 
                        isSelected ? '2px solid #E84118' : '1px solid #ddd',
                background: isHigh && isSelected ? 'linear-gradient(135deg, #fff5f5, #ffe0e0)' : 
                           isLow && isSelected ? '#fffbf0' : 
                           isSelected ? '#fff5f5' : '#fff',
                boxShadow: isHigh && isSelected ? '0 4px 12px rgba(232, 65, 24, 0.3)' : 
                          isLow && isSelected ? '0 2px 6px rgba(243, 156, 18, 0.2)' : 
                          isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <label className="preselected-label">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={(e) => handleOptionChange(optionKey, e.target.checked)}
                  className="preselected-checkbox"
                />
                <span className="option-text">
                  <span className="option-name" style={{
                    fontWeight: isHigh ? '900' : isLow ? '600' : 'bold',
                    fontSize: isHigh ? '16px' : isLow ? '14px' : '15px'
                  }}>{option.name}</span>
                  <span className="option-price" style={{
                    color: isHigh ? '#E84118' : isLow ? '#f39c12' : '#E84118',
                    fontWeight: isHigh ? '900' : 'bold'
                  }}>{option.price}</span>
                </span>
                <span className="option-benefit" style={{
                  fontSize: isHigh ? '13px' : isLow ? '12px' : '12px',
                  fontWeight: isHigh ? 'bold' : 'normal'
                }}>{option.benefit}</span>
                {isHigh && isSelected && (
                  <span style={{
                    background: '#E84118',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    marginLeft: '8px',
                    fontWeight: 'bold'
                  }}>✓ 選択済み</span>
                )}
              </label>
            </div>
          );
        })}
      </div>
      <div className="preselection-note" style={{
        fontSize: isHigh ? '14px' : isLow ? '12px' : '13px',
        fontWeight: isHigh ? 'bold' : 'normal',
        color: isHigh ? '#E84118' : '#666'
      }}>
        <span className="note-text">
          {isHigh ? '※選択したオプションは自動的にカートに追加されます（お得な今だけのオファー）' :
           isLow ? '※選択したオプションは自動的にカートに追加されます' :
           '※選択したオプションは自動的にカートに追加されます'}
        </span>
      </div>
    </div>
  );
}
