import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { usePattern } from './PatternContext'

const LoggingContext = createContext()

// ログデータの送信（タイムアウト付き）
const sendLogToBackend = async (logData, timeout = 8000) => {
  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:8000/api`;
    }
    return `https://${hostname}/api`;
  };
  
  const API_URL = getApiUrl();
  console.log('API URL:', API_URL)
  console.log('Sending log data:', JSON.stringify(logData, null, 2))
  
  try {
    // タイムアウト付きのfetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to send log:', response.statusText, errorText)
      return null
    }
    
    const result = await response.json()
    console.log('Log sent successfully:', result)
    return result
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Log send timeout after', timeout, 'ms')
      console.error('Timeout error details:', error)
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Network error - Backend may be unreachable')
      console.error('Check if backend is running at:', API_URL)
      console.error('CORS may be blocking the request')
    } else {
      console.error('Error sending log to backend:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return null
  }
}

// 複数のログを順次送信
const sendLogsBatch = async (logsArray, timeout = 8000) => {
  const results = []
  for (const log of logsArray) {
    const result = await sendLogToBackend(log, timeout)
    results.push(result)
    // 少し待機してサーバー負荷を軽減
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return results
}

// LoggingProvider内で使用する内部コンポーネント（usePatternを使用するため）
const LoggingProviderInner = ({ children }) => {
  // PatternContextから現在の強度レベルを取得
  const { patternIntensity, completeTask, allTasksCompleted } = usePattern()
  
  // テスト参加IDは最初のタスク完了時に生成（初期値はnull）
  const [participantId, setParticipantId] = useState(null)
  
  // 参加者IDを生成する関数
  const generateParticipantId = () => {
    const newId = Math.floor(10000000 + Math.random() * 90000000).toString() // 10000000-99999999
    setParticipantId(newId)
    return newId
  }
  
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [taskStartTime, setTaskStartTime] = useState(() => Date.now()) // タスク開始時刻
  const [pageStartTime, setPageStartTime] = useState(Date.now())
  const [logs, setLogs] = useState([])
  const [navigationHistory, setNavigationHistory] = useState([])
  const [filterSortEvents, setFilterSortEvents] = useState([])
  const [optionSelections, setOptionSelections] = useState({})
  const [selectedSKUs, setSelectedSKUs] = useState([])
  const [pageTimeMap, setPageTimeMap] = useState({}) // {page_name: ms}
  const [hiddenCostsRevealed, setHiddenCostsRevealed] = useState(false)
  const [countdownShown, setCountdownShown] = useState(false)
  const [countdownToPurchase, setCountdownToPurchase] = useState(false)
  const [usedPatterns, setUsedPatterns] = useState([]) // {name, location}
  const [urgencyShownAt, setUrgencyShownAt] = useState(null)
  const [costsRevealedAt, setCostsRevealedAt] = useState(null)
  const pageRef = useRef(null)

  // タスク開始時にタスク開始時刻をリセット
  useEffect(() => {
    setTaskStartTime(Date.now())
    // タスク開始時に状態をリセット（ただし、participantIdとsessionIdは保持）
    setNavigationHistory([])
    setFilterSortEvents([])
    setOptionSelections({})
    setSelectedSKUs([])
    setPageTimeMap({})
    setHiddenCostsRevealed(false)
    setCountdownShown(false)
    setCountdownToPurchase(false)
    setUsedPatterns([])
    setUrgencyShownAt(null)
    setCostsRevealedAt(null)
    setPageStartTime(Date.now())
    pageRef.current = null
  }, [patternIntensity])

  // セッション開始を記録（最初のタスクのみ）
  useEffect(() => {
    if (patternIntensity === 'low') {
      const sessionLog = {
        session_id: sessionId,
        event_type: 'session_start',
        timestamp: new Date().toISOString(),
        data: {
          participant_id: null, // 最初のタスク完了時に設定される
          pattern_intensity: patternIntensity,
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height
        }
      }
      setLogs(prev => [...prev, sessionLog])
    }
  }, [sessionId, patternIntensity])

  // 使用パターンの記録
  const markPatternUsed = (name, location) => {
    setUsedPatterns(prev => {
      const exists = prev.some(p => p.name === name && p.location === location)
      return exists ? prev : [...prev, { name, location }]
    })
    if (name === 'fake_scarcity' && !urgencyShownAt) {
      setUrgencyShownAt(Date.now())
    }
    if (name === 'hidden_costs' && !costsRevealedAt) {
      setCostsRevealedAt(Date.now())
    }
  }

  // ページ遷移を記録（ログは保存のみ、送信はタスク完了時）
  const logPageView = (pageName, pageData = {}) => {
    const previousPage = pageRef.current
    const currentTime = Date.now()
    const timeSpent = previousPage ? currentTime - pageStartTime : 0

    if (previousPage) {
      setPageTimeMap(prev => ({
        ...prev,
        [previousPage]: (prev[previousPage] || 0) + timeSpent
      }))
      // 一覧と詳細の往復を記録（比較行動として）
      if ((previousPage === 'product_list' && pageName === 'product_detail') ||
          (previousPage === 'product_detail' && pageName === 'product_list')) {
        setNavigationHistory(prev => [...prev, { from: previousPage, to: pageName, time: timeSpent }])
      }
    }

    const pageViewLog = {
      session_id: sessionId,
      event_type: 'page_view',
      timestamp: new Date().toISOString(),
      data: {
        participant_id: null,
        pattern_intensity: patternIntensity,
        page_name: pageName,
        ...pageData
      }
    }
    setLogs(prev => [...prev, pageViewLog])
    setPageStartTime(currentTime)
    pageRef.current = pageName
  }

  // 意思決定イベントを記録（SKU選択、オプション選択、追加商品削除などを統合）
  const logDecisionEvent = (decisionType, decisionData) => {
    const decisionLog = {
      session_id: sessionId,
      event_type: 'decision_event',
      timestamp: new Date().toISOString(),
      data: {
        participant_id: null,
        pattern_intensity: patternIntensity,
        decision_type: decisionType, // 'sku_selection', 'option_toggle', 'item_removal'
        ...decisionData
      }
    }
    setLogs(prev => [...prev, decisionLog])
  }

  // フィルター/ソート使用を記録（内部状態のみ、ログには記録しない）
  const logFilterSort = (type, value) => {
    setFilterSortEvents(prev => [...prev, { type, value, timestamp: Date.now() }])
  }

  // 一覧と詳細の往復を記録（内部状態のみ、ログには記録しない）
  const logComparisonAction = (actionType, productId = null) => {
    // 比較行動は内部状態として記録し、バックエンドでpage_viewから算出
    setNavigationHistory(prev => [...prev, { 
      from: actionType === 'detail_to_list' ? 'product_detail' : 'product_list',
      to: actionType === 'detail_to_list' ? 'product_list' : 'product_detail',
      time: Date.now(),
      product_id: productId
    }])
  }

  // オプション選択を記録（decision_eventとして）
  const logOptionSelection = (options, defaultOptions = {}) => {
    setOptionSelections(options)
    // デフォルト状態との比較
    const optionChanges = {}
    Object.keys(options).forEach(key => {
      const wasDefault = defaultOptions[key] === true
      const isSelected = options[key] === true
      optionChanges[key] = {
        was_default: wasDefault,
        is_selected: isSelected,
        changed: wasDefault !== isSelected
      }
    })
    
    logDecisionEvent('option_toggle', {
      options: options,
      default_options: defaultOptions,
      option_changes: optionChanges
    })
  }

  // SKU選択を記録（decision_eventとして）
  const logSKUSelection = (productId, skuId, skuPrice, isLowestPrice, defaultSkuId = null) => {
    // 同じ商品の既存の選択を削除して、最新の選択のみを保持
    setSelectedSKUs(prev => {
      const filtered = prev.filter(sku => sku.productId !== productId)
      return [...filtered, { productId, skuId, skuPrice, isLowestPrice }]
    })
    
    logDecisionEvent('sku_selection', {
      product_id: productId,
      sku_id: skuId,
      sku_price: skuPrice,
      is_lowest_price: isLowestPrice,
      was_default: skuId === defaultSkuId
    })
  }

  // クリックイベントを記録（内部状態のみ、ログには記録しない）
  const logClick = (elementType, elementId, isActive = true, additionalData = {}) => {
    // クリックイベントは記録しない（意思決定に直接関与しないため）
  }

  // カウントダウン提示を記録（内部状態のみ）
  const logCountdownShown = () => {
    setCountdownShown(true)
    if (!urgencyShownAt) setUrgencyShownAt(Date.now())
  }

  // カウントダウン後の購入確定を記録（内部状態のみ）
  const logCountdownToPurchase = () => {
    setCountdownToPurchase(true)
    if (!countdownShown) {
      setCountdownShown(true)
    }
  }

  // 隠れ費用開示を記録（内部状態のみ）
  const logHiddenCostsRevealed = () => {
    setHiddenCostsRevealed(true)
    setCostsRevealedAt(Date.now())
  }

  // 隠れ費用開示後の離脱/継続を記録（内部状態のみ）
  const logHiddenCostsAction = (action) => {
    // 内部状態のみ、ログには記録しない
  }

  // タスク完了時にログをクリア（次のタスクに備える）
  const clearTaskLogs = () => {
    setLogs([])
  }

  // 購入完了を記録（タスク完了時にログを送信）
  const logPurchaseComplete = async (purchaseData) => {
    // 最初のタスク完了時に参加者IDを生成
    const finalParticipantId = participantId || generateParticipantId()
    
    const completedAt = Date.now()
    const taskTime = completedAt - taskStartTime

    // 現在ページの滞在時間を最終反映
    let finalPageTimeMap = { ...pageTimeMap }
    if (pageRef.current) {
      const currentSpent = Date.now() - pageStartTime
      finalPageTimeMap = {
        ...finalPageTimeMap,
        [pageRef.current]: (finalPageTimeMap[pageRef.current] || 0) + currentSpent
      }
    }

    // 比較行動回数をカウント（一覧と詳細の往復回数）
    const comparisonActionsCount = navigationHistory.filter(nav => 
      (nav.from === 'product_list' && nav.to === 'product_detail') ||
      (nav.from === 'product_detail' && nav.to === 'product_list')
    ).length

    // 緊急性提示後行動時間を計算
    const urgencyToPurchaseMs = urgencyShownAt ? (completedAt - urgencyShownAt) : null

    // 既存のログにparticipant_idとpattern_intensityを追加
    const updatedLogs = logs.map(log => ({
      ...log,
      data: {
        ...log.data,
        participant_id: finalParticipantId,
        pattern_intensity: patternIntensity
      }
    }))

    // 購入完了ログのデータ構造（評価指標はバックエンドで計算）
    const metrics = {
      participant_id: finalParticipantId,
      pattern_intensity: patternIntensity,
      product_id: purchaseData.product_id || null,
      base_price: purchaseData.base_price || null,
      actual_paid_price: purchaseData.actual_paid_price || null,
      selected_sku_id: purchaseData.selected_sku_id || null,
      selected_sku_price: purchaseData.selected_sku_price || null,
      is_lowest_price: purchaseData.is_lowest_price !== undefined ? purchaseData.is_lowest_price : null,
      option_price: purchaseData.option_price || null,
      hidden_fees: purchaseData.hidden_fees || null,
      total_paid: purchaseData.total_paid || null,
      lowest_price: purchaseData.lowest_price || null,
      lowest_total: purchaseData.lowest_total || null,
      selected_options: purchaseData.selected_options || null,
      decision_time_ms: taskTime,
      urgency_to_purchase_ms: urgencyToPurchaseMs,
      page_time_ms: finalPageTimeMap
    }

    const purchaseLog = {
      session_id: sessionId,
      event_type: 'purchase_complete',
      timestamp: new Date().toISOString(),
      data: metrics
    }
    
    console.log('Purchase log to send (task completed):', purchaseLog)
    
    // 購入完了ログをログ配列に追加
    const allLogsToSend = [...updatedLogs, purchaseLog]
    
    // すべてのログを順次送信（非ブロッキング）
    // 注意: completeTaskはCheckout.jsxで先に実行されるため、ここでは実行しない
    const sendAllLogs = async () => {
      try {
        console.log(`Sending ${allLogsToSend.length} logs for pattern_intensity: ${patternIntensity}...`)
        const results = await sendLogsBatch(allLogsToSend, 60000)
        const successCount = results.filter(r => r !== null).length
        console.log(`Successfully sent ${successCount}/${allLogsToSend.length} logs`)
        
        // ログをクリア（次のタスクに備える）
        clearTaskLogs()
      } catch (error) {
        console.error('Error sending logs:', error)
        console.error('Error details:', error.message, error.stack)
        // エラーが発生してもログをクリア
        clearTaskLogs()
      }
    }
    
    // 非ブロッキングで送信開始
    sendAllLogs()
  }

  // 最終支払額の最適性を計算（フロントエンドでの計算用、バックエンドでも再計算）
  const calculatePriceOptimality = (actualLowestPrice, paidAmount) => {
    return actualLowestPrice - paidAmount
  }

  const value = {
    sessionId,
    participantId,
    generateParticipantId,
    logPageView,
    logDecisionEvent,
    logFilterSort,
    logComparisonAction,
    logOptionSelection,
    logSKUSelection,
    logClick,
    logCountdownShown,
    logCountdownToPurchase,
    logHiddenCostsRevealed,
    logHiddenCostsAction,
    logPurchaseComplete,
    calculatePriceOptimality,
    navigationHistory,
    filterSortEvents,
    optionSelections,
    selectedSKUs,
    usedPatterns,
    markPatternUsed,
    allTasksCompleted
  }

  return (
    <LoggingContext.Provider value={value}>
      {children}
    </LoggingContext.Provider>
  )
}

export const LoggingProvider = ({ children }) => {
  // PatternProvider内でLoggingProviderInnerをレンダリングする必要があるため、
  // このコンポーネントはPatternProviderの外で使用されることを想定していない
  // App.jsxでPatternProviderがLoggingProviderの外側にあるため、usePatternが使えない
  // そのため、LoggingProviderInnerを直接使用するようにApp.jsxを変更する必要がある
  return <LoggingProviderInner>{children}</LoggingProviderInner>
}

export const useLogging = () => {
  const context = useContext(LoggingContext)
  if (!context) {
    throw new Error('useLogging must be used within a LoggingProvider')
  }
  return context
}
