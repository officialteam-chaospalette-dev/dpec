import React, { createContext, useContext, useReducer, useMemo } from 'react'

const PatternContext = createContext(null)

// 強度レベル: 'low' | 'medium' | 'high' (noneは削除)
// 強度ごとに適用するダークパターンを定義
export const getPatternsByIntensity = (intensity) => {
  switch (intensity) {
    case 'low':
      // 軽度: 一部のダークパターンのみ（見落としが発生しやすいレベル）
      return {
        preselection: true,      // 事前選択（デフォルトバイアス）
        fakeScarcity: false,     // 偽の希少性（無効）
        fakeSocialProof: false,  // 偽の社会的証明（無効）
        hiddenCosts: false,      // 隠れ費用（無効）- 中度・重度のみ
        sneaking: false,         // こっそり追加（無効）
        comparisonPrevention: false, // 比較妨害（無効）
        visualInterference: false,   // 視覚的妨害（無効）
        obstruction: false       // 妨害（無効）
      }
    case 'medium':
      // 中度: 中程度のダークパターン
      return {
        preselection: true,
        fakeScarcity: true,
        fakeSocialProof: true,
        hiddenCosts: true,
        sneaking: false,         // こっそり追加（無効）
        comparisonPrevention: false, // 比較妨害（無効）
        visualInterference: false,   // 視覚的妨害（無効）
        obstruction: false       // 妨害（無効）
      }
    case 'high':
      // 重度: 全ダークパターンを適用
      return {
        preselection: true,
        fakeScarcity: true,
        fakeSocialProof: true,
        hiddenCosts: true,
        sneaking: true,
        comparisonPrevention: true,
        visualInterference: true,
        obstruction: true
      }
    default:
      return {
        preselection: false,
        fakeScarcity: false,
        fakeSocialProof: false,
        hiddenCosts: false,
        sneaking: false,
        comparisonPrevention: false,
        visualInterference: false,
        obstruction: false
      }
  }
}

// 強度ごとに商品カテゴリーを自動設定
export const getCategoryByIntensity = (intensity) => {
  switch (intensity) {
    case 'low':
      return 'electronics' // 掃除機カテゴリ（商品201-203）
    case 'medium':
      return 'electronics' // 電子レンジカテゴリ（商品207-209）
    case 'high':
      return 'electronics' // 加湿器カテゴリ（商品204-206）
    default:
      return 'electronics'
  }
}

// 強度ごとに表示する商品IDの範囲を定義
export const getProductIdRangeByIntensity = (intensity) => {
  switch (intensity) {
    case 'low':
      return { min: 201, max: 203 } // 掃除機
    case 'medium':
      return { min: 207, max: 211 } // 電子レンジ（5個: 207-211）
    case 'high':
      // 加湿器のみ（204-206, 214-215）- 210-211は電子レンジなので除外
      // 注意: 単純な範囲フィルタリングでは対応できないため、ProductListで特別な処理が必要
      return { min: 204, max: 206 } // まず204-206を返すが、実際には214-215も含める
    default:
      return { min: 0, max: 999 }
  }
}

// 強度レベルごとの対象カテゴリー表示名
export const getTargetCategoryLabel = (intensity) => {
  switch (intensity) {
    case 'low':
      return '掃除機'
    case 'medium':
      return '電子レンジ'
    case 'high':
      return '加湿器'
    default:
      return '全商品'
  }
}

// 強度レベルごとのカテゴリー説明
export const getCategoryDescription = (intensity) => {
  switch (intensity) {
    case 'low':
      return '軽度では掃除機カテゴリーから選択してください'
    case 'medium':
      return '中度では電子レンジカテゴリーから選択してください'
    case 'high':
      return '重度では加湿器カテゴリーから選択してください'
    default:
      return '商品を選択してください'
  }
}

// 次の強度レベルを取得
export const getNextIntensity = (intensity) => {
  switch (intensity) {
    case 'low':
      return 'medium'
    case 'medium':
      return 'high'
    case 'high':
      return null // すべて完了
    default:
      return 'low'
  }
}

// 強度レベルの順序
export const INTENSITY_ORDER = ['low', 'medium', 'high']

// 初期状態
const initialState = {
  patternIntensity: 'low', // デフォルトは低強度
  categoryFilter: 'electronics',
  productIdRange: { min: 201, max: 203 }, // 初期値: 掃除機（低強度）
  completedTasks: [] // 完了したタスクのリスト ['low', 'medium', ...]
}

// Action types
const SET_PATTERN_INTENSITY = 'SET_PATTERN_INTENSITY'
const SET_CATEGORY_FILTER = 'SET_CATEGORY_FILTER'
const COMPLETE_TASK = 'COMPLETE_TASK'
const RESET_TASKS = 'RESET_TASKS'

// Reducer
const patternReducer = (state, action) => {
  switch (action.type) {
    case SET_PATTERN_INTENSITY:
      // 完了済みのタスクには戻れない
      if (state.completedTasks.includes(action.payload)) {
        return state
      }
      const newCategory = getCategoryByIntensity(action.payload)
      const productRange = getProductIdRangeByIntensity(action.payload)
      return {
        ...state,
        patternIntensity: action.payload,
        categoryFilter: newCategory,
        productIdRange: productRange
      }
    case SET_CATEGORY_FILTER:
      return {
        ...state,
        categoryFilter: action.payload
      }
    case COMPLETE_TASK:
      const completedIntensity = action.payload
      if (!state.completedTasks.includes(completedIntensity)) {
        const nextIntensity = getNextIntensity(completedIntensity)
        if (nextIntensity) {
          const newCategory = getCategoryByIntensity(nextIntensity)
          const productRange = getProductIdRangeByIntensity(nextIntensity)
          return {
            ...state,
            completedTasks: [...state.completedTasks, completedIntensity],
            patternIntensity: nextIntensity,
            categoryFilter: newCategory,
            productIdRange: productRange
          }
        } else {
          // すべてのタスク完了
          return {
            ...state,
            completedTasks: [...state.completedTasks, completedIntensity]
          }
        }
      }
      return state
    case RESET_TASKS:
      return {
        ...initialState
      }
    default:
      return state
  }
}

export const PatternProvider = ({ children }) => {
  const [state, dispatch] = useReducer(patternReducer, initialState)
  
  // patternEnabled は常にtrue（noneがないため）
  const patternEnabled = true
  
  const setPatternEnabled = (enabled) => {
    if (enabled) {
      dispatch({ type: SET_PATTERN_INTENSITY, payload: 'low' })
    }
  }

  const setPatternIntensity = (intensity) => {
    dispatch({ type: SET_PATTERN_INTENSITY, payload: intensity })
  }

  const setCategoryFilter = (category) => {
    dispatch({ type: SET_CATEGORY_FILTER, payload: category })
  }

  const completeTask = (intensity) => {
    dispatch({ type: COMPLETE_TASK, payload: intensity })
  }

  const resetTasks = () => {
    dispatch({ type: RESET_TASKS })
  }

  // valueオブジェクトをuseMemoでメモ化して、不要な再レンダリングを防ぐ
  const value = useMemo(() => ({
    patternEnabled,
    setPatternEnabled,
    patternIntensity: state.patternIntensity,
    setPatternIntensity,
    categoryFilter: state.categoryFilter,
    setCategoryFilter,
    productIdRange: state.productIdRange || getProductIdRangeByIntensity(state.patternIntensity),
    completedTasks: state.completedTasks,
    completeTask,
    resetTasks,
    allTasksCompleted: state.completedTasks.length >= INTENSITY_ORDER.length
  }), [state.patternIntensity, state.categoryFilter, state.productIdRange, state.completedTasks])

  return (
    <PatternContext.Provider value={value}>
      {children}
    </PatternContext.Provider>
  )
}

export const usePattern = () => {
  const ctx = useContext(PatternContext)
  if (!ctx) {
    throw new Error('usePattern must be used within a PatternProvider')
  }
  return ctx
}
