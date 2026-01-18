import React, { useState, useEffect } from 'react';
import { useLogging } from '../../contexts/LoggingContext';
import { usePattern, getPatternsByIntensity } from '../../contexts/PatternContext';

export default function FakeScarcity({ 
  patternEnabled = false, 
  patternIntensity = null,
  location = 'product_list' 
}) {
  // 強度に応じてタイマー時間と在庫数を変更
  const getIntensityValues = (int) => {
    if (int === 'high') {
      return { timeLeft: 300, stockLeft: 1 }; // 5分、残り1個
    } else if (int === 'low') {
      return { timeLeft: 900, stockLeft: 8 }; // 15分、残り8個
    } else {
      return { timeLeft: 600, stockLeft: 3 }; // 10分、残り3個（medium）
    }
  };

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
  const isPatternEnabled = patterns?.fakeScarcity ?? false;

  const { timeLeft: initialTime, stockLeft: initialStock } = getIntensityValues(intensity);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [stockLeft, setStockLeft] = useState(initialStock);
  const { logCountdownShown } = useLogging();

  useEffect(() => {
    if (isPatternEnabled) {
      logCountdownShown();
      const { timeLeft: newTime, stockLeft: newStock } = getIntensityValues(intensity);
      setTimeLeft(newTime);
      setStockLeft(newStock);
    }
  }, [isPatternEnabled, intensity, logCountdownShown]);

  useEffect(() => {
    if (!isPatternEnabled) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const { timeLeft: resetTime } = getIntensityValues(intensity);
          return resetTime; // Reset to initial time
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPatternEnabled, intensity]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isPatternEnabled) {
    return null;
  }

  const isHigh = intensity === 'high';
  const isLow = intensity === 'low';

  return (
    <div className="fake-scarcity" style={{
      background: isHigh ? 'linear-gradient(135deg, #fff5f5, #ffe0e0)' : 
                  isLow ? '#fffbf0' : 
                  'linear-gradient(135deg, #fff3e0, #ffe0b2)',
      border: isHigh ? '3px solid #E84118' : isLow ? '2px solid #f39c12' : '2px solid #E84118',
      boxShadow: isHigh ? '0 4px 16px rgba(232, 65, 24, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div className="scarcity-timer" style={{
        background: isHigh ? 'linear-gradient(135deg, #E84118, #c23616)' : 
                    isLow ? 'linear-gradient(135deg, #f39c12, #e67e22)' : 
                    'linear-gradient(135deg, #E84118, #c23616)',
        fontSize: isHigh ? '18px' : isLow ? '14px' : '16px',
        padding: isHigh ? '12px 20px' : isLow ? '8px 16px' : '10px 18px'
      }}>
        <span className="timer-icon">{isHigh ? '⏰🔥' : '⏰'}</span>
        <span className="timer-text">{isHigh ? '🔥セール終了まで残り' : 'セール終了まで'}</span>
        <span className="timer-countdown" style={{
          fontSize: isHigh ? '24px' : isLow ? '18px' : '20px',
          fontWeight: isHigh ? '900' : 'bold'
        }}>{formatTime(timeLeft)}</span>
      </div>
      <div className="scarcity-stock" style={{
        background: isHigh ? '#E84118' : isLow ? '#f39c12' : '#E84118',
        color: 'white',
        padding: isHigh ? '10px 16px' : isLow ? '8px 14px' : '9px 15px',
        fontSize: isHigh ? '16px' : isLow ? '13px' : '14px',
        fontWeight: isHigh ? '900' : 'bold'
      }}>
        <span className="stock-icon">{isHigh ? '⚠️⚠️' : '⚠️'}</span>
        <span className="stock-text">
          {isHigh ? `🚨残り${stockLeft}個のみ！最後のチャンス！` : 
           isLow ? `残り${stockLeft}個のみ` : 
           `残り${stockLeft}個のみ！`}
        </span>
      </div>
      <div className="scarcity-urgency" style={{
        background: isHigh ? 'linear-gradient(135deg, #fff3cd, #ffe69c)' : 
                    isLow ? '#f8f9fa' : 
                    '#fff3e0',
        padding: isHigh ? '12px' : isLow ? '8px' : '10px',
        borderRadius: '8px',
        border: isHigh ? '2px solid #ffc107' : '1px solid #ddd',
        fontSize: isHigh ? '16px' : isLow ? '13px' : '14px',
        fontWeight: isHigh ? '900' : isLow ? 'normal' : 'bold',
        color: isHigh ? '#856404' : isLow ? '#666' : '#E84118',
        textAlign: 'center'
      }}>
        <span className="urgency-text">
          {isHigh ? '🚨🚨今すぐ購入しないと機会を逃します！在庫がなくなる前に！🚨🚨' :
           isLow ? '今すぐ購入しないと機会を逃す可能性があります' :
           '今すぐ購入しないと機会を逃します！'}
        </span>
      </div>
    </div>
  );
}
