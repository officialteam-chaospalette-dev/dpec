import React, { useEffect } from 'react';
import { useLogging } from '../../contexts/LoggingContext';
import { usePattern, getPatternsByIntensity } from '../../contexts/PatternContext';

export default function FakeSocialProof({ 
  patternEnabled = false, 
  patternIntensity = null,
  location = 'product_list' 
}) {
  const { markPatternUsed } = useLogging();

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
  const isPatternEnabled = patterns?.fakeSocialProof ?? false;

  useEffect(() => {
    if (isPatternEnabled) {
      markPatternUsed('fake_social_proof', location);
    }
  }, [isPatternEnabled, location, markPatternUsed]);

  if (!isPatternEnabled) {
    return null;
  }

  const isHigh = intensity === 'high';
  const isLow = intensity === 'low';

  // 強度に応じて数値を変更
  const viewerCount = isHigh ? '3,247' : isLow ? '247' : '1,247';
  const satisfactionRate = isHigh ? '99%' : isLow ? '95%' : '98%';

  return (
    <div className="fake-social-proof" style={{
      background: isHigh ? 'linear-gradient(135deg, #fff5f5, #ffe0e0)' : 
                  isLow ? '#fffbf0' : 
                  'linear-gradient(135deg, #f5f6fa, #e8ecf1)',
      border: isHigh ? '3px solid #E84118' : isLow ? '2px solid #f39c12' : '2px solid #E84118',
      boxShadow: isHigh ? '0 4px 16px rgba(232, 65, 24, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div className="social-proof-badge" style={{
        background: isHigh ? 'linear-gradient(135deg, #E84118, #c23616)' : 
                    isLow ? 'linear-gradient(135deg, #f39c12, #e67e22)' : 
                    'linear-gradient(135deg, #E84118, #c23616)',
        fontSize: isHigh ? '16px' : isLow ? '13px' : '14px',
        padding: isHigh ? '8px 16px' : isLow ? '6px 12px' : '7px 14px'
      }}>
        <span className="social-proof-icon">{isHigh ? '🔥🔥' : '🔥'}</span>
        <span className="social-proof-text">{isHigh ? '🔥今すぐ購入中！大流行中！' : '今すぐ購入中'}</span>
      </div>
      <div className="social-proof-stats">
        <div className="stat-item">
          <span className="stat-number" style={{
            fontSize: isHigh ? '28px' : isLow ? '20px' : '24px',
            fontWeight: isHigh ? '900' : 'bold'
          }}>{viewerCount}</span>
          <span className="stat-label" style={{
            fontSize: isHigh ? '14px' : isLow ? '12px' : '13px',
            fontWeight: isHigh ? 'bold' : 'normal'
          }}>{isHigh ? '人が今すぐ購入を検討中！' : '人が今見ています'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{
            fontSize: isHigh ? '28px' : isLow ? '20px' : '24px',
            fontWeight: isHigh ? '900' : 'bold',
            color: isHigh ? '#E84118' : isLow ? '#f39c12' : '#E84118'
          }}>{satisfactionRate}</span>
          <span className="stat-label" style={{
            fontSize: isHigh ? '14px' : isLow ? '12px' : '13px',
            fontWeight: isHigh ? 'bold' : 'normal'
          }}>{isHigh ? '超高満足度！' : '満足度'}</span>
        </div>
      </div>
      <div className="social-proof-testimonials">
        {isHigh && (
          <div className="testimonial" style={{
            background: '#fff',
            padding: '10px',
            borderRadius: '8px',
            border: '2px solid #E84118',
            marginBottom: '8px'
          }}>
            <span className="testimonial-text" style={{ fontWeight: 'bold' }}>"信じられないほど良い！"</span>
            <span className="testimonial-author">- 山田さん ⭐⭐⭐⭐⭐</span>
          </div>
        )}
        <div className="testimonial">
          <span className="testimonial-text">{isHigh ? '"最高の商品です！" ⭐⭐⭐⭐⭐' : '"最高の商品です！"'}</span>
          <span className="testimonial-author">- 田中さん</span>
        </div>
        <div className="testimonial">
          <span className="testimonial-text">{isHigh ? '"すぐに届きました！大満足！"' : '"すぐに届きました"'}</span>
          <span className="testimonial-author">- 佐藤さん</span>
        </div>
      </div>
    </div>
  );
}
