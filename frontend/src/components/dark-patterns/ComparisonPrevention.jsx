import React from 'react';
import { usePattern, getPatternsByIntensity } from '../../contexts/PatternContext';

export default function ComparisonPrevention({ 
  patternEnabled = false, 
  patternIntensity = null 
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
  const isPatternEnabled = patterns?.comparisonPrevention ?? false;

  if (!isPatternEnabled) {
    return null;
  }

  const isHigh = intensity === 'high';
  const isLow = intensity === 'low';

  return (
    <div className="comparison-prevention" style={{
      border: isHigh ? '3px solid #E84118' : isLow ? '2px solid #f39c12' : '2px solid #E84118',
      boxShadow: isHigh ? '0 4px 16px rgba(232, 65, 24, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div className="confusing-layout" style={{
        background: isHigh ? 'linear-gradient(135deg, #fff5f5, #ffe0e0)' : 
                    isLow ? '#fffbf0' : 
                    'linear-gradient(135deg, #f5f6fa, #e8ecf1)',
        padding: isHigh ? '25px' : isLow ? '18px' : '20px'
      }}>
        <div className="price-section">
          <div className="price-main" style={{
            fontSize: isHigh ? '42px' : isLow ? '32px' : '36px',
            fontWeight: isHigh ? '900' : 'bold',
            color: isHigh ? '#E84118' : isLow ? '#f39c12' : '#E84118'
          }}>¥12,800</div>
          <div className="price-units" style={{
            fontSize: isHigh ? '16px' : isLow ? '13px' : '14px',
            fontWeight: isHigh ? 'bold' : 'normal'
          }}>{isHigh ? '（税込・送料別・その他費用別途）' : '（税込・送料別）'}</div>
          <div className="price-note" style={{
            fontSize: isHigh ? '14px' : isLow ? '12px' : '13px',
            fontWeight: isHigh ? 'bold' : 'normal',
            color: isHigh ? '#E84118' : '#666'
          }}>※価格は変動する場合があります{isHigh ? '（予告なく変更される可能性あり）' : ''}</div>
        </div>
        <div className="confusing-options" style={{
          marginTop: isHigh ? '20px' : '15px'
        }}>
          <div className="option-item" style={{
            background: isHigh ? '#fff' : '#f8f9fa',
            padding: isHigh ? '12px' : isLow ? '8px' : '10px',
            border: isHigh ? '2px solid #E84118' : '1px solid #ddd',
            borderRadius: '8px'
          }}>
            <span className="option-label" style={{
              fontSize: isHigh ? '16px' : isLow ? '13px' : '14px',
              fontWeight: isHigh ? 'bold' : 'normal'
            }}>{isHigh ? '基本プラン（スタンダード）' : '基本プラン'}</span>
            <span className="option-price" style={{
              fontSize: isHigh ? '18px' : isLow ? '14px' : '16px',
              fontWeight: isHigh ? '900' : 'bold',
              color: isHigh ? '#E84118' : '#333'
            }}>¥8,000/月</span>
          </div>
          <div className="option-item" style={{
            background: isHigh ? '#fff' : '#f8f9fa',
            padding: isHigh ? '12px' : isLow ? '8px' : '10px',
            border: isHigh ? '2px solid #E84118' : '1px solid #ddd',
            borderRadius: '8px',
            marginTop: '10px'
          }}>
            <span className="option-label" style={{
              fontSize: isHigh ? '16px' : isLow ? '13px' : '14px',
              fontWeight: isHigh ? 'bold' : 'normal'
            }}>{isHigh ? 'プレミアムプラン（おすすめ）' : 'プレミアムプラン'}</span>
            <span className="option-price" style={{
              fontSize: isHigh ? '18px' : isLow ? '14px' : '16px',
              fontWeight: isHigh ? '900' : 'bold',
              color: isHigh ? '#E84118' : '#333'
            }}>¥15,000/年</span>
          </div>
          <div className="option-item" style={{
            background: isHigh ? '#fff' : '#f8f9fa',
            padding: isHigh ? '12px' : isLow ? '8px' : '10px',
            border: isHigh ? '2px solid #E84118' : '1px solid #ddd',
            borderRadius: '8px',
            marginTop: '10px'
          }}>
            <span className="option-label" style={{
              fontSize: isHigh ? '16px' : isLow ? '13px' : '14px',
              fontWeight: isHigh ? 'bold' : 'normal'
            }}>{isHigh ? 'エンタープライズプラン（法人向け）' : 'エンタープライズ'}</span>
            <span className="option-price" style={{
              fontSize: isHigh ? '18px' : isLow ? '14px' : '16px',
              fontWeight: isHigh ? '900' : 'bold',
              color: isHigh ? '#E84118' : '#333'
            }}>お問い合わせ</span>
          </div>
        </div>
        <div className="confusing-features" style={{
          marginTop: isHigh ? '20px' : '15px'
        }}>
          <div className="feature-grid" style={{
            display: 'grid',
            gridTemplateColumns: isHigh ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isHigh ? '12px' : '8px'
          }}>
            <div className="feature-item" style={{
              padding: isHigh ? '10px' : isLow ? '6px' : '8px',
              background: isHigh ? '#fff5f5' : '#f8f9fa',
              borderRadius: '6px',
              fontSize: isHigh ? '15px' : isLow ? '12px' : '13px',
              fontWeight: isHigh ? 'bold' : 'normal'
            }}>✓ {isHigh ? '基本機能（全機能）' : '基本機能'}</div>
            <div className="feature-item" style={{
              padding: isHigh ? '10px' : isLow ? '6px' : '8px',
              background: isHigh ? '#fff5f5' : '#f8f9fa',
              borderRadius: '6px',
              fontSize: isHigh ? '15px' : isLow ? '12px' : '13px',
              fontWeight: isHigh ? 'bold' : 'normal'
            }}>✓ {isHigh ? 'サポート（24時間対応）' : 'サポート'}</div>
            <div className="feature-item" style={{
              padding: isHigh ? '10px' : isLow ? '6px' : '8px',
              background: isHigh ? '#fff5f5' : '#f8f9fa',
              borderRadius: '6px',
              fontSize: isHigh ? '15px' : isLow ? '12px' : '13px',
              fontWeight: isHigh ? 'bold' : 'normal'
            }}>✓ {isHigh ? 'アップデート（自動）' : 'アップデート'}</div>
            <div className="feature-item" style={{
              padding: isHigh ? '10px' : isLow ? '6px' : '8px',
              background: isHigh ? '#fff5f5' : '#f8f9fa',
              borderRadius: '6px',
              fontSize: isHigh ? '15px' : isLow ? '12px' : '13px',
              fontWeight: isHigh ? 'bold' : 'normal'
            }}>✓ {isHigh ? 'カスタマイズ（無制限）' : 'カスタマイズ'}</div>
          </div>
        </div>
      </div>
      <div className="comparison-warning" style={{
        background: isHigh ? 'linear-gradient(135deg, #fff3cd, #ffe69c)' : 
                    isLow ? '#f8f9fa' : 
                    '#fff3e0',
        border: isHigh ? '2px solid #ffc107' : '1px solid #ddd',
        padding: isHigh ? '12px' : isLow ? '8px' : '10px',
        borderRadius: '0 0 8px 8px',
        fontSize: isHigh ? '15px' : isLow ? '12px' : '13px',
        fontWeight: isHigh ? 'bold' : 'normal',
        color: isHigh ? '#856404' : '#666',
        textAlign: 'center'
      }}>
        <span className="warning-text">
          {isHigh ? '⚠️※他社との比較は禁止されています（利用規約により）' :
           isLow ? '※他社との比較は禁止されています' :
           '※他社との比較は禁止されています'}
        </span>
      </div>
    </div>
  );
}
