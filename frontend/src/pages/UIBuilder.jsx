import React, { useState, useRef, useEffect, useCallback } from 'react'
import PageTransition from '../components/PageTransition'
import html2canvas from 'html2canvas'
import '../styles/UIBuilder.css'

// 画面タイプの定義
const SCREEN_TYPES = [
  { id: 'product_list', label: '商品一覧', icon: '📋' },
  { id: 'product_detail', label: '商品詳細', icon: '🔍' },
  { id: 'cart', label: 'カート', icon: '🛒' },
  { id: 'checkout', label: '決済画面', icon: '💳' },
  { id: 'cancel', label: 'キャンセル画面', icon: '❌' },
  { id: 'popup', label: 'ポップアップ', icon: '💬' }
]

// テンプレートセット（商品一覧 + 商品詳細の2画面セット）
const TEMPLATE_SETS = [
  {
    name: 'テンプレート1',
    screens: {
      product_list: {
        items: [
          { partId: 'image-placeholder', x: 50, y: 50, width: 250, height: 200 },
          { partId: 'product-name', x: 50, y: 270, width: 250, height: 30 },
          { partId: 'price-original', x: 50, y: 310, width: 120, height: 25 },
          { partId: 'price-current', x: 180, y: 310, width: 120, height: 40 },
          { partId: 'discount-badge', x: 50, y: 360, width: 80, height: 30 },
          { partId: 'image-placeholder', x: 320, y: 50, width: 250, height: 200 },
          { partId: 'product-name', x: 320, y: 270, width: 250, height: 30 },
          { partId: 'price-current', x: 320, y: 310, width: 250, height: 40 },
          { partId: 'image-placeholder', x: 590, y: 50, width: 250, height: 200 },
          { partId: 'product-name', x: 590, y: 270, width: 250, height: 30 },
          { partId: 'price-current', x: 590, y: 310, width: 250, height: 40 },
          { partId: 'fake-social-proof', x: 50, y: 420, width: 790, height: 80 }
        ]
      },
      product_detail: {
        items: [
          { partId: 'image-placeholder', x: 50, y: 50, width: 400, height: 300 },
          { partId: 'anchoring-price', x: 470, y: 50, width: 350, height: 150 },
          { partId: 'immediacy-timer', x: 470, y: 220, width: 350, height: 120 },
          { partId: 'fake-scarcity', x: 470, y: 360, width: 350, height: 180 },
          { partId: 'fake-social-proof', x: 50, y: 370, width: 400, height: 180 },
          { partId: 'default-bias-strong', x: 50, y: 570, width: 400, height: 200 },
          { partId: 'primary-button', x: 470, y: 560, width: 350, height: 60 },
          { partId: 'framing-positive', x: 50, y: 790, width: 770, height: 120 }
        ]
      }
    }
  },
  {
    name: 'テンプレート2',
    screens: {
      product_list: {
        items: [
          { partId: 'image-placeholder', x: 50, y: 50, width: 250, height: 200 },
          { partId: 'product-name', x: 50, y: 270, width: 250, height: 30 },
          { partId: 'price-original', x: 50, y: 310, width: 120, height: 25 },
          { partId: 'price-current', x: 180, y: 310, width: 120, height: 40 },
          { partId: 'badge-popular', x: 50, y: 360, width: 60, height: 25 },
          { partId: 'image-placeholder', x: 320, y: 50, width: 250, height: 200 },
          { partId: 'product-name', x: 320, y: 270, width: 250, height: 30 },
          { partId: 'price-current', x: 320, y: 310, width: 250, height: 40 },
          { partId: 'image-placeholder', x: 590, y: 50, width: 250, height: 200 },
          { partId: 'product-name', x: 590, y: 270, width: 250, height: 30 },
          { partId: 'price-current', x: 590, y: 310, width: 250, height: 40 },
        ]
      },
      product_detail: {
        items: [
          { partId: 'image-placeholder', x: 50, y: 50, width: 350, height: 280 },
          { partId: 'price-current', x: 420, y: 50, width: 400, height: 80 },
          { partId: 'choice-overload', x: 420, y: 150, width: 400, height: 400 },
          { partId: 'anchoring-price', x: 50, y: 350, width: 350, height: 150 },
          { partId: 'preselection', x: 50, y: 520, width: 350, height: 200 },
          { partId: 'framing-negative', x: 50, y: 740, width: 350, height: 120 },
          { partId: 'primary-button', x: 420, y: 570, width: 400, height: 60 },
          { partId: 'immediacy-timer', x: 420, y: 650, width: 200, height: 120 }
        ]
      }
    }
  }
]

// 各画面タイプの例テンプレート（後方互換性のため残す）
const SCREEN_EXAMPLES = {
  product_list: [],
  product_detail: [],
  cart: [],
  checkout: []
}

// UIパーツの定義
const UI_PARTS = {
  // 基本UI要素（通常のUIパーツ）
  basic: [
    {
      id: 'normal-button',
      type: 'button',
      category: 'basic',
      label: '通常のボタン',
      screenTypes: ['product_list', 'product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <button style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          ボタン
        </button>
      )
    },
    {
      id: 'primary-button',
      type: 'button',
      category: 'basic',
      label: 'プライマリーボタン',
      screenTypes: ['product_list', 'product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <button style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: '#00b894',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          購入する
        </button>
      )
    },
    {
      id: 'secondary-button',
      type: 'button',
      category: 'basic',
      label: 'セカンダリーボタン',
      screenTypes: ['product_list', 'product_detail', 'cart', 'checkout', 'cancel', 'popup'],
      component: ({ onDelete }) => (
        <button style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: 'white',
          color: '#333',
          border: '2px solid #ddd',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          キャンセル
        </button>
      )
    },
    {
      id: 'detail-button',
      type: 'button',
      category: 'basic',
      label: '詳細を見る',
      screenTypes: ['product_list'],
      component: ({ onDelete }) => (
        <button style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          詳細を見る
        </button>
      )
    },
    {
      id: 'price-current',
      type: 'text',
      category: 'basic',
      label: '現在価格',
      screenTypes: ['product_list', 'product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#E84118',
            minWidth: '120px',
            minHeight: '30px',
            outline: 'none',
            cursor: 'text',
            padding: '4px 8px',
            border: '1px dashed transparent',
            borderRadius: '4px'
          }}
          onFocus={(e) => {
            e.target.style.border = '1px dashed #3498db'
            e.target.style.backgroundColor = '#f0f8ff'
          }}
          onBlur={(e) => {
            e.target.style.border = '1px dashed transparent'
            e.target.style.backgroundColor = 'transparent'
          }}
        >
          ¥12,800
        </div>
      )
    },
    {
      id: 'price-original',
      type: 'text',
      category: 'basic',
      label: '通常価格',
      screenTypes: ['product_list', 'product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            fontSize: '18px',
            color: '#999',
            textDecoration: 'line-through',
            minWidth: '100px',
            minHeight: '25px',
            outline: 'none',
            cursor: 'text',
            padding: '4px 8px',
            border: '1px dashed transparent',
            borderRadius: '4px'
          }}
          onFocus={(e) => {
            e.target.style.border = '1px dashed #3498db'
            e.target.style.backgroundColor = '#f0f8ff'
          }}
          onBlur={(e) => {
            e.target.style.border = '1px dashed transparent'
            e.target.style.backgroundColor = 'transparent'
          }}
        >
          ¥29,800
        </div>
      )
    },
    {
      id: 'discount-badge',
      type: 'text',
      category: 'basic',
      label: '割引バッジ',
      screenTypes: ['product_list', 'product_detail', 'cart'],
      component: ({ onDelete }) => (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#E84118',
            color: 'white',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            minWidth: '60px',
            minHeight: '25px',
            outline: 'none',
            cursor: 'text',
            border: '1px dashed transparent'
          }}
          onFocus={(e) => {
            e.target.style.border = '1px dashed #3498db'
            e.target.style.backgroundColor = '#d63031'
          }}
          onBlur={(e) => {
            e.target.style.border = '1px dashed transparent'
            e.target.style.backgroundColor = '#E84118'
          }}
        >
          43%OFF
        </div>
      )
    },
    {
      id: 'input-field',
      type: 'input',
      category: 'basic',
      label: 'テキスト入力欄',
      screenTypes: ['checkout', 'product_detail', 'cart'],
      component: ({ onDelete }) => (
        <input
          type="text"
          placeholder="入力してください"
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            width: '200px',
            boxSizing: 'border-box',
            color: '#333',
            backgroundColor: '#fff'
          }}
          readOnly
        />
      )
    },
    {
      id: 'textarea-field',
      type: 'textarea',
      category: 'basic',
      label: 'テキストエリア（複数行）',
      screenTypes: ['checkout', 'product_detail', 'cart'],
      component: ({ onDelete }) => (
        <textarea
          placeholder="複数行のテキストを入力できます"
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            width: '300px',
            minHeight: '100px',
            boxSizing: 'border-box',
            color: '#333',
            backgroundColor: '#fff',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
          readOnly
        />
      )
    },
    {
      id: 'editable-text',
      type: 'text',
      category: 'basic',
      label: '編集可能テキスト',
      screenTypes: ['product_list', 'product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            color: '#333',
            backgroundColor: '#fff',
            border: '1px dashed #ccc',
            borderRadius: '4px',
            minWidth: '150px',
            minHeight: '20px',
            outline: 'none',
            cursor: 'text'
          }}
          onBlur={(e) => {
            // 編集内容を保持（実際の実装では状態管理が必要）
          }}
        >
          編集可能なテキスト
        </div>
      )
    },
    {
      id: 'image-placeholder',
      type: 'image',
      category: 'basic',
      label: '画像プレースホルダー',
      screenTypes: ['product_list', 'product_detail'],
      component: ({ onDelete }) => (
        <div style={{
          width: '200px',
          height: '150px',
          backgroundColor: '#f0f0f0',
          border: '1px dashed #ccc',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          画像
        </div>
      )
    },
    {
      id: 'product-name',
      type: 'text',
      category: 'basic',
      label: '商品名',
      screenTypes: ['product_list', 'product_detail', 'cart'],
      component: ({ onDelete }) => (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
            minWidth: '150px',
            minHeight: '25px',
            outline: 'none',
            cursor: 'text',
            padding: '4px 8px',
            border: '1px dashed transparent',
            borderRadius: '4px'
          }}
          onFocus={(e) => {
            e.target.style.border = '1px dashed #3498db'
            e.target.style.backgroundColor = '#f0f8ff'
          }}
          onBlur={(e) => {
            e.target.style.border = '1px dashed transparent'
            e.target.style.backgroundColor = 'transparent'
          }}
        >
          商品名
        </div>
      )
    },
    {
      id: 'product-description',
      type: 'text',
      category: 'basic',
      label: '商品説明',
      screenTypes: ['product_detail', 'cart'],
      component: ({ onDelete }) => (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6',
            minWidth: '200px',
            minHeight: '40px',
            outline: 'none',
            cursor: 'text',
            padding: '8px',
            border: '1px dashed transparent',
            borderRadius: '4px'
          }}
          onFocus={(e) => {
            e.target.style.border = '1px dashed #3498db'
            e.target.style.backgroundColor = '#f0f8ff'
          }}
          onBlur={(e) => {
            e.target.style.border = '1px dashed transparent'
            e.target.style.backgroundColor = 'transparent'
          }}
        >
          商品の説明文がここに表示されます
        </div>
      )
    },
    {
      id: 'card-container',
      type: 'container',
      category: 'basic',
      label: 'カードコンテナ',
      screenTypes: ['product_list', 'product_detail', 'cart', 'popup'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #ddd',
          minWidth: '200px',
          minHeight: '150px'
        }}>
        </div>
      )
    },
    {
      id: 'badge-new',
      type: 'text',
      category: 'basic',
      label: 'NEWバッジ',
      screenTypes: ['product_list', 'product_detail'],
      component: ({ onDelete }) => (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#00b894',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            minWidth: '50px',
            minHeight: '20px',
            outline: 'none',
            cursor: 'text',
            border: '1px dashed transparent'
          }}
          onFocus={(e) => {
            e.target.style.border = '1px dashed #3498db'
            e.target.style.backgroundColor = '#00a085'
          }}
          onBlur={(e) => {
            e.target.style.border = '1px dashed transparent'
            e.target.style.backgroundColor = '#00b894'
          }}
        >
          NEW
        </div>
      )
    },
    {
      id: 'badge-popular',
      type: 'text',
      category: 'basic',
      label: '人気バッジ',
      screenTypes: ['product_list', 'product_detail'],
      component: ({ onDelete }) => (
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#E84118',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            minWidth: '50px',
            minHeight: '20px',
            outline: 'none',
            cursor: 'text',
            border: '1px dashed transparent'
          }}
          onFocus={(e) => {
            e.target.style.border = '1px dashed #3498db'
            e.target.style.backgroundColor = '#c23616'
          }}
          onBlur={(e) => {
            e.target.style.border = '1px dashed transparent'
            e.target.style.backgroundColor = '#E84118'
          }}
        >
          人気
        </div>
      )
    },
    {
      id: 'button-small',
      type: 'button',
      category: 'basic',
      label: '小さいボタン',
      screenTypes: ['product_list', 'product_detail', 'cart', 'checkout', 'cancel', 'popup'],
      component: ({ onDelete }) => (
        <button style={{
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          ボタン
        </button>
      )
    },
    {
      id: 'button-large',
      type: 'button',
      category: 'basic',
      label: '大きいボタン',
      screenTypes: ['product_list', 'product_detail', 'cart', 'checkout', 'popup'],
      component: ({ onDelete }) => (
        <button style={{
          padding: '16px 32px',
          fontSize: '20px',
          fontWeight: 'bold',
          backgroundColor: '#00b894',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer'
        }}>
          ボタン
        </button>
      )
    }
  ],
  // 視覚的要素（ダークパターン）
  visual: [
    {
      id: 'large-contract-btn',
      type: 'button',
      category: 'basic',
      label: '巨大な「契約」ボタン',
      screenTypes: ['checkout', 'product_detail'],
      component: ({ onDelete }) => (
        <button 
          className="ui-part-large-btn"
          style={{
            padding: '30px 80px',
            fontSize: '32px',
            fontWeight: 'bold',
            backgroundColor: '#00b894',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 184, 148, 0.4)',
            width: '100%'
          }}
        >
          契約する
        </button>
      )
    },
    {
      id: 'tiny-cancel-link',
      type: 'link',
      category: 'basic',
      label: '極小の「キャンセル」リンク',
      screenTypes: ['checkout', 'cart'],
      component: ({ onDelete }) => (
        <a 
          href="#"
          className="ui-part-tiny-link"
          style={{
            fontSize: '10px',
            color: '#999',
            textDecoration: 'underline',
            display: 'inline-block'
          }}
          onClick={(e) => e.preventDefault()}
        >
          キャンセル
        </a>
      )
    },
    {
      id: 'dimmed-product',
      type: 'visual',
      category: 'basic',
      label: '目立たない商品（不透明度低）',
      screenTypes: ['product_list'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          opacity: 0.6,
          border: '1px solid #ddd',
          minWidth: '200px'
        }}>
          <div
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '5px',
              outline: 'none',
              cursor: 'text',
              border: '1px dashed transparent',
              padding: '2px 4px',
              borderRadius: '2px'
            }}
            onFocus={(e) => {
              e.target.style.border = '1px dashed #3498db'
              e.target.style.backgroundColor = '#f0f8ff'
            }}
            onBlur={(e) => {
              e.target.style.border = '1px dashed transparent'
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            商品名
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: '12px',
              color: '#999',
              outline: 'none',
              cursor: 'text',
              border: '1px dashed transparent',
              padding: '2px 4px',
              borderRadius: '2px'
            }}
            onFocus={(e) => {
              e.target.style.border = '1px dashed #3498db'
              e.target.style.backgroundColor = '#f0f8ff'
            }}
            onBlur={(e) => {
              e.target.style.border = '1px dashed transparent'
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            ¥9,900
          </div>
        </div>
      )
    },
    {
      id: 'highlighted-product',
      type: 'visual',
      category: 'basic',
      label: '強調された商品（ハイライト）',
      screenTypes: ['product_list'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #fff5f5, #ffe0e0)',
          borderRadius: '8px',
          border: '3px solid #E84118',
          boxShadow: '0 4px 12px rgba(232, 65, 24, 0.3)',
          minWidth: '200px'
        }}>
          <div
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '5px',
              color: '#E84118',
              outline: 'none',
              cursor: 'text',
              border: '1px dashed transparent',
              padding: '2px 4px',
              borderRadius: '2px'
            }}
            onFocus={(e) => {
              e.target.style.border = '1px dashed #3498db'
              e.target.style.backgroundColor = 'rgba(240, 248, 255, 0.5)'
            }}
            onBlur={(e) => {
              e.target.style.border = '1px dashed transparent'
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            人気商品
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              outline: 'none',
              cursor: 'text',
              border: '1px dashed transparent',
              padding: '2px 4px',
              borderRadius: '2px'
            }}
            onFocus={(e) => {
              e.target.style.border = '1px dashed #3498db'
              e.target.style.backgroundColor = 'rgba(240, 248, 255, 0.5)'
            }}
            onBlur={(e) => {
              e.target.style.border = '1px dashed transparent'
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            ¥15,800
          </div>
        </div>
      )
    }
  ],
  // 言語的要素
  linguistic: [
    {
      id: 'misleading-text',
      type: 'text',
      category: 'basic',
      label: '紛らわしい文言',
      screenTypes: ['product_detail', 'checkout'],
      component: ({ onDelete }) => (
        <div className="ui-part-misleading-text" style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px', margin: 0, color: '#333', fontWeight: 'bold' }}>
            今すぐ無料で体験
          </p>
          <p style={{ fontSize: '12px', margin: '5px 0 0 0', color: '#666' }}>
            （注：3日後に自動課金）
          </p>
        </div>
      )
    },
    {
      id: 'trick-wording',
      type: 'text',
      category: 'basic',
      label: 'トリック表現（警告文）',
      screenTypes: ['cart'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '2px solid #ffc107'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#856404' }}>⚠️ ご注意</div>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            商品の保護が不十分になる可能性があります
          </div>
        </div>
      )
    }
  ],
  // ダークパターン要素
  dark_patterns: [
    {
      id: 'fake-social-proof',
      type: 'dark_pattern',
      category: 'basic',
      label: '社会的証明',
      screenTypes: ['product_list', 'product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          background: 'linear-gradient(135deg, #fff5f5, #ffe0e0)',
          border: '2px solid #E84118',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#E84118' }}>
            今すぐ購入中
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>1,247人</div>
          <div style={{ fontSize: '12px', color: '#666' }}>人が今見ています</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#E84118', marginTop: '10px' }}>98%</div>
          <div style={{ fontSize: '12px', color: '#666' }}>満足度</div>
        </div>
      )
    },
    {
      id: 'fake-scarcity',
      type: 'dark_pattern',
      category: 'basic',
      label: '希少性・緊急性',
      screenTypes: ['product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
          border: '2px solid #E84118',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#E84118' }}>
            セール終了まで残り 10:00
          </div>
          <div style={{
            backgroundColor: '#E84118',
            color: 'white',
            padding: '8px',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            残り3個のみ
          </div>
          <div style={{ fontSize: '13px', color: '#E84118', textAlign: 'center', fontWeight: 'bold' }}>
            今すぐ購入しないと機会を逃します！
          </div>
        </div>
      )
    },
    {
      id: 'preselection',
      type: 'dark_pattern',
      category: 'basic',
      label: '事前選択（オプション）',
      screenTypes: ['product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          background: '#fff',
          border: '2px solid #E84118',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
            お得なオプション <span style={{
              background: '#E84118',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              marginLeft: '5px'
            }}>おすすめ</span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input type="checkbox" checked readOnly style={{ marginRight: '8px' }} />
            <span
              contentEditable
              suppressContentEditableWarning
              style={{
                color: '#333',
                outline: 'none',
                cursor: 'text',
                border: '1px dashed transparent',
                padding: '2px 4px',
                borderRadius: '2px'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px dashed #3498db'
                e.target.style.backgroundColor = '#f0f8ff'
              }}
              onBlur={(e) => {
                e.target.style.border = '1px dashed transparent'
                e.target.style.backgroundColor = 'transparent'
              }}
            >
              延長保証 +¥2,000
            </span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input type="checkbox" checked readOnly style={{ marginRight: '8px' }} />
            <span
              contentEditable
              suppressContentEditableWarning
              style={{
                color: '#333',
                outline: 'none',
                cursor: 'text',
                border: '1px dashed transparent',
                padding: '2px 4px',
                borderRadius: '2px'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px dashed #3498db'
                e.target.style.backgroundColor = '#f0f8ff'
              }}
              onBlur={(e) => {
                e.target.style.border = '1px dashed transparent'
                e.target.style.backgroundColor = 'transparent'
              }}
            >
              損害保険 +¥1,500
            </span>
          </label>
        </div>
      )
    },
    {
      id: 'hidden-costs',
      type: 'dark_pattern',
      category: 'basic',
      label: '隠れ費用',
      screenTypes: ['product_detail', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          background: 'linear-gradient(135deg, #fff5f5, #ffe0e0)',
          border: '2px solid #E84118',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '5px',
              color: '#333',
              outline: 'none',
              cursor: 'text',
              border: '1px dashed transparent',
              padding: '2px 4px',
              borderRadius: '2px',
              minWidth: '120px'
            }}
            onFocus={(e) => {
              e.target.style.border = '1px dashed #3498db'
              e.target.style.backgroundColor = '#f0f8ff'
            }}
            onBlur={(e) => {
              e.target.style.border = '1px dashed transparent'
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            ¥12,800
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '10px',
              outline: 'none',
              cursor: 'text',
              border: '1px dashed transparent',
              padding: '2px 4px',
              borderRadius: '2px'
            }}
            onFocus={(e) => {
              e.target.style.border = '1px dashed #3498db'
              e.target.style.backgroundColor = '#f0f8ff'
            }}
            onBlur={(e) => {
              e.target.style.border = '1px dashed transparent'
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            税込・送料込
          </div>
          <button style={{
            backgroundColor: '#E84118',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}>
            ℹ️ 詳細な料金を見る
          </button>
        </div>
      )
    },
    {
      id: 'disguised-ad',
      type: 'dark_pattern',
      category: 'basic',
      label: '広告バナー',
      screenTypes: ['product_list'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          color: 'white',
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            padding: '2px 8px',
            borderRadius: '3px',
            fontSize: '10px'
          }}>広告</span>
          <div style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
            特別セール開催中
          </div>
        </div>
      )
    }
  ],
  // 認知バイアス要素（認知スタイルを意識したダークパターン）
  cognitive_bias: [
    // アンカリング効果（最初の価格に影響される）
    {
      id: 'anchoring-price',
      type: 'cognitive_bias',
      category: 'basic',
      label: 'アンカリング価格表示',
      screenTypes: ['product_list', 'product_detail'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #fff9e6, #fff3cd)',
          border: '2px solid #ffc107',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#856404', marginBottom: '5px' }}>通常価格</div>
          <div style={{ 
            fontSize: '24px', 
            color: '#999', 
            textDecoration: 'line-through',
            marginBottom: '5px'
          }}>¥29,800</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#E84118' }}>¥12,800</div>
          <div style={{ fontSize: '11px', color: '#856404', marginTop: '5px' }}>43%OFF</div>
        </div>
      )
    },
    // フレーミング効果（表現方法で判断が変わる）
    {
      id: 'framing-positive',
      type: 'cognitive_bias',
      category: 'basic',
      label: 'ポジティブフレーミング',
      screenTypes: ['product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
          border: '2px solid #28a745',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#155724', marginBottom: '8px' }}>
            ✅ 今なら¥2,000お得！
          </div>
          <div style={{ fontSize: '14px', color: '#155724' }}>
            この商品を選ぶと、追加オプションが¥2,000割引になります
          </div>
        </div>
      )
    },
    {
      id: 'framing-negative',
      type: 'cognitive_bias',
      category: 'basic',
      label: 'ネガティブフレーミング',
      screenTypes: ['product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
          border: '2px solid #dc3545',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#721c24', marginBottom: '8px' }}>
            ¥2,000の機会損失
          </div>
          <div style={{ fontSize: '14px', color: '#721c24' }}>
            この商品を選ばないと、追加オプションで¥2,000多く支払うことになります
          </div>
        </div>
      )
    },
    // 損失回避（失うことへの恐怖）
    {
      id: 'loss-aversion',
      type: 'cognitive_bias',
      category: 'basic',
      label: '損失回避メッセージ',
      screenTypes: ['cart', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #fff5f5, #ffe0e0)',
          border: '2px solid #E84118',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#E84118', marginBottom: '8px' }}>
            カートから削除されました
          </div>
          <div style={{ fontSize: '14px', color: '#333', marginBottom: '10px' }}>
            この商品をカートから削除すると、特別価格の機会を失います
          </div>
          <button style={{
            backgroundColor: '#E84118',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}>
            カートに戻す
          </button>
        </div>
      )
    },
    // 即時性（今すぐ行動したくなる）
    {
      id: 'immediacy-timer',
      type: 'cognitive_bias',
      category: 'basic',
      label: '即時性タイマー',
      screenTypes: ['product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          border: '2px solid #E84118',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>
            この価格はあと
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            14:32
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            で終了します
          </div>
        </div>
      )
    },
    // 選択肢の過多（選択肢が多すぎる）
    {
      id: 'choice-overload',
      type: 'cognitive_bias',
      category: 'basic',
      label: '選択肢過多',
      screenTypes: ['product_detail', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          background: '#fff',
          border: '2px solid #ddd',
          borderRadius: '8px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
            オプションを選択してください
          </div>
          {Array.from({ length: 12 }, (_, i) => (
            <label key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              <input type="radio" name="option" style={{ marginRight: '8px' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                  オプション {i + 1}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  詳細説明 {i + 1} - 追加料金 ¥{500 + i * 100}
                </div>
              </div>
            </label>
          ))}
        </div>
      )
    },
    // デフォルト効果の強化（事前選択の強調）
    {
      id: 'default-bias-strong',
      type: 'cognitive_bias',
      category: 'basic',
      label: 'デフォルト効果強化',
      screenTypes: ['product_detail', 'cart', 'checkout'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
          border: '3px solid #2196f3',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#1565c0' }}>
            おすすめパック（デフォルト選択）
          </div>
          <div style={{ 
            padding: '10px',
            background: '#fff',
            borderRadius: '4px',
            marginBottom: '8px',
            border: '2px solid #2196f3'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
              基本パック + 延長保証 + 損害保険
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              ¥15,800（通常¥18,300から¥2,500お得）
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#1565c0', fontStyle: 'italic' }}>
            ※ このパックが最も多くのお客様に選ばれています
          </div>
        </div>
      )
    }
  ],
  // 構造的要素
  structural: [
    {
      id: 'terms-scroll',
      type: 'scrollbox',
      category: 'basic',
      label: '規約スクロールボックス',
      screenTypes: ['checkout', 'product_detail'],
      component: ({ onDelete }) => (
        <div 
          className="ui-part-terms-scroll"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: '#fff',
            width: '300px'
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>利用規約</h4>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#666' }}>
            {Array.from({ length: 15 }, (_, i) => (
              <p key={i} style={{ margin: '5px 0' }}>
                第{i + 1}条：本サービスは、ユーザーが同意した場合に自動的に課金が開始されます。
                詳細については、各サービスの利用規約をご確認ください。本規約は予告なく変更される場合があります。
              </p>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'obstruction-button',
      type: 'button',
      category: 'basic',
      label: '配置が不自然なボタン',
      screenTypes: ['product_detail', 'checkout'],
      component: ({ onDelete }) => (
        <button style={{
          padding: '10px 20px',
          backgroundColor: '#00b894',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          opacity: 0.85,
          fontSize: '14px'
        }}>
          カートに追加
        </button>
      )
    },
    {
      id: 'cancel-confirm',
      type: 'container',
      category: 'basic',
      label: 'キャンセル確認',
      screenTypes: ['cancel', 'popup'],
      component: ({ onDelete }) => (
        <div style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '2px solid #e74c3c',
          minWidth: '300px',
          minHeight: '200px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#e74c3c' }}>
            キャンセルしますか？
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            この操作は取り消せません
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              キャンセル
            </button>
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              戻る
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'popup-overlay',
      type: 'container',
      category: 'basic',
      label: 'ポップアップオーバーレイ',
      screenTypes: ['popup'],
      component: ({ onDelete }) => (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
        </div>
      )
    }
  ]
}

// 各画面タイプの初期テンプレート
const DEFAULT_TEMPLATES = {
  product_list: {
    items: [
      { partId: 'image-placeholder', x: 50, y: 50, width: 250, height: 200 },
      { partId: 'product-name', x: 50, y: 270, width: 250, height: 30 },
      { partId: 'price-current', x: 50, y: 320, width: 250, height: 40 }
    ]
  },
  product_detail: {
    items: [
      { partId: 'image-placeholder', x: 50, y: 50, width: 400, height: 300 },
      { partId: 'product-name', x: 470, y: 50, width: 400, height: 30 },
      { partId: 'product-description', x: 470, y: 100, width: 400, height: 100 },
      { partId: 'price-current', x: 470, y: 220, width: 400, height: 50 },
      { partId: 'primary-button', x: 470, y: 290, width: 400, height: 60 }
    ]
  },
  cart: {
    items: [
      { partId: 'card-container', x: 50, y: 50, width: 600, height: 200 },
      { partId: 'price-current', x: 50, y: 270, width: 600, height: 50 },
      { partId: 'primary-button', x: 50, y: 340, width: 600, height: 60 }
    ]
  },
  checkout: {
    items: [
      { partId: 'input-field', x: 50, y: 50, width: 450, height: 50 },
      { partId: 'input-field', x: 520, y: 50, width: 450, height: 50 },
      { partId: 'textarea-field', x: 50, y: 120, width: 920, height: 150 },
      { partId: 'price-current', x: 50, y: 290, width: 450, height: 50 },
      { partId: 'primary-button', x: 50, y: 360, width: 920, height: 70 }
    ]
  },
  cancel: {
    items: [
      { partId: 'secondary-button', x: 50, y: 50, width: 200, height: 50 },
      { partId: 'editable-text', x: 50, y: 120, width: 600, height: 100 }
    ]
  },
  popup: {
    items: [
      { partId: 'card-container', x: 300, y: 200, width: 400, height: 300 },
      { partId: 'editable-text', x: 320, y: 220, width: 360, height: 100 },
      { partId: 'primary-button', x: 320, y: 340, width: 160, height: 50 },
      { partId: 'secondary-button', x: 500, y: 340, width: 160, height: 50 }
    ]
  }
}

export default function UIBuilder() {
  const [screens, setScreens] = useState([
    { id: 'screen-1', type: 'product_list', items: [] }
  ])
  const [activeScreenId, setActiveScreenId] = useState('screen-1')
  const [draggedPart, setDraggedPart] = useState(null)
  const [draggedItem, setDraggedItem] = useState(null)
  const [draggingItemId, setDraggingItemId] = useState(null)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [resizingItemId, setResizingItemId] = useState(null)
  const [resizeHandle, setResizeHandle] = useState(null) // 'se', 'sw', 'ne', 'nw'
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [designNotes, setDesignNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [showFlowDiagram, setShowFlowDiagram] = useState(false)
  const canvasRefs = useRef({})
  
  // アクティブな画面を取得
  const activeScreen = screens.find(s => s.id === activeScreenId) || screens[0]
  
  // 要素のDOM参照を保持（リサイズ用）
  const itemRefs = useRef({})
  
  // screensの最新値を保持するref（非同期処理で使用）
  const screensRef = useRef(screens)
  
  // screensが更新されたらrefも更新
  useEffect(() => {
    screensRef.current = screens
  }, [screens])
  
  // 履歴管理は一時的に無効化（配置機能を優先）
  // 履歴を考慮したsetScreens（今は単純にsetScreensを呼ぶだけ）
  const setScreensWithHistory = useCallback((newScreens) => {
    setScreens(newScreens)
  }, [])
  
  // アンドゥ機能（一時的に無効化）
  const handleUndo = useCallback(() => {
    // 後で実装
  }, [])

  // 新しい画面を追加（初期テンプレートを読み込む）
  const handleAddScreen = (screenType) => {
    const allParts = [
      ...UI_PARTS.basic,
      ...UI_PARTS.visual,
      ...UI_PARTS.linguistic,
      ...UI_PARTS.dark_patterns,
      ...UI_PARTS.cognitive_bias,
      ...UI_PARTS.structural
    ]

    const template = DEFAULT_TEMPLATES[screenType]
    const timestamp = Date.now()

    const newScreen = {
      id: `screen-${timestamp}`,
      type: screenType,
      items: template ? template.items.map((itemTemplate, index) => {
        const part = allParts.find(p => p.id === itemTemplate.partId)
        if (!part) return null
        return {
          id: `${part.id}-default-${timestamp}-${index}`,
          part: part,
          x: itemTemplate.x,
          y: itemTemplate.y,
          width: itemTemplate.width,
          height: itemTemplate.height
        }
      }).filter(item => item !== null) : []
    }
    setScreens(prevScreens => {
      const newScreens = [...prevScreens, newScreen]
      setActiveScreenId(newScreen.id)
      return newScreens
    })
  }

  // 画面をクリックしたときに初期テンプレートを読み込む
  const handleScreenClick = (screenId) => {
    const screen = screens.find(s => s.id === screenId)
    if (!screen) return

    // 既にアイテムがある場合は何もしない
    if (screen.items.length > 0) {
      setActiveScreenId(screenId)
      return
    }

    // 初期テンプレートを読み込む
    const template = DEFAULT_TEMPLATES[screen.type]
    if (!template) {
      setActiveScreenId(screenId)
      return
    }

    const allParts = [
      ...UI_PARTS.basic,
      ...UI_PARTS.visual,
      ...UI_PARTS.linguistic,
      ...UI_PARTS.dark_patterns,
      ...UI_PARTS.cognitive_bias,
      ...UI_PARTS.structural
    ]

    const timestamp = Date.now()
    const items = template.items.map((itemTemplate, index) => {
      const part = allParts.find(p => p.id === itemTemplate.partId)
      if (!part) return null
      return {
        id: `${part.id}-default-${timestamp}-${index}`,
        part: part,
        x: itemTemplate.x,
        y: itemTemplate.y,
        width: itemTemplate.width,
        height: itemTemplate.height
      }
    }).filter(item => item !== null)

    setScreens(prevScreens => {
      return prevScreens.map(s => {
        if (s.id === screenId) {
          return { ...s, items }
        }
        return s
      })
    })
    setActiveScreenId(screenId)
  }

  // 画面を削除
  const handleDeleteScreen = (screenId) => {
    setScreens(prevScreens => {
      if (prevScreens.length === 1) {
        alert('最低1つの画面が必要です')
        return prevScreens
      }
      const newScreens = prevScreens.filter(s => s.id !== screenId)
      if (screenId === activeScreenId) {
        setActiveScreenId(newScreens[0].id)
      }
      return newScreens
    })
  }

  // パーツライブラリからのドラッグ開始
  const handleDragStart = (e, part) => {
    setDraggedPart(part)
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', part.id)
  }

  // 配置済みアイテムのドラッグ開始
  const handleItemDragStart = (e, itemId) => {
    setDraggingItemId(itemId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', itemId)
    e.stopPropagation()
  }

  // キャンバスでのドラッグオーバー
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedPart) {
      e.dataTransfer.dropEffect = 'copy'
    } else if (draggingItemId) {
      e.dataTransfer.dropEffect = 'move'
    }
  }

  // グリッドにスナップ
  const snapToGrid = (value, gridSize) => {
    return Math.round(value / gridSize) * gridSize
  }

  // キャンバスでのドロップ
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    let x = e.clientX - rect.left + canvas.scrollLeft
    let y = e.clientY - rect.top + canvas.scrollTop

    // グリッドにスナップ
    if (showGrid) {
      x = snapToGrid(x, gridSize)
      y = snapToGrid(y, gridSize)
    }

    if (draggedPart) {
      // 新しいパーツを追加（グリッドにスナップ済みの位置を使用）
      const newItem = {
        id: `${draggedPart.id}-${Date.now()}`,
        part: draggedPart,
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: null,
        height: null
      }

      // 直接setScreensを使用（シンプルに）
      setScreens(prevScreens => {
        const newScreens = prevScreens.map(screen => {
          if (screen.id === activeScreenId) {
            return {
              ...screen,
              items: [...screen.items, newItem]
            }
          }
          return screen
        })
        return newScreens
      })
      setDraggedPart(null)
    } else if (draggingItemId) {
      // 既存のアイテムを移動（グリッドにスナップ済みの位置を使用）
      setScreens(prevScreens => {
        return prevScreens.map(screen => {
          if (screen.id === activeScreenId) {
            return {
              ...screen,
              items: screen.items.map(item => 
                item.id === draggingItemId
                  ? { ...item, x: Math.max(0, x), y: Math.max(0, y) }
                  : item
              )
            }
          }
          return screen
        })
      })
      setDraggingItemId(null)
    }
  }

  // アイテム削除
  const handleDeleteItem = (itemId) => {
    setScreens(prevScreens => {
      return prevScreens.map(screen => {
        if (screen.id === activeScreenId) {
          return {
            ...screen,
            items: screen.items.filter(item => item.id !== itemId)
          }
        }
        return screen
      })
    })
    if (selectedItemId === itemId) {
      setSelectedItemId(null)
    }
  }

  // アイテム選択
  const handleSelectItem = (itemId, e) => {
    e.stopPropagation()
    setSelectedItemId(itemId)
    
    // 要素選択時に実際のDOM要素からサイズを取得
    setTimeout(() => {
      const itemElement = itemRefs.current[itemId]
      if (itemElement) {
        const rect = itemElement.getBoundingClientRect()
        const selectedItem = activeScreen.items.find(item => item.id === itemId)
        
        if (selectedItem && (!selectedItem.width || !selectedItem.height)) {
          // サイズが未設定の場合、実際のサイズを保存
          setScreens(prevScreens => {
            return prevScreens.map(screen => {
              if (screen.id === activeScreenId) {
                return {
                  ...screen,
                  items: screen.items.map(item => 
                    item.id === itemId
                      ? { 
                          ...item, 
                          width: Math.round(rect.width), 
                          height: Math.round(rect.height) 
                        }
                      : item
                  )
                }
              }
              return screen
            })
          })
        }
      }
    }, 0)
  }

  // キャンバスクリック（選択解除）
  const handleCanvasClick = (e) => {
    // キャンバス自体をクリックした場合のみ選択解除
    if (e.target.className === 'canvas' || e.target.classList.contains('canvas-content')) {
      setSelectedItemId(null)
    }
  }

  // アイテム位置を更新
  const updateItemPosition = (itemId, newX, newY) => {
    setScreens(prevScreens => {
      return prevScreens.map(screen => {
        if (screen.id === activeScreenId) {
          return {
            ...screen,
            items: screen.items.map(item => 
              item.id === itemId
                ? { ...item, x: Math.max(0, newX), y: Math.max(0, newY) }
                : item
            )
          }
        }
        return screen
      })
    })
  }

  // アイテムサイズを更新
  const updateItemSize = (itemId, newWidth, newHeight, newX = null, newY = null) => {
    setScreens(prevScreens => {
      return prevScreens.map(screen => {
        if (screen.id === activeScreenId) {
          return {
            ...screen,
            items: screen.items.map(item => {
              if (item.id === itemId) {
                const updated = {
                  ...item,
                  width: Math.max(50, newWidth),
                  height: Math.max(50, newHeight)
                }
                if (newX !== null) updated.x = Math.max(0, newX)
                if (newY !== null) updated.y = Math.max(0, newY)
                return updated
              }
              return item
            })
          }
        }
        return screen
      })
    })
  }

  // リサイズ開始
  const handleResizeStart = (e, itemId, handle) => {
    e.stopPropagation()
    e.preventDefault()
    setResizingItemId(itemId)
    setResizeHandle(handle)
  }

  // リサイズ処理
  useEffect(() => {
    if (!resizingItemId || !resizeHandle) return

    const selectedItem = activeScreen.items.find(item => item.id === resizingItemId)
    if (!selectedItem) return

    // リサイズ開始時の初期値
    const startX = selectedItem.x
    const startY = selectedItem.y
    const startWidth = selectedItem.width || 200
    const startHeight = selectedItem.height || 100

    const handleMouseMove = (e) => {
      const canvas = canvasRefs.current[activeScreen.id]
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left + canvas.scrollLeft
      const mouseY = e.clientY - rect.top + canvas.scrollTop

      let newWidth = startWidth
      let newHeight = startHeight
      let newX = startX
      let newY = startY

      switch (resizeHandle) {
        case 'se': // 右下
          newWidth = Math.max(50, mouseX - startX)
          newHeight = Math.max(50, mouseY - startY)
          break
        case 'sw': // 左下
          newWidth = Math.max(50, (startX + startWidth) - mouseX)
          newHeight = Math.max(50, mouseY - startY)
          newX = mouseX
          break
        case 'ne': // 右上
          newWidth = Math.max(50, mouseX - startX)
          newHeight = Math.max(50, (startY + startHeight) - mouseY)
          newY = mouseY
          break
        case 'nw': // 左上
          newWidth = Math.max(50, (startX + startWidth) - mouseX)
          newHeight = Math.max(50, (startY + startHeight) - mouseY)
          newX = mouseX
          newY = mouseY
          break
        default:
          return
      }

      // グリッドにスナップ
      if (showGrid) {
        newWidth = snapToGrid(newWidth, gridSize)
        newHeight = snapToGrid(newHeight, gridSize)
        if (newX !== startX) newX = snapToGrid(newX, gridSize)
        if (newY !== startY) newY = snapToGrid(newY, gridSize)
      }

      // サイズと位置を更新
      updateItemSize(
        resizingItemId,
        newWidth,
        newHeight,
        newX !== startX ? newX : null,
        newY !== startY ? newY : null
      )
    }

    const handleMouseUp = () => {
      setResizingItemId(null)
      setResizeHandle(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingItemId, resizeHandle, activeScreen, activeScreenId, showGrid, gridSize])

  // キーボードイベント処理（矢印キーで移動）
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItemId) return

      const selectedItem = activeScreen.items.find(item => item.id === selectedItemId)
      if (!selectedItem) return

      let newX = selectedItem.x
      let newY = selectedItem.y
      const step = e.shiftKey ? gridSize * 5 : gridSize // Shiftキーを押すと5グリッド分移動

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          newY = Math.max(0, selectedItem.y - step)
          if (showGrid) {
            newY = snapToGrid(newY, gridSize)
          }
          updateItemPosition(selectedItemId, newX, newY)
          break
        case 'ArrowDown':
          e.preventDefault()
          newY = selectedItem.y + step
          if (showGrid) {
            newY = snapToGrid(newY, gridSize)
          }
          updateItemPosition(selectedItemId, newX, newY)
          break
        case 'ArrowLeft':
          e.preventDefault()
          newX = Math.max(0, selectedItem.x - step)
          if (showGrid) {
            newX = snapToGrid(newX, gridSize)
          }
          updateItemPosition(selectedItemId, newX, newY)
          break
        case 'ArrowRight':
          e.preventDefault()
          newX = selectedItem.x + step
          if (showGrid) {
            newX = snapToGrid(newX, gridSize)
          }
          updateItemPosition(selectedItemId, newX, newY)
          break
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          handleDeleteItem(selectedItemId)
          break
        case 'Escape':
          e.preventDefault()
          setSelectedItemId(null)
          break
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleUndo()
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedItemId, activeScreen, screens, activeScreenId, showGrid, gridSize])

  // アクティブ画面をクリア
  const handleClearScreen = () => {
    if (window.confirm('この画面のすべてのパーツを削除しますか？')) {
      setScreens(prevScreens => {
        return prevScreens.map(screen => {
          if (screen.id === activeScreenId) {
            return { ...screen, items: [] }
          }
          return screen
        })
      })
    }
  }

  // テンプレートセットを読み込む
  const handleLoadTemplateSet = (templateIndex) => {
    const template = TEMPLATE_SETS[templateIndex]
    if (!template) return

    const allParts = [
      ...UI_PARTS.basic,
      ...UI_PARTS.visual,
      ...UI_PARTS.linguistic,
      ...UI_PARTS.dark_patterns,
      ...UI_PARTS.cognitive_bias,
      ...UI_PARTS.structural
    ]

    const timestamp = Date.now()
    const templateName = template.name

    // テンプレートの各画面を新しい画面として追加（既存画面は上書きしない）
    setScreens(prevScreens => {
      const newScreens = [...prevScreens]

      // テンプレート内の各画面タイプに対して新しい画面を作成
      Object.keys(template.screens).forEach(screenType => {
        const screenTemplate = template.screens[screenType]
        if (!screenTemplate) return

        const items = screenTemplate.items.map((itemTemplate, index) => {
          const part = allParts.find(p => p.id === itemTemplate.partId)
          if (!part) return null
          return {
            id: `${part.id}-template-${timestamp}-${index}`,
            part: part,
            x: itemTemplate.x,
            y: itemTemplate.y,
            width: itemTemplate.width,
            height: itemTemplate.height
          }
        }).filter(item => item !== null)

        // 新しい画面を作成（テンプレート名を必ず付与）
        const screenTypeLabel = SCREEN_TYPES.find(st => st.id === screenType)?.label || screenType
        const newScreen = {
          id: `screen-${screenType}-${templateName}-${timestamp}`,
          type: screenType,
          items: items,
          templateName: templateName, // テンプレート名を保存
          displayName: `${screenTypeLabel}(${templateName})` // 表示用の名前
        }

        newScreens.push(newScreen)
      })

      // 最初に追加された画面をアクティブにする
      if (newScreens.length > prevScreens.length) {
        const firstNewScreen = newScreens[newScreens.length - Object.keys(template.screens).length]
        setActiveScreenId(firstNewScreen.id)
      }

      return newScreens
    })
  }

  // 例を読み込む（後方互換性のため残す）
  const handleLoadExample = (exampleIndex) => {
    const examples = SCREEN_EXAMPLES[activeScreen.type]
    if (!examples || !examples[exampleIndex]) return

    const example = examples[exampleIndex]
    const allParts = [
      ...UI_PARTS.basic,
      ...UI_PARTS.visual,
      ...UI_PARTS.linguistic,
      ...UI_PARTS.dark_patterns,
      ...UI_PARTS.cognitive_bias,
      ...UI_PARTS.structural
    ]

    const newItems = example.items.map((itemTemplate, index) => {
      const part = allParts.find(p => p.id === itemTemplate.partId)
      if (!part) return null

      return {
        id: `${part.id}-example-${Date.now()}-${index}`,
        part: part,
        x: itemTemplate.x,
        y: itemTemplate.y,
        width: itemTemplate.width,
        height: itemTemplate.height
      }
    }).filter(item => item !== null)

    setScreens(prevScreens => {
      return prevScreens.map(screen => {
        if (screen.id === activeScreenId) {
          return { ...screen, items: newItems }
        }
        return screen
      })
    })
  }

  // エクスポート
  const handleExport = async () => {
    try {
      // 各画面の画像を生成
      const screenImages = {}
      const originalActiveScreenId = activeScreenId
      const currentScreens = screensRef.current
      
      for (const screen of currentScreens) {
        setActiveScreenId(screen.id)
        // DOM更新を待つ
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const canvasElement = canvasRefs.current[screen.id]
        if (canvasElement) {
          try {
            const canvas = await html2canvas(canvasElement, {
              backgroundColor: '#f8f9fa',
              scale: 2,
              logging: false,
              useCORS: true
            })
            screenImages[screen.id] = canvas.toDataURL('image/png')
          } catch (error) {
            console.error(`Failed to capture screen ${screen.id}:`, error)
            screenImages[screen.id] = null
          }
        }
      }
      
      // 元のアクティブ画面に戻す
      setActiveScreenId(originalActiveScreenId)
      
      // 画面遷移図のデータを作成
      const flowDiagram = {
        screens: currentScreens.map(screen => {
          const screenType = SCREEN_TYPES.find(st => st.id === screen.type)
          return {
            id: screen.id,
            type: screen.type,
            label: screenType?.label || screen.type,
            icon: screenType?.icon || '📄',
            itemCount: screen.items.length,
            templateName: screen.templateName || null
          }
        }),
        connections: [] // 将来的に画面間の遷移関係を追加できる
      }

      // エクスポートデータを作成
      const exportData = {
        timestamp: new Date().toISOString(),
        designNotes: designNotes,
        flowDiagram: flowDiagram,
        screens: currentScreens.map(screen => ({
          id: screen.id,
          type: screen.type,
          templateName: screen.templateName || null,
          image: screenImages[screen.id] || null,
          items: screen.items.map(item => ({
            partId: item.part.id,
            partType: item.part.type,
            partCategory: item.part.category,
            position: { x: item.x, y: item.y },
            size: item.width || item.height ? { width: item.width, height: item.height } : null
          }))
        }))
      }
      
      // JSONファイルとしてエクスポート
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ui-design-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      // 画像も個別にエクスポート（オプション）
      for (const screen of currentScreens) {
        if (screenImages[screen.id]) {
          const screenTypeLabel = SCREEN_TYPES.find(st => st.id === screen.type)?.label || screen.type
          const link = document.createElement('a')
          link.href = screenImages[screen.id]
          link.download = `ui-design-${screen.id}-${screenTypeLabel}-${Date.now()}.png`
          link.click()
        }
      }
      
      alert('エクスポートが完了しました！\nJSONファイルと各画面の画像がダウンロードされました。')
    } catch (error) {
      console.error('Export error:', error)
      alert('エクスポート中にエラーが発生しました。')
    }
  }

  // 画面タイプに応じたパーツをフィルタリング
  const getPartsForScreen = (screenType) => {
    const allParts = [
      ...UI_PARTS.basic,
      ...UI_PARTS.visual,
      ...UI_PARTS.linguistic,
      ...UI_PARTS.dark_patterns,
      ...UI_PARTS.cognitive_bias,
      ...UI_PARTS.structural
    ]
    return allParts.filter(part => 
      !part.screenTypes || part.screenTypes.includes(screenType)
    )
  }

  const availableParts = getPartsForScreen(activeScreen.type)

  // グリッド背景を生成
  const gridBackground = showGrid ? {
    backgroundImage: `
      linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`
  } : {}

  return (
    <PageTransition>
      <div className="ui-builder-container">
        <div className="ui-builder-header">
          <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#2c3e50', fontWeight: 'bold' }}>
            🎨 UI再構成タスク
          </h1>
          <p style={{ color: '#34495e', marginBottom: '20px', fontSize: '16px' }}>
            パーツをドラッグ&ドロップして、UIを構築してください
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleClearScreen}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              クリア
            </button>
            <button 
              onClick={handleExport}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              エクスポート
            </button>
            <button 
              onClick={() => setShowNotes(!showNotes)}
              style={{
                padding: '10px 20px',
                backgroundColor: showNotes ? '#27ae60' : '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {showNotes ? '設計メモを閉じる' : '設計メモ'}
            </button>
            <button 
              onClick={() => setShowFlowDiagram(!showFlowDiagram)}
              style={{
                padding: '10px 20px',
                backgroundColor: showFlowDiagram ? '#9b59b6' : '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {showFlowDiagram ? '遷移図を閉じる' : '画面遷移図'}
            </button>
            {TEMPLATE_SETS.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#2c3e50', fontWeight: 'bold' }}>テンプレート:</span>
                {TEMPLATE_SETS.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleLoadTemplateSet(index)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#9b59b6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      minWidth: 'fit-content'
                    }}
                  >
                    {template.name}を読み込む
                  </button>
                ))}
              </div>
            )}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#2c3e50',
              fontWeight: 'bold',
              border: '1px solid #ddd'
            }}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              グリッド表示
            </label>
          </div>
        </div>

        <div className="ui-builder-main">
          {/* パーツライブラリ */}
          <div className="parts-library">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#2c3e50', fontWeight: 'bold' }}>
              パーツライブラリ
            </h2>
            <div style={{ 
              marginBottom: '20px', 
              padding: '10px', 
              background: 'rgba(255,255,255,0.3)', 
              borderRadius: '8px',
              fontSize: '13px',
              color: '#2c3e50',
              fontWeight: '600'
            }}>
              現在の画面: {SCREEN_TYPES.find(st => st.id === activeScreen.type)?.label || activeScreen.type}
            </div>

            <div className="parts-list">
              {availableParts.map(part => (
                <div
                  key={part.id}
                  className="part-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, part)}
                >
                  <div className="part-preview">
                    {part.component({ onDelete: () => {} })}
                  </div>
                  <div className="part-label">{part.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* キャンバスエリア */}
          <div className="canvas-area">
            {/* 画面タブ */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '20px', 
              flexWrap: 'wrap',
              alignItems: 'center',
              overflow: 'visible'
            }}>
              {screens.map(screen => {
                const screenType = SCREEN_TYPES.find(st => st.id === screen.type)
                return (
                  <div
                    key={screen.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 15px',
                      backgroundColor: screen.id === activeScreenId ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: screen.id === activeScreenId ? '2px solid #3498db' : '2px solid transparent',
                      fontSize: '14px',
                      color: '#2c3e50',
                      fontWeight: screen.id === activeScreenId ? 'bold' : 'normal',
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      minWidth: 'fit-content'
                    }}
                    onClick={() => handleScreenClick(screen.id)}
                  >
                    <span>{screenType?.icon || '📄'}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'visible' }}>
                      {screen.displayName || screenType?.label || screen.type}
                    </span>
                    {screens.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteScreen(screen.id)
                        }}
                        style={{
                          background: 'rgba(231, 76, 60, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                )
              })}
              
              {/* 新しい画面を追加 */}
              <div style={{ position: 'relative' }}>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddScreen(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '2px dashed #3498db',
                    borderRadius: '8px',
                    color: '#2c3e50',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <option value="" style={{ color: '#333' }}>+ 画面を追加</option>
                  {SCREEN_TYPES.map(st => (
                    <option key={st.id} value={st.id} style={{ color: '#333' }}>
                      {st.icon} {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              ref={(el) => {
                if (el) {
                  canvasRefs.current[activeScreen.id] = el
                }
              }}
              className="canvas"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleCanvasClick}
            >
              <div className="canvas-content" style={gridBackground}>
                {activeScreen.items.length === 0 && (
                  <div className="canvas-placeholder">
                    <p style={{ fontSize: '18px', color: '#999' }}>
                      パーツをここにドラッグ&ドロップしてください
                    </p>
                    <p style={{ fontSize: '14px', color: '#bbb', marginTop: '10px' }}>
                      （配置したパーツはドラッグで移動できます）
                    </p>
                  </div>
                )}
                {activeScreen.items.map(item => (
                <div
                  key={item.id}
                  ref={(el) => {
                    if (el) {
                      itemRefs.current[item.id] = el
                    }
                  }}
                  className={`canvas-item ${selectedItemId === item.id ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: item.width ? `${item.width}px` : 'auto',
                    height: item.height ? `${item.height}px` : 'auto',
                    cursor: draggingItemId === item.id ? 'grabbing' : 'pointer'
                  }}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, item.id)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => handleSelectItem(item.id, e)}
                >
                  <div 
                    className="canvas-item-content"
                    style={{
                      width: item.width ? `${item.width}px` : '100%',
                      height: item.height ? `${item.height}px` : '100%',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'stretch',
                      justifyContent: 'stretch'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}>
                      {item.part.component({ onDelete: () => handleDeleteItem(item.id) })}
                    </div>
                  </div>
                  <button
                    className="canvas-item-delete"
                    onClick={() => handleDeleteItem(item.id)}
                    title="削除"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    ×
                  </button>
                  {selectedItemId === item.id && (
                    <>
                      <div
                        className="resize-handle resize-handle-se"
                        onMouseDown={(e) => handleResizeStart(e, item.id, 'se')}
                      />
                      <div
                        className="resize-handle resize-handle-sw"
                        onMouseDown={(e) => handleResizeStart(e, item.id, 'sw')}
                      />
                      <div
                        className="resize-handle resize-handle-ne"
                        onMouseDown={(e) => handleResizeStart(e, item.id, 'ne')}
                      />
                      <div
                        className="resize-handle resize-handle-nw"
                        onMouseDown={(e) => handleResizeStart(e, item.id, 'nw')}
                      />
                    </>
                  )}
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>

        {/* 設計メモパネル */}
        {showNotes && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '400px',
            maxHeight: '80vh',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 1000,
            border: '2px solid #3498db'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>設計メモ</h3>
              <button
                onClick={() => setShowNotes(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            <textarea
              value={designNotes}
              onChange={(e) => setDesignNotes(e.target.value)}
              placeholder="設計意図や考えたことをメモしてください..."
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* 画面遷移図パネル */}
        {showFlowDiagram && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '500px',
            maxHeight: '80vh',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 1000,
            border: '2px solid #9b59b6',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>画面遷移図</h3>
              <button
                onClick={() => setShowFlowDiagram(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px',
              padding: '10px'
            }}>
              {screens.map((screen, index) => {
                const screenType = SCREEN_TYPES.find(st => st.id === screen.type)
                return (
                  <div key={screen.id} style={{
                    padding: '12px',
                    backgroundColor: screen.id === activeScreenId ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: '8px',
                    border: screen.id === activeScreenId ? '2px solid #3498db' : '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleScreenClick(screen.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{screenType?.icon || '📄'}</span>
                      <span style={{ fontWeight: 'bold', color: '#2c3e50', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {screen.displayName || screenType?.label || screen.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      {screen.items.length}個のパーツ
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>ヒント</div>
              <div>画面をクリックすると初期テンプレートが読み込まれます</div>
              <div style={{ marginTop: '5px' }}>画面間の遷移を設計する際は、この図を参考にしてください</div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}