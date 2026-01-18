import React from 'react';
import { usePattern, getPatternsByIntensity, getTargetCategoryLabel, getCategoryDescription } from '../../contexts/PatternContext';

const INTENSITY_LABELS = {
  low: '軽度',
  medium: '中度',
  high: '重度'
};

const INTENSITY_COLORS = {
  low: '🟡',
  medium: '🟠',
  high: '🔴'
};

export default function PatternToggle({ patternEnabled, onToggle }) {
  // グローバルコンテキストがある場合はそれを優先
  try {
    const { 
      patternEnabled: ctxEnabled, 
      setPatternEnabled, 
      patternIntensity,
      setPatternIntensity,
      categoryFilter, 
      setCategoryFilter 
    } = usePattern();
    
    // patternIntensityを直接使用（確実に更新される）
    const intensity = patternIntensity || 'low';

    const handleIntensityChange = (e) => {
      const newIntensity = e.target.value;
      
      // setPatternIntensityを直接呼び出す
      if (setPatternIntensity) {
        setPatternIntensity(newIntensity);
      }
      
      // onToggleは呼ばない（setPatternEnabledを呼ばないようにする）
      // setPatternEnabledは常に'low'に設定してしまうため
    }

    const patterns = getPatternsByIntensity(intensity);
    const targetCategoryLabel = getTargetCategoryLabel(intensity);
    const categoryDescription = getCategoryDescription(intensity);

    return (
      <div className="pattern-toggle">
        <div className="toggle-header">
          <h3>ダークパターン制御</h3>
          <span className="toggle-status">
            {INTENSITY_COLORS[intensity]} {INTENSITY_LABELS[intensity]}
          </span>
        </div>
        <div className="toggle-controls" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            強度レベル:
            <select 
              value={intensity} 
              onChange={handleIntensityChange}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '8px', 
                border: '1px solid #ccc',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              <option value="low">軽度</option>
              <option value="medium">中度</option>
              <option value="high">重度</option>
            </select>
          </label>
          <div style={{ 
            marginLeft: 8, 
            padding: '10px 16px', 
            background: '#e3f2fd', 
            borderRadius: '8px', 
            fontSize: '14px',
            border: '1px solid #2196f3'
          }}>
            <strong>対象カテゴリ:</strong> {targetCategoryLabel}
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#1976d2' }}>
              {categoryDescription}
            </div>
          </div>
        </div>
        <div className="pattern-info">
          <p>強度レベルでダークパターンの適用度を制御できます。各強度レベルで対象カテゴリが設定されています。</p>
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
            <strong>強度レベルと適用ダークパターン:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
              <li><strong>軽度（掃除機カテゴリ）:</strong> 事前選択のみ（見落としが発生しやすいレベル）</li>
              <li><strong>中度（電子レンジカテゴリ）:</strong> 事前選択、偽の希少性、偽の社会的証明、隠れ費用</li>
              <li><strong>重度（加湿器カテゴリ）:</strong> 全ダークパターンを適用</li>
            </ul>
            <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
              <strong>現在の強度で適用中のダークパターン:</strong>
              <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                {Object.entries(patterns).map(([key, enabled]) => (
                  <li key={key}>
                    {enabled ? '✓' : '✗'} {key === 'preselection' ? '事前選択' :
                                         key === 'fakeScarcity' ? '偽の希少性' :
                                         key === 'fakeSocialProof' ? '偽の社会的証明' :
                                         key === 'hiddenCosts' ? '隠れ費用' :
                                         key === 'sneaking' ? 'こっそり追加' :
                                         key === 'comparisonPrevention' ? '比較妨害' :
                                         key === 'visualInterference' ? '視覚的妨害' :
                                         key === 'obstruction' ? '妨害' : key}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (_) {
    // Provider外では従来propsで動作（後方互換性）
  }
  
  // フォールバック（Provider外の場合）
  const intensity = patternEnabled ? 'medium' : 'low';
  const patterns = getPatternsByIntensity(intensity);

  const handleIntensityChange = (newIntensity) => {
    // Provider外では常に有効（noneがないため）
    if (onToggle) {
      onToggle(true);
    }
  };

  return (
    <div className="pattern-toggle">
      <div className="toggle-header">
        <h3>ダークパターン制御</h3>
        <span className="toggle-status">
          {INTENSITY_COLORS[intensity]} {INTENSITY_LABELS[intensity]}
        </span>
      </div>
      <div className="toggle-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          強度レベル:
          <select 
            value={intensity} 
            onChange={(e) => handleIntensityChange(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            <option value="low">軽度</option>
            <option value="medium">中度</option>
            <option value="high">重度</option>
          </select>
        </label>
      </div>
      <div className="pattern-info">
        <p>強度レベルでダークパターンの適用度を制御できます。各強度レベルで対象カテゴリが設定されています。</p>
        <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
          <strong>現在の強度で適用中のダークパターン:</strong>
          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
            {Object.entries(patterns).map(([key, enabled]) => (
              <li key={key}>
                {enabled ? '✓' : '✗'} {key === 'preselection' ? '事前選択' :
                                     key === 'fakeScarcity' ? '偽の希少性' :
                                     key === 'fakeSocialProof' ? '偽の社会的証明' :
                                     key === 'hiddenCosts' ? '隠れ費用' :
                                     key === 'sneaking' ? 'こっそり追加' :
                                     key === 'comparisonPrevention' ? '比較妨害' :
                                     key === 'visualInterference' ? '視覚的妨害' :
                                     key === 'obstruction' ? '妨害' : key}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
