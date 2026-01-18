import React, { useState, useEffect } from 'react';
import { usePattern, getPatternsByIntensity } from '../../contexts/PatternContext';

export default function Sneaking({ 
  patternEnabled = false, 
  patternIntensity = null,
  onSneakAccept 
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
  const isPatternEnabled = patterns?.sneaking ?? false;

  // 強度に応じて表示タイミングと再表示タイミングを変更
  const getIntensityValues = (int) => {
    if (int === 'high') {
      return { delay: 1000, redisplayDelay: 3000 }; // 1秒後、3秒後に再表示
    } else if (int === 'low') {
      return { delay: 5000, redisplayDelay: 10000 }; // 5秒後、10秒後に再表示
    } else {
      return { delay: 3000, redisplayDelay: 5000 }; // 3秒後、5秒後に再表示（medium）
    }
  };

  const { delay, redisplayDelay } = getIntensityValues(intensity);
  const [showModal, setShowModal] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (!isPatternEnabled) return;

    const timer = setTimeout(() => {
      setShowModal(true);
    }, delay);

    setTimeoutId(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPatternEnabled, intensity, delay]);

  const handleAccept = () => {
    setShowModal(false);
    if (onSneakAccept) {
      onSneakAccept();
    }
  };

  const handleDecline = () => {
    setShowModal(false);
    // 強度に応じて再表示
    const timer = setTimeout(() => {
      setShowModal(true);
    }, redisplayDelay);
    setTimeoutId(timer);
  };

  if (!isPatternEnabled || !showModal) {
    return null;
  }

  const isHigh = intensity === 'high';
  const isLow = intensity === 'low';

  return (
    <div className="sneaking-modal-overlay" style={{
      background: isHigh ? 'rgba(0, 0, 0, 0.8)' : isLow ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.6)'
    }}>
      <div className="sneaking-modal" style={{
        border: isHigh ? '4px solid #E84118' : isLow ? '2px solid #f39c12' : '3px solid #E84118',
        boxShadow: isHigh ? '0 8px 32px rgba(232, 65, 24, 0.5)' : '0 4px 16px rgba(0,0,0,0.3)',
        maxWidth: isHigh ? '500px' : isLow ? '400px' : '450px',
        padding: isHigh ? '30px' : isLow ? '20px' : '25px'
      }}>
        <div className="sneaking-header" style={{
          background: isHigh ? 'linear-gradient(135deg, #E84118, #c23616)' : 
                      isLow ? 'linear-gradient(135deg, #f39c12, #e67e22)' : 
                      'linear-gradient(135deg, #E84118, #c23616)',
          padding: isHigh ? '20px' : isLow ? '15px' : '18px',
          borderRadius: isHigh ? '12px 12px 0 0' : '10px 10px 0 0'
        }}>
          <span className="sneaking-icon" style={{
            fontSize: isHigh ? '36px' : isLow ? '28px' : '32px'
          }}>{isHigh ? '🎉🔥' : '🎉'}</span>
          <h3 className="sneaking-title" style={{
            fontSize: isHigh ? '24px' : isLow ? '18px' : '20px',
            fontWeight: isHigh ? '900' : 'bold'
          }}>
            {isHigh ? '🔥特別オファー！今だけ！' : 
             isLow ? '特別オファー' : 
             '特別オファー'}
          </h3>
        </div>
        <div className="sneaking-content" style={{
          padding: isHigh ? '25px' : isLow ? '18px' : '20px'
        }}>
          <p className="sneaking-message" style={{
            fontSize: isHigh ? '18px' : isLow ? '14px' : '16px',
            fontWeight: isHigh ? 'bold' : 'normal',
            marginBottom: isHigh ? '20px' : '15px'
          }}>
            {isHigh ? '🔥今だけ！追加料金なしでプレミアム機能をお試しください！（限定オファー）' :
             isLow ? '今だけ！追加料金なしでプレミアム機能をお試しください。' :
             '今だけ！追加料金なしでプレミアム機能をお試しください。'}
          </p>
          <div className="sneaking-benefits" style={{
            fontSize: isHigh ? '16px' : isLow ? '13px' : '14px'
          }}>
            <div className="benefit-item" style={{
              fontWeight: isHigh ? 'bold' : 'normal',
              padding: isHigh ? '10px' : isLow ? '6px' : '8px',
              background: isHigh ? '#fff5f5' : '#f8f9fa'
            }}>✓ {isHigh ? '無料配送（送料0円）' : '無料配送'}</div>
            <div className="benefit-item" style={{
              fontWeight: isHigh ? 'bold' : 'normal',
              padding: isHigh ? '10px' : isLow ? '6px' : '8px',
              background: isHigh ? '#fff5f5' : '#f8f9fa'
            }}>✓ {isHigh ? '24時間サポート（即時対応）' : '24時間サポート'}</div>
            <div className="benefit-item" style={{
              fontWeight: isHigh ? 'bold' : 'normal',
              padding: isHigh ? '10px' : isLow ? '6px' : '8px',
              background: isHigh ? '#fff5f5' : '#f8f9fa'
            }}>✓ {isHigh ? '特別割引（最大30%OFF）' : '特別割引'}</div>
          </div>
        </div>
        <div className="sneaking-actions" style={{
          display: 'flex',
          gap: isHigh ? '15px' : '10px',
          justifyContent: 'center'
        }}>
          <button 
            className="sneaking-accept"
            onClick={handleAccept}
            style={{
              background: isHigh ? 'linear-gradient(135deg, #00b894, #00cec9)' : 
                          isLow ? 'linear-gradient(135deg, #74b9ff, #0984e3)' : 
                          'linear-gradient(135deg, #00b894, #00cec9)',
              padding: isHigh ? '14px 28px' : isLow ? '10px 20px' : '12px 24px',
              fontSize: isHigh ? '18px' : isLow ? '14px' : '16px',
              fontWeight: isHigh ? '900' : 'bold',
              boxShadow: isHigh ? '0 4px 12px rgba(0, 184, 148, 0.4)' : '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            {isHigh ? '✓ 受け取る（推奨）' : '受け取る'}
          </button>
          <button 
            className="sneaking-decline"
            onClick={handleDecline}
            style={{
              padding: isHigh ? '14px 28px' : isLow ? '10px 20px' : '12px 24px',
              fontSize: isHigh ? '18px' : isLow ? '14px' : '16px'
            }}
          >
            後で
          </button>
        </div>
        <div className="sneaking-footer" style={{
          padding: isHigh ? '15px' : isLow ? '10px' : '12px',
          fontSize: isHigh ? '14px' : isLow ? '12px' : '13px',
          fontWeight: isHigh ? 'bold' : 'normal',
          color: isHigh ? '#E84118' : '#666'
        }}>
          <span className="sneaking-note">
            {isHigh ? '※このオファーは限定的です（残り時間わずか）' :
             isLow ? '※このオファーは限定的です' :
             '※このオファーは限定的です'}
          </span>
        </div>
      </div>
    </div>
  );
}
